import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { mount, enableAutoUnmount } from '@vue/test-utils'
import CatTooltip from './tooltip.vue'
import { expectNoAxeViolations } from '../testutil/component-helpers'

// Unmount even when a test fails before its own wrapper.unmount(), so an open
// tooltip and its dismiss layer don't leak into later tests.
enableAutoUnmount(afterEach)

// jsdom lays nothing out, so its root element measures 0 × 0. Placement takes
// the window's size from the root, so give the root jsdom's 1024 × 768 window.
Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 1024 })
Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 768 })

function box (left: number, top: number, width: number, height: number): DOMRect {
  return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }
}

// Shows a tooltip whose trigger has the given box in a 1024 × 768 window and
// whose bubble measures 200 × 40 unless given another size, as a browser would
// measure them, and waits for the frame that places the bubble.
async function showAt (position: 'top' | 'bottom' | 'left' | 'right', trigger: DOMRect, bubbleSize = { width: 200, height: 40 }) {
  const wrapper = mount(CatTooltip, {
    attachTo: document.body,
    props: { text: 'Hint', position },
    slots: { default: '<button class="button">Trigger</button>' }
  })
  const root = wrapper.find('.cat-tooltip')
  const bubble = wrapper.find('[role="tooltip"]').element as HTMLElement
  root.element.getBoundingClientRect = () => trigger
  bubble.getBoundingClientRect = () => box(0, 0, bubbleSize.width, bubbleSize.height)
  await root.trigger('pointerenter')
  await wrapper.vm.$nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  return { wrapper, root, bubble }
}

// The template starts with an HTML comment (an eslint-disable directive), so
// the component renders as a fragment and wrapper.element isn't the <span>.
// Look up .cat-tooltip explicitly for attribute and class checks.
describe('cat-tooltip', () => {
  it('renders a tooltip element with role="tooltip"', () => {
    const wrapper = mount(CatTooltip, {
      props: { text: 'Save your work' },
      slots: { default: '<button class="button">Save</button>' }
    })
    const bubble = wrapper.find('[role="tooltip"]')
    expect(bubble.exists()).toBe(true)
    expect(bubble.text()).toBe('Save your work')
  })

  it('associates the focusable slot child with the tooltip via aria-describedby', async () => {
    const wrapper = mount(CatTooltip, {
      attachTo: document.body,
      props: { text: 'Save' },
      slots: { default: '<button class="button">Save</button>' }
    })
    await wrapper.vm.$nextTick()
    const tooltipId = wrapper.find('[role="tooltip"]').attributes('id')
    const button = wrapper.find('button')
    const describedby = button.attributes('aria-describedby')
    expect(describedby).toBeDefined()
    expect((describedby ?? '').split(/\s+/)).toContain(tooltipId)
    // Wrapper should NOT carry aria-describedby when a focusable child does,
    // and should not be its own tab stop.
    const tooltip = wrapper.find('.cat-tooltip')
    expect(tooltip.attributes('aria-describedby')).toBeUndefined()
    expect(tooltip.attributes('tabindex')).toBeUndefined()
    wrapper.unmount()
  })

  it('places aria-describedby on the wrapper when the slot has no focusable child', async () => {
    const wrapper = mount(CatTooltip, {
      attachTo: document.body,
      props: { text: 'Info' },
      slots: { default: '<span>Plain text</span>' }
    })
    await wrapper.vm.$nextTick()
    const tooltipId = wrapper.find('[role="tooltip"]').attributes('id')
    const tooltip = wrapper.find('.cat-tooltip')
    expect(tooltip.attributes('aria-describedby')).toBe(tooltipId)
    expect(tooltip.attributes('tabindex')).toBe('0')
    wrapper.unmount()
  })

  it('keeps the tooltip visible while focus stays inside the wrapper', async () => {
    const wrapper = mount(CatTooltip, {
      attachTo: document.body,
      props: { text: 'Hint' },
      slots: { default: '<button class="button">A</button><button class="button">B</button>' }
    })
    const tooltip = wrapper.find('.cat-tooltip')
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(2)

    await buttons[0].element.focus()
    await tooltip.trigger('focusin')
    expect(tooltip.classes()).toContain('is-visible')

    // Focus moves from button A to button B (both inside the wrapper): tooltip stays open.
    await tooltip.trigger('focusout', { relatedTarget: buttons[1].element })
    expect(tooltip.classes()).toContain('is-visible')

    // Focus leaves the wrapper entirely: tooltip hides.
    await tooltip.trigger('focusout', { relatedTarget: document.body })
    expect(tooltip.classes()).not.toContain('is-visible')

    wrapper.unmount()
  })

  it('shows on focusin and hides on focusout', async () => {
    const wrapper = mount(CatTooltip, {
      attachTo: document.body,
      props: { text: 'Hint' },
      slots: { default: '<button class="button">Trigger</button>' }
    })
    const tooltip = wrapper.find('.cat-tooltip')

    expect(tooltip.classes()).not.toContain('is-visible')

    await tooltip.trigger('focusin')
    expect(tooltip.classes()).toContain('is-visible')

    await tooltip.trigger('focusout')
    expect(tooltip.classes()).not.toContain('is-visible')

    wrapper.unmount()
  })

  it('hides when Escape is pressed', async () => {
    const wrapper = mount(CatTooltip, {
      attachTo: document.body,
      props: { text: 'Hint' },
      slots: { default: '<button class="button">Trigger</button>' }
    })
    const tooltip = wrapper.find('.cat-tooltip')

    await tooltip.trigger('pointerenter')
    expect(tooltip.classes()).toContain('is-visible')

    await tooltip.trigger('keydown', { key: 'Escape' })
    expect(tooltip.classes()).not.toContain('is-visible')

    wrapper.unmount()
  })

  it('has no axe violations', async () => {
    const wrapper = mount(CatTooltip, {
      attachTo: document.body,
      props: { text: 'Save your changes' },
      slots: { default: '<button class="button">Save</button>' }
    })
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })

  it('does not set the popover attribute when the Popover API is unsupported', () => {
    // jsdom has no Popover API, so this is the default test environment.
    const wrapper = mount(CatTooltip, {
      attachTo: document.body,
      props: { text: 'Hint' },
      slots: { default: '<button class="button">Trigger</button>' }
    })
    expect(wrapper.find('[role="tooltip"]').attributes('popover')).toBeUndefined()
    wrapper.unmount()
  })

  describe('with Popover API support', () => {
    // jsdom doesn't implement the Popover API; stub it so the component takes
    // the top-layer path. Support is detected per-instance at setup. Save and
    // restore any pre-existing implementations rather than deleting, so a
    // future jsdom with native popover support isn't clobbered for other tests.
    let showCalls = 0
    let hideCalls = 0
    let originalShowPopover: unknown
    let originalHidePopover: unknown

    beforeEach(() => {
      showCalls = 0
      hideCalls = 0
      const proto = HTMLElement.prototype as any
      originalShowPopover = proto.showPopover
      originalHidePopover = proto.hidePopover
      proto.showPopover = function () { showCalls += 1 }
      proto.hidePopover = function () { hideCalls += 1 }
    })

    afterEach(() => {
      const proto = HTMLElement.prototype as any
      if (originalShowPopover === undefined) {
        delete proto.showPopover
      } else {
        proto.showPopover = originalShowPopover
      }
      if (originalHidePopover === undefined) {
        delete proto.hidePopover
      } else {
        proto.hidePopover = originalHidePopover
      }
    })

    it('marks the bubble popover="manual" and shows/hides it in the top layer', async () => {
      const wrapper = mount(CatTooltip, {
        attachTo: document.body,
        props: { text: 'Hint' },
        slots: { default: '<button class="button">Trigger</button>' }
      })
      const bubble = wrapper.find('[role="tooltip"]')
      expect(bubble.attributes('popover')).toBe('manual')

      const tooltip = wrapper.find('.cat-tooltip')
      await tooltip.trigger('pointerenter')
      await wrapper.vm.$nextTick()
      expect(showCalls).toBe(1)

      // pointerleave now schedules the hide rather than doing it immediately,
      // so that crossing the gap onto the bubble does not dismiss it.
      await tooltip.trigger('pointerleave')
      expect(hideCalls).toBe(0)
      await new Promise(resolve => setTimeout(resolve, 250))
      expect(hideCalls).toBe(1)
      wrapper.unmount()
    })

    it('hides the popover on Escape', async () => {
      const wrapper = mount(CatTooltip, {
        attachTo: document.body,
        props: { text: 'Hint' },
        slots: { default: '<button class="button">Trigger</button>' }
      })
      const tooltip = wrapper.find('.cat-tooltip')
      await tooltip.trigger('pointerenter')
      await wrapper.vm.$nextTick()

      await tooltip.trigger('keydown', { key: 'Escape' })
      expect(hideCalls).toBe(1)
      expect(tooltip.classes()).not.toContain('is-visible')
      wrapper.unmount()
    })

    // The bubble moved to another side whenever it ran near an edge along its
    // own side, so a top tooltip on a button at the window's left opened to
    // the right, over the next button.
    describe('placement', () => {
      it('keeps a top bubble on top beside the left edge, sliding it and its arrow', async () => {
        const { wrapper, root, bubble } = await showAt('top', box(10, 300, 40, 30))
        expect(root.classes()).toContain('is-tooltip-top')
        expect(bubble.style.left).toBe('4px')
        expect(bubble.style.top).toBe('252px') // trigger.top - offset 8 - height 40
        expect(bubble.style.getPropertyValue('--cat-tooltip-arrow-pos')).toBe('26px') // trigger center (30) - left
        wrapper.unmount()
      })

      it('keeps a top bubble on top with just enough room above', async () => {
        const { wrapper, root, bubble } = await showAt('top', box(500, 52, 40, 30))
        expect(root.classes()).toContain('is-tooltip-top')
        expect(bubble.style.top).toBe('4px')
        wrapper.unmount()
      })

      it('moves a top bubble below when it does not fit above and there is more room below', async () => {
        const { wrapper, root, bubble } = await showAt('top', box(500, 30, 40, 30))
        expect(root.classes()).toContain('is-tooltip-bottom')
        expect(bubble.style.top).toBe('68px') // trigger.bottom + offset 8
        wrapper.unmount()
      })

      // The arrow's side comes from the class, so a bubble that went back to
      // its own side on hide pointed its arrow away from the trigger while it
      // faded out.
      it('keeps a moved bubble on its side while it hides', async () => {
        const { wrapper, root } = await showAt('top', box(500, 30, 40, 30))
        await root.trigger('keydown', { key: 'Escape' })
        expect(root.classes()).not.toContain('is-visible')
        expect(root.classes()).toContain('is-tooltip-bottom')
        wrapper.unmount()
      })

      it('returns a moved bubble to its own side once it fits there again', async () => {
        const { wrapper, root } = await showAt('top', box(500, 30, 40, 30))
        await root.trigger('keydown', { key: 'Escape' })
        root.element.getBoundingClientRect = () => box(500, 300, 40, 30)
        await root.trigger('pointerenter')
        await wrapper.vm.$nextTick()
        await new Promise(resolve => requestAnimationFrame(resolve))
        expect(root.classes()).toContain('is-tooltip-top')
        wrapper.unmount()
      })

      it('keeps a right bubble on the right beside the top edge, sliding it down', async () => {
        const { wrapper, root, bubble } = await showAt('right', box(500, 0, 40, 20))
        expect(root.classes()).toContain('is-tooltip-right')
        expect(bubble.style.left).toBe('548px') // trigger.right + offset 8
        expect(bubble.style.top).toBe('4px')
        // The trigger's center is 6px down the bubble; the arrow stays off its corner.
        expect(bubble.style.getPropertyValue('--cat-tooltip-arrow-pos')).toBe('12px')
        wrapper.unmount()
      })

      // The shared placement positioned a bubble for a height capped at its
      // side's room, a cap the tooltip never applies, so a bubble too tall for
      // either side ran off the window.
      it('keeps a bubble too tall for either side in the window, over its trigger', async () => {
        // 288px of room above the trigger and 426px below, for a 500px bubble.
        const { wrapper, root, bubble } = await showAt('top', box(500, 300, 40, 30), { width: 300, height: 500 })
        expect(root.classes()).toContain('is-tooltip-bottom')
        expect(bubble.style.top).toBe('264px') // window height 768 - height 500 - margin 4
        expect(bubble.style.maxHeight).toBe('')
        wrapper.unmount()
      })

      it('follows its trigger as the page scrolls', async () => {
        const { wrapper, root, bubble } = await showAt('top', box(500, 300, 40, 30))
        expect(bubble.style.top).toBe('252px')
        root.element.getBoundingClientRect = () => box(500, 200, 40, 30)
        window.dispatchEvent(new Event('scroll'))
        await new Promise(resolve => requestAnimationFrame(resolve))
        expect(bubble.style.top).toBe('152px')
        wrapper.unmount()
      })

      // A placement still pending when the bubble hid landed anyway, moving
      // the side of a bubble already fading out.
      it('drops a placement still pending when the bubble hides', async () => {
        const wrapper = mount(CatTooltip, {
          attachTo: document.body,
          props: { text: 'Hint', position: 'top' },
          slots: { default: '<button class="button">Trigger</button>' }
        })
        const root = wrapper.find('.cat-tooltip')
        const bubble = wrapper.find('[role="tooltip"]').element as HTMLElement
        root.element.getBoundingClientRect = () => box(500, 30, 40, 30)
        bubble.getBoundingClientRect = () => box(0, 0, 200, 40)
        // The placement is queued during the render that follows the show.
        // Vue's nextTick resumes as that render ends, ahead of the placement;
        // awaiting VTU's async trigger would resume too late.
        root.trigger('focusin')
        await nextTick()
        await root.trigger('focusout')
        await new Promise(resolve => requestAnimationFrame(resolve))
        expect(root.classes()).toContain('is-tooltip-top')
        expect(bubble.style.top).toBe('')
        wrapper.unmount()
      })
    })
  })

  it('slides a fallback bubble along its side when the Popover API is unsupported', async () => {
    const { wrapper, root, bubble } = await showAt('top', box(10, 300, 40, 30))
    expect(root.classes()).toContain('is-tooltip-top')
    // Centered by CSS at 30 - 100 = -70; held 4px from the edge.
    expect(bubble.style.getPropertyValue('--cat-tooltip-slide')).toBe('74px')
    expect(bubble.style.left).toBe('')
    wrapper.unmount()
  })

  describe('disabled triggers', () => {
    // Explaining why an action is unavailable is the commonest reason to wrap
    // a disabled control. Treating it as the tab stop made the tooltip
    // unreachable by keyboard: the wrapper skipped its own tabindex and hung
    // aria-describedby on an element that is not in the tab order.
    it.each([
      ['the disabled attribute', '<button disabled>Delete</button>'],
      ['an ancestor fieldset', '<fieldset disabled><button>Save</button></fieldset>'],
      // A disabled control with an explicit tabindex would otherwise slip
      // through the trailing [tabindex] clause and re-create the bug.
      ['disabled plus an explicit tabindex', '<button disabled tabindex="0">Delete</button>']
    ])('makes the wrapper the tab stop when the control is disabled by %s', async (_label, slot) => {
      const wrapper = mount(CatTooltip, {
        attachTo: document.body,
        props: { text: 'Needs an admin role' },
        slots: { default: slot }
      })
      await wrapper.vm.$nextTick()
      const root = wrapper.find('.cat-tooltip')
      expect(root.attributes('tabindex')).toBe('0')
      expect(root.attributes('aria-describedby')).toBeDefined()
      // The describedby is applied to the DOM directly, so this assertion is
      // what actually discriminates: hanging it on an unreachable control is
      // the bug.
      expect(wrapper.find('button').attributes('aria-describedby')).toBeUndefined()
      wrapper.unmount()
    })

    it('still defers to an enabled control in the slot', async () => {
      const wrapper = mount(CatTooltip, {
        attachTo: document.body,
        props: { text: 'Save your work' },
        slots: { default: '<button>Save</button>' }
      })
      // aria-describedby is applied programmatically after mount.
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.cat-tooltip').attributes('tabindex')).toBeUndefined()
      expect(wrapper.find('button').attributes('aria-describedby')).toBeDefined()
      wrapper.unmount()
    })
  })

  describe('hover content and dismissal (WCAG 1.4.13)', () => {
    // The bubble sat behind pointer-events: none, so any move toward it fired
    // pointerleave on the wrapper and dismissed it — a user magnifying the page
    // or selecting a long tooltip's text could never reach it.
    it('stays open when the pointer moves onto the bubble', async () => {
      const wrapper = mount(CatTooltip, {
        attachTo: document.body,
        props: { text: 'A long hint worth selecting' },
        slots: { default: '<button class="button">Trigger</button>' }
      })
      const tooltip = wrapper.find('.cat-tooltip')
      await tooltip.trigger('pointerenter')
      expect(tooltip.classes()).toContain('is-visible')

      // relatedTarget is the bubble, which is a DOM child of the wrapper even
      // when rendered in the top layer.
      await tooltip.trigger('pointerleave', { relatedTarget: wrapper.find('[role="tooltip"]').element })
      await new Promise(resolve => setTimeout(resolve, 250))
      expect(tooltip.classes()).toContain('is-visible')
      wrapper.unmount()
    })

    // Making the bubble hoverable moved the dismissal boundary: the wrapper's
    // pointerleave fires when the pointer crosses onto the bubble, so nothing
    // was left to dismiss it once the pointer left the bubble again. With 129
    // call sites across the consumer apps, mostly icons in dense tables, a
    // tooltip stuck open would be worse than the bug being fixed.
    it('dismisses once the pointer leaves the bubble itself', async () => {
      const wrapper = mount(CatTooltip, {
        attachTo: document.body,
        props: { text: 'Hint' },
        slots: { default: '<button class="button">Trigger</button>' }
      })
      const tooltip = wrapper.find('.cat-tooltip')
      const bubble = wrapper.find('[role="tooltip"]')
      await tooltip.trigger('pointerenter')
      await tooltip.trigger('pointerleave', { relatedTarget: bubble.element })
      await bubble.trigger('pointerenter')
      expect(tooltip.classes()).toContain('is-visible')

      await bubble.trigger('pointerleave', { relatedTarget: document.body })
      await new Promise(resolve => setTimeout(resolve, 250))
      expect(tooltip.classes()).not.toContain('is-visible')
      wrapper.unmount()
    })

    it('keeps the bubble up when the pointer returns from it to the trigger', async () => {
      const wrapper = mount(CatTooltip, {
        attachTo: document.body,
        props: { text: 'Hint' },
        slots: { default: '<button class="button">Trigger</button>' }
      })
      const tooltip = wrapper.find('.cat-tooltip')
      const bubble = wrapper.find('[role="tooltip"]')
      await tooltip.trigger('pointerenter')
      await bubble.trigger('pointerleave', { relatedTarget: wrapper.find('button').element })
      await new Promise(resolve => setTimeout(resolve, 250))
      expect(tooltip.classes()).toContain('is-visible')
      wrapper.unmount()
    })

    // Escape was bound on the wrapper, so it only fired with focus inside. A
    // tooltip opened by hover while focus sat elsewhere could only be
    // dismissed by moving the pointer, which 1.4.13 says must not be required.
    it('dismisses on Escape while focus is elsewhere', async () => {
      const outside = document.createElement('button')
      document.body.appendChild(outside)
      const wrapper = mount(CatTooltip, {
        attachTo: document.body,
        props: { text: 'Hint' },
        slots: { default: '<span>plain text</span>' }
      })
      const tooltip = wrapper.find('.cat-tooltip')
      await tooltip.trigger('pointerenter')
      expect(tooltip.classes()).toContain('is-visible')

      outside.focus()
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await wrapper.vm.$nextTick()
      expect(tooltip.classes()).not.toContain('is-visible')
      wrapper.unmount()
      outside.remove()
    })

    // Going through the shared dismiss stack means the keypress is consumed,
    // so an enclosing modal does not close in the same press.
    it('consumes the Escape it handles', async () => {
      const wrapper = mount(CatTooltip, {
        attachTo: document.body,
        props: { text: 'Hint' },
        slots: { default: '<span>plain text</span>' }
      })
      await wrapper.find('.cat-tooltip').trigger('pointerenter')

      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      document.dispatchEvent(event)
      await wrapper.vm.$nextTick()
      expect(event.defaultPrevented).toBe(true)
      wrapper.unmount()
    })

    // The wrapper takes a tabindex when the slot has none, so a click focused
    // it and the bubble outlived the pointer that summoned it.
    it('does not leave the bubble up after a click', async () => {
      const wrapper = mount(CatTooltip, {
        attachTo: document.body,
        props: { text: 'Hint' },
        slots: { default: '<span>plain text</span>' }
      })
      const tooltip = wrapper.find('.cat-tooltip')
      await tooltip.trigger('pointerdown')
      await tooltip.trigger('pointerenter')
      ;(tooltip.element as HTMLElement).focus()
      await tooltip.trigger('focusin')
      expect(tooltip.classes()).toContain('is-visible')

      await tooltip.trigger('pointerleave')
      await new Promise(resolve => setTimeout(resolve, 250))
      expect(tooltip.classes()).not.toContain('is-visible')
      wrapper.unmount()
    })

    // The bubble is inside the wrapper and is a pointer target now, so a
    // pointerdown on it reached the wrapper's handler and re-labelled a
    // keyboard-driven focus as pointer-driven — the tooltip then dismissed on
    // the next pointerleave despite the trigger still holding focus.
    it('does not treat a press on the bubble as pointer-driven focus', async () => {
      const wrapper = mount(CatTooltip, {
        attachTo: document.body,
        props: { text: 'Selectable hint text' },
        slots: { default: '<span>plain text</span>' }
      })
      const tooltip = wrapper.find('.cat-tooltip')
      ;(tooltip.element as HTMLElement).focus()
      await tooltip.trigger('focusin')
      expect(tooltip.classes()).toContain('is-visible')

      // Select text in the bubble, then move the pointer away.
      await wrapper.find('[role="tooltip"]').trigger('pointerdown')
      await tooltip.trigger('pointerleave')
      await new Promise(resolve => setTimeout(resolve, 250))
      expect(tooltip.classes()).toContain('is-visible')
      wrapper.unmount()
    })

    // Latching the pointer flag on pointerdown was only correct if every press
    // moves focus into the wrapper. Safari and Firefox do not focus a button on
    // click, and touch taps and right-clicks do not either — the flag then had
    // nothing to clear it and the tooltip stopped appearing on keyboard focus
    // for the rest of the component's life.
    it('still shows on keyboard focus after a press that never moved focus', async () => {
      const wrapper = mount(CatTooltip, {
        attachTo: document.body,
        props: { text: 'Hint' },
        slots: { default: '<button class="button">Trigger</button>' }
      })
      const tooltip = wrapper.find('.cat-tooltip')
      await tooltip.trigger('pointerdown')
      await tooltip.trigger('pointerenter')
      await tooltip.trigger('pointerleave')
      await new Promise(resolve => setTimeout(resolve, 350))
      expect(tooltip.classes()).not.toContain('is-visible')

      ;(wrapper.find('button').element as HTMLElement).focus()
      await tooltip.trigger('focusin')
      expect(tooltip.classes()).toContain('is-visible')
      wrapper.unmount()
    })

    // Pressing the bubble blurs the focused trigger and the new focus target is
    // outside the wrapper, so focusout fired mid-selection and dismissed the
    // very content the hoverable bubble exists to let people read.
    it('survives a press on the bubble that blurs the trigger', async () => {
      const wrapper = mount(CatTooltip, {
        attachTo: document.body,
        props: { text: 'A long hint worth selecting' },
        slots: { default: '<button class="button">Trigger</button>' }
      })
      const tooltip = wrapper.find('.cat-tooltip')
      const bubble = wrapper.find('[role="tooltip"]')
      ;(wrapper.find('button').element as HTMLElement).focus()
      await tooltip.trigger('focusin')
      expect(tooltip.classes()).toContain('is-visible')

      // A real press on the bubble blurs the button, so focus genuinely leaves
      // the wrapper — triggering focusout synthetically while activeElement
      // stayed on the button would not reproduce the bug.
      await bubble.trigger('pointerenter')
      await bubble.trigger('pointerdown')
      ;(wrapper.find('button').element as HTMLElement).blur()
      await wrapper.vm.$nextTick()
      expect(tooltip.classes()).toContain('is-visible')

      // Leaving the bubble still dismisses.
      await bubble.trigger('pointerleave', { relatedTarget: document.body })
      await new Promise(resolve => setTimeout(resolve, 250))
      expect(tooltip.classes()).not.toContain('is-visible')
      wrapper.unmount()
    })

    it('still keeps the bubble up for keyboard focus when the pointer leaves', async () => {
      const wrapper = mount(CatTooltip, {
        attachTo: document.body,
        props: { text: 'Hint' },
        slots: { default: '<span>plain text</span>' }
      })
      const tooltip = wrapper.find('.cat-tooltip')
      ;(tooltip.element as HTMLElement).focus()
      await tooltip.trigger('focusin')
      expect(tooltip.classes()).toContain('is-visible')

      await tooltip.trigger('pointerleave')
      await new Promise(resolve => setTimeout(resolve, 250))
      expect(tooltip.classes()).toContain('is-visible')
      wrapper.unmount()
    })
  })

  // A tap has no hover to end, so a bubble opened by one stayed up until the
  // next tap somewhere else.
  describe('touch', () => {
    it('shows nothing for a tap', async () => {
      const wrapper = mount(CatTooltip, {
        attachTo: document.body,
        props: { text: 'Hint' },
        slots: { default: '<button class="button">Trigger</button>' }
      })
      const tooltip = wrapper.find('.cat-tooltip')
      // A tap in the order a browser sends it: pointer events marked touch,
      // then the compatibility mouse events, as focus moves to the button.
      await tooltip.trigger('pointerenter', { pointerType: 'touch' })
      await tooltip.trigger('pointerdown', { pointerType: 'touch' })
      await tooltip.trigger('pointerleave', { pointerType: 'touch' })
      await tooltip.trigger('mouseenter')
      ;(wrapper.find('button').element as HTMLElement).focus()
      await tooltip.trigger('focusin')
      expect(tooltip.classes()).not.toContain('is-visible')
      wrapper.unmount()
    })

    it('shows on hover from a mouse or a pen', async () => {
      for (const pointerType of ['mouse', 'pen']) {
        const wrapper = mount(CatTooltip, {
          attachTo: document.body,
          props: { text: 'Hint' },
          slots: { default: '<button class="button">Trigger</button>' }
        })
        const tooltip = wrapper.find('.cat-tooltip')
        await tooltip.trigger('pointerenter', { pointerType })
        expect(tooltip.classes()).toContain('is-visible')
        wrapper.unmount()
      }
    })
  })

  describe('affordance and motion', () => {
    it('marks the trigger only when affordance is set', () => {
      const off = mount(CatTooltip, { props: { text: 'Hint' }, slots: { default: '<span>x</span>' } })
      expect(off.find('.cat-tooltip').classes()).not.toContain('cat-tooltip-affordance')
      off.unmount()

      const on = mount(CatTooltip, { props: { text: 'Hint', affordance: true }, slots: { default: '<span>x</span>' } })
      expect(on.find('.cat-tooltip').classes()).toContain('cat-tooltip-affordance')
      on.unmount()
    })

    it('animates by default and can be turned off', () => {
      const animated = mount(CatTooltip, { props: { text: 'Hint' }, slots: { default: '<span>x</span>' } })
      expect(animated.find('.cat-tooltip').classes()).not.toContain('cat-tooltip-static')
      animated.unmount()

      const still = mount(CatTooltip, { props: { text: 'Hint', animated: false }, slots: { default: '<span>x</span>' } })
      expect(still.find('.cat-tooltip').classes()).toContain('cat-tooltip-static')
      still.unmount()
    })
  })
})
