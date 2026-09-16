export function downloadDataUrl(
  dataUrl: string,
  filename: string,
): void {
  if (!dataUrl.startsWith('data:')) {
    throw new TypeError(
      'A valid data URL is required',
    )
  }

  if (filename.trim().length === 0) {
    throw new TypeError(
      'A download filename is required',
    )
  }

  if (typeof document === 'undefined') {
    throw new Error(
      'Downloads require a browser environment',
    )
  }

  const link = document.createElement('a')

  link.href = dataUrl
  link.download = filename
  link.hidden = true

  document.body.append(link)

  try {
    link.click()
  }
  finally {
    link.remove()
  }
}
