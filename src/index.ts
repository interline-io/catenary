import type { App, Plugin } from 'vue'

import CatButton from './controls/button.vue'
import CatCard from './controls/card.vue'
import CatCheckbox from './controls/checkbox.vue'
import CatCheckboxGroup from './controls/checkbox-group.vue'
import CatDatepicker from './controls/datepicker.vue'
import CatDropdown from './controls/dropdown.vue'
import CatDropdownItem from './controls/dropdown-item.vue'
import CatField from './controls/field.vue'
import CatIcon from './controls/icon.vue'
import CatInput from './controls/input.vue'
import CatLoading from './controls/loading.vue'
import CatModal from './controls/modal.vue'
import CatMsg from './controls/msg.vue'
import CatNotification from './controls/notification.vue'
import CatPagination from './controls/pagination.vue'
import CatRadio from './controls/radio.vue'
import CatSearchBar from './controls/search-bar.vue'
import CatSelect from './controls/select.vue'
import CatSlider from './controls/slider.vue'
import CatSliderTick from './controls/slider-tick.vue'
import CatSwitch from './controls/switch.vue'
import CatTabItem from './controls/tab-item.vue'
import CatTable from './controls/table.vue'
import CatTableColumn from './controls/table-column.vue'
import CatTabs from './controls/tabs.vue'
import CatTag from './controls/tag.vue'
import CatTaginput from './controls/taginput.vue'
import CatTextarea from './controls/textarea.vue'
import CatThemeToggle from './controls/theme-toggle.vue'
import CatTooltip from './controls/tooltip.vue'

// Named exports for tree-shaking
export {
  CatButton,
  CatCard,
  CatCheckbox,
  CatCheckboxGroup,
  CatDatepicker,
  CatDropdown,
  CatDropdownItem,
  CatField,
  CatIcon,
  CatInput,
  CatLoading,
  CatModal,
  CatMsg,
  CatNotification,
  CatPagination,
  CatRadio,
  CatSearchBar,
  CatSelect,
  CatSlider,
  CatSliderTick,
  CatSwitch,
  CatTabItem,
  CatTable,
  CatTableColumn,
  CatTabs,
  CatTag,
  CatTaginput,
  CatTextarea,
  CatThemeToggle,
  CatTooltip
}

export * from './controls/types'

// Vue plugin that registers all components globally
export const CatenaryPlugin: Plugin = {
  install (app: App) {
    const components: Record<string, any> = {
      CatButton, CatCard, CatCheckbox, CatCheckboxGroup, CatDatepicker,
      CatDropdown, CatDropdownItem, CatField, CatIcon, CatInput,
      CatLoading, CatModal, CatMsg, CatNotification, CatPagination,
      CatRadio, CatSearchBar, CatSelect, CatSlider, CatSliderTick,
      CatSwitch, CatTabItem, CatTable, CatTableColumn, CatTabs,
      CatTag, CatTaginput, CatTextarea, CatThemeToggle, CatTooltip
    }
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component)
    }
  }
}

export default CatenaryPlugin
