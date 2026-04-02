import type { App, Plugin } from 'vue'

import TButton from './controls/button.vue'
import TCard from './controls/card.vue'
import TCheckbox from './controls/checkbox.vue'
import TCheckboxGroup from './controls/checkbox-group.vue'
import TDatepicker from './controls/datepicker.vue'
import TDropdown from './controls/dropdown.vue'
import TDropdownItem from './controls/dropdown-item.vue'
import TField from './controls/field.vue'
import TIcon from './controls/icon.vue'
import TInput from './controls/input.vue'
import TLoading from './controls/loading.vue'
import TModal from './controls/modal.vue'
import TMsg from './controls/msg.vue'
import TNotification from './controls/notification.vue'
import TPagination from './controls/pagination.vue'
import TRadio from './controls/radio.vue'
import TSearchBar from './controls/search-bar.vue'
import TSelect from './controls/select.vue'
import TSlider from './controls/slider.vue'
import TSliderTick from './controls/slider-tick.vue'
import TSwitch from './controls/switch.vue'
import TTabItem from './controls/tab-item.vue'
import TTable from './controls/table.vue'
import TTableColumn from './controls/table-column.vue'
import TTabs from './controls/tabs.vue'
import TTag from './controls/tag.vue'
import TTaginput from './controls/taginput.vue'
import TTextarea from './controls/textarea.vue'
import TThemeToggle from './controls/theme-toggle.vue'
import TTooltip from './controls/tooltip.vue'

// Named exports for tree-shaking
export {
  TButton,
  TCard,
  TCheckbox,
  TCheckboxGroup,
  TDatepicker,
  TDropdown,
  TDropdownItem,
  TField,
  TIcon,
  TInput,
  TLoading,
  TModal,
  TMsg,
  TNotification,
  TPagination,
  TRadio,
  TSearchBar,
  TSelect,
  TSlider,
  TSliderTick,
  TSwitch,
  TTabItem,
  TTable,
  TTableColumn,
  TTabs,
  TTag,
  TTaginput,
  TTextarea,
  TThemeToggle,
  TTooltip
}

export * from './controls/types'

// Vue plugin that registers all components globally
export const CatenaryPlugin: Plugin = {
  install (app: App) {
    const components: Record<string, any> = {
      TButton, TCard, TCheckbox, TCheckboxGroup, TDatepicker,
      TDropdown, TDropdownItem, TField, TIcon, TInput,
      TLoading, TModal, TMsg, TNotification, TPagination,
      TRadio, TSearchBar, TSelect, TSlider, TSliderTick,
      TSwitch, TTabItem, TTable, TTableColumn, TTabs,
      TTag, TTaginput, TTextarea, TThemeToggle, TTooltip
    }
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component)
    }
  }
}

export default CatenaryPlugin
