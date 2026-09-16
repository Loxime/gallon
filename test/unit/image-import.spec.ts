import { describe, expect, it } from 'vitest'

import {
  isSupportedImageFile,
  isSupportedImageMimeType,
  selectImageFiles,
} from '../../app/utils/image-import'

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

describe('image import', () => {
  describe('supported image formats', () => {
    it.each([
      'image/jpeg',
      'image/png',
      'image/webp',
    ])('accepts %s', (mimeType) => {
      expect(
        isSupportedImageMimeType(mimeType),
      ).toBe(true)
    })

    it.each([
      'image/gif',
      'image/svg+xml',
      'text/plain',
      'application/pdf',
      '',
    ])('rejects %s', (mimeType) => {
      expect(
        isSupportedImageMimeType(mimeType),
      ).toBe(false)
    })
  })

  it('validates image files from their MIME type', () => {
    const image = createFile(
      'photo.jpg',
      'image/jpeg',
    )

    const document = createFile(
      'document.pdf',
      'application/pdf',
    )

    expect(isSupportedImageFile(image)).toBe(true)
    expect(isSupportedImageFile(document)).toBe(false)
  })

  it('accepts supported files up to the available slot count', () => {
    const first = createFile(
      'first.jpg',
      'image/jpeg',
    )

    const second = createFile(
      'second.png',
      'image/png',
    )

    const third = createFile(
      'third.webp',
      'image/webp',
    )

    const selection = selectImageFiles(
      [first, second, third],
      2,
    )

    expect(selection.accepted).toEqual([
      first,
      second,
    ])

    expect(selection.rejected).toEqual([
      {
        file: third,
        reason: 'limit-exceeded',
      },
    ])
  })

  it('rejects unsupported files without consuming a slot', () => {
    const unsupported = createFile(
      'notes.txt',
      'text/plain',
    )

    const image = createFile(
      'photo.png',
      'image/png',
    )

    const selection = selectImageFiles(
      [unsupported, image],
      1,
    )

    expect(selection.accepted).toEqual([
      image,
    ])

    expect(selection.rejected).toEqual([
      {
        file: unsupported,
        reason: 'unsupported-type',
      },
    ])
  })

  it('rejects every supported file when no slot is available', () => {
    const image = createFile(
      'photo.jpg',
      'image/jpeg',
    )

    const selection = selectImageFiles(
      [image],
      0,
    )

    expect(selection.accepted).toHaveLength(0)

    expect(selection.rejected).toEqual([
      {
        file: image,
        reason: 'limit-exceeded',
      },
    ])
  })

  it('normalizes negative available slot counts to zero', () => {
    const image = createFile(
      'photo.jpg',
      'image/jpeg',
    )

    const selection = selectImageFiles(
      [image],
      -3,
    )

    expect(selection.accepted).toHaveLength(0)
    expect(selection.rejected).toHaveLength(1)
    expect(selection.rejected[0]?.reason).toBe(
      'limit-exceeded',
    )
  })
})
