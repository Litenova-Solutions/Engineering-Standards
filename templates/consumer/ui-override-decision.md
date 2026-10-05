---
{
  "kind": "decision",
  "id": "__DECISION_ID__",
  "specStatus": "draft",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD"
}
---
# __TITLE__

## Context

Name the shared UI package, the frontend or surface inside it, and the concrete constraint the pinned baseline cannot satisfy.

## Override

| Field | Value |
|:---|:---|
| Shared UI package | `@__PROJECT__/ui` |
| Frontend | `__FRONTEND__` |
| Density profile | `public-light`, `application-balanced`, or `admin-dense` |
| Deviation | `__SCOPE__` |
| Review or removal date | `__REVIEW_DATE__` |

The override names one visual authority for the stated scope. It does not permit two general-purpose visual systems on one route.

## Standards impact

- Replaced provision IDs: `standards/rule/frontend-ui.select-one-visual-authority`, `standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package`, or `standards/rule/frontend-ui.govern-behavior-companions-and-specialist-controls` as applicable.
- Registry or package provenance: `__PROVENANCE__`.
- License and security review: `__REVIEW_RECORD__`.
- Migration trigger: `__MIGRATION_TRIGGER__`.

## Cost and alternatives

Explain why the approved shared composition, behavior-only companion, or bounded specialist surface is insufficient. Record the rejected alternatives and the expected ownership, accessibility, CSS, and upgrade cost.

## Controls

- Keep the selected system behind the shared package's documented entry points.
- Keep page vocabulary, source ownership, states, focus behavior, responsive behavior, and evidence records active for the overridden scope.
- Do not add another general-purpose visual system to the same route.
- Record the owner, the review date, the affected routes, and the removal condition in the project record.

## Verification

Name the component, keyboard, focus, accessibility, responsive, visual, and task evidence required before activation and the command that validates the configuration.
