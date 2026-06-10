# @interline-io/catenary

## 0.6.0

### Minor Changes

- [#41](https://github.com/interline-io/catenary/pull/41) [`b53a896`](https://github.com/interline-io/catenary/commit/b53a89647a3c2d6a92ddfb07634e2dc2393cf229) Thanks [@drewda](https://github.com/drewda)! - `cat-datepicker` gains an `#addon` slot that appends extra controls to the input's Bulma addon group, after the calendar toggle button. Use it to attach actions like a clear button so they render as part of the field instead of floating beside it: `<template #addon><cat-button icon="close" aria-label="Clear date" /></template>`. Slot content should be addon-shaped (a `.control` wrapping a `.button`); `cat-button` renders exactly that.

## 0.5.0

### Minor Changes

- [#30](https://github.com/interline-io/catenary/pull/30) [`6696c58`](https://github.com/interline-io/catenary/commit/6696c583c4b0e6733896cf216c7e4e0a1fc13226) Thanks [@drewda](https://github.com/drewda)! - `cat-datepicker` rebuilt as a standalone WAI-ARIA date picker dialog, fixing screen reader access. Accessibility testing found the picker effectively unusable with a screen reader: the calendar rendered inside the wrapping `cat-dropdown`'s `role="menu"` container (invalid ARIA composition that breaks screen reader navigation modes), the input exposed no popup semantics, the month/year selects had no accessible names and duplicated the wrapping `cat-field`'s input id, and manual typing was unsupported. The component no longer wraps `cat-dropdown`; it follows the APG date picker dialog pattern directly.

  New trigger structure and typed entry:

  - The input is typeable and pairs with an attached calendar toggle button (Bulma `has-addons`) carrying `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls`. The toggle button's accessible name includes the current selection (`Choose date, 2026-06-15`), configurable via the new `ariaToggleLabel` prop.
  - Typed dates commit on Enter or when focus leaves the input; text that does not parse reverts to the current selection. A visually-hidden `role="status"` region announces commits (`Date set to ...`) and reverts (`Invalid date, reverted to ...`), configurable via the new `ariaDateSetLabel` and `ariaDateInvalidLabel` props. A visually-hidden format hint (`Date format: YYYY-MM-DD`) is bound to the input via `aria-describedby`, and the placeholder defaults to the format.
  - Typed dates are deliberately not restricted by `minDate`/`maxDate`/`unselectableDates`; they are emitted as-is so consumers can show their own validation messaging. The constraints still restrict calendar selection.
  - The `dateFormat` prop is now honored for display and typed parsing (it was previously ignored; display was always `yyyy-MM-dd`). The `date-string` model remains `yyyy-MM-dd` regardless of `dateFormat`.
  - In `multiple` mode, the input accepts a comma-separated list and commits only if every part parses.
  - New `ariaLabel` prop names the input when the datepicker is not paired with a visible `cat-field` label.

  Calendar dialog fixes:

  - The popup container no longer carries `role="menu"`; the `role="dialog"` calendar is the outermost popup semantic.
  - The month/year selects get unique ids (previously they inherited the wrapping `cat-field`'s id, duplicating the input's id) and the `ariaSelectMonthLabel`/`ariaSelectYearLabel` props are now actually bound (they previously existed but were unused).
  - The day grid gains a `role="columnheader"` row (weekday headers now rotate with `firstDayOfWeek`; previously they stayed Sunday-first and misaligned), real row elements instead of `display: contents` (which strips semantics in some browsers), a full-date `aria-label` on every day button (`June 15, 2026`), and `aria-current="date"` on today. Each `role="gridcell"` is a wrapper around a plain button (VoiceOver reads a gridcell's content separately from its name, so role-on-the-button double-announced the day), with `aria-selected` on the cell. A polite live region announces month/year changes from the prev/next buttons and PageUp/PageDown. New `dayNamesLong` prop supplies the announced header names.
  - Focus management per the APG dialog pattern: opening moves focus to the selected day (or nearest selectable day), Escape and date selection return focus to the toggle button, tabbing out of the dialog closes it, and outside clicks close without stealing focus. The year select includes the focused year even when a typed selection falls outside `yearsRange`.

  Removed (both were documented but nonfunctional): the `openOnFocus` prop (never implemented; the input no longer toggles the calendar on click or focus, only the button opens it) and the `focus`/`blur` emits (never fired). The default left input icon also changes from `calendar` to none, since the toggle button now carries the calendar icon (pass `icon="calendar"` to restore it); the toggle icon is configurable via the new `iconToggle` prop.

  `cat-dropdown` is unchanged in behavior; its outside-click and document-Escape handling moved to a shared internal `useDismissablePopup` composable that the datepicker also uses.

  ### CSS impact

  Existing `<cat-datepicker>` templates keep working, but the rendered trigger markup changed. Grep your consumer for these patterns:

  - The input now sits inside `.cat-datepicker-field` (a `field has-addons` div) within `.dropdown-trigger`, next to a new `.cat-datepicker-toggle` button. Selectors assuming the input was the only child of `.dropdown-trigger` need updating, and layouts sized to the bare input now include the attached button.
  - The `.dropdown` root carries `.cat-datepicker-dropdown` but no longer `.cat-dropdown`; selectors like `.cat-dropdown.cat-datepicker-dropdown` won't match.
  - The weekday header row (`.cat-datepicker-weekdays`) moved inside `.cat-datepicker-days`, week rows (`.cat-datepicker-row`) are now `display: grid` instead of `display: contents`, and each day button sits inside a `.cat-datepicker-cell` wrapper div.

- [#30](https://github.com/interline-io/catenary/pull/30) [`6696c58`](https://github.com/interline-io/catenary/commit/6696c583c4b0e6733896cf216c7e4e0a1fc13226) Thanks [@drewda](https://github.com/drewda)! - `cat-dropdown` custom-trigger ARIA and APG keyboard focus. Previously the popup semantics (`aria-haspopup`, `aria-controls`, `aria-expanded`) were bound only on the default trigger button, so every consumer-supplied `#trigger` slot shipped with no indication a popup exists or whether it is open. Keyboard focus behavior also fell short of the APG menu-button and listbox-button patterns.

  - New `triggerAttrs` slot prop on `#trigger` exposing the popup semantics; custom triggers spread it onto their focusable element: `<template #trigger="{ triggerAttrs }"><cat-button v-bind="triggerAttrs">`. The default button now consumes the same object.
  - Enter and Space on the trigger toggle the menu, and opening moves focus to the first item (or the selected option in listbox mode) per the APG patterns. Typing fields inside a custom trigger keep their normal Enter/Space behavior. Previously the published keyboard documentation claimed this focus move but the implementation left focus on the trigger.
  - Opening a `selectable` listbox with the keyboard (Enter, Space, ArrowDown) focuses the option with `aria-selected="true"` instead of always the first option, so users keep their place when reopening.
  - When keyboard focus leaves the component while the menu is open (e.g. Tab from the trigger), the menu now closes without moving focus. Previously it lingered open with `aria-expanded="true"`, and a later document-level Escape would yank focus back to the trigger.
  - Playground demos updated: the custom-trigger demos spread `triggerAttrs`, and the bare non-focusable `<a class="navbar-item">` trigger (unreachable by keyboard) is now a real button.

- [#35](https://github.com/interline-io/catenary/pull/35) [`bdb18cf`](https://github.com/interline-io/catenary/commit/bdb18cff6a7c21f6a7bf9cbd2a6ca99e4cd9de65) Thanks [@drewda](https://github.com/drewda)! - `cat-taginput` rebuilt on the ARIA 1.2 combobox pattern, fixing screen reader and keyboard access. Accessibility testing of a consumer app found the widget hard to operate: Tab abandoned the highlighted option without selecting it, and the deprecated ARIA 1.0 wrapper-combobox markup hid the popup state from screen readers.

  Combobox semantics:

  - `role="combobox"`, `aria-expanded`, `aria-haspopup`, `aria-controls`, and the new `aria-autocomplete="list"` now live on the input itself (ARIA 1.2 pattern); the wrapper div carries no role. Screen readers compute popup state from the focused element, so users now hear expanded/collapsed changes.
  - Options are no longer focusable and have no per-option keyboard handlers: the input is the single focus point and `aria-activedescendant` conveys the highlight. Previously every option sat in the Tab order, and tabbing to one triggered the input blur that closed the dropdown underneath it.
  - The `role="listbox"` moved onto the options container, so the header slot and empty message are no longer invalid listbox children.
  - A stale highlight is reset when filtering shrinks the list below the highlighted index; `aria-activedescendant` no longer points at a removed option.
  - The input now injects `FieldIdKey`, so a wrapping labeled `cat-field` actually names it; `aria-label` (new `ariaLabel` prop, falling back to the placeholder) applies only when no field label is present, instead of always overriding it.

  Keyboard and focus:

  - Tab selects the highlighted option, closes the listbox, and lets focus move on. Previously Tab silently discarded the highlight, which testers read as the widget being broken.
  - Reaching `maxTags` no longer disables the input (disabling the focused element dropped keyboard focus to the page body and removed the only way to Backspace-remove a tag). The limit is enforced in selection instead, the option list empties, and the existing placeholder swap and live counter convey the state.
  - Removing a tag via its remove button moves focus to the same-position remaining remove button (or the input) instead of dropping it to the page body.
  - Escape is consumed while it has something to dismiss (open listbox, then typed text, which it now clears); only a spent Escape reaches an enclosing dialog.

  Announcements: a visually hidden `role="status"` region reports `Added X` on selection and free-text commit, `Removed X` on any removal (Backspace removal was previously completely silent), and `No results` when filtering empties the list.

### Patch Changes

- [#39](https://github.com/interline-io/catenary/pull/39) [`0883392`](https://github.com/interline-io/catenary/commit/0883392aad9656702b26d670ce36a80b77d6dc7d) Thanks [@drewda](https://github.com/drewda)! - `cat-field` help/validation messages are now announced. The message rendered below a field was visible but never programmatically associated with the wrapped control, so screen reader users focusing the input never heard why a value was invalid.

  - The help `<p>` gets a stable id, and `cat-field` provides it (new `FieldDescribedbyKey`) together with its validation variant (new `FieldVariantKey`).
  - `cat-input`, `cat-textarea`, `cat-select`, and `cat-slider` merge the field message id into their `aria-describedby` alongside their own `ariaDescribedby` prop (newly declared on textarea, select, and slider) and render `aria-invalid="true"` when the field's variant, or their own `variant` prop, is `danger`.
  - Composite controls that already pass `ariaDescribedby` to `cat-input` (such as the datepicker's format hint) get both ids merged automatically.

- [#34](https://github.com/interline-io/catenary/pull/34) [`7a61abe`](https://github.com/interline-io/catenary/commit/7a61abefa66d4f3158864e799e3d79299cabd884) Thanks [@drewda](https://github.com/drewda)! - `cat-icon` decorative-by-default semantics, plus a sweep of unhidden glyphs. Icons were documented as decorative but the rendered span was not actually hidden from assistive technology; icon-font glyphs sit in a private-use codepoint range that some screen readers voice as garbage.

  - `cat-icon` now renders `aria-hidden="true"` by default. A new `ariaLabel` prop marks an icon as meaningful: it renders `role="img"` with that accessible name instead of being hidden. Use it only when the icon conveys information not present in adjacent text; icon-only buttons should keep their name on the button.
  - Decorative glyphs rendered directly by other components are now hidden as well: the `cat-button` loading spinner, the `cat-select` left icon, the `cat-table` sort glyphs (sort state is already exposed via `aria-sort` on the header cell), and the `cat-theme-toggle` weather icon.
  - `cat-button` now exposes its loading state to assistive technology, since the spinner glyph alone never did: the button carries `aria-busy="true"` while loading, plus visually hidden text (new `ariaLoadingLabel` prop, default `Loading`) that joins the accessible name.
  - New `icon.test.ts` covers both modes plus axe checks, and the playground icon page documents the decorative/meaningful distinction.

- [#30](https://github.com/interline-io/catenary/pull/30) [`6696c58`](https://github.com/interline-io/catenary/commit/6696c583c4b0e6733896cf216c7e4e0a1fc13226) Thanks [@drewda](https://github.com/drewda)! - `cat-input` and `cat-select` gain explicitly declared accessibility props, following the `cat-button` precedent of declaring ARIA attributes as props so `strictTemplates` consumers typecheck:

  - `cat-input`: `ariaLabel` (accessible name when there is no associated visible label) and `ariaDescribedby` (id of a describing element, e.g. a format hint).
  - `cat-select`: `ariaLabel` (same purpose) and `id` (explicit id for the native select, overriding the id injected by a wrapping `cat-field`; use when a composite control contains multiple selects so ids stay unique).

- [#40](https://github.com/interline-io/catenary/pull/40) [`e38e808`](https://github.com/interline-io/catenary/commit/e38e808cb513126840844716fe931869ab3aa9ec) Thanks [@drewda](https://github.com/drewda)! - `cat-notification` accessibility. The close button was an icon-only Bulma delete with no accessible name (announced as just "button", an axe failure) and no `type="button"` (submitting forms when nested in one), and dynamically shown notifications were never announced.

  - The close button gains `type="button"` and an accessible name via the new `ariaCloseLabel` prop (default `Dismiss notification`).
  - New `role` prop (`status` or `alert`) renders the notification as a live region for dynamically shown messages such as toasts; `alert` is for errors that should interrupt, `status` for everything else. Omit for static page content.
  - New `notification.test.ts` with an axe check.

- [#31](https://github.com/interline-io/catenary/pull/31) [`9e6f3d5`](https://github.com/interline-io/catenary/commit/9e6f3d5d8fa9294e2073bd7d499e1b8f3958cea3) Thanks [@drewda](https://github.com/drewda)! - `cat-pagination` accessible names. The previous/next buttons were icon-only with no text alternative, so screen readers announced them as just "button" (an axe `button-name` failure), and page buttons announced as bare numbers with no context.

  - New `ariaPreviousLabel`/`ariaNextLabel` props (defaults `Previous page`/`Next page`) bound as `aria-label` on the previous/next buttons. The redundant `aria-disabled` is dropped; the native `disabled` attribute already conveys the state.
  - Every page button gets `aria-label="Page N"`, which screen readers combine with the existing `aria-current="page"` as e.g. "Page 7, current page".
  - The decorative ellipsis separators are hidden from assistive technology.
  - New `pagination.test.ts` covers the names, `aria-current` uniqueness, boundary disabled states, and an axe check.

- [#36](https://github.com/interline-io/catenary/pull/36) [`ec9aa78`](https://github.com/interline-io/catenary/commit/ec9aa78690132a114894fb1227d67ae4deeda709) Thanks [@drewda](https://github.com/drewda)! - `cat-table` header accessibility. Custom headers via the `#header` slot replaced the default `<th>` markup but could not reproduce its `aria-sort` exposure: the slot only passed `columns` and `sort`, so consumers silently lost sort-state announcements to assistive technology.

  - The `#header` slot now also exposes `sortField`, `sortDirection`, and an `ariaSort(column)` helper; custom headers should render `<th scope="col" :aria-sort="ariaSort(column)">` for each sortable column.
  - The default header cells now carry an explicit `scope="col"`, removing ambiguity for older assistive technology heuristics and keeping associations correct if body rows contain their own `<th scope="row">` cells.
  - New tests cover `scope="col"` on default headers, sort-state slot props in a custom header (including an axe check), and the `aria-hidden` sort icon.
  - Sort changes are announced through a visually hidden `role="status"` region ("Sorted by Name, ascending"): JAWS reads the `aria-sort` flip on the header, but NVDA and TalkBack stay silent without a live region. Unsorted columns now omit `aria-sort` entirely instead of emitting `aria-sort="none"`, per current field guidance.

- [#37](https://github.com/interline-io/catenary/pull/37) [`aad9619`](https://github.com/interline-io/catenary/commit/aad961981e734c4c42eccc513fa463f896ec2727) Thanks [@drewda](https://github.com/drewda)! - `cat-tabs` / `cat-tab-item` accessibility fixes.

  - Roving tabindex now falls back to the first tab when `modelValue` matches no registered tab (stale value, or the active tab-item removed via `v-if`), so the tablist never drops out of the page tab order.
  - `orientation="vertical"` now changes the visual layout too: the tablist stacks in a column and the active-tab rule moves to the right edge, matching the existing `aria-orientation` and ArrowUp/ArrowDown key handling. Toggle and toggle-rounded types get vertical border-radius adjustments.
  - New `ariaLabelledby` prop on `cat-tabs` binds `aria-labelledby` on the `role="tablist"` element, so a visible heading can name the tab list. Previously only `ariaLabel` was supported and a passed-through `aria-labelledby` attribute landed on the wrapper div instead of the tablist.
  - `cat-tab-item` focusable-child detection now ignores disabled buttons, inputs, selects, and textareas (and hidden inputs); a panel whose only interactive content is disabled keeps `tabindex="0"` so keyboard users can still reach it.
  - Playground tabs demos now label every tablist via `aria-label` or `aria-labelledby`, and include a vertical orientation example.

- [#38](https://github.com/interline-io/catenary/pull/38) [`47cb666`](https://github.com/interline-io/catenary/commit/47cb666dc92525a3271b4b75a195d257134050cc) Thanks [@drewda](https://github.com/drewda)! - `cat-tree-control` accessibility. Expand/collapse buttons previously all shared the same state-bearing label ("Expand"/"Collapse"), so screen readers heard an undifferentiated list of identical buttons, and the label duplicated the state already conveyed by `aria-expanded`. Tree nesting was also expressed only by visual indentation.

  - Each disclosure button now uses the node name (falling back to the node key) as a constant `aria-label`/`title`; `aria-expanded` continues to convey open/closed state, per APG disclosure guidance.
  - Children are wrapped in `role="group"` with an `aria-label` naming the parent node, so screen readers announce entry into and exit from each subtree. The wrapper is only rendered when the node actually has children.
  - New `tree-control.test.ts` covers the accessible names, `aria-expanded` toggling, group semantics, collapsed-state DOM removal, select event emission, and axe checks.

## 0.4.0

### Minor Changes

- [#27](https://github.com/interline-io/catenary/pull/27) [`cf74942`](https://github.com/interline-io/catenary/commit/cf749428bae3ee357b6b30108b84da85f4bb8d30) Thanks [@drewda](https://github.com/drewda)! - `cat-dropdown` — add `v-model:open` for controlling and observing the menu's open state. Exposed as a named model via `defineModel('open')`, so the existing default `v-model` (selection) and the `open`/`close` events and `open()`/`close()`/`toggle()` methods are unchanged; with no binding the dropdown stays uncontrolled exactly as before. This gives consumers a declarative way to drive open state (e.g. `cat-datepicker` now closes the calendar through `v-model:open` instead of reaching for the open state via the selection model).

### Patch Changes

- [#27](https://github.com/interline-io/catenary/pull/27) [`cf74942`](https://github.com/interline-io/catenary/commit/cf749428bae3ee357b6b30108b84da85f4bb8d30) Thanks [@drewda](https://github.com/drewda)! - `cat-datepicker` — close the calendar on date selection, and reopen on the selected date's month. The open state was driven through the wrapping `cat-dropdown`'s selection `model-value`, which does not control visibility — so `closeOnSelect` never actually dismissed the calendar (it only closed via outside-click / Escape). The datepicker now binds the dropdown's open state with `v-model:open`, fixing close-on-select for any consumer relying on `closeOnSelect`, and re-seeds the visible month from the current selection each time the calendar opens (so paging away and closing without selecting no longer leaves it on a stale month).

- [#29](https://github.com/interline-io/catenary/pull/29) [`7d83db1`](https://github.com/interline-io/catenary/commit/7d83db1c9efb20f65fa594e0f2b12f34c653c3d8) Thanks [@drewda](https://github.com/drewda)! - `cat-button` — declare `ariaLabel` and `title` as props, bound onto the native `<button>` element.

  Both already worked at runtime via attribute fallthrough, but consumers with `strictTemplates` enabled got a type error when passing `aria-label` / `title` — including the documented icon-only usage, where an accessible name is required. Declaring them as props makes `<cat-button icon="close" aria-label="…" title="…" />` typecheck. Other attributes continue to fall through unchanged.

## 0.3.0

### Minor Changes

- [#25](https://github.com/interline-io/catenary/pull/25) [`0be0dc9`](https://github.com/interline-io/catenary/commit/0be0dc9826796c35ce8fcd5ed26bf0c8cd88ee92) Thanks [@drewda](https://github.com/drewda)! - `cat-tooltip` — render the bubble in the browser's top layer via the Popover API, and make its typography self-contained.

  The a11y rebuild made the tooltip bubble a real element (`<span role="tooltip">`), which exposed two consumer-facing issues: the bubble inherited typography from its context (e.g. uppercase + letter-spacing inside Bulma's `.menu-label`), and as a `position: absolute` child it was clipped by `overflow: hidden`/`auto` ancestors such as scrollable side panels.

  - **Top-layer rendering** — in browsers with the Popover API (Baseline Widely Available since 2025), the bubble is shown as a `popover="manual"` element. The top layer escapes ancestor overflow clipping, z-index stacking contexts, and transformed containing blocks, while the bubble stays in the component subtree — the `aria-describedby` association and scoped styles are unchanged. Browsers without the API keep the previous absolutely-positioned behavior.
  - **Real-measurement positioning** — placement flips and coordinates now use the bubble's actual rendered size instead of fixed estimates, and the bubble is clamped to the viewport. When clamping shifts the bubble off the trigger's center, the arrow stays pointed at the trigger.
  - **Arrow moves onto the bubble** — it now escapes clipping together with the bubble (this also fixes the arrow clipping in the non-popover fallback).
  - **Self-contained typography** — the bubble resets `text-transform`, `letter-spacing`, `font-weight`, `text-align`, and `font-style`, so tooltips render identically regardless of surrounding context. Consumers that carried CSS overrides for inherited tooltip typography (e.g. `.cat-tooltip::after { text-transform: none }` from the pseudo-element era) can delete them.

  ### CSS impact

  The bubble keeps the `.cat-tooltip-bubble` class. If you styled the old wrapper-attached arrow via `.cat-tooltip::before`, it is now `.cat-tooltip-bubble::before`. Top-layer bubbles ignore ancestor `z-index` entirely — selectors that tried to raise tooltip stacking are no longer needed.

## 0.2.0

### Minor Changes

- [#13](https://github.com/interline-io/catenary/pull/13) [`837b43b`](https://github.com/interline-io/catenary/commit/837b43bc98c7d1755479b24c545ab7cdab7fa564) Thanks [@drewda](https://github.com/drewda)! - Clean up remaining accessibility lint warnings, convert clickable non-button elements to native `<button>`, and tighten the lint cap to 0.

  - **Native-button conversions** — components that rendered clickable `<div>`/`<span>`/href-less `<a>` elements now use real `<button>` elements (or stay as `<span>` when non-interactive). Each gets a focus-visible outline meeting WCAG 1.4.11 contrast.
    - `cat-safelink` — copy action becomes `<button>`; external link keeps `<a href>` and gains `aria-label="Open URL in new tab"`.
    - `cat-tag` — `isDelete` mode becomes `<button aria-label="Delete">`; the normal variant renders as `<button>` only when a click listener is attached, else `<span>`.
    - `cat-slider-tick` — `<button>` when the parent slider provides `setValue`, else `<div>`.
    - `cat-tree-control` — expand toggle becomes `<button aria-expanded>`. `:title` is kept alongside `:aria-label` so mouse users still get the hover tooltip.
    - `cat-input` — clickable right icon becomes `<button>`. New optional `iconRightAriaLabel` prop names the action for screen readers (defaults to "Action").
  - **`cat-taginput`** — search input gains `aria-label` (defaulting to `placeholder`). Dropdown options pair `@focus` with `@mouseenter` so keyboard navigation highlights match pointer hover. When `readonly`, the `combobox` role and popup-related ARIA attributes (`aria-expanded`, `aria-haspopup`, `aria-controls`) are now omitted, since the listbox is removed from the DOM and the previous attributes pointed at a non-existent element.
  - **`cat-msg`** — expandable header now has real keyboard handlers (`@keydown.enter/space`, `tabindex`, `role`) that were missing. Keydown handlers are scoped with `.self` so a focused close button can still be activated with Space without the parent header swallowing the keypress.
  - **Lint cap → 0** — `package.json` `--max-warnings` drops from 34 to 0. The following rules are promoted from `warn` to `error` in the exported ESLint config: `anchor-has-content`, `click-events-have-key-events`, `form-control-has-label`, `interactive-supports-focus`, `mouse-events-have-key-events`, `no-static-element-interactions`.

  ### CSS impact (no Vue template changes needed)

  Existing `<cat-*>` templates keep working — no consumer template needs to be edited. The native-button conversions do change the rendered tag, which will break CSS selectors that pinned the old element. Grep your consumer for these patterns:

  - **`cat-tag`** (`isDelete`): was `<a class="tag is-delete">`; now `<button class="tag is-delete">`. Selectors like `a.tag.is-delete` won't match — drop the `a` qualifier.
  - **`cat-tag`** (normal): renders as `<button>` only when a click listener is attached, else `<span>`. Selectors that always expected `<a>` or `<span>` are no longer reliable; style `.tag` (or `.tag.is-*`) without the tag qualifier.
  - **`cat-slider-tick`**: was `<div>`; now `<button>` when the parent slider provides `setValue`, else `<div>`. Selectors like `div.cat-slider-tick` won't match the interactive case.
  - **`cat-tree-control`** expand toggle: was `<span>` / `<div>`; now `<button class="expand-button" aria-expanded>` (with `expand-button-right` / `expand-button-down` modifier classes for the chevron direction — unchanged from before).
  - **`cat-safelink`** copy action: was clickable `<span>` / anchor; now `<button>`. The external link variant keeps `<a href>` (unchanged).
  - **`cat-input`** clickable right icon: was clickable `<span class="icon is-right is-clickable">`; now `<button class="icon is-right is-clickable">`. Also: optional `iconRightAriaLabel` prop for naming the action to screen readers (defaults to "Action").

  If your consumer styles or queries don't match any of the above, this change is non-breaking for you.

- [#11](https://github.com/interline-io/catenary/pull/11) [`c9c3d25`](https://github.com/interline-io/catenary/commit/c9c3d25a8699eb99581e5325920e30764b674a32) Thanks [@drewda](https://github.com/drewda)! - Form-grouping primitive and programmatic focus exposure for text inputs.

  - **New `cat-fieldset` component** — renders a native `<fieldset>` with `<legend>` populated from a `label` prop or `#label` slot. Optional `hiddenLegend` uses Bulma's `.is-sr-only` for visually-hidden-but-AT-readable legends. Optional `disabled` forwards to the native attribute. Use it to group `cat-radio` siblings, related fields, or any cluster of inputs that should be announced as a group (WCAG 1.3.1, 3.3.2).
  - **`cat-checkbox-group`** gains `label` and `hiddenLegend` props. When `label` is set, the group renders as a `<fieldset>` with `<legend>`; without it, the existing `<div>` output is preserved so current call sites don't change behavior.
  - **Focus exposure** — `cat-input`, `cat-select`, and `cat-textarea` now `defineExpose({ focus, blur, select })` so parents can call `inputRef.value?.focus()` when fields are dynamically revealed or enabled.

- [#12](https://github.com/interline-io/catenary/pull/12) [`800a681`](https://github.com/interline-io/catenary/commit/800a681c2135eb0dfc91100c6d5ebfd3f0f96022) Thanks [@drewda](https://github.com/drewda)! - Rebuild interactive widgets around their WAI-ARIA Authoring Practices patterns for keyboard operability and correct assistive-technology announcements.

  - **`cat-tooltip`** — rebuilt around the [WAI-ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/). Trigger gets `aria-describedby` pointing at a `<span role="tooltip">`; shows on `mouseenter`/`focusin`, hides on `mouseleave`/`focusout`/`Escape` (but stays open while focus or pointer stays inside the wrapper). When the slot contains a focusable element, `aria-describedby` is applied to that element; otherwise the wrapper gets `tabindex="0"` and carries `aria-describedby` itself.
  - **`cat-tabs` / `cat-tab-item`** — rebuilt around the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). `<div role="tablist">` wraps `<button role="tab">` entries with paired `aria-controls`/`aria-labelledby` ids; panels are `<div role="tabpanel">` and receive `tabindex="0"` only when they have no focusable children. Keyboard handler reads the focused tab's `data-index` (not just `modelValue`) so navigation works correctly when focus and selection diverge. Keyboard: ArrowLeft/Right (or Up/Down when `orientation="vertical"`), Home, End; roving tabindex; activation follows focus. New `ariaLabel` and `orientation` props. `cat-tab-item` deregisters on unmount so `v-if`-toggled tabs don't leave stale entries.
  - **`cat-dropdown` / `cat-dropdown-item`** — trigger gains `aria-expanded` + `aria-haspopup` (`"menu"` or `"listbox"` based on a new `selectable` prop), and the listbox gets `aria-multiselectable="true"` when `multiple` is set. Click-to-toggle stays on the trigger wrapper, so existing `#trigger` slot usages (datepicker input, custom anchors) continue to open on click. Keyboard: Enter/Space toggle; ArrowDown/Up on trigger opens and focuses first/last item; ArrowUp/Down inside the menu navigates with wraparound; Home/End jump to ends; Escape closes and returns focus to the trigger; Tab from open menu closes it. Items render as `<button role="menuitem">` (or `role="option"` in selectable mode) with roving tabindex.
  - **`cat-datepicker`** — calendar gets `role="dialog"`, `aria-modal="false"`, and a configurable `ariaDialogLabel` prop (default "Choose date"). Escape returns focus to the input.
  - **`cat-button`** — adds a `:focus-visible` outline override meeting WCAG SC 1.4.11 (3:1 contrast) on Bulma's color variants. Mouse clicks don't trigger the outline.
  - **`cat-table`** — new `caption`, `captionHidden`, `ariaLabel`, `ariaLabelledby`, and `ariaDescribedby` props. Use `ariaLabelledby` to point at the id of an element whose text names the table (e.g., a surrounding tab label or heading) and `ariaDescribedby` to point at longer-form context. Sortable headers gain `aria-sort=ascending/descending/none` and now render the column label inside a real `<button>` so keyboard users can change sort via Enter/Space.

  ### CSS impact (no Vue template changes needed)

  Existing `<cat-*>` templates keep working — no consumer template needs to be edited. However, the rebuilt internal markup will break CSS selectors that targeted the old DOM. Grep your consumer for these patterns:

  - **`cat-tabs`**: was Bulma's `<ul><li><a class="is-active">` structure; now `<div role="tablist"><button role="tab" class="cat-tab is-active">`. Selectors like `.tabs ul`, `.tabs li`, `.tabs a`, `.tabs a.is-active` will silently stop matching. Style `.cat-tab` / `.cat-tab.is-active` instead.
  - **`cat-dropdown-item`**: was `<a class="dropdown-item">`; now `<button class="dropdown-item">`. Selectors like `a.dropdown-item` or `.dropdown-content a` won't match — drop the tag qualifier or switch to `button.dropdown-item`.
  - **`cat-table`**: sortable column labels now render inside a `<button class="cat-table-sort">` nested in the `<th>`. Selectors targeting text or hover state directly on `th.is-sortable` may need to move to `.cat-table-sort` (e.g., `th.is-sortable:hover` no longer paints the text since the button fills the cell).
  - **`cat-dropdown`**: the menu container's default `ariaRole` changed from `'list'` to `'menu'` (or `'listbox'` when `selectable`). Tests or queries that read `role="list"` need updating.

  If your consumer styles or queries don't match any of the above, this change is non-breaking for you.

- [#17](https://github.com/interline-io/catenary/pull/17) [`8b60862`](https://github.com/interline-io/catenary/commit/8b6086245900a016e655c5beea95e8bd838cf433) Thanks [@drewda](https://github.com/drewda)! - Fix icons inflating control height, and add an icon-only `cat-button` shorthand.

  - **`cat-icon`** — clamp the MDI glyph to its Bulma `.icon` container. The webfont rendered a baseline-aligned glyph whose line box could exceed the container (e.g. the normal size produced a ~36px glyph in a 24px box), which pushed any surrounding control above the standard control height. Icons no longer change the height of the control they sit in.
  - **`cat-button`** — new `icon` prop renders an icon-only button (e.g. an addon button in a `has-addons` field) at the correct size, instead of slotting a bare `<cat-icon>` which rendered oversized and made the button taller than adjacent inputs/selects. The rendered glyph is `aria-hidden`; supply an accessible name via `aria-label`/`aria-labelledby`. `icon` is ignored when a default slot, `label`, `iconLeft`, or `iconRight` is present.

- [#20](https://github.com/interline-io/catenary/pull/20) [`e025317`](https://github.com/interline-io/catenary/commit/e02531710ff006661fa4f69f97d55c2fb0bd3f65) Thanks [@drewda](https://github.com/drewda)! - **`cat-datepicker`** — keyboard grid navigation per the [WAI-ARIA Date Picker Dialog example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/). Day buttons use roving `tabindex` so only one day is in the page tab order at a time.

  New keyboard interactions inside the day grid:

  - **ArrowLeft / ArrowRight** — previous / next day
  - **ArrowUp / ArrowDown** — same day in the previous / next week
  - **Home / End** — first / last day of the current week
  - **PageUp / PageDown** — same day in the previous / next month (day-of-month clamps when the target is shorter, e.g., Jan 31 → Feb 28)
  - **Shift + PageUp / Shift + PageDown** — same day in the previous / next year (with the same clamping)
  - **Enter / Space** — select the focused day

  When focus crosses a month/year boundary the visible calendar follows along. The roving tab stop is clamped onto a selectable day, and arrow keys skip past disabled days in the direction of travel — so calendars with `minDate` / `maxDate` / `unselectableDates` / `unselectableDaysOfWeek` always have a focusable entry point.

  The grid container gains `role="grid"` and an `aria-label` naming the visible month/year so screen readers announce the cursor's context. Days are grouped into week rows under `role="row"` per the WAI-ARIA grid structure (using `display: contents` so the visual layout is unchanged). Day buttons gain `role="gridcell"` and `aria-selected`.

- [#19](https://github.com/interline-io/catenary/pull/19) [`60e4f8b`](https://github.com/interline-io/catenary/commit/60e4f8bdfee3d4e30ec536fef5d073f1c7b79a76) Thanks [@drewda](https://github.com/drewda)! - Accessibility improvements aligning `cat-modal` and `cat-switch` with their WAI-ARIA Authoring Practices patterns.

  **`cat-modal`** — [Modal Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/):

  - Focus trap: Tab and Shift+Tab now cycle inside the dialog instead of escaping behind the backdrop.
  - On open, focus moves to the first focusable element (or to the title / body fallback when there are none). On close, focus returns to the opener, guarded against the opener being gone from the DOM.
  - `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` (when titled) on the dialog container.
  - New `ariaLabel` prop names the dialog when no title is set (defaults to "Dialog" so the dialog always has an accessible name).
  - New `ariaDescribedby` prop applies `aria-describedby` for longer-form context.

  **`cat-switch`** — [Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/):

  - Underlying `<input>` gains `role="switch"` and `aria-checked` so assistive tech announces the control as a switch rather than a checkbox.

- [#23](https://github.com/interline-io/catenary/pull/23) [`500e40e`](https://github.com/interline-io/catenary/commit/500e40ed4fd29741bedefbba4a70fa9cceb7fb69) Thanks [@drewda](https://github.com/drewda)! - Type-ahead character search and Home / End jumps, per the [WAI-ARIA Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction) and [Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/#keyboardinteraction) patterns.

  - **`cat-dropdown`** — pressing a printable character inside the open menu or listbox jumps focus to the next item whose label starts with that character. Multiple characters typed in quick succession (within ~500 ms) extend the search; single-character presses cycle through items sharing that initial letter. Space is reserved for activating the focused item; arrow / Home / End / Escape / Tab keys reset the buffer.
  - **`cat-taginput`** — Home and End now move the highlighted option to the first / last option when the listbox is open. Type-ahead itself doesn't apply here because the combobox's search input already filters options per the [Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

  A new internal `createTypeAhead()` helper at `src/util/type-ahead.ts` implements the buffering and matching logic and is fully unit-tested.

### Patch Changes

- [#10](https://github.com/interline-io/catenary/pull/10) [`5ba3aef`](https://github.com/interline-io/catenary/commit/5ba3aef3dde7a02edbffe6094feaab0c1b2f3174) Thanks [@drewda](https://github.com/drewda)! - Add accessibility linting and testing infrastructure.

  - Adds `eslint-plugin-vuejs-accessibility` to the exported ESLint config in `src/eslint/`. Rules with zero existing violations land as `error`; the rest as `warn`. `pnpm lint`/`pnpm check` enforce `--max-warnings 34` so new warnings fail CI.
  - Adds a small in-house axe-core wrapper at `src/testutil/axe.ts` and an `expectNoAxeViolations()` helper in `src/testutil/component-helpers.ts` for asserting zero axe violations in component tests. The wrapper disables `cat.color` rules globally (jsdom can't compute styles) and stubs `HTMLCanvasElement.prototype.getContext` to silence jsdom's "Not implemented" warning on axe-core's icon-ligature precheck.
  - Adds a `.github/workflows/ci.yml` workflow that runs lint, type-check, test, and build on every PR.
  - Fixes one real WCAG bug surfaced by the linter: `cat-taginput`'s `role="combobox"` was using `aria-owns` instead of the required `aria-controls`.

- [#24](https://github.com/interline-io/catenary/pull/24) [`08f9821`](https://github.com/interline-io/catenary/commit/08f982123846b5bb9a78582a163175a00e3cad68) Thanks [@drewda](https://github.com/drewda)! - Restore visible focus indicators on `cat-slider` and `cat-switch`. Both components had `outline: none` on their inputs with no `:focus-visible` replacement, so keyboard focus worked (arrow keys / Space toggle) but the user couldn't tell which control was focused — a WCAG SC 2.4.7 (Focus Visible) violation.

  - **`cat-slider`** — adds a `:focus-visible` outline (2px, offset 4px) around the range input. Mouse interaction is unaffected.
  - **`cat-switch`** — the underlying checkbox is visually hidden, so adds the focus outline to the adjacent styled `.check` toggle.

  Both outlines use Bulma's `--bulma-focus-h` / `-s` / `-l` CSS variables so consumers can theme the focus color independently of `$link` (e.g., to give it more contrast on a colored variant) without overriding the component styles.
