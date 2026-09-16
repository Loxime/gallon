import type {
  CoverPlacement,
  ImageDimensions,
  RelativeCoverPlacement,
} from '../types/image-placement'

function assertValidDimensions(
  dimensions: ImageDimensions,
  label: string,
): void {
  if (
    !Number.isFinite(dimensions.width)
    || !Number.isFinite(dimensions.height)
    || dimensions.width <= 0
    || dimensions.height <= 0
  ) {
    throw new RangeError(
      `${label} dimensions must be finite positive numbers`,
    )
  }
}

export function calculateCoverPlacement(
  source: ImageDimensions,
  target: ImageDimensions,
): CoverPlacement {
  assertValidDimensions(source, 'Source')
  assertValidDimensions(target, 'Target')

  const scale = Math.max(
    target.width / source.width,
    target.height / source.height,
  )

  const width = source.width * scale
  const height = source.height * scale

  return {
    scale,
    width,
    height,
    offsetX: (target.width - width) / 2,
    offsetY: (target.height - height) / 2,
  }
}

export function calculateRelativeCoverPlacement(
  source: ImageDimensions,
  target: ImageDimensions,
): RelativeCoverPlacement {
  const placement = calculateCoverPlacement(
    source,
    target,
  )

  return {
    width: placement.width / target.width,
    height: placement.height / target.height,
    offsetX: placement.offsetX / target.width,
    offsetY: placement.offsetY / target.height,
  }
}
