# @interline-io/catenary

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
