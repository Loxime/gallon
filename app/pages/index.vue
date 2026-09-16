<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from 'vue'

import ImageDropzone from '../components/image-import/ImageDropzone.vue'
import ImportedImageList from '../components/image-import/ImportedImageList.vue'
import ImageGridPreview from '../components/image-grid/ImageGridPreview.vue'
import KonvaImageGridEditor from '../components/image-grid/KonvaImageGridEditor.client.vue'
import ImageFramingControls from '../components/image-grid/ImageFramingControls.vue'
import AppSidebar from '../components/layout/AppSidebar.vue'

import { useImportedImages } from '../composables/useImportedImages'
import { useImageFramings } from '../composables/useImageFramings'

import type {
  GridTemplateId,
} from '../types/grid'

import type {
  ImageImportSelection,
} from '../types/image'

import {
  DEFAULT_GRID_TEMPLATE_ID,
  GRID_TEMPLATES,
  getGridTemplateById,
} from '../utils/grid-templates'

import {
  downloadDataUrl,
} from '../utils/download'

useHead({
  title: 'gallon — Assemblage de grilles d’images',
  meta: [
    {
      name: 'description',
      content: 'Sélectionnez une grille, ajoutez vos images et exportez votre composition.',
    },
  ],
})

interface ImageGridEditorHandle {
  exportPng: () => string
}

const selectedTemplateId = ref<GridTemplateId>(
  DEFAULT_GRID_TEMPLATE_ID,
)

const imageGridEditor = ref<ImageGridEditorHandle | null>(
  null,
)

const importNotice = ref('')
const exportNotice = ref('')
const selectedImageId = ref<string | null>(null)

const {
  framings,
  getFraming,
  setFraming,
  updateFraming,
  resetFraming,
  pruneFramings,
} = useImageFramings()

const {
  images,
  addFiles,
  removeImage,
  moveImage,
  replaceImage,
  trimToLimit,
} = useImportedImages()

const selectedTemplate = computed(() => {
  return getGridTemplateById(
    selectedTemplateId.value,
  )
})

const imageCapacity = computed(() => {
  return selectedTemplate.value?.cells.length ?? 0
})

const availableImageSlots = computed(() => {
  return Math.max(
    0,
    imageCapacity.value - images.value.length,
  )
})

const isImageImportFull = computed(() => {
  return availableImageSlots.value === 0
})

const canExport = computed(() => {
  return images.value.length > 0
})

const selectedImage = computed(() => {
  if (!selectedImageId.value) {
    return undefined
  }

  return images.value.find(
    image => image.id === selectedImageId.value,
  )
})

const selectedFraming = computed(() => {
  if (!selectedImage.value) {
    return undefined
  }

  return getFraming(
    selectedImage.value.id,
  )
})

function handleSelectImage(
  imageId: string,
): void {
  selectedImageId.value = imageId
}

function handleFramingChange(
  imageId: string,
  framing: Parameters<typeof setFraming>[1],
): void {
  setFraming(
    imageId,
    framing,
  )
}

function handleZoomChange(
  zoom: number,
): void {
  if (!selectedImageId.value) {
    return
  }

  updateFraming(
    selectedImageId.value,
    {
      zoom,
    },
  )
}

function handleResetFraming(): void {
  if (!selectedImageId.value) {
    return
  }

  resetFraming(
    selectedImageId.value,
  )
}

function handleExportPng(): void {
  if (!canExport.value) {
    return
  }

  try {
    const dataUrl
      = imageGridEditor.value?.exportPng()

    if (!dataUrl) {
      throw new Error(
        'Image grid is not ready to export',
      )
    }

    downloadDataUrl(
      dataUrl,
      'gallon-grid.png',
    )

    exportNotice.value = ''
  }
  catch {
    exportNotice.value
      = 'Impossible d’exporter la grille pour le moment.'
  }
}

function getImportNotice(
  selection: ImageImportSelection,
): string {
  const unsupportedCount = selection.rejected.filter(
    rejection => rejection.reason === 'unsupported-type',
  ).length

  const limitExceededCount = selection.rejected.filter(
    rejection => rejection.reason === 'limit-exceeded',
  ).length

  if (
    unsupportedCount === 0
    && limitExceededCount === 0
  ) {
    return ''
  }

  const messages: string[] = []

  if (unsupportedCount > 0) {
    messages.push(
      `${unsupportedCount} fichier${unsupportedCount > 1 ? 's' : ''} non pris en charge`,
    )
  }

  if (limitExceededCount > 0) {
    messages.push(
      `${limitExceededCount} image${limitExceededCount > 1 ? 's' : ''} au-delà de la capacité`,
    )
  }

  return `${messages.join(' · ')}.`
}

function handleFilesSelected(files: File[]): void {
  const selection = addFiles(
    files,
    availableImageSlots.value,
  )

  importNotice.value = getImportNotice(selection)
}

function handleRemoveImage(id: string): void {
  removeImage(id)
  importNotice.value = ''
}

function handleMoveImage(
  id: string,
  targetIndex: number,
): void {
  moveImage(
    id,
    targetIndex,
  )

  importNotice.value = ''
}

function handleReplaceImage(
  id: string,
  file: File,
): void {
  const replacement = replaceImage(
    id,
    file,
  )

  if (!replacement) {
    importNotice.value
      = 'Le fichier de remplacement n’est pas pris en charge.'
    return
  }

  resetFraming(id)

  if (selectedImageId.value === id) {
    selectedImageId.value
      = replacement.id
  }

  importNotice.value = ''
}

watch(
  () => images.value.map(image => image.id),
  (imageIds) => {
    pruneFramings(imageIds)

    if (
      selectedImageId.value
      && !imageIds.includes(selectedImageId.value)
    ) {
      selectedImageId.value = null
    }
  },
  {
    immediate: true,
  },
)

watch(imageCapacity, (capacity) => {
  const removedCount = trimToLimit(capacity)

  if (removedCount > 0) {
    importNotice.value = `${removedCount} image${removedCount > 1 ? 's ont' : ' a'} été retirée${removedCount > 1 ? 's' : ''} pour correspondre à la nouvelle grille.`
  }
})
</script>

<template>
  <div class="app-shell">
    <AppSidebar
      v-model="selectedTemplateId"
      :templates="GRID_TEMPLATES"
    />

    <main
      id="accueil"
      class="home-page"
    >
      <section class="hero">
        <h1 class="hero__title">
          Créateur de grille d’images
        </h1>

        <p class="hero__description">
          Assemblez plusieurs images dans une grille et exportez votre composition en quelques étapes.
        </p>
      </section>

      <section class="editor">
        <div class="editor__controls">
<section
            id="images"
            class="image-import image-import--first"
          >
          <div class="image-import__heading">
            <div>
              <h2 class="editor__title">
                Ajoutez vos images
              </h2>

              <p class="editor__description">
                {{ images.length }} / {{ imageCapacity }} images
              </p>
            </div>
          </div>

          <ImageDropzone
            :disabled="isImageImportFull"
            @files-selected="handleFilesSelected"
          />

          <p
            v-if="isImageImportFull"
            class="image-import__status"
          >
            Toutes les cellules de la grille sont remplies.
          </p>

          <p
            v-if="importNotice"
            class="image-import__notice"
            role="status"
            aria-live="polite"
            data-import-notice
          >
            {{ importNotice }}
          </p>

          <ImportedImageList
            :images="images"
            :selected-image-id="selectedImageId"
            @select="handleSelectImage"
            @remove="handleRemoveImage"
            @move="handleMoveImage"
            @replace="handleReplaceImage"
          />
        </section>
      </div>

      <div class="editor__workspace">
        <div class="workspace-heading">
          <div>
            <h2 class="editor__title">
              Aperçu
            </h2>

            <p
              v-if="selectedTemplate"
              class="editor__description"
              data-selected-template
            >
              {{ selectedTemplate.label }}
            </p>
          </div>

          <button
            type="button"
            class="export-button"
            :disabled="!canExport"
            data-export-png
            @click="handleExportPng"
          >
            Télécharger le PNG
          </button>
        </div>

        <div class="workspace">
          <ClientOnly v-if="selectedTemplate">
            <KonvaImageGridEditor
              ref="imageGridEditor"
              class="workspace__preview"
              :template="selectedTemplate"
              :images="images"
              :framings="framings"
              :selected-image-id="selectedImageId"
              @select="handleSelectImage"
              @framing-change="handleFramingChange"
            />

            <template #fallback>
              <ImageGridPreview
                class="workspace__preview"
                :template="selectedTemplate"
                :images="images"
                :framings="framings"
                :selected-image-id="selectedImageId"
              />
            </template>
          </ClientOnly>
        </div>

        <p
          v-if="exportNotice"
          class="export-notice"
          role="status"
          aria-live="polite"
          data-export-notice
        >
          {{ exportNotice }}
        </p>

        <ImageFramingControls
          v-if="selectedImage && selectedFraming"
          :image-name="selectedImage.file.name"
          :framing="selectedFraming"
          @zoom-change="handleZoomChange"
          @reset="handleResetFraming"
        />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);

  min-height: 100vh;

  background: #f8fafc;
}

.home-page {
  min-width: 0;
  padding: 24px 32px 64px;
}

.hero {
  width: min(100%, 1180px);
  margin: 0 auto;
  padding: clamp(48px, 7vw, 80px) 32px;

  text-align: center;

  border: 1px solid #e2e8f0;
  border-radius: 28px;

  background: #ffffff;

  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.05);
}

.hero__title {
  max-width: 900px;
  margin: 0 auto;

  color: #1f2937;
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 700;
  line-height: 1.04;
  letter-spacing: -0.045em;
}

.hero__description {
  max-width: 650px;
  margin: 22px auto 0;

  color: #64748b;
  font-size: 17px;
  line-height: 1.6;
}

.editor {
  display: grid;
  grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);
  gap: 40px;

  width: min(100%, 1180px);
  margin: 40px auto 0;
}

.editor__controls,
.editor__workspace {
  min-width: 0;
}

.editor__title {
  margin: 0;

  font-size: 20px;
  line-height: 1.3;
}

.editor__description {
  margin: 8px 0 24px;

  color: #64748b;
  line-height: 1.5;
}

.image-import {
  margin-top: 40px;

  scroll-margin-top: 24px;
}

.image-import--first {
  margin-top: 0;
}

.image-import__heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.image-import__status,
.image-import__notice {
  margin: 12px 0 0;

  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.image-import__notice {
  color: #92400e;
}

.workspace-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.export-button {
  padding: 10px 14px;

  color: #ffffff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;

  border: 0;
  border-radius: 8px;

  background: #0f172a;

  cursor: pointer;
}

.export-button:hover:not(:disabled) {
  background: #1e293b;
}

.export-button:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 2px;
}

.export-button:disabled {
  color: #94a3b8;

  background: #e2e8f0;

  cursor: default;
}

.export-notice {
  margin: 12px 0 0;

  color: #b91c1c;
  font-size: 13px;
  line-height: 1.5;
}

.workspace {
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 520px;
  padding: 40px;

  border: 1px solid #e2e8f0;
  border-radius: 16px;

  background: #ffffff;
}

.workspace__preview {
  width: min(100%, 520px);
}

@media (max-width: 900px) {
  .home-page {
    padding-inline: 24px;
  }

  .editor {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .workspace-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .export-button {
    width: 100%;
  }

  .workspace {
    min-height: auto;
    padding: 24px;
  }
}

@media (max-width: 720px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .home-page {
    padding: 20px 16px 48px;
  }

  .hero {
    padding: 42px 20px;

    border-radius: 22px;
  }

  .hero__title {
    font-size: clamp(34px, 10vw, 46px);
  }
}

@media (max-width: 520px) {
  .workspace {
    padding: 16px;

    border-radius: 12px;
  }
}
</style>
