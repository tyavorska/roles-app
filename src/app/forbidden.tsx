import Link from 'next/link'

export default function Forbidden() {
  return (
    <main>
      <h1>403: Forbidden</h1>
      <p>Your role does not have access to this page.</p>
      <Link href='/'>Go to your start page</Link>
    </main>
  )
}
