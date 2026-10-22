# Model Builder

## Name

`litespec model` builds the project model, checks it, diffs it against a base, renders generated regions, and answers record queries.

## Synopsis

```bash
litespec model build [--root <consumer>] [--out <file>]
litespec model check [--root <consumer>] [--format json]
litespec model render [--root <consumer>]
litespec model query [--root <consumer>] <id>
litespec model diff <base> [--root <consumer>] [--format text|markdown|json] [--fail-on breaking] [--breaking-only]
```

## Description

The model builder reads the written records, the code anchors, the routes, the tests, and the latest test run. It writes `model.json` with every record and its resolved links. The file names the code, screens, tests, and test runs it read. It adds the computed `implements`, `calls`, and `proves` links, the computed `implemented` and `verified` state of each use case and requirement, the reachable states of each aggregate, and the effective status of each record.

Aggregate transitions and data, and scenario examples, may be written as Markdown tables the builder parses, so the parts people debate read naturally even in the raw file. A front-matter field wins over a table with the same name.

The five subcommands share one reader:

- `build` writes `model.json` under `.model/` in the consumer root, unless `--out` names another file. That folder holds generated output, and the consumer ignores it in Git.
- `check` builds the model in memory and reports every finding with its code, message, path, and line.
- `render` rewrites the fenced generated regions and touches no text outside them.
- `query` prints one record with its links in both directions. Agents use it to load a record's context.
- `diff` compares the working tree against a base and prints the intent change in the book's language: what intent the change adds, changes, or removes. The base is a consumer folder holding `litespec.project.json`, or a git revision of the consumer. Records match by identifier. The changelog prints REMOVED, then MODIFIED, then ADDED; each section groups entries by family: goals and requirements, domain, access, operations. The header counts breaking, removed, modified, and added changes. `text` is the changelog reviewers read, `markdown` is the pull request comment, and `json` carries every change with its fingerprint and the counts for machines. `--breaking-only` shows breaking changes and hides the rest.

A change breaks approved intent when it removes or narrows an approved requirement, adds a refusal or a precondition to an approved use case, removes a result, state, transition, or scenario, weakens a rule, or changes a quality measure or target. Each breaking entry names its reason code:

| Code | Meaning |
|:---|:---|
| `requirement-removed` | An approved requirement no longer exists. |
| `requirement-narrowed` | An approved requirement statement changed. |
| `quality-measure-changed` | A quality requirement measure or target changed. |
| `refusal-added` | A refusal was added to an approved use case. |
| `precondition-added` | A precondition was added to an approved use case. |
| `refusal-path-added` | A scenario proves a new refusal path. |
| `result-removed` | A result was removed from approved intent. |
| `scenario-removed` | A scenario was removed from approved intent. |
| `state-removed` | A state was removed from an approved aggregate. |
| `transition-removed` | A transition was removed from an approved aggregate. |
| `aggregate-removed` | An approved aggregate was removed. |
| `rule-weakened` | A rule was weakened. |
| `refusal-meaning-changed` | A refusal meaning changed. |
| `result-outcome-changed` | A result outcome changed. |

Every reason except `refusal-path-added` fires only on approved records.

A finding that an open known gap covers is reported as known and exits zero. The gap covers the finding when its `check` equals the finding code, its `subject` lists the finding's subject, the gap is not retired, and its end date has not passed. A gap on a use case also covers the findings about the scenarios and results it holds. An expired known gap fails the check.

The finding codes are:

| Code | Meaning |
|:---|:---|
| `record-shape` | A record fails the shape its type requires. |
| `identifier-form` | An identifier breaks the form its type requires. |
| `identifier-duplicate` | One identifier names two records. |
| `reference-unresolved` | A citation names no written record or pinned shared provision. |
| `draft-gate` | An approved record rests on a draft decision. |
| `owner-unknown` | A record names an owner or decider the owners list does not hold, or an owner no team owning its path claims. |
| `draft-without-decider` | A draft names no decider or no decide-by date. |
| `known-gap-expired` | A known gap passed its end date with its check still red. |
| `rule-name-negation` | A rule statement negates what its name does not keep. |
| `use-case-without-success` | A use case ends with no success result. |
| `use-case-without-scenario` | A use case has no scenario. It runs at large size only. |
| `requirement-unfulfilled` | A requirement is fulfilled by no rule, use case or journey. |
| `requirement-unmeasured` | A measured requirement names no check, or its check has no passing run. |
| `scenario-result-unresolved` | A scenario ends in a result outside its own use case. |
| `refusal-not-thrown` | A refusal result names a code the code never throws. |
| `use-case-unimplemented` | No code implements the use case and no known gap covers it. |
| `proves-unconfirmed` | No proving step of a claimed scenario reaches its use case, or no assertion matches its refusal. |
| `size-type-missing` | The size requires a type the project lacks. |
| `journey-reach` | A public use case sits in no journey and names no background caller. It runs at large size only. |
| `invalid-field` | A field holds a value outside its shape, or a record other than a decision carries `replaces`. |
| `use-case-name-clash` | Two use cases share one name across the project. |
| `aggregate-name-clash` | Two aggregates share one name across the project. |
| `gap-unknown-check` | A known gap names a check that no check uses. |
| `decision-decides-nothing` | A decision names nothing it decides. |
| `link-unresolved` | A Markdown link on a record page resolves to no file. |
| `use-case-access` | A use case names no permission, is not anonymous, and runs beyond reactions and jobs. |
| `region-unknown` | A generated region names no region the builder renders. |
| `product-not-singleton` | The project holds no single product record. |
| `behavior-unrecorded` | A handler, endpoint, reaction, domain event, or refusal code in code is named by no record. |
| `state-unreachable` | A state is reached by no transition. |
| `transition-unresolved` | A transition names a missing state or use case. |
| `personal-data-uncovered` | A personal or sensitive field stands outside an erasure or export use case. |
| `calculation-without-table` | A calculation rule has no scenario examples table. |
| `reaction-without-trigger` | A reaction names no trigger. |
| `open-questions` | A record stands approved with open questions. |

The `render` subcommand writes these generated regions, each fenced by `<!-- generated:<name> -->` and `<!-- /generated:<name> -->`: `history`, `use-case-coverage`, `sub-processors`, `runbook-index`, `rule-map`, `operations-log`, `open-questions`, `journeys`, `glossary`, `deviations`, `census`, `aggregate-map`, `audit-register`, `alert-inventory`, and `counts`.

## Arguments

| Argument | Required | Effect |
|:---|:---|:---|
| `<id>` | for `query` | Prints the record with this identifier and its links both ways. |
| `<base>` | for `diff` | The consumer folder or git revision to compare against. |

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--root <consumer>` | the working directory | Selects the consumer repository to read. |
| `--out <file>` | `.model/model.json` under the root | Writes the model to this file instead. Only `build` reads it. |
| `--format <name>` | human lines | Only `check` and `diff` read it. `check` accepts `json` and writes the findings as one JSON object. `diff` accepts `text`, `markdown`, or `json`. |
| `--fail-on breaking` | off | Only `diff` reads it. Exits 1 when the change breaks approved intent. |
| `--breaking-only` | off | Only `diff` reads it. Shows the breaking changes and hides the rest. |
| `--help` | off | Prints the usage text and exits 0. |

## Exit Codes

| Code | Meaning |
|:---|:---|
| `0` | The command finished with no open finding. |
| `1` | `check` found an open finding or an expired known gap, `query` found no record with the `id`, `diff` with `--fail-on breaking` found a breaking change, or the run failed. |
| `2` | The arguments are wrong, the root holds no project record, or the diff base is neither a consumer folder nor a git revision. |

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

Diff the working tree against the main branch:

```bash
litespec model diff main --root ../consumer
```

Show only the breaking changes as a pull request comment, and fail on them:

```bash
litespec model diff main --root ../consumer --format markdown --breaking-only --fail-on breaking
```

## Underneath

The builder reads `paths`, `shape`, and `stacks` from the consumer's `litespec.project.json`. It reads shared provisions from the pinned docs under `litespec/docs`, the record owners from the CODEOWNERS file at `.github/CODEOWNERS`, `CODEOWNERS`, or `docs/CODEOWNERS`, and the test run from TRX or JUnit XML files under `paths.testResults`. A git diff base is read through an archive into a temporary folder, which is removed after the diff. Nothing beneath it is separately runnable.
