import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  calculateFramingFromPosition,
} from '../../app/utils/image-framing'

describe('image framing drag', () => {
  const squareTarget = {
    width: 1,
    height: 1,
  }

  it('converts a centered position to zero pan', () => {
    const framing = calculateFramingFromPosition(
      {
        width: 1000,
        height: 1000,
      },
      squareTarget,
      {
        zoom: 2,
        panX: 0,
        panY: 0,
      },
      {
        x: -0.5,
        y: -0.5,
      },
    )

    expect(framing).toEqual({
      zoom: 2,
      panX: 0,
      panY: 0,
    })
  })

  it('converts a dragged position to pan values', () => {
    const framing = calculateFramingFromPosition(
      {
        width: 1000,
        height: 1000,
      },
      squareTarget,
      {
        zoom: 2,
        panX: 0,
        panY: 0,
      },
      {
        x: -0.25,
        y: -0.75,
      },
    )

    expect(framing).toEqual({
      zoom: 2,
      panX: 0.25,
      panY: -0.25,
    })
  })

  it('clamps a dragged image at the cell boundaries', () => {
    const framing = calculateFramingFromPosition(
      {
        width: 1000,
        height: 1000,
      },
      squareTarget,
      {
        zoom: 2,
        panX: 0,
        panY: 0,
      },
      {
        x: 10,
        y: -10,
      },
    )

    expect(framing).toEqual({
      zoom: 2,
      panX: 0.5,
      panY: -0.5,
    })
  })

  it('keeps a non-overflowing axis fixed', () => {
    const framing = calculateFramingFromPosition(
      {
        width: 1600,
        height: 900,
      },
      squareTarget,
      {
        zoom: 1,
        panX: 0,
        panY: 0,
      },
      {
        x: -0.2,
        y: 5,
      },
    )

    expect(framing.panY).toBe(0)
  })
})
