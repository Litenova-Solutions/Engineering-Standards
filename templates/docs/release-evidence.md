---
{
  "kind": "release-evidence",
  "id": "__RELEASE_EVIDENCE_ID__",
  "recordStatus": "current",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "release": "__VERSION__"
}
---
# Release Evidence __VERSION__

- Release date: `__DATE__`.
- Source commit: `__COMMIT__`.
- Immutable artifact: `__ARTIFACT_REFERENCE__`.

## Scope

- Primary Business Flow: `__PRIMARY_BUSINESS_FLOW__`.
- Supporting Business Flows: `__SUPPORTING_BUSINESS_FLOWS__`.
- Included Use cases: `__USE_CASE_IDS__`.
- Included Workflows: `__WORKFLOW_IDS__`.
- Selected extensions: `__EXTENSIONS__`.
- Excluded paths and known limitations: `__LIMITATIONS__`.

All included Use cases and Workflows must have `deliveryStatus: verified`. A blocking external claim must be resolved or excluded from this release scope.

## Automated gates

| Gate | Exact command or workflow | Result | Evidence |
|:---|:---|:---|:---|
| Backend | `__COMMAND__` | `__RESULT__` | `__LINK_OR_ARTIFACT__` |
| Frontend | `__COMMAND__` | `__RESULT__` | `__LINK_OR_ARTIFACT__` |
| Contracts | `__COMMAND__` | `__RESULT__` | `__LINK_OR_ARTIFACT__` |
| Flow check | `FC-__BUSINESS_FLOW_ID__-01` | `__RESULT__` | `__LINK_OR_ARTIFACT__` |
| Security and supply chain | `__COMMAND__` | `__RESULT__` | `__LINK_OR_ARTIFACT__` |

## Data and schema

- Schema plan or migration: `__EVIDENCE__`.
- Compatibility and rollback result: `__RESULT__`.
- Backup reference: `__REFERENCE__`.
- Restore exercise and Flow-check result: `__RESULT__`.

## Deployment and recovery

- Environment and deployed artifact: `__RESULT__`.
- Readiness result: `__RESULT__`.
- Primary Business Flow smoke test: `__RESULT__`.
- Rollback exercise and retained artifact: `__RESULT__`.
- Diagnostics and alert routing exercise: `__RESULT__`.

## Skipped checks

List each skipped check, the exact reason it did not apply, and the approving owner. Write `None` when every applicable check ran.

## Approval

Record the maintainer's release decision and link accepted residual risks.
