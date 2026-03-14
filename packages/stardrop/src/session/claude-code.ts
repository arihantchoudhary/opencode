import { spawn } from "child_process"
import { Identifier } from "../id/id"
import { MessageV2 } from "./message-v2"
import { Session } from "."
import { Log } from "../util/log"
import { Instance } from "../project/instance"
import { Snapshot } from "@/snapshot"

export namespace ClaudeCode {
  const log = Log.create({ service: "claude-code" })

  export function available(): string | null {
    return Bun.which("claude")
  }

  export async function run(input: {
    sessionID: string
    assistantMessage: MessageV2.Assistant
    prompt: string
    abort: AbortSignal
  }) {
    const claudePath = available()
    if (!claudePath) throw new Error("Claude Code not found")

    log.info("spawning claude code", { cwd: Instance.directory })

    const proc = spawn(
      claudePath,
      ["-p", input.prompt, "--output-format", "stream-json", "--verbose", "--dangerously-skip-permissions"],
      {
        cwd: Instance.directory,
        stdio: ["ignore", "pipe", "pipe"],
        env: {
          ...process.env,
        },
      },
    )

    const toolParts: Record<string, MessageV2.ToolPart> = {}
    let currentText: MessageV2.TextPart | undefined
    let buffer = ""
    const snapshot = await Snapshot.track()

    await Session.updatePart({
      id: Identifier.ascending("part"),
      messageID: input.assistantMessage.id,
      sessionID: input.sessionID,
      snapshot,
      type: "step-start",
    })

    const abortHandler = () => {
      proc.kill()
    }
    input.abort.addEventListener("abort", abortHandler, { once: true })

    return new Promise<"stop">((resolve, reject) => {
      const processLine = async (line: string) => {
        if (!line.trim()) return
        let event: any
        try {
          event = JSON.parse(line)
        } catch {
          log.info("non-json line from claude", { line })
          return
        }

        switch (event.type) {
          case "assistant": {
            const content = event.message?.content
            if (!Array.isArray(content)) break

            for (const block of content) {
              if (block.type === "text") {
                // Finalize previous text part if exists
                if (currentText) {
                  currentText.time = { start: currentText.time!.start, end: Date.now() }
                  await Session.updatePart(currentText)
                }

                currentText = {
                  id: Identifier.ascending("part"),
                  messageID: input.assistantMessage.id,
                  sessionID: input.sessionID,
                  type: "text",
                  text: block.text,
                  time: { start: Date.now() },
                }
                await Session.updatePart({ part: currentText, delta: block.text })
              }

              if (block.type === "tool_use") {
                // Finalize any open text part
                if (currentText) {
                  currentText.time = { start: currentText.time!.start, end: Date.now() }
                  await Session.updatePart(currentText)
                  currentText = undefined
                }

                const part = (await Session.updatePart({
                  id: Identifier.ascending("part"),
                  messageID: input.assistantMessage.id,
                  sessionID: input.sessionID,
                  type: "tool",
                  callID: block.id,
                  tool: block.name.toLowerCase(),
                  state: {
                    status: "running",
                    input: block.input,
                    time: { start: Date.now() },
                  },
                })) as MessageV2.ToolPart
                toolParts[block.id] = part
              }
            }
            break
          }

          case "user": {
            const content = event.message?.content
            if (!Array.isArray(content)) break

            for (const block of content) {
              if (block.type === "tool_result") {
                const match = toolParts[block.tool_use_id]
                if (match && match.state.status === "running") {
                  const output =
                    typeof block.content === "string"
                      ? block.content
                      : Array.isArray(block.content)
                        ? block.content
                            .map((c: any) => (c.type === "text" ? c.text : ""))
                            .filter(Boolean)
                            .join("\n")
                        : ""

                  // Try to extract a title from the tool result metadata
                  const title = event.tool_use_result?.type === "text" ? match.tool : undefined

                  await Session.updatePart({
                    ...match,
                    state: {
                      status: "completed",
                      input: match.state.input,
                      output: output.slice(0, 30_000),
                      title: title ?? match.tool,
                      metadata: {},
                      time: {
                        start: match.state.time.start,
                        end: Date.now(),
                      },
                    },
                  })
                  delete toolParts[block.tool_use_id]
                }
              }
            }
            break
          }

          case "result": {
            // Finalize any open text part
            if (currentText) {
              currentText.time = { start: currentText.time!.start, end: Date.now() }
              await Session.updatePart(currentText)
              currentText = undefined
            }

            // Finalize step
            input.assistantMessage.finish = "stop"
            input.assistantMessage.time.completed = Date.now()
            if (event.usage) {
              input.assistantMessage.tokens = {
                input: event.usage.input_tokens ?? 0,
                output: event.usage.output_tokens ?? 0,
                reasoning: 0,
                cache: {
                  read: event.usage.cache_read_input_tokens ?? 0,
                  write: event.usage.cache_creation_input_tokens ?? 0,
                },
              }
            }
            if (event.total_cost_usd) {
              input.assistantMessage.cost = event.total_cost_usd
            }

            const endSnapshot = await Snapshot.track()
            await Session.updatePart({
              id: Identifier.ascending("part"),
              reason: "stop",
              snapshot: endSnapshot,
              messageID: input.assistantMessage.id,
              sessionID: input.sessionID,
              type: "step-finish",
              tokens: input.assistantMessage.tokens,
              cost: input.assistantMessage.cost,
            })

            if (snapshot) {
              const patch = await Snapshot.patch(snapshot)
              if (patch.files.length) {
                await Session.updatePart({
                  id: Identifier.ascending("part"),
                  messageID: input.assistantMessage.id,
                  sessionID: input.sessionID,
                  type: "patch",
                  hash: patch.hash,
                  files: patch.files,
                })
              }
            }

            await Session.updateMessage(input.assistantMessage)
            break
          }
        }
      }

      proc.stdout?.on("data", (chunk: Buffer) => {
        buffer += chunk.toString()
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""
        for (const line of lines) {
          processLine(line).catch((e) => log.error("processLine error", { error: e }))
        }
      })

      proc.stderr?.on("data", (chunk: Buffer) => {
        log.info("claude stderr", { data: chunk.toString() })
      })

      proc.on("exit", async (code) => {
        input.abort.removeEventListener("abort", abortHandler)
        // Process any remaining buffer
        if (buffer.trim()) {
          await processLine(buffer).catch((e) => log.error("processLine error", { error: e }))
        }

        if (!input.assistantMessage.time.completed) {
          input.assistantMessage.finish = code === 0 ? "stop" : "error"
          input.assistantMessage.time.completed = Date.now()
          await Session.updateMessage(input.assistantMessage)
        }
        resolve("stop")
      })

      proc.on("error", (err) => {
        input.abort.removeEventListener("abort", abortHandler)
        log.error("claude process error", { error: err })
        reject(err)
      })
    })
  }
}
