import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createResearch, updateResearch, getResearch } from '../../api/research'
import ErrorBanner from '../../components/ui/ErrorBanner'

const PUB_STATUSES = ['draft', 'submitted', 'published']
const PATENT_STATUSES = ['none', 'filed', 'granted']

export default function ResearchForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', abstract: '', department: '', supervisor: '',
    publicationStatus: 'draft', patentStatus: 'none', authors: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      getResearch(id).then((data) => {
        const r = data.research || data
        setForm({
          title: r.title, abstract: r.abstract, department: r.department, supervisor: r.supervisor,
          publicationStatus: r.publication_status || r.publicationStatus, patentStatus: r.patent_status || r.patentStatus,
          authors: (data.authors || []).map((a) => a.author_name || a.authorName).join(', '),
        })
      })
    }
  }, [id])

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const payload = {
      title: form.title, abstract: form.abstract, department: form.department, supervisor: form.supervisor,
      publicationStatus: form.publicationStatus, patentStatus: form.patentStatus,
      authors: form.authors.split(',').map((s) => s.trim()).filter(Boolean).map((authorName) => ({ authorName })),
    }
    try {
      if (isEdit) {
        await updateResearch(id, payload)
        navigate(`/research/${id}`)
      } else {
        const created = await createResearch(payload)
        navigate(`/research/${created.id}`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{isEdit ? 'Edit research' : 'New research'}</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">{isEdit ? 'Update this record' : 'Log a research project'}</h1>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <ErrorBanner message={error} />
        <div>
          <label className="field-label">Title</label>
          <input required className="field-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Abstract</label>
          <textarea required rows={4} className="field-input" value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Department</label>
            <input required className="field-input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Supervisor</label>
            <input required className="field-input" value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="field-label">Authors (comma-separated)</label>
          <input className="field-input" placeholder="A. Rahman, B. Chowdhury" value={form.authors} onChange={(e) => setForm({ ...form, authors: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Publication status</label>
            <select className="field-input" value={form.publicationStatus} onChange={(e) => setForm({ ...form, publicationStatus: e.target.value })}>
              {PUB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Patent status</label>
            <select className="field-input" value={form.patentStatus} onChange={(e) => setForm({ ...form, patentStatus: e.target.value })}>
              {PATENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create record'}</button>
      </form>
    </div>
  )
}
