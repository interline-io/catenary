import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import CatField from './field.vue'
import CatInput from './input.vue'
import CatSelect from './select.vue'
import CatTaginput from './taginput.vue'
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
      slots: { default: (p: { id?: string }) => h('input', { class: 'input', id: p.id }) },
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
        default: (p: { id?: string, describedby?: string }) =>
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

  // <label for> only associates with labelable elements. Exposing the id as a
  // slot prop is what makes it possible to put it somewhere it does nothing.
  it('warns when the id lands on a non-labelable element', () => {
    const w = mount(CatField, {
      props: { label: 'Email' },
      slots: { default: (p: { id?: string }) => h('div', { id: p.id }, [h('input', { class: 'input' })]) },
      attachTo: document.body
    })
    expect(catenaryWarnings().join('\n')).toMatch(/put its id on a <div>, which <label for> cannot associate/i)
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

  // The id is for the label, so a label-less group such as a filter bar must
  // not put the same one on every control.
  it('gives no id to controls in a field without a label', () => {
    const w = mount(CatField, {
      props: { grouped: true },
      slots: {
        default: (p: { id?: string }) => [
          h(CatInput, { ariaLabel: 'Search' }),
          h(CatSelect, { ariaLabel: 'Type' }),
          h('input', { 'class': 'input', 'id': p.id, 'aria-label': 'Raw' })
        ]
      },
      attachTo: document.body
    })
    expect(w.findAll('input, select').map(el => el.attributes('id'))).toEqual([undefined, undefined, undefined])
    expect(catenaryWarnings()).toHaveLength(0)
    w.unmount()
  })

  // cat-taginput takes its aria-label fallback only when no field label names
  // it, which it judges by whether the field handed it an id.
  it('lets a taginput in a field without a label fall back to an aria-label', () => {
    const unlabeled = mountField({}, () => h(CatTaginput, { placeholder: 'Add tags' }))
    expect(unlabeled.find('input').attributes('id')).toBeUndefined()
    expect(unlabeled.find('input').attributes('aria-label')).toBe('Add tags')
    unlabeled.unmount()

    const labeled = mountField({ label: 'Tags' }, () => h(CatTaginput, { placeholder: 'Add tags' }))
    expect(labeled.find('input').attributes('id')).toBe(labeled.find('label.label').attributes('for'))
    expect(labeled.find('input').attributes('aria-label')).toBeUndefined()
    expect(catenaryWarnings()).toHaveLength(0)
    labeled.unmount()
  })

  it('hands its id to the control once a label arrives', async () => {
    const w = mountField({}, () => h(CatInput, { ariaLabel: 'Name' }))
    expect(w.find('input').attributes('id')).toBeUndefined()
    await w.setProps({ label: 'Name' })
    expect(w.find('input').attributes('id')).toBe(w.find('label.label').attributes('for'))
    w.unmount()
  })

  // A label that arrives after mount hands the id out only then, so the check
  // has to run again.
  it('warns about duplicate ids when a label arrives after mount', async () => {
    const w = mountField({ grouped: true }, () => [h(CatInput, { ariaLabel: 'From' }), h(CatInput, { ariaLabel: 'To' })])
    expect(catenaryWarnings()).toHaveLength(0)
    await w.setProps({ label: 'Date range' })
    expect(catenaryWarnings().join('\n')).toMatch(/duplicate ids/i)
    w.unmount()
  })

  it('warns about an orphaned label that arrives after mount', async () => {
    const w = mountField({}, () => h('input', { 'class': 'input', 'aria-label': 'Email' }))
    expect(catenaryWarnings()).toHaveLength(0)
    await w.setProps({ label: 'Email' })
    expect(catenaryWarnings().join('\n')).toMatch(/v-slot/)
    w.unmount()
  })

  // Slots are not reactive, so a #label slot passed only after mount must still
  // render the label and hand the control its id.
  it('names its control once a #label slot arrives', async () => {
    const showLabel = ref(false)
    const w = mount(defineComponent({
      render: () => h(CatField, null, {
        ...(showLabel.value ? { label: () => 'Name' } : {}),
        default: () => h(CatInput, { ariaLabel: 'Name' })
      })
    }), { attachTo: document.body })
    expect(w.find('label.label').exists()).toBe(false)
    expect(w.find('input').attributes('id')).toBeUndefined()
    showLabel.value = true
    await nextTick()
    const forId = w.find('label.label').attributes('for')
    expect(forId).toBeTruthy()
    expect(w.find('input').attributes('id')).toBe(forId)
    w.unmount()
  })

  it('stays silent with no label', () => {
    const w = mountField({}, () => h(CatCheckbox))
    expect(catenaryWarnings()).toHaveLength(0)
    w.unmount()
  })
})
