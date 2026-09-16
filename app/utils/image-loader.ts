import type {
  ImageDimensions,
} from '../types/image-placement'

export interface LoadedImageResource {
  readonly element: HTMLImageElement
  readonly dimensions: ImageDimensions
}

export function loadImageResource(
  source: string,
): Promise<LoadedImageResource> {
  if (source.length === 0) {
    return Promise.reject(
      new TypeError('Image source is required'),
    )
  }

  return new Promise((resolve, reject) => {
    const image = new Image()

    function cleanup(): void {
      image.onload = null
      image.onerror = null
    }

    image.onload = () => {
      const dimensions = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      }

      cleanup()

      if (
        !Number.isFinite(dimensions.width)
        || !Number.isFinite(dimensions.height)
        || dimensions.width <= 0
        || dimensions.height <= 0
      ) {
        reject(
          new RangeError(
            'Loaded image dimensions must be finite positive numbers',
          ),
        )

        return
      }

      resolve({
        element: image,
        dimensions,
      })
    }

    image.onerror = () => {
      cleanup()

      reject(
        new Error('Unable to load image'),
      )
    }

    image.src = source
  })
}
