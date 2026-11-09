'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ROLES } from '@/lib/access'

type ManagerOption = { id: string; fullName: string }

export function CreateUserForm({ managers }: { managers: ManagerOption[] }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const formEl = event.currentTarget
    const form = new FormData(formEl)
    const managerId = form.get('managerId')

    setPending(true)
    setError(null)
    setCreated(null)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.get('fullName'),
          email: form.get('email'),
          password: form.get('password'),
          role: form.get('role'),
          managerId: managerId ? managerId : null,
        }),
      })
      if (res.status === 401) {
        router.replace('/login')
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.error?.message ?? `Create failed (${res.status})`)
        return
      }
      const user: { fullName: string } = await res.json()
      setCreated(user.fullName)
      formEl.reset()
      router.refresh()
    } catch {
      setError('Network error, try again')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '1rem 0' }}>
      <input name="fullName" placeholder="Full name" aria-label="Full name" required />
      <input name="email" type="email" placeholder="Email" aria-label="Email" required />
      <input name="password" type="password" placeholder="Password" aria-label="Password" required />
      <select name="role" aria-label="Role" defaultValue={ROLES[ROLES.length - 1]}>
        {ROLES.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <select name="managerId" aria-label="Manager" defaultValue="">
        <option value="">No manager</option>
        {managers.map((m) => (
          <option key={m.id} value={m.id}>
            {m.fullName}
          </option>
        ))}
      </select>
      <button type="submit" disabled={pending}>
        {pending ? 'Creating…' : 'Create user'}
      </button>
      {error && <p role="alert">{error}</p>}
      {created && <p role="status">Created {created}.</p>}
    </form>
  )
}
