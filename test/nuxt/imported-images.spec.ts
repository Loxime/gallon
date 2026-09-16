import {
  defineComponent,
  h,
} from 'vue'

import { mount } from '@vue/test-utils'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { useImportedImages } from '../../app/composables/useImportedImages'

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

describe('imported images', () => {
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

  function mountComposable() {
    let composable:
      | ReturnType<typeof useImportedImages>
      | undefined

    const Harness = defineComponent({
      setup() {
        composable = useImportedImages()

        return () => h('div')
      },
    })

    const wrapper = mount(Harness)

    if (!composable) {
      throw new Error(
        'useImportedImages was not initialized',
      )
    }

    return {
      composable,
      wrapper,
    }
  }

  it('creates imported images for accepted files', () => {
    const { composable } = mountComposable()

    const first = createFile('first.jpg')
    const second = createFile(
      'second.png',
      'image/png',
    )

    const selection = composable.addFiles(
      [first, second],
      2,
    )

    expect(selection.accepted).toEqual([
      first,
      second,
    ])

    expect(composable.images.value).toHaveLength(2)

    expect(
      composable.images.value.map(image => image.file),
    ).toEqual([
      first,
      second,
    ])

    expect(
      composable.images.value.map(image => image.objectUrl),
    ).toEqual([
      'blob:first.jpg',
      'blob:second.png',
    ])

    expect(createObjectURL).toHaveBeenCalledTimes(2)
  })

  it('does not create object URLs for rejected files', () => {
    const { composable } = mountComposable()

    const unsupported = createFile(
      'document.pdf',
      'application/pdf',
    )

    const image = createFile('photo.jpg')

    const selection = composable.addFiles(
      [unsupported, image],
      1,
    )

    expect(selection.rejected).toHaveLength(1)
    expect(composable.images.value).toHaveLength(1)

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(createObjectURL).toHaveBeenCalledWith(image)
  })

  it('revokes an object URL when an image is removed', () => {
    const { composable } = mountComposable()

    composable.addFiles(
      [createFile('photo.jpg')],
      1,
    )

    const image = composable.images.value[0]

    expect(image).toBeDefined()

    if (!image) {
      return
    }

    expect(
      composable.removeImage(image.id),
    ).toBe(true)

    expect(composable.images.value).toHaveLength(0)

    expect(revokeObjectURL).toHaveBeenCalledWith(
      'blob:photo.jpg',
    )
  })

  it('returns false when removing an unknown image', () => {
    const { composable } = mountComposable()

    expect(
      composable.removeImage('unknown-image'),
    ).toBe(false)

    expect(revokeObjectURL).not.toHaveBeenCalled()
  })

  it('revokes every object URL when images are cleared', () => {
    const { composable } = mountComposable()

    composable.addFiles(
      [
        createFile('first.jpg'),
        createFile('second.jpg'),
      ],
      2,
    )

    composable.clearImages()

    expect(composable.images.value).toHaveLength(0)

    expect(revokeObjectURL).toHaveBeenCalledTimes(2)
    expect(revokeObjectURL).toHaveBeenCalledWith(
      'blob:first.jpg',
    )
    expect(revokeObjectURL).toHaveBeenCalledWith(
      'blob:second.jpg',
    )
  })

  it('removes excess images when the limit is reduced', () => {
    const { composable } = mountComposable()

    composable.addFiles(
      [
        createFile('first.jpg'),
        createFile('second.jpg'),
        createFile('third.jpg'),
        createFile('fourth.jpg'),
      ],
      4,
    )

    const removedCount = composable.trimToLimit(2)

    expect(removedCount).toBe(2)
    expect(composable.images.value).toHaveLength(2)

    expect(
      composable.images.value.map(image => image.file.name),
    ).toEqual([
      'first.jpg',
      'second.jpg',
    ])

    expect(revokeObjectURL).toHaveBeenCalledTimes(2)
    expect(revokeObjectURL).toHaveBeenCalledWith(
      'blob:third.jpg',
    )
    expect(revokeObjectURL).toHaveBeenCalledWith(
      'blob:fourth.jpg',
    )
  })

  it('moves an imported image to another position', () => {
    const { composable } = mountComposable()

    composable.addFiles(
      [
        createFile('first.jpg'),
        createFile('second.jpg'),
        createFile('third.jpg'),
      ],
      3,
    )

    const firstImage = composable.images.value[0]

    expect(firstImage).toBeDefined()

    if (!firstImage) {
      return
    }

    expect(
      composable.moveImage(
        firstImage.id,
        2,
      ),
    ).toBe(true)

    expect(
      composable.images.value.map(
        image => image.file.name,
      ),
    ).toEqual([
      'second.jpg',
      'third.jpg',
      'first.jpg',
    ])
  })

  it('keeps image identity when reordering', () => {
    const { composable } = mountComposable()

    composable.addFiles(
      [
        createFile('first.jpg'),
        createFile('second.jpg'),
      ],
      2,
    )

    const firstImage = composable.images.value[0]

    expect(firstImage).toBeDefined()

    if (!firstImage) {
      return
    }

    composable.moveImage(
      firstImage.id,
      1,
    )

    expect(
      composable.images.value[1]?.id,
    ).toBe(
      firstImage.id,
    )
  })

  it('replaces an image in the same position', () => {
    const { composable } = mountComposable()

    composable.addFiles(
      [
        createFile('first.jpg'),
        createFile('second.jpg'),
      ],
      2,
    )

    const firstImage = composable.images.value[0]

    expect(firstImage).toBeDefined()

    if (!firstImage) {
      return
    }

    const replacement = composable.replaceImage(
      firstImage.id,
      createFile(
        'replacement.png',
        'image/png',
      ),
    )

    expect(replacement).toBeDefined()

    expect(
      composable.images.value.map(
        image => image.file.name,
      ),
    ).toEqual([
      'replacement.png',
      'second.jpg',
    ])

    expect(
      replacement?.id,
    ).not.toBe(
      firstImage.id,
    )

    expect(
      revokeObjectURL,
    ).toHaveBeenCalledWith(
      'blob:first.jpg',
    )
  })

  it('rejects an unsupported replacement', () => {
    const { composable } = mountComposable()

    composable.addFiles(
      [
        createFile('photo.jpg'),
      ],
      1,
    )

    const image = composable.images.value[0]

    expect(image).toBeDefined()

    if (!image) {
      return
    }

    const replacement = composable.replaceImage(
      image.id,
      createFile(
        'document.pdf',
        'application/pdf',
      ),
    )

    expect(replacement).toBeUndefined()

    expect(
      composable.images.value[0]?.id,
    ).toBe(
      image.id,
    )

    expect(
      revokeObjectURL,
    ).not.toHaveBeenCalled()
  })

  it('cleans object URLs when the owner component is unmounted', () => {
    const {
      composable,
      wrapper,
    } = mountComposable()

    composable.addFiles(
      [
        createFile('first.jpg'),
        createFile('second.png', 'image/png'),
      ],
      2,
    )

    wrapper.unmount()

    expect(revokeObjectURL).toHaveBeenCalledTimes(2)
    expect(revokeObjectURL).toHaveBeenCalledWith(
      'blob:first.jpg',
    )
    expect(revokeObjectURL).toHaveBeenCalledWith(
      'blob:second.png',
    )
  })
})
