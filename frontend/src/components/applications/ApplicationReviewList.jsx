import { useState } from 'react'
import Badge from '../ui/Badge'
import { reviewApplication, resubmitApplication, downloadApplicationProposal } from '../../api/applications'

function ReviewRow({ app, onChanged, mode }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [showResubmit, setShowResubmit] = useState(false)
  const [message, setMessage] = useState(app.message || '')
  const [file, setFile] = useState(null)
  const canReview = mode === 'incoming'
  const canResubmit = mode === 'mine'

  const act = async (status) => {
    setBusy(true)
    try {
      await reviewApplication(app.id, status, note || undefined)
      onChanged?.()
    } finally {
      setBusy(false)
    }
  }

  const resubmit = async () => {
    setBusy(true)
    try {
      await resubmitApplication(app.id, { message, file })
      setShowResubmit(false)
      onChanged?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-lg border border-ink-100 p-4 dark:border-ink-700">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display text-base">{app.title || 'Application'}</p>
          <p className="text-xs text-ink-400">
            {app.applicantName} · {app.applicantRole} · {new Date(app.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge status={app.status} />
      </div>
      {app.message && <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{app.message}</p>}
      {app.reviewNote && (
        <p className="mt-2 rounded bg-gold-50 px-3 py-2 text-sm text-gold-700 dark:bg-gold-900/20 dark:text-gold-300">
          Reviewer note: {app.reviewNote}
        </p>
      )}
      {app.hasProposal && app.proposalUrl && (
        <button
          onClick={() => downloadApplicationProposal(app.id)}
          className="mt-2 text-sm font-medium text-gold-600 hover:underline dark:text-gold-400"
        >
          {app.isLocked ? '🔒 ' : ''}Download proposal
        </button>
      )}

      {canReview && app.status === 'pending' && (
        <div className="mt-3 space-y-2">
          <input
            placeholder="Note (required if revising)"
            className="field-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} onClick={() => act('approved')} className="btn-primary">Approve</button>
            <button disabled={busy || !note} onClick={() => act('revised')} className="btn-secondary">Send back for revision</button>
            <button disabled={busy} onClick={() => act('rejected')} className="btn-danger">Reject</button>
          </div>
        </div>
      )}

      {canResubmit && app.status === 'revised' && (
        <div className="mt-3">
          {!showResubmit ? (
            <button onClick={() => setShowResubmit(true)} className="btn-primary">Update & resubmit</button>
          ) : (
            <div className="space-y-2">
              <textarea rows={3} className="field-input" value={message} onChange={(e) => setMessage(e.target.value)} />
              <input type="file" accept="application/pdf" className="field-input" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <button disabled={busy} onClick={resubmit} className="btn-primary">{busy ? 'Submitting…' : 'Resubmit'}</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ApplicationReviewList({ applications, onChanged, mode = 'incoming' }) {
  if (!applications?.length) {
    return <p className="text-sm text-ink-400">No applications yet.</p>
  }
  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <ReviewRow key={app.id} app={app} onChanged={onChanged} mode={mode} />
      ))}
    </div>
  )
}
