import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useRagStore } from '../store/useRagStore'
import { useFilesStore } from '../../files/store/useFilesStore'
import AppCard from '../../../core/components/AppCard'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import Button from '../../../core/ui/Button'
import Input from '../../../core/ui/Input'
import Textarea from '../../../core/ui/Textarea'
import Badge from '../../../core/ui/Badge'
import Skeleton from '../../../core/ui/Skeleton'
import EmptyState from '../../../core/ui/EmptyState'
import { toast } from '../../../core/ui/toast'
import FeedbackButtons from '../../feedback/components/FeedbackButtons'
import VoiceRecordButton from '../../voice/components/VoiceRecordButton'
import { useI18n } from '../../../core/i18n'
import type { SearchResultItem } from '../../../types/api.types'

function sourceFrom(meta: SearchResultItem['meta_data']) {
  const get = (key: string) => {
    const v = meta?.[key]
    return typeof v === 'string' || typeof v === 'number' ? String(v) : undefined
  }
  const file = get('file_name') ?? get('source') ?? get('file_id')
  const page = get('page') ?? get('page_number')
  return { file, page }
}

export default function AskPage() {
  const { projectId } = useParams()
  const activeProjectId = projectId ?? ''
  const [text, setText] = useState('')
  const [limit, setLimit] = useState(5)
  const { results, answer, askedQuestion, loading, error, search, ask } = useRagStore()
  const { files, selectedFileIds, isLoadingFiles, loadFiles } = useFilesStore()
  const { t } = useI18n()

  const selectedFiles = useMemo(
    () => files.filter((file) => selectedFileIds.includes(file.file_id)),
    [files, selectedFileIds]
  )
  const canRun = Boolean(activeProjectId && text.trim() && selectedFileIds.length > 0)

  useEffect(() => {
    if (activeProjectId) void loadFiles(activeProjectId)
  }, [activeProjectId, loadFiles])

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">{t('ask.page.kicker')}</p>
          <h1 className="page-title">{t('ask.page.title')}</h1>
          <p className="page-description">{t('ask.page.description')}</p>
        </div>
        <Badge variant="secondary">{t('ask.page.results', { count: results.length })}</Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <AppCard title={t('ask.question.title')}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="field-label" htmlFor="question">{t('ask.question.prompt')}</label>
                <Textarea id="question" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('ask.question.placeholder')} />
              </div>
              <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-end">
                <div className="space-y-2">
                  <label className="field-label" htmlFor="limit">{t('ask.question.resultLimit')}</label>
                  <Input id="limit" type="number" min={1} value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <VoiceRecordButton
                    disabled={loading}
                    onTranscript={(transcript) => {
                      setText(transcript)
                      toast.success(t('ask.voice.added'))
                    }}
                    onError={(message) => toast.error(message)}
                  />
                  <Button onClick={() => search(activeProjectId, text, limit, selectedFileIds)} disabled={loading || !canRun}>
                    {loading ? <><LoadingSpinner size={4} /> {t('ask.question.searching')}</> : t('ask.question.search')}
                  </Button>
                  <Button onClick={() => ask(activeProjectId, text, limit, selectedFileIds)} disabled={loading || !canRun} variant="outline">
                    {loading ? <><LoadingSpinner size={4} /> {t('ask.question.asking')}</> : t('ask.question.askAI')}
                  </Button>
                </div>
              </div>
            </div>
          </AppCard>

          <AppCard title={t('ask.results.title')}>
            <div className="space-y-3">
              {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              {loading && (
                <div className="space-y-3">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              )}
              {!loading && results.length === 0 && (
                <EmptyState title={t('ask.results.empty')} description={t('ask.results.emptyDescription')} />
              )}
              <div className="space-y-3">
                {results.map((r, i) => {
                  const { file, page } = sourceFrom(r.meta_data)
                  return (
                    <div key={i} className="rounded-md border bg-background p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="default">#{i + 1}</Badge>
                        {file && <Badge variant="outline" className="max-w-full truncate">{file}</Badge>}
                        {page && <Badge variant="outline">{t('ask.results.page', { page })}</Badge>}
                        <Badge variant="outline" className="ms-auto">{t('ask.results.score', { score: typeof r.score === 'number' ? r.score.toFixed(3) : r.score })}</Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </AppCard>
        </div>

        <div className="space-y-6">
          <AppCard title={t('ask.context.title')}>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={selectedFileIds.length > 0 ? 'success' : 'warning'}>{t('ask.context.selected', { count: selectedFileIds.length })}</Badge>
                {isLoadingFiles && <span className="text-sm text-muted-foreground">{t('ask.context.loading')}</span>}
              </div>
              {selectedFiles.length > 0 ? (
                <div className="divide-y rounded-md border">
                  {selectedFiles.map((file) => (
                    <div key={file.file_id} className="flex flex-col gap-1 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium">{file.file_name}</span>
                      <code className="break-all font-mono text-[11px] text-muted-foreground">{file.file_id}</code>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                  {t('ask.context.empty')} <Link to={`/projects/${activeProjectId}/files`} className="font-semibold text-primary underline-offset-4 hover:underline">{t('ask.context.openFiles')}</Link>
                </div>
              )}
            </div>
          </AppCard>

          <AppCard title={t('ask.answer.title')}>
            {answer ? (
              <div className="space-y-3">
                <div className="rounded-md border bg-muted/20 p-4 text-sm leading-relaxed">{answer}</div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    {t('ask.answer.grounded', { count: selectedFiles.length })}
                    {selectedFiles.length > 0 && t('ask.answer.groundedList', { list: selectedFiles.map((f) => f.file_name).join(', ') })}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      void navigator.clipboard?.writeText(answer).then(() => toast.success(t('ask.answer.copied')))
                    }}
                  >
                    {t('ask.answer.copy')}
                  </Button>
                </div>
                <FeedbackButtons
                  projectId={activeProjectId}
                  question={askedQuestion ?? ''}
                  answer={answer}
                />
              </div>
            ) : (
              <EmptyState title={t('ask.answer.empty')} description={t('ask.answer.emptyDescription')} />
            )}
          </AppCard>
        </div>
      </div>
    </div>
  )
}
