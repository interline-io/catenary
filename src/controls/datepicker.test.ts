import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
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

describe('cat-datepicker keyboard grid navigation', () => {
  // VueWrapper<any>['element'] is typed as Element which makes the generic
  // querySelector call look untyped to vue-tsc. Narrow through HTMLElement.
  function findFocusedDay (wrapper: { element: Element }): HTMLButtonElement | null {
    return (wrapper.element as HTMLElement).querySelector<HTMLButtonElement>('.cat-datepicker-day[tabindex="0"]')
  }

  function gridKeydown (wrapper: { element: Element }, key: string, shiftKey = false) {
    const grid = (wrapper.element as HTMLElement).querySelector('.cat-datepicker-days')
    grid?.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }))
    return nextTick()
  }

  it('seeds the roving tabindex from modelValue', () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15) }
    })
    expect(findFocusedDay(wrapper)?.getAttribute('data-date')).toBe('2025-03-15')
    wrapper.unmount()
  })

  it('ArrowRight / ArrowLeft / ArrowDown / ArrowUp move the focused day by one day or one week', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15) }
    })

    await gridKeydown(wrapper, 'ArrowRight')
    expect(findFocusedDay(wrapper)?.getAttribute('data-date')).toBe('2025-03-16')

    await gridKeydown(wrapper, 'ArrowDown')
    expect(findFocusedDay(wrapper)?.getAttribute('data-date')).toBe('2025-03-23')

    await gridKeydown(wrapper, 'ArrowLeft')
    expect(findFocusedDay(wrapper)?.getAttribute('data-date')).toBe('2025-03-22')

    await gridKeydown(wrapper, 'ArrowUp')
    expect(findFocusedDay(wrapper)?.getAttribute('data-date')).toBe('2025-03-15')

    wrapper.unmount()
  })

  it('Home / End move within the current week (using firstDayOfWeek=0 = Sunday)', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      // 2025-03-15 is a Saturday — last day of the Sun-Sat week.
      props: { modelValue: new Date(2025, 2, 15) }
    })

    await gridKeydown(wrapper, 'Home')
    expect(findFocusedDay(wrapper)?.getAttribute('data-date')).toBe('2025-03-09') // Sunday

    await gridKeydown(wrapper, 'End')
    expect(findFocusedDay(wrapper)?.getAttribute('data-date')).toBe('2025-03-15') // Saturday

    wrapper.unmount()
  })

  it('PageDown clamps the day-of-month when the target month is shorter (Jan 31 → Feb 28)', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 0, 31) }
    })

    await gridKeydown(wrapper, 'PageDown')
    expect(findFocusedDay(wrapper)?.getAttribute('data-date')).toBe('2025-02-28')

    wrapper.unmount()
  })

  it('PageUp clamps the day-of-month (Mar 31 → Feb 28)', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 31) }
    })

    await gridKeydown(wrapper, 'PageUp')
    expect(findFocusedDay(wrapper)?.getAttribute('data-date')).toBe('2025-02-28')

    wrapper.unmount()
  })

  it('Shift+PageDown moves to the same date next year (clamping for leap years)', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      // 2024 is a leap year — Feb 29 exists.
      props: { modelValue: new Date(2024, 1, 29) }
    })

    await gridKeydown(wrapper, 'PageDown', true)
    expect(findFocusedDay(wrapper)?.getAttribute('data-date')).toBe('2025-02-28')

    wrapper.unmount()
  })

  it('Enter on a focused day selects that date', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15) }
    })

    await gridKeydown(wrapper, 'ArrowRight')
    await gridKeydown(wrapper, 'Enter')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    const lastValue = emitted![emitted!.length - 1]![0] as Date
    // Use local getters rather than toISOString — the Date is constructed in
    // local time, and toISOString shifts by the timezone offset.
    expect(lastValue.getFullYear()).toBe(2025)
    expect(lastValue.getMonth()).toBe(2) // March
    expect(lastValue.getDate()).toBe(16)

    wrapper.unmount()
  })

  it('clamps the focused day onto a selectable date when the original lands on a disabled one', () => {
    // modelValue points at a date that's blocked via unselectableDates. The
    // focused tab stop should walk forward to the next selectable day in the
    // visible month so the grid always has a focusable tabindex=0 button.
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: {
        modelValue: new Date(2025, 2, 15),
        unselectableDates: [new Date(2025, 2, 15), new Date(2025, 2, 16)]
      }
    })
    const focused = findFocusedDay(wrapper)
    expect(focused).not.toBeNull()
    expect(focused!.disabled).toBe(false)
    expect(focused?.getAttribute('data-date')).toBe('2025-03-17')
    wrapper.unmount()
  })

  it('skips past disabled days in the direction of travel on arrow keys', async () => {
    // ArrowRight from March 15 lands on March 17 because March 16 is blocked.
    // Without the directional skip, focus would land on the disabled button
    // (which can't actually be focused) and break the roving tabindex.
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: {
        modelValue: new Date(2025, 2, 15),
        unselectableDates: [new Date(2025, 2, 16)]
      }
    })

    await gridKeydown(wrapper, 'ArrowRight')
    expect(findFocusedDay(wrapper)?.getAttribute('data-date')).toBe('2025-03-17')
    wrapper.unmount()
  })

  it('groups day cells into rows under role="row" for the WAI-ARIA grid structure', () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15) }
    })
    const rows = (wrapper.element as HTMLElement).querySelectorAll('.cat-datepicker-days > [role="row"]')
    // 42 day cells / 7 per row = 6 rows.
    expect(rows.length).toBe(6)
    rows.forEach((row) => {
      const cells = row.querySelectorAll('[role="gridcell"]')
      expect(cells.length).toBe(7)
    })
    wrapper.unmount()
  })
})

// Open state lives in the wrapping cat-dropdown; the datepicker must drive it
// through dropdown.close(), not the dropdown's selection model-value. These
// guard against regressing to a calendar that won't dismiss on selection.
describe('cat-datepicker close on select', () => {
  function dropdownOpen (wrapper: { find: (s: string) => { classes: () => string[] } }): boolean {
    return wrapper.find('.dropdown.cat-dropdown').classes().includes('is-active')
  }

  it('closes the calendar after selecting a date (closeOnSelect default)', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15) }
    })

    await wrapper.find('.dropdown-trigger').trigger('click')
    expect(dropdownOpen(wrapper)).toBe(true)

    await wrapper.find('.cat-datepicker-day[data-date="2025-03-20"]').trigger('click')
    await nextTick()
    expect(dropdownOpen(wrapper)).toBe(false)

    wrapper.unmount()
  })

  it('keeps the calendar open on selection when closeOnSelect is false', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15), closeOnSelect: false }
    })

    await wrapper.find('.dropdown-trigger').trigger('click')
    expect(dropdownOpen(wrapper)).toBe(true)

    await wrapper.find('.cat-datepicker-day[data-date="2025-03-20"]').trigger('click')
    await nextTick()
    expect(dropdownOpen(wrapper)).toBe(true)

    wrapper.unmount()
  })
})
