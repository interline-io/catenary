<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Link Component
      </h1>
      <p class="subtitle">
        Smart router link with route key lookup and fallback to plain text
      </p>

      <demo-box label="Direct Route (using :to)">
        <cat-link :to="{ name: 'controls-button' }">
          Go to Button page
        </cat-link>
      </demo-box>

      <demo-box label="Route Key Lookup (matched)">
        <p class="mb-2">
          Route map provides: <code>{{ JSON.stringify(demoRoutes) }}</code>
        </p>
        <cat-link route-key="button-page">
          Link via route key
        </cat-link>
      </demo-box>

      <demo-box label="Unmapped key that is itself a route name">
        <p class="mb-2">
          <code>controls-input</code> is not in the map above, but it is a real route
          name, so it resolves anyway — a host whose route names already match the
          keys needs no map entry.
        </p>
        <cat-link route-key="controls-input">
          Link via an unmapped key
        </cat-link>
      </demo-box>

      <demo-box label="Unresolvable key — falls back to an inert span">
        <cat-link route-key="nonexistent-key">
          This renders as a span, not a link
        </cat-link>
        <p class="has-text-grey mt-2">
          Inspect the element above — it is a &lt;span&gt;, not an &lt;a&gt;, and the
          console carries a development warning naming the key.
        </p>
        <p class="mt-4 mb-2">
          The hazard is that the fallback keeps whatever classes it was given. Both
          of these look like buttons; only the first one is one:
        </p>
        <div class="buttons">
          <cat-link route-key="button-page" class="button is-primary">
            Real link
          </cat-link>
          <cat-link route-key="nonexistent-key" class="button is-primary">
            Inert look-alike
          </cat-link>
        </div>
        <p class="has-text-grey mt-2">
          Tab through them: focus skips the second entirely.
        </p>
      </demo-box>

      <demo-box label="Route Key with Params">
        <cat-link route-key="button-page" :to="{ query: { example: 'true' } }">
          Link with query params merged
        </cat-link>
      </demo-box>

      <demo-box label="No :to and no routeKey (falls back to span)">
        <cat-link>
          Plain text, no link
        </cat-link>
      </demo-box>

      <demo-a11y
        :references="[
          { label: 'WCAG SC 4.1.2: Name, Role, Value', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html' },
          { label: 'WCAG SC 2.1.1: Keyboard', url: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html' },
          { label: 'WCAG SC 2.4.4: Link Purpose (In Context)', url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html' },
        ]"
        :keyboard="[
          { key: 'Tab / Shift+Tab', description: 'Moves focus through resolved links. An unresolved one is a <span> and is skipped entirely.' },
          { key: 'Enter', description: 'Follows the link. Standard RouterLink behavior; nothing is intercepted.' },
        ]"
      >
        <template #intro>
          When a destination resolves, <code>cat-link</code> renders a vue-router <code>RouterLink</code> — a real <code>&lt;a href&gt;</code> with a link role, keyboard activation and the browser's own affordances. The accessible name is the slot content, so give it text that makes sense out of context; a list of links all reading "here" is useless to anyone navigating by links.
        </template>
        <template #notes>
          <p class="mt-3">
            <strong>The unresolved fallback is the thing to know about.</strong> If neither <code>to</code> nor <code>route-key</code> resolves, the component renders a <code>&lt;span&gt;</code> so the content is not lost. That span keeps the classes it was given — and consumers commonly style these as buttons — so it can look exactly like a link while having no link role, no focusability and no behavior on click or <kbd>Enter</kbd>. A sighted mouse user sees a button that does nothing; a keyboard user never reaches it; a screen reader announces plain text.
          </p>
          <p class="mt-3">
            There is no markup fix for this inside the component: stripping the caller's classes would be a surprise, and rendering nothing would drop content. So it is surfaced instead — in development, an unresolved link warns in the console and names the key it could not resolve.
          </p>
          <p class="mt-3">
            <strong>Prefer resolution over the fallback.</strong> A <code>route-key</code> not present in the injected map is now tried as a route name directly, so a host whose route names already match the keys needs no map at all. The map is for remapping a canonical key into a host's own namespace. Only a key that matches neither falls through to the span.
          </p>
          <p class="mt-3">
            <strong><code>title</code> is not an accessible name.</strong> The <code>title</code> prop sets the native attribute, which is inconsistently announced and unavailable to touch and keyboard users. Put the name in the link text; use <code>title</code> only for genuinely supplementary detail.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import { LinkRoutesKey } from '../../../../src/controls/types'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

const demoRoutes: Record<string, string> = {
  'button-page': 'controls-button'
}

provide(LinkRoutesKey, demoRoutes)
</script>
