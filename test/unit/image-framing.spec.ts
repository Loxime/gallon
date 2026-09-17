import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  DEFAULT_IMAGE_FRAMING,
  MIN_IMAGE_FRAMING_ZOOM,
  calculateFramedImagePlacement,
  constrainImageFraming,
} from '../../app/utils/image-framing'

describe('image framing', () => {
  const squareTarget = {
    width: 1,
    height: 1,
  }

  it('uses centered cover placement by default', () => {
    const placement = calculateFramedImagePlacement(
      {
        width: 1600,
        height: 900,
      },
      squareTarget,
      DEFAULT_IMAGE_FRAMING,
    )

    expect(placement.width).toBeCloseTo(
      16 / 9,
    )

    expect(placement.height).toBeCloseTo(1)

    expect(placement.offsetX).toBeCloseTo(
      -(7 / 18),
    )

    expect(placement.offsetY).toBeCloseTo(0)
  })

  it('allows zooming below the cover scale', () => {
    const framing = constrainImageFraming(
      {
        width: 1000,
        height: 1000,
      },
      squareTarget,
      {
        zoom: 0.5,
        panX: 0,
        panY: 0,
      },
    )

    expect(framing).toEqual({
      zoom: 0.5,
      panX: 0,
      panY: 0,
    })
  })

  it('clamps zoom to the minimum framing zoom', () => {
    const framing = constrainImageFraming(
      {
        width: 1000,
        height: 1000,
      },
      squareTarget,
      {
        zoom: 0.01,
        panX: 0,
        panY: 0,
      },
    )

    expect(framing.zoom).toBe(
      MIN_IMAGE_FRAMING_ZOOM,
    )
  })

  it('centers an under-zoomed image on axes without overflow', () => {
    const framing = constrainImageFraming(
      {
        width: 1000,
        height: 1000,
      },
      squareTarget,
      {
        zoom: 0.5,
        panX: 10,
        panY: -10,
      },
    )

    expect(framing).toEqual({
      zoom: 0.5,
      panX: 0,
      panY: 0,
    })
  })

  it('keeps panning on an axis that still overflows while under-zoomed', () => {
    const framing = constrainImageFraming(
      {
        width: 2400,
        height: 800,
      },
      squareTarget,
      {
        zoom: 0.5,
        panX: 10,
        panY: 10,
      },
    )

    expect(framing.zoom).toBe(0.5)
    expect(framing.panX).toBeCloseTo(0.25)
    expect(framing.panY).toBe(0)
  })

  it('places a fully under-zoomed image in the center', () => {
    const placement = calculateFramedImagePlacement(
      {
        width: 1000,
        height: 1000,
      },
      squareTarget,
      {
        zoom: 0.5,
        panX: 10,
        panY: -10,
      },
    )

    expect(placement).toEqual({
      width: 0.5,
      height: 0.5,
      offsetX: 0.25,
      offsetY: 0.25,
    })
  })

  it('prevents horizontal panning beyond the image edge', () => {
    const framing = constrainImageFraming(
      {
        width: 1600,
        height: 900,
      },
      squareTarget,
      {
        zoom: 1,
        panX: 100,
        panY: 0,
      },
    )

    expect(framing.panX).toBeCloseTo(
      7 / 18,
    )
  })

  it('prevents vertical panning beyond the image edge', () => {
    const framing = constrainImageFraming(
      {
        width: 900,
        height: 1600,
      },
      squareTarget,
      {
        zoom: 1,
        panX: 0,
        panY: -100,
      },
    )

    expect(framing.panY).toBeCloseTo(
      -(7 / 18),
    )
  })

  it('does not allow panning on an axis without overflow', () => {
    const framing = constrainImageFraming(
      {
        width: 1600,
        height: 900,
      },
      squareTarget,
      {
        zoom: 1,
        panX: 0,
        panY: 1,
      },
    )

    expect(framing.panY).toBe(0)
  })

  it('allows more panning after zooming in', () => {
    const framing = constrainImageFraming(
      {
        width: 1000,
        height: 1000,
      },
      squareTarget,
      {
        zoom: 2,
        panX: 10,
        panY: -10,
      },
    )

    expect(framing).toEqual({
      zoom: 2,
      panX: 0.5,
      panY: -0.5,
    })
  })

  it('keeps the image covering the target after maximum pan', () => {
    const placement = calculateFramedImagePlacement(
      {
        width: 1000,
        height: 1000,
      },
      squareTarget,
      {
        zoom: 2,
        panX: 100,
        panY: 100,
      },
    )

    expect(placement).toEqual({
      width: 2,
      height: 2,
      offsetX: 0,
      offsetY: 0,
    })
  })

  it('rejects non-finite framing values', () => {
    expect(() => {
      constrainImageFraming(
        {
          width: 1000,
          height: 1000,
        },
        squareTarget,
        {
          zoom: Number.NaN,
          panX: 0,
          panY: 0,
        },
      )
    }).toThrow(RangeError)
  })
})
