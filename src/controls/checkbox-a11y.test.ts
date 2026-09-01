import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CatCheckbox from './checkbox.vue'

const mountCb = (props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) =>
  mount(CatCheckbox, { props, attrs, attachTo: document.body })

describe('cat-checkbox accessible name', () => {
  // 10 of the 86 consumer usages are a bare <cat-checkbox> in a selection table:
  // no slot text, no label prop, and nothing else naming the control.
  it('accepts ariaLabel and puts it on the input', () => {
    const w = mountCb({ ariaLabel: 'Select shape 4471' })
    expect(w.find('input').attributes('aria-label')).toBe('Select shape 4471')
    w.unmount()
  })

  // Fallthrough attrs land on the root <label>, where aria-label does nothing
  // for the input's accessible name -- the same trap #82 and #90 fixed elsewhere.
  it('routes a fallthrough aria-label to the input, not the wrapper', () => {
    const w = mountCb({}, { 'aria-label': 'Select row' })
    expect(w.find('input').attributes('aria-label')).toBe('Select row')
    expect(w.find('label').attributes('aria-label')).toBeUndefined()
    w.unmount()
  })

  it('keeps class and style on the wrapper', () => {
    const w = mountCb({}, { class: 'mt-2', style: 'color: red' })
    expect(w.find('label').classes()).toContain('mt-2')
    expect(w.find('input').classes()).not.toContain('mt-2')
    w.unmount()
  })

  it('still supports aria-describedby on the input', () => {
    const w = mountCb({}, { 'aria-describedby': 'help-1' })
    expect(w.find('input').attributes('aria-describedby')).toBe('help-1')
    w.unmount()
  })
})

describe('cat-checkbox indeterminate', () => {
  // The browser clears .indeterminate on click. If the prop is still true the
  // watcher never refires, so the DOM silently disagrees with the component.
  it('restores the indeterminate DOM state when the prop is still set', async () => {
    const w = mountCb({ indeterminate: true, modelValue: false })
    const el = w.find('input').element as HTMLInputElement
    expect(el.indeterminate).toBe(true)
    el.indeterminate = false // what the browser does on click
    await w.find('input').trigger('change')
    await w.vm.$nextTick()
    expect(el.indeterminate).toBe(true)
    w.unmount()
  })

  // A native checkbox maps `.indeterminate` to a mixed state in the
  // accessibility tree on its own. An explicit aria-checked would be redundant
  // ARIA over working native semantics, so deliberately absent -- the APG's
  // aria-checked="mixed" example is for custom role="checkbox" widgets.
  it('reports mixed state through the native property, without redundant ARIA', () => {
    const w = mountCb({ indeterminate: true })
    expect((w.find('input').element as HTMLInputElement).indeterminate).toBe(true)
    expect(w.find('input').attributes('aria-checked')).toBeUndefined()
    w.unmount()
  })
})

describe('cat-checkbox Reka-style API', () => {
  it('supports trueValue / falseValue', async () => {
    const w = mountCb({ modelValue: 'no', trueValue: 'yes', falseValue: 'no' })
    expect((w.find('input').element as HTMLInputElement).checked).toBe(false)
    await w.find('input').setValue(true)
    expect(w.emitted('update:modelValue')![0]).toEqual(['yes'])
    w.unmount()
  })

  it('emits falseValue when unchecked', async () => {
    const w = mountCb({ modelValue: 'yes', trueValue: 'yes', falseValue: 'no' })
    expect((w.find('input').element as HTMLInputElement).checked).toBe(true)
    await w.find('input').setValue(false)
    expect(w.emitted('update:modelValue')![0]).toEqual(['no'])
    w.unmount()
  })

  it('supports name and value for native form submission', () => {
    const w = mountCb({ name: 'terms', value: 'accepted' })
    expect(w.find('input').attributes('name')).toBe('terms')
    expect(w.find('input').attributes('value')).toBe('accepted')
    w.unmount()
  })

  it('supports required', () => {
    const w = mountCb({ required: true })
    expect(w.find('input').attributes('required')).toBeDefined()
    w.unmount()
  })
})
