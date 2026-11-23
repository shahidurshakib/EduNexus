import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listStartups } from '../../api/startups'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'

const INDUSTRIES = ['', 'AgriTech', 'FinTech', 'HealthTech', 'EdTech', 'CleanTech', 'Other']

export default function StartupList() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(true)
  const limit = 9

  useEffect(() => {
    setLoading(true)
    listStartups({ search: search || undefined, industry: industry || undefined, page, limit })
      .then((data) => { setItems(data.startups || []); setTotal(data.total || 0) })
      .finally(() => setLoading(false))
  }, [search, industry, page])

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Startup directory</p>
          <h1 className="mt-1 font-display text-3xl font-semibold">Ventures on record</h1>
        </div>
        {user && <Link to="/dashboard/startups/new" className="btn-primary">Register a startup</Link>}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          placeholder="Search startups…"
          className="field-input max-w-xs"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value) }}
        />
        <select className="field-input max-w-[180px]" value={industry} onChange={(e) => { setPage(1); setIndustry(e.target.value) }}>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i || 'All industries'}</option>)}
        </select>
      </div>

      <div className="mt-8">
        {loading ? <Loader /> : items.length === 0 ? (
          <EmptyState title="No startups match yet" description="Try a different search or industry filter." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <Link key={s.id} to={`/startups/${s.id}`} className="card transition-transform hover:-translate-y-0.5">
                <div className="flex items-start justify-between">
                  <p className="font-display text-xl">{s.name}</p>
                  {s.stage && <Badge status={s.stage} />}
                </div>
                <p className="mt-1 text-xs text-ink-400">{s.industry} · {s.location}</p>
                <p className="mt-3 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">{s.description}</p>
                {s.funding_needed != null && (
                  <p className="mt-4 font-mono text-xs text-gold-600">seeking ${Number(s.funding_needed).toLocaleString()}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Pagination page={page} limit={limit} total={total} onChange={setPage} />
    </div>
  )
}
