import { Link } from 'react-router-dom'
import StatCard from '../../components/ui/StatCard'

export default function MemberDashboard({ data }) {
  const startups = data.startups || data.ownStartups || []
  const research = data.research || data.ownResearch || []
  const unread = data.unreadNotifications ?? data.unreadNotificationCount ?? data.unreadCount ?? 0
  const roleRequests = data.myRoleRequests || data.roleRequests || data.ownRoleRequests || []

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Member overview</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Your work on EduNexus</h1>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Your startups" value={startups.length} />
        <StatCard label="Your research" value={research.length} accent="moss" />
        <StatCard label="Unread alerts" value={unread} accent="gold" />
        <StatCard label="Role requests" value={roleRequests.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <p className="eyebrow">Your startups</p>
            <Link to="/dashboard/startups/new" className="text-xs font-medium text-gold-600 hover:underline">+ New startup</Link>
          </div>
          {startups.length ? (
            <ul className="space-y-3">
              {startups.map((s) => (
                <li key={s.id}><Link to={`/startups/${s.id}`} className="text-sm font-medium text-ink-700 hover:text-gold-600 dark:text-ink-200">{s.name}</Link></li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink-400">You haven't registered a startup yet.</p>}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <p className="eyebrow">Your research</p>
            <Link to="/dashboard/research/new" className="text-xs font-medium text-gold-600 hover:underline">+ New research</Link>
          </div>
          {research.length ? (
            <ul className="space-y-3">
              {research.map((r) => (
                <li key={r.id}><Link to={`/research/${r.id}`} className="text-sm font-medium text-ink-700 hover:text-gold-600 dark:text-ink-200">{r.title}</Link></li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink-400">No research records logged yet.</p>}
        </div>
      </div>

      <div className="card">
        <p className="eyebrow mb-3">Want a mentor or investor role?</p>
        <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">Request an upgraded role — an admin reviews it before it's active.</p>
        <Link to="/dashboard/profile" className="btn-secondary">Request a role</Link>
      </div>
    </div>
  )
}