<script setup lang="ts">
import GridTemplatePreview from '../image-grid/GridTemplatePreview.vue'

import type {
  GridTemplate,
  GridTemplateId,
} from '../../types/grid'

defineProps<{
  templates: readonly GridTemplate[]
  modelValue: GridTemplateId
}>()

const emit = defineEmits<{
  'update:modelValue': [value: GridTemplateId]
}>()
</script>

<template>
  <aside
    class="app-sidebar"
    aria-label="Modèles de grille"
    data-app-sidebar
  >
    <div class="app-sidebar__templates">
      <button
        v-for="template in templates"
        :key="template.id"
        type="button"
        class="app-sidebar__template"
        :class="{
          'app-sidebar__template--selected':
            modelValue === template.id,
        }"
        :aria-label="template.label"
        :aria-pressed="modelValue === template.id"
        :title="template.label"
        :data-template-id="template.id"
        @click="emit('update:modelValue', template.id)"
      >
        <GridTemplatePreview
          class="app-sidebar__preview"
          :template="template"
        />
      </button>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  position: sticky;
  top: 0;
  z-index: 20;

  display: flex;
  justify-content: center;

  width: 72px;
  min-height: 100vh;
  padding: 18px 8px;

  border-right: 1px solid #e2e8f0;

  background: #ffffff;
}

.app-sidebar__templates {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  width: 100%;
}

.app-sidebar__template {
  display: grid;
  place-items: center;

  width: 54px;
  min-height: 54px;
  padding: 7px;

  color: #475569;

  border: 1px solid transparent;
  border-radius: 12px;

  background: transparent;

  transition:
    border-color 120ms ease,
    background-color 120ms ease,
    box-shadow 120ms ease;
}

.app-sidebar__template:hover {
  border-color: #cbd5e1;

  background: #f8fafc;
}

.app-sidebar__template:focus-visible {
  outline: 2px solid #475569;
  outline-offset: 2px;
}

.app-sidebar__template--selected {
  border-color: #94a3b8;

  background: #f1f5f9;

  box-shadow: 0 0 0 1px #cbd5e1;
}

.app-sidebar__preview {
  width: 38px;
}

@media (max-width: 720px) {
  .app-sidebar {
    position: sticky;

    width: 100%;
    min-height: auto;
    padding: 8px 12px;

    overflow-x: auto;

    border-right: 0;
    border-bottom: 1px solid #e2e8f0;
  }

  .app-sidebar__templates {
    flex-direction: row;
    justify-content: flex-start;
    gap: 8px;

    width: max-content;
  }

  .app-sidebar__template {
    flex: 0 0 auto;
  }
}
</style>
