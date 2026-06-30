import { describe, it, expect } from 'vitest'
import CatInput from './input.vue'
import {
  mountComponent,
  testVModel,
  variantProps,
  sizeProps,
  testBulmaClasses,
  testDisabledState
} from '../testutil/component-helpers'

describe('CatInput', () => {
  it('renders text input by default', () => {
    const wrapper = mountComponent(CatInput, {
      props: { modelValue: '' }
    })

    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('type')).toBe('text')
    testBulmaClasses(input, ['input'])
  })

  it('handles v-model binding', async () => {
    const wrapper = mountComponent(CatInput, {
      props: { modelValue: 'initial' }
    })

    await testVModel(wrapper, 'input', 'new value')
  })

  it('renders different input types', () => {
    const types = ['text', 'email', 'password', 'number', 'url', 'date']

    types.forEach((type) => {
      const wrapper = mountComponent(CatInput, {
        props: {
          modelValue: '',
          type
        }
      })

      expect(wrapper.find('input').attributes('type')).toBe(type)
    })
  })

  it('renders all variants', () => {
    variantProps().forEach((variant) => {
      const wrapper = mountComponent(CatInput, {
        props: {
          modelValue: '',
          variant
        }
      })

      testBulmaClasses(wrapper.find('input'), ['input', `is-${variant}`])
    })
  })

  it('renders all sizes', () => {
    sizeProps().forEach((size) => {
      if (size === 'normal') return

      const wrapper = mountComponent(CatInput, {
        props: {
          modelValue: '',
          size
        }
      })

      testBulmaClasses(wrapper.find('input'), ['input', `is-${size}`])
    })
  })

  it('handles disabled state', () => {
    const wrapper = mountComponent(CatInput, {
      props: {
        modelValue: '',
        disabled: true
      }
    })

    testDisabledState(wrapper, 'input')
  })

  it('handles readonly state', () => {
    const wrapper = mountComponent(CatInput, {
      props: {
        modelValue: 'readonly value',
        readonly: true
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('readonly')).toBeDefined()
  })

  it('renders loading state', () => {
    const wrapper = mountComponent(CatInput, {
      props: {
        modelValue: '',
        loading: true
      }
    })

    testBulmaClasses(wrapper.find('input'), ['input'])
    testBulmaClasses(wrapper, ['control', 'is-loading'])
  })

  it('renders rounded input', () => {
    const wrapper = mountComponent(CatInput, {
      props: {
        modelValue: '',
        rounded: true
      }
    })

    testBulmaClasses(wrapper.find('input'), ['input', 'is-rounded'])
  })

  it('handles placeholder', () => {
    const wrapper = mountComponent(CatInput, {
      props: {
        modelValue: '',
        placeholder: 'Enter text'
      }
    })

    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter text')
  })

  it('handles maxlength', () => {
    const wrapper = mountComponent(CatInput, {
      props: {
        modelValue: '',
        maxlength: 20
      }
    })

    expect(wrapper.find('input').attributes('maxlength')).toBe('20')
  })

  it('does not render the clear button unless clearable is set', () => {
    const wrapper = mountComponent(CatInput, {
      props: { modelValue: 'has value' }
    })

    expect(wrapper.find('.cat-input-clear-button').exists()).toBe(false)
  })

  it('shows the clear button only when clearable and the input has a value', async () => {
    const wrapper = mountComponent(CatInput, {
      props: { modelValue: '', clearable: true }
    })

    // Empty value: no clear button, and no right-icon padding on the control.
    expect(wrapper.find('.cat-input-clear-button').exists()).toBe(false)
    expect(wrapper.classes()).not.toContain('has-icons-right')

    await wrapper.setProps({ modelValue: 'hello' })

    const clearButton = wrapper.find('.cat-input-clear-button')
    expect(clearButton.exists()).toBe(true)
    expect(clearButton.element.tagName).toBe('BUTTON')
    expect(clearButton.attributes('type')).toBe('button')
    expect(wrapper.classes()).toContain('has-icons-right')
  })

  it('renders an accessible label and a presentational icon on the clear button', () => {
    const wrapper = mountComponent(CatInput, {
      props: { modelValue: 'hello', clearable: true }
    })

    const clearButton = wrapper.find('.cat-input-clear-button')
    expect(clearButton.attributes('aria-label')).toBe('Clear')
    // The icon itself is hidden from assistive tech; the button carries the label.
    expect(clearButton.find('i.mdi-close-circle').attributes('aria-hidden')).toBe('true')
  })

  it('supports a custom clear-aria-label', () => {
    const wrapper = mountComponent(CatInput, {
      props: { modelValue: 'hello', clearable: true, clearAriaLabel: 'Clear search' }
    })

    expect(wrapper.find('.cat-input-clear-button').attributes('aria-label')).toBe('Clear search')
  })

  it('clears the value and emits clear when the clear button is clicked', async () => {
    const wrapper = mountComponent(CatInput, {
      props: { modelValue: 'hello', clearable: true }
    })

    await wrapper.find('.cat-input-clear-button').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('emits 0 when clearing a numeric input', async () => {
    const wrapper = mountComponent(CatInput, {
      props: { modelValue: 42, type: 'number', clearable: true }
    })

    await wrapper.find('.cat-input-clear-button').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0])
  })

  it('hides the clear button when the input cannot be edited', async () => {
    const wrapper = mountComponent(CatInput, {
      props: { modelValue: 'hello', clearable: true, disabled: true }
    })
    expect(wrapper.find('.cat-input-clear-button').exists()).toBe(false)

    await wrapper.setProps({ disabled: false, readonly: true })
    expect(wrapper.find('.cat-input-clear-button').exists()).toBe(false)

    await wrapper.setProps({ readonly: false, static: true })
    expect(wrapper.find('.cat-input-clear-button').exists()).toBe(false)
  })

  it('exposes clear() so parents can clear programmatically', () => {
    const wrapper = mountComponent(CatInput, {
      props: { modelValue: 'hello', clearable: true }
    })

    const exposed = wrapper.vm as unknown as { clear: () => void }
    expect(typeof exposed.clear).toBe('function')

    exposed.clear()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('exposes focus() so parents can move focus programmatically', async () => {
    const wrapper = mountComponent(CatInput, {
      attachTo: document.body,
      props: { modelValue: '' }
    })

    const exposed = wrapper.vm as unknown as { focus: () => void, blur: () => void }
    expect(typeof exposed.focus).toBe('function')
    expect(typeof exposed.blur).toBe('function')

    exposed.focus()
    expect(document.activeElement).toBe(wrapper.find('input').element)

    exposed.blur()
    expect(document.activeElement).not.toBe(wrapper.find('input').element)

    wrapper.unmount()
  })
})
