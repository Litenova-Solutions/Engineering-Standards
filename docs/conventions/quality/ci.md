# Continuous Integration

## Intent


Continuous integration proves that a pull request preserves the selected standards, generated contracts, dependencies, and release artifacts. The workflow keeps slow deployment checks separate from fast local feedback while retaining one required merge gate.

## Agent Summary {#agent-summary}


- Run applicable gates on every pull request. (CI.GATES.001)
- Check code and documentation consistency. (CI.DOCS.001)
- Keep generated contracts fresh. (CI.CONTRACTS.001)
- Review schema artifacts. (CI.SCHEMA.001)
- Scan dependencies and release artifacts. (CI.SUPPLY.001)
- Promote verified artifacts. (CI.RELEASE.001)
- Protect the default branch. (CI.PROTECTION.001)
- Keep a canonical job graph. (CI.JOBS.001)

## Standards


### Run applicable gates on every pull request (CI.GATES.001)

**Requirement:** Consumer CI MUST run applicable gates on every pull request.

**Rationale:** Every pull request runs the applicable gates from this table:

| Area | Required gate |
|:---|:---|
| Backend | `dotnet build apps/api/{ProjectName}.slnx --configuration Release` |
| Backend | `dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build` |
| Frontend | `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm type-check`, `pnpm test`, and `pnpm build` |
| Browser | Playwright end-to-end tests for browser end-to-end flows |
| Documentation | Link, anchor, rule-ID, ASCII, Specification Metadata, code-document consistency, and `git diff --check` scans |
| Contracts | OpenAPI freshness and typed consumer regeneration when committed |

Skip a gate only when its surface does not exist. The implementation records the reason in the workflow or completion report.

### Check code and documentation consistency (CI.DOCS.001)

**Requirement:** Consumer CI MUST check code and documentation consistency.

**Rationale:** The documentation job runs on every pull request. It checks changed documentation with related code, tests, generated contracts, and operating records. When related surfaces exist, it performs these checks:

- The implementation validates the structured metadata required by `WRITING.METADATA.002` and `WRITING.METADATA.003`.
- Compare module and use-case names with source and test folders.
- Confirm current documented names, routes, errors, operation IDs, and authorization boundaries exist in source or generated contracts.
- Confirm acceptance IDs from verified Use cases appear in automated tests.
- Detect duplicate application or transport contracts for one operation.
- Report references to removed entry points, including controllers, namespaces, packages, and features.

The job can use repository scripts, architecture tests, generated-contract checks, or review tooling. It reports exact checks and skipped surfaces. A passing Markdown link scan alone is not documentation consistency evidence.

### Keep generated contracts fresh (CI.CONTRACTS.001)

**Requirement:** Consumer CI MUST keep generated contracts fresh.

**Rationale:** When OpenAPI or generated API types are committed, CI regenerates them from source. A `git diff --exit-code` difference fails the check. The check also rejects unstable timestamps, machine paths, and ordering.

### Review schema artifacts (CI.SCHEMA.001)

**Requirement:** Consumer CI MUST review schema artifacts.

**Rationale:** A persistence change publishes its reviewed artifact in CI. For Marten, the artifact is the schema plan and document-contract transformation. For EF Core, it is the generated migration and reviewed SQL. CI fails for a missing artifact or an unplanned destructive operation.

### Scan dependencies and release artifacts (CI.SUPPLY.001)

**Requirement:** Consumer CI MUST scan dependencies and release artifacts.

**Rationale:** CI scans NuGet and npm dependencies, used container images, and release artifacts for known vulnerabilities. GitHub Actions use immutable commit references or a repository-approved pin. Each release publishes an SBOM or equivalent dependency inventory with its artifact.

### Promote verified artifacts (CI.RELEASE.001)

**Requirement:** Consumer CI MUST promote verified artifacts.

**Rationale:** CI builds one immutable artifact and promotes it through staging and production. It waits for readiness and runs included end-to-end tests. The pipeline does not rebuild from a mutable branch between environments. The release record retains the artifact reference and rollback evidence.

### Protect the default branch (CI.PROTECTION.001)

**Requirement:** Consumer CI MUST protect the default branch.

**Rationale:** The default branch requires applicable CI checks, a reviewed pull request, and a clean merge state. Direct pushes and bypassed checks are prohibited except during a documented repository recovery action.

### Keep a canonical job graph (CI.JOBS.001)

**Requirement:** Consumer CI MUST keep a canonical job graph.

**Rationale:** Consumer CI uses stable jobs with these responsibilities:

| Job | Triggered when | Required work |
|:---|:---|:---|
| `docs` | Every pull request | Validate selected JSON contracts, links, anchors, rule references, ASCII prose, Specification Metadata, code-document consistency, and diff whitespace |
| `backend` | Backend, shared standards, or build configuration changes | Locked restore, Release build, tests without rebuild, coverage artifact, and dependency review |
| `frontend-{app}` | That frontend or shared TypeScript changes | Frozen install, lint, type check, unit tests, and production build |
| `contracts` | API source or generated consumer changes | Release OpenAPI generation, typed consumer generation, and clean-diff check |
| `browser` | A browser end-to-end flow or its boundary changes | Playwright end-to-end tests against the built application and real API dependencies |
| `schema` | Persistence contracts change | Reviewable Marten schema plan and transformations, or EF migration and SQL |
| `release` | Versioned release | Immutable artifacts, inventory, deployment evidence, readiness, smoke test, and rollback reference |

The implementation uses path filters only to skip a job whose complete input surface is known. Changes to shared configuration, lock files, standards selection, or generators trigger every dependent job.

## Conventions


### Apply the documented defaults (CI.CONVENTION.001)

**Default:** Apply the documented defaults.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation keeps one workflow per repository responsibility when a single workflow would obscure ownership. The implementation uses stable job names that match the release record. The implementation runs containerized integration tests and Playwright in CI rather than pre-commit hooks.

Backend CI restores the solution in locked mode, builds once in Release, then tests with `--no-build`. Frontend CI installs once with the frozen root lockfile and invokes root scripts scoped to the affected application. Contract CI starts from the same source commit as the build and rejects any generated difference. Release jobs consume artifacts produced by required jobs rather than rebuilding source.

## Reference example

This informative example demonstrates `CI.GATES.001` and `CI.RELEASE.001`.

A backend-only pull request runs the Release build, test, dependency scan, documentation scan, and schema checks. A pull request that changes a frontend also runs the frozen pnpm gates and affected browser end-to-end tests. A release promotes the same image digest that passed staging.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| CI.GATES.001 | inspection | Pull request review asserts `run applicable gates on every pull request` in the owning specification and source paths. |
| CI.DOCS.001 | inspection | Pull request review asserts `check code and documentation consistency` in the owning specification and source paths. |
| CI.CONTRACTS.001 | inspection | Pull request review asserts `keep generated contracts fresh` in the owning specification and source paths. |
| CI.SCHEMA.001 | static | Repository static check asserts `review schema artifacts` for the owning paths. |
| CI.SUPPLY.001 | inspection | Pull request review asserts `scan dependencies and release artifacts` in the owning specification and source paths. |
| CI.RELEASE.001 | inspection | Pull request review asserts `promote verified artifacts` in the owning specification and source paths. |
| CI.PROTECTION.001 | inspection | Pull request review asserts `protect the default branch` in the owning specification and source paths. |
| CI.JOBS.001 | inspection | Pull request review asserts `keep a canonical job graph` in the owning specification and source paths. |
| CI.CONVENTION.001 | inspection | Pull request review asserts `apply the documented defaults` in the owning specification and source paths. |
