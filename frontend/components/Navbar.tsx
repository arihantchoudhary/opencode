"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth"

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="gradient-text">Stardrop</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
            <a href="/#pricing" className="transition-colors hover:text-white">Pricing</a>
            <a href="/#docs" className="transition-colors hover:text-white">Docs</a>
            <a href="/#blog" className="transition-colors hover:text-white">Blog</a>
            <a href="/#careers" className="transition-colors hover:text-white">Careers</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-zinc-400 transition-colors hover:text-white">
                Dashboard
              </Link>
              <span className="text-sm text-zinc-500">{user.name}</span>
              <button
                onClick={logout}
                className="text-sm text-zinc-500 transition-colors hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm text-zinc-400 transition-colors hover:text-white sm:block">
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
