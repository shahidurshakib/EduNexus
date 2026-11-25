import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getStartup, deleteStartup } from '../../api/startups'
import { listIncomingApplications } from '../../api/applications'
import Loader from '../../components/ui/Loader'
import ErrorBanner from '../../components/ui/ErrorBanner'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import ApplyModal from '../../components/applications/ApplyModal'
import ApplicationReviewList from '../../components/applications/ApplicationReviewList'
import { useAuth } from '../../context/AuthContext'

export default function StartupDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [applyOpen, setApplyOpen] = useState(false)
  const [apps, setApps] = useState([])

  const load = () => getStartup(id).then(setData).catch((e) => setError(e.message))

  useEffect(() => {
    load()
  }, [id])

  const founders = data?.founders || []

  const canManageEarly = user && (
    user.role === 'platform_founder' ||
    user.role === 'admin' ||
    founders.some((f) => f.id === user.id)
  )

  const loadApps = () => {
    listIncomingApplications()
      .then((d) => {
        setApps(
          (d.applications || []).filter(
            (a) => a.targetType === 'startup' && String(a.targetId) === String(id)
          )
        )
      })
      .catch(() => {})
  }

  useEffect(() => {
    if (data && canManageEarly) loadApps()
  }, [data, canManageEarly, id])

  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorBanner message={error} />
      </div>
    )
  }

  if (!data) return <Loader />

  const {
    startup,
    mentors = [],
    investors = [],
    fundingHistory = [],
  } = data

  const canManage = canManageEarly
  const isFounder = user && founders.some((f) => f.id === user.id)
  const canApply = user && ['member', 'mentor'].includes(user.role) && !isFounder

  const onDelete = async () => {
    if (!confirm(`Delete ${startup.name}? This cannot be undone.`)) return
    await deleteStartup(id)
    navigate('/startups')
  }

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{startup.industry} · {startup.location}</p>
          <h1 className="mt-1 font-display text-4xl font-semibold">{startup.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge status={startup.stage} />
            <Badge status={startup.status} />
          </div>
        </div>

        {canManage && (
          <div className="flex gap-3">
            <Link to={`/dashboard/startups/${id}/edit`} className="btn-secondary">Edit</Link>
            <button onClick={onDelete} className="btn-danger">Delete</button>
          </div>
        )}

        {canApply && (
          <button onClick={() => setApplyOpen(true)} className="btn-primary">
            Apply to collaborate
          </button>
        )}
      </div>

      <ApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        targetType="startup"
        targetId={id}
        targetLabel={startup.name}
        allowLock
      />

      <p className="mt-6 max-w-3xl text-ink-600 dark:text-ink-300">
        {startup.description}
      </p>

      {startup.funding_needed != null && (
        <p className="mt-4 font-mono text-sm text-gold-600">
          Seeking ${Number(startup.funding_needed).toLocaleString()}
        </p>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="card">
          <p className="eyebrow mb-3">Founders</p>
          {founders.length ? (
            <ul className="space-y-2 text-sm">
              {founders.map((f) => (
                <li key={f.id}>
                  {f.full_name} <span className="text-ink-400">— {f.role_title}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink-400">Not listed.</p>}
        </div>

        <div className="card">
          <p className="eyebrow mb-3">Mentors</p>
          {mentors.length ? (
            <ul className="space-y-2 text-sm">
              {mentors.map((m) => <li key={m.id}>{m.full_name}</li>)}
            </ul>
          ) : <p className="text-sm text-ink-400">No mentors linked yet.</p>}
        </div>

        <div className="card">
          <p className="eyebrow mb-3">Investors</p>
          {investors.length ? (
            <ul className="space-y-2 text-sm">
              {investors.map((iv) => <li key={iv.id}>{iv.full_name}</li>)}
            </ul>
          ) : <p className="text-sm text-ink-400">No investors linked yet.</p>}
        </div>
      </div>

      <div className="mt-8">
        <p className="eyebrow mb-3">Funding history</p>
        <DataTable
          columns={[
            { key: 'investor', header: 'Investor', render: (r) => r.investor_name || r.investorName },
            { key: 'amount', header: 'Amount', render: (r) => `$${Number(r.amount).toLocaleString()}` },
            { key: 'roundType', header: 'Round', render: (r) => <Badge status={r.round_type || r.roundType} /> },
            { key: 'date', header: 'Date', render: (r) => (r.funding_date || r.fundingDate)?.slice(0, 10) },
          ]}
          rows={fundingHistory}
          emptyLabel="No funding rounds recorded."
        />
      </div>

      {canManage && (
        <div className="mt-8">
          <p className="eyebrow mb-3">Applications to collaborate</p>
          <ApplicationReviewList
            applications={apps}
            onChanged={loadApps}
            mode="incoming"
          />
        </div>
      )}
    </div>
  )
}