import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import ImageDropzone from '../../app/components/image-import/ImageDropzone.vue'

function createFile(
  name: string,
  type: string,
): File {
  return new File(
    ['image-content'],
    name,
    { type },
  )
}

describe('image dropzone', () => {
  it('configures the file input for multiple supported images', async () => {
    const wrapper = await mountSuspended(ImageDropzone)

    const input = wrapper.get(
      '[data-image-input]',
    )

    expect(input.attributes('multiple')).toBeDefined()

    expect(input.attributes('accept')).toBe(
      'image/jpeg,image/png,image/webp',
    )
  })

  it('emits files selected from the file input', async () => {
    const wrapper = await mountSuspended(ImageDropzone)

    const first = createFile(
      'first.jpg',
      'image/jpeg',
    )

    const second = createFile(
      'second.png',
      'image/png',
    )

    const input = wrapper.get(
      '[data-image-input]',
    )

    Object.defineProperty(
      input.element,
      'files',
      {
        configurable: true,
        value: [
          first,
          second,
        ],
      },
    )

    await input.trigger('change')

    expect(wrapper.emitted('filesSelected')).toEqual([
      [
        [
          first,
          second,
        ],
      ],
    ])
  })

  it('emits dropped files', async () => {
    const wrapper = await mountSuspended(ImageDropzone)

    const image = createFile(
      'photo.webp',
      'image/webp',
    )

    await wrapper.get(
      '[data-image-dropzone]',
    ).trigger('drop', {
      dataTransfer: {
        files: [
          image,
        ],
      },
    })

    expect(wrapper.emitted('filesSelected')).toEqual([
      [
        [
          image,
        ],
      ],
    ])
  })

  it('does not emit files when disabled', async () => {
    const wrapper = await mountSuspended(
      ImageDropzone,
      {
        props: {
          disabled: true,
        },
      },
    )

    const image = createFile(
      'photo.jpg',
      'image/jpeg',
    )

    await wrapper.get(
      '[data-image-dropzone]',
    ).trigger('drop', {
      dataTransfer: {
        files: [
          image,
        ],
      },
    })

    expect(
      wrapper.emitted('filesSelected'),
    ).toBeUndefined()
  })
})
