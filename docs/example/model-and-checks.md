# The Model and Its Checks

## Intent

The project model is the computed join between a project's written records and its code, screens, and tests: it proves they agree, and its checks report every gap as a finding with a tier. This page shows that model at work on the Claimwick product, the example product these pages follow, with real output from `litespec model build`, `check`, and `query`: how a known gap (a missing piece the team accepts until an end date) covers the still-missing handler for Export expenses, what the check reports when the Approve expense handler is removed, how the book renders the journey chapter and the ballots, what the diffs show, and which continuous integration jobs run these checks.

## Building the Model

`litespec model build` reads the written records, follows the code anchors, the routes, the tests, and the latest test run, and writes `model.json` with every record and its resolved links. [Model Builder](../tools/model.md) states the five subcommands, and [Project Model](../core/model.md) states the records they read. The run below is against the Claimwick example:

```text
.model/model.json: 104 records, 9 handlers, 1 screen, 12 scenarios.
```

The counts name what the builder found: 104 records, 9 handlers, 1 screen, and 12 scenario tests. The 104 records are the page records, the entries on those pages, and the 4 glossary terms. The 12 tests prove 11 of the 12 scenarios: Submit expense is proved twice, once by its acceptance scenario and once by its integration test. The file also adds the computed `implements`, `calls`, and `proves` links, and the computed `implemented`, `verified`, `stale`, and `reachable` state of each record. Implemented and verified come from the builder, never from handwriting, per `litespec/core/model#compute-proof-statuses-in-the-builder`: a use case reads implemented when its handler exists, so deleting a handler flips the state on the next run with no record edit.

## Checking the Model

`litespec model check` builds the model in memory and reports every finding with its tier, code, message, path, and line. Against the unchanged example it reports this, and exits zero:

```text
docs/behavior/modules/spending/expenses/export-expenses.md:3 [S known use-case-unimplemented] Use case 'use-case/spending.export-expenses' has no handler.
0 open findings, 1 known.
```

The Export expenses use case has no handler, so the `use-case-unimplemented` check fires at tier S, through the stack reader. A finding that an open known gap covers is reported as known and exits zero, so the line carries the `known` marker and the summary counts `0 open findings, 1 known`.

## The Known Gap for Export Expenses

The team accepts that exporting expenses has no handler yet, so the gap lives as a known gap with an owner and an end date, per `litespec/core/model#record-accepted-gaps-as-known-gaps`. The record sits at `docs/known-gaps/export-expenses-unimplemented.md`, and the use case it covers waits for its handler at `docs/behavior/modules/spending/expenses/export-expenses.md`. The known-gap record reads:

```json
{
  "type": "known-gap",
  "id": "known-gap/export-expenses-unimplemented",
  "title": "Export Expenses Unimplemented",
  "owner": "claimwick-team",
  "status": "approved",
  "check": "use-case-unimplemented",
  "subject": ["use-case/spending.export-expenses"],
  "endsBy": "2027-06-01",
  "reason": "Export waits for the finance file format."
}
```

The gap covers the finding because its `check` equals the finding code and its `subject` lists the finding record. The page body holds one Exit section: the gap closes when the finance file format lands and the export use case gains its handler. The check reports without failing until 2027-06-01, and the expenses team answers for closing the gap. An expired known gap fails the check, so the date keeps the missing work visible instead of letting it sit unowned.

## The Run with the Approve Expense Handler Removed

Removing `apps/api/src/Claimwick.Application/Spending/Expenses/ApproveExpense/ApproveExpenseCommandHandler.cs` and running the check again gives one open finding:

```text
docs/behavior/modules/spending/expenses/approve-expense.md:3 [S use-case-unimplemented] Use case 'use-case/spending.approve-expense' has no handler.
docs/behavior/modules/spending/expenses/export-expenses.md:3 [S known use-case-unimplemented] Use case 'use-case/spending.export-expenses' has no handler.
1 open findings, 1 known.
exit 1
```

The finding says no code implements the Approve expense use case. The fix is to restore the handler at its path under `Claimwick.Application/Spending/Expenses/ApproveExpense/`, which the computed `implemented` state then picks up on the next run. The Export expenses line stays known, because its gap still covers it. The run exits 1, because one open finding remains.

## Querying One Record

`litespec model query` prints one record with its links in both directions, and agents use it to load a record's context. Querying the Expense aggregate returns its states, data classes, rules, and events:

```json
{
  "type": "aggregate",
  "id": "aggregate/spending.expense",
  "title": "Expense",
  "owner": "claimwick-team",
  "status": "reviewed",
  "file": "docs/behavior/modules/spending/expenses/README.md",
  "line": 3,
  "fields": {
    "type": "aggregate",
    "id": "aggregate/spending.expense",
    ...
    "states": [
      {
        "name": "Submitted",
        "meaning": "The expense waits for a decision."
      },
      ...
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
  "title": "Submit Expense",
  ...
  "computed": {
    "implemented": true,
    "verified": false,
    "implements": [
      "apps/api/src/Claimwick.Application/Spending/Expenses/SubmitExpense/SubmitExpenseCommandHandler.cs"
    ],
    "calls": [],
    "proves": [
      {
        "scenario": "Submitting_with_a_receipt_succeedsAsync",
        "claim": "scenario/submit-expense.submitting-with-a-receipt-succeeds",
        "confirmed": true,
        "passing": null
      },
      ...
    ]
  }
}
```

The record reads `implemented` because its handler exists, and `proves` names the scenario test that confirms its scenario. Both excerpts above shorten the full output with `...`; the run files carry the complete text.

## The Consumer Check

`litespec consumer` checks the project configuration, the page frontmatter, and the language of a consumer repository, per [Validate Consumer](../tools/consumer.md). Against the Claimwick example it reports this, and exits zero:

```text
Consumer: D:\Personal-Projects\LiteSpec\examples\expenses
Files scanned: 44 under docs, frontmatter pages: 44
Glossary: 0 mannered term(s), 0 rejected synonym(s), documentation only

PASS: project configuration, page frontmatter and glossary are valid.
```

The run scanned 44 pages under `docs` and passed: no mannered term, no rejected synonym.

## The Book Chapter

`litespec book` renders each journey as one chapter for product readers: the goal, the observable end, the steps as sentences, the requirements with their exceptions and fallbacks inline, one line of serving use case goal per step, the Then clauses as context, a consequences box as context, and the open questions. Field names never render literally. The submit-and-reimburse chapter reads:

```text
Submit and Reimburse

An employee submits an expense and receives reimbursement.

Finished when: the employee holds the reimbursement, and the expense
record shows every step.

1. The employee submits the expense with its receipt.
2. The manager approves the expense within five days.
3. Finance reimburses the approved expense.
4. The employee sees the reimbursement land.
If it goes wrong: past three days the manager gets a reminder;
past five the wait is reported.

Promises
- Each submitted expense is decided within five business days.
    Except during the year-end close. Then each submitted expense
    is decided within ten business days.
- An expense above the receipt threshold carries a receipt.
- Nobody approves their own expense.
- An approved expense is reimbursed at most once.

Consequences (context, not part of what you approve)
- New refusal an employee can meet: "The expense is above the
  receipt threshold and carries no receipt."
- Personal data kept: the submitting employee link, erased on
  approved request.

Open questions (ballot "erasure-terms", due 2026-04-01)
1. May finance keep anonymized totals after erasure?
   Recommended: yes, totals without employee links.
```

The book also writes a ballots page listing every open question grouped by ballot, tier 1 first, with each recommendation and auto-approval date. The founder approves or answers in the ballot without opening a Behavior page.

## The Diffs

`litespec model diff <base> --intent` shows Intent changes in product words for the founder, and `--behavior` shows Behavior changes with the security queue for developers. Without a flag, it shows both. Say the team raises the receipt threshold default from 25 to 50 EUR. The intent diff reads:

```text
MODIFIED requirement/approval.receipt-over-threshold
  Statement: "An expense above the receipt threshold carries a receipt."
  The default moved from EUR 25 to EUR 50 by decision/0001-receipt-threshold.
```

And the behavior diff reads:

```text
MODIFIED setting/spending.receipt-threshold
  Default: EUR 25 -> EUR 50.
MODIFIED scenario/submit-expense.submitting-above-threshold-without-a-receipt-is-refused
  Given now exceeds EUR 50.

Security queue: no access widenings, no new outside calls, no new personal-data flows.
```

The developer sees which Behavior records the Intent change touched, and the security reviewer sees an empty queue.

## The Continuous Integration Jobs That Run the Checks

[Continuous Integration](../quality/ci.md) names the jobs each pull request runs, and every pull request runs the jobs its changed areas select, per `litespec/quality/ci#run-applicable-gates-on-every-pull-request`. The `model` job runs `litespec model check`, is selected by a record, code, or test change, and runs for small and large projects alike. The `docs` job runs `litespec consumer` on a documentation change to check pages, configuration, language, and prose, with the output shown above. Every pull request also publishes the intent diff and a book preview, per `litespec/quality/ci#publish-the-intent-diff-on-every-pull-request` and `litespec/quality/ci#publish-a-book-preview-for-every-change`, so reviewers read the change in product words. The `release` job reruns every job on the release commit and promotes the artifact that passed.
