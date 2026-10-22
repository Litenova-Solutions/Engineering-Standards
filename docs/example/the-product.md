# The Expenses Product

## Intent

Expenses is the small product the example follows: employees submit work expenses with receipts, managers approve or reject them, and finance reimburses the approved ones. This page states what that product is and why through 9 records, each a short page stating one piece of product intent: the product brief, the goal, the problem, the feature, the requirements, the research, the decision, the constraint, and the journey. Each record below shows the shape a project writes, with JSON taken from `examples/expenses/docs/`, so a team sees what written intent looks like before the example turns it into modules, code, and checks.

## Where This Page Sits

```text
PRODUCT  Expenses: submit, approve, reimburse          <- this page
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
```

## The Product Brief

A [product](../reference/glossary.md) record states what is built, for whom, and what is excluded. The Expenses brief below carries the fields every product record carries: a boundary that names what the product does, a `neverDoes` list that names what it refuses, and an audience of actors. It lives at `docs/product/brief.md`, the home the [Project Model](../core/model.md) names for the single product page, which applies `litespec/core/model#write-every-record-in-its-home`.

```json
{
  "type": "product",
  "id": "product/expenses",
  "title": "Expenses",
  "owner": "expenses-team",
  "status": "approved",
  "boundary": "Expenses submits, approves, and reimburses work expenses with receipts.",
  "neverDoes": [
    "The product never pays an expense twice.",
    "The product never approves without a manager."
  ],
  "audience": [
    "actor/employee",
    "actor/manager",
    "actor/finance"
  ]
}
```

The block above opens the page between two lines that carry only `---`, the specification metadata block that `litespec/core/authoring#declare-structured-specification-metadata` on the [Authoring Standard](../core/authoring.md) defines. Its common fields, `type`, `id`, `title`, `owner`, and `status`, appear on every record in this example, which applies `litespec/core/model#state-the-common-fields-on-every-record`. The body below the block holds one Summary section: employees submit and attach, managers approve and reject, and finance reimburses.

## The Goal

A goal record states one measurable outcome the product serves, with the measure, the target, and the date it serves it by. Expenses keeps one: every submitted expense is decided within five business days. It lives at `docs/product/goals/decided-in-days.md`, which applies `litespec/core/product#state-each-goal-with-its-measure` on [Product Intent](../core/product.md).

```json
{
  "type": "goal",
  "id": "goal/decided-in-days",
  "title": "Decided in Days",
  "owner": "expenses-team",
  "status": "approved",
  "statement": "Every submitted expense is decided within five business days.",
  "measure": "Median hours from submission to decision.",
  "target": "Under 120 hours.",
  "by": "2026-12-31"
}
```

The body below the block holds one Why It Matters section: employees plan around reimbursements, and a late decision holds their money. The goal carries no authority of its own: it explains why the approval reminders feature exists, and the feature serves it through a `serves` link.

## The Problem

A problem record states one pain someone has today. Expenses keeps one: submitted expenses wait weeks for a decision, so employees chase managers by email. It lives at `docs/product/problems/expenses-wait-weeks.md`, and its `affects` link names the employee actor, which applies `litespec/core/product#state-each-problem-with-its-evidence`.

```json
{
  "type": "problem",
  "id": "problem/expenses-wait-weeks",
  "title": "Expenses Wait Weeks",
  "owner": "expenses-team",
  "status": "approved",
  "affects": [
    "actor/employee"
  ],
  "statement": "Submitted expenses wait weeks for a decision, so employees chase managers by email."
}
```

The statement stays to one sentence, and the page body adds a Situation section with one more: decisions arrive late without notice. Its Evidence section cites the benchmark research below: small companies decide within one week, while Expenses averages three. Later records answer this problem: the approval reminders feature solves it, and the approval requirements bound it.

## The Feature

A feature record states what the product offers against a problem, with its state and the problem it solves. Expenses keeps one: managers get a reminder for expenses waiting past three days. It lives at `docs/product/features/approval-reminders.md`, it solves the waiting problem and serves the five-day goal, which applies `litespec/core/product#state-each-feature-with-its-state`.

```json
{
  "type": "feature",
  "id": "feature/approval-reminders",
  "title": "Approval Reminders",
  "owner": "expenses-team",
  "status": "approved",
  "state": "shipped",
  "solves": [
    "problem/expenses-wait-weeks"
  ],
  "serves": [
    "goal/decided-in-days"
  ]
}
```

The body below the block holds one Offering section: the reminder names the expense and its waiting time, and expenses decided in time never trigger one. The feature is the thread this example follows down the tree: the requirements below name it in their `feature` links, and the reminder reaction in [Modules and Records](modules-and-records.md) carries it out.

## The Requirements

A requirement states one behavior the product shows or one guarantee it keeps. Expenses groups its 4 approval requirements as entries on one requirement page at `docs/product/spending/approval.md`. Each entry carries its own identifier, title, kind, statement, one-line rationale, and links, which applies `litespec/core/product#identify-every-requirement` and `litespec/core/product#explain-each-requirement-in-one-line`.

```json
{
  "type": "requirement-page",
  "title": "Approval",
  "owner": "expenses-team",
  "status": "approved",
  "records": [
    {
      "type": "requirement",
      "id": "requirement/approval.decided-within-five-days",
      "title": "Decided within five days",
      "owner": "expenses-team",
      "status": "approved",
      "kind": "functional",
      "statement": "Each submitted expense is decided within five business days.",
      "rationale": "Late decisions stall employees and payouts.",
      "feature": [
        "feature/approval-reminders"
      ],
      "basedOn": [
        "research/approval-time-benchmarks"
      ]
    },
    {
      "type": "requirement",
      "id": "requirement/approval.receipt-over-threshold",
      "title": "Receipt over threshold",
      "owner": "expenses-team",
      "status": "approved",
      "kind": "functional",
      "statement": "An expense above the receipt threshold carries a receipt.",
      "rationale": "Proof above the line keeps the tax file defensible.",
      "feature": [
        "feature/approval-reminders"
      ],
      "basedOn": [
        "constraint/tax-receipt-retention"
      ]
    },
    {
      "type": "requirement",
      "id": "requirement/approval.no-self-approval",
      "title": "No self approval",
      "owner": "expenses-team",
      "status": "approved",
      "kind": "functional",
      "statement": "Nobody approves their own expense.",
      "rationale": "A second pair of eyes keeps approvals honest.",
      "feature": [
        "feature/approval-reminders"
      ],
      "basedOn": []
    },
    {
      "type": "requirement",
      "id": "requirement/approval.single-reimbursement",
      "title": "Single reimbursement",
      "owner": "expenses-team",
      "status": "approved",
      "kind": "functional",
      "statement": "An approved expense is reimbursed at most once.",
      "rationale": "A double payment is hard to take back.",
      "feature": [
        "feature/approval-reminders"
      ],
      "basedOn": []
    }
  ]
}
```

All 4 requirements are functional requirements: each states something the product does. Their identifiers carry the topic name, so `requirement/approval.decided-within-five-days` belongs to approval. The page body tells the story around them in 9 sections, from Summary through an Example in which Ava submits a 48.90 EUR train fare on Monday, Ben approves it on Tuesday, and Cara reimburses it on Friday. Rules and use cases point back at these identifiers with `fulfills` links, which [Modules and Records](modules-and-records.md) shows.

## The Research

A research record states one outside fact that informs a choice, with the question it answers and the sources it read. Expenses keeps one: small companies decide expenses within one week. It lives at `docs/research/approval-time-benchmarks.md`, which applies `litespec/core/product#record-research-with-read-sources`.

```json
{
  "type": "research",
  "id": "research/approval-time-benchmarks",
  "title": "Approval Time Benchmarks",
  "owner": "expenses-team",
  "status": "approved",
  "sources": [
    {
      "url": "https://example.com/expense-study",
      "read": "2026-02-10"
    }
  ],
  "question": "How fast do small companies decide expenses?"
}
```

The body below the block holds an Answer section with its confidence and a Notes on Sources section. Research informs without deciding: the five-day requirement cites it in `basedOn`, and the decision below settles the threshold the requirement leaves open.

## The Decision

A decision record states one dated choice with the options it weighed. Expenses chose a 25 EUR receipt threshold after a finance review in February 2026. The record lives at `docs/product/decisions/0001-receipt-threshold.md`, and its `decides` link names the receipt requirement it settles, which applies `litespec/core/model#name-what-every-decision-decides`. Each option carries what speaks for and against it, which applies `litespec/core/product#record-each-choice-as-a-decision`.

```json
{
  "type": "decision",
  "id": "decision/0001-receipt-threshold",
  "title": "Receipt Threshold",
  "owner": "expenses-team",
  "status": "approved",
  "decided": "2026-03-01",
  "options": [
    {
      "name": "0 EUR",
      "for": "Every expense carries proof.",
      "against": "Tiny expenses cost more to file than they pay."
    },
    {
      "name": "25 EUR",
      "for": "Small expenses stay light to submit.",
      "against": "Some fraud slips under the line."
    },
    {
      "name": "75 EUR",
      "for": "Almost nothing needs a receipt.",
      "against": "Finance cannot defend the tax file."
    }
  ],
  "chosen": "25 EUR",
  "changeWhen": "Finance sees abuse or friction.",
  "decides": [
    "requirement/approval.receipt-over-threshold"
  ],
  "basedOn": []
}
```

The page body carries 4 short sections: Context, Decision, Consequences, and Evidence with Confidence. The evidence cites the finance review of February 2026, and the consequences note that small expenses stay light to submit. A later change would replace this record rather than edit it, so the reasoning stays readable.

## The Constraint

A constraint states one outside rule the product obeys. Expenses answers the national tax law on receipts: receipts stay kept for 7 years because Expenses stores receipts for reimbursed expenses. The record lives at `docs/product/constraints/tax-receipt-retention.md`, which applies `litespec/core/product#answer-every-constraint`.

```json
{
  "type": "constraint",
  "id": "constraint/tax-receipt-retention",
  "title": "Tax Receipt Retention",
  "owner": "expenses-team",
  "status": "approved",
  "source": "National tax law keeps business receipts for 7 years.",
  "category": "organizational",
  "applies": true,
  "appliesBecause": "Expenses stores receipts for reimbursed expenses."
}
```

The `applies` field answers whether the outside rule covers this product, and `appliesBecause` gives the reason in one sentence. A project answers this question for every constraint it lists, even when the answer is that none applies. The receipt requirement cites this constraint in `basedOn`, so the tax file traces to the outside rule that demands it.

## The Journey

A journey record orders use cases toward one goal for one actor. Expenses keeps one: an employee submits an expense and receives reimbursement. It lives at `docs/product/journeys/submit-and-reimburse.md`, it fulfills the five-day requirement, and each step names what it produces in `gives`, which applies `litespec/core/product#order-each-journey-toward-one-goal`.

```json
{
  "type": "journey",
  "id": "journey/submit-and-reimburse",
  "title": "Submit and Reimburse",
  "owner": "expenses-team",
  "status": "approved",
  "actor": "actor/employee",
  "goal": "Submit an expense and receive reimbursement.",
  "steps": [
    {
      "useCase": "use-case/spending.submit-expense",
      "actor": "actor/employee",
      "requires": [],
      "gives": "A submitted expense."
    },
    {
      "useCase": "use-case/spending.attach-receipt",
      "actor": "actor/employee",
      "requires": [],
      "gives": "A receipt on the expense."
    },
    {
      "useCase": "use-case/spending.approve-expense",
      "actor": "actor/manager",
      "requires": [],
      "gives": "An approved expense."
    },
    {
      "useCase": "use-case/spending.reject-expense",
      "actor": "actor/manager",
      "requires": [],
      "gives": "A rejected expense."
    },
    {
      "useCase": "use-case/spending.reimburse-expense",
      "actor": "actor/finance",
      "requires": [],
      "gives": "A reimbursed expense."
    },
    {
      "useCase": "use-case/spending.list-expenses",
      "actor": "actor/employee",
      "requires": [],
      "gives": "The employee expense list."
    },
    {
      "useCase": "use-case/spending.set-receipt-threshold",
      "actor": "actor/manager",
      "requires": [],
      "gives": "A new receipt threshold."
    },
    {
      "useCase": "use-case/spending.export-expenses",
      "actor": "actor/finance",
      "requires": [],
      "gives": "An export batch."
    },
    {
      "useCase": "use-case/spending.erase-personal-data",
      "actor": "actor/finance",
      "requires": [],
      "gives": "An expense without personal data."
    }
  ],
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ]
}
```

The 9 steps run from submission to erasure: the employee submits, attaches, and lists; the manager approves or rejects and sets the threshold; finance reimburses, exports, and erases. The page body holds an Example section following Ava, Ben, and Cara through one week, a Before It Starts section with the state preconditions, and a Between the Steps section with the failure branches.

Next, [Modules and Records](modules-and-records.md) organizes this intent into the spending module and its records, rules, and access chain.
