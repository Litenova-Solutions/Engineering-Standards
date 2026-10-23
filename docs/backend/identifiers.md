# Record Identifiers

## Intent

Every record carries one identifier naming its type, its home, and its own name. This page states the identifier grammar for each record type, the rules for choosing names, and how citations resolve, with wire codes kept stable for deployed clients. The [Project Model](../core/model.md) states each type and its home; the checks here enforce the grammar.

## Concepts

### Identifier Forms

An identifier names its record type first, then the record name, with the owning home in between when the type has one. The model states the form each type uses, with one row per type and one example per row. A rule home is an aggregate name or a module name. A result or scenario home is a use-case name, and an event home is an aggregate name. A use-case name is unique across the project, so a result cites only that name. An aggregate name is unique across the project, so a rule cites only that name. A rule name keeps the negation its statement makes, as `litespec/core/domain#keep-the-negation-word-in-the-rule-name` requires.

### Name Rules

The name is the last segment of the identifier: `submit-expense` in `use-case/spending.submit-expense`. Every name follows these rules:

- Write one to six lowercase words joined by hyphens.
- Place digits inside a word; a name of digits alone breaks the rules.
- Count the decision number as a word.
- Keep a use case name unique across the project.
- Keep an aggregate name unique across the project.
- Let a person choose the name; no tool builds one by stripping words from a sentence.

### Wire Codes

A wire code is a value a client reads and branches on, such as a refusal code like `spending.receipt-missing` or an audit action code. Wire codes are not identifiers: they name no record, they keep one shape, and they stay unchanged once clients read them.

### Resolution

Resolution means every identifier citation names a record that exists. The model check fails an unresolved citation, so a citation points only at a record someone wrote.

Shared provisions keep their published `litespec/<page>#<slug>` form, as stated under [provision identifiers](../core/authoring.md).

## Standards

### Follow the Identifier Form of Each Record Type

**Statement:** A record identifier MUST follow the form the model states for its record type.

**Rationale:** A reader who meets `use-case/spending.submit-expense` knows it is a use case in the spending module without opening it. If two types shared one form, a citation needs its surrounding page to make sense, and search returns the wrong records.

**Example:** `event/expense.submitted` names an event of the expense aggregate.

### Name Records with One to Six Words

**Statement:** A name MUST carry one to six lowercase hyphenated words.

**Rationale:** A short hyphenated name reads aloud in review and stays stable when the record's wording changes. A long name gets shortened differently at each citation, and the shortcuts drift into competing names for one record.

**Example:** `decision/0001-receipt-threshold` counts its number as one word.

### Keep Use Case Names Unique Across the Project

**Statement:** A use case name MUST be unique across the project.

**Rationale:** A result cites only its use case name, as in `result/submit-expense.receipt-missing`. If two use cases shared the name `submit-expense`, that result points at two homes and the model check reports both.

### Keep Aggregate Names Unique Across the Project

**Statement:** An aggregate name MUST be unique across the project.

**Rationale:** A rule cites only its aggregate name, as in `rule/expense.approver-is-not-submitter`. If two aggregates shared the name `expense`, that rule points at two homes and a reader tells neither apart.

### Use Every Identifier Once

**Statement:** A record identifier MUST name exactly one record.

**Rationale:** An identifier used twice names two records at once, so every citation of it points both ways. One use per identifier keeps each citation single-valued.

**Example:** Two records named `use-case/spending.submit-expense` leave the model check reporting the duplicate on the second record.

### Keep Wire Codes Stable

**Statement:** A wire code MUST stay unchanged once clients read it.

**Rationale:** Wire codes travel to deployed clients, which branch on their exact values. Renaming a code that clients already read breaks every deployed reader that compares the old value, with no record the reader opens to learn the new one.

### Resolve Every Identifier Citation

**Statement:** Every identifier citation MUST resolve to a written record.

**Rationale:** A citation is a promise that a record exists at the other end. A citation that names nothing sends the reader searching for a record nobody wrote, so the model check fails it.

### Cite Shared Provisions in Their Published Form

**Statement:** A shared provision citation MUST use its published identifier.

**Rationale:** A shared provision is cited across projects, so its identifier looks the same everywhere. The published `litespec/<page>#<slug>` form stays fixed, while project records use the type forms above.

## Conventions

None.

## Reference Example

This informative example demonstrates `litespec/backend/identifiers#follow-the-identifier-form-of-each-record-type` and `litespec/backend/identifiers#name-records-with-one-to-six-words`.

An ordering system names one module, one aggregate, one rule, and one use case with its results.

```text
module/orders
aggregate/orders.order
rule/order.only-paid-orders-ship
use-case/orders.place-order
result/place-order.order-placed
result/place-order.item-out-of-stock
```

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/identifiers#follow-the-identifier-form-of-each-record-type | checkable | `litespec model check` reports `identifier-form` for an identifier outside the form its type uses. |
| litespec/backend/identifiers#name-records-with-one-to-six-words | checkable | `litespec model check` reports `identifier-form` for a name outside one to six lowercase hyphenated words. |
| litespec/backend/identifiers#keep-use-case-names-unique-across-the-project | checkable | `litespec model check` reports `use-case-name-clash` for a use-case name used twice. |
| litespec/backend/identifiers#keep-aggregate-names-unique-across-the-project | checkable | `litespec model check` reports `aggregate-name-clash` for an aggregate name used twice. |
| litespec/backend/identifiers#use-every-identifier-once | checkable | `litespec model check` reports `identifier-duplicate` for an identifier used twice. |
| litespec/backend/identifiers#keep-wire-codes-stable | guidance | Wire codes in the contract keep the values deployed clients branch on. |
| litespec/backend/identifiers#resolve-every-identifier-citation | checkable | `litespec model check` reports `reference-unresolved` for a citation naming no written record. |
| litespec/backend/identifiers#cite-shared-provisions-in-their-published-form | checkable | `litespec validate` emits no `ID_UNKNOWN_REFERENCE` diagnostic. |
