import React from 'react'
import { cn } from '../utils/cn'

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning'
}

export default function Badge({ variant = 'default', className, ...props }: Props) {
  const variants: Record<string, string> = {
    default: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary text-secondary-foreground border-border',
    outline: 'border border-border text-foreground',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    success: 'border border-emerald-200 bg-emerald-50 text-emerald-800',
    warning: 'border border-amber-200 bg-amber-50 text-amber-800'
  }

  return (
    <span
      className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium font-display tracking-wide', variants[variant], className)}
      {...props}
    />
  )
}
