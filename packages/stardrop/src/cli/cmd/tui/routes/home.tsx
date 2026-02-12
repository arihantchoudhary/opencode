import { createMemo, Match, Show, Switch } from "solid-js"
import { useKeyboard } from "@opentui/solid"
import { useTheme } from "@tui/context/theme"
import { useKeybind } from "@tui/context/keybind"
import { useExit } from "../context/exit"
import { Logo } from "../component/logo"
import { useSync } from "../context/sync"
import { Toast } from "../ui/toast"
import { useDirectory } from "../context/directory"
import { Installation } from "@/installation"
import { DialogProvider as DialogProviderList } from "@tui/component/dialog-provider"
import { useDialog } from "../ui/dialog"
import { useConnected } from "../component/dialog-model"
import { useRoute } from "@tui/context/route"

export function Home() {
  const { theme } = useTheme()
  const dialog = useDialog()
  const connected = useConnected()
  const route = useRoute()
  const sync = useSync()
  const mcp = createMemo(() => Object.keys(sync.data.mcp).length > 0)
  const mcpError = createMemo(() => {
    return Object.values(sync.data.mcp).some((x) => x.status === "failed")
  })

  const connectedMcpCount = createMemo(() => {
    return Object.values(sync.data.mcp).filter((x) => x.status === "connected").length
  })

  const directory = useDirectory()

  const keybind = useKeybind()
  const exit = useExit()

  useKeyboard((evt) => {
    if (keybind.match("app_exit", evt)) {
      exit()
    }
  })

  return (
    <>
      <box flexGrow={1} justifyContent="center" alignItems="center" paddingLeft={2} paddingRight={2} gap={1}>
        <box height={3} />
        <Logo />
        <box paddingTop={2} maxWidth={75}>
          <text fg={theme.textMuted}>
            Stardrop turns tickets into deployed code by acting as an AI teammate that reads your codebase, asks
            clarifying questions, and ships reviewable changes to a live preview
          </text>
        </box>
        <box paddingTop={3} maxWidth={75} gap={1}>
          <box flexDirection="row">
            <text fg={theme.textMuted}>1. </text>
            <text
              fg={theme.primary}
              onMouseUp={() => {
                if (connected()) route.navigate({ type: "chat" })
                else dialog.replace(() => <DialogProviderList />)
              }}
            >
              Demo
            </text>
            <text fg={theme.textMuted}> — try with your own API key</text>
          </box>
          <box flexDirection="row">
            <text fg={theme.textMuted}>2. </text>
            <text fg={theme.textMuted}>
              Email <span style={{ fg: theme.primary }}>stardroplin@stanford.edu</span> to discuss plans
            </text>
          </box>
        </box>
        <box height={3} />
        <Toast />
      </box>
      <box paddingTop={1} paddingBottom={1} paddingLeft={2} paddingRight={2} flexDirection="row" flexShrink={0} gap={2}>
        <text fg={theme.primary}>Stardrop</text>
        <text fg={theme.textMuted}>{directory()}</text>
        <Show when={sync.data.vcs?.branch}>
          <text fg={theme.text}>
            <span style={{ fg: theme.success }}>●</span> git:{sync.data.vcs!.branch}
          </text>
        </Show>
        <box gap={1} flexDirection="row" flexShrink={0}>
          <Show when={mcp()}>
            <text fg={theme.text}>
              <Switch>
                <Match when={mcpError()}>
                  <span style={{ fg: theme.error }}>⊙ </span>
                </Match>
                <Match when={true}>
                  <span style={{ fg: connectedMcpCount() > 0 ? theme.success : theme.textMuted }}>⊙ </span>
                </Match>
              </Switch>
              {connectedMcpCount()} MCP
            </text>
          </Show>
        </box>
        <box flexGrow={1} />
        <box flexShrink={0}>
          <text fg={theme.textMuted}>{Installation.VERSION}</text>
        </box>
      </box>
    </>
  )
}
