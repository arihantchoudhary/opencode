import { type Accessor, createMemo, createSignal, Match, onCleanup, onMount, Show, Switch } from "solid-js"
import { useRouteData } from "@tui/context/route"
import { useSync } from "@tui/context/sync"
import { pipe, sumBy } from "remeda"
import { useTheme } from "@tui/context/theme"
import { SplitBorder } from "@tui/component/border"
import type { AssistantMessage, Session } from "@cerebras-ai/sdk"
import { TextAttributes } from "@opentui/core"

const Title = (props: { session: Accessor<Session> }) => {
  const { theme } = useTheme()
  return (
    <text fg={theme.text}>
      <span style={{ bold: true, fg: theme.accent }}>#</span>{" "}
      <span style={{ bold: true }}>{props.session().title}</span>
    </text>
  )
}

const ContextInfo = (props: {
  context: Accessor<string | undefined>
  cost: Accessor<string>
  sessionTokens: Accessor<number>
  contextLimit: Accessor<number | undefined>
  budgetPercentage: Accessor<number>
  rpm: Accessor<number>
  cacheHitRate: Accessor<number>
  duration: Accessor<string>
  costPerMinute: Accessor<string>
  provider: Accessor<string | undefined>
  requestCount: Accessor<number>
}) => {
  const { theme } = useTheme()

  const budgetColor = createMemo(() => {
    const pct = props.budgetPercentage()
    if (pct >= 0.95) return theme.error
    if (pct >= 0.8) return theme.warning
    return theme.success
  })

  const cacheColor = createMemo(() => {
    const rate = props.cacheHitRate()
    if (rate >= 0.7) return theme.success
    if (rate >= 0.4) return theme.warning
    return theme.textMuted
  })

  const rpmColor = createMemo(() => {
    const rpm = props.rpm()
    if (rpm >= 15) return theme.warning
    if (rpm >= 10) return theme.accent
    return theme.success
  })

  // Progress bar for budget
  const budgetBar = createMemo(() => {
    const pct = props.budgetPercentage()
    const filled = Math.floor(pct * 10)
    const empty = 10 - filled
    return "▓".repeat(filled) + "░".repeat(empty)
  })

  return (
    <Show when={props.context()}>
      <box flexDirection="column" gap={0} flexShrink={0}>
        {/* Line 1: Session tokens, budget, cost */}
        <box flexDirection="row" gap={1}>
          <text fg={theme.textMuted} wrapMode="none">
            📊 {props.context()} | Session: {props.sessionTokens().toLocaleString()}
            <Show when={props.contextLimit()}>/{props.contextLimit()!.toLocaleString()}</Show>
          </text>
          <text fg={budgetColor()} wrapMode="none">
            [{budgetBar()}] {(props.budgetPercentage() * 100).toFixed(0)}%
          </text>
          <text fg={theme.accent} attributes={TextAttributes.BOLD} wrapMode="none">
            💰{props.cost()}
          </text>
          <text fg={theme.textMuted} wrapMode="none">
            ({props.costPerMinute()}/min)
          </text>
        </box>

        {/* Line 2: Duration, RPM, Cache, Provider, Requests */}
        <box flexDirection="row" gap={1}>
          <text fg={theme.textMuted} wrapMode="none">
            ⏱️ {props.duration()}
          </text>
          <text fg={theme.textMuted} wrapMode="none">
            |
          </text>
          <text fg={rpmColor()} wrapMode="none">
            ⚡{props.rpm().toFixed(1)} RPM
          </text>
          <text fg={theme.textMuted} wrapMode="none">
            |
          </text>
          <text fg={cacheColor()} wrapMode="none">
            🎯 {(props.cacheHitRate() * 100).toFixed(0)}% cache
          </text>
          <Show when={props.provider()}>
            <text fg={theme.textMuted} wrapMode="none">
              |
            </text>
            <text fg={theme.textMuted} wrapMode="none">
              🤖 {props.provider()}
            </text>
          </Show>
          <text fg={theme.textMuted} wrapMode="none">
            |
          </text>
          <text fg={theme.textMuted} wrapMode="none">
            📨 {props.requestCount()} reqs
          </text>
        </box>
      </box>
    </Show>
  )
}

export function Header() {
  const route = useRouteData("session")
  const sync = useSync()
  const session = createMemo(() => sync.session.get(route.sessionID)!)
  const messages = createMemo(() => sync.data.message[route.sessionID] ?? [])
  const shareEnabled = createMemo(() => sync.data.config.share !== "disabled")

  // Session start time
  const [sessionStartTime] = createSignal(Date.now())
  const [currentTime, setCurrentTime] = createSignal(Date.now())

  // Update time every second
  onMount(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    onCleanup(() => clearInterval(interval))
  })

  // Duration in human-readable format
  const duration = createMemo(() => {
    const elapsed = Math.floor((currentTime() - sessionStartTime()) / 1000) // seconds
    const hours = Math.floor(elapsed / 3600)
    const minutes = Math.floor((elapsed % 3600) / 60)
    const seconds = elapsed % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  })

  // Total cost
  const totalCost = createMemo(() => {
    return pipe(
      messages(),
      sumBy((x) => (x.role === "assistant" ? x.cost : 0)),
    )
  })

  const cost = createMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(totalCost())
  })

  // Cost per minute
  const costPerMinute = createMemo(() => {
    const elapsed = (currentTime() - sessionStartTime()) / 1000 / 60 // minutes
    if (elapsed < 0.1) return "$0.00"
    const rate = totalCost() / elapsed
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    }).format(rate)
  })

  // Calculate total session tokens
  const sessionTokens = createMemo(() => {
    return pipe(
      messages(),
      sumBy((x) => {
        if (x.role === "assistant") {
          return x.tokens.input + x.tokens.output + x.tokens.reasoning + x.tokens.cache.read + x.tokens.cache.write
        }
        return 0
      }),
    )
  })

  // Request count (assistant messages)
  const requestCount = createMemo(() => {
    return messages().filter((x) => x.role === "assistant").length
  })

  // RPM (Requests Per Minute) - based on last 60 seconds
  const rpm = createMemo(() => {
    const oneMinuteAgo = Date.now() - 60 * 1000
    const recentMessages = messages().filter((x) => x.role === "assistant" && x.time.created >= oneMinuteAgo)
    return recentMessages.length
  })

  // Cache hit rate
  const cacheHitRate = createMemo(() => {
    const assistantMessages = messages().filter((x) => x.role === "assistant")
    if (assistantMessages.length === 0) return 0

    let cacheHits = 0
    let totalRequests = 0

    for (const msg of assistantMessages) {
      totalRequests++
      if (msg.tokens.cache.read > 0) {
        cacheHits++
      }
    }

    return totalRequests > 0 ? cacheHits / totalRequests : 0
  })

  // Provider name
  const provider = createMemo(() => {
    const last = messages().findLast((x) => x.role === "assistant" && x.tokens.output > 0) as AssistantMessage
    if (!last) return undefined
    const providerObj = sync.data.provider.find((x) => x.id === last.providerID)
    const model = providerObj?.models[last.modelID]
    return providerObj && model ? `${providerObj.name}/${model.name}` : undefined
  })

  // Get current model's context limit
  const contextLimit = createMemo(() => {
    const last = messages().findLast((x) => x.role === "assistant" && x.tokens.output > 0) as AssistantMessage
    if (!last) return undefined
    const model = sync.data.provider.find((x) => x.id === last.providerID)?.models[last.modelID]
    return model?.limit.context
  })

  // Calculate budget percentage (from token budget system)
  const budgetPercentage = createMemo(() => {
    const limit = 1_000_000 // Default token budget
    return Math.min(sessionTokens() / limit, 1)
  })

  const context = createMemo(() => {
    const last = messages().findLast((x) => x.role === "assistant" && x.tokens.output > 0) as AssistantMessage
    if (!last) return
    const total =
      last.tokens.input + last.tokens.output + last.tokens.reasoning + last.tokens.cache.read + last.tokens.cache.write
    const model = sync.data.provider.find((x) => x.id === last.providerID)?.models[last.modelID]
    let result = total.toLocaleString()
    if (model?.limit.context) {
      result += "/" + Math.round((total / model.limit.context) * 100) + "%"
    }
    return result
  })

  const { theme } = useTheme()

  return (
    <box paddingLeft={1} paddingRight={1} {...SplitBorder} borderColor={theme.backgroundElement} flexShrink={0}>
      <Show
        when={shareEnabled()}
        fallback={
          <box flexDirection="column" gap={0}>
            <Title session={session} />
            <ContextInfo
              context={context}
              cost={cost}
              sessionTokens={sessionTokens}
              contextLimit={contextLimit}
              budgetPercentage={budgetPercentage}
              rpm={rpm}
              cacheHitRate={cacheHitRate}
              duration={duration}
              costPerMinute={costPerMinute}
              provider={provider}
              requestCount={requestCount}
            />
          </box>
        }
      >
        <box flexDirection="column" gap={0}>
          <Title session={session} />
          <box flexDirection="row" justifyContent="space-between" gap={1}>
            <box flexGrow={1} flexShrink={1}>
              <Switch>
                <Match when={session().share?.url}>
                  <text fg={theme.textMuted} wrapMode="word">
                    {session().share!.url}
                  </text>
                </Match>
                <Match when={true}>
                  <text fg={theme.text} wrapMode="word">
                    /share <span style={{ fg: theme.textMuted }}>to create a shareable link</span>
                  </text>
                </Match>
              </Switch>
            </box>
          </box>
          <ContextInfo
            context={context}
            cost={cost}
            sessionTokens={sessionTokens}
            contextLimit={contextLimit}
            budgetPercentage={budgetPercentage}
            rpm={rpm}
            cacheHitRate={cacheHitRate}
            duration={duration}
            costPerMinute={costPerMinute}
            provider={provider}
            requestCount={requestCount}
          />
        </box>
      </Show>
    </box>
  )
}
