# Model builder

A .NET tool that reads a consumer's written records, code, routes, tests and
test runs, and writes `model.json` with the computed links. It also checks the
model and rewrites the generated regions on record pages.

## Commands

All commands take `--root <consumer>`, the consumer repository. It defaults to
the working directory.

```text
Litenova.Model build --root <consumer> [--out model.json]
Litenova.Model check --root <consumer> [--format json]
Litenova.Model render --root <consumer>
Litenova.Model query --root <consumer> <id>
```

Run from the standards repository as
`dotnet run --project tools/model/Litenova.Model -- <command> ...`.

- `build` writes `model.json`, by default to `<consumer>/.model/model.json`.
  That folder is generated and the consumer ignores it in git.
- `check` runs every model check and prints one line per finding. `--format json`
  prints the findings and the known ones as JSON instead.
- `render` rewrites the fenced generated regions on record pages. It writes the
  regions only and never touches text outside them.
- `query` prints one record with its links in both directions, as JSON.

Exit codes: `build` and `render` return 0 on success and 1 on failure. `check`
returns 0 when no finding stands and 1 when one does. `query` returns 1 when no
record holds the id. Every command returns 2 on wrong use.

## What model.json holds

- `records`: every written record with its fields and its resolved links.
- `code`: handlers, reactions, jobs, exceptions with codes, and domain events,
  each with its path.
- `screens`: route files with the generated-client operations they call and the
  use cases those reach.
- `tests`: scenarios with their claimed case, their step classes, and the codes
  they assert.
- `testRun`: the results read from TRX files, or null when there are none.
- `links`: the computed `implements`, `calls` and `proves` links.
- `status`: per use case, the computed `implemented` and `verified`.

Each record carries its resolved `decider` and `decideBy`, inherited from its
page when it is an entry. Each use case carries its `businessRecord`, the
business record whose folder holds its page. Each `proves` link carries
`indirect`, which is true when the use case runs only through reactions or
jobs.

A use case is implemented when a handler, a tagged reaction, or a tagged job
carries it. It is verified when it has at least one case and every case is
proved by a passing test. Without test results nothing is verified.

## Configuration

`build` reads `standards.project.json` for paths. Each entry below shows its
default.

| Path | Default |
|:---|:---|
| `paths.records` | `["docs"]` |
| `paths.language` | `docs/language.json` |
| `paths.application` | `apps/api/src/*.Application` |
| `paths.domain` | `apps/api/src/*.Domain` |
| `paths.webapi` | `apps/api/src/*.WebApi` |
| `paths.infrastructure` | `apps/api/src/*.Infrastructure` |
| `paths.testRoots` | `[]` |
| `paths.frontends[].path` | — |
| `paths.apiClient` | `packages/api` |
| `paths.testResults` | `TestResults` |

A `*` in one segment expands to the first matching folder. `size` selects the
size profile and defaults to `large`. `owners` is the closed owner list.
`optionalTypes` adds the optional types the project records.

## Finding codes

| Code | Meaning |
|:---|:---|
| `record-shape` | A required field is absent. |
| `invalid-field` | A field holds a value outside its shape. |
| `identifier-form` | An id breaks the identifier form or name rules. |
| `identifier-duplicate` | An id is used twice. |
| `use-case-name-clash` | A use-case name is used twice. |
| `reference-unresolved` | An id citation resolves to no record. |
| `identifier-refused-form` | An old identifier form stands in docs, code or tests. |
| `draft-gate` | A record is approved while its decision is a draft. |
| `owner-unknown` | An owner or decider is outside the owner list. |
| `draft-without-decider` | A draft names no decider or decide-by date. |
| `known-gap-expired` | A known gap passed its end date. |
| `gap-unknown-check` | A known gap names a check that does not exist. |
| `rule-name-negation` | A rule statement negates what its name keeps none of. |
| `use-case-without-success` | A use case has no success result. |
| `use-case-without-case` | A use case has no case. It runs on the large profile only. |
| `requirement-unfulfilled` | A requirement is fulfilled by no rule, use case or journey. |
| `case-result-unresolved` | A case ends in another use case's result. |
| `refusal-not-thrown` | A refusal code appears in no backend string literal. |
| `use-case-unimplemented` | A use case has no handler, reaction or job. |
| `proves-unconfirmed` | A test's claim has no step, message or effect that proves it. |
| `profile-type-missing` | The size profile requires a type no record holds. |
| `product-not-singleton` | The project holds no single product record. |
| `journey-reach` | A public use case sits in no journey. It runs on the large profile only. |
| `use-case-access` | A use case names no permission, is not anonymous, and runs beyond reactions and jobs. |
| `result-status` | A result carries a status it must not, misses one it must, or holds no HTTP status. |
| `region-unknown` | A generated region names no region the builder renders. |

A finding whose code a known gap names in `check`, and whose subject the gap
lists in `subject`, is reported as known while the gap is open. It stands again
once the gap ends. An expired gap is itself a finding.

## Generated regions

| Name | Content |
|:---|:---|
| `history` | The decisions deciding the page's carried entries. |
| `use-case-coverage` | Every use case with its implemented and verified status. |
| `sub-processors` | The actors of kind provider. |
| `runbook-index` | Every runbook with its trigger. |
| `rule-map` | The rules grouped by business record. |
| `operations-log` | The dated log files beside the page. |
| `open-questions` | The open modeling questions of every business record page. |
| `journeys` | Every journey with its goal. |
| `glossary` | The term table, from the language record. |
| `exceptions` | Every exception with its provision. |
| `census` | The workspace, module, record, use case, reaction, job, operation, event and route counts. |
| `business-record-map` | The business records grouped by module, with their use cases. |
| `audit-register` | The use cases with permissions or authorization results. |
| `alert-inventory` | Every limit with its bound, value and runbook. |
| `counts` | The record counts by type, with implemented and verified totals. |

A region reads `<!-- generated:<name> -->` to `<!-- /generated:<name> -->`.
A region with another name is a `region-unknown` finding, and `render` leaves
it alone.
