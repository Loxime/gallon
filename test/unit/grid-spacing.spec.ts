import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  calculateSpacedGridCellRect,
} from '../../app/utils/grid-spacing'

describe('grid spacing', () => {
  it('keeps the original geometry with zero spacing', () => {
    const rect = calculateSpacedGridCellRect(
      {
        id: 'cell',
        x: 0.5,
        y: 0,
        width: 0.5,
        height: 1,
      },
      {
        width: 800,
        height: 400,
      },
      0,
    )

    expect(rect).toEqual({
      x: 400,
      y: 0,
      width: 400,
      height: 400,
    })
  })

  it('creates spacing only between horizontal cells', () => {
    const left = calculateSpacedGridCellRect(
      {
        id: 'left',
        x: 0,
        y: 0,
        width: 0.5,
        height: 1,
      },
      {
        width: 800,
        height: 400,
      },
      20,
    )

    const right = calculateSpacedGridCellRect(
      {
        id: 'right',
        x: 0.5,
        y: 0,
        width: 0.5,
        height: 1,
      },
      {
        width: 800,
        height: 400,
      },
      20,
    )

    expect(left).toEqual({
      x: 0,
      y: 0,
      width: 390,
      height: 400,
    })

    expect(right).toEqual({
      x: 410,
      y: 0,
      width: 390,
      height: 400,
    })
  })

  it('creates spacing only between vertical cells', () => {
    const top = calculateSpacedGridCellRect(
      {
        id: 'top',
        x: 0,
        y: 0,
        width: 1,
        height: 0.5,
      },
      {
        width: 800,
        height: 400,
      },
      20,
    )

    const bottom = calculateSpacedGridCellRect(
      {
        id: 'bottom',
        x: 0,
        y: 0.5,
        width: 1,
        height: 0.5,
      },
      {
        width: 800,
        height: 400,
      },
      20,
    )

    expect(top).toEqual({
      x: 0,
      y: 0,
      width: 800,
      height: 190,
    })

    expect(bottom).toEqual({
      x: 0,
      y: 210,
      width: 800,
      height: 190,
    })
  })

  it('handles cells with internal edges on two axes', () => {
    const rect = calculateSpacedGridCellRect(
      {
        id: 'bottom-right',
        x: 0.5,
        y: 0.5,
        width: 0.5,
        height: 0.5,
      },
      {
        width: 800,
        height: 400,
      },
      20,
    )

    expect(rect).toEqual({
      x: 410,
      y: 210,
      width: 390,
      height: 190,
    })
  })

  it.each([
    {
      spacing: -1,
      viewport: {
        width: 800,
        height: 400,
      },
    },
    {
      spacing: Number.NaN,
      viewport: {
        width: 800,
        height: 400,
      },
    },
    {
      spacing: 10,
      viewport: {
        width: 0,
        height: 400,
      },
    },
    {
      spacing: 10,
      viewport: {
        width: 800,
        height: -1,
      },
    },
  ])(
    'rejects invalid spacing geometry',
    ({ spacing, viewport }) => {
      expect(() => {
        calculateSpacedGridCellRect(
          {
            id: 'cell',
            x: 0,
            y: 0,
            width: 1,
            height: 1,
          },
          viewport,
          spacing,
        )
      }).toThrow(RangeError)
    },
  )
})
