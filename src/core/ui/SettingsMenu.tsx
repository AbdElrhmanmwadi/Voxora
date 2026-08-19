import React, { useState, useRef, useEffect } from 'react'
import { useI18n, useTheme, type Language, type Theme } from '../../core/i18n'

export default function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const { language, setLanguage, t } = useI18n()
  const { theme, setTheme } = useTheme()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Settings"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-48 animate-fade-in rounded-md border bg-card p-1 shadow-md">
          <div className="px-2 py-1.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground font-display">{t('theme.light').split('')[0]}{t('theme.dark').split('')[0]}</p>
          </div>
          <div className="flex gap-1 px-1 pb-1">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                theme === 'light' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              {t('theme.light')}
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                theme === 'dark' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              {t('theme.dark')}
            </button>
          </div>

          <div className="my-1 border-t" />

          <div className="px-2 py-1.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground font-display">Language</p>
          </div>
          <div className="flex gap-1 px-1 pb-1">
            <button
              onClick={() => setLanguage('en')}
              className={`flex flex-1 items-center justify-center rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                language === 'en' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`flex flex-1 items-center justify-center rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                language === 'ar' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              ع
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
