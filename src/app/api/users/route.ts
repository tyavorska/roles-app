import { requireUser } from '@/lib/auth'
import { route } from '@/lib/http'
import { UserCreateSchema } from '@/lib/schemas'
import { createUser, listUsersFor } from '@/lib/users.service'

export const GET = route(async () => {
  const user = await requireUser()
  return Response.json(listUsersFor(user))
})

export const POST = route(async (request) => {
  const user = await requireUser()
  const input = UserCreateSchema.parse(await request.json())
  return Response.json(createUser(user, input), { status: 201 })
})
