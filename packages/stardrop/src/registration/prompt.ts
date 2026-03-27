import * as prompts from "@clack/prompts"
import { Registration } from "."
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

/**
 * Login flow that runs on every launch.
 * Collects name and email. API keys are resolved from environment variables
 * or can be added later via `stardrop auth`.
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

  // Step 4: Register with backend + save locally
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
      // Signup returned non-OK (e.g. user already exists) — try to get user_id via login
      const err = await response.json().catch(() => ({}))
      log.warn("registration API error, trying login fallback", { status: response.status, err })
      let userId: string | undefined
      try {
        const loginRes = await fetch(`${API_URL}/auth/login?email=${encodeURIComponent(email)}`, {
          method: "POST",
          signal: AbortSignal.timeout(10_000),
        })
        if (loginRes.ok) {
          const loginData = await loginRes.json()
          userId = loginData.user_id
        }
      } catch {
        log.warn("login fallback also failed")
      }
      await Registration.set({
        user_id: userId,
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

  spinner.stop("Logged in!")
  prompts.outro("You're all set! Set your API key via environment variable (e.g. ANTHROPIC_API_KEY) or run `stardrop auth`.")
}

/**
 * @deprecated Use promptLogin instead
 */
export const promptRegistration = promptLogin
