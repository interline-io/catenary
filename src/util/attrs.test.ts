import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref, nextTick } from 'vue'
import { filterAttrs, isPresentationalAttr } from './attrs'
import CatInput from '../controls/input.vue'

describe('filterAttrs', () => {
  it('keeps only the attributes the predicate accepts', () => {
    const out = filterAttrs(
      { class: 'a', style: 'color:red', id: 'x', onClick: () => {} },
      isPresentationalAttr
    )
    expect(Object.keys(out).sort()).toEqual(['class', 'onClick', 'style'])
  })

  // Tracking happens in the attrs proxy's `get` trap, and Object.entries() on
  // an empty attrs object triggers only `ownKeys`. Without an unconditional
  // touch, a computed built from it registers no dependency on first render
  // and keeps returning that empty result forever.
  it('stays reactive when $attrs starts empty', async () => {
    const extra = ref<Record<string, unknown>>({})
    const Host = defineComponent({ setup: () => () => h(CatInput, { ...extra.value }) })
    const wrapper = mount(Host)
    expect(wrapper.find('.control').classes()).not.toContain('is-danger')

    extra.value = { class: 'is-danger' }
    await nextTick()
    expect(wrapper.find('.control').classes()).toContain('is-danger')
    expect(wrapper.find('input').classes()).toContain('is-danger')
    wrapper.unmount()
  })
})
