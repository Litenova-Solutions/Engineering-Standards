# Continuous Integration

## Intent

Continuous integration proves that a pull request preserves the selected standards, generated contracts, dependencies, and release artifacts. The workflow keeps slow deployment checks separate from fast local feedback while retaining one required merge gate.

## Agent Summary {#agent-summary}

- Run the required backend and changed-frontend gates on every pull request.
- Run code and documentation consistency checks when product or implementation files change.
- Verify OpenAPI and typed consumer freshness when those artifacts are committed.
- Scan dependencies, actions, images, and release artifacts for known risk.
- Review Marten schema plans or EF Core migrations as CI artifacts.
- Promote the exact verified artifact and run a deployed smoke test.
- Protect the default branch with required checks and review rules.

## Standards

### Run applicable gates on every pull request (CI.GATES.001)

Every pull request MUST run the applicable gates from this table:

| Area | Required gate |
|:---|:---|
| Backend | `dotnet build apps/api/{ProjectName}.slnx --configuration Release` |
| Backend | `dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build` |
| Frontend | `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm type-check`, `pnpm test`, and `pnpm build` |
| Browser | Playwright for critical journeys |
| Documentation | Link, anchor, rule-ID, ASCII, metadata, code-document consistency, and `git diff --check` scans |
| Contracts | OpenAPI freshness and typed consumer regeneration when committed |

Skip a gate only when its surface does not exist. Record the reason in the workflow or completion report.

### Check code and documentation consistency (CI.DOCS.001)

The documentation job MUST run on every pull request and MUST check the changed documentation together with its related code, tests, generated contracts, and operating records. When the related surface exists, the check MUST:

- Validate the ownership and freshness metadata required by `WRITING.METADATA.001`.
- Compare capability and use-case names with source and test folders.
- Confirm current documented names, routes, errors, operation IDs, and authorization boundaries exist in source or generated contracts.
- Confirm active acceptance IDs appear in automated tests.
- Detect duplicate application or transport contracts for one operation.
- Report references to removed entry points, including controllers, namespaces, packages, and features.

The job MAY use repository scripts, architecture tests, generated-contract checks, or review tooling. It MUST report the exact checks and skipped surfaces. A passing Markdown link scan alone is not documentation consistency evidence.

### Keep generated contracts fresh (CI.CONTRACTS.001)

When OpenAPI or generated API types are committed, CI MUST regenerate them from the source and fail when `git diff --exit-code` reports a difference. The check MUST also reject unstable timestamps, machine paths, or ordering changes.

### Review schema artifacts (CI.SCHEMA.001)

A persistence change MUST publish its reviewed artifact in CI. For Marten, the artifact is the schema plan and any document-contract transformation. For EF Core, the artifact is the generated migration and reviewed SQL. CI MUST fail when the source change has no matching artifact or when a destructive operation lacks the required rollout plan.

### Scan dependencies and release artifacts (CI.SUPPLY.001)

CI MUST scan NuGet and npm dependencies, container images when used, and generated release artifacts for known vulnerabilities. GitHub Actions MUST use immutable commit references or a repository-approved pin. A release publishes an SBOM or equivalent dependency inventory with the artifact.

### Promote verified artifacts (CI.RELEASE.001)

CI MUST build one immutable artifact, promote that exact artifact through staging and production, wait for readiness, and run the primary-journey smoke test. Do not rebuild from a mutable branch between environments. Retain the artifact reference and test evidence for rollback.

### Protect the default branch (CI.PROTECTION.001)

The default branch MUST require the applicable CI checks, a reviewed pull request, and a clean merge state. Direct pushes and bypassed required checks are FORBIDDEN except for a documented repository recovery action.

### Keep a canonical job graph (CI.JOBS.001)

Consumer CI uses stable jobs with these responsibilities:

| Job | Triggered when | Required work |
|:---|:---|:---|
| `docs` | Every pull request | Validate selected JSON contracts, links, anchors, rule references, ASCII prose, document metadata, code-document consistency, and diff whitespace |
| `backend` | Backend, shared standards, or build configuration changes | Locked restore, Release build, tests without rebuild, coverage artifact, and dependency review |
| `frontend-{app}` | That frontend or shared TypeScript changes | Frozen install, lint, type check, unit tests, and production build |
| `contracts` | API source or generated consumer changes | Release OpenAPI generation, typed consumer generation, and clean-diff check |
| `browser` | A critical journey or its boundary changes | Playwright against the built application and real API dependencies |
| `schema` | Persistence contracts change | Reviewable Marten schema plan and transformations, or EF migration and SQL |
| `release` | Versioned release | Immutable artifacts, inventory, deployment evidence, readiness, smoke test, and rollback reference |

Use path filters only to skip a job whose complete input surface is known. Changes to shared configuration, lock files, standards selection, or generators trigger every dependent job.

## Conventions

Keep one workflow per repository responsibility when a single workflow would obscure ownership. Use stable job names that match the release evidence record. Run containerized integration tests and Playwright in CI rather than pre-commit hooks.

Backend CI restores the solution in locked mode, builds once in Release, then tests with `--no-build`. Frontend CI installs once with the frozen root lockfile and invokes root scripts scoped to the affected application. Contract CI starts from the same source commit as the build and rejects any generated difference. Release jobs consume artifacts produced by required jobs rather than rebuilding source.

## Examples

A backend-only pull request runs the Release build, test, dependency scan, documentation scan, and schema checks. A pull request that changes a frontend also runs the frozen pnpm gates and critical browser journeys. A release promotes the same image digest that passed staging.

## Verification

- Inspect workflow triggers, required job names, and branch protection settings.
- Change one shared input for each path-filtered job and confirm the expected job runs.
- Run the backend and changed-frontend gates from a clean checkout.
- Confirm the documentation job rejects missing metadata, stale current references, unmatched identifiers, duplicate contracts, and removed entry points.
- Regenerate OpenAPI and typed consumers, then check for a clean diff.
- Review dependency, action, image, SBOM, and schema artifacts.
- Verify staging-to-production artifact identity and smoke-test evidence.
