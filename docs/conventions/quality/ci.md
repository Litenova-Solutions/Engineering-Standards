# Continuous Integration

## Intent


Continuous integration proves that a pull request preserves the selected standards, generated contracts, dependencies, and release artifacts. The workflow keeps slow deployment checks separate from fast local feedback while retaining one required merge gate.

## Agent Summary {#agent-summary}


- Pull requests run the gates their changed areas select. (CI.GATES.001)
- A documentation job checks specification and code together. (CI.DOCS.001)
- CI regenerates committed contracts and fails on drift. (CI.CONTRACTS.001)
- Persistence changes publish a reviewed schema artifact. (CI.SCHEMA.001)
- CI scans dependencies and pins every action. (CI.SUPPLY.001)
- One immutable artifact is promoted through every environment. (CI.RELEASE.001)
- The default branch requires checks and review. (CI.PROTECTION.001)
- CI uses the declared stable job graph. (CI.JOBS.001)

## Standards


### Run applicable gates on every pull request (CI.GATES.001)

**Requirement:** Every pull request MUST run the gates its changed areas select from the table in this section.

**Rationale:** A gate skipped because its surface did not change is recorded with that reason in the completion report.

### Check code and documentation consistency (CI.DOCS.001)

**Requirement:** The documentation job MUST run on every pull request and check changed documentation against related code, tests, contracts, and operating records.

**Rationale:** A specification that drifts from its implementation is only detectable where both are visible in one check.

### Keep generated contracts fresh (CI.CONTRACTS.001)

**Requirement:** CI MUST regenerate committed OpenAPI and API types from source and fail on any difference.

**Rationale:** The check also rejects unstable timestamps, machine paths, and nondeterministic ordering, because those make every diff unreviewable.

### Review schema artifacts (CI.SCHEMA.001)

**Requirement:** A persistence change MUST publish a reviewed schema artifact that CI rejects when it is missing or contains an unplanned destructive operation.

**Rationale:** For Marten the artifact is the schema plan and document transformation. For EF Core it is the generated migration and reviewed SQL.

### Scan dependencies and release artifacts (CI.SUPPLY.001)

**Requirement:** CI MUST scan NuGet, npm, container images, and release artifacts for known vulnerabilities and pin every action to an immutable reference.

**Rationale:** Each release publishes an SBOM or equivalent inventory, so a later advisory can be matched against what shipped.

### Promote verified artifacts (CI.RELEASE.001)

**Requirement:** CI MUST build one immutable artifact and promote that same artifact through staging and production.

**Rationale:** Rebuilding from a mutable branch between environments means the tested artifact is not the deployed one.

### Protect the default branch (CI.PROTECTION.001)

**Requirement:** The default branch MUST require applicable CI checks, a reviewed pull request, and a clean merge state.

**Rationale:** A direct push or bypassed check is permitted only during a documented repository recovery action.

### Keep a canonical job graph (CI.JOBS.001)

**Requirement:** Consumer CI MUST use the stable job names and responsibilities declared in the table in this section.

**Rationale:** The release record references those job names, so a renamed job breaks the evidence trail.

## Conventions


### Apply the documented defaults (CI.CONVENTION.001)

**Default:** Keep one workflow per repository responsibility and use job names that match the release record.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Containerized integration tests and browser tests run in the jobs the release record will later cite.

## Reference example

This informative example demonstrates `CI.GATES.001` and `CI.RELEASE.001`.

A backend-only pull request runs the Release build, test, dependency scan, documentation scan, and schema checks. A pull request that changes a frontend also runs the frozen pnpm gates and affected browser end-to-end tests. A release promotes the same image digest that passed staging.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| CI.GATES.001 | inspection | The CI workflow runs each area gate on pull request and fails on any non-zero exit. |
| CI.DOCS.001 | inspection | The CI `docs` job runs `node standards/tools/validate-consumer.mjs` and fails on an unresolved reference. |
| CI.CONTRACTS.001 | inspection | The CI contract job regenerates the artifacts and fails through `git diff --exit-code`. |
| CI.SCHEMA.001 | static | The CI `schema` job publishes the artifact and fails when it is absent or contains an unplanned destructive operation. |
| CI.SUPPLY.001 | inspection | The CI supply-chain job fails on an unpinned action reference or an unexcepted advisory. |
| CI.RELEASE.001 | operation | The release record names one artifact reference across every promoted environment. |
| CI.PROTECTION.001 | inspection | Branch protection settings require the CI checks and a review before merge. |
| CI.JOBS.001 | inspection | The CI workflow declares each job name from the table and the release record cites the same names. |
| CI.CONVENTION.001 | inspection | Workflow review confirms each job name matches the release record it feeds. |
