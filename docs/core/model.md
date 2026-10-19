# The Project Model

## Intent

Every project describes itself as records of fixed types joined by fixed links. People and agents write the intent records. The builder reads the code, screens, tests, and test runs, and computes the links between the two.

## Agent Summary {#agent-summary}

- Write every record in its home folder. (standards/rule/core-model.write-every-record-in-its-home)
- State shared fields, one owner, and one status on every record. (standards/rule/core-model.state-the-common-fields-on-every-record, standards/rule/core-model.keep-one-owner-and-status-on-every-record)
- Write each link on the record it starts from. (standards/rule/core-model.write-links-on-the-record-that-points)
- Follow the authority order, with ties going to the later decision. (standards/rule/core-model.follow-the-authority-order, standards/rule/core-model.resolve-ties-by-the-later-decision)
- Hold approval behind draft decisions and record gaps as known gaps. (standards/rule/core-model.hold-approval-behind-draft-decisions, standards/rule/core-model.record-accepted-gaps-as-known-gaps)
- Apply guidance precedence and authorize through the permission chain. (standards/rule/core-model.apply-guidance-precedence, standards/rule/core-model.authorize-access-through-the-permission-chain)
- Express module order as links and retire records with replaces. (standards/rule/core-model.express-module-order-as-depends-on, standards/rule/core-model.retire-records-with-replaces)
- Declare the size, stacks, and optional types. (standards/rule/core-model.declare-size-stacks-and-optional-types)
- Give every use case its results and cover public ones from journeys. (standards/rule/core-model.give-every-use-case-its-results, standards/rule/core-model.cover-every-public-use-case-from-a-journey)
- Read truth from code, screens, and test runs, and render views from the model. (standards/rule/core-model.read-truth-from-code-screens-and-test-runs, standards/rule/core-model.render-generated-regions-from-the-model)

## Concepts

### Record types

Each type answers one question. Small projects keep the rows marked small. Large projects also keep the rows marked large. Optional rows switch on per project.

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

### Pages and entries

A page record is a Markdown file whose opening block names a record type. An entry record is an object in the records array of that block. Terms are the exception: they live in the language record, one entry per term. Each type has one home.

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
| `rule` | entry | On its home page |
| `use-case` | page | `docs/domain/modules/<module>/<records>/<use-case>.md` |
| `result` | entry | In its use case page |
| `case` | entry | In its use case page |
| `event` | entry | On its business record page |
| `entry-point` | entry | `docs/domain/entry-points.md` |
| `limit` | entry | `docs/operations/limits.md` |
| `runbook` | page | `docs/runbooks/<name>.md` |
| `standard` | shared provisions, or entries on rule pages | On a rule page |
| `exception` | page | `docs/exceptions/<name>.md` |
| `known-gap` | page | `docs/known-gaps/<name>.md` |
| `term` | entry in the language record | `docs/language.json` |

### Common fields

Every written record carries the shared fields. Entries inherit owner and status from their page unless they set their own.

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
| `decides` | decision | Requirements, features, rules, constraint answers |
| `basedOn` | decision, requirement, rule | Constraints, research |
| `affects` | problem | Actors |
| `solves` | feature | Problems |
| `fulfils` | rule, use case, journey | Requirements |
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

Containment follows the identifier: a business record belongs to its module, and a result belongs to the use case named in its identifier. The builder computes the remaining links from code, routes, and tests: implements, calls, and proves.

### Authority

Intent flows down one order: constraint, product, requirement, rule, use case. A decision explains a choice and is replaced, never edited. Research, examples, and prose carry no authority.

Truth about today comes from code, screens, and test runs. A mismatch between intent and truth is a defect owned by the higher record owner.

A record stays unapproved while a decision behind it stays draft. An accepted gap becomes a known gap; its check reports without failing until the end date. Access flows from actor to role to permission to use case. Module order states dependencies and grants no authority.

### Statuses

Draft means the record awaits its decider; approved means it holds; retired means a replacement holds. A draft names its decider and decide-by date.

Implemented and verified are computed: code grants the first, passing proof grants the second.

### Size and stacks

Small projects keep the small rows; large projects also keep the large rows. Optional types switch on per project; limits and runbooks join at first production.

Each frontend declares one stack, and the backend declares its own. Every project answers whether constraints apply, possibly with none. Owners form a closed list; extensions name replacements and switched-on types.

### The model builder

The model builder reads records, code, routes, tests, and test runs into one model. It writes the model file, runs the model checks, and renders generated regions.

Generated regions sit inside fences that only the builder writes and prose checks skip. Each project runs the builder in its own gate.

## Standards

### Write every record in its home (standards/rule/core-model.write-every-record-in-its-home)

**Requirement:** A project MUST keep every record in the home its type names.

**Rationale:** One home per type tells a reader and the builder where a record lives.

**Example:** A decision lives at `docs/product/decisions/0047-extend-loan-period.md`.

### State the common fields on every record (standards/rule/core-model.state-the-common-fields-on-every-record)

**Requirement:** Every written record MUST carry its type, identifier, title, owner, and status.

**Rationale:** Shared fields let the builder join records across pages.

### Write links on the record that points (standards/rule/core-model.write-links-on-the-record-that-points)

**Requirement:** A link MUST live as fields on the record it starts from.

**Rationale:** One writing site keeps a link and its source in one edit.

### Follow the authority order (standards/rule/core-model.follow-the-authority-order)

**Requirement:** A conflict MUST resolve toward the higher authority.

**Rationale:** Constraint outranks product, product outranks requirement, requirement outranks rule, and rule outranks use case. Decisions explain a choice and carry no rank; research and prose carry none.

### Resolve ties by the later decision (standards/rule/core-model.resolve-ties-by-the-later-decision)

**Requirement:** A tie MUST resolve toward the later approved decision.

**Rationale:** The shared owner decides when no later decision separates the records.

### Hold approval behind draft decisions (standards/rule/core-model.hold-approval-behind-draft-decisions)

**Requirement:** A record MUST NOT stand approved behind a draft decision.

**Rationale:** Approval means the reasoning behind the record already holds. The builder also writes each record's `effectiveStatus`: draft when the record, a decision deciding it, or a requirement it fulfils is a draft. A result or a case takes its use case's effective status.

### Record accepted gaps as known gaps (standards/rule/core-model.record-accepted-gaps-as-known-gaps)

**Requirement:** An accepted gap MUST live as a known gap with owner and end date.

**Rationale:** A dated owner turns missing work into a visible promise.

### Apply guidance precedence (standards/rule/core-model.apply-guidance-precedence)

**Requirement:** A conflict MUST resolve toward the exception, extension, profile, or core, in that order.

**Rationale:** A project requirement never overrides a shared standard; the conflict becomes an exception.

### Authorize access through the permission chain (standards/rule/core-model.authorize-access-through-the-permission-chain)

**Requirement:** A use case MUST name the permissions it needs.

**Rationale:** Actors hold roles at a scope, roles allow permissions, and entry points may restrict them.

**Example:** An anonymous use case sets `anonymous` and names no permission.

### Express module order as depends on (standards/rule/core-model.express-module-order-as-depends-on)

**Requirement:** Module order MUST live as depends on links between modules.

**Rationale:** A link states the dependency without ranking one module above another.

### Keep one owner and status on every record (standards/rule/core-model.keep-one-owner-and-status-on-every-record)

**Requirement:** Every page MUST name one owner and one status.

**Rationale:** Entries inherit both from their page unless they set their own.

**Example:** A draft names its decider and decide-by date.

### Retire records with replaces (standards/rule/core-model.retire-records-with-replaces)

**Requirement:** A replacing decision MUST name the decision it replaces, and no other record type carries `replaces`.

**Rationale:** Decisions alone keep the past: the old one stands retired beside the new one. Every other record changes in place, and a rename rewrites every citation in the same change.

### Name what every decision decides (standards/rule/core-model.name-what-every-decision-decides)

**Requirement:** Every decision that is not retired MUST name in `decides` at least one requirement, feature, rule, or constraint.

**Rationale:** The draft gate and the computed effective status follow `decides`. A decision that names nothing holds back nothing, so its approval state means nothing.

### Resolve every page link (standards/rule/core-model.resolve-every-page-link)

**Requirement:** Every Markdown link outside code on a page under the record roots MUST point at an existing file, by its relative path.

**Rationale:** A link shaped like an identifier, or to a moved file, reads as navigation and leads nowhere. An identifier is cited in backticks, and a link names a file.

### Declare size stacks and optional types (standards/rule/core-model.declare-size-stacks-and-optional-types)

**Requirement:** A project MUST declare its size, stacks, and optional types.

**Rationale:** Size decides the required record types and test projects; stacks decide the technology pages.

**Example:** A library loans system declares small with a single backend stack.

### Give every use case its results (standards/rule/core-model.give-every-use-case-its-results)

**Requirement:** A use case MUST end in a success result and name its refusals.

**Rationale:** Callers branch on named endings, and cases prove one ending each.

**Example:** A loan use case names `loaned` and `book-not-available`.

### Cover every public use case from a journey (standards/rule/core-model.cover-every-public-use-case-from-a-journey)

**Requirement:** A public use case MUST sit in a journey or name its background caller.

**Rationale:** Reachability shows readers how each operation is found.

### Read truth from code screens and test runs (standards/rule/core-model.read-truth-from-code-screens-and-test-runs)

**Requirement:** Implemented and verified MUST come from the builder, never from handwriting.

**Rationale:** The builder joins handlers, routes, scenarios, and test runs to the written records.

**Example:** A use case reads implemented when its handler exists.

## Conventions

### Render generated regions from the model (standards/rule/core-model.render-generated-regions-from-the-model)

**Default:** Generated regions on a page come from the model builder.

**Replacement:** A project with no builder run records its own generation step.

**Rationale:** Fenced regions keep hand prose and computed views apart.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/core-model.write-every-record-in-its-home | checkable | `dotnet run --project tools/model/Litenova.Model -- check` reports `record-shape`. |
| standards/rule/core-model.state-the-common-fields-on-every-record | checkable | `dotnet run --project tools/model/Litenova.Model -- check` reports `record-shape`. |
| standards/rule/core-model.write-links-on-the-record-that-points | checkable | `dotnet run --project tools/model/Litenova.Model -- check` reports `reference-unresolved`. |
| standards/rule/core-model.follow-the-authority-order | guidance | Does each conflict resolve toward the higher authority? |
| standards/rule/core-model.resolve-ties-by-the-later-decision | guidance | Does the later approved decision settle each tie? |
| standards/rule/core-model.hold-approval-behind-draft-decisions | checkable | `dotnet run --project tools/model/Litenova.Model -- check` reports `draft-gate`. |
| standards/rule/core-model.record-accepted-gaps-as-known-gaps | checkable | `dotnet run --project tools/model/Litenova.Model -- check` reports `record-shape` and `known-gap-expired`. |
| standards/rule/core-model.apply-guidance-precedence | guidance | Does intent override a standard anywhere without an exception? |
| standards/rule/core-model.authorize-access-through-the-permission-chain | checkable | `dotnet run --project tools/model/Litenova.Model -- check` reports `record-shape` and `reference-unresolved`. |
| standards/rule/core-model.express-module-order-as-depends-on | guidance | Does any record rank modules instead of linking them? |
| standards/rule/core-model.keep-one-owner-and-status-on-every-record | checkable | `dotnet run --project tools/model/Litenova.Model -- check` reports `owner-unknown` and `draft-without-decider`. |
| standards/rule/core-model.retire-records-with-replaces | checkable | `dotnet run --project tools/model/Litenova.Model -- check` reports `invalid-field` for `replaces` outside a decision and `reference-unresolved` for an unknown target. |
| standards/rule/core-model.name-what-every-decision-decides | checkable | `dotnet run --project tools/model/Litenova.Model -- check` reports `decision-decides-nothing`. |
| standards/rule/core-model.resolve-every-page-link | checkable | `dotnet run --project tools/model/Litenova.Model -- check` reports `link-unresolved`. |
| standards/rule/core-model.declare-size-stacks-and-optional-types | checkable | `dotnet run --project tools/model/Litenova.Model -- check` reports `profile-type-missing` and `record-shape`. |
| standards/rule/core-model.give-every-use-case-its-results | checkable | `dotnet run --project tools/model/Litenova.Model -- check` reports `use-case-without-success` and `case-result-unresolved`. |
| standards/rule/core-model.cover-every-public-use-case-from-a-journey | checkable | `dotnet run --project tools/model/Litenova.Model -- check` reports `journey-reach`. |
| standards/rule/core-model.read-truth-from-code-screens-and-test-runs | checkable | `dotnet run --project tools/model/Litenova.Model -- check` reports `use-case-unimplemented`, `proves-unconfirmed`, and `refusal-not-thrown`. |
| standards/rule/core-model.render-generated-regions-from-the-model | guidance | Are generated regions current, or is a replacement recorded? |
