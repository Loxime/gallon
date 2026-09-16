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

import {
  GRID_TEMPLATES,
} from '../../app/utils/grid-templates'

import type {
  ImportedImage,
} from '../../app/types/image'

function createImportedImage(
  id: string,
): ImportedImage {
  return {
    id,
    file: new File(
      ['image-content'],
      `${id}.jpg`,
      {
        type: 'image/jpeg',
      },
    ),
    objectUrl: `blob:${id}`,
  }
}

function installImageMock(
  width = 500,
  height = 1000,
) {
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
        this.onload?.()
      })
    }
  }

  vi.stubGlobal(
    'Image',
    MockImage,
  )
}

describe('image grid preview', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('assigns imported images to cells in order', async () => {
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
            createImportedImage('first'),
            createImportedImage('second'),
          ],
        },
      },
    )

    await flushPromises()

    const cells = wrapper.findAll(
      '[data-grid-cell]',
    )

    expect(cells).toHaveLength(2)

    expect(
      cells[0]?.get('[data-grid-image]')
        .attributes('data-image-id'),
    ).toBe('first')

    expect(
      cells[1]?.get('[data-grid-image]')
        .attributes('data-image-id'),
    ).toBe('second')
  })

  it('leaves cells empty when no image is assigned', async () => {
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
            createImportedImage('first'),
          ],
        },
      },
    )

    await flushPromises()

    expect(
      wrapper.findAll('[data-grid-image]'),
    ).toHaveLength(1)

    expect(
      wrapper.findAll('[data-grid-cell]'),
    ).toHaveLength(2)
  })

  it('supports explicit assignments with an empty cell between images', async () => {
    installImageMock()

    const template = GRID_TEMPLATES.find(
      item => item.id === 'three-columns',
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
            createImportedImage('first'),
            createImportedImage('second'),
          ],
          assignments: {
            'cell-1': 'first',
            'cell-3': 'second',
          },
        },
      },
    )

    await flushPromises()

    const cells = wrapper.findAll(
      '[data-grid-cell]',
    )

    expect(cells).toHaveLength(3)

    expect(
      cells[0]?.get('[data-grid-image]')
        .attributes('data-image-id'),
    ).toBe('first')

    expect(
      cells[1]?.find('[data-grid-image]')
        .exists(),
    ).toBe(false)

    expect(
      cells[2]?.get('[data-grid-image]')
        .attributes('data-image-id'),
    ).toBe('second')
  })

  it('uses the cover placement inside a cell', async () => {
    installImageMock(
      500,
      1000,
    )

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
            createImportedImage('first'),
          ],
        },
      },
    )

    await flushPromises()

    const image = wrapper.get(
      '[data-grid-image]',
    )

    const style = image.attributes('style')

    expect(style).toContain('left: 0%')
    expect(style).toContain('top: 0%')
    expect(style).toContain('width: 100%')
    expect(style).toContain('height: 100%')
  })

  it('recalculates placement when the template changes', async () => {
    installImageMock(
      500,
      1000,
    )

    const columnsTemplate = GRID_TEMPLATES.find(
      item => item.id === 'two-columns',
    )

    const rowsTemplate = GRID_TEMPLATES.find(
      item => item.id === 'two-rows',
    )

    expect(columnsTemplate).toBeDefined()
    expect(rowsTemplate).toBeDefined()

    if (
      !columnsTemplate
      || !rowsTemplate
    ) {
      return
    }

    const wrapper = mount(
      ImageGridPreview,
      {
        props: {
          template: columnsTemplate,
          images: [
            createImportedImage('first'),
          ],
        },
      },
    )

    await flushPromises()

    const initialStyle = wrapper
      .get('[data-grid-image]')
      .attributes('style')

    await wrapper.setProps({
      template: rowsTemplate,
    })

    const updatedStyle = wrapper
      .get('[data-grid-image]')
      .attributes('style')

    expect(updatedStyle).not.toBe(
      initialStyle,
    )

    expect(updatedStyle).toContain(
      'height: 400%',
    )
  })
})
