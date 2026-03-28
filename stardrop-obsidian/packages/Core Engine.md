# Core Engine — `packages/stardrop/`

The heart of Stardrop. Contains the AI agent core, CLI, HTTP server, tool system, provider integrations, and session management.

**Version**: 1.1.44 | **Entry**: `bin/stardrop` | **Published**: `stardrop` on npm

## Directory Map

```
src/
├── agent/       — Agent definitions, system prompts, agent types
├── session/     — Session lifecycle, LLM calls, prompt construction
├── tool/        — 40+ built-in tools
├── provider/    — 21 LLM provider integrations
├── server/      — HTTP API (Hono) + WebSocket
├── cli/         — CLI commands + TUI (Terminal UI)
├── permission/  — Fine-grained access control
├── mcp/         — Model Context Protocol (external tools)
├── lsp/         — Language Server Protocol (code intelligence)
├── acp/         — Agent Client Protocol (IDE integration)
├── plugin/      — Custom plugin loading
├── project/     — Project and workspace management
├── file/        — Filesystem utilities
├── shell/       — Shell integration
├── config/      — Configuration parsing
└── auth/        — Authentication mechanisms
```

## CLI Commands

| Command | File | Purpose |
|---------|------|---------|
| `stardrop` | `cli/cmd/run.ts` | Interactive agent session |
| `stardrop serve` | `cli/cmd/serve.ts` | Headless API server (port 4096) |
| `stardrop github run` | `cli/cmd/github.ts` | GitHub Actions integration (58KB) |
| `stardrop mcp` | `cli/cmd/mcp.ts` | MCP server management (25KB) |
| `stardrop agent` | `cli/cmd/agent.ts` | Agent management |
| `stardrop auth` | `cli/cmd/auth.ts` | Authentication setup |
| `stardrop stats` | `cli/cmd/stats.ts` | Usage statistics |
| `stardrop pr` | `cli/cmd/pr.ts` | PR management |
| `stardrop upgrade` | `cli/cmd/upgrade.ts` | Self-upgrade |
| `stardrop web` | `cli/cmd/web.ts` | Open web UI |
| `stardrop export` | `cli/cmd/export.ts` | Export session |
| `stardrop import` | `cli/cmd/import.ts` | Import session |

## Server Routes

| Route | File | Purpose |
|-------|------|---------|
| `/session` | `routes/session.ts` | Session CRUD + messaging (28KB) |
| `/file` | `routes/file.ts` | File operations |
| `/config` | `routes/config.ts` | Configuration |
| `/provider` | `routes/provider.ts` | List providers/models |
| `/permission` | `routes/permission.ts` | Permission management |
| `/mcp` | `routes/mcp.ts` | MCP routes |
| `/project` | `routes/project.ts` | Project management |
| `/tui` | `routes/tui.ts` | TUI-specific |
| `/experimental` | `routes/experimental.ts` | Experimental features |

## TUI (Terminal UI)

Built with OpenTUI + SolidJS:
- `cli/cmd/tui/attach.ts` — Attach mode
- `cli/cmd/tui/thread.ts` — Thread mode
- Rich component library for terminal rendering

## Related
- [[Session Architecture]]
- [[Tool System]]
- [[Provider System]]
