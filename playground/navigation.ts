export interface NavItem {
  name: string
  path: string
  icon: string
}

export interface NavGroup {
  title: string
  variant: 'primary' | 'info' | 'success' | 'warning'
  items: NavItem[]
}

export const controlsGroups: NavGroup[] = [
  {
    title: 'Form Controls',
    variant: 'primary',
    items: [
      { name: 'Button', path: '/controls/button', icon: 'gesture-tap' },
      { name: 'Checkbox', path: '/controls/checkbox', icon: 'checkbox-marked' },
      { name: 'Checkbox Group', path: '/controls/checkbox-group', icon: 'checkbox-multiple-marked' },
      { name: 'Radio', path: '/controls/radio', icon: 'radiobox-marked' },
      { name: 'Switch', path: '/controls/switch', icon: 'toggle-switch' },
      { name: 'Input', path: '/controls/input', icon: 'form-textbox' },
      { name: 'Textarea', path: '/controls/textarea', icon: 'text' },
      { name: 'Select', path: '/controls/select', icon: 'form-select' },
      { name: 'Taginput', path: '/controls/taginput', icon: 'tag-multiple' },
      { name: 'Datepicker', path: '/controls/datepicker', icon: 'calendar' },
      { name: 'Field', path: '/controls/field', icon: 'form-textbox-password' },
      { name: 'Slider', path: '/controls/slider', icon: 'tune' }
    ]
  },
  {
    title: 'Layout & Navigation',
    variant: 'info',
    items: [
      { name: 'Tabs', path: '/controls/tabs', icon: 'tab' },
      { name: 'Dropdown', path: '/controls/dropdown', icon: 'menu-down' },
      { name: 'Modal', path: '/controls/modal', icon: 'window-restore' },
      { name: 'Card', path: '/controls/card', icon: 'card' },
      { name: 'Link', path: '/controls/link', icon: 'link-variant' }
    ]
  },
  {
    title: 'Data Display',
    variant: 'success',
    items: [
      { name: 'Table', path: '/controls/table', icon: 'table' },
      { name: 'Pagination', path: '/controls/pagination', icon: 'page-first' },
      { name: 'Tag', path: '/controls/tag', icon: 'tag' },
      { name: 'Tree Control', path: '/controls/tree-control', icon: 'file-tree' },
      { name: 'Notification', path: '/controls/notification', icon: 'bell' },
      { name: 'Message', path: '/controls/msg', icon: 'message' },
      { name: 'Safelink', path: '/controls/safelink', icon: 'link' }
    ]
  },
  {
    title: 'Utilities',
    variant: 'warning',
    items: [
      { name: 'Icon', path: '/controls/icon', icon: 'emoticon-happy' },
      { name: 'Loading', path: '/controls/loading', icon: 'loading' },
      { name: 'Tooltip', path: '/controls/tooltip', icon: 'tooltip' },
      { name: 'Search Bar', path: '/controls/search-bar', icon: 'magnify' },
      { name: 'Theme Toggle', path: '/controls/theme-toggle', icon: 'theme-light-dark' },
      { name: 'Download CSV', path: '/controls/download-csv', icon: 'file-delimited' },
      { name: 'Download JSON', path: '/controls/download-json', icon: 'code-json' }
    ]
  }
]

