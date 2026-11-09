import 'server-only'
import { cookies } from 'next/headers'
import { db } from './db'
import { HttpError } from './http'
import { SESSION_COOKIE } from './session-cookie'
import type { User } from './types'

export { SESSION_COOKIE }

export function resolveSession(sid: string | undefined): User | null {
  const userId = sid ? db.sessions.get(sid) : undefined
  const user = userId ? db.users.find((u) => u.id === userId) : undefined
  return user && user.status === 'active' ? user : null
}

export async function getCurrentUser(): Promise<User | null> {
  return resolveSession((await cookies()).get(SESSION_COOKIE)?.value)
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) throw new HttpError(401, 'unauthenticated', 'Sign in required')
  return user
}
