# Decision Records

## Intent

A decision record states one choice that is expensive to reverse, with the options weighed and the evidence cited. This page states where the record lives, what it holds, and how it ends.

## Reference

### Where a record lives

| Item | Value |
|:---|:---|
| Path | `docs/product/decisions/<number>-<name>.md` in the consumer repository |
| Template | `templates/consumer/decision.md` |
| Metadata type | `decision` |

### Identifier form

The identifier is `decision/<number>-<name>`, such as `decision/0047-extend-loan-period`. The number counts as a word toward the six-word name bound. The name states the choice in words. The number keeps proposal order only.

### What a record contains

| Section | What it states |
|:---|:---|
| Context | The concrete constraint or conflict forcing a choice. |
| Options | Each option weighed, with its cost. |
| Decision | The selected behavior and its decider. |
| Consequences | The required work and the accepted cost. |
| Evidence | The research and constraints the choice rests on. |

The record also carries `decided` with the approval date and `changeWhen` with what would change it. It carries `options` with the weighed options, `decides` with the records it sets, and `basedOn` with the constraints and research behind it.

### Replaced, never edited

An approved record never changes. A later choice is a new record naming the old one in `replaces`. The old record stands retired beside the new one. A departure from a shared standard is an exception record rather than a decision.

### The draft gate

A record stays unapproved while a decision behind it stays draft. Approval names the decider in `decidedBy` and the date in `decided`.

## Notes

The outside conventions for this artifact are [Nygard's architecture decision record](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) and [MADR](https://adr.github.io/). Both record context, decision, and consequences in one immutable file per choice, and this record keeps that shape.
