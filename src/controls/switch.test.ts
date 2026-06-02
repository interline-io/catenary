import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CatSwitch from './switch.vue'

describe('cat-switch', () => {
  it('renders the underlying input with role="switch"', () => {
    const wrapper = mount(CatSwitch, {
      props: { modelValue: false }
    })
    const input = wrapper.find('input[type="checkbox"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('role')).toBe('switch')
  })

  it('reflects modelValue via aria-checked and the native checked state', async () => {
    const wrapper = mount(CatSwitch, {
      props: { modelValue: false }
    })
    const input = wrapper.find('input[type="checkbox"]')
    expect(input.attributes('aria-checked')).toBe('false')
    expect((input.element as HTMLInputElement).checked).toBe(false)

    await wrapper.setProps({ modelValue: true })
    expect(input.attributes('aria-checked')).toBe('true')
    expect((input.element as HTMLInputElement).checked).toBe(true)
  })

  it('honors custom trueValue/falseValue for aria-checked', async () => {
    const wrapper = mount(CatSwitch, {
      props: { modelValue: 'on', trueValue: 'on', falseValue: 'off' }
    })
    const input = wrapper.find('input[type="checkbox"]')
    expect(input.attributes('aria-checked')).toBe('true')

    await wrapper.setProps({ modelValue: 'off' })
    expect(input.attributes('aria-checked')).toBe('false')
  })

  it('emits update:modelValue with the matching value on change', async () => {
    const wrapper = mount(CatSwitch, {
      props: { modelValue: false }
    })
    const input = wrapper.find('input[type="checkbox"]')
    await input.setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })
})
