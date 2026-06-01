import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CatDatepicker from './datepicker.vue'

// Light-touch smoke coverage for the a11y additions on cat-datepicker:
// the calendar dialog wrapper exposes role="dialog" + aria-label so screen
// readers announce the popup when it opens.
describe('cat-datepicker a11y', () => {
  it('renders the calendar with role="dialog" and a configurable aria-label', () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { ariaDialogLabel: 'Pick a delivery date' }
    })

    const calendar = wrapper.find('.cat-datepicker-calendar')
    expect(calendar.exists()).toBe(true)
    expect(calendar.attributes('role')).toBe('dialog')
    expect(calendar.attributes('aria-modal')).toBe('false')
    expect(calendar.attributes('aria-label')).toBe('Pick a delivery date')

    wrapper.unmount()
  })

  it('defaults the dialog aria-label to "Choose date"', () => {
    const wrapper = mount(CatDatepicker, { attachTo: document.body })
    expect(wrapper.find('.cat-datepicker-calendar').attributes('aria-label')).toBe('Choose date')
    wrapper.unmount()
  })
})
