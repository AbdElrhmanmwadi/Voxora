import React from 'react'

export default function Logo() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
