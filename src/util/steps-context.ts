import type { ComputedRef, InjectionKey } from 'vue'
import type { CoreVariant } from '../controls/types'

/**
 * Contract between cat-steps and its cat-step-item children.
 *
 * The parent reads its children's props from the default slot's VNodes at
 * render time rather than collecting registrations, so this carries only what
 * the child needs to know about the parent. See `util/slot-items` for why.
 */
export interface StepDescriptor {
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
}

export interface StepsContext {
  /**
   * Id prefix. Parent and child each derive the label/panel id pair from this
   * plus the step's own `value`, so neither needs to know its position.
   */
  idBase: string
  /** Value of the step currently displayed. */
  activeValue: ComputedRef<string | number | undefined>
  /** Whether panel changes are animated. */
  animated: ComputedRef<boolean>
}

export const StepsContextKey: InjectionKey<StepsContext> = Symbol('catSteps')
