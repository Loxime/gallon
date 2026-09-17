import type {
  GridCell,
} from '../types/grid'

export interface GridViewport {
  readonly width: number
  readonly height: number
}

export interface SpacedGridCellRect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

const EDGE_EPSILON = 1e-9

function assertPositiveDimension(
  value: number,
  name: string,
): void {
  if (
    !Number.isFinite(value)
    || value <= 0
  ) {
    throw new RangeError(
      `${name} must be a finite positive number`,
    )
  }
}

function assertSpacing(
  spacing: number,
): void {
  if (
    !Number.isFinite(spacing)
    || spacing < 0
  ) {
    throw new RangeError(
      'Grid spacing must be a finite non-negative number',
    )
  }
}

export function calculateSpacedGridCellRect(
  cell: GridCell,
  viewport: GridViewport,
  spacing: number,
): SpacedGridCellRect {
  assertPositiveDimension(
    viewport.width,
    'Grid viewport width',
  )

  assertPositiveDimension(
    viewport.height,
    'Grid viewport height',
  )

  assertSpacing(spacing)

  const rawX
    = cell.x * viewport.width

  const rawY
    = cell.y * viewport.height

  const rawWidth
    = cell.width * viewport.width

  const rawHeight
    = cell.height * viewport.height

  const halfSpacing = spacing / 2

  const hasInternalLeftEdge
    = cell.x > EDGE_EPSILON

  const hasInternalTopEdge
    = cell.y > EDGE_EPSILON

  const hasInternalRightEdge
    = cell.x + cell.width
      < 1 - EDGE_EPSILON

  const hasInternalBottomEdge
    = cell.y + cell.height
      < 1 - EDGE_EPSILON

  const insetLeft
    = hasInternalLeftEdge
      ? halfSpacing
      : 0

  const insetTop
    = hasInternalTopEdge
      ? halfSpacing
      : 0

  const insetRight
    = hasInternalRightEdge
      ? halfSpacing
      : 0

  const insetBottom
    = hasInternalBottomEdge
      ? halfSpacing
      : 0

  return {
    x: rawX + insetLeft,
    y: rawY + insetTop,

    width: Math.max(
      0,
      rawWidth
      - insetLeft
      - insetRight,
    ),

    height: Math.max(
      0,
      rawHeight
      - insetTop
      - insetBottom,
    ),
  }
}
