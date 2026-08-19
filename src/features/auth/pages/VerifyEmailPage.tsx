import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import StatusBadge from '../../../core/components/StatusBadge'
import AuthLayout from '../../../core/layout/AuthLayout'
import { verifyEmailRequest } from '../api/authApi'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email address...')
  const token = searchParams.get('token')

  useEffect(() => {
    let active = true

    async function verify() {
      if (!token) {
        setStatus('error')
        setMessage('Verification token is missing.')
        return
      }

      try {
        const response = await verifyEmailRequest(token)
        if (!active) return
        setStatus('success')
        setMessage(response.message || 'Email verified successfully.')
      } catch (err) {
        if (!active) return
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Email verification failed.')
      }
    }

    verify()

    return () => {
      active = false
    }
  }, [token])

  return (
    <AuthLayout>
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <StatusBadge status={status} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight font-display">Email verification</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{message}</p>
      </div>
      <div className="mt-8 text-center">
        {status === 'loading' && <LoadingSpinner />}
        {status === 'success' && (
          <Button onClick={() => window.location.assign('/login')} className="w-full">Go to login</Button>
        )}
        {status === 'error' && (
          <Link to="/login" className="text-sm font-semibold underline-offset-4 hover:underline">Back to login</Link>
        )}
      </div>
    </AuthLayout>
  )
}
