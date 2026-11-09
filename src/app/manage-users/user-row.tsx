'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ROLES, STATUSES } from '@/lib/access'
import type { PublicUser } from '@/lib/dto'

type Allowed = { profile: boolean; role: boolean; status: boolean }

export function UserRow({
  target,
  allowed,
}: {
  target: PublicUser
  allowed: Allowed
}) {
  const router = useRouter()
  const [draft, setDraft] = useState(target)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canEditAnything = allowed.profile || allowed.role || allowed.status

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const patch = Object.fromEntries(
      (['fullName', 'email', 'role', 'status'] as const)
        .filter((key) => draft[key] !== target[key])
        .map((key) => [key, draft[key]]),
    )
    if (Object.keys(patch).length === 0) return

    setPending(true)
    setError(null)
    try {
      const res = await fetch(`/api/users/${target.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (res.status === 401) {
        router.replace('/login')
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.error?.message ?? `Save failed (${res.status})`)
        return
      }
      router.refresh()
    } catch {
      setError('Network error, try again')
    } finally {
      setPending(false)
    }
  }

  const formId = `edit-${target.id}`
  return (
    <tr>
      <td>
        <input
          form={formId}
          aria-label='Full name'
          value={draft.fullName}
          disabled={!allowed.profile}
          onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
        />
      </td>
      <td>
        <input
          form={formId}
          aria-label='Email'
          type='email'
          value={draft.email}
          disabled={!allowed.profile}
          onChange={(e) => setDraft({ ...draft, email: e.target.value })}
        />
      </td>
      <td>
        {allowed.role ? (
          <select
            form={formId}
            aria-label='Role'
            value={draft.role}
            onChange={(e) =>
              setDraft({ ...draft, role: e.target.value as PublicUser['role'] })
            }
          >
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        ) : (
          target.role
        )}
      </td>
      <td>
        {allowed.status ? (
          <select
            form={formId}
            aria-label='Status'
            value={draft.status}
            onChange={(e) =>
              setDraft({
                ...draft,
                status: e.target.value as PublicUser['status'],
              })
            }
          >
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        ) : (
          target.status
        )}
      </td>
      <td>{target.managerId ?? '—'}</td>
      <td>
        {canEditAnything && (
          <form id={formId} onSubmit={save}>
            <button type='submit' disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </button>
          </form>
        )}
        {error && <p role='alert'>{error}</p>}
      </td>
    </tr>
  )
}
