import 'server-only'
import type { Role, Status } from './access'
import type { Client, User } from './types'

const SEED_PASSWORD = 'password'
const SEED_CREATED_AT = '2026-01-01T00:00:00.000Z'

function seedUser(
  id: string,
  fullName: string,
  role: Role,
  status: Status,
  managerId: string | null,
): User {
  return {
    id,
    fullName,
    email: `${id}@example.com`,
    password: SEED_PASSWORD,
    role,
    status,
    managerId,
    createdAt: SEED_CREATED_AT,
  }
}

export function seedUsers(): User[] {
  return [
    seedUser('it1', 'Ivy Turner', 'IT', 'active', null),
    seedUser('it2', 'Isaac Tran', 'IT', 'active', null),
    seedUser('manager1', 'Maya Novak', 'manager', 'active', null),
    seedUser('manager2', 'Marco Silva', 'manager', 'active', null),
    seedUser('manager3', 'Mira Holm', 'manager', 'deactivated', null),
    seedUser('user1', 'Uma Patel', 'user', 'active', 'manager1'),
    seedUser('user2', 'Ugo Rossi', 'user', 'active', 'manager1'),
    seedUser('user3', 'Una Berg', 'user', 'deactivated', 'manager1'),
    seedUser('user4', 'Uri Cohen', 'user', 'active', 'manager3'),
    seedUser('user5', 'Ulla Lind', 'user', 'active', null),
  ]
}

// mulberry32: tiny deterministic PRNG, so clients are identical on every restart.
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST_NAMES = [
  'Anna',
  'Ben',
  'Clara',
  'David',
  'Elena',
  'Felix',
  'Grace',
  'Hugo',
]
const LAST_NAMES = [
  'Andersen',
  'Brown',
  'Costa',
  'Dubois',
  'Garcia',
  'Hansen',
  'Meyer',
  'Weber',
]
const COMPANY_WORDS = [
  'North',
  'Blue',
  'Iron',
  'Cloud',
  'Delta',
  'Nova',
  'Peak',
  'River',
]
const COUNTRIES = [
  'Denmark',
  'Sweden',
  'Germany',
  'France',
  'Spain',
  'Poland',
  'United States',
]

const NOW = Date.parse('2026-11-01')
const THREE_YEARS = 3 * 365 * 24 * 60 * 60 * 1000

export function seedClients(): Client[] {
  const rng = mulberry32(42)
  const pick = (list: string[]) => list[Math.floor(rng() * list.length)]

  return Array.from({ length: 1200 }, (_, i) => {
    const id = `c-${String(i + 1).padStart(4, '0')}`
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
    return {
      id,
      name,
      company: `${pick(COMPANY_WORDS)} Ltd`,
      email: `${id}@example.com`,
      country: pick(COUNTRIES),
      status: rng() < 0.3 ? 'churned' : 'active',
      createdAt: new Date(NOW - rng() * THREE_YEARS).toISOString(),
    }
  })
}
