import { requireUser } from '@/lib/auth'
import { route } from '@/lib/http'
import { UserPatchSchema } from '@/lib/schemas'
import { updateUser } from '@/lib/users.service'

export const PATCH = route<RouteContext<'/api/users/[id]'>>(
  async (request, { params }) => {
    const user = await requireUser()
    const { id } = await params
    const patch = UserPatchSchema.parse(await request.json())
    return Response.json(updateUser(user, id, patch))
  },
)
