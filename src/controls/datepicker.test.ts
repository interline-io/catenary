import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import CatDatepicker from './datepicker.vue'
import { FieldIdKey } from './types'
import { expectNoAxeViolations } from '../testutil/component-helpers'

function calendarOpen (wrapper: { find: (s: string) => { classes: () => string[] } }): boolean {
  return wrapper.find('.cat-datepicker-dropdown').classes().includes('is-active')
}

function lastEmitted (wrapper: { emitted: (e: string) => unknown[][] | undefined }, event: string): unknown[] | undefined {
  const all = wrapper.emitted(event)
  return all ? all[all.length - 1] : undefined
}

// The datepicker implements the WAI-ARIA date picker dialog pattern as a
// standalone component: a typeable input plus a toggle button that opens a
// role="dialog" calendar. These tests pin the trigger semantics and the
// invalid-ARIA regressions that motivated the rewrite (the calendar used to
// render inside a cat-dropdown role="menu" container, and the month/year
// selects inherited the wrapping cat-field's input id).
describe('cat-datepicker trigger and popup semantics', () => {
  it('renders a toggle button with dialog popup semantics wired to the calendar', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15) }
    })

    const toggle = wrapper.find('.cat-datepicker-toggle')
    expect(toggle.attributes('aria-haspopup')).toBe('dialog')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(toggle.attributes('aria-label')).toBe('Choose date, 2025-03-15')

    const dialog = wrapper.find('.cat-datepicker-calendar')
    expect(toggle.attributes('aria-controls')).toBe(dialog.attributes('id'))

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(calendarOpen(wrapper)).toBe(true)

    wrapper.unmount()
  })

  it('does not nest the calendar dialog inside a role="menu" or role="listbox" container', () => {
    const wrapper = mount(CatDatepicker, { attachTo: document.body })
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    expect(wrapper.find('.cat-datepicker-calendar').attributes('role')).toBe('dialog')
    wrapper.unmount()
  })

  it('keeps the field id on the input and gives the month/year selects their own ids and labels', () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      global: { provide: { [FieldIdKey as symbol]: 'field-1' } }
    })

    expect(wrapper.find('input').attributes('id')).toBe('field-1')

    const selects = wrapper.findAll('select')
    expect(selects.length).toBe(2)
    expect(selects[0]!.attributes('id')).not.toBe('field-1')
    expect(selects[1]!.attributes('id')).not.toBe('field-1')
    expect(selects[0]!.attributes('id')).not.toBe(selects[1]!.attributes('id'))
    expect(selects[0]!.attributes('aria-label')).toBe('Select month')
    expect(selects[1]!.attributes('aria-label')).toBe('Select year')

    wrapper.unmount()
  })

  it('describes the input with a date format hint', () => {
    const wrapper = mount(CatDatepicker, { attachTo: document.body })
    const input = wrapper.find('input')
    const hintId = input.attributes('aria-describedby')
    expect(hintId).toBeTruthy()
    const hint = wrapper.find(`[id="${hintId}"]`)
    expect(hint.text()).toContain('YYYY-MM-DD')
    wrapper.unmount()
  })

  it('moves focus into the grid when the calendar opens, and back to the toggle on Escape', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15) }
    })

    await wrapper.find('.cat-datepicker-toggle').trigger('click')
    await nextTick()
    expect((document.activeElement as HTMLElement)?.getAttribute('data-date')).toBe('2025-03-15')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    await nextTick()
    expect(calendarOpen(wrapper)).toBe(false)
    expect(document.activeElement).toBe(wrapper.find('.cat-datepicker-toggle').element)

    wrapper.unmount()
  })

  it('has no axe violations with the calendar open', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15), ariaLabel: 'Start date' }
    })
    await wrapper.find('.cat-datepicker-toggle').trigger('click')
    await nextTick()
    await expectNoAxeViolations(wrapper as any)
    wrapper.unmount()
  })
})

describe('cat-datepicker typed input', () => {
  it('commits a typed date on Enter', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15) }
    })

    const input = wrapper.find('input')
    await input.setValue('2025-04-20')
    await input.trigger('keydown.enter')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    const lastValue = emitted![emitted!.length - 1]![0] as Date
    expect(lastValue.getFullYear()).toBe(2025)
    expect(lastValue.getMonth()).toBe(3) // April
    expect(lastValue.getDate()).toBe(20)

    wrapper.unmount()
  })

  it('commits a typed date when focus leaves the input', async () => {
    const wrapper = mount(CatDatepicker, { attachTo: document.body })

    const input = wrapper.find('input')
    await input.setValue('2025-04-20')
    await input.trigger('focusout')

    expect(lastEmitted(wrapper, 'update:dateString')).toEqual(['2025-04-20'])
    wrapper.unmount()
  })

  it('reverts text that does not parse', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15) }
    })

    const input = wrapper.find('input')
    await input.setValue('not a date')
    await input.trigger('focusout')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect((input.element as HTMLInputElement).value).toBe('2025-03-15')
    wrapper.unmount()
  })

  it('announces commits and reverts through a status region', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15) }
    })
    const status = wrapper.find('[role="status"]')
    expect(status.text()).toBe('')

    const input = wrapper.find('input')
    await input.setValue('2025-04-20')
    await input.trigger('keydown.enter')
    await nextTick()
    expect(status.text()).toBe('Date set to 2025-04-20')

    await input.setValue('garbage')
    await input.trigger('focusout')
    await nextTick()
    expect(status.text()).toBe('Invalid date, reverted to 2025-03-15')

    wrapper.unmount()
  })

  it('emits typed dates outside minDate/maxDate so consumers can validate', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: {
        modelValue: new Date(2025, 2, 15),
        minDate: new Date(2025, 2, 1),
        maxDate: new Date(2025, 2, 31)
      }
    })

    const input = wrapper.find('input')
    await input.setValue('2020-01-01')
    await input.trigger('keydown.enter')

    expect(lastEmitted(wrapper, 'update:dateString')).toEqual(['2020-01-01'])
    wrapper.unmount()
  })

  it('commits a comma-separated list in multiple mode', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { multiple: true, modelValue: [] as Date[] }
    })

    const input = wrapper.find('input')
    await input.setValue('2025-03-15, 2025-03-20')
    await input.trigger('keydown.enter')

    expect(lastEmitted(wrapper, 'update:dateString')).toEqual([['2025-03-15', '2025-03-20']])
    wrapper.unmount()
  })

  it('uses dateFormat for display and typed parsing while keeping date-string as YYYY-MM-DD', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15), dateFormat: 'MM/dd/yyyy' }
    })

    const input = wrapper.find('input')
    expect((input.element as HTMLInputElement).value).toBe('03/15/2025')

    await input.setValue('04/20/2025')
    await input.trigger('keydown.enter')
    expect(lastEmitted(wrapper, 'update:dateString')).toEqual(['2025-04-20'])

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
      // 2025-03-15 is a Saturday, the last day of the Sun-Sat week.
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
      // 2024 is a leap year, so Feb 29 exists.
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
    // Use local getters rather than toISOString: the Date is constructed in
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

  it('structures the grid as a header row of columnheaders plus six week rows of gridcells', () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15) }
    })
    const rows = (wrapper.element as HTMLElement).querySelectorAll('.cat-datepicker-days > [role="row"]')
    // 1 header row + 42 day cells / 7 per row = 7 rows.
    expect(rows.length).toBe(7)
    expect(rows[0]!.querySelectorAll('[role="columnheader"]').length).toBe(7)
    Array.from(rows).slice(1).forEach((row) => {
      const cells = row.querySelectorAll('[role="gridcell"]')
      expect(cells.length).toBe(7)
    })
    wrapper.unmount()
  })

  it('labels each day cell with its full date', () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15) }
    })
    const day = wrapper.find('.cat-datepicker-day[data-date="2025-03-15"]')
    expect(day.attributes('aria-label')).toBe('March 15, 2025')
    wrapper.unmount()
  })

  it('marks today with aria-current="date"', () => {
    const wrapper = mount(CatDatepicker, { attachTo: document.body })
    const todayCells = wrapper.findAll('[aria-current="date"]')
    expect(todayCells.length).toBe(1)
    const now = new Date()
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    expect(todayCells[0]!.attributes('data-date')).toBe(expected)
    wrapper.unmount()
  })

  it('announces month changes through a polite live region', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15) }
    })
    const live = wrapper.find('.cat-datepicker-calendar [aria-live="polite"]')
    expect(live.text()).toBe('March 2025')

    await wrapper.find('[aria-label="Next month"]').trigger('click')
    expect(live.text()).toBe('April 2025')
    wrapper.unmount()
  })
})

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

describe('cat-datepicker close on select', () => {
  it('closes the calendar after selecting a date (closeOnSelect default)', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15) }
    })

    await wrapper.find('.cat-datepicker-toggle').trigger('click')
    expect(calendarOpen(wrapper)).toBe(true)

    await wrapper.find('.cat-datepicker-day[data-date="2025-03-20"]').trigger('click')
    await nextTick()
    expect(calendarOpen(wrapper)).toBe(false)

    wrapper.unmount()
  })

  it('keeps the calendar open on selection when closeOnSelect is false', async () => {
    const wrapper = mount(CatDatepicker, {
      attachTo: document.body,
      props: { modelValue: new Date(2025, 2, 15), closeOnSelect: false }
    })

    await wrapper.find('.cat-datepicker-toggle').trigger('click')
    expect(calendarOpen(wrapper)).toBe(true)

    await wrapper.find('.cat-datepicker-day[data-date="2025-03-20"]').trigger('click')
    await nextTick()
    expect(calendarOpen(wrapper)).toBe(true)

    wrapper.unmount()
  })
})
