# How LiteSpec Works

## Intent

This page follows one use case from its written record to its code and back, to show how LiteSpec's parts fit together. The example is a small library system, the same one the model builder's own tests use.

## The parts

LiteSpec has four parts. Each one answers a different question.

| Part | What it is | The question it answers |
|:---|:---|:---|
| The standard | The pages under `docs/` in the LiteSpec repository, pinned at a release | How do we build? |
| Records | Short Markdown pages in your project, each with a small JSON header | What do we build, and why? |
| The model | A file the `litespec model` command computes from your records and code | Does what we built match what we wrote? |
| The tools | The `litespec` command line | Is everything consistent, and what's missing? |

Your project pins one LiteSpec release, usually as a Git submodule at `litespec/`. The release never changes under you: when you want a newer one, you move the pin.

The diagram below shows how the four parts connect in a loop, with the checks sending their findings back to the records.

![The standard governs the records, the records are implemented by code and tests, the build reads code into the model, and the checks send findings back to the records.](../assets/diagrams/learn-how-it-works.svg)

## A use case, end to end

Say a library lets readers borrow copies of books. In LiteSpec, that operation is a **use case**, and it has a record.

### 1. You write the record

The record lives in your project at `docs/domain/modules/lending/loans/borrow-copy.md`. Its JSON header says what the use case is, who owns it, and how it connects to other records:

```json
{
  "type": "use-case",
  "id": "use-case/lending.borrow-copy",
  "title": "Borrow copy",
  "owner": "lending-team",
  "status": "approved",
  "operation": "command",
  "needs": ["permission/borrow-copy"],
  "reachedThrough": ["entry-point/library-app"],
  "raises": ["event/loan.loan-borrowed"],
  "fulfills": ["requirement/borrowing.max-active-loans"],
  "results": ["result/borrow-copy.borrowed", "result/borrow-copy.copy-unavailable"]
}
```

Read it as a set of facts: borrowing a copy is a command; it needs the `borrow-copy` permission; readers reach it through the library app; it raises a `loan-borrowed` event; it exists to satisfy a requirement about how many active loans a reader may have; and it ends in one of two results. The body of the page says the rest in plain words: "A reader borrows an available copy."

Each result is a record too. The refusal names the HTTP status and the stable failure code the API returns:

```json
{
  "type": "result",
  "id": "result/borrow-copy.copy-unavailable",
  "outcome": "refusal",
  "code": "failure/lending.copy_not_available",
  "httpStatus": 409,
  "meaning": "The copy is unavailable."
}
```

The record's `status` is `approved`, so the owner has agreed to it. An agent builds approved records and doesn't invent the parts a draft leaves open.

The use case page also carries a case, a small example that proves one ending:

```json
{
  "type": "case",
  "id": "case/borrow-copy.borrowing-an-available-copy-succeeds",
  "situation": "A copy sits available on its shelf.",
  "action": "The reader borrows the copy.",
  "result": "result/borrow-copy.borrowed",
  "expect": "The loan is active."
}
```

Read it as one proven path: when the situation holds and the reader acts, the use case reaches the `borrowed` result, and the loan is active. Each case names exactly one result, so a later acceptance test knows which ending it proves.

### 2. You build it to the standard

The standard says where the code goes and what shape it takes. A use case is implemented by one command handler in the Application project, in a folder that mirrors the record's module and business record:

```text
apps/api/src/Library.Application/Lending/Loans/BorrowCopy/BorrowCopyCommandHandler.cs
```

The handler refuses an unavailable copy with the failure code the result record names. Because every project follows the same layout, any developer or agent knows where to look, and the model builder can find the handler without being told.

### 3. The model connects the two

Run the model builder from the project root:

```bash
litespec model build
```

It reads every record, the C# code, the frontend routes, and the test results, and writes `.model/model.json`. For the library example it reports:

```text
.model/model.json: 76 records, 7 handlers, 1 screens, 9 scenarios.
```

Then ask about one record:

```bash
litespec model query use-case/lending.borrow-copy
```

Alongside the record's own fields, the answer holds what the builder worked out from the code:

```json
"computed": {
  "implemented": true,
  "verified": false,
  "implements": [
    "apps/api/src/Library.Application/Lending/Loans/BorrowCopy/BorrowCopyCommandHandler.cs"
  ],
  "calls": [],
  "proves": [
    {
      "scenario": "Borrowing_an_available_copy_succeeds",
      "kase": "case/borrow-copy.borrowing-an-available-copy-succeeds",
      "confirmed": true,
      "passing": null
    }
  ]
}
```

The use case is implemented: the builder found its handler. One acceptance scenario claims its case, and the claim checks out because the scenario's `when` step belongs to the `BorrowCopySteps` class, so `proves` names `Borrowing_an_available_copy_succeeds` as confirmed. It still isn't verified: no test run exists yet, so `passing` is null. Nobody had to maintain those links by hand, and they can't go stale, because they're computed again on every build.

### 4. The checks report what's missing

`litespec model check` turns gaps into findings, such as a use case with no handler, a result the code never returns, a link to a record that doesn't exist, or a requirement nothing fulfills. `litespec consumer` checks your project file and every record's header. Both run in CI, so a gap shows up in the pull request that introduced it.

For example, if the borrow-copy page named no success result, `litespec model check` reports `use-case-without-success` against `docs/domain/modules/lending/loans/borrow-copy.md`, and the pull request fails until the record names one.

## Where the rules come from

Every rule in the standard has an ID made of its page and its heading. For example, the rule that a handler implements exactly one use case is `litespec/core/system#keep-use-cases-and-handlers-in-one-to-one-correspondence`, on the [system page](../core/system.md). A review comment, an agent's report, or a project exception can cite that ID, and everyone knows exactly which rule is meant.

## Next

[Read the standard](reading-the-standard.md) explains how the standard is organized and how to find the rules that apply to your project.
