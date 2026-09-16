import { mountSuspended } from '@nuxt/test-utils/runtime'

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
    { type },
  )
}

describe('image import integration', () => {
  const createObjectURL = vi.fn<(file: Blob) => string>()
  const revokeObjectURL = vi.fn<(url: string) => void>()

  beforeEach(() => {
    createObjectURL.mockReset()
    revokeObjectURL.mockReset()

    createObjectURL.mockImplementation(
      file => `blob:${(file as File).name}`,
    )

    Object.defineProperty(
      URL,
      'createObjectURL',
      {
        configurable: true,
        writable: true,
        value: createObjectURL,
      },
    )

    Object.defineProperty(
      URL,
      'revokeObjectURL',
      {
        configurable: true,
        writable: true,
        value: revokeObjectURL,
      },
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  async function selectFiles(
    wrapper: Awaited<ReturnType<typeof mountSuspended>>,
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
  }

  it('imports images up to the selected grid capacity', async () => {
    const wrapper = await mountSuspended(HomePage)

    await wrapper.get(
      '[data-template-id="four-grid"]',
    ).trigger('click')

    await selectFiles(
      wrapper,
      [
        createFile('first.jpg'),
        createFile('second.jpg'),
        createFile('third.jpg'),
        createFile('fourth.jpg'),
      ],
    )

    expect(
      wrapper.findAll('[data-imported-image]'),
    ).toHaveLength(4)

    expect(
      wrapper.get('[data-image-input]').attributes('disabled'),
    ).toBeDefined()
  })

  it('imports an image directly into a chosen empty cell', async () => {
    const wrapper = await mountSuspended(HomePage)

    const secondCell = wrapper.get(
      '[data-cell-id="cell-2"]',
    )

    await secondCell.trigger('click')

    const input = wrapper.get(
      '[data-cell-image-input]',
    )

    Object.defineProperty(
      input.element,
      'files',
      {
        configurable: true,
        value: [
          createFile('target.jpg'),
        ],
      },
    )

    await input.trigger('change')

    const cells = wrapper.findAll(
      '[data-grid-cell]',
    )

    expect(
      cells[0]?.attributes(
        'data-assigned-image-id',
      ),
    ).toBeUndefined()

    expect(
      cells[1]?.attributes(
        'data-assigned-image-id',
      ),
    ).toBeDefined()

    expect(
      wrapper.findAll(
        '[data-imported-image]',
      ),
    ).toHaveLength(1)
  })

  it('imports a dropped file directly into an empty cell', async () => {
    const wrapper = await mountSuspended(HomePage)

    const firstCell = wrapper.get(
      '[data-cell-id="cell-1"]',
    )

    await firstCell.trigger(
      'drop',
      {
        dataTransfer: {
          files: [
            createFile('dropped.png', 'image/png'),
          ],
        },
      },
    )

    const cells = wrapper.findAll(
      '[data-grid-cell]',
    )

    expect(
      cells[0]?.attributes(
        'data-assigned-image-id',
      ),
    ).toBeDefined()

    expect(
      cells[1]?.attributes(
        'data-assigned-image-id',
      ),
    ).toBeUndefined()

    expect(
      wrapper.findAll(
        '[data-imported-image]',
      ),
    ).toHaveLength(1)
  })

  it('removes an imported image', async () => {
    const wrapper = await mountSuspended(HomePage)

    await selectFiles(
      wrapper,
      [
        createFile('photo.jpg'),
      ],
    )

    expect(
      wrapper.findAll('[data-imported-image]'),
    ).toHaveLength(1)

    await wrapper.get(
      '[data-remove-image]',
    ).trigger('click')

    expect(
      wrapper.findAll('[data-imported-image]'),
    ).toHaveLength(0)

    expect(revokeObjectURL).toHaveBeenCalledWith(
      'blob:photo.jpg',
    )
  })

  it('rejects unsupported files', async () => {
    const wrapper = await mountSuspended(HomePage)

    await selectFiles(
      wrapper,
      [
        createFile(
          'document.pdf',
          'application/pdf',
        ),
      ],
    )

    expect(
      wrapper.findAll('[data-imported-image]'),
    ).toHaveLength(0)

    expect(
      wrapper.get('[data-import-notice]').text(),
    ).toContain('non pris en charge')
  })

  it('trims excess images when switching to a smaller grid', async () => {
    const wrapper = await mountSuspended(HomePage)

    await wrapper.get(
      '[data-template-id="four-grid"]',
    ).trigger('click')

    await selectFiles(
      wrapper,
      [
        createFile('first.jpg'),
        createFile('second.jpg'),
        createFile('third.jpg'),
        createFile('fourth.jpg'),
      ],
    )

    expect(
      wrapper.findAll('[data-imported-image]'),
    ).toHaveLength(4)

    await wrapper.get(
      '[data-template-id="two-columns"]',
    ).trigger('click')

    expect(
      wrapper.findAll('[data-imported-image]'),
    ).toHaveLength(2)

    expect(revokeObjectURL).toHaveBeenCalledWith(
      'blob:third.jpg',
    )

    expect(revokeObjectURL).toHaveBeenCalledWith(
      'blob:fourth.jpg',
    )

    expect(
      wrapper.get('[data-import-notice]').text(),
    ).toContain('2 images ont été retirées')
  })
})
