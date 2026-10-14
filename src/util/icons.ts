import { nextTick, ref, shallowReactive, type Ref } from 'vue'
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

/** Every registered name, in registration order. Reactive. */
export function registeredIcons (): string[] {
  return [...registry.keys()]
}

/** Element id of an icon's `<symbol>` in `<cat-icon-sprite>`. */
export function iconSymbolId (name: string): string {
  return `cat-icon-${name}`
}

export interface IconOptions {
  /**
   * Report a name that is not registered, which would render as the webfont
   * class and show nothing once an app has dropped `@mdi/font`. 'warn' logs once
   * per name outside production; 'error' throws, for test suites.
   */
  strict?: 'warn' | 'error'
  /**
   * Draw each icon as `<use>` of a `<symbol>` that `<cat-icon-sprite>` renders
   * once per page, instead of repeating its path inline.
   */
  sprite?: boolean
}

/**
 * Icon settings and state for one app, provided by the plugin. Per app rather
 * than module-wide, so concurrent server renders cannot share it. The registry
 * itself stays module-wide: it holds static path data, the same for every app.
 */
export interface IconContext extends IconOptions {
  /** Names already warned about, so each is reported once */
  warned: Set<string>
  /**
   * 'pending' until a <cat-icon-sprite> sets up; 'missing' once the app has
   * mounted without one, which makes icons fall back to inline paths.
   */
  spriteState: Ref<'pending' | 'mounted' | 'missing'>
  spriteChecked: boolean
}

export function createIconContext (options: IconOptions = {}): IconContext {
  return { ...options, warned: new Set(), spriteState: ref('pending'), spriteChecked: false }
}

/** Apply `strict` to a name that is not registered. */
export function reportUnregisteredIcon (context: IconContext | undefined, name: string): void {
  if (!context?.strict) {
    return
  }
  const message = `[catenary] Icon "${name}" is not registered, so it renders as the @mdi/font class `
    + `"mdi-${name}", which shows nothing without the webfont. Register it with the plugin's \`icons\` `
    + 'option or registerIcons().'
  if (context.strict === 'error') {
    throw new Error(message)
  }
  // Bare process.env check so bundlers strip it; see radio.vue.
  if (process.env.NODE_ENV !== 'production' && !context.warned.has(name)) {
    context.warned.add(name)
    console.warn(message)
  }
}

/**
 * Called by each icon once mounted in sprite mode. If the app has mounted and no
 * <cat-icon-sprite> has set up, icons switch to inline paths rather than point
 * at symbols that do not exist; a sprite that mounts later (inside a lazily
 * loaded layout, say) switches them back.
 */
export function expectIconSprite (context: IconContext): void {
  if (context.spriteChecked) {
    return
  }
  context.spriteChecked = true
  nextTick(() => {
    if (context.spriteState.value !== 'pending') {
      return
    }
    context.spriteState.value = 'missing'
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[catenary] iconSprite is on but no <cat-icon-sprite> has mounted, so icons render '
        + 'their paths inline until one does. Place <cat-icon-sprite /> once, last in the root layout.'
      )
    }
  })
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
