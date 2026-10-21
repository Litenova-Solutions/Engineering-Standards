# Modules and Records

## Intent

The spending module is the Expenses example's one business area: it turns product intent into operations by organizing the business state the company tracks, the rules that bind it, and who may act on it. This page shows each piece as the project writes it: the module record, 3 business records (one unit of consistent state each) for expenses, receipts, and the policy with their states and rules, the access chain of actors, roles, permissions, and entry points, and the full Submit expense record, in which an employee submits a work expense with a receipt, with its results and cases.

## The spending module

A module is one business area that organizes language, records, use cases, and ownership. Expenses keeps one module, spending, which tracks expenses, receipts, and the policy. Its record lives at `docs/domain/modules/spending/README.md`, and its empty `dependsOn` list states that it depends on no other module, which applies `litespec/core/model#express-module-order-as-depends-on` on the [Project Model](../core/model.md).

```json
{
  "type": "module",
  "id": "module/spending",
  "title": "Spending",
  "owner": "expenses-team",
  "status": "approved",
  "dependsOn": []
}
```

Each business record below belongs to this module through its identifier: `business-record/spending.expense` names spending before the dot, so containment needs no link field.

## Business records and their states

A business record is one unit of business state that stays consistent and changes in one step. Spending keeps 3, each on its own page under the module folder. Each record names a `codeName` and a closed list of states.

| Record | Home | States |
|:--|:--|:--|
| `business-record/spending.expense` | `docs/domain/modules/spending/expenses/README.md` | Submitted, Approved, Rejected, Reimbursed |
| `business-record/spending.receipt` | `docs/domain/modules/spending/receipts/README.md` | Attached, Removed |
| `business-record/spending.policy` | `docs/domain/modules/spending/policies/README.md` | Active, Retired |

An expense is one work cost an employee submitted. A receipt is proof of payment attached to an expense. The policy is the company spending policy and its receipt threshold. The expense page below shows the full shape, with its rule and event entries in `records`:

```json
{
  "type": "business-record",
  "id": "business-record/spending.expense",
  "title": "Expense",
  "owner": "expenses-team",
  "status": "approved",
  "codeName": "Expense",
  "states": [
    "Submitted",
    "Approved",
    "Rejected",
    "Reimbursed"
  ],
  "records": [
    {
      "type": "rule",
      "id": "rule/expense.receipt-required-above-threshold",
      "title": "Receipt required above threshold",
      "owner": "expenses-team",
      "status": "approved",
      "kind": "checked-before",
      "enforcedBy": "validator",
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
      "owner": "expenses-team",
      "status": "approved",
      "kind": "checked-before",
      "enforcedBy": "aggregate",
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
      "owner": "expenses-team",
      "status": "approved",
      "kind": "always-true",
      "enforcedBy": "aggregate",
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
      "owner": "expenses-team",
      "status": "approved",
      "kind": "checked-before",
      "enforcedBy": "aggregate",
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
      "owner": "expenses-team",
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
      "owner": "expenses-team",
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
      "owner": "expenses-team",
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
      "owner": "expenses-team",
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

## The rules

A rule is one testable commitment about what stays true. Each rule names its kind, what enforces it, which use cases it governs, and which requirement it fulfills. The 6 spending rules are:

| Rule | Statement | Kind | Enforced by |
|:--|:--|:--|:--|
| `rule/expense.receipt-required-above-threshold` | An expense above the policy threshold needs a receipt. | checked-before | validator |
| `rule/expense.approver-is-not-submitter` | An approver is not the submitter. | checked-before | aggregate |
| `rule/expense.reimbursed-once` | An expense is reimbursed at most once. | always-true | aggregate |
| `rule/expense.approved-before-reimbursement` | An expense is reimbursed only after approval. | checked-before | aggregate |
| `rule/receipt.attaches-before-decision` | A receipt attaches before the expense is decided. | checked-before | aggregate |
| `rule/policy.threshold-never-negative` | A threshold is never negative. | always-true | aggregate |

Each rule governs the use cases it guards and fulfills one approval requirement:

| Rule | Governs | Fulfills |
|:--|:--|:--|
| `rule/expense.receipt-required-above-threshold` | `use-case/spending.submit-expense` | `requirement/approval.receipt-over-threshold` |
| `rule/expense.approver-is-not-submitter` | `use-case/spending.approve-expense` | `requirement/approval.no-self-approval` |
| `rule/expense.reimbursed-once` | `use-case/spending.reimburse-expense` | `requirement/approval.single-reimbursement` |
| `rule/expense.approved-before-reimbursement` | `use-case/spending.reimburse-expense` | `requirement/approval.single-reimbursement` |
| `rule/receipt.attaches-before-decision` | `use-case/spending.attach-receipt` | `requirement/approval.receipt-over-threshold` |
| `rule/policy.threshold-never-negative` | `use-case/spending.set-receipt-threshold` | `requirement/approval.receipt-over-threshold` |

Each rule names the refusal its use case returns when the rule fails: `rule/expense.receipt-required-above-threshold` names `result/submit-expense.receipt-missing`, `rule/expense.approver-is-not-submitter` names `result/approve-expense.own-expense`, `rule/expense.reimbursed-once` names `result/reimburse-expense.already-reimbursed`, `rule/expense.approved-before-reimbursement` names `result/reimburse-expense.not-approved`, `rule/receipt.attaches-before-decision` names `result/attach-receipt.expense-decided`, and `rule/policy.threshold-never-negative` names `result/set-receipt-threshold.negative-threshold`. Each rule lives as an entry on its business record page, so the rule and the state it guards change in one edit.

## Actors, roles, and permissions

Access runs one chain: an actor has a role at a scope, the role allows permissions, and the use case names the permissions it needs. Expenses keeps 3 actors, each with one role:

| Actor | Kind | Role |
|:--|:--|:--|
| `actor/employee` | person | `role/employee` at self |
| `actor/manager` | person | `role/approver` at team |
| `actor/finance` | person | `role/finance` at platform |

An employee submits expenses and attaches receipts. A manager approves or rejects expenses. Finance reimburses approved expenses. The 3 roles allow these permissions:

| Role | Scope | Allows |
|:--|:--|:--|
| `role/employee` | self | `permission/submit-expense`, `permission/list-expenses` |
| `role/approver` | team | `permission/approve-expense`, `permission/list-expenses`, `permission/manage-policy` |
| `role/finance` | platform | `permission/reimburse-expense`, `permission/list-expenses`, `permission/export-expenses` |

Permissions live as entries on one list page at `docs/domain/permissions.md`. Each of the 6 entries names one allowed action with its code:

| Permission | Code | Meaning |
|:--|:--|:--|
| `permission/submit-expense` | submit-expense | Submit an expense and attach receipts. |
| `permission/approve-expense` | approve-expense | Approve or reject a submitted expense. |
| `permission/reimburse-expense` | reimburse-expense | Reimburse an approved expense. |
| `permission/list-expenses` | list-expenses | Read own expenses. |
| `permission/manage-policy` | manage-policy | Set the receipt threshold. |
| `permission/export-expenses` | export-expenses | Export approved expenses for finance. |

Submit expense names `permission/submit-expense` in its `needs` field, which applies `litespec/core/model#authorize-access-through-the-permission-chain`: a use case names the permissions it needs, so nobody guesses who may run it.

## Entry points

An entry point is one way people or systems reach the product. Expenses lists one on one page at `docs/domain/entry-points.md`:

| Entry point | Kind |
|:--|:--|
| `entry-point/expenses-app` | web-app |

Employees reach spending through the expenses app, and every spending use case names it in `reachedThrough`.

## One use case tying them together

A use case is one command or query with its permissions, results, and cases. Submit expense is a command: an employee submits a work expense with a receipt through the expenses app. Its record names the permission it needs, the entry point it is reached through, the event it raises, and the requirement it fulfills. Its result and case entries live in `records`, which is the shape the record schema defines.

```json
{
  "type": "use-case",
  "id": "use-case/spending.submit-expense",
  "title": "Submit expense",
  "owner": "expenses-team",
  "status": "approved",
  "operation": "command",
  "needs": [
    "permission/submit-expense"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/expenses-app"
  ],
  "raises": [
    "event/expense.expense-submitted"
  ],
  "reactsTo": [],
  "fulfills": [
    "requirement/approval.receipt-over-threshold"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/submit-expense.submitted",
      "title": "Submitted",
      "owner": "expenses-team",
      "outcome": "success",
      "httpStatus": 201,
      "meaning": "The expense is submitted."
    },
    {
      "type": "result",
      "id": "result/submit-expense.receipt-missing",
      "title": "Receipt missing",
      "owner": "expenses-team",
      "outcome": "refusal",
      "code": "failure/spending.receipt_missing",
      "httpStatus": 422,
      "meaning": "The expense is above the receipt threshold and carries no receipt."
    },
    {
      "type": "case",
      "id": "case/submit-expense.submitting-with-a-receipt-succeeds",
      "title": "Submitting with a receipt succeeds",
      "owner": "expenses-team",
      "status": "approved",
      "situation": "An employee paid for a train ticket and kept the receipt.",
      "action": "The employee submits the expense with the receipt.",
      "result": "result/submit-expense.submitted",
      "expect": "The expense is submitted."
    }
  ]
}
```

The record ends in a success result and names its refusal, which applies `litespec/core/model#give-every-use-case-its-results`. The success result returns 201, the refusal carries the failure code `failure/spending.receipt_missing` with 422, and the case pairs one situation with the success result so a test can prove it. The receipt rule governs this use case, the employee role allows its permission, and the journey submit-and-reimburse reaches it among its steps.

Next, [A Use Case in Code](a-use-case-in-code.md) follows this record into .NET code and tests.
