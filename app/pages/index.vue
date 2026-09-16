<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from 'vue'

import ImageDropzone from '../components/image-import/ImageDropzone.vue'
import ImportedImageList from '../components/image-import/ImportedImageList.vue'
import GridTemplatePreview from '../components/image-grid/GridTemplatePreview.vue'
import GridTemplateSelector from '../components/image-grid/GridTemplateSelector.vue'

import { useImportedImages } from '../composables/useImportedImages'

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

useHead({
  title: 'gallon — Créateur de grille d’images',
  meta: [
    {
      name: 'description',
      content: 'Créez et exportez simplement des grilles composées de plusieurs images.',
    },
  ],
})

const selectedTemplateId = ref<GridTemplateId>(
  DEFAULT_GRID_TEMPLATE_ID,
)

const importNotice = ref('')

const {
  images,
  addFiles,
  removeImage,
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

watch(imageCapacity, (capacity) => {
  const removedCount = trimToLimit(capacity)

  if (removedCount > 0) {
    importNotice.value = `${removedCount} image${removedCount > 1 ? 's ont' : ' a'} été retirée${removedCount > 1 ? 's' : ''} pour correspondre à la nouvelle grille.`
  }
})
</script>

<template>
  <main class="home-page">
    <section class="hero">
      <h1 class="hero__title">
        Créateur de grille d’images
      </h1>

      <p class="hero__description">
        Assemblez plusieurs images dans une grille et exportez
        votre composition en quelques étapes.
      </p>
    </section>

    <section class="editor">
      <div class="editor__sidebar">
        <section>
          <h2 class="editor__title">
            Choisissez une grille
          </h2>

          <p class="editor__description">
            Sélectionnez la disposition qui correspond à votre composition.
          </p>

          <GridTemplateSelector
            v-model="selectedTemplateId"
            :templates="GRID_TEMPLATES"
          />
        </section>

        <section class="image-import">
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
            @remove="handleRemoveImage"
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
        </div>

        <div class="workspace">
          <GridTemplatePreview
            v-if="selectedTemplate"
            class="workspace__preview"
            :template="selectedTemplate"
          />
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.editor {
  display: grid;
  grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);
  gap: 48px;

  width: min(100%, 1100px);
  margin: 56px auto 0;
}

.editor__sidebar,
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
  width: min(100%, 480px);
}

@media (max-width: 800px) {
  .editor {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .workspace {
    min-height: auto;
    padding: 24px;
  }
}
</style>
