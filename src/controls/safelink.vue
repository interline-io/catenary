<template>
  <div class="cat-safelink-outer">
    <div class="cat-safelink">
      <div class="cat-safelink-desc">
        {{ text || sanitizedUrl }}
      </div>
      <a v-if="text || sanitizedUrl" class="cat-safelink-action" @click="clipboard">
        <i class="mdi mdi-content-paste" title="Copy to clipboard" role="button" />
      </a>
      <a v-if="url && sanitizedUrl" target="_blank" :href="sanitizedUrl ?? undefined" class="cat-safelink-action">
        <i class="mdi mdi-link" title="Open URL" role="button" />
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
}

@media only screen and (max-width: 600px) {
  .cat-safelink-desc {
    max-width: 160px;
  }
}
</style>
