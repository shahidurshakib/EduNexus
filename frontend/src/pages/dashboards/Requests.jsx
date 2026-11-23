import { useEffect, useState } from 'react'
import { listMyApplications, listIncomingApplications } from '../../api/applications'
import Loader from '../../components/ui/Loader'
import ApplicationReviewList from '../../components/applications/ApplicationReviewList'

const TABS = [
  { key: 'sent', label: 'Sent by me' },
  { key: 'received', label: 'Received' },
]

export default function Requests() {
  const [tab, setTab] = useState('sent')
  const [sent, setSent] = useState(null)
  const [received, setReceived] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.allSettled([listMyApplications({ limit: 50 }), listIncomingApplications({ limit: 50 })])
      .then(([s, r]) => {
        setSent(s.status === 'fulfilled' ? s.value.applications : [])
        setReceived(r.status === 'fulfilled' ? r.value.applications : [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <p className="eyebrow">Applications & collaboration requests</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Requests</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-500 dark:text-ink-400">
        Every apply-to-a-startup, mentor collaboration, and investor proposal lands here — track its status, and
        review anything sent to you.
      </p>

      <div className="mt-6 flex gap-2 border-b border-ink-100 dark:border-ink-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t.key ? 'border-gold-500 text-gold-600' : 'border-transparent text-ink-400 hover:text-ink-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? <Loader /> : tab === 'sent' ? (
          <ApplicationReviewList applications={sent} onChanged={load} mode="mine" />
        ) : (
          <ApplicationReviewList applications={received} onChanged={load} mode="incoming" />
        )}
      </div>
    </div>
  )
}
