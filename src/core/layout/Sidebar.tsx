import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { cn } from '../utils/cn'
import { useI18n } from '../i18n'
import { VOICE_ENABLED } from '../config/features'

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
  const { t } = useI18n()
  const base = projectId ? `/projects/${projectId}` : null

  return (
    <nav className="sticky top-20 space-y-6">
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 font-display">{t('layout.sidebar.workspace')}</div>
        <div className="flex gap-1 overflow-x-auto pb-1 md:block md:space-y-0.5 md:overflow-visible md:pb-0">
          <NavItem to="/" end>{t('layout.sidebar.projects')}</NavItem>
          {base ? (
            <>
              <NavItem to={base} end>{t('layout.sidebar.overview')}</NavItem>
              <NavItem to={`${base}/ask`}>{t('layout.sidebar.askAI')}</NavItem>
              <NavItem to={`${base}/agent`}>{t('layout.sidebar.agentChat')}</NavItem>
              <NavItem to={`${base}/translate`}>{t('layout.sidebar.translate')}</NavItem>
              {VOICE_ENABLED && <NavItem to={`${base}/voice`}>{t('layout.sidebar.voice')}</NavItem>}
            </>
          ) : (
            <p className="px-3 py-2 text-xs leading-5 text-muted-foreground">{t('layout.sidebar.openProjectHint')}</p>
          )}
        </div>
      </div>

      {base && (
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 font-display">{t('layout.sidebar.library')}</div>
          <div className="flex gap-1 overflow-x-auto pb-1 md:block md:space-y-0.5 md:overflow-visible md:pb-0">
            <NavItem to={`${base}/files`}>{t('layout.sidebar.files')}</NavItem>
          </div>
        </div>
      )}
    </nav>
  )
}
