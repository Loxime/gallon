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

function createFile() {
  return new File(
    ['image-content'],
    'portrait.jpg',
    {
      type: 'image/jpeg',
    },
  )
}

describe('image framing integration', () => {
  beforeEach(() => {
    Object.defineProperty(
      URL,
      'createObjectURL',
      {
        configurable: true,
        value: vi.fn(
          () => 'blob:portrait.jpg',
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
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  async function importImage(
    wrapper: Awaited<
      ReturnType<typeof mountSuspended>
    >,
  ) {
    const input = wrapper.get(
      '[data-image-input]',
    )

    Object.defineProperty(
      input.element,
      'files',
      {
        configurable: true,
        value: [
          createFile(),
        ],
      },
    )

    await input.trigger('change')
    await flushPromises()
  }

  it('selects an image and changes its zoom', async () => {
    const wrapper = await mountSuspended(
      HomePage,
    )

    await importImage(wrapper)

    await wrapper
      .get('[data-grid-cell]')
      .trigger('click')

    expect(
      wrapper.find('[data-framing-controls]').exists(),
    ).toBe(true)

    expect(wrapper.text()).toContain(
      'portrait.jpg',
    )

    await wrapper
      .get('[data-framing-zoom]')
      .setValue('2')

    const style = wrapper
      .get('[data-grid-image]')
      .attributes('style')

    expect(style).toContain(
      'width: 200%',
    )

    expect(style).toContain(
      'height: 200%',
    )
  })

  it('resets the selected image framing', async () => {
    const wrapper = await mountSuspended(
      HomePage,
    )

    await importImage(wrapper)

    await wrapper
      .get('[data-grid-cell]')
      .trigger('click')

    await wrapper
      .get('[data-framing-zoom]')
      .setValue('2')

    await wrapper
      .get('[data-reset-framing]')
      .trigger('click')

    const style = wrapper
      .get('[data-grid-image]')
      .attributes('style')

    expect(style).toContain(
      'width: 100%',
    )

    expect(style).toContain(
      'height: 100%',
    )
  })
  it('selects an image for framing from the image list', async () => {
    const wrapper = await mountSuspended(
      HomePage,
    )

    await importImage(wrapper)

    expect(
      wrapper.find(
        '[data-framing-controls]',
      ).exists(),
    ).toBe(false)

    const selectButton = wrapper.get(
      '[data-select-image]',
    )

    expect(
      selectButton.element.tagName,
    ).toBe('BUTTON')

    await selectButton.trigger('click')

    expect(
      wrapper.find(
        '[data-framing-controls]',
      ).exists(),
    ).toBe(true)

    expect(
      selectButton.attributes(
        'aria-pressed',
      ),
    ).toBe('true')

    expect(
      wrapper
        .get('[data-imported-image]')
        .attributes('aria-current'),
    ).toBe('true')

    expect(wrapper.text()).toContain(
      'portrait.jpg',
    )
  })

})
