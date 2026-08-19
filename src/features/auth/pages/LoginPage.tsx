import React, { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Input from '../../../core/ui/Input'
import PasswordInput from '../../../core/ui/PasswordInput'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import AuthLayout from '../../../core/layout/AuthLayout'
import { useAuth } from '../../../core/auth/AuthContext'
import { useI18n } from '../../../core/i18n'
import { ApiClientError } from '../../../core/api/axiosClient'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

function loginErrorMessage(err: unknown, t: (key: string) => string): string {
  if (!(err instanceof ApiClientError)) {
    return err instanceof Error ? err.message : t('auth.errors.genericLogin')
  }
  if (err.status === 401) return t('auth.errors.invalidCredentials')
  if (err.status === 403) {
    if (err.message.toLowerCase().includes('google')) {
      return t('auth.errors.googleAccount')
    }
    return t('auth.errors.notVerified')
  }
  return err.message
}

function googleLoginErrorMessage(err: unknown, t: (key: string) => string): string {
  if (!(err instanceof ApiClientError)) {
    return err instanceof Error ? err.message : t('auth.errors.googleFailed')
  }
  if (err.status === 401) return t('auth.errors.googleInvalid')
  if (err.status === 403) return t('auth.errors.googleNotVerified')
  if (err.status === 409) {
    return t('auth.errors.googleAccountMismatch')
  }
  if (err.status === 503) return t('auth.errors.googleNotConfigured')
  return err.message
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/'

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(loginErrorMessage(err, t))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSuccess(credential: string) {
    setError(null)
    setGoogleLoading(true)

    try {
      await loginWithGoogle(credential)
      navigate(from, { replace: true })
    } catch (err) {
      setError(googleLoginErrorMessage(err, t))
    } finally {
      setGoogleLoading(false)
    }
  }

  const busy = loading || googleLoading

  return (
    <AuthLayout>
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-display">{t('auth.login.title')}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{t('auth.login.description')}</p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="field-label" htmlFor="email">{t('auth.login.email')}</label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="field-label" htmlFor="password">{t('auth.login.password')}</label>
            <Link to="/auth/forgot-password" className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              {t('auth.login.forgotPassword')}
            </Link>
          </div>
          <PasswordInput id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        <Button type="submit" className="w-full" disabled={busy}>
          {loading ? <><LoadingSpinner size={4} /> {t('auth.login.submitting')}</> : t('auth.login.submit')}
        </Button>
      </form>

      {googleClientId && (
        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-display tracking-wider">{t('auth.login.orContinueWith')}</span>
            </div>
          </div>
          <div className={`flex justify-center ${busy ? 'pointer-events-none opacity-60' : ''}`}>
            <GoogleLogin
              onSuccess={(response) => {
                if (response.credential) void handleGoogleSuccess(response.credential)
                else setError(t('auth.errors.googleNoCredential'))
              }}
              onError={() => setError(t('auth.errors.googleCancelled'))}
              text="signin_with"
              shape="rectangular"
              theme="outline"
              size="large"
              width="320"
            />
          </div>
          {googleLoading && (
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoadingSpinner size={4} /> {t('auth.login.googleSigningIn')}
            </p>
          )}
        </div>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t('auth.login.noAccount')} <Link to="/register" className="font-semibold text-foreground underline-offset-4 hover:underline">{t('auth.login.register')}</Link>
      </p>
    </AuthLayout>
  )
}
