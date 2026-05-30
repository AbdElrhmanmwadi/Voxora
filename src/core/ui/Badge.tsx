import React from 'react'
import { cn } from '../utils/cn'

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning'
}

export default function Badge({ variant = 'default', className, ...props }: Props) {
  const variants: Record<string, string> = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-border text-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    success: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border border-amber-200 bg-amber-50 text-amber-700'
  }

  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}
      {...props}
    />
  )
}
