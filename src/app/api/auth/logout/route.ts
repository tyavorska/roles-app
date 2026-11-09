import { cookies } from 'next/headers'
import { SESSION_COOKIE } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST() {
  const cookieStore = await cookies()
  const sid = cookieStore.get(SESSION_COOKIE)?.value
  if (sid) db.sessions.delete(sid)
  cookieStore.delete(SESSION_COOKIE)
  return new Response(null, { status: 204 })
}
