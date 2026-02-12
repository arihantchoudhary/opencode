"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { login } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import AuthForm from "@/components/AuthForm"
import Navbar from "@/components/Navbar"

export default function LoginPage() {
  const [error, setError] = useState("")
  const router = useRouter()
  const { setUser } = useAuth()

  async function handleLogin({ email }: { email: string }) {
    setError("")
    try {
      const user = await login(email)
      setUser(user)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="flex min-h-screen items-center justify-center px-6 pt-16">
        <div className="w-full max-w-sm">
          <h1 className="mb-2 text-2xl font-bold tracking-tight">
            Welcome <span className="gradient-text">back</span>
          </h1>
          <p className="mb-8 text-sm text-zinc-500">
            Log in to your Stardrop account.
          </p>
          <AuthForm mode="login" onSubmit={handleLogin} error={error} />
          <p className="mt-6 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-violet-400 hover:text-violet-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
