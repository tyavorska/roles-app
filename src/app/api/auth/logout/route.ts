import { cookies } from 'next/headers'
import { SESSION_COOKIE } from '@/lib/auth'
import { db } from '@/lib/db'
import { route } from '@/lib/http'

export const POST = route(async () => {
  const cookieStore = await cookies()
  const sid = cookieStore.get(SESSION_COOKIE)?.value
  if (sid) db.sessions.delete(sid)
  cookieStore.delete(SESSION_COOKIE)
  return new Response(null, { status: 204 })
})
