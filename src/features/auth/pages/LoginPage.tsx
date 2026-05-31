import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../core/ui/Card'
import Input from '../../../core/ui/Input'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import Logo from '../../../core/ui/Logo'
import { useAuth } from '../../../core/auth/AuthContext'
import { ApiClientError } from '../../../core/api/axiosClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
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
      if (err instanceof ApiClientError && err.status === 401) setError('Invalid email or password.')
      else if (err instanceof ApiClientError && err.status === 403) setError('Email is not verified. Please check your inbox.')
      else setError(err instanceof Error ? err.message : 'Unable to log in.')
    } finally {
      setLoading(false)
    }
  }

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
              <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><LoadingSpinner size={4} /> Logging in</> : 'Log in'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need an account? <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">Register</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
