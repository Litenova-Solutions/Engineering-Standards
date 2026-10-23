# Product Release

## Intent

A product release is the verified behavior a team ships after Intent, Behavior, and security review approve it. This page states who reviews each diff, how tiers and the veto window work, which checks each changed boundary runs, and what the written release record lists for its artifact. A release that follows it ships only reviewed and proven behavior with recovery, visibility, and delivery evidence attached.

## Concepts

### The Review Flow

Each change flows from the builder through checks into three review views: the Intent diff with its ballots for product people, the Behavior diff for developers, and the security queue for the security reviewer. The Intent diff shows changes in product words, the Behavior diff shows the records developers judge, and the security queue lists cross access, new outside calls, and new personal or sensitive data classes. The release gate admits the change only when every view it touches is reviewed and every check it selects is green.

### Intent Review

Product people review the Intent diff and answer its ballots. Tier 1 questions call for explicit approval from the decider, while tier 3 questions auto-approve after the veto window with the recommendation recorded. Each ballot carries a consequences summary rendered from Behavior as context, outside the approval hash, so Intent stays enough to approve.

### Behavior Review

Developers review the Behavior diff. A tier 1 change ships with passing scenarios plus an advisory agent review, and it ships on no self review alone. Tier 3 changes are sampled, so a developer reads a sample rather than every line.

### The Security Queue

The security reviewer is the role named in `securityReviewer` in the project file. The queue lists every change to cross tenant access, every new `calls` edge, and every new personal or sensitive data class. Security review stands separately from reviewed status: a record can be reviewed and still wait in the queue, and the queue decision is recorded beside the change rather than in the status.

### Single Operator Mode

A project with one operator runs the same flow with the veto window doing the waiting. Tier 3 questions auto-approve after `decideBy` plus `vetoWindowDays`, recorded as auto, while tier 1 questions wait for explicit approval. Drafts past their date that cannot auto-approve are reported as known gaps with owners, so nothing silently blocks.

### The Release Gate

The gate admits a release when its G checks are green, its tier 1 drafts are answered, its scenarios are verified, and its S checks are green where the reader is qualified. G checks read records only and block always, S checks read code through a stack reader and block where that reader is qualified, and A checks report without blocking. The [model page](model.md) states the check tiers, and the boundary table below states which checks each changed boundary selects.

### Agents Advise

Agents draft records, propose answers, and review as advisers. No agent decision gates a release: approval and review come from the named people and roles, with agent output recorded as advice beside the decision.

### Checker Qualification

A stack reader is qualified by fixtures: a known good tree it passes and a known bad tree where it reports each planted defect. Only a qualified reader gates its scope with S checks; elsewhere the same checks report without blocking.

### Verified Behavior and Journey Evidence

Implemented and verified are different claims. A use case is implemented when its handler exists, and verified when every one of its scenarios passes its proof through the public boundary. A journey test proves that connected use cases produce one observable product outcome through the deployed public boundary, catching the wiring, permission, and data defects that narrower suites miss.

### The Release Record

Each release creates one release record for its immutable artifact. The record names the source commit and the immutable artifact reference, lists the included journeys, use cases, and extensions, and attaches the evidence and operating readiness the provisions below require. It stays non-authoritative: specifications own behavior and scenarios, so the record links outward instead of restating them. Release records live under `docs/releases/` unless the project records another location.

### Boundaries Select Checks

Each changed boundary adds the checks that cover its risk. A change that touches several boundaries runs every check each one selects.

| Changed boundary | Checks the change runs |
|:---|:---|
| Backend | The release build and the backend test suites |
| Frontend | Frozen installation, lint, type checking, tests, and the production build |
| Journey | Its journey tests through the deployed boundary |
| Intent or Behavior | G checks with the book and diffs |
| Extension | The verification its extension states |

### Debt, Gaps, and the First Release

Accepted debt never sits as an untracked compromise: it lives as a known gap with an owner and an end date, whose check reports until the date and fails after it. The [model page](model.md) states the known gap shape.

A release record binds evidence to one artifact, so a product with no artifact yet has nothing to record in one. Before its first production release, the consumer keeps a readiness record instead, with dated rehearsals, green gates, and a rehearsal owner who owns the backup and restore rehearsal.

### The Adopted LiteSpec Release

A consumer adopts one LiteSpec release by installing the `LiteSpec.Cli` tool package at that release version and recording the same version in `reviewedLiteSpecVersion`. Each LiteSpec release publishes the tool package and the site at the release version together. A consumer upgrades by changing the tool version and `reviewedLiteSpecVersion` together, after reading the contract the new release states.

## Standards

### Keep Unfinished Behavior in Draft

**Statement:** A use case with unfinished behavior MUST keep its record in draft.

**Rationale:** Draft status is the only signal that separates planned behavior from released behavior. A use case with unfinished behavior that stands reviewed claims a promise the code does not keep, and release gates count it as shippable.

### Review Intent Changes Through the Intent Diff and Ballots

**Statement:** Product people MUST review each Intent change through the Intent diff and its ballots.

**Rationale:** The Intent diff shows the change in product words with its consequences as context, and ballots group the questions by decider with their recommendations. Reviewing there keeps the business decision with the people who own it, instead of scattering it across Behavior pages they never open.

**Example:** A resale cap change shows one product sentence plus the affected promises, and the founder approves it in the Resale terms ballot.

### Review Behavior Changes Through the Behavior Diff

**Statement:** Developers MUST review each Behavior change through the Behavior diff.

**Rationale:** The Behavior diff shows the records, scenarios, and refusals the change adds or moves, which is the evidence developers judge. Reviewing there keeps the technical decision with the people who own the behavior, instead of asking product people to judge fields they never write.

**Example:** A two-line cap rule change shows its setting default and its refusal scenario in one Behavior diff for sampling.

### Require Passing Scenarios and Advisory Review for Tier 1 Behavior

**Statement:** A tier 1 Behavior change MUST show passing scenarios and an advisory agent review before it ships.

**Rationale:** Tier 1 records carry money, door, personal data, or access risk, so one passing suite is not enough on its own. Passing scenarios prove the behavior through the public boundary, and the advisory agent review checks the records a tired reviewer skips, with both recorded beside the change.

**Example:** A cross tenant search ships only after its scenarios pass and the agent advice on its grant is recorded.

### Refuse Self Review Alone for Tier 1 Behavior

**Statement:** A tier 1 Behavior change MUST NOT ship on self review alone.

**Rationale:** A reviewer who wrote the change reads what they meant rather than what the records say, which is where tier 1 risk hides. A second reviewer beside the author keeps one pair of eyes from being the whole gate.

**Example:** An author who drafts a money rule waits for another developer read before the change leaves the gate.

### Sample Tier 3 Behavior Reviews

**Statement:** Tier 3 Behavior changes MUST face sampled developer review.

**Rationale:** Tier 3 records carry no listed risk, so reading every line costs review time without matching risk. Sampling reads a share of tier 3 changes in full, which catches drift while letting routine work flow.

**Example:** A wording fix and a setting default move through the gate after the sampled read passes.

### Name the Security Reviewer in the Project File

**Statement:** A project MUST name its security reviewer in `securityReviewer` in the project file.

**Rationale:** The security queue calls for one owner who answers for cross access, new outside calls, and new personal or sensitive data classes. Naming the role in the project file tells every diff where to route the queue, instead of leaving tier 1 access waiting for whoever notices it.

**Example:** A project file carrying `"securityReviewer": "founder"` routes the queue to the founder until someone else holds the role.

### Review the Security Queue Separately from Reviewed

**Statement:** Each security queue item MUST face security review separately from reviewed status.

**Rationale:** Reviewed status says developers accepted the Behavior, while the queue asks whether cross access, a new outside call, or a new personal or sensitive data class is safe to ship. Judging the queue inside reviewed status would let a developer sample approve access risk, so the security reviewer records the queue decision beside the change.

**Example:** A reviewed staff search with cross scope waits in the queue until the security reviewer accepts the grant.

### Auto Approve Tier 3 Questions After the Veto Window

**Statement:** A tier 3 draft question with a recommendation MUST auto-approve after its decideBy plus the veto window.

**Rationale:** Tier 3 questions carry no listed risk, so waiting for an absent decider blocks routine work for no safety gain. Auto-approval after the veto window records the recommendation as the decision with `auto (veto window)` as the approver, so the window rather than silence decides.

**Example:** A tier 3 wording question with a recommendation and a decideBy of 2026-11-01 approves itself after the project veto window passes.

### Report Aged Drafts as Known Gaps with Owners

**Statement:** A draft past its decideBy that cannot auto-approve MUST appear as a known gap with its owner.

**Rationale:** A draft past its date is work the project has not decided, and leaving it as a draft lets it block silently. Reporting it as a known gap with its owner keeps the undecided work visible with someone answering for it, while the release gate counts it instead of stalling on it.

**Example:** A tier 1 fee question past its date shows as a known gap owned by the founder until the ballot is answered.

### Verify Connected Journeys

**Statement:** A completed journey MUST connect verified use cases to one observable outcome through a deployed public boundary.

**Rationale:** Use cases that pass in isolation can still fail together: wiring, permissions, and data cross boundaries the isolated tests never touch. A journey test that runs verified use cases to one observable outcome through the deployed public boundary proves the connected path customers actually take.

### Run Boundary-Selected Checks

**Statement:** A release change MUST run every check selected by its changed backend, frontend, journey, Intent, Behavior, and extension boundaries.

**Rationale:** Each boundary carries risks the others cannot see: frontend checks say nothing about migrations, and backend suites say nothing about rendered screens. Running every check the changed boundaries select keeps each change evidenced where its risk lives. A narrow category that passes alone certifies only part of the change.

### Run Backend Release Checks

**Statement:** A backend change MUST pass the release build and the backend test suites.

**Rationale:** The release build compiles the solution in release mode, catching the conditional and optimization-gated breaks a debug build hides. The architecture, integration, and acceptance suites the size requires prove layering, wiring, and behavior in turn. Skipping any of them ships backend code the project's own suites do not fully prove.

### Run Frontend Release Checks

**Statement:** A frontend change MUST run frozen installation, lint, type checking, tests, and production build checks.

**Rationale:** Each step guards a different failure: frozen installation pins dependencies, lint and type checking catch static defects, tests prove behavior, and the production build proves the shipped bundle compiles. A frontend that skips one arrives at release with that whole class of defect unchecked.

### Run Journey Checks

**Statement:** A journey change MUST run its journey tests.

**Rationale:** A journey change alters the connected path, so only a journey test through the deployed public boundary can prove it still reaches its outcome. Narrower suites keep passing while the journey itself breaks.

### Run Consistency Checks

**Statement:** An Intent or Behavior change MUST pass the G checks with the book and diffs.

**Rationale:** G checks read records only: shape, references, links, drafts, coverage, and the Behavior rules the check list names. Without them, a renamed record or a moved file silently breaks the references other pages rely on, and the book and diffs render a graph that no longer holds.

### Run Extension Checks

**Statement:** A selected project or applicable local extension MUST run its stated verification when affected.

**Rationale:** An extension adds behavior, tests, and operating surface beyond the baseline. Its stated verification is the only evidence written for that surface, so skipping it releases extended behavior the baseline checks never examine.

### Regenerate Application Contracts

**Statement:** A source change MUST regenerate OpenAPI and frontend API types when it changes their source contract.

**Rationale:** OpenAPI and frontend API types derive from a source contract. A source change that leaves the committed copies stale ships clients built against a contract the server no longer honors.

### Keep Generated Contracts Stable

**Statement:** A generated application contract MUST be stable and exclude timestamps, machine paths, and nondeterministic ordering.

**Rationale:** Timestamps, machine paths, and unstable ordering make every regeneration look like a behavior change. Deterministic output keeps contract diffs reviewable, so a reviewer sees only the changes that matter.

### Meet Release Readiness Gates

**Statement:** A release MUST show green G checks, answered tier 1 drafts, verified scenarios, and green S checks where the reader is qualified.

**Rationale:** The four parts prove the four risks are closed: G checks prove the record graph holds, answered tier 1 drafts prove no high-risk question is open, verified scenarios prove each behavior through the public boundary, and S checks prove the code matches the records where a qualified reader exists. A release missing any part ships with that risk unjudged.

**Example:** A resale release shows green G checks, no open tier 1 ballots, every scenario verified, and green S checks on the .NET reader.

### Advise Without Gating as an Agent

**Statement:** An agent MUST advise without gating a release.

**Rationale:** Agents draft, check, and review at speed, but no agent carries the product or security accountability a release carries. Advice recorded beside the decision helps the named reviewer judge, while a gate held by an agent would let a release ship on no human approval.

**Example:** An agent review of a tier 1 grant is recorded as advice, and the developer review beside it gates the change.

### Qualify the Checker with Known Good and Known Bad Fixtures

**Statement:** A stack reader MUST pass its known good and known bad fixtures before it gates with S checks.

**Rationale:** An unqualified reader blocks on noise or passes on silence, and each mistake trains the team to ignore its findings. Passing a known good tree and reporting each planted defect in a known bad tree proves the reader sees what it claims before it blocks any change.

**Example:** The .NET reader passes the clean tree and reports the planted undeclared write before its S findings block.

### Apply Release Access Controls

**Statement:** A release with restricted access MUST provide authentication and authorization.

**Rationale:** Restricted behavior without authentication accepts callers nobody identified, and without authorization it accepts actions nobody permitted. Both decisions call for a trusted identity and a declared permission before the behavior ships.

### Provide Release Data Recovery

**Statement:** A release MUST provide repeatable schema creation or upgrade, backup instructions, and a tested restore.

**Rationale:** A product that cannot recreate its schema, back up its data, and restore from backup holds customer data it cannot recover. Repeatable setup plus a tested restore turns recovery from a hope into a rehearsed procedure.

### Provide Release Operating Visibility

**Statement:** A release MUST provide liveness, readiness, trace-correlated diagnostics, and secrets outside source control.

**Rationale:** Operators cannot keep a product they cannot see: liveness and readiness signals drive restarts and traffic, and trace-correlated diagnostics connect a failure to its cause. Secrets stay outside source control because a committed secret is a published one.

### Provide Release Delivery Controls

**Statement:** A release MUST provide CI, tested deployment and rollback paths, current operating limits, and the runbooks those limits name.

**Rationale:** CI, tested deployment and rollback paths, current limits, and the runbooks those limits name make every release repeatable and every failure recoverable. Without them, each deployment improvises and each incident starts from scratch.

### Record the Release Artifact

**Statement:** A release MUST create one release record for its immutable artifact.

**Rationale:** Evidence scattered across builds and reports answers no single question. One release record per immutable artifact binds every result to the exact output it proves.

### Resolve Release Blockers

**Statement:** A release MUST settle every open tier 1 question and external claim it depends on, or exclude the affected behavior from every owning record.

**Rationale:** An open tier 1 question or an unverified external claim behind released behavior is a promise with unsettled terms. Settling each one, or excluding the affected behavior from every owning record, keeps the Intent and release records agreeing on what shipped. Tier 3 questions auto-approve or stand as known gaps, so they stall no release.

### Report Verification Exactly

**Statement:** A completion report MUST name exact commands, outcomes, evidence scope, skipped checks, generated differences, scope limits, and covered use cases.

**Rationale:** A vague report lets unrun checks hide among completed ones. Naming exact commands, outcomes, scope, omissions, and limits tells a reviewer precisely what the evidence covers and what it does not.

### Identify Immutable Release Artifacts

**Statement:** A release record MUST name source commit and immutable artifact reference.

**Rationale:** The source commit names the reviewed input and the artifact reference names the deployed output. Together they bind the record to one build, so evidence from another build cannot stand in for it.

### List Included Release Behavior

**Statement:** A release record MUST list included journeys, use cases, and selected applicable extensions.

**Rationale:** The behavior boundary of an artifact is exactly its journeys, use cases, and extensions. Listing them tells operators and reviewers what the artifact contains and, by omission, what it does not.

### Record Release Evidence

**Statement:** A release record MUST list build, test, contract, security, journey, schema, backup, deployment, readiness, diagnostics, smoke-test, and rollback results.

**Rationale:** Build, test, contract, security, journey, schema, backup, deployment, readiness, diagnostics, smoke-test, and rollback results together show the artifact works and can be operated. A missing kind is a question nobody answered.

### Record Operating Readiness

**Statement:** A release record MUST list operating limits, alerts, runbooks, known operating conditions, and skipped checks.

**Rationale:** Limits, alerts, runbooks, known conditions, and skipped checks tell the maintainer what to watch, what to run, and what remains unverified after release. Without them, the release hands over an artifact with no operating instructions.

### Keep Release Records Non-Authoritative

**Statement:** A release record MUST NOT restate a specification or copy a scenario.

**Rationale:** Specifications own behavior and scenarios. A release record that restates them becomes a second copy, and the copies drift until nobody knows which one holds. The record links outward instead.

### Record Accepted Debt as a Known Gap

**Statement:** Accepted debt MUST live as a known gap with an owner and an end date.

**Rationale:** Accepted debt with no owner and no end date is forgotten work. A known gap with both turns it into a dated promise whose check reports until the date and fails after it. The [model page](model.md) states the known gap shape.

### Keep a First-Release Readiness Record

**Statement:** A consumer before its first production release MUST keep a readiness record with dated rehearsals, green gates, and a rehearsal owner.

**Rationale:** A release record binds evidence to one artifact, so a product with no artifact yet has nothing to record in one. The readiness record instead states what proves the product may take data: dated rehearsals, green gates, and a rehearsal owner who owns the backup and restore rehearsal.

### State Each Release as a Complete Record

**Statement:** A release record MUST state its complete behavior and evidence without depending on an earlier release record.

**Rationale:** A release judged from fragments is judged by archaeology: the reader digs through other records to fill the gaps. A complete record lets one reader judge one release from one page, with no upgrade guide filling in.

## Conventions

### Store Release Records Together

**Default:** Keep release records under `docs/releases/`.

**Replacement:** A consumer records a release-path convention naming where its release records live.

**Rationale:** One folder for release records tells a maintainer where to find the evidence for any artifact. A record filed elsewhere looks missing while readers open the folder and find nothing there.

**Example:** `docs/releases/2026-08-21.md` records one immutable artifact and its evidence.

### Treat Check Warnings as Failures

**Default:** Treat build and lint warnings as failures unless the build configuration records a narrow suppression with its reason.

**Replacement:** A consumer records a warnings convention naming which warnings fail its build.

**Rationale:** Warnings that nobody reviews accumulate until a real defect hides among them. Failing on warnings forces each one to be fixed or narrowly suppressed with its reason, so a changed compiler, linter, or dependency boundary surfaces immediately.

## Reference Example

This informative example demonstrates `litespec/core/release#verify-connected-journeys`, `litespec/core/release#identify-immutable-release-artifacts`, and `litespec/core/release#record-release-evidence`.

An order-checkout release includes verified stock, order, payment, and shipment use cases. The checkout journey passes against the deployed API and database, and the record names the source commit and the image digest as the immutable artifact reference, with the release evidence attached.

This informative example demonstrates `litespec/core/release#review-intent-changes-through-the-intent-diff-and-ballots`, `litespec/core/release#review-behavior-changes-through-the-behavior-diff`, and `litespec/core/release#review-the-security-queue-separately-from-reviewed`.

A resale cap change shows one Intent sentence in the founder ballot, a two-line Behavior diff for sampling, and no security queue item, so it releases after the ballot and the sample pass.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/release#keep-unfinished-behavior-in-draft | guidance | Which use cases with unfinished behavior stand outside draft? Look at the status on each use case record. |
| litespec/core/release#review-intent-changes-through-the-intent-diff-and-ballots | guidance | Which Intent changes shipped without product review of the Intent diff and ballots? Look at the Intent diff and ballot decisions beside each change. |
| litespec/core/release#review-behavior-changes-through-the-behavior-diff | guidance | Which Behavior changes shipped without developer review of the Behavior diff? Look at the Behavior diff decisions beside each change. |
| litespec/core/release#require-passing-scenarios-and-advisory-review-for-tier-1-behavior | guidance | Which tier 1 Behavior changes lack passing scenarios or recorded agent advice? Look at the scenario proofs and advice beside each tier 1 change. |
| litespec/core/release#refuse-self-review-alone-for-tier-1-behavior | guidance | Which tier 1 Behavior changes show only the author as reviewer? Look at the reviewers recorded beside each tier 1 change. |
| litespec/core/release#sample-tier-3-behavior-reviews | guidance | Which tier 3 samples lack a recorded developer read? Look at the sampled Behavior diffs beside the gate. |
| litespec/core/release#name-the-security-reviewer-in-the-project-file | checkable | `litespec model check` reports `record-shape` for a project file without `securityReviewer`. |
| litespec/core/release#review-the-security-queue-separately-from-reviewed | guidance | Which cross, calls, or data class changes shipped without a recorded security decision? Look at the security queue beside the Behavior diff. |
| litespec/core/release#auto-approve-tier-3-questions-after-the-veto-window | guidance | Which tier 3 questions past the veto window lack an auto decision? Look at the ballots with their decideBy dates and approvers. |
| litespec/core/release#report-aged-drafts-as-known-gaps-with-owners | guidance | Which drafts past decideBy lack a known gap with an owner? Look at the drafts beside the known gaps. |
| litespec/core/release#verify-connected-journeys | guidance | Which completed journeys lack a passing test through the deployed boundary? Look at the journey tests beside each included journey. |
| litespec/core/release#run-boundary-selected-checks | guidance | Which changes lack a passing result for a check their boundaries select? Look at the change report beside the boundary table. |
| litespec/core/release#run-backend-release-checks | guidance | Which backend changes lack a passing release build or suite result? Look at the build and suite reports beside the change. |
| litespec/core/release#run-frontend-release-checks | guidance | Which frontend changes lack a passing install, lint, type, test, or build result? Look at the frontend reports beside the change. |
| litespec/core/release#run-journey-checks | guidance | Which journey changes lack passing journey tests? Look at the journey reports against the deployed boundary. |
| litespec/core/release#run-consistency-checks | checkable | `litespec model check` exits zero with no G finding. |
| litespec/core/release#run-extension-checks | guidance | Which affected extensions lack their stated verification evidence? Look at the extension evidence beside the change. |
| litespec/core/release#regenerate-application-contracts | guidance | Which committed contracts differ from a fresh generation? Look at the contract diff beside the source change. |
| litespec/core/release#keep-generated-contracts-stable | guidance | Which contract diffs hold timestamps, machine paths, or unstable order? Look at the generated diff beside each contract. |
| litespec/core/release#meet-release-readiness-gates | guidance | Which releases lack green G checks, answered tier 1 drafts, verified scenarios, or qualified S results? Look at the gate evidence beside the release. |
| litespec/core/release#advise-without-gating-as-an-agent | guidance | Which releases show an agent as the gating reviewer? Look at the recorded reviewers beside each approval. |
| litespec/core/release#qualify-the-checker-with-known-good-and-known-bad-fixtures | guidance | Which gating S readers lack passing fixture runs? Look at the fixture results beside the stack reader. |
| litespec/core/release#apply-release-access-controls | guidance | Which restricted release paths lack authentication or authorization? Look at the guards on each restricted path. |
| litespec/core/release#provide-release-data-recovery | guidance | Which releases lack repeatable schema setup, backup instructions, or a tested restore? Look at the recovery evidence beside the release. |
| litespec/core/release#provide-release-operating-visibility | guidance | Which releases lack health signals, trace diagnostics, or secrets outside source control? Look at the operating evidence beside the release. |
| litespec/core/release#provide-release-delivery-controls | guidance | Which releases lack current CI, deployment, rollback, limits, or runbooks? Look at the delivery evidence beside the release. |
| litespec/core/release#record-the-release-artifact | guidance | Which releases lack one record naming the immutable artifact? Look at the release records beside each artifact. |
| litespec/core/release#resolve-release-blockers | guidance | Which releases depend on an open tier 1 question or external claim without excluding the behavior? Look at the questions and claims beside the owning records. |
| litespec/core/release#report-verification-exactly | guidance | Which completion reports lack commands, outcomes, scope, omissions, differences, limits, or covered use cases? Look at the report beside the change. |
| litespec/core/release#identify-immutable-release-artifacts | guidance | Which release records lack a source commit or artifact reference? Look at the record header beside each artifact. |
| litespec/core/release#list-included-release-behavior | guidance | Which records omit an included journey, use case, or extension? Look at the behavior list on each release record. |
| litespec/core/release#record-release-evidence | guidance | Which records lack a result for a listed evidence kind? Look at the evidence list on each release record. |
| litespec/core/release#record-operating-readiness | guidance | Which records lack limits, alerts, runbooks, conditions, or omissions? Look at the readiness list on each release record. |
| litespec/core/release#keep-release-records-non-authoritative | guidance | Which release records restate a specification or copy a scenario? Look at the record body beside the linked specifications. |
| litespec/core/release#record-accepted-debt-as-a-known-gap | guidance | Which accepted debts lack a known gap with owner and end date? Look at the known gaps beside each debt. |
| litespec/core/release#keep-a-first-release-readiness-record | guidance | Which pre-release consumers lack dated rehearsals, green gates, or a rehearsal owner? Look at the readiness record beside the project. |
| litespec/core/release#state-each-release-as-a-complete-record | guidance | Which release records depend on an earlier record to be judged? Look at the record alone beside its links. |
| litespec/core/release#store-release-records-together | guidance | Which release records sit outside `docs/releases/` without a recorded release path convention? Look at the release paths beside the convention. |
| litespec/core/release#treat-check-warnings-as-failures | guidance | Which builds pass with unreviewed warnings outside recorded suppressions? Look at the build logs beside the warnings convention. |
