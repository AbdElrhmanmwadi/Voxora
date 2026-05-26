import React from 'react'
import { NavLink } from 'react-router-dom'

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-2 rounded-md text-sm hover:bg-white/4 ${isActive ? 'bg-white/6 font-medium' : 'text-[hsl(var(--muted-foreground))]'} `
      }
    >
      {children}
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <nav className="sticky top-6 bg-transparent">
      <div className="p-3 glass">
        <div className="mb-4 text-xs font-semibold text-[hsl(var(--muted-foreground))]">Workspace</div>
        <NavItem to="/">Projects</NavItem>
        <NavItem to="/projects/1/ask">Chat</NavItem>
        <NavItem to="/projects/1/translate">Translate</NavItem>
        <NavItem to="/projects/1/voice">Voice</NavItem>
      </div>

      <div className="mt-4 p-3 glass">
        <div className="mb-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">Library</div>
        <NavItem to="/projects/1/files">Files</NavItem>
      </div>
    </nav>
  )
}
