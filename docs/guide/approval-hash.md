# Read the Approval Hash

## Purpose

An approved or reviewed record carries `approvedHash`, the builder hash over its semantic fields, so a later change inside those fields reopens the approval while a change outside them does not. This guide lists which fields feed the hash per record type, states what reopens an approval, and shows how `model approve --dry-run` previews the stamp. Each step names the standard it satisfies, and the guide adds no rule of its own.

## Prerequisites

Start with:

- A consumer from [Start a Consumer Repository](../tutorial/getting-started.md), with at least one approved or reviewed record.
- The model command at the adopted release, run from the consumer root.

Read [Project Model](../core/model.md) before this guide: it states the approval data, and this guide shows which fields the hash covers.

## Procedure

### Know Which Fields Stay Outside

The hash covers every written frontmatter field except identity, workflow, and approval data. These fields stay outside on every record type: `type`, `id`, `title`, `owner`, `status`, `decider`, `decideBy`, `approvedBy`, `approvedOn`, `approvedHash`, and `source`. A term's `labels` stay outside too, so adding a language leaves the approved meaning alone. Page prose bodies and rendered consequences summaries never feed the hash, so rewording prose reopens no approval. The builder canonicalizes the remaining fields and hashes them to eight hex characters. This satisfies `litespec/core/model#record-approval-as-data`.

### Know Which Fields Feed the Hash

The semantic fields per record type are:

| Type | Fields feeding the hash |
|:---|:---|
| `product` | `boundary`, `neverDoes`, `audience` |
| `goal` | `statement`, `measure`, `target`, `by` |
| `problem` | `affects`, `statement` |
| `feature` | `state`, `refusedBecause`, `solves`, `by` |
| `requirement` | `kind`, `statement`, `values`, `measure`, `by`, `except`, `setBy`, `risk` |
| `constraint` | `category`, `applies`, `appliesBecause` |
| `decision` | `options`, `changeWhen`, `decided`, `chosen`, `decides` |
| `research` | `sources`, `question` |
| `journey` | `actor`, `goal`, `finishedWhen`, `steps`, `fulfills` |
| `actor` | `kind` |
| `term` | `term`, `meaning`, `layer`, `aliases` |
| `module` | `dependsOn` |
| `aggregate` | `kind`, `states`, `transitions`, `data`, `dataClasses`, `steps`, `exits`, `finishedWhen`, `driver`, `cursor` |
| `rule` | `kind`, `statement`, `governs`, `refusal`, `releasedBy`, `frozenWhen`, `historyLink`, `computedBy` |
| `use-case` | `kind`, `serves`, `fulfills`, `access`, `reachedThrough`, `input`, `output`, `paging`, `builtAsynchronously`, `changes`, `reads`, `consistency`, `effects`, `raises`, `idempotency`, `audit`, `risk` |
| `result` | `outcome`, `code`, `meaning`, `recorded`, `codes` |
| `scenario` | `given`, `when`, `then`, `result`, `examples` |
| `event` | `meaning`, `carries` |
| `integration-event` | `direction`, `eventType`, `subject`, `payload`, `audience`, `trust`, `correlation`, `translates` |
| `reaction` | `on`, `if`, `effects`, `forEach`, `reads`, `fulfills`, `serves`, `idempotency`, `onFailure`, `onExhausted` |
| `job` | `kind`, `schedule`, `scope`, `batchSize`, `lease`, `effects`, `reads`, `serviceLevel`, `evidence`, `runbook`, `runsWhere`, `guard`, `cursor`, `fulfills`, `serves`, `onFailure`, `idempotency` |
| `notification` | `template`, `audience`, `channel`, `consent`, `frequency`, `dedupKey`, `params`, `locale`, `suppressedWhen`, `claims`, `fulfills`, `sender` |
| `setting` | `valueType`, `default`, `range`, `unit`, `setBy`, `atBound`, `secret`, `meaning`, `runbook`, `fulfills` |
| `role` | `scope`, `allows` |
| `permission` | `meaning` |
| `entry-point` | `kind`, `auth`, `path`, `contentType`, `cacheControl`, `versioning`, `fulfills`, `protocol` |
| `external-system` | `actor`, `operations`, `erasure`, `acceptedBy` |
| `runbook` | `trigger`, `steps` |
| `deviation` | `provision`, `reason`, `reviewBy`, `removeWhen` |
| `known-gap` | `check`, `subject`, `endsBy`, `reason` |

`questions`, `terms`, and `replaces` feed the hash where a record carries them. The excluded fields stay outside on every type, so a constraint's `source`, an integration event's CloudEvents `source`, and an aggregate's `owner` feed no hash. This satisfies `litespec/core/model#record-approval-as-data`.

### Know What Reopens an Approval

Any change inside the hashed fields reopens the approval: a moved statement, a new result, a renamed output, a new rule, a changed step. `litespec model check` reports `approval-reopened` for a record whose semantic hash differs from its `approvedHash`. A change outside the hash, such as a retitled record, a new owner, or reworded prose, reopens nothing. This satisfies `litespec/core/model#record-approval-as-data`.

### Preview Approval with a Dry Run

Run the dry run before stamping, to see which records would be stamped and which would be reopened:

```bash
litespec model approve --all --dry-run
```

Each record with no `approvedHash` prints as one `would be stamped (no approvedHash)` line, and each record whose semantic hash differs prints as one `would be reopened (approvedHash differs)` line. The last line counts both groups. The command writes nothing and exits 1 only when a named id matches no written record. This satisfies `litespec/core/model#record-approval-as-data`.

## Check

- `litespec model approve --all --dry-run` exits `0` and lists every record the next stamp would touch.
- `litespec model check` reports no `approval-reopened` finding after approval.
