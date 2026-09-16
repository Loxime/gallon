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
  ImageDimensions,
} from '../../types/image-placement'

import type {
  LoadedImageResource,
} from '../../utils/image-loader'

import {
  DEFAULT_IMAGE_FRAMING,
  calculateFramedImagePlacement,
  calculateFramingFromPosition,
} from '../../utils/image-framing'

import {
  loadImageResource,
} from '../../utils/image-loader'

import type {
  ExportableKonvaStage,
} from '../../utils/png-export'

import {
  exportKonvaStageAsPng,
} from '../../utils/png-export'

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

interface DragEvent {
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
      const x = cell.x * stageWidth.value
      const y = cell.y * stageHeight.value
      const width = cell.width * stageWidth.value
      const height = cell.height * stageHeight.value

      const image = props.images[index]
      const resource = image
        ? loadedImages.value.get(image.id)
        : undefined

      const target: ImageDimensions = {
        width:
          cell.width
          * props.template.aspectRatio.width,

        height:
          cell.height
          * props.template.aspectRatio.height,
      }

      if (!image || !resource) {
        return {
          cell,
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
          draggable: true,

          dragBoundFunc: (
            position: {
              x: number
              y: number
            },
          ) => {
            const minimumX
              = x + width - imageWidth

            const maximumX = x

            const minimumY
              = y + height - imageHeight

            const maximumY = y

            return {
              x: Math.min(
                maximumX,
                Math.max(
                  minimumX,
                  position.x,
                ),
              ),

              y: Math.min(
                maximumY,
                Math.max(
                  minimumY,
                  position.y,
                ),
              ),
            }
          },
        },
      }
    },
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
): void {
  emit(
    'select',
    imageId,
  )
}

function handleDragEnd(
  item: (typeof cells.value)[number],
  event: DragEvent,
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
      :framings="framings"
      :selected-image-id="selectedImageId"
      @select="handleSelect"
    />

    <VStage
      v-else
      ref="stageComponent"
      :config="{
        width: stageWidth,
        height: stageHeight,
      }"
    >
      <VLayer>
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
              stroke: '#ffffff',
              strokeWidth: 2,
            }"
          />

          <VImage
            v-if="item.image && item.imageConfig"
            :config="item.imageConfig"
            @click="handleSelect(item.image.id)"
            @tap="handleSelect(item.image.id)"
            @dragstart="handleSelect(item.image.id)"
            @dragend="handleDragEnd(item, $event)"
          />

          <VRect
            v-if="
              item.image
                && item.image.id === selectedImageId
            "
            :config="{
              x: 0,
              y: 0,
              width: item.width,
              height: item.height,
              stroke: '#2563eb',
              strokeWidth: 4,
              listening: false,
              name: 'editor-overlay',
            }"
          />
        </VGroup>
      </VLayer>
    </VStage>
  </div>
</template>

<style scoped>
.konva-grid-editor {
  width: 100%;
  overflow: hidden;

  border: 1px solid #cbd5e1;
  border-radius: 8px;

  background: #e2e8f0;
}

.konva-grid-editor--fallback {
  border: 0;

  background: transparent;
}
</style>
