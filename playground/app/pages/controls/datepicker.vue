<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Datepicker Component
      </h1>
      <p class="subtitle">
        Date selection via a typeable text input paired with a calendar dialog.
        Type a date and press Enter (or leave the field), or open the calendar
        with the toggle button.
      </p>

      <demo-box label="Basic Usage">
        <cat-datepicker
          v-model:model-value="singleDate"
          placeholder="Select a date"
        />
        <p class="mt-3">
          Selected: {{ singleDate ? formatDateDisplay(singleDate) : 'None' }}
        </p>
      </demo-box>

      <demo-box label="String Model (v-model:date-string)">
        <cat-datepicker
          v-model:date-string="stringDate"
          placeholder="Select a date (string model)"
        />
        <p class="mt-3">
          Selected: {{ stringDate || 'None' }} (type: {{ typeof stringDate }})
        </p>
      </demo-box>

      <demo-box label="String Model Multiple (v-model:date-string)">
        <cat-datepicker
          v-model:date-string="stringDates"
          placeholder="Select dates (string[] model)"
          multiple
          :close-on-select="false"
        />
        <p class="mt-3">
          Selected: {{ stringDates.length }}
        </p>
        <ul v-if="stringDates.length">
          <li v-for="d in stringDates" :key="d">
            {{ d }}
          </li>
        </ul>
      </demo-box>

      <demo-box label="Display Format (date-format)">
        <cat-datepicker
          v-model:model-value="formatDate"
          date-format="MM/dd/yyyy"
        />
        <p class="mt-3">
          Selected: {{ formatDate ? formatDateDisplay(formatDate) : 'None' }}
        </p>
        <p class="is-size-7 has-text-grey">
          The input displays and parses typed dates using <code>date-format</code>;
          the <code>date-string</code> model stays YYYY-MM-DD.
        </p>
      </demo-box>

      <demo-box label="Multiple Date Selection">
        <cat-datepicker
          v-model:model-value="multipleDates as any"
          placeholder="Select dates"
          multiple
          :close-on-select="false"
        />
        <p class="mt-3">
          Selected dates: {{ multipleDates.length }}
        </p>
        <ul v-if="multipleDates.length">
          <li v-for="(date, i) in multipleDates" :key="i">
            {{ formatDateDisplay(date) }}
          </li>
        </ul>
      </demo-box>

      <demo-box label="Date Range Constraints">
        <cat-datepicker
          v-model:model-value="constrainedDate"
          placeholder="Select date (next 30 days)"
          :min-date="minDate"
          :max-date="maxDate"
        />
        <p class="mt-3">
          Selected: {{ constrainedDate ? formatDateDisplay(constrainedDate) : 'None' }}
        </p>
        <p class="is-size-7 has-text-grey">
          Min: {{ formatDateDisplay(minDate) }}, Max: {{ formatDateDisplay(maxDate) }}
        </p>
      </demo-box>

      <demo-box label="Unselectable Days of Week">
        <cat-datepicker
          v-model:model-value="weekdayDate"
          placeholder="Weekdays only"
          :unselectable-days-of-week="[0, 6]"
        />
        <p class="mt-3">
          Selected: {{ weekdayDate ? formatDateDisplay(weekdayDate) : 'None' }}
        </p>
        <p class="is-size-7 has-text-grey">
          Weekends (Saturday & Sunday) are disabled
        </p>
      </demo-box>

      <demo-box label="Custom Date Restrictions">
        <cat-datepicker
          v-model:model-value="customDate"
          placeholder="Select date"
          :unselectable-dates="blackoutDates"
        />
        <p class="mt-3">
          Selected: {{ customDate ? formatDateDisplay(customDate) : 'None' }}
        </p>
        <p class="is-size-7 has-text-grey">
          Some dates are blacked out
        </p>
      </demo-box>

      <demo-box label="Sizes">
        <div class="columns">
          <div class="column">
            <cat-datepicker
              v-model:model-value="sizeDate1"
              placeholder="Small"
              size="small"
            />
          </div>
          <div class="column">
            <cat-datepicker
              v-model:model-value="sizeDate2"
              placeholder="Normal"
            />
          </div>
          <div class="column">
            <cat-datepicker
              v-model:model-value="sizeDate3"
              placeholder="Large"
              size="large"
            />
          </div>
        </div>
      </demo-box>

      <demo-box label="Variants">
        <div class="columns">
          <div class="column">
            <cat-datepicker
              v-model:model-value="variantDate1"
              placeholder="Primary"
              variant="primary"
            />
          </div>
          <div class="column">
            <cat-datepicker
              v-model:model-value="variantDate2"
              placeholder="Success"
              variant="success"
            />
          </div>
          <div class="column">
            <cat-datepicker
              v-model:model-value="variantDate3"
              placeholder="Danger"
              variant="danger"
            />
          </div>
        </div>
      </demo-box>

      <demo-box label="Rounded">
        <cat-datepicker
          v-model:model-value="roundedDate"
          placeholder="Rounded input"
          rounded
        />
      </demo-box>

      <demo-box label="Disabled & Readonly">
        <div class="columns">
          <div class="column">
            <cat-datepicker
              v-model:model-value="disabledDate"
              placeholder="Disabled"
              disabled
            />
          </div>
          <div class="column">
            <cat-datepicker
              v-model:model-value="readonlyDate"
              placeholder="Readonly"
              readonly
            />
          </div>
        </div>
      </demo-box>

      <demo-box label="Custom Icons">
        <cat-datepicker
          v-model:model-value="iconDate"
          placeholder="Custom icons"
          icon="calendar-star"
          icon-toggle="calendar-month"
          icon-right="close"
          :icon-right-clickable="true"
          icon-prev="arrow-left-circle"
          icon-next="arrow-right-circle"
          @icon-right-click="iconDate = undefined"
        />
        <p class="mt-3">
          Click the right icon to clear
        </p>
      </demo-box>

      <demo-box label="Addon Slot (attached clear button)">
        <cat-datepicker v-model:model-value="addonDate">
          <template #addon>
            <cat-button
              icon="close"
              :disabled="!addonDate"
              v-bind="{ ariaLabel: 'Clear date' }"
              @click="addonDate = undefined"
            />
          </template>
        </cat-datepicker>
        <p class="mt-3">
          Selected: {{ addonDate ? formatDateDisplay(addonDate) : 'None' }}
        </p>
      </demo-box>

      <demo-box label="Dropdown Position">
        <div class="columns">
          <div class="column">
            <cat-datepicker
              v-model:model-value="positionDate1"
              placeholder="Bottom Left"
              position="bottom-left"
            />
          </div>
          <div class="column">
            <cat-datepicker
              v-model:model-value="positionDate2"
              placeholder="Bottom Right"
              position="bottom-right"
            />
          </div>
        </div>
      </demo-box>

      <demo-box label="With Footer Slot">
        <cat-datepicker
          v-model:model-value="footerDate"
          placeholder="Select date"
          :close-on-select="false"
        >
          <template #footer="{ close }">
            <div class="buttons">
              <cat-button size="small" @click="footerDate = new Date()">
                Today
              </cat-button>
              <cat-button size="small" variant="link" @click="close">
                Close
              </cat-button>
            </div>
          </template>
        </cat-datepicker>
        <p class="mt-3">
          Selected: {{ footerDate ? formatDateDisplay(footerDate) : 'None' }}
        </p>
      </demo-box>

      <demo-a11y
        pattern-name="Dialog"
        pattern-url="https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/"
        :references="[
          { label: 'APG: Date Picker Dialog example', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/' },
        ]"
        :keyboard="[
          { key: 'Enter (in the input)', description: 'Commits a typed date. Text that does not parse reverts to the current selection (committing also happens when focus leaves the input).' },
          { key: 'Enter / Space (on the toggle button)', description: 'Opens the calendar dialog and moves focus to the selected date (or the nearest selectable day).' },
          { key: 'Tab / Shift+Tab', description: 'Within the dialog, moves focus through the previous-month button, the month and year selects, the next-month button, and the date grid. Tabbing out of the dialog closes it.' },
          { key: 'ArrowLeft / ArrowRight', description: 'Within the grid, moves focus to the previous / next day.' },
          { key: 'ArrowUp / ArrowDown', description: 'Within the grid, moves focus to the same day in the previous / next week.' },
          { key: 'Home / End', description: 'Within the grid, moves focus to the first / last day of the current week.' },
          { key: 'PageUp / PageDown', description: 'Within the grid, moves focus to the same day in the previous / next month. Day-of-month is clamped when the target month is shorter (Jan 31 → PageDown → Feb 28).' },
          { key: 'Shift+PageUp / Shift+PageDown', description: 'Within the grid, moves focus to the same day in the previous / next year (with the same day-of-month clamping).' },
          { key: 'Enter / Space', description: 'When focus is on a day button, selects that date.' },
          { key: 'Escape', description: 'Closes the calendar and returns focus to the toggle button (or leaves focus in the input when typing).' },
        ]"
      >
        <template #notes>
          <p class="mt-3">
            The trigger pairs a typeable text input with a toggle button carrying <code>aria-haspopup="dialog"</code>, <code>aria-expanded</code>, and <code>aria-controls</code>, so assistive technology can discover and operate the calendar popup. The input is described by a visually-hidden date format hint (e.g. <em>Date format: YYYY-MM-DD</em>), and a visually-hidden <code>role="status"</code> region announces typed commits (<em>Date set to ...</em>) and invalid-text reverts (<em>Invalid date, reverted to ...</em>). The toggle button's accessible name includes the current selection. Use the <code>aria-label</code> prop to name the input when the datepicker is not paired with a visible <code>cat-field</code> label.
          </p>
          <p class="mt-2">
            The calendar opens as a <code>role="dialog"</code> with <code>aria-modal="false"</code> (it doesn't trap focus, since users may want to interact with the input while the picker is open). The dialog is the popup's outermost semantic; it is not nested inside a <code>role="menu"</code> container. Use the <code>aria-dialog-label</code> prop to customize the announcement (default: <em>Choose date</em>).
          </p>
          <p class="mt-2">
            The day grid uses <code>role="grid"</code> with a column-header row naming the weekdays and one <code>role="gridcell"</code> button per day, each labeled with its full date (e.g. <em>June 15, 2026</em>), with <code>aria-current="date"</code> on today. Roving <code>tabindex</code> means only one day button is in the tab order at a time (the selected day, or today). The grid's <code>aria-label</code> announces the visible month and year, a polite live region announces month changes from the prev/next buttons and PageUp/PageDown, and the month/year selects carry their own labels and unique ids.
          </p>
          <p class="mt-2">
            When <code>minDate</code> / <code>maxDate</code> / <code>unselectableDates</code> would leave the natural tab stop on a disabled day, the focused day is automatically advanced to the nearest selectable day in the visible month, so the grid always has a focusable entry point. Typed dates are deliberately <em>not</em> restricted by these constraints; they are emitted as-is so the consumer can show its own validation messaging.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

// Basic usage
const singleDate = ref<Date>()

// String mode
const stringDate = ref('')
const stringDates = ref<string[]>([])

// Display format
const formatDate = ref<Date>()

// Multiple selection
const multipleDates = ref<Date[]>([])

// Range constraints
const minDate = new Date()
const maxDate = new Date()
maxDate.setDate(maxDate.getDate() + 30)
const constrainedDate = ref<Date>()

// Weekday only
const weekdayDate = ref<Date>()

// Custom restrictions
const blackoutDates = ref<Date[]>([
  new Date(new Date().setDate(new Date().getDate() + 5)),
  new Date(new Date().setDate(new Date().getDate() + 10)),
  new Date(new Date().setDate(new Date().getDate() + 15))
])
const customDate = ref<Date>()

// Sizes
const sizeDate1 = ref<Date>()
const sizeDate2 = ref<Date>()
const sizeDate3 = ref<Date>()

// Variants
const variantDate1 = ref<Date>()
const variantDate2 = ref<Date>()
const variantDate3 = ref<Date>()

// Rounded
const roundedDate = ref<Date>()

// Disabled & Readonly
const disabledDate = ref<Date>(new Date())
const readonlyDate = ref<Date>(new Date())

// Custom icons
const iconDate = ref<Date>()

// Addon slot
const addonDate = ref<Date>()

// Position
const positionDate1 = ref<Date>()
const positionDate2 = ref<Date>()

// Footer
const footerDate = ref<Date>()

function formatDateDisplay (date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
