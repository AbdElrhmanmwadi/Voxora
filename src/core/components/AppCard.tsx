import React from 'react'
import Card from '../ui/Card'

type Props = {
  title?: string
  children?: React.ReactNode
  className?: string
}

export default function AppCard({ title, children, className = '' }: Props) {
  return (
    <Card className={className}>
      {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
      <div>{children}</div>
    </Card>
  )
}
