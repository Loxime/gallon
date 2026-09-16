<script setup lang="ts">
import type {
  GridCell,
  GridTemplate,
} from '../../types/grid'

defineProps<{
  template: GridTemplate
}>()

function getCellStyle(cell: GridCell) {
  return {
    left: `${cell.x * 100}%`,
    top: `${cell.y * 100}%`,
    width: `${cell.width * 100}%`,
    height: `${cell.height * 100}%`,
  }
}
</script>

<template>
  <div
    class="grid-preview"
    :style="{
      aspectRatio: `${template.aspectRatio.width} / ${template.aspectRatio.height}`,
    }"
    aria-hidden="true"
  >
    <div
      v-for="cell in template.cells"
      :key="cell.id"
      class="grid-preview__cell"
      :style="getCellStyle(cell)"
    />
  </div>
</template>

<style scoped>
.grid-preview {
  position: relative;
  width: 100%;
  overflow: hidden;

  border: 1px solid #cbd5e1;
  border-radius: 8px;

  background: #e2e8f0;
}

.grid-preview__cell {
  position: absolute;

  border: 2px solid #ffffff;
  background: #cbd5e1;
}
</style>
