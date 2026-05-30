import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useRagStore } from '../store/useRagStore'
import AppCard from '../../../core/components/AppCard'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import Button from '../../../core/ui/Button'
import Input from '../../../core/ui/Input'
import Textarea from '../../../core/ui/Textarea'
import Badge from '../../../core/ui/Badge'
import Skeleton from '../../../core/ui/Skeleton'

export default function AskPage() {
  const { projectId } = useParams()
  const [text, setText] = useState('')
  const [limit, setLimit] = useState(5)
  const { results, answer, loading, error, search, ask } = useRagStore()

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">Retrieval</p>
          <h1 className="page-title">Ask project {projectId}</h1>
          <p className="page-description">Search indexed content or generate a grounded answer using the same project API calls.</p>
        </div>
        <Badge variant="secondary">{results.length} results</Badge>
      </div>

      <AppCard title="Question">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="field-label" htmlFor="question">Prompt</label>
            <Textarea id="question" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a question about this project's indexed content..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-end">
            <div className="space-y-2">
              <label className="field-label" htmlFor="limit">Result limit</label>
              <Input id="limit" type="number" min={1} value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => search(projectId || '', text, limit)} disabled={loading || !text.trim()}>
                {loading ? <><LoadingSpinner size={4} /> Searching</> : 'Search'}
              </Button>
              <Button onClick={() => ask(projectId || '', text, limit)} disabled={loading || !text.trim()} variant="outline">
                {loading ? <><LoadingSpinner size={4} /> Asking</> : 'Ask AI'}
              </Button>
            </div>
          </div>
        </div>
      </AppCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <AppCard title="Search results">
          <div className="space-y-3">
            {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            {loading && (
              <div className="space-y-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            )}
            {!loading && results.length === 0 && <div className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">No results yet. Run a search to inspect matching context.</div>}
            <ul className="space-y-3">
              {results.map((r, i) => (
                <li key={i} className="rounded-md border bg-background p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <Badge variant="outline">Score {r.score}</Badge>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{r.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </AppCard>

        <AppCard title="Answer">
          {answer ? (
            <div className="rounded-md border bg-muted/30 p-4 text-sm leading-6">{answer}</div>
          ) : (
            <div className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">No answer generated yet.</div>
          )}
        </AppCard>
      </div>
    </div>
  )
}
