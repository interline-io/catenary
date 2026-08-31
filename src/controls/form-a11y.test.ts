import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { mountComponent } from '../testutil/component-helpers'
import CatRadio from './radio.vue'
import CatFieldset from './fieldset.vue'
import CatSelect from './select.vue'
import CatTextarea from './textarea.vue'
import CatInput from './input.vue'
import CatField from './field.vue'

describe('cat-radio grouping', () => {
  // Radios are grouped by a shared `name`, not by sharing a v-model. Without
  // one each is its own group: arrow keys do not move between them, each is a
  // separate tab stop, and a screen reader says "1 of 1". A mouse user sees
  // nothing wrong, which is why it goes unnoticed.
  it('gives radios in a radio-group fieldset one shared name', async () => {
    const wrapper = mount(CatFieldset, {
      props: { label: 'Sort by', radioGroup: true },
      slots: {
        default: () => [
          h(CatRadio, { modelValue: 'a', nativeValue: 'a' }, () => 'A'),
          h(CatRadio, { modelValue: 'a', nativeValue: 'b' }, () => 'B'),
          h(CatRadio, { modelValue: 'a', nativeValue: 'c' }, () => 'C')
        ]
      }
    })
    await nextTick()
    const names = wrapper.findAll('input[type="radio"]').map(r => r.attributes('name'))
    expect(names.every(Boolean)).toBe(true)
    expect(new Set(names).size).toBe(1)
    wrapper.unmount()
  })

  it('keeps an explicit name over the fieldset one', async () => {
    const wrapper = mount(CatFieldset, {
      props: { label: 'Group', radioGroup: true },
      slots: { default: () => [h(CatRadio, { name: 'mine', nativeValue: 'a' }, () => 'A')] }
    })
    await nextTick()
    expect(wrapper.find('input[type="radio"]').attributes('name')).toBe('mine')
    wrapper.unmount()
  })

  it('warns when a radio has neither a name nor a fieldset', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mountComponent(CatRadio, { props: { nativeValue: 'a' } })
    expect(warn.mock.calls.filter((c: unknown[]) => String(c[0]).includes('[catenary]')).length)
      .toBeGreaterThan(0)
    warn.mockRestore()
    wrapper.unmount()
  })

  it('gives two fieldsets on one page different names', async () => {
    // Mounted in a single app: useId() restarts per app, so two separate
    // mounts would both yield 'v-0' and prove nothing.
    const Host = defineComponent({
      setup: () => () => h('div', [
        h(CatFieldset, { label: 'One', radioGroup: true }, { default: () => [h(CatRadio, { nativeValue: 'a' })] }),
        h(CatFieldset, { label: 'Two', radioGroup: true }, { default: () => [h(CatRadio, { nativeValue: 'a' })] })
      ])
    })
    const wrapper = mount(Host)
    await nextTick()
    const names = wrapper.findAll('input[type="radio"]').map(r => r.attributes('name'))
    expect(names).toHaveLength(2)
    expect(names[0]).not.toBe(names[1])
    wrapper.unmount()
  })

  // A fieldset is a generic grouping wrapper and may hold two independent
  // questions. Naming every descendant radio would merge them: picking "Red"
  // makes the browser natively uncheck "Small", and because `size` is unchanged
  // Vue's patch skips the DOM write, so the size selection disappears from the
  // UI while state still says it is selected.
  it('does not name radios in a plain fieldset', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(CatFieldset, {
      props: { label: 'Preferences' },
      slots: {
        default: () => [
          h(CatRadio, { modelValue: 'small', nativeValue: 'small' }, () => 'Small'),
          h(CatRadio, { modelValue: 'red', nativeValue: 'red' }, () => 'Red')
        ]
      }
    })
    await nextTick()
    const names = wrapper.findAll('input[type="radio"]').map(r => r.attributes('name'))
    expect(names.some(Boolean)).toBe(false)
    warn.mockRestore()
    wrapper.unmount()
  })

  // An inner plain fieldset shadows the outer name rather than inheriting it,
  // so a second question can sit inside a grouped fieldset.
  it('lets an inner plain fieldset shadow an outer radio group', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const Host = defineComponent({
      setup: () => () => h(CatFieldset, { label: 'Outer', radioGroup: true }, {
        default: () => [
          h(CatRadio, { nativeValue: 'a' }),
          h(CatFieldset, { label: 'Inner' }, { default: () => [h(CatRadio, { nativeValue: 'x' })] })
        ]
      })
    })
    const wrapper = mount(Host)
    await nextTick()
    const names = wrapper.findAll('input[type="radio"]').map(r => r.attributes('name'))
    expect(names[0]).toBeTruthy()
    expect(names[1]).toBeUndefined()
    warn.mockRestore()
    wrapper.unmount()
  })
})

describe('cat-select readonly', () => {
  // readonly was implemented as disabled, so the control left the tab order
  // entirely: a keyboard or screen reader user could not reach it to read the
  // value, and it was announced as unavailable rather than read-only.
  it('stays focusable and reports aria-readonly', () => {
    const wrapper = mountComponent(CatSelect, {
      attachTo: document.body,
      props: { readonly: true, modelValue: 'b' },
      slots: { default: '<option value="a">A</option><option value="b">B</option>' }
    })
    const select = wrapper.find('select')
    expect(select.attributes('disabled')).toBeUndefined()
    expect(select.attributes('aria-readonly')).toBe('true')
    ;(select.element as HTMLElement).focus()
    expect(document.activeElement).toBe(select.element)
    wrapper.unmount()
  })

  it('does not emit a change while readonly', async () => {
    const wrapper = mountComponent(CatSelect, {
      props: { readonly: true, modelValue: 'b' },
      slots: { default: '<option value="a">A</option><option value="b">B</option>' }
    })
    const select = wrapper.find('select')
    ;(select.element as HTMLSelectElement).value = 'a'
    await select.trigger('change')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect((select.element as HTMLSelectElement).value).toBe('b')
    wrapper.unmount()
  })

  it('still disables when disabled', () => {
    const wrapper = mountComponent(CatSelect, {
      props: { disabled: true },
      slots: { default: '<option value="a">A</option>' }
    })
    expect(wrapper.find('select').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })
})

describe('explicit ids in a grouped field', () => {
  // cat-field provides one id, so a grouped field with more than one control
  // gave them all the same one — duplicate DOM ids, and a <label for> landing
  // on whichever came first.
  it('lets each control in a grouped field carry its own id', () => {
    const wrapper = mount(CatField, {
      props: { label: 'Range', grouped: true },
      slots: {
        default: () => [
          h(CatInput, { id: 'range-from', modelValue: '' }),
          h(CatInput, { id: 'range-to', modelValue: '' })
        ]
      }
    })
    const ids = wrapper.findAll('input').map(i => i.attributes('id'))
    expect(ids).toEqual(['range-from', 'range-to'])
    expect(new Set(ids).size).toBe(2)
    wrapper.unmount()
  })

  it('accepts an explicit id on cat-textarea too', () => {
    const wrapper = mountComponent(CatTextarea, { props: { id: 'notes' } })
    expect(wrapper.find('textarea').attributes('id')).toBe('notes')
    wrapper.unmount()
  })

  it('falls back to the field id when none is given', () => {
    const wrapper = mount(CatField, {
      props: { label: 'One' },
      slots: { default: () => [h(CatInput, { modelValue: '' })] }
    })
    const id = wrapper.find('input').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(id)
    wrapper.unmount()
  })
})

describe('cat-textarea accessible name', () => {
  it('binds aria-label, matching cat-input and cat-select', () => {
    const wrapper = mountComponent(CatTextarea, { props: { ariaLabel: 'Release notes' } })
    expect(wrapper.find('textarea').attributes('aria-label')).toBe('Release notes')
    wrapper.unmount()
  })
})

describe('cat-select readonly guards', () => {
  function mountReadonly (props: Record<string, unknown>) {
    return mountComponent(CatSelect, {
      attachTo: document.body,
      props: { readonly: true, ...props },
      slots: { default: '<option value="a">A</option><option value="b">B</option>' }
    })
  }

  // preventDefault on mousedown suppresses focus as well as the picker, so
  // guarding it naively leaves a pointer user unable to focus the field at all
  // -- the same problem `disabled` had.
  it('keeps focus reachable by pointer', async () => {
    const wrapper = mountReadonly({ modelValue: 'a' })
    const select = wrapper.find('select').element as HTMLSelectElement
    wrapper.find('select').trigger('mousedown')
    await nextTick()
    expect(document.activeElement).toBe(select)
    wrapper.unmount()
  })

  it('leaves Enter alone so a form still submits', () => {
    const wrapper = mountReadonly({ modelValue: 'a' })
    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true, bubbles: true })
    wrapper.find('select').element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    wrapper.unmount()
  })

  it('leaves the user shortcuts alone', () => {
    const wrapper = mountReadonly({ modelValue: 'a' })
    const event = new KeyboardEvent('keydown', { key: 'c', metaKey: true, cancelable: true, bubbles: true })
    wrapper.find('select').element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    wrapper.unmount()
  })

  it('still blocks the keys that would pick another option', () => {
    const wrapper = mountReadonly({ modelValue: 'a' })
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true, bubbles: true })
    wrapper.find('select').element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    wrapper.unmount()
  })

  // Restoring a multiple select by assigning `.value` stringifies the array to
  // "a,b", which matches no option and clears the whole selection. The
  // modelValue watcher cannot repair it: the prop never changed.
  it('restores every selected option of a readonly multiple select', async () => {
    const wrapper = mountReadonly({ modelValue: ['a', 'b'], multiple: true })
    await nextTick()
    const select = wrapper.find('select').element as HTMLSelectElement
    for (const option of Array.from(select.options)) option.selected = option.value === 'a'
    await wrapper.find('select').trigger('change')
    await nextTick()
    expect(Array.from(select.selectedOptions).map(o => o.value)).toEqual(['a', 'b'])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })
})
