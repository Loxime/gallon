import {
  flushPromises,
  mount,
} from '@vue/test-utils'

import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import ImageGridPreview from '../../app/components/image-grid/ImageGridPreview.vue'

import type {
  ImportedImage,
} from '../../app/types/image'

import {
  GRID_TEMPLATES,
} from '../../app/utils/grid-templates'

function createImage(): ImportedImage {
  return {
    id: 'image-1',
    file: new File(
      ['image-content'],
      'photo.jpg',
      {
        type: 'image/jpeg',
      },
    ),
    objectUrl: 'blob:image-1',
  }
}

function installImageMock() {
  class MockImage {
    naturalWidth = 500
    naturalHeight = 1000

    onload: (() => void) | null = null
    onerror: (() => void) | null = null

    set src(_value: string) {
      queueMicrotask(() => {
        this.onload?.()
      })
    }
  }

  vi.stubGlobal(
    'Image',
    MockImage,
  )
}

describe('image grid framing', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('emits the selected image id', async () => {
    installImageMock()

    const template = GRID_TEMPLATES.find(
      item => item.id === 'two-columns',
    )

    expect(template).toBeDefined()

    if (!template) {
      return
    }

    const wrapper = mount(
      ImageGridPreview,
      {
        props: {
          template,
          images: [
            createImage(),
          ],
        },
      },
    )

    await flushPromises()

    await wrapper
      .get('[data-grid-cell]')
      .trigger('click')

    expect(
      wrapper.emitted('select'),
    ).toEqual([
      [
        'image-1',
      ],
    ])
  })

  it('marks the selected image cell', async () => {
    installImageMock()

    const template = GRID_TEMPLATES.find(
      item => item.id === 'two-columns',
    )

    expect(template).toBeDefined()

    if (!template) {
      return
    }

    const wrapper = mount(
      ImageGridPreview,
      {
        props: {
          template,
          images: [
            createImage(),
          ],
          selectedImageId: 'image-1',
        },
      },
    )

    await flushPromises()

    expect(
      wrapper
        .get('[data-grid-cell]')
        .attributes('aria-pressed'),
    ).toBe('true')
  })

  it('applies stored zoom framing to the image', async () => {
    installImageMock()

    const template = GRID_TEMPLATES.find(
      item => item.id === 'two-columns',
    )

    expect(template).toBeDefined()

    if (!template) {
      return
    }

    const wrapper = mount(
      ImageGridPreview,
      {
        props: {
          template,
          images: [
            createImage(),
          ],
          framings: {
            'image-1': {
              zoom: 2,
              panX: 0,
              panY: 0,
            },
          },
        },
      },
    )

    await flushPromises()

    const style = wrapper
      .get('[data-grid-image]')
      .attributes('style')

    expect(style).toContain(
      'left: -50%',
    )

    expect(style).toContain(
      'top: -50%',
    )

    expect(style).toContain(
      'width: 200%',
    )

    expect(style).toContain(
      'height: 200%',
    )
  })
  it('centers an image when zoomed below cover size', async () => {
    installImageMock()

    const template = GRID_TEMPLATES.find(
      item => item.id === 'two-columns',
    )

    expect(template).toBeDefined()

    if (!template) {
      return
    }

    const wrapper = mount(
      ImageGridPreview,
      {
        props: {
          template,
          images: [
            createImage(),
          ],
          framings: {
            'image-1': {
              zoom: 0.5,
              panX: 0,
              panY: 0,
            },
          },
        },
      },
    )

    await flushPromises()

    const style = wrapper
      .get('[data-grid-image]')
      .attributes('style')

    expect(style).toContain(
      'left: 25%',
    )

    expect(style).toContain(
      'top: 25%',
    )

    expect(style).toContain(
      'width: 50%',
    )

    expect(style).toContain(
      'height: 50%',
    )
  })

})
