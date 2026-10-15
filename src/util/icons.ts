import { nextTick, ref, shallowReactive, type InjectionKey, type Ref } from 'vue'
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
 *
 * Internal, and deliberately not exported from the package: the sprite fields
 * are a small state machine that a consumer-provided context could corrupt.
 */
export interface IconContext extends IconOptions {
  /** Names already warned about, so each is reported once */
  warned: Set<string>
  /**
   * <cat-icon-sprite>s currently set up and active. A count rather than a flag:
   * when one layout replaces another, the incoming sprite can set up before the
   * outgoing one unmounts, and a flag the outgoing one cleared would report no
   * sprite while one is on the page.
   */
  sprites: Ref<number>
  /**
   * True once the app has gone a tick with sprite mode on and no sprite, which
   * makes icons fall back to inline paths. Until then they assume the sprite is
   * still to come (it renders last), which is what server and client agree on,
   * so hydration matches.
   */
  spriteMissing: Ref<boolean>
  /** A check for a missing sprite is queued, so many icons queue one between them */
  spriteCheckQueued: boolean
}

/**
 * Injection key for the app's icon settings (`strictIcons`, `iconSprite`),
 * provided by the plugin. Absent when components are imported individually,
 * which means the defaults: inline paths, no strict reporting. Internal, like
 * IconContext; it lives here rather than in types.ts, which the package
 * re-exports wholesale.
 */
export const IconContextKey: InjectionKey<IconContext> = Symbol('catIcons')

export function createIconContext (options: IconOptions = {}): IconContext {
  return { ...options, warned: new Set(), sprites: ref(0), spriteMissing: ref(false), spriteCheckQueued: false }
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
 * Check, a tick from now, that a <cat-icon-sprite> is on the page. Called by
 * each icon once mounted in sprite mode, and by a sprite as it goes away. With
 * none, icons switch to inline paths rather than point at symbols that do not
 * exist; a sprite that sets up later (inside a lazily loaded layout, say)
 * switches them back. Runs every time it is needed, not once per app, so a
 * later layout that drops the sprite is caught too.
 */
export function expectIconSprite (context: IconContext): void {
  if (context.spriteCheckQueued || context.sprites.value > 0) {
    return
  }
  context.spriteCheckQueued = true
  nextTick(() => {
    context.spriteCheckQueued = false
    if (context.sprites.value > 0 || context.spriteMissing.value) {
      return
    }
    context.spriteMissing.value = true
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[catenary] iconSprite is on but no <cat-icon-sprite> is mounted, so icons render '
        + 'their paths inline until one is. Place <cat-icon-sprite /> once, last in the root layout.'
      )
    }
  })
}

/** Called by a <cat-icon-sprite> as it sets up or is reactivated by <KeepAlive>. */
export function spriteActivated (context: IconContext): void {
  context.sprites.value++
  context.spriteMissing.value = false
}

/** Called by a <cat-icon-sprite> as it unmounts or is deactivated by <KeepAlive>. */
export function spriteDeactivated (context: IconContext): void {
  context.sprites.value--
  expectIconSprite(context)
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
