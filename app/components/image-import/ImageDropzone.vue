<script setup lang="ts">
import { computed, ref } from 'vue'

import { SUPPORTED_IMAGE_MIME_TYPES } from '../../types/image'

const props = withDefaults(defineProps<{
  disabled?: boolean
}>(), {
  disabled: false,
})

const emit = defineEmits<{
  filesSelected: [files: File[]]
}>()

const input = ref<HTMLInputElement>()
const isDragging = ref(false)

const acceptedFileTypes = computed(() => {
  return SUPPORTED_IMAGE_MIME_TYPES.join(',')
})

function emitFiles(files: FileList | readonly File[] | null): void {
  if (!files || props.disabled) {
    return
  }

  const selectedFiles = Array.from(files)

  if (selectedFiles.length === 0) {
    return
  }

  emit('filesSelected', selectedFiles)
}

function openFilePicker(): void {
  if (props.disabled) {
    return
  }

  input.value?.click()
}

function handleInputChange(event: Event): void {
  const target = event.target as HTMLInputElement

  emitFiles(target.files)

  target.value = ''
}

function handleDragEnter(): void {
  if (!props.disabled) {
    isDragging.value = true
  }
}

function handleDragLeave(): void {
  isDragging.value = false
}

function handleDrop(event: DragEvent): void {
  isDragging.value = false

  emitFiles(event.dataTransfer?.files ?? null)
}
</script>

<template>
  <div
    class="dropzone"
    :class="{
      'dropzone--dragging': isDragging,
      'dropzone--disabled': disabled,
    }"
    data-image-dropzone
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <input
      ref="input"
      class="dropzone__input"
      type="file"
      multiple
      :accept="acceptedFileTypes"
      :disabled="disabled"
      data-image-input
      @change="handleInputChange"
    >

    <p class="dropzone__title">
      Glissez vos images ici
    </p>

    <p class="dropzone__description">
      ou sélectionnez-les depuis votre ordinateur
    </p>

    <button
      type="button"
      class="dropzone__button"
      :disabled="disabled"
      @click="openFilePicker"
    >
      Choisir des images
    </button>

    <p class="dropzone__formats">
      JPEG, PNG ou WebP
    </p>
  </div>
</template>

<style scoped>
.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 32px 24px;

  text-align: center;

  border: 2px dashed #cbd5e1;
  border-radius: 12px;

  background: #f8fafc;

  transition:
    border-color 120ms ease,
    background-color 120ms ease;
}

.dropzone--dragging {
  border-color: #2563eb;
  background: #eff6ff;
}

.dropzone--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.dropzone__input {
  position: absolute;

  width: 1px;
  height: 1px;
  overflow: hidden;

  clip: rect(0 0 0 0);
  clip-path: inset(50%);

  white-space: nowrap;
}

.dropzone__title {
  margin: 0;

  font-size: 16px;
  font-weight: 600;
}

.dropzone__description {
  margin: 6px 0 0;

  color: #64748b;
  font-size: 14px;
}

.dropzone__button {
  margin-top: 20px;
  padding: 10px 16px;

  color: #ffffff;
  font-weight: 600;

  border: 0;
  border-radius: 8px;

  background: #2563eb;
}

.dropzone__button:hover:not(:disabled) {
  background: #1d4ed8;
}

.dropzone__button:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 2px;
}

.dropzone__button:disabled {
  cursor: not-allowed;
}

.dropzone__formats {
  margin: 12px 0 0;

  color: #94a3b8;
  font-size: 12px;
}
</style>
