import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { mdiAccount, mdiCheck, mdiHome } from '@mdi/js'
import CatIcon from './icon.vue'
import CatButton from './button.vue'
import CatPagination from './pagination.vue'
import CatThemeToggle from './theme-toggle.vue'
import { CatenaryPlugin } from '../index'
import { registerIcons } from '../util/icons'
import { expectNoAxeViolations } from '../testutil/component-helpers'

describe('cat-icon accessibility semantics', () => {
  it('is hidden from assistive technology by default (decorative)', () => {
    const wrapper = mount(CatIcon, { props: { icon: 'check' } })
    const span = wrapper.find('.icon')
    expect(span.attributes('aria-hidden')).toBe('true')
    expect(span.attributes('role')).toBeUndefined()
    expect(span.attributes('aria-label')).toBeUndefined()
    wrapper.unmount()
  })

  it('renders as a named image when ariaLabel is set (meaningful)', () => {
    const wrapper = mount(CatIcon, { props: { icon: 'alert', ariaLabel: 'Warning' } })
    const span = wrapper.find('.icon')
    expect(span.attributes('role')).toBe('img')
    expect(span.attributes('aria-label')).toBe('Warning')
    expect(span.attributes('aria-hidden')).toBeUndefined()
    wrapper.unmount()
  })

  it('has no axe violations in either mode', async () => {
    const decorative = mount(CatIcon, { attachTo: document.body, props: { icon: 'check' } })
    await expectNoAxeViolations(decorative)
    decorative.unmount()

    const meaningful = mount(CatIcon, { attachTo: document.body, props: { icon: 'alert', ariaLabel: 'Warning' } })
    await expectNoAxeViolations(meaningful)
    meaningful.unmount()
  })
})

describe('cat-icon rendering', () => {
  it('renders a registered icon as an inline SVG', () => {
    const wrapper = mount(CatIcon, { props: { icon: 'check' } })
    const svg = wrapper.find('.icon svg')
    expect(svg.exists()).toBe(true)
    expect(svg.attributes('data-icon')).toBe('check')
    expect(svg.attributes('viewBox')).toBe('0 0 24 24')
    expect(svg.attributes('focusable')).toBe('false')
    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.find('path').attributes('d')).toBe(mdiCheck)
    expect(wrapper.find('i').exists()).toBe(false)
    wrapper.unmount()
  })

  it('falls back to the webfont class for a name that is not registered', () => {
    const wrapper = mount(CatIcon, { props: { icon: 'not-a-registered-icon' } })
    const glyph = wrapper.find('.icon i')
    expect(glyph.classes()).toEqual(expect.arrayContaining(['mdi', 'mdi-not-a-registered-icon', 'mdi-24px']))
    expect(wrapper.find('svg').exists()).toBe(false)
    wrapper.unmount()
  })

  it('sizes the SVG as the webfont sizes its glyph', () => {
    const cases: { size?: 'small' | 'medium' | 'large', px?: string }[] = [
      { size: 'small' },
      { px: '24px' },
      { size: 'medium', px: '36px' },
      { size: 'large', px: '48px' }
    ]
    for (const { size, px } of cases) {
      const svg = mount(CatIcon, { props: { icon: 'check', size } }).find('svg').element as SVGElement
      expect(svg.style.fontSize || undefined).toBe(px)

      const font = mount(CatIcon, { props: { icon: 'not-a-registered-icon', size } }).find('i')
      expect(font.classes().some(c => /^mdi-\d+px$/.test(c))).toBe(px !== undefined)
    }
  })

  it('swaps in an icon registered after it rendered', async () => {
    const wrapper = mount(CatIcon, { props: { icon: 'late-registered' } })
    expect(wrapper.find('i.mdi-late-registered').exists()).toBe(true)
    registerIcons({ 'late-registered': mdiAccount })
    await nextTick()
    expect(wrapper.find('svg path').attributes('d')).toBe(mdiAccount)
    wrapper.unmount()
  })

  it('registers icons passed to the plugin', () => {
    const wrapper = mount(CatIcon, {
      props: { icon: 'plugin-registered' },
      global: { plugins: [[CatenaryPlugin, { icons: { 'plugin-registered': mdiHome } }]] }
    })
    expect(wrapper.find('svg path').attributes('d')).toBe(mdiHome)
    wrapper.unmount()
  })

  it('has no axe violations as a webfont fallback', async () => {
    const wrapper = mount(CatIcon, { attachTo: document.body, props: { icon: 'not-a-registered-icon' } })
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })
})

describe('icons inside other controls', () => {
  it('render as SVG without the webfont', async () => {
    const button = mount(CatButton, { props: { loading: true }, slots: { default: 'Save' } })
    const spinner = button.find('svg[data-icon="loading"]')
    expect(spinner.classes()).toContain('cat-icon-spin')

    const pagination = mount(CatPagination, { props: { total: 50, perPage: 10, current: 2 } })
    expect(pagination.find('svg[data-icon="chevron-left"]').exists()).toBe(true)
    expect(pagination.find('svg[data-icon="chevron-right"]').exists()).toBe(true)

    // jsdom has no matchMedia, which the toggle reads for the system preference
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {}
    })) as unknown as typeof window.matchMedia
    const toggle = mount(CatThemeToggle)
    expect(toggle.find('svg[data-icon^="weather-"]').exists()).toBe(true)

    for (const wrapper of [button, pagination, toggle]) {
      expect(wrapper.find('i.mdi').exists()).toBe(false)
      wrapper.unmount()
    }
  })
})
