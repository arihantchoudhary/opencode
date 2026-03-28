# UI Library — `packages/ui/`

Shared component library, themes, icons, and styles used across all Stardrop frontends.

**Version**: 1.1.42

## Exports

| Export | Contents |
|--------|----------|
| `./components/*` | UI components |
| `./theme/*` | Theme system (dark/light) |
| `./styles` | Tailwind CSS styles |
| `./pierre` | Diff visualization (`@pierre/diffs`) |
| `./hooks` | Custom reactive hooks |
| `./context/*` | Context providers |
| `./icons/*` | Provider icons, file type icons |
| `./fonts/*` | Inter + Newsreader typography |
| `./audio/*` | Audio assets |

## Design System

- **Typography**: Inter (sans) + Newsreader (serif)
- **Styling**: Tailwind CSS 4.1.11
- **Theme**: Dark/light mode support
- **Layout**: Responsive with mobile-first approach
- **Components**: Built on Kobalte (headless UI primitives)

## Key Components

- Code editor views with syntax highlighting
- Terminal emulator UI
- File tree/explorer
- Settings/configuration panels
- Provider icon pack (21 providers)
- File type icon pack
- Rich markdown rendering with KaTeX math support
- Diff viewer (Pierre)

## Related
- [[App]]
- [[Desktop App]]
- [[Frontend (Next.js)]]
