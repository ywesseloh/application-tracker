import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ApplicationBoard } from '@/features/applications'
import { AuthScreen } from '@/features/auth'
import { refresh } from '@/shared/api/authApi'
import { isLoggedInLocally } from '@/shared/auth/loggedInLocallyStore'
import { useAccessToken } from '@/shared/auth/useAccessToken'
import './App.css'

export default function App() {
  const accessToken = useAccessToken()
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        if (isLoggedInLocally()) {
          await refresh()
        }
      } catch {
        // refresh() clears token + loggedInLocally on failure
      } finally {
        if (!cancelled) setBootstrapping(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  let content
  if (bootstrapping) {
    content = (
      <div className="app-bootstrap" role="status" aria-live="polite">
        Loading…
      </div>
    )
  } else if (!accessToken) {
    content = <AuthScreen />
  } else {
    content = <ApplicationBoard />
  }

  return (
    <div className="app-shell">
      <div className="app-shell__content">{content}</div>
      <footer className="app-footer">
        <nav className="app-footer__links" aria-label="Legal and contact links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms-and-conditions">Terms and Conditions</Link>
          <a href="mailto:info@ywesseloh.com">Contact</a>
        </nav>
      </footer>
    </div>
  )
}
