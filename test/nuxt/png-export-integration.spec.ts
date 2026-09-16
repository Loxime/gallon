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

function createFile(): File {
  return new File(
    ['image-content'],
    'photo.jpg',
    {
      type: 'image/jpeg',
    },
  )
}

describe('PNG export integration', () => {
  beforeEach(() => {
    Object.defineProperty(
      URL,
      'createObjectURL',
      {
        configurable: true,
        value: vi.fn(
          () => 'blob:photo.jpg',
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

  async function importImage(
    wrapper: Awaited<
      ReturnType<typeof mountSuspended>
    >,
  ): Promise<void> {
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

  it('disables export when the grid is empty', async () => {
    const wrapper = await mountSuspended(
      HomePage,
    )

    expect(
      wrapper
        .get('[data-export-png]')
        .attributes('disabled'),
    ).toBeDefined()
  })

  it('enables export after importing an image', async () => {
    const wrapper = await mountSuspended(
      HomePage,
    )

    await importImage(wrapper)

    expect(
      wrapper
        .get('[data-export-png]')
        .attributes('disabled'),
    ).toBeUndefined()
  })

  it('shows feedback when canvas export is unavailable', async () => {
    const wrapper = await mountSuspended(
      HomePage,
    )

    await importImage(wrapper)

    await wrapper
      .get('[data-export-png]')
      .trigger('click')

    expect(
      wrapper
        .get('[data-export-notice]')
        .text(),
    ).toContain(
      'Impossible d’exporter',
    )
  })
})
