import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import * as authApi from '../../api/auth'
import ErrorBanner from '../../components/ui/ErrorBanner'

export default function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: location.state?.email || '', otp: '', newPassword: '', confirmNewPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await authApi.resetPassword(form)
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Set a new password</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Enter the code we emailed you along with your new password.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <ErrorBanner message={error} />
        <div>
          <label className="field-label">Email</label>
          <input required type="email" className="field-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Reset code</label>
          <input required maxLength={6} className="field-input text-center tracking-[0.5em] font-mono text-lg" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })} />
        </div>
        <div>
          <label className="field-label">New password</label>
          <input required type="password" minLength={8} className="field-input" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Confirm new password</label>
          <input required type="password" minLength={8} className="field-input" value={form.confirmNewPassword} onChange={(e) => setForm({ ...form, confirmNewPassword: e.target.value })} />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Resetting…' : 'Reset password'}</button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
        <Link to="/login" className="font-medium text-gold-600 hover:underline">Back to log in</Link>
      </p>
    </div>
  )
}
