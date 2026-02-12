"use client"

import type { User } from "@/lib/api"

export default function UserTable({ users }: { users: User[] }) {
  if (users.length === 0) {
    return <p className="text-sm text-zinc-500">No users yet.</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/5 bg-white/[0.02]">
          <tr>
            <th className="px-4 py-3 font-medium text-zinc-400">Name</th>
            <th className="px-4 py-3 font-medium text-zinc-400">Email</th>
            <th className="hidden px-4 py-3 font-medium text-zinc-400 sm:table-cell">Source</th>
            <th className="hidden px-4 py-3 font-medium text-zinc-400 md:table-cell">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {users.map((user) => (
            <tr key={user.user_id} className="transition-colors hover:bg-white/[0.02]">
              <td className="px-4 py-3 text-white">{user.name}</td>
              <td className="px-4 py-3 text-zinc-400">{user.email}</td>
              <td className="hidden px-4 py-3 text-zinc-500 sm:table-cell">{user.signup_source}</td>
              <td className="hidden px-4 py-3 text-zinc-500 md:table-cell">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
