import Link from 'next/link'
import { Header } from '@/components/header'
import { listClients } from '@/lib/clients.service'
import { requirePagePermission } from '@/lib/page-guards'
import { PageQuerySchema } from '@/lib/schemas'

export const instant = false

export default async function ContentPage({
  searchParams,
}: PageProps<'/content'>) {
  const user = await requirePagePermission('content:view')
  const parsed = PageQuerySchema.safeParse(await searchParams)
  const query = parsed.success ? parsed.data : PageQuerySchema.parse({})

  const { items, page, totalPages, total } = listClients(user, query)

  return (
    <main>
      <Header user={user} />
      <h1>Clients</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Company</th>
            <th>Email</th>
            <th>Country</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td>
                <Link href={`/content/client/${c.id}`}>{c.id}</Link>
              </td>
              <td>{c.name}</td>
              <td>{c.company}</td>
              <td>{c.email}</td>
              <td>{c.country}</td>
              <td>{c.status}</td>
              <td>{c.createdAt.slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <p>No clients on this page.</p>}
      <nav style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        {page > 1 ? (
          <Link href={`?page=${Math.min(page - 1, totalPages)}`}>Prev</Link>
        ) : (
          <span>Prev</span>
        )}
        <span>
          Page {page} of {totalPages}, {total} clients total
        </span>
        {page < totalPages ? (
          <Link href={`?page=${page + 1}`}>Next</Link>
        ) : (
          <span>Next</span>
        )}
      </nav>
    </main>
  )
}
