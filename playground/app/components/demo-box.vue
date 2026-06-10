<template>
  <div class="card demo-box">
    <header class="card-header demo-header" :class="{ 'demo-example': example }">
      <!-- A real heading so screen reader users can jump demo to demo with
           heading navigation (h1 is the page title). -->
      <h2 class="card-header-title">
        {{ label }}
      </h2>
    </header>
    <div class="card-content demo-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Demo box component for playground/documentation pages.
 * This component is only used for demonstration purposes and is not documented.
 *
 * @component demo-box
 * @internal
 */

interface Props {
  /**
   * The section label/title.
   */
  label: string
  /**
   * Whether this is a fully baked example (not just a single-feature demo).
   * When true, adds 'demo-example' class for visual distinction.
   */

  example?: boolean
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.demo-example {
    background-color: var(--bulma-info);
}
</style>
