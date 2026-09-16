import {
  SUPPORTED_IMAGE_MIME_TYPES,
  type ImageImportSelection,
  type SupportedImageMimeType,
} from '../types/image'

export function isSupportedImageMimeType(
  mimeType: string,
): mimeType is SupportedImageMimeType {
  return SUPPORTED_IMAGE_MIME_TYPES.some(
    supportedType => supportedType === mimeType,
  )
}

export function isSupportedImageFile(file: File): boolean {
  return isSupportedImageMimeType(file.type)
}

export function selectImageFiles(
  files: readonly File[],
  availableSlots: number,
): ImageImportSelection {
  const accepted: File[] = []
  const rejected: ImageImportSelection['rejected'][number][] = []

  const normalizedAvailableSlots = Math.max(
    0,
    Math.floor(availableSlots),
  )

  for (const file of files) {
    if (!isSupportedImageFile(file)) {
      rejected.push({
        file,
        reason: 'unsupported-type',
      })

      continue
    }

    if (accepted.length >= normalizedAvailableSlots) {
      rejected.push({
        file,
        reason: 'limit-exceeded',
      })

      continue
    }

    accepted.push(file)
  }

  return {
    accepted,
    rejected,
  }
}
