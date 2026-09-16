# Continuous Integration

## Intent


Continuous integration proves that a pull request preserves the selected standards, generated contracts, dependencies, and release artifacts. The workflow keeps slow deployment checks separate from fast local feedback while retaining one required merge gate.

## Agent Summary {#agent-summary}


- Pull requests run the gates their changed areas select. (QUALITY.CI.GATES.001)
- A documentation job checks specification and code together. (QUALITY.CI.DOCS.001)
- CI regenerates committed contracts and fails on drift. (QUALITY.CI.CONTRACTS.001)
- Persistence changes publish a reviewed schema artifact. (QUALITY.CI.SCHEMA.001)
- CI scans dependencies and pins every action. (QUALITY.CI.SUPPLY.001)
- One immutable artifact is promoted through every environment. (QUALITY.CI.RELEASE.001)
- The default branch requires checks and review. (QUALITY.CI.PROTECTION.001)
- CI uses the declared stable job graph. (QUALITY.CI.JOBS.001)

## Standards


### Run applicable gates on every pull request (QUALITY.CI.GATES.001)

**Requirement:** Every pull request MUST run the gates its changed areas select from the table in this section.

**Rationale:** A gate skipped because its surface did not change is recorded with that reason in the completion report. The dependency audit that `QUALITY.SECURITY.SUPPLY.001` requires is one of these gates, selected by a change to a manifest or a lockfile.

### Check code and documentation consistency (QUALITY.CI.DOCS.001)

**Requirement:** The documentation job MUST run on every pull request and check changed documentation against related code, tests, contracts, and operating records.

**Rationale:** A specification that drifts from its implementation is only detectable where both are visible in one check.

### Keep generated contracts fresh (QUALITY.CI.CONTRACTS.001)

**Requirement:** CI MUST regenerate committed OpenAPI and API types from source and fail on any difference.

**Rationale:** The check also rejects unstable timestamps, machine paths, and nondeterministic ordering, because those make every diff unreviewable.

### Review schema artifacts (QUALITY.CI.SCHEMA.001)

**Requirement:** A persistence change MUST publish a reviewed schema artifact that CI rejects when it is missing or contains an unplanned destructive operation.

**Rationale:** For Marten the artifact is the schema plan and document transformation. For EF Core it is the generated migration and reviewed SQL.

### Scan dependencies and release artifacts (QUALITY.CI.SUPPLY.001)

**Requirement:** CI MUST scan NuGet, npm, container images, and release artifacts for known vulnerabilities and pin every action to an immutable reference.

**Rationale:** Each release publishes an SBOM or equivalent inventory, so a later advisory can be matched against what shipped.

### Promote verified artifacts (QUALITY.CI.RELEASE.001)

**Requirement:** CI MUST build one immutable artifact and promote that same artifact through staging and production.

**Rationale:** Rebuilding from a mutable branch between environments means the tested artifact is not the deployed one.

### Publish a component inventory with each artifact (QUALITY.CI.RELEASE.002)

**Requirement:** CI MUST publish a software bill of materials beside each promoted artifact, listing its resolved direct and transitive components with versions.

**Rationale:** An advisory names a component and a version range. Without an inventory, answering whether a running release contains it means rebuilding the dependency graph of a commit somebody has to find first. [NIST SP 800-218](https://csrc.nist.gov/publications/detail/sp/800-218/final) states the practice, and the lockfile this repository already requires is what the inventory is generated from.

**Example:** The build job that produces the artifact generates the inventory from the same frozen lockfile. It stores the inventory beside the artifact, under the release version.

### Protect the default branch (QUALITY.CI.PROTECTION.001)

**Requirement:** The default branch MUST require applicable CI checks, a reviewed pull request, and a clean merge state.

**Rationale:** A direct push or bypassed check is permitted only during a documented repository recovery action.

### Record every branch protection bypass (QUALITY.CI.PROTECTION.002)

**Requirement:** A direct push or bypassed check on the default branch MUST produce a record naming the actor, the reason, and the change it admitted.

**Rationale:** The permission exists for recovery, and a recovery nobody wrote down is indistinguishable from a habit. The record is what makes the next reviewer able to tell which commits on the branch were reviewed. [NIST SP 800-218](https://csrc.nist.gov/publications/detail/sp/800-218/final) treats the same bypass as an event that has to be attributable.

**Example:** The record is the recovery decision itself where one exists. A bypass smaller than a decision takes a dated entry in the repository's operations log.

### Keep a canonical job graph (QUALITY.CI.JOBS.001)

**Requirement:** Consumer CI MUST use the stable job names and responsibilities declared in the table in this section.

**Rationale:** The release record references those job names, so a renamed job breaks the evidence trail.

## Conventions


### Apply the documented defaults (QUALITY.CI.CONVENTION.001)

**Default:** Keep one workflow per repository responsibility and use job names that match the release record.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Containerized integration tests and browser tests run in the jobs the release record will later cite.

## Reference example

This informative example demonstrates `QUALITY.CI.GATES.001` and `QUALITY.CI.RELEASE.001`.

A backend-only pull request runs the Release build, test, dependency scan, documentation scan, and schema checks. A pull request that changes a frontend also runs the frozen pnpm gates and affected browser end-to-end tests. A release promotes the same image digest that passed staging.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| QUALITY.CI.GATES.001 | inspection | The CI workflow runs each area gate on pull request and fails on any non-zero exit. |
| QUALITY.CI.DOCS.001 | inspection | The CI `docs` job runs `node standards/tools/validate-consumer.mjs` and fails on an unresolved reference. |
| QUALITY.CI.CONTRACTS.001 | inspection | The CI contract job regenerates the artifacts and fails through `git diff --exit-code`. |
| QUALITY.CI.SCHEMA.001 | static | The CI `schema` job publishes the artifact and fails when it is absent or contains an unplanned destructive operation. |
| QUALITY.CI.SUPPLY.001 | inspection | The CI supply-chain job fails on an unpinned action reference or an unexcepted advisory. |
| QUALITY.CI.RELEASE.001 | operation | The release record names one artifact reference across every promoted environment. |
| QUALITY.CI.RELEASE.002 | static | The `release` job fails when the published `sbom` artifact is absent or lists no component. |
| QUALITY.CI.PROTECTION.001 | inspection | Branch protection settings require the CI checks and a review before merge. |
| QUALITY.CI.PROTECTION.002 | inspection | Each default-branch commit with no passing required check resolves to a recovery record naming its actor and reason. |
| QUALITY.CI.JOBS.001 | inspection | The CI workflow declares each job name from the table and the release record cites the same names. |
| QUALITY.CI.CONVENTION.001 | inspection | Workflow review confirms each job name matches the release record it feeds. |
