# Model a Domain Module

## Purpose

A domain module gathers one business area's glossary terms, aggregates, rules, use cases, events, and permissions into pages that the model builder, the tool that checks the project, reads. This tutorial works through one kind of page at a time, using the spending module of the Claimwick product as the worked example. Each step names the standard it satisfies, and the tutorial adds no rule of its own.

## Prerequisites

- Finish [Start a Consumer Repository](getting-started.md) through its configuration steps.
- Read the product brief and the requirements this module fulfills.
- Read the decisions that constrain identity, persistence, security, or external behavior.
- Copy the `module.md`, `aggregate.md`, and `use-case.md` templates from the [template index](../../templates/consumer/README.md), and open `docs/glossary.json` for the module terms.

## Lesson

1. Name the module terms: write one term entry per word with its meaning, its labels, and the words it rejects. Use the same term in documentation, domain types, use cases, API descriptions, and frontend features. This satisfies `litespec/backend/domain#use-one-ubiquitous-language` and `litespec/core/behavior#define-every-domain-term-in-the-glossary`.

    | Term | Meaning | Rejected words |
    |:---|:---|:---|
    | `term/expense` | One work cost an employee submitted for approval | Voucher |
    | `term/receipt` | Proof of payment attached to an expense | Docket |
    | `term/policy` | The company spending policy and its receipt threshold | None |
    | `term/approver` | The manager who decides a submitted expense | None |

    Rejected words stop a later contributor from creating `Voucher` beside `Expense`. They also tell an agent which plausible names are wrong for this domain.

2. Write the Example section before the rules. Name one occasion the module exists for: who acts, what surrounds them, and what they use today instead. Record it in the module page's Example section, and reuse its people and figures on every page beneath it. Keep the shared cast on the example cast page. This satisfies `litespec/core/behavior#illustrate-pages-with-examples-from-the-cast`.

    Month end brings every team's expenses at once: employees paid work costs from their own pockets and wait weeks for a decision, chasing managers by email. Without an expense record, finance reconstructs who spent what from forwarded receipts and memory.

3. Write the module page with its summary. Give the module a person-chosen identifier such as `module/spending`. Name each module it depends on, or remove the dependency field when the module stands alone. Spending depends on no other module, so its dependency list stays empty. This satisfies `litespec/core/behavior#state-every-module-dependency`.
4. Draw aggregate boundaries from invariants. An aggregate is a consistency boundary: state that must stay valid together in one command. An invariant is a condition that holds before and after every successful change. This satisfies `litespec/backend/domain#treat-aggregates-as-consistency-boundaries` and `litespec/backend/domain#keep-child-entities-inside-the-aggregate-boundary`.

    | Aggregate | Owns | References by typed ID |
    |:---|:---|:---|
    | `aggregate/spending.expense` | Expense lifecycle, total, reimbursement facts | `ReceiptId`, `EmployeeId` |
    | `aggregate/spending.receipt` | Receipt attachment and removal | `ExpenseId` |
    | `aggregate/spending.policy` | Receipt threshold | None |

    An aggregate owns a child when the child has no independent boundary and changes only through the aggregate. Reference another aggregate by typed ID when it changes on its own. Do not place `Employee` inside `Expense` for convenient navigation. This satisfies `litespec/backend/domain#reference-other-aggregates-by-id`.
5. Define every state. A state is a business-valid condition with its required data and permitted behavior. Describe states before writing transitions. This satisfies `litespec/backend/domain#model-every-aggregate-lifecycle-with-state-types` and `litespec/core/behavior#model-each-aggregate-lifecycle-with-states`.

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
6. Connect the states with transitions. List every allowed state change with the use case that moves it in the aggregate's Transitions table. This satisfies `litespec/core/behavior#connect-every-state-through-transitions`.

    | From | To | By Use Case |
    |:---|:---|:---|
    | None | Submitted | `use-case/spending.submit-expense` |
    | Submitted | Approved | `use-case/spending.approve-expense` |
    | Submitted | Rejected | `use-case/spending.approve-expense` |
    | Approved | Reimbursed | `use-case/spending.reimburse-expense` |

    Creation is a transition from None, so the first state stays reachable. One use case can move more than one transition: approval ends submitted either approved or rejected.
7. Classify the aggregate data. List every field the aggregate keeps with its meaning and classification in the aggregate's Data table. This satisfies `litespec/core/behavior#classify-every-aggregate-data-field`.

    | Name | Meaning | Classification |
    |:---|:---|:---|
    | `total` | The amount claimed, with its currency | `internal` |
    | `receipt` | The payment proof attached to the expense | `personal` |
    | `approver` | The manager who decided, once decided | `internal` |

    A `personal` or `sensitive` field needs erasure and export use cases covering it.
8. Write the rules with kinds. Give each rule a person-chosen identifier of one to six lowercase words. A statement with `not`, `no`, `never`, or `cannot` keeps that word in its name. This satisfies `litespec/core/behavior#state-each-rule-with-its-kind` and `litespec/core/behavior#keep-the-negation-word-in-the-rule-name`.

    | Rule | Kind | Statement | Refusal |
    |:---|:---|:---|:---|
    | `rule/expense.receipt-required-above-threshold` | `precondition` | An expense above the policy threshold needs a receipt. | `result/submit-expense.receipt-missing` |
    | `rule/expense.approver-is-not-submitter` | `invariant` | An approver is not the submitter. | `result/approve-expense.own-expense` |
    | `rule/expense.reimbursed-once` | `invariant` | An expense is reimbursed at most once. | `result/reimburse-expense.already-reimbursed` |

    An `invariant` holds after every change to its aggregate. A `precondition` guards the behavior before it runs and refuses caller-correctable input. A `calculation` derives a value and is proven by a scenario with an examples table. A `cross-aggregate` rule spans aggregates and lives on a rule page. Each rule that refuses names its refusal. This satisfies `litespec/core/behavior#name-the-refusal-a-broken-rule-produces` and `litespec/core/behavior#keep-cross-aggregate-rules-on-a-rule-page`. Input shape stays in the validator; current aggregate state stays in the aggregate. This satisfies `litespec/backend/application#separate-input-validation-from-invariants`.
9. Name the people and their permissions. Write one actor page per party and one role page per grantable set. Name the permission each use case needs. This satisfies `litespec/backend/application#enforce-target-authorization-in-the-pipeline`.

    | Actor | Role | Permission |
    |:---|:---|:---|
    | `actor/employee` | `role/employee` at self scope | `permission/submit-expense` |
    | `actor/manager` | `role/approver` at team scope | `permission/approve-expense` |
    | `actor/finance` | `role/finance` at platform scope | `permission/reimburse-expense` |

10. Write the use cases. Give each use case a name that is unique across the project, so its results and scenarios resolve. Name the kind, the needed permissions, the entry points, the raised events, and the fulfilled requirements. This satisfies `litespec/backend/application#use-this-use-case-layout` and `litespec/core/behavior#give-each-use-case-one-kind`.

    | Use case | Kind | Needs | Raises |
    |:---|:---|:---|:---|
    | `use-case/spending.submit-expense` | `command` | `permission/submit-expense` | `event/expense.submitted` |
    | `use-case/spending.approve-expense` | `command` | `permission/approve-expense` | None |
    | `use-case/spending.reimburse-expense` | `command` | `permission/reimburse-expense` | `event/expense.reimbursed` |
    | `use-case/spending.list-expenses` | `query` | `permission/list-expenses` | None |

    A query changes nothing and declares its `output`. It loads no aggregate for presentation. This satisfies `litespec/core/behavior#declare-every-query-output`.
11. Write one result per ending. A result is one way a use case ends: `success`, or a named `refusal` with its stable `code`. This satisfies `litespec/core/behavior#end-every-use-case-in-named-results` and `litespec/backend/application#model-expected-use-case-refusals-explicitly`.

    | Result | Outcome | Code | Meaning |
    |:---|:---|:---|:---|
    | `result/submit-expense.submitted` | `success` | None | The expense is submitted. |
    | `result/submit-expense.receipt-missing` | `refusal` | `spending.receipt-missing` | The expense is above the threshold and carries no receipt. |

    Each refusal explains what the caller sees. The code is stable across releases. The backend stack derives the HTTP status from the outcome. This satisfies `litespec/backend/api#use-consistent-status-codes`.
12. Write the scenarios. A scenario is one working example in `given`, `when`, `then`: the situation, the action, and the expected ending. Each scenario names the result it ends in. A scenario with no proving test yet becomes a known gap record with an owner and an end date. This satisfies `litespec/core/behavior#write-every-scenario-in-given-when-then` and `litespec/core/behavior#name-the-result-each-scenario-ends-in`.

    | Scenario | Given | When | Then | Result |
    |:---|:---|:---|:---|:---|
    | `scenario/submit-expense.submitting-with-a-receipt-succeeds` | An employee paid for a train ticket and kept the receipt. | The employee submits the expense with the receipt. | The expense is submitted. | `result/submit-expense.submitted` |
    | `scenario/approve-expense.approving-a-submitted-expense-succeeds` | An employee submitted an expense with its receipt. | The manager approves the expense. | The expense is approved. | `result/approve-expense.approved` |

    When the scenario proves a calculation, add an `examples` table with the debated rows. This satisfies `litespec/core/behavior#tabulate-every-calculation-with-examples`. Name each test by the observable behavior it asserts. This satisfies `litespec/backend/testing#name-tests-by-observable-behavior`. An acceptance test carries one `/// <proves>scenario/...</proves>` tag. The model builder confirms the claim when the test calls the use case through the public boundary and asserts the result the scenario names.
13. Record the events. An event is an immutable record of a completed fact. Name what completed and which fields it carries. This satisfies `litespec/core/behavior#state-each-event-with-meaning-and-carries` and `litespec/backend/dotnet/domain#raise-immutable-domain-facts`.

    | Event | Meaning | Carries |
    |:---|:---|:---|
    | `event/expense.submitted` | An expense was submitted. | `expenseId`, `amount`, `currency`, `employeeId` |
    | `event/expense.reimbursed` | An expense was reimbursed. | `expenseId`, `amount`, `currency`, `reimbursedAt` |

    Work that crosses a transaction or time boundary is a reaction: a use case of kind `reaction` that names its `trigger`, the events it answers or the schedule or deadline in words. This satisfies `litespec/core/behavior#trigger-every-reaction` and `litespec/backend/application#keep-event-reaction-implementations-explicit`.
14. Keep one transaction per command. One handler stages the aggregates its use case owns and lets the pipeline commit once. It dispatches no further command. This satisfies `litespec/backend/application#keep-one-state-changing-use-case-in-one-pipeline` and `litespec/backend/persistence#commit-each-command-pipeline-once`.
15. Map the model to folders. Mirror the module, aggregate, and use case path in every layer. This satisfies `litespec/backend/architecture#organize-every-layer-by-module-and-use-case`.

    ```text
    apps/api/src/Claimwick.Domain/
      Spending/
        Expenses/
          Expense.cs
          ExpenseState.cs
          Events/
            ExpenseSubmittedEvent.cs
          Exceptions/
            ExpenseReceiptMissingException.cs

    apps/api/src/Claimwick.Application/
      Spending/
        Expenses/
          SubmitExpense/
            SubmitExpenseCommand.cs
            SubmitExpenseCommandHandler.cs
    ```

    Create subfolders only when real types require them.
16. Run the model check. Run `litespec model check` from the consumer root. It resolves every citation, computes the code, screen, and test links, and reports each unproved scenario. The [command index](../tools/README.md) states how `litespec` runs in a consumer.

## What You Built

- One module with its terms, aggregates, rules, use cases, results, scenarios, events, and permissions.
- Every identifier is person-chosen, and every citation resolves.
- Every scenario is proved by a passing test or owned by a known gap.
