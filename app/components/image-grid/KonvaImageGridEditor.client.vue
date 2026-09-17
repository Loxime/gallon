<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue'

import {
  Group as VGroup,
  Image as VImage,
  Layer as VLayer,
  Rect as VRect,
  Stage as VStage,
} from 'vue-konva'

import ImageGridPreview from './ImageGridPreview.vue'

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
  ImageDimensions,
} from '../../types/image-placement'

import type {
  LoadedImageResource,
} from '../../utils/image-loader'

import {
  DEFAULT_IMAGE_FRAMING,
  calculateFramedImagePlacement,
  calculateFramingFromPosition,
  constrainFramedImagePosition,
} from '../../utils/image-framing'

import {
  loadImageResource,
} from '../../utils/image-loader'

import {
  calculateSpacedGridCellRect,
} from '../../utils/grid-spacing'

import type {
  ExportableKonvaStage,
} from '../../utils/png-export'

import {
  exportKonvaStageAsPng,
} from '../../utils/png-export'

const props = withDefaults(defineProps<{
  template: GridTemplate
  images: readonly ImportedImage[]
  assignments?: ImageAssignments | null
  framings?: Readonly<Record<string, ImageFraming>>
  selectedImageId?: string | null
  selectedCellId?: string | null
  moveSourceImageId?: string | null
  spacing?: number
}>(), {
  assignments: null,
  framings: () => ({}),
  selectedImageId: null,
  selectedCellId: null,
  moveSourceImageId: null,
  spacing: 0,
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
  framingChange: [
    imageId: string,
    framing: ImageFraming,
  ]
}>()

function hasCanvasContext(): boolean {
  if (typeof document === 'undefined') {
    return false
  }

  try {
    const canvas = document.createElement('canvas')

    return canvas.getContext('2d') !== null
  }
  catch {
    return false
  }
}

const supportsCanvas = hasCanvasContext()

interface KonvaDragEvent {
  target: {
    x: () => number
    y: () => number
  }
}

interface KonvaStageComponent {
  getNode: () => ExportableKonvaStage
}

const container = ref<HTMLElement>()
const stageComponent = ref<KonvaStageComponent>()
const stageWidth = ref(480)
const dragOverCellId = ref<string | null>(null)

const loadedImages = shallowRef(
  new Map<string, LoadedImageResource>(),
)

let resizeObserver: ResizeObserver | undefined
let loadGeneration = 0

const stageHeight = computed(() => {
  return (
    stageWidth.value
    * props.template.aspectRatio.height
    / props.template.aspectRatio.width
  )
})

onMounted(() => {
  if (
    !supportsCanvas
    || !container.value
    || typeof ResizeObserver === 'undefined'
  ) {
    return
  }

  resizeObserver = new ResizeObserver(
    ([entry]) => {
      if (!entry) {
        return
      }

      stageWidth.value = Math.max(
        1,
        entry.contentRect.width,
      )
    },
  )

  resizeObserver.observe(container.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

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
      const cellRect
        = calculateSpacedGridCellRect(
          cell,
          {
            width: stageWidth.value,
            height: stageHeight.value,
          },
          props.spacing,
        )

      const {
        x,
        y,
        width,
        height,
      } = cellRect

      const assignedImageId
        = props.assignments?.[cell.id]

      const image = props.assignments
        ? props.images.find(
            image => image.id === assignedImageId,
          )
        : props.images[index]

      const resource = image
        ? loadedImages.value.get(image.id)
        : undefined

      const target: ImageDimensions = {
        width,
        height,
      }

      if (
        !image
        || !resource
        || width <= 0
        || height <= 0
      ) {
        return {
          cell,
          cellRect,
          image,
          resource,
          target,
          x,
          y,
          width,
          height,
          imageConfig: undefined,
        }
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

      const imageWidth
        = placement.width * width

      const imageHeight
        = placement.height * height

      return {
        cell,
        cellRect,
        image,
        resource,
        target,
        x,
        y,
        width,
        height,

        imageConfig: {
          x: placement.offsetX * width,
          y: placement.offsetY * height,
          width: imageWidth,
          height: imageHeight,
          image: resource.element,
          draggable: !props.moveSourceImageId,

          dragBoundFunc: (
            position: {
              x: number
              y: number
            },
          ) => {
            return constrainFramedImagePosition(
              {
                x,
                y,
                width,
                height,
              },
              {
                width: imageWidth,
                height: imageHeight,
              },
              position,
            )
          },
        },
      }
    },
  )
})

const emptyCells = computed(() => {
  return cells.value.filter(
    item => !item.image,
  )
})

function exportPng(): string {
  if (!supportsCanvas) {
    throw new Error(
      'PNG export requires canvas support',
    )
  }

  const stage = stageComponent.value?.getNode()

  if (!stage) {
    throw new Error(
      'Image grid is not ready to export',
    )
  }

  return exportKonvaStageAsPng(
    stage,
  )
}

defineExpose({
  exportPng,
})

function handleSelect(
  imageId: string,
  cellId?: string,
): void {
  if (
    props.moveSourceImageId
    && cellId
  ) {
    emit(
      'moveToCell',
      cellId,
    )

    return
  }

  if (cellId) {
    emit(
      'selectCell',
      cellId,
    )
  }

  emit(
    'select',
    imageId,
  )
}

function handleEmptyCellClick(
  cellId: string,
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

  emit(
    'requestImport',
    cellId,
  )
}

function handleEmptyCellDrop(
  cellId: string,
  event: DragEvent,
): void {
  dragOverCellId.value = null

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

function handleDragEnd(
  item: (typeof cells.value)[number],
  event: KonvaDragEvent,
): void {
  if (
    !item.image
    || !item.resource
    || item.width <= 0
    || item.height <= 0
  ) {
    return
  }

  const currentFraming
    = props.framings[item.image.id]
      ?? DEFAULT_IMAGE_FRAMING

  const framing
    = calculateFramingFromPosition(
      item.resource.dimensions,
      item.target,
      currentFraming,
      {
        x:
          event.target.x()
          / item.width,

        y:
          event.target.y()
          / item.height,
      },
    )

  emit(
    'framingChange',
    item.image.id,
    framing,
  )
}
</script>

<template>
  <div
    ref="container"
    class="konva-grid-editor"
    :class="{
      'konva-grid-editor--fallback':
        !supportsCanvas,
    }"
    data-konva-grid-editor
  >
    <ImageGridPreview
      v-if="!supportsCanvas"
      :template="template"
      :images="images"
      :assignments="assignments"
      :framings="framings"
      :selected-image-id="selectedImageId"
      :selected-cell-id="selectedCellId"
      :move-source-image-id="moveSourceImageId"
      :spacing="spacing"
      @select="handleSelect"
      @select-cell="emit('selectCell', $event)"
      @request-import="emit('requestImport', $event)"
      @move-to-cell="emit('moveToCell', $event)"
      @file-drop="
        (cellId, file) =>
          emit(
            'fileDrop',
            cellId,
            file,
          )
      "
    />

    <template v-else>
      <VStage
        ref="stageComponent"
        :config="{
          width: stageWidth,
          height: stageHeight,
        }"
      >
        <VLayer>
          <VRect
            :config="{
              x: 0,
              y: 0,
              width: stageWidth,
              height: stageHeight,
              fill: '#ffffff',
              listening: false,
            }"
          />

          <VGroup
            v-for="item in cells"
            :key="item.cell.id"
            :config="{
              x: item.x,
              y: item.y,
              clipX: 0,
              clipY: 0,
              clipWidth: item.width,
              clipHeight: item.height,
            }"
          >
            <VRect
              :config="{
                x: 0,
                y: 0,
                width: item.width,
                height: item.height,
                fill: '#cbd5e1',
              }"
            />

            <VImage
              v-if="item.image && item.imageConfig"
              :config="item.imageConfig"
              @click="
                handleSelect(
                  item.image.id,
                  item.cell.id,
                )
              "
              @tap="
                handleSelect(
                  item.image.id,
                  item.cell.id,
                )
              "
              @dragstart="
                handleSelect(
                  item.image.id,
                  item.cell.id,
                )
              "
              @dragend="
                handleDragEnd(
                  item,
                  $event,
                )
              "
            />

            <VRect
              v-if="
                item.image
                  && (
                    item.image.id === selectedImageId
                    || item.cell.id === selectedCellId
                  )
              "
              :config="{
                x: 0,
                y: 0,
                width: item.width,
                height: item.height,
                stroke: '#475569',
                strokeWidth: 4,
                listening: false,
                name: 'editor-overlay',
              }"
            />
          </VGroup>
        </VLayer>
      </VStage>

      <div
        class="konva-grid-editor__empty-cells"
        aria-label="Cellules vides"
      >
        <button
          v-for="item in emptyCells"
          :key="item.cell.id"
          type="button"
          class="konva-grid-editor__empty-cell"
          :class="{
            'konva-grid-editor__empty-cell--selected':
              item.cell.id === selectedCellId,

            'konva-grid-editor__empty-cell--drag-over':
              item.cell.id === dragOverCellId,
          }"
          :style="{
            left: `${item.x}px`,
            top: `${item.y}px`,
            width: `${item.width}px`,
            height: `${item.height}px`,
          }"
          aria-label="Ajouter une image"
          :data-cell-id="item.cell.id"
          data-empty-grid-cell
          @click="
            handleEmptyCellClick(
              item.cell.id,
            )
          "
          @dragenter.prevent="
            dragOverCellId = item.cell.id
          "
          @dragover.prevent
          @dragleave="
            dragOverCellId = null
          "
          @drop.prevent="
            handleEmptyCellDrop(
              item.cell.id,
              $event,
            )
          "
        >
          <strong>+</strong>
          <span>Ajouter</span>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.konva-grid-editor {
  position: relative;

  width: 100%;
  overflow: hidden;

  border: 1px solid #cbd5e1;
  border-radius: 8px;

  background: #ffffff;
}

.konva-grid-editor--fallback {
  border: 0;

  background: transparent;
}

.konva-grid-editor__empty-cells {
  position: absolute;
  inset: 0;

  pointer-events: none;
}

.konva-grid-editor__empty-cell {
  position: absolute;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  padding: 0;

  color: #64748b;

  border: 0;

  background: rgba(241, 245, 249, 0.96);

  cursor: pointer;
  pointer-events: auto;

  transition:
    background-color 120ms ease,
    box-shadow 120ms ease;
}

.konva-grid-editor__empty-cell:hover {
  background: rgba(226, 232, 240, 0.98);
}

.konva-grid-editor__empty-cell:focus-visible {
  z-index: 2;

  outline: 3px solid #475569;
  outline-offset: -3px;
}

.konva-grid-editor__empty-cell--selected {
  box-shadow:
    inset 0 0 0 3px #475569;
}

.konva-grid-editor__empty-cell--drag-over {
  z-index: 3;

  background: #e2e8f0;

  box-shadow:
    inset 0 0 0 3px #64748b;
}

.konva-grid-editor__empty-cell strong {
  font-size: 26px;
  font-weight: 400;
  line-height: 1;
}

.konva-grid-editor__empty-cell span {
  font-size: 11px;
  font-weight: 600;
}
</style>
