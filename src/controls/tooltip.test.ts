import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CatTooltip from './tooltip.vue'
import { expectNoAxeViolations } from '../testutil/component-helpers'

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

    await tooltip.trigger('mouseenter')
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
      await tooltip.trigger('mouseenter')
      await wrapper.vm.$nextTick()
      expect(showCalls).toBe(1)

      // mouseleave now schedules the hide rather than doing it immediately,
      // so that crossing the gap onto the bubble does not dismiss it.
      await tooltip.trigger('mouseleave')
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
      await tooltip.trigger('mouseenter')
      await wrapper.vm.$nextTick()

      await tooltip.trigger('keydown', { key: 'Escape' })
      expect(hideCalls).toBe(1)
      expect(tooltip.classes()).not.toContain('is-visible')
      wrapper.unmount()
    })
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
    // mouseleave on the wrapper and dismissed it — a user magnifying the page
    // or selecting a long tooltip's text could never reach it.
    it('stays open when the pointer moves onto the bubble', async () => {
      const wrapper = mount(CatTooltip, {
        attachTo: document.body,
        props: { text: 'A long hint worth selecting' },
        slots: { default: '<button class="button">Trigger</button>' }
      })
      const tooltip = wrapper.find('.cat-tooltip')
      await tooltip.trigger('mouseenter')
      expect(tooltip.classes()).toContain('is-visible')

      // relatedTarget is the bubble, which is a DOM child of the wrapper even
      // when rendered in the top layer.
      await tooltip.trigger('mouseleave', { relatedTarget: wrapper.find('[role="tooltip"]').element })
      await new Promise(resolve => setTimeout(resolve, 250))
      expect(tooltip.classes()).toContain('is-visible')
      wrapper.unmount()
    })

    // Making the bubble hoverable moved the dismissal boundary: the wrapper's
    // mouseleave fires when the pointer crosses onto the bubble, so nothing
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
      await tooltip.trigger('mouseenter')
      await tooltip.trigger('mouseleave', { relatedTarget: bubble.element })
      await bubble.trigger('mouseenter')
      expect(tooltip.classes()).toContain('is-visible')

      await bubble.trigger('mouseleave', { relatedTarget: document.body })
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
      await tooltip.trigger('mouseenter')
      await bubble.trigger('mouseleave', { relatedTarget: wrapper.find('button').element })
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
      await tooltip.trigger('mouseenter')
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
      await wrapper.find('.cat-tooltip').trigger('mouseenter')

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
      await tooltip.trigger('mouseenter')
      ;(tooltip.element as HTMLElement).focus()
      await tooltip.trigger('focusin')
      expect(tooltip.classes()).toContain('is-visible')

      await tooltip.trigger('mouseleave')
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

      await tooltip.trigger('mouseleave')
      await new Promise(resolve => setTimeout(resolve, 250))
      expect(tooltip.classes()).toContain('is-visible')
      wrapper.unmount()
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
