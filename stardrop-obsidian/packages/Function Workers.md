# Function Workers — `packages/function/`

Cloudflare Workers for serverless API functions and real-time sync.

**Version**: 1.1.42

## Key File: `src/api.ts`

### SyncServer (Durable Object)

Persistent real-time state management:
- WebSocket connection handling
- Multi-client session sync
- Crash recovery
- R2 bucket storage for session sharing

### Integrations

| Integration | Purpose |
|-------------|---------|
| **R2 Bucket** | Session file storage |
| **Feishu/Lark** | Enterprise chat integration |
| **GitHub App** | Webhook handling, PR events |
| **JWT** | Token validation |

## Architecture

```
Client → Cloudflare Worker → Durable Object (SyncServer)
                                    │
                                    ├── R2 Bucket (files)
                                    ├── GitHub API
                                    └── Feishu API
```

## Related
- [[Real-Time Communication]]
- [[Cloudflare Services]]
- [[Deployment Architecture]]
