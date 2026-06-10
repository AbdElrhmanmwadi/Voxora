import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../core/ui/Card'
import Input from '../../../core/ui/Input'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import Logo from '../../../core/ui/Logo'
import { requestPasswordResetRequest } from '../api/authApi'

const RESEND_COOLDOWN_SECONDS = 30

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setInterval(() => setCooldown((s) => s - 1), 1000)
    return () => window.clearInterval(timer)
  }, [cooldown > 0])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await requestPasswordResetRequest(email)
      // Always the same outcome regardless of whether the account exists.
      setSent(true)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send the reset email. Try again.')
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
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>Enter your account email and we will send you a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          {sent && (
            <div className="mb-4 rounded-md border bg-muted/40 p-4 text-sm leading-6">
              If an account with that email exists, a password reset link has been sent. Check your inbox (and spam folder).
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="field-label" htmlFor="email">Email</label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading || cooldown > 0}>
              {loading ? (
                <><LoadingSpinner size={4} /> Sending</>
              ) : cooldown > 0 ? (
                `Resend available in ${cooldown}s`
              ) : sent ? (
                'Resend reset link'
              ) : (
                'Send reset link'
              )}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered it? <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Back to login</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
