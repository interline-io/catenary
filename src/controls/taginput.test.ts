import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import CatTaginput from './taginput.vue'
import { FieldIdKey } from './types'
import {
  expectNoAxeViolations,
  mountComponent,
  triggerKeyboard
} from '../testutil/component-helpers'

const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' }
]

describe('CatTaginput allowNew', () => {
  it('adds a free-form tag on Enter', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, allowNew: true }
    })
    const input = wrapper.find('input')
    await input.setValue('custom')
    await triggerKeyboard(wrapper, 'Enter', 'input')
    const emitted = wrapper.emitted('update:modelValue') as string[][]
    expect(emitted[emitted.length - 1]).toEqual([['custom']])
  })

  it('adds a free-form tag on separator key', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, allowNew: true }
    })
    const input = wrapper.find('input')
    await input.setValue('newtag')
    await triggerKeyboard(wrapper, ',', 'input')
    const emitted = wrapper.emitted('update:modelValue') as string[][]
    expect(emitted[emitted.length - 1]).toEqual([['newtag']])
  })

  it('does not add free-form tag when allowNew is false', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, allowNew: false }
    })
    const input = wrapper.find('input')
    await input.setValue('custom')
    await triggerKeyboard(wrapper, 'Enter', 'input')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('does not add duplicate tags', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: ['existing'], options: fruitOptions, allowNew: true }
    })
    const input = wrapper.find('input')
    await input.setValue('existing')
    await triggerKeyboard(wrapper, 'Enter', 'input')
    // Should clear input but not emit a new modelValue with duplicate
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('respects maxTags limit', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: ['a', 'b'], options: fruitOptions, allowNew: true, maxTags: 2 }
    })
    const input = wrapper.find('input')
    await input.setValue('third')
    await triggerKeyboard(wrapper, 'Enter', 'input')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('trims whitespace from new tags', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, allowNew: true }
    })
    const input = wrapper.find('input')
    await input.setValue('  spaced  ')
    await triggerKeyboard(wrapper, 'Enter', 'input')
    const emitted = wrapper.emitted('update:modelValue') as string[][]
    expect(emitted[emitted.length - 1]).toEqual([['spaced']])
  })

  it('does not add empty tags', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, allowNew: true }
    })
    const input = wrapper.find('input')
    await input.setValue('   ')
    await triggerKeyboard(wrapper, 'Enter', 'input')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('selects dropdown option over free-form when highlighted', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, allowNew: true }
    })
    const input = wrapper.find('input')
    await input.setValue('a') // filters to Apple
    // Arrow down to highlight first option, then Enter
    await triggerKeyboard(wrapper, 'ArrowDown', 'input')
    await triggerKeyboard(wrapper, 'Enter', 'input')
    const emitted = wrapper.emitted('update:modelValue') as string[][]
    expect(emitted[emitted.length - 1]).toEqual([['apple']])
  })
})

describe('CatTaginput Home/End listbox navigation', () => {
  it('Home jumps the highlighted option to the first one', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, openOnFocus: true }
    })
    const input = wrapper.find('input')
    // Open the listbox and arrow down twice so the third option is highlighted.
    await input.trigger('focus')
    await triggerKeyboard(wrapper, 'ArrowDown', 'input')
    await triggerKeyboard(wrapper, 'ArrowDown', 'input')
    await triggerKeyboard(wrapper, 'ArrowDown', 'input')

    // Home should jump to the first option.
    await triggerKeyboard(wrapper, 'Home', 'input')
    const items = wrapper.findAll('.cat-taginput-dropdown-item')
    expect(items[0]?.classes()).toContain('is-active')
  })

  it('End jumps the highlighted option to the last one', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, openOnFocus: true }
    })
    const input = wrapper.find('input')
    await input.trigger('focus')
    await triggerKeyboard(wrapper, 'ArrowDown', 'input')

    await triggerKeyboard(wrapper, 'End', 'input')
    const items = wrapper.findAll('.cat-taginput-dropdown-item')
    expect(items[items.length - 1]?.classes()).toContain('is-active')
  })
})

describe('CatTaginput combobox semantics', () => {
  it('puts the combobox role and popup state on the input, not the wrapper', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, openOnFocus: true }
    })

    expect(wrapper.find('.cat-taginput').attributes('role')).toBeUndefined()
    expect(wrapper.find('.cat-taginput').attributes('aria-expanded')).toBeUndefined()

    const input = wrapper.find('input')
    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-autocomplete')).toBe('list')
    expect(input.attributes('aria-haspopup')).toBe('listbox')
    expect(input.attributes('aria-expanded')).toBe('false')

    await input.trigger('focus')
    await nextTick()
    expect(input.attributes('aria-expanded')).toBe('true')
    expect(input.attributes('aria-controls')).toBe(wrapper.find('[role="listbox"]').attributes('id'))
  })

  it('renders options without tabindex or per-option keyboard handlers', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, openOnFocus: true }
    })
    await wrapper.find('input').trigger('focus')
    await nextTick()
    const option = wrapper.find('[role="option"]')
    expect(option.exists()).toBe(true)
    expect(option.attributes('tabindex')).toBeUndefined()
  })

  it('keeps header and empty slots outside the listbox element', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, openOnFocus: true },
      slots: { header: '<div class="my-header">Pick fruits</div>' }
    })
    await wrapper.find('input').trigger('focus')
    await nextTick()
    const listbox = wrapper.find('[role="listbox"]')
    expect(listbox.find('.my-header').exists()).toBe(false)
    expect(wrapper.find('.my-header').exists()).toBe(true)
  })

  it('associates a wrapping cat-field label via FieldIdKey and defers aria-label to it', () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, placeholder: 'Search' },
      global: { provide: { [FieldIdKey as symbol]: 'field-9' } }
    })
    const input = wrapper.find('input')
    expect(input.attributes('id')).toBe('field-9')
    expect(input.attributes('aria-label')).toBeUndefined()
  })

  it('falls back to aria-label from the ariaLabel prop or placeholder when standalone', () => {
    const labeled = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, ariaLabel: 'Boundaries', placeholder: 'Search' }
    })
    expect(labeled.find('input').attributes('aria-label')).toBe('Boundaries')

    const placeholderOnly = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, placeholder: 'Search' }
    })
    expect(placeholderOnly.find('input').attributes('aria-label')).toBe('Search')
  })

  it('has no axe violations with the listbox open', async () => {
    const wrapper = mountComponent(CatTaginput, {
      attachTo: document.body,
      props: { modelValue: ['apple'], options: fruitOptions, openOnFocus: true, ariaLabel: 'Fruits' }
    })
    await wrapper.find('input').trigger('focus')
    await nextTick()
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })
})

describe('CatTaginput keyboard selection and focus retention', () => {
  it('Tab selects the highlighted option and closes the listbox', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, openOnFocus: true }
    })
    const input = wrapper.find('input')
    await input.trigger('focus')
    await triggerKeyboard(wrapper, 'ArrowDown', 'input')
    await triggerKeyboard(wrapper, 'Tab', 'input')

    const emitted = wrapper.emitted('update:modelValue') as string[][][]
    expect(emitted[emitted.length - 1]).toEqual([['apple']])
    expect(input.attributes('aria-expanded')).toBe('false')
  })

  it('Tab without a highlight just closes without selecting', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, openOnFocus: true }
    })
    const input = wrapper.find('input')
    await input.trigger('focus')
    await triggerKeyboard(wrapper, 'Tab', 'input')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('consumes Escape while the listbox is open or text remains, then lets it through', async () => {
    const Host = defineComponent({
      components: { CatTaginput },
      setup () {
        const escapes = ref(0)
        return { escapes, fruitOptions }
      },
      template: `
        <div @keydown.escape="escapes++">
          <cat-taginput :model-value="[]" :options="fruitOptions" open-on-focus />
        </div>
      `
    })
    const wrapper = mount(Host, { attachTo: document.body })
    const input = wrapper.find('input')
    await input.trigger('focus')
    await input.setValue('app')
    await nextTick()

    // First Escape closes the listbox, second clears the text; both consumed.
    await triggerKeyboard(wrapper as any, 'Escape', 'input')
    expect(wrapper.vm.escapes).toBe(0)
    await triggerKeyboard(wrapper as any, 'Escape', 'input')
    expect(wrapper.vm.escapes).toBe(0)
    expect((input.element as HTMLInputElement).value).toBe('')

    // A spent Escape reaches the host (e.g. an enclosing dialog).
    await triggerKeyboard(wrapper as any, 'Escape', 'input')
    expect(wrapper.vm.escapes).toBe(1)
    wrapper.unmount()
  })

  it('keeps the input enabled at the max-tags limit and offers no options', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: ['apple', 'banana'], options: fruitOptions, maxTags: 2, openOnFocus: true }
    })
    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeUndefined()
    expect(input.attributes('placeholder')).toBe('Maximum reached')

    await input.trigger('focus')
    await nextTick()
    expect(wrapper.findAll('[role="option"]').length).toBe(0)
  })

  it('resets a highlight that filtering has made stale', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions, openOnFocus: true }
    })
    const input = wrapper.find('input')
    await input.trigger('focus')
    await triggerKeyboard(wrapper, 'ArrowDown', 'input')
    await triggerKeyboard(wrapper, 'End', 'input')
    expect(input.attributes('aria-activedescendant')).toBeTruthy()

    await input.setValue('ban') // filters to one option; old index 2 is gone
    await nextTick()
    expect(input.attributes('aria-activedescendant')).toBeUndefined()
  })

  it('announces additions and removals through the status region', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { 'modelValue': [], 'options': fruitOptions, 'openOnFocus': true, 'onUpdate:modelValue': () => {} }
    })
    const status = wrapper.find('[role="status"]')
    expect(status.text()).toBe('')

    const input = wrapper.find('input')
    await input.trigger('focus')
    await triggerKeyboard(wrapper, 'ArrowDown', 'input')
    await triggerKeyboard(wrapper, 'Enter', 'input')
    await nextTick()
    expect(status.text()).toBe('Added Apple. Selected: Apple.')
  })

  it('announces empty results once per transition, not per keystroke', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: [], options: fruitOptions }
    })
    const input = wrapper.find('input')
    const status = wrapper.find('[role="status"]')

    await input.setValue('zz')
    await nextTick()
    await nextTick()
    expect(status.text()).toBe('No results')

    // Still empty: typing more must not re-trigger the announcement cycle
    // (announceStatus clears the region before re-setting; a re-trigger
    // would be observable as an empty region on the intermediate tick).
    await input.setValue('zzz')
    await nextTick()
    expect(status.text()).toBe('No results')

    // Recovering and emptying again is a new transition and announces again.
    await input.setValue('app')
    await nextTick()
    await input.setValue('appzz')
    await nextTick()
    await nextTick()
    expect(status.text()).toBe('No results')
  })

  it('announces Backspace tag removal', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: ['apple'], options: fruitOptions }
    })
    await triggerKeyboard(wrapper, 'Backspace', 'input')
    await nextTick()
    expect(wrapper.find('[role="status"]').text()).toBe('Removed Apple. None selected.')
  })

  it('moves focus to a remaining remove button after removing a tag by button', async () => {
    const wrapper = mountComponent(CatTaginput, {
      attachTo: document.body,
      props: { 'modelValue': ['apple', 'banana'], 'options': fruitOptions, 'onUpdate:modelValue': () => {} }
    })
    const buttons = wrapper.findAll('button.is-delete')
    expect(buttons.length).toBe(2)
    ;(buttons[0]!.element as HTMLButtonElement).focus()
    await buttons[0]!.trigger('click')
    await nextTick()
    await nextTick()

    const active = document.activeElement as HTMLElement
    expect(active?.classList.contains('is-delete')).toBe(true)
    wrapper.unmount()
  })
})

describe('CatTaginput usage hint', () => {
  it('describes the input with the usage hint (merged with the counter when present)', () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { modelValue: ['apple'], options: fruitOptions, maxTags: 3 }
    })
    const input = wrapper.find('input')
    const ids = (input.attributes('aria-describedby') || '').split(' ')
    expect(ids.length).toBe(2)
    const hint = wrapper.find(`[id="${ids[0]}"]`)
    expect(hint.text()).toContain('Enter or Tab')
    expect(wrapper.find(`[id="${ids[1]}"]`).text()).toContain('1 / 3 selected')
  })

  it('announces the resulting selection when adding to an existing one', async () => {
    const wrapper = mountComponent(CatTaginput, {
      props: { 'modelValue': ['apple'], 'options': fruitOptions, 'openOnFocus': true, 'onUpdate:modelValue': () => {} }
    })
    const input = wrapper.find('input')
    await input.trigger('focus')
    await triggerKeyboard(wrapper, 'ArrowDown', 'input')
    await triggerKeyboard(wrapper, 'Enter', 'input')
    await nextTick()
    expect(wrapper.find('[role="status"]').text()).toBe('Added Banana. Selected: Apple, Banana.')
  })
})
