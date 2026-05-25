import React from 'react'

export default function LoadingSpinner({ size = 6 }: { size?: number }) {
  const s = size
  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-neon-blue border-t-transparent`}
      style={{ width: s * 4, height: s * 4 }}
    />
  )
}
