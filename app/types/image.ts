export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export type SupportedImageMimeType =
  typeof SUPPORTED_IMAGE_MIME_TYPES[number]

export interface ImportedImage {
  readonly id: string
  readonly file: File
  readonly objectUrl: string
}

export type ImageImportRejectionReason =
  | 'unsupported-type'
  | 'limit-exceeded'

export interface RejectedImageFile {
  readonly file: File
  readonly reason: ImageImportRejectionReason
}

export interface ImageImportSelection {
  readonly accepted: readonly File[]
  readonly rejected: readonly RejectedImageFile[]
}
