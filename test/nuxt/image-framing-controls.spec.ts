import {
  mount,
} from '@vue/test-utils'

import {
  describe,
  expect,
  it,
} from 'vitest'

import ImageFramingControls from '../../app/components/image-grid/ImageFramingControls.vue'

describe('image framing controls', () => {
  const framing = {
    zoom: 1,
    panX: 0,
    panY: 0,
  }

  it('emits a zoom change', async () => {
    const wrapper = mount(
      ImageFramingControls,
      {
        props: {
          imageName: 'photo.jpg',
          framing,
        },
      },
    )

    await wrapper
      .get('[data-framing-zoom]')
      .setValue('1.5')

    expect(
      wrapper.emitted('zoomChange'),
    ).toEqual([
      [
        1.5,
      ],
    ])
  })

  it('emits a framing reset', async () => {
    const wrapper = mount(
      ImageFramingControls,
      {
        props: {
          imageName: 'photo.jpg',
          framing,
        },
      },
    )

    await wrapper
      .get('[data-reset-framing]')
      .trigger('click')

    expect(
      wrapper.emitted('reset'),
    ).toHaveLength(1)
  })

  it('displays the image name and current zoom', () => {
    const wrapper = mount(
      ImageFramingControls,
      {
        props: {
          imageName: 'portrait.png',
          framing: {
            zoom: 1.75,
            panX: 0,
            panY: 0,
          },
        },
      },
    )

    expect(wrapper.text()).toContain(
      'portrait.png',
    )

    expect(wrapper.text()).toContain(
      '175 %',
    )
  })
  it('allows zooming below cover size', async () => {
    const wrapper = mount(
      ImageFramingControls,
      {
        props: {
          imageName: 'photo.jpg',
          framing,
        },
      },
    )

    const input = wrapper.get(
      '[data-framing-zoom]',
    )

    expect(
      input.attributes('min'),
    ).toBe('0.25')

    await input.setValue('0.5')

    expect(
      wrapper.emitted('zoomChange'),
    ).toEqual([
      [
        0.5,
      ],
    ])
  })

})
