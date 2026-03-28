# Twitter Integration

Full Twitter/X API v2 integration for @stardroplin mention tracking, auto-reply, and DM.

## Authentication Methods

| Method | Env Var | Use Case |
|--------|---------|----------|
| OAuth 1.0a | `TWITTER_API_KEY`, `TWITTER_API_KEY_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET` | User-context (mentions, tweets, DMs) |
| Bearer Token | `TWITTER_BEARER_TOKEN` | App-only (search, user lookup) |
| OAuth 2.0 | `TWITTER_OAUTH2_CLIENT_ID`, `TWITTER_OAUTH2_CLIENT_SECRET` | PKCE flow (future) |

## Current Capabilities

| Capability | Status | Endpoint |
|------------|--------|----------|
| Mention detection | Live | `GET /users/{id}/mentions` |
| User profile lookup | Live | `GET /users/by/username/{username}` |
| Thread fetching | Live | `GET /tweets/search/recent` + `GET /tweets/{id}` |
| Tweet posting | Live (Read+Write tokens) | `POST /tweets` |
| DM sending | Needs DM-scoped tokens | `POST /dm_conversations/with/{id}/messages` |
| Auto-reply | Coming soon | Via GPT-4o analysis |

## Caching

- 15-minute TTL in DynamoDB (`stardrop-tweets-{env}`)
- Cache key pattern: `{username}_mentions`, `{username}_user_id`, `thread_{conversation_id}`
- Stale cache served as fallback on API errors
- Decimal conversion for DynamoDB number types

## Rate Limiting

- Twitter API: 15-minute windows, per-endpoint limits
- App-level: 4 refresh requests per 60 seconds per user
- Headers checked: `x-rate-limit-remaining`, `x-rate-limit-reset`

## Account

- **Handle**: @stardroplin
- **User ID**: `1963782341442330624`
- **Name**: Stardrop
- **App ID**: `32463220`

## Code

- Backend: `backend/app/routes/twitter.py`
- Config: `backend/app/config.py`
- Auth helper: `_authed_get()` — uses OAuth 1.0a when available, Bearer Token fallback

## Related
- [[Backend (FastAPI)]]
- [[Mobile App (Expo)]]
- [[Frontend (Next.js)]]
