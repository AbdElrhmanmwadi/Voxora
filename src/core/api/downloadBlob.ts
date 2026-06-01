import type { AxiosResponse } from 'axios'

function filenameFromContentDisposition(header: string | undefined, fallback: string) {
  if (!header) return fallback
  const utf8 = header.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  if (utf8) return decodeURIComponent(utf8)
  const plain = header.match(/filename="?([^";]+)"?/i)?.[1]
  return plain ?? fallback
}

export function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function saveBlobResponse(res: AxiosResponse<Blob>, fallbackFilename: string) {
  const contentType = String(res.headers['content-type'] ?? '')
  if (contentType.includes('application/json')) {
    const text = await res.data.text()
    let message = 'Download failed.'
    try {
      const body = JSON.parse(text) as { message?: string; detail?: string }
      message = body.message ?? body.detail ?? message
    } catch {
      message = text || message
    }
    throw new Error(message)
  }

  const filename = filenameFromContentDisposition(
    res.headers['content-disposition'] as string | undefined,
    fallbackFilename
  )
  triggerBrowserDownload(res.data, filename)
}
