export type GridTemplateId =
  | 'two-columns'
  | 'two-rows'
  | 'three-feature-left'
  | 'four-grid'

export interface GridCell {
  readonly id: string
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface GridAspectRatio {
  readonly width: number
  readonly height: number
}

export interface GridTemplate {
  readonly id: GridTemplateId
  readonly label: string
  readonly aspectRatio: GridAspectRatio
  readonly cells: readonly GridCell[]
}
