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

  it('associates the trigger with the tooltip via aria-describedby', () => {
    const wrapper = mount(CatTooltip, {
      props: { text: 'Save' },
      slots: { default: '<button class="button">Save</button>' }
    })
    const tooltip = wrapper.find('.cat-tooltip')
    const describedby = tooltip.attributes('aria-describedby')
    const tooltipId = wrapper.find('[role="tooltip"]').attributes('id')
    expect(describedby).toBeDefined()
    expect(describedby).toBe(tooltipId)
  })

  it('adds tabindex=0 when the slot has no focusable element', () => {
    const wrapper = mount(CatTooltip, {
      attachTo: document.body,
      props: { text: 'Info' },
      slots: { default: '<span>Plain text</span>' }
    })
    expect(wrapper.find('.cat-tooltip').attributes('tabindex')).toBe('0')
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
