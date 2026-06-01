import { describe, it, expect } from 'vitest'
import { mountComponent } from '../testutil/component-helpers'
import CatSelect from './select.vue'

describe('CatSelect', () => {
  it('exposes focus() so parents can move focus programmatically', () => {
    const wrapper = mountComponent(CatSelect, {
      attachTo: document.body,
      props: { modelValue: 'a' },
      slots: { default: '<option value="a">A</option><option value="b">B</option>' }
    })

    const exposed = wrapper.vm as unknown as { focus: () => void, blur: () => void }
    expect(typeof exposed.focus).toBe('function')
    expect(typeof exposed.blur).toBe('function')

    exposed.focus()
    expect(document.activeElement).toBe(wrapper.find('select').element)

    exposed.blur()
    expect(document.activeElement).not.toBe(wrapper.find('select').element)

    wrapper.unmount()
  })
})
