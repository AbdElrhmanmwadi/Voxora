import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useFilesStore } from '../store/useFilesStore'
import AppCard from '../../../core/components/AppCard'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import Button from '../../../core/ui/Button'
import Input from '../../../core/ui/Input'
import Badge from '../../../core/ui/Badge'
import Progress from '../../../core/ui/Progress'
import EmptyState from '../../../core/ui/EmptyState'
import StatusBadge from '../../../core/components/StatusBadge'
import { useI18n } from '../../../core/i18n'
import { validateUploadFile } from '../api/filesApi'

function formatFileSize(size: number, t: (key: string) => string) {
  if (!Number.isFinite(size) || size <= 0) return `0 ${t('files.size.B')}`
  const units = [t('files.size.B'), t('files.size.KB'), t('files.size.MB'), t('files.size.GB')]
  let value = size
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export default function FilesPage() {
  const { projectId } = useParams()
  const activeProjectId = projectId ?? ''
  const [selected, setSelected] = useState<File | null>(null)
  const [fileValidationError, setFileValidationError] = useState<string | null>(null)
  const [chunkSize, setChunkSize] = useState(500)
  const [overlap, setOverlap] = useState(50)
  const [doReset, setDoReset] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { t } = useI18n()

  const {
    fileId,
    files,
    selectedFileIds,
    selectedFileOutboundIds,
    isLoadingFiles,
    isUploading,
    uploadProgress,
    isProcessing,
    isIndexing,
    loadFiles,
    toggleFileSelection,
    setSelectedFileIds,
    clearSelectedFiles,
    uploadFile,
    processFile,
    pushIndex,
    logs,
    error
  } = useFilesStore()

  const selectedFiles = useMemo(
    () => files.filter((file) => selectedFileIds.includes(String(file.file_id))),
    [files, selectedFileIds]
  )
  const processingFileId = selectedFileOutboundIds[0] ?? selectedFileIds[0] ?? fileId

  useEffect(() => {
    if (activeProjectId) void loadFiles(activeProjectId)
  }, [activeProjectId, loadFiles])

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">{t('files.page.kicker')}</p>
          <h1 className="page-title">{t('files.page.title')}</h1>
          <p className="page-description">{t('files.page.description')}</p>
        </div>
        <StatusBadge status={selectedFileIds.length > 0 ? 'success' : isLoadingFiles ? 'loading' : 'idle'} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <AppCard title={t('files.list.title')}>
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{t('files.list.files', { count: files.length })}</Badge>
                  <Badge variant="outline">{t('files.list.selected', { count: selectedFileIds.length })}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedFileIds(activeProjectId, files.map((file) => String(file.file_id)))}
                    disabled={!files.length || isLoadingFiles}
                  >
                    {t('files.list.selectAll')}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => clearSelectedFiles(activeProjectId)} disabled={!selectedFileIds.length}>
                    {t('files.list.clear')}
                  </Button>
                </div>
              </div>

              {isLoadingFiles && <div className="rounded-md bg-muted/30 p-3 text-sm text-muted-foreground">{t('files.list.loading')}</div>}
              {!isLoadingFiles && files.length === 0 && (
                <EmptyState title={t('files.list.empty')} description={t('files.list.emptyDescription')} />
              )}
              <div className="divide-y rounded-md border">
                {files.map((file) => {
                  const itemId = String(file.file_id)
                  const checked = selectedFileIds.includes(itemId)
                  return (
                    <label key={file.file_id} className="flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/30">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFileSelection(activeProjectId, itemId)}
                        className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{file.file_name}</span>
                          {file.processed ? (
                            <Badge variant="success">{t('files.list.processed')}</Badge>
                          ) : (
                            <Badge variant="warning">{t('files.list.notProcessed')}</Badge>
                          )}
                        </span>
                        <span className="mt-0.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(file.file_size, t)}</span>
                          {file.processed && <span>· {t('files.list.chunks', { count: file.chunk_count ?? 0 })}</span>}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          </AppCard>

          <AppCard title={t('files.upload.title')}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="field-label" htmlFor="asset-file">{t('files.upload.label')}</label>
                <Input id="asset-file" type="file" accept=".txt,.md,.pdf,.docx,.csv,.html" onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  setSelected(file)
                  setFileValidationError(file ? validateUploadFile(file) : null)
                }} />
                <p className="field-hint">{t('files.upload.hint')}</p>
              </div>
              {selected && (
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{t('files.upload.selected', { name: '' }).split(':')[0]}: </span>
                  <span className="font-medium">{selected.name}</span>
                </div>
              )}
              {fileValidationError && <p role="alert" className="text-sm text-destructive">{fileValidationError}</p>}
              <Button onClick={() => selected && uploadFile(activeProjectId, selected)} disabled={!selected || Boolean(fileValidationError) || isUploading || !activeProjectId}>
                {isUploading ? <><LoadingSpinner size={4} /> {t('files.upload.uploading')}</> : t('files.upload.submit')}
              </Button>
              {isUploading && uploadProgress !== null && (
                <div className="space-y-2" aria-live="polite">
                  <Progress value={uploadProgress} aria-label="Upload progress" />
                  <p className="field-hint">
                    {uploadProgress < 100 ? t('files.upload.uploadingProgress', { percent: uploadProgress }) : t('files.upload.uploadComplete')}
                  </p>
                </div>
              )}
            </div>
          </AppCard>

          <AppCard title={t('files.process.title')}>
            <div className="space-y-4">
              <div className="flex flex-col gap-2 rounded-md border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-muted-foreground">{t('files.process.fileToProcess')}</span>
                <code className="break-all rounded bg-background px-2 py-1 font-mono text-xs">{processingFileId ?? t('files.process.selectFile')}</code>
              </div>
              {processingFileId && (
                <Link
                  to={`/projects/${activeProjectId}/translate?fileId=${encodeURIComponent(processingFileId)}`}
                  className="inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {t('files.process.translateFile')}
                </Link>
              )}

              <Button variant="outline" size="sm" onClick={() => setShowAdvanced((s) => !s)}>
                {showAdvanced ? t('files.process.hideAdvanced') : t('files.process.showAdvanced')}
              </Button>

              {showAdvanced && (
                <div className="grid gap-4 rounded-md border bg-muted/10 p-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="field-label" htmlFor="chunk-size">{t('files.process.chunkSize')}</label>
                    <Input id="chunk-size" type="number" min={1} value={chunkSize} onChange={(e) => setChunkSize(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <label className="field-label" htmlFor="overlap">{t('files.process.overlap')}</label>
                    <Input id="overlap" type="number" min={0} value={overlap} onChange={(e) => setOverlap(Number(e.target.value))} />
                  </div>
                  <label className="flex min-h-10 items-center gap-2 text-sm font-medium sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={doReset}
                      onChange={(e) => setDoReset(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                    />
                    {t('files.process.resetIndex')}
                  </label>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() =>
                    processFile(activeProjectId, {
                      file_id: processingFileId || '',
                      chunk_size: Number.isFinite(chunkSize) && chunkSize > 0 ? chunkSize : 500,
                      overlap_size: Number.isFinite(overlap) && overlap >= 0 ? overlap : 0,
                      do_reset: doReset
                    })
                  }
                  disabled={!processingFileId || isProcessing}
                >
                  {isProcessing ? <><LoadingSpinner size={4} /> {t('files.process.processing')}</> : t('files.process.processFile')}
                </Button>
                <Button onClick={() => pushIndex(activeProjectId, doReset)} disabled={isIndexing || !activeProjectId} variant="outline">
                  {isIndexing ? <><LoadingSpinner size={4} /> {t('files.process.indexing')}</> : t('files.process.pushIndex')}
                </Button>
              </div>
              {selectedFiles.length > 1 && (
                <p className="field-hint">{t('files.process.hint')}</p>
              )}
            </div>
          </AppCard>
        </div>

        <AppCard title={t('files.activityLog.title')}>
          <div className="space-y-3">
            {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{t('common.error')}: {error}</div>}
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{t('files.activityLog.events', { count: logs.length })}</Badge>
            </div>
            <ul className="log-panel" aria-label={t('files.activityLog.title')} aria-live="polite">
              {logs.length === 0 && <li>{t('files.activityLog.empty')}</li>}
              {logs.map((l, i) => (
                <li key={i} className="break-words">{l}</li>
              ))}
            </ul>
          </div>
        </AppCard>
      </div>
    </div>
  )
}
