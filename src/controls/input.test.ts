import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createSSRApp, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
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
    expect(clearButton.find('svg[data-icon="close-circle"]').attributes('aria-hidden')).toBe('true')
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

      // As with Vue's v-model, the number itself while focused; formatted on blur
      expect((input.element as HTMLInputElement).value).toBe('4')
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
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0])
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

  describe('optional', () => {
    it('emits undefined when a field holding a number is emptied', async () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: 12, type: 'number', optional: true }
      })
      const input = wrapper.find('input')

      ;(input.element as HTMLInputElement).value = ''
      await input.trigger('input')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([undefined])
    })

    it('emits undefined from the clear button', async () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: 12, type: 'number', optional: true, clearable: true }
      })

      await wrapper.find('.cat-input-clear-button').trigger('click')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([undefined])
    })

    it('keeps a typed 0 as 0', async () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: 12, type: 'number', optional: true }
      })
      const input = wrapper.find('input')

      ;(input.element as HTMLInputElement).value = '0'
      await input.trigger('input')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0])
    })

    it('emits numbers while the bound value is undefined or null', async () => {
      for (const modelValue of [undefined, null]) {
        const wrapper = mountComponent(CatInput, {
          props: { modelValue, type: 'number', optional: true }
        })
        const input = wrapper.find('input')

        expect((input.element as HTMLInputElement).value).toBe('')
        ;(input.element as HTMLInputElement).value = '12.5'
        await input.trigger('input')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([12.5])
        wrapper.unmount()
      }
    })

    it('formats with decimals once the first number is typed', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: {
          'modelValue': undefined,
          'type': 'number',
          'optional': true,
          'decimals': 2,
          'onUpdate:modelValue': (v: number | undefined) => wrapper.setProps({ modelValue: v })
        }
      })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await input.trigger('focus')
      el.value = '3'
      await input.trigger('input')
      await input.trigger('blur')

      expect(el.value).toBe('3.00')
      wrapper.unmount()
    })

    it('stays empty while focused when emptied, and after blur', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: {
          'modelValue': 7,
          'type': 'number',
          'optional': true,
          'onUpdate:modelValue': (v: number | undefined) => wrapper.setProps({ modelValue: v })
        }
      })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await input.trigger('focus')
      el.value = ''
      await input.trigger('input')
      expect(el.value).toBe('')

      await input.trigger('blur')
      expect(el.value).toBe('')
      wrapper.unmount()
    })

    it('replaces typed text when the model is reset to undefined while focused', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: { modelValue: 5, type: 'number', optional: true }
      })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await input.trigger('focus')
      await wrapper.setProps({ modelValue: undefined })
      expect(el.value).toBe('')

      await wrapper.setProps({ modelValue: 5 })
      expect(el.value).toBe('5')
      wrapper.unmount()
    })

    // A template's bare `optional` attribute arrives as "". It is cast to true
    // only if the prop has a Boolean runtime type, which a bare generic
    // parameter did not give it.
    it('takes effect from a bare attribute', async () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: undefined, type: 'number' },
        attrs: { optional: '' }
      })
      const input = wrapper.find('input')

      ;(input.element as HTMLInputElement).value = '45'
      await input.trigger('input')
      ;(input.element as HTMLInputElement).value = ''
      await input.trigger('input')

      expect(wrapper.emitted('update:modelValue')).toEqual([[45], [undefined]])
    })

    it('has no effect on a text input', async () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: 'abc', optional: true, clearable: true }
      })

      await wrapper.find('.cat-input-clear-button').trigger('click')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    })
  })

  // The parent stores the value somewhere that applies it late or not at all,
  // such as the URL. The input must still show the model once editing ends,
  // and must not mistake a late echo of its own emit for an outside change.
  describe('a parent that ignores or delays emitted values', () => {
    it('restores the model on blur when the parent ignores a cleared field', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: {
          'modelValue': 2.75,
          'type': 'number',
          'optional': true,
          'decimals': 2,
          // Applies numbers only, so the undefined from clearing is dropped
          'onUpdate:modelValue': (v: number | undefined) => { if (v != null) wrapper.setProps({ modelValue: v }) }
        }
      })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await input.trigger('focus')
      el.value = ''
      await input.trigger('input')
      expect(el.value).toBe('')

      await input.trigger('blur')
      await nextTick()
      expect(el.value).toBe('2.75')
      wrapper.unmount()
    })

    it('restores the model on blur when the parent ignores typed text', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: { 'modelValue': 4, 'type': 'number', 'onUpdate:modelValue': () => {} }
      })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await input.trigger('focus')
      el.value = '9'
      await input.trigger('input')
      // Still the person's text while they edit
      expect(el.value).toBe('9')

      await input.trigger('blur')
      await nextTick()
      expect(el.value).toBe('4')
      wrapper.unmount()
    })

    // As with Vue's own v-model on <input>, the model is expected to update as
    // soon as a value is emitted. Late updates are the parent's to avoid, by
    // binding to synchronous state and writing slow stores from there.
    // jsdom sanitizes "2." to "" when it is assigned to a number input, so the
    // half-typed decimal is checked in a browser instead.
    it('keeps the typed text with a parent that applies each emit at once', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: {
          'modelValue': 1,
          'type': 'number',
          'decimals': 2,
          'onUpdate:modelValue': (v: number) => wrapper.setProps({ modelValue: v })
        }
      })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await input.trigger('focus')
      for (const text of ['2', '2.7', '2.75']) {
        el.value = text
        await input.trigger('input')
        await nextTick()
        expect(el.value).toBe(text)
      }
      expect(wrapper.emitted('update:modelValue')).toEqual([[2], [2.7], [2.75]])

      await input.trigger('blur')
      expect(el.value).toBe('2.75')
      wrapper.unmount()
    })

    it('replaces the typed text when the model changes to something else while focused', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: { modelValue: 1, type: 'number', decimals: 2 }
      })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await input.trigger('focus')
      el.value = '2'
      await input.trigger('input')
      // A reset from outside, such as a button that sets the value
      await wrapper.setProps({ modelValue: 5 })
      expect(el.value).toBe('5')
      wrapper.unmount()
    })
  })

  // v-model.lazy on a component arrives as modelModifiers: { lazy: true }
  describe('v-model.lazy', () => {
    it('emits on change rather than on each keystroke', async () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: 'a', modelModifiers: { lazy: true } }
      })
      const input = wrapper.find('input')

      ;(input.element as HTMLInputElement).value = 'ab'
      await input.trigger('input')
      ;(input.element as HTMLInputElement).value = 'abc'
      await input.trigger('input')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()

      await input.trigger('change')
      expect(wrapper.emitted('update:modelValue')).toEqual([['abc']])
    })

    it('converts and formats a number committed on change', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: {
          'modelValue': undefined,
          'type': 'number',
          'optional': true,
          'decimals': 2,
          'modelModifiers': { lazy: true },
          'onUpdate:modelValue': (v: number | undefined) => wrapper.setProps({ modelValue: v })
        }
      })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await input.trigger('focus')
      el.value = '2.5'
      await input.trigger('input')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      expect(el.value).toBe('2.5')

      // The browser fires change, then blur, when the field is left
      await input.trigger('change')
      await input.trigger('blur')
      await nextTick()
      expect(wrapper.emitted('update:modelValue')).toEqual([[2.5]])
      expect(el.value).toBe('2.50')
      wrapper.unmount()
    })

    it('commits an emptied optional field as undefined on change', async () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: 3, type: 'number', optional: true, modelModifiers: { lazy: true } }
      })
      const input = wrapper.find('input')

      ;(input.element as HTMLInputElement).value = ''
      await input.trigger('input')
      await input.trigger('change')

      expect(wrapper.emitted('update:modelValue')).toEqual([[undefined]])
    })

    it('still clears at once from the clear button', async () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: 'abc', clearable: true, modelModifiers: { lazy: true } }
      })

      await wrapper.find('.cat-input-clear-button').trigger('click')

      expect(wrapper.emitted('update:modelValue')).toEqual([['']])
    })

    it('ignores change without the modifier, which already emitted on input', async () => {
      const wrapper = mountComponent(CatInput, { props: { modelValue: 'a' } })
      const input = wrapper.find('input')

      ;(input.element as HTMLInputElement).value = 'ab'
      await input.trigger('input')
      await input.trigger('change')

      expect(wrapper.emitted('update:modelValue')).toEqual([['ab']])
    })

    it('does not leak modelModifiers onto the native input as an attribute', () => {
      const wrapper = mountComponent(CatInput, { props: { modelValue: 'a', modelModifiers: { lazy: true } } })
      expect(wrapper.find('input').attributes('modelmodifiers')).toBeUndefined()
    })
  })

  describe('IME composition and server rendering', () => {
    // Text mid-composition (Japanese, Chinese, Korean input methods) is not a
    // value yet, so it is emitted once the composition ends, as Vue's v-model
    // does.
    it('emits once when a composition ends, not on each keystroke within it', async () => {
      const wrapper = mountComponent(CatInput, { props: { modelValue: '' } })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await input.trigger('compositionstart')
      el.value = 'に'
      await input.trigger('input')
      el.value = 'にほ'
      await input.trigger('input')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()

      el.value = '日本'
      await input.trigger('compositionend')
      expect(wrapper.emitted('update:modelValue')).toEqual([['日本']])
    })

    it('does not rewrite the field while a composition is under way', async () => {
      const wrapper = mountComponent(CatInput, { props: { modelValue: 'a' } })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await input.trigger('compositionstart')
      el.value = 'aに'
      await wrapper.setProps({ modelValue: 'b' })
      expect(el.value).toBe('aに')
    })

    it('renders the formatted value into the server HTML', async () => {
      const app = createSSRApp(() => h(CatInput, { modelValue: 2.5, type: 'number', decimals: 2 }))
      const html = await renderToString(app)
      expect(html).toContain('value="2.50"')
    })
  })

  // Findings from review: cases where Vue's own v-model keeps the field right
  describe('matching Vue v-model edge cases', () => {
    it('keeps uncommitted lazy text through a re-render for another reason', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: { modelValue: 2.5, type: 'number', modelModifiers: { lazy: true } }
      })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      el.focus()
      await nextTick()
      el.value = '7'
      await input.trigger('input')
      await wrapper.setProps({ variant: 'danger' })

      expect(el.value).toBe('7')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      wrapper.unmount()
    })

    it('still shows a lazy model changed from outside while editing', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: { modelValue: 2.5, type: 'number', modelModifiers: { lazy: true } }
      })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await input.trigger('focus')
      el.value = '7'
      await input.trigger('input')
      await wrapper.setProps({ modelValue: 9 })

      expect(el.value).toBe('9')
      wrapper.unmount()
    })

    it('ends a composition the browser never finished when the field changes', async () => {
      const wrapper = mountComponent(CatInput, { props: { modelValue: '' } })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await input.trigger('compositionstart')
      el.value = 'にほん'
      await input.trigger('input')
      // No compositionend, as when Safari leaves the field mid-composition
      await input.trigger('change')
      expect(wrapper.emitted('update:modelValue')).toEqual([['にほん']])

      // Later typing emits again rather than staying stuck as mid-composition
      el.value = 'にほんご'
      await input.trigger('input')
      expect(wrapper.emitted('update:modelValue')?.slice(-1)[0]).toEqual(['にほんご'])
    })

    // Safari fires compositionend before the composition's last input event.
    // Vue's v-model then assigns the same value twice, a no-op for a v-model
    // binding; cat-input does what Vue does.
    it('ends with the composed text when Safari fires input after compositionend', async () => {
      const wrapper = mountComponent(CatInput, { props: { modelValue: '' } })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      await input.trigger('compositionstart')
      el.value = '日本'
      await input.trigger('compositionend')
      await input.trigger('input')

      const emitted = wrapper.emitted('update:modelValue') ?? []
      expect(new Set(emitted.map(args => args[0]))).toEqual(new Set(['日本']))
    })

    // Focus taken before the component hydrated, as with autofocus or a click
    // before the page's JavaScript loaded, fires no focus event afterwards
    it('treats a field focused before hydration as being edited', async () => {
      const model = ref(2.5)
      const Root = () => h(CatInput, {
        'modelValue': model.value,
        'type': 'number',
        'decimals': 2,
        'onUpdate:modelValue': (v: unknown) => { model.value = v as number }
      })
      const container = document.createElement('div')
      container.innerHTML = await renderToString(createSSRApp(Root))
      document.body.appendChild(container)
      const el = container.querySelector('input')!
      el.focus()
      expect(el.value).toBe('2.50')

      const app = createSSRApp(Root)
      app.mount(container)
      await nextTick()
      // Still the text as it was, not reformatted under the person
      expect(el.value).toBe('2.50')

      el.value = '3'
      el.dispatchEvent(new Event('input'))
      await nextTick()
      expect(model.value).toBe(3)
      // Raw while being edited; formatted only when the field is left
      expect(el.value).toBe('3')
      app.unmount()
      container.remove()
    })

    it('shows the clear button for the field\'s text, not the lazy model', async () => {
      const wrapper = mountComponent(CatInput, {
        attachTo: document.body,
        props: { modelValue: '', clearable: true, modelModifiers: { lazy: true } }
      })
      const input = wrapper.find('input')
      const el = input.element as HTMLInputElement

      el.focus()
      await nextTick()
      el.value = 'abc'
      await input.trigger('input')
      expect(wrapper.find('.cat-input-clear-button').exists()).toBe(true)

      el.value = ''
      await input.trigger('input')
      expect(wrapper.find('.cat-input-clear-button').exists()).toBe(false)
      wrapper.unmount()
    })

    it('keeps focus in the field on a mouse press of the clear button', async () => {
      const wrapper = mountComponent(CatInput, {
        props: { modelValue: 'abc', clearable: true }
      })
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
      wrapper.find('.cat-input-clear-button').element.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
    })
  })
})
