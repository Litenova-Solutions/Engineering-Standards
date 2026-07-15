---
{
  "id": "core.delivery",
  "kind": "core",
  "normative": true,
  "appliesTo": ["delivery", "testing", "all"],
  "recipes": []
}
---
# Delivery

## Agent Quick Rules {#agent-quick-rules}

- Complete one primary journey before adding secondary capabilities.
- Run backend, frontend, standards, and recipe gates that apply.
- Keep generated artifacts current.
- Ship security, data safety, diagnostics, rollback, and operating instructions with v1.
- Record every skipped gate with a specific reason.

## DELIVERY.SLICE.001 - Finish one observable journey

An implementation slice includes its domain behavior, persistence, API, optional UI, automated evidence, and operating impact. Partial outer-layer placeholders do not count as a completed slice.

## DELIVERY.GATES.001 - Run applicable checks

Backend changes require Release build and tests. Frontend changes require frozen install, lint, type check, tests, and build. Critical browser journeys require Playwright. Enabled recipes add their declared gates.

## DELIVERY.GENERATED.001 - Commit generated artifacts

Regenerate standards indexes, trace reports, OpenAPI, and frontend API types with their sources. Generators must produce stable output without timestamps or absolute paths.

## DELIVERY.V1.001 - Meet the application v1 gate

Application v1 requires:

- A deployed primary user journey.
- Automated evidence for active acceptance criteria.
- Authentication and authorization when access is restricted.
- Automated schema creation or upgrade.
- Backup and restore instructions.
- Health checks and trace-correlated logs.
- Secrets outside source control.
- CI for all required gates.
- A tested deployment and rollback path.
- A deployed smoke test for the primary journey.

Scale, tenancy, realtime behavior, and provider-specific work remain outside v1 until enabled.

## DELIVERY.REPORT.001 - Report verification precisely

Completion reports name the commands run, their results, and any skipped checks. Do not claim a repository-wide result from a narrow test.

