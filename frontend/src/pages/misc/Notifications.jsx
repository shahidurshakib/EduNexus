import { useEffect, useState } from 'react'
import { listNotifications, markRead, markAllRead, deleteNotification } from '../../api/notifications'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'

export default function Notifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    listNotifications({ limit: 30 }).then((data) => setItems(data.notifications || [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Notifications</p>
          <h1 className="mt-1 font-display text-3xl font-semibold">Your alerts</h1>
        </div>
        <button className="btn-secondary" onClick={async () => { await markAllRead(); load() }}>Mark all as read</button>
      </div>

      <div className="mt-8">
        {loading ? <Loader /> : items.length === 0 ? <EmptyState title="You're all caught up" /> : (
          <ul className="space-y-3">
            {items.map((n) => (
              <li key={n.id} className={`card flex items-start justify-between gap-4 ${!n.is_read ? 'border-gold-300 dark:border-gold-700' : ''}`}>
                <div>
                  <p className="font-medium text-ink-800 dark:text-paper">{n.title}</p>
                  <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{n.message}</p>
                  <p className="mt-2 font-mono text-xs text-ink-300">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {!n.is_read && <button className="btn-ghost !px-2 !py-1 text-xs" onClick={async () => { await markRead(n.id); load() }}>Mark read</button>}
                  <button className="btn-ghost !px-2 !py-1 text-xs text-red-500" onClick={async () => { await deleteNotification(n.id); load() }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
