import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { getClient } from '@/lib/clients.service'
import { HttpError } from '@/lib/http'
import { requirePagePermission } from '@/lib/page-guards'
import type { Client } from '@/lib/types'

export const instant = false

export default async function ClientPage({
  params,
}: PageProps<'/content/client/[id]'>) {
  const user = await requirePagePermission('content:view')
  const { id } = await params

  let client: Client | null = null
  try {
    client = getClient(user, id)
  } catch (error) {
    if (!(error instanceof HttpError && error.status === 404)) throw error
  }
  if (!client) notFound()

  return (
    <main>
      <Header user={user} />
      <p>
        <Link href='/content'>← All clients</Link>
      </p>
      <h1>{client.name}</h1>
      <dl>
        <dt>ID</dt>
        <dd>{client.id}</dd>
        <dt>Company</dt>
        <dd>{client.company}</dd>
        <dt>Email</dt>
        <dd>{client.email}</dd>
        <dt>Country</dt>
        <dd>{client.country}</dd>
        <dt>Status</dt>
        <dd>{client.status}</dd>
        <dt>Created</dt>
        <dd>{client.createdAt.slice(0, 10)}</dd>
      </dl>
    </main>
  )
}
