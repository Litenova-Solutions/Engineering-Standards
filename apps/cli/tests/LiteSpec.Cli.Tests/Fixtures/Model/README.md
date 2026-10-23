# Model fixtures

Two fixture consumers and one broken overlay per check. The suite in `apps/cli/tests/LiteSpec.Cli.Tests/Model/ModelCheckTests.cs` copies a fixture to a temporary folder, applies an overlay, and runs the model builder check.

Run the suite with:

```bash
dotnet test --solution LiteSpec.slnx
```

Or check one fixture directly:

```bash
litespec model check --root apps/cli/tests/LiteSpec.Cli.Tests/Fixtures/Model/small
```

## Fixtures

- `small/` is a library loans system at size small. It holds one module, three aggregates, eight use cases, results, rules, events, actors, roles, permissions, entry points, terms, one deviation, and one known gap. It has no goals, problems, features, journeys, scenarios, constraints, research, settings, reactions, jobs, notifications, or runbooks. Seven use cases have handlers. The eighth is covered by the open known gap.
- `large/` holds the same records plus one goal, problems, features, one journey, one scenario per use case, constraints, research, one setting, one reaction, one job, one notification, runbooks, one external system, and a frontend route that imports a generated client operation. Each scenario has one proving test.

Both fixtures exit 0 under `check`. Each names the same owner, reviews every Behavior record, approves every Intent record, stamps every approval hash, and resolves every citation.

## Finding codes

The builder and the suite use these codes:

- `aggregate-name-clash`
- `approval-reopened`
- `behavior-unrecorded`
- `calculation-without-table`
- `consistency-unexplained`
- `decision-decides-nothing`
- `draft-gate`
- `draft-without-decider`
- `effect-loop`
- `effect-undeclared`
- `erasure-undeclared`
- `except-without-fallback`
- `exemption-expired`
- `gap-unknown-check`
- `identifier-duplicate`
- `identifier-form`
- `invalid-field`
- `journey-reach`
- `known-gap-expired`
- `link-unresolved`
- `notification-without-sender`
- `operator-job-without-guard`
- `owner-unknown`
- `paging-undeclared`
- `product-not-singleton`
- `proves-unconfirmed`
- `query-output-missing`
- `reaction-trigger-unresolved`
- `record-orphaned`
- `record-shape`
- `reference-unresolved`
- `refusal-not-thrown`
- `requirement-unfulfilled`
- `requirement-unmeasured`
- `reservation-without-release`
- `result-undeclared`
- `retention-without-enforcement`
- `risk-without-acceptance`
- `rule-name-negation`
- `scenario-result-unresolved`
- `schedule-unstructured`
- `setting-default-without-requirement`
- `size-type-missing`
- `state-unreachable`
- `step-unserved`
- `transcribed-after-adoption`
- `transcribed-reviewed`
- `transition-unresolved`
- `use-case-name-clash`
- `use-case-unimplemented`
- `use-case-without-scenario`
- `use-case-without-success`
- `widening-unjustified`
- `write-undeclared`

## Broken overlays

`broken/<code>/` holds only the files that differ from `large/`. The suite copies `large/` to a temporary folder, copies the overlay files over it, deletes the paths listed in `DELETES.txt` when that file exists, and removes `DELETES.txt` before running the check. Each overlay exits 1 with its one finding code.

An open known gap that names the finding code and the subject reports the finding as known and exits 0. An expired gap exits 1.
