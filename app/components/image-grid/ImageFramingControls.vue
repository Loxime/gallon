<script setup lang="ts">
import type { ImageFraming } from '../../types/image-framing'

defineProps<{
  imageName: string
  framing: ImageFraming
}>()

const emit = defineEmits<{
  zoomChange: [zoom: number]
  reset: []
}>()

function handleZoomInput(event: Event): void {
  const target = event.target as HTMLInputElement

  emit(
    'zoomChange',
    Number(target.value),
  )
}
</script>

<template>
  <div
    class="framing-controls"
    data-framing-controls
  >
    <div class="framing-controls__heading">
      <div>
        <p class="framing-controls__title">
          Ajuster le cadrage
        </p>

        <p class="framing-controls__name">
          {{ imageName }}
        </p>
      </div>

      <button
        type="button"
        class="framing-controls__reset"
        data-reset-framing
        @click="emit('reset')"
      >
        Réinitialiser
      </button>
    </div>

    <label class="framing-controls__zoom">
      <span>Zoom</span>
      <span>{{ Math.round(framing.zoom * 100) }} %</span>

      <input
        type="range"
        min="1"
        max="3"
        step="0.05"
        :value="framing.zoom"
        data-framing-zoom
        @input="handleZoomInput"
      >
    </label>
  </div>
</template>

<style scoped>
.framing-controls {
  margin-top: 16px;
  padding: 16px;

  border: 1px solid #e2e8f0;
  border-radius: 12px;

  background: #ffffff;
}

.framing-controls__heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.framing-controls__title,
.framing-controls__name {
  margin: 0;
}

.framing-controls__title {
  font-weight: 600;
}

.framing-controls__name {
  margin-top: 4px;

  color: #64748b;
  font-size: 13px;
}

.framing-controls__reset {
  align-self: flex-start;
}

.framing-controls__zoom {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;

  margin-top: 16px;
}

.framing-controls__zoom input {
  grid-column: 1 / -1;
  width: 100%;
}
</style>
