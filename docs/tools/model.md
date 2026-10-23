# Model Builder

## Name

`litespec model` builds the project model, checks it, diffs it against a base, renders generated regions, and answers record queries.

## Synopsis

```bash
litespec model build [--root <consumer>] [--out <file>]
litespec model check [--root <consumer>] [--format json]
litespec model render [--root <consumer>]
litespec model query [--root <consumer>] <id>
litespec model approve [--root <consumer>] (<id>... | --all) [--by <owner>] [--on <YYYY-MM-DD>]
litespec model diff <base> [--root <consumer>] [--format text|markdown|json] [--intent|--behavior] [--fail-on breaking] [--breaking-only]
```

## Description

The model builder reads the written records, the code anchors, the routes, the tests, and the latest test run. It writes `model.json` with every record and its resolved links. The file names the code, screens, tests, and test runs it read. It adds the computed `implements`, `calls`, and `proves` links, the computed `implemented`, `verified`, `stale`, and `reachable` state of each record, and the effective status of each record. Computed states are never written on a record; they appear in the book and the model output only.

`approve` writes approval data onto the named records, or with `--all` onto every approved or reviewed record that carries no `approvedHash`. It sets `approvedBy` (from `--by`, else the record decider, else its owner) and `approvedOn` (from `--on`, else today) when they are missing, and always writes `approvedHash`, the builder hash over the record semantic fields. A person runs it when they approve or review a record; agents run it only with `--by "auto (veto window)"` for a tier-3 question past its veto window.

Aggregate transitions and data, and scenario examples, may be written as Markdown tables the builder parses, so the parts people debate read naturally even in the raw file. A front-matter field wins over a table with the same name.

The five subcommands share one reader:

- `build` writes `model.json` under `.model/` in the consumer root, unless `--out` names another file. That folder holds generated output, and the consumer ignores it in Git.
- `check` builds the model in memory and reports every finding with its tier, code, message, path, and line.
- `render` rewrites the fenced generated regions and touches no text outside them.
- `query` prints one record with its links in both directions. Agents use it to load a record's context.
- `diff` compares the working tree against a base. The base is a consumer folder holding `litespec.project.json`, or a git revision of the consumer. Records match by identifier. `--intent` shows Intent changes in product words, `--behavior` shows Behavior changes and the security queue, and without either flag it shows both. The changelog prints REMOVED, then MODIFIED, then ADDED; each section groups entries by family: goals and requirements, domain, access, operations. The header counts breaking, removed, modified, and added changes. `text` is the changelog reviewers read, `markdown` is the pull request comment, and `json` carries every change with its fingerprint and the counts for machines. `--breaking-only` shows breaking changes and hides the rest.

The security queue ends the behavior diff. It lists the changes the security reviewer named in `review.securityReviewer` approves: access tenant scope widenings to `cross`, new `calls` effects, and new personal or sensitive data classes.

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

Every reason except `refusal-path-added` fires only on approved or reviewed records.

A finding that an open known gap covers is reported as known and exits zero. The gap covers the finding when its `check` equals the finding code, its `subject` lists the finding's subject, the gap is not retired, and its end date has not passed. A gap on a use case also covers the findings about the scenarios and results it holds. An expired known gap fails the check.

Every check has a tier. G reads records only and always blocks. S reads code through a stack reader: it blocks where the stack reader is qualified (.NET today), and reports otherwise. A is advisory: it reports and never blocks. The finding codes are:

| Code | Tier | Meaning |
|:---|:---|:---|
| `record-shape` | G | A record fails the shape its type requires. |
| `identifier-form` | G | An identifier breaks the form its type requires. |
| `identifier-duplicate` | G | One identifier names two records. |
| `invalid-field` | G | A field holds a value outside its shape, or a record other than a decision carries `replaces`. |
| `reference-unresolved` | G | A citation names no written record or shared provision of the installed release. |
| `link-unresolved` | G | A Markdown link on a record page resolves to no file. |
| `owner-unknown` | G | A record names an owner or decider the owners list does not hold, or an owner no team owning its path claims. |
| `draft-without-decider` | G | A draft names no decider or no decide-by date. |
| `draft-gate` | G | An approved record rests on a draft decision. |
| `product-not-singleton` | G | The project holds no single product record. |
| `size-type-missing` | G | The size requires a type the project lacks. |
| `requirement-unfulfilled` | G | A requirement is fulfilled by no rule, use case or journey. |
| `requirement-unmeasured` | G | A measured requirement names no check, or its check has no passing run. |
| `decision-decides-nothing` | G | A decision names nothing it decides. |
| `journey-reach` | G | A public use case sits in no journey and names no background caller. It runs at large size only. |
| `state-unreachable` | G | A state is reached by no transition. |
| `transition-unresolved` | G | A transition names a missing state or use case. |
| `use-case-without-success` | G | A use case ends with no success result. |
| `scenario-result-unresolved` | G | A scenario ends in a result outside its own use case and outside the derived results. |
| `calculation-without-table` | G | A calculation rule has no scenario examples table. |
| `rule-name-negation` | G | A rule statement negates what its name does not keep. |
| `known-gap-expired` | G | A known gap passed its end date with its check still red. |
| `gap-unknown-check` | G | A known gap names a check that no check uses. |
| `aggregate-name-clash` | G | Two aggregates share one name across the project. |
| `use-case-name-clash` | G | Two use cases share one name across the project. |
| `reaction-trigger-unresolved` | G | A reaction names a trigger no domain event or integration event carries. |
| `erasure-undeclared` | G | A personal or sensitive field stands outside a declared erasure position. |
| `record-orphaned` | G | A Behavior record names neither `serves` nor `fulfills`. |
| `step-unserved` | G | A journey step is served by no use case or reaction. |
| `effect-loop` | G | The effect graph cycles outside a domain event with a stated end condition. |
| `consistency-unexplained` | G | An atomic use case changing more than one aggregate names no `because` rule. |
| `query-output-missing` | G | A query declares no `output`. |
| `paging-undeclared` | G | A collection query declares no `paging`. |
| `widening-unjustified` | G | A query group visible beyond its sources names no `wideningBecause` requirement. |
| `retention-without-enforcement` | G | A data class names no `enforcedBy`. |
| `risk-without-acceptance` | G | A retained or exempt personal data class names no `acceptedBy` in Intent. |
| `exemption-expired` | G | An erasure exemption passed its `reviewBy` date. |
| `setting-default-without-requirement` | G | A commercial, legal, or tenant-varying default fulfills no requirement. |
| `reservation-without-release` | G | A reservation rule names no `releasedBy`. |
| `notification-without-sender` | G | A notification is sent by no reaction or use case. |
| `except-without-fallback` | G | An `except` names no fallback requirement, or the fallback carries its own `except`. |
| `approval-reopened` | G | A semantic hash differs from the recorded `approvedHash`. |
| `transcribed-reviewed` | G | A transcribed record is reviewed while its parent is unapproved. |
| `transcribed-after-adoption` | G | A transcribed record remains after the adoption decision is approved. |
| `operator-job-without-guard` | G | An operator job states no `guard`. |
| `schedule-unstructured` | G | A job schedule is neither an `every` duration nor a `cron` expression. |
| `behavior-unrecorded` | S | A handler, endpoint, reaction, domain event, or refusal code in code is named by no record. The remedy reads: delete the code, or write its parent record from a requirement, drafting the requirement if none exists. |
| `use-case-unimplemented` | S | No code implements the use case and no known gap covers it. |
| `use-case-access` | S | The code runs beyond the access grant the use case declares. |
| `refusal-not-thrown` | S | A refusal result names a code the code never throws. |
| `proves-unconfirmed` | S | No proving step of a claimed scenario reaches its use case, or no assertion matches its refusal. |
| `use-case-without-scenario` | S | A use case has no scenario. It runs at large size only. |
| `write-undeclared` | S | The code writes an aggregate outside `changes`. |
| `result-undeclared` | S | The code returns an outcome no result declares. |
| `effect-undeclared` | S | The code takes an edge no record declares. |
| `prose-missing` | A | A use case needing Goal and What Happens prose carries none. |
| `many-aggregates` | A | One command saves more than one atomic write group. |
| `question-aged` | A | A question stands past its `decideBy` date. |

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
| `--intent` | off | Only `diff` reads it. Shows the Intent changes in product words. |
| `--behavior` | off | Only `diff` reads it. Shows the Behavior changes and the security queue. |
| `--fail-on breaking` | off | Only `diff` reads it. Exits 1 when the change breaks approved intent. |
| `--breaking-only` | off | Only `diff` reads it. Shows the breaking changes and hides the rest. |
| `--help` | off | Prints the usage text and exits 0. |

## Exit Codes

| Code | Meaning |
|:---|:---|
| `0` | The command finished with no open blocking finding. |
| `1` | `check` found an open blocking finding or an expired known gap, `query` found no record with the `id`, `diff` with `--fail-on breaking` found a breaking change, or the run failed. |
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

Record the founder approving two requirements:

```bash
litespec model approve --root ../consumer requirement/buyers.guest-checkout requirement/buyers.all-in-first-price --by "NightHall founder"
```

Diff the working tree against the main branch:

```bash
litespec model diff main --root ../consumer
```

Show the Intent changes in product words for the founder review:

```bash
litespec model diff main --root ../consumer --intent
```

Show the Behavior changes with the security queue for the developer review:

```bash
litespec model diff main --root ../consumer --behavior
```

Show only the breaking changes as a pull request comment, and fail on them:

```bash
litespec model diff main --root ../consumer --format markdown --breaking-only --fail-on breaking
```

## Underneath

The builder reads `paths`, `shape`, and `stacks` from the consumer's `litespec.project.json`. It reads shared provisions from the release the tool carries, the record owners from the CODEOWNERS file at `.github/CODEOWNERS`, `CODEOWNERS`, or `docs/CODEOWNERS`, and the test run from TRX or JUnit XML files under `paths.testResults`. A git diff base is read through an archive into a temporary folder, which is removed after the diff. Nothing beneath it is separately runnable.
