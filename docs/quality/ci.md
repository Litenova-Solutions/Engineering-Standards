# Continuous Integration

## Intent

Every pull request runs a fixed set of CI jobs, and each job checks one surface: compilation, tests, the project model of records joined to code, documentation, generated contracts, the supply chain, and the release itself. This page names those jobs, states which file changes select each one, and states how the release job promotes the one artifact that passed every job through staging and production. No change merges with its surface unchecked, and every deployment ships that same artifact.

## Concepts

### Jobs and gates

Each row of the jobs table is one CI job, and every job is a gate: when the job fails, the pull request fails. The `Selected by` column names the file changes that switch a job on, so a pull request runs the jobs its changed areas need and skips the rest. The `Small` and `Large` columns name what each job runs for a small project and for a large project. The `Command` column names what the job runs, and the [command index](../tools/README.md) states how each `litespec` command runs in a consumer.

| Job | Checks | Selected by | Command | Small | Large |
|:---|:---|:---|:---|:---|:---|
| build | Solution and frontends compile. | Any source change. | `dotnet build <solution>` and `pnpm build` per frontend. | Runs. | Runs. |
| test-backend | Architecture, integration, and acceptance suites pass. | Backend or contract change. | `dotnet test <solution>`. | Architecture and integration only. | Runs all suites. |
| test-frontend | Lint, type-check, and route suite pass. | Frontend change. | `pnpm lint`, `pnpm type-check`, and the route suite. | Runs. | Runs. |
| model | Model check, then every check reading `model.json`. | Record, code, or test change. | `litespec model check`. | Runs. | Runs. |
| docs | Page contract, configuration, language, prose. | Documentation change. | `litespec consumer`. | Runs. | Runs. |
| contract | Published document and clients unchanged. | API or contract change. | Regenerate, then `git diff --exit-code`. | Runs. | Runs. |
| supply-chain | Pins, licenses, secrets, action pins, inventory. | Manifest, lockfile, or workflow change. | Frozen restores, `pnpm audit`, license scans, and secret scans. | Runs. | Runs. |
| release | Every job above passes. | Release commit only. | Every command above on the release commit. | Runs. | Runs. |

### The supply-chain gate

The supply-chain job groups every check that keeps third-party code safe to ship: which dependencies are scanned, how versions are pinned and reviewed, how workflow actions are pinned, which inventory ships beside the artifact, and how licenses and advisories block a release. The table below defines each part. The manifest it names is `litespec.manifest.json`, which pins the baseline stack, and an Exception is a recorded departure from a standard, with a reason and a review date.

| Part | Definition |
|:---|:---|
| Scan scope | Direct and transitive dependencies across NuGet, npm, container images, and release artifacts. |
| Pin rule | Exact manifest pin and frozen lockfile, with integrity and certificate verification enabled. |
| Pin review | Install scripts, transitive changes, source reputation, maintenance status, and advisories before a pin changes. |
| Action pins | Every action pinned to an immutable reference. |
| Inventory | A component inventory beside each promoted artifact, listing resolved direct and transitive components with versions. |
| High-severity advisory | A documented Exception before the release proceeds. |
| License review | Every dependency carries a license the project approves. |

## Standards

### Run applicable gates on every pull request

**Statement:** Every pull request MUST run the jobs the jobs table selects for its changed areas.

**Rationale:** Each job guards one surface, so a pull request that skips the job for its changed area merges unchecked work. A job skipped because its surface did not change is recorded with that reason on the pull request, which keeps the skipped surface visible to the reviewer. The supply-chain gate that `litespec/quality/ci#enforce-the-supply-chain-gate` requires is one of these jobs.

### Check documentation on every pull request

**Statement:** The docs job MUST run on every pull request and fail on a page that breaks the page contract, configuration, language, or prose rules.

**Rationale:** Documentation breaks take many small forms: a record with a missing field, a rejected term, a misconfigured path, a page outside its [page contract](../core/authoring.md). Each one is trivial to fix at the pull request that introduced it and hard to trace once later pages build on it. Running the docs job on every pull request catches each break where it started.

### Keep generated contracts fresh

**Statement:** CI MUST regenerate committed OpenAPI and API types from source deterministically and fail on any difference.

**Rationale:** A committed contract that no longer matches its source sends consumers a stale API: a frontend builds against operations the backend no longer serves. Regenerating from source on CI and failing on any difference proves the committed files match the code. Generation stays deterministic, with no timestamps, machine paths, or unstable ordering, so an identical source always yields identical files.

### Review schema artifacts

**Statement:** A persistence change MUST publish a schema artifact that names its reviewer and lists every destructive operation with its reason.

**Rationale:** A persistence change reaches production data, so its reviewer needs to see exactly what the database will do before it runs. The schema artifact shows that: the Marten schema plan and document transformation, or the generated EF Core migration with its reviewed SQL. Listing every destructive operation with its reason forces the author to name data loss before the reviewer approves it.

### Enforce the supply-chain gate

**Statement:** CI MUST enforce the supply-chain gate on every pull request.

**Rationale:** When a new advisory names a component and a version range, the team must answer one question fast: does any running release contain it. Without a component inventory beside the artifact, that answer means rebuilding the dependency graph of a commit somebody has to find first. [NIST SP 800-218](https://csrc.nist.gov/publications/detail/sp/800-218/final) states the practice, and the frozen lockfile the build resolved is what the inventory is generated from.

**Example:** The build job that produces the artifact generates the inventory from the same frozen lockfile. It stores the inventory beside the artifact, under the release version.

### Promote verified artifacts

**Statement:** CI MUST build one immutable artifact and promote that same artifact through staging and production.

**Rationale:** Staging tests prove something about the artifact they ran against. When production deploys a fresh build from the same branch instead, it ships code the tests never saw, because the branch may have moved between the two builds. Promoting the one tested artifact through staging and production keeps the tested code and the shipped code identical.

### Protect the default branch

**Statement:** The default branch MUST require the jobs table entries for the project's size, a reviewed pull request, and a clean merge state.

**Rationale:** The default branch is the source every environment deploys from, so an unreviewed or unchecked commit there reaches production with no further review. Requiring the jobs table entries, a reviewed pull request, and a clean merge state keeps every commit on the branch reviewed and verified. A direct push or a bypassed check is permitted only during a documented repository recovery action.

### Record every branch protection bypass

**Statement:** A direct push or bypassed check on the default branch MUST produce a record naming the actor, the reason, and the change it admitted.

**Rationale:** The bypass permission exists so a recovery can proceed when the gates cannot run. A recovery nobody wrote down is indistinguishable from a habit, so the next reviewer cannot tell which commits on the branch were reviewed. The record names the actor, the reason, and the admitted change, which is the attribution [NIST SP 800-218](https://csrc.nist.gov/publications/detail/sp/800-218/final) states for the same event.

**Example:** The record is the recovery decision itself where one exists. A bypass smaller than a decision takes a dated entry in the operations log at `docs/operations/log/`.

### Keep a canonical job graph

**Statement:** Consumer CI MUST use the job names and responsibilities the jobs table states.

**Rationale:** The release job reruns the table's jobs by name, and the branch protection settings require them by name. When a consumer renames a job or moves its checks elsewhere, those references point at a job that no longer exists, and the gate stops checking without failing. Fixed names and responsibilities keep every reference resolving to the checks the table states.

## Conventions

### Apply the documented defaults

**Default:** Keep one workflow per job the jobs table lists and use the job names the jobs table states.

**Replacement:** A consumer replaces this default by recording an Exception that names this provision and states its reason, review date, and removal condition.

**Rationale:** One workflow per job keeps each gate readable, runnable, and skippable on its own. When containerized integration tests or browser tests join CI, they join as jobs the table names rather than as hidden steps inside another job, so the selection rules and the branch protection keep working unchanged.

## Reference example

This informative example demonstrates `litespec/quality/ci#run-applicable-gates-on-every-pull-request` and `litespec/quality/ci#promote-verified-artifacts`.

A backend-only pull request runs `build`, `test-backend`, `model`, `docs`, `contract`, and `supply-chain`: the docs job runs even without a documentation change because it checks every pull request. A pull request that changes a frontend also runs `test-frontend`. The `release` job reruns every job on the release commit and promotes the artifact that passed.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/quality/ci#run-applicable-gates-on-every-pull-request | guidance | Does every pull request run the jobs the jobs table selects for its changed areas? |
| litespec/quality/ci#check-documentation-on-every-pull-request | checkable | `litespec consumer` fails on a page that breaks the page contract, configuration, language, or prose rules. |
| litespec/quality/ci#keep-generated-contracts-fresh | guidance | Does CI regenerate the contracts from source and fail on any difference? |
| litespec/quality/ci#review-schema-artifacts | guidance | Does every persistence change publish a reviewed schema artifact with its destructive operations listed? |
| litespec/quality/ci#enforce-the-supply-chain-gate | guidance | Does the supply-chain job scan, pin, inventory, and block a release with a high-severity advisory and no Exception? |
| litespec/quality/ci#promote-verified-artifacts | guidance | Does the same immutable artifact move through staging and production? |
| litespec/quality/ci#protect-the-default-branch | guidance | Does the default branch require its jobs, a review, and a clean merge? |
| litespec/quality/ci#record-every-branch-protection-bypass | guidance | Does every bypass name its actor, reason, and admitted change? |
| litespec/quality/ci#keep-a-canonical-job-graph | guidance | Does consumer CI use the job names and responsibilities the jobs table states? |
| litespec/quality/ci#apply-the-documented-defaults | guidance | Does each workflow match one job, or does an Exception record the replacement? |
