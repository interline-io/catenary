<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Steps Component
      </h1>
      <p class="subtitle">
        A wizard: one panel at a time, with a progress list showing what is done
      </p>

      <demo-box label="Basic">
        <p class="content">
          The consumer owns the value and the forward navigation, so each step
          can gate on its own work. Completed steps stay clickable, so a user
          can go back without being able to skip ahead.
        </p>
        <cat-steps v-model="basicStep" aria-label="Basic example progress">
          <cat-step-item value="1" label="Choose a file">
            <div class="content">
              <p>Pick something to upload.</p>
            </div>
            <cat-button variant="primary" @click="basicStep = '2'">
              Upload
            </cat-button>
          </cat-step-item>
          <cat-step-item value="2" label="Validate">
            <div class="content">
              <p>Checking the file.</p>
            </div>
            <cat-button variant="primary" @click="basicStep = '3'">
              Import
            </cat-button>
          </cat-step-item>
          <cat-step-item value="3" label="Finish">
            <div class="content">
              <p>Done.</p>
            </div>
            <cat-button @click="basicStep = '1'">
              Start over
            </cat-button>
          </cat-step-item>
        </cat-steps>
      </demo-box>

      <demo-box label="Built-in navigation">
        <p class="content">
          <code>has-navigation</code> renders Previous and Next below the
          content, disabled at either end. With no <code>v-model</code> bound
          the stepper keeps the value itself, which is what this demo does.
        </p>
        <cat-steps has-navigation aria-label="Built-in navigation progress">
          <cat-step-item
            v-for="n in 4"
            :key="n"
            :value="String(n)"
            :label="`Step ${n}`"
          >
            <div class="content">
              <p>Panel {{ n }}.</p>
            </div>
          </cat-step-item>
        </cat-steps>
      </demo-box>

      <demo-box label="Labels beside the marker">
        <p class="content">
          <code>label-position="right"</code> puts each label next to its
          marker, with the connector filling the space between.
        </p>
        <cat-steps
          v-model="inlineStep"
          label-position="right"
          clickable
          aria-label="Inline label progress"
        >
          <cat-step-item value="account" label="Account">
            <div class="content">
              <p>Account details.</p>
            </div>
          </cat-step-item>
          <cat-step-item value="plan" label="Plan">
            <div class="content">
              <p>Choose a plan.</p>
            </div>
          </cat-step-item>
          <cat-step-item value="confirm" label="Confirm">
            <div class="content">
              <p>Confirm and pay.</p>
            </div>
          </cat-step-item>
        </cat-steps>
      </demo-box>

      <demo-box label="Vertical">
        <cat-steps
          v-model="verticalStep"
          orientation="vertical"
          has-navigation
          aria-label="Vertical progress"
        >
          <cat-step-item value="1" label="Collect data">
            <div class="content">
              <p>Vertical steppers put the panel beside the list.</p>
            </div>
          </cat-step-item>
          <cat-step-item value="2" label="Review results">
            <div class="content">
              <p>Labels always sit beside the marker here.</p>
            </div>
          </cat-step-item>
          <cat-step-item value="3" label="Publish">
            <div class="content">
              <p>Last step.</p>
            </div>
          </cat-step-item>
        </cat-steps>
      </demo-box>

      <demo-box label="A step that failed">
        <p class="content">
          A step carries its own <code>variant</code> and <code>icon</code>, so
          one that failed can be marked without recoloring the rest. The icon
          is decorative — say what happened in the panel, where everyone can
          read it.
        </p>
        <cat-steps v-model="failedStep" clickable aria-label="Failed step progress">
          <cat-step-item value="1" label="Upload">
            <div class="content">
              <p>The archive uploaded.</p>
            </div>
          </cat-step-item>
          <cat-step-item value="2" label="Validate" variant="danger" icon="alert-circle">
            <cat-notification variant="danger">
              Validation failed: 3 files could not be parsed.
            </cat-notification>
          </cat-step-item>
          <cat-step-item value="3" label="Import">
            <div class="content">
              <p>Blocked until validation passes.</p>
            </div>
          </cat-step-item>
        </cat-steps>
      </demo-box>

      <demo-box label="Read-only progress">
        <p class="content">
          <code>:clickable="false"</code> renders the list as a progress display
          with no buttons at all — for a sequence the user cannot steer, such as
          a job running server-side.
        </p>
        <cat-steps :model-value="jobStep" :clickable="false" aria-label="Job progress">
          <cat-step-item value="queued" label="Queued">
            <div class="content">
              <p>Waiting for a worker.</p>
            </div>
          </cat-step-item>
          <cat-step-item value="running" label="Running">
            <div class="content">
              <p>Processing.</p>
            </div>
          </cat-step-item>
          <cat-step-item value="done" label="Done">
            <div class="content">
              <p>Finished.</p>
            </div>
          </cat-step-item>
        </cat-steps>
        <div class="buttons mt-4">
          <cat-button size="small" @click="jobStep = 'queued'">
            Queued
          </cat-button>
          <cat-button size="small" @click="jobStep = 'running'">
            Running
          </cat-button>
          <cat-button size="small" @click="jobStep = 'done'">
            Done
          </cat-button>
        </div>
      </demo-box>

      <demo-box label="Custom navigation">
        <p class="content">
          The <code>#navigation</code> slot receives the same state the built-in
          buttons use, so a wizard can gate Next on its own validity check.
        </p>
        <cat-steps v-model="customStep" aria-label="Custom navigation progress">
          <cat-step-item value="1" label="Name">
            <cat-field label="Feed name">
              <cat-input v-model="feedName" placeholder="Required to continue" />
            </cat-field>
          </cat-step-item>
          <cat-step-item value="2" label="Confirm">
            <div class="content">
              <p>Saving <strong>{{ feedName }}</strong>.</p>
            </div>
          </cat-step-item>
          <template #navigation="{ previous, next, hasPrevious, hasNext }">
            <cat-button :disabled="!hasPrevious" @click="previous">
              Back
            </cat-button>
            <cat-button
              variant="primary"
              :disabled="!hasNext || !feedName"
              @click="next"
            >
              Continue
            </cat-button>
          </template>
        </cat-steps>
      </demo-box>

      <demo-box label="Sizes">
        <div v-for="size in StepsSizes" :key="size" class="mb-5">
          <p class="heading">
            {{ size }}
          </p>
          <cat-steps
            :size="size"
            :model-value="'2'"
            :clickable="false"
            :aria-label="`${size} size progress`"
          >
            <cat-step-item value="1" label="First" />
            <cat-step-item value="2" label="Second" />
            <cat-step-item value="3" label="Third" />
          </cat-steps>
        </div>
      </demo-box>

      <demo-box label="Variants">
        <div v-for="variant in StepsVariants" :key="variant" class="mb-5">
          <p class="heading">
            {{ variant }}
          </p>
          <cat-steps
            :variant="variant"
            :model-value="'2'"
            :clickable="false"
            :aria-label="`${variant} variant progress`"
          >
            <cat-step-item value="1" label="First" />
            <cat-step-item value="2" label="Second" />
            <cat-step-item value="3" label="Third" />
          </cat-steps>
        </div>
      </demo-box>

      <demo-a11y
        :references="[
          {
            label: 'WAI-ARIA — aria-current',
            url: 'https://www.w3.org/TR/wai-aria-1.2/#aria-current',
            note: 'aria-current=\'step\' is the defined way to mark the current item of a sequence',
          },
          {
            label: 'WCAG 2.1 — 1.3.1 Info and Relationships',
            url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
            note: 'the order and grouping shown visually has to be in the markup, which the ordered list provides',
          },
          {
            label: 'WCAG 2.1 — 2.4.3 Focus Order',
            url: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html',
            note: 'why focus moves into the new panel after the user changes step',
          },
          {
            label: 'GOV.UK Design System — Step by step navigation',
            url: 'https://design-system.service.gov.uk/patterns/step-by-step-navigation/',
            note: 'the list-plus-aria-current shape this follows',
          },
        ]"
        :keyboard="[
          { key: 'Tab', description: 'Moves through the step markers, then into the panel content.' },
          { key: 'Enter / Space', description: 'Activates a reachable step marker. Markers are native buttons, so this is the platform behavior.' },
        ]"
      >
        <template #intro>
          There is no WAI-ARIA Authoring Practices pattern for a stepper, so this
          is not modeled on one. The progress list is an ordered list with
          <code>aria-current="step"</code> on the active item — the shape used by
          the GOV.UK, USWDS, Preline and Flowbite step indicators.
        </template>
        <template #notes>
          <ul class="content mt-3">
            <li>
              <strong>Not the tabs pattern</strong>, which Oruga and Buefy both
              use for their steppers. Tabs are interchangeable views of one
              thing, reachable in any order, and their arrow-key model assumes
              exactly that. Steps are a sequence: the order matters, most of them
              cannot be reached yet, and moving between them is the task rather
              than a way to look at something else.
            </li>
            <li>
              <strong>Every step's state is announced.</strong>
              <code>aria-current="step"</code> marks the current one; the others
              carry visually hidden "Completed" or "Not completed" text, because
              a filled circle and a check glyph say nothing to a screen reader.
              Both strings are props, for translation.
            </li>
            <li>
              <strong>Markers that cannot be reached yet are
                <code>aria-disabled</code>, not <code>disabled</code>.</strong>
              They stay focusable, so a keyboard user can read ahead through the
              steps instead of tabbing past a gap, and the element type never
              changes as the user advances — swapping a focused button for a
              span would drop focus to the body mid-wizard. The current step is
              exempt: activating it does nothing either, but "unavailable" is
              the wrong word for where the user already is, and it would blur
              the one distinction this control exists to draw.
            </li>
            <li>
              <strong>Focus follows the user into the new panel</strong>, but
              only when the change came from inside the component. Each panel is
              a group named by its step label, so landing there announces which
              step it is. A change driven from outside — the app advancing after
              an upload finishes — leaves focus alone rather than yanking it out
              of whatever the user was doing.
            </li>
            <li>
              <strong>Inactive panels are hidden with
                <code>display: none</code></strong>, which takes them out of the
              accessibility tree and the tab order together. Their fields stay
              mounted, so a user who steps back finds what they typed.
            </li>
            <li>
              Name the list with <code>aria-label</code> or
              <code>aria-labelledby</code> whenever a page has more than one
              stepper.
            </li>
          </ul>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { StepsSizes, StepsVariants } from '../../../../src/controls/types'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

const basicStep = ref('1')
const inlineStep = ref('account')
const verticalStep = ref('1')
const failedStep = ref('2')
const customStep = ref('1')
const jobStep = ref('running')
const feedName = ref('')
</script>
