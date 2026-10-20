# Release Standard

## Intent

A release joins deployed product behavior with evidence that a maintainer can operate it. One completed layer or passing test category does not meet this outcome.

## Agent Summary {#agent-summary}

- Verify connected journeys. (litespec/core/release#verify-connected-journeys)
- Run checks selected by changed boundary. (litespec/core/release#run-boundary-selected-checks)
- Commit regenerated application contracts with source. (litespec/core/release#regenerate-application-contracts)
- Meet every declared release readiness gate. (litespec/core/release#meet-release-readiness-gates)
- Report exact verification scope and omissions. (litespec/core/release#report-verification-exactly)
- Bind release evidence to one immutable artifact. (litespec/core/release#identify-immutable-release-artifacts)
- Accepted debt lives as a Known gap. (litespec/core/release#record-accepted-debt-as-a-known-gap)
- A first release keeps a readiness record before its artifact. (litespec/core/release#keep-a-first-release-readiness-record)
- State each release as a complete record. (litespec/core/release#state-each-release-as-a-complete-record)

## Standards

### Keep unfinished behavior in draft

**Requirement:** A use case with unfinished behavior MUST keep its record in draft.

**Rationale:** Draft status prevents incomplete code from claiming released behavior.

### Verify connected journeys

**Requirement:** A completed journey MUST connect verified use cases to one observable outcome through a deployed public boundary.

**Rationale:** A passing journey test proves the connected product path.

### Run boundary-selected checks

**Requirement:** A release change MUST run every check selected by its changed backend, frontend, journey, product, domain, API, and extension boundaries.

**Rationale:** Each boundary adds evidence that a narrow test category cannot replace.

### Run backend release checks

**Requirement:** A backend change MUST pass the release build and the backend test suites.

**Rationale:** The release build compiles the solution in release mode. The backend suites are the architecture, integration, and acceptance suites the size profile requires.

### Run frontend release checks

**Requirement:** A frontend change MUST run frozen installation, lint, type checking, tests, and production build checks.

**Rationale:** The frontend requires dependency, static, behavior, and production compilation evidence.

### Run journey checks

**Requirement:** A journey change MUST run its journey tests.

**Rationale:** Journey changes need evidence through their deployed public boundary.

### Run consistency checks

**Requirement:** A product, domain, or API change MUST pass the reference consumer validator.

**Rationale:** `litespec consumer` checks metadata, links, and cross-file references.

### Run extension checks

**Requirement:** A selected project or applicable local extension MUST run its stated verification when affected.

**Rationale:** Extension boundaries add tests and operating evidence beyond the baseline release checks.

### Regenerate application contracts

**Requirement:** A source change MUST regenerate OpenAPI and frontend API types when it changes their source contract.

**Rationale:** Committed derived contracts remain aligned with the source that defines them.

### Keep generated contracts stable

**Requirement:** A generated application contract MUST be stable and exclude timestamps, machine paths, and nondeterministic ordering.

**Rationale:** Deterministic output makes contract changes reviewable and repeatable.

### Meet release readiness gates

**Requirement:** A release MUST include only verified use cases and passing deployed journey evidence for its included journeys.

**Rationale:** A use case is verified when every one of its Cases is proved by a passing test. Release evidence proves the included product outcome through its deployed public boundary.

### Apply release access controls

**Requirement:** A release with restricted access MUST provide authentication and authorization.

**Rationale:** Restricted behavior requires a trusted identity and resource-access decision.

### Provide release data recovery

**Requirement:** A release MUST provide repeatable schema creation or upgrade, backup instructions, and a tested restore.

**Rationale:** A deployed product needs reproducible data setup and recovery evidence.

### Provide release operating visibility

**Requirement:** A release MUST provide liveness, readiness, trace-correlated diagnostics, and secrets outside source control.

**Rationale:** Operators need health and diagnostic evidence without exposing secret material.

### Provide release delivery controls

**Requirement:** A release MUST provide CI, tested deployment and rollback paths, current operating limits, and the runbooks those limits name.

**Rationale:** Repeatable delivery and operation need current execution and recovery records.

### Record the release artifact

**Requirement:** A release MUST create one release record for its immutable artifact.

**Rationale:** The release record connects evidence to the exact deployed artifact.

### Resolve release blockers

**Requirement:** A release MUST settle every open decision and external claim it depends on, or exclude the affected behavior from every owning record.

**Rationale:** A declared reduced boundary is valid only when product and release records agree.

### Report verification exactly

**Requirement:** A completion report MUST name exact commands, outcomes, evidence scope, skipped checks, generated differences, scope limits, and covered use cases.

**Rationale:** Reviewers can distinguish completed evidence from unrun or irrelevant checks.

### Identify immutable release artifacts

**Requirement:** A release record MUST name source commit and immutable artifact reference.

**Rationale:** These identifiers bind recorded evidence to one reviewed release output.

### List included release behavior

**Requirement:** A release record MUST list included journeys, use cases, and selected applicable extensions.

**Rationale:** The record defines the behavior boundary for the immutable artifact.

### Record release evidence

**Requirement:** A release record MUST list build, test, contract, security, journey, schema, backup, deployment, readiness, diagnostics, smoke-test, and rollback results.

**Rationale:** The complete evidence set makes the release supportable by its maintainer.

### Record operating readiness

**Requirement:** A release record MUST list operating limits, alerts, runbooks, known operating conditions, and skipped checks.

**Rationale:** Operating context identifies residual boundaries after release.

### Keep release records non-authoritative

**Requirement:** A release record MUST NOT restate a specification or copy a Case.

**Rationale:** Specifications remain the canonical authority for behavior and Cases.

### Record accepted debt as a known gap

**Requirement:** Accepted debt MUST live as a Known gap with an owner and an end date.

**Rationale:** The gap names its check, which reports until the end date and fails after it. The [model page](model.md) states the Known gap shape.

### Keep a first-release readiness record

**Requirement:** A consumer before its first production release MUST keep a readiness record with dated rehearsals, green gates, and a rehearsal owner.

**Rationale:** A release record binds evidence to one artifact, so it has nothing to say before the first artifact exists. The readiness record states instead what proves the product may take data. The rehearsal owner owns the backup and restore rehearsal.

### State each release as a complete record

**Requirement:** A release record MUST state its complete behavior and evidence without depending on an earlier release record.

**Rationale:** A reader judges one release from one record. No upgrade guide or earlier record fills a gap in it.

## Conventions

### Store release records together

**Default:** Keep release records under `docs/releases/`.

**Replacement:** A consumer records a different location as an Exception citing this convention.

**Example:** `docs/releases/2026-08-21.md` records one immutable artifact and its evidence.

### Treat check warnings as failures

**Default:** Treat build and lint warnings as failures unless the build configuration records a narrow suppression with its reason.

**Replacement:** A consumer records a different policy as an Exception citing this convention.

**Rationale:** Unreviewed warnings can conceal a changed compiler, linter, or dependency boundary.

## Reference example

This informative example demonstrates `litespec/core/release#verify-connected-journeys`, `litespec/core/release#identify-immutable-release-artifacts`, and `litespec/core/release#record-release-evidence`.

An order-checkout release includes verified stock, order, payment, and shipment use cases. The checkout journey passes against the deployed API and database, and the record cites the image digest and release evidence.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/release#keep-unfinished-behavior-in-draft | guidance | Is every use case with unfinished behavior still in draft? |
| litespec/core/release#verify-connected-journeys | guidance | Does each completed journey reach one observable outcome through a deployed public boundary? |
| litespec/core/release#run-boundary-selected-checks | guidance | Did the change run every check its changed boundaries select? |
| litespec/core/release#run-backend-release-checks | guidance | Did the release build and every required backend suite pass? |
| litespec/core/release#run-frontend-release-checks | guidance | Did install, lint, type checks, tests, and the production build all pass? |
| litespec/core/release#run-journey-checks | guidance | Did the journey tests pass against the deployed boundary? |
| litespec/core/release#run-consistency-checks | checkable | `litespec consumer` exits zero. |
| litespec/core/release#run-extension-checks | guidance | Did each affected extension report its stated verification evidence? |
| litespec/core/release#regenerate-application-contracts | guidance | Do committed contracts match a fresh generation from their source? |
| litespec/core/release#keep-generated-contracts-stable | guidance | Is the contract diff free of timestamps, machine paths, and unstable order? |
| litespec/core/release#meet-release-readiness-gates | guidance | Is every included use case verified, with passing journey evidence for each journey? |
| litespec/core/release#apply-release-access-controls | guidance | Do authentication and authorization guard every restricted release path? |
| litespec/core/release#provide-release-data-recovery | guidance | Do schema setup, backup instructions, and a tested restore all exist? |
| litespec/core/release#provide-release-operating-visibility | guidance | Do health signals and trace diagnostics ship without secrets in source control? |
| litespec/core/release#provide-release-delivery-controls | guidance | Are CI, deployment, rollback, limits, and runbooks all current? |
| litespec/core/release#record-the-release-artifact | guidance | Does one release record name the immutable artifact? |
| litespec/core/release#resolve-release-blockers | guidance | Is every open decision and external claim settled or excluded in every owning record? |
| litespec/core/release#report-verification-exactly | guidance | Would a reviewer learn the commands, outcomes, scope, omissions, and limits from the report? |
| litespec/core/release#identify-immutable-release-artifacts | guidance | Does the release record name the source commit and artifact reference? |
| litespec/core/release#list-included-release-behavior | guidance | Does the record list every included journey, use case, and extension? |
| litespec/core/release#record-release-evidence | guidance | Does the record hold a result for every listed evidence kind? |
| litespec/core/release#record-operating-readiness | guidance | Does the record state limits, alerts, runbooks, conditions, and omissions? |
| litespec/core/release#keep-release-records-non-authoritative | guidance | Does the record link outward instead of restating behavior? |
| litespec/core/release#record-accepted-debt-as-a-known-gap | guidance | Does every accepted debt live as a Known gap with owner and end date? |
| litespec/core/release#keep-a-first-release-readiness-record | guidance | Does one record hold dated rehearsals, green gates, and a rehearsal owner? |
| litespec/core/release#state-each-release-as-a-complete-record | guidance | Would a reader judge the release from this record alone? |
| litespec/core/release#store-release-records-together | guidance | Does the record path follow the default or a recorded Exception? |
| litespec/core/release#treat-check-warnings-as-failures | guidance | Does the build fail on warnings except for recorded narrow suppressions? |
