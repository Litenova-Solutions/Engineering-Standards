# Decision Records

## Intent

A decision record pins one expensive-to-reverse choice (a data model, a provider, a security boundary) down with the options weighed, the evidence cited, and the decider named, so a later team sees why the product looks the way it does instead of relitigating it. This page states where each record lives in the consumer repository (the application repository built against one pinned LiteSpec release), what sections and metadata it holds, and how a record ends: replaced, never edited.

## Reference

The [product page](../core/product.md) states what a decision record means; this page states where it lives and what it holds.

### Where a Record Lives

Each record is one Markdown file in the consumer repository. Start it by copying the template, then fill in the opening metadata block and the sections below.

| Item | Value |
|:---|:---|
| Path | `docs/product/decisions/<number>-<name>.md` in the consumer repository |
| Template | `templates/consumer/decision.md` |
| Metadata type | `decision` |

### Identifier Form

The identifier is `decision/<number>-<name>`, such as `decision/0001-receipt-threshold`. The name states the choice in words, in at most six words, and the number counts as one of those words. The number keeps proposal order only: it orders records by when they were proposed and carries no other meaning.

### What a Record Contains

The body carries four sections:

| Section | What it states |
|:---|:---|
| Context | The concrete constraint or conflict forcing a choice. |
| Decision | The selected behavior and its decider. |
| Consequences | The required work and the accepted cost. |
| Evidence | The research and constraints the choice rests on, each with its confidence. |

The metadata block carries the fields tools read: `options` with one entry per weighed option (`name`, `for`, `against`), `chosen` with the selected option once approved, `decided` with the approval date, and `changeWhen` with what would overturn the choice. It also carries `decides` with the records this choice sets, `basedOn` with the constraints and research behind it, and `replaces` with the record this choice overturns. A draft carries `decider` with the decider and `decideBy` with the date the choice is due.

### Replaced, Never Edited

An approved record never changes, so its bytes stay a faithful history of the reasoning. A later choice is a new record naming the old one in `replaces`, and the old record stands retired beside the new one. A departure from a shared standard is a deviation rather than a decision.

### The Draft Gate

A record stays unapproved while a decision it depends on stays draft, because approving it would fix a choice on ground that can still move. Approval records the date in `decided` and the selected option in `chosen`.

## Notes

The outside conventions for this artifact are [Nygard's architecture decision record](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) and [MADR](https://adr.github.io/). Both record context, decision, and consequences in one immutable file per choice, and this record keeps that shape.
