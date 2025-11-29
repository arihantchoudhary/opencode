/**
 * User Onboarding & Authentication
 *
 * Simple onboarding flow that asks for user info on first run
 * and saves to DynamoDB
 */

import { Log } from "../util/log"
import { Global } from "../global"
import path from "path"
import fs from "fs"
import * as prompts from "@clack/prompts"
import { UI } from "../cli/ui"
import { DynamoDB } from "@aws-sdk/client-dynamodb"
import { randomBytes } from "crypto"

const log = Log.create({ service: "onboarding" })

interface UserProfile {
  userId: string
  name: string
  email: string
  company?: string
  role?: string
  createdAt: string
}

/**
 * Get local user profile path
 */
function getUserProfilePath(): string {
  return path.join(Global.Path.data, "user-profile.json")
}

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding(): boolean {
  const profilePath = getUserProfilePath()
  return fs.existsSync(profilePath)
}

/**
 * Load user profile from local storage
 */
export function loadUserProfile(): UserProfile | null {
  try {
    const profilePath = getUserProfilePath()
    if (!fs.existsSync(profilePath)) return null

    const data = fs.readFileSync(profilePath, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    log.error("Failed to load user profile", { error })
    return null
  }
}

/**
 * Save user profile to local storage
 */
function saveUserProfile(profile: UserProfile): void {
  try {
    const profilePath = getUserProfilePath()
    fs.mkdirSync(path.dirname(profilePath), { recursive: true })
    fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2), "utf-8")
    log.info("User profile saved", { userId: profile.userId })
  } catch (error) {
    log.error("Failed to save user profile", { error })
    throw new Error("Failed to save user profile")
  }
}

/**
 * Generate a unique user ID
 */
function generateUserId(): string {
  return "usr_" + randomBytes(12).toString("hex")
}

/**
 * Write user to DynamoDB
 */
async function writeUserToDynamoDB(profile: UserProfile): Promise<void> {
  const region = process.env.AWS_REGION || "us-east-1"
  const tableName = process.env.DYNAMODB_USERS_TABLE || "dev-cerebras-users"

  try {
    const dynamodb = new DynamoDB({ region })

    await dynamodb.putItem({
      TableName: tableName,
      Item: {
        PK: { S: `USER#${profile.userId}` },
        SK: { S: "METADATA" },
        GSI1PK: { S: `EMAIL#${profile.email}` },
        GSI1SK: { S: "USER" },
        userId: { S: profile.userId },
        name: { S: profile.name },
        email: { S: profile.email },
        company: { S: profile.company || "" },
        role: { S: profile.role || "" },
        createdAt: { S: profile.createdAt },
        updatedAt: { S: profile.createdAt },
        status: { S: "active" },
        plan: { S: "free" },
      },
    })

    log.info("User written to DynamoDB", {
      userId: profile.userId,
      table: tableName,
    })
  } catch (error) {
    log.error("Failed to write user to DynamoDB", { error })
    // Don't throw - we still want to save locally even if DynamoDB fails
    console.warn("⚠️  Warning: Could not save to cloud database, but continuing with local profile")
  }
}

/**
 * Show onboarding questionnaire and collect user info
 */
export async function runOnboarding(): Promise<UserProfile> {
  UI.empty()

  prompts.intro("👋 Welcome to Cerebras!")

  console.log("Let's get you set up. We'll ask a few questions to personalize your experience.\n")

  // Question 1: Name
  const name = await prompts.text({
    message: "What's your name?",
    placeholder: "John Doe",
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return "Name is required"
      }
      return undefined
    },
  })

  if (prompts.isCancel(name)) {
    prompts.outro("Setup cancelled")
    process.exit(0)
  }

  // Question 2: Email
  const email = await prompts.text({
    message: "What's your email address?",
    placeholder: "john@example.com",
    validate: (value) => {
      if (!value || !value.includes("@")) {
        return "Please enter a valid email address"
      }
      return undefined
    },
  })

  if (prompts.isCancel(email)) {
    prompts.outro("Setup cancelled")
    process.exit(0)
  }

  // Question 3: Company (optional)
  const company = await prompts.text({
    message: "Which company do you work for? (optional)",
    placeholder: "Acme Inc",
  })

  if (prompts.isCancel(company)) {
    prompts.outro("Setup cancelled")
    process.exit(0)
  }

  // Question 4: Role (optional)
  const role = await prompts.select({
    message: "What's your role?",
    options: [
      { value: "developer", label: "Software Developer" },
      { value: "engineer", label: "Software Engineer" },
      { value: "designer", label: "Designer" },
      { value: "product", label: "Product Manager" },
      { value: "researcher", label: "Researcher" },
      { value: "student", label: "Student" },
      { value: "other", label: "Other" },
    ],
  })

  if (prompts.isCancel(role)) {
    prompts.outro("Setup cancelled")
    process.exit(0)
  }

  // Question 5: Primary use case
  const useCase = await prompts.select({
    message: "What will you primarily use Cerebras for?",
    options: [
      { value: "coding", label: "🔧 Coding & Development" },
      { value: "debugging", label: "🐛 Debugging & Problem Solving" },
      { value: "learning", label: "📚 Learning & Education" },
      { value: "research", label: "🔬 Research & Experimentation" },
      { value: "automation", label: "⚡ Task Automation" },
      { value: "other", label: "💡 Other" },
    ],
  })

  if (prompts.isCancel(useCase)) {
    prompts.outro("Setup cancelled")
    process.exit(0)
  }

  // Create user profile
  const profile: UserProfile = {
    userId: generateUserId(),
    name: name as string,
    email: email as string,
    company: (company as string) || undefined,
    role: role as string,
    createdAt: new Date().toISOString(),
  }

  // Show spinner while saving
  const spinner = prompts.spinner()
  spinner.start("Setting up your profile...")

  // Save locally
  saveUserProfile(profile)

  // Save to DynamoDB (async, don't wait)
  await writeUserToDynamoDB(profile)

  spinner.stop("✓ Profile created!")

  UI.empty()
  prompts.log.success(`Welcome aboard, ${profile.name}! 🎉`)
  prompts.log.info(`User ID: ${profile.userId}`)
  prompts.log.info(`Primary use: ${useCase}`)

  UI.empty()
  prompts.outro("You're all set! Let's start coding.")
  UI.empty()

  return profile
}

/**
 * Ensure user is onboarded (run this at app startup)
 */
export async function ensureOnboarded(): Promise<UserProfile> {
  // Check if user has already completed onboarding
  let profile = loadUserProfile()

  if (!profile) {
    // Run onboarding
    profile = await runOnboarding()
  }

  return profile
}

/**
 * Get current user ID (returns null if not onboarded)
 */
export function getCurrentUserId(): string | null {
  const profile = loadUserProfile()
  return profile?.userId || null
}

/**
 * Reset onboarding (for testing)
 */
export function resetOnboarding(): void {
  const profilePath = getUserProfilePath()
  if (fs.existsSync(profilePath)) {
    fs.unlinkSync(profilePath)
    log.info("Onboarding reset")
  }
}
