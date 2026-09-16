import {
  readonly,
  ref,
} from 'vue'

import type {
  ImageFraming,
} from '../types/image-framing'

import {
  DEFAULT_IMAGE_FRAMING,
} from '../utils/image-framing'

export function useImageFramings() {
  const framings = ref<Record<string, ImageFraming>>({})

  function getFraming(
    imageId: string,
  ): ImageFraming {
    return framings.value[imageId]
      ?? DEFAULT_IMAGE_FRAMING
  }

  function setFraming(
    imageId: string,
    framing: ImageFraming,
  ): void {
    framings.value = {
      ...framings.value,

      [imageId]: {
        ...framing,
      },
    }
  }

  function updateFraming(
    imageId: string,
    changes: Partial<ImageFraming>,
  ): void {
    setFraming(
      imageId,
      {
        ...getFraming(imageId),
        ...changes,
      },
    )
  }

  function resetFraming(
    imageId: string,
  ): void {
    if (!(imageId in framings.value)) {
      return
    }

    framings.value = Object.fromEntries(
      Object.entries(framings.value).filter(
        ([existingImageId]) => existingImageId !== imageId,
      ),
    )
  }

  function pruneFramings(
    imageIds: readonly string[],
  ): void {
    const validImageIds = new Set(imageIds)

    const nextFramings: Record<
      string,
      ImageFraming
    > = {}

    for (
      const [imageId, framing]
      of Object.entries(framings.value)
    ) {
      if (validImageIds.has(imageId)) {
        nextFramings[imageId] = framing
      }
    }

    framings.value = nextFramings
  }

  return {
    framings: readonly(framings),
    getFraming,
    setFraming,
    updateFraming,
    resetFraming,
    pruneFramings,
  }
}
