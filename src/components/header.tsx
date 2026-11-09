import Link from 'next/link'
import { can, canManageUsers } from '@/lib/access'
import type { User } from '@/lib/types'
import { LogoutButton } from './logout-button'

export function Header({ user }: { user: User }) {
  return (
    <header style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.5rem 0' }}>
      {can(user, 'content:view') && <Link href="/content">Clients</Link>}
      {can(user, 'content:view') && <Link href="/content/me">My profile</Link>}
      {canManageUsers(user) && <Link href="/manage-users">Manage users</Link>}
      <span style={{ marginLeft: 'auto' }}>
        {user.fullName} ({user.role})
      </span>
      <LogoutButton />
    </header>
  )
}
