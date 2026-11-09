export const ROLES = ['IT', 'manager', 'user'] as const
export type Role = (typeof ROLES)[number]

export type Permission =
  | 'user:create'
  | 'user:edit-profile'
  | 'user:change-role'
  | 'user:change-status'
  | 'user:list-all'
  | 'user:list-reports'
  | 'content:view'

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  IT: [
    'user:create',
    'user:edit-profile',
    'user:change-role',
    'user:change-status',
    'user:list-all',
  ],
  manager: ['user:edit-profile', 'user:list-reports', 'content:view'],
  user: ['content:view'],
}

export const LANDING_PAGE: Record<Role, string> = {
  IT: '/manage-users',
  manager: '/content',
  user: '/content',
}

export const STATUSES = ['active', 'deactivated'] as const
export type Status = (typeof STATUSES)[number]

export type AccessUser = {
  id: string
  role: Role
  status: Status
}
export type Target = { id: string; managerId: string | null }

export function can(
  user: AccessUser,
  permission: Permission,
  target?: Target,
): boolean {
  if (user.status !== 'active') return false
  if (!ROLE_PERMISSIONS[user.role].includes(permission)) return false
  // A manager edits only their own direct reports, never themselves.
  if (user.role === 'manager' && permission === 'user:edit-profile') {
    return target?.managerId === user.id && target.id !== user.id
  }
  return true
}

export const canManageUsers = (user: AccessUser) =>
  can(user, 'user:list-all') || can(user, 'user:list-reports')

export function assertNever(x: never): never {
  throw new Error(`Unhandled: ${String(x)}`)
}
