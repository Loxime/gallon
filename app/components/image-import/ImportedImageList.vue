<script setup lang="ts">
import type { ImportedImage } from '../../types/image'

defineProps<{
  images: readonly ImportedImage[]
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()
</script>

<template>
  <div
    v-if="images.length > 0"
    class="image-list"
    data-imported-image-list
  >
    <article
      v-for="image in images"
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

        <button
          type="button"
          class="image-card__remove"
          :aria-label="`Supprimer ${image.file.name}`"
          data-remove-image
          @click="emit('remove', image.id)"
        >
          Supprimer
        </button>
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
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
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

.image-card__remove {
  padding: 0;

  color: #64748b;
  font-size: 12px;

  border: 0;
  background: transparent;
}

.image-card__remove:hover {
  color: #dc2626;
}

.image-card__remove:focus-visible {
  outline: 2px solid #93c5fd;
  outline-offset: 2px;
}
</style>
