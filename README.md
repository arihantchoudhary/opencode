# Stardrop

**I'm Stardrop, an AI Agent made by Nikki Lin and Arihant Choudhary that turns your software wishes into reality.**

Send me what you want me to build for you at: **stardroplin@stanford.edu** or add me to your GitHub repo and `npm i -g stardrop`

My source code can be found here: [github.com/arihantchoudhary/opencode](https://github.com/arihantchoudhary/opencode)

---

## What is Stardrop?

Stardrop is an AI coding agent that turns tickets into deployed code. Point me at a GitHub issue, describe what you want, and I'll read your codebase, ask clarifying questions, and ship small, reviewable changes to a live preview.

### How I Work

1. You open a ticket or request describing what you want.
2. I read the repository and the relevant files.
3. I ask any clarifying questions needed to make the change safe and correct.
4. I make small, reviewable changes and deploy a live preview when possible.
5. You review, request updates if needed, and merge.

---

## Get Started

```bash
npm i -g stardrop
```

Then run in any project directory:

```bash
stardrop            # Launch the interactive TUI
stardrop serve      # Start the headless API server
stardrop run        # Execute a prompt non-interactively
```

---

## What Exists Today

Stardrop is built on a full-stack AI agent platform. Here's what's already working:

### AI Agent Engine

The core loop — prompt, reason, use tools, repeat — is fully implemented. Stardrop creates sessions, sends prompts to LLMs, executes tools based on the response, and iterates until the task is done.

- **Sessions** — isolated units of work with full message history, forking, compaction, and summarization
- **Agents** — configurable modes (`build` for full access, `plan` for read-only analysis)
- **Permission System** — fine-grained control over what tools can do (read, write, bash, edit) with pattern matching and per-file rules

### 30+ Built-in Tools

| Tool | What it does |
|------|-------------|
| `bash` | Execute shell commands |
| `read` / `write` / `edit` | File operations |
| `glob` / `grep` | File search and code search (ripgrep) |
| `apply_patch` | Apply patches to files |
| `lsp` | Language Server Protocol integration |
| `webfetch` / `websearch` | Fetch web pages, search the web |
| `question` | Ask clarifying questions |
| `task` / `todo` | Task tracking |
| `skill` | Load and execute custom skills |
| `plan` | Enter/exit planning mode |
| `batch` / `multiedit` | Batch operations, multi-file edits |

### 20+ LLM Providers

Anthropic, OpenAI, Google Gemini, Azure OpenAI, Amazon Bedrock, Mistral, Groq, DeepInfra, Cerebras, Cohere, Together AI, Perplexity, X.AI, OpenRouter, GitHub Copilot, GitLab, Ollama, and more.

### HTTP API Server

A Hono-based server with OpenAPI spec exposing everything programmatically:

| Endpoint | Purpose |
|----------|---------|
| `POST /session` | Create a new session |
| `POST /session/:id/prompt` | Send a prompt |
| `GET /session/:id/messages` | Get conversation history |
| `GET /global/event` | SSE event stream |
| `POST /session/:id/fork` | Fork a session |
| `GET /file` | Read/list files |
| `GET /provider` | List providers and models |

### TypeScript SDK

```ts
import { createStardrop } from "stardrop-sdk"

const client = createStardrop()
// Create sessions, send prompts, stream events — all programmatically
```

### GitHub Integration

Comprehensive GitHub support (issue parsing, PR review, comment handling, diff analysis, GitHub Actions integration) for autonomous ticket-to-PR workflows.

### Protocol Support

- **ACP** (Agent Client Protocol) — for IDE integrations (Zed, etc.)
- **MCP** (Model Context Protocol) — connect external tool servers
- **LSP** (Language Server Protocol) — code intelligence and diagnostics

### Skills System

Custom skills defined as `SKILL.md` files in `.stardrop/skill/` or `.claude/skills/`. Drop in a markdown file describing a capability and Stardrop can use it.

### CLI Commands

```
stardrop serve        # Start headless API server (port 4096)
stardrop run          # Execute a prompt non-interactively
stardrop github       # Handle GitHub webhook events (issues, PRs, comments)
stardrop acp          # Start Agent Client Protocol server
stardrop mcp          # Manage Model Context Protocol servers
stardrop agent        # Manage agents
stardrop models       # List available models
stardrop auth         # Manage provider authentication
stardrop pr           # PR management
stardrop export       # Export a session
stardrop stats        # Usage statistics
```

---

## Architecture

```
packages/
├── stardrop/          # Core AI agent engine
│   ├── src/
│   │   ├── agent/     # Agent definitions and prompts
│   │   ├── session/   # Session lifecycle, LLM calls, message processing
│   │   ├── tool/      # 30+ built-in tools
│   │   ├── provider/  # 20+ LLM provider integrations
│   │   ├── server/    # Hono HTTP API server
│   │   ├── permission/# Fine-grained permission system
│   │   ├── skill/     # Custom skill loading
│   │   ├── acp/       # Agent Client Protocol
│   │   ├── mcp/       # Model Context Protocol
│   │   ├── lsp/       # Language Server Protocol
│   │   ├── cli/       # CLI commands and TUI
│   │   └── ...
│   └── test/          # Test suite
├── sdk/js/            # TypeScript SDK for the API
├── app/               # Web-based UI
├── desktop/           # Desktop application (Electron)
├── ui/                # Shared UI components
├── plugin/            # Editor plugins
├── enterprise/        # Enterprise features
└── console/           # Console/dashboard
```

---

## Vision

Stardrop wants to be your AI teammate — not a tool you use, but a collaborator that picks up work, does it well, and hands it back for review. The goal is:

**You describe what you want. Stardrop builds it.**

- Open a GitHub issue describing a feature, bug fix, or refactor
- Stardrop reads the codebase, understands the architecture, and plans the change
- It asks questions when something is ambiguous instead of guessing
- It makes small, clean PRs with live previews
- You review, iterate, and merge

No prompt engineering. No copy-pasting context. Just describe the outcome and let Stardrop figure out the implementation.

---

## Next Steps

### Near-term

- **GitHub Actions workflow** — Trigger Stardrop automatically when issues are labeled or comments mention `@stardrop`, using the existing `stardrop github` command
- **Autonomous PR creation** — After the agent completes changes, automatically create a branch and PR with a summary of what was done
- **Preview deployments** — Integrate with Vercel/Netlify/CI to deploy previews on every PR Stardrop creates
- **Async question loop** — When Stardrop needs clarification, post a GitHub comment and resume when the user replies

### Medium-term

- **Multi-repo awareness** — Let Stardrop work across multiple repositories in a single task
- **Learning from reviews** — Use PR review feedback to improve future suggestions
- **Custom agent personas** — Configure Stardrop's behavior per-repo (coding style, testing requirements, deployment targets)
- **Stardrop API** — A hosted version where you can send requests via API without self-hosting

### Long-term

- **Proactive suggestions** — Stardrop monitors the repo and suggests improvements, catches bugs, and proposes optimizations
- **Full CI/CD ownership** — Stardrop doesn't just write code, it deploys, monitors, and rolls back if something goes wrong
- **Team coordination** — Multiple Stardrop agents working on different tickets in parallel, aware of each other's changes

---

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **HTTP Server**: Hono (with OpenAPI)
- **AI SDK**: Vercel AI SDK (`ai` package) + 20 provider packages
- **Protocols**: ACP, MCP, LSP
- **Validation**: Zod
- **TUI**: SolidJS + OpenTUI
- **GitHub**: Octokit (REST + GraphQL)

---

## Made by

**Nikki Lin** and **Arihant Choudhary** at City Intelligence, Inc.

Contact: stardroplin@stanford.edu
