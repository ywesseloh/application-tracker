import { useState, type FormEvent } from 'react'
import { login } from '@/shared/api/authApi'
import { getErrorMessage } from '@/shared/api/getErrorMessage'
import { register } from '@/shared/api/userApi'
import ActionErrorBanner from '@/shared/components/ActionErrorBanner/ActionErrorBanner'
import './AuthScreen.css'

type AuthMode = 'login' | 'register'

const MAX_CREDENTIAL_LENGTH = 20

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isLogin = mode === 'login'
  const usernameTooLong = !isLogin && username.length > MAX_CREDENTIAL_LENGTH
  const passwordTooLong = !isLogin && password.length > MAX_CREDENTIAL_LENGTH
  const hasValidationError = usernameTooLong || passwordTooLong
  const credentialsEmpty = !username.trim() || !password.trim()
  const isSubmitDisabled = isSubmitting || credentialsEmpty || hasValidationError

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitDisabled) return

    const credentials = {
      username: username.trim(),
      password: password.trim(),
    }

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (!isLogin) {
        await register(credentials)
      }
      await login(credentials)
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function clearSubmitError() {
    setSubmitError(null)
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
          <div className="auth-screen__field">
            <label className="auth-screen__label" htmlFor="auth-username">
              Username
            </label>
            <input
              id="auth-username"
              className={`auth-screen__input${usernameTooLong ? ' auth-screen__input--invalid' : ''}`}
              name="username"
              type="text"
              autoComplete="username"
              aria-invalid={usernameTooLong}
              aria-describedby={usernameTooLong ? 'auth-username-error' : undefined}
              value={username}
              onChange={(event) => {
                setUsername(event.target.value)
                clearSubmitError()
              }}
              disabled={isSubmitting}
            />
            {usernameTooLong ? (
              <p id="auth-username-error" className="auth-screen__field-error" role="alert">
                Username can have a maximum length of 20 characters
              </p>
            ) : null}
          </div>

          <div className="auth-screen__field">
            <label className="auth-screen__label" htmlFor="auth-password">
              Password
            </label>
            <div className="auth-screen__password">
              <input
                id="auth-password"
                className={`auth-screen__input${password ? ' auth-screen__input--password' : ''}${passwordTooLong ? ' auth-screen__input--invalid' : ''}`}
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                aria-invalid={passwordTooLong}
                aria-describedby={passwordTooLong ? 'auth-password-error' : undefined}
                value={password}
                onChange={(event) => {
                  const next = event.target.value
                  setPassword(next)
                  clearSubmitError()
                  if (!next) setShowPassword(false)
                }}
                disabled={isSubmitting}
              />
              {password ? (
                <button
                  type="button"
                  className="auth-screen__password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isSubmitting}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              ) : null}
            </div>
            {passwordTooLong ? (
              <p id="auth-password-error" className="auth-screen__field-error" role="alert">
                Password can have a maximum of 20 characters
              </p>
            ) : null}
          </div>

          {submitError ? (
            <div id="auth-submit-error">
              <ActionErrorBanner message={submitError} onDismiss={clearSubmitError} />
            </div>
          ) : null}

          <button
            className="auth-screen__submit"
            type="submit"
            disabled={isSubmitDisabled}
            aria-busy={isSubmitting}
            aria-describedby={submitError ? 'auth-submit-error' : undefined}
          >
            {isSubmitting ? (
              <>
                <span className="auth-screen__submit-spinner" aria-hidden="true" />
                {isLogin ? 'Signing in…' : 'Creating account…'}
              </>
            ) : isLogin ? (
              'Sign in'
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="auth-screen__switch">
          {isLogin ? (
            <button
              type="button"
              className="auth-screen__switch-link"
              onClick={() => {
                setMode('register')
                clearSubmitError()
              }}
              disabled={isSubmitting}
            >
              Create an account
            </button>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="auth-screen__switch-link"
                onClick={() => {
                  setMode('login')
                  clearSubmitError()
                }}
                disabled={isSubmitting}
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
