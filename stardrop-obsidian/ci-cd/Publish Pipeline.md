# Publish Pipeline

**File**: `.github/workflows/publish.yml`

Releases Stardrop CLI to npm and builds native desktop apps.

## Jobs

### 1. `publish` — npm Release
- Bumps version (major/minor/patch)
- Builds Stardrop CLI
- Publishes to npm as `stardrop`
- Uploads build artifacts

### 2. `publish-tauri` — Desktop Builds
Cross-platform native builds:

| Platform | Architecture | Output |
|----------|-------------|--------|
| macOS | x86_64 | `.dmg` |
| macOS | aarch64 (Apple Silicon) | `.dmg` |
| Linux | x86_64 | `.AppImage`, `.deb` |
| Linux | aarch64 | `.AppImage`, `.deb` |
| Windows | x86_64 | `.msi` |

Features:
- macOS code signing
- Auto-update manifest signing
- Published to GitHub Releases

### 3. `publish-release` — Finalization
- AUR (Arch Linux) package update
- Release notes generation
- Version tagging

## Outputs

| Output | Value |
|--------|-------|
| `version` | Bumped version string |
| `tag` | Git tag |
| `release_id` | GitHub Release ID |

## Related
- [[Desktop App]]
- [[GitHub Actions Overview]]
