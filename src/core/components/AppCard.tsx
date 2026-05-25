import React from 'react'

export default function AppCard({ title, children }: { title?: string; children?: React.ReactNode }) {
  return (
    <div className="card">
      {title && <h3 className="section-title neon-text-blue">{title}</h3>}
      <div>{children}</div>
    </div>
  )
}
