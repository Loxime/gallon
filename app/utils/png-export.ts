export const DEFAULT_PNG_PIXEL_RATIO = 2

export interface ExportableKonvaNode {
  hide: () => void
  show: () => void
}

export interface ExportableKonvaStage {
  find: (
    selector: string,
  ) => readonly ExportableKonvaNode[]

  draw: () => void

  toDataURL: (
    config: {
      readonly mimeType: string
      readonly pixelRatio: number
    },
  ) => string
}

export function exportKonvaStageAsPng(
  stage: ExportableKonvaStage,
  pixelRatio = DEFAULT_PNG_PIXEL_RATIO,
): string {
  if (
    !Number.isFinite(pixelRatio)
    || pixelRatio <= 0
  ) {
    throw new RangeError(
      'PNG pixel ratio must be a finite positive number',
    )
  }

  const editorOverlays = stage.find(
    '.editor-overlay',
  )

  for (const overlay of editorOverlays) {
    overlay.hide()
  }

  stage.draw()

  try {
    return stage.toDataURL({
      mimeType: 'image/png',
      pixelRatio,
    })
  }
  finally {
    for (const overlay of editorOverlays) {
      overlay.show()
    }

    stage.draw()
  }
}
