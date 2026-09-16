import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  moveArrayItem,
} from '../../app/utils/array-order'

describe('array order', () => {
  it('moves an item forward', () => {
    expect(
      moveArrayItem(
        ['a', 'b', 'c'],
        0,
        2,
      ),
    ).toEqual([
      'b',
      'c',
      'a',
    ])
  })

  it('moves an item backward', () => {
    expect(
      moveArrayItem(
        ['a', 'b', 'c'],
        2,
        0,
      ),
    ).toEqual([
      'c',
      'a',
      'b',
    ])
  })

  it('does not mutate the source array', () => {
    const source = [
      'a',
      'b',
      'c',
    ]

    const result = moveArrayItem(
      source,
      0,
      2,
    )

    expect(source).toEqual([
      'a',
      'b',
      'c',
    ])

    expect(result).not.toBe(source)
  })

  it('keeps the order for an invalid move', () => {
    expect(
      moveArrayItem(
        ['a', 'b', 'c'],
        4,
        0,
      ),
    ).toEqual([
      'a',
      'b',
      'c',
    ])
  })

  it('keeps the order when source and target are identical', () => {
    expect(
      moveArrayItem(
        ['a', 'b', 'c'],
        1,
        1,
      ),
    ).toEqual([
      'a',
      'b',
      'c',
    ])
  })
})
