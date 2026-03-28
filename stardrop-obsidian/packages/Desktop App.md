# Desktop App — `packages/desktop/`

Native desktop application wrapping the web app with Tauri 2.

**Version**: 1.1.42 | **Platforms**: macOS (x86_64 + aarch64), Linux (x86_64 + aarch64), Windows

## Tech Stack

- **Framework**: Tauri 2 (Rust backend + web frontend)
- **Wraps**: `packages/app` (SolidJS web app)

## Tauri Plugins

| Plugin | Purpose |
|--------|---------|
| `deep-link` | Handle `stardrop://` URLs |
| `dialog` | Native file dialogs |
| `opener` | Open URLs/files in system apps |
| `os` | OS detection |
| `notification` | Native notifications |
| `process` | Child process management |
| `shell` | Shell integration |
| `store` | Persistent key-value storage |
| `updater` | Auto-updates from GitHub releases |
| `http` | Native HTTP (bypasses CORS) |
| `window-state` | Remember window size/position |

## Distribution

- Published as GitHub Releases
- Code-signed on macOS
- Auto-update via Tauri updater
- Built in CI via `publish.yml` workflow

## Related
- [[App]]
- [[Publish Pipeline]]
