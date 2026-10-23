# Model a Behavior Module

## Purpose

A behavior module gathers one business area's glossary terms, aggregates, rules, use cases, reactions, jobs, notifications, settings, events, and permissions into pages that the model builder, the tool that checks the project, reads. This tutorial works through one kind of page at a time, using the spending module of the Claimwick product as the worked example. Each step names the standard it satisfies, and the tutorial adds no rule of its own.

## Prerequisites

- Finish [Start a Consumer Repository](getting-started.md) through its configuration steps.
- Read the product brief and the requirements this module fulfills.
- Read the decisions that constrain identity, persistence, security, or external behavior.
- Copy the `module.md`, `aggregate.md`, and `use-case.md` templates from the [template index](../../templates/consumer/README.md), and open `docs/glossary.json` for the module terms.

## Lesson

1. Name the module terms: write one term entry per word with its meaning, its layer, its aliases, and the words it rejects. Use the same term in documentation, domain types, use cases, API descriptions, and frontend features. This satisfies `litespec/backend/domain#use-one-ubiquitous-language`, `litespec/core/behavior#define-every-behavior-term-in-the-glossary`, and `litespec/core/behavior#mark-each-term-with-its-layer`.

    | Term | Meaning | Layer | Aliases | Rejected words |
    |:---|:---|:---|:---|:---|
    | `term/expense` | One work cost an employee submitted for approval | behavior | claim | Voucher |
    | `term/receipt` | Proof of payment attached to an expense | behavior | proof of payment | Docket |
    | `term/policy` | The company spending policy and its receipt threshold | behavior | None | None |
    | `term/approver` | The manager who decides a submitted expense | behavior | None | None |

    Rejected words stop a later contributor from creating `Voucher` beside `Expense`. Aliases let industry readers find your word under the name they already know. They also tell an agent which plausible names are wrong for this domain and which are accepted synonyms.

2. Write the Example section before the rules. Name one occasion the module exists for: who acts, what surrounds them, and what they use today instead. Record it in the module page's Example section, and reuse its people and figures on every page beneath it. Keep the shared cast on the example cast page. This satisfies `litespec/core/behavior#illustrate-pages-with-examples-from-the-cast`.

    Month end brings every team's expenses at once: employees paid work costs from their own pockets and wait weeks for a decision, chasing managers by email. Without an expense record, finance reconstructs who spent what from forwarded receipts and memory.

3. Write the module page with its summary. Give the module a person-chosen identifier such as `module/spending`. Name each module it depends on, or remove the dependency field when the module stands alone. Spending depends on no other module, so its dependency list stays empty. This satisfies `litespec/core/behavior#state-every-module-dependency`.
4. Draw aggregate boundaries from invariants. An aggregate is a consistency boundary: state that must stay valid together in one command. An invariant is a condition that holds before and after every successful change. Declare the kind of every aggregate: `entity` for guarded state, `process` for a multi-step aggregate, and `store` for state no invariant guards. This satisfies `litespec/backend/domain#treat-aggregates-as-consistency-boundaries`, `litespec/backend/domain#keep-child-entities-inside-the-aggregate-boundary`, and `litespec/core/behavior#declare-the-kind-of-every-aggregate`.

    | Aggregate | Kind | Owns | References by typed ID |
    |:---|:---|:---|:---|
    | `aggregate/spending.expense` | entity | Expense lifecycle, total, reimbursement facts | `ReceiptId`, `EmployeeId` |
    | `aggregate/spending.receipt` | entity | Receipt attachment and removal | `ExpenseId` |
    | `aggregate/spending.policy` | store | The current receipt threshold value | None |

    The policy store names its owner, the spending settings store, and carries no states, because no invariant guards the stored value: the setting record declares its default and bounds. This satisfies `litespec/core/behavior#name-the-owner-of-every-store`. An aggregate owns a child when the child has no independent boundary and changes only through the aggregate. Reference another aggregate by typed ID when it changes on its own. Do not place `Employee` inside `Expense` for convenient navigation. This satisfies `litespec/backend/domain#reference-other-aggregates-by-id`. A process kind would add steps with compensations, named exits, a `finishedWhen`, and a driver; spending needs none.

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
7. Declare the data classes with their erasure positions. A data class groups fields that share one classification and one fate on erasure. Then list every field the aggregate keeps with its meaning, data class, and classification in the aggregate's Data table. This satisfies `litespec/core/behavior#declare-every-data-class-with-its-erasure-position` and `litespec/core/behavior#classify-every-aggregate-data-field`.

    | Data class | Classification | Fields | On erasure | Enforced by |
    |:---|:---|:---|:---|:---|
    | `expense-money` | internal | amount, state | retain for 7 years by statute | record-expiry |
    | `submitter` | personal | employee | erase on approved request | `job/spending.erase-expired-personal-data` |

    | Name | Meaning | Data Class | Classification |
    |:---|:---|:---|:---|
    | `total` | The amount claimed, with its currency | `expense-money` | `internal` |
    | `receipt` | The payment proof attached to the expense | `expense-money` | `internal` |
    | `approver` | The manager who decided, once decided | `expense-money` | `internal` |
    | `employee` | The employee who submitted the expense | `submitter` | `personal` |

    Every field names its data class, so the retention schedule can erase by class instead of by table. A personal or sensitive class that is retained or exempt needs an Intent decision or requirement accepting it.
8. Write the rules with kinds. Give each rule a person-chosen identifier of one to six lowercase words. A statement with `not`, `no`, `never`, or `cannot` keeps that word in its name. This satisfies `litespec/core/behavior#state-each-rule-with-its-kind` and `litespec/core/behavior#keep-the-negation-word-in-the-rule-name`.

    | Rule | Kind | Statement | Refusal |
    |:---|:---|:---|:---|
    | `rule/expense.receipt-required-above-threshold` | `precondition` | An expense above the policy threshold needs a receipt. | `result/submit-expense.receipt-missing` |
    | `rule/expense.approver-is-not-submitter` | `invariant` | An approver is not the submitter. | `result/approve-expense.own-expense` |
    | `rule/expense.reimbursed-once` | `invariant` | An expense is reimbursed at most once. | `result/reimburse-expense.already-reimbursed` |
    | `rule/expense.approved-before-reimbursement` | `precondition` | An expense is reimbursed only after approval. | `result/reimburse-expense.not-approved` |
    | `rule/receipt.attaches-before-decision` | `precondition` | A receipt attaches before the expense is decided. | `result/attach-receipt.expense-decided` |

    An `invariant` holds after every change to its aggregate. A `precondition` guards the behavior before it runs and refuses caller-correctable input. A `calculation` derives a value and is proven by a scenario with an examples table. A `cross-aggregate` rule spans aggregates and lives on a rule page. The remaining kinds cover atomicity, held reservations, frozen commercial values, and fallback defaults. Each rule that refuses names its refusal. This satisfies `litespec/core/behavior#name-the-refusal-a-broken-rule-produces` and `litespec/core/behavior#keep-cross-aggregate-rules-on-a-rule-page`. The cross-aggregate rule `rule/spending.receipt-filed-once`, a receipt file supports one expense across spending, lives on the spending rule page. A tunable bound such as the threshold is a setting, not a rule. Input shape stays in the validator; current aggregate state stays in the aggregate. This satisfies `litespec/backend/application#separate-input-validation-from-invariants`.
9. Name the people and their permissions. Write one actor page per party and one role page per grantable set. Roles grant permissions; each use case later declares its access against one grant. This satisfies `litespec/core/access#grant-permissions-through-roles` and `litespec/backend/application#enforce-target-authorization-in-the-pipeline`.

    | Actor | Role | Permission |
    |:---|:---|:---|
    | `actor/employee` | `role/employee` at self scope | `permission/submit-expense` |
    | `actor/manager` | `role/approver` at team scope | `permission/approve-expense` |
    | `actor/finance` | `role/finance` at platform scope | `permission/reimburse-expense` |

10. Write the use cases. Give each use case a name that is unique across the project, so its results and scenarios resolve. Name the kind, `command` or `query`, the journey steps or goals it serves, the requirements it fulfills, the access it declares, the entry points, the aggregates it changes and reads, its consistency, its effects, and the events it raises. This satisfies `litespec/backend/application#use-this-use-case-layout`, `litespec/core/behavior#give-each-use-case-a-command-or-query-kind`, `litespec/core/behavior#connect-each-use-case-to-intent`, and `litespec/core/access#declare-access-on-every-use-case`.

    | Use case | Kind | Serves | Access grant | Changes | Consistency |
    |:---|:---|:---|:---|:---|:---|
    | `use-case/spending.submit-expense` | `command` | `journey/submit-and-reimburse#s1` | `permission/submit-expense` | `aggregate/spending.expense` | atomic |
    | `use-case/spending.approve-expense` | `command` | `journey/submit-and-reimburse#s2` | `permission/approve-expense` | `aggregate/spending.expense` | atomic |
    | `use-case/spending.reimburse-expense` | `command` | `journey/submit-and-reimburse#s3` | `permission/reimburse-expense` | `aggregate/spending.expense` | atomic |
    | `use-case/spending.list-expenses` | `query` | `journey/submit-and-reimburse#s4` | `self(permission/list-expenses)` | None | None |

    At least one of `serves` and `fulfills` is present on every use case. Access declares auth kinds, one grant, and the tenant scope; a grant of `self(...)` limits the permission to the caller's own records. `changes` and `reads` name every aggregate the use case touches, and `consistency` states how the writes hold together. This satisfies `litespec/core/behavior#grant-each-use-case-scoped-access`, `litespec/core/behavior#name-every-aggregate-a-use-case-changes-or-reads`, and `litespec/core/behavior#state-the-consistency-of-every-use-case`. Every edge the use case causes goes in `effects` with one verb and its timing: `issues`, `sends`, `publishes`, or `calls`. This satisfies `litespec/core/behavior#declare-every-effect-with-one-verb-and-its-timing`. Every input field names its source and classification, and caller-supplied values on money or access paths carry bounding rules. This satisfies `litespec/core/behavior#describe-every-use-case-input-with-source-and-classification`. Every use case names its idempotency and, for commands, its audit position. This satisfies `litespec/core/behavior#name-the-idempotency-of-every-use-case` and `litespec/core/behavior#state-the-audit-position-of-every-command`.

    A query changes nothing and declares its `output` in `include` groups with freshness, plus its paging. This satisfies `litespec/core/behavior#declare-every-query-output` and `litespec/core/behavior#declare-paging-on-every-collection-query`.
11. Write one result per ending. A result is one way a use case ends: `success`, or a named `refusal` with its stable `code`. List refusals in precedence order, first match wins. This satisfies `litespec/core/behavior#end-every-use-case-in-named-results`, `litespec/core/behavior#order-every-refusal-list-by-precedence`, and `litespec/backend/application#model-expected-use-case-refusals-explicitly`.

    | Result | Outcome | Code | Meaning |
    |:---|:---|:---|:---|
    | `result/submit-expense.submitted` | `success` | None | The expense is submitted. |
    | `result/submit-expense.receipt-missing` | `refusal` | `spending.receipt-missing` | The expense is above the threshold and carries no receipt. |

    Never write the generic forbidden or invalid-input refusals: the use case derives them from its access and input. This satisfies `litespec/core/behavior#derive-generic-refusals-instead-of-writing-them`. A refusal that stores the attempt carries `recorded: true`; a success with recorded outcomes inside it carries `codes`. Each refusal explains what the caller sees. The code is stable across releases. The backend stack derives the HTTP status from the outcome. This satisfies `litespec/backend/api#use-consistent-status-codes`.
12. Write the scenarios. A scenario is one working example in `given`, `when`, `then`: the situation, the action, and the expected ending. Each scenario names the result it ends in. A scenario with no proving test yet becomes a known gap record with an owner and an end date. This satisfies `litespec/core/behavior#write-every-scenario-in-given-when-then` and `litespec/core/behavior#name-the-result-each-scenario-ends-in`.

    | Scenario | Given | When | Then | Result |
    |:---|:---|:---|:---|:---|
    | `scenario/submit-expense.submitting-with-a-receipt-succeeds` | An employee paid for a train ticket and kept the receipt. | The employee submits the expense with the receipt. | The expense is submitted. | `result/submit-expense.submitted` |
    | `scenario/approve-expense.approving-a-submitted-expense-succeeds` | An employee submitted an expense with its receipt. | The manager approves the expense. | The expense is approved. | `result/approve-expense.approved` |

    When the scenario proves a calculation, add an `examples` table with the debated rows. This satisfies `litespec/core/behavior#tabulate-every-calculation-with-examples`. Name each test by the observable behavior it asserts. This satisfies `litespec/backend/testing#name-tests-by-observable-behavior`. An acceptance test carries one `/// <proves>scenario/...</proves>` tag. The model builder confirms the claim when the test calls the use case through the public boundary and asserts the result the scenario names.
13. Record the events. A domain event is an immutable record of a completed fact. Name what completed and which fields it carries. This satisfies `litespec/core/behavior#state-each-event-with-meaning-and-carries` and `litespec/backend/dotnet/domain#raise-immutable-domain-facts`.

    | Event | Meaning | Carries |
    |:---|:---|:---|
    | `event/expense.submitted` | An expense was submitted. | `expenseId`, `amount`, `currency`, `employeeId` |
    | `event/expense.reimbursed` | An expense was reimbursed. | `expenseId`, `amount`, `currency`, `reimbursedAt` |

    A fact that leaves the product is an integration event with a direction, a CloudEvents type and source, and a payload. Reimbursing publishes `integration-event/payout.requested`, which translates `event/expense.reimbursed` for the payout bank. The use case declares it in `effects` with `publishes`. This satisfies `litespec/core/behavior#describe-every-integration-event-for-its-direction` and `litespec/core/behavior#publish-every-outbound-integration-event-from-effects`.
14. Write the reactions, jobs, notifications, and settings as their own records. Work that answers an event is a reaction: it names the event in `on` and issues exactly one use case or sends exactly one notification, and it never writes an aggregate directly. This satisfies `litespec/core/behavior#trigger-every-reaction-from-a-declared-event`, `litespec/core/behavior#issue-or-send-from-every-reaction`, and `litespec/core/behavior#write-no-aggregate-directly-from-a-reaction`. File each reaction with the module whose records it changes, and run it in a dedicated handler. This satisfies `litespec/core/behavior#file-every-reaction-with-the-module-it-changes` and `litespec/backend/dotnet/application#run-reactions-in-dedicated-handlers`.

    | Record | Shape |
    |:---|:---|
    | `reaction/spending.notify-on-reimbursement` | On `event/expense.reimbursed`, sends `notification/spending.reimbursement-received`. |
    | `job/spending.remind-approvers` | Scheduled nightly; issues `use-case/spending.send-approver-reminder` per waiting expense. |
    | `notification/spending.approver-reminder` | Email to the manager with the expense and its waiting time. |
    | `setting/spending.receipt-threshold` | Money, default EUR 25, set by the operator, refuses at the bound. |

    Declare every job with its kind and a structured schedule; an operator job also states where it runs and its guard. This satisfies `litespec/core/behavior#declare-every-job-with-kind-and-structured-schedule` and `litespec/core/behavior#guard-every-operator-job`. Describe every notification with its audience, channel, and consent, and claim each promise it makes from a requirement. This satisfies `litespec/core/behavior#describe-every-notification-with-audience-channel-and-consent` and `litespec/core/behavior#claim-every-notification-promise-from-a-requirement`. Hold every commercial, legal, or varying setting default to a requirement, and keep model invariants in rules. This satisfies `litespec/core/behavior#hold-every-setting-default-to-a-requirement` and `litespec/core/behavior#keep-model-invariants-in-rules`.
15. Name the entry points and the external systems. Give each entry point its kind: the expenses app is a browser, the nightly reminder run is a job. This satisfies `litespec/core/access#name-every-entry-point-with-its-kind`. Declare every operation on the payout bank with its timeout, retries, and response, and route erasure through an operation. This satisfies `litespec/core/access#declare-every-operation-on-every-external-system` and `litespec/core/access#declare-erasure-for-every-external-system`. Schedule every data class for retention with its basis, period, enforcement, and Intent acceptance. This satisfies `litespec/core/behavior#schedule-every-data-class-for-retention`.
16. Keep one transaction per command. One handler stages the aggregates its use case owns and lets the pipeline commit once, with the consistency the record declares. This satisfies `litespec/backend/application#dispatch-only-declared-effect-edges` and `litespec/backend/persistence#commit-each-command-pipeline-once`.
17. Map the model to folders. Mirror the module, aggregate, and use case path in every layer. This satisfies `litespec/backend/architecture#organize-every-layer-by-module-and-use-case`.

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

    Create subfolders only when real types require them. The folders are the anchors the builder follows from code up to the records.
18. Run the model check. Run `litespec model check` from the consumer root. It resolves every citation, follows the code, screen, and test anchors, prints a tier beside each finding, and reports each unproved scenario. The [command index](../tools/README.md) states how `litespec` runs in a consumer.

## What You Built

- One module with its terms, aggregates, data classes, rules, use cases, results, scenarios, events, reactions, jobs, notifications, settings, and permissions.
- Every identifier is person-chosen, every citation resolves, and every edge between records is declared.
- Every scenario is proved by a passing test or owned by a known gap.
