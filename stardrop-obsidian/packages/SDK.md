# SDK — `packages/sdk/js/`

TypeScript SDK for programmatic access to the Stardrop API.

**Version**: 1.1.42 | **Published**: `stardrop-sdk`

## Exports

| Export | Purpose |
|--------|---------|
| `.` | Main client/server imports |
| `./client` | Client-side API |
| `./server` | Server-side API |
| `./v2/*` | V2 API versions |

## Generated from OpenAPI

Built using `@hey-api/openapi-ts` from `packages/sdk/openapi.json`.

## Usage

```typescript
import { createStardrop } from "stardrop-sdk"

// Client-side
const client = createStardrop()
const session = await client.createSession()
await client.sendPrompt(session.id, "Fix the login bug")
client.subscribeToEvents(session.id, (event) => {
  console.log(event)
})
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/session` | Create session |
| `POST` | `/session/:id/prompt` | Send prompt |
| `GET` | `/session/:id/messages` | Get history |
| `GET` | `/session/:id/file` | Read/list files |
| `POST` | `/session/:id/fork` | Fork session |
| `GET` | `/provider` | List providers/models |

## Related
- [[Core Engine]]
- [[API Endpoints]]
