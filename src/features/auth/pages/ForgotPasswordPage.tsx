import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../../../core/ui/Input'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import AuthLayout from '../../../core/layout/AuthLayout'
import { useI18n } from '../../../core/i18n'
import { requestPasswordResetRequest } from '../api/authApi'

const RESEND_COOLDOWN_SECONDS = 30

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const { t } = useI18n()

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
      setError(err instanceof Error ? err.message : t('auth.errors.genericForgot'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-display">{t('auth.forgotPassword.title')}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{t('auth.forgotPassword.description')}</p>
      </div>

      {sent && (
        <div className="mt-6 rounded-md border bg-muted/40 p-4 text-sm leading-relaxed">
          {t('auth.forgotPassword.success')}
        </div>
      )}
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="field-label" htmlFor="email">{t('auth.forgotPassword.email')}</label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading || cooldown > 0}>
          {loading ? (
            <><LoadingSpinner size={4} /> {t('auth.forgotPassword.submitting')}</>
          ) : cooldown > 0 ? (
            t('auth.forgotPassword.cooldown', { seconds: cooldown })
          ) : sent ? (
            t('auth.forgotPassword.resend')
          ) : (
            t('auth.forgotPassword.submit')
          )}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t('auth.forgotPassword.backToLogin')} <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">{t('auth.forgotPassword.backToLoginLink')}</Link>
      </p>
    </AuthLayout>
  )
}
