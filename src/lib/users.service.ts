import 'server-only'
import { can, type Permission } from './access'
import { db } from './db'
import { toPublicUser, type PublicUser } from './dto'
import { HttpError } from './http'
import type { UserCreate, UserPatch } from './schemas'
import type { User } from './types'

const FIELD_PERMISSION = {
  fullName: 'user:edit-profile',
  email: 'user:edit-profile',
  role: 'user:change-role',
  status: 'user:change-status',
} as const satisfies Record<keyof UserPatch, Permission>

const emailTaken = (email: string, exceptId?: string) =>
  db.users.some((u) => u.id !== exceptId && u.email === email)

export function listUsersFor(user: User): PublicUser[] {
  if (can(user, 'user:list-all')) return db.users.map(toPublicUser)
  if (can(user, 'user:list-reports'))
    return db.users.filter((u) => u.managerId === user.id).map(toPublicUser)
  throw new HttpError(403, 'forbidden')
}

export function createUser(user: User, input: UserCreate): PublicUser {
  if (!can(user, 'user:create')) throw new HttpError(403, 'forbidden')
  if (emailTaken(input.email)) throw new HttpError(409, 'email_taken')
  if (
    input.managerId !== null &&
    !db.users.some((u) => u.id === input.managerId)
  )
    throw new HttpError(400, 'invalid_manager')

  const created: User = {
    ...input,
    id: crypto.randomUUID(),
    status: 'active',
    createdAt: new Date().toISOString(),
  }
  db.users.push(created)
  return toPublicUser(created)
}

export function updateUser(
  user: User,
  targetId: string,
  patch: UserPatch,
): PublicUser {
  const target = db.users.find((u) => u.id === targetId)
  if (!target) {
    throw can(user, 'user:list-all')
      ? new HttpError(404, 'not_found')
      : new HttpError(403, 'forbidden')
  }
  for (const field of Object.keys(patch) as (keyof UserPatch)[]) {
    if (!can(user, FIELD_PERMISSION[field], target))
      throw new HttpError(403, 'forbidden', `Cannot change ${field}`)
  }
  if (patch.email && emailTaken(patch.email, target.id))
    throw new HttpError(409, 'email_taken')
  const demotes = patch.role !== undefined && patch.role !== target.role
  if (user.id === target.id && (demotes || patch.status === 'deactivated'))
    throw new HttpError(403, 'self_change')
  const next = { ...target, ...patch }
  const activeAdmins = db.users
    .map((u) => (u.id === target.id ? next : u))
    .filter((u) => can(u, 'user:change-role')).length
  if (activeAdmins === 0) throw new HttpError(409, 'last_active_it')
  Object.assign(target, patch)
  return toPublicUser(target)
}
