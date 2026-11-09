import 'server-only'
import { forbidden, redirect } from 'next/navigation'
import { can, type Permission } from './access'
import { getCurrentUser } from './auth'
import type { User } from './types'

export async function requirePageUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function requirePagePermission(
  permission: Permission,
): Promise<User> {
  const user = await requirePageUser()
  if (!can(user, permission)) forbidden()
  return user
}
