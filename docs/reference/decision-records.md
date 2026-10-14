# Decision Records

## Intent

State what a consumer decision record holds, where it lives, and which fields cite it. A standards override names a decision path, and this page states what has to be at that path.

## Reference

A decision record states one choice that is expensive to reverse, together with the constraint that forced it. The record is a consumer artifact. The standards repository records its own changes in `CHANGELOG.md` and keeps no decision records of its own.

### Where a record lives

| Item | Value |
|:---|:---|
| Path | `docs/decisions/{id}.md` in the consumer repository |
| Template | [Decision](../../templates/consumer/decision.md) |
| Override variant | [UI override decision](../../templates/consumer/ui-override-decision.md) |
| Product variant | [Product decision](../../templates/consumer/product-decision.md), at `docs/product/decisions/{id}.md` |
| Metadata kind | `decision` |
| Schema | [Specification metadata](../../schemas/specification-metadata.schema.json) |

### What a record contains

| Section | What it states |
|:---|:---|
| Context | The concrete constraint or conflict that forced a choice. |
| Decision | The selected behavior, and the status that accepted it. |
| Standards impact | Every provision the decision replaces, or `None`. |
| Activation conditions | Each claim or piece of evidence required before the decision applies. |
| Review controls | Scope, review date, compensating control, approval, and removal condition. |
| Consequences | Required work, accepted cost, and the replacement or review condition. |
| Pending decisions | Each unresolved external, policy, or provider choice, as a separate record. |
| Verification | How a reviewer confirms the decision is applied. |

### What cites a record

| Citing field | File | What the citation means |
|:---|:---|:---|
| `overrides[].provisionId` | `standards.project.json` | The named Standard is replaced by this decision. |
| `overrides[].decision` | `standards.project.json` | The path of the record that carries the replacement. |
| `overrides[].reviewBy` | `standards.project.json` | The date the override is reread or removed. |
| `frontends[].ui.overrideDecision` | `standards.project.json` | The record that suspends part of the visual baseline. |

### Product decisions

A product decision sets business intent rather than replacing a provision. It names the product pages it sets in `affects`, and it carries the sections Context, Options considered, Decision, Evidence, Consequences, and What would change it. An approved product decision names its approver in `decidedBy` and the date in `decided`. A replaced product decision is retired with `supersededBy`, and its replacement lists it in `supersedes`. The [product intent standard](../core/product.md) owns these provisions.

| Field | Meaning |
|:---|:---|
| `affects` | The product pages, relative to the documentation root, whose position the decision sets. |
| `decidedBy` | The accountable person who approved the decision. |
| `decided` | The approval date. |
| `supersedes` | The decision records this one replaces. |
| `supersededBy` | The decision record that replaces this one. |

An override names one provision. A decision that deviates from four provisions is named by four override entries, because a reader resolving one identifier follows one citation.

An override whose decision body justifies less than the named provision covers is the same defect as an unnamed decision. Split the override into the narrow provisions the decision actually argues, and write a separate decision for the rest.

## Notes

The outside conventions for this artifact are [Nygard's architecture decision record](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) and [MADR](https://adr.github.io/). Both record context, decision, and consequences in one immutable file per choice, and this template keeps that shape.

Three sections extend it. `Standards impact` exists because a consumer decision binds to a provision identifier rather than standing alone. `Activation conditions` exists because a decision is often accepted before the evidence that permits it arrives. `Review controls` exists because an override without an expiry date is a permanent exemption nobody rereads.

A record is immutable once approved. A later choice that reverses it is a new record naming the one it supersedes. That relationship sits inside the consumer's own history rather than between standards releases.
