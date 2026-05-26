import React from 'react'

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div {...props} className={`glass p-4 rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  )
}
