import 'server-only'
import { seedClients, seedUsers } from './seed'
import type { Client, User } from './types'

type Db = { users: User[]; clients: Client[] }

// Keep one instance across dev hot reloads; data resets when the server restarts.
const globalForDb = globalThis as unknown as { db?: Db }

export const db: Db = (globalForDb.db ??= {
  users: seedUsers(),
  clients: seedClients(),
})
