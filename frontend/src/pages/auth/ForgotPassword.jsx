import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as authApi from '../../api/auth'
import ErrorBanner from '../../components/ui/ErrorBanner'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await authApi.forgotPassword(email)
      navigate('/reset-password', { state: { email } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Reset your password</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">We'll send a one-time code to your email.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <ErrorBanner message={error} />
        <div>
          <label className="field-label">Email</label>
          <input required type="email" className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Sending…' : 'Send reset code'}</button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
        <Link to="/login" className="font-medium text-gold-600 hover:underline">Back to log in</Link>
      </p>
    </div>
  )
}
