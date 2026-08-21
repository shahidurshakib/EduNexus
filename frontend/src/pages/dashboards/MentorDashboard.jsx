import { Link } from 'react-router-dom'
import StatCard from '../../components/ui/StatCard'

export default function MentorDashboard({ data }) {
  const startups = data.assignedStartups || data.startups || []
  const notifications = data.recentNotifications || data.notifications || []

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Mentor overview</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Your assigned startups</h1>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <StatCard label="Assigned startups" value={startups.length} />
        <StatCard label="Unread notifications" value={notifications.filter((n) => !n.is_read).length} accent="gold" />
      </div>

      <div className="card">
        <p className="eyebrow mb-4">Startups you're guiding</p>
        {startups.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {startups.map((s) => (
              <Link key={s.id} to={`/startups/${s.id}`} className="rounded-lg border border-ink-100 p-4 transition-colors hover:border-gold-300 dark:border-ink-700">
                <p className="font-display text-lg">{s.name}</p>
                <p className="mt-1 text-xs text-ink-400">{s.industry} · {s.location}</p>
              </Link>
            ))}
          </div>
        ) : <p className="text-sm text-ink-400">No startups assigned to you yet — an admin links you when a founder requests mentorship.</p>}
      </div>
    </div>
  )
}
