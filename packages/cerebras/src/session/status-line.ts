/**
 * Status Line Formatter
 *
 * Formats session metrics into a beautiful status line display
 */

import { SessionMetrics } from "./metrics"
import chalk from "chalk"

export namespace StatusLine {
  /**
   * Color codes for different statuses
   */
  const COLORS = {
    budget: {
      healthy: chalk.green,
      warning: chalk.yellow,
      critical: chalk.red,
    },
    cache: {
      good: chalk.green,
      medium: chalk.yellow,
      poor: chalk.gray,
    },
    rpm: {
      low: chalk.green,
      medium: chalk.blue,
      high: chalk.yellow,
    },
  }

  /**
   * Format the complete status line (2 lines)
   */
  export function format(sessionID: string): string {
    const metrics = SessionMetrics.get(sessionID)
    if (!metrics) return ""

    const line1 = formatLine1(metrics)
    const line2 = formatLine2(metrics)

    return `${line1}\n${line2}`
  }

  /**
   * Line 1 - Token & Cost Metrics
   */
  function formatLine1(metrics: SessionMetrics.Metrics): string {
    const budgetStatus = SessionMetrics.getBudgetStatus(metrics.budgetPercentage)
    const budgetColor = COLORS.budget[budgetStatus]

    // Session tokens with context limit
    const tokensDisplay = `${metrics.tokensTotal.toLocaleString()} / ${metrics.contextLimit.toLocaleString()}`

    // Budget bar
    const budgetBar = SessionMetrics.formatBudgetBar(metrics.budgetPercentage)
    const budgetPercentage = `${Math.round(metrics.budgetPercentage)}%`
    const budgetDisplay = budgetColor(`[${budgetBar}] ${budgetPercentage}`)

    // Total cost (bold, highlighted)
    const costDisplay = chalk.bold.bgYellow.black(
      ` 💰${SessionMetrics.formatCost(metrics.totalCost)} `,
    )

    // Cost per minute
    const costPerMin = chalk.dim(`($${metrics.costPerMinute.toFixed(3)}/min)`)

    return `📊 Tokens: ${tokensDisplay}  ${budgetDisplay}  ${costDisplay}  ${costPerMin}`
  }

  /**
   * Line 2 - Performance Metrics
   */
  function formatLine2(metrics: SessionMetrics.Metrics): string {
    const cacheStatus = SessionMetrics.getCacheStatus(metrics.cacheHitRate)
    const rpmStatus = SessionMetrics.getRPMStatus(metrics.requestsPerMinute)

    // Duration with timer emoji
    const duration = chalk.cyan(`⏱️  ${SessionMetrics.formatDuration(metrics.duration)}`)

    // RPM with color coding
    const rpmColor = COLORS.rpm[rpmStatus]
    const rpm = rpmColor(`⚡ ${metrics.requestsPerMinute.toFixed(1)} RPM`)

    // Cache hit rate with color coding
    const cacheColor = COLORS.cache[cacheStatus]
    const cache = cacheColor(`🎯 ${Math.round(metrics.cacheHitRate)}% cache`)

    // Provider/model
    const provider = chalk.gray(`🤖 ${metrics.provider}/${metrics.model}`)

    // Request count
    const requests = chalk.dim(`📨 ${metrics.requestCount} reqs`)

    return `${duration}  ${rpm}  ${cache}  ${provider}  ${requests}`
  }

  /**
   * Format for compact display (single line)
   */
  export function formatCompact(sessionID: string): string {
    const metrics = SessionMetrics.get(sessionID)
    if (!metrics) return ""

    const budgetStatus = SessionMetrics.getBudgetStatus(metrics.budgetPercentage)
    const budgetColor = COLORS.budget[budgetStatus]

    const tokens = `${metrics.tokensTotal.toLocaleString()}`
    const budget = budgetColor(`${Math.round(metrics.budgetPercentage)}%`)
    const cost = chalk.bold(`💰${SessionMetrics.formatCost(metrics.totalCost)}`)
    const duration = chalk.cyan(SessionMetrics.formatDuration(metrics.duration))

    return `${tokens} tokens (${budget})  ${cost}  ${duration}`
  }

  /**
   * Format just the budget bar (for inline display)
   */
  export function formatBudget(sessionID: string): string {
    const metrics = SessionMetrics.get(sessionID)
    if (!metrics) return ""

    const budgetStatus = SessionMetrics.getBudgetStatus(metrics.budgetPercentage)
    const budgetColor = COLORS.budget[budgetStatus]

    const budgetBar = SessionMetrics.formatBudgetBar(metrics.budgetPercentage)
    const budgetPercentage = `${Math.round(metrics.budgetPercentage)}%`

    return budgetColor(`[${budgetBar}] ${budgetPercentage}`)
  }

  /**
   * Format just the cost display
   */
  export function formatCost(sessionID: string): string {
    const metrics = SessionMetrics.get(sessionID)
    if (!metrics) return ""

    return chalk.bold.bgYellow.black(` 💰${SessionMetrics.formatCost(metrics.totalCost)} `)
  }

  /**
   * Format duration timer
   */
  export function formatDuration(sessionID: string): string {
    const metrics = SessionMetrics.get(sessionID)
    if (!metrics) return ""

    return chalk.cyan(`⏱️  ${SessionMetrics.formatDuration(metrics.duration)}`)
  }

  /**
   * Export for use in TUI components
   */
  export function getMetrics(sessionID: string) {
    return SessionMetrics.get(sessionID)
  }
}
