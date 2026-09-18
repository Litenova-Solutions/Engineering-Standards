# Release Standard

## Intent

A release joins deployed product behavior with evidence that a maintainer can operate it. One completed layer or passing test category does not meet this outcome.

## Agent Summary {#agent-summary}

- Finish complete observable use-case slices. (standards/rule/core-release.complete-observable-use-case-slices)
- Verify deployed end-to-end flows. (standards/rule/core-release.verify-connected-end-to-end-flows)
- Run checks selected by changed boundary. (standards/rule/core-release.run-boundary-selected-checks)
- Commit regenerated application contracts with source. (standards/rule/core-release.regenerate-application-contracts)
- Meet every declared release readiness gate. (standards/rule/core-release.meet-release-readiness-gates)
- Report exact verification scope and omissions. (standards/rule/core-release.report-verification-exactly)
- Bind release evidence to one immutable artifact. (standards/rule/core-release.identify-immutable-release-artifacts)

## Standards

### Complete observable use-case slices (standards/rule/core-release.complete-observable-use-case-slices)

**Requirement:** A completed use-case slice MUST include Domain behavior, Application coordination, persistence, entry points, automated evidence, and operating impact.

**Rationale:** The complete path delivers one observable behavior rather than an unfinished inner layer.

### Mark incomplete behavior as planned (standards/rule/core-release.mark-incomplete-behavior-as-planned)

**Requirement:** Placeholder behavior MUST retain `implementationStatus: planned`.

**Rationale:** Planned status prevents incomplete code from claiming released behavior.

### Verify connected end-to-end flows (standards/rule/core-release.verify-connected-end-to-end-flows)

**Requirement:** A completed end-to-end flow MUST connect verified use cases and workflows to one observable outcome through a deployed public boundary.

**Rationale:** A passing `E2E-*` test proves the connected product path.

### Run boundary-selected checks (standards/rule/core-release.run-boundary-selected-checks)

**Requirement:** A release change MUST run every check selected by its changed backend, frontend, flow, product, domain, implementation, API, and extension boundaries.

**Rationale:** Each boundary adds evidence that a narrow test category cannot replace.

### Run backend release checks (standards/rule/core-release.run-backend-release-checks)

**Requirement:** A backend change MUST run Release build and test checks.

**Rationale:** Build and test evidence cover compilation and backend behavior after a source change.

### Run frontend release checks (standards/rule/core-release.run-frontend-release-checks)

**Requirement:** A frontend change MUST run frozen installation, lint, type checking, tests, and production build checks.

**Rationale:** The frontend requires dependency, static, behavior, and production compilation evidence.

### Run flow checks (standards/rule/core-release.run-flow-checks)

**Requirement:** An end-to-end flow change MUST run its end-to-end tests.

**Rationale:** Flow changes need evidence through their deployed public boundary.

### Run consistency checks (standards/rule/core-release.run-consistency-checks)

**Requirement:** A product, domain, implementation, or API change MUST run code-document consistency checks and the reference consumer validator.

**Rationale:** `node standards/tools/validate-consumer.mjs` checks metadata, links, and cross-file references.

### Run extension checks (standards/rule/core-release.run-extension-checks)

**Requirement:** A selected project or applicable local extension MUST run its stated verification when affected.

**Rationale:** Extension boundaries add tests and operating evidence beyond the baseline release checks.

### Regenerate application contracts (standards/rule/core-release.regenerate-application-contracts)

**Requirement:** A source change MUST regenerate OpenAPI and frontend API types when it changes their source contract.

**Rationale:** Committed derived contracts remain aligned with the source that defines them.

### Keep generated contracts stable (standards/rule/core-release.keep-generated-contracts-stable)

**Requirement:** A generated application contract MUST be stable and exclude timestamps, machine paths, and nondeterministic ordering.

**Rationale:** Deterministic output makes contract changes reviewable and repeatable.

### Meet release readiness gates (standards/rule/core-release.meet-release-readiness-gates)

**Requirement:** A release MUST provide verified included specifications and passing deployed end-to-end evidence for its included flows.

**Rationale:** Release evidence proves the included product outcome through its deployed public boundary.

### Apply release access controls (standards/rule/core-release.apply-release-access-controls)

**Requirement:** A release with restricted access MUST provide authentication and authorization.

**Rationale:** Restricted behavior requires a trusted identity and resource-access decision.

### Provide release data recovery (standards/rule/core-release.provide-release-data-recovery)

**Requirement:** A release MUST provide repeatable schema creation or upgrade, backup instructions, and a tested restore.

**Rationale:** A deployed product needs reproducible data setup and recovery evidence.

### Provide release operating visibility (standards/rule/core-release.provide-release-operating-visibility)

**Requirement:** A release MUST provide liveness, readiness, trace-correlated diagnostics, and secrets outside source control.

**Rationale:** Operators need health and diagnostic evidence without exposing secret material.

### Provide release delivery controls (standards/rule/core-release.provide-release-delivery-controls)

**Requirement:** A release MUST provide CI, tested deployment and rollback paths, current Operating Limits, and required runbooks.

**Rationale:** Repeatable delivery and operation need current execution and recovery records.

### Record the release artifact (standards/rule/core-release.record-the-release-artifact)

**Requirement:** A release MUST create one release record for its immutable artifact.

**Rationale:** The release record connects evidence to the exact deployed artifact.

### Resolve release blockers (standards/rule/core-release.resolve-release-blockers)

**Requirement:** A release MUST resolve every blocking decision condition and external claim or exclude its affected behavior from all owning records.

**Rationale:** A declared reduced boundary is valid only when product and release records agree.

### Select conditional capabilities after activation (standards/rule/core-release.select-conditional-capabilities-after-activation)

**Requirement:** A release MAY include a conditional capability only after its selected extension applies.

**Rationale:** Extension activation criteria identify when a conditional capability becomes applicable.

### Report verification exactly (standards/rule/core-release.report-verification-exactly)

**Requirement:** A completion report MUST name exact commands, outcomes, evidence scope, and skipped checks.

**Rationale:** Reviewers can distinguish completed evidence from unrun or irrelevant checks.

### Avoid overbroad completion claims (standards/rule/core-release.avoid-overbroad-completion-claims)

**Requirement:** A completion report MUST NOT claim repository-wide results from one project or test category.

**Rationale:** Evidence scope limits what a passing command proves.

### Identify immutable release artifacts (standards/rule/core-release.identify-immutable-release-artifacts)

**Requirement:** A release record MUST name source commit and immutable artifact reference.

**Rationale:** These identifiers bind recorded evidence to one reviewed release output.

### List included release behavior (standards/rule/core-release.list-included-release-behavior)

**Requirement:** A release record MUST list included end-to-end flows, use cases, workflows, and selected applicable extensions.

**Rationale:** The record defines the behavior boundary for the immutable artifact.

### Record release evidence (standards/rule/core-release.record-release-evidence)

**Requirement:** A release record MUST list build, test, contract, security, end-to-end, schema, backup, deployment, readiness, diagnostics, smoke-test, and rollback results.

**Rationale:** The complete evidence set makes the release supportable by its maintainer.

### Record operating readiness (standards/rule/core-release.record-operating-readiness)

**Requirement:** A release record MUST list Operating Limits, alerts, runbooks, known operating conditions, and skipped checks.

**Rationale:** Operating context identifies residual boundaries after release.

### Keep release records non-authoritative (standards/rule/core-release.keep-release-records-non-authoritative)

**Requirement:** A release record MUST NOT redefine specifications or copy acceptance criteria.

**Rationale:** Specifications remain the canonical authority for behavior and criteria.

## Conventions

### Store release records together (standards/rule/core-release.store-release-records-together)

**Default:** Keep release records under `docs/releases/`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:** `docs/releases/2026-08-21.md` records one immutable artifact and its evidence.

### Treat check warnings as failures (standards/rule/core-release.treat-check-warnings-as-failures)

**Default:** Treat build and lint warnings as failures unless a repository records a narrow suppression with its reason.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Unreviewed warnings can conceal a changed compiler, linter, or dependency boundary.

## Reference example

This informative example demonstrates `standards/rule/core-release.verify-connected-end-to-end-flows`, `standards/rule/core-release.identify-immutable-release-artifacts`, and `standards/rule/core-release.record-release-evidence`.

An event-sales release includes verified inventory, order, payment, and ticket behaviors. `E2E-EVENT-SALES-01` passes against deployed API and PostgreSQL, and the record cites the image digest and release evidence.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/core-release.complete-observable-use-case-slices | inspection | Use-case review links each complete slice boundary and operating impact. |
| standards/rule/core-release.mark-incomplete-behavior-as-planned | static | Incomplete behavior retains `implementationStatus: planned`. |
| standards/rule/core-release.verify-connected-end-to-end-flows | test | Deployed `E2E-*` test proves the selected connected flow. |
| standards/rule/core-release.run-boundary-selected-checks | inspection | Completion report maps each changed boundary to executed checks. |
| standards/rule/core-release.run-backend-release-checks | test | `ReleaseGatesTests` commands exit successfully. |
| standards/rule/core-release.run-frontend-release-checks | test | `ReleaseGatesTests` asserts frontend frozen install, lint, type, test, and build commands exit successfully. |
| standards/rule/core-release.run-flow-checks | test | `ReleaseGatesTests` pass against their declared boundary. |
| standards/rule/core-release.run-consistency-checks | test | `ReleaseGatesTests` asserts reference consumer validator passes after product, domain, implementation, or API change. |
| standards/rule/core-release.run-extension-checks | test | `ReleaseGatesTests` asserts affected selected extensions report their stated verification evidence. |
| standards/rule/core-release.regenerate-application-contracts | static | `ReleaseDerivedTests` asserts generated OpenAPI and client diff matches changed source contract. |
| standards/rule/core-release.keep-generated-contracts-stable | static | `ReleaseDerivedTests` asserts generated-contract diff contains no timestamp, machine path, or unstable order. |
| standards/rule/core-release.meet-release-readiness-gates | inspection | Release record identifies verified specifications and deployed end-to-end evidence. |
| standards/rule/core-release.apply-release-access-controls | test | `ReleaseReadinessTests` prove authentication and target authorization. |
| standards/rule/core-release.provide-release-data-recovery | test | `ReleaseReadinessTests` asserts schema and backup restore exercises pass from declared starting state. |
| standards/rule/core-release.provide-release-operating-visibility | test | `ReleaseReadinessTests` expose health and trace diagnostics without source-controlled secrets. |
| standards/rule/core-release.provide-release-delivery-controls | operation | CI, deployment, rollback, limits, and runbook records are current. |
| standards/rule/core-release.record-the-release-artifact | operation | One release record identifies the immutable artifact. |
| standards/rule/core-release.resolve-release-blockers | inspection | Release review resolves blockers or excludes behavior in all owning records. |
| standards/rule/core-release.select-conditional-capabilities-after-activation | inspection | Included conditional behavior has selected extension evidence. |
| standards/rule/core-release.report-verification-exactly | inspection | Completion report contains exact commands, outcomes, evidence scope, and skipped checks. |
| standards/rule/core-release.avoid-overbroad-completion-claims | inspection | Completion claim scope matches the project and test evidence run. |
| standards/rule/core-release.identify-immutable-release-artifacts | operation | Release record identifies source commit and immutable artifact. |
| standards/rule/core-release.list-included-release-behavior | inspection | Release record lists selected behavior and extension scope. |
| standards/rule/core-release.record-release-evidence | operation | Release record stores each listed test and operational result. |
| standards/rule/core-release.record-operating-readiness | operation | Release record includes current limits, alerts, runbooks, operating conditions, and omissions. |
| standards/rule/core-release.keep-release-records-non-authoritative | inspection | Release-record review links specifications and criteria rather than duplicating them. |
| standards/rule/core-release.store-release-records-together | inspection | Release record path uses `docs/releases/` or a local replacement. |
| standards/rule/core-release.treat-check-warnings-as-failures | inspection | Warning suppression record names its narrow reason. |
