---
"@interline-io/catenary": patch
---

`cat-input` stays in step with a parent that applies a numeric value late or not at all, such as one that keeps it in the URL. While focused, the field shows exactly what was typed. On blur it shows the model, even when the parent ignored the last emit: a cleared field whose `undefined` was dropped used to stay blank while the model kept its value. A late echo of a value the input emitted itself no longer counts as an outside change: typing "2.75" quickly against a parent that applies each emit after a delay used to snap the field back to "2.00". A value the input never emitted still replaces the typed text, as a reset should.
