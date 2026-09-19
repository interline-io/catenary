import { describe, it, expect, vi } from 'vitest'
import { mountComponent, expectNoAxeViolations } from '../testutil/component-helpers'
import CatSlider from './slider.vue'

describe('CatSlider', () => {
  describe('fallthrough attributes', () => {
    // Without inheritAttrs: false, Vue applied every fallthrough attribute to
    // the wrapper as well as to the range input inside it. A duplicated id put
    // the same value on two elements, so getElementById and <label for>
    // resolved to the non-labelable wrapper that precedes the control.
    it('puts id, aria-* and data-* on the input only', () => {
      const wrapper = mountComponent(CatSlider, {
        attrs: { 'id': 'dup-check', 'aria-labelledby': 'ext', 'data-probe': '1' }
      })
      const root = wrapper.find('.cat-slider-wrapper')
      const native = wrapper.find('input')

      for (const attr of ['id', 'aria-labelledby', 'data-probe']) {
        expect(root.attributes(attr)).toBeUndefined()
      }
      expect(native.attributes('id')).toBe('dup-check')
      expect(native.attributes('aria-labelledby')).toBe('ext')
      expect(native.attributes('data-probe')).toBe('1')
      wrapper.unmount()
    })

    // Both destinations are load-bearing: layout utilities style the wrapper,
    // typography only takes effect on the native element.
    it('keeps class on both the wrapper and the input', () => {
      const wrapper = mountComponent(CatSlider, { attrs: { class: 'mt-2' } })
      expect(wrapper.find('.cat-slider-wrapper').classes()).toContain('mt-2')
      expect(wrapper.find('input').classes()).toContain('mt-2')
      wrapper.unmount()
    })

    // A listener bound to both the wrapper and the control ran twice for one
    // keypress, because the control's event bubbles up through the wrapper.
    it('fires a bubbling listener once per event', async () => {
      const onKeydown = vi.fn()
      const wrapper = mountComponent(CatSlider, { attrs: { onKeydown } })

      await wrapper.find('input').trigger('keydown', { key: 'ArrowRight' })

      expect(onKeydown).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    // focus does not bubble, so a wrapper-only listener would never fire.
    it('fires a non-bubbling listener on the control', async () => {
      const onFocus = vi.fn()
      const wrapper = mountComponent(CatSlider, {
        attachTo: document.body,
        attrs: { onFocus }
      })

      await wrapper.find('input').trigger('focus')

      expect(onFocus).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    // The wrapper holds the tooltip and the tick marks beside the control, so a
    // listener there still sees events from them — the reason bubbling
    // listeners go to the wrapper rather than to the input.
    it('sees an event from a tick beside the control', async () => {
      const onClick = vi.fn()
      const wrapper = mountComponent(CatSlider, {
        attrs: { onClick },
        slots: { default: '<span class="probe-tick">0</span>' }
      })

      await wrapper.find('.probe-tick').trigger('click')

      expect(onClick).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })
  })

  // Required by CLAUDE.md for any component with a visible surface. Note the
  // limit: jsdom computes no styles, so the color-contrast rules are inert here
  // and this catches structural problems only — roles, names, states. The
  // tooltip's hardcoded --bulma-grey-darker on --bulma-white and the track's
  // --bulma-grey-lighter have still never been measured in either theme; that
  // needs axe DevTools against /controls/slider, in light and dark. Tracked as
  // part of the a11y review gap in #64.
  describe('accessibility', () => {
    it('has no axe violations when labelled', async () => {
      const wrapper = mountComponent(CatSlider, {
        attachTo: document.body,
        attrs: { 'aria-label': 'Volume' }
      })
      await expectNoAxeViolations(wrapper)
      wrapper.unmount()
    })

    it('has no axe violations with ticks and a tooltip', async () => {
      const wrapper = mountComponent(CatSlider, {
        attachTo: document.body,
        props: { tooltip: true, modelValue: 50 },
        attrs: { 'aria-label': 'Volume' },
        slots: { default: '<span class="tick">0</span><span class="tick">100</span>' }
      })
      await expectNoAxeViolations(wrapper)
      wrapper.unmount()
    })

    it('has no axe violations when disabled', async () => {
      const wrapper = mountComponent(CatSlider, {
        attachTo: document.body,
        props: { disabled: true },
        attrs: { 'aria-label': 'Volume' }
      })
      await expectNoAxeViolations(wrapper)
      wrapper.unmount()
    })
  })
})
