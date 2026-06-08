<template>
  <div class="control cat-control">
    <cat-dropdown
      ref="dropdownRef"
      :position="position"
      class="cat-datepicker-dropdown"
    >
      <template #trigger>
        <cat-input
          ref="inputRef"
          :model-value="formattedValue"
          :placeholder="placeholder"
          :icon="icon"
          :icon-right="iconRight"
          :icon-right-clickable="iconRightClickable"
          :size="size"
          :variant="variant"
          :disabled="disabled"
          :readonly="readonly"
          :rounded="rounded"
          expanded
          @update:model-value="handleInputChange"
          @icon-right-click="$emit('icon-right-click', $event)"
        />
      </template>

      <div
        class="cat-datepicker-calendar"
        role="dialog"
        aria-modal="false"
        :aria-label="ariaDialogLabel"
      >
        <header class="cat-datepicker-header">
          <button
            type="button"
            class="button is-small"
            :aria-label="ariaPreviousLabel"
            @click="previousMonth"
          >
            <span class="icon">
              <i :class="`mdi mdi-${iconPrev}`" />
            </span>
          </button>

          <div class="cat-datepicker-selects">
            <cat-select
              v-model:model-value="focusedMonth as any"
              size="small"
            >
              <option
                v-for="(month, index) in monthNames"
                :key="index"
                :value="index"
              >
                {{ month }}
              </option>
            </cat-select>

            <cat-select
              v-model:model-value="focusedYear as any"
              size="small"
            >
              <option
                v-for="year in availableYears"
                :key="year"
                :value="year"
              >
                {{ year }}
              </option>
            </cat-select>
          </div>

          <button
            type="button"
            class="button is-small"
            :aria-label="ariaNextLabel"
            @click="nextMonth"
          >
            <span class="icon">
              <i :class="`mdi mdi-${iconNext}`" />
            </span>
          </button>
        </header>

        <div class="cat-datepicker-body">
          <div class="cat-datepicker-weekdays">
            <div
              v-for="day in dayNames"
              :key="day"
              class="cat-datepicker-weekday"
            >
              {{ day }}
            </div>
          </div>

          <div
            ref="daysGridRef"
            class="cat-datepicker-days"
            role="grid"
            tabindex="-1"
            :aria-label="visibleMonthLabel"
            @keydown="handleGridKeydown"
          >
            <!-- Days grouped into week rows per the WAI-ARIA grid structure
                 (gridcells must be owned by a row). display: contents on the
                 row keeps the existing CSS grid layout unchanged. -->
            <div
              v-for="(week, wi) in calendarWeeks"
              :key="wi"
              role="row"
              class="cat-datepicker-row"
            >
              <button
                v-for="day in week"
                :key="`${day.date.getTime()}`"
                type="button"
                role="gridcell"
                class="cat-datepicker-day"
                :class="getDayClasses(day)"
                :disabled="!day.selectable"
                :tabindex="isSameDay(day.date, focusedDate) ? 0 : -1"
                :data-date="formatDate(day.date, DATE_FORMAT)"
                :aria-selected="day.isSelected"
                @click="selectDate(day.date)"
              >
                {{ day.date.getDate() }}
              </button>
            </div>
          </div>
        </div>

        <footer v-if="$slots.footer" class="cat-datepicker-footer">
          <slot name="footer" :close="close" />
        </footer>
      </div>
    </cat-dropdown>
  </div>
</template>

<script setup lang="ts" generic="T extends Date | Date[] = Date, S extends string | string[] = string">
import { ref, computed, watch, nextTick } from 'vue'
import type { InputSize, InputVariant } from './types'
import { format as formatDate, parse, isValid, isSameDay } from 'date-fns'
import CatDropdown from './dropdown.vue'
import CatInput from './input.vue'
import CatSelect from './select.vue'

const DATE_FORMAT = 'yyyy-MM-dd'

function parseDate (dateString: string): Date | null {
  if (!dateString) return null
  const date = parse(dateString, DATE_FORMAT, new Date())
  return isValid(date) ? date : null
}

/**
 * Datepicker component with calendar dropdown for date selection.
 * Supports two model bindings:
 * - `v-model` for Date / Date[] values
 * - `v-model:date-string` for YYYY-MM-DD string / string[] values
 *
 * @component cat-datepicker
 * @example
 * <cat-datepicker v-model="selectedDate" placeholder="Select date" />
 * <cat-datepicker v-model:date-string="dateStr" placeholder="Select date" />
 * <cat-datepicker v-model="dateRange" multiple placeholder="Select dates" />
 * <cat-datepicker v-model:date-string="dateStrs" multiple placeholder="Select dates" />
 */

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  selectable: boolean
}

const props = withDefaults(defineProps<{
  /** Selected date(s) - use with v-model. Date for single, Date[] for multiple. */
  modelValue?: T
  /** Selected date(s) as YYYY-MM-DD string(s) - use with v-model:date-string. */
  dateString?: S
  /** Allow multiple date selections. @default false */
  multiple?: boolean
  /** Input placeholder text. */
  placeholder?: string
  /** Input size variant. */
  size?: InputSize
  /** Input color variant. */
  variant?: InputVariant
  /** Disable the datepicker. @default false */
  disabled?: boolean
  /** Make input readonly (calendar still accessible). @default false */
  readonly?: boolean
  /** Use rounded input style. @default false */
  rounded?: boolean
  /** Minimum selectable date. */
  minDate?: Date
  /** Maximum selectable date. */
  maxDate?: Date
  /** List of dates that cannot be selected. */
  unselectableDates?: Date[]
  /** List of dates that can be selected (whitelist). */
  selectableDates?: Date[]
  /** Days of week that cannot be selected (0-6, Sunday-Saturday). */
  unselectableDaysOfWeek?: number[]
  /** Custom month names. */
  monthNames?: string[]
  /** Custom day names (short). */
  dayNames?: string[]
  /** First day of week (0-6, Sunday-Saturday). @default 0 */
  firstDayOfWeek?: number
  /** Left icon (MDI icon name without 'mdi-' prefix). @default 'calendar' */
  icon?: string
  /** Right icon (MDI icon name without 'mdi-' prefix). */
  iconRight?: string
  /** Make right icon clickable. @default false */
  iconRightClickable?: boolean
  /** Previous month icon. @default 'chevron-left' */
  iconPrev?: string
  /** Next month icon. @default 'chevron-right' */
  iconNext?: string
  /** Position of the dropdown. @default 'bottom-left' */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  /** Date format for display. @default 'yyyy-MM-dd' */
  dateFormat?: string
  /** Years range for year select [before, after]. @default [-100, 10] */
  yearsRange?: [number, number]
  /** Open dropdown on input focus. @default true */
  openOnFocus?: boolean
  /** Close dropdown on date selection. @default true */
  closeOnSelect?: boolean
  /** Accessibility label for previous button. @default 'Previous month' */
  ariaPreviousLabel?: string
  /** Accessibility label for next button. @default 'Next month' */
  ariaNextLabel?: string
  /** Accessibility label for month select. @default 'Select month' */
  ariaSelectMonthLabel?: string
  /** Accessibility label for year select. @default 'Select year' */
  ariaSelectYearLabel?: string
  /** Accessibility label for the calendar dialog. @default 'Choose date' */
  ariaDialogLabel?: string
}>(), {
  modelValue: undefined,
  dateString: undefined,
  multiple: false,
  placeholder: undefined,
  size: undefined,
  variant: undefined,
  disabled: false,
  readonly: false,
  rounded: false,
  minDate: undefined,
  maxDate: undefined,
  unselectableDates: undefined,
  selectableDates: undefined,
  unselectableDaysOfWeek: undefined,
  monthNames: () => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  dayNames: () => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  firstDayOfWeek: 0,
  icon: 'calendar',
  iconRight: undefined,
  iconRightClickable: false,
  iconPrev: 'chevron-left',
  iconNext: 'chevron-right',
  position: 'bottom-left',
  dateFormat: 'yyyy-MM-dd',
  yearsRange: () => [-100, 10],
  openOnFocus: true,
  closeOnSelect: true,
  ariaPreviousLabel: 'Previous month',
  ariaNextLabel: 'Next month',
  ariaSelectMonthLabel: 'Select month',
  ariaSelectYearLabel: 'Select year',
  ariaDialogLabel: 'Choose date'
})

const emit = defineEmits<{
  'update:modelValue': [value: T]
  'update:dateString': [value: S]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  'icon-right-click': [event: MouseEvent]
  'change-month': [month: number]
  'change-year': [year: number]
}>()

const dropdownRef = ref()
const inputRef = ref()
const daysGridRef = ref<HTMLElement | null>(null)

// Current focused date in calendar
const today = new Date()
const focusedMonth = ref(today.getMonth())
const focusedYear = ref(today.getFullYear())
// The day currently keyboard-focused inside the grid — drives the roving
// tabindex so only one day button is in the tab order at a time. Starts on
// today; updates on grid keydown and when the user clicks a date.
const focusedDate = ref<Date>(today)

// Watch for month/year changes and emit events
watch(focusedMonth, newMonth => emit('change-month', newMonth))
watch(focusedYear, newYear => emit('change-year', newYear))

// Resolve active dates from whichever model is bound.
// Internally the component always works with Date objects.
// Prefers dateString when both are provided.
const activeDates = computed((): Date[] => {
  if (props.dateString != null) {
    const ds = props.dateString
    if (Array.isArray(ds)) {
      return ds.map(s => parseDate(s)).filter((d): d is Date => d != null)
    }
    const parsed = parseDate(ds)
    return parsed ? [parsed] : []
  }
  if (props.modelValue == null) return []
  if (Array.isArray(props.modelValue)) return props.modelValue as Date[]
  return [props.modelValue as Date]
})

// Accessible name for the day grid. The APG date-picker example labels the
// grid with the heading that names the currently-visible month/year; our
// component navigates month/year via selects rather than a heading, so we
// compose the label directly.
const visibleMonthLabel = computed(() => {
  const monthName = props.monthNames[focusedMonth.value] ?? ''
  return `${monthName} ${focusedYear.value}`.trim()
})

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const [before, after] = props.yearsRange
  const years: number[] = []
  for (let i = currentYear + before; i <= currentYear + after; i++) {
    years.push(i)
  }
  return years
})

const formattedValue = computed(() => {
  return activeDates.value.map(d => formatDate(d, DATE_FORMAT)).join(', ')
})

const calendarDays = computed(() => {
  const days: CalendarDay[] = []
  const year = focusedYear.value
  const month = focusedMonth.value

  // First day of the month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Days from previous month
  let startDay = firstDay.getDay() - props.firstDayOfWeek
  if (startDay < 0) startDay += 7

  const prevMonthDays = new Date(year, month, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthDays - i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isSelected: isDateSelected(date),
      selectable: isDateSelectable(date)
    })
  }

  // Days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isSelected: isDateSelected(date),
      selectable: isDateSelectable(date)
    })
  }

  // Days from next month to complete the grid
  const remainingDays = 42 - days.length // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isSelected: isDateSelected(date),
      selectable: isDateSelectable(date)
    })
  }

  return days
})

// Group calendarDays into rows of 7 for the WAI-ARIA grid row structure.
const calendarWeeks = computed(() => {
  const weeks: CalendarDay[][] = []
  const days = calendarDays.value
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
})

function isDateSelected (date: Date): boolean {
  return activeDates.value.some(d => isSameDay(d, date))
}

function isDateSelectable (date: Date): boolean {
  // Check min/max dates
  if (props.minDate && date < props.minDate) return false
  if (props.maxDate && date > props.maxDate) return false

  // Check unselectable days of week
  if (props.unselectableDaysOfWeek?.includes(date.getDay())) return false

  // Check unselectable dates
  if (props.unselectableDates?.some(d => isSameDay(d, date))) return false

  // Check selectable dates (whitelist)
  if (props.selectableDates && !props.selectableDates.some(d => isSameDay(d, date))) return false

  return true
}

function getDayClasses (day: CalendarDay) {
  return {
    'is-today': day.isToday,
    'is-selected': day.isSelected,
    'is-other-month': !day.isCurrentMonth,
    'is-unselectable': !day.selectable
  }
}

function emitDate (date: Date) {
  emit('update:modelValue', date as T)
  emit('update:dateString', formatDate(date, DATE_FORMAT) as S)
}

function emitDates (dates: Date[]) {
  emit('update:modelValue', dates as T)
  emit('update:dateString', dates.map(d => formatDate(d, DATE_FORMAT)) as S)
}

// Shift a date by N months (or years), clamping the day-of-month so e.g.
// Mar 31 + 1 month becomes Apr 30 instead of overflowing to May 1.
// Date#setMonth doesn't clamp, so we compute the target year/month and the
// clamped day-of-month explicitly.
function shiftByMonths (d: Date, deltaMonths: number): Date {
  const totalMonths = d.getFullYear() * 12 + d.getMonth() + deltaMonths
  const targetYear = Math.floor(totalMonths / 12)
  const targetMonth = ((totalMonths % 12) + 12) % 12
  const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate()
  return new Date(targetYear, targetMonth, Math.min(d.getDate(), lastDay))
}

function shiftByYears (d: Date, deltaYears: number): Date {
  return shiftByMonths(d, deltaYears * 12)
}

// Walk day-by-day from `start` in `direction` (+1 or -1) until a selectable
// day is found, or until `maxSteps` is reached. Used by keyboard navigation
// so arrow keys "skip" past disabled days in the direction of travel rather
// than landing on a disabled <button> (which can't receive focus and would
// leave the roving tabindex out of sync with actual focus).
function nextSelectableInDirection (start: Date, direction: 1 | -1, maxSteps: number = 60): Date | null {
  let d = new Date(start)
  for (let i = 0; i < maxSteps; i++) {
    if (isDateSelectable(d)) return d
    d = new Date(d)
    d.setDate(d.getDate() + direction)
  }
  return null
}

// Move keyboard focus to a different day. Switches the visible month/year
// when crossing a boundary so the focused day is rendered, then re-focuses
// the day button after the DOM updates. focusedDate is re-read inside
// nextTick so any clamping done by the focusedMonth/focusedYear watcher is
// reflected in the focus target (and the data-date key is computed fresh).
function focusDay (date: Date): void {
  focusedDate.value = date
  if (date.getMonth() !== focusedMonth.value || date.getFullYear() !== focusedYear.value) {
    focusedMonth.value = date.getMonth()
    focusedYear.value = date.getFullYear()
  }
  nextTick(() => {
    const key = formatDate(focusedDate.value, DATE_FORMAT)
    const btn = daysGridRef.value?.querySelector<HTMLButtonElement>(`[data-date="${key}"]`)
    // Skip when the resolved button is disabled — focusing a disabled element
    // is a no-op and would leave the roving tabindex out of sync with actual
    // focus. The nearestSelectableDate clamping in the watcher should keep
    // focusedDate on a selectable day, but guard anyway.
    if (btn && !btn.disabled) btn.focus()
  })
}

// Date-grid keyboard interactions per the WAI-ARIA grid pattern as used in
// the APG Date Picker Dialog example.
function handleGridKeydown (event: KeyboardEvent): void {
  const current = new Date(focusedDate.value)
  let next: Date | null = null
  let shouldSelect = false
  switch (event.key) {
    case 'ArrowRight':
      next = new Date(current); next.setDate(next.getDate() + 1); break
    case 'ArrowLeft':
      next = new Date(current); next.setDate(next.getDate() - 1); break
    case 'ArrowDown':
      next = new Date(current); next.setDate(next.getDate() + 7); break
    case 'ArrowUp':
      next = new Date(current); next.setDate(next.getDate() - 7); break
    case 'Home': {
      const offset = (current.getDay() - props.firstDayOfWeek + 7) % 7
      next = new Date(current); next.setDate(next.getDate() - offset); break
    }
    case 'End': {
      const offset = (current.getDay() - props.firstDayOfWeek + 7) % 7
      next = new Date(current); next.setDate(next.getDate() + (6 - offset)); break
    }
    case 'PageUp':
      next = event.shiftKey ? shiftByYears(current, -1) : shiftByMonths(current, -1)
      break
    case 'PageDown':
      next = event.shiftKey ? shiftByYears(current, 1) : shiftByMonths(current, 1)
      break
    case 'Enter':
    case ' ':
      // The button's native click also fires for Enter/Space — but we
      // preventDefault on Space here so the page doesn't scroll, then call
      // selectDate explicitly to keep behavior consistent.
      shouldSelect = true
      break
  }
  if (next) {
    event.preventDefault()
    // Skip past disabled days in the direction of travel so focus lands on a
    // selectable button. Direction is inferred from the relative date order;
    // for Home (movement leftward in the week) the direction is -1, for End +1.
    const direction: 1 | -1 = next.getTime() >= current.getTime() ? 1 : -1
    const target = nextSelectableInDirection(next, direction)
    if (target) focusDay(target)
  } else if (shouldSelect) {
    event.preventDefault()
    selectDate(current)
  }
}

function selectDate (date: Date) {
  if (!isDateSelectable(date)) return

  if (props.multiple) {
    const current = [...activeDates.value]
    const index = current.findIndex(d => isSameDay(d, date))
    if (index >= 0) {
      current.splice(index, 1)
    } else {
      current.push(date)
    }
    emitDates(current)
  } else {
    emitDate(date)
    if (props.closeOnSelect) {
      close()
    }
  }
  focusedDate.value = date
}

function handleInputChange (value: string) {
  const date = parseDate(value)
  if (date && isDateSelectable(date)) {
    if (props.multiple) {
      selectDate(date)
    } else {
      emitDate(date)
    }
    focusedMonth.value = date.getMonth()
    focusedYear.value = date.getFullYear()
  }
}

function previousMonth () {
  if (focusedMonth.value === 0) {
    focusedMonth.value = 11
    focusedYear.value--
  } else {
    focusedMonth.value--
  }
}

function nextMonth () {
  if (focusedMonth.value === 11) {
    focusedMonth.value = 0
    focusedYear.value++
  } else {
    focusedMonth.value++
  }
}

function close () {
  // The open state lives in cat-dropdown (its own `isActive`); drive it through
  // the exposed close() rather than the dropdown's selection model-value, which
  // does not control visibility. Without this, closeOnSelect can't actually
  // close the calendar.
  dropdownRef.value?.close()
}

// Walk the visible month looking for a selectable day near `target`. If the
// target itself is selectable, return it. Otherwise sweep forward day-by-day
// to the end of the month, then backward to the start. Returns the original
// date if nothing in the visible month is selectable (the grid will have no
// tabindex=0 button in that pathological case).
function nearestSelectableInMonth (target: Date): Date {
  if (isDateSelectable(target)) return target
  const y = target.getFullYear()
  const m = target.getMonth()
  const lastDay = new Date(y, m + 1, 0).getDate()
  for (let day = target.getDate() + 1; day <= lastDay; day++) {
    const d = new Date(y, m, day)
    if (isDateSelectable(d)) return d
  }
  for (let day = target.getDate() - 1; day >= 1; day--) {
    const d = new Date(y, m, day)
    if (isDateSelectable(d)) return d
  }
  return target
}

// Initialize focused date from the active selection so the calendar opens
// on the right month and the roving tabindex lands on the selected day.
// Runs immediately so the initial render has a valid tab stop in the grid.
watch(activeDates, (dates) => {
  const date = dates[0]
  if (date) {
    focusedMonth.value = date.getMonth()
    focusedYear.value = date.getFullYear()
    focusedDate.value = nearestSelectableInMonth(date)
  } else {
    // No selection: clamp today (or the current focusedDate) onto a selectable
    // day so the tab stop is always focusable. minDate/maxDate or whitelists
    // can otherwise leave today unselectable and the grid with no tab stop.
    focusedDate.value = nearestSelectableInMonth(focusedDate.value)
  }
}, { immediate: true })

// When the visible month/year changes via the header (prev/next buttons or
// month/year selects), keep focusedDate inside the visible month so the grid
// always has exactly one day button in the tab order. Preserves day-of-month
// when possible (clamps to the last day for shorter months), and walks to a
// selectable day so the tab stop is always focusable.
watch([focusedMonth, focusedYear], ([m, y]) => {
  const fd = focusedDate.value
  if (fd.getMonth() === m && fd.getFullYear() === y) return
  const lastDay = new Date(y, m + 1, 0).getDate()
  const target = new Date(y, m, Math.min(fd.getDate(), lastDay))
  focusedDate.value = nearestSelectableInMonth(target)
})

defineExpose({ close, focus: () => inputRef.value?.focus() })
</script>

<style lang="scss" scoped>
.cat-datepicker-calendar {
  min-width: 320px;
  padding: 1rem;
}

.cat-datepicker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.cat-datepicker-selects {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.cat-datepicker-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.cat-datepicker-weekday {
  text-align: center;
  font-size: var(--bulma-size-small);
  font-weight: 600;
  color: var(--bulma-grey);
  padding: 0.5rem 0;
}

.cat-datepicker-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

// Week rows exist for ARIA grid structure (role="row" around gridcells);
// display: contents lets their children participate in the parent's grid
// layout so the visual calendar is unchanged.
.cat-datepicker-row {
  display: contents;
}

.cat-datepicker-day {
  aspect-ratio: 1;
  border: 1px solid var(--bulma-grey-lighter);
  border-radius: var(--bulma-radius);
  background: var(--bulma-white);
  color: var(--bulma-text);
  font-size: var(--bulma-size-normal);
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: var(--bulma-grey-lighter);
    border-color: var(--bulma-grey-light);
  }

  &.is-today {
    border-color: var(--bulma-primary);
    font-weight: 600;
  }

  &.is-selected {
    background: var(--bulma-primary);
    color: var(--bulma-white);
    border-color: var(--bulma-primary);

    &:hover {
      filter: brightness(0.95);
    }
  }

  &.is-other-month {
    color: var(--bulma-grey-light);
  }

  &.is-unselectable,
  &:disabled {
    color: var(--bulma-grey-lighter);
    cursor: not-allowed;
    opacity: 0.5;

    &:hover {
      background: var(--bulma-white);
      border-color: var(--bulma-grey-lighter);
    }
  }
}

.cat-datepicker-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--bulma-grey-lighter);
}
</style>
