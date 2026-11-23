import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
<<<<<<< HEAD
import {
  getResearch, deleteResearch, addResearchMentor,
  uploadResearchDocument, downloadResearchDocument,
} from '../../api/research'
import { listMentors } from '../../api/users'
=======
import { getResearch, deleteResearch } from '../../api/research'
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
import Loader from '../../components/ui/Loader'
import ErrorBanner from '../../components/ui/ErrorBanner'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'

export default function ResearchDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

<<<<<<< HEAD
  const [mentorPickerOpen, setMentorPickerOpen] = useState(false)
  const [mentorOptions, setMentorOptions] = useState([])
  const [selectedMentorId, setSelectedMentorId] = useState('')
  const [mentorBusy, setMentorBusy] = useState(false)

  const [docType, setDocType] = useState('draft_proposal')
  const [docFile, setDocFile] = useState(null)
  const [docLocked, setDocLocked] = useState(false)
  const [uploadBusy, setUploadBusy] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const load = () => getResearch(id).then(setData).catch((e) => setError(e.message))
  useEffect(() => { load() }, [id])
=======
  useEffect(() => { getResearch(id).then(setData).catch((e) => setError(e.message)) }, [id])
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092

  if (error) return <div className="container-page py-16"><ErrorBanner message={error} /></div>
  if (!data) return <Loader />

  const research = data.research || data
  const authors = data.authors || []
  const patents = data.patents || []
<<<<<<< HEAD
  const mentors = data.mentors || []
  const documents = data.documents || []
  const canManage = user && (user.role === 'admin' || user.role === 'platform_founder' || research.created_by === user.id)
  const isCollaborator = user && (canManage || mentors.some((m) => m.user_id === user.id))
  const canUploadDoc = isCollaborator
=======
  const canManage = user && (user.role === 'admin' || user.role === 'platform_founder' || research.created_by === user.id)
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092

  const onDelete = async () => {
    if (!confirm('Delete this research record?')) return
    await deleteResearch(id)
    navigate('/research')
  }

<<<<<<< HEAD
  const openMentorPicker = async () => {
    setMentorPickerOpen(true)
    if (mentorOptions.length === 0) {
      const d = await listMentors({ limit: 100 }).catch(() => ({ mentors: [] }))
      setMentorOptions(d.mentors || [])
    }
  }

  const submitAddMentor = async () => {
    if (!selectedMentorId) return
    setMentorBusy(true)
    try {
      await addResearchMentor(id, selectedMentorId)
      setMentorPickerOpen(false)
      setSelectedMentorId('')
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setMentorBusy(false)
    }
  }

  const submitUploadDoc = async (e) => {
    e.preventDefault()
    if (!docFile) return
    setUploadError('')
    setUploadBusy(true)
    try {
      await uploadResearchDocument(id, { file: docFile, docType, isLocked: docLocked })
      setDocFile(null)
      setDocLocked(false)
      load()
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploadBusy(false)
    }
  }

=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{research.department} · Supervisor: {research.supervisor}</p>
          <h1 className="mt-1 max-w-3xl font-display text-3xl font-semibold leading-tight">{research.title}</h1>
<<<<<<< HEAD
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
            Posted by <span className="font-medium">{research.created_by_name}</span>
            {research.created_by_organization && <> · {research.created_by_organization}</>}
          </p>
=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge status={research.publication_status || research.publicationStatus} />
            {(research.patent_status || research.patentStatus) && (research.patent_status || research.patentStatus) !== 'none' && <Badge status={research.patent_status || research.patentStatus} />}
          </div>
        </div>
        {canManage && (
          <div className="flex gap-3">
            <Link to={`/dashboard/research/${id}/edit`} className="btn-secondary">Edit</Link>
            <button onClick={onDelete} className="btn-danger">Delete</button>
          </div>
        )}
      </div>

      <p className="mt-6 max-w-3xl text-ink-600 dark:text-ink-300">{research.abstract}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="card">
          <p className="eyebrow mb-3">Authors</p>
          {authors.length ? (
            <ul className="space-y-2 text-sm">{authors.map((a) => <li key={a.id}>{a.author_name || a.authorName}</li>)}</ul>
          ) : <p className="text-sm text-ink-400">No authors listed.</p>}
        </div>
<<<<<<< HEAD

        <div className="card">
          <div className="flex items-center justify-between">
            <p className="eyebrow mb-3">Mentors on this project</p>
            {canManage && <button onClick={openMentorPicker} className="text-xs font-semibold text-gold-600 hover:underline">+ Add mentor</button>}
          </div>
          {mentors.length ? (
            <ul className="space-y-2 text-sm">
              {mentors.map((m) => <li key={m.mentor_id}>{m.full_name} <span className="text-ink-400">— {m.expertise}</span></li>)}
            </ul>
          ) : <p className="text-sm text-ink-400">No mentors linked yet.</p>}

          {mentorPickerOpen && (
            <div className="mt-4 space-y-2 border-t border-ink-100 pt-4 dark:border-ink-700">
              <select className="field-input" value={selectedMentorId} onChange={(e) => setSelectedMentorId(e.target.value)}>
                <option value="">Choose a mentor…</option>
                {mentorOptions.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
              </select>
              <div className="flex gap-2">
                <button disabled={mentorBusy || !selectedMentorId} onClick={submitAddMentor} className="btn-primary">Add</button>
                <button onClick={() => setMentorPickerOpen(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}
        </div>

=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
        <div className="card">
          <p className="eyebrow mb-3">Patents</p>
          {patents.length ? (
            <ul className="space-y-2 text-sm">
              {patents.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span>{p.title}</span>
                  <Badge status={p.status} />
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink-400">No patents filed yet.</p>}
        </div>
<<<<<<< HEAD

        <div className="card">
          <p className="eyebrow mb-3">Full paper & draft proposals</p>
          {documents.length ? (
            <ul className="space-y-2 text-sm">
              {documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">
                    {d.isLocked && '🔒 '}{d.originalName || (d.docType === 'full_paper' ? 'Full paper' : 'Draft proposal')}
                    <span className="ml-2 text-xs text-ink-400">by {d.uploadedByName}</span>
                  </span>
                  {d.downloadUrl ? (
                    <button
                      onClick={() => downloadResearchDocument(d.id, d.originalName)}
                      className="shrink-0 text-xs font-semibold text-gold-600 hover:underline"
                    >
                      Download
                    </button>
                  ) : (
                    <span className="shrink-0 text-xs text-ink-400">Restricted</span>
                  )}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink-400">No documents uploaded yet.</p>}

          {canUploadDoc && (
            <form onSubmit={submitUploadDoc} className="mt-4 space-y-2 border-t border-ink-100 pt-4 dark:border-ink-700">
              <ErrorBanner message={uploadError} />
              <select className="field-input" value={docType} onChange={(e) => setDocType(e.target.value)}>
                <option value="draft_proposal">Draft proposal</option>
                <option value="full_paper">Full research paper</option>
              </select>
              <input required type="file" accept="application/pdf" className="field-input" onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
              <label className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
                <input type="checkbox" checked={docLocked} onChange={(e) => setDocLocked(e.target.checked)} />
                Lock this document — only the research team and admins can download it
              </label>
              <button disabled={uploadBusy} className="btn-primary w-full">{uploadBusy ? 'Uploading…' : 'Upload document'}</button>
            </form>
          )}
        </div>
=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
      </div>
    </div>
  )
}
