import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../core/ui/Card'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import { verifyEmailRequest } from '../api/authApi'
import StatusBadge from '../../../core/components/StatusBadge'

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
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2">
            <StatusBadge status={status} />
          </div>
          <CardTitle>Email verification</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && <LoadingSpinner />}
          {status === 'success' && (
            <Button onClick={() => window.location.assign('/login')} className="w-full">Go to login</Button>
          )}
          {status === 'error' && (
            <Link to="/login" className="text-sm font-medium underline-offset-4 hover:underline">Back to login</Link>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
