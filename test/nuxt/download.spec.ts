import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  downloadDataUrl,
} from '../../app/utils/download'

describe('download data URL', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('downloads a data URL with the requested filename', () => {
    const click = vi.spyOn(
      HTMLAnchorElement.prototype,
      'click',
    ).mockImplementation(() => {})

    downloadDataUrl(
      'data:image/png;base64,png-data',
      'gallon.png',
    )

    expect(click).toHaveBeenCalledTimes(1)

    const link = click.mock.instances[0]

    expect(link).toBeInstanceOf(
      HTMLAnchorElement,
    )

    expect(
      (link as HTMLAnchorElement).download,
    ).toBe(
      'gallon.png',
    )

    expect(
      (link as HTMLAnchorElement).href,
    ).toContain(
      'data:image/png;base64,png-data',
    )

    expect(
      document.body.contains(
        link as HTMLAnchorElement,
      ),
    ).toBe(false)
  })

  it('rejects an empty filename', () => {
    expect(() => {
      downloadDataUrl(
        'data:image/png;base64,png-data',
        '   ',
      )
    }).toThrow(TypeError)
  })
})
