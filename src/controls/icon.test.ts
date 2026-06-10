import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CatIcon from './icon.vue'
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
