import { describe, it, expect } from 'vitest'
import CatTaginput from './taginput.vue'
import {
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
