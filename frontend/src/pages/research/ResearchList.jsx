import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listResearch } from '../../api/research'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'

export default function ResearchList() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(true)
  const limit = 9

  useEffect(() => {
    setLoading(true)
    listResearch({ search: search || undefined, department: department || undefined, page, limit })
      .then((data) => { setItems(data.research || data.records || []); setTotal(data.total || 0) })
      .finally(() => setLoading(false))
  }, [search, department, page])

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Research archive</p>
          <h1 className="mt-1 font-display text-3xl font-semibold">Studies on record</h1>
        </div>
        {user && <Link to="/dashboard/research/new" className="btn-primary">Log research</Link>}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input placeholder="Search research…" className="field-input max-w-xs" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value) }} />
        <input placeholder="Department" className="field-input max-w-[180px]" value={department} onChange={(e) => { setPage(1); setDepartment(e.target.value) }} />
      </div>

      <div className="mt-8">
        {loading ? <Loader /> : items.length === 0 ? (
          <EmptyState title="No research records match yet" description="Try a different search or department." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((r) => (
              <Link key={r.id} to={`/research/${r.id}`} className="card transition-transform hover:-translate-y-0.5">
                <p className="eyebrow">{r.department}</p>
                <p className="mt-1 font-display text-lg leading-snug">{r.title}</p>
                <p className="mt-3 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">{r.abstract}</p>
                <div className="mt-4 flex gap-2">
                  <Badge status={r.publication_status || r.publicationStatus} />
                  {(r.patent_status || r.patentStatus) && (r.patent_status || r.patentStatus) !== 'none' && <Badge status={r.patent_status || r.patentStatus} />}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Pagination page={page} limit={limit} total={total} onChange={setPage} />
    </div>
  )
}
