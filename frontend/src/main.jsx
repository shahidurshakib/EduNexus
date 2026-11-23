import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

// @react-oauth/google is optional: if `npm install` hasn't been re-run since
// it was added to package.json, a normal top-level `import` of it here would
// fail to resolve and take down the ENTIRE app (this file is the root of
// everything). Loading it dynamically means a missing package only disables
// the Google button — the rest of the site still renders and works.
function GoogleProviderGate({ children }) {
  const [Provider, setProvider] = useState(null)
  const [checked, setChecked] = useState(!googleClientId)

  useEffect(() => {
    if (!googleClientId) return
    import('@react-oauth/google')
      .then((mod) => setProvider(() => mod.GoogleOAuthProvider))
      .catch(() => {
        console.warn(
          '[google] @react-oauth/google is not installed — Google sign-in is disabled. Run `npm install` in /frontend to enable it.'
        )
      })
      .finally(() => setChecked(true))
  }, [])

  if (!checked) return null
  if (Provider) return <Provider clientId={googleClientId}>{children}</Provider>
  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <GoogleProviderGate>
            <App />
          </GoogleProviderGate>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
