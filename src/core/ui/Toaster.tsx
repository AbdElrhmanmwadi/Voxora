import React from 'react'
import { cn } from '../utils/cn'
import { useToastStore, type ToastVariant } from './toast'

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-destructive/30 bg-destructive/10 text-destructive',
  info: 'border-border bg-card text-card-foreground'
}

export default function Toaster() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'pointer-events-auto w-full max-w-sm animate-slide-in rounded-md border p-3 shadow-md',
            variantStyles[t.variant]
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold font-display">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 break-words text-xs leading-5 opacity-90">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded p-0.5 text-base leading-none opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              &times;
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
