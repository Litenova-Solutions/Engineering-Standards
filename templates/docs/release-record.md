---
{
  "kind": "release-record",
  "id": "__RELEASE_RECORD_ID__",
  "specStatus": "approved",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "release": "__VERSION__"
}
---
# Release Record __VERSION__

- Release date: `__DATE__`.
- Source commit: `__COMMIT__`.
- Immutable artifact: `__ARTIFACT_REFERENCE__`.

## Scope

- Primary release flow: `__PRIMARY_RELEASE_FLOW__`.
- Supporting end-to-end flows: `__SUPPORTING_FLOWS__`.
- Included use cases: `__USE_CASE_IDS__`.
- Included workflows: `__WORKFLOW_IDS__`.
- Selected extensions: `__EXTENSIONS__`.
- Excluded paths and known limitations: `__LIMITATIONS__`.

All included use cases and workflows must have `implementationStatus: verified`. A blocking external claim must be resolved or excluded from this release scope.

## Automated gates

| Gate | Exact command or workflow | Result | Evidence |
|:---|:---|:---|:---|
| Backend | `__COMMAND__` | `__RESULT__` | `__LINK_OR_ARTIFACT__` |
| Frontend | `__COMMAND__` | `__RESULT__` | `__LINK_OR_ARTIFACT__` |
| Contracts | `__COMMAND__` | `__RESULT__` | `__LINK_OR_ARTIFACT__` |
| End-to-end test | `E2E-__FLOW_ID__-01` | `__RESULT__` | `__LINK_OR_ARTIFACT__` |
| Security and supply chain | `__COMMAND__` | `__RESULT__` | `__LINK_OR_ARTIFACT__` |

## Data and schema

- Schema plan or migration: `__EVIDENCE__`.
- Compatibility and rollback result: `__RESULT__`.
- Backup reference: `__REFERENCE__`.
- Restore exercise and end-to-end test result: `__RESULT__`.

## Deployment and recovery

- Environment and deployed artifact: `__RESULT__`.
- Readiness result: `__RESULT__`.
- Primary release flow smoke test: `__RESULT__`.
- Rollback exercise and retained artifact: `__RESULT__`.
- Diagnostics and alert routing exercise: `__RESULT__`.

## Skipped checks

List each skipped check, the exact reason it did not apply, and the approving owner. Write `None` when every applicable check ran.

## Approval

Record the maintainer's release decision and link each residual risk with its approving decision owner.
