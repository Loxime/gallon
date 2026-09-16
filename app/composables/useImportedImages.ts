import {
  onBeforeUnmount,
  readonly,
  ref,
} from 'vue'

import type {
  ImageImportSelection,
  ImportedImage,
} from '../types/image'

import { selectImageFiles } from '../utils/image-import'

export function useImportedImages() {
  const images = ref<ImportedImage[]>([])

  function addFiles(
    files: readonly File[],
    availableSlots: number,
  ): ImageImportSelection {
    const selection = selectImageFiles(
      files,
      availableSlots,
    )

    for (const file of selection.accepted) {
      images.value.push({
        id: crypto.randomUUID(),
        file,
        objectUrl: URL.createObjectURL(file),
      })
    }

    return selection
  }

  function removeImage(id: string): boolean {
    const index = images.value.findIndex(
      image => image.id === id,
    )

    if (index === -1) {
      return false
    }

    const [image] = images.value.splice(index, 1)

    if (!image) {
      return false
    }

    URL.revokeObjectURL(image.objectUrl)

    return true
  }

  function trimToLimit(limit: number): number {
    const normalizedLimit = Number.isFinite(limit)
      ? Math.max(0, Math.floor(limit))
      : 0

    if (images.value.length <= normalizedLimit) {
      return 0
    }

    const removedImages = images.value.splice(
      normalizedLimit,
    )

    for (const image of removedImages) {
      URL.revokeObjectURL(image.objectUrl)
    }

    return removedImages.length
  }

  function clearImages(): void {
    for (const image of images.value) {
      URL.revokeObjectURL(image.objectUrl)
    }

    images.value = []
  }

  onBeforeUnmount(() => {
    clearImages()
  })

  return {
    images: readonly(images),
    addFiles,
    removeImage,
    trimToLimit,
    clearImages,
  }
}
