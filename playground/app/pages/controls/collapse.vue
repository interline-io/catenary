<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Collapse Component
      </h1>
      <p class="subtitle">
        A button that shows and hides a section of content
      </p>

      <demo-box label="Basic">
        <cat-collapse label="Show details">
          <div class="content">
            <p>
              The trigger is a real <code>&lt;button&gt;</code>, so Enter and Space
              work without any custom key handling.
            </p>
          </div>
        </cat-collapse>
      </demo-box>

      <demo-box label="Initially Open">
        <cat-collapse label="Already expanded" :open="true">
          <div class="content">
            <p>Pass <code>:open="true"</code> to start expanded.</p>
          </div>
        </cat-collapse>
      </demo-box>

      <demo-box label="Animated">
        <cat-collapse label="Animated toggle" animated>
          <div class="content">
            <p>
              <code>animated</code> adds a height and opacity transition. It is
              suppressed under <code>prefers-reduced-motion</code>.
            </p>
          </div>
        </cat-collapse>
      </demo-box>

      <demo-box label="Controlled (v-model:open)">
        <cat-collapse v-model:open="basicOpen" label="Controlled">
          <div class="content">
            <p>Bound to a ref, so the parent owns the state.</p>
          </div>
        </cat-collapse>
        <p class="mt-3">
          Open: <strong>{{ basicOpen }}</strong>
          <cat-button class="ml-2" @click="basicOpen = !basicOpen">
            Toggle from outside
          </cat-button>
        </p>
      </demo-box>

      <demo-box label="As a section heading">
        <p class="content">
          Pass <code>heading-level</code> when the collapse introduces a section.
          The trigger is wrapped in a real heading, so screen reader users can
          reach it from the headings list and understand the page structure.
          Without it, no heading is rendered at all.
        </p>
        <cat-collapse label="Methodology" :heading-level="3">
          <div class="content">
            <p>Renders as <code>&lt;h3&gt;&lt;button&gt;Methodology&lt;/button&gt;&lt;/h3&gt;</code>.</p>
          </div>
        </cat-collapse>
        <cat-collapse label="Data sources" :heading-level="3">
          <div class="content">
            <p>A sibling section at the same level.</p>
          </div>
        </cat-collapse>
      </demo-box>

      <demo-box label="Custom trigger and actions">
        <p class="content">
          The <code>#trigger</code> slot replaces the label and icon; it receives
          the current <code>open</code> state. Interactive content belongs in
          <code>#actions</code>, which renders as a sibling of the trigger button
          rather than inside it — a control nested inside another control is
          invalid and swallows its key events.
        </p>
        <cat-collapse>
          <template #trigger="{ open }">
            <span class="icon-text">
              <cat-icon :icon="open ? 'folder-open' : 'folder'" />
              <span>{{ open ? 'Hide files' : 'Show files' }}</span>
            </span>
          </template>
          <template #actions>
            <cat-button size="small" @click="noted = true">
              Action
            </cat-button>
          </template>
          <div class="content">
            <p>Action clicked: <strong>{{ noted }}</strong></p>
          </div>
        </cat-collapse>
      </demo-box>

      <demo-box label="Accordion">
        <p class="content">
          A disclosure is a standalone widget; several of them driven by one
          parent value make an accordion. Bind <code>:open</code> and listen for
          <code>@open</code> to keep a single panel expanded.
        </p>
        <cat-collapse
          v-for="(panel, i) in panels"
          :key="panel.title"
          :label="panel.title"
          :heading-level="3"
          :open="openPanel === i"
          @open="openPanel = i"
          @close="openPanel = -1"
        >
          <div class="content">
            <p>{{ panel.body }}</p>
          </div>
        </cat-collapse>
      </demo-box>

      <demo-box label="Disabled">
        <cat-collapse label="Cannot be toggled" disabled>
          <div class="content">
            <p>Never reachable.</p>
          </div>
        </cat-collapse>
      </demo-box>

      <demo-a11y
        pattern-name="Disclosure (Show/Hide)"
        pattern-url="https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/"
        :references="[
          {
            label: 'WCAG 2.1 — 4.1.2 Name, Role, Value',
            url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
            note: 'the expanded/collapsed state must be exposed programmatically, which aria-expanded provides',
          },
          {
            label: 'WCAG 2.1 — 2.1.1 Keyboard',
            url: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html',
            note: 'a native button is operable by keyboard without scripting',
          },
          {
            label: 'Adrian Roselli — Disclosure Widgets',
            url: 'https://adrianroselli.com/2020/05/disclosure-widgets.html',
            note: 'why the trigger should be a real button, and why aria-controls support is uneven',
          },
        ]"
        :keyboard="[
          { key: 'Tab', description: 'Moves focus to the trigger button.' },
          { key: 'Enter', description: 'Toggles the content. Focus does not move.' },
          { key: 'Space', description: 'Toggles the content. Focus does not move.' },
        ]"
      >
        <template #intro>
          The trigger is a native <code>&lt;button&gt;</code> rather than a
          <code>&lt;div role="button" tabindex="0"&gt;</code>, so its role, focus
          behaviour, keyboard handling and forced-colors rendering all come from
          the platform instead of from hand-written handlers.
        </template>
        <template #notes>
          <ul class="content mt-3">
            <li>
              <strong>Focus stays put on toggle.</strong> The APG recommends
              against moving focus for a simple disclosure, so someone who
              activates it by accident keeps their place and can toggle straight
              back.
            </li>
            <li>
              <strong>The content immediately follows the trigger in the DOM</strong>,
              so a screen reader user reaches it right after activating the
              button with nothing to hunt for. There is deliberately no option to
              render the trigger below the content.
            </li>
            <li>
              <strong>Collapsed content is hidden with <code>display: none</code></strong>,
              which removes it from the accessibility tree <em>and</em> the tab
              order. Hiding it with <code>aria-hidden</code> alone would leave
              focusable children reachable by Tab.
            </li>
            <li>
              <strong><code>aria-controls</code> points at the content.</strong>
              It is optional in the APG and support across assistive technology
              is uneven, but it is harmless and helps where it is supported.
            </li>
            <li>
              <strong>Use <code>heading-level</code> for sections.</strong> The
              button is wrapped in the heading, never the other way round: most
              screen readers do not announce a heading nested inside an
              interactive element, and putting <code>role="button"</code> on the
              heading would drop it from the headings list entirely.
            </li>
            <li>
              The same wiring backs the <code>expandable</code> mode of
              <code>cat-msg</code> and <code>cat-card</code>, so every disclosure
              in the library behaves identically.
            </li>
          </ul>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

const basicOpen = ref(false)
const noted = ref(false)
const openPanel = ref(0)

const panels = [
  { title: 'First panel', body: 'Opening another panel closes this one.' },
  { title: 'Second panel', body: 'The parent owns which panel is open.' },
  { title: 'Third panel', body: 'Each trigger is its own disclosure button.' }
]
</script>
