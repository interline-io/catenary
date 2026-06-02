import { describe, it, expect } from 'vitest'
import CatButton from './button.vue'
import {
  mountComponent,
  variantProps,
  sizeProps,
  testBulmaClasses,
  testSlotContent,
  testDisabledState
} from '../testutil/component-helpers'

describe('CatButton', () => {
  it('renders default button', () => {
    const wrapper = mountComponent(CatButton, {
      slots: {
        default: 'Click me'
      }
    })

    expect(wrapper.html()).toContain('Click me')
    expect(wrapper.find('button').exists()).toBe(true)
    testBulmaClasses(wrapper.find('button'), ['button'])
  })

  it('renders all variants', () => {
    variantProps().forEach((variant) => {
      const wrapper = mountComponent(CatButton, {
        props: { variant },
        slots: { default: 'Button' }
      })

      testBulmaClasses(wrapper.find('button'), ['button', `is-${variant}`])
    })
  })

  it('renders all sizes', () => {
    sizeProps().forEach((size) => {
      if (size === 'normal') return // 'normal' doesn't add a class

      const wrapper = mountComponent(CatButton, {
        props: { size },
        slots: { default: 'Button' }
      })

      testBulmaClasses(wrapper.find('button'), ['button', `is-${size}`])
    })
  })

  it('renders outlined variant', () => {
    const wrapper = mountComponent(CatButton, {
      props: {
        variant: 'primary',
        outlined: true
      },
      slots: { default: 'Button' }
    })

    testBulmaClasses(wrapper.find('button'), ['button', 'is-primary', 'is-outlined'])
  })

  it('renders rounded variant', () => {
    const wrapper = mountComponent(CatButton, {
      props: { rounded: true },
      slots: { default: 'Button' }
    })

    testBulmaClasses(wrapper.find('button'), ['button', 'is-rounded'])
  })

  it('renders loading state', () => {
    const wrapper = mountComponent(CatButton, {
      props: { loading: true },
      slots: { default: 'Button' }
    })

    testBulmaClasses(wrapper.find('button'), ['button', 'is-loading'])
  })

  it('handles disabled state', () => {
    const wrapper = mountComponent(CatButton, {
      props: { disabled: true },
      slots: { default: 'Button' }
    })

    testDisabledState(wrapper, 'button')
  })

  it('emits click event', async () => {
    const wrapper = mountComponent(CatButton, {
      slots: { default: 'Button' }
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('renders slot content', () => {
    const wrapper = mountComponent(CatButton, {
      slots: {
        default: '<span>Custom Content</span>'
      }
    })

    testSlotContent(wrapper, 'Custom Content')
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mountComponent(CatButton, {
      props: { disabled: true },
      slots: { default: 'Button' }
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('renders an icon-only button from the icon prop', () => {
    const wrapper = mountComponent(CatButton, {
      props: { icon: 'magnify' },
      attrs: { 'aria-label': 'Search' }
    })

    const icon = wrapper.find('button .icon i')
    expect(icon.exists()).toBe(true)
    expect(icon.classes()).toContain('mdi-magnify')
    // The glyph is decorative; the accessible name comes from aria-label.
    expect(wrapper.find('button .icon').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('button').attributes('aria-label')).toBe('Search')
    // No empty text span should be rendered for an icon-only button.
    expect(wrapper.find('button > span:not(.icon)').exists()).toBe(false)
  })

  it('ignores the icon prop when a default slot is present', () => {
    const wrapper = mountComponent(CatButton, {
      props: { icon: 'magnify' },
      slots: { default: 'Search' }
    })

    expect(wrapper.text()).toContain('Search')
    expect(wrapper.find('button .icon').exists()).toBe(false)
  })
})
