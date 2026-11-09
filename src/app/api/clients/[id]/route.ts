import { requireUser } from '@/lib/auth'
import { getClient } from '@/lib/clients.service'
import { route } from '@/lib/http'

export const GET = route<RouteContext<'/api/clients/[id]'>>(
  async (_request, { params }) => {
    const user = await requireUser()
    const { id } = await params
    return Response.json(getClient(user, id))
  },
)
