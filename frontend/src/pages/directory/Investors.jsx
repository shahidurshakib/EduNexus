
import { useEffect, useState } from 'react'
import { listInvestors } from '../../api/users'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import ApplyModal from '../../components/applications/ApplyModal'
import { useAuth } from '../../context/AuthContext'

export default function Investors() {
  const { user } = useAuth()

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [target, setTarget] = useState(null)

  const limit = 9

  useEffect(() => {
    setLoading(true)
    listInvestors({ search: search || undefined, page, limit })
      .then((data) => {
        setItems(data.investors || [])
        setTotal(data.total || 0)
      })
      .finally(() => setLoading(false))
  }, [search, page])

  const isInvestorThemselves = (iv) =>
    user && String(iv.user_id) === String(user.id)

  return (
    <div className="container-page py-12">
      <p className="eyebrow">Investor directory</p>

      <h1 className="mt-1 font-display text-3xl font-semibold">
        Approved investors
      </h1>

      <p className="mt-2 max-w-xl text-sm text-ink-500 dark:text-ink-400">
        Mentors and members can send a proposal directly to an investor.
        It moves through pending, approved, or revised status.
      </p>

      <input
        placeholder="Search by focus..."
        className="field-input mt-6 max-w-xs"
        value={search}
        onChange={(e) => {
          setPage(1)
          setSearch(e.target.value)
        }}
      />

      <div className="mt-8">
        {loading ? (
          <Loader />
        ) : items.length === 0 ? (
          <EmptyState title="No investors listed yet" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((iv) => (
              <div key={iv.id} className="card">
                <p className="font-display text-lg">{iv.full_name}</p>

                <p className="mt-1 text-xs text-ink-400">
                  {iv.investment_focus || iv.investmentFocus}
                </p>

                <p className="mt-3 line-clamp-3 text-sm text-ink-500 dark:text-ink-400">
                  {iv.bio}
                </p>

                {(iv.min_ticket_size || iv.max_ticket_size) && (
                  <p className="mt-3 font-mono text-xs text-gold-600">
                    ${Number(iv.min_ticket_size || 0).toLocaleString()} – $
                    {Number(iv.max_ticket_size || 0).toLocaleString()}
                  </p>
                )}

                {!isInvestorThemselves(iv) && (
                  <button
                    onClick={() =>
                      setTarget({ id: iv.id, name: iv.full_name })
                    }
                    className="btn-secondary mt-4 w-full"
                  >
                    Send request / proposal
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Pagination
        page={page}
        limit={limit}
        total={total}
        onChange={setPage}
      />

      <ApplyModal
        open={!!target}
        onClose={() => setTarget(null)}
        targetType="investor"
        targetId={target?.id}
        targetLabel={target?.name}
        allowLock
      />
    </div>
  )
}
