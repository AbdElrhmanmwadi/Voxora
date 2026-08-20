---
name: voxora-design
description: Use when designing or implementing Voxora UI components, pages, or features. Covers the premium design system (colors, typography, layout), localization (Arabic/English with RTL/LTR), and theming (light/dark). Use ONLY when working on Voxora frontend UI, not for backend or non-UI tasks.
---

# Voxora Design System & Localization

## Product Overview

Voxora is an AI-powered platform combining:
- RAG (Retrieval-Augmented Generation)
- AI Agents
- Conversational AI
- Voice AI
- Speech-to-Text / Text-to-Speech
- Document processing & translation
- Multilingual interaction
- Real-time AI workflows

---

## Design Direction

**PREMIUM + EDITORIAL + TECHNICAL + MODERN**

Think: premium technology company + editorial design + modern developer product + AI infrastructure

NOT: generic AI startup landing page

### Brand Personality
- Intelligent, precise, calm, premium, technical, trustworthy, modern, human
- Avoid: childish, overly futuristic, noisy, overly colorful, gimmicky

---

## Color System

### Light Mode
```css
--background: 40 20% 98%;        /* Warm off-white */
--foreground: 20 14% 10%;        /* Warm near-black */
--primary: 16 80% 44%;           /* Burnt orange accent */
--primary-foreground: 40 20% 98%;
--muted: 30 10% 95%;
--muted-foreground: 20 8% 46%;
--border: 30 10% 90%;
```

### Dark Mode
```css
--background: 20 14% 6%;         /* Deep warm charcoal */
--foreground: 40 20% 96%;
--primary: 16 80% 50%;           /* Slightly brighter orange */
--muted: 20 10% 14%;
--border: 20 10% 16%;
```

### Accent Color
**Burnt orange** `hsl(16, 80%, 44%)` — confident, warm, technical. NOT purple/blue.

### What to AVOID
- Purple/blue AI gradients
- Generic glassmorphism
- Floating gradient blobs
- Excessive rounded cards
- Generic dashboard grids
- ChatGPT clones
- Neon effects everywhere

---

## Typography

### Font Stack
- **Display/Headings:** Space Grotesk — geometric, technical, modern
- **Body:** Manrope — clean, readable, slightly warm
- **Arabic:** Noto Sans Arabic — pairs well with Manrope
- **Mono:** JetBrains Mono

### CSS Classes
```css
.font-display { font-family: 'Space Grotesk', 'Noto Sans Arabic', sans-serif; }
/* Body uses Manrope by default */
```

### Hierarchy
- Page titles: `text-3xl sm:text-4xl font-bold tracking-tight font-display`
- Section headers: `text-sm font-bold font-display`
- Body: `text-sm leading-relaxed`
- Labels: `text-xs font-bold uppercase tracking-[0.18em] font-display`
- Mono/code: `font-mono text-xs`

---

## Layout Principles

- Asymmetric compositions, not uniform card grids
- Strong left alignment with editorial rhythm
- Generous whitespace
- Cards only for meaningful grouping
- Section-based layouts with clear hierarchy
- Tighter border radius: `0.375rem` (not `0.5rem`)
- Subtle shadows, not heavy

---

## Localization (i18n)

### Supported Languages
- **English (en):** LTR
- **Arabic (ar):** RTL

### Architecture
```
src/
├── i18n/
│   ├── en.json          # English translations
│   └── ar.json          # Arabic translations
└── core/
    └── i18n/
        ├── I18nContext.tsx    # Context + provider
        ├── ThemeContext.tsx   # Theme context + provider
        └── index.ts           # Exports
```

### Usage in Components
```tsx
import { useI18n } from '../../../core/i18n'

function MyComponent() {
  const { t, language, setLanguage, dir } = useI18n()
  
  return (
    <div dir={dir}>
      <h1>{t('projects.page.title')}</h1>
      <p>{t('dashboard.page.title', { id: projectId })}</p>
    </div>
  )
}
```

### Translation Keys Structure
```json
{
  "common": { "loading": "...", "error": "...", ... },
  "auth": { "login": { "title": "...", ... }, ... },
  "layout": { "header": {...}, "sidebar": {...} },
  "projects": { "page": {...}, "open": {...}, "recent": {...} },
  "dashboard": { "page": {...}, "tools": {...} },
  "files": { "page": {...}, "list": {...}, "upload": {...} },
  "ask": { "page": {...}, "question": {...}, "answer": {...} },
  "agent": { "sidebar": {...}, "window": {...}, "input": {...} },
  "translate": { "page": {...}, "createJob": {...} },
  "voice": { "page": {...}, "recorder": {...}, "transcript": {...} },
  "feedback": {...},
  "theme": { "light": "...", "dark": "..." },
  "language": { "en": "English", "ar": "العربية" },
  "brand": { "name": "Voxora", "tagline": "...", "features": {...} }
}
```

### Parameter Interpolation
```json
// en.json
{ "greeting": "Hello {name}, you have {count} messages" }

// Usage
t('greeting', { name: 'Ahmed', count: 5 })
// → "Hello Ahmed, you have 5 messages"
```

### RTL Support

#### Automatic Direction
The `I18nProvider` automatically sets `document.documentElement.dir` to `'rtl'` or `'ltr'` based on language.

#### Logical Properties (Required)
NEVER hardcode `left`/`right`. Use logical properties:

| Physical (BAD) | Logical (GOOD) |
|----------------|----------------|
| `margin-left` | `margin-inline-start` / `ms-*` |
| `margin-right` | `margin-inline-end` / `me-*` |
| `padding-left` | `padding-inline-start` / `ps-*` |
| `padding-right` | `padding-inline-end` / `pe-*` |
| `left: 0` | `inset-inline-start: 0` / `start-0` |
| `right: 0` | `inset-inline-end: 0` / `end-0` |
| `border-left` | `border-inline-start` / `border-s` |
| `border-right` | `border-inline-end` / `border-e` |
| `text-align: left` | `text-align: start` / `text-start` |
| `text-align: right` | `text-align: end` / `text-end` |
| `rounded-l` | `rounded-s` |
| `rounded-r` | `rounded-e` |

#### Tailwind Utilities
Custom utilities are defined in `tailwind.config.cjs`:
- `ms-{0-8}`, `me-{0-8}` — margin-inline-start/end
- `ps-{0-8}`, `pe-{0-8}` — padding-inline-start/end
- `start-0`, `end-0` — inset-inline-start/end
- `border-s`, `border-e` — border-inline-start/end
- `rounded-s`, `rounded-e` — border-start-end-radius etc.
- `text-start`, `text-end` — text-align

#### RTL-Specific Styles
```css
[dir="rtl"] body { letter-spacing: 0; }
[dir="rtl"] .page-title { letter-spacing: 0; }
[dir="rtl"] .font-display { letter-spacing: 0; }
```

---

## Theming

### Theme Context
```tsx
import { useTheme } from '../../../core/i18n'

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme()
  
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  )
}
```

### Theme Persistence
Theme is stored in `localStorage` under key `voxora-theme`.

### System Preference
On first visit, the theme respects `prefers-color-scheme`.

### Dark Mode
Tailwind `darkMode: 'class'` is configured. The `ThemeProvider` adds/removes the `dark` class on `<html>`.

---

## Settings Menu

A combined language/theme switcher is available in the header:

```tsx
import SettingsMenu from '../ui/SettingsMenu'

// In Header component
<SettingsMenu />
```

The menu provides:
- Light/Dark theme toggle
- EN/ع language switcher

---

## Component Patterns

### Page Structure
```tsx
<div className="page-container">
  <div className="page-header">
    <div>
      <p className="page-kicker">{t('section.kicker')}</p>
      <h1 className="page-title">{t('section.title')}</h1>
      <p className="page-description">{t('section.description')}</p>
    </div>
    {/* Optional badge/action */}
  </div>
  
  {/* Content */}
</div>
```

### Cards
```tsx
<AppCard title={t('section.cardTitle')}>
  {/* Content */}
</AppCard>
```

### Lists (prefer over card grids)
```tsx
<div className="divide-y rounded-md border bg-card">
  {items.map(item => (
    <div key={item.id} className="px-5 py-4">
      {/* Item content */}
    </div>
  ))}
</div>
```

### Empty States
```tsx
<EmptyState 
  title={t('empty.title')} 
  description={t('empty.description')} 
/>
```

### Status Indicators
```tsx
<StatusBadge status="idle" | "loading" | "success" | "error" | "empty" />
```

---

## Auth Pages Layout

Auth pages use a split layout with an editorial brand panel:

```tsx
import AuthLayout from '../../../core/layout/AuthLayout'

export default function LoginPage() {
  const { t } = useI18n()
  
  return (
    <AuthLayout>
      {/* Form content */}
    </AuthLayout>
  )
}
```

The left panel (desktop only) shows:
- Brand name and logo
- Tagline and description
- Feature highlights (RAG, Agents, Voice, Translate)

---

## Voice AI UX

The Voice page shows sophisticated state indicators:

```tsx
<div className={`flex h-12 w-12 items-center justify-center rounded-full ${
  recording ? 'bg-destructive/10 ring-2 ring-destructive/30' :
  streaming ? 'bg-primary/10 ring-2 ring-primary/30' :
  'bg-muted'
}`}>
  {recording ? (
    <span className="h-3 w-3 rounded-full bg-destructive animate-pulse-soft" />
  ) : streaming ? (
    <LoadingSpinner size={5} />
  ) : (
    <MicrophoneIcon />
  )}
</div>
```

---

## Agent Chat UX

### Message Bubbles
- User messages: `bg-primary text-primary-foreground`
- Assistant messages: `border bg-background`
- Streaming cursor: `animate-pulse text-primary`

### Sources & Trace
```tsx
<button onClick={() => setShowSources(s => !s)}>
  {showSources ? t('agent.message.hideSources') : t('agent.message.sources', { count })}
</button>
```

---

## Motion

### Animations
```css
animate-fade-in      /* 0.3s opacity fade */
animate-fade-up      /* 0.4s opacity + translateY */
animate-pulse-soft   /* 2s pulsing opacity */
animate-slide-in     /* 0.2s opacity + translateX */
```

### Usage
- Page transitions: `animate-fade-in`
- Content entrance: `animate-fade-up`
- Recording indicator: `animate-pulse-soft`
- Toast notifications: `animate-slide-in`

---

## Responsive Design

### Breakpoints
- Mobile: default
- Tablet: `sm:` (640px), `md:` (768px)
- Desktop: `lg:` (1024px), `xl:` (1280px)

### Navigation
- Mobile: Sidebar collapses, hamburger menu
- Desktop: Persistent sidebar with nav items

### Grids
```tsx
<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
  {/* Main content */}
  {/* Sidebar */}
</div>
```

---

## Accessibility

### RTL Considerations
- All directional icons should flip in RTL (or use logical properties)
- Text alignment uses `text-start`/`text-end`
- Focus rings work in both directions

### ARIA
- Use `dir={dir}` on root elements when needed
- `aria-label` should be translated: `aria-label={t('key')}`
- `aria-live="polite"` for dynamic content

---

## File Structure Reference

```
src/
├── i18n/
│   ├── en.json
│   └── ar.json
├── core/
│   ├── i18n/
│   │   ├── I18nContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── AuthLayout.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Input.tsx
│       ├── SettingsMenu.tsx
│       └── ...
├── features/
│   ├── auth/pages/
│   ├── projects/pages/
│   ├── files/pages/
│   ├── rag/pages/
│   ├── translation/pages/
│   ├── voice/pages/
│   └── feedback/components/
├── components/
│   ├── AgentChat.jsx
│   ├── ChatWindow.jsx
│   ├── ChatInput.jsx
│   ├── MessageBubble.jsx
│   └── SessionSidebar.jsx
├── main.tsx
├── router.tsx
└── index.css
```

---

## Key Rules

1. **NEVER hardcode strings** — always use `t('key')`
2. **NEVER hardcode left/right** — use logical properties (`ms-*`, `me-*`, etc.)
3. **Always translate** — including aria-labels, placeholders, error messages
4. **Test both languages** — verify layout works in LTR and RTL
5. **Test both themes** — verify colors work in light and dark mode
6. **Use existing components** — Button, Card, Badge, Input, etc.
7. **Follow the design system** — burnt orange accent, Space Grotesk headings, warm neutrals

---

## Commands

```bash
# Development
npm run dev

# Type check
npm run typecheck

# Build
npm run build
```

---

## Summary

Voxora is a premium AI platform with:
- **Design:** Editorial, technical, warm (burnt orange accent), NOT generic AI SaaS
- **i18n:** Full Arabic/English support with automatic RTL/LTR
- **Theming:** Light/dark mode with system preference detection
- **Typography:** Space Grotesk (display) + Manrope (body) + Noto Sans Arabic
- **Layout:** Asymmetric, generous whitespace, logical properties throughout
