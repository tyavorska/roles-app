import { redirect } from 'next/navigation'
import { LANDING_PAGE } from '@/lib/access'
import { getCurrentUser } from '@/lib/auth'

export const instant = false

export default async function Home() {
  const user = await getCurrentUser()
  redirect(user ? LANDING_PAGE[user.role] : '/login')
}
