import { useEffect, useState } from 'react'
import { listMentors } from '../../api/users'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
<<<<<<< HEAD
import ApplyModal from '../../components/applications/ApplyModal'
import { useAuth } from '../../context/AuthContext'

export default function Mentors() {
  const { user } = useAuth()
=======

export default function Mentors() {
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
<<<<<<< HEAD
  const [target, setTarget] = useState(null) // { id, name }
=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
  const limit = 9

  useEffect(() => {
    setLoading(true)
    listMentors({ search: search || undefined, page, limit })
      .then((data) => { setItems(data.mentors || []); setTotal(data.total || 0) })
      .finally(() => setLoading(false))
  }, [search, page])

<<<<<<< HEAD
  const isMentorThemselves = (m) => user && m.user_id === user.id

=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
  return (
    <div className="container-page py-12">
      <p className="eyebrow">Mentor directory</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Approved mentors</h1>
<<<<<<< HEAD
      <p className="mt-2 max-w-xl text-sm text-ink-500 dark:text-ink-400">
        Browse a profile and send a collaboration request — it goes through the same pending → approved / revised
        review as everywhere else on EduNexus.
      </p>
=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
      <input placeholder="Search by expertise…" className="field-input mt-6 max-w-xs" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value) }} />

      <div className="mt-8">
        {loading ? <Loader /> : items.length === 0 ? (
          <EmptyState title="No mentors listed yet" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => (
              <div key={m.id} className="card">
                <p className="font-display text-lg">{m.full_name}</p>
                <p className="mt-1 text-xs text-ink-400">{m.expertise}</p>
                <p className="mt-3 line-clamp-3 text-sm text-ink-500 dark:text-ink-400">{m.bio}</p>
                {m.linkedin_url && <a href={m.linkedin_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-medium text-gold-600 hover:underline">LinkedIn ↗</a>}
<<<<<<< HEAD
                {!isMentorThemselves(m) && (
                  <button
                    onClick={() => setTarget({ id: m.id, name: m.full_name })}
                    className="btn-secondary mt-4 w-full"
                  >
                    Send collaboration request
                  </button>
                )}
=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
              </div>
            ))}
          </div>
        )}
      </div>
      <Pagination page={page} limit={limit} total={total} onChange={setPage} />
<<<<<<< HEAD

      <ApplyModal
        open={!!target}
        onClose={() => setTarget(null)}
        targetType="mentor"
        targetId={target?.id}
        targetLabel={target?.name}
      />
=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
    </div>
  )
}
