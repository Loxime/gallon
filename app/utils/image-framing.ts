import type {
  ImageFraming,
  FramedImagePlacement,
} from '../types/image-framing'

import type {
  ImageDimensions,
} from '../types/image-placement'

import {
  calculateRelativeCoverPlacement,
} from './image-placement'

export const DEFAULT_IMAGE_FRAMING: ImageFraming = {
  zoom: 1,
  panX: 0,
  panY: 0,
}

function assertFiniteFraming(
  framing: ImageFraming,
): void {
  if (
    !Number.isFinite(framing.zoom)
    || !Number.isFinite(framing.panX)
    || !Number.isFinite(framing.panY)
  ) {
    throw new RangeError(
      'Image framing values must be finite numbers',
    )
  }
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(
    maximum,
    Math.max(minimum, value),
  )
}

export function constrainImageFraming(
  source: ImageDimensions,
  target: ImageDimensions,
  framing: ImageFraming,
): ImageFraming {
  assertFiniteFraming(framing)

  const zoom = Math.max(
    1,
    framing.zoom,
  )

  const cover = calculateRelativeCoverPlacement(
    source,
    target,
  )

  const width = cover.width * zoom
  const height = cover.height * zoom

  const maximumPanX = Math.max(
    0,
    (width - 1) / 2,
  )

  const maximumPanY = Math.max(
    0,
    (height - 1) / 2,
  )

  return {
    zoom,
    panX: clamp(
      framing.panX,
      -maximumPanX,
      maximumPanX,
    ),
    panY: clamp(
      framing.panY,
      -maximumPanY,
      maximumPanY,
    ),
  }
}

export function calculateFramedImagePlacement(
  source: ImageDimensions,
  target: ImageDimensions,
  framing: ImageFraming,
): FramedImagePlacement {
  const constrainedFraming = constrainImageFraming(
    source,
    target,
    framing,
  )

  const cover = calculateRelativeCoverPlacement(
    source,
    target,
  )

  const width
    = cover.width * constrainedFraming.zoom

  const height
    = cover.height * constrainedFraming.zoom

  return {
    width,
    height,
    offsetX:
      ((1 - width) / 2)
      + constrainedFraming.panX,

    offsetY:
      ((1 - height) / 2)
      + constrainedFraming.panY,
  }
}

export function calculateFramingFromPosition(
  source: ImageDimensions,
  target: ImageDimensions,
  framing: ImageFraming,
  position: {
    readonly x: number
    readonly y: number
  },
): ImageFraming {
  const constrainedFraming = constrainImageFraming(
    source,
    target,
    framing,
  )

  const cover = calculateRelativeCoverPlacement(
    source,
    target,
  )

  const width
    = cover.width * constrainedFraming.zoom

  const height
    = cover.height * constrainedFraming.zoom

  const centeredOffsetX = (1 - width) / 2
  const centeredOffsetY = (1 - height) / 2

  return constrainImageFraming(
    source,
    target,
    {
      ...constrainedFraming,
      panX:
        position.x
        - centeredOffsetX,

      panY:
        position.y
        - centeredOffsetY,
    },
  )
}
