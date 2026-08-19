import React from 'react'
import Logo from '../../core/ui/Logo'
import { useI18n } from '../../core/i18n'

type Props = {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  const { t } = useI18n()

  return (
    <main className="flex min-h-screen bg-background">
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:border-r lg:bg-foreground lg:p-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12h4l3-8 4 16 3-8h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight font-display text-background">{t('brand.name')}</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-4xl font-bold tracking-tight font-display text-background text-balance">
            {t('brand.tagline')}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-background/60">
            {t('brand.description')}
          </p>
          <div className="mt-10 grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 font-display">{t('brand.features.rag.title')}</p>
              <p className="mt-1 text-sm text-background/70">{t('brand.features.rag.description')}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 font-display">{t('brand.features.agents.title')}</p>
              <p className="mt-1 text-sm text-background/70">{t('brand.features.agents.description')}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 font-display">{t('brand.features.voice.title')}</p>
              <p className="mt-1 text-sm text-background/70">{t('brand.features.voice.description')}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 font-display">{t('brand.features.translate.title')}</p>
              <p className="mt-1 text-sm text-background/70">{t('brand.features.translate.description')}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-background/30">{t('brand.name')}</p>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <Logo />
              <span className="text-sm font-bold tracking-tight font-display">{t('brand.name')}</span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </main>
  )
}
