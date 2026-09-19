import { describe, it, expect, vi } from 'vitest'
import { mountComponent } from '../testutil/component-helpers'
import CatRadio from './radio.vue'
import CatSwitch from './switch.vue'
import CatCheckbox from './checkbox.vue'

// cat-radio, cat-switch and cat-checkbox all render their native control inside
// their own <label>, which is the component's root. Undirected fallthrough
// attributes therefore land on the label, where several of them do nothing:
// `@focus` and `@blur` never reach it from the input, and an `id` resolves to a
// non-labelable element. They share one routing rule, so they share one suite.
const CASES = [
  { name: 'cat-radio', component: CatRadio, props: { modelValue: 'a', nativeValue: 'a', name: 'probe-group' } },
  { name: 'cat-switch', component: CatSwitch, props: { modelValue: true } },
  { name: 'cat-checkbox', component: CatCheckbox, props: { modelValue: false } }
]

describe.each(CASES)('$name fallthrough attributes', ({ component, props }) => {
  const mountIt = (attrs: Record<string, unknown> = {}) =>
    mountComponent(component, { props, attrs, slots: { default: () => 'Label text' } })

  // focus and blur do not reach the label from the input, so a handler routed
  // there is silently dead rather than merely misplaced.
  it('delivers focus and blur to the input', async () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    const w = mountIt({ onFocus, onBlur })

    await w.find('input').trigger('focus')
    await w.find('input').trigger('blur')

    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onBlur).toHaveBeenCalledTimes(1)
    w.unmount()
  })

  // An id on the label resolves to a non-labelable element, so getElementById
  // and <label for> both miss the control; aria-describedby on the label never
  // reaches the input's accessible description.
  it('puts id, aria-* and data-* on the input only', () => {
    const w = mountIt({ 'id': 'probe', 'aria-describedby': 'hint', 'data-probe': '1' })

    for (const attr of ['id', 'aria-describedby', 'data-probe']) {
      expect(w.find('label').attributes(attr), attr).toBeUndefined()
    }
    expect(w.find('input').attributes('id')).toBe('probe')
    expect(w.find('input').attributes('aria-describedby')).toBe('hint')
    expect(w.find('input').attributes('data-probe')).toBe('1')
    w.unmount()
  })

  // The label is the larger target, which is why the listeners it can observe
  // stay on it: hovering the visible text has to count, not just the box.
  it('fires mouseenter from the label', async () => {
    const onMouseenter = vi.fn()
    const w = mountIt({ onMouseenter })

    await w.find('label').trigger('mouseenter')

    expect(onMouseenter).toHaveBeenCalledTimes(1)
    w.unmount()
  })

  // Moving a consumer's spacing class onto the box would shift the layout of
  // every existing call site, so class and style stay on the label alone.
  it('keeps class and style on the label alone', () => {
    const w = mountIt({ class: 'mt-2', style: 'color: red' })

    expect(w.find('label').classes()).toContain('mt-2')
    expect(w.find('input').classes()).not.toContain('mt-2')
    w.unmount()
  })
})
