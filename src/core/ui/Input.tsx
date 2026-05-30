import React from 'react'
import { cn } from '../utils/cn'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export default function Input(props: Props) {
  return (
    <input
      {...props}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.className
      )}
    />
  )
}
