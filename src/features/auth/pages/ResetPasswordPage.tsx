import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PasswordInput from '../../../core/ui/PasswordInput'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import AuthLayout from '../../../core/layout/AuthLayout'
import { useI18n } from '../../../core/i18n'
import { resetPasswordRequest } from '../api/authApi'
import { clearTokens } from '../../../core/auth/authStorage'
import { ApiClientError } from '../../../core/api/axiosClient'

const PASSWORD_MIN = 8
const PASSWORD_MAX = 128

function resetErrorMessage(err: unknown, t: (key: string, params?: Record<string, string | number>) => string): string {
  if (err instanceof ApiClientError) {
    if (err.status === 401) {
      if (err.message.toLowerCase().includes('expired')) {
        return t('auth.errors.expiredLink')
      }
      return t('auth.errors.invalidLink')
    }
    if (err.status === 422) return t('auth.errors.passwordLength', { min: PASSWORD_MIN, max: PASSWORD_MAX })
    return err.message
  }
  return err instanceof Error ? err.message : t('auth.errors.genericReset')
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { t } = useI18n()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      setError(t('auth.errors.passwordLength', { min: PASSWORD_MIN, max: PASSWORD_MAX }))
      return
    }
    if (password !== confirm) {
      setError(t('auth.errors.passwordMismatch'))
      return
    }
    if (!token) return

    setLoading(true)
    try {
      await resetPasswordRequest(token, password)
      clearTokens()
      setSuccess(true)
    } catch (err) {
      setError(resetErrorMessage(err, t))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-display">{t('auth.resetPassword.title')}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{t('auth.resetPassword.description')}</p>
      </div>

      {!token ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {t('auth.resetPassword.missingToken')}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/auth/forgot-password" className="font-semibold text-foreground underline-offset-4 hover:underline">{t('auth.resetPassword.requestNewLink')}</Link>
          </p>
        </div>
      ) : success ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-md border bg-muted/40 p-4 text-sm leading-relaxed">
            {t('auth.resetPassword.success')}
          </div>
          <Button className="w-full" onClick={() => window.location.assign('/login')}>{t('auth.resetPassword.goToLogin')}</Button>
        </div>
      ) : (
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="field-label" htmlFor="new-password">{t('auth.resetPassword.newPassword')}</label>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={PASSWORD_MIN}
              maxLength={PASSWORD_MAX}
              required
            />
            <p className="field-hint">{t('auth.resetPassword.hint', { min: PASSWORD_MIN, max: PASSWORD_MAX })}</p>
          </div>
          <div className="space-y-2">
            <label className="field-label" htmlFor="confirm-password">{t('auth.resetPassword.confirmPassword')}</label>
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
              {(error.includes('Request a new one') || error.includes('طلب رابط')) && (
                <Link to="/auth/forgot-password" className="font-semibold underline underline-offset-4">{t('auth.errors.requestNewLink')}</Link>
              )}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><LoadingSpinner size={4} /> {t('auth.resetPassword.submitting')}</> : t('auth.resetPassword.submit')}
          </Button>
        </form>
      )}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">{t('auth.resetPassword.backToLogin')}</Link>
      </p>
    </AuthLayout>
  )
}
