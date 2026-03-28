# API Endpoints

Complete REST API reference for the FastAPI backend.

## Health

| Method | Endpoint | Response |
|--------|----------|----------|
| `GET` | `/health` | `{"status": "ok"}` |

## Users

| Method | Endpoint | Body/Params | Response |
|--------|----------|-------------|----------|
| `GET` | `/api/users` | — | `[UserResponse]` |
| `POST` | `/api/users` | `UserCreate` | `UserResponse` |
| `GET` | `/api/users/by-clerk/{clerk_id}` | — | `UserResponse` |
| `PATCH` | `/api/users/by-clerk/{clerk_id}` | Partial update | `UserResponse` |

## Twitter

| Method | Endpoint | Params | Response |
|--------|----------|--------|----------|
| `GET` | `/api/twitter/dashboard/{username}` | — | `{profile, mentions, stats}` |
| `GET` | `/api/twitter/mentions/{username}` | — | Twitter API v2 mentions response |
| `GET` | `/api/twitter/profile/{username}` | — | Cached profile |
| `POST` | `/api/twitter/refresh/{username}` | `?clerk_id=` | `{status, result_count, rate_limit}` |
| `GET` | `/api/twitter/thread/{conversation_id}` | — | `{data, includes, conversation_id}` |

## Admin

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `GET` | `/admin/repos` | — | List of GitHub repos |
| `POST` | `/admin/scaffold` | Repo template config | Created repo details |

## Sessions

| Method | Endpoint | Response |
|--------|----------|----------|
| `GET` | `/api/sessions` | `[SessionResponse]` |
| `GET` | `/api/sessions/{session_id}` | `SessionResponse` |

## Error Responses

| Code | Meaning |
|------|---------|
| `400` | Bad request (validation error) |
| `404` | Resource not found |
| `429` | Rate limit exceeded |
| `502` | Twitter API error |
| `503` | Twitter API not configured |

## Related
- [[Backend (FastAPI)]]
- [[Twitter Integration]]
