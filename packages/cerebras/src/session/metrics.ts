/**
 * Session Metrics Tracker
 *
 * Tracks real-time session metrics including tokens, cost, performance, and cache stats
 */

import { Bus } from "@/bus"
import { Instance } from "@/project/instance"
import z from "zod"

export namespace SessionMetrics {
  /**
   * Token pricing per model (in USD per 1M tokens)
   */
  const MODEL_PRICING: Record<string, { input: number; output: number; contextLimit: number }> = {
    "claude-sonnet-4-5": { input: 3.0, output: 15.0, contextLimit: 200000 },
    "claude-sonnet-3-5": { input: 3.0, output: 15.0, contextLimit: 200000 },
    "claude-opus-4": { input: 15.0, output: 75.0, contextLimit: 200000 },
    "claude-haiku-3-5": { input: 0.8, output: 4.0, contextLimit: 200000 },
  }

  /**
   * Session metrics data structure
   */
  export interface Metrics {
    // Token metrics
    tokensInput: number
    tokensOutput: number
    tokensTotal: number
    contextLimit: number
    budgetPercentage: number

    // Cost metrics
    totalCost: number
    costPerMinute: number

    // Performance metrics
    startTime: number
    duration: number // in seconds
    requestCount: number
    requestsPerMinute: number

    // Cache metrics
    cacheHits: number
    cacheMisses: number
    cacheHitRate: number

    // Provider info
    provider: string
    model: string
  }

  /**
   * Budget status for color coding
   */
  export type BudgetStatus = "healthy" | "warning" | "critical"

  /**
   * Cache status for color coding
   */
  export type CacheStatus = "good" | "medium" | "poor"

  /**
   * RPM status for color coding
   */
  export type RPMStatus = "low" | "medium" | "high"

  /**
   * Get budget status based on percentage
   */
  export function getBudgetStatus(percentage: number): BudgetStatus {
    if (percentage < 50) return "healthy"
    if (percentage < 80) return "warning"
    return "critical"
  }

  /**
   * Get cache status based on hit rate
   */
  export function getCacheStatus(hitRate: number): CacheStatus {
    if (hitRate > 70) return "good"
    if (hitRate > 40) return "medium"
    return "poor"
  }

  /**
   * Get RPM status based on rate
   */
  export function getRPMStatus(rpm: number): RPMStatus {
    if (rpm < 10) return "low"
    if (rpm < 15) return "medium"
    return "high"
  }

  /**
   * Calculate cost for tokens
   */
  export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING["claude-sonnet-4-5"]
    const inputCost = (inputTokens / 1_000_000) * pricing.input
    const outputCost = (outputTokens / 1_000_000) * pricing.output
    return inputCost + outputCost
  }

  /**
   * Get context limit for a model
   */
  export function getContextLimit(model: string): number {
    return MODEL_PRICING[model]?.contextLimit || 200000
  }

  /**
   * Format budget bar visualization
   */
  export function formatBudgetBar(percentage: number, width: number = 10): string {
    const filled = Math.round((percentage / 100) * width)
    const empty = width - filled
    return "▓".repeat(filled) + "░".repeat(empty)
  }

  /**
   * Format duration as human-readable string
   */
  export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs.toString().padStart(2, "0")}s`
  }

  /**
   * Format cost as currency
   */
  export function formatCost(cost: number): string {
    return `$${cost.toFixed(4)}`
  }

  /**
   * Session metrics state
   */
  const state = Instance.state<Record<string, Metrics>>(() => ({}))

  /**
   * Initialize metrics for a session
   */
  export function init(sessionID: string, model: string, provider: string = "anthropic"): void {
    state()[sessionID] = {
      tokensInput: 0,
      tokensOutput: 0,
      tokensTotal: 0,
      contextLimit: getContextLimit(model),
      budgetPercentage: 0,
      totalCost: 0,
      costPerMinute: 0,
      startTime: Date.now(),
      duration: 0,
      requestCount: 0,
      requestsPerMinute: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheHitRate: 0,
      provider,
      model,
    }

    // Start duration timer
    startDurationTimer(sessionID)
  }

  /**
   * Update token usage
   */
  export function updateTokens(sessionID: string, inputTokens: number, outputTokens: number): void {
    const metrics = state()[sessionID]
    if (!metrics) return

    metrics.tokensInput += inputTokens
    metrics.tokensOutput += outputTokens
    metrics.tokensTotal = metrics.tokensInput + metrics.tokensOutput
    metrics.budgetPercentage = (metrics.tokensTotal / metrics.contextLimit) * 100

    // Update cost
    metrics.totalCost = calculateCost(metrics.model, metrics.tokensInput, metrics.tokensOutput)

    // Update cost per minute
    const durationMinutes = metrics.duration / 60
    metrics.costPerMinute = durationMinutes > 0 ? metrics.totalCost / durationMinutes : 0

    // Increment request count
    metrics.requestCount++

    // Update RPM
    metrics.requestsPerMinute = durationMinutes > 0 ? metrics.requestCount / durationMinutes : 0

    // Publish update event
    Bus.publish(Event.Updated, {
      sessionID,
      metrics,
    })
  }

  /**
   * Update cache stats
   */
  export function updateCache(sessionID: string, hit: boolean): void {
    const metrics = state()[sessionID]
    if (!metrics) return

    if (hit) {
      metrics.cacheHits++
    } else {
      metrics.cacheMisses++
    }

    const total = metrics.cacheHits + metrics.cacheMisses
    metrics.cacheHitRate = total > 0 ? (metrics.cacheHits / total) * 100 : 0

    // Publish update event
    Bus.publish(Event.Updated, {
      sessionID,
      metrics,
    })
  }

  /**
   * Get metrics for a session
   */
  export function get(sessionID: string): Metrics | undefined {
    return state()[sessionID]
  }

  /**
   * Clear metrics for a session
   */
  export function clear(sessionID: string): void {
    delete state()[sessionID]
  }

  /**
   * Start duration timer for a session
   */
  function startDurationTimer(sessionID: string): void {
    const interval = setInterval(() => {
      const metrics = state()[sessionID]
      if (!metrics) {
        clearInterval(interval)
        return
      }

      metrics.duration = Math.floor((Date.now() - metrics.startTime) / 1000)

      // Update cost per minute
      const durationMinutes = metrics.duration / 60
      metrics.costPerMinute = durationMinutes > 0 ? metrics.totalCost / durationMinutes : 0

      // Update RPM
      metrics.requestsPerMinute = durationMinutes > 0 ? metrics.requestCount / durationMinutes : 0

      // Publish update event
      Bus.publish(Event.Updated, {
        sessionID,
        metrics,
      })
    }, 1000)
  }

  /**
   * Events
   */
  export const Event = {
    Updated: Bus.event(
      "session.metrics.updated",
      z.object({
        sessionID: z.string(),
        metrics: z.any(),
      }),
    ),
  }
}
