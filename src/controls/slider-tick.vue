<template>
  <component
    :is="setValue ? 'button' : 'div'"
    :type="setValue ? 'button' : undefined"
    class="cat-slider-tick"
    :class="{ 'is-clickable': !!setValue }"
    v-on="setValue ? { click: handleClick } : {}"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { inject } from 'vue'

interface Props {
  /**
   * The value this tick represents.
   */
  value: number
}

const props = defineProps<Props>()

const setValue = inject<((value: number) => void) | undefined>('sliderSetValue', undefined)

function handleClick () {
  if (setValue) {
    setValue(props.value)
  }
}
</script>

<style lang="scss" scoped>
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

.cat-slider-tick {
  flex: 0 0 auto;
  text-align: center;
  white-space: nowrap;
  font-size: $size-small;
  color: var(--bulma-text-weak);
}

button.cat-slider-tick {
  border: 0;
  background: transparent;
  padding: 0;
  font: inherit;

  &.is-clickable {
    cursor: pointer;
    user-select: none;

    &:hover {
      color: var(--bulma-link-on-scheme);
    }

    &:focus-visible {
      outline: 2px solid var(--bulma-link-on-scheme);
      outline-offset: 2px;
    }
  }
}
</style>
