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

      <demo-box label="Route Key Lookup (no match — falls back to span)">
        <cat-link route-key="nonexistent-key">
          This renders as a span, not a link
        </cat-link>
        <p class="has-text-grey mt-2">
          Inspect the element above — it is a &lt;span class="cat-link-unresolved"&gt;, not an &lt;a&gt;. A development build also logs a console warning for the unmapped key.
        </p>
      </demo-box>

      <demo-box label="Unresolved link styled as a button">
        <cat-link route-key="nonexistent-key" class="button is-primary" @click="clicks++">
          Unresolved button-styled link
        </cat-link>
        <p class="has-text-grey mt-2">
          Renders as inert text that keeps the button's colors but has a not-allowed
          cursor and no hover or press response. The caller's <code>@click</code>,
          <code>tabindex</code> and <code>role</code> are dropped, so it is neither a
          mouse-only control nor a keyboard dead end.
          Clicks counted: {{ clicks }}
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
    </section>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
import { LinkRoutesKey } from '../../../../src/controls/types'
import DemoBox from '../../components/demo-box.vue'

const demoRoutes: Record<string, string> = {
  'button-page': 'controls-button'
}

provide(LinkRoutesKey, demoRoutes)

const clicks = ref(0)
</script>
