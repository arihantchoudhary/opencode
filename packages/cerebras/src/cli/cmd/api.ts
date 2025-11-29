import { cmd } from "./cmd"
import * as prompts from "@clack/prompts"
import { UI } from "../ui"
import { getAPIClient } from "../../api/client"

export const APICommand = cmd({
  command: "api",
  describe: "manage Cerebras API integration",
  builder: (yargs) =>
    yargs.command(APISetKeyCommand).command(APIStatusCommand).demandCommand(),
  async handler() {},
})

export const APISetKeyCommand = cmd({
  command: "set-key",
  describe: "configure your Cerebras API key",
  async handler() {
    UI.empty()
    prompts.intro("Configure Cerebras API Key")

    const apiKey = await prompts.password({
      message: "Enter your Cerebras API key",
      validate: (value) => {
        if (!value || value.length === 0) {
          return "API key is required"
        }
        if (!value.startsWith("cbr_sk_")) {
          return "Invalid API key format. Should start with 'cbr_sk_'"
        }
        return undefined
      },
    })

    if (prompts.isCancel(apiKey)) {
      prompts.outro("Cancelled")
      return
    }

    try {
      const client = getAPIClient()
      client.setAPIKey(apiKey)

      prompts.log.success("API key saved successfully!")
      prompts.log.info(
        "Your API key has been saved securely and will be used for usage tracking.",
      )
      prompts.outro("Done")
    } catch (error) {
      prompts.log.error("Failed to save API key: " + (error instanceof Error ? error.message : String(error)))
      prompts.outro("Failed")
    }
  },
})

export const APIStatusCommand = cmd({
  command: "status",
  describe: "check Cerebras API configuration status",
  async handler() {
    UI.empty()
    prompts.intro("Cerebras API Status")

    const client = getAPIClient()

    if (client.isConfigured()) {
      prompts.log.success("✓ API key is configured")

      try {
        const stats = await client.getStats()
        prompts.log.info(`Total sessions: ${stats.totalSessions}`)
        prompts.log.info(`Total tokens: ${stats.totalTokens.toLocaleString()}`)
        prompts.log.info(`Total messages: ${stats.totalMessages}`)
        prompts.log.info(
          `Average tokens per session: ${Math.round(stats.avgTokensPerSession).toLocaleString()}`,
        )
      } catch (error) {
        prompts.log.warn(
          "Unable to fetch usage stats: " +
            (error instanceof Error ? error.message : String(error)),
        )
      }
    } else {
      prompts.log.warn("✗ API key is not configured")
      prompts.log.message("\nTo configure your API key, run:")
      prompts.log.message("  cerebras api set-key\n")
    }

    prompts.outro("Done")
  },
})
