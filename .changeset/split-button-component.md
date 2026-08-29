---
"@interline-io/catenary": minor
---

New `cat-split-button`: a primary action with an attached dropdown of related actions.

Bulma has no split button. `.buttons.has-addons` joins adjacent `.button` siblings, but a dropdown trigger sits inside `.dropdown > .dropdown-trigger`, so it is the only child of its own parent and matches both `:first-child` and `:last-child` — none of Bulma's corner or border-collapse rules ever reach it. The component composes `cat-button` and `cat-dropdown` and supplies the missing CSS.

## API

- Action half: `label` (or the `label` slot), `variant`, `size`, `icon-left`, `loading`, `disabled`, `outlined`, `inverted`, `fullwidth`, `type`. Emits `click`.
- Dropdown half: `toggle-icon` (default `menu-down`), `toggle-label`, `toggle-disabled`. The default slot takes `cat-dropdown-item`s and emits `select` with the activated item's value, plus `open` / `close`. Exposes `open()`, `close()`, `toggle()`.
- `position` (default `bottom-right`) and `menu-width` control the menu; right-aligned by default so it lines up with the right edge of the whole control rather than hanging off the caret.
- `loading` spins the action half and leaves the menu usable; `disabled` disables both halves, `toggle-disabled` only the caret.

## CSS

- The facing corners are squared and the halves pulled together by 1px against the component's own classes, since Bulma's sibling-based rules cannot match through the two wrapper elements.
- The filled variants register `--bulma-button-border-width: 0`, so with no border to collapse the two halves render as one unbroken block of color and the split disappears. A 1px seam is drawn from `currentcolor`, which tracks both the variant and the light/dark scheme — `is-light` gets a dark seam, `is-primary` a light one, with no color hardcoded per theme. Its opacity is set for WCAG 1.4.11 (3:1 non-text contrast), since on a filled variant the seam is the only thing identifying the control as two independently actionable buttons. Only `is-outlined` is excluded, because only it restores a real border: `is-inverted` sets background and color alone, so an inverted button needs the seam just as much.
- The root is `inline-flex` rather than the block-level `.buttons` default, and drops the `%block` spacing `.buttons` inherits. Both matter: the component is one control, and a full-width block that sits 1.5rem proud of its neighbors misaligns any toolbar it is dropped into.

## Accessibility

Modeled on the [Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) pattern. The two halves are separately focusable controls — a single element cannot expose both an action and a popup. `aria-haspopup` / `aria-controls` / `aria-expanded` sit on the caret only.

The caret renders no text, so it takes an accessible name from `toggle-label`, defaulting to `"More <label> options"` so several split buttons on one page stay distinguishable. The derived form is used only when `label` is the text actually on screen — if the `label` slot has replaced it, the caret falls back to `"More options"` rather than naming itself after something invisible (WCAG 2.5.3).

Fallthrough attributes (`id`, `form`, `aria-describedby`, `data-*`) land on the action button; `class` and `style` stay on the wrapper, which is the control as a whole. Without that split a stray `tabindex` would add a phantom tab stop ahead of both real buttons and `form` would never associate. The exposed `open()` / `close()` / `toggle()` forward their arguments to `cat-dropdown` and no-op while the caret is disabled, so the menu cannot be opened against a control that cannot be focused.

Checked with axe-core in the playground in both light and dark themes; the automated suite scans the open menu under jsdom, where contrast rules cannot run.

## Fix: `cat-dropdown` menu placement classes

`position` interpolated straight into the class name, emitting `is-bottom-right` / `is-top-left` / `is-top-right` — none of which Bulma has a rule for, so the CSS fallback always rendered bottom-left regardless of the prop. Now maps to Bulma's actual `is-right` and `is-up`, matching what `cat-datepicker` already did, with test coverage that neither name drifts again.

Emitting the real class names activates Bulma placement rules that tie the `[popover]` reset in `cat-dropdown` and `cat-datepicker` on specificity, which would have left menu geometry depending on the order a consumer imports the `bulma` peerDependency. Both resets are now scoped a class deeper so they win outright.

Also in `cat-dropdown`: `focusableTrigger()` skips a disabled element, since `.focus()` no-ops on one and closing the menu would drop focus to `<body>`; and `open()` no longer re-emits `open` for a menu that is already open (clicking a trigger and then pressing ArrowDown fired it twice).
