# Tool System

Stardrop has 40+ built-in tools that the AI agent can invoke during sessions. Tools are the primary mechanism for interacting with the filesystem, executing commands, and accessing external services.

## Tool Categories

### File Operations
| Tool | File | Purpose |
|------|------|---------|
| `read` | `read.ts` | Read file contents |
| `write` | `write.ts` | Create/overwrite files |
| `edit` | `edit.ts` | Surgical string replacement |
| `apply_patch` | `apply_patch.ts` | Apply unified diff patches |
| `ls` | `ls.ts` | List directory contents |

### Search
| Tool | File | Purpose |
|------|------|---------|
| `grep` | `grep.ts` | Regex content search (ripgrep) |
| `glob` | `glob.ts` | File pattern matching |
| `codesearch` | `codesearch.ts` | Semantic code search |

### Code Intelligence
| Tool | File | Purpose |
|------|------|---------|
| `lsp` | `lsp.ts` | Language Server Protocol (go-to-definition, references) |

### Execution
| Tool | File | Purpose |
|------|------|---------|
| `bash` | `bash.ts` | Execute shell commands |
| `pty` | `pty.ts` | Pseudoterminal (interactive commands) |

### Web
| Tool | File | Purpose |
|------|------|---------|
| `webfetch` | `webfetch.ts` | Fetch URL content |
| `websearch` | `websearch.ts` | Web search |

### Batch Operations
| Tool | File | Purpose |
|------|------|---------|
| `batch` | `batch.ts` | Run multiple tools in parallel |
| `multiedit` | `multiedit.ts` | Edit multiple files atomically |

### Task Management
| Tool | File | Purpose |
|------|------|---------|
| `task` | `task.ts` | Create/update/list tasks |
| `todo` | `todo.ts` | TODO tracking |

### Meta
| Tool | File | Purpose |
|------|------|---------|
| `skill` | `skill.ts` | Load custom skills |
| `plan` | `plan.ts` | Enter/exit plan mode |
| `question` | `question.ts` | Ask user questions |

## Tool Registry

`packages/stardrop/src/tool/registry.ts` manages dynamic tool registration:
- Tools are loaded on session creation
- Custom tools can be added via [[Plugin System]]
- Tools are filtered by [[Permission System]]
- Each tool has a JSON Schema definition for the AI

## Tool Execution Flow

```
AI decides to use tool
  → Permission check (allowed for this file/dir?)
  → Input validation (JSON Schema)
  → Execution (async, may stream output)
  → Output truncation (token-aware)
  → Result returned to AI conversation
```

## Custom Tools

Defined in `.opencode/tool/`:
- `github-triage.ts` — Issue triage tool
- `github-pr-search.ts` — PR search tool

## Related
- [[Permission System]]
- [[Plugin System]]
- [[Core Engine]]
