# Model a Domain Module

## Purpose

A domain module gathers one business area's language, business records, rules, use cases, events, and permissions into pages that the model builder, the tool that checks the project, reads. This tutorial works through one kind of page at a time, using the spending module of the Expenses product as the worked example. Each step names the standard it satisfies, and the tutorial adds no rule of its own.

## Prerequisites

- Finish [Start a consumer repository](getting-started.md) through its configuration steps.
- Read the product brief and the requirements this module fulfills.
- Read the decisions that constrain identity, persistence, security, or external behavior.
- Copy the `module.md`, `business-record.md`, and `use-case.md` templates from the [template index](../../templates/consumer/README.md).

## Lesson

1. Name the module language: write one Term entry per word with its meaning, its labels, and the words it rejects. Use the same term in documentation, domain types, application operations, API descriptions, and frontend features. This satisfies `litespec/backend/domain#use-one-ubiquitous-language`.

    | Term | Meaning | Rejected words |
    |:---|:---|:---|
    | `term/expense` | One work cost an employee submitted for approval | Voucher |
    | `term/receipt` | Proof of payment attached to an expense | Docket |
    | `term/policy` | The company spending policy and its receipt threshold | None |
    | `term/approver` | The manager who decides a submitted expense | None |

    Rejected words stop a later contributor from creating `Voucher` beside `Expense`. They also tell an agent which plausible names are wrong for this domain.

2. Write the occasion before the rules. Name one occasion the module exists for: who acts, what surrounds them, and what they use today instead. Record it in the module page, and reuse its people and figures on every page beneath it. This satisfies `litespec/core/system#state-one-occasion-for-every-behavior-record` and `litespec/core/system#keep-a-scenario-informative`.

    Month end brings every team's expenses at once: employees paid work costs from their own pockets and wait weeks for a decision, chasing managers by email. Without an expense record, finance reconstructs who spent what from forwarded receipts and memory.

3. Write the module record. Give the module a person-chosen identifier such as `module/spending`. Name each module it depends on, or remove the dependency field when the module stands alone. Spending depends on no other module, so its dependency list stays empty. This satisfies `litespec/core/system#group-language-and-use-cases-by-module`.
4. Draw business record boundaries from invariants. A business record is a consistency boundary: state that must stay valid together in one command. An invariant is a condition that holds before and after every successful change. This satisfies `litespec/backend/domain#treat-aggregates-as-consistency-boundaries` and `litespec/backend/domain#keep-child-entities-inside-the-aggregate-boundary`.

    | Business record | Owns | References by typed ID |
    |:---|:---|:---|
    | `business-record/spending.expense` | Expense lifecycle, total, reimbursement facts | `ReceiptId`, `EmployeeId` |
    | `business-record/spending.receipt` | Receipt attachment and removal | `ExpenseId` |
    | `business-record/spending.policy` | Receipt threshold | None |

    A record owns a child when the child has no independent boundary and changes only through the record. Reference another record by typed ID when it changes on its own. Do not place `Employee` inside `Expense` for convenient navigation. This satisfies `litespec/backend/domain#reference-other-aggregates-by-id`.
5. Define every state. A state is a business-valid condition with its required data and permitted behavior. Describe states before writing transitions. This satisfies `litespec/backend/domain#model-every-aggregate-lifecycle-with-state-types`.

    | State | Meaning | Required facts |
    |:---|:---|:---|
    | `Submitted` | The expense awaits a decision | None |
    | `Approved` | The manager approved the expense | Approver, decision date |
    | `Rejected` | The manager rejected the expense | Approver, decision date, reason |
    | `Reimbursed` | Finance reimbursed the expense | Reimbursement date |

    Create an abstract state record and one sealed record per state. Put state-specific data on the state record. This satisfies `litespec/backend/dotnet/domain#model-every-aggregate-lifecycle-with-state-records`.

    ```csharp
    public abstract record ExpenseState;

    public sealed record ExpenseSubmittedState : ExpenseState;

    public sealed record ExpenseApprovedState(Guid ApprovedBy, DateTimeOffset DecidedAt) : ExpenseState;

    public sealed record ExpenseRejectedState(Guid RejectedBy, DateTimeOffset DecidedAt, string Reason) : ExpenseState;

    public sealed record ExpenseReimbursedState(DateTimeOffset ReimbursedAt) : ExpenseState;
    ```

    For each state, answer what makes it true, which data it alone requires, and which actions it allows and rejects. An unanswered question stays on the page. It receives no guessed default.
6. Write the rules with kinds. Give each rule a person-chosen identifier of one to six lowercase words. A statement with `not`, `no`, `never`, or `cannot` keeps that word in its name. This satisfies `litespec/core/system#state-each-rule-with-its-kind`.

    | Rule | Kind | Enforced by | Statement | Refusal |
    |:---|:---|:---|:---|:---|
    | `rule/expense.receipt-required-above-threshold` | `checked-before` | `validator` | An expense above the policy threshold needs a receipt. | `result/submit-expense.receipt-missing` |
    | `rule/expense.approver-is-not-submitter` | `checked-before` | `aggregate` | An approver is not the submitter. | `result/approve-expense.own-expense` |
    | `rule/expense.reimbursed-once` | `always-true` | `aggregate` | An expense is reimbursed at most once. | `result/reimburse-expense.already-reimbursed` |

    An `always-true` rule holds after every change to its record. A `checked-before` rule rejects caller-correctable input before domain work starts. An `across-records` rule spans records that one transaction cannot hold. Input shape stays in the validator; current record state stays in the record. This satisfies `litespec/backend/application#separate-input-validation-from-invariants`.
7. Name the people and their permissions. Write one actor page per party and one role page per grantable set. Name the permission each use case needs. This satisfies `litespec/backend/application#enforce-target-authorization-in-the-pipeline`.

    | Actor | Role | Permission |
    |:---|:---|:---|
    | `actor/employee` | `role/employee` at self scope | `permission/submit-expense` |
    | `actor/manager` | `role/approver` at team scope | `permission/approve-expense` |
    | `actor/finance` | `role/finance` at platform scope | `permission/reimburse-expense` |

8. Write the use cases. Give each use case a name that is unique across the project, so its results and cases resolve. Name the operation, the needed permissions, the entry points, the raised events, and the fulfilled requirements. This satisfies `litespec/backend/application#use-this-operation-layout` and `litespec/backend/application#keep-command-handlers-narrow`.

    | Use case | Operation | Needs | Raises |
    |:---|:---|:---|:---|
    | `use-case/spending.submit-expense` | `command` | `permission/submit-expense` | `event/expense.expense-submitted` |
    | `use-case/spending.reimburse-expense` | `command` | `permission/reimburse-expense` | `event/expense.expense-reimbursed` |
    | `use-case/spending.list-expenses` | `query` | `permission/list-expenses` | None |

    A query states no domain transition and names its read model. It loads no business record for presentation.
9. Write one result per ending. A result is one way a use case ends: `success`, or a named `refusal` with its failure code. This satisfies `litespec/backend/application#model-expected-use-case-failures-explicitly` and `litespec/backend/api#use-consistent-status-codes`.

    | Result | Outcome | Code | Status |
    |:---|:---|:---|:---|
    | `result/submit-expense.submitted` | `success` | None | 201 |
    | `result/submit-expense.receipt-missing` | `refusal` | `failure/spending.receipt_missing` | 422 |

    Each refusal explains what the caller sees. The failure code is stable across releases.
10. Write the cases. A case is one working example: a situation and the result it leads to. Each case names its result. A case with no proving test yet becomes a known gap record with an owner and an end date.

    | Case | Situation | Action | Result | Expect |
    |:---|:---|:---|:---|:---|
    | `case/submit-expense.submitting-with-a-receipt-succeeds` | An employee paid for a train ticket and kept the receipt. | The employee submits the expense with the receipt. | `result/submit-expense.submitted` | The expense is submitted. |
    | `case/approve-expense.approving-a-submitted-expense-succeeds` | An employee submitted an expense with its receipt. | The manager approves the expense. | `result/approve-expense.approved` | The expense is approved. |

    Name each test by the observable behavior it asserts. This satisfies `litespec/backend/testing#name-tests-by-observable-behavior`. An acceptance scenario carries one `/// <proves>case/...</proves>` tag. The model builder confirms the claim when the scenario calls the use case and asserts the result.
11. Record the events. An event is an immutable record of a completed fact. Name what completed and which fields it carries. This satisfies `litespec/backend/dotnet/domain#raise-immutable-domain-facts`.

    | Event | Meaning | Carries |
    |:---|:---|:---|
    | `event/expense.expense-submitted` | An expense was submitted. | `expenseId`, `amount`, `currency`, `employeeId` |
    | `event/expense.expense-reimbursed` | An expense was reimbursed. | `expenseId`, `amount`, `currency`, `reimbursedAt` |

    Work that crosses a transaction or time boundary is a use case that reacts to an event, or a use case on a schedule. It declares what it reacts to and its delivery. This satisfies `litespec/backend/application#keep-event-reaction-implementations-explicit`.
12. Keep one transaction per command. One handler stages the records its use case owns and lets the pipeline commit once. It dispatches no further command. This satisfies `litespec/backend/application#keep-one-state-changing-use-case-in-one-pipeline` and `litespec/backend/persistence#commit-each-command-pipeline-once`.
13. Map the model to folders. Mirror the module, record, and use case path in every layer. This satisfies `litespec/backend/architecture#organize-every-layer-by-module-and-use-case`.

    ```text
    apps/api/src/Expenses.Domain/
      Spending/
        Expenses/
          Expense.cs
          ExpenseState.cs
          Events/
            ExpenseSubmittedEvent.cs
          Exceptions/
            ExpenseReceiptMissingException.cs

    apps/api/src/Expenses.Application/
      Spending/
        Expenses/
          SubmitExpense/
            SubmitExpenseCommand.cs
            SubmitExpenseCommandHandler.cs
    ```

    Create subfolders only when real types require them.
14. Run the model check. Run `litespec model check` from the consumer root. It resolves every citation, computes the code, screen, and test links, and reports each unproved case. The [command index](../tools/README.md) states how `litespec` runs in a consumer.

## What you built

- One module with its language, records, rules, use cases, results, cases, events, and permissions.
- Every identifier is person-chosen, and every citation resolves.
- Every case is proved by a passing test or owned by a known gap.
