# Continuous Integration

## Intent

Every pull request runs a fixed set of CI jobs, and each job checks one surface: compilation, tests, mutation testing, measured checks, the project model of records joined to code, documentation, generated contracts, the supply chain, and the release itself. This page names those jobs, states which file changes select each one, states the intent-diff surface every pull request publishes for approval and the owners who approve it, and states how the release job promotes the one artifact that passed every job through staging and production. No change merges with its surface unchecked, and every deployment ships that same artifact.

## Concepts

### Jobs and Gates

Each row of the jobs table is one CI job, and every job is a gate: when the job fails, the pull request fails. The `Selected by` column names the file changes that switch a job on, so a pull request runs the jobs its changed areas need and skips the rest. The `Small` and `Large` columns name what each job runs for a small project and for a large project. The `Command` column names what the job runs, and the [command index](../tools/README.md) states how each `litespec` command runs in a consumer.

| Job | Checks | Selected by | Command | Small | Large |
|:---|:---|:---|:---|:---|:---|
| build | Solution and frontends compile. | Any source change. | `dotnet build <solution>` and `pnpm build` per frontend. | Runs. | Runs. |
| test-backend | Architecture, integration, and acceptance suites pass. | Backend or contract change. | `dotnet test <solution>`. | Architecture and integration only. | Runs all suites. |
| test-frontend | Lint, type-check, and route suite pass. | Frontend change. | `pnpm lint`, `pnpm type-check`, and the route suite. | Runs. | Runs. |
| mutation | Zero surviving mutants on changed lines. | Backend or frontend change. | Stryker.NET `--since` and StrykerJS `--incremental`. | Runs. | Runs. |
| measure | Each measured check the change names passes. | Backend, frontend, or measured-requirement change. | k6 thresholds, Lighthouse CI assert, and the ZAP baseline; results feed the model. | Runs. | Runs. |
| model | Model check, then every check reading `model.json`. | Record, code, or test change. | `litespec model check`. | Runs. | Runs. |
| docs | Page contract, configuration, language, prose. | Documentation change. | `litespec consumer`. | Runs. | Runs. |
| contract | Published document and clients unchanged. | API or contract change. | Regenerate, then `git diff --exit-code`. | Runs. | Runs. |
| supply-chain | Pins, licenses, secrets, action pins, inventory. | Manifest, lockfile, or workflow change. | Frozen restores, `pnpm audit`, license scans, and secret scans. | Runs. | Runs. |
| release | Every job above passes. | Release commit only. | Every command above on the release commit. | Runs. | Runs. |

### Measured Checks by Kind

Each measured requirement names its check, and each kind of measure has one tool that runs it. The measure job runs the check for the change's kinds, the tools write their result files under `TestResults/`, and the builder reads them the way it reads test runs, so a measured requirement shows verified when its check passes. Availability and latency objectives are evidenced in production only: Sloth validates the OpenSLO files in CI, and the dashboards show whether the objectives hold.

| Kind | Tool | Evidence |
|:---|:---|:---|
| API latency and errors | k6 thresholds | Threshold results under `TestResults/`. |
| Frontend performance and weight | Lighthouse CI assert | Assert results under `TestResults/`. |
| Accessibility | axe in the route suite | The route suite report with zero violations. |
| Availability and latency objectives | OpenTelemetry signals with OpenSLO files compiled by Sloth | Sloth validation in CI with production dashboards linked in the book. |
| Security | An ASVS 5.0 level with the ZAP baseline, free static analysis, OSV-Scanner, and Gitleaks | ZAP results under `TestResults/` with scan reports showing no unaccepted finding. |

The [security page](security.md) states the ASVS target and the security scans, the [operations page](operations.md) states the availability objectives and dashboards, and `litespec/frontend/web/ui#check-every-route-in-a-browser` states the route suite.

### The Pull Request Surface

Every pull request publishes one intent-diff comment, one job summary with intent counts, and one book preview. The comment holds `litespec model diff <base>` in Markdown: REMOVED, MODIFIED, and ADDED records in that order, each breaking change marked with its reason, in the book's words. The summary carries the breaking, removed, modified, and added counts for the glanceable view, and the preview renders the changed records beside their neighbors. The approver reads intent, not files: file diffs stay available but are not the approval basis. The [model command page](../tools/model.md) states the diff formats.

### Record Ownership

CODEOWNERS maps record areas to owners: product pages to the product owner and each module to its team. A breaking change carries approval from the owner of the highest record it touches, requested through the CODEOWNERS review. The model check confirms each record's owner belongs to the team owning its path. Approval needs no new field: status, decider, and date already record who decided what by when.

### The Supply-Chain Gate

The supply-chain job groups every check that keeps third-party code safe to ship: which dependencies are scanned, how versions are pinned and reviewed, how workflow actions are pinned, which inventory ships beside the artifact, and how licenses and advisories block a release. The table below defines each part. The manifest it names is `litespec.manifest.json`, which pins the baseline stack, and a deviation is a recorded departure from a provision, with a reason and a review date.

| Part | Definition |
|:---|:---|
| Scan scope | Direct and transitive dependencies across NuGet, npm, container images, and release artifacts. |
| Pin rule | Exact manifest pin and frozen lockfile, with integrity and certificate verification enabled. |
| Pin review | Install scripts, transitive changes, source reputation, maintenance status, and advisories before a pin changes. |
| Action pins | Every action pinned to an immutable reference. |
| Inventory | A component inventory beside each promoted artifact, listing resolved direct and transitive components with versions. |
| High-severity advisory | A documented deviation before the release proceeds. |
| License review | Every dependency carries a license the project approves. |
| Advisory evidence | OSV-Scanner matches dependencies against OSV.dev advisories. |
| Secret evidence | Gitleaks scans the repository for leaked secrets. |

## Standards

### Run Applicable Gates on Every Pull Request

**Statement:** Every pull request MUST run the jobs the jobs table selects for its changed areas.

**Rationale:** Each job guards one surface, so a pull request that skips the job for its changed area merges unchecked work. A job skipped because its surface did not change is recorded with that reason on the pull request, which keeps the skipped surface visible to the reviewer. The supply-chain gate that `litespec/quality/ci#enforce-the-supply-chain-gate` requires is one of these jobs.

### Check Documentation on Every Pull Request

**Statement:** The docs job MUST run on every pull request and fail on a page that breaks the page contract, configuration, language, or prose rules.

**Rationale:** Documentation breaks take many small forms: a record with a missing field, a rejected term, a misconfigured path, a page outside its [page contract](../core/authoring.md). Each one is trivial to fix at the pull request that introduced it and hard to trace once later pages build on it. Running the docs job on every pull request catches each break where it started.

### Keep Generated Contracts Fresh

**Statement:** CI MUST regenerate committed OpenAPI and API types from source deterministically and fail on any difference.

**Rationale:** A committed contract that no longer matches its source sends consumers a stale API: a frontend builds against operations the backend no longer serves. Regenerating from source on CI and failing on any difference proves the committed files match the code. Generation stays deterministic, with no timestamps, machine paths, or unstable ordering, so an identical source always yields identical files.

### Refuse Backend Calls Outside the Generated Client

**Statement:** The contract job MUST fail a pull request whose frontend code calls the backend outside the generated client.

**Rationale:** Regenerating the contract proves the committed client matches the API, but a hand-written fetch beside it still compiles and drifts on the next contract change. Failing the pull request keeps every backend call inside the generated client that `litespec/frontend/data#use-one-configured-client-per-application` names, so a contract change breaks the build at the call sites that must move.

### Review Schema Artifacts

**Statement:** A persistence change MUST publish a schema artifact that names its reviewer and lists every destructive operation with its reason.

**Rationale:** A persistence change reaches production data, so its reviewer needs to see exactly what the database will do before it runs. The schema artifact shows that: the Marten schema plan and document transformation, or the generated EF Core migration with its reviewed SQL. Listing every destructive operation with its reason forces the author to name data loss before the reviewer approves it.

### Require Zero Surviving Mutants on Changed Lines

**Statement:** Every pull request MUST show zero surviving mutants on its changed lines.

**Rationale:** Mutation testing judges test strength where the change is: Stryker.NET `--since` scopes the backend run and StrykerJS `--incremental` scopes the frontend run, so the gate costs minutes per pull request. A project-wide percentage is confounded by suite size, so a large suite hides weak new tests behind a high score, while a full nightly run stays a trend rather than a gate. Stryker.NET 5.0.0 and StrykerJS 9.x are free and maintained under Apache-2.0. The .NET form lives on `litespec/backend/dotnet/testing#gate-changed-lines-with-mutation-testing`. A surviving mutant no test can kill is decided once by a person through the equivalent-mutant escape hatch, recorded as a deviation naming this provision.

### Run Measured Checks on Every Pull Request

**Statement:** The measure job MUST run the check each measured requirement names for its kind.

**Rationale:** Each kind has one tool, as the measured-checks table on this page maps: k6 thresholds for API latency and errors, Lighthouse CI assert for frontend performance and weight, axe in the route suite for accessibility, OpenTelemetry with OpenSLO files compiled by Sloth for availability and latency objectives, and an ASVS 5.0 level with the ZAP baseline, free static analysis, OSV-Scanner, and Gitleaks for security. The tools write their result files under `TestResults/`, the builder reads them the way it reads test runs, and `litespec model check` reports `requirement-unmeasured` for a measured requirement with no check or no passing run. Every tool the table names is free and maintained; CodeQL is used only on public repositories, as `litespec/quality/security#scan-every-pull-request-with-a-free-static-analyzer` states.

### Enforce the Supply-Chain Gate

**Statement:** CI MUST enforce the supply-chain gate on every pull request.

**Rationale:** When a new advisory names a component and a version range, the team must answer one question fast: does any running release contain it. Without a component inventory beside the artifact, that answer means rebuilding the dependency graph of a commit somebody has to find first. [NIST SP 800-218](https://csrc.nist.gov/publications/detail/sp/800-218/final) states the practice, and the frozen lockfile the build resolved is what the inventory is generated from. OSV-Scanner matches dependencies against OSV.dev advisories and Gitleaks scans for leaked secrets, so advisories and secrets each have one evidence tool.

**Example:** The build job that produces the artifact generates the inventory from the same frozen lockfile. It stores the inventory beside the artifact, under the release version.

### Publish the Intent Diff on Every Pull Request

**Statement:** CI MUST publish the intent diff of every pull request as one comment updated on every push.

**Rationale:** The comment holds `litespec model diff <base>` in Markdown: REMOVED, MODIFIED, and ADDED records in that order, each breaking change marked with its reason, in the book's words. One comment updated on every push keeps the approval surface current without burying the approver in stale copies. The [model command page](../tools/model.md) states the diff formats.

### Show Intent Counts in the Job Summary

**Statement:** CI MUST show the intent counts in the job summary of every pull request.

**Rationale:** Breaking, removed, modified, and added counts give the glanceable view beside the full comment: a reviewer sees the size and risk of the intent change before opening it. The counts come from the same diff the comment holds, so the two never disagree.

### Publish a Book Preview for Every Change

**Statement:** CI MUST publish a preview of the book for every change.

**Rationale:** The intent diff names what moved, while the preview shows it rendered, with the changed records readable beside their neighbors. The approver clicks from the comment into the preview for full context.

### Map Record Areas to Owners

**Statement:** A consumer MUST map its record areas to owners in CODEOWNERS.

**Rationale:** Product pages map to the product owner and each module to its team, so every record has a team that answers for it. The file lives at `.github/CODEOWNERS`, `CODEOWNERS`, or `docs/CODEOWNERS`, and `litespec model check` reports `owner-unknown` for a record whose owner belongs to no team owning its path.

### Approve Breaking Changes by the Highest Record Owner

**Statement:** A breaking change MUST carry approval from the owner of the highest record it touches.

**Rationale:** Breaking means intent a person already approved now moves: a removed or narrowed requirement, an added refusal or precondition, a removed result, state, transition, or scenario, a weakened rule, or a changed quality measure or target. The owner of the highest touched record approves through the CODEOWNERS review, with branch protection requiring it before merge. Approval needs no new field: status, decider, and date already record who decided what by when.

### Promote Verified Artifacts

**Statement:** CI MUST build one immutable artifact and promote that same artifact through staging and production.

**Rationale:** Staging tests prove something about the artifact they ran against. When production deploys a fresh build from the same branch instead, it ships code the tests never saw, because the branch may have moved between the two builds. Promoting the one tested artifact through staging and production keeps the tested code and the shipped code identical.

### Protect the Default Branch

**Statement:** The default branch MUST require the jobs table entries for the project's size, a reviewed pull request, and a clean merge state.

**Rationale:** The default branch is the source every environment deploys from, so an unreviewed or unchecked commit there reaches production with no further review. Requiring the jobs table entries, a reviewed pull request, and a clean merge state keeps every commit on the branch reviewed and verified. A direct push or a bypassed check is permitted only during a documented repository recovery action.

### Record Every Branch Protection Bypass

**Statement:** A direct push or bypassed check on the default branch MUST produce a record naming the actor, the reason, and the change it admitted.

**Rationale:** The bypass permission exists so a recovery can proceed when the gates cannot run. A recovery nobody wrote down is indistinguishable from a habit, so the next reviewer cannot tell which commits on the branch were reviewed. The record names the actor, the reason, and the admitted change, which is the attribution [NIST SP 800-218](https://csrc.nist.gov/publications/detail/sp/800-218/final) states for the same event.

**Example:** The record is the recovery decision itself where one exists. A bypass smaller than a decision takes a dated entry in the operations log at `docs/operations/log/`.

### Keep a Canonical Job Graph

**Statement:** Consumer CI MUST use the job names and responsibilities the jobs table states.

**Rationale:** The release job reruns the table's jobs by name, and the branch protection settings require them by name. When a consumer renames a job or moves its checks elsewhere, those references point at a job that no longer exists, and the gate stops checking without failing. Fixed names and responsibilities keep every reference resolving to the checks the table states.

## Conventions

### Apply the Documented Defaults

**Default:** Keep one workflow per job the jobs table lists and use the job names the jobs table states.

**Replacement:** A consumer records a workflow-layout convention naming its workflow files and job names.

**Rationale:** One workflow per job keeps each gate readable, runnable, and skippable on its own. When containerized integration tests or browser tests join CI, they join as jobs the table names rather than as hidden steps inside another job, so the selection rules and the branch protection keep working unchanged.

## Reference Example

This informative example demonstrates `litespec/quality/ci#run-applicable-gates-on-every-pull-request` and `litespec/quality/ci#promote-verified-artifacts`.

A backend-only pull request runs `build`, `test-backend`, `mutation`, `measure`, `model`, `docs`, `contract`, and `supply-chain`: the docs job runs even without a documentation change because it checks every pull request. A pull request that changes a frontend also runs `test-frontend`. The `release` job reruns every job on the release commit and promotes the artifact that passed.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/quality/ci#run-applicable-gates-on-every-pull-request | guidance | The pull request checks list shows each selected job passing, with skipped jobs recorded with their reason. |
| litespec/quality/ci#check-documentation-on-every-pull-request | checkable | `litespec consumer` fails on a page that breaks the page contract, configuration, language, or prose rules. |
| litespec/quality/ci#keep-generated-contracts-fresh | guidance | Regenerating OpenAPI and API types from source on the pull request produces no diff. |
| litespec/quality/ci#refuse-backend-calls-outside-the-generated-client | guidance | The contract job report shows a clean regeneration and a lint report with no backend call outside the generated client. |
| litespec/quality/ci#review-schema-artifacts | guidance | Each persistence change carries a schema artifact naming its reviewer with every destructive operation and its reason. |
| litespec/quality/ci#require-zero-surviving-mutants-on-changed-lines | guidance | The mutation job report for the pull request shows zero surviving mutants on its changed lines. |
| litespec/quality/ci#run-measured-checks-on-every-pull-request | checkable | `litespec model check` reports `requirement-unmeasured` for a measured requirement with no check or no passing run. |
| litespec/quality/ci#enforce-the-supply-chain-gate | guidance | The supply-chain report shows scan, pin, inventory, and license evidence with a deviation for each unhandled high-severity advisory. |
| litespec/quality/ci#publish-the-intent-diff-on-every-pull-request | guidance | The pull request shows one intent-diff comment matching its latest push. |
| litespec/quality/ci#show-intent-counts-in-the-job-summary | guidance | The CI run summary for the pull request lists the breaking, removed, modified, and added counts. |
| litespec/quality/ci#publish-a-book-preview-for-every-change | guidance | The pull request links a book preview built from the change. |
| litespec/quality/ci#map-record-areas-to-owners | checkable | `litespec model check` reports `owner-unknown` for a record whose owner belongs to no team owning its path. |
| litespec/quality/ci#approve-breaking-changes-by-the-highest-record-owner | guidance | Each pull request with a breaking change shows approval from the team owning the highest record it touches. |
| litespec/quality/ci#promote-verified-artifacts | guidance | The staging and production deployments reference the one artifact the release job passed. |
| litespec/quality/ci#protect-the-default-branch | guidance | The default branch settings require the jobs-table entries, a reviewed pull request, and a clean merge state. |
| litespec/quality/ci#record-every-branch-protection-bypass | guidance | Each bypass entry in the operations log or recovery decision names its actor, reason, and admitted change. |
| litespec/quality/ci#keep-a-canonical-job-graph | guidance | The consumer workflows use the job names and responsibilities the jobs table states. |
| litespec/quality/ci#apply-the-documented-defaults | guidance | Each consumer workflow file matches one jobs-table job and name, or the workflow-layout convention names another arrangement. |
