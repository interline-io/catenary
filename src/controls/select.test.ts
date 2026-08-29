import { describe, it, expect } from 'vitest'
import { mountComponent } from '../testutil/component-helpers'
import CatSelect from './select.vue'

describe('CatSelect', () => {
  it('exposes focus() so parents can move focus programmatically', () => {
    const wrapper = mountComponent(CatSelect, {
      attachTo: document.body,
      props: { modelValue: 'a' },
      slots: { default: '<option value="a">A</option><option value="b">B</option>' }
    })

    const exposed = wrapper.vm as unknown as { focus: () => void, blur: () => void }
    expect(typeof exposed.focus).toBe('function')
    expect(typeof exposed.blur).toBe('function')

    exposed.focus()
    expect(document.activeElement).toBe(wrapper.find('select').element)

    exposed.blur()
    expect(document.activeElement).not.toBe(wrapper.find('select').element)

    wrapper.unmount()
  })

  describe('fallthrough attributes', () => {
    // Undeclared attributes were duplicated onto the root .control wrapper,
    // putting aria-* and data-* on an element with no role.
    it('puts aria-* and data-* on the select only', () => {
      const wrapper = mountComponent(CatSelect, {
        attrs: { 'aria-labelledby': 'ext', 'data-probe': '1' }
      })
      const root = wrapper.find('.control')
      const native = wrapper.find('select')

      for (const attr of ['aria-labelledby', 'data-probe']) {
        expect(root.attributes(attr)).toBeUndefined()
      }
      expect(native.attributes('aria-labelledby')).toBe('ext')
      expect(native.attributes('data-probe')).toBe('1')
      wrapper.unmount()
    })

    // Unlike cat-input / cat-textarea, this component declares `id` as a prop,
    // so it was absorbed rather than falling through and never reached the
    // wrapper even before inheritAttrs was set. Asserted so the distinction is
    // recorded rather than looking like an oversight.
    it('takes id as a declared prop, not a fallthrough attribute', () => {
      const wrapper = mountComponent(CatSelect, { attrs: { id: 'explicit' } })
      expect(wrapper.find('.control').attributes('id')).toBeUndefined()
      expect(wrapper.find('select').attributes('id')).toBe('explicit')
      wrapper.unmount()
    })

    // Both destinations are load-bearing: layout utilities style the wrapper,
    // typography only takes effect on the native element, since Bulma's base
    // sets font-family directly on it rather than letting it inherit.
    it('keeps class on both the wrapper and the select', () => {
      const wrapper = mountComponent(CatSelect, { attrs: { class: 'mt-2' } })
      expect(wrapper.find('.control').classes()).toContain('mt-2')
      expect(wrapper.find('select').classes()).toContain('mt-2')
      wrapper.unmount()
    })
  })
})
