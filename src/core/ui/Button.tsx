import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export default function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base = 'px-4 py-2 rounded-md text-sm font-medium transition-shadow'
  const variants: Record<string, string> = {
    primary: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:shadow-md',
    ghost: 'bg-transparent text-[hsl(var(--foreground))] hover:bg-white/4'
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
