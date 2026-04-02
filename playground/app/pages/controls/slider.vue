<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Slider Component
      </h1>
      <p class="subtitle">
        Range slider with clickable tick marks
      </p>

      <!-- Basic Slider -->
      <demo-box label="Basic Slider">
        <cat-field label="Volume">
          <cat-slider v-model="volume" :min="0" :max="100" />
        </cat-field>
        <p class="has-text-grey">
          Value: {{ volume }}
        </p>
      </demo-box>

      <!-- Variants -->
      <demo-box label="Variants">
        <cat-field v-for="variant in variants" :key="variant" :label="capitalize(variant)">
          <cat-slider v-model="variantValues[variant]" :min="0" :max="100" :variant="variant" />
        </cat-field>
      </demo-box>

      <!-- Slider with Step -->
      <demo-box label="Slider with Step">
        <cat-field label="Rating (step of 0.5)">
          <cat-slider v-model="rating" :min="0" :max="5" :step="0.5" />
        </cat-field>
        <p class="has-text-grey">
          Value: {{ rating }}
        </p>
      </demo-box>

      <!-- Slider with Ticks -->
      <demo-box label="Slider with Clickable Ticks">
        <cat-field label="Time (minutes)">
          <cat-slider v-model="time" :min="0" :max="60" :step="10">
            <cat-slider-tick :value="0">
              0
            </cat-slider-tick>
            <cat-slider-tick :value="10">
              10
            </cat-slider-tick>
            <cat-slider-tick :value="20">
              20
            </cat-slider-tick>
            <cat-slider-tick :value="30">
              30
            </cat-slider-tick>
            <cat-slider-tick :value="40">
              40
            </cat-slider-tick>
            <cat-slider-tick :value="50">
              50
            </cat-slider-tick>
            <cat-slider-tick :value="60">
              60
            </cat-slider-tick>
          </cat-slider>
        </cat-field>
        <p class="has-text-grey">
          Value: {{ time }} minutes
        </p>
      </demo-box>

      <!-- Slider Sizes -->
      <demo-box label="Slider Sizes">
        <cat-field v-for="sliderSize in sizes" :key="sliderSize" :label="capitalize(sliderSize)">
          <cat-slider v-model="sizeValues[sliderSize]" :min="0" :max="100" :size="sliderSize" />
        </cat-field>
      </demo-box>

      <!-- Disabled Slider -->
      <demo-box label="Disabled Slider">
        <cat-field label="Locked Setting">
          <cat-slider v-model="disabled" :min="0" :max="100" disabled />
        </cat-field>
        <p class="has-text-grey">
          Value: {{ disabled }} (cannot be changed)
        </p>
      </demo-box>

      <!-- Slider with Tooltip -->
      <demo-box label="Slider with Tooltip">
        <cat-field label="Brightness">
          <cat-slider v-model="brightness" :min="0" :max="100" tooltip />
        </cat-field>
        <p class="has-text-grey">
          Value: {{ brightness }}%
        </p>
      </demo-box>

      <!-- Multiple Sliders -->
      <demo-box label="Example: Color Mixer" example>
        <cat-field label="Red">
          <cat-slider v-model="red" :min="0" :max="255" />
        </cat-field>
        <cat-field label="Green">
          <cat-slider v-model="green" :min="0" :max="255" />
        </cat-field>
        <cat-field label="Blue">
          <cat-slider v-model="blue" :min="0" :max="255" />
        </cat-field>
        <div
          class="box has-text-centered"
          :style="{ backgroundColor: `rgb(${red}, ${green}, ${blue})`, minHeight: '100px', color: brightness > 128 ? '#000' : '#fff' }"
        >
          <strong>RGB({{ red }}, {{ green }}, {{ blue }})</strong>
        </div>
      </demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { SliderSizes, SliderVariants } from '../../../../src/controls/types'
import DemoBox from '../../components/demo-box.vue'

const sizes = SliderSizes
const variants = SliderVariants

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const volume = ref(50)
const rating = ref(3.5)
const time = ref(30)

const sizeValues = reactive<Record<string, number>>({})
for (const sliderSize of sizes) {
  sizeValues[sliderSize] = sliderSize === 'small' ? 25 : sliderSize === 'normal' ? 50 : sliderSize === 'medium' ? 75 : 100
}

const variantValues = reactive<Record<string, number>>({})
for (const variant of variants) {
  variantValues[variant] = 50
}

const disabled = ref(60)
const brightness = ref(80)

const red = ref(128)
const green = ref(64)
const blue = ref(192)
</script>
