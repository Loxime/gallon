import {
  mount,
} from '@vue/test-utils'

import {
  describe,
  expect,
  it,
} from 'vitest'

import ImportedImageList from '../../app/components/image-import/ImportedImageList.vue'

import type {
  ImportedImage,
} from '../../app/types/image'

function createImage(
  id: string,
  name: string,
): ImportedImage {
  return {
    id,
    file: new File(
      ['image-content'],
      name,
      {
        type: 'image/jpeg',
      },
    ),
    objectUrl: `blob:${name}`,
  }
}

const images = [
  createImage(
    'image-1',
    'first.jpg',
  ),
  createImage(
    'image-2',
    'second.jpg',
  ),
  createImage(
    'image-3',
    'third.jpg',
  ),
]

describe('imported image list', () => {
  it('disables moves beyond the list boundaries', () => {
    const wrapper = mount(
      ImportedImageList,
      {
        props: {
          images,
        },
      },
    )

    const cards = wrapper.findAll(
      '[data-imported-image]',
    )

    expect(
      cards[0]
        ?.get('[data-move-image-up]')
        .attributes('disabled'),
    ).toBeDefined()

    expect(
      cards[2]
        ?.get('[data-move-image-down]')
        .attributes('disabled'),
    ).toBeDefined()
  })

  it('emits an upward move', async () => {
    const wrapper = mount(
      ImportedImageList,
      {
        props: {
          images,
        },
      },
    )

    const secondCard = wrapper
      .findAll('[data-imported-image]')[1]

    expect(secondCard).toBeDefined()

    if (!secondCard) {
      return
    }

    await secondCard
      .get('[data-move-image-up]')
      .trigger('click')

    expect(
      wrapper.emitted('move'),
    ).toEqual([
      [
        'image-2',
        0,
      ],
    ])
  })

  it('emits a downward move', async () => {
    const wrapper = mount(
      ImportedImageList,
      {
        props: {
          images,
        },
      },
    )

    const firstCard = wrapper
      .findAll('[data-imported-image]')[0]

    expect(firstCard).toBeDefined()

    if (!firstCard) {
      return
    }

    await firstCard
      .get('[data-move-image-down]')
      .trigger('click')

    expect(
      wrapper.emitted('move'),
    ).toEqual([
      [
        'image-1',
        1,
      ],
    ])
  })

  it('emits a replacement file', async () => {
    const wrapper = mount(
      ImportedImageList,
      {
        props: {
          images: [
            images[0]!,
          ],
        },
      },
    )

    const input = wrapper.get(
      '[data-replace-image-input]',
    )

    const replacement = new File(
      ['replacement'],
      'replacement.png',
      {
        type: 'image/png',
      },
    )

    Object.defineProperty(
      input.element,
      'files',
      {
        configurable: true,
        value: [
          replacement,
        ],
      },
    )

    await input.trigger('change')

    expect(
      wrapper.emitted('replace'),
    ).toEqual([
      [
        'image-1',
        replacement,
      ],
    ])
  })

  it('keeps the existing remove action', async () => {
    const wrapper = mount(
      ImportedImageList,
      {
        props: {
          images: [
            images[0]!,
          ],
        },
      },
    )

    await wrapper
      .get('[data-remove-image]')
      .trigger('click')

    expect(
      wrapper.emitted('remove'),
    ).toEqual([
      [
        'image-1',
      ],
    ])
  })
})
