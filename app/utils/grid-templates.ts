import type {
  GridTemplate,
  GridTemplateId,
} from '../types/grid'

export const DEFAULT_GRID_TEMPLATE_ID: GridTemplateId = 'two-columns'

export const GRID_TEMPLATES = [
  {
    id: 'two-columns',
    label: '2 colonnes',
    aspectRatio: {
      width: 1,
      height: 1,
    },
    cells: [
      {
        id: 'cell-1',
        x: 0,
        y: 0,
        width: 0.5,
        height: 1,
      },
      {
        id: 'cell-2',
        x: 0.5,
        y: 0,
        width: 0.5,
        height: 1,
      },
    ],
  },

  {
    id: 'two-rows',
    label: '2 lignes',
    aspectRatio: {
      width: 1,
      height: 1,
    },
    cells: [
      {
        id: 'cell-1',
        x: 0,
        y: 0,
        width: 1,
        height: 0.5,
      },
      {
        id: 'cell-2',
        x: 0,
        y: 0.5,
        width: 1,
        height: 0.5,
      },
    ],
  },

  {
    id: 'three-feature-left',
    label: '1 grande, 2 petites',
    aspectRatio: {
      width: 1,
      height: 1,
    },
    cells: [
      {
        id: 'cell-1',
        x: 0,
        y: 0,
        width: 0.5,
        height: 1,
      },
      {
        id: 'cell-2',
        x: 0.5,
        y: 0,
        width: 0.5,
        height: 0.5,
      },
      {
        id: 'cell-3',
        x: 0.5,
        y: 0.5,
        width: 0.5,
        height: 0.5,
      },
    ],
  },

  {
    id: 'four-grid',
    label: '4 images',
    aspectRatio: {
      width: 1,
      height: 1,
    },
    cells: [
      {
        id: 'cell-1',
        x: 0,
        y: 0,
        width: 0.5,
        height: 0.5,
      },
      {
        id: 'cell-2',
        x: 0.5,
        y: 0,
        width: 0.5,
        height: 0.5,
      },
      {
        id: 'cell-3',
        x: 0,
        y: 0.5,
        width: 0.5,
        height: 0.5,
      },
      {
        id: 'cell-4',
        x: 0.5,
        y: 0.5,
        width: 0.5,
        height: 0.5,
      },
    ],
  },
] as const satisfies readonly GridTemplate[]

export function getGridTemplateById(id: GridTemplateId) {
  return GRID_TEMPLATES.find(template => template.id === id)
}
