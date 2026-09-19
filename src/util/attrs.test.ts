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

  // The wrapper cannot observe these at all, so a listener there never fires.
  // `invalid` is the one to keep in mind: it is a form-control event, so it is
  // the likeliest of these to be bound to a form control, and it was missed on
  // the first pass.
  it('sends a listener the wrapper cannot see to the control and nowhere else', () => {
    const wrapperBlind = [
      'onFocus',
      'onBlur',
      'onScroll',
      'onScrollend',
      'onInvalid'
    ]
    for (const key of wrapperBlind) {
      expect(isRootAttr(key), key).toBe(false)
      expect(isControlAttr(key), key).toBe(true)
    }
  })

  // mouseenter and its relatives do not bubble, but the browser fires them on
  // every element being entered, so the wrapper does see them — over a larger
  // area than the control. Routing them to the control shrank the hover region
  // to the bare control, which is why "does it bubble" is the wrong test.
  it('keeps the enter/leave family and the bubbling counterparts on the wrapper', () => {
    const wrapperVisible = [
      'onMouseenter', 'onMouseleave', 'onPointerenter', 'onPointerleave',
      'onFocusin', 'onFocusout', 'onMouseover', 'onMouseout', 'onPointerover', 'onPointerout'
    ]
    for (const key of wrapperVisible) {
      expect(isRootAttr(key), key).toBe(true)
      expect(isControlAttr(key), key).toBe(false)
    }
  })

  // Vue appends modifiers to the key, so `@focus.once` arrives as `onFocusOnce`
  // and would be read as an ordinary wrapper listener if `Once` were not
  // stripped first — which would bind it where it can never fire.
  it('classifies a modified listener by its event, not its modifiers', () => {
    expect(isControlAttr('onFocusOnce')).toBe(true)
    expect(isRootAttr('onFocusOnce')).toBe(false)
    expect(isRootAttr('onClickCaptureOnce')).toBe(true)
  })

  // `.capture` is the exception: the capture phase runs from the root down for
  // every event, so a capturing wrapper listener does see a descendant's focus
  // or invalid — and covers the icons beside the control too. Verified against a
  // real constraint-validation `invalid` event: a capturing listener on the
  // wrapper fires, a non-capturing one does not.
  it('keeps a capturing listener on the wrapper even when the event is wrapper-blind', () => {
    for (const key of ['onFocusCapture', 'onBlurCapture', 'onInvalidCapture', 'onScrollCapture']) {
      expect(isRootAttr(key), key).toBe(true)
      expect(isControlAttr(key), key).toBe(false)
    }
  })

  // Vue appends event-option modifiers in the order they were written, so
  // `@focus.once.capture` arrives as `onFocusOnceCapture`. Matching only a
  // trailing `Capture` would miss it and bind it to the control.
  it('finds Capture anywhere in the modifier run', () => {
    expect(isRootAttr('onFocusOnceCapture')).toBe(true)
    expect(isRootAttr('onFocusCaptureOnce')).toBe(true)
    expect(isControlAttr('onFocusOnceCapture')).toBe(false)
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
