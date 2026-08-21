# Release Standard

## Intent

A release joins deployed product behavior with evidence that a maintainer can operate it. One completed layer or passing test category does not meet this outcome.

## Agent Summary {#agent-summary}

- Finish complete observable use-case slices. (CORE.RELEASE.SLICE.001)
- Verify deployed end-to-end flows. (CORE.RELEASE.SLICE.003)
- Run checks selected by changed boundary. (CORE.RELEASE.GATES.001)
- Commit regenerated application contracts with source. (CORE.RELEASE.DERIVED.001)
- Meet every declared release readiness gate. (CORE.RELEASE.READINESS.001)
- Report exact verification scope and omissions. (CORE.RELEASE.REPORT.001)
- Bind release evidence to one immutable artifact. (CORE.RELEASE.RECORD.001)

## Standards

### Complete observable use-case slices (CORE.RELEASE.SLICE.001)

**Requirement:** A completed use-case slice MUST include Domain behavior, Application coordination, persistence, entry points, automated evidence, and operating impact.

**Rationale:** The complete path delivers one observable behavior rather than an unfinished inner layer.

### Mark incomplete behavior as planned (CORE.RELEASE.SLICE.002)

**Requirement:** Placeholder behavior MUST retain `implementationStatus: planned`.

**Rationale:** Planned status prevents incomplete code from claiming released behavior.

### Verify connected end-to-end flows (CORE.RELEASE.SLICE.003)

**Requirement:** A completed end-to-end flow MUST connect verified use cases and workflows to one observable outcome through a deployed public boundary.

**Rationale:** A passing `E2E-*` test proves the connected product path.

### Run boundary-selected checks (CORE.RELEASE.GATES.001)

**Requirement:** A release change MUST run every check selected by its changed backend, frontend, flow, product, domain, implementation, API, and extension boundaries.

**Rationale:** Each boundary adds evidence that a narrow test category cannot replace.

### Run backend release checks (CORE.RELEASE.GATES.002)

**Requirement:** A backend change MUST run Release build and test checks.

**Rationale:** Build and test evidence cover compilation and backend behavior after a source change.

### Run frontend release checks (CORE.RELEASE.GATES.003)

**Requirement:** A frontend change MUST run frozen installation, lint, type checking, tests, and production build checks.

**Rationale:** The frontend requires dependency, static, behavior, and production compilation evidence.

### Run flow checks (CORE.RELEASE.GATES.004)

**Requirement:** An end-to-end flow change MUST run its end-to-end tests.

**Rationale:** Flow changes need evidence through their deployed public boundary.

### Run consistency checks (CORE.RELEASE.GATES.005)

**Requirement:** A product, domain, implementation, or API change MUST run code-document consistency checks and the reference consumer validator.

**Rationale:** `node standards/tools/validate-consumer.mjs` checks metadata, links, and cross-file references.

### Run extension checks (CORE.RELEASE.GATES.006)

**Requirement:** A selected project or applicable local extension MUST run its stated verification when affected.

**Rationale:** Extension boundaries add tests and operating evidence beyond the baseline release checks.

### Regenerate application contracts (CORE.RELEASE.DERIVED.001)

**Requirement:** A source change MUST regenerate OpenAPI and frontend API types when it changes their source contract.

**Rationale:** Committed derived contracts remain aligned with the source that defines them.

### Keep generated contracts stable (CORE.RELEASE.DERIVED.002)

**Requirement:** A generated application contract MUST be stable and exclude timestamps, machine paths, and nondeterministic ordering.

**Rationale:** Deterministic output makes contract changes reviewable and repeatable.

### Meet release readiness gates (CORE.RELEASE.READINESS.001)

**Requirement:** A release MUST provide verified included specifications and passing deployed end-to-end evidence for its included flows.

**Rationale:** Release evidence proves the included product outcome through its deployed public boundary.

### Apply release access controls (CORE.RELEASE.READINESS.002)

**Requirement:** A release with restricted access MUST provide authentication and authorization.

**Rationale:** Restricted behavior requires a trusted identity and resource-access decision.

### Provide release data recovery (CORE.RELEASE.READINESS.003)

**Requirement:** A release MUST provide repeatable schema creation or upgrade, backup instructions, and a tested restore.

**Rationale:** A deployed product needs reproducible data setup and recovery evidence.

### Provide release operating visibility (CORE.RELEASE.READINESS.004)

**Requirement:** A release MUST provide liveness, readiness, trace-correlated diagnostics, and secrets outside source control.

**Rationale:** Operators need health and diagnostic evidence without exposing secret material.

### Provide release delivery controls (CORE.RELEASE.READINESS.005)

**Requirement:** A release MUST provide CI, tested deployment and rollback paths, current Operating Limits, and required runbooks.

**Rationale:** Repeatable delivery and operation need current execution and recovery records.

### Record the release artifact (CORE.RELEASE.READINESS.006)

**Requirement:** A release MUST create one release record for its immutable artifact.

**Rationale:** The release record connects evidence to the exact deployed artifact.

### Resolve release blockers (CORE.RELEASE.READINESS.007)

**Requirement:** A release MUST resolve every blocking decision condition and external claim or exclude its affected behavior from all owning records.

**Rationale:** A declared reduced boundary is valid only when product and release records agree.

### Select conditional capabilities after activation (CORE.RELEASE.READINESS.008)

**Requirement:** A release MAY include a conditional capability only after its selected extension applies.

**Rationale:** Extension activation criteria identify when a conditional capability becomes applicable.

### Report verification exactly (CORE.RELEASE.REPORT.001)

**Requirement:** A completion report MUST name exact commands, outcomes, evidence scope, and skipped checks.

**Rationale:** Reviewers can distinguish completed evidence from unrun or irrelevant checks.

### Avoid overbroad completion claims (CORE.RELEASE.REPORT.002)

**Requirement:** A completion report MUST NOT claim repository-wide results from one project or test category.

**Rationale:** Evidence scope limits what a passing command proves.

### Identify immutable release artifacts (CORE.RELEASE.RECORD.001)

**Requirement:** A release record MUST name source commit and immutable artifact reference.

**Rationale:** These identifiers bind recorded evidence to one reviewed release output.

### List included release behavior (CORE.RELEASE.RECORD.002)

**Requirement:** A release record MUST list included end-to-end flows, use cases, workflows, and selected applicable extensions.

**Rationale:** The record defines the behavior boundary for the immutable artifact.

### Record release evidence (CORE.RELEASE.RECORD.003)

**Requirement:** A release record MUST list build, test, contract, security, end-to-end, schema, backup, deployment, readiness, diagnostics, smoke-test, and rollback results.

**Rationale:** The complete evidence set makes the release supportable by its maintainer.

### Record operating readiness (CORE.RELEASE.RECORD.004)

**Requirement:** A release record MUST list Operating Limits, alerts, runbooks, known operating conditions, and skipped checks.

**Rationale:** Operating context identifies residual boundaries after release.

### Keep release records non-authoritative (CORE.RELEASE.RECORD.005)

**Requirement:** A release record MUST NOT redefine specifications or copy acceptance criteria.

**Rationale:** Specifications remain the canonical authority for behavior and criteria.

## Conventions

### Store release records together (CORE.RELEASE.CONVENTION.001)

**Default:** Keep release records under `docs/releases/`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:** `docs/releases/2026-08-21.md` records one immutable artifact and its evidence.

### Treat check warnings as failures (CORE.RELEASE.CONVENTION.002)

**Default:** Treat build and lint warnings as failures unless a repository records a narrow suppression with its reason.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Unreviewed warnings can conceal a changed compiler, linter, or dependency boundary.

## Reference example

This informative example demonstrates `CORE.RELEASE.SLICE.003`, `CORE.RELEASE.RECORD.001`, and `CORE.RELEASE.RECORD.003`.

An event-sales release includes verified inventory, order, payment, and ticket behaviors. `E2E-EVENT-SALES-01` passes against deployed API and PostgreSQL, and the record cites the image digest and release evidence.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| CORE.RELEASE.SLICE.001 | inspection | Use-case review links each complete slice boundary and operating impact. |
| CORE.RELEASE.SLICE.002 | static | Incomplete behavior retains `implementationStatus: planned`. |
| CORE.RELEASE.SLICE.003 | test | Deployed `E2E-*` test proves the selected connected flow. |
| CORE.RELEASE.GATES.001 | inspection | Completion report maps each changed boundary to executed checks. |
| CORE.RELEASE.GATES.002 | test | `ReleaseGatesTests` commands exit successfully. |
| CORE.RELEASE.GATES.003 | test | `ReleaseGatesTests` asserts frontend frozen install, lint, type, test, and build commands exit successfully. |
| CORE.RELEASE.GATES.004 | test | `ReleaseGatesTests` pass against their declared boundary. |
| CORE.RELEASE.GATES.005 | test | `ReleaseGatesTests` asserts reference consumer validator passes after product, domain, implementation, or API change. |
| CORE.RELEASE.GATES.006 | test | `ReleaseGatesTests` asserts affected selected extensions report their stated verification evidence. |
| CORE.RELEASE.DERIVED.001 | static | `ReleaseDerivedTests` asserts generated OpenAPI and client diff matches changed source contract. |
| CORE.RELEASE.DERIVED.002 | static | `ReleaseDerivedTests` asserts generated-contract diff contains no timestamp, machine path, or unstable order. |
| CORE.RELEASE.READINESS.001 | inspection | Release record identifies verified specifications and deployed end-to-end evidence. |
| CORE.RELEASE.READINESS.002 | test | `ReleaseReadinessTests` prove authentication and target authorization. |
| CORE.RELEASE.READINESS.003 | test | `ReleaseReadinessTests` asserts schema and backup restore exercises pass from declared starting state. |
| CORE.RELEASE.READINESS.004 | test | `ReleaseReadinessTests` expose health and trace diagnostics without source-controlled secrets. |
| CORE.RELEASE.READINESS.005 | operation | CI, deployment, rollback, limits, and runbook records are current. |
| CORE.RELEASE.READINESS.006 | operation | One release record identifies the immutable artifact. |
| CORE.RELEASE.READINESS.007 | inspection | Release review resolves blockers or excludes behavior in all owning records. |
| CORE.RELEASE.READINESS.008 | inspection | Included conditional behavior has selected extension evidence. |
| CORE.RELEASE.REPORT.001 | inspection | Completion report contains exact commands, outcomes, evidence scope, and skipped checks. |
| CORE.RELEASE.REPORT.002 | inspection | Completion claim scope matches the project and test evidence run. |
| CORE.RELEASE.RECORD.001 | operation | Release record identifies source commit and immutable artifact. |
| CORE.RELEASE.RECORD.002 | inspection | Release record lists selected behavior and extension scope. |
| CORE.RELEASE.RECORD.003 | operation | Release record stores each listed test and operational result. |
| CORE.RELEASE.RECORD.004 | operation | Release record includes current limits, alerts, runbooks, operating conditions, and omissions. |
| CORE.RELEASE.RECORD.005 | inspection | Release-record review links specifications and criteria rather than duplicating them. |
| CORE.RELEASE.CONVENTION.001 | inspection | Release record path uses `docs/releases/` or a local replacement. |
| CORE.RELEASE.CONVENTION.002 | inspection | Warning suppression record names its narrow reason. |
