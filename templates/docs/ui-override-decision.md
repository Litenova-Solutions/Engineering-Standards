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

Name the React web frontend, route or surface, current visual system, and concrete constraint that
the shadcn/ui baseline cannot satisfy.

## Override

| Field | Value |
|:---|:---|
| Frontend | `__FRONTEND__` |
| Profile | `public-light`, `application-balanced`, or `admin-dense` |
| System | `__SYSTEM__` |
| Component base | `__BASE__` |
| Styling | `__STYLING__` |
| Scope | `__SCOPE__` |
| Review or removal date | `__REVIEW_DATE__` |

The override names one visual authority for the stated scope. It does not permit two general-purpose
visual systems on one route.

## Standards impact

- Replaced rule IDs: `UI.GOVERNANCE.001`, `UI.SHADCN.001`, or `UI.COMPANION.001` as applicable.
- Registry or package provenance: `__PROVENANCE__`.
- License and security review: `__REVIEW_RECORD__`.
- Migration trigger: `__MIGRATION_TRIGGER__`.

## Cost and alternatives

Explain why the approved shadcn composition, behavior-only companion, or bounded specialist surface
is insufficient. Record the rejected alternatives and the expected ownership, accessibility, CSS, and
upgrade cost.

## Controls

- Keep the selected system behind the frontend's documented public export boundary.
- Keep page vocabulary, source ownership, states, focus behavior, responsive behavior, and evidence
  records active for the overridden scope.
- Do not add another general-purpose visual system to the same route.
- Record the owner, review date, affected routes, and removal condition in the project configuration.

## Verification

Name the component, keyboard, focus, accessibility, responsive, visual, and task evidence required
before activation and the command that validates the configuration.
