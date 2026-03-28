# App — `packages/app/`

Shared web application layer built with SolidJS.

**Version**: 1.1.42

## Tech Stack

- **Framework**: SolidJS 1.9.10
- **Router**: SolidJS Router
- **Build**: Vite
- **Styling**: Tailwind CSS 4.1.11
- **UI Components**: Kobalte
- **Terminal**: Ghostty (web version)
- **Syntax Highlighting**: Shiki + marked
- **Virtual Scrolling**: Virtua

## Features

- Real-time session updates via WebSocket
- Code editor and file browser
- Message history with rich markdown rendering
- Model/provider selection UI
- Permission management interface
- Session sharing with public URLs
- Internationalization (15+ languages)

## Supported Languages (i18n)

English, Japanese, Korean, Polish, Norwegian, Russian, Thai, French, Chinese (Simplified + Traditional), Brazilian Portuguese, Spanish, Arabic, German, Danish

## Key Dependencies

- `stardrop-sdk` — API integration
- `stardrop-util` — Shared utilities
- `@solid-primitives/*` — Storage, I18n, WebSocket, events
- `marked` + `marked-shiki` — Markdown with syntax highlighting
- `diff` — Diff visualization

## Related
- [[UI Library]]
- [[Desktop App]]
- [[SDK]]
