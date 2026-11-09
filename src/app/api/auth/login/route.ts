import { cookies } from 'next/headers'
import { z } from 'zod'
import { SESSION_COOKIE } from '@/lib/auth'
import { db } from '@/lib/db'
import { toPublicUser } from '@/lib/dto'
import { errorResponse, HttpError } from '@/lib/http'

const LoginBody = z.object({
  email: z.string().trim().toLowerCase(),
  password: z.string(),
})

const invalidCredentials = () =>
  new HttpError(401, 'invalid_credentials', 'Invalid email or password')

export async function POST(request: Request) {
  try {
    const body = LoginBody.safeParse(await request.json().catch(() => null))
    if (!body.success) throw invalidCredentials()

    const { email, password } = body.data
    const user = db.users.find((u) => u.email === email)
    if (!user || user.password !== password || user.status !== 'active')
      throw invalidCredentials()

    const sid = crypto.randomUUID()
    db.sessions.set(sid, user.id)
    ;(await cookies()).set(SESSION_COOKIE, sid, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    })
    return Response.json(toPublicUser(user))
  } catch (error) {
    return errorResponse(error)
  }
}
