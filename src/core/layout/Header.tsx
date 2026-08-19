import React from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import SettingsMenu from '../ui/SettingsMenu'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n'
import { getProjectName } from '../../features/projects/recentProjects'

const SECTION_LABEL_KEYS: Record<string, string> = {
  files: 'layout.sidebar.files',
  ask: 'layout.sidebar.askAI',
  agent: 'layout.sidebar.agentChat',
  translate: 'layout.sidebar.translate',
  voice: 'layout.sidebar.voice'
}

export default function Header() {
  const { logout, user } = useAuth()
  const { projectId } = useParams()
  const location = useLocation()
  const { t } = useI18n()
  const displayName = user?.username || user?.name || user?.email || ''
  const avatarInitials = displayName ? getInitials(displayName) : 'U'

  const projectLabel = projectId ? getProjectName(projectId) || `Project ${projectId}` : null
  const sectionKey = projectId ? location.pathname.split('/')[3] : undefined
  const sectionLabelKey = sectionKey ? SECTION_LABEL_KEYS[sectionKey] : undefined
  const sectionLabel = sectionLabelKey ? t(sectionLabelKey) : undefined

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto w-full max-w-[1536px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/" className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Logo />
              <span className="block shrink-0 text-sm font-bold tracking-tight font-display sm:text-base">{t('brand.name')}</span>
            </Link>
            {projectLabel && (
              <nav aria-label={t('layout.breadcrumb.ariaLabel')} className="hidden min-w-0 items-center gap-2 text-sm text-muted-foreground sm:flex">
                <span aria-hidden="true" className="text-border">/</span>
                <Link to={`/projects/${projectId}`} className="truncate rounded text-foreground/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {projectLabel}
                </Link>
                {sectionLabel && (
                  <>
                    <span aria-hidden="true" className="text-border">/</span>
                    <span className="truncate font-medium text-foreground" aria-current="page">{sectionLabel}</span>
                  </>
                )}
              </nav>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Badge variant="default" className="hidden sm:inline-flex">{t('common.beta')}</Badge>
            <SettingsMenu />
            <Button size="sm" variant="ghost" onClick={logout}>{t('layout.header.logout')}</Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary font-display" aria-label={displayName ? t('layout.header.currentUser', { name: displayName }) : t('layout.header.currentUser', { name: '' })} title={displayName || undefined}>
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
