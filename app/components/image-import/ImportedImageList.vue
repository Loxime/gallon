<script setup lang="ts">
import {
  SUPPORTED_IMAGE_MIME_TYPES,
} from '../../types/image'

import type {
  ImportedImage,
} from '../../types/image'

defineProps<{
  images: readonly ImportedImage[]
}>()

const emit = defineEmits<{
  remove: [id: string]
  move: [
    id: string,
    targetIndex: number,
  ]
  replace: [
    id: string,
    file: File,
  ]
}>()

const acceptedImageTypes
  = SUPPORTED_IMAGE_MIME_TYPES.join(',')

function openReplacementPicker(
  event: MouseEvent,
): void {
  const button
    = event.currentTarget as HTMLButtonElement

  const input = button
    .parentElement
    ?.querySelector<HTMLInputElement>(
      '[data-replace-image-input]',
    )

  input?.click()
}

function handleReplacement(
  imageId: string,
  event: Event,
): void {
  const input
    = event.target as HTMLInputElement

  const file = input.files?.[0]

  input.value = ''

  if (!file) {
    return
  }

  emit(
    'replace',
    imageId,
    file,
  )
}
</script>

<template>
  <div
    v-if="images.length > 0"
    class="image-list"
    data-imported-image-list
  >
    <article
      v-for="(image, index) in images"
      :key="image.id"
      class="image-card"
      data-imported-image
    >
      <img
        class="image-card__preview"
        :src="image.objectUrl"
        :alt="image.file.name"
      >

      <div class="image-card__content">
        <span class="image-card__name">
          {{ image.file.name }}
        </span>

        <span class="image-card__position">
          Image {{ index + 1 }} sur {{ images.length }}
        </span>

        <div class="image-card__actions">
          <button
            type="button"
            class="image-card__action"
            :disabled="index === 0"
            :aria-label="`Déplacer ${image.file.name} vers le haut`"
            data-move-image-up
            @click="
              emit(
                'move',
                image.id,
                index - 1,
              )
            "
          >
            Monter
          </button>

          <button
            type="button"
            class="image-card__action"
            :disabled="
              index === images.length - 1
            "
            :aria-label="`Déplacer ${image.file.name} vers le bas`"
            data-move-image-down
            @click="
              emit(
                'move',
                image.id,
                index + 1,
              )
            "
          >
            Descendre
          </button>

          <span class="image-card__replace">
            <button
              type="button"
              class="image-card__action"
              :aria-label="`Remplacer ${image.file.name}`"
              data-replace-image
              @click="openReplacementPicker"
            >
              Remplacer
            </button>

            <input
              class="image-card__file-input"
              type="file"
              :accept="acceptedImageTypes"
              data-replace-image-input
              @change="
                handleReplacement(
                  image.id,
                  $event,
                )
              "
            >
          </span>

          <button
            type="button"
            class="image-card__action image-card__action--remove"
            :aria-label="`Supprimer ${image.file.name}`"
            data-remove-image
            @click="emit('remove', image.id)"
          >
            Supprimer
          </button>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.image-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.image-card {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 12px;
  align-items: center;

  padding: 8px;

  border: 1px solid #e2e8f0;
  border-radius: 10px;

  background: #ffffff;
}

.image-card__preview {
  width: 56px;
  height: 56px;

  object-fit: cover;

  border-radius: 7px;
}

.image-card__content {
  min-width: 0;
}

.image-card__name {
  display: block;
  max-width: 100%;
  overflow: hidden;

  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-card__position {
  display: block;
  margin-top: 2px;

  color: #94a3b8;
  font-size: 11px;
}

.image-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  margin-top: 6px;
}

.image-card__replace {
  display: inline-flex;
}

.image-card__action {
  padding: 0;

  color: #64748b;
  font: inherit;
  font-size: 12px;

  border: 0;
  background: transparent;

  cursor: pointer;
}

.image-card__action:hover:not(:disabled) {
  color: #0f172a;
}

.image-card__action:disabled {
  color: #cbd5e1;

  cursor: default;
}

.image-card__action--remove:hover:not(:disabled) {
  color: #dc2626;
}

.image-card__action:focus-visible {
  outline: 2px solid #93c5fd;
  outline-offset: 2px;
}

.image-card__file-input {
  position: absolute;

  width: 1px;
  height: 1px;
  overflow: hidden;

  clip: rect(0 0 0 0);
  clip-path: inset(50%);

  white-space: nowrap;
}
</style>
