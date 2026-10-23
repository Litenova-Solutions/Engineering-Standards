# Overview

## Intent

The example pages show LiteSpec applied instead of described, following Claimwick, one small product in which employees submit work expenses with receipts, managers approve or reject them, and finance reimburses the approved ones, from its first Intent record through Behavior, Implementation, and Proof. A record is a short page stating one piece of product intent, and every product fact on these pages comes from the records of the Claimwick product in `examples/claimwick/`, a real LiteSpec project that `litespec consumer`, `litespec ui`, and `litespec model check` pass. The pages carry no rules of their own: each rule lives on the standards page the text cites.

## How to Read the Example

Employees submit work expenses with receipts. Managers approve or reject them, and finance reimburses the approved ones. Its records live under `examples/claimwick/docs/`, with Intent under `docs/intent/` and Behavior under `docs/behavior/`, and the example shows each record as the project writes it, shaped as `schemas/record.schema.json` defines. The pages follow one thread down the layers:

```trail
product        Claimwick: submit, approve, reimburse
  goal         Decided in days
  problem      Expenses wait weeks
    feature    Approval reminders
  research     Approval time benchmarks
  decision     Receipt threshold
  requirement  Approval: five-day decision, receipt over threshold, no self approval, single reimbursement, erasure on request, extended window in close
    journey    Submit and reimburse, in steps s1 to s4 as product sentences
    rule       Receipt required above threshold, and 5 more
    use-case   Submit expense, Send approver reminder, List expenses, and 7 more
      result   Submitted, Receipt missing, and more
        scenario  Submitting with a receipt succeeds
    reaction   Notify on reimbursement
    job        Remind approvers, Erase expired personal data
    notification  Approver reminder, Reimbursement received
    setting    Receipt threshold
--- Intent above is approved by product people; Behavior below is reviewed by developers
Implementation  Aggregate, command, endpoint, screen, tests, each pointing up to its record
Proof         Passing tests, tiered check results, computed statuses, the book
facet Where it lives  spending module > expense aggregate > its rules, events, use cases
facet Who may do it  employee, manager, finance > role at a scope > permission > access grant
facet How it is reached  expenses app, reminder job > payout bank outside
facet What it promises  journey steps > serving use cases > results > proving tests
```

Read the pages in the order below: the product first, then its modules and records, then the use case in code, then the screen, then the model and its checks. The Intent and Behavior pages show the records, the code and screen pages show what the .NET and Svelte stack pages require, and the checks page shows real command output from runs against the example.

## Reading Order

- [The Claimwick Product](the-product.md): the product brief, goal, problem, feature, requirements, research, decision, constraint, and journey records.
- [Modules and Records](modules-and-records.md): the spending module, its aggregates with data classes, rules, access chain, external system, use cases, and the reaction, jobs, notifications, and setting around them.
- [A Use Case in Code](a-use-case-in-code.md): Submit expense from its record into .NET code and tests.
- [The Claimwick Screen](the-screen.md): the expenses list screen, the generated client it reads through, and the UI pattern it starts from.
- [The Model and Its Checks](model-and-checks.md): model build, check, and query runs, the book chapter and ballots, and the CI jobs that run the checks.
