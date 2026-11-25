
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

function GoogleProviderGate({ children }) {
  const [Provider, setProvider] = useState(null)
  const [checked, setChecked] = useState(!googleClientId)

  useEffect(() => {
    if (!googleClientId) return

    import('@react-oauth/google')
      .then((mod) => setProvider(() => mod.GoogleOAuthProvider))
      .catch(() => {
        console.warn(
          '[google] Google sign-in is disabled. Install @react-oauth/google.'
        )
      })
      .finally(() => setChecked(true))
  }, [])

  if (!checked) return null

  if (Provider) {
    return (
      <Provider clientId={googleClientId}>
        {children}
      </Provider>
    )
  }

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
