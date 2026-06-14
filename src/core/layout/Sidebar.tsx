import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { cn } from '../utils/cn'

function NavItem({ to, children, end = false }: { to: string; children: React.ReactNode; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex min-h-10 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )
      }
    >
      {children}
    </NavLink>
  )
}

export default function Sidebar() {
  const { projectId } = useParams()
  // Project-scoped links only render when a project is actually in context.
  // Never fabricate a project id (previously defaulted to /projects/1, which
  // silently routed users into a project that may not be theirs or 404s).
  const base = projectId ? `/projects/${projectId}` : null

  return (
    <nav className="sticky top-20 space-y-4">
      <div className="rounded-lg border bg-card p-2 shadow-sm">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Workspace</div>
        <div className="flex gap-1 overflow-x-auto pb-1 md:block md:space-y-1 md:overflow-visible md:pb-0">
          <NavItem to="/" end>Projects</NavItem>
          {base ? (
            <>
              <NavItem to={base} end>Overview</NavItem>
              <NavItem to={`${base}/ask`}>Ask AI</NavItem>
              <NavItem to={`${base}/agent`}>Agent Chat</NavItem>
              <NavItem to={`${base}/translate`}>Translate</NavItem>
              <NavItem to={`${base}/voice`}>Voice</NavItem>
            </>
          ) : (
            <p className="px-3 py-2 text-xs leading-5 text-muted-foreground">Open a project to access its tools.</p>
          )}
        </div>
      </div>

      {base && (
        <div className="rounded-lg border bg-card p-2 shadow-sm">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Library</div>
          <div className="flex gap-1 overflow-x-auto pb-1 md:block md:space-y-1 md:overflow-visible md:pb-0">
            <NavItem to={`${base}/files`}>Files</NavItem>
          </div>
        </div>
      )}
    </nav>
  )
}
