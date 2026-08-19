import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { persistTranslationJob, useTranslationStore } from '../store/useTranslationStore'
import { downloadTranslation } from '../api/translationApi'
import { getProjectFileId } from '../../files/fileIdStorage'
import { useFilesStore } from '../../files/store/useFilesStore'
import { ApiClientError } from '../../../core/api/axiosClient'
import AppCard from '../../../core/components/AppCard'
import Button from '../../../core/ui/Button'
import Input from '../../../core/ui/Input'
import Select from '../../../core/ui/Select'
import Badge from '../../../core/ui/Badge'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import StatusBadge from '../../../core/components/StatusBadge'
import { useI18n } from '../../../core/i18n'
import { cn } from '../../../core/utils/cn'

const LANG_OPTIONS = [
  { value: 'en', labelKey: 'translate.languages.en' },
  { value: 'ar', labelKey: 'translate.languages.ar' }
] as const

type LangCode = (typeof LANG_OPTIONS)[number]['value']

function resolveFileId(
  projectId: string,
  urlFileId: string | null,
  storeFileId: string | null,
  storeProjectId: string | null
): string {
  if (urlFileId?.trim()) return urlFileId.trim()
  if (storeFileId && storeProjectId === projectId) return storeFileId
  return (getProjectFileId(projectId) ?? '').trim()
}

function isInProgress(status: string | null) {
  return status === 'processing' || status === 'pending' || status === 'queued'
}

function isTerminalSuccess(status: string | null) {
  return status === 'completed' || status === 'success' || status === 'done'
}

export default function TranslatePage() {
  const { projectId } = useParams()
  const [searchParams] = useSearchParams()
  const { t } = useI18n()
  const uploadedFileId = useFilesStore((s) => s.fileId)
  const uploadedProjectId = useFilesStore((s) => s.fileProjectId)
  const files = useFilesStore((s) => s.files)
  const selectedFileIds = useFilesStore((s) => s.selectedFileIds)
  const isLoadingFiles = useFilesStore((s) => s.isLoadingFiles)
  const loadFiles = useFilesStore((s) => s.loadFiles)
  const [fileId, setFileId] = useState('')
  const [source, setSource] = useState<LangCode>('en')
  const [target, setTarget] = useState<LangCode>('ar')
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const { jobId, status, resultFileId, jobErrorMessage, creating, checking, createJob, checkStatus, restoreJob, error } =
    useTranslationStore()
  const [processingSince, setProcessingSince] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const urlFileId = searchParams.get('fileId')
  const suggestedFileId = projectId
    ? ((): string => {
        if (selectedFileIds[0]) {
          const sel = files.find((f) => f.file_id === selectedFileIds[0])
          return sel?.file_name ?? selectedFileIds[0]
        }
        return resolveFileId(projectId, urlFileId, uploadedFileId, uploadedProjectId)
      })()
    : ''
  const selectedFile = useMemo(() => files.find((file) => file.file_id === fileId || file.file_name === fileId), [files, fileId])

  useEffect(() => {
    if (projectId) void loadFiles(projectId)
  }, [projectId, loadFiles])

  useEffect(() => {
    if (!suggestedFileId) return
    setFileId(suggestedFileId)
  }, [suggestedFileId])

  useEffect(() => {
    if (projectId) restoreJob(projectId)
  }, [projectId, restoreJob])

  useEffect(() => {
    if (projectId && jobId && status) persistTranslationJob(projectId, jobId, status)
  }, [projectId, jobId, status])

  useEffect(() => {
    if (isInProgress(status)) {
      setProcessingSince((prev) => prev ?? Date.now())
      return
    }
    setProcessingSince(null)
    setElapsedSeconds(0)
  }, [status])

  useEffect(() => {
    if (!processingSince) return
    const tick = () => setElapsedSeconds(Math.floor((Date.now() - processingSince) / 1000))
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [processingSince])

  useEffect(() => {
    if (!jobId || !isInProgress(status)) return
    void checkStatus(jobId, { silent: true })
    const timer = window.setInterval(() => {
      void checkStatus(jobId, { silent: true })
    }, 2000)
    return () => window.clearInterval(timer)
  }, [jobId, status, checkStatus])

  const elapsedLabel = useMemo(() => {
    const m = Math.floor(elapsedSeconds / 60)
    const s = elapsedSeconds % 60
    return m > 0 ? t('translate.processing.minutes', { m, s }) : t('translate.processing.seconds', { s })
  }, [elapsedSeconds, t])

  const headerBadgeStatus = useMemo(() => {
    if (creating || isInProgress(status)) return 'loading' as const
    if (status === 'failed') return 'error' as const
    if (isTerminalSuccess(status)) return 'success' as const
    return 'idle' as const
  }, [creating, status])

  const jobStatusVariant = useMemo(() => {
    if (status === 'failed') return 'destructive' as const
    if (isInProgress(status)) return 'warning' as const
    if (isTerminalSuccess(status)) return 'success' as const
    return 'secondary' as const
  }, [status])

  const languagesValid = source !== target

  async function handleDownload() {
    if (!jobId) return
    setDownloading(true)
    setDownloadError(null)
    try {
      const fallback =
        resultFileId && resultFileId.includes('_')
          ? resultFileId.slice(resultFileId.indexOf('_') + 1)
          : 'translated.txt'
      await downloadTranslation(jobId, fallback)
    } catch (err) {
      setDownloadError(err instanceof ApiClientError ? err.message : err instanceof Error ? err.message : 'Download failed.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">{t('translate.page.kicker')}</p>
          <h1 className="page-title">{t('translate.page.title')}</h1>
          <p className="page-description">{t('translate.page.description')}</p>
        </div>
        <StatusBadge status={headerBadgeStatus} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <AppCard title={t('translate.createJob.title')}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="field-label" htmlFor="file-id">{t('translate.createJob.projectFile')}</label>
              {files.length > 0 ? (
                <Select id="file-id" value={fileId} onChange={(e) => setFileId(e.target.value)}>
                  <option value="">{t('translate.createJob.selectFile')}</option>
                  {files.map((file) => (
                    <option key={file.file_id} value={file.file_name ?? file.file_id}>
                      {file.file_name}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  id="file-id"
                  value={fileId}
                  onChange={(e) => setFileId(e.target.value)}
                  placeholder={isLoadingFiles ? t('translate.createJob.loadingFiles') : t('translate.createJob.uploadFirst')}
                />
              )}
              {selectedFile ? (
                <p className="field-hint">{t('translate.createJob.selectedFile', { name: selectedFile.file_name, id: selectedFile.file_id })}</p>
              ) : suggestedFileId ? (
                <p className="field-hint">{t('translate.createJob.usingSelected')}</p>
              ) : (
                <p className="field-hint">
                  {t('translate.createJob.selectOnFilesPage')}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="field-label" htmlFor="source-lang">{t('translate.createJob.sourceLang')}</label>
                <Select id="source-lang" value={source} onChange={(e) => setSource(e.target.value as LangCode)}>
                  {LANG_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="field-label" htmlFor="target-lang">{t('translate.createJob.targetLang')}</label>
                <Select id="target-lang" value={target} onChange={(e) => setTarget(e.target.value as LangCode)}>
                  {LANG_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                  ))}
                </Select>
              </div>
            </div>
            {!languagesValid && <p className="text-sm text-destructive">{t('translate.createJob.differentRequired')}</p>}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => createJob(projectId || '', fileId, source, target)}
                disabled={creating || isInProgress(status) || !(String(fileId ?? '').trim()) || !languagesValid}
              >
                {creating ? <><LoadingSpinner size={4} /> {t('translate.createJob.creating')}</> : t('translate.createJob.create')}
              </Button>
              <Button onClick={() => jobId && checkStatus(jobId)} disabled={!jobId || checking} variant="outline">
                {checking ? <><LoadingSpinner size={4} /> {t('translate.createJob.checking')}</> : t('translate.createJob.checkStatus')}
              </Button>
            </div>
          </div>
        </AppCard>

        <AppCard title={t('translate.jobStatus.title')}>
          <div className="space-y-4">
            {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            {isInProgress(status) && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p className="flex items-center gap-2 font-semibold">
                  <LoadingSpinner size={4} />
                  {t('translate.processing.title')} {elapsedSeconds > 0 && <span className="font-normal opacity-80">{t('translate.processing.elapsed', { time: elapsedLabel })}</span>}
                </p>
                <p className="mt-1 text-xs opacity-80">{t('translate.processing.hint')}</p>
              </div>
            )}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-md border bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">{t('translate.jobStatus.jobId')}</span>
                <code className="break-all text-end font-mono text-xs">{jobId ?? t('translate.jobStatus.notCreated')}</code>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">{t('translate.jobStatus.status')}</span>
                <Badge variant={jobStatusVariant} className={cn(isInProgress(status) && 'capitalize')}>
                  {status ?? t('translate.jobStatus.waiting')}
                </Badge>
              </div>
              {status === 'failed' && jobErrorMessage && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {jobErrorMessage}
                </div>
              )}
              <div className="space-y-2 rounded-md border bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">{t('translate.jobStatus.resultFile')}</span>
                <code className="block break-all font-mono text-xs">{resultFileId ?? t('translate.jobStatus.notAvailable')}</code>
                {jobId && isTerminalSuccess(status) && (
                  <Button type="button" className="w-full" variant="outline" disabled={downloading} onClick={() => void handleDownload()}>
                    {downloading ? <><LoadingSpinner size={4} /> {t('translate.jobStatus.downloading')}</> : t('translate.jobStatus.download')}
                  </Button>
                )}
                {downloadError && <p className="text-sm text-destructive">{downloadError}</p>}
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  )
}
