import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import CatField from './field.vue'
import CatInput from './input.vue'
import CatCheckbox from './checkbox.vue'

let warn: ReturnType<typeof vi.spyOn>
beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
afterEach(() => { warn.mockRestore() })

const catenaryWarnings = () =>
  warn.mock.calls.filter((c: unknown[]) => String(c[0]).includes('[catenary]')).map((c: unknown[]) => String(c[0]))

function mountField (props: Record<string, unknown>, slot: () => unknown) {
  return mount(CatField, { props, slots: { default: slot }, attachTo: document.body })
}

describe('cat-field label association', () => {
  it('resolves label[for] for a single wrapped control', () => {
    const w = mountField({ label: 'Name' }, () => h(CatInput))
    const forId = w.find('label.label').attributes('for')!
    expect(document.getElementById(forId)).not.toBeNull()
    expect(catenaryWarnings()).toHaveLength(0)
    w.unmount()
  })

  // cat-field's own documented @example. The raw control cannot reach the
  // generated id, so the visible label is associated with nothing.
  it('exposes the field id to slot content so a raw control can claim it', () => {
    const w = mount(CatField, {
      props: { label: 'Name' },
      slots: { default: (p: { id: string }) => h('input', { class: 'input', id: p.id }) },
      attachTo: document.body
    })
    const forId = w.find('label.label').attributes('for')!
    expect(document.getElementById(forId)?.tagName).toBe('INPUT')
    expect(catenaryWarnings()).toHaveLength(0)
    w.unmount()
  })

  it('exposes the message id to slot content', () => {
    const w = mount(CatField, {
      props: { label: 'Name', message: 'Required' },
      slots: {
        default: (p: { id: string, describedby?: string }) =>
          h('input', { 'class': 'input', 'id': p.id, 'aria-describedby': p.describedby })
      },
      attachTo: document.body
    })
    const input = w.find('input')
    const describedby = input.attributes('aria-describedby')!
    expect(document.getElementById(describedby)?.textContent?.trim()).toBe('Required')
    w.unmount()
  })

  it('warns when the label has controls but attaches to none', () => {
    const w = mountField({ label: 'Data format' }, () => h(CatCheckbox))
    expect(catenaryWarnings().join('\n')).toMatch(/not associated with any control/i)
    w.unmount()
  })

  // A self-labelling control cannot be fixed by handing it the id: that would
  // concatenate a second name onto the one it already has.
  it('tells a self-labelling control to drop the field label, not to take the id', () => {
    const w = mountField({ label: 'Option 1' }, () => h(CatCheckbox, null, () => 'Enable feature'))
    const text = catenaryWarnings().join('\n')
    expect(text).toMatch(/names itself/i)
    expect(text).not.toMatch(/v-slot/)
    w.unmount()
  })

  it('tells a raw control to bind the id from the slot', () => {
    const w = mountField({ label: 'Email' }, () => h('input', { class: 'input' }))
    const text = catenaryWarnings().join('\n')
    expect(text).toMatch(/v-slot/)
    w.unmount()
  })

  it('points a group of controls at cat-fieldset', () => {
    const w = mountField({ label: 'Data format' }, () => [h(CatCheckbox), h(CatCheckbox)])
    expect(catenaryWarnings().join('\n')).toMatch(/cat-fieldset/)
    w.unmount()
  })

  it('warns when two controls claim the same id', () => {
    const w = mountField({ label: 'Date range', grouped: true }, () => [h(CatInput), h(CatInput)])
    expect(catenaryWarnings().join('\n')).toMatch(/duplicate ids/i)
    w.unmount()
  })

  it('does not warn when the second control is given an explicit id', () => {
    const w = mountField({ label: 'Date range', grouped: true }, () => [h(CatInput), h(CatInput, { id: 'to' })])
    expect(catenaryWarnings()).toHaveLength(0)
    w.unmount()
  })

  it('warns when a label wraps no control at all', () => {
    const w = mountField({ label: 'Summary' }, () => h('span', 'just text'))
    expect(catenaryWarnings().join('\n')).toMatch(/no form control/i)
    w.unmount()
  })

  // Duplicate ids are invalid regardless of labelling.
  it('warns about duplicate ids even when the field has no label', () => {
    const w = mountField({ grouped: true }, () => [h(CatInput), h(CatInput)])
    expect(catenaryWarnings().join('\n')).toMatch(/duplicate ids/i)
    w.unmount()
  })

  it('stays silent with no label', () => {
    const w = mountField({}, () => h(CatCheckbox))
    expect(catenaryWarnings()).toHaveLength(0)
    w.unmount()
  })
})
