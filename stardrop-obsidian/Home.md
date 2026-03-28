# Stardrop Vault

> AI-powered autonomous development agent that turns GitHub issues into deployed code.
> Built by Nikki Lin & Arihant Choudhary at City Intelligence, Inc.

**Version**: 1.1.44 | **License**: MIT | **Runtime**: Bun + TypeScript
**Repo**: `arihantchoudhary/opencode` (redirects to `arihantchoudhary/stardrop`)

---

## Quick Navigation

### Architecture
- [[Architecture Overview]] — System design, data flow, deployment topology
- [[Session Architecture]] — Session lifecycle, messages, state machine
- [[Tool System]] — 40+ built-in tools, registry, permissions
- [[Provider System]] — 21 LLM integrations, unified interface
- [[Permission System]] — Fine-grained access control
- [[Real-Time Communication]] — WebSocket, SSE, Durable Objects

### Packages (Monorepo)
- [[Core Engine]] — `packages/stardrop/` — AI agent core, CLI, server
- [[SDK]] — `packages/sdk/` — TypeScript SDK for API access
- [[App]] — `packages/app/` — SolidJS web application
- [[Desktop App]] — `packages/desktop/` — Tauri native desktop
- [[UI Library]] — `packages/ui/` — Shared components, themes, icons
- [[Web Docs]] — `packages/web/` — Astro documentation site
- [[Console]] — `packages/console/` — Enterprise dashboard
- [[Enterprise]] — `packages/enterprise/` — Multi-tenant features
- [[Plugin System]] — `packages/plugin/` — Extension architecture
- [[Function Workers]] — `packages/function/` — Cloudflare Workers
- [[Slack Integration]] — `packages/slack/` — Workspace bot

### Applications
- [[Frontend (Next.js)]] — Twitter mentions dashboard
- [[Mobile App (Expo)]] — iOS/Android native app
- [[Backend (FastAPI)]] — Python API, DynamoDB, Twitter integration

### Infrastructure
- [[Terraform]] — AWS App Runner, DynamoDB, IAM
- [[SST Config]] — Cloudflare Workers, PlanetScale, Stripe
- [[Deployment Architecture]] — Full production topology
- [[Environment Configuration]] — Dev, staging, prod, preview

### CI/CD
- [[GitHub Actions Overview]] — 28 workflows
- [[Publish Pipeline]] — npm + Tauri desktop releases
- [[Preview Deployments]] — Per-PR ephemeral environments
- [[Stardrop Agent Workflow]] — Autonomous GitHub bot

### Integrations
- [[Twitter Integration]] — OAuth 1.0a/2.0, mentions, DM, caching
- [[GitHub Integration]] — App, Actions, repo scaffolding
- [[Clerk Authentication]] — Web + mobile auth
- [[AWS Services]] — App Runner, DynamoDB, ECR, IAM
- [[Cloudflare Services]] — Workers, Durable Objects, R2

### Reference
- [[Tech Stack]] — Complete technology inventory
- [[Specs Index]] — Architecture specs and roadmaps
- [[Configuration Files]] — Key config locations
- [[API Endpoints]] — Backend REST API reference
- [[Recent Development]] — Latest features and themes

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Packages | 18 in monorepo |
| Built-in Tools | 40+ |
| LLM Providers | 21 |
| CI/CD Workflows | 28 |
| Platforms | CLI, Web, Desktop, Mobile |
| DynamoDB Tables | 3 per environment |
| npm Downloads | 700K+ total |
