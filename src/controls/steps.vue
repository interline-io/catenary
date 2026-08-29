<template>
  <div class="cat-steps" :class="rootClasses">
    <!-- An ordered list, deliberately not a tablist. Steps are a sequence with
         progress rather than a set of peers: they have an order that matters,
         most of them are unreachable at any given moment, and moving between
         them is the task itself rather than a way to look at something else.
         The list conveys position ("2 of 4"), aria-current marks where the
         user is, and the visually hidden status text on each marker says
         whether a step is done — none of which the tabs pattern expresses.
         There is no APG stepper pattern; this follows the same shape as the
         GOV.UK, USWDS, Preline and Flowbite step indicators. -->
    <ol
      class="cat-steps-list"
      :aria-label="ariaLabelledby ? undefined : ariaLabel"
      :aria-labelledby="ariaLabelledby"
    >
      <li
        v-for="step in resolveSteps().steps"
        :key="step.value"
        class="cat-step"
        :class="stepClasses(step)"
      >
        <!-- Markers render as buttons whenever the stepper is interactive at
             all, even for steps that cannot be reached yet, which get
             aria-disabled instead of the disabled attribute. Two reasons: the
             element type then never changes as the user advances (swapping a
             focused <button> for a <span> would drop focus to the body), and
             an aria-disabled button stays focusable, so a keyboard user can
             read through the steps ahead instead of tabbing past a hole.

             The current step is exempt. Activating it is a no-op like the
             others, but "unavailable" is the wrong word for where the user
             already is, and it would blur the one distinction the whole
             control exists to draw — done, here, not yet. aria-current says
             it instead. -->
        <component
          :is="isInteractive(step) ? 'button' : 'span'"
          class="cat-step-trigger"
          :type="isInteractive(step) ? 'button' : undefined"
          :aria-current="step.state === 'current' ? 'step' : undefined"
          :aria-disabled="isInteractive(step) && !isNavigable(step) && step.state !== 'current' ? 'true' : undefined"
          @click="onTriggerClick(step)"
        >
          <!-- Hidden from assistive technology: the number repeats the
               position the list already announces, and a completed step's
               check repeats the status text below. -->
          <span class="cat-step-marker" aria-hidden="true">
            <cat-icon
              v-if="markerIcon(step)"
              :icon="markerIcon(step) as string"
              :size="markerIconSize"
            />
            <template v-else>{{ step.step ?? step.index + 1 }}</template>
          </span>
          <span class="cat-step-text">
            <span :id="step.labelId" class="cat-step-label">{{ step.label }}</span>
            <!-- aria-current already announces the current step, so only the
                 other two states need spelling out. -->
            <span v-if="statusLabel(step)" class="is-sr-only">{{ statusLabel(step) }}</span>
          </span>
        </component>
      </li>
    </ol>

    <div class="cat-steps-body">
      <div class="cat-steps-content">
        <slot />
      </div>

      <div v-if="hasNavigation || $slots.navigation" class="cat-steps-nav">
        <slot
          name="navigation"
          :previous="previous"
          :next="next"
          :go-to="goTo"
          :has-previous="resolveSteps().hasPrevious"
          :has-next="resolveSteps().hasNext"
          :active-index="resolveSteps().activeIndex"
          :count="resolveSteps().count"
        >
          <cat-button :disabled="!resolveSteps().hasPrevious" @click="previous">
            {{ previousLabel }}
          </cat-button>
          <cat-button variant="primary" :disabled="!resolveSteps().hasNext" @click="next">
            {{ nextLabel }}
          </cat-button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number = string">
import { computed, nextTick, provide, watch, useId, useSlots } from 'vue'
import CatStepItem from './step-item.vue'
import { collectSlotItems, idFragment } from '../util/slot-items'
import CatButton from './button.vue'
import CatIcon from './icon.vue'
import type { StepsLabelPosition, StepsSize, StepsVariant } from './types'
import { StepsContextKey, type StepDescriptor } from '../util/steps-context'

/**
 * Steps ("wizard"): a numbered sequence of stages with one panel visible at a
 * time, and a progress list showing which stages are done, current and still
 * ahead.
 *
 * There is no WAI-ARIA Authoring Practices pattern for a stepper. This renders
 * the progress as an `<ol>` with `aria-current="step"` on the active item and
 * visually hidden status text on the others — the shape used by the GOV.UK,
 * USWDS, Preline and Flowbite step indicators — and each panel as a named
 * group. Deliberately not the tabs pattern: steps are a sequence to be worked
 * through, not interchangeable views of the same thing.
 *
 * Works with cat-step-item children. By default a step is clickable once it is
 * behind the active one, so users can go back but not skip ahead; `clickable`
 * on the parent forces all or none, and `clickable` on an item overrides its
 * own step.
 *
 * Navigation is the consumer's by default — drive `v-model` from buttons in
 * the step content. Pass `has-navigation` for built-in Previous/Next buttons,
 * or the `#navigation` slot to render your own from the same state.
 *
 * @component cat-steps
 * @example
 * <cat-steps v-model="step" aria-label="Upload progress">
 *   <cat-step-item value="1" label="Upload">…</cat-step-item>
 *   <cat-step-item value="2" label="Validate">…</cat-step-item>
 * </cat-steps>
 */

// Inlined rather than a named interface: in a generic component the emitted
// declaration cannot reference a local type (TS4025).
const props = withDefaults(defineProps<{
  /** Color of completed and current markers. @default 'primary' */
  variant?: StepsVariant

  /** Marker and label scale. @default 'normal' */
  size?: StepsSize

  /** Layout of the progress list. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical'

  /**
   * Where the label sits relative to its marker, when horizontal. Vertical
   * steppers always place labels beside the marker.
   * @default 'bottom'
   */
  labelPosition?: StepsLabelPosition

  /**
   * Whether markers can be activated to change step.
   * `true` makes every step reachable, `false` makes the list a read-only
   * progress display with no buttons at all. Omitted, steps behind the active
   * one are reachable and those ahead are not — go back, but don't skip.
   * A step's own `clickable` prop overrides this for that step.
   */
  clickable?: boolean

  /**
   * Render built-in Previous/Next buttons below the content.
   * @default false
   */
  hasNavigation?: boolean

  /** Label for the built-in previous button. @default 'Previous' */
  previousLabel?: string

  /** Label for the built-in next button. @default 'Next' */
  nextLabel?: string

  /**
   * Icon shown in the marker of a completed step, replacing its number. Pass
   * null to keep numbers throughout.
   * @default 'check'
   */
  completedIcon?: string | null

  /**
   * Animate the transition between panels. Respects prefers-reduced-motion.
   * @default false
   */
  animated?: boolean

  /**
   * Accessible name for the progress list. Provide this, or `ariaLabelledby`,
   * whenever a page holds more than one stepper.
   * @default 'Progress'
   */
  ariaLabel?: string

  /**
   * id of a visible element (e.g. a heading) that names the progress list.
   * Preferred over `ariaLabel` when such an element exists.
   */
  ariaLabelledby?: string

  /** Screen-reader status text for a step already done. @default 'Completed' */
  ariaCompletedLabel?: string

  /** Screen-reader status text for a step not yet reached. @default 'Not completed' */
  ariaUpcomingLabel?: string
}>(), {
  variant: 'primary',
  size: 'normal',
  orientation: 'horizontal',
  labelPosition: 'bottom',
  clickable: undefined,
  hasNavigation: false,
  previousLabel: 'Previous',
  nextLabel: 'Next',
  completedIcon: 'check',
  animated: false,
  ariaLabel: 'Progress',
  ariaLabelledby: undefined,
  ariaCompletedLabel: 'Completed',
  ariaUpcomingLabel: 'Not completed'
})

const emit = defineEmits<{
  /** Fired after a step change with the new and previous values. */
  change: [value: T, oldValue: T | undefined]
}>()

defineSlots<{
  /** The cat-step-item children. */
  default?: () => unknown
  /** Replaces the built-in Previous/Next buttons with the same state. */
  navigation?: (props: {
    previous: () => void
    next: () => void
    goTo: (value: T) => void
    hasPrevious: boolean
    hasNext: boolean
    activeIndex: number
    count: number
  }) => unknown
}>()

/**
 * The active step (v-model). Left unbound it keeps the value locally, so a
 * stepper with `has-navigation` works on its own; bound, the consumer owns it,
 * which is the normal case since each step usually gates on their own state.
 */
const model = defineModel<T>()

const slots = useSlots()

// One id per stepper; each step derives its pair from this plus its own value,
// so parent and child agree without either counting positions.
const idBase = useId()

/** A step plus everything the progress list needs to draw it. */
interface ResolvedStep extends StepDescriptor {
  index: number
  state: 'completed' | 'current' | 'upcoming'
}

/**
 * The steps, in template order, read from the default slot's VNodes.
 *
 * This replaces an onMounted registration channel and, with it, three separate
 * problems: a step revealed later by `v-if` used to mount last and needed a
 * `compareDocumentPosition` pass to be sorted back into place, changing a
 * step's `value` needed a watcher to avoid stranding the old entry, and the
 * progress list rendered empty on the server because `onMounted` never runs
 * during `renderToString`.
 *
 * Deliberately a function rather than a computed, and everything derived from
 * the list is resolved here in one pass. Slot VNodes are not a reactive
 * dependency — Vue warns that a slot invoked outside a render "will not track
 * dependencies used in the slot" — so a computed would cache exactly when a
 * `v-if` adds or removes a step. Called during render, it re-runs whenever the
 * slot can have changed.
 */
function resolveSteps () {
  const items: StepDescriptor[] = collectSlotItems(slots.default?.(), CatStepItem).map((node) => {
    const p = (node.props ?? {}) as Record<string, unknown>
    const value = p.value as string | number
    const fragment = idFragment(value)
    return {
      value,
      label: String(p.label ?? ''),
      step: p.step as string | undefined,
      icon: p.icon as string | undefined,
      variant: p.variant as StepDescriptor['variant'],
      // Absent means "inherit from the parent"; `false` is a real override.
      clickable: p.clickable as boolean | undefined,
      labelId: `${idBase}-label-${fragment}`,
      panelId: `${idBase}-panel-${fragment}`
    }
  })

  // Falls back to the first step when the model matches none — either nothing
  // is bound yet, or the active item was removed by a v-if. Without it the
  // stepper would draw a progress list with no panel below it.
  const found = items.findIndex(s => s.value === model.value)
  const activeIndex = found >= 0 ? found : 0

  return {
    activeIndex,
    count: items.length,
    hasPrevious: activeIndex > 0,
    hasNext: activeIndex < items.length - 1,
    steps: items.map((step, index): ResolvedStep => ({
      ...step,
      index,
      state: index < activeIndex ? 'completed' : index === activeIndex ? 'current' : 'upcoming'
    }))
  }
}

// Children compare against the model alone, with no slot dependency of their
// own: a computed that read the slot would not re-evaluate when the slot
// changed, and would warn. The model is normalised below so it always names a
// real step on the client.
const activeValue = computed(() => model.value)

// An unbound stepper, or one whose value names a step that has since been
// removed, settles on the first step. Done as a state change rather than a
// fallback inside activeValue so that nothing downstream has to read the slot.
// Never runs during SSR, so a server-rendered stepper needs a bound v-model to
// show a panel — which is what it needed before this change too.
watch([model, () => props.animated], () => {
  const { steps: resolved } = resolveSteps()
  if (resolved.length === 0) return
  if (!resolved.some(s => s.value === model.value)) {
    model.value = resolved[0]!.value as T
  }
}, { immediate: true, flush: 'post' })

provide(StepsContextKey, {
  idBase,
  activeValue,
  animated: computed(() => props.animated)
})

/** Whether this step's marker is a button at all. */
function isInteractive (step: StepDescriptor) {
  return step.clickable ?? props.clickable ?? true
}

/** Whether activating that button currently moves to the step. */
function isNavigable (step: ResolvedStep) {
  return step.clickable ?? props.clickable ?? step.state === 'completed'
}

function statusLabel (step: ResolvedStep) {
  if (step.state === 'completed') return props.ariaCompletedLabel
  if (step.state === 'upcoming') return props.ariaUpcomingLabel
  return undefined
}

function markerIcon (step: ResolvedStep) {
  if (step.icon) return step.icon
  if (step.state === 'completed' && props.completedIcon) return props.completedIcon
  return undefined
}

function stepClasses (step: ResolvedStep) {
  return [
    `is-${step.variant ?? props.variant}`,
    {
      'is-completed': step.state === 'completed',
      'is-current': step.state === 'current',
      'is-upcoming': step.state === 'upcoming'
    }
  ]
}

const rootClasses = computed(() => [
  `is-${props.orientation}`,
  `is-${props.size}`,
  // Colors the connector rail. Prefixed because a bare `is-primary` on the
  // root would also match the per-step marker rules.
  `is-variant-${props.variant}`,
  // Vertical steppers put the label beside the marker regardless: below it
  // there would be nothing to fill the width the list already occupies.
  props.orientation === 'vertical' ? 'is-label-right' : `is-label-${props.labelPosition}`
])

const markerIconSize = computed(() => {
  if (props.size === 'large') return 'medium' as const
  if (props.size === 'medium') return undefined
  return 'small' as const
})

// Set when a step change originates inside the component, so focus follows the
// user's own action into the new panel. A change driven from outside — the
// consumer advancing the model after an upload finishes, say — leaves focus
// where it is rather than yanking it out of whatever the user was doing.
let focusPending = false

function goToIndex (index: number) {
  const { steps: resolved, activeIndex } = resolveSteps()
  const step = resolved[index]
  if (!step || index === activeIndex) return
  const oldValue = activeValue.value as T | undefined
  focusPending = true
  model.value = step.value as T
  emit('change', step.value as T, oldValue)
  // If the consumer controls the model and ignores the update, the watcher
  // below never fires; drop the request rather than let it strand and steal
  // focus on some later, unrelated change. Pre-flush watchers run before
  // nextTick callbacks, so a change that did land has already claimed it.
  nextTick(() => { focusPending = false })
}

watch(activeValue, (value) => {
  if (!focusPending) return
  focusPending = false
  nextTick(() => {
    // Focus by id rather than a callback handed up at registration: the
    // parent already knows the panel id, since it derives it the same way the
    // child does.
    const panelId = resolveSteps().steps.find(s => s.value === value)?.panelId
    if (panelId) document.getElementById(panelId)?.focus()
  })
})

function onTriggerClick (step: ResolvedStep) {
  // aria-disabled markers stay focusable and clickable at the DOM level, so
  // the guard lives here rather than in the disabled attribute.
  if (!isInteractive(step) || !isNavigable(step)) return
  goToIndex(step.index)
}

function previous () {
  goToIndex(resolveSteps().activeIndex - 1)
}

function next () {
  goToIndex(resolveSteps().activeIndex + 1)
}

function goTo (value: T) {
  goToIndex(resolveSteps().steps.findIndex(s => s.value === value))
}

defineExpose({
  /** Move to the previous step, if there is one. */
  previous,
  /** Move to the next step, if there is one. */
  next,
  /** Move to a step by value. */
  goTo
})
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

// Bulma has no steps component, so the whole thing is cat- prefixed CSS. Color
// comes from Bulma's runtime theme tokens rather than SCSS variables because
// the marker fills, labels, connector lines and focus ring all have to follow
// the light / dark scheme that cat-theme-toggle switches at runtime; SCSS
// variables would bake in the light palette. Sizing stays on SCSS variables,
// which have no theme dimension.

$cat-step-marker-sizes: (
  "small": 1.5rem,
  "normal": 2rem,
  "medium": 2.5rem,
  "large": 3rem
);

$cat-step-label-sizes: (
  "small": $size-7,
  "normal": $size-6,
  "medium": $size-5,
  "large": $size-5
);

.cat-steps {
  --cat-step-marker-size: #{map.get($cat-step-marker-sizes, "normal")};
  --cat-step-label-size: #{map.get($cat-step-label-sizes, "normal")};
  --cat-step-connector: 2px;
  --cat-step-rail: var(--bulma-primary);
}

@each $name, $size in $cat-step-marker-sizes {
  .cat-steps.is-#{$name} {
    --cat-step-marker-size: #{$size};
    --cat-step-label-size: #{map.get($cat-step-label-sizes, $name)};
  }
}

.cat-steps-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

// Connector color travels through custom properties rather than being set on
// the pseudo-elements directly. The rules that create those pseudo-elements are
// nested under the layout classes and so outrank any flat `.cat-step.is-primary`
// rule; setting a property on the step itself sidesteps the specificity race
// and keeps one connector declaration per layout.
.cat-step {
  --cat-step-line-before: var(--bulma-border);
  --cat-step-line-after: var(--bulma-border);
  position: relative;
  flex: 1 1 0;
  min-width: 0;
}

.cat-step-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
}

button.cat-step-trigger {
  cursor: pointer;

  &[aria-disabled="true"] {
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid var(--bulma-link-on-scheme);
    outline-offset: 2px;
    border-radius: 4px;
  }
}

.cat-step-marker {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--cat-step-marker-size);
  height: var(--cat-step-marker-size);
  border: var(--cat-step-connector) solid var(--bulma-border);
  border-radius: $radius-rounded;
  background-color: transparent;
  color: var(--bulma-text-weak);
  font-weight: $weight-semibold;
  line-height: 1;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.cat-step-label {
  display: block;
  font-size: var(--cat-step-label-size);
  color: var(--bulma-text-weak);
  // break-word, not anywhere: `anywhere` also shrinks the intrinsic minimum
  // width to a single character, which lets a flex row squeeze a label until it
  // splits mid-word ("Acc / ount"). This breaks a word only when it genuinely
  // cannot fit.
  overflow-wrap: break-word;
}

.cat-step.is-completed .cat-step-label {
  color: var(--bulma-text);
}

.cat-step.is-current .cat-step-label {
  color: var(--bulma-text-strong);
  font-weight: $weight-semibold;
}

// Connector lines. In the default horizontal layout each step draws the half
// of the line on either side of its own marker, so a step can fill the segment
// behind it without reaching into its neighbour's box: completed steps fill
// both halves, the current step fills only the one behind it, and the line
// stops there.
.cat-steps.is-horizontal.is-label-bottom {
  .cat-step-trigger {
    flex-direction: column;
    gap: 0.4rem;
    text-align: center;
  }

  // Only this layout narrows the label to a share of the row, so only here may
  // it shrink past its longest word.
  .cat-step-text {
    min-width: 0;
  }

  .cat-step-label {
    text-align: center;
  }

  .cat-step::before,
  .cat-step::after {
    content: "";
    position: absolute;
    top: calc(var(--cat-step-marker-size) / 2);
    height: var(--cat-step-connector);
    margin-top: calc(var(--cat-step-connector) / -2);
  }

  .cat-step::before {
    background-color: var(--cat-step-line-before);
    left: 0;
    right: 50%;
    margin-right: calc(var(--cat-step-marker-size) / 2);
  }

  .cat-step::after {
    background-color: var(--cat-step-line-after);
    left: 50%;
    right: 0;
    margin-left: calc(var(--cat-step-marker-size) / 2);
  }

  .cat-step:first-child::before,
  .cat-step:last-child::after {
    display: none;
  }
}

// Label beside the marker: the connector becomes a flex item that grows into
// whatever space is left after the text, which is what gives the Preline-style
// row its even spacing without measuring anything.
.cat-steps.is-horizontal.is-label-right {
  .cat-step {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .cat-step-trigger {
    flex: 0 1 auto;
    width: auto;
  }

  .cat-step:not(:last-child)::after {
    content: "";
    flex: 1 1 auto;
    min-width: 1.5rem;
    height: var(--cat-step-connector);
    background-color: var(--cat-step-line-after);
  }
}

// Markers in a column with the label beside each one, joined by a vertical
// connector. Used by the vertical orientation, and by label-right on a narrow
// viewport where the row would otherwise squeeze the labels to nothing.
@mixin stacked-steps {
  .cat-steps-list {
    flex-direction: column;
  }

  .cat-step {
    display: block;
    flex: 0 0 auto;
    padding-bottom: 1.5rem;
  }

  .cat-step:last-child {
    padding-bottom: 0;
  }

  .cat-step-trigger {
    flex-direction: row;
    align-items: flex-start;
    width: 100%;
  }

  .cat-step-label {
    text-align: left;
  }

  .cat-step:not(:last-child)::after {
    content: "";
    display: block;
    position: absolute;
    top: var(--cat-step-marker-size);
    right: auto;
    bottom: 0.25rem;
    left: calc(var(--cat-step-marker-size) / 2);
    // min-width resets the floor the label-right row puts on its connector, so
    // the stacked form draws a hairline rather than a 1.5rem block.
    min-width: 0;
    width: var(--cat-step-connector);
    height: auto;
    margin: 0 0 0 calc(var(--cat-step-connector) / -2);
    background-color: var(--cat-step-line-after);
  }
}

.cat-steps.is-vertical {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;

  .cat-steps-list {
    flex: 0 0 auto;
    min-width: 10rem;
  }

  .cat-steps-body {
    flex: 1 1 auto;
    min-width: 0;
  }

  @include stacked-steps;
}

// Markers carry each step's own state, so a step that failed can be red while
// the rest of the stepper is not.
@each $name in ("primary", "link", "info", "success", "warning", "danger") {
  .cat-step.is-#{$name} {
    &.is-completed .cat-step-marker,
    &.is-current .cat-step-marker {
      background-color: var(--bulma-#{$name});
      border-color: var(--bulma-#{$name});
      color: var(--bulma-#{$name}-invert);
    }

    // Ring on the current marker only: completed and current are both filled,
    // so without it the only thing telling them apart is the check glyph.
    &.is-current .cat-step-marker {
      box-shadow: 0 0 0 4px var(--bulma-#{$name}-light);
    }
  }
}

// The rail is progress, not status, so it takes the stepper's variant rather
// than each step's. Deliberately not per-step: in the label-bottom layout a
// step paints the half-segment on either side of its own marker, so a single
// step with its own variant would tint half the line leading up to it and the
// join would read as a rendering fault rather than as meaning.
@each $name in ("primary", "link", "info", "success", "warning", "danger") {
  .cat-steps.is-variant-#{$name} {
    --cat-step-rail: var(--bulma-#{$name});
  }
}

// A completed step fills both of its halves; the current one fills only the
// half behind it, so the rail stops where the user has got to. Layouts with a
// single connector after each step use the same properties, where only the
// completed steps fill.
.cat-step.is-completed {
  --cat-step-line-before: var(--cat-step-rail);
  --cat-step-line-after: var(--cat-step-rail);
}

.cat-step.is-current {
  --cat-step-line-before: var(--cat-step-rail);
}

.cat-steps-content {
  margin-top: 1.5rem;
}

.cat-steps.is-vertical .cat-steps-content {
  margin-top: 0;
}

.cat-steps-nav {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

// Narrow viewports. Labels underneath their markers still fit, so they only
// shrink — never truncate or hide them, since a step whose label is gone is a
// step the user cannot identify. Labels beside their markers do not fit, so
// that layout stacks instead.
@media screen and (max-width: $tablet - 1px) {
  .cat-steps.is-horizontal.is-label-right {
    @include stacked-steps;
  }

  // A vertical stepper keeps its stacked list but drops the side-by-side
  // layout: two columns on a phone leaves the panel too narrow to fill in.
  .cat-steps.is-vertical {
    display: block;

    .cat-steps-content {
      margin-top: 1.5rem;
    }
  }

  .cat-steps.is-horizontal.is-label-bottom {
    --cat-step-label-size: #{$size-7};
  }
}

@media (prefers-reduced-motion: reduce) {
  .cat-step-marker {
    transition: none;
  }
}
</style>
