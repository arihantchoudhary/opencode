/**
 * Usage Tracker
 *
 * Automatically tracks usage sessions and events
 */

import { getAPIClient } from "./client"
import { Log } from "../util/log"
import { Identifier } from "../id/id"
import os from "os"
import { randomBytes } from "crypto"

// Generate simple event IDs
function generateEventId(): string {
  return "evt_" + randomBytes(12).toString("hex")
}

const log = Log.create({ service: "usage-tracker" })

interface SessionData {
  sessionId: string
  startedAt: Date
  messageCount: number
  tokensUsed: number
  tokensInput: number
  tokensOutput: number
  model: string
}

/**
 * Usage Tracker class
 */
export class UsageTracker {
  private currentSession: SessionData | null = null
  private enabled: boolean = true

  constructor() {
    // Disable tracking if explicitly disabled
    if (process.env.CEREBRAS_DISABLE_TRACKING === "true") {
      this.enabled = false
      log.info("Usage tracking disabled")
    }
  }

  /**
   * Start a new session
   */
  async startSession(model: string): Promise<void> {
    if (!this.enabled) return

    const client = getAPIClient()
    if (!client.isConfigured()) {
      log.debug("API client not configured, skipping session tracking")
      return
    }

    try {
      this.currentSession = {
        sessionId: Identifier.create("session", false),
        startedAt: new Date(),
        messageCount: 0,
        tokensUsed: 0,
        tokensInput: 0,
        tokensOutput: 0,
        model,
      }

      await client.createSession({
        sessionId: this.currentSession.sessionId,
        startedAt: this.currentSession.startedAt,
        model,
        platform: os.platform(),
        cliVersion: process.env.npm_package_version || "unknown",
      })

      log.debug("Session started", { sessionId: this.currentSession.sessionId })
    } catch (error) {
      log.warn("Failed to start session", { error })
      // Don't throw - tracking failures shouldn't break the CLI
    }
  }

  /**
   * Track a message in the current session
   */
  trackMessage(tokensInput: number, tokensOutput: number): void {
    if (!this.enabled || !this.currentSession) return

    this.currentSession.messageCount++
    this.currentSession.tokensInput += tokensInput
    this.currentSession.tokensOutput += tokensOutput
    this.currentSession.tokensUsed += tokensInput + tokensOutput
  }

  /**
   * Track a tool call event
   */
  async trackToolCall(data: {
    toolName: string
    tokensUsed: number
    duration?: number
    metadata?: Record<string, any>
  }): Promise<void> {
    if (!this.enabled || !this.currentSession) return

    const client = getAPIClient()
    if (!client.isConfigured()) return

    try {
      await client.createEvent({
        eventId: generateEventId(),
        sessionId: this.currentSession.sessionId,
        timestamp: new Date(),
        eventType: "tool_call",
        toolName: data.toolName,
        tokensUsed: data.tokensUsed,
        duration: data.duration,
        metadata: data.metadata || {},
      })

      log.debug("Tool call tracked", { toolName: data.toolName })
    } catch (error) {
      log.warn("Failed to track tool call", { error })
    }
  }

  /**
   * Track a custom event
   */
  async trackEvent(data: {
    eventType: string
    tokensUsed?: number
    duration?: number
    metadata?: Record<string, any>
  }): Promise<void> {
    if (!this.enabled || !this.currentSession) return

    const client = getAPIClient()
    if (!client.isConfigured()) return

    try {
      await client.createEvent({
        eventId: generateEventId(),
        sessionId: this.currentSession.sessionId,
        timestamp: new Date(),
        eventType: data.eventType,
        tokensUsed: data.tokensUsed || 0,
        duration: data.duration,
        metadata: data.metadata || {},
      })

      log.debug("Event tracked", { eventType: data.eventType })
    } catch (error) {
      log.warn("Failed to track event", { error })
    }
  }

  /**
   * End the current session
   */
  async endSession(): Promise<void> {
    if (!this.enabled || !this.currentSession) return

    const client = getAPIClient()
    if (!client.isConfigured()) return

    try {
      const endedAt = new Date()
      const duration = Math.floor((endedAt.getTime() - this.currentSession.startedAt.getTime()) / 1000)

      await client.updateSession(this.currentSession.sessionId, {
        endedAt,
        duration,
        messageCount: this.currentSession.messageCount,
        tokensUsed: this.currentSession.tokensUsed,
        tokensInput: this.currentSession.tokensInput,
        tokensOutput: this.currentSession.tokensOutput,
      })

      log.debug("Session ended", {
        sessionId: this.currentSession.sessionId,
        duration,
        messages: this.currentSession.messageCount,
        tokens: this.currentSession.tokensUsed,
      })

      this.currentSession = null
    } catch (error) {
      log.warn("Failed to end session", { error })
    }
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSession?.sessionId || null
  }

  /**
   * Check if tracking is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }
}

/**
 * Global tracker instance
 */
let tracker: UsageTracker | null = null

export function getUsageTracker(): UsageTracker {
  if (!tracker) {
    tracker = new UsageTracker()
  }
  return tracker
}
