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

      await tooltip.trigger('mouseleave')
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
})
