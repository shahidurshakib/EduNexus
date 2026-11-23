import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as authApi from '../../api/auth'
import ErrorBanner from '../../components/ui/ErrorBanner'
import GoogleAuthButton from '../../components/auth/GoogleAuthButton'

const ROLES = [
  { value: 'member', label: 'Member — I want to register a startup or research' },
  { value: 'mentor', label: 'Mentor — pending admin approval' },
  { value: 'investor', label: 'Investor — pending admin approval' },
]

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', phone: '', organization: '', role: 'member' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.register(form)
      navigate('/verify-otp', { state: { email: form.email } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Create an account</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Every account is OTP-verified before it's active.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <ErrorBanner message={error} />
        <div>
          <label className="field-label">Full name</label>
          <input required className="field-input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Email</label>
          <input required type="email" className="field-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Phone</label>
            <input className="field-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Organization</label>
            <input className="field-input" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="field-label">Password</label>
          <input required type="password" minLength={8} className="field-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Confirm password</label>
          <input required type="password" minLength={8} className="field-input" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
        </div>
        <div>
          <label className="field-label">I am joining as</label>
          <select className="field-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Creating account…' : 'Create account'}</button>
      </form>

      <GoogleAuthButton onError={setError} />

      <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
        Already have an account? <Link to="/login" className="font-medium text-gold-600 hover:underline">Log in</Link>
      </p>
    </div>
  )
}
