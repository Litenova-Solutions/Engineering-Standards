# Record Identifiers

## Intent

Every specification record, one written statement such as a use case, rule, or decision, carries one identifier naming its type, its home (the module or business record that owns it), and its own name. This page states the identifier form for each record type, the rules for choosing names, and how citations resolve, with each citation naming a record that exists. The `litespec model check` command enforces these forms, so one form per type lets a reader find any record from its identifier alone, by reading or by searching.

## Concepts

An identifier names its record type first, then the record's name, with the owning home in between when the type has one. The sections below state the form each type uses, the rules every name follows, how wire codes differ from identifiers, and how citations resolve.

### Forms per record type

| Type | Form | Example |
|:---|:---|:---|
| `product` | `product/<name>` | `product/expenses` |
| `constraint` | `constraint/<name>` | `constraint/tax-receipt-retention` |
| `research` | `research/<name>` | `research/approval-time-benchmarks` |
| `decision` | `decision/<number>-<name>` | `decision/0001-receipt-threshold` |
| `requirement` | `requirement/<topic>.<name>` | `requirement/approval.receipt-over-threshold` |
| `problem` | `problem/<name>` | `problem/expenses-wait-weeks` |
| `feature` | `feature/<name>` | `feature/approval-reminders` |
| `actor` | `actor/<name>` | `actor/employee` |
| `role` | `role/<name>` | `role/approver` |
| `permission` | `permission/<name>` | `permission/approve-expense` |
| `journey` | `journey/<name>` | `journey/submit-and-reimburse` |
| `module` | `module/<name>` | `module/spending` |
| `business-record` | `business-record/<module>.<name>` | `business-record/spending.expense` |
| `rule` | `rule/<home>.<name>` | `rule/expense.approver-is-not-submitter` |
| `use-case` | `use-case/<module>.<name>` | `use-case/spending.submit-expense` |
| `result` | `result/<use-case-name>.<name>` | `result/submit-expense.receipt-missing` |
| `case` | `case/<use-case-name>.<name>` | `case/submit-expense.submitting-with-a-receipt-succeeds` |
| `event` | `event/<business-record-name>.<past-tense>` | `event/expense.expense-submitted` |
| `entry-point` | `entry-point/<name>` | `entry-point/expenses-app` |
| `limit` | `limit/<name>` | `limit/open-expenses-per-employee` |
| `runbook` | `runbook/<name>` | `runbook/clear-stuck-reimbursements` |
| `standard` | `standard/<home>.<name>` | `standard/spending.daily-export-review` |
| `exception` | `exception/<name>` | `exception/export-review-bypass` |
| `known-gap` | `known-gap/<name>` | `known-gap/export-expenses-unimplemented` |
| `term` | `term/<name>` | `term/expense` |

A rule home is a business record name or a module name. A project standard home is the rule page stem holding it.

### Name rules

The name is the last segment of the identifier: `submit-expense` in `use-case/spending.submit-expense`. Every name follows these rules:

- Write one to six lowercase words joined by hyphens.
- Place digits inside a word, never as the whole name.
- Count the decision number as a word.
- Keep a use case name unique across the project.
- Keep the negation in a rule name when its statement negates.
- Let a person choose the name; no tool builds one by stripping words from a sentence.

### Wire codes

A wire code is a value a client reads and branches on, such as a failure code like `failure/orders.not_found`, an audit action code, or a permission code in code. Wire codes are not identifiers: they name no record, they never change shape, and they stay unchanged once clients read them.

### Resolution

Resolution means every identifier citation names a record that exists. The model check fails an unresolved citation, so a citation can never point at a record nobody wrote.

Shared provisions keep their published `litespec/<page>#<slug>` form, as stated under [provision identifiers](../core/authoring.md).

## Standards

### Follow the identifier form of each record type

**Requirement:** A record identifier MUST follow the form its type row names.

**Rationale:** A reader who meets `use-case/spending.submit-expense` knows it is a use case in the spending module without opening it. If two types shared one form, a citation would need its surrounding page to make sense, and search would return the wrong records.

**Example:** `event/expense.expense-submitted` names an event of the expense record.

### Name records with one to six words

**Requirement:** A name MUST carry one to six lowercase hyphenated words.

**Rationale:** A short hyphenated name reads aloud in review and stays stable when the record's wording changes. A long name gets shortened differently at each citation, and the shortcuts drift into competing names for one record.

**Example:** `decision/0001-receipt-threshold` counts its number as one word.

### Keep use case names unique across the project

**Requirement:** A use case name MUST be unique across the project.

**Rationale:** A result cites only its use case name, as in `result/submit-expense.receipt-missing`. If two use cases shared the name `submit-expense`, that result would point at two homes and the model check could not tell which one it proves.

### Keep business record names unique across the project

**Requirement:** A business record name MUST be unique across the project.

**Rationale:** A rule cites only its business record name, as in `rule/expense.approver-is-not-submitter`. If two records shared the name `expense`, that rule would point at two homes and a reader could not tell which record it constrains.

### Keep negation in rule names

**Requirement:** A rule name MUST keep the negation its statement makes.

**Rationale:** A rule name reads as a true sentence on its own: `rule/order.only-paid-orders-ship` states the rule. If the name dropped the negation, a reader scanning identifiers would learn the opposite of the rule.

**Example:** A statement with `never` keeps `never` in its name.

### Keep wire codes stable

**Requirement:** A wire code MUST stay unchanged once clients read it.

**Rationale:** Wire codes travel to deployed clients, which branch on their exact values. Renaming a code that clients already read breaks every deployed reader that compares the old value, with no record the reader can open to learn the new one.

### Resolve every identifier citation

**Requirement:** Every identifier citation MUST resolve to a written record.

**Rationale:** A citation is a promise that a record exists at the other end. A citation that names nothing sends the reader searching for a record nobody wrote, so the model check fails it.

### Cite shared provisions in their published form

**Requirement:** A shared provision citation MUST use its published identifier.

**Rationale:** A shared provision is cited across projects, so its identifier must look the same everywhere. The published `litespec/<page>#<slug>` form stays fixed, while project records use the type forms above.

## Conventions

None.

## Reference example

This informative example demonstrates `litespec/backend/identifiers#follow-the-identifier-form-of-each-record-type` and `litespec/backend/identifiers#name-records-with-one-to-six-words`.

An ordering system names one module, one record, one rule, and one use case with its results.

```text
module/orders
business-record/orders.order
rule/order.only-paid-orders-ship
use-case/orders.place-order
result/place-order.order-placed
result/place-order.item-out-of-stock
```

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/identifiers#follow-the-identifier-form-of-each-record-type | checkable | `litespec model check` reports `identifier-form`. |
| litespec/backend/identifiers#name-records-with-one-to-six-words | checkable | `litespec model check` reports `identifier-form`. |
| litespec/backend/identifiers#keep-use-case-names-unique-across-the-project | checkable | `litespec model check` reports `use-case-name-clash`. |
| litespec/backend/identifiers#keep-business-record-names-unique-across-the-project | checkable | `litespec model check` reports `business-record-name-clash`. |
| litespec/backend/identifiers#keep-negation-in-rule-names | checkable | `litespec model check` reports `rule-name-negation`. |
| litespec/backend/identifiers#keep-wire-codes-stable | guidance | Does every wire code that clients read keep the value those clients expect? |
| litespec/backend/identifiers#resolve-every-identifier-citation | checkable | `litespec model check` reports `reference-unresolved`. |
| litespec/backend/identifiers#cite-shared-provisions-in-their-published-form | checkable | `litespec validate` emits no `ID_UNKNOWN_REFERENCE` diagnostic. |
