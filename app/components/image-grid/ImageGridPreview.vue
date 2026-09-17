<script setup lang="ts">
import {
  computed,
  ref,
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
  ImageAssignments,
} from '../../types/image-assignment'

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
  assignments?: ImageAssignments | null
  framings?: Readonly<Record<string, ImageFraming>>
  selectedImageId?: string | null
  selectedCellId?: string | null
  moveSourceImageId?: string | null
}>(), {
  assignments: null,
  framings: () => ({}),
  selectedImageId: null,
  selectedCellId: null,
  moveSourceImageId: null,
})

const emit = defineEmits<{
  select: [imageId: string]
  selectCell: [cellId: string]
  requestImport: [cellId: string]
  moveToCell: [cellId: string]
  fileDrop: [
    cellId: string,
    file: File,
  ]
}>()

const loadedImages = shallowRef(
  new Map<string, LoadedImageResource>(),
)

const dragOverCellId = ref<string | null>(null)

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
      const assignedImageId
        = props.assignments?.[cell.id]

      const image = props.assignments
        ? props.images.find(
            image => image.id === assignedImageId,
          )
        : props.images[index]

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

function handleCellClick(
  cellId: string,
  imageId?: string,
): void {
  if (props.moveSourceImageId) {
    emit(
      'moveToCell',
      cellId,
    )

    return
  }

  emit(
    'selectCell',
    cellId,
  )

  if (imageId) {
    emit(
      'select',
      imageId,
    )

    return
  }

  emit(
    'requestImport',
    cellId,
  )
}

function handleDragEnter(
  cellId: string,
  hasImage: boolean,
): void {
  if (hasImage) {
    return
  }

  dragOverCellId.value = cellId
}

function handleDragLeave(
  cellId: string,
): void {
  if (dragOverCellId.value === cellId) {
    dragOverCellId.value = null
  }
}

function handleDrop(
  cellId: string,
  hasImage: boolean,
  event: DragEvent,
): void {
  dragOverCellId.value = null

  if (hasImage) {
    return
  }

  const file = event.dataTransfer?.files[0]

  if (!file) {
    return
  }

  emit(
    'fileDrop',
    cellId,
    file,
  )
}

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
          item.cell.id === selectedCellId
          || item.image?.id === selectedImageId,

        'image-grid-preview__cell--drag-over':
          item.cell.id === dragOverCellId,

        'image-grid-preview__cell--empty':
          !item.image,

        'image-grid-preview__cell--move-target':
          Boolean(moveSourceImageId),
      }"
      :style="{
        left: `${item.cell.x * 100}%`,
        top: `${item.cell.y * 100}%`,
        width: `${item.cell.width * 100}%`,
        height: `${item.cell.height * 100}%`,
      }"
      :aria-label="
        item.image
          ? `Ajuster ${item.image.file.name}`
          : 'Ajouter une image'
      "
      :aria-pressed="
        item.cell.id === selectedCellId
        || item.image?.id === selectedImageId
      "
      :data-cell-id="item.cell.id"
      :data-assigned-image-id="
        item.image?.id
      "
      :data-empty-grid-cell="
        !item.image
          ? ''
          : undefined
      "
      data-grid-cell
      @click="
        handleCellClick(
          item.cell.id,
          item.image?.id,
        )
      "
      @dragenter.prevent="
        handleDragEnter(
          item.cell.id,
          Boolean(item.image),
        )
      "
      @dragover.prevent
      @dragleave="
        handleDragLeave(item.cell.id)
      "
      @drop.prevent="
        handleDrop(
          item.cell.id,
          Boolean(item.image),
          $event,
        )
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

      <span
        v-if="!item.image"
        class="image-grid-preview__add"
        aria-hidden="true"
      >
        <strong>+</strong>
        <span>Ajouter</span>
      </span>
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

  cursor: pointer;

  transition:
    background-color 120ms ease,
    box-shadow 120ms ease;
}

.image-grid-preview__cell--empty {
  background: #f1f5f9;
}

.image-grid-preview__cell--empty:hover {
  background: #e2e8f0;
}

.image-grid-preview__cell:focus-visible {
  z-index: 2;

  outline: 3px solid #475569;
  outline-offset: -3px;
}

.image-grid-preview__cell--selected {
  z-index: 1;

  box-shadow:
    inset 0 0 0 3px #475569;
}

.image-grid-preview__cell--move-target {
  cursor: crosshair;
}

.image-grid-preview__cell--move-target:hover {
  z-index: 3;

  box-shadow:
    inset 0 0 0 3px #64748b;
}

.image-grid-preview__cell--drag-over {
  z-index: 3;

  background: #e2e8f0;

  box-shadow:
    inset 0 0 0 3px #64748b;
}

.image-grid-preview__image {
  position: absolute;

  max-width: none;

  object-fit: fill;
}

.image-grid-preview__add {
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  color: #64748b;

  pointer-events: none;
}

.image-grid-preview__add strong {
  font-size: 26px;
  font-weight: 400;
  line-height: 1;
}

.image-grid-preview__add span {
  font-size: 11px;
  font-weight: 600;
}
</style>
