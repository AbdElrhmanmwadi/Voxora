import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { useAuth } from '../auth/AuthContext'

export default function Header() {
  const { logout, user } = useAuth()
  const displayName = user?.username || user?.name || user?.email || ''
  const avatarInitials = displayName ? getInitials(displayName) : 'U'

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
            <Button size="sm" variant="ghost" onClick={logout}>Logout</Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-xs font-semibold shadow-sm" aria-label={displayName ? `Current user: ${displayName}` : 'Current user'} title={displayName || undefined}>
              {avatarInitials}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function getInitials(value: string) {
  const name = value.trim()
  if (!name) return 'U'

  const emailName = name.includes('@') ? name.split('@')[0] : name
  const parts = emailName.split(/[\s._-]+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return Array.from(emailName).slice(0, 2).join('').toUpperCase()
}
