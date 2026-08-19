import React from 'react'

export default function Logo() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12h4l3-8 4 16 3-8h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" />
        </svg>
      </div>
    </div>
  )
}
