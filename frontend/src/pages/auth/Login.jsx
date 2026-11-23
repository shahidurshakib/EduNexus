import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ErrorBanner from '../../components/ui/ErrorBanner'
import GoogleAuthButton from '../../components/auth/GoogleAuthButton'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Log in</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Welcome back to your EduNexus record.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <ErrorBanner message={error} />
        <div>
          <label className="field-label">Email</label>
          <input required type="email" className="field-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="field-label">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-gold-600 hover:underline">Forgot password?</Link>
          </div>
          <input required type="password" className="field-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Logging in…' : 'Log in'}</button>
      </form>

      <GoogleAuthButton onError={setError} />

      <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
        New to EduNexus? <Link to="/register" className="font-medium text-gold-600 hover:underline">Create an account</Link>
      </p>
    </div>
  )
}
