import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  useImageFramings,
} from '../../app/composables/useImageFramings'

import {
  DEFAULT_IMAGE_FRAMING,
} from '../../app/utils/image-framing'

describe('image framings', () => {
  it('returns the default framing for an unknown image', () => {
    const {
      getFraming,
    } = useImageFramings()

    expect(
      getFraming('image-1'),
    ).toEqual(
      DEFAULT_IMAGE_FRAMING,
    )
  })

  it('stores framing independently for each image', () => {
    const {
      getFraming,
      setFraming,
    } = useImageFramings()

    setFraming(
      'image-1',
      {
        zoom: 1.5,
        panX: 0.2,
        panY: -0.1,
      },
    )

    setFraming(
      'image-2',
      {
        zoom: 2,
        panX: -0.3,
        panY: 0.4,
      },
    )

    expect(
      getFraming('image-1'),
    ).toEqual({
      zoom: 1.5,
      panX: 0.2,
      panY: -0.1,
    })

    expect(
      getFraming('image-2'),
    ).toEqual({
      zoom: 2,
      panX: -0.3,
      panY: 0.4,
    })
  })

  it('updates only the requested framing values', () => {
    const {
      getFraming,
      setFraming,
      updateFraming,
    } = useImageFramings()

    setFraming(
      'image-1',
      {
        zoom: 1.5,
        panX: 0.2,
        panY: -0.1,
      },
    )

    updateFraming(
      'image-1',
      {
        zoom: 2,
      },
    )

    expect(
      getFraming('image-1'),
    ).toEqual({
      zoom: 2,
      panX: 0.2,
      panY: -0.1,
    })
  })

  it('resets a framing to its default state', () => {
    const {
      framings,
      getFraming,
      setFraming,
      resetFraming,
    } = useImageFramings()

    setFraming(
      'image-1',
      {
        zoom: 2,
        panX: 0.5,
        panY: -0.5,
      },
    )

    resetFraming('image-1')

    expect(
      getFraming('image-1'),
    ).toEqual(
      DEFAULT_IMAGE_FRAMING,
    )

    expect(
      framings.value,
    ).not.toHaveProperty(
      'image-1',
    )
  })

  it('does not affect other images when resetting one framing', () => {
    const {
      getFraming,
      setFraming,
      resetFraming,
    } = useImageFramings()

    setFraming(
      'image-1',
      {
        zoom: 2,
        panX: 0.5,
        panY: 0,
      },
    )

    setFraming(
      'image-2',
      {
        zoom: 1.5,
        panX: 0,
        panY: 0.2,
      },
    )

    resetFraming('image-1')

    expect(
      getFraming('image-2'),
    ).toEqual({
      zoom: 1.5,
      panX: 0,
      panY: 0.2,
    })
  })

  it('removes framings for images that no longer exist', () => {
    const {
      framings,
      setFraming,
      pruneFramings,
    } = useImageFramings()

    setFraming(
      'image-1',
      {
        zoom: 1.5,
        panX: 0,
        panY: 0,
      },
    )

    setFraming(
      'image-2',
      {
        zoom: 2,
        panX: 0,
        panY: 0,
      },
    )

    setFraming(
      'image-3',
      {
        zoom: 3,
        panX: 0,
        panY: 0,
      },
    )

    pruneFramings([
      'image-1',
      'image-3',
    ])

    expect(
      Object.keys(framings.value),
    ).toEqual([
      'image-1',
      'image-3',
    ])
  })
})
