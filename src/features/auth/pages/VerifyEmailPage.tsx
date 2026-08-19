import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import StatusBadge from '../../../core/components/StatusBadge'
import AuthLayout from '../../../core/layout/AuthLayout'
import { useI18n } from '../../../core/i18n'
import { verifyEmailRequest } from '../api/authApi'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const token = searchParams.get('token')
  const { t } = useI18n()

  useEffect(() => {
    let active = true

    async function verify() {
      if (!token) {
        setStatus('error')
        setMessage(t('auth.verifyEmail.title'))
        return
      }

      try {
        const response = await verifyEmailRequest(token)
        if (!active) return
        setStatus('success')
        setMessage(response.message || t('auth.verifyEmail.title'))
      } catch (err) {
        if (!active) return
        setStatus('error')
        setMessage(err instanceof Error ? err.message : t('auth.verifyEmail.title'))
      }
    }

    setMessage(t('auth.verifyEmail.verifying'))
    verify()

    return () => {
      active = false
    }
  }, [token, t])

  return (
    <AuthLayout>
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <StatusBadge status={status} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight font-display">{t('auth.verifyEmail.title')}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{message}</p>
      </div>
      <div className="mt-8 text-center">
        {status === 'loading' && <LoadingSpinner />}
        {status === 'success' && (
          <Button onClick={() => window.location.assign('/login')} className="w-full">{t('auth.verifyEmail.goToLogin')}</Button>
        )}
        {status === 'error' && (
          <Link to="/login" className="text-sm font-semibold underline-offset-4 hover:underline">{t('auth.verifyEmail.backToLogin')}</Link>
        )}
      </div>
    </AuthLayout>
  )
}
