# The Project Model

## Intent

Every project describes itself with records of fixed types joined by fixed links. People and agents write the intent records. The builder reads the code, screens, tests, and test runs, and computes the links between the two.

## Concepts

### Record types

Each type answers one question. Small projects keep the rows marked small. Large projects also keep the rows marked large. Optional rows switch on for each project.

| Type | Kept | Question |
|:---|:---|:---|
| `product` | small | What is built, for whom, and never? |
| `constraint` | optional, answered always | Which outside rules hold? |
| `research` | optional | Which outside facts inform a choice? |
| `decision` | small | Which choice holds, and what changes it? |
| `requirement` | small | What does the product do or guarantee? |
| `problem` | large | Which pain does someone have today? |
| `feature` | large | What is offered against a problem? |
| `actor` | small | Who or what touches the product? |
| `role` | small | Which permission sets exist? |
| `permission` | small | Which single actions are allowed? |
| `journey` | large | Which ordered steps reach one goal? |
| `module` | small | Which business areas exist? |
| `business-record` | small | Which things stay consistent? |
| `rule` | small | What holds? |
| `use-case` | small | Which operations exist? |
| `result` | small | How does a use case end? |
| `case` | large | Which example proves the result? |
| `event` | small | What happened? |
| `entry-point` | small | How do people reach the product? |
| `limit` | optional, required from first production | Which bounds hold in production? |
| `runbook` | optional, required from first production | How is it run or recovered? |
| `standard` | small | How is it built? |
| `exception` | small | Where does it depart, and until when? |
| `known-gap` | small | What is missing, owned, until when? |
| `term` | small | Which word means what? |

The record types group by the question each answers, from intent through operation to project records.

![Record types grouped by the question each answers: why holds product, constraint, research, decision, requirement, and problem; what is offered holds feature; who acts holds actor, role, and permission; how they arrive holds journey and entry-point; how the business works holds module, business-record, rule, use-case, result, case, and event; operation holds limit and runbook; how the project builds and speaks holds standard, exception, known-gap, and term.](../assets/diagrams/core-model-records.svg)

### Pages and entries

A page record is a Markdown file whose opening block names a record type. An entry record is an object in the `records` array of that block. Terms are the exception: they live in the language record, one entry per term. Each type has one home.

| Type | Stored as | Home |
|:---|:---|:---|
| `product` | page, exactly one | `docs/product/brief.md` |
| `constraint` | page | `docs/product/constraints/<name>.md` |
| `research` | page | `docs/research/<name>.md` |
| `decision` | page | `docs/product/decisions/<number>-<name>.md` |
| `requirement` | entry | `docs/product/<area>/<topic>.md` |
| `problem` | page | `docs/product/problems/<name>.md` |
| `feature` | page | `docs/product/features/<name>.md` |
| `actor` | page | `docs/domain/actors/<name>.md` |
| `role` | page | `docs/domain/roles/<name>.md` |
| `permission` | entry | `docs/domain/permissions.md` |
| `journey` | page | `docs/product/journeys/<name>.md` |
| `module` | page | `docs/domain/modules/<module>/README.md` |
| `business-record` | page | `docs/domain/modules/<module>/<records>/README.md` |
| `rule` | entry | `docs/domain/rules/<name>.md` |
| `use-case` | page | `docs/domain/modules/<module>/<records>/<use-case>.md` |
| `result` | entry | In its use case page |
| `case` | entry | In its use case page |
| `event` | entry | On its business record page |
| `entry-point` | entry | `docs/domain/entry-points.md` |
| `limit` | entry | `docs/operations/limits.md` |
| `runbook` | page | `docs/runbooks/<name>.md` |
| `standard` | shared provisions, or entries on rule pages | `docs/domain/rules/<name>.md` |
| `exception` | page | `docs/exceptions/<name>.md` |
| `known-gap` | page | `docs/known-gaps/<name>.md` |
| `term` | entry in the language record | `docs/language.json` |

### Common fields

Every written record carries the shared fields. Entries inherit `owner` and `status` from their page unless they set their own.

| Field | Written | Meaning |
|:---|:---|:---|
| `type` | always | The record type in kebab case |
| `id` | always | The identifier |
| `title` | always | The display title, free to change |
| `owner` | pages; entries inherit | One name from the closed owner list |
| `status` | pages; entries inherit | Draft, approved, or retired |
| `decider` | on drafts | The owner deciding by the date |
| `decideBy` | on drafts | The decision date in ISO form |
| `replaces` | decision, when replacing | The decision this decision replaces |
| `terms` | when used | The term identifiers the record uses |

### Links

Written links live as fields on the record they start from.

| Field | Written on | Points at |
|:---|:---|:---|
| `decides` | decision | Requirements, features, rules, constraints, and the permissions, roles, actors, exceptions, standards, entry points, limits, or decisions an engineering choice settles |
| `basedOn` | decision, requirement, rule | Constraints, research |
| `affects` | problem | Actors |
| `solves` | feature | Problems |
| `fulfills` | rule, use case, journey | Requirements |
| `governs` | rule | Business records, use cases |
| `results` | use case | Its result entries |
| `cases` | use case | Its case entries; each names its result |
| `raises` | use case | Events |
| `reactsTo` | use case | Events it reacts to |
| `holds` | actor | Roles at a scope |
| `allows` | role | Permissions |
| `needs` | use case | Permissions |
| `reachedThrough` | use case | Entry points |
| `steps` | journey | Ordered use cases with actors |
| `dependsOn` | module | Modules |
| `terms` | any record | Terms |
| `replaces` | decision | The replaced decision |

Containment follows the identifier: a business record belongs to its module, and a result belongs to the use case named in its identifier. The builder computes the remaining links from code, routes, and tests: `implements`, `calls`, and `proves`.

### Authority

Intent flows down one order: constraint, product, requirement, rule, and use case. A decision explains a choice and is replaced, never edited. Research, examples, and prose carry no authority.

Truth about today comes from code, screens, and test runs. The higher record owner owns the defect when intent and truth mismatch.

A record stays unapproved while a decision behind it stays draft. An accepted gap becomes a known gap; its check reports without failing until the end date. Access flows from actor to role to permission to use case. Module order states dependencies and grants no authority.

### Statuses

Draft means the record awaits its decider; approved means it holds; retired means a replacement holds. A draft names its `decider` and `decideBy` date.

Implemented and verified are computed: code grants the first, passing proof grants the second.

### Size and stacks

Small projects keep the small rows; large projects also keep the large rows. Optional types switch on for each project; limits and runbooks join at first production.

Each frontend declares one stack, and the backend declares its own. Every project answers whether constraints apply, possibly with none. Owners form a closed list; extensions name replacements and switched-on types.

### The model builder

The model builder reads records, code, routes, tests, and test runs into one model. It writes the model file, runs the model checks, and renders generated regions.

Generated regions sit inside fences that only the builder writes and prose checks skip. Each project runs the builder in its own gate.

## Standards

### Write every record in its home

**Requirement:** A project MUST keep every record in the home its type names.

**Rationale:** One home per type tells a reader and the builder where a record lives.

**Example:** A decision lives at `docs/product/decisions/0047-extend-loan-period.md`.

### State the common fields on every record

**Requirement:** Every written record MUST carry its type, identifier, title, owner, and status.

**Rationale:** Shared fields let the builder join records across pages.

### Write links on the record that points

**Requirement:** A link MUST live as fields on the record it starts from.

**Rationale:** One writing site keeps a link and its source in one edit.

### Follow the authority order

**Requirement:** A conflict MUST resolve toward the higher authority.

**Rationale:** Constraint outranks product, product outranks requirement, requirement outranks rule, and rule outranks use case. Decisions explain a choice and carry no rank; research and prose carry none.

### Resolve ties by the later decision

**Requirement:** A tie MUST resolve toward the later approved decision.

**Rationale:** The shared owner decides when no later decision separates the records.

### Hold approval behind draft decisions

**Requirement:** A record MUST NOT stand approved behind a draft decision.

**Rationale:** Approval means the reasoning behind the record already holds. The builder also writes each record's `effectiveStatus`: draft when the record, a decision deciding it, or a requirement it fulfills is a draft. A result or a case takes its use case's effective status.

### Record accepted gaps as known gaps

**Requirement:** An accepted gap MUST live as a known gap with owner and end date.

**Rationale:** A dated owner turns missing work into a visible promise.

**Example:** The running library example accepts that retiring a copy has no handler yet, so the gap lives as a known gap with an owner and an end date in `docs/known-gaps/retire-copy-unimplemented.md`.

```json
{
  "type": "known-gap",
  "id": "known-gap/retire-copy-unimplemented",
  "title": "Retire copy unimplemented",
  "owner": "lending-team",
  "status": "approved",
  "check": "use-case-unimplemented",
  "subject": ["use-case/lending.retire-copy"],
  "endsBy": "2027-06-01",
  "reason": "Retirement waits for the weeding policy."
}
```

The `use-case-unimplemented` check reports without failing until 2027-06-01, and the lending team answers for closing the gap, which satisfies this provision.

### Apply guidance precedence

**Requirement:** A conflict MUST resolve toward the project exception, the extension, the deeper page, or the shallower page, in that order.

**Rationale:** A project requirement never overrides a shared standard; the conflict becomes an exception.

**Example:** The running library example needs its morning import to skip the quiet shelf check, so it records a project exception that outranks the shared standard in `docs/exceptions/shelf-check-bypass.md`.

```json
{
  "type": "exception",
  "id": "exception/shelf-check-bypass",
  "title": "Shelf check bypass",
  "owner": "lending-team",
  "status": "approved",
  "standard": "standard/lending.quiet-shelf-check",
  "reason": "The import runs before opening.",
  "reviewBy": "2027-01-01",
  "removeWhen": "The import moves after opening."
}
```

The record names the standard it departs from, the reason, and the review date, so the departure stays visible and dated, which satisfies this provision.

### Authorize access through the permission chain

**Requirement:** A use case MUST name the permissions it needs.

**Rationale:** Actors hold roles at a scope, roles allow permissions, and entry points may restrict them.

**Example:** An anonymous use case sets `anonymous` and names no permission.

### Express module order as depends on

**Requirement:** Module order MUST live as `dependsOn` links between modules.

**Rationale:** A link states the dependency without ranking one module above another.

### Keep one owner and status on every record

**Requirement:** Every page MUST name one owner and one status.

**Rationale:** Entries inherit both from their page unless they set their own.

**Example:** A draft names its `decider` and `decideBy` date.

The three statuses and what each allows: a draft awaits its decider, approved holds, and retired means a replacement holds.

![Three record statuses in order: a draft awaits its decider and names its decider and decide-by date; approved holds, and a decision is replaced rather than edited; retired means a replacement holds with the old record beside the new one.](../assets/diagrams/core-record-status.svg)

### Retire records with replaces

**Requirement:** A replacing decision MUST name the decision it replaces, and no other record type carries `replaces`.

**Rationale:** Decisions alone keep the past: the old one stands retired beside the new one. Every other record changes in place, and a rename rewrites every citation in the same change.

### Name what every decision decides

**Requirement:** Every decision that is not retired MUST name at least one record it settles in `decides`.

**Rationale:** The draft gate and the computed effective status follow `decides`. A decision that names nothing holds back nothing, so its approval state means nothing.

### Resolve every page link

**Requirement:** Every Markdown link outside code on a page under the record roots MUST point at an existing file, by its relative path.

**Rationale:** A link shaped like an identifier, or to a moved file, reads as navigation and leads nowhere. An identifier is cited in backticks, and a link names a file.

### Declare size stacks and optional types

**Requirement:** A project MUST declare its size, stacks, and optional types.

**Rationale:** Size decides the required record types and test projects; stacks decide the technology pages.

**Example:** A library loan system declares small with a single backend stack.

### Give every use case its results

**Requirement:** A use case MUST end in a success result and name its refusals.

**Rationale:** Callers branch on named endings, and cases prove one ending each.

**Example:** A loan use case names `loaned` and `book-not-available`.

The running library example carries this in `use-case/lending.borrow-copy`, which names `result/borrow-copy.borrowed` and `result/borrow-copy.copy-unavailable` in `results` and `case/borrow-copy.borrowing-an-available-copy-succeeds` in `cases`:

```json
"records": [
  {
    "type": "result",
    "id": "result/borrow-copy.borrowed",
    "title": "Borrowed",
    "owner": "lending-team",
    "outcome": "success",
    "httpStatus": 201,
    "meaning": "The copy is lent."
  },
  {
    "type": "result",
    "id": "result/borrow-copy.copy-unavailable",
    "title": "Copy unavailable",
    "owner": "lending-team",
    "outcome": "refusal",
    "code": "failure/lending.copy_not_available",
    "httpStatus": 409,
    "meaning": "The copy is unavailable."
  },
  {
    "type": "case",
    "id": "case/borrow-copy.borrowing-an-available-copy-succeeds",
    "title": "Borrowing an available copy succeeds",
    "owner": "lending-team",
    "status": "approved",
    "situation": "A copy sits available on its shelf.",
    "action": "The reader borrows the copy.",
    "result": "result/borrow-copy.borrowed",
    "expect": "The loan is active."
  }
]
```

Success ends with 201, the refusal carries the failure code `failure/lending.copy_not_available` with 409, and the case pairs one situation with the success result, which satisfies this provision.

### Cover every public use case from a journey

**Requirement:** A public use case MUST sit in a journey or name its background caller.

**Rationale:** Reachability shows readers how each operation is found.

### Read truth from code screens and test runs

**Requirement:** Implemented and verified MUST come from the builder, never from handwriting.

**Rationale:** The builder joins handlers, routes, scenarios, and test runs to the written records.

**Example:** A use case reads implemented when its handler exists.

## Conventions

### Render generated regions from the model

**Default:** Generated regions on a page come from the model builder.

**Replacement:** A project with no builder run records its own generation step.

**Rationale:** Fenced regions keep handwritten prose and computed views apart.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/model#write-every-record-in-its-home | checkable | `litespec model check` reports `record-shape`. |
| litespec/core/model#state-the-common-fields-on-every-record | checkable | `litespec model check` reports `record-shape`. |
| litespec/core/model#write-links-on-the-record-that-points | checkable | `litespec model check` reports `reference-unresolved`. |
| litespec/core/model#follow-the-authority-order | guidance | Does each conflict resolve toward the higher authority? |
| litespec/core/model#resolve-ties-by-the-later-decision | guidance | Does the later approved decision settle each tie? |
| litespec/core/model#hold-approval-behind-draft-decisions | checkable | `litespec model check` reports `draft-gate`. |
| litespec/core/model#record-accepted-gaps-as-known-gaps | checkable | `litespec model check` reports `record-shape` and `known-gap-expired`. |
| litespec/core/model#apply-guidance-precedence | guidance | Does intent override a standard anywhere without an exception? |
| litespec/core/model#authorize-access-through-the-permission-chain | checkable | `litespec model check` reports `record-shape` and `reference-unresolved`. |
| litespec/core/model#express-module-order-as-depends-on | guidance | Does any record rank modules instead of linking them? |
| litespec/core/model#keep-one-owner-and-status-on-every-record | checkable | `litespec model check` reports `owner-unknown` and `draft-without-decider`. |
| litespec/core/model#retire-records-with-replaces | checkable | `litespec model check` reports `invalid-field` for `replaces` outside a decision and `reference-unresolved` for an unknown target. |
| litespec/core/model#name-what-every-decision-decides | checkable | `litespec model check` reports `decision-decides-nothing`. |
| litespec/core/model#resolve-every-page-link | checkable | `litespec model check` reports `link-unresolved`. |
| litespec/core/model#declare-size-stacks-and-optional-types | checkable | `litespec model check` reports `size-type-missing` and `record-shape`. |
| litespec/core/model#give-every-use-case-its-results | checkable | `litespec model check` reports `use-case-without-success` and `case-result-unresolved`. |
| litespec/core/model#cover-every-public-use-case-from-a-journey | checkable | `litespec model check` reports `journey-reach`. |
| litespec/core/model#read-truth-from-code-screens-and-test-runs | checkable | `litespec model check` reports `use-case-unimplemented`, `proves-unconfirmed`, and `refusal-not-thrown`. |
| litespec/core/model#render-generated-regions-from-the-model | guidance | Are generated regions current, or is a replacement recorded? |
