/**
 * Status Line Component
 *
 * Displays real-time session metrics in a compact 2-line format
 */

import { TextAttributes } from "@opentui/core"
import { useTheme } from "../context/theme"
import { useSync } from "@tui/context/sync"
import { createSignal, createEffect, onCleanup, Show, createMemo } from "solid-js"
import { useRouteData } from "@tui/context/route"
import { pipe, sumBy } from "remeda"

interface StatusLineProps {
  sessionID: string
}

/**
 * Model pricing (USD per 1M tokens)
 */
const MODEL_PRICING: Record<string, { input: number; output: number; contextLimit: number }> = {
  "claude-sonnet-4-5": { input: 3.0, output: 15.0, contextLimit: 200000 },
  "claude-sonnet-3-5": { input: 3.0, output: 15.0, contextLimit: 200000 },
  "claude-opus-4": { input: 15.0, output: 75.0, contextLimit: 200000 },
  "claude-haiku-3-5": { input: 0.8, output: 4.0, contextLimit: 200000 },
}

export function StatusLine(props: StatusLineProps) {
  const sync = useSync()
  const { theme } = useTheme()
  const route = useRouteData("session")

  const [duration, setDuration] = createSignal(0)
  const [startTime] = createSignal(Date.now())

  // Update duration every second
  createEffect(() => {
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime()) / 1000))
    }, 1000)

    onCleanup(() => clearInterval(interval))
  })

  // Calculate session metrics
  const metrics = createMemo(() => {
    const sessionID = props.sessionID || route?.sessionID
    if (!sessionID) return null

    const messages = sync.data.message[sessionID] ?? []
    const assistantMessages = messages.filter((x) => x.role === "assistant")

    // Token calculations
    const tokensInput = pipe(
      assistantMessages,
      sumBy((x) => x.tokens.input),
    )

    const tokensOutput = pipe(
      assistantMessages,
      sumBy((x) => x.tokens.output),
    )

    const tokensTotal = pipe(
      assistantMessages,
      sumBy((x) => x.tokens.input + x.tokens.output + x.tokens.reasoning),
    )

    const cacheRead = pipe(
      assistantMessages,
      sumBy((x) => x.tokens.cache.read),
    )

    const cacheWrite = pipe(
      assistantMessages,
      sumBy((x) => x.tokens.cache.write),
    )

    // Get model and context limit
    const model = route?.model || "claude-sonnet-4-5"
    const pricing = MODEL_PRICING[model] || MODEL_PRICING["claude-sonnet-4-5"]
    const contextLimit = pricing.contextLimit

    // Budget percentage
    const budgetPercentage = (tokensTotal / contextLimit) * 100

    // Cost calculations
    const inputCost = (tokensInput / 1_000_000) * pricing.input
    const outputCost = (tokensOutput / 1_000_000) * pricing.output
    const totalCost = inputCost + outputCost

    // Performance metrics
    const requestCount = assistantMessages.length
    const durationMinutes = duration() / 60
    const costPerMinute = durationMinutes > 0 ? totalCost / durationMinutes : 0
    const requestsPerMinute = durationMinutes > 0 ? requestCount / durationMinutes : 0

    // Cache metrics
    const cacheTotal = cacheRead + cacheWrite
    const totalWithCache = tokensTotal + cacheTotal
    const cacheHitRate = totalWithCache > 0 ? (cacheRead / totalWithCache) * 100 : 0

    return {
      tokensInput,
      tokensOutput,
      tokensTotal,
      contextLimit,
      budgetPercentage,
      totalCost,
      costPerMinute,
      requestCount,
      requestsPerMinute,
      cacheHitRate,
      model,
      duration: duration(),
    }
  })

  // Format budget bar
  const formatBudgetBar = (percentage: number, width: number = 10): string => {
    const filled = Math.round((percentage / 100) * width)
    const empty = width - filled
    return "▓".repeat(filled) + "░".repeat(empty)
  }

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs.toString().padStart(2, "0")}s`
  }

  // Get budget status color
  const getBudgetColor = (percentage: number) => {
    if (percentage < 50) return theme.success
    if (percentage < 80) return theme.warning
    return theme.error
  }

  // Get cache status color
  const getCacheColor = (hitRate: number) => {
    if (hitRate > 70) return theme.success
    if (hitRate > 40) return theme.warning
    return theme.textMuted
  }

  // Get RPM status color
  const getRPMColor = (rpm: number) => {
    if (rpm < 10) return theme.success
    if (rpm < 15) return theme.info
    return theme.warning
  }

  return (
    <Show when={metrics()}>
      {(m) => (
        <box flexDirection="column" borderStyle="round" borderColor={theme.border} paddingX={1}>
          {/* Line 1: Token & Cost Metrics */}
          <box flexDirection="row" gap={2}>
            <text fg={theme.text}>
              📊 Tokens: {m().tokensTotal.toLocaleString()}/{m().contextLimit.toLocaleString()}
            </text>

            <text fg={getBudgetColor(m().budgetPercentage)}>
              [{formatBudgetBar(m().budgetPercentage)}] {Math.round(m().budgetPercentage)}%
            </text>

            <text
              fg={theme.text}
              bg={theme.warning}
              attributes={TextAttributes.BOLD}
              paddingX={1}
            >
              💰${m().totalCost.toFixed(4)}
            </text>

            <text fg={theme.textMuted}>(${m().costPerMinute.toFixed(3)}/min)</text>
          </box>

          {/* Line 2: Performance Metrics */}
          <box flexDirection="row" gap={2}>
            <text fg={theme.info}>⏱️  {formatDuration(m().duration)}</text>

            <text fg={getRPMColor(m().requestsPerMinute)}>
              ⚡ {m().requestsPerMinute.toFixed(1)} RPM
            </text>

            <text fg={getCacheColor(m().cacheHitRate)}>
              🎯 {Math.round(m().cacheHitRate)}% cache
            </text>

            <text fg={theme.textMuted}>🤖 {m().model}</text>

            <text fg={theme.textMuted}>📨 {m().requestCount} reqs</text>
          </box>
        </box>
      )}
    </Show>
  )
}
