<template>
  <cat-button :disabled="disabled" :icon-left="iconLeft" :icon-right="iconRight" @click="saveFile">
    {{ label }}
  </cat-button>
</template>

<script setup lang="ts">
import { useDownload } from '../util/download'
import CatButton from './button.vue'

interface Props {
  label?: string
  disabled?: boolean
  filename?: string
  extension?: string
  data?: string
  iconLeft?: string
  iconRight?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Download',
  disabled: false,
  filename: 'export',
  extension: '.json',
  data: '',
  iconLeft: 'download',
  iconRight: undefined
})

const { download } = useDownload()

function saveFile (): void {
  download({
    filename: props.filename + props.extension,
    data: props.data,
    mimeType: 'application/json'
  })
}
</script>
