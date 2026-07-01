import React, { useState } from 'react'
import { submitFeedback, type FeedbackRating } from '../api/feedbackApi'
import { extractError } from '../../../core/api/apiException'
import { toast } from '../../../core/ui/toast'
import { cn } from '../../../core/utils/cn'

interface FeedbackButtonsProps {
  projectId: string
  question: string
  answer: string
  // Present for agent-chat answers; null for direct RAG answers.
  sessionId?: number | string | null
  className?: string
}

// 👍/👎 rating under an assistant answer. 👍 records immediately; 👎 reveals an
// optional comment box and records a single row when the user confirms — so a
// dislike-with-note stays one row (no double-counting against CSAT).
export default function FeedbackButtons({
  projectId,
  question,
  answer,
  sessionId = null,
  className,
}: FeedbackButtonsProps) {
  const [rating, setRating] = useState<FeedbackRating | null>(null)
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)
  const [showComment, setShowComment] = useState(false)
  const [comment, setComment] = useState('')

  // The backend requires both texts; without a question there is nothing to rate.
  const canSubmit = Boolean(projectId && question.trim() && answer.trim())
  if (!canSubmit) return null

  async function send(value: FeedbackRating, note: string | null) {
    if (sending || done) return
    setSending(true)
    setRating(value) // optimistic selection
    try {
      await submitFeedback(projectId, { question, answer, rating: value, sessionId, comment: note })
      setDone(true)
      setShowComment(false)
      toast.success('Thanks for your feedback')
    } catch (e) {
      toast.error('Could not send feedback', extractError(e))
      setRating(null) // revert on failure
      if (value === -1) setShowComment(false)
    } finally {
      setSending(false)
    }
  }

  const thumb = (value: FeedbackRating, label: string, glyph: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      disabled={done || sending}
      aria-pressed={rating === value}
      aria-label={label}
      title={label}
      className={cn(
        'rounded-md px-1.5 py-0.5 text-sm transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-60',
        rating === value && 'bg-muted text-foreground'
      )}
    >
      {glyph}
    </button>
  )

  return (
    <div className={cn('mt-2', className)}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {thumb(1, 'Helpful', '👍', () => void send(1, null))}
        {/* 👎: show selected state right away, defer the write until the note step */}
        {thumb(-1, 'Not helpful', '👎', () => {
          setRating(-1)
          setShowComment(true)
        })}
        {done && <span className="text-xs">Thanks for your feedback</span>}
      </div>

      {showComment && !done && (
        <div className="mt-2 space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What went wrong? (optional)"
            rows={2}
            dir="auto"
            className="w-full rounded-md border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void send(-1, comment.trim() || null)}
              disabled={sending}
              className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {sending ? 'Sending…' : 'Send feedback'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowComment(false)
                setComment('')
                setRating(null)
              }}
              disabled={sending}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
