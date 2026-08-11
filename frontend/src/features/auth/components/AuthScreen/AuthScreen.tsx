import { useState, type FormEvent } from 'react'
import './AuthScreen.css'

type AuthMode = 'login' | 'register'

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isLogin = mode === 'login'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <div className="auth-screen">
      <div className="auth-screen__panel">
        <header className="auth-screen__header">
          <h1 className="auth-screen__brand">Application Tracker</h1>
          <p className="auth-screen__supporting">
            {isLogin ? 'Sign in to continue' : 'Create an account to get started'}
          </p>
        </header>

        <form className="auth-screen__form" onSubmit={handleSubmit} noValidate>
          <label className="auth-screen__field">
            <span className="auth-screen__label">Username</span>
            <input
              className="auth-screen__input"
              name="username"
              type="text"
              autoComplete="username"
              maxLength={20}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <div className="auth-screen__field">
            <label className="auth-screen__label" htmlFor="auth-password">
              Password
            </label>
            <div className="auth-screen__password">
              <input
                id="auth-password"
                className={`auth-screen__input${password ? ' auth-screen__input--password' : ''}`}
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                maxLength={20}
                value={password}
                onChange={(event) => {
                  const next = event.target.value
                  setPassword(next)
                  if (!next) setShowPassword(false)
                }}
              />
              {password ? (
                <button
                  type="button"
                  className="auth-screen__password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              ) : null}
            </div>
          </div>

          <button className="auth-screen__submit" type="submit">
            {isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="auth-screen__switch">
          {isLogin ? (
            <button
              type="button"
              className="auth-screen__switch-link"
              onClick={() => setMode('register')}
            >
              Create an account
            </button>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="auth-screen__switch-link"
                onClick={() => setMode('login')}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
