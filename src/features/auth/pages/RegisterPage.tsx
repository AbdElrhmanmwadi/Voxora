import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../core/ui/Card'
import Input from '../../../core/ui/Input'
import PasswordInput from '../../../core/ui/PasswordInput'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import Logo from '../../../core/ui/Logo'
import { useAuth } from '../../../core/auth/AuthContext'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await register({ email, username, password })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to register.')
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
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Register with the backend auth service and verify your email before logging in.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="rounded-md border bg-muted/40 p-4 text-sm leading-6">
                Check your email to verify your account, then return to log in.
              </div>
              <Button className="w-full" onClick={() => window.location.assign('/login')}>Go to login</Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="field-label" htmlFor="email">Email</label>
                <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="field-label" htmlFor="username">Username</label>
                <Input id="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="field-label" htmlFor="password">Password</label>
                <PasswordInput id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><LoadingSpinner size={4} /> Creating account</> : 'Create account'}
              </Button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already registered? <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
