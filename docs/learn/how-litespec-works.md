# How LiteSpec Works

## Intent

LiteSpec connects what a team writes down about a product with the code that implements it, and checks that the two still agree. This page shows that connection on Expenses, the example product in `examples/expenses/` where employees submit work expenses with receipts, following the Submit expense use case from its written record to the code that implements it and the check that confirms they match.

## The parts

LiteSpec has four parts. Each one answers a different question.

| Part | What it is | The question it answers |
|:---|:---|:---|
| The standard | The pages under `docs/` in the LiteSpec repository, pinned at a release | How do we build? |
| Records | Short Markdown pages in your project, each with a small JSON header | What do we build, and why? |
| The model | A file the `litespec model` command computes from your records and code | Does what we built match what we wrote? |
| The tools | The `litespec` command line | Is everything consistent, and what is missing? |

Your project pins one LiteSpec release, usually as a Git submodule at `litespec/`. The pinned release never changes under you. When you want a newer one, you move the pin.

The diagram below shows how the four parts connect in a loop, with the checks sending their findings back to the records.

![The standard governs the records, the records are implemented by code and tests, the build reads code into the model, and the checks send findings back to the records.](../assets/diagrams/learn-how-it-works.svg)

## A use case from record to code

Expenses lets employees submit work expenses with receipts. In LiteSpec, that operation is a use case: one command or query with its permissions, results, and cases.

### 1. The written record

The record lives in the project at `docs/domain/modules/spending/expenses/submit-expense.md`. Its JSON header states what the use case is, who owns it, and how it connects to other records:

```json
{
  "type": "use-case",
  "id": "use-case/spending.submit-expense",
  "title": "Submit expense",
  "owner": "expenses-team",
  "status": "approved",
  "operation": "command",
  "needs": ["permission/submit-expense"],
  "reachedThrough": ["entry-point/expenses-app"],
  "raises": ["event/expense.expense-submitted"],
  "fulfills": ["requirement/approval.receipt-over-threshold"]
}
```

Read it as a set of facts: submitting an expense is a command, a message that changes business state; it needs the `submit-expense` permission, one allowed action from the shared list; employees reach it through the expenses app; it raises an `expense-submitted` event, one statement that the submission completed; and it exists to satisfy a requirement that an expense above the receipt threshold carries a receipt. The body of the page says the rest in plain words: "An employee submits a work expense."

Each result is a record too: one way the use case ends. The refusal names the HTTP status and the stable failure code the API returns:

```json
{
  "type": "result",
  "id": "result/submit-expense.receipt-missing",
  "outcome": "refusal",
  "code": "failure/spending.receipt_missing",
  "httpStatus": 422,
  "meaning": "The expense is above the receipt threshold and carries no receipt."
}
```

The record's `status` is `approved`, so the owner has agreed to it. An agent builds approved records and does not invent the parts a draft leaves open.

The use case page also carries a case: one worked example that leads from a situation to one named result.

```json
{
  "type": "case",
  "id": "case/submit-expense.submitting-with-a-receipt-succeeds",
  "situation": "An employee paid for a train ticket and kept the receipt.",
  "action": "The employee submits the expense with the receipt.",
  "result": "result/submit-expense.submitted",
  "expect": "The expense is submitted."
}
```

Read it as one proven path: when the situation holds and the employee acts, the use case reaches the `submitted` result, and the expense is submitted. Each case names exactly one result, so a later acceptance test knows which ending it proves.

### 2. The implementation

The standard states where the code goes and what shape it takes. A use case is implemented by one command handler in the Application project, in a folder that mirrors the record's module and business record:

```text
apps/api/src/Expenses.Application/Spending/Expenses/SubmitExpense/SubmitExpenseCommandHandler.cs
```

The handler refuses an expense above the threshold that carries no receipt with the failure code the result record names. Because every project follows the same layout, any developer or agent knows where to look, and the model builder can find the handler without being told.

### 3. The computed links

Run the model builder from the project root:

```bash
litespec model build
```

It reads every record, the C# code, the frontend routes, and the test results, and writes `.model/model.json`. For the Expenses example it reports:

```text
.model/model.json: 80 records, 7 handlers, 1 screens, 9 scenarios.
```

Then ask about one record:

```bash
litespec model query use-case/spending.submit-expense
```

Alongside the record's own fields, the answer holds what the builder worked out from the code:

```json
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
    {
      "scenario": "An_expense_is_submitted_through_a_helper_of_the_worldAsync",
      "kase": "case/submit-expense.submitting-with-a-receipt-succeeds",
      "confirmed": true,
      "passing": null
    }
  ]
}
```

The use case is implemented: the builder found its handler. Two scenarios claim its case: the acceptance scenario `Submitting_with_a_receipt_succeedsAsync`, whose `when` step belongs to the `SubmitExpenseSteps` class, and an integration test through a helper. Both claims check out, so each entry reads `confirmed`. The use case is still not verified: no test run exists yet, so `passing` is null. Nobody maintains those links by hand, and they cannot go stale, because the builder computes them again on every build.

### 4. The reported gaps

`litespec model check` turns gaps into findings: a use case with no handler, a result the code never returns, a link to a record that does not exist, or a requirement nothing fulfills. `litespec consumer` checks the project file and every record's header. Both run in CI, so a gap shows up in the pull request that introduced it.

For example, if the submit-expense page named no success result, `litespec model check` reports `use-case-without-success` against `docs/domain/modules/spending/expenses/submit-expense.md`, and the pull request fails until the record names one.

## The provision identifier

Every rule in the standard is a provision: one identified block with one assertion. Its ID joins its page and its heading. For example, the rule that a handler implements exactly one use case is `litespec/core/system#keep-use-cases-and-handlers-in-one-to-one-correspondence`, on the [system page](../core/system.md). A review comment, an agent's report, or a project exception can cite that ID, and everyone knows exactly which rule is meant.

## Next

[Read the standard](reading-the-standard.md) explains how the standard is organized and how to find the rules that apply to your project.
