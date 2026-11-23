import { Link } from 'react-router-dom'
import StatCard from '../../components/ui/StatCard'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'

export default function InvestorDashboard({ data }) {
  const startups = data.linkedStartups || data.startups || []
  const history = data.fundingHistory || []
  const totalInvested = data.totalInvested ?? history.reduce((s, f) => s + Number(f.amount || 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Investor overview</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Your portfolio</h1>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Linked startups" value={startups.length} />
        <StatCard label="Total invested" value={`$${Number(totalInvested).toLocaleString()}`} accent="gold" />
        <StatCard label="Funding rounds" value={history.length} accent="moss" />
      </div>

      <div className="card">
        <p className="eyebrow mb-4">Portfolio companies</p>
        {startups.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {startups.map((s) => (
              <Link key={s.id} to={`/startups/${s.id}`} className="rounded-lg border border-ink-100 p-4 hover:border-gold-300 dark:border-ink-700">
                <p className="font-display text-lg">{s.name}</p>
                <p className="mt-1 text-xs text-ink-400">{s.industry} · {s.stage}</p>
              </Link>
            ))}
          </div>
        ) : <p className="text-sm text-ink-400">No startups linked yet.</p>}
      </div>

      <div className="card">
        <p className="eyebrow mb-4">Funding history</p>
        <DataTable
          columns={[
            { key: 'startup', header: 'Startup', render: (r) => r.startup_name || r.startupName },
            { key: 'amount', header: 'Amount', render: (r) => `$${Number(r.amount).toLocaleString()}` },
            { key: 'roundType', header: 'Round', render: (r) => <Badge status={r.round_type || r.roundType} /> },
            { key: 'fundingDate', header: 'Date', render: (r) => (r.funding_date || r.fundingDate)?.slice(0, 10) },
          ]}
          rows={history}
        />
      </div>
    </div>
  )
}
