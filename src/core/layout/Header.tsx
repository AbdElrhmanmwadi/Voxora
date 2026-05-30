import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto w-full max-w-[1536px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Logo />
            <div className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight sm:text-base">Voxora AI</span>
              <span className="hidden text-xs text-muted-foreground sm:block">Knowledge operations workspace</span>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Badge variant="secondary" className="hidden sm:inline-flex">Beta</Badge>
            <Button size="sm" variant="outline">Upgrade</Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-xs font-semibold shadow-sm" aria-label="Current user">
              ME
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
