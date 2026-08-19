import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PasswordInput from '../../../core/ui/PasswordInput'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import AuthLayout from '../../../core/layout/AuthLayout'
import { resetPasswordRequest } from '../api/authApi'
import { clearTokens } from '../../../core/auth/authStorage'
import { ApiClientError } from '../../../core/api/axiosClient'

const PASSWORD_MIN = 8
const PASSWORD_MAX = 128

function resetErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.status === 401) {
      if (err.message.toLowerCase().includes('expired')) {
        return 'This link has expired. Request a new one below.'
      }
      return 'This link is invalid or was already used. Request a new one below.'
    }
    if (err.status === 422) return `Password must be ${PASSWORD_MIN}-${PASSWORD_MAX} characters.`
    return err.message
  }
  return err instanceof Error ? err.message : 'Unable to reset the password.'
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      setError(`Password must be ${PASSWORD_MIN}-${PASSWORD_MAX} characters.`)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (!token) return

    setLoading(true)
    try {
      await resetPasswordRequest(token, password)
      clearTokens()
      setSuccess(true)
    } catch (err) {
      setError(resetErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-display">New password</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">Choose a new password for your account.</p>
      </div>

      {!token ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            Reset token is missing. Open the link from your email, or request a new one.
          </div>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/auth/forgot-password" className="font-semibold text-foreground underline-offset-4 hover:underline">Request a new reset link</Link>
          </p>
        </div>
      ) : success ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-md border bg-muted/40 p-4 text-sm leading-relaxed">
            Password changed — sign in with your new password.
          </div>
          <Button className="w-full" onClick={() => window.location.assign('/login')}>Go to login</Button>
        </div>
      ) : (
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="field-label" htmlFor="new-password">New password</label>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={PASSWORD_MIN}
              maxLength={PASSWORD_MAX}
              required
            />
            <p className="field-hint">{PASSWORD_MIN}-{PASSWORD_MAX} characters.</p>
          </div>
          <div className="space-y-2">
            <label className="field-label" htmlFor="confirm-password">Confirm new password</label>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={PASSWORD_MIN}
              maxLength={PASSWORD_MAX}
              required
            />
          </div>
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}{' '}
              {error.includes('Request a new one') && (
                <Link to="/auth/forgot-password" className="font-semibold underline underline-offset-4">Request new link</Link>
              )}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><LoadingSpinner size={4} /> Resetting</> : 'Reset password'}
          </Button>
        </form>
      )}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">Back to login</Link>
      </p>
    </AuthLayout>
  )
}
