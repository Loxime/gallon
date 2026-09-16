import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  loadImageResource,
} from '../../app/utils/image-loader'

interface ImageMockOptions {
  width?: number
  height?: number
  fail?: boolean
}

function installImageMock({
  width = 1600,
  height = 900,
  fail = false,
}: ImageMockOptions = {}) {
  class MockImage {
    naturalWidth = width
    naturalHeight = height

    onload: (() => void) | null = null
    onerror: (() => void) | null = null

    private _src = ''

    get src(): string {
      return this._src
    }

    set src(value: string) {
      this._src = value

      queueMicrotask(() => {
        if (fail) {
          this.onerror?.()
          return
        }

        this.onload?.()
      })
    }
  }

  vi.stubGlobal(
    'Image',
    MockImage,
  )

  return MockImage
}

describe('image loader', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads an image and exposes its natural dimensions', async () => {
    installImageMock({
      width: 1600,
      height: 900,
    })

    const resource = await loadImageResource(
      'blob:photo.jpg',
    )

    expect(resource.dimensions).toEqual({
      width: 1600,
      height: 900,
    })

    expect(resource.element.src).toBe(
      'blob:photo.jpg',
    )
  })

  it('keeps the loaded image element for rendering', async () => {
    const MockImage = installImageMock()

    const resource = await loadImageResource(
      'blob:photo.jpg',
    )

    expect(
      resource.element,
    ).toBeInstanceOf(MockImage)
  })

  it('rejects when the image cannot be loaded', async () => {
    installImageMock({
      fail: true,
    })

    await expect(
      loadImageResource('blob:broken.jpg'),
    ).rejects.toThrow(
      'Unable to load image',
    )
  })

  it('rejects invalid natural dimensions', async () => {
    installImageMock({
      width: 0,
      height: 900,
    })

    await expect(
      loadImageResource('blob:invalid.jpg'),
    ).rejects.toThrow(RangeError)
  })

  it('rejects an empty source', async () => {
    await expect(
      loadImageResource(''),
    ).rejects.toThrow(TypeError)
  })
})
