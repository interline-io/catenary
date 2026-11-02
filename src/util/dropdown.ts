import type { InjectionKey, Ref } from 'vue'

// The element a cat-dropdown's menu is placed against, when that is not the
// dropdown's own root. cat-split-button provides its whole button group: the
// dropdown inside it wraps only the caret half, so anchoring there would size
// and align the menu to the caret instead of the control the user sees.
//
// cat-dropdown re-provides null to its own children, so a dropdown nested in
// a split button's menu anchors to itself, not to the outer group.
//
// Internal: not exported from the package entry point.
export const DropdownAnchorKey: InjectionKey<Ref<HTMLElement | null> | null> = Symbol('cat-dropdown-anchor')

// Whether an icon is a disclosure caret that should flip while its menu is
// open, as in Material's exposed dropdown menu. Matched by name rather than
// flipping any trailing icon, because a trigger's icon can be anything: a
// `cog` or `account` turned upside down would read as a glitch, not a state.
const CARET_ICON = /^(?:menu|chevron|triangle|triangle-small|pan)-down$/

export function isCaretIcon (name: string | undefined): boolean {
  return !!name && CARET_ICON.test(name)
}
