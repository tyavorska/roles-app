import { Header } from '@/components/header'
import { toPublicUser } from '@/lib/dto'
import { requirePagePermission } from '@/lib/page-guards'

export const instant = false

export default async function MePage() {
  const user = await requirePagePermission('content:view')
  const me = toPublicUser(user)

  return (
    <main>
      <Header user={user} />
      <h1>My profile</h1>
      <dl>
        <dt>Name</dt>
        <dd>{me.fullName}</dd>
        <dt>Email</dt>
        <dd>{me.email}</dd>
        <dt>Role</dt>
        <dd>{me.role}</dd>
        <dt>Status</dt>
        <dd>{me.status}</dd>
        <dt>Manager</dt>
        <dd>{me.managerId ?? 'None'}</dd>
        <dt>Member since</dt>
        <dd>{me.createdAt.slice(0, 10)}</dd>
      </dl>
    </main>
  )
}
