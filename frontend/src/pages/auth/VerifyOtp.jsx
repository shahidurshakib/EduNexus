import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import * as authApi from '../../api/auth'
import ErrorBanner from '../../components/ui/ErrorBanner'

export default function VerifyOtp() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState(location.state?.email || '')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)
    try {
      await authApi.verifyOtp({ email, otp })
      setInfo('Email verified — you can log in now.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setError(''); setInfo('')
    try {
      await authApi.resendOtp({ email })
      setInfo('A new code has been sent.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Verify your email</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Enter the 6-digit code we sent to your inbox.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <ErrorBanner message={error} />
        {info && <p className="rounded-md border border-moss-200 bg-moss-50 px-4 py-3 text-sm text-moss-700 dark:border-moss-900/50 dark:bg-moss-900/20 dark:text-moss-300">{info}</p>}
        <div>
          <label className="field-label">Email</label>
          <input required type="email" className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Verification code</label>
          <input required maxLength={6} className="field-input text-center tracking-[0.5em] font-mono text-lg" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Verifying…' : 'Verify email'}</button>
        <button type="button" onClick={resend} className="btn-ghost w-full">Resend code</button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
        <Link to="/login" className="font-medium text-gold-600 hover:underline">Back to log in</Link>
      </p>
    </div>
  )
}
