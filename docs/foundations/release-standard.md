# Release Standard

## Intent

Application v1 means one primary user journey works in a deployed environment and can be supported by its maintainer. Passing a unit test or completing an inner layer does not satisfy that outcome.

## Agent Summary {#agent-summary}

- Finish one observable primary journey before secondary capabilities.
- Run backend, frontend, documentation, and enabled-extension checks.
- Require current product and behavior documents to include freshness and implementation evidence.
- Keep OpenAPI and generated API types current.
- Include security, data safety, diagnostics, deployment, rollback, and operating instructions.
- Report every skipped check with a specific reason.

## Standards

### Finish one observable slice (RELEASE.SLICE.001)

A completed slice includes its domain behavior, persistence, API, optional UI, automated evidence, and operating impact. A placeholder outer layer means the use case remains planned.

### Run applicable checks (RELEASE.GATES.001)

Backend changes require a Release build and tests. Frontend changes require frozen dependency installation, lint, type checking, tests, and a production build. Critical browser journeys require Playwright. Product, domain, implementation, and API changes require the code and documentation consistency check. Enabled extensions add their stated verification.

### Commit derived application contracts (RELEASE.DERIVED.001)

Regenerate OpenAPI and frontend API types with their source changes. Generated files must be stable and free of timestamps, machine paths, and nondeterministic ordering.

### Meet the application v1 gate (RELEASE.V1.001)

Application v1 requires:

- One deployed primary user journey.
- Automated evidence for every active acceptance criterion.
- Current product and behavior documents with owner, freshness, canonical-source, and implementation-evidence metadata.
- Authentication and authorization when access is restricted.
- Repeatable database schema creation or upgrade.
- Backup and restore instructions with a tested restore.
- Liveness, readiness, and trace-correlated diagnostics.
- Secrets outside source control.
- CI for applicable checks.
- A tested deployment and rollback path.
- A deployed smoke test for the primary journey.

Scale, tenancy, realtime behavior, provider-specific deployment, and other conditional capabilities remain outside v1 until their extensions activate.

### Report verification precisely (RELEASE.REPORT.001)

Completion reports name the commands run, their outcomes, and every skipped check. Do not claim a repository-wide result from one project or one test category.

## Conventions

### Keep one release evidence record

The pull request description or linked release checklist records commands, deployed smoke-test results, schema action, rollback action, and known limitations.

### Treat warnings as failures

Build and lint warnings fail the corresponding check unless the repository records a narrow suppression with its reason.

## Examples

A use case with API and web changes runs the .NET build and tests, frontend lint and tests, frontend build, OpenAPI generation, generated type comparison, the code and documentation consistency check, and the relevant browser journey. A documentation-only correction runs metadata, link, rule-ID, writing, consistency, and diff checks.

## Verification

- Confirm the primary journey is deployed and smoke tested.
- Confirm active acceptance IDs have automated evidence.
- Confirm schema, backup, deployment, and rollback instructions match the deployed system.
- Confirm generated contracts have no uncommitted difference.
- Confirm the code and documentation consistency check passed for the primary journey.
- Confirm the completion report states the exact scope of every result.
