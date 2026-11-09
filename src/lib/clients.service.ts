import 'server-only'
import { can } from './access'
import { db } from './db'
import { HttpError } from './http'
import type { PageQuery } from './schemas'
import type { Client, User } from './types'

export type ClientPage = {
  items: Client[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export function listClients(user: User, query: PageQuery): ClientPage {
  if (!can(user, 'content:view')) throw new HttpError(403, 'forbidden')
  const total = db.clients.length
  const start = (query.page - 1) * query.limit
  return {
    items: db.clients.slice(start, start + query.limit),
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  }
}

export function getClient(user: User, id: string): Client {
  if (!can(user, 'content:view')) throw new HttpError(403, 'forbidden')

  const client = db.clients.find((c) => c.id === id)
  if (!client) throw new HttpError(404, 'not_found')

  return client
}
