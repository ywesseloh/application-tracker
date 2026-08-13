import { useEffect, useState } from 'react'
import { ApplicationBoard } from '@/features/applications'
import { AuthScreen } from '@/features/auth'
import { refresh } from '@/shared/api/authApi'
import { useAccessToken } from '@/shared/auth/useAccessToken'
import './App.css'

export default function App() {
  const accessToken = useAccessToken()
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        await refresh()
      } catch {
        // No session — stay anonymous
      } finally {
        if (!cancelled) setBootstrapping(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  if (bootstrapping) {
    return (
      <div className="app-bootstrap" role="status" aria-live="polite">
        Loading…
      </div>
    )
  }

  if (!accessToken) {
    return <AuthScreen />
  }

  return <ApplicationBoard />
}
