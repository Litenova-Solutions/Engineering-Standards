# The Model and Its Checks

## Intent

The project model is the computed join between a project's written records and its code, screens, and tests: it proves they agree, and its checks report every gap as a finding. This page shows that model at work on the Expenses product, the example product these pages follow, with real output from `litespec model build`, `check`, and `query`: how a known gap (a missing piece the team accepts until an end date) covers the still-missing handler for Export expenses, what the check reports when the Approve expense handler is removed, and which continuous integration jobs run these checks. A developer or agent who changes a record, a handler, or a test reads it to see how the model confirms the change, and what to fix when a finding names their use case.

## Building the model

`litespec model build` reads the written records, the code anchors, the routes, the tests, and the latest test run, and writes `model.json` with every record and its resolved links. [Model Builder](../tools/model.md) states the four subcommands, and [Project Model](../core/model.md) states the records they read. The run below was made on 2026-10-21 against the Expenses example:

```text
.model/model.json: 80 records, 7 handlers, 1 screens, 9 scenarios.
```

The counts name what the builder found: 80 records, 7 handlers, 1 screen, and 9 scenarios. The file also adds the computed `implements`, `calls`, and `proves` links, and the computed `implemented` and `verified` state of each use case. Implemented and verified come from the builder, never from handwriting, per `litespec/core/model#read-truth-from-code-screens-and-test-runs`: a use case reads implemented when its handler exists, so deleting a handler flips the state on the next run with no record edit.

## Checking the model

`litespec model check` builds the model in memory and reports every finding with its code, message, path, and line. Against the unchanged example it reports this, and exits zero:

```text
docs/domain/modules/spending/expenses/export-expenses.md:3 [known use-case-unimplemented] Use case 'use-case/spending.export-expenses' has no handler, reaction or job.
0 findings, 1 known.
```

The Export expenses use case has no handler, so the `use-case-unimplemented` check fires. A finding that an open known gap covers is reported as known and exits zero, so the line carries the `known` marker and the summary counts `0 findings, 1 known`.

## The known gap for Export expenses

The team accepts that exporting expenses has no handler yet, so the gap lives as a known gap with an owner and an end date, per `litespec/core/model#record-accepted-gaps-as-known-gaps`. The record sits at `docs/known-gaps/export-expenses-unimplemented.md`, and the use case it covers waits for its handler at `docs/domain/modules/spending/expenses/export-expenses.md`. The known-gap record reads:

```json
{
  "type": "known-gap",
  "id": "known-gap/export-expenses-unimplemented",
  "title": "Export expenses unimplemented",
  "owner": "expenses-team",
  "status": "approved",
  "check": "use-case-unimplemented",
  "subject": ["use-case/spending.export-expenses"],
  "endsBy": "2027-06-01",
  "reason": "Export waits for the finance file format."
}
```

The gap covers the finding because its `check` equals the finding code and its `subject` lists the finding record. The check reports without failing until 2027-06-01, and the expenses team answers for closing the gap. An expired known gap fails the check, so the date keeps the missing work visible instead of letting it sit unowned.

## The run with the Approve expense handler removed

Removing `apps/api/src/Expenses.Application/Spending/Expenses/ApproveExpense/ApproveExpenseCommandHandler.cs` and running the check again gives one open finding:

```text
docs/domain/modules/spending/expenses/approve-expense.md:3 [use-case-unimplemented] Use case 'use-case/spending.approve-expense' has no handler, reaction or job.
docs/domain/modules/spending/expenses/export-expenses.md:3 [known use-case-unimplemented] Use case 'use-case/spending.export-expenses' has no handler, reaction or job.
1 findings, 1 known.
exit 1
```

The finding says no code implements the Approve expense use case. The fix is to restore the handler at its path under `Expenses.Application/Spending/Expenses/ApproveExpense/`, which the computed `implemented` state then picks up on the next run. The Export expenses line stays known, because its gap still covers it. The run exits 1, because one open finding remains.

## Querying one record

`litespec model query` prints one record with its links in both directions, and agents use it to load a record's context. Querying the Expense business record returns its states, rules, and events:

```json
{
  "type": "business-record",
  "id": "business-record/spending.expense",
  "title": "Expense",
  "owner": "expenses-team",
  "status": "approved",
  "file": "docs/domain/modules/spending/expenses/README.md",
  "line": 3,
  "fields": {
    "type": "business-record",
    "id": "business-record/spending.expense",
    ...
    "states": [
      "Submitted",
      "Approved",
      "Rejected",
      "Reimbursed"
    ],
    ...
  },
  ...
}
```

Querying the Submit expense use case adds the computed links the builder derived:

```json
{
  "type": "use-case",
  "id": "use-case/spending.submit-expense",
  "title": "Submit expense",
  ...
  "computed": {
    "implemented": true,
    "verified": false,
    "implements": [
      "apps/api/src/Expenses.Application/Spending/Expenses/SubmitExpense/SubmitExpenseCommandHandler.cs"
    ],
    "calls": [],
    "proves": [
      {
        "scenario": "Submitting_with_a_receipt_succeedsAsync",
        "kase": "case/submit-expense.submitting-with-a-receipt-succeeds",
        "confirmed": true,
        "passing": null
      },
      ...
    ]
  }
}
```

The record reads `implemented` because its handler exists, and `proves` names the scenario that confirms its case. Both excerpts above shorten the full output with `...`; the run files carry the complete text.

## The consumer check

`litespec consumer` checks the project configuration, the page frontmatter, and the language of a consumer repository, per [Validate Consumer](../tools/consumer.md). Against the Expenses example it reports this, and exits zero:

```text
Consumer: D:\Personal-Projects\LiteSpec\examples\expenses
Files scanned: 33 under docs, frontmatter pages: 33
Language: 0 mannered term(s), 0 rejected synonym(s), documentation only

PASS: project configuration, page frontmatter and language are valid.
```

The run scanned 33 pages under `docs` and passed: no mannered term, no rejected synonym.

## The continuous integration jobs that run the checks

[Continuous Integration](../quality/ci.md) names the jobs each pull request runs, and every pull request runs the jobs its changed areas select, per `litespec/quality/ci#run-applicable-gates-on-every-pull-request`. The `model` job runs `litespec model check`, is selected by a record, code, or test change, and runs for small and large projects alike. The `docs` job runs `litespec consumer` on every pull request to check pages, configuration, language, and prose, with the output shown above. The `release` job reruns every job on the release commit and promotes the artifact that passed.
