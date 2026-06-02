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
  function findDayByDate (wrapper: { element: Element }, date: string): HTMLButtonElement | null {
    return (wrapper.element as HTMLElement).querySelector<HTMLButtonElement>(`[data-date="${date}"]`)
  }

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
    expect(lastValue.toISOString().slice(0, 10)).toBe('2025-03-16')

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

  it('skips the focus update when the resolved day button is disabled', async () => {
    // ArrowRight into an unselectableDate should still update focusedDate
    // (the roving tabindex moves), but focus() must not be called on the
    // disabled button. We exercise the no-op path here.
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: {
        modelValue: new Date(2025, 2, 15),
        unselectableDates: [new Date(2025, 2, 16)]
      }
    })

    await gridKeydown(wrapper, 'ArrowRight')
    const target = findDayByDate(wrapper, '2025-03-16')
    expect(target?.disabled).toBe(true)
    // The roving tab stop should still have moved to the new date in the DOM —
    // tabindex=0 is on March 16 even though focus is not on it.
    expect(findFocusedDay(wrapper)?.getAttribute('data-date')).toBe('2025-03-16')
    wrapper.unmount()
  })
})
