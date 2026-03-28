# Permission System

Fine-grained access control for tool execution. Determines what the AI agent can read, write, edit, and execute.

## Permission Levels

| Level | Description |
|-------|-------------|
| `read` | Read file contents |
| `write` | Create or overwrite files |
| `edit` | Modify existing files (string replacement) |
| `bash` | Execute shell commands |

## Permission Scopes

- **File patterns** — Glob patterns like `src/**/*.ts`
- **Directory trees** — Entire directories like `packages/`
- **Tool-specific** — Per-tool allow/deny rules

## Permission Policies

```
Allow: read src/**
Allow: edit src/**/*.ts
Deny: write .env*
Deny: bash rm -rf
```

## Key Files

| File | Purpose |
|------|---------|
| `src/permission/` | Permission engine |
| `src/server/routes/permission.ts` | Permission management API |

## How It Works

1. AI agent requests tool use (e.g., `edit` on `src/app.ts`)
2. Permission engine checks against active policy
3. If denied → tool returns error, AI must find alternative
4. If allowed → tool executes normally
5. User can be prompted for approval on sensitive operations

## Dynamic Permissions

- Permissions can change mid-session
- Users can grant/revoke through UI or CLI
- Default policies per project type
- Override via `.opencode/` configuration

## Related
- [[Tool System]]
- [[Session Architecture]]
- [[Configuration Files]]
