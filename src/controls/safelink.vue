<template>
  <div class="cat-safelink-outer">
    <div class="cat-safelink">
      <div class="cat-safelink-desc">
        {{ text || sanitizedUrl }}
      </div>
      <button
        v-if="copyValue"
        type="button"
        class="cat-safelink-action"
        :aria-label="copyLabel"
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
        :aria-label="openLabel"
      >
        <i class="mdi mdi-link" aria-hidden="true" />
      </a>
    </div>
    <!-- Copying is silent otherwise: the clipboard write produces no visible
         change, so without this a screen reader user has no confirmation it
         happened. The region is rendered from mount and only its text changes,
         because a role="status" element inserted together with its content is
         announced unreliably. -->
    <div class="is-sr-only" role="status">
      {{ copyStatus }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onBeforeUnmount } from 'vue'
import { sanitizeUrl } from '../util/sanitize'

const props = withDefaults(defineProps<{
  url?: string | null
  text?: string | null
  maxWidth?: string
  /**
   * Announced after a successful copy. The copied value is appended, so a
   * screen reader user hears which of several safelinks on the page acted.
   * @default 'Copied to clipboard'
   */
  copiedLabel?: string
  /**
   * Announced when the clipboard write fails (permissions, insecure context).
   * @default 'Copy failed'
   */
  copyFailedLabel?: string
}>(), {
  url: null,
  text: null,
  maxWidth: '400px',
  copiedLabel: 'Copied to clipboard',
  copyFailedLabel: 'Copy failed'
})

const emit = defineEmits<{
  copy: [text: string]
}>()

const sanitizedUrl = computed((): string | null => {
  return props.url ? sanitizeUrl(props.url) : null
})

const copyValue = computed((): string | null => props.text || sanitizedUrl.value)

// A safelink is typically rendered once per row of a table or list, so a
// constant "Copy to clipboard" would leave a screen reader's elements list
// showing N identical buttons with no way to tell them apart. Naming the
// subject also gives the link's name its destination, which a bare "Open URL
// in new tab" omits.
const copyLabel = computed((): string => `Copy ${copyValue.value} to clipboard`)
const openLabel = computed((): string => `Open ${sanitizedUrl.value} in new tab`)

const copyStatus = ref('')
let statusTimer: ReturnType<typeof setTimeout> | undefined

async function announce (message: string): Promise<void> {
  clearTimeout(statusTimer)
  // Clear first so repeated copies of the same value re-announce: assistive
  // technology reports the change in content, not the assignment. Sequenced
  // with nextTick rather than requestAnimationFrame, which browsers suspend in
  // a backgrounded or unfocused tab — the announcement would simply never
  // arrive, and the clipboard write can itself fail for want of focus.
  copyStatus.value = ''
  await nextTick()
  copyStatus.value = message
  statusTimer = setTimeout(() => { copyStatus.value = '' }, 5000)
}

onBeforeUnmount(() => clearTimeout(statusTimer))

const clipboard = async (): Promise<void> => {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    // Silent failure otherwise: the button did nothing and said nothing.
    announce(props.copyFailedLabel)
    console.warn('Clipboard API not available')
    return
  }

  const textToCopy = copyValue.value
  if (textToCopy) {
    try {
      await navigator.clipboard.writeText(textToCopy)
      announce(`${props.copiedLabel}: ${textToCopy}`)
      emit('copy', textToCopy)
    } catch (error) {
      announce(props.copyFailedLabel)
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
  outline: 2px solid var(--bulma-link-on-scheme);
  outline-offset: -2px;
}

@media only screen and (max-width: 600px) {
  .cat-safelink-desc {
    max-width: 160px;
  }
}
</style>
