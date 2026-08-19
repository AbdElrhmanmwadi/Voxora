import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../../../core/ui/Input'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import AuthLayout from '../../../core/layout/AuthLayout'
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
      setSent(true)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send the reset email. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-display">Reset password</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">Enter your email to receive a reset link.</p>
      </div>

      {sent && (
        <div className="mt-6 rounded-md border bg-muted/40 p-4 text-sm leading-relaxed">
          If an account with that email exists, a password reset link has been sent. Check your inbox (and spam folder).
        </div>
      )}
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Remembered it? <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">Back to login</Link>
      </p>
    </AuthLayout>
  )
}
