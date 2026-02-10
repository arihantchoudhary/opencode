function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

export namespace Flag {
  export const STARDROP_AUTO_SHARE = truthy("STARDROP_AUTO_SHARE")
  export const STARDROP_GIT_BASH_PATH = process.env["STARDROP_GIT_BASH_PATH"]
  export const STARDROP_CONFIG = process.env["STARDROP_CONFIG"]
  export declare const STARDROP_CONFIG_DIR: string | undefined
  export const STARDROP_CONFIG_CONTENT = process.env["STARDROP_CONFIG_CONTENT"]
  export const STARDROP_DISABLE_AUTOUPDATE = truthy("STARDROP_DISABLE_AUTOUPDATE")
  export const STARDROP_DISABLE_PRUNE = truthy("STARDROP_DISABLE_PRUNE")
  export const STARDROP_DISABLE_TERMINAL_TITLE = truthy("STARDROP_DISABLE_TERMINAL_TITLE")
  export const STARDROP_PERMISSION = process.env["STARDROP_PERMISSION"]
  export const STARDROP_DISABLE_DEFAULT_PLUGINS = truthy("STARDROP_DISABLE_DEFAULT_PLUGINS")
  export const STARDROP_DISABLE_LSP_DOWNLOAD = truthy("STARDROP_DISABLE_LSP_DOWNLOAD")
  export const STARDROP_ENABLE_EXPERIMENTAL_MODELS = truthy("STARDROP_ENABLE_EXPERIMENTAL_MODELS")
  export const STARDROP_DISABLE_AUTOCOMPACT = truthy("STARDROP_DISABLE_AUTOCOMPACT")
  export const STARDROP_DISABLE_MODELS_FETCH = truthy("STARDROP_DISABLE_MODELS_FETCH")
  export const STARDROP_DISABLE_CLAUDE_CODE = truthy("STARDROP_DISABLE_CLAUDE_CODE")
  export const STARDROP_DISABLE_CLAUDE_CODE_PROMPT =
    STARDROP_DISABLE_CLAUDE_CODE || truthy("STARDROP_DISABLE_CLAUDE_CODE_PROMPT")
  export const STARDROP_DISABLE_CLAUDE_CODE_SKILLS =
    STARDROP_DISABLE_CLAUDE_CODE || truthy("STARDROP_DISABLE_CLAUDE_CODE_SKILLS")
  export declare const STARDROP_DISABLE_PROJECT_CONFIG: boolean
  export const STARDROP_FAKE_VCS = process.env["STARDROP_FAKE_VCS"]
  export const STARDROP_CLIENT = process.env["STARDROP_CLIENT"] ?? "cli"
  export const STARDROP_SERVER_PASSWORD = process.env["STARDROP_SERVER_PASSWORD"]
  export const STARDROP_SERVER_USERNAME = process.env["STARDROP_SERVER_USERNAME"]

  // Experimental
  export const STARDROP_EXPERIMENTAL = truthy("STARDROP_EXPERIMENTAL")
  export const STARDROP_EXPERIMENTAL_FILEWATCHER = truthy("STARDROP_EXPERIMENTAL_FILEWATCHER")
  export const STARDROP_EXPERIMENTAL_DISABLE_FILEWATCHER = truthy("STARDROP_EXPERIMENTAL_DISABLE_FILEWATCHER")
  export const STARDROP_EXPERIMENTAL_ICON_DISCOVERY =
    STARDROP_EXPERIMENTAL || truthy("STARDROP_EXPERIMENTAL_ICON_DISCOVERY")
  export const STARDROP_EXPERIMENTAL_DISABLE_COPY_ON_SELECT = truthy("STARDROP_EXPERIMENTAL_DISABLE_COPY_ON_SELECT")
  export const STARDROP_ENABLE_EXA =
    truthy("STARDROP_ENABLE_EXA") || STARDROP_EXPERIMENTAL || truthy("STARDROP_EXPERIMENTAL_EXA")
  export const STARDROP_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS = number("STARDROP_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS")
  export const STARDROP_EXPERIMENTAL_OUTPUT_TOKEN_MAX = number("STARDROP_EXPERIMENTAL_OUTPUT_TOKEN_MAX")
  export const STARDROP_EXPERIMENTAL_OXFMT = STARDROP_EXPERIMENTAL || truthy("STARDROP_EXPERIMENTAL_OXFMT")
  export const STARDROP_EXPERIMENTAL_LSP_TY = truthy("STARDROP_EXPERIMENTAL_LSP_TY")
  export const STARDROP_EXPERIMENTAL_LSP_TOOL = STARDROP_EXPERIMENTAL || truthy("STARDROP_EXPERIMENTAL_LSP_TOOL")
  export const STARDROP_DISABLE_FILETIME_CHECK = truthy("STARDROP_DISABLE_FILETIME_CHECK")
  export const STARDROP_EXPERIMENTAL_PLAN_MODE = STARDROP_EXPERIMENTAL || truthy("STARDROP_EXPERIMENTAL_PLAN_MODE")
  export const STARDROP_EXPERIMENTAL_MARKDOWN = truthy("STARDROP_EXPERIMENTAL_MARKDOWN")
  export const STARDROP_MODELS_URL = process.env["STARDROP_MODELS_URL"]

  function number(key: string) {
    const value = process.env[key]
    if (!value) return undefined
    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
  }
}

// Dynamic getter for STARDROP_DISABLE_PROJECT_CONFIG
// This must be evaluated at access time, not module load time,
// because external tooling may set this env var at runtime
Object.defineProperty(Flag, "STARDROP_DISABLE_PROJECT_CONFIG", {
  get() {
    return truthy("STARDROP_DISABLE_PROJECT_CONFIG")
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for STARDROP_CONFIG_DIR
// This must be evaluated at access time, not module load time,
// because external tooling may set this env var at runtime
Object.defineProperty(Flag, "STARDROP_CONFIG_DIR", {
  get() {
    return process.env["STARDROP_CONFIG_DIR"]
  },
  enumerable: true,
  configurable: false,
})
