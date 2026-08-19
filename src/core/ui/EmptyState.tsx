import React from 'react'
import { cn } from '../utils/cn'

type Props = {
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export default function EmptyState({ title, description, action, icon, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-md border border-dashed border-border/80 bg-muted/20 p-8 text-center',
        className
      )}
    >
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <p className="text-sm font-semibold text-foreground font-display">{title}</p>
      {description && <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
