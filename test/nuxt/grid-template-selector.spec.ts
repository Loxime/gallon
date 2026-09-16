import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import HomePage from '~/pages/index.vue'

describe('grid template selector', () => {
  it('renders every available template', async () => {
    const wrapper = await mountSuspended(HomePage)

    const templateButtons = wrapper.findAll(
      '[data-template-id]',
    )

    expect(templateButtons).toHaveLength(4)
  })

  it('selects the default template initially', async () => {
    const wrapper = await mountSuspended(HomePage)

    const defaultTemplate = wrapper.get(
      '[data-template-id="two-columns"]',
    )

    expect(defaultTemplate.attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-selected-template]').text()).toBe(
      '2 colonnes',
    )
  })

  it('updates the selected template after a click', async () => {
    const wrapper = await mountSuspended(HomePage)

    const twoRowsTemplate = wrapper.get(
      '[data-template-id="two-rows"]',
    )

    expect(twoRowsTemplate.attributes('aria-pressed')).toBe('false')

    await twoRowsTemplate.trigger('click')

    expect(twoRowsTemplate.attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-selected-template]').text()).toBe(
      '2 lignes',
    )
  })
})
