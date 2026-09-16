import { describe, expect, it } from 'vitest'

import { calculateCoverPlacement } from '../../app/utils/image-placement'

describe('image placement', () => {
  describe('cover placement', () => {
    it('covers a square with a landscape image', () => {
      const placement = calculateCoverPlacement(
        {
          width: 1600,
          height: 900,
        },
        {
          width: 400,
          height: 400,
        },
      )

      expect(placement.scale).toBeCloseTo(
        400 / 900,
      )

      expect(placement.width).toBeCloseTo(
        711.111111,
      )

      expect(placement.height).toBeCloseTo(400)

      expect(placement.offsetX).toBeCloseTo(
        -155.555556,
      )

      expect(placement.offsetY).toBeCloseTo(0)
    })

    it('covers a square with a portrait image', () => {
      const placement = calculateCoverPlacement(
        {
          width: 900,
          height: 1600,
        },
        {
          width: 400,
          height: 400,
        },
      )

      expect(placement.width).toBeCloseTo(400)

      expect(placement.height).toBeCloseTo(
        711.111111,
      )

      expect(placement.offsetX).toBeCloseTo(0)

      expect(placement.offsetY).toBeCloseTo(
        -155.555556,
      )
    })

    it('does not crop an image with the same aspect ratio', () => {
      const placement = calculateCoverPlacement(
        {
          width: 1200,
          height: 600,
        },
        {
          width: 600,
          height: 300,
        },
      )

      expect(placement).toEqual({
        scale: 0.5,
        width: 600,
        height: 300,
        offsetX: 0,
        offsetY: 0,
      })
    })

    it('works with normalized grid dimensions', () => {
      const placement = calculateCoverPlacement(
        {
          width: 1600,
          height: 900,
        },
        {
          width: 0.5,
          height: 1,
        },
      )

      expect(placement.height).toBeCloseTo(1)

      expect(placement.width).toBeCloseTo(
        1600 / 900,
      )

      expect(placement.offsetX).toBeLessThan(0)
      expect(placement.offsetY).toBeCloseTo(0)
    })

    it.each([
      {
        source: {
          width: 0,
          height: 100,
        },
        target: {
          width: 100,
          height: 100,
        },
      },
      {
        source: {
          width: 100,
          height: -1,
        },
        target: {
          width: 100,
          height: 100,
        },
      },
      {
        source: {
          width: 100,
          height: 100,
        },
        target: {
          width: 0,
          height: 100,
        },
      },
      {
        source: {
          width: Number.NaN,
          height: 100,
        },
        target: {
          width: 100,
          height: 100,
        },
      },
    ])(
      'rejects invalid dimensions',
      ({ source, target }) => {
        expect(() => {
          calculateCoverPlacement(
            source,
            target,
          )
        }).toThrow(RangeError)
      },
    )
  })
})
