import type { ComputedRef, InjectionKey } from 'vue'
import type { CoreVariant } from '../controls/types'

/**
 * Contract between cat-steps and its cat-step-item children.
 *
 * The panel stays with the child that owns its content; only what the parent
 * needs to draw the progress list travels up, plus the two ids that pair a
 * marker with its panel and a focus callback the parent calls after a step
 * change.
 */
export interface StepRegistration {
  /** Identifies the step. Matched against the parent's modelValue. */
  value: string | number
  /** Visible label in the progress list. */
  label: string
  /** Marker text, overriding the step's 1-based position. */
  step?: string
  /** MDI icon name shown in the marker instead of text. */
  icon?: string
  /** Per-step color override, e.g. 'danger' for a step that failed. */
  variant?: CoreVariant
  /** Explicit override of whether this step's marker can be activated. */
  clickable?: boolean
  /** id of the label element, used to name the panel. */
  labelId: string
  /** id of the panel element. */
  panelId: string
  /**
   * The panel element. Registrations arrive in mount order, which is document
   * order for a static list but not for a step added later by v-if — the
   * parent compares elements to keep the list in the order it renders.
   */
  el: HTMLElement | null
  /** Moves focus to the panel. */
  focus: () => void
}

export interface StepsContext {
  register: (step: StepRegistration) => void
  deregister: (value: string | number) => void
  /** Value of the step currently displayed. */
  activeValue: ComputedRef<string | number | undefined>
  /** Whether panel changes are animated. */
  animated: ComputedRef<boolean>
}

export const StepsContextKey: InjectionKey<StepsContext> = Symbol('catSteps')
