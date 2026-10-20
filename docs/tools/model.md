# Model Builder

## Name

`litespec model` builds the project model, checks it, renders generated regions, and answers record queries.

## Synopsis

```bash
litespec model build --root <consumer> [--out <file>]
litespec model check --root <consumer> [--format json]
litespec model render --root <consumer>
litespec model query --root <consumer> <id>
```

## Description

The model builder reads the written records, the code anchors, the routes, the tests, and the latest test run. It writes `model.json` with every record and its resolved links. The file names the code, screens, tests, and test runs it read. It adds the computed `implements`, `calls`, and `proves` links, and the computed `implemented` and `verified` state per use case.

`build` writes `model.json` under `.model/` in the consumer root unless `--out` names another file. That folder is generated, and the consumer ignores it in git. `check` builds in memory and reports every finding with its code, message, path, and line. `render` rewrites the fenced generated regions and touches no text outside them. `query` prints one record with its links in both directions, for agents.

A finding covered by an open known gap is reported as known and exits zero. The gap covers the finding when its `check` equals the finding code and its `subject` lists the id. An expired known gap fails.

The finding codes are:

| Code | Meaning |
|:---|:---|
| `record-shape` | A record fails the shape its type requires. |
| `identifier-form` | An identifier breaks the form its type requires. |
| `identifier-refused-form` | A retired identifier form appears in docs, code, or tests. |
| `identifier-duplicate` | One identifier names two records. |
| `reference-unresolved` | A citation names no written record. |
| `draft-gate` | An approved record rests on a draft decision. |
| `owner-unknown` | A record names no owner from the owners list. |
| `draft-without-decider` | A draft names no decider or no decide-by date. |
| `known-gap-expired` | A known gap passed its end date with its check still red. |
| `rule-name-negation` | A rule statement negates what its name does not keep. |
| `use-case-without-success` | A use case ends with no success result. |
| `use-case-without-case` | A use case has no case. It runs on the large profile only. |
| `requirement-unfulfilled` | A requirement is fulfilled by no rule, use case or journey. |
| `case-result-unresolved` | A case names no result of its own use case. |
| `refusal-not-thrown` | A refusal result names a code the code never throws. |
| `use-case-unimplemented` | No code implements the use case and no known gap covers it. |
| `proves-unconfirmed` | No when step of a claimed case reaches its use case, or no assertion matches its refusal. |
| `profile-type-missing` | The size profile requires a type the project lacks. |
| `journey-reach` | A public use case sits in no journey and names no background caller. |
| `invalid-field` | A field holds a value outside its shape, or a record other than a decision carries `replaces`. |
| `use-case-name-clash` | Two use cases share one name across the project. |
| `business-record-name-clash` | Two business records share one name across the project. |
| `gap-unknown-check` | A known gap names a check that no check uses. |
| `decision-decides-nothing` | A decision names nothing it decides. |
| `link-unresolved` | A Markdown link on a record page resolves to no file. |
| `use-case-access` | A use case names no permission, is not anonymous, and runs beyond reactions and jobs. |
| `result-status` | A result carries an HTTP status it must not, or misses one it must. |
| `region-unknown` | A generated region names no region the builder renders. |
| `product-not-singleton` | The project holds no single product record. |

The generated regions `render` writes are `history`, `use-case-coverage`, `sub-processors`, `runbook-index`, `rule-map`, `operations-log`, `open-questions`, `journeys`, `glossary`, `exceptions`, `census`, `business-record-map`, `audit-register`, `alert-inventory`, and `counts`. A region reads `<!-- generated:<name> -->` to `<!-- /generated:<name> -->`.

## Arguments

| Argument | Required | Effect |
|:---|:---|:---|
| `<id>` | for `query` | Prints the record with this identifier and its links both ways. |

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--root <consumer>` | the working directory | Selects the consumer repository to read. |
| `--out <file>` | `.model/model.json` under the root | Writes the model to this file instead. Only `build` reads it. |
| `--format json` | human lines | Writes the findings as one JSON object. Only `check` reads it. |

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | The command finished with no open finding. |
| `1` | `check` found an open finding or an expired known gap. |
| `2` | The arguments are wrong or the root holds no project record. |

## Examples

Build the model for a consumer:

```bash
litespec model build --root ../consumer
```

Check the model and read the findings from another program:

```bash
litespec model check --root ../consumer --format json
```

Render the generated regions after a record change:

```bash
litespec model render --root ../consumer
```

Print one record with its links:

```bash
litespec model query --root ../consumer use-case/orders.cancel-order
```

## Underneath

The builder reads paths from `litespec.project.json` and the test run from TRX files under `paths.testResults`. Nothing beneath it is separately runnable.
