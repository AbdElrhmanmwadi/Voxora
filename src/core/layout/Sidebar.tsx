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
          'flex min-h-9 items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        )
      }
    >
      {children}
    </NavLink>
  )
}

export default function Sidebar() {
  const { projectId } = useParams()
  const base = projectId ? `/projects/${projectId}` : null

  return (
    <nav className="sticky top-20 space-y-6">
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 font-display">Workspace</div>
        <div className="flex gap-1 overflow-x-auto pb-1 md:block md:space-y-0.5 md:overflow-visible md:pb-0">
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
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 font-display">Library</div>
          <div className="flex gap-1 overflow-x-auto pb-1 md:block md:space-y-0.5 md:overflow-visible md:pb-0">
            <NavItem to={`${base}/files`}>Files</NavItem>
          </div>
        </div>
      )}
    </nav>
  )
}
