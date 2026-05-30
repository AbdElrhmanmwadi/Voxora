import React from 'react'
import { cn } from '../utils/cn'

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div {...props} className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }: CardProps) {
  return (
    <div {...props} className={cn('flex flex-col space-y-1.5 p-5 sm:p-6', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', ...props }: CardProps) {
  return (
    <h3 {...props} className={cn('text-base font-semibold leading-none tracking-tight', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '', ...props }: CardProps) {
  return (
    <p {...props} className={cn('text-sm leading-6 text-muted-foreground', className)}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '', ...props }: CardProps) {
  return (
    <div {...props} className={cn('p-5 pt-0 sm:p-6 sm:pt-0', className)}>
      {children}
    </div>
  )
}
