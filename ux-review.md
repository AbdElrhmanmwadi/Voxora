# Voxora AI — Full UX/Product Review

**What the product is:** A knowledge-operations workspace (RAG). A user authenticates, opens a *project*, uploads files, processes/indexes them, then queries that knowledge through four modes — **Ask AI**, **Agent Chat**, **Translate**, and **Voice**.

**Overall:** The engineering foundation is genuinely strong — a coherent token system (HSL CSS vars + dark mode), a real component library (Button/Card/Badge/Input), consistent focus-ring accessibility, and good loading/empty/error scaffolding on most pages. This is well above average. The problems are **not** visual polish — they're **information architecture and user-flow gaps** that would make a first-time user get lost. This review focuses there.

---

## 🔴 The 4 issues to fix before anything else

### 1. There is no way to find, create, or list a project — you must *type a number*
This is the single biggest UX failure. `src/features/projects/pages/ProjectsPage.tsx` asks the user to type a **numeric project ID** into a box to "open" a project. There's no project list, no "Create project," no names — just IDs recalled from localStorage.

**Why it's a problem:** Project IDs are a database implementation detail. Asking a user to memorize and type `1000` violates *recognition over recall* — the most basic usability heuristic. A new user with an empty localStorage literally cannot get anywhere.

**What it should be:** The landing page is a **gallery of project cards** (name, last-updated, file count, a status chip) with a primary **"+ New Project"** button. Typing an ID becomes a secondary "open by ID" affordance, not the main path.

### 2. The sidebar silently hardcodes `/projects/1`
`src/core/layout/Sidebar.tsx:24` — `const base = projectId ? ... : '/projects/1'`. When no project is in context, every nav link points at **project 1**, which may not exist or may not be the user's. This is an invisible trap that sends people into the wrong (or a 404) project.

**Fix:** When there's no active project, the project-scoped nav (Ask/Agent/Translate/Voice/Files) should be **disabled/hidden**, not silently aimed at `1`. Navigation should never fabricate context.

### 3. The product has no global feedback channel (no toasts)
Uploads finish silently. "Process file," "Push index," and translation completion confirm only via a tiny activity-log line. Across `FilesPage.tsx`, `VoicePage.tsx`, `RegisterPage.tsx` there is no success surface.

**Why it matters:** *Feedback* is a core heuristic. Without it, users repeat actions, doubt whether something worked, and lose trust. **Add one Toast/Snackbar primitive** and wire every async success/failure to it. This is the highest-leverage single component you can add — it improves six pages at once.

### 4. RAG answers have no source citations
`AskPage.tsx` and `VoicePage.tsx` render the answer as plain text with no "which file/chunk did this come from." For a *RAG* product, provenance is the entire value proposition — it's what separates it from a generic chatbot. Show source chips (filename + score) under every answer.

---

## Information Architecture & Navigation

- **Two competing chat modes ("Ask AI" vs "Agent Chat") with no explanation.** A user cannot tell which to pick. Either merge them, or label them by *job* ("Quick Answer" vs "Conversational Agent") with one-line descriptions.
- **The legacy `AgentChat` is `.jsx`** while everything else is `.tsx` with the design system — it's an orphan from an earlier architecture (`src/components/` vs `src/features/`). It almost certainly looks inconsistent. Decide: port it into the design system or retire it.
- **No breadcrumb / project context in the header.** `Header.tsx` shows "Voxora AI" but never the *current project name*. Once inside a project, users have no persistent "where am I" anchor. Add `Voxora / {ProjectName} / Ask AI`.
- **The "Upgrade" and "Beta" chrome** in the header is fine, but `Upgrade` is a dead button with no handler — either wire it or remove it (dead controls erode trust).

---

## The core funnel has an ordering problem

The natural mental model is **Files → process → index → ask**. But nothing guides the user through that sequence. On `ProjectDashboardPage.tsx`, all five tools are presented as equal tiles, and you can click straight into **Ask/Voice/Translate with zero files selected** — leading to a dead end with a disabled button and no explanation.

**Recommendation:** Add a lightweight **readiness state** to the dashboard:
- If no files uploaded → the only emphasized action is "Upload files." Other tools are visibly *locked* with a tooltip "Upload & index files first."
- If files exist but none indexed → emphasize "Process & index."
- If indexed → unlock the query tools.

This turns five ambiguous tiles into a guided first-run experience and kills every "why is this button gray?" moment.

---

## Page-level highlights (the rest are solid; these need attention)

| Page | Verdict | Top fix |
|---|---|---|
| **Projects** | ⚠️ Rework | Replace ID-entry with a project gallery + create flow (issue #1) |
| **Dashboard** | Good bones | Add readiness gating + tool descriptions on tiles |
| **Files** | Good, dense | Upload **progress bar**; surface chunk defaults instead of hiding all "advanced" config; the auto-selected "which file gets processed" logic (`FilesPage.tsx:56`) is opaque — show the target filename |
| **Ask** | Strong | Source citations (#4); distinguish "search results" vs "AI answer" visually; copy button on answer |
| **Voice** | Strong | **Mic-permission-denied state is missing** — if the user blocks the mic, the button just sits disabled with no explanation. Add an explicit permission prompt/error. Bigger recording indicator |
| **Translate** | Good | The file picker swaps between `<select>` and a raw text input depending on whether files exist (`TranslatePage.tsx`) — inconsistent; build one real **Select** primitive |
| **Login/Register** | Good | RegisterPage success uses neutral gray (`bg-muted`) not a success color — reads as ambiguous, not "you did it." Add "resend verification email" |

---

## Design System — small, fixable gaps

The system is consistent and well-built. To finish it, add **four missing primitives** that pages are currently faking inline:

1. **`<Toast>`** — global feedback (see issue #3).
2. **`<Select>`** — Translate redefines select styles inline; standardize it.
3. **`<EmptyState>`** — every page hand-rolls a `border-dashed bg-muted/30` box with slightly different copy. One component (icon + message + CTA) makes empty states consistent and more helpful.
4. **`<FormField>`** — inputs have **no error/validation state**. Today errors only appear on submit at the form level. Wrap label + input + inline error + hint, with `aria-invalid` styling, so validation is real-time and per-field.

Minor inconsistencies: RegisterPage success color, VoicePage recorder uses `rounded-lg` where the system uses `rounded-md`, and some pages use `AppCard` while others use raw `Card`.

---

## Accessibility (WCAG) — quick wins

Good baseline (focus rings everywhere, keyboard-operable dashboard tiles, `aria-describedby` on the ID field). Gaps:
- The `<audio>` player and file input lack `aria-label`s.
- The recording state (pulsing dot) isn't announced — add `aria-live="polite"` "Recording…" text for screen readers.
- The activity log needs a semantic landmark (`<section aria-label="Activity log">`).
- Verify contrast on `muted-foreground` text on `muted/30` backgrounds — it's borderline for WCAG AA.

---

## Recommended roadmap (impact-ordered)

**Phase 1 — Unblock the core journey (do first):**
1. Project gallery + create flow (replaces ID typing)
2. Fix the `/projects/1` hardcode
3. Add the Toast primitive and wire all async actions
4. Source citations on Ask + Voice answers

**Phase 2 — Guide & reassure:**
5. Dashboard readiness gating (lock tools until files are indexed)
6. Upload progress bar
7. Mic-permission state on Voice
8. Merge/clarify "Ask AI" vs "Agent Chat"

**Phase 3 — Systematize:**
9. EmptyState, Select, FormField primitives
10. Header breadcrumb with project name
11. Port or retire the legacy `AgentChat.jsx`
12. Accessibility pass (labels, live regions, contrast)

---

## Assumptions
- "Voxora AI" is the product name (from the header) despite the repo being named `rag-app`.
- This is a logged-in B2B knowledge tool, not consumer — so density is acceptable, but first-run guidance still matters.
- The backend already returns source/chunk metadata (the `voice-frontend-prompt.md` shows it no longer exposes `chat_history`, so citation data availability should be confirmed against the FastAPI backend).
