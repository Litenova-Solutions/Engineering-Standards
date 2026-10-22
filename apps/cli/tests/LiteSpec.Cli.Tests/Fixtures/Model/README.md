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

- `small/` is a library loans system at size small. It holds one module, three aggregates, eight use cases, results, rules, events, actors, roles, permissions, entry points, terms, one deviation, and one known gap. It has no problems, features, journeys, scenarios, constraints, research, limits, or runbooks. Seven use cases have handlers. The eighth is covered by the open known gap.
- `large/` holds the same records plus problems, features, journeys, one scenario per use case, constraints, research, limits, runbooks, one goal, one external system, and a frontend route that imports a generated client operation. Each scenario has one proving test.

Both fixtures exit 0 under `check`. Each names the same owner, approves every record, and resolves every citation.

## Finding codes

The builder and the suite use these codes:

- `record-shape`
- `invalid-field`
- `identifier-form`
- `identifier-duplicate`
- `use-case-name-clash`
- `reference-unresolved`
- `draft-gate`
- `owner-unknown`
- `draft-without-decider`
- `known-gap-expired`
- `gap-unknown-check`
- `rule-name-negation`
- `use-case-without-success`
- `use-case-without-scenario`
- `requirement-unfulfilled`
- `scenario-result-unresolved`
- `refusal-not-thrown`
- `use-case-unimplemented`
- `proves-unconfirmed`
- `size-type-missing`
- `product-not-singleton`
- `journey-reach`
- `use-case-access`
- `region-unknown`
- `aggregate-name-clash`
- `decision-decides-nothing`
- `link-unresolved`

## Broken overlays

`broken/<code>/` holds only the files that differ from `large/`. The suite copies `large/` to a temporary folder, copies the overlay files over it, deletes the paths listed in `DELETES.txt` when that file exists, and removes `DELETES.txt` before running the check. Each overlay exits 1 with its one finding code.

An open known gap that names the finding code and the subject reports the finding as known and exits 0. An expired gap exits 1.
