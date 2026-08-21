import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createStartup, updateStartup, getStartup, updateStartupStatus } from '../../api/startups'
import ErrorBanner from '../../components/ui/ErrorBanner'
import { useAuth } from '../../context/AuthContext'

const STATUSES = ['active', 'inactive', 'archived']

export default function StartupForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', description: '', industry: '', location: '', fundingNeeded: '' })
  const [status, setStatus] = useState('active')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      getStartup(id).then(({ startup }) => {
        setForm({
          name: startup.name, description: startup.description, industry: startup.industry,
          location: startup.location, fundingNeeded: startup.funding_needed ?? '',
        })
        setStatus(startup.status)
      })
    }
  }, [id])

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const payload = { ...form, fundingNeeded: form.fundingNeeded ? Number(form.fundingNeeded) : undefined }
    try {
      if (isEdit) {
        await updateStartup(id, payload)
        if (['admin', 'platform_founder'].includes(user.role)) await updateStartupStatus(id, status)
        navigate(`/startups/${id}`)
      } else {
        const created = await createStartup(payload)
        navigate(`/startups/${created.id}`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{isEdit ? 'Edit startup' : 'New startup'}</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">{isEdit ? 'Update your record' : 'Register a startup'}</h1>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <ErrorBanner message={error} />
        <div>
          <label className="field-label">Startup name</label>
          <input required className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Description</label>
          <textarea required rows={4} className="field-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Industry</label>
            <input required className="field-input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Location</label>
            <input required className="field-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="field-label">Funding needed (USD)</label>
          <input type="number" min="0" className="field-input" value={form.fundingNeeded} onChange={(e) => setForm({ ...form, fundingNeeded: e.target.value })} />
        </div>
        {isEdit && ['admin', 'platform_founder'].includes(user?.role) && (
          <div>
            <label className="field-label">Status</label>
            <select className="field-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create startup'}</button>
      </form>
    </div>
  )
}
