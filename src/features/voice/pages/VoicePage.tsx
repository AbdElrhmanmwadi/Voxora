import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useAudioRecorder from '../hooks/useAudioRecorder'
import { useVoiceStore } from '../store/useVoiceStore'
import { useFilesStore } from '../../files/store/useFilesStore'
import AppCard from '../../../core/components/AppCard'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import Badge from '../../../core/ui/Badge'
import EmptyState from '../../../core/ui/EmptyState'
import StatusBadge from '../../../core/components/StatusBadge'
import { useI18n } from '../../../core/i18n'

export default function VoicePage() {
  const { projectId } = useParams()
  const activeProjectId = projectId ?? ''
  const { t } = useI18n()
  const { start, stop: stopRecording, recording, error: micError } = useAudioRecorder()
  const { transcript, answer, streaming, failed, error, sendAudio, retry, stop: stopStream } = useVoiceStore()
  const { files, selectedFileIds, isLoadingFiles, loadFiles } = useFilesStore()
  const [lastBlobUrl, setLastBlobUrl] = useState<string | null>(null)

  const selectedFiles = useMemo(
    () => files.filter((file) => selectedFileIds.includes(file.file_id)),
    [files, selectedFileIds]
  )
  const hasSelectedFiles = selectedFileIds.length > 0

  useEffect(() => {
    if (activeProjectId) void loadFiles(activeProjectId)
  }, [activeProjectId, loadFiles])

  useEffect(() => {
    return () => {
      if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl)
    }
  }, [lastBlobUrl])

  useEffect(() => () => stopStream(), [stopStream])

  async function handleStop() {
    const blob = await stopRecording()
    const url = URL.createObjectURL(blob)
    setLastBlobUrl(url)
    if (!hasSelectedFiles) return
    await sendAudio(activeProjectId, blob)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">{t('voice.page.kicker')}</p>
          <h1 className="page-title">{t('voice.page.title')}</h1>
          <p className="page-description">{t('voice.page.description')}</p>
        </div>
        <StatusBadge status={recording || streaming ? 'loading' : transcript ? 'success' : 'idle'} />
      </div>

      <div className="rounded-md border bg-card">
        <div className="border-b p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                recording ? 'bg-destructive/10 ring-2 ring-destructive/30' :
                streaming ? 'bg-primary/10 ring-2 ring-primary/30' :
                'bg-muted'
              }`}>
                {recording ? (
                  <span className="h-3 w-3 rounded-full bg-destructive animate-pulse-soft" />
                ) : streaming ? (
                  <LoadingSpinner size={5} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-bold font-display">
                  {recording ? t('voice.recorder.recording') : streaming ? t('voice.recorder.processing') : t('voice.recorder.ready')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {recording ? t('voice.recorder.recordingHint') :
                   streaming ? t('voice.recorder.processingHint') :
                   hasSelectedFiles ? t('voice.recorder.readyHint') : t('voice.recorder.selectFilesFirst')}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => void start()} disabled={recording || streaming || !hasSelectedFiles}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
                {t('voice.recorder.record')}
              </Button>
              {streaming ? (
                <Button onClick={stopStream} variant="outline">{t('voice.recorder.stop')}</Button>
              ) : (
                <Button onClick={handleStop} disabled={!recording} variant="outline">
                  {recording ? <><LoadingSpinner size={4} /> {t('voice.recorder.stopping')}</> : t('voice.recorder.stop')}
                </Button>
              )}
            </div>
          </div>
          {micError && (
            <div role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {micError}
            </div>
          )}
        </div>

        <div className="grid gap-0 divide-y xl:grid-cols-[minmax(0,1fr)_420px] xl:divide-x xl:divide-y-0">
          <div className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground font-display mb-3">{t('voice.context.title')}</h3>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant={hasSelectedFiles ? 'success' : 'warning'}>{t('voice.context.selectedFiles', { count: selectedFileIds.length })}</Badge>
              {isLoadingFiles && <span className="text-sm text-muted-foreground">{t('voice.context.loading')}</span>}
            </div>
            {selectedFiles.length > 0 ? (
              <div className="divide-y rounded-md border">
                {selectedFiles.map((file) => (
                  <div key={file.file_id} className="truncate px-3 py-2 text-sm font-medium">{file.file_name}</div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('voice.context.selectBeforeRecording')} <Link to={`/projects/${activeProjectId}/files`} className="font-semibold text-primary underline-offset-4 hover:underline">{t('voice.context.openFiles')}</Link>
              </p>
            )}
            {lastBlobUrl && (
              <div className="mt-4 space-y-2">
                <Badge variant="secondary">{t('voice.context.lastRecording')}</Badge>
                <audio src={lastBlobUrl} controls className="w-full" aria-label={t('voice.context.lastRecording')} />
              </div>
            )}
          </div>

          <div className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground font-display mb-3">{t('voice.transcript.title')}</h3>
            <div className="space-y-3">
              {streaming && !transcript && (
                <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">{t('voice.transcript.processing')}</div>
              )}
              {error && (
                <div className="flex items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <span>{error}</span>
                  {failed && (
                    <Button onClick={() => void retry()} variant="outline" className="shrink-0">{t('common.retry')}</Button>
                  )}
                </div>
              )}
              {transcript ? (
                <div className="rounded-md border bg-muted/20 p-4 text-sm leading-relaxed">{transcript}</div>
              ) : (
                !streaming && <EmptyState title={t('voice.transcript.empty')} description={t('voice.transcript.emptyDescription')} className="p-4" />
              )}
            </div>
          </div>
        </div>
      </div>

      <AppCard title={t('voice.answer.title')}>
        {answer ? (
          <div className="rounded-md border bg-muted/20 p-4 text-sm leading-relaxed">
            {answer}
            {streaming && <span className="ms-0.5 inline-block h-4 w-2 animate-pulse-soft bg-primary/60 align-middle" />}
          </div>
        ) : streaming ? (
          <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">{t('voice.answer.generating')}</div>
        ) : (
          <EmptyState title={t('voice.answer.empty')} description={t('voice.answer.emptyDescription')} />
        )}
      </AppCard>
    </div>
  )
}
