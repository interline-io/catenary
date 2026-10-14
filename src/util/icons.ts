import { shallowReactive } from 'vue'
import {
  mdiAlert,
  mdiAlertCircle,
  mdiCalendar,
  mdiCheck,
  mdiCheckCircle,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiChevronUp,
  mdiClose,
  mdiCloseCircle,
  mdiContentPaste,
  mdiDownload,
  mdiInformation,
  mdiLink,
  mdiLoading,
  mdiMagnify,
  mdiMenuDown,
  mdiSort,
  mdiSortAscending,
  mdiSortDescending,
  mdiWeatherNight,
  mdiWeatherSunny
} from '@mdi/js'

/**
 * Icon registry: MDI icon name (without the `mdi-` prefix) → SVG path data on
 * MDI's 24×24 grid, as exported by `@mdi/js`.
 *
 * A registered name renders as an inline `<svg>`; any other name falls back to
 * the `@mdi/font` class (`mdi mdi-<name>`), so an app only needs the webfont for
 * icons it has not registered. Catenary registers the icons its own controls
 * use; apps register theirs through the plugin option or `registerIcons()`:
 *
 *   import { mdiAccount } from '@mdi/js'
 *   app.use(CatenaryPlugin, { icons: { account: mdiAccount } })
 *
 * Reactive, so an icon registered after a component has rendered still swaps in.
 */
const registry = shallowReactive(new Map<string, string>())

/** Register icons by MDI name, e.g. `{ account: mdiAccount }`. Later registrations win. */
export function registerIcons (icons: Record<string, string>): void {
  for (const [name, path] of Object.entries(icons)) {
    registry.set(name, path)
  }
}

/** SVG path data for a registered icon, or undefined if the name is not registered. */
export function iconPath (name: string): string | undefined {
  return registry.get(name)
}

// The icons Catenary's own controls render, including their default icon props
registerIcons({
  'alert': mdiAlert,
  'alert-circle': mdiAlertCircle,
  'calendar': mdiCalendar,
  'check': mdiCheck,
  'check-circle': mdiCheckCircle,
  'chevron-down': mdiChevronDown,
  'chevron-left': mdiChevronLeft,
  'chevron-right': mdiChevronRight,
  'chevron-up': mdiChevronUp,
  'close': mdiClose,
  'close-circle': mdiCloseCircle,
  'content-paste': mdiContentPaste,
  'download': mdiDownload,
  'information': mdiInformation,
  'link': mdiLink,
  'loading': mdiLoading,
  'magnify': mdiMagnify,
  'menu-down': mdiMenuDown,
  'sort': mdiSort,
  'sort-ascending': mdiSortAscending,
  'sort-descending': mdiSortDescending,
  'weather-night': mdiWeatherNight,
  'weather-sunny': mdiWeatherSunny
})
