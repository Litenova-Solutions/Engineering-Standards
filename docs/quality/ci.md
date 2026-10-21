# Continuous Integration

## Intent

Continuous integration proves that a pull request preserves the selected standards, generated contracts, dependencies, and release artifacts. The workflow keeps slow deployment checks separate from fast local feedback while retaining one required merge gate.

## Concepts

The first table lists the CI jobs. Every job is a gate: it fails the pull request when it fails. A project's size selects the jobs it runs. The [command index](../tools/README.md) states how `litespec` runs in a consumer.

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

The second table defines the supply-chain gate.

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

**Requirement:** Every pull request MUST run the jobs the jobs table selects for its changed areas.

**Rationale:** A job skipped because its surface did not change is recorded with that reason on the pull request. The supply-chain gate that `litespec/quality/ci#enforce-the-supply-chain-gate` requires is one of these jobs, selected by a change to a manifest, a lockfile, or a workflow.

### Check documentation on every pull request

**Requirement:** The docs job MUST run on every pull request and fail on a page that breaks the page contract, configuration, language, or prose rules.

**Rationale:** Specification metadata shape, configuration, term use, and prose shape are cheapest to check on every pull request.

### Keep generated contracts fresh

**Requirement:** CI MUST regenerate committed OpenAPI and API types from source deterministically and fail on any difference.

**Rationale:** Deterministic generation emits no unstable timestamps, machine paths, or nondeterministic ordering.

### Review schema artifacts

**Requirement:** A persistence change MUST publish a schema artifact that names its reviewer and lists every destructive operation with its reason.

**Rationale:** For Marten the artifact is the schema plan and document transformation. For EF Core it is the generated migration and reviewed SQL.

### Enforce the supply-chain gate

**Requirement:** CI MUST enforce the supply-chain gate on every pull request.

**Rationale:** An advisory names a component and a version range. Without an inventory, answering whether a running release contains it means rebuilding the dependency graph of a commit somebody has to find first. [NIST SP 800-218](https://csrc.nist.gov/publications/detail/sp/800-218/final) states the practice, and the frozen lockfile is what the inventory is generated from.

**Example:** The build job that produces the artifact generates the inventory from the same frozen lockfile. It stores the inventory beside the artifact, under the release version.

### Promote verified artifacts

**Requirement:** CI MUST build one immutable artifact and promote that same artifact through staging and production.

**Rationale:** Rebuilding from a mutable branch between environments means the tested artifact is not the deployed one.

### Protect the default branch

**Requirement:** The default branch MUST require the jobs table entries for the project's size, a reviewed pull request, and a clean merge state.

**Rationale:** A direct push or bypassed check is permitted only during a documented repository recovery action.

### Record every branch protection bypass

**Requirement:** A direct push or bypassed check on the default branch MUST produce a record naming the actor, the reason, and the change it admitted.

**Rationale:** The permission exists for recovery, and a recovery nobody wrote down is indistinguishable from a habit. The record is what makes the next reviewer able to tell which commits on the branch were reviewed. [NIST SP 800-218](https://csrc.nist.gov/publications/detail/sp/800-218/final) treats the same bypass as an event that has to be attributable.

**Example:** The record is the recovery decision itself where one exists. A bypass smaller than a decision takes a dated entry in the operations log at `docs/operations/log/`.

### Keep a canonical job graph

**Requirement:** Consumer CI MUST use the job names and responsibilities the jobs table states.

**Rationale:** The release job and the branch protection settings reference those names, so a renamed job breaks the gate.

## Conventions

### Apply the documented defaults

**Default:** Keep one workflow per job the jobs table lists and use the job names the jobs table states.

**Replacement:** A consumer replaces this default by recording an Exception that names this provision and states its reason, review date, and removal condition.

**Rationale:** Containerized integration tests and browser tests run as jobs the jobs table names.

## Reference example

This informative example demonstrates `litespec/quality/ci#run-applicable-gates-on-every-pull-request` and `litespec/quality/ci#promote-verified-artifacts`.

A backend-only pull request runs the `build`, `test-backend`, `model`, `docs`, `contract`, and `supply-chain` jobs. A pull request that changes a frontend also runs `test-frontend`. The `release` job reruns every job on the release commit and promotes the artifact that passed.

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
