import { forbidden } from 'next/navigation'
import { Header } from '@/components/header'
import { can, canManageUsers } from '@/lib/access'
import { requirePageUser } from '@/lib/page-guards'
import { listUsersFor } from '@/lib/users.service'
import { CreateUserForm } from './create-user-form'
import { UserRow } from './user-row'

export const instant = false

export default async function ManageUsersPage() {
  const user = await requirePageUser()
  if (!canManageUsers(user)) forbidden()
  const users = listUsersFor(user)

  return (
    <main>
      <Header user={user} />
      <h1>Users</h1>
      {can(user, 'user:create') && (
        <section>
          <h2>Create user</h2>
          <CreateUserForm
            managers={users
              .filter((u) => can(u, 'user:list-reports'))
              .map(({ id, fullName }) => ({ id, fullName }))}
          />
        </section>
      )}
      {users.length === 0 ? (
        <p>You have no direct reports yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Manager</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((target) => (
              <UserRow
                key={target.id}
                target={target}
                allowed={{
                  profile: can(user, 'user:edit-profile', target),
                  role: can(user, 'user:change-role', target),
                  status: can(user, 'user:change-status', target),
                }}
              />
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
