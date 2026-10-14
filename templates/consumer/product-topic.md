---
{
  "kind": "product-topic",
  "id": "__TOPIC__",
  "specStatus": "draft",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "reviewBy": "YYYY-MM-DD"
}
---
# __TOPIC_TITLE__

## Summary

State the current position on this topic in at most three sentences. A reader who stops here knows what the product does and refuses on this topic.

## Rules

- `product/__TOPIC__.__RULE__`: State one testable commitment. A domain specification or a code element cites this identifier.

Each entry opens with one identifier of the form `product/<topic>.<rule>`, where `<topic>` is this page's `id`. Write `None.` when the page states no rule.

## Position

| Choice | Reason | Decision |
|:---|:---|:---|
| State one choice the product owner made. | State the reason in one sentence. | [__DECISION_ID__](decisions/__DECISION_ID__.md) |

Every row links the decision record that set it. A row on an approved page links an approved decision.

## Refusals

| Refused | Reason | Decision |
|:---|:---|:---|
| State one thing this topic rules out. | State the reason in one sentence. | [__DECISION_ID__](decisions/__DECISION_ID__.md) |

Write `None.` when the topic refuses nothing.

## Open questions

| Question | Owner | What settles it |
|:---|:---|:---|
| State one undecided question. | `__OWNER__` | Name the evidence, the adviser, or the trigger. |

Write `None.` when nothing on this topic is undecided.

## Next

| Change | When |
|:---|:---|
| State one planned change to this position. | Name the milestone or the trigger. |

Write `None.` when no change is planned.

## History

None. No decision record names this page in its affects field.

`node standards/tools/product-records.mjs --write` writes this section from the decision records. Do not edit it by hand.

## Evidence

- Link the research claim or record that supports a choice, with its confidence.
