<script setup lang="ts">
import GridTemplatePreview from './GridTemplatePreview.vue'
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
  <div class="template-list">
    <button
      v-for="template in templates"
      :key="template.id"
      type="button"
      class="template-option"
      :class="{
        'template-option--selected': modelValue === template.id,
      }"
      :aria-pressed="modelValue === template.id"
      :data-template-id="template.id"
      @click="emit('update:modelValue', template.id)"
    >
      <GridTemplatePreview
        class="template-option__preview"
        :template="template"
      />

      <span class="template-option__label">
        {{ template.label }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.template-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.template-option {
  display: flex;
  flex-direction: column;
  gap: 10px;

  padding: 12px;

  color: inherit;
  text-align: left;

  border: 1px solid #cbd5e1;
  border-radius: 12px;

  background: #ffffff;

  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;
}

.template-option:hover {
  border-color: #94a3b8;
}

.template-option:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 2px;
}

.template-option--selected {
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb;
}

.template-option__preview {
  width: 100%;
}

.template-option__label {
  font-size: 14px;
  font-weight: 600;
}
</style>
