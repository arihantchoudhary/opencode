# GitHub Integration

Deep GitHub integration at multiple levels.

## GitHub App

| Setting | Value |
|---------|-------|
| App ID | `2888752` |
| Name | `stardrop-agent` |
| Auth | RSA private key (in `.env`) |

### Capabilities
- Create repositories
- Read/write code
- Create/update issues and PRs
- Post comments
- Manage labels

## Repo Scaffolding

The backend `POST /admin/scaffold` endpoint creates repos with:
- `frontend/` — Next.js + shadcn + Clerk project
- `CLAUDE.md` — Instructions for Stardrop agent
- Vercel deploy command pre-configured
- Co-author settings baked in

## GitHub Actions Bot

`stardrop.yml` workflow:
- Triggered by `@stardrop-cli` mentions
- Runs full AI agent session
- Reads issue/PR context
- Creates commits and PRs autonomously

## CLI Integration

`packages/stardrop/src/cli/cmd/github.ts` (58KB):
- `stardrop github run` — Execute agent on GitHub context
- PR creation and management
- Issue triage
- Comment handling

## Custom Tools

- `.opencode/tool/github-triage.ts` — Issue triage automation
- `.opencode/tool/github-pr-search.ts` — PR search and dedup

## Related
- [[Stardrop Agent Workflow]]
- [[Backend (FastAPI)]]
- [[Core Engine]]
