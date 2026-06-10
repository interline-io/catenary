<template>
  <div class="control cat-control">
    <div
      ref="rootRef"
      class="dropdown cat-datepicker-dropdown"
      :class="dropdownClasses"
    >
      <div class="dropdown-trigger cat-datepicker-trigger">
        <span :id="formatHintId" class="is-sr-only">Date format: {{ formatHint }}</span>
        <!-- Confirms typed commits and reverts to screen reader users; a
             silent revert on blur is otherwise undetectable. Rendered from
             mount (initially empty) because live regions inserted at
             announcement time are unreliable. -->
        <span class="is-sr-only" role="status">{{ statusMessage }}</span>
        <div class="field has-addons cat-datepicker-field">
          <cat-input
            ref="inputRef"
            :model-value="inputText"
            :placeholder="placeholder ?? formatHint"
            :icon="icon"
            :icon-right="iconRight"
            :icon-right-clickable="iconRightClickable"
            :size="size"
            :variant="variant"
            :disabled="disabled"
            :readonly="readonly"
            :rounded="rounded"
            :aria-label="ariaLabel"
            :aria-describedby="formatHintId"
            expanded
            @update:model-value="inputText = $event"
            @keydown.enter.prevent="commitTypedInput"
            @focusout="commitTypedInput"
            @icon-right-click="$emit('icon-right-click', $event)"
          />
          <div class="control">
            <button
              ref="toggleRef"
              type="button"
              class="button cat-datepicker-toggle"
              :class="toggleClasses"
              :disabled="disabled"
              aria-haspopup="dialog"
              :aria-expanded="isActive"
              :aria-controls="dialogId"
              :aria-label="toggleAriaLabel"
              @click="toggle"
            >
              <span class="icon">
                <i :class="`mdi mdi-${iconToggle}`" aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Plain positioning wrapper. Bulma dropdown-menu classes are used for
           show/hide and placement only; it deliberately has no ARIA role, so
           the dialog below is the outermost semantic the popup exposes. -->
      <div class="dropdown-menu" @focusout="handleMenuFocusout">
        <div class="dropdown-content">
          <div
            :id="dialogId"
            class="cat-datepicker-calendar"
            role="dialog"
            aria-modal="false"
            :aria-label="ariaDialogLabel"
          >
            <!-- Announces month/year changes from the prev/next buttons and
                 PageUp/PageDown, which are otherwise silent (the selects
                 announce their own value changes). Mirrors the live "Month
                 Year" heading in the APG date picker dialog example. -->
            <p class="is-sr-only" aria-live="polite">
              {{ visibleMonthLabel }}
            </p>
            <header class="cat-datepicker-header">
              <button
                type="button"
                class="button is-small"
                :aria-label="ariaPreviousLabel"
                @click="previousMonth"
              >
                <span class="icon">
                  <i :class="`mdi mdi-${iconPrev}`" aria-hidden="true" />
                </span>
              </button>

              <div class="cat-datepicker-selects">
                <cat-select
                  :id="monthSelectId"
                  v-model:model-value="focusedMonth as any"
                  :aria-label="ariaSelectMonthLabel"
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
                  :id="yearSelectId"
                  v-model:model-value="focusedYear as any"
                  :aria-label="ariaSelectYearLabel"
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
                  <i :class="`mdi mdi-${iconNext}`" aria-hidden="true" />
                </span>
              </button>
            </header>

            <div class="cat-datepicker-body">
              <div
                ref="daysGridRef"
                class="cat-datepicker-days"
                role="grid"
                tabindex="-1"
                :aria-label="visibleMonthLabel"
                @keydown="handleGridKeydown"
              >
                <div role="row" class="cat-datepicker-weekdays">
                  <!-- The short name is hidden from assistive technology and
                       the full name is visually hidden, so sighted users see
                       "Su" while screen readers announce "Sunday" (without
                       reading both). Real text content rather than aria-label
                       keeps the header's name discernible per axe. -->
                  <div
                    v-for="day in weekdayHeaders"
                    :key="day.short"
                    role="columnheader"
                    class="cat-datepicker-weekday"
                  >
                    <span aria-hidden="true">{{ day.short }}</span>
                    <span class="is-sr-only">{{ day.long }}</span>
                  </div>
                </div>

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
                    :aria-label="dayAriaLabel(day)"
                    :aria-selected="day.isSelected"
                    :aria-current="day.isToday ? 'date' : undefined"
                    @click="selectDate(day.date)"
                  >
                    <!-- Hidden from assistive technology: the full-date
                         aria-label already names the cell, and VoiceOver
                         otherwise announces both ("June 15, 2026 15"). -->
                    <span aria-hidden="true">{{ day.date.getDate() }}</span>
                  </button>
                </div>
              </div>
            </div>

            <footer v-if="$slots.footer" class="cat-datepicker-footer">
              <!-- Wrapped so the slot prop is argument-free: consumers commonly
                   bind it straight to @click, and a MouseEvent must not leak
                   into close()'s returnFocus parameter. -->
              <slot name="footer" :close="() => close()" />
            </footer>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Date | Date[] = Date, S extends string | string[] = string">
import { ref, computed, watch, nextTick, useId } from 'vue'
import type { InputSize, InputVariant } from './types'
import { format as formatDate, parse, isValid, isSameDay } from 'date-fns'
import CatInput from './input.vue'
import CatSelect from './select.vue'
import { useDismissablePopup } from '../util/dismissable-popup'

const DATE_FORMAT = 'yyyy-MM-dd'

/**
 * Datepicker following the WAI-ARIA date picker dialog pattern: a typeable
 * text input paired with a "choose date" toggle button that opens a calendar
 * `role="dialog"` popup.
 *
 * Typed dates are committed on Enter or when focus leaves the input; text
 * that doesn't parse with `dateFormat` reverts to the current selection.
 * Typed dates are emitted even when they fall outside `minDate`/`maxDate` or
 * the other selectable-date constraints, so consumers can show their own
 * validation messaging; the constraints restrict calendar selection only.
 *
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
  /** Input placeholder text. Defaults to the date format hint (e.g. YYYY-MM-DD). */
  placeholder?: string
  /** Input size variant. */
  size?: InputSize
  /** Input color variant. */
  variant?: InputVariant
  /** Disable the datepicker. @default false */
  disabled?: boolean
  /** Make input readonly (calendar still accessible via the toggle button). @default false */
  readonly?: boolean
  /** Use rounded input style. @default false */
  rounded?: boolean
  /** Minimum selectable date (calendar only; typed dates are not restricted). */
  minDate?: Date
  /** Maximum selectable date (calendar only; typed dates are not restricted). */
  maxDate?: Date
  /** List of dates that cannot be selected. */
  unselectableDates?: Date[]
  /** List of dates that can be selected (whitelist). */
  selectableDates?: Date[]
  /** Days of week that cannot be selected (0-6, Sunday-Saturday). */
  unselectableDaysOfWeek?: number[]
  /** Custom month names. */
  monthNames?: string[]
  /** Custom day names (short, shown as column headers). */
  dayNames?: string[]
  /** Custom day names (long, announced for the column headers). */
  dayNamesLong?: string[]
  /** First day of week (0-6, Sunday-Saturday). @default 0 */
  firstDayOfWeek?: number
  /** Left icon inside the input (MDI icon name without 'mdi-' prefix). */
  icon?: string
  /** Right icon inside the input (MDI icon name without 'mdi-' prefix). */
  iconRight?: string
  /** Make right icon clickable. @default false */
  iconRightClickable?: boolean
  /** Icon on the calendar toggle button. @default 'calendar' */
  iconToggle?: string
  /** Previous month icon. @default 'chevron-left' */
  iconPrev?: string
  /** Next month icon. @default 'chevron-right' */
  iconNext?: string
  /** Position of the dropdown. @default 'bottom-left' */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  /** date-fns format used to display and parse dates in the input. @default 'yyyy-MM-dd' */
  dateFormat?: string
  /** Years range for year select [before, after]. @default [-100, 10] */
  yearsRange?: [number, number]
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
  /** Accessible label for the date input, for use when the datepicker is not paired with a visible cat-field label. */
  ariaLabel?: string
  /** Accessibility label for the calendar dialog. @default 'Choose date' */
  ariaDialogLabel?: string
  /** Accessibility label for the calendar toggle button; the selected date is appended when set. @default 'Choose date' */
  ariaToggleLabel?: string
  /** Status announcement prefix when a typed date commits; the new value is appended. @default 'Date set to' */
  ariaDateSetLabel?: string
  /** Status announcement prefix when typed text is invalid and reverts; the restored value is appended. @default 'Invalid date, reverted to' */
  ariaDateInvalidLabel?: string
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
  dayNamesLong: () => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  firstDayOfWeek: 0,
  icon: undefined,
  iconRight: undefined,
  iconRightClickable: false,
  iconToggle: 'calendar',
  iconPrev: 'chevron-left',
  iconNext: 'chevron-right',
  position: 'bottom-left',
  dateFormat: 'yyyy-MM-dd',
  yearsRange: () => [-100, 10],
  closeOnSelect: true,
  ariaPreviousLabel: 'Previous month',
  ariaNextLabel: 'Next month',
  ariaSelectMonthLabel: 'Select month',
  ariaSelectYearLabel: 'Select year',
  ariaLabel: undefined,
  ariaDialogLabel: 'Choose date',
  ariaToggleLabel: 'Choose date',
  ariaDateSetLabel: 'Date set to',
  ariaDateInvalidLabel: 'Invalid date, reverted to'
})

const emit = defineEmits<{
  'update:modelValue': [value: T]
  'update:dateString': [value: S]
  'icon-right-click': [event: MouseEvent]
  'change-month': [month: number]
  'change-year': [year: number]
}>()

const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref()
const toggleRef = ref<HTMLButtonElement | null>(null)
const daysGridRef = ref<HTMLElement | null>(null)
const isActive = ref(false)

const baseId = useId()
const dialogId = `${baseId}-dialog`
const formatHintId = `${baseId}-format`
const monthSelectId = `${baseId}-month`
const yearSelectId = `${baseId}-year`

// Current focused date in calendar
const today = new Date()
const focusedMonth = ref(today.getMonth())
const focusedYear = ref(today.getFullYear())
// The day currently keyboard-focused inside the grid. It drives the roving
// tabindex so only one day button is in the tab order at a time. Starts on
// today; updates on grid keydown and when the user clicks a date.
const focusedDate = ref<Date>(today)

// Watch for month/year changes and emit events
watch(focusedMonth, newMonth => emit('change-month', newMonth))
watch(focusedYear, newYear => emit('change-year', newYear))

function parseInternalDate (dateString: string): Date | null {
  if (!dateString) return null
  const date = parse(dateString, DATE_FORMAT, new Date())
  return isValid(date) ? date : null
}

// Resolve active dates from whichever model is bound.
// Internally the component always works with Date objects.
// Prefers dateString when both are provided.
const activeDates = computed((): Date[] => {
  if (props.dateString != null) {
    const ds = props.dateString
    if (Array.isArray(ds)) {
      return ds.map(s => parseInternalDate(s)).filter((d): d is Date => d != null)
    }
    const parsed = parseInternalDate(ds)
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
  // A typed or programmatic selection can sit outside yearsRange, so include
  // the focused year to keep the year select from showing an empty value.
  if (!years.includes(focusedYear.value)) {
    years.push(focusedYear.value)
    years.sort((a, b) => a - b)
  }
  return years
})

const formattedValue = computed(() => {
  return activeDates.value.map(d => formatDate(d, props.dateFormat)).join(', ')
})

// The text shown in the input. Kept as local state so the user can type
// freely; synced back from the model on every selection change, and reverted
// by commitTypedInput when the typed text doesn't parse.
const inputText = ref('')
watch(formattedValue, (v) => { inputText.value = v }, { immediate: true })

// Hint announced via aria-describedby and used as the default placeholder.
// Uppercasing turns date-fns tokens into the conventional display form
// (yyyy-MM-dd → YYYY-MM-DD).
const formatHint = computed(() => props.dateFormat.toUpperCase())

const toggleAriaLabel = computed(() => {
  return formattedValue.value ? `${props.ariaToggleLabel}, ${formattedValue.value}` : props.ariaToggleLabel
})

const dropdownClasses = computed(() => ({
  'is-active': isActive.value,
  'is-right': props.position === 'bottom-right' || props.position === 'top-right',
  'is-up': props.position === 'top-left' || props.position === 'top-right'
}))

const toggleClasses = computed(() => props.size ? [`is-${props.size}`] : [])

// Column headers rotated by firstDayOfWeek so they line up with the day
// cells, which are laid out starting from firstDayOfWeek.
const weekdayHeaders = computed(() => {
  const headers: { short: string, long: string }[] = []
  for (let i = 0; i < 7; i++) {
    const idx = (i + props.firstDayOfWeek) % 7
    headers.push({
      short: props.dayNames[idx] ?? '',
      long: props.dayNamesLong[idx] ?? props.dayNames[idx] ?? ''
    })
  }
  return headers
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

// Full-date accessible name for a day cell (e.g. "June 15, 2026"), so each
// cell is self-describing even when assistive technology doesn't voice the
// grid's row/column context.
function dayAriaLabel (day: CalendarDay): string {
  const monthName = props.monthNames[day.date.getMonth()] ?? ''
  return `${monthName} ${day.date.getDate()}, ${day.date.getFullYear()}`.trim()
}

function emitDate (date: Date) {
  emit('update:modelValue', date as T)
  emit('update:dateString', formatDate(date, DATE_FORMAT) as S)
}

function emitDates (dates: Date[]) {
  emit('update:modelValue', dates as T)
  emit('update:dateString', dates.map(d => formatDate(d, DATE_FORMAT)) as S)
}

// Typed-input parsing uses the display format (dateFormat), unlike the
// date-string model which is always yyyy-MM-dd.
function parseTypedDate (raw: string): Date | null {
  if (!raw) return null
  const date = parse(raw, props.dateFormat, new Date())
  return isValid(date) ? date : null
}

function showMonthOf (date: Date) {
  focusedMonth.value = date.getMonth()
  focusedYear.value = date.getFullYear()
}

// Screen reader status feedback for typed commits and reverts.
const statusMessage = ref('')
function announceStatus (message: string) {
  // Clear first so repeating the same message still triggers an announcement.
  statusMessage.value = ''
  nextTick(() => {
    statusMessage.value = message
  })
}

// Commit the typed text on Enter or when focus leaves the input. Valid dates
// are emitted (without applying the calendar's selectable-date constraints,
// since consumers own validation for typed entry); anything else reverts the
// input to the current selection. In multiple mode the text is a
// comma-separated list and commits only if every part parses.
function commitTypedInput () {
  const raw = inputText.value.trim()
  if (raw === formattedValue.value) return
  if (props.multiple) {
    const parts = raw === '' ? [] : raw.split(',').map(s => s.trim()).filter(s => s !== '')
    const dates = parts.map(p => parseTypedDate(p))
    if (parts.length > 0 && dates.every((d): d is Date => d != null)) {
      const unique: Date[] = []
      for (const d of dates) {
        if (!unique.some(u => isSameDay(u, d))) {
          unique.push(d)
        }
      }
      emitDates(unique)
      showMonthOf(unique[unique.length - 1]!)
      announceStatus(`${props.ariaDateSetLabel} ${unique.map(d => formatDate(d, props.dateFormat)).join(', ')}`)
    } else {
      inputText.value = formattedValue.value
      announceStatus(`${props.ariaDateInvalidLabel} ${formattedValue.value}`.trim())
    }
  } else {
    const date = parseTypedDate(raw)
    if (date) {
      emitDate(date)
      showMonthOf(date)
      inputText.value = formatDate(date, props.dateFormat)
      announceStatus(`${props.ariaDateSetLabel} ${inputText.value}`)
    } else {
      inputText.value = formattedValue.value
      announceStatus(`${props.ariaDateInvalidLabel} ${formattedValue.value}`.trim())
    }
  }
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

// Focus the rendered button for the current focusedDate. Skips when the
// resolved button is disabled, since focusing a disabled element is a no-op
// and would leave the roving tabindex out of sync with actual focus.
function focusDayButton (): void {
  const key = formatDate(focusedDate.value, DATE_FORMAT)
  const btn = daysGridRef.value?.querySelector<HTMLButtonElement>(`[data-date="${key}"]`)
  if (btn && !btn.disabled) btn.focus()
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
    focusDayButton()
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
      // The button's native click also fires for Enter/Space, but we
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

function toggle () {
  if (isActive.value) {
    close()
  } else {
    openCalendar()
  }
}

function openCalendar () {
  if (props.disabled || isActive.value) return
  isActive.value = true
}

// Close the calendar. Returns focus to the toggle button by default (per the
// APG dialog pattern); pass false when dismissal must not steal focus (e.g.
// outside click).
function close (returnFocus = true) {
  if (!isActive.value) return
  isActive.value = false
  if (returnFocus) {
    nextTick(() => {
      toggleRef.value?.focus()
    })
  }
}

useDismissablePopup({
  rootRef,
  isOpen: () => isActive.value,
  onClickOutside: () => close(false),
  onEscape: () => {
    // Return focus to the toggle only when focus is inside the popup; when
    // the user is typing in the input, Escape closes without moving focus.
    const active = document.activeElement
    const inPopup = !!active && !!rootRef.value?.querySelector('.dropdown-menu')?.contains(active)
    close(inPopup)
  }
})

// Close (without stealing focus) when keyboard focus leaves the popup, e.g.
// tabbing past the date grid. A non-modal dialog shouldn't linger open
// behind the user.
function handleMenuFocusout (event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (!next) return
  if (rootRef.value && !rootRef.value.contains(next)) {
    close(false)
  }
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

// Point the visible month and the roving tab stop at the active selection so
// the calendar shows the right month with the selected day focusable. With no
// selection, clamp today (or the current focusedDate) onto a selectable day so
// the tab stop is always focusable; minDate/maxDate or whitelists can
// otherwise leave today unselectable and the grid with no tab stop.
function seedFocusFromSelection () {
  const date = activeDates.value[0]
  if (date) {
    focusedMonth.value = date.getMonth()
    focusedYear.value = date.getFullYear()
    focusedDate.value = nearestSelectableInMonth(date)
  } else {
    focusedDate.value = nearestSelectableInMonth(focusedDate.value)
  }
}

// Runs immediately so the initial render has a valid tab stop in the grid.
watch(activeDates, seedFocusFromSelection, { immediate: true })

// Re-seed whenever the calendar opens, so paging to another month and closing
// without selecting doesn't leave it on a stale month. Then move focus into
// the grid per the APG date picker dialog pattern (focus lands on the
// selected date, or the nearest selectable day).
watch(isActive, (open) => {
  if (open) {
    seedFocusFromSelection()
    nextTick(() => {
      focusDayButton()
    })
  }
})

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
@use "bulma/sass/utilities/derived-variables" as *;

// The addon field exists only to attach the toggle button to the input;
// Bulma's .field:not(:last-child) margin doesn't apply (the sr-only format
// hint precedes it), but be explicit in case the markup shifts.
.cat-datepicker-field {
  margin-bottom: 0;
}

.cat-datepicker-toggle:focus-visible {
  outline: 2px solid $link;
  outline-offset: -2px;
}

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

.cat-datepicker-days {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

// Header and week rows are real elements (role="row" owning the
// columnheaders/gridcells); each lays out its 7 children on the same
// 7-column grid so columns align across rows.
.cat-datepicker-weekdays,
.cat-datepicker-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.cat-datepicker-weekday {
  text-align: center;
  font-size: var(--bulma-size-small);
  font-weight: 600;
  color: var(--bulma-grey);
  padding: 0.5rem 0;
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
