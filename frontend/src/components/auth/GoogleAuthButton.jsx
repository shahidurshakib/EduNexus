import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

/**
 * Renders Google's official sign-in button when VITE_GOOGLE_CLIENT_ID is
 * configured AND @react-oauth/google is installed. The import is dynamic on
 * purpose: a static top-level `import ... from '@react-oauth/google'` would
 * fail to resolve (and break this whole page) if `npm install` hasn't been
 * re-run since the package was added to package.json. This way, a missing
 * package just means the button doesn't render — email login still works.
 */
export default function GoogleAuthButton({ onError }) {
  const { loginWithGoogle } = useAuth()
  const configured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
  const [GoogleLogin, setGoogleLogin] = useState(null)

  useEffect(() => {
    if (!configured) return
    import('@react-oauth/google')
      .then((mod) => setGoogleLogin(() => mod.GoogleLogin))
      .catch(() => {
        console.warn('[google] @react-oauth/google is not installed — run `npm install` in /frontend to enable Google sign-in.')
      })
  }, [configured])

  if (!configured || !GoogleLogin) return null

  return (
    <div className="my-5">
      <div className="relative text-center">
        <span className="relative bg-white px-3 text-xs uppercase tracking-wide text-ink-400 dark:bg-ink-900">or</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-ink-100 dark:bg-ink-700" />
      </div>
      <div className="mt-4 flex justify-center">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              await loginWithGoogle(credentialResponse.credential)
              window.location.assign('/dashboard')
            } catch (err) {
              onError?.(err.message || 'Google sign-in failed')
            }
          }}
          onError={() => onError?.('Google sign-in failed')}
          useOneTap
          shape="pill"
          width="320"
        />
      </div>
    </div>
  )
}
