# The Claimwick Product

## Intent

Claimwick is the small product the example follows: employees submit work expenses with receipts, managers approve or reject them, and finance reimburses the approved ones. This page states what that product is and why through 9 Intent records, each a short page stating one piece of product intent: the product brief, the goal, the problem, the feature, the requirements, the research, the decision, the constraint, and the journey. Each record below shows the shape a project writes, with JSON taken from `examples/claimwick/docs/`, so a team sees what written intent looks like before the example turns it into Behavior, code, and checks.

## The Product Brief

A [product](../reference/glossary.md) record states what is built, for whom, and what is excluded. The Claimwick brief below carries the fields every product record carries: a boundary that names what the product does, a `neverDoes` list that names what it refuses, and an audience of actors. It lives at `docs/product/brief.md`, the home the [Project Model](../core/model.md) names for the single product page, which applies `litespec/core/model#write-every-record-in-its-home`.

```json
{
  "type": "product",
  "id": "product/claimwick",
  "title": "Claimwick",
  "owner": "claimwick-team",
  "status": "approved",
  "boundary": "Claimwick submits, approves, and reimburses work expenses with receipts.",
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

A goal record states one measurable outcome the product serves, with the measure, the target, and the date it serves it by. Claimwick keeps one: every submitted expense is decided within five business days. It lives at `docs/product/goals/decided-in-days.md`, which applies `litespec/core/intent#state-each-goal-with-its-measure` on [Intent Layer](../core/intent.md).

```json
{
  "type": "goal",
  "id": "goal/decided-in-days",
  "title": "Decided in Days",
  "owner": "claimwick-team",
  "status": "approved",
  "statement": "Every submitted expense is decided within five business days.",
  "measure": "Median hours from submission to decision.",
  "target": "Under 120 hours.",
  "by": "2026-12-31"
}
```

The body below the block holds one Why It Matters section: employees plan around reimbursements, and a late decision holds their money. The goal carries no authority of its own: it explains why the approval reminders feature exists, and the feature serves it through a `serves` link.

## The Problem

A problem record states one pain someone has today. Claimwick keeps one: submitted expenses wait weeks for a decision, so employees chase managers by email. It lives at `docs/product/problems/expenses-wait-weeks.md`, and its `affects` link names the employee actor, which applies `litespec/core/intent#state-each-problem-with-its-evidence`.

```json
{
  "type": "problem",
  "id": "problem/expenses-wait-weeks",
  "title": "Expenses Wait Weeks",
  "owner": "claimwick-team",
  "status": "approved",
  "affects": [
    "actor/employee"
  ],
  "statement": "Submitted expenses wait weeks for a decision, so employees chase managers by email."
}
```

The statement stays to one sentence, and the page body adds a Situation section with one more: decisions arrive late without notice. Its Evidence section cites the benchmark research below: small companies decide within one week, while Claimwick averages three. Later records answer this problem: the approval reminders feature solves it, and the approval requirements bound it.

## The Feature

A feature record states what the product offers against a problem, with its state and the problem it solves. Claimwick keeps one: managers get a reminder for expenses waiting past three days. It lives at `docs/product/features/approval-reminders.md`, it solves the waiting problem and serves the five-day goal, which applies `litespec/core/intent#state-each-feature-with-its-state`.

```json
{
  "type": "feature",
  "id": "feature/approval-reminders",
  "title": "Approval Reminders",
  "owner": "claimwick-team",
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

The body below the block holds one Offering section: the reminder names the expense and its waiting time, and expenses decided in time never trigger one. The feature is the thread this example follows down the tree: the requirements below name it in their `feature` links, and the reminder job and notification in [Modules and Records](modules-and-records.md) carry it out.

## The Requirements

A requirement states one behavior the product shows or one guarantee it keeps. Claimwick groups its 6 approval requirements as entries on one requirement page at `docs/product/spending/approval.md`. Each entry carries its own identifier, title, kind, statement, one-line rationale, exceptions with their fallback, who sets its values, and links, which applies `litespec/core/intent#identify-every-requirement`, `litespec/core/intent#explain-each-requirement-in-one-line`, and `litespec/core/intent#state-each-exception-with-its-fallback`.

```json
{
  "type": "requirement-page",
  "title": "Approval",
  "owner": "claimwick-team",
  "status": "approved",
  "records": [
    {
      "type": "requirement",
      "id": "requirement/approval.decided-within-five-days",
      "title": "Decided within five days",
      "owner": "claimwick-team",
      "status": "approved",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-03-01",
      "approvedHash": "a3f9c1e07b2d...",
      "kind": "functional",
      "statement": "Each submitted expense is decided within five business days.",
      "rationale": "Late decisions stall employees and payouts.",
      "except": [
        {
          "when": "The expense is submitted during the year-end close.",
          "fallback": "requirement/approval.extended-decision-in-close"
        }
      ],
      "setBy": "founder",
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
      "owner": "claimwick-team",
      "status": "approved",
      "kind": "functional",
      "statement": "An expense above the receipt threshold carries a receipt.",
      "rationale": "Proof above the line keeps the tax file defensible.",
      "setBy": "founder",
      "feature": [
        "feature/approval-reminders"
      ],
      "basedOn": [
        "constraint/tax-receipt-retention"
      ]
    },
    {
      "type": "requirement",
      "id": "requirement/approval.erasure-on-request",
      "title": "Erasure on request",
      "owner": "claimwick-team",
      "status": "approved",
      "kind": "functional",
      "statement": "The personal data of a decided expense is erased when its employee asks.",
      "rationale": "The company keeps no personal data past its need.",
      "setBy": "founder",
      "risk": ["personal-data"],
      "feature": [
        "feature/approval-reminders"
      ],
      "basedOn": [],
      "questions": [
        {
          "question": "May finance keep anonymized totals after erasure?",
          "decider": "claimwick-team",
          "decideBy": "2026-04-01",
          "recommended": "Yes, totals without employee links.",
          "ballot": "erasure-terms",
          "tier": 1
        }
      ]
    }
  ]
}
```

The five-day requirement states its exception beside the rule: during the year-end close, the fallback requirement `requirement/approval.extended-decision-in-close` holds instead, and the fallback carries no exception of its own. The approval data on the entry shows who approved it, on which date, and the semantic hash the builder wrote; rewording prose never changes that hash. The erasure requirement carries `personal-data` risk, which makes it tier 1, and its open question joins the `erasure-terms` ballot with a recommendation for the founder to decide. The remaining entries follow the same shape:

| Requirement | Statement |
|:---|:---|
| `requirement/approval.no-self-approval` | Nobody approves their own expense. |
| `requirement/approval.single-reimbursement` | An approved expense is reimbursed at most once. |
| `requirement/approval.extended-decision-in-close` | An expense submitted during the year-end close is decided within ten business days. |

All 6 requirements are functional requirements: each states something the product does. Their identifiers carry the topic name, so `requirement/approval.decided-within-five-days` belongs to approval. The page body tells the story around them in 9 sections, from Summary through an Example in which Ava submits a 48.90 EUR train fare on Monday, Ben approves it on Tuesday, and Cara reimburses it on Friday. Rules and use cases point back at these identifiers with `fulfills` links, which [Modules and Records](modules-and-records.md) shows. (Example blocks in these pages omit the approval data the builder writes, except where shown.)

## The Research

A research record states one outside fact that informs a choice, with the question it answers and the sources it read. Claimwick keeps one: small companies decide expenses within one week. It lives at `docs/research/approval-time-benchmarks.md`, which applies `litespec/core/intent#record-research-with-read-sources`.

```json
{
  "type": "research",
  "id": "research/approval-time-benchmarks",
  "title": "Approval Time Benchmarks",
  "owner": "claimwick-team",
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

A decision record states one dated choice with the options it weighed. Claimwick chose a 25 EUR receipt threshold after a finance review in February 2026. The record lives at `docs/product/decisions/0001-receipt-threshold.md`, and its `decides` link names the receipt requirement it settles, which applies `litespec/core/model#name-what-every-decision-decides`. Each option carries what speaks for and against it, which applies `litespec/core/intent#record-each-choice-as-a-decision`.

```json
{
  "type": "decision",
  "id": "decision/0001-receipt-threshold",
  "title": "Receipt Threshold",
  "owner": "claimwick-team",
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

A constraint states one outside rule the product obeys. Claimwick answers the national tax law on receipts: receipts stay kept for 7 years because Claimwick stores receipts for reimbursed expenses. The record lives at `docs/product/constraints/tax-receipt-retention.md`, which applies `litespec/core/intent#answer-every-constraint`.

```json
{
  "type": "constraint",
  "id": "constraint/tax-receipt-retention",
  "title": "Tax Receipt Retention",
  "owner": "claimwick-team",
  "status": "approved",
  "source": "National tax law keeps business receipts for 7 years.",
  "category": "organizational",
  "applies": true,
  "appliesBecause": "Claimwick stores receipts for reimbursed expenses."
}
```

The `applies` field answers whether the outside rule covers this product, and `appliesBecause` gives the reason in one sentence. A project answers this question for every constraint it lists, even when the answer is that none applies. The receipt requirement cites this constraint in `basedOn`, so the tax file traces to the outside rule that demands it.

## The Journey

A journey record holds product sentences with ids toward one goal for one actor. Claimwick keeps one: an employee submits an expense and receives reimbursement. It lives at `docs/product/journeys/submit-and-reimburse.md`, it states its goal and its observable end, and it fulfills the five-day requirement, which applies `litespec/core/intent#order-each-journey-toward-one-goal`, `litespec/core/intent#write-journey-steps-as-sentences-with-ids`, and `litespec/core/intent#state-when-each-journey-finishes`.

```json
{
  "type": "journey",
  "id": "journey/submit-and-reimburse",
  "title": "Submit and Reimburse",
  "owner": "claimwick-team",
  "status": "approved",
  "actor": "actor/employee",
  "goal": "Submit an expense and receive reimbursement.",
  "finishedWhen": "The employee holds the reimbursement, and the expense record shows every step.",
  "steps": [
    {
      "id": "s1",
      "says": "The employee submits the expense with its receipt.",
      "actor": "actor/employee"
    },
    {
      "id": "s2",
      "says": "The manager approves the expense within five days.",
      "actor": "actor/manager",
      "ifItGoesWrong": "Past three days the manager gets a reminder; past five the wait is reported."
    },
    {
      "id": "s3",
      "says": "Finance reimburses the approved expense.",
      "actor": "actor/finance"
    },
    {
      "id": "s4",
      "says": "The employee sees the reimbursement land.",
      "actor": "actor/employee"
    }
  ],
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ]
}
```

The 4 steps run from submission to reimbursement in product words: the employee submits, the manager decides, finance reimburses, and the employee sees the money land. Steps name no use case: each use case points up to the steps it serves, so Submit expense serves `journey/submit-and-reimburse#s1` and Approve expense serves `#s2`. The page body holds an Example section following Ava, Ben, and Cara through one week, a Before It Starts section with the state preconditions, and a Between the Steps section with the failure branches.

Next, [Modules and Records](modules-and-records.md) specifies this intent into the spending module: its aggregates, rules, access chain, use cases, and the reaction, jobs, notifications, and setting around them.
