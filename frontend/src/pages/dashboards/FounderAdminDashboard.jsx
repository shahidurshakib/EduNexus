import StatCard from '../../components/ui/StatCard'
import ChartCard from '../../components/charts/ChartCard'
import TrendLineChart from '../../components/charts/TrendLineChart'
import DistributionBarChart from '../../components/charts/DistributionBarChart'
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'

// The backend returns pendingApprovals as a single summary object
// (e.g. { pendingAdmins, pendingMentors, pendingInvestors, totalPending }),
// not an array — so it can't be rendered directly as a React child.
// This turns it into a plain number for display.
function getPendingCount(pendingApprovals) {
  if (Array.isArray(pendingApprovals)) {
    return pendingApprovals.reduce((s, p) => s + (p.count || 0), 0)
  }
  if (pendingApprovals && typeof pendingApprovals === 'object') {
    if (pendingApprovals.totalPending != null) return Number(pendingApprovals.totalPending) || 0
    return (
      (Number(pendingApprovals.pendingAdmins) || 0) +
      (Number(pendingApprovals.pendingMentors) || 0) +
      (Number(pendingApprovals.pendingInvestors) || 0)
    )
  }
  return pendingApprovals ?? '—'
}

// Shared overview for platform_founder and admin — data shape documented in API_DOCUMENTATION.md
export default function FounderAdminDashboard({ data, isFounder }) {
  const usersByRole = data.usersByRole || data.userCounts || []
  const monthlySignups = data.monthlySignups || []
  const pendingApprovals = data.pendingApprovals || data.pendingApprovalsByType || []
  const recentActivity = data.recentActivity || []
  const recentFunding = data.recentFunding || []

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">{isFounder ? 'Founder overview' : 'Admin overview'}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Platform at a glance</h1>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Startups" value={data.startupCount ?? data.totalStartups ?? '—'} />
        <StatCard label="Research records" value={data.researchCount ?? data.totalResearch ?? '—'} accent="moss" />
        <StatCard label="Funding total" value={data.fundingTotal != null ? `$${Number(data.fundingTotal).toLocaleString()}` : '—'} accent="gold" />
        <StatCard label="Pending approvals" value={getPendingCount(pendingApprovals)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {monthlySignups?.length > 0 && (
          <ChartCard title="Monthly signups" subtitle="New accounts over time">
            <TrendLineChart data={monthlySignups} xKey={monthlySignups[0]?.month ? 'month' : 'label'} yKey={monthlySignups[0]?.count != null ? 'count' : 'value'} />
          </ChartCard>
        )}
        {usersByRole?.length > 0 && (
          <ChartCard title="Users by role">
            <DistributionBarChart data={usersByRole} xKey={usersByRole[0]?.role ? 'role' : 'label'} yKey={usersByRole[0]?.count != null ? 'count' : 'value'} />
          </ChartCard>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <p className="eyebrow">Recent activity</p>
            <Link to="/dashboard/admin/logs" className="text-xs font-medium text-gold-600 hover:underline">View logs</Link>
          </div>
          {recentActivity?.length ? (
            <ul className="space-y-3">
              {recentActivity.slice(0, 6).map((a, i) => (
                <li key={a.id ?? i} className="flex items-start justify-between gap-3 border-b border-ink-100 pb-3 text-sm last:border-0 dark:border-ink-700">
                  <span className="text-ink-600 dark:text-ink-300">{a.action || a.description || a.entity_type}</span>
                  <span className="whitespace-nowrap font-mono text-xs text-ink-400">{a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink-400">Nothing logged yet.</p>}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <p className="eyebrow">Recent funding</p>
            <Link to="/dashboard/admin/funding" className="text-xs font-medium text-gold-600 hover:underline">View all</Link>
          </div>
          {recentFunding?.length ? (
            <ul className="space-y-3">
              {recentFunding.slice(0, 6).map((f, i) => (
                <li key={f.id ?? i} className="flex items-center justify-between border-b border-ink-100 pb-3 text-sm last:border-0 dark:border-ink-700">
                  <span className="text-ink-600 dark:text-ink-300">{f.startup_name || f.startupName || `Startup #${f.startup_id}`}</span>
                  <span className="flex items-center gap-2">
                    <Badge status={f.round_type || f.roundType} />
                    <span className="font-mono text-xs text-gold-600">${Number(f.amount).toLocaleString()}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink-400">No funding rounds recorded yet.</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/dashboard/admin/approvals" className="btn-primary">Review approvals</Link>
        <Link to="/dashboard/admin/users" className="btn-secondary">Manage users</Link>
        <Link to="/dashboard/admin/reports" className="btn-secondary">Reports & exports</Link>
      </div>
    </div>
  )
}