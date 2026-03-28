# Mobile App (Expo)

Cross-platform iOS/Android app for Stardrop dashboard.

**Framework**: Expo SDK 54 + React Native 0.81.5

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Expo | 54.0.33 | Mobile framework |
| React Native | 0.81.5 | Native UI |
| React | 19.1.0 | UI library |
| Expo Router | v6 | File-based routing |
| Clerk Expo | 2.5.0 | Authentication |
| Expo Secure Store | - | Token storage |

## Navigation (Tab-based)

```
app/
├── (tabs)/
│   ├── index.tsx      — Dashboard (mentions + stats)
│   ├── mentions.tsx   — Mentions feed
│   ├── projects.tsx   — Projects list
│   └── profile.tsx    — User profile + settings
├── sign-in.tsx        — Clerk sign-in
├── sign-up.tsx        — Clerk sign-up
├── _layout.tsx        — Root layout with ClerkProvider
└── index.tsx          — Entry point
```

## Features

- Native iOS/Android experience
- Clerk OAuth integration (Google, GitHub, Apple)
- Biometric authentication via SecureStore
- Dashboard with Twitter mentions
- Engagement stats (likes, reposts, replies, impressions)
- Project management with deployment links
- User profile with Twitter handle setup
- Full API parity with web dashboard

## API Integration

Uses the same FastAPI backend endpoints:
- `GET /api/twitter/dashboard/{username}`
- `POST /api/twitter/refresh/{username}`
- `GET /api/users/by-clerk/{clerk_id}`

## Related
- [[Backend (FastAPI)]]
- [[Clerk Authentication]]
- [[Twitter Integration]]
