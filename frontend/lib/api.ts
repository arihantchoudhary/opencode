const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }))
    throw new Error(error.detail || response.statusText)
  }

  if (response.status === 204) return null as T
  return response.json()
}

export type User = {
  user_id: string
  email: string
  name: string
  avatar_url?: string
  bio?: string
  created_at: string
  updated_at: string
  auth_provider: string
  signup_source: string
  reference?: string
  last_login?: string
}

export type DailyActivity = {
  date: string
  count: number
}

export function signup(data: { email: string; name: string }) {
  return request<User>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ ...data, signup_source: "web" }),
  })
}

export function login(email: string) {
  return request<User>(`/auth/login?email=${encodeURIComponent(email)}`, {
    method: "POST",
  })
}

export function getUser(id: string) {
  return request<User>(`/users/${id}`)
}

export function updateUser(id: string, data: { name?: string; bio?: string; avatar_url?: string }) {
  return request<User>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function deleteUser(id: string) {
  return request<null>(`/users/${id}`, { method: "DELETE" })
}

export function listUsers(limit = 50) {
  return request<User[]>(`/users/?limit=${limit}`)
}

export function getDailyActivity() {
  return request<DailyActivity[]>("/users/stats/daily")
}
