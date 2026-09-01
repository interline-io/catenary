---
"@interline-io/catenary": minor
---

`cat-checkbox` accessibility review, plus API additions modelled on Reka UI. Part of #64. All additive — no existing prop, event or behavior changes.

**`aria-label` and `aria-describedby` now reach the native input.** The component's root *is* the `<label>`, so undirected fallthrough attributes landed there — where `aria-label` does nothing for the input's accessible name. A checkbox with no visible text was therefore impossible to name from outside, which matters for the common case of a row selector in a table. There is now an `ariaLabel` prop, and fallthrough `aria-*`/`data-*` are routed to the input. `class`, `style` and listeners stay on the wrapper, exactly where they already applied — moving a spacing class onto the box would shift the layout of existing call sites.

**The mixed state survives a click.** The browser clears the DOM `indeterminate` property as soon as the box is clicked. Since the `indeterminate` prop had not changed, the watcher never refired, so a parent checkbox whose children were unchanged silently lost its mixed state in the accessibility tree. It is now restored after the change event.

No `aria-checked="mixed"` is set: a native checkbox maps `.indeterminate` to a mixed state on its own, and redundant ARIA over working native semantics is a regression rather than an improvement. The APG example that sets `aria-checked` is for custom `role="checkbox"` widgets.

**Reka UI-style additions.**

- `trueValue` / `falseValue` — emit something other than a boolean. They only take effect when set, so a caller binding a truthy non-boolean keeps reading as checked.
- `name`, `value` and `required` on the native input, so a checkbox can take part in native form submission and validation. In array-binding mode the native `value` falls back to `nativeValue`, which is already the option's semantic value and is what `cat-radio` binds — otherwise pairing `name` with the existing array API would submit the browser default of `"on"` for every checked box.

Existing usage renders byte-identically with one exception: an array-binding checkbox now carries `value="<nativeValue>"` on its input. That is inert unless the checkbox is inside a native `<form>`, but it will show up in a DOM snapshot.

The playground page gains the `demo-a11y` section it was missing, along with demos for the unnamed-row-selector case, custom true/false values, and native form submission.
