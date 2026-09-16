import { describe, expect, it } from 'vitest'

import {
  calculateRelativeCoverPlacement,
} from '../../app/utils/image-placement'

describe('relative image placement', () => {
  it('fills a target with the same aspect ratio exactly', () => {
    const placement = calculateRelativeCoverPlacement(
      {
        width: 500,
        height: 1000,
      },
      {
        width: 0.5,
        height: 1,
      },
    )

    expect(placement).toEqual({
      width: 1,
      height: 1,
      offsetX: 0,
      offsetY: 0,
    })
  })

  it('expresses horizontal overflow relative to the target', () => {
    const placement = calculateRelativeCoverPlacement(
      {
        width: 1600,
        height: 900,
      },
      {
        width: 400,
        height: 400,
      },
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

  it('expresses vertical overflow relative to the target', () => {
    const placement = calculateRelativeCoverPlacement(
      {
        width: 900,
        height: 1600,
      },
      {
        width: 400,
        height: 400,
      },
    )

    expect(placement.width).toBeCloseTo(1)

    expect(placement.height).toBeCloseTo(
      16 / 9,
    )

    expect(placement.offsetX).toBeCloseTo(0)

    expect(placement.offsetY).toBeLessThan(0)
  })
})
