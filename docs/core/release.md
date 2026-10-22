# Product Release

## Intent

A product release is the verified behavior a team ships together with the evidence that a maintainer can operate it. This page states what a release contains, which checks each changed boundary runs, and what the written release record lists for its artifact, the built output it ships. A release that follows it ships only proven behavior with recovery, visibility, and delivery evidence attached.

## Concepts

### Verified behavior and journey evidence

Implemented and verified are different claims. A use case is implemented when its handler exists in code, and verified when every one of its cases passes its proof. The [model page](model.md) states how the builder computes both from code, screens, and test runs. A release includes only verified use cases: one completed layer or one passing test category does not meet that bar.

A journey test proves that connected use cases produce one observable product outcome through the deployed public boundary. It runs against the deployed API and database rather than isolated units, so it catches the wiring, permission, and data defects that narrower suites miss.

### The release record

Each release creates one release record for its immutable artifact. The record names the source commit and the immutable artifact reference, lists the included journeys, use cases, and extensions, and attaches the evidence and operating readiness the provisions below require. It stays non-authoritative: specifications own behavior and cases, so the record links outward instead of restating them. Release records live under `docs/releases/` unless the project records another location.

### Boundaries select checks

Each changed boundary adds the checks that cover its risk. A change that touches several boundaries runs every check each one selects.

| Changed boundary | Checks the change runs |
|:---|:---|
| Backend | The release build and the backend test suites |
| Frontend | Frozen installation, lint, type checking, tests, and the production build |
| Journey | Its journey tests through the deployed boundary |
| Product, domain, or API | The reference consumer validator |
| Extension | The verification its extension states |

### Debt, gaps, and the first release

Accepted debt never sits as an untracked compromise: it lives as a known gap with an owner and an end date, whose check reports until the date and fails after it. The [model page](model.md) states the known gap shape.

A release record binds evidence to one artifact, so a product with no artifact yet has nothing to record in one. Before its first production release, the consumer keeps a readiness record instead, with dated rehearsals, green gates, and a rehearsal owner who owns the backup and restore rehearsal.

## Standards

### Keep unfinished behavior in draft

**Statement:** A use case with unfinished behavior MUST keep its record in draft.

**Rationale:** Draft status is the only signal that separates planned behavior from released behavior. A use case with unfinished behavior that stands approved claims a promise the code does not keep, and release gates count it as shippable.

### Verify connected journeys

**Statement:** A completed journey MUST connect verified use cases to one observable outcome through a deployed public boundary.

**Rationale:** Use cases that pass in isolation can still fail together: wiring, permissions, and data cross boundaries the isolated tests never touch. A journey test that runs verified use cases to one observable outcome through the deployed public boundary proves the connected path customers actually take.

### Run boundary-selected checks

**Statement:** A release change MUST run every check selected by its changed backend, frontend, journey, product, domain, API, and extension boundaries.

**Rationale:** Each boundary carries risks the others cannot see: frontend checks say nothing about migrations, and backend suites say nothing about rendered screens. Running every check the changed boundaries select keeps each change evidenced where its risk lives. A narrow category that passes alone certifies only part of the change.

### Run backend release checks

**Statement:** A backend change MUST pass the release build and the backend test suites.

**Rationale:** The release build compiles the solution in release mode, catching the conditional and optimization-gated breaks a debug build hides. The architecture, integration, and acceptance suites the size requires prove layering, wiring, and behavior in turn. Skipping any of them ships backend code the project's own suites do not fully prove.

### Run frontend release checks

**Statement:** A frontend change MUST run frozen installation, lint, type checking, tests, and production build checks.

**Rationale:** Each step guards a different failure: frozen installation pins dependencies, lint and type checking catch static defects, tests prove behavior, and the production build proves the shipped bundle compiles. A frontend that skips one arrives at release with that whole class of defect unchecked.

### Run journey checks

**Statement:** A journey change MUST run its journey tests.

**Rationale:** A journey change alters the connected path, so only a journey test through the deployed public boundary can prove it still reaches its outcome. Narrower suites keep passing while the journey itself breaks.

### Run consistency checks

**Statement:** A product, domain, or API change MUST pass the reference consumer validator.

**Rationale:** `litespec consumer` checks metadata, links, and cross-file references across the product, domain, and API records. Without it, a renamed record or a moved file silently breaks the references other pages rely on.

### Run extension checks

**Statement:** A selected project or applicable local extension MUST run its stated verification when affected.

**Rationale:** An extension adds behavior, tests, and operating surface beyond the baseline. Its stated verification is the only evidence written for that surface, so skipping it releases extended behavior the baseline checks never examine.

### Regenerate application contracts

**Statement:** A source change MUST regenerate OpenAPI and frontend API types when it changes their source contract.

**Rationale:** OpenAPI and frontend API types derive from a source contract. A source change that leaves the committed copies stale ships clients built against a contract the server no longer honors.

### Keep generated contracts stable

**Statement:** A generated application contract MUST be stable and exclude timestamps, machine paths, and nondeterministic ordering.

**Rationale:** Timestamps, machine paths, and unstable ordering make every regeneration look like a behavior change. Deterministic output keeps contract diffs reviewable, so a reviewer sees only the changes that matter.

### Meet release readiness gates

**Statement:** A release MUST include only verified use cases and passing deployed journey evidence for its included journeys.

**Rationale:** A use case counts as verified only when every one of its cases passes its proof. Including anything less ships behavior the suite does not fully cover. Journey evidence through the deployed boundary proves the included outcomes connect.

### Apply release access controls

**Statement:** A release with restricted access MUST provide authentication and authorization.

**Rationale:** Restricted behavior without authentication accepts callers nobody identified, and without authorization it accepts actions nobody permitted. Both decisions need a trusted identity and a declared permission before the behavior ships.

### Provide release data recovery

**Statement:** A release MUST provide repeatable schema creation or upgrade, backup instructions, and a tested restore.

**Rationale:** A product that cannot recreate its schema, back up its data, and restore from backup holds customer data it cannot recover. Repeatable setup plus a tested restore turns recovery from a hope into a rehearsed procedure.

### Provide release operating visibility

**Statement:** A release MUST provide liveness, readiness, trace-correlated diagnostics, and secrets outside source control.

**Rationale:** Operators cannot keep a product they cannot see: liveness and readiness signals drive restarts and traffic, and trace-correlated diagnostics connect a failure to its cause. Secrets stay outside source control because a committed secret is a published one.

### Provide release delivery controls

**Statement:** A release MUST provide CI, tested deployment and rollback paths, current operating limits, and the runbooks those limits name.

**Rationale:** CI, tested deployment and rollback paths, current limits, and the runbooks those limits name make every release repeatable and every failure recoverable. Without them, each deployment improvises and each incident starts from scratch.

### Record the release artifact

**Statement:** A release MUST create one release record for its immutable artifact.

**Rationale:** Evidence scattered across builds and reports answers no single question. One release record per immutable artifact binds every result to the exact output it proves.

### Resolve release blockers

**Statement:** A release MUST settle every open decision and external claim it depends on, or exclude the affected behavior from every owning record.

**Rationale:** An open decision or an unverified external claim behind released behavior is a promise with unsettled terms. Settling each one, or excluding the affected behavior from every owning record, keeps the product and release records agreeing on what shipped.

### Report verification exactly

**Statement:** A completion report MUST name exact commands, outcomes, evidence scope, skipped checks, generated differences, scope limits, and covered use cases.

**Rationale:** A vague report lets unrun checks hide among completed ones. Naming exact commands, outcomes, scope, omissions, and limits tells a reviewer precisely what the evidence covers and what it does not.

### Identify immutable release artifacts

**Statement:** A release record MUST name source commit and immutable artifact reference.

**Rationale:** The source commit names the reviewed input and the artifact reference names the deployed output. Together they bind the record to one build, so evidence from another build cannot stand in for it.

### List included release behavior

**Statement:** A release record MUST list included journeys, use cases, and selected applicable extensions.

**Rationale:** The behavior boundary of an artifact is exactly its journeys, use cases, and extensions. Listing them tells operators and reviewers what the artifact contains and, by omission, what it does not.

### Record release evidence

**Statement:** A release record MUST list build, test, contract, security, journey, schema, backup, deployment, readiness, diagnostics, smoke-test, and rollback results.

**Rationale:** Build, test, contract, security, journey, schema, backup, deployment, readiness, diagnostics, smoke-test, and rollback results together show the artifact works and can be operated. A missing kind is a question nobody answered.

### Record operating readiness

**Statement:** A release record MUST list operating limits, alerts, runbooks, known operating conditions, and skipped checks.

**Rationale:** Limits, alerts, runbooks, known conditions, and skipped checks tell the maintainer what to watch, what to run, and what remains unverified after release. Without them, the release hands over an artifact with no operating instructions.

### Keep release records non-authoritative

**Statement:** A release record MUST NOT restate a specification or copy a Case.

**Rationale:** Specifications own behavior and cases. A release record that restates them becomes a second copy, and the copies drift until nobody knows which one holds. The record links outward instead.

### Record accepted debt as a known gap

**Statement:** Accepted debt MUST live as a Known gap with an owner and an end date.

**Rationale:** Accepted debt with no owner and no end date is forgotten work. A known gap with both turns it into a dated promise whose check reports until the date and fails after it. The [model page](model.md) states the known gap shape.

### Keep a first-release readiness record

**Statement:** A consumer before its first production release MUST keep a readiness record with dated rehearsals, green gates, and a rehearsal owner.

**Rationale:** A release record binds evidence to one artifact, so a product with no artifact yet has nothing to record in one. The readiness record instead states what proves the product may take data: dated rehearsals, green gates, and a rehearsal owner who owns the backup and restore rehearsal.

### State each release as a complete record

**Statement:** A release record MUST state its complete behavior and evidence without depending on an earlier release record.

**Rationale:** A release judged from fragments is judged by archaeology: the reader digs through other records to fill the gaps. A complete record lets one reader judge one release from one page, with no upgrade guide filling in.

## Conventions

### Store release records together

**Default:** Keep release records under `docs/releases/`.

**Replacement:** A consumer records a different location as an Exception citing this convention.

**Example:** `docs/releases/2026-08-21.md` records one immutable artifact and its evidence.

### Treat check warnings as failures

**Default:** Treat build and lint warnings as failures unless the build configuration records a narrow suppression with its reason.

**Replacement:** A consumer records a different policy as an Exception citing this convention.

**Rationale:** Warnings that nobody reviews accumulate until a real defect hides among them. Failing on warnings forces each one to be fixed or narrowly suppressed with its reason, so a changed compiler, linter, or dependency boundary surfaces immediately.

## Reference example

This informative example demonstrates `litespec/core/release#verify-connected-journeys`, `litespec/core/release#identify-immutable-release-artifacts`, and `litespec/core/release#record-release-evidence`.

An order-checkout release includes verified stock, order, payment, and shipment use cases. The checkout journey passes against the deployed API and database, and the record names the source commit and the image digest as the immutable artifact reference, with the release evidence attached.

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
