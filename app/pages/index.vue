<script setup lang="ts">
import GridTemplatePreview from '../components/image-grid/GridTemplatePreview.vue'
import GridTemplateSelector from '../components/image-grid/GridTemplateSelector.vue'
import type { GridTemplateId } from '../types/grid'

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

const selectedTemplate = computed(() => {
  return getGridTemplateById(selectedTemplateId.value)
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
      <div class="editor__templates">
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

.editor__templates,
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
