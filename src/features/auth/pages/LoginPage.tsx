import React, { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../core/ui/Card'
import Input from '../../../core/ui/Input'
import PasswordInput from '../../../core/ui/PasswordInput'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import Logo from '../../../core/ui/Logo'
import { useAuth } from '../../../core/auth/AuthContext'
import { ApiClientError } from '../../../core/api/axiosClient'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

function loginErrorMessage(err: unknown): string {
  if (!(err instanceof ApiClientError)) {
    return err instanceof Error ? err.message : 'Unable to log in.'
  }
  if (err.status === 401) return 'Invalid email or password.'
  if (err.status === 403) {
    if (err.message.toLowerCase().includes('google')) {
      return 'This account uses Google sign-in. Use the Google button below.'
    }
    return 'Email is not verified. Please check your inbox.'
  }
  return err.message
}

function googleLoginErrorMessage(err: unknown): string {
  if (!(err instanceof ApiClientError)) {
    return err instanceof Error ? err.message : 'Google sign-in failed.'
  }
  if (err.status === 401) return 'Invalid or expired Google sign-in. Please try again.'
  if (err.status === 403) return 'Your Google email is not verified.'
  if (err.status === 409) {
    return 'This email is linked to a different Google account. Sign in with your password or use the correct Google account.'
  }
  if (err.status === 503) return 'Google sign-in is not configured on the server.'
  return err.message
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()
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
      setError(loginErrorMessage(err))
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
      setError(googleLoginErrorMessage(err))
    } finally {
      setGoogleLoading(false)
    }
  }

  const busy = loading || googleLoading

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2">
            <Logo />
          </div>
          <CardTitle>Log in to Voxora AI</CardTitle>
          <CardDescription>Use your verified account to access protected project workflows.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="field-label" htmlFor="email">Email</label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="field-label" htmlFor="password">Password</label>
              <PasswordInput id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <Button type="submit" className="w-full" disabled={busy}>
              {loading ? <><LoadingSpinner size={4} /> Logging in</> : 'Log in'}
            </Button>
          </form>

          {googleClientId && (
            <div className="mt-4 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <div className={`flex justify-center ${busy ? 'pointer-events-none opacity-60' : ''}`}>
                <GoogleLogin
                  onSuccess={(response) => {
                    if (response.credential) void handleGoogleSuccess(response.credential)
                    else setError('Google sign-in did not return a credential.')
                  }}
                  onError={() => setError('Google sign-in was cancelled or failed.')}
                  text="signin_with"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  width="320"
                />
              </div>
              {googleLoading && (
                <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <LoadingSpinner size={4} /> Signing in with Google
                </p>
              )}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need an account? <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">Register</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
