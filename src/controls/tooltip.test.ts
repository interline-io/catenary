import { describe, it, expect } from 'vitest'
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
})
