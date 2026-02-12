import * as prompts from "@clack/prompts"
import { Registration } from "."
import { Auth } from "../auth"
import { Log } from "../util/log"

const API_URL = "https://p9ia72yajp.us-east-1.awsapprunner.com"

const log = Log.create({ service: "registration" })

const REFERENCE_OPTIONS = [
  { label: "Twitter/X", value: "twitter" },
  { label: "GitHub", value: "github" },
  { label: "Friend/colleague", value: "friend" },
  { label: "Blog/article", value: "blog" },
  { label: "YouTube", value: "youtube" },
  { label: "Other", value: "other" },
]

const PROVIDER_OPTIONS = [
  { label: "Anthropic", value: "anthropic" },
  { label: "OpenAI", value: "openai" },
  { label: "Google", value: "google" },
]

/**
 * Login flow that runs on every launch.
 * Collects name, email, and API key.
 */
export async function promptLogin() {
  const existing = await Registration.get()

  prompts.intro("Welcome to Stardrop!")

  // Step 1: Name
  const name = await prompts.text({
    message: "What's your name?",
    placeholder: "Your name",
    defaultValue: existing?.name,
    validate: (v) => {
      if (!v || v.trim().length === 0) return "Name is required"
    },
  })
  if (prompts.isCancel(name)) {
    prompts.outro("Name is required to use Stardrop.")
    process.exit(0)
  }

  // Step 2: Email
  const email = await prompts.text({
    message: "What's your email?",
    placeholder: "you@example.com",
    defaultValue: existing?.email,
    validate: (v) => {
      if (!v || !v.includes("@")) return "Please enter a valid email"
    },
  })
  if (prompts.isCancel(email)) {
    prompts.outro("Email is required to use Stardrop.")
    process.exit(0)
  }

  // Step 3: Referral source (only on first run)
  let reference = existing?.reference
  if (!existing) {
    const ref = await prompts.select({
      message: "How did you hear about Stardrop?",
      options: REFERENCE_OPTIONS,
    })
    if (prompts.isCancel(ref)) {
      prompts.outro("Signup is required to use Stardrop.")
      process.exit(0)
    }
    reference = ref
  }

  // Step 4: API key
  const provider = await prompts.select({
    message: "Which provider?",
    options: PROVIDER_OPTIONS,
  })
  if (prompts.isCancel(provider)) {
    prompts.outro("An API key is required to use Stardrop.")
    process.exit(0)
  }

  const apiKey = await prompts.text({
    message: `Enter your ${PROVIDER_OPTIONS.find((p) => p.value === provider)?.label} API key`,
    placeholder: "sk-...",
    validate: (v) => {
      if (!v || v.trim().length === 0) return "API key is required"
    },
  })
  if (prompts.isCancel(apiKey)) {
    prompts.outro("An API key is required to use Stardrop.")
    process.exit(0)
  }

  // Step 5: Register with backend + save locally
  const spinner = prompts.spinner()
  spinner.start("Logging in...")

  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        reference,
        signup_source: "cli",
      }),
      signal: AbortSignal.timeout(10_000),
    })

    if (response.ok) {
      const data = await response.json()
      await Registration.set({
        user_id: data.user_id,
        email,
        name,
        reference,
        registered_at: new Date().toISOString(),
      })
    } else {
      const err = await response.json().catch(() => ({}))
      log.warn("registration API error", { status: response.status, err })
      await Registration.set({
        email,
        name,
        reference,
        registered_at: new Date().toISOString(),
      })
    }
  } catch (e) {
    log.warn("registration failed", {
      error: e instanceof Error ? e.message : String(e),
    })
    await Registration.set({
      email,
      name,
      reference,
      registered_at: new Date().toISOString(),
    })
  }

  // Save API key
  await Auth.set(provider, { type: "api", key: apiKey })

  spinner.stop("Logged in!")
  prompts.outro("You're all set!")
}

/**
 * @deprecated Use promptLogin instead
 */
export const promptRegistration = promptLogin
