import { sanitizeFilename } from './sanitize'

export interface DownloadOptions {
  filename: string
  data: string | Blob
  mimeType: string
}

export function useDownload () {
  const download = ({ filename, data, mimeType }: DownloadOptions): void => {
    const blob = typeof data === 'string' ? new Blob([data], { type: mimeType }) : data
    const a = document.createElement('a')

    const objectUrl = window.URL.createObjectURL(blob)
    a.download = sanitizeFilename(filename)
    a.href = objectUrl
    a.style.display = 'none'

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl)
    }, 0)
  }

  return {
    download
  }
}
