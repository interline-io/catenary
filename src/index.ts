import type { App, Plugin } from 'vue'

import CatButton from './controls/button.vue'
import CatCard from './controls/card.vue'
import CatCheckbox from './controls/checkbox.vue'
import CatCheckboxGroup from './controls/checkbox-group.vue'
import CatDatepicker from './controls/datepicker.vue'
import CatDownloadCsv from './controls/download-csv.vue'
import CatDownloadJson from './controls/download-json.vue'
import CatDropdown from './controls/dropdown.vue'
import CatDropdownItem from './controls/dropdown-item.vue'
import CatField from './controls/field.vue'
import CatLink from './controls/link.vue'
import CatIcon from './controls/icon.vue'
import CatInput from './controls/input.vue'
import CatLoading from './controls/loading.vue'
import CatModal from './controls/modal.vue'
import CatMsg from './controls/msg.vue'
import CatNotification from './controls/notification.vue'
import CatPagination from './controls/pagination.vue'
import CatRadio from './controls/radio.vue'
import CatSafelink from './controls/safelink.vue'
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
import CatTreeControl from './controls/tree-control.vue'

// Named exports for tree-shaking
export {
  CatButton,
  CatCard,
  CatCheckbox,
  CatCheckboxGroup,
  CatDatepicker,
  CatDownloadCsv,
  CatDownloadJson,
  CatDropdown,
  CatDropdownItem,
  CatField,
  CatIcon,
  CatLink,
  CatInput,
  CatLoading,
  CatModal,
  CatMsg,
  CatNotification,
  CatPagination,
  CatRadio,
  CatSafelink,
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
  CatTooltip,
  CatTreeControl
}

export * from './controls/types'
export { TreeNode } from './util/tree'
export type { TreeNodeConfig, TreeNodeOptions } from './util/tree'
export { sanitizeFilename, sanitizeUrl } from './util/sanitize'
export { useDownload } from './util/download'
export type { DownloadOptions } from './util/download'

// Vue plugin that registers all components globally
export const CatenaryPlugin: Plugin = {
  install (app: App) {
    const components: Record<string, any> = {
      CatButton, CatCard, CatCheckbox, CatCheckboxGroup, CatDatepicker,
      CatDownloadCsv, CatDownloadJson,
      CatDropdown, CatDropdownItem, CatField, CatIcon, CatInput, CatLink,
      CatLoading, CatModal, CatMsg, CatNotification, CatPagination,
      CatRadio, CatSafelink, CatSearchBar, CatSelect, CatSlider, CatSliderTick,
      CatSwitch, CatTabItem, CatTable, CatTableColumn, CatTabs,
      CatTag, CatTaginput, CatTextarea, CatThemeToggle, CatTooltip,
      CatTreeControl
    }
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component)
    }
  }
}

export default CatenaryPlugin
