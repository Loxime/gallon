import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  DEFAULT_PNG_PIXEL_RATIO,
  exportKonvaStageAsPng,
} from '../../app/utils/png-export'

function createStage() {
  const overlay = {
    hide: vi.fn(),
    show: vi.fn(),
  }

  const stage = {
    find: vi.fn(
      () => [
        overlay,
      ],
    ),
    draw: vi.fn(),
    toDataURL: vi.fn(
      () => 'data:image/png;base64,png-data',
    ),
  }

  return {
    overlay,
    stage,
  }
}

describe('PNG export', () => {
  it('exports the stage as PNG at double resolution', () => {
    const {
      overlay,
      stage,
    } = createStage()

    const result = exportKonvaStageAsPng(
      stage,
    )

    expect(result).toBe(
      'data:image/png;base64,png-data',
    )

    expect(stage.find).toHaveBeenCalledWith(
      '.editor-overlay',
    )

    expect(overlay.hide).toHaveBeenCalledTimes(1)

    expect(stage.toDataURL).toHaveBeenCalledWith({
      mimeType: 'image/png',
      pixelRatio: DEFAULT_PNG_PIXEL_RATIO,
    })

    expect(overlay.show).toHaveBeenCalledTimes(1)

    expect(stage.draw).toHaveBeenCalledTimes(2)
  })

  it('supports a custom pixel ratio', () => {
    const { stage } = createStage()

    exportKonvaStageAsPng(
      stage,
      3,
    )

    expect(stage.toDataURL).toHaveBeenCalledWith({
      mimeType: 'image/png',
      pixelRatio: 3,
    })
  })

  it('rejects an invalid pixel ratio', () => {
    const { stage } = createStage()

    expect(() => {
      exportKonvaStageAsPng(
        stage,
        0,
      )
    }).toThrow(RangeError)

    expect(
      stage.toDataURL,
    ).not.toHaveBeenCalled()
  })

  it('restores editor overlays when export fails', () => {
    const {
      overlay,
      stage,
    } = createStage()

    stage.toDataURL.mockImplementation(
      () => {
        throw new Error('export failed')
      },
    )

    expect(() => {
      exportKonvaStageAsPng(
        stage,
      )
    }).toThrow(
      'export failed',
    )

    expect(overlay.show).toHaveBeenCalledTimes(1)
    expect(stage.draw).toHaveBeenCalledTimes(2)
  })
})
