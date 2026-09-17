import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  calculateFramingFromPosition,
  constrainFramedImagePosition,
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
  it('keeps a smaller image centered while dragging', () => {
    const position = constrainFramedImagePosition(
      {
        x: 200,
        y: 100,
        width: 200,
        height: 200,
      },
      {
        width: 100,
        height: 100,
      },
      {
        x: 1000,
        y: -1000,
      },
    )

    expect(position).toEqual({
      x: 250,
      y: 150,
    })
  })

  it('keeps an under-zoomed axis centered while constraining the overflowing axis', () => {
    const position = constrainFramedImagePosition(
      {
        x: 200,
        y: 100,
        width: 200,
        height: 200,
      },
      {
        width: 300,
        height: 100,
      },
      {
        x: 1000,
        y: -1000,
      },
    )

    expect(position).toEqual({
      x: 200,
      y: 150,
    })
  })

  it('constrains an overflowing image between cell edges', () => {
    const position = constrainFramedImagePosition(
      {
        x: 200,
        y: 100,
        width: 200,
        height: 200,
      },
      {
        width: 300,
        height: 400,
      },
      {
        x: -1000,
        y: 1000,
      },
    )

    expect(position).toEqual({
      x: 100,
      y: 100,
    })
  })

})
