<template>
  <div class="card cat-card" :class="{ 'cat-card--panel': variant === 'panel' }">
    <!-- `expandable` must be part of this condition: the trigger lives in the
         header, so without it an expandable card with no label, #header or
         #actions would render no trigger at all while still hiding its content
         behind `isOpen` — permanently invisible with no way to open it. -->
    <header
      v-if="label || expandable || $slots.header || $slots.actions"
      class="card-header"
    >
      <!-- When expandable the header content becomes a real <button> carrying
           the disclosure semantics, rather than role="button" on this <header>.
           The chevron is a plain <span> inside that button, not the nested
           <button> it used to be — a control inside a control is invalid and
           needed @click.stop to work at all. Interactive header content belongs
           in #actions, which renders as a sibling of the trigger.

           Non-expandable cards render exactly as before, with no extra wrapper,
           so the far more common plain-card markup is untouched. -->
      <button
        v-if="expandable"
        class="cat-card-trigger"
        v-bind="triggerAttrs"
        @click="toggle"
      >
        <slot name="header">
          <p v-if="label" class="card-header-title">
            {{ label }}
          </p>
        </slot>
        <span class="card-header-icon">
          <cat-icon
            :icon="icon"
            class="cat-expand-icon"
            :class="{ 'is-rotated': !isOpen }"
          />
        </span>
      </button>
      <slot v-else name="header">
        <p v-if="label" class="card-header-title">
          {{ label }}
        </p>
      </slot>
      <div v-if="$slots.actions" class="card-header-actions">
        <slot name="actions" />
      </div>
    </header>
    <Transition name="cat-expand">
      <div v-show="!expandable || isOpen" v-bind="expandable ? contentAttrs : {}">
        <div class="card-content">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="card-footer">
          <slot name="footer" />
        </footer>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import CatIcon from './icon.vue'
import { useDisclosure } from '../util/disclosure'

/**
 * Card component - a flexible content container.
 * Based on Bulma Card component with optional collapse functionality.
 *
 * @component cat-card
 * @see https://bulma.io/documentation/components/card/
 * @example
 * <cat-card label="Settings">Content</cat-card>
 * <cat-card label="Details" expandable>Expandable content</cat-card>
 * <cat-card label="Advanced" expandable v-model:open="isOpen">Controlled</cat-card>
 */

interface Props {
  /**
   * Optional label/title for the card header.
   * If not provided and no #header slot is used, the header won't be rendered.
   */
  label?: string

  /**
   * Enable expand/collapse functionality.
   * @default false
   */
  expandable?: boolean

  /**
   * Control the open/closed state (v-model:open).
   * @default false
   */
  open?: boolean

  /**
   * Visual variant for the card.
   * 'panel' gives a dark header matching Bulma's panel-heading style.
   */
  variant?: 'panel'

  /**
   * Icon for the collapse indicator.
   * @default 'chevron-down'
   */
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  variant: undefined,
  expandable: false,
  open: false,
  icon: 'chevron-down'
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

// Disclosure state and ARIA wiring, shared with cat-collapse and cat-msg.
const { isOpen, triggerAttrs, contentAttrs, toggle } = useDisclosure({
  open: () => props.open,
  idPrefix: 'cat-card',
  onChange: (value: boolean) => emit('update:open', value)
})
</script>

<style lang="scss" scoped>
@use "bulma/sass/utilities/derived-variables" as *;

.cat-card {
  // `card-header` is display:flex in Bulma, so the trigger takes the free space
  // and reproduces the title/icon layout the header used to provide directly.
  .cat-card-trigger {
    flex: 1 1 auto;
    // Stretch to the header's full height so the hover highlight reads as a
    // deliberate block rather than a part-height patch. The highlight covers
    // exactly the clickable region and stops where #actions begins, which is
    // honest: those controls are siblings of the trigger and do not toggle.
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    padding: 0;
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    user-select: none;

    &:hover {
      background-color: var(--bulma-scheme-main-bis, #fafafa);
    }

    // Inset the outline: the trigger stretches to the header's edges, so a
    // positive offset would be clipped by the card's overflow.
    &:focus-visible {
      outline: 2px solid $link;
      outline-offset: -2px;
    }
  }

  .card-header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-right: 0.75rem;
    margin-left: auto;
  }

  .card-header-icon {
    border: none;
    background: transparent;
    cursor: pointer;
  }

  .cat-expand-icon {
    transition: transform 0.3s ease;

    &.is-rotated {
      transform: rotate(-90deg);
    }
  }

  &.cat-card--panel {
    .card-header {
      background-color: hsl(var(--bulma-scheme-h), var(--bulma-scheme-s), var(--bulma-text-l));
      color: hsl(var(--bulma-scheme-h), var(--bulma-scheme-s), var(--bulma-text-invert-l));
    }

    :deep(.card-header-title) {
      color: inherit;
    }
  }
}

// Expand transition
.cat-expand-enter-active,
.cat-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.cat-expand-enter-from,
.cat-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.cat-expand-enter-to,
.cat-expand-leave-from {
  opacity: 1;
  max-height: 1000px; // Arbitrary large value
}
</style>
