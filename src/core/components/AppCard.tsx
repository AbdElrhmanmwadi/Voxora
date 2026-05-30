import React from 'react'
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card'

type Props = {
  title?: string
  children?: React.ReactNode
  className?: string
}

export default function AppCard({ title, children, className = '' }: Props) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={!title ? 'pt-5 sm:pt-6' : ''}>{children}</CardContent>
    </Card>
  )
}
