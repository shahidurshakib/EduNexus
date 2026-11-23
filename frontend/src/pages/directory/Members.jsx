import { useEffect, useState } from 'react'
import { listMembers } from '../../api/users'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'

export default function Members() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const limit = 9

  useEffect(() => {
    setLoading(true)
    listMembers({ search: search || undefined, page, limit })
      .then((data) => { setItems(data.members || []); setTotal(data.total || 0) })
      .finally(() => setLoading(false))
  }, [search, page])

  return (
    <div className="container-page py-12">
      <p className="eyebrow">Member directory</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Registered members</h1>
      <p className="mt-2 max-w-xl text-sm text-ink-500 dark:text-ink-400">
        Browse who's building on EduNexus. To collaborate, visit the Mentors or Investors directory and send a
        request from there.
      </p>
      <input placeholder="Search by name or organization…" className="field-input mt-6 max-w-xs" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value) }} />

      <div className="mt-8">
        {loading ? <Loader /> : items.length === 0 ? (
          <EmptyState title="No members listed yet" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => (
              <div key={m.id} className="card">
                <p className="font-display text-lg">{m.full_name}</p>
                <p className="mt-1 text-xs text-ink-400">{m.organization}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Pagination page={page} limit={limit} total={total} onChange={setPage} />
    </div>
  )
}
