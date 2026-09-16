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
    id: 'three-columns',
    label: '3 colonnes',
    aspectRatio: {
      width: 1,
      height: 1,
    },
    cells: [
      {
        id: 'cell-1',
        x: 0,
        y: 0,
        width: 1 / 3,
        height: 1,
      },
      {
        id: 'cell-2',
        x: 1 / 3,
        y: 0,
        width: 1 / 3,
        height: 1,
      },
      {
        id: 'cell-3',
        x: 2 / 3,
        y: 0,
        width: 1 / 3,
        height: 1,
      },
    ],
  },

  {
    id: 'three-rows',
    label: '3 lignes',
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
        height: 1 / 3,
      },
      {
        id: 'cell-2',
        x: 0,
        y: 1 / 3,
        width: 1,
        height: 1 / 3,
      },
      {
        id: 'cell-3',
        x: 0,
        y: 2 / 3,
        width: 1,
        height: 1 / 3,
      },
    ],
  },

  {
    id: 'three-feature-left',
    label: 'Grande à gauche',
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
    id: 'three-feature-right',
    label: 'Grande à droite',
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
        x: 0,
        y: 0.5,
        width: 0.5,
        height: 0.5,
      },
      {
        id: 'cell-3',
        x: 0.5,
        y: 0,
        width: 0.5,
        height: 1,
      },
    ],
  },

  {
    id: 'three-feature-top',
    label: 'Grande en haut',
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

  {
    id: 'four-feature-left',
    label: 'Grande + 3 petites',
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
        height: 1 / 3,
      },
      {
        id: 'cell-3',
        x: 0.5,
        y: 1 / 3,
        width: 0.5,
        height: 1 / 3,
      },
      {
        id: 'cell-4',
        x: 0.5,
        y: 2 / 3,
        width: 0.5,
        height: 1 / 3,
      },
    ],
  },

  {
    id: 'six-grid',
    label: '6 images',
    aspectRatio: {
      width: 1,
      height: 1,
    },
    cells: [
      {
        id: 'cell-1',
        x: 0,
        y: 0,
        width: 1 / 3,
        height: 0.5,
      },
      {
        id: 'cell-2',
        x: 1 / 3,
        y: 0,
        width: 1 / 3,
        height: 0.5,
      },
      {
        id: 'cell-3',
        x: 2 / 3,
        y: 0,
        width: 1 / 3,
        height: 0.5,
      },
      {
        id: 'cell-4',
        x: 0,
        y: 0.5,
        width: 1 / 3,
        height: 0.5,
      },
      {
        id: 'cell-5',
        x: 1 / 3,
        y: 0.5,
        width: 1 / 3,
        height: 0.5,
      },
      {
        id: 'cell-6',
        x: 2 / 3,
        y: 0.5,
        width: 1 / 3,
        height: 0.5,
      },
    ],
  },
] as const satisfies readonly GridTemplate[]

export function getGridTemplateById(id: GridTemplateId) {
  return GRID_TEMPLATES.find(template => template.id === id)
}
