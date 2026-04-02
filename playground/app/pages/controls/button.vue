<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Button Component
      </h1>
      <p class="subtitle">
        Interactive button control with various styles and states
      </p>

      <t-demo-box label="Variants">
        <div class="buttons">
          <cat-button>
            Default
          </cat-button>
          <cat-button v-for="variant in coreVariants" :key="variant" :variant="variant">
            {{ capitalize(variant) }}
          </cat-button>
        </div>
        <div class="buttons">
          <cat-button v-for="variant in additionalVariants" :key="variant" :variant="variant">
            {{ capitalize(variant) }}
          </cat-button>
        </div>
      </t-demo-box>

      <t-demo-box label="Sizes">
        <div class="buttons">
          <cat-button v-for="size in sizes" :key="size" :size="size">
            {{ capitalize(size) }}
          </cat-button>
        </div>
      </t-demo-box>

      <t-demo-box label="Outlined">
        <div class="buttons">
          <cat-button v-for="variant in coreVariants" :key="variant" :variant="variant" outlined>
            {{ capitalize(variant) }}
          </cat-button>
        </div>
        <div class="buttons">
          <cat-button v-for="variant in additionalVariants" :key="variant" :variant="variant" outlined>
            {{ capitalize(variant) }}
          </cat-button>
        </div>
      </t-demo-box>

      <t-demo-box label="Rounded">
        <div class="buttons">
          <cat-button variant="primary" rounded>
            Rounded
          </cat-button>
          <cat-button variant="info" rounded outlined>
            Rounded Outlined
          </cat-button>
        </div>
      </t-demo-box>

      <t-demo-box label="Icon Only">
        <div class="buttons">
          <cat-button variant="primary">
            <cat-icon icon="heart" />
          </cat-button>
          <cat-button variant="info">
            <cat-icon icon="share" />
          </cat-button>
          <cat-button variant="success">
            <cat-icon icon="check" />
          </cat-button>
          <cat-button variant="warning">
            <cat-icon icon="alert" />
          </cat-button>
          <cat-button variant="danger">
            <cat-icon icon="close" />
          </cat-button>
        </div>
      </t-demo-box>

      <t-demo-box label="Icon Props (icon-left / icon-right)">
        <div class="buttons">
          <cat-button variant="primary" icon-left="check">
            Save
          </cat-button>
          <cat-button variant="danger" icon-left="delete">
            Delete
          </cat-button>
          <cat-button variant="info" icon-right="download">
            Download
          </cat-button>
          <cat-button variant="success" icon-left="upload" icon-right="check">
            Upload & Verify
          </cat-button>
        </div>
      </t-demo-box>

      <t-demo-box label="States">
        <div class="buttons">
          <cat-button variant="primary" loading>
            Loading
          </cat-button>
          <cat-button variant="info" disabled>
            Disabled
          </cat-button>
          <cat-button variant="success" @click="handleClick">
            Click Me ({{ clickCount }})
          </cat-button>
        </div>
      </t-demo-box>

      <t-demo-box label="Full Width">
        <cat-button variant="primary" fullwidth>
          Full Width Button
        </cat-button>
      </t-demo-box>

      <t-demo-box label="Button Groups">
        <cat-field addons>
          <cat-button variant="primary">
            Left
          </cat-button>
          <cat-button variant="primary">
            Middle
          </cat-button>
          <cat-button variant="primary">
            Right
          </cat-button>
        </cat-field>

        <cat-field addons>
          <cat-button>
            Yes
          </cat-button>
          <cat-button variant="info">
            Maybe
          </cat-button>
          <cat-button variant="danger">
            No
          </cat-button>
        </cat-field>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CoreVariants, ButtonVariants, ButtonSizes } from '../../../../src/controls/types'
import TDemoBox from '../../components/t-demo-box.vue'

const coreVariants = CoreVariants
const additionalVariants = ButtonVariants.filter(v => !CoreVariants.includes(v as any))
const sizes = ButtonSizes

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const clickCount = ref(0)

const handleClick = () => {
  clickCount.value++
}
</script>
