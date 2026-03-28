# Session Architecture

Sessions are the core unit of work in Stardrop. Each session is a stateful conversation between a user and the AI agent.

## Session Lifecycle

```
Created → Idle → Busy (processing) → Idle → ... → Completed/Error
                  ↑                     │
                  └─────────────────────┘
```

## Session Structure

```
Session
├── Messages (conversation history)
│   ├── Text parts
│   ├── File parts
│   ├── Agent parts (sub-agent delegation)
│   └── Subtask parts
├── Tools (available capabilities)
├── Permissions (access control)
├── State: idle | busy | error
├── Metadata
│   ├── project_id
│   ├── directory (working dir)
│   └── workspace_id
└── Shared sessions (WebSocket sync)
```

## Key Files

| File | Purpose |
|------|---------|
| `packages/stardrop/src/session/index.ts` | Session lifecycle management |
| `packages/stardrop/src/session/prompt.ts` | Prompt construction (63KB, token-aware) |
| `packages/stardrop/src/session/llm.ts` | LLM call orchestration |
| `packages/stardrop/src/session/processor.ts` | Message processing pipeline |
| `packages/stardrop/src/session/compaction.ts` | Token optimization via compaction |
| `packages/stardrop/src/session/summary.ts` | Session summarization |
| `packages/stardrop/src/session/message-v2.ts` | Message and part type definitions |
| `packages/stardrop/src/session/claude-code.ts` | Claude Code IDE integration |

## Prompt Construction

The prompt builder (`prompt.ts`, 63KB) is the largest single file:
- Assembles system prompt + tools + conversation history
- Respects token limits per model
- Applies truncation strategies for long contexts
- Includes tool schemas inline
- Manages prompt templates (plan mode, max-steps, build-switch)

## Session Forking

Sessions can be forked for branching conversations:
- `POST /session/:id/fork` — Creates a copy with shared history
- Useful for exploring alternative approaches

## Session Sharing

Sessions can be shared via R2 bucket URLs:
- Generates shareable link
- Stores session data in Cloudflare R2
- Accessible without authentication

## Related
- [[Tool System]]
- [[Permission System]]
- [[Real-Time Communication]]
