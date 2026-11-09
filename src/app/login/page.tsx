'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LANDING_PAGE } from '@/lib/access'
import type { PublicUser } from '@/lib/dto'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError(null)
    const form = new FormData(event.currentTarget)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
      })
      if (!res.ok) {
        setError(
          res.status === 401
            ? 'Invalid email or password'
            : 'Something went wrong, try again',
        )
        return
      }
      const user: PublicUser = await res.json()
      router.replace(LANDING_PAGE[user.role])
    } catch {
      setError('Network error, try again')
    } finally {
      setPending(false)
    }
  }

  return (
    <main>
      <h1>Sign in</h1>
      <form onSubmit={onSubmit}>
        <label>
          Email{' '}
          <input name='email' type='email' autoComplete='username' required />
        </label>
        <label>
          Password{' '}
          <input
            name='password'
            type='password'
            autoComplete='current-password'
            required
          />
        </label>
        <button type='submit' disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
        {error && <p role='alert'>{error}</p>}
      </form>
    </main>
  )
}
