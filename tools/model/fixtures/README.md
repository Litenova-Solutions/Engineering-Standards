# Model fixtures

Two fixture consumers and one broken overlay per check. The suite in `standards/tools/model.cases.mjs` copies a fixture to a temporary folder, applies an overlay, and runs the model builder check.

## Fixtures

- `small/` is a library loans system at size small. It holds one module, three business records, eight use cases, results, rules, events, actors, roles, permissions, entry points, terms, one exception, and one known gap. It has no problems, features, journeys, cases, constraints, research, limits, or runbooks. Seven use cases have handlers. The eighth is covered by the open known gap.
- `large/` holds the same records plus problems, features, journeys, one case per use case, constraints, research, limits, runbooks, and a frontend route that imports a generated client operation. Each case has one proving scenario.

Both fixtures exit 0 under `check`. Each names the same owner, approves every record, and resolves every citation.

## Finding codes

The builder and the suite use these codes:

- `record-shape`
- `identifier-form`
- `identifier-refused-form`
- `identifier-duplicate`
- `reference-unresolved`
- `draft-gate`
- `owner-unknown`
- `draft-without-decider`
- `known-gap-expired`
- `rule-name-negation`
- `use-case-without-success`
- `case-result-unresolved`
- `refusal-not-thrown`
- `use-case-unimplemented`
- `proves-unconfirmed`
- `profile-type-missing`
- `journey-reach`
- `use-case-access`
- `result-status`
- `region-unknown`

## Broken overlays

`broken/<code>/` holds only the files that differ from `large/`. The suite copies `large/` to a temporary folder, copies the overlay files over it, deletes the paths listed in `DELETES.txt` when that file exists, and removes `DELETES.txt` before running the check. Each overlay exits 1 with its one finding code.

`broken/refused-bare-prefix/` is the exception: it adds bare refused prefixes with nothing after them, as documentation listing the refused forms writes them, and exits 0.

An open known gap that names the finding code and the subject reports the finding as known and exits 0. An expired gap exits 1.
