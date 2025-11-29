/**
 * Cerebras Usage Tracking API Client
 *
 * Client for communicating with the Cerebras usage tracking backend
 */

import { Log } from "../util/log"
import { Global } from "../global"
import path from "path"
import fs from "fs"

const log = Log.create({ service: "api-client" })

export interface UsageSession {
  sessionId: string
  startedAt: Date
  endedAt?: Date
  duration?: number
  messageCount: number
  tokensUsed: number
  tokensInput: number
  tokensOutput: number
  model: string
  platform: string
  cliVersion: string
}

export interface UsageEvent {
  eventId: string
  sessionId: string
  timestamp: Date
  eventType: string
  toolName?: string
  tokensUsed: number
  duration?: number
  metadata: Record<string, any>
}

export interface UsageStats {
  totalSessions: number
  totalTokens: number
  totalMessages: number
  totalDuration: number
  avgSessionDuration: number
  avgTokensPerSession: number
}

/**
 * API Client configuration
 */
interface APIClientConfig {
  baseURL: string
  apiKey?: string
  timeout: number
}

/**
 * API Client for Cerebras usage tracking
 */
export class APIClient {
  private config: APIClientConfig
  private apiKey: string | null = null

  constructor(config?: Partial<APIClientConfig>) {
    this.config = {
      baseURL: process.env.CEREBRAS_API_URL || "https://api.cerebras.ai",
      timeout: 10000,
      ...config,
    }

    // Load API key from config
    this.loadAPIKey()
  }

  /**
   * Load API key from local storage
   */
  private loadAPIKey(): void {
    try {
      const configPath = path.join(Global.Path.data, "api-key.txt")
      if (fs.existsSync(configPath)) {
        this.apiKey = fs.readFileSync(configPath, "utf-8").trim()
      }
    } catch (error) {
      log.warn("Failed to load API key", { error })
    }
  }

  /**
   * Save API key to local storage
   */
  setAPIKey(apiKey: string): void {
    try {
      const configPath = path.join(Global.Path.data, "api-key.txt")
      fs.mkdirSync(path.dirname(configPath), { recursive: true })
      fs.writeFileSync(configPath, apiKey, "utf-8")
      this.apiKey = apiKey
      log.info("API key saved successfully")
    } catch (error) {
      log.error("Failed to save API key", { error })
      throw new Error("Failed to save API key")
    }
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0
  }

  /**
   * Make authenticated request to API
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error("API key not configured. Run 'cerebras auth login' first.")
    }

    const url = `${this.config.baseURL}${endpoint}`

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }))
        throw new Error(error.detail || `API request failed: ${response.status}`)
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        log.error("API request failed", { method, endpoint, error: error.message })
      }
      throw error
    }
  }

  /**
   * Create a new usage session
   */
  async createSession(data: {
    sessionId: string
    startedAt: Date
    model: string
    platform: string
    cliVersion: string
  }): Promise<UsageSession> {
    return this.request<UsageSession>("POST", "/usage/sessions", {
      session_id: data.sessionId,
      started_at: data.startedAt.toISOString(),
      model: data.model,
      platform: data.platform,
      cli_version: data.cliVersion,
    })
  }

  /**
   * Update a usage session (when it ends)
   */
  async updateSession(
    sessionId: string,
    data: {
      endedAt: Date
      duration: number
      messageCount: number
      tokensUsed: number
      tokensInput: number
      tokensOutput: number
    },
  ): Promise<UsageSession> {
    return this.request<UsageSession>("PATCH", `/usage/sessions/${sessionId}`, {
      ended_at: data.endedAt.toISOString(),
      duration: data.duration,
      message_count: data.messageCount,
      tokens_used: data.tokensUsed,
      tokens_input: data.tokensInput,
      tokens_output: data.tokensOutput,
    })
  }

  /**
   * Create a usage event
   */
  async createEvent(data: {
    eventId: string
    sessionId: string
    timestamp: Date
    eventType: string
    toolName?: string
    tokensUsed: number
    duration?: number
    metadata: Record<string, any>
  }): Promise<UsageEvent> {
    return this.request<UsageEvent>("POST", "/usage/events", {
      event_id: data.eventId,
      session_id: data.sessionId,
      timestamp: data.timestamp.toISOString(),
      event_type: data.eventType,
      tool_name: data.toolName,
      tokens_used: data.tokensUsed,
      duration: data.duration,
      metadata: data.metadata,
    })
  }

  /**
   * Get usage statistics
   */
  async getStats(options?: {
    startDate?: Date
    endDate?: Date
  }): Promise<UsageStats> {
    let endpoint = "/usage/stats"
    const params = new URLSearchParams()

    if (options?.startDate) {
      params.append("start_date", options.startDate.toISOString())
    }
    if (options?.endDate) {
      params.append("end_date", options.endDate.toISOString())
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }

    return this.request<UsageStats>("GET", endpoint)
  }

  /**
   * List usage sessions
   */
  async listSessions(options?: {
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<UsageSession[]> {
    let endpoint = "/usage/sessions"
    const params = new URLSearchParams()

    if (options?.startDate) {
      params.append("start_date", options.startDate.toISOString())
    }
    if (options?.endDate) {
      params.append("end_date", options.endDate.toISOString())
    }
    if (options?.limit) {
      params.append("limit", options.limit.toString())
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }

    return this.request<UsageSession[]>("GET", endpoint)
  }
}

/**
 * Global API client instance
 */
let apiClient: APIClient | null = null

export function getAPIClient(): APIClient {
  if (!apiClient) {
    apiClient = new APIClient()
  }
  return apiClient
}
