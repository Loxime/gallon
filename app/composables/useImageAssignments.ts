import {
  computed,
  ref,
} from 'vue'

import type {
  ImageAssignments,
} from '../types/image-assignment'

export function useImageAssignments() {
  const assignments = ref<Record<string, string>>({})

  function assignImage(
    cellId: string,
    imageId: string,
  ): void {
    const next = Object.fromEntries(
      Object.entries(assignments.value).filter(
        ([
          assignedCellId,
          assignedImageId,
        ]) => {
          return (
            assignedImageId !== imageId
            || assignedCellId === cellId
          )
        },
      ),
    )

    next[cellId] = imageId

    assignments.value = next
  }

  function unassignCell(
    cellId: string,
  ): boolean {
    if (!(cellId in assignments.value)) {
      return false
    }

    assignments.value = Object.fromEntries(
      Object.entries(assignments.value).filter(
        ([assignedCellId]) => {
          return assignedCellId !== cellId
        },
      ),
    )

    return true
  }

  function unassignImage(
    imageId: string,
  ): boolean {
    const entry = Object.entries(
      assignments.value,
    ).find(([, assignedImageId]) => {
      return assignedImageId === imageId
    })

    if (!entry) {
      return false
    }

    const [cellId] = entry

    return unassignCell(cellId)
  }

  function moveImageToCell(
    imageId: string,
    targetCellId: string,
  ): boolean {
    const sourceCellId = getCellIdForImage(
      imageId,
    )

    if (
      !sourceCellId
      || sourceCellId === targetCellId
    ) {
      return false
    }

    const targetImageId
      = assignments.value[targetCellId]

    const next = {
      ...assignments.value,
    }

    delete next[sourceCellId]

    next[targetCellId] = imageId

    if (targetImageId) {
      next[sourceCellId] = targetImageId
    }

    assignments.value = next

    return true
  }

  function replaceImage(
    previousImageId: string,
    nextImageId: string,
  ): boolean {
    const entry = Object.entries(
      assignments.value,
    ).find(([, assignedImageId]) => {
      return assignedImageId === previousImageId
    })

    if (!entry) {
      return false
    }

    assignImage(
      entry[0],
      nextImageId,
    )

    return true
  }

  function assignSequentially(
    cellIds: readonly string[],
    imageIds: readonly string[],
  ): void {
    const next: Record<string, string> = {}

    for (
      let index = 0;
      index < cellIds.length;
      index += 1
    ) {
      const cellId = cellIds[index]
      const imageId = imageIds[index]

      if (!cellId || !imageId) {
        continue
      }

      next[cellId] = imageId
    }

    assignments.value = next
  }

  function syncAssignments(
    cellIds: readonly string[],
    imageIds: readonly string[],
  ): void {
    const validCells = new Set(cellIds)
    const validImages = new Set(imageIds)

    const next: Record<string, string> = {}

    for (const [
      cellId,
      imageId,
    ] of Object.entries(assignments.value)) {
      if (
        validCells.has(cellId)
        && validImages.has(imageId)
      ) {
        next[cellId] = imageId
      }
    }

    const assignedImages = new Set(
      Object.values(next),
    )

    for (const imageId of imageIds) {
      if (assignedImages.has(imageId)) {
        continue
      }

      const emptyCellId = cellIds.find(
        cellId => !(cellId in next),
      )

      if (!emptyCellId) {
        break
      }

      next[emptyCellId] = imageId
      assignedImages.add(imageId)
    }

    assignments.value = next
  }

  function clearAssignments(): void {
    assignments.value = {}
  }

  function getImageIdForCell(
    cellId: string,
  ): string | undefined {
    return assignments.value[cellId]
  }

  function getCellIdForImage(
    imageId: string,
  ): string | undefined {
    return Object.entries(
      assignments.value,
    ).find(([, assignedImageId]) => {
      return assignedImageId === imageId
    })?.[0]
  }

  const readonlyAssignments = computed<ImageAssignments>(
    () => assignments.value,
  )

  return {
    assignments: readonlyAssignments,

    assignImage,
    unassignCell,
    unassignImage,
    moveImageToCell,
    replaceImage,
    assignSequentially,
    syncAssignments,
    clearAssignments,
    getImageIdForCell,
    getCellIdForImage,
  }
}
