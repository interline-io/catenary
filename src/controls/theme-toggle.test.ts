import { describe, it, expect, beforeEach } from 'vitest'
import { mountComponent } from '../testutil/component-helpers'
import CatThemeToggle from './theme-toggle.vue'

describe('CatThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    // jsdom does not implement matchMedia, which the component reads for the
    // system preference when nothing is stored.
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {}
    })) as unknown as typeof window.matchMedia
  })

  // Toggle button pattern: the label names what the button controls and stays
  // fixed, while aria-pressed carries the state. A label naming the current
  // state instead ("Dark Mode" while dark) is ambiguous with one naming the
  // action, so a screen reader user cannot tell which way pressing it goes.
  it('keeps a fixed label and reports state through aria-pressed', async () => {
    const wrapper = mountComponent(CatThemeToggle)
    const button = wrapper.find('button')

    expect(button.text()).toBe('Dark mode')
    expect(button.attributes('aria-pressed')).toBe('false')

    await button.trigger('click')
    expect(button.text()).toBe('Dark mode')
    expect(button.attributes('aria-pressed')).toBe('true')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    await button.trigger('click')
    expect(button.attributes('aria-pressed')).toBe('false')
    wrapper.unmount()
  })

  it('accepts a custom label for translation', () => {
    const wrapper = mountComponent(CatThemeToggle, { props: { label: 'Modo oscuro' } })
    expect(wrapper.find('button').text()).toBe('Modo oscuro')
    wrapper.unmount()
  })

  // The glyph carries no text alternative and would otherwise leak into the
  // button's accessible name.
  it('hides the decorative icon from assistive technology', () => {
    const wrapper = mountComponent(CatThemeToggle)
    expect(wrapper.find('.icon').attributes('aria-hidden')).toBe('true')
    wrapper.unmount()
  })
})
