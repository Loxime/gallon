import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import HomePage from '~/pages/index.vue'

describe('home page', () => {
  it('presents the image grid creator', async () => {
    const wrapper = await mountSuspended(HomePage)

    expect(wrapper.get('h1').text()).toBe(
      'Créateur de grille d’images',
    )

    expect(wrapper.text()).toContain(
      'Ajoutez vos images',
    )

    expect(wrapper.text()).toContain(
      'Aperçu',
    )

    expect(wrapper.text()).not.toContain(
      'Choisissez un modèle',
    )
  })

  it('uses the sidebar as the grid template selector', async () => {
    const wrapper = await mountSuspended(HomePage)

    expect(
      wrapper.get('[data-app-sidebar]').attributes('aria-label'),
    ).toBe('Modèles de grille')

    const templates = wrapper.findAll(
      '[data-template-id]',
    )

    expect(templates).toHaveLength(10)

    expect(
      templates[0]?.attributes('aria-pressed'),
    ).toBe('true')
  })
  it('updates grid spacing interactively', async () => {
    const wrapper = await mountSuspended(HomePage)

    const input = wrapper.get(
      '[data-grid-spacing]',
    )

    expect(
      (input.element as HTMLInputElement).value,
    ).toBe('0')

    expect(
      wrapper
        .get('[data-grid-spacing-value]')
        .text(),
    ).toBe('0 px')

    await input.setValue('24')

    expect(
      wrapper
        .get('[data-grid-spacing-value]')
        .text(),
    ).toBe('24 px')

    const cells = wrapper.findAll(
      '[data-grid-cell]',
    )

    expect(cells).toHaveLength(2)

    expect(
      cells[0]?.attributes('style'),
    ).toContain('width: 228px')

    expect(
      cells[1]?.attributes('style'),
    ).toContain('left: 252px')
  })

})
