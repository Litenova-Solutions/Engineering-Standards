# Release Standard

## Intent

Application v1 means one primary release flow works in a deployed environment and can be supported by its maintainer. Passing one test category or completing an inner layer does not satisfy that outcome.

## Agent Summary {#agent-summary}

- Finish one observable primary release flow before secondary product outcomes.
- Require every included use case and workflow to have `implementationStatus: verified`.
- Run backend, frontend, documentation, end-to-end, and applicable extension checks.
- Keep OpenAPI and generated API types current.
- Record build, test, deployment, restore, rollback, diagnostics, and smoke-test evidence for one immutable artifact.
- Resolve blocking external claims or exclude their behavior from release scope.
- Report every skipped check with a specific reason.

## Standards

### Finish one observable slice (RELEASE.SLICE.001)

A completed use-case slice includes Domain behavior, Application coordination, persistence, entry points, automated evidence, and operating impact. Placeholder work leaves `implementationStatus: planned`.

A completed end-to-end flow connects verified use cases and workflows to one observable outcome and has at least one passing `E2E-*` test through a deployed public system boundary.

### Run applicable checks (RELEASE.GATES.001)

Backend changes require a Release build and tests. Frontend changes require frozen dependency installation, lint, type checking, tests, and a production build. End-to-end flow changes require their end-to-end tests. Product, domain, implementation, and API changes require code-document consistency checks. Selected extensions add their stated verification when project-scoped or locally applicable.

### Commit derived application contracts (RELEASE.DERIVED.001)

Regenerate OpenAPI and frontend API types with their source changes. Generated files must be stable and free of timestamps, machine paths, and nondeterministic ordering.

### Meet the application v1 gate (RELEASE.V1.001)

Application v1 requires:

- One deployed primary release flow referenced by the product brief.
- `implementationStatus: verified` on every included use case, workflow, end-to-end flow, and page specification.
- At least one passing end-to-end test through the deployed public boundary.
- Authentication and authorization when access is restricted.
- Repeatable database schema creation or upgrade.
- Backup and restore instructions with a tested restore.
- Liveness, readiness, and trace-correlated diagnostics.
- Secrets outside source control.
- CI for applicable checks.
- A tested deployment and rollback path.
- Current Operating Limits and required runbooks.
- One release record for the immutable artifact.

A blocking decision condition or external claim MUST be resolved before release. The release MAY exclude affected behavior when the product brief, end-to-end flow, entry points, and release record state the reduced boundary consistently.

Scale, tenancy, realtime behavior, provider-specific deployment, and other conditional behavior remain outside v1 until a selected extension applies.

### Report verification precisely (RELEASE.REPORT.001)

Completion reports name exact commands, outcomes, evidence scope, and skipped checks. Do not claim a repository-wide result from one project or one test category.

### Bind the release record to one artifact (RELEASE.RECORD.001)

The release record names:

- Source commit and immutable artifact reference.
- Included end-to-end flows, use cases, and workflows.
- Selected and locally applicable extensions.
- Build, test, contract, security, and end-to-end results.
- Schema application and compatibility result.
- Backup and restore exercise.
- Deployment, readiness, diagnostics, and smoke-test result.
- Rollback exercise and retained artifact.
- Operating Limits, alerts, runbooks, known limitations, and skipped checks.

The record captures results. It does not redefine specifications or copy acceptance criteria.

## Conventions

### Keep release records under one directory

```text
docs/
  operations/
    limits.md
  runbooks/
    restore-backup.md
    deployment-rollback.md
  releases/
    v1.0.0.md
```

### Treat warnings as failures

Build and lint warnings fail the corresponding check unless the repository records a narrow suppression with its reason.

## Example

An event-sales release includes `inventory.reserve-tickets`, `orders.create-guest-order`, the `order-fulfillment` workflow, and `tickets.issue-ticket`. Every behavior specification is verified. `E2E-EVENT-SALES-01` passes against the deployed API and real PostgreSQL. The release record points to the image digest, schema plan, test artifacts, restore result, rollback result, limits, and runbooks.

A payment-provider claim remains unconfirmed and blocks live money. The release may remain a provider sandbox only when the product brief, flow, configuration, entry points, and release record all exclude live payment.

## Verification

- Confirm the product brief references exactly one primary release flow.
- Confirm release scope lists every included use case and workflow.
- Confirm every included behavior specification is verified.
- Confirm the deployed end-to-end test passed against the immutable artifact.
- Confirm schema, backup, restore, deployment, rollback, diagnostics, and alerts match the deployed system.
- Confirm blocking claims are resolved or excluded from every affected boundary.
- Confirm generated contracts have no uncommitted difference.
- Confirm the completion report states the exact scope of every result.
