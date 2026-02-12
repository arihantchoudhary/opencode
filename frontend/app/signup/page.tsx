"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signup } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import AuthForm from "@/components/AuthForm"
import Navbar from "@/components/Navbar"

export default function SignupPage() {
  const [error, setError] = useState("")
  const router = useRouter()
  const { setUser } = useAuth()

  async function handleSignup({ email, name }: { email: string; name?: string }) {
    setError("")
    try {
      const user = await signup({ email, name: name || "" })
      setUser(user)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="flex min-h-screen items-center justify-center px-6 pt-16">
        <div className="w-full max-w-sm">
          <h1 className="mb-2 text-2xl font-bold tracking-tight">
            Create your <span className="gradient-text">account</span>
          </h1>
          <p className="mb-8 text-sm text-zinc-500">
            Get started with Stardrop in seconds.
          </p>
          <AuthForm mode="signup" onSubmit={handleSignup} error={error} />
          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
