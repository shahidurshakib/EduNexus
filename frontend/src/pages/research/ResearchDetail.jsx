import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getResearch, deleteResearch } from '../../api/research'
import Loader from '../../components/ui/Loader'
import ErrorBanner from '../../components/ui/ErrorBanner'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'

export default function ResearchDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { getResearch(id).then(setData).catch((e) => setError(e.message)) }, [id])

  if (error) return <div className="container-page py-16"><ErrorBanner message={error} /></div>
  if (!data) return <Loader />

  const research = data.research || data
  const authors = data.authors || []
  const patents = data.patents || []
  const canManage = user && (user.role === 'admin' || user.role === 'platform_founder' || research.created_by === user.id)

  const onDelete = async () => {
    if (!confirm('Delete this research record?')) return
    await deleteResearch(id)
    navigate('/research')
  }

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{research.department} · Supervisor: {research.supervisor}</p>
          <h1 className="mt-1 max-w-3xl font-display text-3xl font-semibold leading-tight">{research.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge status={research.publication_status || research.publicationStatus} />
            {(research.patent_status || research.patentStatus) && (research.patent_status || research.patentStatus) !== 'none' && <Badge status={research.patent_status || research.patentStatus} />}
          </div>
        </div>
        {canManage && (
          <div className="flex gap-3">
            <Link to={`/dashboard/research/${id}/edit`} className="btn-secondary">Edit</Link>
            <button onClick={onDelete} className="btn-danger">Delete</button>
          </div>
        )}
      </div>

      <p className="mt-6 max-w-3xl text-ink-600 dark:text-ink-300">{research.abstract}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="card">
          <p className="eyebrow mb-3">Authors</p>
          {authors.length ? (
            <ul className="space-y-2 text-sm">{authors.map((a) => <li key={a.id}>{a.author_name || a.authorName}</li>)}</ul>
          ) : <p className="text-sm text-ink-400">No authors listed.</p>}
        </div>
        <div className="card">
          <p className="eyebrow mb-3">Patents</p>
          {patents.length ? (
            <ul className="space-y-2 text-sm">
              {patents.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span>{p.title}</span>
                  <Badge status={p.status} />
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink-400">No patents filed yet.</p>}
        </div>
      </div>
    </div>
  )
}
