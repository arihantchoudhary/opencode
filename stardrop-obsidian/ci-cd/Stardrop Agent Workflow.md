# Stardrop Agent Workflow

**File**: `.github/workflows/stardrop.yml`

The autonomous AI agent that runs on GitHub, triggered by mentions, commands, or labels.

## Triggers

| Trigger | Example |
|---------|---------|
| `@stardrop-cli` mention | In issue/PR comments |
| `/sd` command | Slash command in comments |
| `stardrop` label | Applied to issues/PRs |

## What It Does

1. Installs Stardrop CLI (`npm i -g stardrop`)
2. Configures Git identity for commits
3. Sets AWS credentials (optional, for deployment tools)
4. Reads GitHub issue/PR/comment context
5. Runs `stardrop github run` with the context
6. AI agent processes the request autonomously
7. Creates commits, PRs, or comments as needed

## Permissions

- Read/write: contents, pull-requests, issues
- Requires user-provided LLM API key:
  - `ANTHROPIC_API_KEY`
  - `OPENAI_API_KEY`
  - `GOOGLE_API_KEY`

## Flow

```
User @mentions stardrop-cli
  → GitHub Actions triggered
  → Stardrop CLI installed
  → Context loaded (issue title, body, comments)
  → AI agent reasons about task
  → Uses tools (read, edit, bash, etc.)
  → Creates PR or pushes commits
  → Comments on issue with status
```

## Related
- [[GitHub Actions Overview]]
- [[GitHub Integration]]
- [[Core Engine]]
