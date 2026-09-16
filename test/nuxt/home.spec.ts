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
      'Choisissez une grille',
    )

    expect(wrapper.text()).toContain(
      'Aperçu',
    )
  })
})
