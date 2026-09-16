import {
  flushPromises,
} from '@vue/test-utils'

import {
  mountSuspended,
} from '@nuxt/test-utils/runtime'

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import HomePage from '~/pages/index.vue'

function createFile(
  name: string,
  type = 'image/jpeg',
): File {
  return new File(
    ['image-content'],
    name,
    {
      type,
    },
  )
}

describe('image management integration', () => {
  beforeEach(() => {
    Object.defineProperty(
      URL,
      'createObjectURL',
      {
        configurable: true,
        value: vi.fn(
          (file: File) => `blob:${file.name}`,
        ),
      },
    )

    Object.defineProperty(
      URL,
      'revokeObjectURL',
      {
        configurable: true,
        value: vi.fn(),
      },
    )

    class MockImage {
      naturalWidth = 1000
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
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  async function importFiles(
    wrapper: Awaited<
      ReturnType<typeof mountSuspended>
    >,
    files: File[],
  ) {
    const input = wrapper.get(
      '[data-image-input]',
    )

    Object.defineProperty(
      input.element,
      'files',
      {
        configurable: true,
        value: files,
      },
    )

    await input.trigger('change')
    await flushPromises()
  }

  it('reorders images and keeps the preview synchronized', async () => {
    const wrapper = await mountSuspended(
      HomePage,
    )

    await importFiles(
      wrapper,
      [
        createFile('first.jpg'),
        createFile('second.jpg'),
      ],
    )

    const cardsBefore = wrapper.findAll(
      '[data-imported-image]',
    )

    expect(
      cardsBefore[0]?.text(),
    ).toContain(
      'first.jpg',
    )

    expect(
      cardsBefore[1]?.text(),
    ).toContain(
      'second.jpg',
    )

    await cardsBefore[1]
      ?.get('[data-move-image-up]')
      .trigger('click')

    await flushPromises()

    const cardsAfter = wrapper.findAll(
      '[data-imported-image]',
    )

    expect(
      cardsAfter[0]?.text(),
    ).toContain(
      'second.jpg',
    )

    expect(
      cardsAfter[1]?.text(),
    ).toContain(
      'first.jpg',
    )

    const previewImages = wrapper.findAll(
      '[data-grid-image]',
    )

    expect(
      previewImages[0]?.attributes('src'),
    ).toBe(
      'blob:second.jpg',
    )

    expect(
      previewImages[1]?.attributes('src'),
    ).toBe(
      'blob:first.jpg',
    )
  })

  it('shows contextual actions for the selected grid image', async () => {
    const wrapper = await mountSuspended(
      HomePage,
    )

    await importFiles(
      wrapper,
      [
        createFile('selected.jpg'),
      ],
    )

    await wrapper
      .get('[data-grid-cell]')
      .trigger('click')

    expect(
      wrapper.get(
        '[data-selected-cell-actions]',
      ).text(),
    ).toContain('selected.jpg')

    expect(
      wrapper.find(
        '[data-selected-cell-replace]',
      ).exists(),
    ).toBe(true)

    expect(
      wrapper.find(
        '[data-selected-cell-remove]',
      ).exists(),
    ).toBe(true)
  })

  it('removes the selected image from contextual actions', async () => {
    const wrapper = await mountSuspended(
      HomePage,
    )

    await importFiles(
      wrapper,
      [
        createFile('remove-me.jpg'),
      ],
    )

    await wrapper
      .get('[data-grid-cell]')
      .trigger('click')

    await wrapper
      .get('[data-selected-cell-remove]')
      .trigger('click')

    await flushPromises()

    expect(
      wrapper.findAll(
        '[data-imported-image]',
      ),
    ).toHaveLength(0)

    expect(
      wrapper.find(
        '[data-selected-cell-actions]',
      ).exists(),
    ).toBe(false)

    expect(
      URL.revokeObjectURL,
    ).toHaveBeenCalledWith(
      'blob:remove-me.jpg',
    )
  })

  it('resets framing when replacing the selected image', async () => {
    const wrapper = await mountSuspended(
      HomePage,
    )

    await importFiles(
      wrapper,
      [
        createFile('original.jpg'),
      ],
    )

    await wrapper
      .get('[data-grid-cell]')
      .trigger('click')

    await wrapper
      .get('[data-framing-zoom]')
      .setValue('2')

    expect(wrapper.text()).toContain(
      '200 %',
    )

    const replacementInput = wrapper.get(
      '[data-replace-image-input]',
    )

    const replacement = createFile(
      'replacement.png',
      'image/png',
    )

    Object.defineProperty(
      replacementInput.element,
      'files',
      {
        configurable: true,
        value: [
          replacement,
        ],
      },
    )

    await replacementInput.trigger(
      'change',
    )

    await flushPromises()

    expect(wrapper.text()).toContain(
      'replacement.png',
    )

    expect(wrapper.text()).toContain(
      '100 %',
    )

    expect(
      wrapper.find(
        '[data-framing-controls]',
      ).exists(),
    ).toBe(true)

    expect(
      URL.revokeObjectURL,
    ).toHaveBeenCalledWith(
      'blob:original.jpg',
    )
  })
})
