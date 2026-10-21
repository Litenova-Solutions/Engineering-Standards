# Overview

## Intent

The example pages show LiteSpec applied instead of described, following Expenses, one small product in which employees submit work expenses with receipts, managers approve or reject them, and finance reimburses the approved ones, from its first written record to the check that confirms the code matches it. A record is a short page stating one piece of product intent, and every product fact on these pages comes from the records of the Expenses product in `examples/expenses/`, a real LiteSpec project that `litespec consumer`, `litespec ui`, and `litespec model check` pass. The pages carry no rules of their own: each rule lives on the standards page the text cites. Agents open these pages for the worked shape of records, code, screens, and checks.

## How to read the example

Employees submit work expenses with receipts. Managers approve or reject them, and finance reimburses the approved ones. Its records live under `examples/expenses/docs/`, and the example shows each record as the project writes it, shaped as `schemas/record.schema.json` defines. Read the pages in the order below: the product first, then its modules and records, then the use case in code, then the screen, then the model and its checks. The code and screen pages show what the .NET and Svelte stack pages require, and the checks page shows real command output from runs against the example.

## Reading order

- [The Expenses Product](the-product.md): the product brief, problem, requirements, decision, and constraint records.
- [Modules and Records](modules-and-records.md): the spending module, its records, rules, access chain, and the Submit expense use case.
- [A Use Case in Code](a-use-case-in-code.md): Submit expense from its record into .NET code and tests.
- [The Expenses Screen](the-screen.md): the expenses list screen, the generated client it reads through, and the UI pattern it starts from.
- [The Model and Its Checks](model-and-checks.md): model build, check, and query runs, the known gap, and the CI jobs that run the checks.
