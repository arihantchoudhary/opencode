# Plugin System — `packages/plugin/`

Extension architecture for adding custom tools and capabilities to Stardrop.

**Version**: 1.1.42

## Exports

| Export | Purpose |
|--------|---------|
| `.` | Main plugin API |
| `./tool` | Tool plugin definitions |

## How It Works

1. Define a tool with a name, description, and JSON Schema parameters
2. Implement the tool's execution function
3. Register via plugin config or `.opencode/tool/` directory
4. Tool becomes available in sessions

## Custom Tool Example

From `.opencode/tool/github-triage.ts`:
- Connects to GitHub API
- Triages issues by priority
- Assigns labels and milestones

## Tool Schema

Tools use Zod for schema validation:
```typescript
const schema = z.object({
  file_path: z.string(),
  content: z.string(),
})
```

## Custom Skills

Skills are higher-level capabilities defined in `.opencode/skill/`:
- `bun-file-io/SKILL.md` — Bun file I/O best practices

## Custom Agents

Agent personas defined in `.opencode/agent/`:
- `triage.md` — Issue triage (uses Haiku model)
- `docs.md` — Documentation agent
- `duplicate-pr.md` — PR duplicate detector

## Related
- [[Tool System]]
- [[Core Engine]]
- [[Configuration Files]]
