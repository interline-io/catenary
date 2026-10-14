import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import CatInput from './input.vue'
import CatField from './field.vue'
import {
  mountComponent,
  testVModel,
  variantProps,
  sizeProps,
  testBulmaClasses,
  testDisabledState,
  expectNoAxeViolations
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

  describe('fallthrough attributes', () => {
    // A duplicated id put the same value on the root .control wrapper, which
    // precedes the input in document order — so a consumer's <label for>
    // resolved to that non-labelable wrapper and labelled nothing.
    it('puts id, aria-* and data-* on the input only', () => {
      const wrapper = mountComponent(CatInput, {
        attrs: { 'id': 'dup-check', 'aria-labelledby': 'ext', 'data-probe': '1' }
      })
      const root = wrapper.find('.control')
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
    // typography only takes effect on the native element, since Bulma's base
    // sets font-family directly on it rather than letting it inherit.
    it('keeps class on both the wrapper and the input', () => {
      const wrapper = mountComponent(CatInput, { attrs: { class: 'mt-2' } })
      expect(wrapper.find('.control').classes()).toContain('mt-2')
      expect(wrapper.find('input').classes()).toContain('mt-2')
      wrapper.unmount()
    })

    // A listener bound to both the wrapper and the control ran twice for one
    // keypress, because the control's event bubbles up through the wrapper.
    // The key that moved a consumer's listbox highlight moved it two rows.
    it('fires a bubbling listener once per event', async () => {
      const onKeydown = vi.fn()
      const wrapper = mountComponent(CatInput, {
        attrs: { onKeydown }
      })

      await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })

      expect(onKeydown).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    // focus does not bubble, so a wrapper-only listener would never fire.
    it('fires a non-bubbling listener on the control', async () => {
      const onFocus = vi.fn()
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        attrs: { onFocus }
      })

      await wrapper.find('input').trigger('focus')

      expect(onFocus).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    // `invalid` is fired by constraint validation and does not bubble (verified
    // against a real browser-generated event, not a synthesized one), so a
    // listener routed to the wrapper would never run. Dispatched here with
    // bubbles: false to match what the browser actually emits.
    it('delivers a non-bubbling invalid event to the input', async () => {
      const onInvalid = vi.fn()
      const wrapper = mountComponent(CatInput, { attrs: { onInvalid } })

      wrapper.find('input').element.dispatchEvent(new Event('invalid', { bubbles: false }))
      await wrapper.vm.$nextTick()

      expect(onInvalid).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })
  })

  describe('prefix and suffix', () => {
    it('renders no addon group without a prefix or suffix', () => {
      const wrapper = mountComponent(CatInput, { props: { modelValue: '' } })

      expect(wrapper.find('.has-addons').exists()).toBe(false)
      expect(wrapper.classes()).toEqual(['control'])
    })

    it('renders prefix and suffix as static addons around the input', () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: 5, type: 'number', prefix: '$', suffix: 'per trip' }
      })

      testBulmaClasses(wrapper, ['field', 'has-addons', 'cat-input-addons'])
      const controls = wrapper.findAll(':scope > .control')
      expect(controls).toHaveLength(3)
      expect(controls[0]!.text()).toBe('$')
      expect(controls[1]!.find('input').exists()).toBe(true)
      expect(controls[2]!.text()).toBe('per trip')
      // The input takes the width the addons leave, as a lone input would.
      expect(controls[1]!.classes()).toContain('is-expanded')
    })

    it('keeps the addons out of the tab order', () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: '', prefix: '$', suffix: 'USD' }
      })

      for (const addon of wrapper.findAll('.cat-input-addon')) {
        expect(addon.element.tagName).toBe('SPAN')
        expect(addon.classes()).toEqual(expect.arrayContaining(['button', 'is-static']))
        expect(addon.attributes('tabindex')).toBeUndefined()
      }
      expect(wrapper.findAll('button')).toHaveLength(0)
    })

    it('hides the addons where drawn and adds them to the input description', () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: '', prefix: '$', suffix: 'USD', ariaDescribedby: 'hint' }
      })

      const [prefix, suffix] = wrapper.findAll('.cat-input-addon')
      expect(prefix!.attributes('aria-hidden')).toBe('true')
      expect(suffix!.attributes('aria-hidden')).toBe('true')
      expect(wrapper.find('input').attributes('aria-describedby'))
        .toBe(`${prefix!.attributes('id')} ${suffix!.attributes('id')} hint`)
    })

    it('sizes the addons with the input', () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: '', suffix: 'm', size: 'small' }
      })

      expect(wrapper.find('.cat-input-addon').classes()).toContain('is-small')
    })

    it('keeps icons and the clear button working beside an addon', async () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: 3, type: 'number', prefix: '$', icon: 'cash', clearable: true }
      })

      const control = wrapper.find('.control.has-icons-left')
      expect(control.classes()).toContain('has-icons-right')
      await wrapper.find('.cat-input-clear-button').trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0])
    })

    // The group is the root once there is one, so layout classes space the
    // whole group and a listener still sees events from every part of it.
    it('routes root attributes to the addon group', async () => {
      const onKeydown = vi.fn()
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: '', suffix: 'm' },
        attrs: { class: 'mt-2', id: 'radius', onKeydown }
      })

      expect(wrapper.classes()).toEqual(expect.arrayContaining(['field', 'has-addons', 'mt-2']))
      expect(wrapper.attributes('id')).toBeUndefined()
      expect(wrapper.find('input').attributes('id')).toBe('radius')
      for (const control of wrapper.findAll('.control')) {
        expect(control.classes()).not.toContain('mt-2')
      }

      await wrapper.find('input').trigger('keydown', { key: 'Enter' })
      expect(onKeydown).toHaveBeenCalledTimes(1)
    })

    it('marks the addon group expanded so a grouped field can grow it', () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: '', suffix: 'min', expanded: true }
      })

      expect(wrapper.classes()).toEqual(expect.arrayContaining(['cat-input-addons', 'is-expanded']))
    })

    it('adds and removes the addon group as the props change', async () => {
      const wrapper = mountComponent(CatInput, { props: { modelValue: '' } })

      await wrapper.setProps({ suffix: 'minutes' })
      expect(wrapper.find('.has-addons').exists()).toBe(true)

      await wrapper.setProps({ suffix: undefined })
      expect(wrapper.find('.has-addons').exists()).toBe(false)
      expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined()
    })

    it('has no axe violations with a prefix and suffix', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: { modelValue: 2.5, type: 'number', prefix: '$', suffix: 'USD', decimals: 2, ariaLabel: 'Maximum fare in dollars' }
      })

      await expectNoAxeViolations(wrapper)
      wrapper.unmount()
    })

    it('has no axe violations with a suffix inside a labelled cat-field', async () => {
      const wrapper = mount(CatField, {
        attachTo: document.body,
        props: { label: 'Headway', message: 'Average time between trips' },
        slots: { default: () => h(CatInput, { modelValue: 10, type: 'number', suffix: 'minutes' }) }
      })

      const input = wrapper.find('input')
      expect(wrapper.find('label').attributes('for')).toBe(input.attributes('id'))
      const describedby = input.attributes('aria-describedby')!.split(' ')
      expect(describedby).toHaveLength(2)
      expect(document.getElementById(describedby[0]!)?.textContent).toBe('minutes')
      expect(document.getElementById(describedby[1]!)?.textContent?.trim()).toBe('Average time between trips')

      await expectNoAxeViolations(wrapper)
      wrapper.unmount()
    })
  })

  describe('decimals', () => {
    it('formats the value to the given places while not focused', () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: 2.5, type: 'number', decimals: 2 }
      })

      expect((wrapper.find('input').element as HTMLInputElement).value).toBe('2.50')
    })

    it('emits the unrounded number typed, and formats only on blur', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: { modelValue: 2.5, type: 'number', decimals: 2 }
      })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await input.trigger('focus')
      // Focusing does not redraw "2.50" as the model's "2.5".
      expect(el.value).toBe('2.50')

      el.value = '3.125'
      await input.trigger('input')
      expect(wrapper.emitted('update:modelValue')?.slice(-1)[0]).toEqual([3.125])
      await wrapper.setProps({ modelValue: 3.125 })
      expect(el.value).toBe('3.125')

      await input.trigger('blur')
      expect(el.value).toBe('3.13')
      wrapper.unmount()
    })

    it('replaces the typed text when the model is set from outside while focused', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: { modelValue: 2.5, type: 'number', decimals: 2 }
      })
      const input = wrapper.find('input')

      await input.trigger('focus')
      await wrapper.setProps({ modelValue: 4 })

      expect((input.element as HTMLInputElement).value).toBe('4.00')
      wrapper.unmount()
    })

    it('leaves an emptied numeric field empty until blur', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: { modelValue: 7, type: 'number' }
      })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await input.trigger('focus')
      el.value = ''
      await input.trigger('input')
      expect(wrapper.emitted('update:modelValue')?.slice(-1)[0]).toEqual([0])
      await wrapper.setProps({ modelValue: 0 })
      // Before, the field refilled with "0" before the next digit could be typed.
      expect(el.value).toBe('')

      await input.trigger('blur')
      expect(el.value).toBe('0')
      wrapper.unmount()
    })

    it('ignores decimals for a non-numeric type', () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: '2.5', decimals: 2 }
      })

      const input = wrapper.find('input')
      expect((input.element as HTMLInputElement).value).toBe('2.5')
      expect(input.attributes('inputmode')).toBeUndefined()
    })

    it('defaults inputmode to decimal, or numeric for whole numbers, when min is 0 or more', async () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: 1, type: 'number', decimals: 2, min: '0' }
      })
      expect(wrapper.find('input').attributes('inputmode')).toBe('decimal')

      await wrapper.setProps({ decimals: 0 })
      expect(wrapper.find('input').attributes('inputmode')).toBe('numeric')
      expect((wrapper.find('input').element as HTMLInputElement).value).toBe('1')
    })

    // Neither iOS number pad has a minus key.
    it('sets no inputmode when negative values are allowed', async () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: 1, type: 'number', decimals: 2 }
      })
      expect(wrapper.find('input').attributes('inputmode')).toBeUndefined()

      await wrapper.setProps({ min: -10 })
      expect(wrapper.find('input').attributes('inputmode')).toBeUndefined()
    })

    it('lets a caller-supplied inputmode win', () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: 1, type: 'number', decimals: 2, min: 0 },
        attrs: { inputmode: 'text' }
      })

      expect(wrapper.find('input').attributes('inputmode')).toBe('text')
    })

    it('shows the full value on focus when rounding hid digits', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: { modelValue: 2.125, type: 'number', decimals: 2 }
      })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement
      expect(el.value).toBe('2.13')

      await input.trigger('focus')
      expect(el.value).toBe('2.125')

      await input.trigger('blur')
      expect(el.value).toBe('2.13')
      wrapper.unmount()
    })

    it('does not let typed text outlive a model set from outside', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: { modelValue: 7, type: 'number' }
      })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await input.trigger('focus')
      el.value = ''
      await input.trigger('input')
      await wrapper.setProps({ modelValue: 0 })
      expect(el.value).toBe('')

      // Set to 7 and back to 0 while focus stays: the field shows the model,
      // not the empty text left from before.
      await wrapper.setProps({ modelValue: 7 })
      expect(el.value).toBe('7')
      await wrapper.setProps({ modelValue: 0 })
      expect(el.value).toBe('0')
      wrapper.unmount()
    })

    it('leaves the field empty after the clear button until blur', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: {
          'modelValue': 3,
          'type': 'number',
          'decimals': 2,
          'clearable': true,
          'onUpdate:modelValue': (v: number) => wrapper.setProps({ modelValue: v })
        }
      })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await wrapper.find('.cat-input-clear-button').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.props('modelValue')).toBe(0)
      expect(document.activeElement).toBe(el)
      expect(el.value).toBe('')

      await input.trigger('blur')
      expect(el.value).toBe('0.00')
      wrapper.unmount()
    })

    it('sets no inputmode without decimals', () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: 1, type: 'number' }
      })

      expect(wrapper.find('input').attributes('inputmode')).toBeUndefined()
    })
  })
})
