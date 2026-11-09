import { redirect } from 'next/navigation'
import { LANDING_PAGE } from '@/lib/access'
import { getCurrentUser } from '@/lib/auth'
import { LoginForm } from './login-form'

export const instant = false

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) redirect(LANDING_PAGE[user.role])

  return (
    <main>
      <h1>Sign in</h1>
      <LoginForm />
    </main>
  )
}
