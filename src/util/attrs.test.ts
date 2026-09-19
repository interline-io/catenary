import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref, nextTick } from 'vue'
import { filterAttrs, isRootAttr, isControlAttr } from './attrs'
import CatInput from '../controls/input.vue'

describe('filterAttrs', () => {
  it('keeps only the attributes the predicate accepts', () => {
    const out = filterAttrs(
      { class: 'a', style: 'color:red', id: 'x', onClick: () => {} },
      isRootAttr
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

// The two predicates partition the listeners between the wrapper and the
// control: exactly one of them accepts any given `on*` key, which is what keeps
// a single keypress from firing a consumer's handler twice.
describe('isRootAttr / isControlAttr', () => {
  it('sends a bubbling listener to the wrapper and nowhere else', () => {
    for (const key of ['onClick', 'onKeydown', 'onInput', 'onChange', 'onFocusin']) {
      expect(isRootAttr(key), key).toBe(true)
      expect(isControlAttr(key), key).toBe(false)
    }
  })

  // A wrapper listener would never fire for these, since they do not bubble out
  // of the native control inside it.
  it('sends a non-bubbling listener to the control and nowhere else', () => {
    for (const key of ['onFocus', 'onBlur', 'onMouseenter', 'onMouseleave', 'onScroll']) {
      expect(isRootAttr(key), key).toBe(false)
      expect(isControlAttr(key), key).toBe(true)
    }
  })

  // Vue appends modifiers to the key, so `@focus.once` arrives as `onFocusOnce`
  // and would be read as a bubbling listener if they were not stripped first.
  it('classifies a modified listener by its event, not its modifiers', () => {
    expect(isControlAttr('onFocusOnce')).toBe(true)
    expect(isControlAttr('onMouseenterCapture')).toBe(true)
    expect(isRootAttr('onFocusOnce')).toBe(false)
    expect(isRootAttr('onClickCaptureOnce')).toBe(true)
  })

  it('keeps class and style on both, and everything else on the control', () => {
    for (const key of ['class', 'style']) {
      expect(isRootAttr(key), key).toBe(true)
      expect(isControlAttr(key), key).toBe(true)
    }
    for (const key of ['id', 'aria-labelledby', 'data-probe', 'placeholder']) {
      expect(isRootAttr(key), key).toBe(false)
      expect(isControlAttr(key), key).toBe(true)
    }
  })
})
