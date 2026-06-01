import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CatFieldset from './fieldset.vue'
import { expectNoAxeViolations } from '../testutil/component-helpers'

describe('cat-fieldset', () => {
  it('renders a fieldset element', () => {
    const wrapper = mount(CatFieldset, {
      props: { label: 'Group' },
      slots: { default: '<input type="text">' }
    })
    expect(wrapper.element.tagName).toBe('FIELDSET')
    expect(wrapper.classes()).toContain('cat-fieldset')
  })

  it('renders a legend when label prop is set', () => {
    const wrapper = mount(CatFieldset, {
      props: { label: 'Favorite colors' },
      slots: { default: '<input type="text">' }
    })
    const legend = wrapper.find('legend')
    expect(legend.exists()).toBe(true)
    expect(legend.text()).toBe('Favorite colors')
  })

  it('renders a legend from the label slot', () => {
    const wrapper = mount(CatFieldset, {
      slots: {
        label: '<span data-testid="legend">Custom</span>',
        default: '<input type="text">'
      }
    })
    const legend = wrapper.find('legend')
    expect(legend.exists()).toBe(true)
    expect(legend.find('[data-testid="legend"]').exists()).toBe(true)
  })

  it('omits the legend when no label is provided', () => {
    const wrapper = mount(CatFieldset, {
      slots: { default: '<input type="text">' }
    })
    expect(wrapper.find('legend').exists()).toBe(false)
  })

  it('applies is-sr-only to the legend when hiddenLegend is true', () => {
    const wrapper = mount(CatFieldset, {
      props: { label: 'Hidden', hiddenLegend: true },
      slots: { default: '<input type="text">' }
    })
    const legend = wrapper.find('legend')
    expect(legend.classes()).toContain('is-sr-only')
  })

  it('renders children inside the fieldset element', () => {
    const wrapper = mount(CatFieldset, {
      props: { label: 'Group' },
      slots: { default: '<input data-testid="nested" type="text">' }
    })
    const nested = wrapper.find('[data-testid="nested"]')
    expect(nested.exists()).toBe(true)
    expect(nested.element.closest('fieldset')).toBe(wrapper.element)
  })

  it('applies the disabled attribute to the native fieldset', () => {
    const wrapper = mount(CatFieldset, {
      props: { label: 'Disabled group', disabled: true },
      slots: { default: '<input type="text">' }
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('is-disabled')
  })

  it('has no axe violations', async () => {
    const wrapper = mount(CatFieldset, {
      attachTo: document.body,
      props: { label: 'Accessible group' },
      slots: { default: '<label>Name<input type="text"></label>' }
    })
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })
})
