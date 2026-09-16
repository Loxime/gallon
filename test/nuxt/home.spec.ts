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
})
