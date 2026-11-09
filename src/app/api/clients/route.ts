import { requireUser } from '@/lib/auth'
import { listClients } from '@/lib/clients.service'
import { route } from '@/lib/http'
import { PageQuerySchema } from '@/lib/schemas'

export const GET = route(async (request) => {
  const user = await requireUser()
  const query = PageQuerySchema.parse(
    Object.fromEntries(new URL(request.url).searchParams),
  )
  return Response.json(listClients(user, query))
})
