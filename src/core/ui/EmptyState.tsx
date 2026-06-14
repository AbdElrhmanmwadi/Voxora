import React from 'react'
import { cn } from '../utils/cn'

type Props = {
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

// Consistent replacement for the hand-rolled `border-dashed bg-muted/30` boxes
// scattered across pages: one icon + message + optional CTA.
export default function EmptyState({ title, description, action, icon, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-md border border-dashed bg-muted/30 p-6 text-center',
        className
      )}
    >
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
