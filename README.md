# Stardrop

## How to collaborate with Stardrop

1. Send me an Email: **stardroplin@stanford.edu**
2. Add me to your GitHub Repo: **@stardrop-cli**

OR

1. **npm i -g stardrop** and prompt me directly

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

## Paid Pilot: TravelGPT ($2,000 engagement)

**CS224G | Arihant Choudhary, Nikki Lin**

### Why a Paid Pilot?

To validate market demand for an AI agent that ships production code, Arihant and Nikki went undercover as freelance developers. They took on a real client engagement — building **TravelGPT**, an AI-powered travel planning application — and used Stardrop as the primary developer behind the scenes.

The client paid $2,000 for the project. Stardrop was assigned tickets, read the codebase, and shipped reviewable changes across frontend, backend, and infrastructure. The client reviewed and merged the work as if it came from a human developer.

### Why This Matters

Software teams pay a high "coordination tax" — engineers, PMs, and designers spend disproportionate time on maintenance, ticket management, and low-leverage execution. Existing AI tools fail to address this because they lack deep context. They are isolated chatbots that require constant copy-pasting, rather than embedded agents that understand a product's constraints, documentation, and history.

This pilot proved that Stardrop can operate in a real workflow: receive tickets, understand context, ship code, and get paid for the output.

### What Was Built

TravelGPT is an AI-powered travel planning app with:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn-ui + Mapbox (deployed on Vercel)
- **Backend**: FastAPI with travel plans CRUD, email delivery, and AI generation (AWS App Runner)
- **Infrastructure**: Terraform IaC (ECR, App Runner, DynamoDB)

### Results

| | Easy | Medium | Hard | Total |
|---|:---:|:---:|:---:|:---:|
| **Tickets** | 20 | 8 | 13 | **41** |
| **Commits** | 42 | 29 | 83 | **154** |

Stardrop completed **41 tickets** totaling **154 commits** across frontend, backend, and infrastructure.

### Tickets Completed by Stardrop

| # | Ticket | Difficulty | Tries |
|---|--------|:----------:|:-----:|
| 1 | Terraform & DynamoDB setup | Easy | 1 |
| 2 | FastAPI backend bootstrap | Easy | 2 |
| 3 | Travel planner UI (v1) | Hard | 11 |
| 4 | Serper search integration | Easy | 1 |
| 5 | CORS fix (backend) | Easy | 1 |
| 6 | Async generation pipeline | Hard | 6 |
| 7 | OpenRouter AI model selection | Easy | 1 |
| 8 | Landing page & admin UI | Hard | 9 |
| 9 | Date pickers | Medium | 7 |
| 10 | Hero section design | Medium | 9 |
| 11 | Branding & design polish | Easy | 4 |
| 12 | Mapbox map (backend) | Hard | 11 |
| 13 | Travel plan carousel | Easy | 1 |
| 14 | Travel plan page design | Medium | 3 |
| 15 | Per-section generation | Easy | 2 |
| 16 | Backend logging | Easy | 2 |
| 17 | Travel plans CRUD & DynamoDB | Hard | 6 |
| 18 | Email sending (Mailgun) | Hard | 8 |
| 19 | Remove auth requirement | Easy | 1 |
| 20 | Logging & progress UI | Medium | 3 |
| 21 | Map geocoding & interactivity | Hard | 11 |
| 22 | Deterministic AI responses | Medium | 2 |
| 23 | AWS backend migration | Hard | 4 |
| 24 | Garbage data prevention | Hard | 4 |
| 25 | Parallel section generation | Hard | 4 |
| 26 | Itinerary formatting | Medium | 4 |
| 27 | Map loading UX | Easy | 1 |
| 28 | Priority bug fixes (dates, addresses, dietary) | Medium | 1 |
| 29 | Weather integration | Hard | 5 |
| 30 | Admin dashboard | Easy | 2 |
| 31 | Email collection in form | Easy | 4 |
| 32 | Color theme overhaul | Medium | 8 |
| 33 | Email delivery (frontend) | Easy | 2 |
| 34 | Content cleanup | Easy | 2 |
| 35 | Itinerary toggle & disclaimer | Easy | 2 |
| 36 | Foursquare autocomplete | Hard | 7 |
| 37 | Destinations list | Hard | 13 |
| 38 | Branding & social preview | Easy | 5 |
| 39 | CORS fix (frontend to backend) | Medium | 1 |
| 40 | Form styling | Easy | 1 |
| 41 | Re-enable map | Easy | 1 |

### Highest-Iteration Tickets

These tickets required the most attempts, revealing where requirements were ambiguous or the problem space was complex:

- **Destinations list** (13 tries) — Iteratively expanded the curated destination database from 240 to 1,431 entries across all 50 US states, 195 countries, and niche locations
- **Map geocoding & interactivity** (11 tries) — POI geocoding proved unreliable; required progressive filtering, proximity scoring, and duplicate detection
- **Travel planner UI v1** (11 tries) — Initial frontend buildout with multiple model switches (Cerebras to OpenRouter to GPT-4o-mini) and design iterations
- **Hero section design** (9 tries) — Visual design iteration on background images, blur effects, typography, and layout
- **Email template** (8 tries) — Iterating on email design, colors, and branding to match the website
- **Color theme overhaul** (8 tries) — Migrated through three color schemes (beige to light yellow to white)
- **Foursquare autocomplete** (7 tries) — API integration that was ultimately abandoned in favor of a curated local list

### What We Learned

- **Ambiguous inputs lead to ambiguous outputs** — Real tickets are often vague. Stardrop needs better "clarifying question" behavior so work stays correct and reviewable.
- **Trust and safety** — Fitting into real orgs requires predictable behavior, strong permissions, and a review flow teams actually trust.
- **Ticket-to-scope improvement** — Adding a lightweight "requirements confirmation" step (ask-then-act) would reduce rework.
- **It works** — A paying client received 41 tickets worth of production code across a full-stack app. The workflow is viable.

### Demo

[Video demos](https://drive.google.com/drive/folders/1fOCLUTwbSQkHzyCNvGwRNzl6NZRJwUxS)

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
