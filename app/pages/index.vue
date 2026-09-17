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
import { useImageAssignments } from '../composables/useImageAssignments'

import type {
  GridTemplateId,
} from '../types/grid'

import {
  SUPPORTED_IMAGE_MIME_TYPES,
} from '../types/image'

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
const selectedCellId = ref<string | null>(null)
const moveSourceImageId = ref<string | null>(null)
const gridSpacing = ref(0)

const pendingCellImportId = ref<string | null>(null)

const cellImportInput
  = ref<HTMLInputElement | null>(null)

const selectedImageReplaceInput
  = ref<HTMLInputElement | null>(null)

const acceptedImageTypes
  = SUPPORTED_IMAGE_MIME_TYPES.join(',')

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

const {
  assignments,
  assignImage,
  moveImageToCell,
  replaceImage: replaceImageAssignment,
  assignSequentially,
  syncAssignments,
  getCellIdForImage,
} = useImageAssignments()

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
  if (
    moveSourceImageId.value
    && moveSourceImageId.value !== imageId
  ) {
    moveSourceImageId.value = null
  }

  selectedImageId.value = imageId

  selectedCellId.value
    = getCellIdForImage(imageId)
      ?? null
}

function handleSelectCell(
  cellId: string,
): void {
  selectedCellId.value = cellId

  selectedImageId.value
    = assignments.value[cellId]
      ?? null
}

function handleRequestCellImport(
  cellId: string,
): void {
  if (assignments.value[cellId]) {
    return
  }

  selectedCellId.value = cellId
  selectedImageId.value = null
  pendingCellImportId.value = cellId

  cellImportInput.value?.click()
}

function handleCellFile(
  cellId: string,
  file: File,
): void {
  if (assignments.value[cellId]) {
    return
  }

  const previousImageIds = new Set(
    images.value.map(
      image => image.id,
    ),
  )

  const selection = addFiles(
    [file],
    1,
  )

  importNotice.value
    = getImportNotice(selection)

  const importedImage = images.value.find(
    image => !previousImageIds.has(image.id),
  )

  if (!importedImage) {
    return
  }

  assignImage(
    cellId,
    importedImage.id,
  )

  selectedCellId.value = cellId
  selectedImageId.value = importedImage.id
}

function handleCellImportChange(
  event: Event,
): void {
  const input
    = event.target as HTMLInputElement

  const file = input.files?.[0]
  const cellId = pendingCellImportId.value

  input.value = ''
  pendingCellImportId.value = null

  if (
    !file
    || !cellId
  ) {
    return
  }

  handleCellFile(
    cellId,
    file,
  )
}

function handleMoveModeToggle(): void {
  if (!selectedImage.value) {
    return
  }

  moveSourceImageId.value
    = moveSourceImageId.value === selectedImage.value.id
      ? null
      : selectedImage.value.id
}

function handleMoveToCell(
  cellId: string,
): void {
  if (!moveSourceImageId.value) {
    return
  }

  const imageId = moveSourceImageId.value

  const moved = moveImageToCell(
    imageId,
    cellId,
  )

  if (!moved) {
    return
  }

  selectedImageId.value = imageId
  selectedCellId.value = cellId
  moveSourceImageId.value = null
}

function handleSelectedImageReplaceRequest(): void {
  selectedImageReplaceInput.value?.click()
}

function handleSelectedImageReplaceChange(
  event: Event,
): void {
  const input
    = event.target as HTMLInputElement

  const file = input.files?.[0]

  input.value = ''

  if (
    !file
    || !selectedImage.value
  ) {
    return
  }

  handleReplaceImage(
    selectedImage.value.id,
    file,
  )
}

function handleSelectedImageRemove(): void {
  if (!selectedImage.value) {
    return
  }

  handleRemoveImage(
    selectedImage.value.id,
  )
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
  if (moveSourceImageId.value === id) {
    moveSourceImageId.value = null
  }

  removeImage(id)
  importNotice.value = ''
}

function handleMoveImage(
  id: string,
  targetIndex: number,
): void {
  const moved = moveImage(
    id,
    targetIndex,
  )

  if (
    moved
    && selectedTemplate.value
  ) {
    assignSequentially(
      selectedTemplate.value.cells.map(
        cell => cell.id,
      ),
      images.value.map(
        image => image.id,
      ),
    )
  }

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

  replaceImageAssignment(
    id,
    replacement.id,
  )

  resetFraming(id)

  if (selectedImageId.value === id) {
    selectedImageId.value
      = replacement.id
  }

  if (moveSourceImageId.value === id) {
    moveSourceImageId.value = null
  }

  importNotice.value = ''
}

watch(
  [
    () => (
      selectedTemplate.value?.cells.map(
        cell => cell.id,
      ) ?? []
    ),
    () => images.value.map(
      image => image.id,
    ),
  ],
  ([
    cellIds,
    imageIds,
  ]) => {
    syncAssignments(
      cellIds,
      imageIds,
    )
  },
  {
    immediate: true,
  },
)

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

        <label
          class="grid-spacing-control"
          for="grid-spacing"
        >
          <span class="grid-spacing-control__heading">
            <span class="grid-spacing-control__label">
              Espacement
            </span>

            <output
              class="grid-spacing-control__value"
              for="grid-spacing"
              data-grid-spacing-value
            >
              {{ gridSpacing }} px
            </output>
          </span>

          <input
            id="grid-spacing"
            v-model.number="gridSpacing"
            class="grid-spacing-control__input"
            type="range"
            min="0"
            max="48"
            step="2"
            data-grid-spacing
          >
        </label>

        <div class="workspace">
          <ClientOnly v-if="selectedTemplate">
            <KonvaImageGridEditor
              ref="imageGridEditor"
              class="workspace__preview"
              :template="selectedTemplate"
              :images="images"
              :assignments="assignments"
              :framings="framings"
              :selected-image-id="selectedImageId"
              :selected-cell-id="selectedCellId"
              :move-source-image-id="moveSourceImageId"
              :spacing="gridSpacing"
              @select="handleSelectImage"
              @select-cell="handleSelectCell"
              @request-import="handleRequestCellImport"
              @move-to-cell="handleMoveToCell"
              @file-drop="handleCellFile"
              @framing-change="handleFramingChange"
            />

            <template #fallback>
              <ImageGridPreview
                class="workspace__preview"
                :template="selectedTemplate"
                :images="images"
                :assignments="assignments"
                :framings="framings"
                :selected-image-id="selectedImageId"
                :selected-cell-id="selectedCellId"
                :move-source-image-id="moveSourceImageId"
                :spacing="gridSpacing"
                @select="handleSelectImage"
                @select-cell="handleSelectCell"
                @request-import="handleRequestCellImport"
                @move-to-cell="handleMoveToCell"
                @file-drop="handleCellFile"
              />
            </template>
          </ClientOnly>
        </div>

        <div
          v-if="selectedImage && selectedCellId"
          class="selected-cell-actions"
          data-selected-cell-actions
        >
          <div class="selected-cell-actions__content">
            <span class="selected-cell-actions__label">
              Image sélectionnée
            </span>

            <strong class="selected-cell-actions__name">
              {{ selectedImage.file.name }}
            </strong>
          </div>

          <div class="selected-cell-actions__buttons">
            <button
              type="button"
              class="selected-cell-actions__button"
              :class="{
                'selected-cell-actions__button--active':
                  moveSourceImageId === selectedImage.id,
              }"
              :aria-pressed="
                moveSourceImageId === selectedImage.id
              "
              data-selected-cell-move
              @click="handleMoveModeToggle"
            >
              {{
                moveSourceImageId === selectedImage.id
                  ? 'Annuler'
                  : 'Déplacer'
              }}
            </button>

            <button
              type="button"
              class="selected-cell-actions__button"
              data-selected-cell-replace
              @click="handleSelectedImageReplaceRequest"
            >
              Remplacer
            </button>

            <button
              type="button"
              class="selected-cell-actions__button selected-cell-actions__button--remove"
              data-selected-cell-remove
              @click="handleSelectedImageRemove"
            >
              Supprimer
            </button>
          </div>

          <input
            ref="selectedImageReplaceInput"
            class="cell-import-input"
            type="file"
            :accept="acceptedImageTypes"
            data-selected-cell-replace-input
            @change="handleSelectedImageReplaceChange"
          >
        </div>

        <input
          ref="cellImportInput"
          class="cell-import-input"
          type="file"
          :accept="acceptedImageTypes"
          data-cell-image-input
          @change="handleCellImportChange"
        >

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

        <section
          id="images"
          class="image-import"
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
  width: min(100%, 1180px);
  margin: 40px auto 0;
}

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
  margin-top: 48px;

  scroll-margin-top: 24px;
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

.grid-spacing-control {
  display: block;

  width: min(100%, 760px);
  margin: 0 auto 16px;
  padding: 12px 14px;

  border: 1px solid #e2e8f0;
  border-radius: 10px;

  background: #ffffff;
}

.grid-spacing-control__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.grid-spacing-control__label {
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.grid-spacing-control__value {
  color: #64748b;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.grid-spacing-control__input {
  display: block;

  width: 100%;
  margin-top: 10px;

  accent-color: #2563eb;

  cursor: pointer;
}

.grid-spacing-control__input:focus-visible {
  outline: 3px solid #bfdbfe;
  outline-offset: 3px;
}

.export-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 42px;
  padding: 10px 16px;

  color: #ffffff;
  font: inherit;
  font-size: 14px;
  font-weight: 650;

  border: 1px solid #0f172a;
  border-radius: 10px;

  background: #0f172a;

  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.12);

  cursor: pointer;

  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    box-shadow 120ms ease,
    transform 120ms ease;
}

.export-button:hover:not(:disabled) {
  border-color: #1e293b;
  background: #1e293b;

  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.14);
}

.export-button:active:not(:disabled) {
  transform: translateY(1px);

  box-shadow: none;
}

.export-button:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 2px;
}

.export-button:disabled {
  color: #94a3b8;

  border-color: #e2e8f0;
  background: #f1f5f9;

  box-shadow: none;

  cursor: not-allowed;
}

.selected-cell-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  margin-top: 16px;
  padding: 12px 14px;

  border: 1px solid #e2e8f0;
  border-radius: 10px;

  background: #ffffff;
}

.selected-cell-actions__content {
  min-width: 0;
}

.selected-cell-actions__label {
  display: block;

  color: #94a3b8;
  font-size: 11px;
}

.selected-cell-actions__name {
  display: block;
  overflow: hidden;

  margin-top: 2px;

  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-cell-actions__buttons {
  display: flex;
  flex: 0 0 auto;
  gap: 10px;
}

.selected-cell-actions__button {
  padding: 6px 10px;

  color: #475569;
  font: inherit;
  font-size: 12px;
  font-weight: 600;

  border: 1px solid #cbd5e1;
  border-radius: 7px;

  background: #ffffff;

  cursor: pointer;
}

.selected-cell-actions__button:hover {
  color: #0f172a;

  background: #f8fafc;
}

.selected-cell-actions__button--active {
  color: #ffffff;

  border-color: #475569;

  background: #475569;
}

.selected-cell-actions__button--active:hover {
  color: #ffffff;

  background: #334155;
}

.selected-cell-actions__button--remove:hover {
  color: #b91c1c;

  border-color: #fecaca;

  background: #fef2f2;
}

.selected-cell-actions__button:focus-visible {
  outline: 2px solid #475569;
  outline-offset: 2px;
}

.cell-import-input {
  position: absolute;

  width: 1px;
  height: 1px;
  overflow: hidden;

  clip: rect(0 0 0 0);
  clip-path: inset(50%);

  white-space: nowrap;
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
  width: min(100%, 760px);
}

@media (max-width: 900px) {
  .home-page {
    padding-inline: 24px;
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
