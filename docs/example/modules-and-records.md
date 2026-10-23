# Modules and Records

## Intent

The spending module is the Claimwick example's one business area: it turns product intent into operations by organizing the business state the company tracks, the rules that bind it, and who may act on it. This page shows each piece as the project writes it: the module record, 3 aggregates (one unit of consistent state each) for expenses, receipts, and the policy with their states, transitions, and data, the rules that bind them, the access chain of actors, roles, permissions, and entry points with the outside system for payouts, and the Submit expense, Remind approvers, and List expenses use cases with their results and scenarios.

## Where This Page Sits

```text
REQUIREMENT     Approval                             <- this page starts here
|
+-- rule        Receipt required above threshold, and 6 more
+-- USE CASE    Submit expense, Remind approvers, List expenses, and 7 more
      +-- result    Submitted, Receipt missing, ...
            +-- scenario  Submitting with a receipt succeeds  <- the review line

WHERE IT LIVES  spending module > expense aggregate > its rules, events, use cases
WHO MAY DO IT   employee, manager, finance > role at a scope > permission
HOW IT IS REACHED  expenses app, reminder job; payout bank outside
```

## The Spending Module

A module is one business area that organizes language, records, use cases, and ownership. Claimwick keeps one module, spending, which tracks expenses, receipts, and the policy. Its record lives at `docs/domain/modules/spending/README.md`, and its empty `dependsOn` list states that it depends on no other module, which applies `litespec/core/domain#state-every-module-dependency` on the [Domain Model](../core/domain.md).

```json
{
  "type": "module",
  "id": "module/spending",
  "title": "Spending",
  "owner": "claimwick-team",
  "status": "approved",
  "summary": "Spending submits, decides, reimburses and exports work expenses.",
  "dependsOn": []
}
```

Each aggregate below belongs to this module through its identifier: `aggregate/spending.expense` names spending before the dot, so containment needs no link field.

## Aggregates and Their States

An aggregate is one unit of business state that stays consistent and changes in one step. Spending keeps 3, each on its own page under the module folder. Each aggregate declares its lifecycle as states entries with a name and a meaning, which applies `litespec/core/domain#model-each-aggregate-lifecycle-with-states`.

| Record | Home | States |
|:--|:--|:--|
| `aggregate/spending.expense` | `docs/domain/modules/spending/expenses/README.md` | Submitted, Approved, Rejected, Reimbursed |
| `aggregate/spending.receipt` | `docs/domain/modules/spending/receipts/README.md` | Attached, Removed |
| `aggregate/spending.policy` | `docs/domain/modules/spending/policies/README.md` | Active, Retired |

An expense is one work cost an employee submitted. A receipt is proof of payment attached to an expense. The policy is the company spending policy and its receipt threshold. Each state carries its meaning: Submitted waits for a decision, Approved and Rejected record a manager decision, and Reimbursed records the finance payout.

## Expense Transitions and Data

The expense aggregate connects its states through transitions and classifies its data. The Transitions table below is the page body the builder parses: each row names the state it leaves, the state it enters, and the use case behind the move, which applies `litespec/core/domain#connect-every-state-through-transitions`.

| From | To | Triggered By |
|:--|:--|:--|
| Submitted | Approved | `use-case/spending.approve-expense` |
| Submitted | Rejected | `use-case/spending.reject-expense` |
| Approved | Reimbursed | `use-case/spending.reimburse-expense` |

The Data table names each field the aggregate holds with its meaning and classification, which applies `litespec/core/domain#classify-every-aggregate-data-field`.

| Name | Meaning | Classification |
|:--|:--|:--|
| employee | The employee who submitted the expense. | personal |
| amount | The exact amount with its currency. | internal |
| receipt | The proof of payment, when one is attached. | internal |
| state | The lifecycle state of the expense. | internal |

The employee field is personal data, so the erase use case covers it: [A Use Case in Code](a-use-case-in-code.md) shows the repository call that deletes it. The receipt and policy aggregates carry no transitions and no data, so their pages hold `None.` under both tables.

## The Full Expense Record

The expense page below shows the full shape, with its states, transitions, and data beside its rule and event entries in `records`:

```json
{
  "type": "aggregate",
  "id": "aggregate/spending.expense",
  "title": "Expense",
  "owner": "claimwick-team",
  "status": "approved",
  "summary": "An expense is one work cost an employee submitted.",
  "states": [
    {
      "name": "Submitted",
      "meaning": "The expense waits for a decision."
    },
    {
      "name": "Approved",
      "meaning": "A manager approved the expense."
    },
    {
      "name": "Rejected",
      "meaning": "A manager rejected the expense."
    },
    {
      "name": "Reimbursed",
      "meaning": "Finance reimbursed the expense."
    }
  ],
  "transitions": [
    {
      "from": "Submitted",
      "to": "Approved",
      "by": "use-case/spending.approve-expense"
    },
    {
      "from": "Submitted",
      "to": "Rejected",
      "by": "use-case/spending.reject-expense"
    },
    {
      "from": "Approved",
      "to": "Reimbursed",
      "by": "use-case/spending.reimburse-expense"
    }
  ],
  "data": [
    {
      "name": "employee",
      "meaning": "The employee who submitted the expense.",
      "classification": "personal"
    },
    {
      "name": "amount",
      "meaning": "The exact amount with its currency.",
      "classification": "internal"
    },
    {
      "name": "receipt",
      "meaning": "The proof of payment, when one is attached.",
      "classification": "internal"
    },
    {
      "name": "state",
      "meaning": "The lifecycle state of the expense.",
      "classification": "internal"
    }
  ],
  "records": [
    {
      "type": "rule",
      "id": "rule/expense.receipt-required-above-threshold",
      "title": "Receipt required above threshold",
      "owner": "claimwick-team",
      "status": "approved",
      "kind": "precondition",
      "statement": "An expense above the policy threshold needs a receipt.",
      "governs": [
        "use-case/spending.submit-expense"
      ],
      "refusal": "result/submit-expense.receipt-missing",
      "basedOn": [],
      "fulfills": [
        "requirement/approval.receipt-over-threshold"
      ]
    },
    {
      "type": "rule",
      "id": "rule/expense.approver-is-not-submitter",
      "title": "Approver is not submitter",
      "owner": "claimwick-team",
      "status": "approved",
      "kind": "precondition",
      "statement": "An approver is not the submitter.",
      "governs": [
        "use-case/spending.approve-expense"
      ],
      "refusal": "result/approve-expense.own-expense",
      "basedOn": [],
      "fulfills": [
        "requirement/approval.no-self-approval"
      ]
    },
    {
      "type": "rule",
      "id": "rule/expense.reimbursed-once",
      "title": "Reimbursed once",
      "owner": "claimwick-team",
      "status": "approved",
      "kind": "invariant",
      "statement": "An expense is reimbursed at most once.",
      "governs": [
        "use-case/spending.reimburse-expense"
      ],
      "refusal": "result/reimburse-expense.already-reimbursed",
      "basedOn": [],
      "fulfills": [
        "requirement/approval.single-reimbursement"
      ]
    },
    {
      "type": "rule",
      "id": "rule/expense.approved-before-reimbursement",
      "title": "Approved before reimbursement",
      "owner": "claimwick-team",
      "status": "approved",
      "kind": "precondition",
      "statement": "An expense is reimbursed only after approval.",
      "governs": [
        "use-case/spending.reimburse-expense"
      ],
      "refusal": "result/reimburse-expense.not-approved",
      "basedOn": [],
      "fulfills": [
        "requirement/approval.single-reimbursement"
      ]
    },
    {
      "type": "event",
      "id": "event/expense.expense-submitted",
      "title": "Expense submitted",
      "owner": "claimwick-team",
      "status": "approved",
      "meaning": "An expense was submitted.",
      "carries": [
        "expenseId",
        "amount",
        "currency",
        "employeeId"
      ]
    },
    {
      "type": "event",
      "id": "event/expense.expense-approved",
      "title": "Expense approved",
      "owner": "claimwick-team",
      "status": "approved",
      "meaning": "An expense was approved.",
      "carries": [
        "expenseId",
        "approvedBy",
        "decidedAt"
      ]
    },
    {
      "type": "event",
      "id": "event/expense.expense-rejected",
      "title": "Expense rejected",
      "owner": "claimwick-team",
      "status": "approved",
      "meaning": "An expense was rejected.",
      "carries": [
        "expenseId",
        "rejectedBy",
        "decidedAt"
      ]
    },
    {
      "type": "event",
      "id": "event/expense.expense-reimbursed",
      "title": "Expense reimbursed",
      "owner": "claimwick-team",
      "status": "approved",
      "meaning": "An expense was reimbursed.",
      "carries": [
        "expenseId",
        "amount",
        "currency",
        "reimbursedAt"
      ]
    }
  ]
}
```

The receipt page carries one rule, `rule/receipt.attaches-before-decision`, and one event, `event/receipt.receipt-attached`. The policy page carries one rule, `rule/policy.threshold-never-negative`, and no events. Every entry states what happened or what stays true, and each names the data it carries or the requirement it fulfills.

## The Rules

A rule is one testable commitment about what stays true. Each rule states its kind and names the refusal its use case returns when the rule breaks, which applies `litespec/core/domain#state-each-rule-with-its-kind` and `litespec/core/domain#name-the-refusal-a-broken-rule-produces`. The 7 spending rules are:

| Rule | Statement | Kind |
|:--|:--|:--|
| `rule/expense.receipt-required-above-threshold` | An expense above the policy threshold needs a receipt. | precondition |
| `rule/expense.approver-is-not-submitter` | An approver is not the submitter. | precondition |
| `rule/expense.reimbursed-once` | An expense is reimbursed at most once. | invariant |
| `rule/expense.approved-before-reimbursement` | An expense is reimbursed only after approval. | precondition |
| `rule/receipt.attaches-before-decision` | A receipt attaches before the expense is decided. | precondition |
| `rule/policy.threshold-never-negative` | A threshold is never negative. | invariant |
| `rule/spending.receipt-filed-once` | A receipt file supports one expense across spending. | cross-aggregate |

Each rule governs the use cases or aggregates it guards and fulfills one approval requirement:

| Rule | Governs | Fulfills |
|:--|:--|:--|
| `rule/expense.receipt-required-above-threshold` | `use-case/spending.submit-expense` | `requirement/approval.receipt-over-threshold` |
| `rule/expense.approver-is-not-submitter` | `use-case/spending.approve-expense` | `requirement/approval.no-self-approval` |
| `rule/expense.reimbursed-once` | `use-case/spending.reimburse-expense` | `requirement/approval.single-reimbursement` |
| `rule/expense.approved-before-reimbursement` | `use-case/spending.reimburse-expense` | `requirement/approval.single-reimbursement` |
| `rule/receipt.attaches-before-decision` | `use-case/spending.attach-receipt` | `requirement/approval.receipt-over-threshold` |
| `rule/policy.threshold-never-negative` | `use-case/spending.set-receipt-threshold` | `requirement/approval.receipt-over-threshold` |
| `rule/spending.receipt-filed-once` | `aggregate/spending.receipt` | `requirement/approval.receipt-over-threshold` |

Each rule names the refusal its use case returns when the rule fails: `rule/expense.receipt-required-above-threshold` names `result/submit-expense.receipt-missing`, `rule/expense.approver-is-not-submitter` names `result/approve-expense.own-expense`, `rule/expense.reimbursed-once` names `result/reimburse-expense.already-reimbursed`, `rule/expense.approved-before-reimbursement` names `result/reimburse-expense.not-approved`, `rule/receipt.attaches-before-decision` names `result/attach-receipt.expense-decided`, and `rule/policy.threshold-never-negative` names `result/set-receipt-threshold.negative-threshold`. Each rule but the last lives as an entry on its aggregate page, so the rule and the state it guards change in one edit. The cross-aggregate rule lives on the spending rule page at `docs/domain/rules/spending-rules.md`, which applies `litespec/core/domain#keep-cross-aggregate-rules-on-a-rule-page`.

## Actors, Roles, and Permissions

Access runs one chain: an actor has a role at a scope, the role allows permissions, and the use case names the permissions it needs. Claimwick keeps 3 actors, each with one role:

| Actor | Kind | Role |
|:--|:--|:--|
| `actor/employee` | person | `role/employee` at self |
| `actor/manager` | person | `role/approver` at team |
| `actor/finance` | person | `role/finance` at platform |

An employee submits expenses and attaches receipts. A manager approves or rejects expenses. Finance reimburses approved expenses. The 3 roles allow these permissions, which applies `litespec/core/access#grant-permissions-through-roles` on [Access](../core/access.md):

| Role | Scope | Allows |
|:--|:--|:--|
| `role/employee` | self | `permission/submit-expense`, `permission/list-expenses` |
| `role/approver` | team | `permission/approve-expense`, `permission/list-expenses`, `permission/manage-policy` |
| `role/finance` | platform | `permission/reimburse-expense`, `permission/list-expenses`, `permission/export-expenses`, `permission/erase-personal-data` |

Permissions live as entries on one list page at `docs/domain/permissions.md`. Each of the 7 entries names one allowed action with its meaning:

| Permission | Meaning |
|:--|:--|
| `permission/submit-expense` | Submit an expense and attach receipts. |
| `permission/approve-expense` | Approve or reject a submitted expense. |
| `permission/reimburse-expense` | Reimburse an approved expense. |
| `permission/list-expenses` | Read own expenses. |
| `permission/manage-policy` | Set the receipt threshold. |
| `permission/export-expenses` | Export approved expenses for finance. |
| `permission/erase-personal-data` | Erase the personal data of a decided expense. |

Submit expense names `permission/submit-expense` in its `needs` field: a use case names the permissions it needs, so nobody guesses who may run it.

## Entry Points

An entry point is one way people or systems reach the product. Claimwick lists 2 on one page at `docs/domain/entry-points.md`:

| Entry point | Kind |
|:--|:--|
| `entry-point/claimwick-app` | app |
| `entry-point/reminder-job` | job |

Employees reach spending through the expenses app, and every spending use case but one names it in `reachedThrough`. The reminder reaction runs through the nightly reminder job instead.

## The External System

An external system is one outside system the product exchanges data with. Claimwick keeps one: the payout bank moves reimbursed money to employees. Its record lives at `docs/domain/systems/payout-bank.md`, names the finance actor, states what it sends and receives, and states what happens when a payout file fails, which applies `litespec/core/access#name-what-an-external-system-sends`, `litespec/core/access#name-what-an-external-system-receives`, and `litespec/core/access#state-the-failure-behavior-of-every-external-system`.

```json
{
  "type": "external-system",
  "id": "external-system/payout-bank",
  "title": "Payout Bank",
  "owner": "claimwick-team",
  "status": "approved",
  "actor": "actor/finance",
  "sends": [
    "Approved payouts as one bank file per batch."
  ],
  "receives": [
    "A settlement report per payout batch."
  ],
  "failure": "The bank rejects a payout file, and finance fixes the entry and re-sends the batch."
}
```

The reimburse use case raises the reimbursement event, and the payout batch carries it to this bank. The settlement report closes the loop: finance reads back one report per batch.

## One Use Case Tying Them Together

A use case is one command, query, or reaction with its permissions, results, and scenarios. Submit expense is a command: an employee submits a work expense with a receipt through the expenses app. Its record names the permission it needs, the entry point it is reached through, the event it raises, and the requirement it fulfills, which applies `litespec/core/domain#give-each-use-case-one-kind`. Its result and scenario entries live in `records`, which is the shape the record schema defines.

```json
{
  "type": "use-case",
  "id": "use-case/spending.submit-expense",
  "title": "Submit Expense",
  "owner": "claimwick-team",
  "status": "approved",
  "kind": "command",
  "needs": [
    "permission/submit-expense"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/claimwick-app"
  ],
  "raises": [
    "event/expense.expense-submitted"
  ],
  "fulfills": [
    "requirement/approval.receipt-over-threshold"
  ],
  "input": [
    {
      "name": "amount",
      "meaning": "The exact amount of the expense."
    },
    {
      "name": "currency",
      "meaning": "The ISO 4217 currency code of the amount."
    },
    {
      "name": "receipt",
      "meaning": "The proof of payment, required above the threshold."
    }
  ],
  "records": [
    {
      "type": "result",
      "id": "result/submit-expense.submitted",
      "title": "Submitted",
      "owner": "claimwick-team",
      "outcome": "success",
      "meaning": "The expense is submitted."
    },
    {
      "type": "result",
      "id": "result/submit-expense.receipt-missing",
      "title": "Receipt missing",
      "owner": "claimwick-team",
      "outcome": "refusal",
      "code": "spending.receipt-missing",
      "meaning": "The expense is above the receipt threshold and carries no receipt."
    },
    {
      "type": "scenario",
      "id": "scenario/submit-expense.submitting-with-a-receipt-succeeds",
      "title": "Submitting with a receipt succeeds",
      "owner": "claimwick-team",
      "status": "approved",
      "given": "An employee paid for a train ticket and kept the receipt.",
      "when": "The employee submits the expense with the receipt.",
      "result": "result/submit-expense.submitted",
      "then": "The expense is submitted."
    }
  ]
}
```

The record ends in named results, which applies `litespec/core/model#give-every-use-case-its-results`: one success and one refusal, and the refusal carries the stable code `spending.receipt-missing`. The scenario proves the success result in given, when, then, which applies `litespec/core/domain#write-every-scenario-in-given-when-then`. The receipt rule governs this use case, the employee role allows its permission, and the journey submit-and-reimburse reaches it among its steps. Its Goal section states the actor intent in one sentence, its What Happens section walks the behavior in order, and its Example section follows Ava submitting her train fare.

## The Reaction

Remind approvers is a reaction: the nightly job reminds the approver of each expense still waiting past its deadline. Its record names no actor permission, because no person runs it. Its trigger states the deadline in words, which applies `litespec/core/domain#trigger-every-reaction`.

```json
{
  "type": "use-case",
  "id": "use-case/spending.remind-approvers",
  "title": "Remind Approvers",
  "owner": "claimwick-team",
  "status": "approved",
  "kind": "reaction",
  "reachedThrough": [
    "entry-point/reminder-job"
  ],
  "raises": [],
  "trigger": {
    "deadline": "Three business days after submission without a decision."
  },
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/remind-approvers.reminded",
      "title": "Reminded",
      "owner": "claimwick-team",
      "outcome": "success",
      "meaning": "The approver is reminded."
    },
    {
      "type": "scenario",
      "id": "scenario/remind-approvers.reminding-an-approver-succeeds",
      "title": "Reminding an approver succeeds",
      "owner": "claimwick-team",
      "status": "approved",
      "given": "An expense waited three business days with no decision.",
      "when": "The reminder job runs.",
      "result": "result/remind-approvers.reminded",
      "then": "The approver is reminded."
    }
  ]
}
```

This reaction carries the approval reminders feature down the tree: the feature promises reminders past three days, the five-day requirement bounds them, and the deadline trigger fires them. Its What Happens section scans the submitted expenses each night and leaves decided ones alone.

## The Query

List expenses is a query: an employee reads their own expenses with the latest state of each. Its record declares its output, which applies `litespec/core/domain#declare-every-query-output`.

```json
{
  "type": "use-case",
  "id": "use-case/spending.list-expenses",
  "title": "List Expenses",
  "owner": "claimwick-team",
  "status": "approved",
  "kind": "query",
  "needs": [
    "permission/list-expenses"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/claimwick-app"
  ],
  "raises": [],
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ],
  "output": [
    {
      "name": "expenses",
      "meaning": "One row per expense: its identity, amount, currency, state and submission time, newest first."
    }
  ],
  "records": [
    {
      "type": "result",
      "id": "result/list-expenses.listed",
      "title": "Listed",
      "owner": "claimwick-team",
      "outcome": "success",
      "meaning": "The expenses are listed."
    },
    {
      "type": "scenario",
      "id": "scenario/list-expenses.listing-own-expenses-succeeds",
      "title": "Listing own expenses succeeds",
      "owner": "claimwick-team",
      "status": "approved",
      "given": "An employee submitted two expenses.",
      "when": "The employee lists their expenses.",
      "result": "result/list-expenses.listed",
      "then": "Both expenses are listed."
    }
  ]
}
```

The output names the one row shape the screen reads: identity, amount, currency, state, and submission time, newest first. Spending keeps 10 use cases in all: 8 commands, this query, and the reminder reaction. [The Claimwick Screen](the-screen.md) reads this output through the generated client.

Next, [A Use Case in Code](a-use-case-in-code.md) follows the Submit expense record into .NET code and tests.
