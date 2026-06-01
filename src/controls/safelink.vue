<template>
  <div class="cat-safelink-outer">
    <div class="cat-safelink">
      <div class="cat-safelink-desc">
        {{ text || sanitizedUrl }}
      </div>
      <button
        v-if="text || sanitizedUrl"
        type="button"
        class="cat-safelink-action"
        aria-label="Copy to clipboard"
        @click="clipboard"
      >
        <i class="mdi mdi-content-paste" aria-hidden="true" />
      </button>
      <a
        v-if="url && sanitizedUrl"
        target="_blank"
        rel="noopener noreferrer"
        :href="sanitizedUrl ?? undefined"
        class="cat-safelink-action"
        aria-label="Open URL in new tab"
      >
        <i class="mdi mdi-link" aria-hidden="true" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { sanitizeUrl } from '../util/sanitize'

const props = withDefaults(defineProps<{
  url?: string | null
  text?: string | null
  maxWidth?: string
}>(), {
  url: null,
  text: null,
  maxWidth: '400px'
})

const emit = defineEmits<{
  copy: [text: string]
}>()

const sanitizedUrl = computed((): string | null => {
  return props.url ? sanitizeUrl(props.url) : null
})

const clipboard = async (): Promise<void> => {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    console.warn('Clipboard API not available')
    return
  }

  const textToCopy = props.text || sanitizedUrl.value
  if (textToCopy) {
    try {
      await navigator.clipboard.writeText(textToCopy)
      emit('copy', textToCopy)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }
}
</script>

<style scoped>
.cat-safelink-outer {
  display: inline-block;
}

.cat-safelink {
  margin: 2px 0;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.cat-safelink-desc {
  color: var(--bulma-link-text);
  background: var(--bulma-background);
  font-family: monospace;
  font-size: 1.2em;
  padding-left: 10px;
  padding-top: 2px;
  padding-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: v-bind(maxWidth);
  white-space: nowrap;
  word-wrap: nowrap;
  line-height: var(--bulma-line-height);
}

.cat-safelink-action {
  width: 30px;
  text-align: center;
  background: var(--bulma-background);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 0;
  color: inherit;
  font: inherit;
  padding: 0;
  text-decoration: none;
}

button.cat-safelink-action:focus-visible,
a.cat-safelink-action:focus-visible {
  outline: 2px solid var(--bulma-link, #485fc7);
  outline-offset: -2px;
}

@media only screen and (max-width: 600px) {
  .cat-safelink-desc {
    max-width: 160px;
  }
}
</style>
