import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useRagStore } from '../store/useRagStore'
import AppCard from '../../../core/components/AppCard'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import Button from '../../../core/ui/Button'
import Input from '../../../core/ui/Input'

export default function AskPage() {
  const { projectId } = useParams()
  const [text, setText] = useState('')
  const [limit, setLimit] = useState(5)
  const { results, answer, loading, error, search, ask } = useRagStore()

  return (
    <div className="page-container">
      <h2 className="text-2xl font-mono neon-text-green mb-4">Ask — Project {projectId}</h2>
      <AppCard>
        <label className="block mb-2 text-sm uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Question</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="input-dark input-focus-green w-full h-28 p-3 rounded" />
        <div className="mt-2">Limit: <Input type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="inline-block w-24 ml-2" /></div>
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={() => search(projectId || '', text, limit)} disabled={loading} className="button-smooth">
            {loading ? <><LoadingSpinner size={4} /> Searching</> : 'Search'}
          </Button>
          <Button onClick={() => ask(projectId || '', text, limit)} disabled={loading} variant="ghost">
            {loading ? 'Asking...' : 'Ask'}
          </Button>
        </div>
      </AppCard>

      <div className="mt-4">
        <AppCard title="Results">
          {error && <div className="text-neon-red">{error}</div>}
          {results.length === 0 && <div className="text-[hsl(var(--muted-foreground))]">No results</div>}
          <ul className="space-y-2">
            {results.map((r, i) => (
              <li key={i} className="p-2 glass neon-border-green">
                <div className="text-sm font-mono text-[hsl(var(--muted-foreground))]">Score: {r.score}</div>
                <div className="mt-1">{r.text}</div>
              </li>
            ))}
          </ul>
        </AppCard>
      </div>

      <div className="mt-4">
        <AppCard title="Answer">
          {answer ? <div className="font-mono p-2">{answer}</div> : <div className="text-[hsl(var(--muted-foreground))]">No answer yet</div>}
        </AppCard>
      </div>
    </div>
  )
}
