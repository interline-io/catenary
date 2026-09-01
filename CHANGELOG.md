# @interline-io/catenary

## 0.14.0

### Minor Changes

- [#92](https://github.com/interline-io/catenary/pull/92) [`45df370`](https://github.com/interline-io/catenary/commit/45df37072f17193f188c5759b9f055275500a900) Thanks [@drewda](https://github.com/drewda)! - `cat-checkbox` accessibility review, plus API additions modelled on Reka UI. Part of [#64](https://github.com/interline-io/catenary/issues/64). All additive — no existing prop, event or behavior changes.

  **`aria-label` and `aria-describedby` now reach the native input.** The component's root _is_ the `<label>`, so undirected fallthrough attributes landed there — where `aria-label` does nothing for the input's accessible name. A checkbox with no visible text was therefore impossible to name from outside, which matters for the common case of a row selector in a table. There is now an `ariaLabel` prop, and fallthrough `aria-*`/`data-*` are routed to the input. `class`, `style` and listeners stay on the wrapper, exactly where they already applied — moving a spacing class onto the box would shift the layout of existing call sites.

  **The mixed state survives a click.** The browser clears the DOM `indeterminate` property as soon as the box is clicked. Since the `indeterminate` prop had not changed, the watcher never refired, so a parent checkbox whose children were unchanged silently lost its mixed state in the accessibility tree. It is now restored after the change event.

  No `aria-checked="mixed"` is set: a native checkbox maps `.indeterminate` to a mixed state on its own, and redundant ARIA over working native semantics is a regression rather than an improvement. The APG example that sets `aria-checked` is for custom `role="checkbox"` widgets.

  **Reka UI-style additions.**

  - `trueValue` / `falseValue` — emit something other than a boolean. They only take effect when set, so a caller binding a truthy non-boolean keeps reading as checked.
  - `name`, `value` and `required` on the native input, so a checkbox can take part in native form submission and validation. In array-binding mode the native `value` falls back to `nativeValue`, which is already the option's semantic value and is what `cat-radio` binds — otherwise pairing `name` with the existing array API would submit the browser default of `"on"` for every checked box.

  Existing usage renders byte-identically with one exception: an array-binding checkbox now carries `value="<nativeValue>"` on its input. That is inert unless the checkbox is inside a native `<form>`, but it will show up in a DOM snapshot.

  The playground page gains the `demo-a11y` section it was missing, along with demos for the unnamed-row-selector case, custom true/false values, and native form submission.

- [#91](https://github.com/interline-io/catenary/pull/91) [`695bd54`](https://github.com/interline-io/catenary/commit/695bd549feed5c5f9ba554239f69d92adba8645d) Thanks [@drewda](https://github.com/drewda)! - `cat-field` accessibility review. Part of [#64](https://github.com/interline-io/catenary/issues/64).

  **The default slot now exposes `id` and `describedby`.** `cat-field` renders a real `<label for>`, but only the controls that inject `FieldIdKey` — `cat-input`, `cat-select`, `cat-textarea`, `cat-slider`, `cat-taginput`, and anything built on them — ever carried that id. Wrapping anything else left the label attached to nothing: visually correct, and unnamed to a screen reader. There was no way for a raw control to reach the id, which made the component's own documented example (`<cat-field label="Name"><input class="input"></cat-field>`) one of the broken cases. Now:

  ```vue
  <cat-field
    v-slot="{ id, describedby }"
    label="Email"
    message="We never share it."
  >
    <input :id="id" :aria-describedby="describedby" class="input" type="email">
  </cat-field>
  ```

  **`cat-field` warns in development when its label names nothing.** Three distinct cases, each naming its own fix: the label resolves to no element (bind the id from the slot, or use `cat-fieldset`), to more than one (duplicate DOM ids — give every control after the first an explicit `id`), or the field wraps no form control at all (a `<label>` is the wrong element for a caption).

  **Expect these warnings when you upgrade.** A label over a _group_ of controls is the common one — one `<label>` cannot name a set, so a label above several checkboxes, radios, switches or buttons is orphaned. `cat-fieldset` is the component for that: its `<legend>` names the group. `cat-checkbox`, `cat-radio` and `cat-switch` deliberately do not take the field id, since they render their own wrapping `<label>` and a second name would be concatenated onto the first.

  The playground's own field page demonstrated three of these bugs — a label over three buttons, and two pairs of inputs sharing one id. All now use `cat-fieldset` with per-control names, and the registration form routes its validation error through `variant`/`message` instead of a hand-written `<p class="help">`, so the error is linked by `aria-describedby` and the input is marked `aria-invalid`. The page gains the `demo-a11y` section it was missing.

- [#90](https://github.com/interline-io/catenary/pull/90) [`d989974`](https://github.com/interline-io/catenary/commit/d9899742390fcaafcfd820b0c271fa73ed59d369) Thanks [@drewda](https://github.com/drewda)! - Four form-control accessibility fixes. Closes [#49](https://github.com/interline-io/catenary/issues/49).

  **`cat-radio` groups properly.** Radios are grouped by a shared `name`, not by sharing a `v-model` — without one, each radio is its own group of one: arrow keys do not move between them, every radio is a separate tab stop, and a screen reader announces each as "1 of 1". A mouse user sees nothing wrong, which is why it goes unnoticed.

  A radio that resolves to no name warns in development, naming the two ways to fix it. **Expect this warning when you upgrade** — it is the point of the change, and it fires once per unnamed radio on mount. Either give every radio in a group the same `name`, or wrap the group in the new `<cat-fieldset radio-group>`, which supplies a generated one. An explicit `name` always wins.

  `radio-group` is opt-in rather than automatic because a fieldset is a generic grouping wrapper: naming _every_ descendant radio would merge two independent questions under one legend into a single group, and the resulting bug is silent — picking "Red" makes the browser natively uncheck "Small", and since `size` never changed, Vue's patch skips the DOM write, so the size selection vanishes from the UI while state still says it is selected.

  The playground's own radio demos shipped the ungrouped bug — 27 radios, none named. All are grouped now, which is also what the documentation should have been showing.

  **`cat-select` `readonly` no longer removes the control from the tab order.** It was implemented as `disabled`, so a keyboard or screen reader user could not reach it to read the current value, and it was announced as unavailable rather than read-only. It now stays focusable, carries `aria-readonly`, gets a muted surface so it does not look editable, and refuses to change — while leaving Enter (so a form still submits) and Cmd/Ctrl shortcuts (copy, select-all) alone. If a change reaches it by another route it restores the previous selection, including every option of a `multiple` select.

  **`cat-input` and `cat-textarea` accept an explicit `id`.** A `cat-field` provides one id, so a grouped field containing more than one control gave them all the same one: duplicate DOM ids, and a `<label for>` resolving to whichever came first. `cat-select` has carried this escape hatch; these two did not.

  **`cat-textarea` accepts `ariaLabel`**, matching `cat-input` and `cat-select`, so a textarea used without a labelled `cat-field` can be named under `strictTemplates`.

- [#89](https://github.com/interline-io/catenary/pull/89) [`3fc741c`](https://github.com/interline-io/catenary/commit/3fc741cc3192ba73bc305b12951a1d50c4d3e2c7) Thanks [@drewda](https://github.com/drewda)! - `cat-tabs` keys its tablist registry on each item's stable id rather than its `value`, which fixes five ways the tablist could drift from the template.

  The registry was keyed on `value` — a prop the consumer can change — so a changed value read as a different tab. That single decision produced a cluster of failures, all of which go away when identity and content are separated: `tabId` is minted once per item with `useId()` and outlives every prop change.

  Fixed:

  - **A tab revealed after mount lands in template order.** Registrations arrive in mount order, so a `v-if` tab in the middle of a list appended to the end of the tablist while its panel rendered in the middle. Live in production. The registry is sorted by panel document position after each registration, so an unkeyed list that grows, shrinks or inserts mid-way settles correctly — and a **keyed** list reordered without any prop change corrects itself as soon as anything registers again.
  - **Arrow keys focus the tab they activate.** `focusTabAt` indexed a `v-for` template-ref array, which Vue fills in mount order. Once the tablist is ordered by document position, indexing one by the other moves DOM focus to one button while activating another — the worse half of the ordering bug. Resolved from the DOM instead.
  - **An unkeyed `v-for` shrinking no longer empties the tablist.** Re-registering under a value a sibling still owned overwrote that sibling's entry, which unmounting then deleted; `['a','b','c']` → `['b','c']` left zero tabs and two orphaned panels.
  - **Two siblings exchanging values keep both tabs**, instead of deleting each other's registration and leaving a panel whose `aria-labelledby` names a tab that is not rendered.
  - **A focused tab surviving a value change keeps focus.** The tablist keyed its buttons on `tab.value`, so changing one destroyed and recreated the button and dropped focus to `<body>`. Keyed on `tabId`, the button is patched in place.

  Two tabs sharing a `value` now render one selected tab rather than two: selection is resolved by the item's `tabId`, since keying the registry on `tabId` removed the de-duplication that keying on `value` used to provide.

  Also: a bound `modelValue` that names no tab now falls back to the first tab rather than leaving a tablist with nothing selected and every panel hidden. An unbound tablist is unchanged — none selected, first still keyboard-reachable — since that is an unmade choice rather than a broken state.

  The parent/child contract moved to a typed `InjectionKey`, matching `cat-steps`. The string-keyed `provide`/`inject` it replaces carried the registration signature hand-copied into the child, so the two sides were asserted to agree rather than checked — and this change alters that signature.

  The fallback emits `update:modelValue`, so `v-model` follows what is displayed. Without it, a consumer that renders content from the model — panels outside the tabs gated on `activeTab === '...'` — showed a highlighted tab above an empty region once the active tab unmounted. `cat-steps` does not emit; the two differ here deliberately.

  Two tabs sharing a `value` now warn in development. Selection resolves a value to the first tab carrying it while focus moves by index, so a duplicate leaves the second unreachable and puts focus and selection on different buttons. That is not fixable from inside the component, since `v-model` carries a value and two tabs sharing one are indistinguishable to it.

  One known gap: a keyed list reordered with no other change re-sorts only once something registers again, so a pure reorder with no accompanying prop change is corrected on the next registration rather than immediately.

  `cat-steps` shares this registry's shape and most of these faults; it is not changed here. Extracting the two into one implementation is the real fix and is worth doing separately, since porting between them by hand is what let `cat-tabs` ship the ordering bug for months after `cat-steps` fixed it in [#66](https://github.com/interline-io/catenary/issues/66).

- [#85](https://github.com/interline-io/catenary/pull/85) [`85940d2`](https://github.com/interline-io/catenary/commit/85940d22f2e399ea0391a4213714c1adae7136cb) Thanks [@drewda](https://github.com/drewda)! - `cat-tooltip` conforms to WCAG 1.4.13, gains an affordance and motion control, and stops sticking after a click. Closes [#50](https://github.com/interline-io/catenary/issues/50) and [#79](https://github.com/interline-io/catenary/issues/79).

  ## Content on Hover or Focus (WCAG 1.4.13)

  The success criterion asks for three things and the bubble now does all three.

  **Hoverable.** The bubble carried `pointer-events: none`, so it was never a pointer target: any move toward it fired `mouseleave` on the wrapper and dismissed it. Anyone using magnification, or wanting to select a long tooltip's text, could not reach the content. It is now `pointer-events: auto` while visible, with a short close delay bridging the gap between trigger and bubble so crossing it does not dismiss — position-agnostic, unlike a transparent CSS bridge which would need geometry per side.

  Making it hoverable moved the dismissal boundary, so the bubble also handles its own `mouseleave`. Without that the wrapper's `mouseleave` had already fired when the pointer crossed onto the bubble, and nothing was left to dismiss it once the pointer left again — a tooltip stuck open would have been worse than the bug being fixed.

  **Dismissible without moving the pointer.** Escape was bound on the wrapper, so it only fired with focus inside; a tooltip opened by hover while focus sat elsewhere could only be dismissed by moving the pointer, which the criterion explicitly disallows. Escape now goes through the shared LIFO dismiss stack, which also means the keypress is consumed — a tooltip open inside a `cat-modal` takes the first press and the dialog stays open, instead of both closing at once.

  ## No longer sticks after a click

  When the slot has no focusable child the wrapper takes a `tabindex` of its own, so clicking it focused it and the bubble stayed up after the pointer had left. Focus now shows the tooltip only when the focus did not come from a pointer press, tracked from `pointerdown` rather than `:focus-visible` — the same distinction, but `:focus-visible` is a rendering hint that jsdom reports false for synthetic focus, which would make the behaviour untestable and environment-dependent. Keyboard focus still holds the bubble open when the pointer wanders away.

  This is the dominant usage pattern in the consumer apps: 91 of their 129 `cat-tooltip` call sites wrap a non-focusable icon or span.

  ## New props

  - **`affordance`** — `cursor: help` and a dotted underline on the trigger. Opt-in, since it changes how slot content looks at every existing call site. Without it nothing on screen tells a pointer user a tooltip exists; two playground demos had already hand-rolled exactly these declarations inline.
  - **`animated`** (default `true`) — turn the fade off. Suppressed automatically under `prefers-reduced-motion: reduce` regardless of the prop, matching `cat-collapse`, `cat-steps` and `cat-msg`, which had the block `cat-tooltip` lacked.

  ## Playground

  The tooltip page had **20 icon-only triggers with no accessible name at all** — a critical axe `button-name` violation on the page that documents the component, teaching the opposite of what `cat-button`'s own docs say. `aria-describedby` supplies a description, not a name. Each now uses `cat-button`'s `icon` prop with an `aria-label`, which is both the documented pattern and the correct icon sizing. With the two hand-rolled affordances replaced by the prop (removing a `has-text-info` span that failed contrast), the page goes from 21 axe violations to zero in both themes.

## 0.13.0

### Minor Changes

- [#84](https://github.com/interline-io/catenary/pull/84) [`f088f54`](https://github.com/interline-io/catenary/commit/f088f54afa357168c0525ffb9c9e2303bd6e3aad) Thanks [@drewda](https://github.com/drewda)! - `cat-theme-toggle` becomes a real toggle button, and `cat-safelink` names and announces its actions. Closes the remaining findings in [#51](https://github.com/interline-io/catenary/issues/51).

  ## `cat-theme-toggle`

  The label named the _current_ state ("Dark Mode" while dark) with no `aria-pressed`, which is ambiguous with the opposite convention where a label names the action — a screen reader user heard "Dark Mode, button" and could not tell whether pressing it turned dark mode on or off. It actually turned it off, the inverse of the Play/Pause convention.

  Now the standard toggle-button shape: a fixed label naming what the button controls, with `aria-pressed` carrying the state. Uses the `ariaPressed` prop added to `cat-button` in [#82](https://github.com/interline-io/catenary/issues/82).

  **Visible change:** the button now reads "Dark mode" in both states rather than "Light Mode" / "Dark Mode". A new `label` prop overrides it for translation. The sun/moon icon still indicates the state visually and remains `aria-hidden`.

  ## `cat-safelink`

  - **Both actions are named after their subject** — `Copy https://example.com/… to clipboard` and `Open https://example.com/… in new tab` — instead of the constant `"Copy to clipboard"` / `"Open URL in new tab"`. A safelink is usually rendered once per row of a table, so identical names left a screen reader's elements list showing N indistinguishable buttons, and the link's name never said where it went (WCAG 2.4.4). The display `text` is preferred over the URL when present.
  - **Copy results are announced.** The clipboard write produces no visible change, so success and failure now go to a visually hidden `role="status"`; failures previously only reached `console.error`. The region is rendered from mount and only its text changes, because a live region inserted together with its content is announced unreliably. `copiedLabel` and `copyFailedLabel` are props for translation, and the `copy` event still fires for consumers wiring their own UI.

  ## `cat-search-bar`

  `type="search"` rather than `type="text"`, giving the input its implicit `searchbox` role.

  `cat-input` now suppresses WebKit's native search clear affordance, since it draws its own whenever `clearable` is set and `cat-search-bar` always sets it. Chrome already dropped the native one because Bulma's control mixin sets `appearance: none` on `.input` — verified that layout is byte-identical between `type="text"` and `type="search"` there — but Safari keeps it unless the pseudo-element is suppressed explicitly, which would have shown two clear buttons in the same field.

  ## Tests and docs

  New `safelink.test.ts` and `theme-toggle.test.ts` (neither component had tests), covering the naming, the live region in all three outcomes, and the pressed state. `cat-theme-toggle`'s playground page gains the `demo-a11y` section it lacked, which also takes one component off the list in [#64](https://github.com/interline-io/catenary/issues/64).

  Playground: `demo-a11y` now underlines links in its intro paragraph, not just in the reference list. [#70](https://github.com/interline-io/catenary/issues/70) fixed the list; the intro needed it for the same reason and only surfaced once a page put enough prose around the pattern link for axe to treat it as a text block (measured 1.13:1 against the surrounding text).

- [#80](https://github.com/interline-io/catenary/pull/80) [`8412d46`](https://github.com/interline-io/catenary/commit/8412d46f0c5ea703bed8b9f2e3298618e525351d) Thanks [@drewda](https://github.com/drewda)! - New `cat-split-button`: a primary action with an attached dropdown of related actions.

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

  Also in `cat-dropdown`: `focusableTrigger()` skips disabled elements — including one disabled by an ancestor `<fieldset disabled>`, which is what `cat-fieldset` renders — so a trigger holding more than one focusable element restores focus to the next candidate rather than returning one that cannot take it; and `open()` no longer re-emits `open` for a menu that is already open (clicking a trigger and then pressing ArrowDown fired it twice).

### Patch Changes

- [#82](https://github.com/interline-io/catenary/pull/82) [`aeac433`](https://github.com/interline-io/catenary/commit/aeac4338504fe10f1f00b1e1c2da4f9b40fa6e4b) Thanks [@drewda](https://github.com/drewda)! - Fallthrough attributes, disabled tooltip triggers, and typed ARIA state props — the three fixes `cat-split-button` surfaced, applied where the same bugs already lived.

  ## `cat-input` / `cat-textarea` / `cat-select` route attributes to the native element

  All three bound `v-bind="$attrs"` onto the native control without `inheritAttrs: false`, so Vue _also_ applied every fallthrough attribute to the root `.control` wrapper. On `cat-input` and `cat-textarea` a consumer's `id` landed on both, and because the wrapper precedes the control in document order, a `<label for>` resolved to that wrapper, which is not a labelable element, and silently stopped labelling anything. (`cat-select` already declared `id` as a prop, so it escaped that one.) Undeclared `aria-*` and `data-*` were duplicated onto a wrapper with no role on all three.

  `class`, `style` and event listeners deliberately still reach the wrapper as well, because both destinations turned out to be load-bearing:

  - Layout utilities (`mt-2`, `mr-2` — both in real consumer code) style the wrapper, while typography (`is-family-monospace`) only takes effect on the native element: Bulma's base stylesheet sets `font-family` directly on `input, select, textarea`, so it cannot be inherited from an ancestor.
  - A listener on the wrapper sees events from the icons and the clear button, which are siblings of the native element rather than inside it; one on the native element is what non-bubbling `@focus` / `@blur` need. `cat-search-bar`'s Escape-to-clear depends on the former — routing listeners to the native element alone broke it, because the clear button is not inside the input.

  Regression tests per component assert that `id`, `aria-*` and `data-*` reach the native element only, and that `class` still reaches both.

  ## `cat-tooltip` keeps disabled triggers keyboard-reachable

  `detectFocusableSlot` matched `button, input, select, textarea` without excluding disabled ones, so wrapping a disabled control — the commonest reason to use a tooltip at all, explaining why an action is unavailable — made the tooltip keyboard-invisible: the wrapper skipped its own `tabindex` and hung `aria-describedby` on an element that is not in the tab order.

  Uses `:disabled` rather than `[disabled]` so it also covers a control disabled by an ancestor `<fieldset disabled>`, which is what `cat-fieldset` renders. Same correction Copilot caught on `cat-dropdown`'s `focusableTrigger()`.

  ## `cat-button` gains typed ARIA state props

  `ariaPressed`, `ariaExpanded`, `ariaHaspopup` and `ariaControls`, following the existing `ariaLabel` convention. Attribute fallthrough already worked at runtime, but failed consumer typechecks under `strictTemplates`, which steered callers to a raw `<button>` and away from the shared `:focus-visible` styling — `cat-datepicker`'s toggle is written that way for exactly this reason.

  `false` renders rather than dropping the attribute: "not pressed" is what distinguishes an un-pressed toggle from a plain button. The prop docs record the convention that a toggle keeps a fixed label naming what it controls and lets `aria-pressed` carry the state, since a label naming the current state is ambiguous with one naming the action.

  Addresses parts of [#49](https://github.com/interline-io/catenary/issues/49), [#50](https://github.com/interline-io/catenary/issues/50) and [#51](https://github.com/interline-io/catenary/issues/51); each issue has further findings still open — including, on `cat-input` / `cat-textarea`, that a consumer `id` still overrides the one `cat-field` injects, so `<label for>` inside a field breaks the same way. `cat-select`'s `id ?? fieldId` prop is the shape the other two need.

## 0.12.0

### Minor Changes

- [#77](https://github.com/interline-io/catenary/pull/77) [`2e36ad4`](https://github.com/interline-io/catenary/commit/2e36ad4a99873ebb009628247a78d2a0ffd40a16) Thanks [@irees](https://github.com/irees)! - Modal: edge-to-edge below Bulma's mobile breakpoint, and `fullBleed` and `fillBody` props.

  Below 769px a `full-screen` modal now goes edge to edge with square corners and halved padding — at that width the inset stops reading as a frame and starts eating the content. `fullBleed` applies the same treatment at every width, for a dialog that should never read as a card.

  `fillBody` hands the body's height down to the slot, for content that scrolls within the dialog rather than scrolling the dialog: a table that keeps its header in view, say. Off by default, since it makes every direct child of the slot a flex item. Content that opts in carries its own scroll-region `tabindex` and label, because the body no longer overflows.

## 0.11.0

### Minor Changes

- [#66](https://github.com/interline-io/catenary/pull/66) [`7081dd9`](https://github.com/interline-io/catenary/commit/7081dd9a575304d30e4f6679ea9d1ded17b70375) Thanks [@drewda](https://github.com/drewda)! - New `cat-steps` / `cat-step-item` stepper ("wizard") components.

  Adds the last widget in [gotransit-editor#397](https://github.com/interline-io/gotransit-editor/issues/397) with no catenary counterpart: `o-steps` / `o-step-item`, the 8 remaining Oruga tags in that audit. The API is close enough to Oruga's for the two wizard flows there to port over, but the accessibility model is not Oruga's — see below.

  ## `cat-steps`

  A sequence of stages with one panel visible at a time and a progress list showing what is done, current and still ahead.

  - `v-model` selects the active step, matched against each item's `value`. Left unbound, the stepper keeps the value itself, so `has-navigation` works with no state of its own.
  - Steps behind the active one are clickable and those ahead are not, so users can go back but not skip. `clickable` on the parent forces all (`true`) or none (`false`, a read-only progress display with no buttons at all); `clickable` on an item overrides its own step.
  - `has-navigation` renders Previous/Next buttons below the content, or the `#navigation` slot renders your own from the same state (`previous`, `next`, `goTo`, `hasPrevious`, `hasNext`, `activeIndex`, `count`), typed via `defineSlots`. Without either, navigation is the consumer's — drive `v-model` from buttons in the step content, which is what a wizard whose steps gate on server work needs.
  - `orientation="vertical"` puts the list beside the panel; `label-position="right"` puts each label next to its marker.
  - `variant` and `size` over the core sets, `completed-icon` (default `check`, `null` keeps numbers), `animated` opt-in panel transition suppressed under `prefers-reduced-motion`.
  - Emits `change` with the new and previous values; exposes `previous()`, `next()`, `goTo(value)`.

  `cat-step-item` takes `value`, `label`, and optionally `step` (marker text), `icon`, `variant` and `clickable`. Per-item `variant` plus `icon` is how a step that failed gets marked without recoloring the rest.

  ## Accessibility

  There is no WAI-ARIA Authoring Practices pattern for a stepper. This renders the progress as an `<ol>` with `aria-current="step"` on the active item — the shape used by the GOV.UK, USWDS, Preline and Flowbite step indicators — rather than as a tablist, which is what Oruga and Buefy both use.

  That choice is the substantive difference from Oruga. Tabs are interchangeable views of one thing, reachable in any order, and the pattern's arrow-key model assumes exactly that; steps are a sequence where the order matters, most steps cannot be reached yet, and moving between them is the task rather than a way to look at something else.

  - **Every step's state is announced.** `aria-current="step"` marks the current one, and the others carry visually hidden "Completed" / "Not completed" text — a filled circle and a check glyph say nothing to a screen reader. Both strings are props (`ariaCompletedLabel`, `ariaUpcomingLabel`) for translation.
  - **Markers that cannot be reached yet are `aria-disabled`, not `disabled`.** They stay focusable, so a keyboard user can read ahead instead of tabbing past a gap, and the element type never changes as the user advances — swapping a focused `<button>` for a `<span>` would drop focus to the body mid-wizard. The current step is exempt: activating it is a no-op like the others, but "unavailable" is the wrong word for where the user already is, and `aria-current` says it better.
  - **Focus follows the user into the new panel, but only when the change came from inside the component.** Each panel is a group named by its step's label, so landing there announces which step it is. A change driven from outside — the app advancing after an upload finishes — leaves focus where it is rather than yanking it out of whatever the user was doing.
  - **Inactive panels are hidden with `display: none`**, which takes them out of the accessibility tree and the tab order together. Their fields stay mounted, so stepping back preserves what was typed.
  - The progress list takes `ariaLabel` (default `"Progress"`) or `ariaLabelledby`.

  ## Server rendering

  The active step's panel renders visible on the server, so its content ships in the HTML rather than behind `display: none`. That needs a bound `v-model`: an unbound stepper has no way to know which step comes first until its items register.

  The progress list itself is client-only. Step items register in `onMounted`, which never runs during `renderToString`, so the markers appear on hydration — the same limitation `cat-tabs` has. Fixing it means reading the slot's VNodes rather than waiting for registration, which is tracked separately for both components.

### Patch Changes

- [#72](https://github.com/interline-io/catenary/pull/72) [`9ea7582`](https://github.com/interline-io/catenary/commit/9ea7582d82fb42b63269c63dbc785596e290b813) Thanks [@drewda](https://github.com/drewda)! - Fix the black box drawn around open `cat-dropdown` menus and `cat-datepicker` calendars.

  Since 0.7.0 moved both popups into the browser top layer, they inherit the user-agent stylesheet's `[popover]` rule. Their existing reset covered `position`, `margin` and `inset` but nothing else, and Bulma overrides none of the rest on `.dropdown-menu`:

  - `border: solid` — a medium `currentColor` border, i.e. a black box around the whole popup. This is the visible symptom.
  - `padding: 0.25em` — Bulma sets only `padding-top` (the trigger-to-content offset), so the other three sides survived.
  - `background-color: Canvas` — `.dropdown-menu` has no background of its own in Bulma; `.dropdown-content` inside it does. The opaque backdrop showed through the `padding-top` gap and behind the content's rounded corners.
  - `color: CanvasText` — **the one that actually hurt**. Nothing in Bulma sets a `color-scheme`, so system colors resolve light and `CanvasText` is black whatever the theme. `.dropdown-item` is `color: inherit`, so in dark mode every menu item and icon rendered black on Bulma's dark `.dropdown-content`. Measured with the page at `rgb(171, 177, 191)`, the menu resolved to `rgb(0, 0, 0)`.

  All three are now reset, matching what `cat-tooltip` already did for its own bubble. `overflow: auto` is deliberately left in place so a long menu can still scroll.

- [#76](https://github.com/interline-io/catenary/pull/76) [`ca2638a`](https://github.com/interline-io/catenary/commit/ca2638a6fd15ffb7adc479bd02c124951e04a44d) Thanks [@drewda](https://github.com/drewda)! - Fix `cat-tabs` rendering no tab-bar rule and no active-tab underline, and center labels under `expanded`.

  `cat-tabs` renders its tablist as `div[role="tablist"]` rather than Bulma's `ul`, so `.tabs ul` never matches and every rule Bulma puts there has to be restated. Two were missing, and they turned out to be the same defect:

  - **The tab bar had no rule of its own.** Nothing drew it.
  - **Each tab's own bottom border was painted but clipped.** `.cat-tab` keeps Bulma's `margin-bottom: -1px`, which exists to overlap the bar's line. With no line to overlap, the tablist resolved 1px shorter than its buttons and `.tabs` — `overflow: hidden` in Bulma 1.0.4 — clipped every tab's border. Measured before the fix: tabs 41px, tablist 41px, tab 42px, tab `border-bottom-width` 1px.

  Giving `.cat-tablist` what Bulma gives `.tabs ul` restores both in one change. Neither was a recent regression — `tabs.vue` was byte-identical from 0.5.0 to 0.10.0.

  Separately, `.cat-tab` was missing the `justify-content: center` that Bulma's `.tabs a` carries, so `expanded` grew the tabs but left their labels left-aligned.

  ## Visible changes

  - **Default tabs** gain the full-width rule and the active-tab underline they should always have had.
  - **`is-boxed` changes appearance**, in the right direction: it sets `border-bottom-color: transparent` on the active tab precisely so the bar's line shows through the gap, and that line did not previously exist.
  - **`expanded` tabs** center their labels.
  - **`is-vertical`** gains the continuous right-hand rail its active-tab styling already implied, and does not draw a bottom one. Bulma has no vertical tabs to mirror, so this applies the same reasoning to the axis the orientation uses.
  - **`is-toggle`** is unchanged: it explicitly suppresses the tablist border, as Bulma does on `.tabs.is-toggle ul`.

  ## Tokens

  Values now come from the `--bulma-tabs-*` custom properties (`--bulma-tabs-border-bottom-color`, `--bulma-tabs-link-active-color`, `--bulma-tabs-link-padding` and friends) rather than hardcoded equivalents, so a consumer overriding them on `.tabs` gets what they asked for. The resolved colors are unchanged from the previous release, and both themes measure clean under axe-core.

- [#74](https://github.com/interline-io/catenary/pull/74) [`41abd74`](https://github.com/interline-io/catenary/commit/41abd74c3678bbd5d790cd2e709ebb7470249628) Thanks [@drewda](https://github.com/drewda)! - Fix dark-mode contrast failures by taking colors from Bulma's runtime theme tokens instead of compile-time SCSS variables.

  Bulma 1.x switches light/dark by reassigning CSS custom properties. SCSS variables resolve at build time, so anything colored from them kept its light-theme value on a dark background. Measured with axe-core against the playground with `data-theme="dark"`:

  - **`cat-tabs`: 45 color-contrast violations, now 0.** Inactive tab labels were `[#404654](https://github.com/interline-io/catenary/issues/404654)` on `#14161a` — **1.91:1**, effectively unreadable. Active labels were at 3.51:1.
  - **`cat-loading`: the scrim was `rgba($white, 0.8)`** — a white veil over dark content. It is now built from the scheme's own HSL parts, so it dims rather than flashes.
  - **`cat-table`: the sortable-header hover** painted a near-white block.
  - **`cat-dropdown-item`** dividers and **`cat-slider-tick`** labels used fixed greys.
  - **`cat-datepicker`: the calendar grid was white on a dark page.** Its day cells were painted with `var(--bulma-white)` and `var(--bulma-grey-*)`, which are palette constants rather than theme tokens — the same value in both schemes — while the day numbers used `var(--bulma-text)`, which does adapt. The result was light-grey text on white: **1.9:1**, now 8.43:1.
  - **`cat-card`** dropped a `#fafafa` hex fallback, which the amended rule prohibits.

  Focus rings across `cat-button`, `cat-card`, `cat-collapse`, `cat-datepicker`, `cat-dropdown-item`, `cat-input`, `cat-safelink`, `cat-slider-tick`, `cat-steps`, `cat-step-item`, `cat-table` and `cat-tabs` moved to `var(--bulma-link-on-scheme)`. They were not failing — a focus indicator is judged against WCAG 1.4.11's 3:1, which they met — but they were the wrong blue in dark mode.

  ## Visible change worth knowing about

  Text and indicators tinted by a variant now use Bulma's `-on-scheme` tokens, which are the ones that actually adapt: `--bulma-link` resolves to the same value in both schemes, while `--bulma-link-on-scheme` shifts for the background it sits on.

  A side effect is that these components now follow **your** palette. Previously the compiled SCSS default won regardless of what an app configured, so an app overriding `$link` saw Bulma's stock blue in its tabs and focus rings anyway. Those now render in the configured color. If your app overrides Bulma colors, expect tabs, focus rings and slider tick labels to change appearance — to the color you asked for.

  `var(--bulma-white)` is left in place where it is correct: the checkbox tick and the switch knob sit on a variant-colored fill, and `cat-slider`'s value bubble is always dark. Those are theme-independent surfaces, unlike the calendar grid.

  Colors that are deliberately theme-independent were left alone: `cat-tooltip`'s bubble is always dark, so white text on it is correct in both schemes, and it now says so in a comment.

  `.claude/CLAUDE.md` has been amended to match — runtime tokens for color, SCSS variables for sizing, spacing, radii and breakpoints, and never a hex fallback.

## 0.10.0

### Minor Changes

- [#63](https://github.com/interline-io/catenary/pull/63) [`599060c`](https://github.com/interline-io/catenary/commit/599060cfad7c77a6f3758ac4bb14471195c6bd1d) Thanks [@drewda](https://github.com/drewda)! - New `cat-collapse` disclosure component, with `cat-msg` and `cat-card` rebuilt on the same shared implementation.

  The library already had two hand-rolled disclosures — the `expandable` modes of `cat-msg` and `cat-card` — which had drifted apart and shared the same accessibility flaws. Rather than adding a third, the state and ARIA wiring now live in one place (`util/disclosure.ts`) and all three render it.

  ## New: `cat-collapse`

  A standalone disclosure following the [WAI-ARIA disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/):

  - `label` and `icon` for the default trigger, or a `#trigger` slot receiving the current `open` state.
  - `v-model:open`, plus `open`/`close` events so several collapses can be driven by one parent value as an accordion.
  - `#actions` slot for controls that belong next to the trigger — rendered as a sibling, never nested inside the button.
  - `heading-level` (2–6) wraps the trigger in a real heading, so a set of collapses is navigable by heading. The button goes inside the heading, never the reverse: most screen readers do not announce a heading nested inside an interactive element, and `role="button"` on a heading removes it from the headings list entirely.
  - `animated` opt-in transition, suppressed under `prefers-reduced-motion`.
  - `disabled`, `ariaLabel`, and an exposed `open()` / `close()` / `toggle()` / `focus()` API.

  ## Accessibility fixes

  `cat-msg` and `cat-card` both put `role="button"` and `tabindex="0"` on a `<div>` header with hand-written Enter/Space handlers. Both now use a native `<button>`, which brings role, focus, keyboard activation and forced-colors rendering from the platform instead of from handlers that have to be kept correct.

  - **`cat-msg`: the close button is no longer nested inside the trigger.** With `expandable` and `closable` together, the `delete` button sat inside an element with `role="button"` — invalid nested interactive content, and the reason the keydown handlers needed `.self` modifiers to stop the header swallowing Space meant for the close button. The two are now siblings and those modifiers are gone.
  - **`cat-card`: the chevron is no longer a nested `<button>`.** It was a real button inside `role="button"`, working only because of `@click.stop`. It is now a `<span>` inside the single trigger button. Interactive header content belongs in `#actions`, which renders outside the trigger.
  - **Both guarantee the trigger has an accessible name.** With no `label` and no `#trigger`/`#header` slot the button held only an aria-hidden chevron, leaving it unnamed (WCAG 4.1.2). Both now fall back to a generic name, overridable with the new `ariaLabel` prop, and omit `aria-label` entirely when visible text already supplies the name.
  - **`cat-msg`'s body is hidden with `v-show` rather than removed with `v-if`.** `aria-controls` is an IDREF, so removing the body while collapsed left it pointing at nothing. `display: none` keeps the reference valid while still taking the subtree out of the accessibility tree and the tab order.
  - **All three triggers keep their flex layout on an inner `<span>` rather than on the `<button>`.** Per the ARIA spec `button` is children-presentational, so its descendants should not surface as separate accessibility objects, and putting `display: flex` on the button itself is a [documented way to subvert that in WebKit](https://adrianroselli.com/2022/07/its-mid-2022-and-browsers-mostly-safari-still-break-accessibility-via-display-properties.html). Same layout, semantics kept off the button. This is spec conformance rather than a fix for an observed failure: VoiceOver + Safari announces the trigger correctly as _"Methodology, expanded, button"_. VoiceOver + Firefox appends a trailing _"group"_, but that persists regardless of this change and looks like an artifact of that pairing, whose macOS support has been [patchy since it landed in Firefox 87](https://blog.mozilla.org/accessibility/voiceover-support-for-macos-in-firefox-87/).
  - Both now set `aria-controls` on the trigger, and both dropped their `eslint-disable` for `vuejs-accessibility/no-static-element-interactions`.

  ## Pre-existing bugs fixed

  All three found while doing the above, none introduced by it:

  - **`cat-msg`'s dismiss button had no `type` and a poor name.** Without an explicit type a `<button>` defaults to `submit`, so a `closable` message inside a `<form>` submitted it on dismiss. Its accessible name was also the bare `"delete"` — Bulma's class name rather than a description of the action. It is now `type="button"`, named `"Dismiss message"` by default and overridable via a new `ariaCloseLabel` prop matching `cat-notification`. `cat-modal` and `cat-notification` already had both; `cat-msg` was the outlier.

  - **`cat-card`: an expandable card with no header rendered permanently invisible content.** The header only rendered given a `label`, `#header` or `#actions` — but the toggle lives in the header, so `<cat-card expandable>` with none of those produced no trigger at all while still hiding its content behind the open state, with no way to reveal it. `expandable` is now part of that condition, with a regression test.
  - **`cat-msg`: the body was wrapped in an extra `<div>`, suppressing Bulma's intended appearance.** Bulma styles `.message-header + .message-body` to drop the accent border and square the top corners so the body sits flush beneath the header. The wrapper broke that adjacency, so **every titled message** rendered with a stray left stripe and a rounded top meeting the header's square bottom. The body element now carries the `media` class, the transition class and the id directly, so Bulma's own defaults apply with no CSS of our own.

  ## Migration notes

  **Public APIs are additive.** `cat-msg` and `cat-card` keep their existing props, slots and events — including `cat-msg`'s `close` still meaning "dismissed", not "collapsed". New optional props: `ariaLabel` on `cat-collapse` and `cat-card`, and `ariaCloseLabel` on `cat-msg`.

  **Markup changes, by component:**

  - **`cat-msg` changed for every message, not just expandable ones**, because the body wrapper was removed. `.message-body` is now a direct child of `.message` and carries `media` / `cat-expandable-content` / the content id itself. Consumer CSS that reached the body through the wrapper, or that targeted the wrapper, needs checking.
  - **`cat-card` changed only in the `expandable` path.** A plain card renders exactly as before with no added wrapper, which matters because non-expandable cards are by far the common case.
  - When expandable, the header title of either component now sits inside a `<button>` (`.cat-card-trigger` / `.cat-msg-trigger`), so CSS selecting header internals as _direct_ children of `.card-header` / `.message-header` needs checking. Descendant selectors, including the `:deep(.card-header-title)` form used in the apps, continue to match.
  - On an expandable `cat-card` the built-in title renders as `<span class="card-header-title">` rather than `<p>`, because a button's content model is phrasing content and a paragraph inside one is invalid HTML. Bulma sets `display` on that class, so it renders identically. Plain cards keep the `<p>`. Content supplied through `#header` also lands inside the trigger when expandable, so it must be phrasing content too.

  **Behavioural change:** content inside an expandable `cat-msg` now stays mounted while collapsed, rather than being created and destroyed on each toggle.

## 0.9.0

### Minor Changes

- [#59](https://github.com/interline-io/catenary/pull/59) [`0ec6c84`](https://github.com/interline-io/catenary/commit/0ec6c84624d91151b88bdeebd7b25d64a0509478) Thanks [@drewda](https://github.com/drewda)! - Support vue-router 5, externalize it from the bundle, and move the dev toolchain to Nuxt 4.5.1 / Vite 8.

  - **`vue-router` peer range widened to `^4.0.0 || ^5.0.0`.** Nuxt 4.4+ ships vue-router 5, so the previous `^4.0.0` range forced consumers on modern Nuxt to resolve a _second_ copy of the router alongside their own. Catenary's only vue-router coupling is a type-only import in `cat-link` (`Router`, `RouteLocationRaw`, `RouteLocationNamedRaw`), and those types are unchanged across v4 and v5 — the library typechecks clean against both.
  - **`vue-router` is now external to the build.** `cat-link` resolves `RouterLink` through a dynamic `import('vue-router')`, and because vue-router was not in the externals list the bundler was emitting a bundled 21 kB copy of it into `dist/`. Consumers now always get their own router instance. This was pre-existing behaviour, not introduced by the Vite 8 upgrade.
  - Dev toolchain moved to Nuxt 4.5.1, Vite 8.1.5, `@vitejs/plugin-vue` 6.0.8, `nuxi` 3.37.0, vue 3.5.40. Nuxt 4.5.1 is a security release; it also pulls `@nuxt/devtools` to 3.3.1, which fixes a critical development-only RCE (GHSA-279x-mwfv-vcqv) where an unauthenticated RPC could run arbitrary commands on the machine running `nuxt dev`.
  - `build.rollupOptions` renamed to `build.rolldownOptions` — Vite 8 replaced Rollup with Rolldown and deprecated the old key. Output is byte-identical under either name.
  - The playground's devtools are now gated behind `isDev` instead of being unconditionally enabled, matching the convention in the sibling apps.

  No runtime API changes.

## 0.8.0

### Minor Changes

- [#57](https://github.com/interline-io/catenary/pull/57) [`9064b12`](https://github.com/interline-io/catenary/commit/9064b1235bc57fbedc148d67cb0a8bb76893c585) Thanks [@drewda](https://github.com/drewda)! - `cat-search-bar` accessibility pass, and a first-class pattern for announcing filtered-table results.

  - The search input now has an accessible name: a new `ariaLabel` prop defaulting to `"Search"` (previously it was labelled only by its placeholder, which is not an accessible name — WCAG 4.1.2 / 3.3.2). Set `:aria-label="undefined"` when a visible label already names the field.
  - The clear button is now a properly labelled `<button>` (`clearAriaLabel`, default `"Clear search"`) instead of announcing as the generic "Action", and clearing returns focus to the input instead of dropping it to the page (WCAG 2.4.3). Internally the component now builds on `cat-input`'s `clearable`.
  - New optional `#status` slot renders into a visually-hidden `role="status" aria-live="polite"` region, so consumers filtering a table/report can feed it a result count and screen-reader users hear how many rows matched (WCAG 4.1.3). `aria-controls` (and other attrs) are forwarded to the input, so the search can point at the region it updates.
  - Escape now clears the field when it has a value (and stops there, cooperating with the layered dismiss stack so an enclosing modal/popup is not also dismissed); when the field is empty, Escape is left to bubble. Opt out with `clear-on-escape="false"`.
  - A new `clear` event fires whenever the field is cleared — via the clear button, Escape, or the newly exposed `clear()` method (alongside `focus()`/`blur()`) for programmatic use.

## 0.7.0

### Minor Changes

- [#52](https://github.com/interline-io/catenary/pull/52) [`e3c3dc5`](https://github.com/interline-io/catenary/commit/e3c3dc5a8f5785f7d8d1f3600a77612b14ed05c0) Thanks [@drewda](https://github.com/drewda)! - Layered Escape dismissal and cat-modal fixes. Escape pressed while a popup (cat-dropdown menu, cat-datepicker calendar) is open inside a cat-modal closed both at once, destroying in-progress form state.

  - New shared LIFO dismiss stack (`src/util/dismiss-stack.ts`): a single document keydown listener dismisses only the topmost open layer per Escape press. cat-modal, cat-dropdown, and cat-datepicker register through it (via `useDismissablePopup` for the popups); cat-taginput continues to self-consume Escape on its input. A popup inside a modal now closes on the first Escape and the modal on the second. A non-closable modal still registers a layer, so it swallows Escape rather than letting it dismiss a surface beneath it.

  cat-modal also gains:

  - Open-state side effects (html clipping, focus capture, initial focus) now run when the modal is mounted with `modelValue` already true, not only when it transitions open.
  - The focus trap skips hidden focusable candidates (`display:none` etc.) so Tab no longer dead-ends on them.
  - An overflowing `modal-card-body` becomes a focusable named region (`tabindex="0"`, `role="region"`, labeled by the title) so keyboard users can scroll it; Safari does not make scroll containers focusable automatically. Overflow is tracked with a ResizeObserver while open.
  - An axe smoke test, matching sibling controls.

- [#55](https://github.com/interline-io/catenary/pull/55) [`7257d9a`](https://github.com/interline-io/catenary/commit/7257d9ae3ae73631a397a9dd7ce530c34568180c) Thanks [@drewda](https://github.com/drewda)! - `cat-input` gains an opt-in `clearable` prop that renders a clear button in the right icon slot once the input holds a value.

  - The button is a real `<button type="button">` (focusable in tab order) using the `mdi-close-circle` icon, matching `cat-search-bar`'s clear affordance. The icon is `aria-hidden`; the button carries an accessible label, `"Clear"` by default and overridable via `clear-aria-label`.
  - Activating it emits a new `clear` event alongside `update:modelValue` (`''`, or `0` for numeric inputs to match the bound type), then returns focus to the input so keyboard users are not stranded when the button disappears.
  - The button auto-hides when the input is empty, `disabled`, `readonly`, or `static`. It takes over the right slot, so it is mutually exclusive with `icon-right`.
  - A `clear()` method is exposed via `defineExpose` for programmatic clearing.

- [#54](https://github.com/interline-io/catenary/pull/54) [`3ad066c`](https://github.com/interline-io/catenary/commit/3ad066c433ab1b974a4c68e2f7d4e1e2025c0b5d) Thanks [@drewda](https://github.com/drewda)! - `cat-dropdown` and `cat-datepicker` render their popups (menu, calendar) in the browser top layer via the Popover API, so they are no longer clipped by an ancestor with `overflow: auto/hidden`. The most visible case: a dropdown or datepicker inside a scrollable `cat-modal` body had its menu/calendar cut off at the modal's edge. This brings the two widgets in line with `cat-tooltip` (top-layer since 0.3.0).

  - New `src/util/anchored-popover.ts` composable: shows the popup with `showPopover()` (`popover="manual"`, so it does not light-dismiss outside the components' own handling), positions it with fixed viewport coordinates computed from the trigger's box, flips the vertical side when the preferred side lacks room, clamps to the viewport, and repositions on scroll (capture phase, so scrolling any ancestor works) and resize. The popup stays in place in the DOM, so scoped styles, `aria-controls`/`aria-activedescendant`, focus management, and click-outside containment (`root.contains()`) are unchanged.
  - Browsers without the Popover API (and jsdom) fall back to the existing absolute positioning; no behavior change there.
  - The positioning math is a pure exported function (`computePopoverPosition`) with unit tests.

## 0.6.1

### Patch Changes

- [#44](https://github.com/interline-io/catenary/pull/44) [`997ca58`](https://github.com/interline-io/catenary/commit/997ca58ab1de1683fb6c558cee40e7775f1f5e0b) Thanks [@drewda](https://github.com/drewda)! - `cat-taginput` announcement and description improvements, following accessibility review of the multi-select combobox pattern. The input clears after each selection so users can keep adding items, which leaves screen reader users unsure what is currently held; and nothing explained the interaction model.

  - Add/remove announcements now restate the resulting selection: `Added Banana. Selected: Apple, Banana.` and `Removed Apple. None selected.`
  - The input is described by a visually hidden usage hint via `aria-describedby` (new `ariaUsageHint` prop with a default covering type-to-search, arrow browsing, and Enter/Tab selection), merged with the existing max-tags counter and a wrapping `cat-field`'s help message id (`FieldDescribedbyKey`, matching input/textarea/select/slider).

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
