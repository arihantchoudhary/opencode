import type { McpServer } from "@agentclientprotocol/sdk"
import type { StardropClient } from "stardrop-sdk/v2"

export interface ACPSessionState {
  id: string
  cwd: string
  mcpServers: McpServer[]
  createdAt: Date
  model?: {
    providerID: string
    modelID: string
  }
  modeId?: string
}

export interface ACPConfig {
  sdk: StardropClient
  defaultModel?: {
    providerID: string
    modelID: string
  }
}
