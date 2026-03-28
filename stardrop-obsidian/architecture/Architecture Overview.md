# Architecture Overview

Stardrop is a full-stack, multi-platform AI agent system built as a Bun monorepo with 18 packages.

## High-Level Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACCESS LAYER                        │
├──────────────────────┬──────────────────────┬───────────────┤
│  Desktop App         │  Web App (Next.js)   │ Mobile App    │
│  (Tauri Binary)      │  (Vercel)            │ (Expo)        │
└──────────────────────┴──────────────────────┴───────────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Clerk Authentication │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼─────────┐   ┌────────▼────────┐    ┌────────▼──────┐
│  Cloudflare     │   │  AWS App        │    │  Stardrop     │
│  Workers (API)  │   │  Runner         │    │  CLI/Server   │
│  + Durable      │   │  (Python)       │    │  (Local)      │
│  Objects        │   │                 │    │               │
└───────┬─────────┘   └────────┬────────┘    └───────────────┘
        │                      │
        │              ┌───────▼────────┐
        │              │  DynamoDB      │
        │              │  - users       │
        │              │  - tweets      │
        │              │  - sessions    │
        │              └────────────────┘
        │
        │         ┌─────────────────────────┐
        └────────▶│  R2 Buckets (Storage)   │
                  │  - Session shares       │
                  └─────────────────────────┘
```

## Core Design Principles

1. **Multi-agent orchestration** — Best model per task, not single LLM wrapper
2. **Full-stack delivery** — Code + Docker + AWS + monitoring, not just code
3. **Permission-first** — Fine-grained tool access per file/directory
4. **Token-aware** — Prompt construction respects context windows, truncates intelligently
5. **Real-time** — WebSocket + SSE for live session updates
6. **Platform-agnostic** — CLI, desktop, web, mobile all share core SDK

## Monorepo Structure

```
opencode/
├── packages/
│   ├── stardrop/     — Core engine (agent, tools, providers, CLI, server)
│   ├── sdk/          — TypeScript SDK
│   ├── app/          — SolidJS web app
│   ├── desktop/      — Tauri desktop wrapper
│   ├── ui/           — Shared UI components
│   ├── web/          — Astro docs site
│   ├── console/      — Enterprise dashboard
│   ├── enterprise/   — Multi-tenant features
│   ├── plugin/       — Plugin architecture
│   ├── function/     — Cloudflare Workers
│   ├── slack/        — Slack integration
│   ├── util/         — Shared utilities
│   ├── script/       — Build scripts
│   └── identity/     — Auth system
├── frontend/         — Next.js dashboard
├── mobile/           — Expo mobile app
├── backend/          — FastAPI Python API
├── terraform/        — AWS infrastructure
├── infra/            — SST/Cloudflare infrastructure
├── .github/workflows/ — 28 CI/CD pipelines
└── .opencode/        — Stardrop self-config
```

## Related
- [[Session Architecture]]
- [[Tool System]]
- [[Provider System]]
- [[Deployment Architecture]]
