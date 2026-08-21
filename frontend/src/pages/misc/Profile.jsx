import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { requestRole, updateMyMentorProfile, updateMyInvestorProfile } from '../../api/users'
import ErrorBanner from '../../components/ui/ErrorBanner'

export default function Profile() {
  const { user, refreshMe } = useAuth()
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [requesting, setRequesting] = useState('')

  const [mentorForm, setMentorForm] = useState({ expertise: '', bio: '', linkedinUrl: '' })
  const [investorForm, setInvestorForm] = useState({ investmentFocus: '', minTicketSize: '', maxTicketSize: '', bio: '' })

  const doRequest = async (role) => {
    setError(''); setInfo(''); setRequesting(role)
    try {
      await requestRole(role)
      setInfo(`Request to become ${role} submitted — an admin will review it.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setRequesting('')
    }
  }

  const saveMentor = async (e) => {
    e.preventDefault()
    setError(''); setInfo('')
    try {
      await updateMyMentorProfile(mentorForm)
      setInfo('Mentor profile updated.')
    } catch (err) { setError(err.message) }
  }

  const saveInvestor = async (e) => {
    e.preventDefault()
    setError(''); setInfo('')
    try {
      await updateMyInvestorProfile({
        ...investorForm,
        minTicketSize: investorForm.minTicketSize ? Number(investorForm.minTicketSize) : undefined,
        maxTicketSize: investorForm.maxTicketSize ? Number(investorForm.maxTicketSize) : undefined,
      })
      setInfo('Investor profile updated.')
    } catch (err) { setError(err.message) }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="eyebrow">Your profile</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">{user?.full_name}</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{user?.email} · <span className="capitalize">{user?.role?.replace('_', ' ')}</span></p>
      </div>

      <ErrorBanner message={error} />
      {info && <p className="rounded-md border border-moss-200 bg-moss-50 px-4 py-3 text-sm text-moss-700 dark:border-moss-900/50 dark:bg-moss-900/20 dark:text-moss-300">{info}</p>}

      {user?.role === 'member' && (
        <div className="card">
          <p className="eyebrow mb-3">Request a different role</p>
          <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">An admin reviews every request before it takes effect.</p>
          <div className="flex gap-3">
            <button disabled={requesting} onClick={() => doRequest('mentor')} className="btn-secondary">Become a mentor</button>
            <button disabled={requesting} onClick={() => doRequest('investor')} className="btn-secondary">Become an investor</button>
          </div>
        </div>
      )}

      {user?.role === 'mentor' && (
        <form onSubmit={saveMentor} className="card space-y-4">
          <p className="eyebrow">Public mentor profile</p>
          <div><label className="field-label">Expertise</label><input className="field-input" value={mentorForm.expertise} onChange={(e) => setMentorForm({ ...mentorForm, expertise: e.target.value })} /></div>
          <div><label className="field-label">Bio</label><textarea rows={3} className="field-input" value={mentorForm.bio} onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })} /></div>
          <div><label className="field-label">LinkedIn URL</label><input className="field-input" value={mentorForm.linkedinUrl} onChange={(e) => setMentorForm({ ...mentorForm, linkedinUrl: e.target.value })} /></div>
          <button className="btn-primary">Save mentor profile</button>
        </form>
      )}

      {user?.role === 'investor' && (
        <form onSubmit={saveInvestor} className="card space-y-4">
          <p className="eyebrow">Public investor profile</p>
          <div><label className="field-label">Investment focus</label><input className="field-input" value={investorForm.investmentFocus} onChange={(e) => setInvestorForm({ ...investorForm, investmentFocus: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="field-label">Min ticket size</label><input type="number" className="field-input" value={investorForm.minTicketSize} onChange={(e) => setInvestorForm({ ...investorForm, minTicketSize: e.target.value })} /></div>
            <div><label className="field-label">Max ticket size</label><input type="number" className="field-input" value={investorForm.maxTicketSize} onChange={(e) => setInvestorForm({ ...investorForm, maxTicketSize: e.target.value })} /></div>
          </div>
          <div><label className="field-label">Bio</label><textarea rows={3} className="field-input" value={investorForm.bio} onChange={(e) => setInvestorForm({ ...investorForm, bio: e.target.value })} /></div>
          <button className="btn-primary">Save investor profile</button>
        </form>
      )}
    </div>
  )
}
