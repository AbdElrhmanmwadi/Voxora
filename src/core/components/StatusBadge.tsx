import React from 'react'
import Badge from '../ui/Badge'

export default function StatusBadge({ status }: { status: 'idle' | 'loading' | 'success' | 'error' | 'empty' }) {
  const map: Record<string, 'secondary' | 'outline' | 'success' | 'destructive' | 'warning'> = {
    idle: 'outline',
    loading: 'secondary',
    success: 'success',
    error: 'destructive',
    empty: 'warning'
  }
  return <Badge variant={map[status]}>{status}</Badge>
}
