import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createApplication } from '../../api/applications'
import Modal from '../ui/Modal'
import ErrorBanner from '../ui/ErrorBanner'

// targetType: 'startup' | 'mentor' | 'investor'
export default function ApplyModal({ open, onClose, targetType, targetId, targetLabel, allowLock = false, onSubmitted }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [file, setFile] = useState(null)
  const [isLocked, setIsLocked] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (!user && open) {
    // Registration is required before applying — send them to log in and
    // bounce straight back to this page afterwards.
    navigate('/login', { state: { from: location } })
    return null
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createApplication({ targetType, targetId, title, message, file, isLocked })
      setDone(true)
      onSubmitted?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const close = () => {
    setDone(false); setTitle(''); setMessage(''); setFile(null); setIsLocked(false); setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={close} title={done ? 'Application submitted' : `Apply to ${targetLabel}`}>
      {done ? (
        <div>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            Your application is now <span className="badge-gold">pending</span>. You'll be notified once it's reviewed —
            if it comes back <span className="font-medium">revised</span>, you can update and resubmit it from your
            dashboard's Requests page.
          </p>
          <button onClick={close} className="btn-primary mt-6 w-full">Done</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <ErrorBanner message={error} />
          <div>
            <label className="field-label">Title</label>
            <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Proposal to co-mentor" />
          </div>
          <div>
            <label className="field-label">Message</label>
            <textarea required rows={4} className="field-input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Why you'd like to collaborate…" />
          </div>
          <div>
            <label className="field-label">Attach a proposal (PDF, optional)</label>
            <input type="file" accept="application/pdf" className="field-input" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          {allowLock && file && (
            <label className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
              <input type="checkbox" checked={isLocked} onChange={(e) => setIsLocked(e.target.checked)} />
              Lock this document — only the reviewer and admins can download it
            </label>
          )}
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Submitting…' : 'Submit application'}</button>
        </form>
      )}
    </Modal>
  )
}
