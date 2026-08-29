<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Safelink Component
      </h1>
      <p class="subtitle">
        URL display with copy-to-clipboard and safe external link
      </p>

      <demo-box label="Basic URL">
        <cat-safelink url="https://example.com/page" @copy="onCopy" />
        <p v-if="lastCopied" class="has-text-grey mt-2">
          Copied: {{ lastCopied }}
        </p>
      </demo-box>

      <demo-box label="With Custom Display Text">
        <cat-safelink url="https://example.com/very/long/path/to/resource" text="example.com/resource" @copy="onCopy" />
      </demo-box>

      <demo-box label="Long URL (Truncated)">
        <cat-safelink url="https://example.com/very/long/path/to/some/deeply/nested/resource/that/should/be/truncated" @copy="onCopy" />
      </demo-box>

      <demo-box label="Custom Max Width">
        <p class="mb-2">
          max-width: 200px
        </p>
        <cat-safelink url="https://example.com/long/path" max-width="200px" @copy="onCopy" />
        <p class="mt-4 mb-2">
          max-width: 600px
        </p>
        <cat-safelink url="https://example.com/long/path/to/some/resource" max-width="600px" @copy="onCopy" />
      </demo-box>

      <demo-box label="No URL (Nothing Rendered)">
        <cat-safelink @copy="onCopy" />
        <p class="has-text-grey">
          (Component renders nothing when no URL is provided)
        </p>
      </demo-box>

      <demo-box label="Example: Multiple Links" example>
        <div v-for="link in links" :key="link.url" class="mb-3">
          <strong>{{ link.label }}:</strong>
          <cat-safelink :url="link.url" @copy="onCopy" />
        </div>
      </demo-box>

      <demo-a11y
        :references="[
          { label: 'WCAG SC 2.4.4: Link Purpose (In Context)', url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html' },
        ]"
        :keyboard="[
          { key: 'Tab / Shift+Tab', description: 'Moves focus to the copy button, then to the external-link anchor (when `url` is provided).' },
          { key: 'Enter / Space', description: 'When focus is on the copy button, copies the URL or text to the clipboard.' },
          { key: 'Enter', description: 'When focus is on the external-link anchor, opens the URL in a new tab.' },
        ]"
      >
        <template #intro>
          The copy action is a real <code>&lt;button&gt;</code>; the external-link variant is an <code>&lt;a target="_blank" rel="noopener noreferrer"&gt;</code>. URLs are sanitized to block <code>javascript:</code> and other unsafe schemes before being assigned to <code>href</code>.
        </template>
        <template #notes>
          <p class="mt-3">
            Both controls are named after their subject — <code>Copy https://example.com/… to clipboard</code>, <code>Open https://example.com/… in new tab</code> — rather than with a constant string. A safelink is usually rendered once per row of a table, so identical names would leave a screen reader's elements list showing several indistinguishable buttons, and a bare "Open URL in new tab" never says where it goes (WCAG 2.4.4).
          </p>
          <p class="mt-2">
            Copying produces no visible change, so the result is announced through a visually hidden <code>role="status"</code>. That region is rendered from mount and only its text changes: a live region inserted together with its content is announced unreliably. <code>copied-label</code> and <code>copy-failed-label</code> are props for translation.
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

const lastCopied = ref<string | null>(null)

function onCopy (text: string) {
  lastCopied.value = text
  setTimeout(() => {
    lastCopied.value = null
  }, 2000)
}

const links = [
  { label: 'Homepage', url: 'https://example.com' },
  { label: 'Documentation', url: 'https://docs.example.com/getting-started' },
  { label: 'API Reference', url: 'https://api.example.com/v2/reference' }
]
</script>
