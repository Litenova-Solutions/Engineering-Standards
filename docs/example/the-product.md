# The Expenses Product

## Intent

Expenses is the small product the example follows: employees submit work expenses with receipts, managers approve or reject them, and finance reimburses the approved ones. This page states what that product is and why through 5 records, each a short page stating one piece of product intent: the product brief, the problem, the requirements, the decision, and the constraint. Each record below shows the shape a project writes, with JSON taken from `examples/expenses/docs/`, so a team sees what written intent looks like before the example turns it into modules, code, and checks.

## The product brief

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

The block above opens the page between two lines that carry only `---`, the specification metadata block that `litespec/core/authoring#declare-structured-specification-metadata` on the [Authoring Standard](../core/authoring.md) defines. Its common fields, `type`, `id`, `title`, `owner`, and `status`, appear on every record in this example, which applies `litespec/core/model#state-the-common-fields-on-every-record`. The body below the block names who does what: employees submit and attach, managers approve and reject, and finance reimburses.

## The problem

A problem record states one pain someone has today. Expenses keeps one: submitted expenses wait weeks for a decision, so employees chase managers by email. It lives at `docs/product/problems/expenses-wait-weeks.md`, and its `affects` link names the employee actor.

```json
{
  "type": "problem",
  "id": "problem/expenses-wait-weeks",
  "title": "Expenses wait weeks",
  "owner": "expenses-team",
  "status": "approved",
  "affects": [
    "actor/employee"
  ],
  "statement": "Submitted expenses wait weeks for a decision, so employees chase managers by email."
}
```

The statement stays to one sentence, and the page body adds one more: decisions arrive late without notice. Later records answer this problem: the approval reminders feature solves it, and the approval requirements bound it.

## The requirements

A requirement states one behavior the product shows or one guarantee it keeps. Expenses groups its 4 approval requirements as entries on one product topic page at `docs/product/spending/approval.md`. Each entry carries its own identifier, title, kind, and statement.

```json
{
  "type": "product-topic",
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
      "kind": "behavior",
      "statement": "Each submitted expense is decided within five business days.",
      "basedOn": []
    },
    {
      "type": "requirement",
      "id": "requirement/approval.receipt-over-threshold",
      "title": "Receipt over threshold",
      "owner": "expenses-team",
      "status": "approved",
      "kind": "behavior",
      "statement": "An expense above the receipt threshold carries a receipt.",
      "basedOn": []
    },
    {
      "type": "requirement",
      "id": "requirement/approval.no-self-approval",
      "title": "No self approval",
      "owner": "expenses-team",
      "status": "approved",
      "kind": "behavior",
      "statement": "Nobody approves their own expense.",
      "basedOn": []
    },
    {
      "type": "requirement",
      "id": "requirement/approval.single-reimbursement",
      "title": "Single reimbursement",
      "owner": "expenses-team",
      "status": "approved",
      "kind": "behavior",
      "statement": "An approved expense is reimbursed at most once.",
      "basedOn": []
    }
  ]
}
```

All 4 requirements are behavior requirements: each states something the product does. Their identifiers carry the topic name, so `requirement/approval.decided-within-five-days` belongs to approval. Rules and use cases point back at these identifiers with `fulfills` links, which [Modules and Records](modules-and-records.md) shows.

## The decision

A decision record states one dated choice with the options it weighed. Expenses chose a 25 EUR receipt threshold after a finance review in February 2026. The record lives at `docs/product/decisions/0001-receipt-threshold.md`, and its `decides` link names the receipt requirement it settles, which applies `litespec/core/model#name-what-every-decision-decides`.

```json
{
  "type": "decision",
  "id": "decision/0001-receipt-threshold",
  "title": "Receipt threshold",
  "owner": "expenses-team",
  "status": "approved",
  "decided": "2026-03-01",
  "options": [
    "0 EUR",
    "25 EUR",
    "75 EUR"
  ],
  "changeWhen": "Finance sees abuse or friction.",
  "decides": [
    "requirement/approval.receipt-over-threshold"
  ],
  "basedOn": []
}
```

The page body carries 5 short sections: Context, Options, Decision, Consequences, and Evidence. The evidence cites the finance review of February 2026, and the consequences note that small expenses stay light to submit. A later change would replace this record rather than edit it, so the reasoning stays readable.

## The constraint

A constraint states one outside rule the product obeys. Expenses answers the national tax law on receipts: receipts stay kept for 7 years because Expenses stores receipts for reimbursed expenses. The record lives at `docs/product/constraints/tax-receipt-retention.md`.

```json
{
  "type": "constraint",
  "id": "constraint/tax-receipt-retention",
  "title": "Tax receipt retention",
  "owner": "expenses-team",
  "status": "approved",
  "source": "National tax law keeps business receipts for 7 years.",
  "applies": true,
  "appliesBecause": "Expenses stores receipts for reimbursed expenses."
}
```

The `applies` field answers whether the outside rule covers this product, and `appliesBecause` gives the reason in one sentence. A project answers this question for every constraint it lists, even when the answer is that none applies.

Next, [Modules and Records](modules-and-records.md) organizes this intent into the spending module and its records, rules, and access chain.
