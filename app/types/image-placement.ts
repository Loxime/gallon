export interface ImageDimensions {
  readonly width: number
  readonly height: number
}

export interface CoverPlacement {
  readonly scale: number
  readonly width: number
  readonly height: number
  readonly offsetX: number
  readonly offsetY: number
}

export interface RelativeCoverPlacement {
  readonly width: number
  readonly height: number
  readonly offsetX: number
  readonly offsetY: number
}
