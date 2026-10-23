# Overview

## Intent

The example pages show LiteSpec applied instead of described, following Claimwick, one small product in which employees submit work expenses with receipts, managers approve or reject them, and finance reimburses the approved ones, from its first written record to the check that confirms the code matches it. A record is a short page stating one piece of product intent, and every product fact on these pages comes from the records of the Claimwick product in `examples/claimwick/`, a real LiteSpec project that `litespec consumer`, `litespec ui`, and `litespec model check` pass. The pages carry no rules of their own: each rule lives on the standards page the text cites.

## How to Read the Example

Employees submit work expenses with receipts. Managers approve or reject them, and finance reimburses the approved ones. Its records live under `examples/claimwick/docs/`, and the example shows each record as the project writes it, shaped as `schemas/record.schema.json` defines. The pages follow one thread down the specification tree, and each page opens with its slice of it:

```text
PRODUCT  Claimwick: submit, approve, reimburse
|
+-- goal            Decided in days
+-- problem         Expenses wait weeks
|     feature       Approval reminders
+-- research        Approval time benchmarks
+-- decision        Receipt threshold
|
+-- REQUIREMENT     Approval: five-day decision, receipt over threshold,
|                   no self approval, single reimbursement
|     |
|     +-- journey   Submit and reimburse
|     +-- rule      Receipt required above threshold, and 6 more
|     +-- USE CASE  Submit expense, Remind approvers, List expenses, and 7 more
|           +-- result    Submitted, Receipt missing, ...
|                 +-- scenario  Submitting with a receipt succeeds  <- the review line
|
WHERE IT LIVES  spending module > expense aggregate > its rules, events, use cases
WHO MAY DO IT   employee, manager, finance > role at a scope > permission
HOW IT IS REACHED  expenses app, reminder job; payout bank outside
```

Read the pages in the order below: the product first, then its modules and records, then the use case in code, then the screen, then the model and its checks. The code and screen pages show what the .NET and Svelte stack pages require, and the checks page shows real command output from runs against the example.

## Reading Order

- [The Claimwick Product](the-product.md): the product brief, goal, problem, feature, requirements, research, decision, constraint, and journey records.
- [Modules and Records](modules-and-records.md): the spending module, its aggregates with transitions and data, rules, access chain, external system, and the Submit expense, Remind approvers, and List expenses use cases.
- [A Use Case in Code](a-use-case-in-code.md): Submit expense from its record into .NET code and tests.
- [The Claimwick Screen](the-screen.md): the expenses list screen, the generated client it reads through, and the UI pattern it starts from.
- [The Model and Its Checks](model-and-checks.md): model build, check, and query runs, the known gap, and the CI jobs that run the checks.
