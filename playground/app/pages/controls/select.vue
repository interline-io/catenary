<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Select Component
      </h1>
      <p class="subtitle">
        Dropdown selection control
      </p>

      <t-demo-box label="Basic Select">
        <cat-field label="Choose a country:">
          <cat-select v-model="basic">
            <option value="us">
              United States
            </option>
            <option value="uk">
              United Kingdom
            </option>
            <option value="ca">
              Canada
            </option>
            <option value="au">
              Australia
            </option>
            <option value="de">
              Germany
            </option>
          </cat-select>
        </cat-field>
        <p class="has-text-grey">
          Selected: {{ basic || 'None' }}
        </p>
      </t-demo-box>

      <t-demo-box label="Multiple Selection">
        <cat-field label="Select multiple languages:">
          <cat-select v-model="multiple" multiple>
            <option value="js">
              JavaScript
            </option>
            <option value="py">
              Python
            </option>
            <option value="rb">
              Ruby
            </option>
            <option value="go">
              Go
            </option>
            <option value="rs">
              Rust
            </option>
            <option value="ts">
              TypeScript
            </option>
          </cat-select>
        </cat-field>
        <p class="has-text-grey">
          Selected: {{ Array.isArray(multiple) && multiple.length > 0 ? multiple.join(', ') : 'None' }}
        </p>
      </t-demo-box>

      <t-demo-box label="Variants">
        <cat-field v-for="variant in variants" :key="variant" :label="capitalize(variant) + ':'">
          <cat-select v-model="variantValues[variant]" :variant="variant">
            <option value="1">
              Option 1
            </option>
            <option value="2">
              Option 2
            </option>
            <option value="3">
              Option 3
            </option>
          </cat-select>
        </cat-field>
      </t-demo-box>

      <t-demo-box label="Sizes">
        <cat-field v-for="size in sizes" :key="size" :label="capitalize(size) + ':'">
          <cat-select v-model="sizeValues[size]" :size="size">
            <option value="1">
              {{ capitalize(size) }} select
            </option>
          </cat-select>
        </cat-field>
      </t-demo-box>

      <t-demo-box label="States">
        <cat-field label="Disabled:">
          <cat-select v-model="stateDisabled" disabled>
            <option value="1">
              Cannot select this
            </option>
          </cat-select>
        </cat-field>
        <cat-field label="Loading:">
          <cat-select v-model="stateLoading" loading>
            <option value="1">
              Loading data...
            </option>
          </cat-select>
        </cat-field>
        <cat-field label="Readonly:">
          <cat-select v-model="stateReadonly" readonly>
            <option value="selected">
              Selected option
            </option>
            <option value="other">
              Other option
            </option>
          </cat-select>
        </cat-field>
      </t-demo-box>

      <t-demo-box label="Rounded Style">
        <cat-field label="Choose an option:">
          <cat-select v-model="rounded" rounded>
            <option value="1">
              Rounded option 1
            </option>
            <option value="2">
              Rounded option 2
            </option>
            <option value="3">
              Rounded option 3
            </option>
          </cat-select>
        </cat-field>
      </t-demo-box>

      <t-demo-box label="With Icon">
        <cat-field label="Choose a theme:">
          <cat-select v-model="theme" icon="palette" fullwidth>
            <option value="light">
              Light Theme
            </option>
            <option value="dark">
              Dark Theme
            </option>
            <option value="auto">
              Auto (System)
            </option>
          </cat-select>
        </cat-field>
      </t-demo-box>

      <t-demo-box label="Example: Product Filter" example>
        <div class="columns">
          <div class="column">
            <cat-field label="Category">
              <cat-select v-model="filter.category" fullwidth>
                <option value="">
                  All Categories
                </option>
                <option value="electronics">
                  Electronics
                </option>
                <option value="clothing">
                  Clothing
                </option>
                <option value="books">
                  Books
                </option>
                <option value="home">
                  Home & Garden
                </option>
              </cat-select>
            </cat-field>
          </div>
          <div class="column">
            <cat-field label="Sort By">
              <cat-select v-model="filter.sort" fullwidth>
                <option value="popular">
                  Most Popular
                </option>
                <option value="price-low">
                  Price: Low to High
                </option>
                <option value="price-high">
                  Price: High to Low
                </option>
                <option value="newest">
                  Newest First
                </option>
              </cat-select>
            </cat-field>
          </div>
          <div class="column">
            <cat-field label="Price Range">
              <cat-select v-model="filter.price" fullwidth>
                <option value="all">
                  All Prices
                </option>
                <option value="0-25">
                  $0 - $25
                </option>
                <option value="25-50">
                  $25 - $50
                </option>
                <option value="50-100">
                  $50 - $100
                </option>
                <option value="100+">
                  $100+
                </option>
              </cat-select>
            </cat-field>
          </div>
        </div>
        <p class="has-text-grey">
          Filters: Category={{ filter.category || 'All' }}, Sort={{ filter.sort }}, Price={{ filter.price }}
        </p>
      </t-demo-box>

      <t-demo-box label="Example: Time Zone Selector" example>
        <cat-field label="Select your time zone:">
          <cat-select v-model="timezone" fullwidth>
            <optgroup label="North America">
              <option value="PST">
                Pacific Time (PST)
              </option>
              <option value="MST">
                Mountain Time (MST)
              </option>
              <option value="CST">
                Central Time (CST)
              </option>
              <option value="EST">
                Eastern Time (EST)
              </option>
            </optgroup>
            <optgroup label="Europe">
              <option value="GMT">
                Greenwich Mean Time (GMT)
              </option>
              <option value="CET">
                Central European Time (CET)
              </option>
              <option value="EET">
                Eastern European Time (EET)
              </option>
            </optgroup>
            <optgroup label="Asia">
              <option value="IST">
                India Standard Time (IST)
              </option>
              <option value="CST_CHINA">
                China Standard Time (CST)
              </option>
              <option value="JST">
                Japan Standard Time (JST)
              </option>
            </optgroup>
          </cat-select>
        </cat-field>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { SelectVariants, SelectSizes } from '../../../../src/controls/types'
import TDemoBox from '../../components/t-demo-box.vue'

const variants = SelectVariants
const sizes = SelectSizes

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const basic = ref<string | null | string[]>('us')
const multiple = ref<string | null | string[]>(['js', 'ts'])

const variantValues = reactive<Record<string, string | null | string[]>>({
  primary: '1',
  link: '1',
  info: '1',
  success: '1',
  warning: '1',
  danger: '1'
})

const sizeValues = reactive<Record<string, string | null | string[]>>({
  small: '1',
  normal: '1',
  medium: '1',
  large: '1'
})

const stateDisabled = ref<string | null | string[]>('1')
const stateLoading = ref<string | null | string[]>('1')
const stateReadonly = ref<string | null | string[]>('selected')

const rounded = ref<string | null | string[]>('1')

const filter = ref<{
  category: string | null | string[]
  sort: string | null | string[]
  price: string | null | string[]
}>({
  category: 'electronics',
  sort: 'popular',
  price: 'all'
})

const timezone = ref<string | null | string[]>('PST')
const theme = ref<string | null | string[]>('auto')
</script>
