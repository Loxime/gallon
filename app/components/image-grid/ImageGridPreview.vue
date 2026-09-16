<script setup lang="ts">
import {
  computed,
  shallowRef,
  watch,
} from 'vue'

import type {
  GridTemplate,
} from '../../types/grid'

import type {
  ImportedImage,
} from '../../types/image'

import type {
  ImageFraming,
} from '../../types/image-framing'

import type {
  LoadedImageResource,
} from '../../utils/image-loader'

import {
  loadImageResource,
} from '../../utils/image-loader'

import {
  DEFAULT_IMAGE_FRAMING,
  calculateFramedImagePlacement,
} from '../../utils/image-framing'

const props = withDefaults(defineProps<{
  template: GridTemplate
  images: readonly ImportedImage[]
  framings?: Readonly<Record<string, ImageFraming>>
  selectedImageId?: string | null
}>(), {
  framings: () => ({}),
  selectedImageId: null,
})

const emit = defineEmits<{
  select: [imageId: string]
}>()

const loadedImages = shallowRef(
  new Map<string, LoadedImageResource>(),
)

let loadGeneration = 0

watch(
  () => props.images.map(image => ({
    id: image.id,
    objectUrl: image.objectUrl,
  })),
  async (images) => {
    const generation = ++loadGeneration

    if (images.length === 0) {
      loadedImages.value = new Map()
      return
    }

    const resources = await Promise.all(
      images.map(async (image) => {
        try {
          const resource = await loadImageResource(
            image.objectUrl,
          )

          return {
            id: image.id,
            resource,
          }
        }
        catch {
          return {
            id: image.id,
            resource: undefined,
          }
        }
      }),
    )

    if (generation !== loadGeneration) {
      return
    }

    loadedImages.value = new Map(
      resources
        .filter(
          (
            item,
          ): item is {
            id: string
            resource: LoadedImageResource
          } => item.resource !== undefined,
        )
        .map(item => [
          item.id,
          item.resource,
        ]),
    )
  },
  {
    immediate: true,
  },
)

const cells = computed(() => {
  return props.template.cells.map(
    (cell, index) => {
      const image = props.images[index]

      if (!image) {
        return {
          cell,
          image: undefined,
          imageStyle: undefined,
        }
      }

      const resource = loadedImages.value.get(
        image.id,
      )

      if (!resource) {
        return {
          cell,
          image,
          imageStyle: undefined,
        }
      }

      const target = {
        width:
          cell.width
          * props.template.aspectRatio.width,

        height:
          cell.height
          * props.template.aspectRatio.height,
      }

      const framing
        = props.framings[image.id]
          ?? DEFAULT_IMAGE_FRAMING

      const placement
        = calculateFramedImagePlacement(
          resource.dimensions,
          target,
          framing,
        )

      return {
        cell,
        image,
        imageStyle: {
          left: `${placement.offsetX * 100}%`,
          top: `${placement.offsetY * 100}%`,
          width: `${placement.width * 100}%`,
          height: `${placement.height * 100}%`,
        },
      }
    },
  )
})
</script>

<template>
  <div
    class="image-grid-preview"
    :style="{
      aspectRatio: `${template.aspectRatio.width} / ${template.aspectRatio.height}`,
    }"
  >
    <button
      v-for="item in cells"
      :key="item.cell.id"
      type="button"
      class="image-grid-preview__cell"
      :class="{
        'image-grid-preview__cell--selected':
          item.image?.id === selectedImageId,
      }"
      :style="{
        left: `${item.cell.x * 100}%`,
        top: `${item.cell.y * 100}%`,
        width: `${item.cell.width * 100}%`,
        height: `${item.cell.height * 100}%`,
      }"
      :data-cell-id="item.cell.id"
      :disabled="!item.image"
      :aria-pressed="
        item.image
          ? item.image.id === selectedImageId
          : undefined
      "
      data-grid-cell
      @click="
        item.image
          && emit('select', item.image.id)
      "
    >
      <img
        v-if="item.image && item.imageStyle"
        class="image-grid-preview__image"
        :src="item.image.objectUrl"
        alt=""
        :style="item.imageStyle"
        :data-image-id="item.image.id"
        data-grid-image
      >
    </button>
  </div>
</template>

<style scoped>
.image-grid-preview {
  position: relative;
  width: 100%;
  overflow: hidden;

  border: 1px solid #cbd5e1;
  border-radius: 8px;

  background: #e2e8f0;
}

.image-grid-preview__cell {
  position: absolute;
  overflow: hidden;
  padding: 0;

  border: 2px solid #ffffff;
  background: #cbd5e1;
}

.image-grid-preview__cell:not(:disabled) {
  cursor: pointer;
}

.image-grid-preview__cell:focus-visible {
  z-index: 2;

  outline: 3px solid #2563eb;
  outline-offset: -3px;
}

.image-grid-preview__cell--selected {
  z-index: 1;

  box-shadow: inset 0 0 0 3px #2563eb;
}

.image-grid-preview__image {
  position: absolute;

  max-width: none;

  object-fit: fill;
}
</style>
