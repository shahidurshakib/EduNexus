import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { globalSearch } from '../../api/search'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'

const TYPES = ['all', 'startups', 'research', 'mentors', 'investors']

export default function SearchResults() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const type = params.get('type') || 'all'
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    globalSearch(q, type).then(setResults).finally(() => setLoading(false))
  }, [q, type])

  const groups = results ? Object.entries(results).filter(([, v]) => Array.isArray(v) && v.length) : []

  return (
    <div className="container-page py-12">
      <p className="eyebrow">Search</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Results for "{q}"</h1>

      <div className="mt-6 flex gap-2">
        {TYPES.map((t) => (
          <button key={t} onClick={() => setParams({ q, type: t })} className={type === t ? 'btn-primary !py-2 capitalize' : 'btn-secondary !py-2 capitalize'}>{t}</button>
        ))}
      </div>

      <div className="mt-8">
        {loading ? <Loader /> : groups.length === 0 ? <EmptyState title="No results found" description="Try a different search term." /> : (
          groups.map(([key, list]) => (
            <div key={key} className="mb-10">
              <p className="eyebrow mb-3 capitalize">{key}</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((item) => (
                  <Link key={item.id} to={key === 'startups' ? `/startups/${item.id}` : key === 'research' ? `/research/${item.id}` : '#'} className="card">
                    <p className="font-display text-lg">{item.name || item.title || item.full_name}</p>
                    <p className="mt-1 text-sm text-ink-500 dark:text-ink-400 line-clamp-2">{item.description || item.abstract || item.bio}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
