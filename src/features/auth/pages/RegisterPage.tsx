import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../../../core/ui/Input'
import PasswordInput from '../../../core/ui/PasswordInput'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import AuthLayout from '../../../core/layout/AuthLayout'
import { useAuth } from '../../../core/auth/AuthContext'
import { useI18n } from '../../../core/i18n'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { t } = useI18n()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await register({ email, username, password })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.errors.genericRegister'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-display">{t('auth.register.title')}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{t('auth.register.description')}</p>
      </div>

      {success ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-md border bg-muted/40 p-4 text-sm leading-relaxed">
            {t('auth.register.success')}
          </div>
          <Button className="w-full" onClick={() => window.location.assign('/login')}>{t('auth.register.goToLogin')}</Button>
        </div>
      ) : (
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="field-label" htmlFor="email">{t('auth.register.email')}</label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="field-label" htmlFor="username">{t('auth.register.username')}</label>
            <Input id="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="field-label" htmlFor="password">{t('auth.register.password')}</label>
            <PasswordInput id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><LoadingSpinner size={4} /> {t('auth.register.submitting')}</> : t('auth.register.submit')}
          </Button>
        </form>
      )}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t('auth.register.hasAccount')} <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">{t('auth.register.login')}</Link>
      </p>
    </AuthLayout>
  )
}
