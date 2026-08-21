---
{
  "kind": "page",
  "id": "__APP__.__PAGE__",
  "specStatus": "approved",
  "implementationStatus": "planned",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "app": "__APP__",
  "route": "__ROUTE__",
  "useCases": ["__MODULE__.__USE_CASE__"],
  "applicableExtensions": []
}
---
# __TITLE__

## Composition

| Use case | Component | Trigger | Result presentation |
|:---|:---|:---|:---|
| `__MODULE__.__USE_CASE__` | `__COMPONENT__` | State the interaction. | State the visible result. |

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

## UI Contract

Create `__PAGE__.ui.json` beside this document from `ui-page.json`. Use the frontend vocabulary to
select the profile, shell, patterns, components, and states. The sidecar defines:

- ordered regions, content limits, overflow, compact and wide behavior;
- initial scroll and active element for direct navigation;
- focus order, dialog or menu return focus, and validation-error destination;
- landmarks, heading hierarchy, labels, descriptions, and status announcements;
- acceptance, browser, accessibility, visual, and manual evidence IDs.

## Folder mapping

```text
apps/__APP__/
  app/__ROUTE_FOLDER__/page.tsx
  features/__MODULE__/__USE_CASE__/
    __COMPONENT__.tsx
```

## Metadata

Record public title, description, canonical URL, and indexing behavior when applicable.

## Verification

List component, route, keyboard, focus, accessibility, responsive, visual, and Playwright checks. Name
the evidence IDs in the UI sidecar.
