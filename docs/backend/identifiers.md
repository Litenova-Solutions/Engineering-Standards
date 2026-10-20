# Record Identifiers

## Intent

Every record carries one identifier naming its type, home, and name. One form per type lets a reader and a search find the record from the identifier alone.

## Agent Summary {#agent-summary}

- Follow the form the record type names. (litespec/backend/identifiers#follow-the-identifier-form-of-each-record-type)
- Name records with one to six words. (litespec/backend/identifiers#name-records-with-one-to-six-words)
- Keep each use case name unique. (litespec/backend/identifiers#keep-use-case-names-unique-across-the-project)
- Keep each business record name unique. (litespec/backend/identifiers#keep-business-record-names-unique-across-the-project)
- Keep negation in rule names. (litespec/backend/identifiers#keep-negation-in-rule-names)
- Keep wire codes stable. (litespec/backend/identifiers#keep-wire-codes-stable)
- Reject the retired forms. (litespec/backend/identifiers#reject-the-retired-identifier-forms)
- Resolve every citation. (litespec/backend/identifiers#resolve-every-identifier-citation)
- Cite shared provisions as published. (litespec/backend/identifiers#cite-shared-provisions-in-their-published-form)

## Concepts

### Forms per record type

| Type | Form | Example |
|:---|:---|:---|
| `product` | `product/<name>` | `product/clinic-booking` |
| `constraint` | `constraint/<name>` | `constraint/clinic-data-retention-law` |
| `research` | `research/<name>` | `research/late-fee-benchmarks` |
| `decision` | `decision/<number>-<name>` | `decision/0047-extend-loan-period` |
| `requirement` | `requirement/<topic>.<name>` | `requirement/fees.flat-late-fee` |
| `problem` | `problem/<name>` | `problem/overdue-books-block-holds` |
| `feature` | `feature/<name>` | `feature/hold-queue` |
| `actor` | `actor/<name>` | `actor/borrower` |
| `role` | `role/<name>` | `role/librarian` |
| `permission` | `permission/<name>` | `permission/manage-hold` |
| `journey` | `journey/<name>` | `journey/borrow-a-book` |
| `module` | `module/<name>` | `module/loans` |
| `business-record` | `business-record/<module>.<name>` | `business-record/loans.book-loan` |
| `rule` | `rule/<home>.<name>` | `rule/book-loan.only-an-active-loan-renews` |
| `use-case` | `use-case/<module>.<name>` | `use-case/loans.renew-loan` |
| `result` | `result/<use-case-name>.<name>` | `result/renew-loan.loan-not-active` |
| `case` | `case/<use-case-name>.<name>` | `case/renew-loan.renewing-twice-is-refused` |
| `event` | `event/<business-record-name>.<past-tense>` | `event/book-loan.loan-renewed` |
| `entry-point` | `entry-point/<name>` | `entry-point/admin` |
| `limit` | `limit/<name>` | `limit/holds-per-borrower` |
| `runbook` | `runbook/<name>` | `runbook/restore-a-backup` |
| `standard` | `standard/<home>.<name>` | `standard/review.two-reviewers-per-change` |
| `exception` | `exception/<name>` | `exception/single-reviewer-hotfix` |
| `known-gap` | `known-gap/<name>` | `known-gap/renewal-cases-unproved` |
| `term` | `term/<name>` | `term/borrower` |

A rule home is a business record name or a module name. A project standard home is the rule page stem holding it.

### Name rules

- Write one to six lowercase words joined by hyphens.
- Digits may sit inside a word, never as the whole name.
- The decision number counts as a word.
- Keep a use case name unique across the project.
- Keep the negation in a rule name when its statement negates.
- Let a person choose the name; no tool strips words into one.

### Wire codes

Wire codes are not identifiers and never change shape: failure codes such as `failure/orders.not_found`, audit action codes, and permission codes in code.

### Refused forms

The refused kind words are `acceptance-criterion/`, `path/`, `authorization/`, `invariant/`, `policy/`, `validation/`, `flow/`, `workflow/`, `end-to-end-flow/`, `domain-policy/`, `aggregate/`, a project prefix such as `<project>/rule/`, and `value/`. The refused tokens are `AC-`, `AUTZ-`, `INV-`, `POL-`, `VAL-`, `RULE-`, and `E2E-`.

### Resolution

Every citation of an identifier resolves to a written record. Unresolved citations fail the check; no list keeps retired names.

Shared provisions keep their published `litespec/<page>#<slug>` form.

## Standards

### Follow the identifier form of each record type

**Requirement:** A record identifier MUST follow the form its type row names.

**Rationale:** One form per type lets a reader name the type and home from the identifier alone.

**Example:** `event/book-loan.loan-renewed` names an event of the book loan record.

### Name records with one to six words

**Requirement:** A name MUST carry one to six lowercase hyphenated words.

**Rationale:** Short hyphenated names read aloud and stay stable across edits.

**Example:** `decision/0047-extend-loan-period` counts its number as one word.

### Keep use case names unique across the project

**Requirement:** A use case name MUST be unique across the project.

**Rationale:** Results and cases belong to the use case named in their identifier, so a duplicate leaves that home unclear.

### Keep business record names unique across the project

**Requirement:** A business record name MUST be unique across the project.

**Rationale:** Rules and events take their home from the business record named in their identifier, so two records with one name leave that home unclear.

### Keep negation in rule names

**Requirement:** A rule name MUST keep the negation its statement makes.

**Rationale:** A reviewer reads the name as a true sentence without opening the statement.

**Example:** A statement with never keeps never in its name.

### Keep wire codes stable

**Requirement:** A wire code MUST stay unchanged once clients read it.

**Rationale:** Failure codes, audit action codes, and permission codes are not identifiers. Clients branch on their values, so a change breaks deployed readers.

### Reject the retired identifier forms

**Requirement:** A record MUST NOT use a retired identifier form.

**Rationale:** Retired forms carry counters and kind words the model no longer defines.

### Resolve every identifier citation

**Requirement:** Every identifier citation MUST resolve to a written record.

**Rationale:** A citation naming nothing leaves the reader with no page to open.

### Cite shared provisions in their published form

**Requirement:** A shared provision citation MUST use its published identifier.

**Rationale:** Shared provisions keep their published form while project records use the type forms above.

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
| litespec/backend/identifiers#keep-wire-codes-stable | guidance | Do clients read the same code values as before? |
| litespec/backend/identifiers#reject-the-retired-identifier-forms | checkable | `litespec model check` reports `identifier-refused-form`. |
| litespec/backend/identifiers#resolve-every-identifier-citation | checkable | `litespec model check` reports `reference-unresolved`. |
| litespec/backend/identifiers#cite-shared-provisions-in-their-published-form | checkable | `litespec validate` emits no `ID_UNKNOWN_REFERENCE` diagnostic. |
