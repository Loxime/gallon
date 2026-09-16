import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  useImageAssignments,
} from '../../app/composables/useImageAssignments'

describe('image assignments', () => {
  it('assigns an image to a cell', () => {
    const {
      assignments,
      assignImage,
    } = useImageAssignments()

    assignImage(
      'cell-2',
      'image-a',
    )

    expect(assignments.value).toEqual({
      'cell-2': 'image-a',
    })
  })

  it('supports empty cells between assigned images', () => {
    const {
      assignments,
      assignImage,
    } = useImageAssignments()

    assignImage(
      'cell-1',
      'image-a',
    )

    assignImage(
      'cell-3',
      'image-b',
    )

    expect(assignments.value).toEqual({
      'cell-1': 'image-a',
      'cell-3': 'image-b',
    })

    expect(
      assignments.value['cell-2'],
    ).toBeUndefined()
  })

  it('moves an image when assigning it to another cell', () => {
    const {
      assignments,
      assignImage,
    } = useImageAssignments()

    assignImage(
      'cell-1',
      'image-a',
    )

    assignImage(
      'cell-3',
      'image-a',
    )

    expect(assignments.value).toEqual({
      'cell-3': 'image-a',
    })
  })

  it('unassigns a cell without removing other assignments', () => {
    const {
      assignments,
      assignImage,
      unassignCell,
    } = useImageAssignments()

    assignImage(
      'cell-1',
      'image-a',
    )

    assignImage(
      'cell-2',
      'image-b',
    )

    expect(
      unassignCell('cell-1'),
    ).toBe(true)

    expect(assignments.value).toEqual({
      'cell-2': 'image-b',
    })
  })

  it('transfers an assignment when an image is replaced', () => {
    const {
      assignments,
      assignImage,
      replaceImage,
    } = useImageAssignments()

    assignImage(
      'cell-2',
      'old-image',
    )

    expect(
      replaceImage(
        'old-image',
        'new-image',
      ),
    ).toBe(true)

    expect(assignments.value).toEqual({
      'cell-2': 'new-image',
    })
  })

  it('assigns images sequentially for the existing import flow', () => {
    const {
      assignments,
      assignSequentially,
    } = useImageAssignments()

    assignSequentially(
      [
        'cell-1',
        'cell-2',
        'cell-3',
      ],
      [
        'image-a',
        'image-b',
      ],
    )

    expect(assignments.value).toEqual({
      'cell-1': 'image-a',
      'cell-2': 'image-b',
    })
  })

  it('preserves valid assignments and fills empty cells', () => {
    const {
      assignments,
      assignImage,
      syncAssignments,
    } = useImageAssignments()

    assignImage(
      'cell-3',
      'image-a',
    )

    syncAssignments(
      [
        'cell-1',
        'cell-2',
        'cell-3',
      ],
      [
        'image-a',
        'image-b',
      ],
    )

    expect(assignments.value).toEqual({
      'cell-1': 'image-b',
      'cell-3': 'image-a',
    })
  })

  it('removes assignments that no longer exist', () => {
    const {
      assignments,
      assignImage,
      syncAssignments,
    } = useImageAssignments()

    assignImage(
      'cell-1',
      'image-a',
    )

    assignImage(
      'cell-3',
      'image-b',
    )

    syncAssignments(
      [
        'cell-1',
        'cell-2',
      ],
      [
        'image-a',
      ],
    )

    expect(assignments.value).toEqual({
      'cell-1': 'image-a',
    })
  })
})
