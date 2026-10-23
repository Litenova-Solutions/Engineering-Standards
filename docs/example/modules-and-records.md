# Modules and Records

## Intent

The spending module is the Claimwick example's one business area: it turns product intent into operations by organizing the business state the company tracks, the rules that bind it, who may act on it, and the messages, work, and tunables around it. This page shows each piece as the project writes it: the module record, 3 aggregates (one unit of consistent state each) for expenses, receipts, and the policy store with their states, transitions, data classes, and data, the rules that bind them, the access chain of actors, roles, permissions, and entry points with the outside system for payouts, the Submit expense and List expenses use cases with their results and scenarios, and the reaction, jobs, notifications, setting, integration event, and retention row around them.

## The Spending Module

A module is one business area that organizes language, records, use cases, and ownership. Claimwick keeps one module, spending, which tracks expenses, receipts, and the policy. Its record lives at `docs/behavior/modules/spending/README.md`, and its empty `dependsOn` list states that it depends on no other module, which applies `litespec/core/behavior#state-every-module-dependency` on [Behavior Records](../core/behavior.md).

```json
{
  "type": "module",
  "id": "module/spending",
  "title": "Spending",
  "owner": "claimwick-team",
  "status": "reviewed",
  "summary": "Spending submits, decides, reimburses and exports work expenses.",
  "dependsOn": []
}
```

Each aggregate below belongs to this module through its identifier: `aggregate/spending.expense` names spending before the dot, so containment needs no link field.

## Aggregates and Their States

An aggregate is one unit of business state that stays consistent and changes in one step. Spending keeps 3, each on its own page under the module folder. Each aggregate declares its kind and its lifecycle as states entries with a name and a meaning, which applies `litespec/core/behavior#declare-the-kind-of-every-aggregate` and `litespec/core/behavior#model-each-aggregate-lifecycle-with-states`.

| Record | Home | Kind | States |
|:--|:--|:--|:--|
| `aggregate/spending.expense` | `docs/behavior/modules/spending/expenses/README.md` | entity | Submitted, Approved, Rejected, Reimbursed |
| `aggregate/spending.receipt` | `docs/behavior/modules/spending/receipts/README.md` | entity | Attached, Removed |
| `aggregate/spending.policy` | `docs/behavior/modules/spending/policies/README.md` | store | None |

An expense is one work cost an employee submitted. A receipt is proof of payment attached to an expense. The policy is a store: it holds the current receipt threshold value, names the spending settings store as its owner, and carries no states, because no invariant guards the stored value. The setting record below declares the threshold default and bounds. The store names its owner, which applies `litespec/core/behavior#name-the-owner-of-every-store`. Each expense state carries its meaning: Submitted waits for a decision, Approved and Rejected record a manager decision, and Reimbursed records the finance payout.

## Expense Transitions and Data

The expense aggregate connects its states through transitions and declares its data classes with their erasure positions. The Transitions table below is the page body the builder parses: each row names the state it leaves, the state it enters, and the use case behind the move, which applies `litespec/core/behavior#connect-every-state-through-transitions`.

| From | To | Triggered By |
|:--|:--|:--|
| Submitted | Approved | `use-case/spending.approve-expense` |
| Submitted | Rejected | `use-case/spending.reject-expense` |
| Approved | Reimbursed | `use-case/spending.reimburse-expense` |

The data classes group fields by their shared fate on erasure, which applies `litespec/core/behavior#declare-every-data-class-with-its-erasure-position`:

| Data class | Classification | Fields | On erasure | Enforced by |
|:--|:--|:--|:--|:--|
| `expense-money` | internal | amount, state, approver, receipt | retain for 7 years by statute | record-expiry |
| `submitter` | personal | employee | erase on approved request | `job/spending.erase-expired-personal-data` |

The Data table names each field the aggregate holds with its meaning, data class, and classification, which applies `litespec/core/behavior#classify-every-aggregate-data-field`.

| Name | Meaning | Data Class | Classification |
|:--|:--|:--|:--|
| employee | The employee who submitted the expense. | submitter | personal |
| amount | The exact amount with its currency. | expense-money | internal |
| receipt | The proof of payment, when one is attached. | expense-money | internal |
| state | The lifecycle state of the expense. | expense-money | internal |

The employee field is personal data in the `submitter` class, so the erase job and the erasure use case cover it, and the retention schedule below schedules it. The receipt aggregate carries its own data class for the filed receipt; the policy store holds one internal field, the current threshold value.

## The Full Expense Record

The expense page below shows the full shape, with its states, data classes, and its rule and event entries in `records`:

```json
{
  "type": "aggregate",
  "id": "aggregate/spending.expense",
  "title": "Expense",
  "owner": "claimwick-team",
  "status": "reviewed",
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
  "dataClasses": [
    {
      "name": "expense-money",
      "classification": "internal",
      "fields": ["amount", "state", "approver", "receipt"],
      "onErasure": "retain",
      "basis": "statute",
      "period": "P7Y",
      "enforcedBy": "record-expiry",
      "reach": "own-tenant"
    },
    {
      "name": "submitter",
      "classification": "personal",
      "fields": ["employee"],
      "onErasure": "erase",
      "basis": "business",
      "period": "none (on-demand)",
      "enforcedBy": "job/spending.erase-expired-personal-data",
      "reach": "own-tenant"
    }
  ],
  "records": [
    {
      "type": "rule",
      "id": "rule/expense.receipt-required-above-threshold",
      "title": "Receipt required above threshold",
      "kind": "precondition",
      "statement": "An expense above the policy threshold needs a receipt.",
      "governs": [
        "use-case/spending.submit-expense"
      ],
      "refusal": "result/submit-expense.receipt-missing",
      "fulfills": [
        "requirement/approval.receipt-over-threshold"
      ]
    },
    {
      "type": "rule",
      "id": "rule/expense.approver-is-not-submitter",
      "title": "Approver is not submitter",
      "kind": "precondition",
      "statement": "An approver is not the submitter.",
      "governs": [
        "use-case/spending.approve-expense"
      ],
      "refusal": "result/approve-expense.own-expense",
      "fulfills": [
        "requirement/approval.no-self-approval"
      ]
    },
    {
      "type": "rule",
      "id": "rule/expense.reimbursed-once",
      "title": "Reimbursed once",
      "kind": "invariant",
      "statement": "An expense is reimbursed at most once.",
      "governs": [
        "use-case/spending.reimburse-expense"
      ],
      "refusal": "result/reimburse-expense.already-reimbursed",
      "fulfills": [
        "requirement/approval.single-reimbursement"
      ]
    },
    {
      "type": "rule",
      "id": "rule/expense.approved-before-reimbursement",
      "title": "Approved before reimbursement",
      "kind": "precondition",
      "statement": "An expense is reimbursed only after approval.",
      "governs": [
        "use-case/spending.reimburse-expense"
      ],
      "refusal": "result/reimburse-expense.not-approved",
      "fulfills": [
        "requirement/approval.single-reimbursement"
      ]
    },
    {
      "type": "event",
      "id": "event/expense.submitted",
      "title": "Expense submitted",
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
      "id": "event/expense.approved",
      "title": "Expense approved",
      "meaning": "An expense was approved.",
      "carries": [
        "expenseId",
        "approvedBy",
        "decidedAt"
      ]
    },
    {
      "type": "event",
      "id": "event/expense.rejected",
      "title": "Expense rejected",
      "meaning": "An expense was rejected.",
      "carries": [
        "expenseId",
        "rejectedBy",
        "decidedAt"
      ]
    },
    {
      "type": "event",
      "id": "event/expense.reimbursed",
      "title": "Expense reimbursed",
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

The receipt page carries one rule, `rule/receipt.attaches-before-decision`, and one event, `event/receipt.attached`. Every entry states what happened or what stays true, and each names the data it carries or the requirement it fulfills.

## The Rules

A rule is one testable commitment about what stays true. Each rule states its kind and names the refusal its use case returns when the rule breaks, which applies `litespec/core/behavior#state-each-rule-with-its-kind` and `litespec/core/behavior#name-the-refusal-a-broken-rule-produces`. The 6 spending rules are:

| Rule | Statement | Kind |
|:---|:---|:---|
| `rule/expense.receipt-required-above-threshold` | An expense above the policy threshold needs a receipt. | precondition |
| `rule/expense.approver-is-not-submitter` | An approver is not the submitter. | precondition |
| `rule/expense.reimbursed-once` | An expense is reimbursed at most once. | invariant |
| `rule/expense.approved-before-reimbursement` | An expense is reimbursed only after approval. | precondition |
| `rule/receipt.attaches-before-decision` | A receipt attaches before the expense is decided. | precondition |
| `rule/spending.receipt-filed-once` | A receipt file supports one expense across spending. | cross-aggregate |

Each rule governs the use cases or aggregates it guards and fulfills one approval requirement:

| Rule | Governs | Fulfills |
|:--|:--|:--|
| `rule/expense.receipt-required-above-threshold` | `use-case/spending.submit-expense` | `requirement/approval.receipt-over-threshold` |
| `rule/expense.approver-is-not-submitter` | `use-case/spending.approve-expense` | `requirement/approval.no-self-approval` |
| `rule/expense.reimbursed-once` | `use-case/spending.reimburse-expense` | `requirement/approval.single-reimbursement` |
| `rule/expense.approved-before-reimbursement` | `use-case/spending.reimburse-expense` | `requirement/approval.single-reimbursement` |
| `rule/receipt.attaches-before-decision` | `use-case/spending.attach-receipt` | `requirement/approval.receipt-over-threshold` |
| `rule/spending.receipt-filed-once` | `aggregate/spending.receipt` | `requirement/approval.receipt-over-threshold` |

Each rule names the refusal its use case returns when the rule fails: `rule/expense.receipt-required-above-threshold` names `result/submit-expense.receipt-missing`, `rule/expense.approver-is-not-submitter` names `result/approve-expense.own-expense`, `rule/expense.reimbursed-once` names `result/reimburse-expense.already-reimbursed`, `rule/expense.approved-before-reimbursement` names `result/reimburse-expense.not-approved`, and `rule/receipt.attaches-before-decision` names `result/attach-receipt.expense-decided`. Each rule but the last lives as an entry on its aggregate page, so the rule and the state it guards change in one edit. The cross-aggregate rule lives on the spending rule page at `docs/behavior/rules/spending-rules.md`, which applies `litespec/core/behavior#keep-cross-aggregate-rules-on-a-rule-page`.

## Actors, Roles, and Permissions

Access runs one chain: an actor holds a role at a scope, the role allows permissions, and each use case declares its access against one grant. Claimwick keeps 3 actors, each with one role:

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

Permissions live as entries on one list page at `docs/behavior/access/permissions.md`. Each of the 7 entries names one allowed action with its meaning:

| Permission | Meaning |
|:--|:--|
| `permission/submit-expense` | Submit an expense and attach receipts. |
| `permission/approve-expense` | Approve or reject a submitted expense. |
| `permission/reimburse-expense` | Reimburse an approved expense. |
| `permission/list-expenses` | Read own expenses. |
| `permission/manage-policy` | Set the receipt threshold. |
| `permission/export-expenses` | Export approved expenses for finance. |
| `permission/erase-personal-data` | Erase the personal data of a decided expense. |

Submit expense declares `permission/submit-expense` as its access grant with session auth and its own tenant scope, which applies `litespec/core/access#declare-access-on-every-use-case`: a use case declares who may run it, so nobody guesses.

## Entry Points

An entry point is one way people or systems reach the product. Claimwick lists 2 on one page at `docs/behavior/access/entry-points.md`, each with its kind and auth, which applies `litespec/core/access#name-every-entry-point-with-its-kind`:

| Entry point | Kind | Auth |
|:--|:--|:--|
| `entry-point/claimwick-app` | browser | session |
| `entry-point/reminder-job` | job | system |

Employees reach spending through the expenses app, and every spending use case but the reminder command names it in `reachedThrough`. The reminder command runs through the nightly reminder job instead.

## The External System

An external system is one outside system the product exchanges data with. Claimwick keeps one: the payout bank moves reimbursed money to employees. Its record lives at `docs/behavior/external-systems/payout-bank.md`, declares its operations with their timeouts, retries, and responses, and routes erasure through an operation, which applies `litespec/core/access#declare-every-operation-on-every-external-system` and `litespec/core/access#declare-erasure-for-every-external-system`.

```json
{
  "type": "external-system",
  "id": "external-system/payout-bank",
  "title": "Payout Bank",
  "owner": "claimwick-team",
  "status": "reviewed",
  "actor": "actor/finance",
  "operations": [
    {
      "name": "submit-batch",
      "direction": "out",
      "timeout": "PT30S",
      "onTimeout": "Retry once, then fail the batch for finance to re-send.",
      "retries": "Once after 5 minutes.",
      "response": "A batch receipt with the accepted payout count."
    },
    {
      "name": "purge-batch",
      "direction": "out",
      "timeout": "PT30S",
      "onTimeout": "Retry once, then alert finance.",
      "retries": "Once after 5 minutes.",
      "response": "A purge receipt per batch."
    }
  ],
  "erasure": "call purge-batch",
  "sends": [
    "Approved payouts as one bank file per batch."
  ],
  "receives": [
    "A settlement report per payout batch."
  ],
  "failure": "The bank rejects a payout file, and finance fixes the entry and re-sends the batch."
}
```

The reimburse use case raises the reimbursement event and publishes the payout integration event, and the payout batch carries it to this bank. The settlement report closes the loop: finance reads back one report per batch.

## The Use Cases

Spending keeps 10 use cases: 9 commands and 1 query. Each one is a command or a query, serves journey steps or goals, fulfills requirements, declares its access, and states what it changes and how the writes hold together, which applies `litespec/core/behavior#give-each-use-case-a-command-or-query-kind`, `litespec/core/behavior#state-the-consistency-of-every-use-case`, and `litespec/core/behavior#declare-every-effect-with-one-verb-and-its-timing`.

| Use case | Kind | Serves | Grant | Changes | Consistency | Effects |
|:--|:--|:--|:--|:--|:--|:--|
| `use-case/spending.submit-expense` | command | `journey/submit-and-reimburse#s1` | `permission/submit-expense` | expense | atomic | None |
| `use-case/spending.attach-receipt` | command | `journey/submit-and-reimburse#s1` | `permission/submit-expense` | receipt | atomic | None |
| `use-case/spending.approve-expense` | command | `journey/submit-and-reimburse#s2` | `permission/approve-expense` | expense | atomic | None |
| `use-case/spending.reject-expense` | command | `journey/submit-and-reimburse#s2` | `permission/approve-expense` | expense | atomic | None |
| `use-case/spending.reimburse-expense` | command | `journey/submit-and-reimburse#s3` | `permission/reimburse-expense` | expense | atomic | publishes `integration-event/payout.requested` after commit |
| `use-case/spending.set-receipt-threshold` | command | None | `permission/manage-policy` | policy store | atomic | None |
| `use-case/spending.export-expenses` | command | `journey/submit-and-reimburse#s3` | `permission/export-expenses` | None | None | None |
| `use-case/spending.erase-personal-data` | command | None | `permission/erase-personal-data` | expense | atomic | None |
| `use-case/spending.send-approver-reminder` | command | `journey/submit-and-reimburse#s2` | system | None | None | sends `notification/spending.approver-reminder` async |
| `use-case/spending.list-expenses` | query | `journey/submit-and-reimburse#s4` | `self(permission/list-expenses)` | None | None | None |

Set-receipt-threshold fulfills the receipt requirement, and erase-personal-data fulfills the erasure requirement, so every use case answers Intent through `serves` or `fulfills`. Reimburse carries `money` risk and erase carries `personal-data` risk, so both are tier 1 and need explicit review. The reminder command runs under the system grant through the reminder job: no person runs it.

## One Use Case Tying Them Together

Submit expense is a command: an employee submits a work expense with a receipt through the expenses app. Its record serves the journey's first step, fulfills the receipt requirement, declares its access, names its input with sources and classifications, changes the expense while reading the policy store, commits atomically, and raises the submitted event. Its result and scenario entries live in `records`, which is the shape the record schema defines.

```json
{
  "type": "use-case",
  "id": "use-case/spending.submit-expense",
  "title": "Submit Expense",
  "owner": "claimwick-team",
  "status": "reviewed",
  "approvedBy": "claimwick-team",
  "approvedOn": "2026-03-15",
  "approvedHash": "7bd2e94a11c0...",
  "kind": "command",
  "serves": [
    "journey/submit-and-reimburse#s1"
  ],
  "fulfills": [
    "requirement/approval.receipt-over-threshold"
  ],
  "access": {
    "auth": ["session"],
    "grant": "permission/submit-expense",
    "tenant": "own"
  },
  "reachedThrough": [
    "entry-point/claimwick-app"
  ],
  "input": [
    {
      "name": "amount",
      "meaning": "The exact amount claimed.",
      "rules": ["A positive decimal with at most two fraction digits."],
      "source": "caller",
      "classification": "internal"
    },
    {
      "name": "currency",
      "meaning": "The ISO 4217 code of the amount.",
      "rules": ["A three-letter code."],
      "source": "caller",
      "classification": "internal"
    },
    {
      "name": "receiptId",
      "meaning": "The attached receipt, required above the threshold.",
      "source": "caller",
      "classification": "internal"
    },
    {
      "name": "employeeId",
      "meaning": "The submitting employee.",
      "source": "claim",
      "classification": "personal"
    }
  ],
  "output": [
    {
      "name": "expenseId",
      "meaning": "The new expense identity."
    }
  ],
  "changes": ["aggregate/spending.expense"],
  "reads": ["aggregate/spending.policy"],
  "consistency": { "mode": "atomic" },
  "raises": ["event/expense.submitted"],
  "idempotency": {
    "mode": "key",
    "key": "{employeeId}:{expenseId}",
    "scope": "employee"
  },
  "audit": {
    "reason": "none",
    "target": "expense"
  },
  "records": [
    {
      "type": "result",
      "id": "result/submit-expense.submitted",
      "title": "Submitted",
      "outcome": "success",
      "meaning": "The expense is submitted."
    },
    {
      "type": "result",
      "id": "result/submit-expense.receipt-missing",
      "title": "Receipt missing",
      "outcome": "refusal",
      "code": "spending.receipt-missing",
      "meaning": "The expense is above the receipt threshold and carries no receipt."
    },
    {
      "type": "scenario",
      "id": "scenario/submit-expense.submitting-with-a-receipt-succeeds",
      "title": "Submitting with a receipt succeeds",
      "given": "An employee paid for a train ticket and kept the receipt.",
      "when": "The employee submits the expense with the receipt.",
      "result": "result/submit-expense.submitted",
      "then": "The expense is submitted."
    },
    {
      "type": "scenario",
      "id": "scenario/submit-expense.submitting-above-threshold-without-a-receipt-is-refused",
      "title": "Submitting above threshold without a receipt is refused",
      "given": "An employee paid 48.90 EUR for a train ticket and kept no receipt.",
      "when": "The employee submits the expense without the receipt.",
      "result": "result/submit-expense.receipt-missing",
      "then": "The expense is not submitted."
    }
  ]
}
```

The record ends in named results, which applies `litespec/core/model#give-every-use-case-its-results`: one success and one refusal, and the refusal carries the stable code `spending.receipt-missing`. The generic forbidden and invalid-input results are derived from the access grant and the input rules and never written. The scenarios prove the success and the refusal in given, when, then, which applies `litespec/core/behavior#write-every-scenario-in-given-when-then`. The receipt rule governs this use case, the employee role allows its permission, and the journey's first step is served by it. Its Goal section states the actor intent in one sentence, its What Happens section walks the behavior in order, and its Example section follows Ava submitting her train fare. (Example blocks in these pages omit the approval data the builder writes, except where shown.)

## The Reaction

A reaction answers an event by issuing one use case or sending one notification. When an expense is reimbursed, Claimwick notifies the employee. The reaction lives at `docs/behavior/modules/spending/reactions/notify-on-reimbursement.md`, filed with the spending module whose notification it sends. Its `on` names the domain event, which applies `litespec/core/behavior#trigger-every-reaction-from-a-declared-event`, and it sends exactly one notification and writes no aggregate, which applies `litespec/core/behavior#issue-or-send-from-every-reaction`.

```json
{
  "type": "reaction",
  "id": "reaction/spending.notify-on-reimbursement",
  "title": "Notify on Reimbursement",
  "owner": "claimwick-team",
  "status": "reviewed",
  "on": [
    "event/expense.reimbursed"
  ],
  "sends": "notification/spending.reimbursement-received",
  "reads": [
    "aggregate/spending.expense"
  ],
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ],
  "serves": [
    "journey/submit-and-reimburse#s4"
  ],
  "idempotency": {
    "mode": "state"
  },
  "onFailure": "retry (5, exponential) then dead-letter"
}
```

The reaction serves the journey's last step: the employee sees the reimbursement land because the message says so. Its failure handling retries with backoff before dead-lettering, and repeated firings collapse by state, so the employee is told once.

## The Jobs

A job is scheduled, one-off, or operator work that issues use cases. Claimwick keeps 2 scheduled jobs. The reminder job runs nightly and issues the reminder command once per waiting expense. It lives at `docs/behavior/modules/spending/jobs/remind-approvers.md`, declares its kind with a structured schedule, and states its scope, lease, service level, evidence, and runbook, which applies `litespec/core/behavior#declare-every-job-with-kind-and-structured-schedule`.

```json
{
  "type": "job",
  "id": "job/spending.remind-approvers",
  "title": "Remind Approvers",
  "owner": "claimwick-team",
  "status": "reviewed",
  "kind": "scheduled",
  "schedule": {
    "cron": "0 6 * * *",
    "timezone": "Europe/Amsterdam"
  },
  "scope": "Submitted expenses waiting past three business days without a decision.",
  "batchSize": 200,
  "lease": {
    "name": "remind-approvers",
    "duration": "PT15M"
  },
  "issues": [
    "use-case/spending.send-approver-reminder"
  ],
  "reads": [
    "aggregate/spending.expense"
  ],
  "serviceLevel": "Every waiting expense triggers one reminder per day, per requirement/approval.decided-within-five-days.",
  "evidence": "One log line per reminded expense.",
  "runbook": "runbook/reminder-failures",
  "runsWhere": "api worker",
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ],
  "serves": [
    "journey/submit-and-reimburse#s2"
  ],
  "onFailure": "retry (3, linear) then dead-letter",
  "idempotency": {
    "mode": "state"
  }
}
```

This job carries the approval reminders feature down the tree: the feature promises reminders past three days, the five-day requirement bounds them, and the nightly schedule fires them. The second job, `job/spending.erase-expired-personal-data`, runs weekly and issues `use-case/spending.erase-personal-data` once per decided expense with an approved erasure request, enforcing the `submitter` data class.

## The Notifications

A notification is one person-facing message with its audience, channel, consent, and claims. The approver reminder lives at `docs/behavior/modules/spending/notifications/approver-reminder.md`, names its audience and channel with the consent rule, and claims each promise it makes from a requirement, which applies `litespec/core/behavior#describe-every-notification-with-audience-channel-and-consent` and `litespec/core/behavior#claim-every-notification-promise-from-a-requirement`.

```json
{
  "type": "notification",
  "id": "notification/spending.approver-reminder",
  "title": "Approver Reminder",
  "owner": "claimwick-team",
  "status": "reviewed",
  "template": "approver-reminder",
  "audience": ["actor/manager"],
  "channel": ["email"],
  "consent": "Managers receive reminders as part of the approver role.",
  "frequency": "per-attempt",
  "dedupKey": "reminder:{expenseId}:{date}",
  "params": ["expenseId", "waitingDays"],
  "locale": "the manager profile language",
  "claims": [
    {
      "claim": "The message names the expense and its waiting time.",
      "requirement": "requirement/approval.decided-within-five-days"
    }
  ],
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ]
}
```

The reminder command's `sends` edge carries its own suppression: when the expense was decided overnight, the command sends nothing, and a suppression scenario proves the quiet path. The second notification, `notification/spending.reimbursement-received`, tells the employee once by email that the money is on its way, sent by the reaction above.

## The Settings

A setting is one tunable with its value type, default, range, unit, setter, and bound behavior. The spending settings live on one setting-set page at `docs/behavior/modules/spending/settings.md`. Each commercial or varying default fulfills a requirement, which applies `litespec/core/behavior#hold-every-setting-default-to-a-requirement`.

```json
{
  "type": "setting-set",
  "title": "Spending Settings",
  "owner": "claimwick-team",
  "status": "reviewed",
  "records": [
    {
      "type": "setting",
      "id": "setting/spending.receipt-threshold",
      "title": "Receipt Threshold",
      "valueType": "money",
      "default": "EUR 25",
      "range": "EUR 0..1000",
      "unit": "EUR",
      "setBy": "operator",
      "atBound": "refuse",
      "secret": false,
      "meaning": "An expense above this value needs a receipt.",
      "fulfills": ["requirement/approval.receipt-over-threshold"]
    },
    {
      "type": "setting",
      "id": "setting/spending.reminder-delay",
      "title": "Reminder Delay",
      "valueType": "duration",
      "default": "P3D",
      "range": "P1D..P5D",
      "unit": "days",
      "setBy": "founder",
      "atBound": "refuse",
      "secret": false,
      "meaning": "Submitted expenses wait this long before the first reminder.",
      "fulfills": ["requirement/approval.decided-within-five-days"]
    }
  ]
}
```

The threshold default is the 25 EUR the decision set, and a manager may move it inside the range through the set-threshold use case; a value outside the range is refused. The reminder delay is founder-set, so the nightly job reads a value no operator changes.

## The Query

List expenses is a query: an employee reads their own expenses with the latest state of each. Its record declares its output in `include` groups with freshness and its paging, which applies `litespec/core/behavior#declare-every-query-output` and `litespec/core/behavior#declare-paging-on-every-collection-query`.

```json
{
  "type": "use-case",
  "id": "use-case/spending.list-expenses",
  "title": "List Expenses",
  "owner": "claimwick-team",
  "status": "reviewed",
  "kind": "query",
  "serves": [
    "journey/submit-and-reimburse#s4"
  ],
  "access": {
    "auth": ["session"],
    "grant": "self(permission/list-expenses)",
    "tenant": "own"
  },
  "reachedThrough": [
    "entry-point/claimwick-app"
  ],
  "reads": [
    "aggregate/spending.expense"
  ],
  "output": {
    "include": {
      "rows": {
        "fields": [
          {
            "name": "expenseId",
            "meaning": "The expense identity."
          },
          {
            "name": "amount",
            "meaning": "The amount claimed, with its currency."
          },
          {
            "name": "state",
            "meaning": "The lifecycle state of the expense."
          },
          {
            "name": "submittedAt",
            "meaning": "When the expense was submitted."
          }
        ],
        "classification": "internal",
        "source": ["aggregate/spending.expense"],
        "freshness": "immediate"
      }
    }
  },
  "paging": {
    "order": "submittedAt desc",
    "cursor": "expenseId",
    "defaultLimit": 20,
    "maxLimit": 100
  },
  "idempotency": {
    "mode": "none",
    "reason": "Reads change nothing."
  },
  "records": [
    {
      "type": "result",
      "id": "result/list-expenses.listed",
      "title": "Listed",
      "outcome": "success",
      "meaning": "The expenses are listed."
    },
    {
      "type": "scenario",
      "id": "scenario/list-expenses.listing-own-expenses-succeeds",
      "title": "Listing own expenses succeeds",
      "given": "An employee submitted two expenses.",
      "when": "The employee lists their expenses.",
      "result": "result/list-expenses.listed",
      "then": "Both expenses are listed."
    }
  ]
}
```

The output names the one row group the screen reads: identity, amount, state, and submission time, newest first, read fresh from the expense aggregate. The `self(...)` grant limits the permission to the caller's own records. [The Claimwick Screen](the-screen.md) reads this output through the generated client.

## The Integration Event

A fact that leaves the product is an integration event. When finance reimburses an expense, the payout batch carries a payout request to the bank. The event lives at `docs/behavior/integration-events/payout.requested.md`, states its direction with its CloudEvents type, source, subject, and payload, and translates the domain event, which applies `litespec/core/behavior#describe-every-integration-event-for-its-direction`.

```json
{
  "type": "integration-event",
  "id": "integration-event/payout.requested",
  "title": "Payout Requested",
  "owner": "claimwick-team",
  "status": "reviewed",
  "direction": "out",
  "eventType": "claimwick.payout.requested",
  "source": "/spending/reimbursements",
  "subject": "The reimbursed expense.",
  "payload": [
    {
      "name": "expenseId",
      "meaning": "The reimbursed expense.",
      "classification": "internal"
    },
    {
      "name": "amount",
      "meaning": "The payout amount, with its currency.",
      "classification": "internal"
    }
  ],
  "trust": "payload",
  "translates": "event/expense.reimbursed"
}
```

The reimburse use case declares the event in its `effects` with `publishes` after commit, so the edge from the command to the outside world is declared beside the command.

## The Retention Row

The retention schedule at `docs/behavior/retention-schedule.md` schedules every data class with its basis, period, enforcement, and Intent acceptance, which applies `litespec/core/behavior#schedule-every-data-class-for-retention`. The `submitter` row reads:

```json
{
  "dataClass": "submitter",
  "aggregates": ["aggregate/spending.expense"],
  "basis": "business",
  "period": "none (on-demand)",
  "enforcedBy": "job/spending.erase-expired-personal-data",
  "intent": "requirement/approval.erasure-on-request",
  "processors": [
    {
      "system": "external-system/payout-bank",
      "forwarding": "impossible (settlement records belong to the bank)",
      "acceptedBy": "requirement/approval.erasure-on-request"
    }
  ],
  "conflicts": "Erasure wins for the submitter link; the money facts stay for the statutory seven years, and the erasure receipt records the split."
}
```

The row names what the class covers, what enforces its erasure, the Intent that accepts it, how erasure forwards to the bank, and which side wins when keeping and erasing collide.

Next, [A Use Case in Code](a-use-case-in-code.md) follows the Submit expense record into .NET code and tests.
