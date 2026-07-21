---
{
  "kind": "page",
  "id": "__APP__.__PAGE__",
  "recordStatus": "current",
  "deliveryStatus": "planned",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "app": "__APP__",
  "route": "__ROUTE__",
  "useCases": ["__SUBJECT__.__USE_CASE__"],
  "applicableExtensions": []
}
---
# __TITLE__

## Composition

| Use case | Component | Trigger | Result presentation |
|:---|:---|:---|:---|
| `__SUBJECT__.__USE_CASE__` | `__COMPONENT__` | State the interaction. | State the visible result. |

## States

- Loading.
- Empty.
- Error.
- Forbidden.
- Not found.
- Pending or disabled interaction.
- Ready.

## Interaction

Describe multi-step behavior, URL state, focus, and navigation results.

## Folder mapping

```text
apps/__APP__/src/
  app/__ROUTE_FOLDER__/page.tsx
  features/__SUBJECT__/__USE_CASE__/
    __COMPONENT__.tsx
```

## Metadata

Record public title, description, canonical URL, and indexing behavior when applicable.

## Verification

List component, route, accessibility, and Playwright checks.
