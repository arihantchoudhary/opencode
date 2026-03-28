# Real-Time Communication

Stardrop uses multiple real-time protocols for live session updates across platforms.

## Protocols

### WebSocket
- **Primary use**: Session sync between server and clients
- **Implementation**: Hono WebSocket upgrade in `src/server/server.ts`
- **Features**: Bidirectional messaging, session events, tool output streaming

### Server-Sent Events (SSE)
- **Primary use**: One-way event streaming
- **Use case**: CI/CD status updates, long-running tool output

### Cloudflare Durable Objects
- **Primary use**: Persistent real-time state
- **Implementation**: `packages/function/src/api.ts` — `SyncServer` Durable Object
- **Features**: Session sharing, multi-client sync, crash recovery

## Architecture

```
Client (Desktop/Web/Mobile)
  │
  ├── WebSocket ──→ Stardrop Server (Hono)
  │                    │
  │                    ├── Session state
  │                    ├── Tool execution events
  │                    └── Message streaming
  │
  └── HTTPS ──→ Cloudflare Worker
                   │
                   └── Durable Object (SyncServer)
                          │
                          ├── R2 Bucket (shared sessions)
                          └── Multi-client sync
```

## Message Types

| Event | Direction | Purpose |
|-------|-----------|---------|
| `session.created` | Server → Client | New session started |
| `message.delta` | Server → Client | Streaming token output |
| `tool.start` | Server → Client | Tool execution began |
| `tool.result` | Server → Client | Tool output ready |
| `prompt` | Client → Server | User sends message |
| `permission.grant` | Client → Server | User approves tool use |

## Related
- [[Session Architecture]]
- [[Function Workers]]
- [[Deployment Architecture]]
