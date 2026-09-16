import { describe, expect, it } from 'vitest'

import type {
  GridCell,
  GridTemplateId,
} from '../../app/types/grid'

import {
  DEFAULT_GRID_TEMPLATE_ID,
  GRID_TEMPLATES,
  getGridTemplateById,
} from '../../app/utils/grid-templates'

const EXPECTED_CELL_COUNTS: Record<GridTemplateId, number> = {
  'two-columns': 2,
  'two-rows': 2,
  'three-columns': 3,
  'three-rows': 3,
  'three-feature-left': 3,
  'three-feature-right': 3,
  'three-feature-top': 3,
  'four-grid': 4,
  'four-feature-left': 4,
  'six-grid': 6,
}

function getOverlapArea(first: GridCell, second: GridCell): number {
  const overlapWidth = Math.max(
    0,
    Math.min(
      first.x + first.width,
      second.x + second.width,
    ) - Math.max(first.x, second.x),
  )

  const overlapHeight = Math.max(
    0,
    Math.min(
      first.y + first.height,
      second.y + second.height,
    ) - Math.max(first.y, second.y),
  )

  return overlapWidth * overlapHeight
}

describe('grid templates', () => {
  it('defines unique template identifiers', () => {
    const ids = GRID_TEMPLATES.map(template => template.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('defines the expected number of cells', () => {
    for (const template of GRID_TEMPLATES) {
      expect(template.cells).toHaveLength(
        EXPECTED_CELL_COUNTS[template.id],
      )
    }
  })

  it('defines positive aspect ratios', () => {
    for (const template of GRID_TEMPLATES) {
      expect(template.aspectRatio.width).toBeGreaterThan(0)
      expect(template.aspectRatio.height).toBeGreaterThan(0)
    }
  })

  it('keeps every cell inside the normalized canvas', () => {
    for (const template of GRID_TEMPLATES) {
      for (const cell of template.cells) {
        expect(cell.x).toBeGreaterThanOrEqual(0)
        expect(cell.y).toBeGreaterThanOrEqual(0)

        expect(cell.width).toBeGreaterThan(0)
        expect(cell.height).toBeGreaterThan(0)

        expect(cell.x + cell.width).toBeLessThanOrEqual(1)
        expect(cell.y + cell.height).toBeLessThanOrEqual(1)
      }
    }
  })

  it('defines unique cell identifiers inside each template', () => {
    for (const template of GRID_TEMPLATES) {
      const cellIds = template.cells.map(cell => cell.id)

      expect(new Set(cellIds).size).toBe(cellIds.length)
    }
  })

  it('does not allow cells to overlap', () => {
    for (const template of GRID_TEMPLATES) {
      for (let firstIndex = 0; firstIndex < template.cells.length; firstIndex += 1) {
        for (
          let secondIndex = firstIndex + 1;
          secondIndex < template.cells.length;
          secondIndex += 1
        ) {
          const firstCell = template.cells[firstIndex]
          const secondCell = template.cells[secondIndex]

          expect(firstCell).toBeDefined()
          expect(secondCell).toBeDefined()

          if (!firstCell || !secondCell) {
            continue
          }

          expect(
            getOverlapArea(firstCell, secondCell),
          ).toBeCloseTo(0)
        }
      }
    }
  })

  it('covers the complete normalized canvas', () => {
    for (const template of GRID_TEMPLATES) {
      const totalArea = template.cells.reduce(
        (area, cell) => area + cell.width * cell.height,
        0,
      )

      expect(totalArea).toBeCloseTo(1)
    }
  })

  it('resolves the default template', () => {
    const template = getGridTemplateById(
      DEFAULT_GRID_TEMPLATE_ID,
    )

    expect(template).toBeDefined()
    expect(template?.id).toBe('two-columns')
  })
})
