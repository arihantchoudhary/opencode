"use client"

import { useEffect, useState } from "react"
import { listUsers, getDailyActivity, type User, type DailyActivity } from "@/lib/api"
import UserTable from "./UserTable"
import ActivityChart from "./ActivityChart"

export default function CommunityStats() {
  const [users, setUsers] = useState<User[]>([])
  const [activity, setActivity] = useState<DailyActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([listUsers(), getDailyActivity()])
      .then(([u, a]) => {
        setUsers(u)
        setActivity(a)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-zinc-500">Loading community data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Activity chart */}
      <ActivityChart data={activity} />

      {/* Users table */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-300">Registered Users</h3>
          <span className="text-sm text-zinc-600">{users.length} total</span>
        </div>
        <UserTable users={users} />
      </div>
    </div>
  )
}
