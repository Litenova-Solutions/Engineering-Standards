---
{
  "kind": "reference",
  "id": "composition-record-list",
  "specStatus": "draft",
  "owner": "__OWNER__",
  "lastReviewed": "__DATE__"
}
---

# Record list

A list of records, each with one value and one way into it.

## Intent

State why the shape is the shape. A recipe with no argument is a layout, and the next page is free to argue the opposite.

Name the reader and the question. A list answers which record to open next, and the order is what answers it.

## Reference

### Slots

| Slot | What goes in it |
|:---|:---|
| `row` | One record. It names what it is and who it belongs to. |
| `value` | The one figure the reader came to compare. |
| `row-action` | The control that opens the record. |

### States

| State | What is shown |
|:---|:---|
| `loading` | The skeleton, with the header already drawn. |
| `empty` | One line naming what is absent, and the verb the reader can do next. |
| `error` | The shared error state, with the reference the support desk needs. |
| `ready` | The rows, in the order the recipe argues for. |

### Rules

- The order is an argument. A list sorted by identifier is a table.
- An empty list says what is absent and what the reader can do next.
- Every list states how many rows the read returned.

### Where it is used

Name each page that reaches for this recipe. A recipe with one consumer is that page rather than a recipe.
