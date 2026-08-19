import React from 'react'
import { cn } from '../utils/cn'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'ghost' | 'outline' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export default function Button({ variant = 'default', size = 'default', className = '', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50'
  const variants: Record<string, string> = {
    default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.98]',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground hover:border-foreground/20',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  }
  const sizes: Record<string, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-11 rounded-md px-6 text-base',
    icon: 'h-10 w-10'
  }

  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
}
