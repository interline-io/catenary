import { describe, it, expect } from 'vitest'
import { mountComponent } from '../testutil/component-helpers'
import CatTextarea from './textarea.vue'

describe('CatTextarea', () => {
  it('exposes focus() so parents can move focus programmatically', () => {
    const wrapper = mountComponent(CatTextarea, {
      attachTo: document.body,
      props: { modelValue: 'hello' }
    })

    const exposed = wrapper.vm as unknown as { focus: () => void, blur: () => void }
    expect(typeof exposed.focus).toBe('function')
    expect(typeof exposed.blur).toBe('function')

    exposed.focus()
    expect(document.activeElement).toBe(wrapper.find('textarea').element)

    exposed.blur()
    expect(document.activeElement).not.toBe(wrapper.find('textarea').element)

    wrapper.unmount()
  })
})
