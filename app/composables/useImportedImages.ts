import {
  onBeforeUnmount,
  readonly,
  ref,
} from 'vue'

import type {
  ImageImportSelection,
  ImportedImage,
} from '../types/image'

import {
  moveArrayItem,
} from '../utils/array-order'

import {
  isSupportedImageFile,
  selectImageFiles,
} from '../utils/image-import'

export function useImportedImages() {
  const images = ref<ImportedImage[]>([])

  function createImportedImage(
    file: File,
  ): ImportedImage {
    return {
      id: crypto.randomUUID(),
      file,
      objectUrl: URL.createObjectURL(file),
    }
  }

  function addFiles(
    files: readonly File[],
    availableSlots: number,
  ): ImageImportSelection {
    const selection = selectImageFiles(
      files,
      availableSlots,
    )

    for (const file of selection.accepted) {
      images.value.push(
        createImportedImage(file),
      )
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

    const [image] = images.value.splice(
      index,
      1,
    )

    if (!image) {
      return false
    }

    URL.revokeObjectURL(
      image.objectUrl,
    )

    return true
  }

  function moveImage(
    id: string,
    targetIndex: number,
  ): boolean {
    const sourceIndex = images.value.findIndex(
      image => image.id === id,
    )

    if (
      sourceIndex === -1
      || !Number.isInteger(targetIndex)
      || targetIndex < 0
      || targetIndex >= images.value.length
      || sourceIndex === targetIndex
    ) {
      return false
    }

    images.value = moveArrayItem(
      images.value,
      sourceIndex,
      targetIndex,
    )

    return true
  }

  function replaceImage(
    id: string,
    file: File,
  ): ImportedImage | undefined {
    if (!isSupportedImageFile(file)) {
      return undefined
    }

    const index = images.value.findIndex(
      image => image.id === id,
    )

    if (index === -1) {
      return undefined
    }

    const previousImage = images.value[index]

    if (!previousImage) {
      return undefined
    }

    const replacement
      = createImportedImage(file)

    images.value.splice(
      index,
      1,
      replacement,
    )

    URL.revokeObjectURL(
      previousImage.objectUrl,
    )

    return replacement
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
      URL.revokeObjectURL(
        image.objectUrl,
      )
    }

    return removedImages.length
  }

  function clearImages(): void {
    for (const image of images.value) {
      URL.revokeObjectURL(
        image.objectUrl,
      )
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
    moveImage,
    replaceImage,
    trimToLimit,
    clearImages,
  }
}
