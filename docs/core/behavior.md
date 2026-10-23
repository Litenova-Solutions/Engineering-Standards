# Behavior Records

## Intent

Behavior states how the system acts to keep the promises Intent records: the words it uses, the areas it divides into, the things it keeps consistent, the rules that hold, and the behavior it defines with its endings and examples. Agents write these records from Intent, and developers review them before code carries them. The [model page](model.md) states the shared record rules, and the [intent page](intent.md) states the promises Behavior answers to.

## Concepts

### Bounded Context and Module

The product speaks one business language inside one deployment boundary, as the [scope page](scope.md) states. Modules organize that language into areas; they stay areas of one language and one deployment, never languages or deployments of their own. A module is one business area: a page under the behavior docs carrying a `summary` and the `dependsOn` links to the modules it relies on, in the home the [model page](model.md) names.

| Field | Meaning |
|:---|:---|
| `summary` | What the area covers, in one paragraph. |
| `dependsOn` | The modules this module relies on. |

### Glossary

The glossary is the project ubiquitous language: the one word or phrase the project uses for each concept, with its meaning. Each term carries `layer`: intent for business words, behavior for design words such as aggregate, refusal, and reaction. Each term lists in `aliases` the established synonyms its readers know, so industry readers find LiteSpec own words: a refusal is a rejection or error, a reaction is a policy or automation, a compensation is an undo. The `rejected` list still bars the synonyms the project refuses, as the [authoring page](authoring.md) states.

| Field | Meaning |
|:---|:---|
| `term`, `meaning` | The one word and what it means. |
| `layer` | `intent` or `behavior`. |
| `aliases` | Established synonyms readers know. |
| `rejected` | Synonyms barred in their scope. |
| `broader`, `narrower`, `values`, `labels` | The wider and narrower terms, the closed values, and the manner labels. |

### Aggregates

An aggregate is one thing the product keeps consistent and changes in one step, through its root. Each aggregate declares one kind, defaulting to entity when the page names none. The aggregate identifier carries its module, so containment follows the identifier and needs no link field.

| Kind | Meaning |
|:---|:---|
| `entity` | One thing kept consistent through its root, with states, transitions, and data. |
| `process` | A multi-step aggregate with steps, exits, `finishedWhen`, and a driver. |
| `store` | State no aggregate invariant guards, such as a library-owned table, with a named owner. |

The body keeps the Transitions and Data tables from the aggregate page style. The Transitions table lists every allowed change with the use case moving it, naming the state left and the state entered. The Data table lists the fields the aggregate keeps with name, meaning, classification, and data class. Each data class declares how its fields erase:

| Field | Meaning |
|:---|:---|
| `name`, `classification`, `fields` | The class, its `public`, `internal`, `personal`, or `sensitive` handling, and its fields. |
| `onErasure` | `erase`, `pseudonymise`, `retain`, or `exempt`. |
| `basis` | `statute`, `business`, or `engineering`. |
| `period` | The retention period as an ISO duration, or `none (on-demand)`. |
| `enforcedBy` | `job/...`, `record-expiry`, `store-ttl`, or `query-filter`. |
| `reach` | `own-tenant`, `subject-wide`, or `platform-wide`. |
| `exceptions` | Per-field erasure positions differing from the class. |
| `reason`, `reviewBy`, `acceptedBy` | The reason and review date of an exemption, and the Intent record accepting retained or exempt personal data. |

### Process Aggregates

A process is an aggregate with a multi-step life: a resale queue, an erasure request, a hiring pipeline. Its steps name the work in order; each step carries an optional `when` guard and a compensation, the step undo: the use case reversing the step, or `none` with the reason no undo applies. Its exits name the ways out, its `finishedWhen` names the observable end, its `driver` names what moves it, and its `cursor` names where resume state lives when a job drives it.

| Field | Meaning |
|:---|:---|
| `steps` | Ordered `{ name, when, compensation }` entries; `compensation` is `use-case/...` or `none (reason)`. |
| `exits` | `{ name, trigger, then }` entries; a trigger is a condition, a `decision by <actor>`, or a `due <duration>`. |
| `finishedWhen` | The observable end, in one sentence. |
| `driver` | `reaction/...`, `job/...`, or `operator: <who, via runbook/..., due <duration>>` entries. |
| `cursor` | Where resume state lives for a job-driven process. |

### Rules

A rule states what holds, with its `kind` and its `statement`. A rule names what it constrains in `governs`, the refusal its breach produces in `refusal`, the requirements it carries in `fulfills`, and the constraints and research behind it in `basedOn`. A cross-aggregate rule spans aggregates and lives on a rule page; each other rule lives as an entry on its aggregate page.

| Kind | Meaning |
|:---|:---|
| `invariant` | Holds after every change. |
| `precondition` | Guards the behavior before it runs. |
| `calculation` | Derives a value, proven by an examples table. |
| `cross-aggregate` | Spans aggregates and lives on a rule page. |
| `atomicity` | Names one atomic write group. |
| `reservation` | Holds a claim until a use case releases it, named in `releasedBy`, or `never` with its cost. |
| `commercial-data` | Freezes a commercial value, with `frozenWhen` and `historyLink`. |
| `default` | States a model default. |

A query and a command showing and recording one value both cite the same calculation rule in `computedBy`. Code anchors up to the rule and never the reverse.

### Domain Events

A domain event is an immutable statement that a business fact completed, named in the past tense, with its `meaning` and the facts it `carries`. Each event is raised through the root of its aggregate, and each event stays inside the product. Facts crossing the boundary are integration events.

| Field | Meaning |
|:---|:---|
| `meaning` | What happened, in one sentence. |
| `carries` | The facts arriving with the event. |

### Integration Events

An integration event is a published fact crossing the bounded context in CloudEvents form. Its direction is `out` for facts the product emits and `in` for facts it accepts. Readers place one of two trusts in it: `trigger-only`, where the event wakes a read of the source, or `payload`, where the fields are fit to act on.

| Field | Meaning |
|:---|:---|
| `direction` | `out` or `in`. |
| `eventType`, `source`, `subject` | The CloudEvents type, source, and what the subject identifies. |
| `payload` | `{ name, meaning, classification }` entries. |
| `trust` | `trigger-only` or `payload`. |
| `correlation` | How an inbound event is matched, inbound only. |
| `translates` | The domain event it carries outward, outbound only. |
| `audience` | The permission reading it, outbound only, optional. |

### Use Cases

A use case is one independently testable goal: a page beside its aggregate with one kind. A command changes the product; a query reads without changing. Each use case names the journey steps or goals it serves in `serves`, the requirements it carries in `fulfills`, who calls it in `access`, the entry points reaching it in `reachedThrough`, the aggregates it touches in `changes` and `reads`, the events it raises in `raises`, and how it ends in its results. A use case may carry an optional `risk` from money, door, personal-data, and access, as the [model page](model.md) states.

| Field | Meaning |
|:---|:---|
| `access` | `{ auth, grant, tenant }`: auth of `session`, `token`, `device`, `link`, `app`, `anonymous`, or `system`; grant of `permission/<name>`, `self(permission/<name>)`, `anonymous`, or `system`; tenant of `own`, `cross`, `public`, or `none`. |
| `input` | `{ name, meaning, rules, source, classification }` entries; source is `caller`, `claim`, or `derived`. |
| `changes`, `reads` | Aggregate ids touched, including `store` aggregates. |
| `consistency` | `{ mode, because }`: mode of `atomic`, `per-record`, `compensated`, or `best-effort`. |
| `effects` | `{ issues / sends / publishes / calls, timing, onFailure, before, forEach }` entries with exactly one verb; timing is `inline`, `after-commit`, or `async`. An inline `issues` entry states `sharesTransaction`. |
| `idempotency` | `{ mode, key, scope, reason }`: mode of `key`, `state`, `not-pending`, or `none`. |
| `audit` | `{ reason, target }` with reason of `required`, `optional`, or `none`, or `{ exempt }` with its justification. Commands are audited by default with reason `none`, and async work audits at request time. |

Goal and What Happens are required only when the use case changes more than one aggregate, refuses beyond the generic refusals, carries risk, or issues inline effects. Otherwise frontmatter plus Goal is enough.

### Queries

A query reads without changing and declares what its readers receive. Its output groups fields into named `include` groups, each with its fields, classification, source aggregates, and freshness. Freshness is `immediate`, `snapshot`, `bounded` with a duration, or `advisory` naming the authority deciding later and exposing the gap as a typed output field. A command may declare its output as a list of `{ name, meaning }`.

| Field | Meaning |
|:---|:---|
| `output.include` | Named groups of `{ fields, classification, source, freshness, visibleWhen, wideningBecause }`; each field carries `name` and `meaning`. |
| `visibleWhen`, `wideningBecause` | The optional visibility condition and the requirement widening visibility beyond the sources. |
| `paging` | `{ order, cursor | offset, defaultLimit, maxLimit }`, or `none (reason)`. |
| `builtAsynchronously` | Set where the source lags, with a bounded or advisory freshness and a lag scenario. |

### Results and Refusals

Each use case ends in named results: child records with an `outcome` of `success` or `refusal`, a `code` on a refusal, and a `meaning`. Refusals stand in precedence order: the first match wins. A refusal is a rejection or error in industry words; the record word stays refusal.

| Field | Meaning |
|:---|:---|
| `code`, `meaning` | The stable refusal code, such as `spending.receipt-missing`, and what it means. |
| `recorded` | Set where the attempt and its reason are stored; a validating refusal stores nothing. |
| `codes` | The closed list of recorded outcomes inside a success. |

Generic refusals for forbidden access and invalid input are derived from `access` and `input` and never written as records. A derived generic result is `result/<use-case-home.name>.forbidden` or `result/<use-case-home.name>.invalid-input`, and scenarios may point at derived results.

### Scenarios

A scenario proves one ending: a child record with `given`, `when`, `then`, an optional `examples` table, and the `result` it ends in. One test proves each scenario through the public boundary, and a proof goes stale when its scenario semantic hash changes. The book groups scenarios under their result.

| Field | Meaning |
|:---|:---|
| `given`, `when`, `then` | The situation, the action, and the assertion. |
| `examples` | The debated rows, required behind a calculation rule. |
| `result` | The written or derived result the scenario ends in. |

### Reactions

A reaction is a when-X-do-Y automation: on a domain or integration event, it issues one use case or sends one notification. A reaction changes nothing directly; a reaction needing a change issues a small command. It is filed with the module whose records it changes, or with the notification module when it only sends.

| Field | Meaning |
|:---|:---|
| `on` | The domain or integration events answered. |
| `if` | The skip condition in domain words, optional. |
| `issues`, `sends` | Exactly one: the use case issued or the notification sent. |
| `forEach`, `reads` | The optional scope and the aggregates read. |
| `fulfills`, `serves` | The requirements carried and the journey steps served. |
| `idempotency` | The idempotency mode, usually `state`. |
| `onFailure` | `retry (<attempts>, <backoff>) then dead-letter`, `skip-and-log`, or `discard`, with an optional `onExhausted`. |

A reaction may hold scenario child records ending in the issued use case result.

### Jobs

A job is scheduled, one-off, or operator work running without a request. A scheduled job runs on its structured schedule; a one-off job runs once; an operator job is interactive platform work with no aggregate, such as a rehearsal harness. Its `issues` run once per item in its `scope`.

| Field | Meaning |
|:---|:---|
| `kind` | `scheduled`, `one-off`, or `operator`. |
| `schedule` | `{ every | cron, timezone }` in structured form. |
| `scope`, `batchSize`, `lease` | What each run selects, how many items per batch, and the lock with its duration. |
| `issues`, `reads` | The use cases run per item and the aggregates read. |
| `serviceLevel`, `evidence` | The promise citing its requirement, and where proof of a run lands. |
| `runbook`, `runsWhere` | The runbook answering the job and where it runs. |
| `fulfills`, `serves`, `onFailure`, `idempotency` | As on a use case and a reaction. |
| `guard` | The guard an operator job runs under. |
| `cursor` | Where resume state lives on a driven process. |

### Notifications

A notification is one person-facing message with its template, audience, and channel. Each `sends` edge carries its own `if` suppression, and suppression scenarios saying the message sends nothing are first class.

| Field | Meaning |
|:---|:---|
| `template`, `params`, `locale` | The template key, its parameters, and where the language comes from. |
| `audience`, `channel` | The actors addressed and the channels: `email`, `sms`, `push`, `webhook`. |
| `consent` | The consent rule, such as SMS only with consent. |
| `frequency`, `dedupKey` | `once` or `per-attempt`, and the dedup template over the trigger payload. |
| `suppressedWhen` | The suppression condition, optional. |
| `claims` | `{ claim, requirement }` entries for what the message says. |
| `fulfills` | The requirements carried. |

### Settings

A setting is one tunable value with its type, range, unit, setter, and bound behavior. A default or figure that is commercial, legal, or differs by tenant, market, or date fulfills a requirement; a model invariant is a rule instead. The `setting-set` page style holds many settings.

| Field | Meaning |
|:---|:---|
| `valueType` | `integer`, `duration`, `money`, `boolean`, `text`, or `choice`. |
| `default`, `range`, `unit` | The value, the min-max or choices, and the unit. |
| `setBy` | `founder`, `operator`, or `tenant`. |
| `atBound` | `refuse`, `truncate`, or `degrade`. |
| `secret` | Whether the value is secret. |
| `fulfills` | The requirements carried. |

### Entry Points

An entry point is one way callers reach the product. Each entry point declares its kind and its `auth`. Served content is a static script or legal text with its path, content type, cache control, and versioning: content served, not a use case run.

| Kind | Meaning |
|:---|:---|
| `browser`, `api`, `webhook`, `device`, `cli`, `mcp` | A browser app, a public interface, an inbound hook, a device, a command line, or a model context channel. |
| `served-content` | Static content with `path`, `contentType`, `cacheControl`, `versioning`, and `fulfills`. |
| `reaction`, `job` | Behavior an event causes and background work without a request. |

The optional `protocol` block belongs to the `devices` extension. The [access page](access.md) states actors, roles, and permissions.

### External Systems

An external system is one system outside the bounded context the product exchanges messages with. It acts inside the product as one actor, and each operation declares its direction, timeout, retries, response, and cache. Its erasure position says how personal data leaves it: a call, an integration event, or `impossible` with its reason and acceptance.

| Field | Meaning |
|:---|:---|
| `actor` | The actor the system acts as. |
| `operations` | `{ name, direction, timeout, onTimeout, retries, response, cache }` entries; direction is `out` or `in`. |
| `erasure` | `call <operation>`, `via integration-event/...`, or `impossible (reason)` with `acceptedBy`. |

### Retention Schedule

The retention schedule is one page listing every data class with its basis, period, enforcement, and the requirement behind personal or sensitive keeping. Its columns follow GDPR article 30 order; the deleting job and the evidence are LiteSpec extensions to that record. Processors and conflicts sit on the row: where the data forwards, and which demand wins when keeping for audit and erasing for the subject collide, with who records the exception.

| Field | Meaning |
|:---|:---|
| `dataClass`, `aggregates` | The class and the aggregates holding it. |
| `basis`, `period`, `enforcedBy` | The statute, business, or engineering basis, the period, and the enforcement. |
| `intent` | The requirement behind personal or sensitive keeping. |
| `processors` | `{ system, forwarding, acceptedBy }` entries. |
| `conflicts` | Which demand wins on a keeping-versus-erasing collision and who records it. |

### Spec to Design Mapping

The specification names only what carries business meaning. Child entities and value objects are design choices inside an aggregate: they appear in code and the glossary, never as records. Each record maps to one design pattern; the stack pages state the code form of each pattern.

| Spec record | Design pattern |
|:---|:---|
| module | one module in the bounded context |
| aggregate, entity | one aggregate, changed through its root |
| aggregate, process | one multi-step aggregate with steps, exits, and a driver |
| aggregate, store | one state holder with a named owner and no guarded invariant |
| aggregate `states` | the lifecycle of the aggregate |
| (none) | child entity, changed only through the root |
| (none) | value object, compared by value |
| rule, invariant | an invariant checked on every change |
| rule, precondition | a guard the behavior passes before it runs |
| rule, calculation | a pure computation on the aggregate or its values |
| rule, cross-aggregate | a stored constraint, or a reaction reaching eventual consistency |
| rule, atomicity | one atomic write group across the named aggregates |
| rule, reservation | a held claim with its release |
| rule, commercial-data | a frozen commercial value with its history |
| rule, default | a default value the model holds |
| event | a domain event raised through the root |
| integration event | a published fact in CloudEvents form |
| use case, command | one handler behind the use case |
| use case, query | one read behind the use case |
| reaction | one automation answering its trigger |
| job | one scheduled, one-off, or operator run |
| notification | one rendered message to its audience |
| setting | one tunable value with its range and setter |
| result | one ending per result, each refusal with its code |
| scenario | an executable example proving the scenario |

## Standards

### Define Every Behavior Term in the Glossary

**Statement:** Each term a Behavior record names MUST have a glossary entry stating its meaning.

**Rationale:** Records and code share one language only when each word is defined once: a term used without an entry means whatever each reader guesses. The entry fixes the meaning, the rejected synonyms, and the wider and narrower terms, so reviewers and checks read the same word the same way.

**Example:** The term `receipt` carries the meaning "proof of payment accepted for an expense" in the glossary, so every record naming a receipt means that proof.

### Mark Each Term with Its Layer

**Statement:** Each glossary term MUST carry its layer, intent or behavior, with the established synonyms its readers know in `aliases`.

**Rationale:** Business words and design words age on different clocks: a business term moves when the market moves, while a design term moves when the model moves. The layer tells each reader which clock the word follows, and the aliases let industry readers find LiteSpec own words without learning a second vocabulary first.

**Example:** The term `refusal` carries `layer: behavior` with `aliases: ["rejection", "error"]`.

### State Every Module Dependency

**Statement:** Each module MUST name every module it depends on in `dependsOn`.

**Rationale:** A module relies on the language and behavior of others, and each reliance shapes change: editing a module ripples into everything depending on it. Naming every reliance in `dependsOn` shows that ripple as data instead of leaving it for readers to reconstruct from prose.

### Declare the Kind of Every Aggregate

**Statement:** Each aggregate MUST declare its kind: entity, process, or store.

**Rationale:** The kind decides what the page carries: an entity carries a lifecycle, a process carries steps with exits and a driver, and a store carries an owner with no guarded invariant. Without the kind, a reviewer cannot tell a thing kept consistent from a table the product only holds.

**Example:** The ticket resale aggregate declares `kind: process`, and the suppression list declares `kind: store`.

### Name the Owner of Every Store

**Statement:** Each store MUST name its owning system or module in `owner`.

**Rationale:** A store holds state no aggregate invariant guards, so nothing in the model explains who answers for its shape: a library-owned table, a suppression list, or a delivery log. Naming the owner puts one party behind it, and keeps staff actions on it as ordinary use cases instead of unwritten operations.

### Model Each Aggregate Lifecycle with States

**Statement:** Each entity and each process MUST declare its lifecycle as `states` entries with a name and a meaning.

**Rationale:** A bare state name tells a reviewer nothing: `rejected` without its meaning hides what rejection costs and allows. A name with a meaning makes each lifecycle step reviewable on the page, and gives the Transitions table states worth connecting. A store carries no lifecycle, so it carries no states.

**Example:** The ticket resale process declares `Listed`, `Resold`, `Settled`, `Withdrawn`, and `Lapsed`, each with one sentence saying what the resale awaits or has received.

### Connect Every State Through Transitions

**Statement:** Each entity and each process MUST list every allowed state change with its use case in its Transitions table.

**Rationale:** States without transitions are a list of names with no path between them: a reviewer sees where an aggregate rests but never how it moves. Listing every allowed change with the use case that moves it shows the whole lifecycle as debated rows, and leaves no state reachable only by a path no record names. The `state-unreachable` and `transition-unresolved` checks report a state no transition reaches and a transition naming a missing state or use case.

### Classify Every Aggregate Data Field

**Statement:** Each aggregate MUST list its data fields with their meaning, classification, and data class in its Data table.

**Rationale:** Data without a classification is handled by guess: personal facts sit beside public ones with nothing marking which is which. A meaning with a classification of public, internal, personal, or sensitive tells every later reader how each field is handled, and the data class ties the field to its erasure position and its retention row.

### Declare Every Data Class with Its Erasure Position

**Statement:** Each data class MUST declare its classification, its fields, its erasure position, its basis, its retention period, and the enforcement that carries it out.

**Rationale:** Erasure declared per field drifts: one field keeps a new position while its twin keeps the old one. Declaring the position once per class, with per-field exceptions beside it, keeps one decision in one place. The position is `erase`, `pseudonymise`, `retain`, or `exempt`; the basis is `statute`, `business`, or `engineering`; the period is an ISO duration or `none (on-demand)`; the enforcement is `job/...`, `record-expiry`, `store-ttl`, or `query-filter`. The `erasure-undeclared` check reports a personal or sensitive field with no declared position, and `retention-without-enforcement` reports a class nothing enforces.

**Example:** The buyer-contact class declares `personal`, `pseudonymise`, and its approving requirement, while the money class declares `internal`, `retain`, a statutory seven years, and the finance expiry job.

### Accept Every Retained Personal Data Class in Intent

**Statement:** Each personal or sensitive data class kept with `retain` or `exempt` MUST name the Intent requirement or decision accepting it in `acceptedBy`.

**Rationale:** Keeping personal data past erasure is a business choice, not a technical default: the statute or the founder accepts it, with the reason on record. Naming that requirement or decision in `acceptedBy` keeps the keeping reviewable where the promise lives. The `risk-without-acceptance` check reports a retained or exempt personal or sensitive class with no Intent acceptance.

### Review Every Erasure Exemption Before Its Date

**Statement:** Each exempt data class MUST carry its reason and a future `reviewBy` date.

**Rationale:** An exemption without a date is a permanent exception wearing temporary clothes: nobody reopens it, so it holds forever. A reason with a future review date makes the exemption a dated choice the owner rejudges on time. The `exemption-expired` check reports an exemption past its date.

### State Each Process Step with Its Compensation

**Statement:** Each process step MUST name its compensation: the use case undoing it, or `none` with the reason it needs no undo.

**Rationale:** A step without a named undo leaves failure handling to the implementer: each handler invents its own reversal, and some invent none. Naming the compensating use case states the reversal beside the step, and `none` with its reason states why no reversal applies, such as money already moved. The step may also carry a `when` guard stating when it runs.

**Example:** The hold-place step compensates with the release-hold use case, while the settle step carries `none (money has moved)`.

### Close Every Process with Named Exits and a Driver

**Statement:** Each process MUST name its exits with their triggers, its `finishedWhen`, and its `driver`.

**Rationale:** A process with no named end runs until someone notices: a resale waits forever, an erasure sits half done. Exits with triggers name every way out, `finishedWhen` names the observable end in one sentence, and the driver names what moves the process: a reaction, a job, or an operator with a runbook and a due duration. A job-driven process also names its `cursor`, where resume state lives.

**Example:** The ticket resale process exits as withdrawn on buyer decision and as lapsed at the return window, finishes when settled, withdrawn, or lapsed, and is driven by a completion reaction, an expiry job, and the box office operator.

### Prove Every Process Guard and Exit with a Scenario

**Statement:** Each `when` guard and each process exit MUST have a scenario proving it.

**Rationale:** A guard no scenario exercises is a condition nobody checked: it holds in prose and fails in code. A scenario per guard and per exit pins each branch as a checked fact, including the branches where the process leaves early.

### State Each Rule with Its Kind

**Statement:** Each rule MUST state its kind and its statement.

**Rationale:** The kind decides how the rule is proved: an invariant on every change, a precondition before the behavior, a calculation through its examples, a cross-aggregate rule where aggregates meet, an atomicity rule per write group, a reservation through its release, a commercial-data rule through its frozen value, a default through the value the model holds. A rule without a kind leaves each reader to prove it a different way, and the checks no place to confirm it.

**Example:** `rule/ticket-resale.refund-never-exceeds-paid` is an invariant stating "a refund never exceeds what the buyer paid", checked on every resale settlement.

### Keep the Negation Word in the Rule Name

**Statement:** A rule whose statement says `not`, `no`, `never`, or `cannot` MUST keep that word in its name.

**Rationale:** A name that drops the negation reads as its own opposite: a rule named `cancel-after-shipment` whose statement says "never" approves what it forbids. Keeping the word keeps the name a true sentence a reviewer trusts without opening the statement. The `rule-name-negation` check reports a rule whose statement negates outside its name.

**Example:** The rule reads `rule/order.cancel-never-after-shipment`.

### Keep Cross-Aggregate Rules on a Rule Page

**Statement:** A rule spanning aggregates MUST live as an entry on a rule page.

**Rationale:** An aggregate page holds what one aggregate guarantees; a rule spanning aggregates guarantees what no single aggregate owns. Giving such rules their own page keeps each aggregate page a true account of its aggregate, and gathers the shared rules where a reviewer judges them together.

### Name the Refusal a Broken Rule Produces

**Statement:** Each rule whose breach refuses a use case MUST name the refusal in `refusal`.

**Rationale:** A guarded rule without a named refusal leaves the ending unnamed: callers branch on a refusal the records never predicted. Naming the refusal ties the rule to the result the use case declares, so the breach and the ending stay one fact.

### Release Every Reservation by a Named Use Case

**Statement:** Each reservation rule MUST name the use case releasing it in `releasedBy`, or `never` with its cost.

**Rationale:** A held claim with no release is a leak: places, funds, or names stay locked past their need, and nobody owns freeing them. Naming the releasing use case states the end of the hold beside its start, and `never` with its cost admits a hold that truly lasts, with the price on record. The `reservation-without-release` check reports a reservation with no release.

### Freeze Every Commercial Data Value

**Statement:** Each commercial-data rule MUST name when the value freezes in `frozenWhen` and where its history lives in `historyLink`.

**Rationale:** A price, fee, or rate read live changes under settled business: a refund follows today price instead of the price at sale. Naming when the value freezes pins each reading to its moment, and the history link keeps the earlier values reachable for audit and dispute.

### Compute Shared Values from One Calculation Rule

**Statement:** A value shown by a query and recorded by a command MUST cite the same calculation rule in `computedBy` on both use cases.

**Rationale:** Two computations of one value drift: the screen shows one figure while the ledger records another, and each side cites its own code. Citing the same calculation rule on both use cases keeps one computation behind both faces. Code anchors up to the rule and never the reverse.

### Tabulate Every Calculation with Examples

**Statement:** Each calculation rule MUST be proven by a scenario carrying an examples table.

**Rationale:** A calculation stated only as a sentence hides its edges: reviewers agree on the words while each pictures other numbers. An examples table shows the debated rows, and the scenario proving the rule pins them as checked facts. The `calculation-without-table` check reports a calculation rule with no scenario examples table.

### State Each Event with Meaning and Carries

**Statement:** Each event MUST state its meaning and the facts it carries.

**Rationale:** An event without a meaning is a name every reaction interprets alone; facts without a carries list are reconstructed from code at each reaction. Stating both on the entry lets each reaction trust what happened and what arrived with it.

### Raise Every Event Through Its Aggregate Root

**Statement:** Each event MUST be raised through its aggregate root.

**Rationale:** The root is the one type through which outside behavior changes the aggregate, so it sees every change worth announcing. Raising each event there keeps the fact and its announcement in one step, and leaves no event announced for a change the aggregate never made.

### Describe Every Integration Event for Its Direction

**Statement:** Each integration event MUST declare its direction, its CloudEvents identity, its payload with classifications, and the trust its readers place in it.

**Rationale:** A published fact without a direction is read both ways: an outbound notice is answered as an order, an inbound claim is trusted as law. The direction, the CloudEvents type, source, and subject, the payload with classifications, and the trust of `trigger-only` or `payload` state what the fact is and how far readers follow it. An inbound event also declares its `correlation`; an outbound event declares its `translates` domain event and its optional `audience`.

### Publish Every Outbound Integration Event from Effects

**Statement:** Each use case or reaction emitting an integration event MUST declare it in its effects as `publishes`.

**Rationale:** An emitted fact no edge declares is a hidden coupling: downstream readers depend on a promise the records never made, and the promise breaks without a diff. Declaring each emission as a `publishes` effect states the coupling beside the behavior causing it. The `effect-undeclared` check reports an emitted event no record declares.

### Reach Every Inbound Integration Event Through a Webhook

**Statement:** Each inbound integration event MUST arrive through an entry point of kind `webhook`.

**Rationale:** An inbound fact with no door is accepted anywhere: each handler invents its own intake, and trust scatters across the code. Arriving through a webhook entry point gives each inbound fact one door with one auth, where trust and correlation hold.

### Give Each Use Case a Command or Query Kind

**Statement:** Each use case MUST declare one kind: command or query.

**Rationale:** The kind decides what the use case is allowed to touch: a command changes, a query reads. A use case with no kind leaves each reader to allow it everything, and the checks no shape to confirm. When-X-do-Y behavior is a reaction record, and work without a request is a job record.

### Connect Each Use Case to Intent

**Statement:** Each use case MUST name a journey step in `serves` or a requirement in `fulfills`.

**Rationale:** A use case serving nothing and fulfilling nothing is behavior nobody asked for: it ships without a promise behind it and stays when the promise changes. Naming a journey step or a requirement ties each behavior to the intent it carries. The `record-orphaned` check reports a use case with neither field, and `step-unserved` reports a journey step no use case serves.

**Example:** The complete-ticket-resale command serves `journey/hand-a-ticket-back#s3` and fulfills `requirement/buyers.return-refund-on-own-charge`.

### Grant Each Use Case Scoped Access

**Statement:** Each use case MUST declare its `auth`, its grant, and its tenant scope in `access`.

**Rationale:** Access split across prose and code is widened silently: a new caller arrives, the grant stretches, and no record shows it. Declaring the auth kind, the grant of `permission/<name>`, `self(permission/<name>)`, `anonymous`, or `system`, and the tenant scope of `own`, `cross`, `public`, or `none` states who calls and how far the call reaches in one place. Tenant scope `cross` routes the use case to the security queue of the behavior diff. The `use-case-access` check reports code reaching past the grant.

**Example:** The complete-ticket-resale command declares session auth, the manage-listing permission, and own-organizer tenant scope, while the door scan declares device auth with a system grant.

### Name the Entry Points That Reach Each Use Case

**Statement:** Each use case MUST name the entry points that reach it in `reachedThrough`.

**Rationale:** A use case with no named door is reachable from anywhere or nowhere: reviewers cannot tell a public operation from an internal one. Naming the entry points shows how callers arrive at each behavior.

### Describe Every Use Case Input with Source and Classification

**Statement:** Each use-case input MUST declare its name, meaning, source, and classification.

**Rationale:** An input without a source is trusted on faith: caller-asserted values pass as verified claims, and money moves on an unchecked figure. Declaring the name, the meaning, the source of `caller`, `claim`, or `derived`, and the classification states what arrives and how far to trust it.

### Bound Every Caller-Supplied Input Value

**Statement:** Each input value with `source: caller` on a money or access path MUST cite the rule bounding it.

**Rationale:** A caller-asserted figure on a money or access path is an open till: a replacement amount arrives negative, a quantity arrives absurd, and the code obliges. Citing the rule bounding it ties each such value to the guard holding it.

**Example:** The replacement net amount cites the positivity rule bounding it.

### Name Every Aggregate a Use Case Changes or Reads

**Statement:** Each use case MUST name every aggregate it changes in `changes` and every aggregate it reads in `reads`.

**Rationale:** A write no record names is invisible to review: the handler touches a second aggregate, the second aggregate changes under its reviewers, and no diff shows it. Naming every touched aggregate, including `store` aggregates, states the read and write footprint beside the behavior. The `write-undeclared` check reports a write outside `changes`.

### State the Consistency of Every Use Case

**Statement:** Each use case MUST declare its write consistency in `consistency`.

**Rationale:** Consistency left unsaid defaults to hope: a multi-aggregate write is read as atomic until it fails halfway. Declaring the mode states the promise: `atomic` with its `because` rules when `changes` lists more than one aggregate, `per-record` with a receipt per target on best effort, `compensated` with every mutating step naming its compensation. Atomic consistency never spans an `async` edge. The `consistency-unexplained` check reports an atomic multi-aggregate write with no `because`, and `many-aggregates` flags more than one atomic write group as a smell to consider.

**Example:** The complete-ticket-resale command declares atomic consistency because of the one-open-return rule, while the door scan declares per-record consistency across its attempts.

### Declare Every Effect with One Verb and Its Timing

**Statement:** Each effect entry MUST carry exactly one verb and its timing.

**Rationale:** An edge no record declares is the defect: hidden calls between use cases, reactions, jobs, notifications, integration events, and external systems. Declaring each edge with exactly one verb of `issues`, `sends`, `publishes`, or `calls`, with its timing of `inline`, `after-commit`, or `async`, its failure handling, and its `before` and `forEach` where they apply, states every coupling as data. The `effect-undeclared` check reports an edge the records never declared.

**Example:** The complete-ticket-resale command publishes the resold integration event after commit.

### State the Transaction Sharing of Every Inline Call

**Statement:** Each inline `issues` effect MUST state whether it shares the caller transaction in `sharesTransaction`.

**Rationale:** An inline call without a stated transaction is a coin toss at failure: the caller rolls back while the issued work stands, or the reverse. Stating whether the call shares the caller transaction makes the failure shape reviewable beside the edge.

### Keep the Effect Graph Free of Cycles

**Statement:** The effect graph MUST hold no cycle except through a domain event carrying its end condition.

**Rationale:** A cycle without an end condition runs until something breaks: a reaction issues a command raising the event triggering the reaction. Forbidding cycles except through a domain event with a stated end condition keeps every loop a loop with an exit. The `effect-loop` check reports a cycle with no stated end.

### Name the Events Each Use Case Raises

**Statement:** Each use case MUST name the domain events it raises in `raises`.

**Rationale:** An event raised but unnamed leaves reactions hanging: downstream behavior answers a fact no behavior admits raising. Naming the raised events ties each fact to the behavior announcing it.

### Name the Idempotency of Every Use Case

**Statement:** Each use case MUST declare its idempotency mode with the key, scope, or reason that mode needs.

**Rationale:** A retried call without a stated idempotency runs twice: a double charge, a double admission, a double notice. Declaring the mode of `key`, `state`, or `not-pending`, with its key template and scope, states how repeats collapse; `none` carries the reason repeats cannot happen. The door scan keys on the scanner nonce scoped to the device.

### State the Audit Position of Every Command

**Statement:** Each command MUST declare its audit reason and target, or its exemption with its justification.

**Rationale:** An unaudited change with no exemption is a gap nobody admitted: money moves, doors open, and no record says who asked. Declaring the reason of `required`, `optional`, or `none` with its target, or the exemption with its justification, states the audit beside the change. Commands are audited by default with reason `none`, and async work audits at request time.

### Declare Every Query Output

**Statement:** Each query MUST declare its output in named `include` groups.

**Rationale:** A query without a declared output returns whatever its author fetched: readers and screens guess the shape from code. Declaring the output in named groups with fields, classifications, sources, and freshness states what readers receive, so the shape is reviewable before anything implements it. The `query-output-missing` check reports a query with no declared output.

**Example:** The organizer home query declares setup and attention groups with immediate freshness.

### Justify Every Wider Visibility

**Statement:** Each include group visible to more roles than its sources MUST cite the approved requirement widening it in `wideningBecause`.

**Rationale:** A read showing more than its sources is a quiet widening: roles see figures their own grants never allowed, and no founder approved the view. Citing the approved requirement in `wideningBecause` keeps the widening a decided choice, and `visibleWhen` states the condition where one narrows it. The `widening-unjustified` check reports a widened group with no cited requirement.

### Declare Paging on Every Collection Query

**Statement:** Each collection query MUST declare its paging or `none` with its reason.

**Rationale:** A collection without paging is a promise the data outgrows: the first hundred rows return, the next ten thousand time out. Declaring the order, the cursor or offset, and the default and maximum limits states the paging beside the read, and `none` with its reason states why a query returns one object. The `paging-undeclared` check reports a collection query with no paging.

### Mark Every Lagging Query as Built Asynchronously

**Statement:** Each query whose source lags MUST set `builtAsynchronously` with a bounded or advisory freshness and a lag scenario.

**Rationale:** A read built asynchronously without a mark is trusted as fresh: screens show yesterday figures as now, and nobody warned them. Marking the query, with a bounded or advisory freshness and one scenario covering the lag, states the staleness beside the promise.

### End Every Use Case in Named Results

**Statement:** Each use case MUST declare its success result and every refusal with its code.

**Rationale:** Callers branch on named endings: success, or one refusal with its stable code. A use case with no named success leaves readers guessing what good looks like, and a refusal without a code leaves each layer reporting the same breach another way. The `use-case-without-success` check reports a use case with no success result, and `result-undeclared` reports a code the records never declared.

**Example:** The complete-ticket-resale command declares `resale-completed` with `sales.resale-not-listed` and `sales.proceeds-not-positive`.

### Order Every Refusal List by Precedence

**Statement:** Each use case MUST list its refusals so the first match wins.

**Rationale:** Two refusals matching one call need an order: without precedence, each layer picks its own refusal, and callers branch on a different code per stack. Listing refusals in precedence order makes the first match the one every layer reports.

### Record Attempts Behind Recorded Refusals

**Statement:** Each refusal carrying `recorded: true` MUST store the attempt with its reason.

**Rationale:** Some denials are forensics: a door denial, a limit refusal, a fraud block. Storing the attempt with its reason keeps the evidence the business answers with, while a validating refusal such as a malformed code stores nothing.

**Example:** The door scan records unknown, voided, and already-admitted codes with their reasons, while a malformed scan stores nothing.

### List Recorded Outcomes Inside Success Codes

**Statement:** Each success result with recorded outcomes MUST list them in `codes`.

**Rationale:** A success hiding several recorded outcomes forces callers to guess: entry and re-entry both succeed, but the door log and the analytics differ. Listing the closed codes inside the success states each recorded outcome beside the ending.

**Example:** The admitted result lists `entry` and `re-entry`.

### Derive Generic Refusals Instead of Writing Them

**Statement:** A use case MUST NOT write a generic forbidden or invalid-input refusal as a record.

**Rationale:** Hand-written generic refusals multiply: hundreds of pages each declare their own forbidden, and each drifts in wording and code. Deriving them from `access` and `input` keeps one forbidden and one invalid input per use case, current with the grant. Scenarios point at the derived results without anyone writing them.

### Name the Result Each Scenario Ends In

**Statement:** Each scenario MUST name the result it ends in, written or derived.

**Rationale:** A scenario that names no result illustrates behavior without asserting an ending: it reads well and proves nothing. Naming the result ties each example to the ending it walks toward, so every test knows what to assert. The `scenario-result-unresolved` check reports a scenario ending in an unknown result.

### Write Every Scenario in Given When Then

**Statement:** Each scenario MUST state its `given`, `when`, and `then`.

**Rationale:** The three steps separate the situation from the action and the action from the assertion: collapsing them blurs what was true, what moved, and what the test checks. Stating all three keeps each example readable by a person and provable by a test.

**Example:**

```json
{
  "type": "scenario",
  "id": "scenario/submit-expense.submitting-with-a-receipt-succeeds",
  "title": "Submitting with a receipt succeeds",
  "given": "An employee paid for a train ticket and kept the receipt.",
  "when": "The employee submits the expense with the receipt.",
  "then": "The expense is submitted.",
  "result": "result/submit-expense.submitted"
}
```

### Write Prose on Significant Use Cases

**Statement:** Each use case changing more than one aggregate, refusing beyond the generic refusals, carrying risk, or issuing inline effects MUST carry Goal and What Happens.

**Rationale:** Prose on every use case buries the significant ones: a simple read carries two sections saying what the frontmatter already says. Requiring Goal and What Happens only on significant use cases keeps prose where judgment lives, and frontmatter plus Goal suffice elsewhere. The `prose-missing` check reports a significant use case without its prose as advisory.

### Trigger Every Reaction from a Declared Event

**Statement:** Each reaction MUST name the domain or integration events it answers in `on`.

**Rationale:** A reaction without a trigger never runs or runs whenever its author remembered: reviewers see behavior with no moment attached. Naming the answered events states when the behavior fires, and an `if` condition states when it skips. The `reaction-trigger-unresolved` check reports a trigger naming an unknown event.

**Example:** The void-code reaction answers the ticket-resale resold domain event and issues the void-ticket-code command.

### Issue or Send from Every Reaction

**Statement:** Each reaction MUST name exactly one target: the use case it issues or the notification it sends.

**Rationale:** A reaction with no target observes and never acts, while a reaction with two targets hides a second behavior behind the first. Naming exactly one target keeps each automation one decision with one consequence.

### Write No Aggregate Directly from a Reaction

**Statement:** A reaction MUST NOT write an aggregate except through the use case it issues.

**Rationale:** A reaction writing directly splits the write path: the same aggregate changes through a reviewed command and through an unreviewed automation, each with its own guards. Issuing a small command keeps every write behind a use case with its access, consistency, results, and scenarios.

### File Every Reaction with the Module It Changes

**Statement:** Each reaction MUST live with the module whose records it changes, or with the notification module when it only sends.

**Rationale:** Reactions filed by trigger scatter: one module behavior hides on a dozen trigger pages, and nobody sees the module whole. Filing each reaction with the module it changes keeps each module behavior in one place. The trigger page shows reactions to its event as a view derived from records.

### State the Failure Handling of Every Reaction

**Statement:** Each reaction MUST declare its `onFailure` handling and its idempotency.

**Rationale:** A failed automation without handling retries forever or drops silently: notices double-send, voids never land. Declaring the `onFailure` of retry with attempts and backoff then dead-letter, skip-and-log, or discard, with an optional `onExhausted`, states the failure shape beside the trigger, and the idempotency mode, usually `state`, states how repeats collapse.

### Point Reaction Scenarios at the Issued Result

**Statement:** Each scenario on a reaction MUST end in a result of the use case the reaction issues.

**Rationale:** A reaction scenario ending anywhere else proves another behavior story: it walks the trigger and asserts an ending the issued use case never declares. Ending in the issued use case result keeps the scenario a proof of the automation consequence.

### Declare Every Job with Kind and Structured Schedule

**Statement:** Each job MUST declare its kind, scope, issues, reads, service level, evidence, and runbook, with a structured schedule when it runs on time.

**Rationale:** A job without a declared scope and promise is a blind run: nobody states what each run selects, what it runs per item, what it guarantees, or where proof lands. Declaring the kind of `scheduled`, `one-off`, or `operator`, the scope with its batch size and lease, the issued use cases with the aggregates read, the service level citing its requirement, the evidence, and the runbook states the run beside its promise. The schedule is structured with its timezone, never prose. The `schedule-unstructured` check reports a schedule no tool can read.

**Example:** The expire-lapsed-returns job runs every six hours over open returns past their window, issues one expiry per item, and lands its evidence in the run log.

### Guard Every Operator Job

**Statement:** Each operator job MUST state where it runs in `runsWhere` and the guard it runs under.

**Rationale:** Interactive platform work without a guard runs anywhere by anyone: a rehearsal harness touches production, a manual sweep runs twice. Stating where it runs and the guard it runs under keeps operator work inside its fence. The `operator-job-without-guard` check reports an operator job with no guard.

### Describe Every Notification with Audience Channel and Consent

**Statement:** Each notification MUST declare its template, audience, channel, consent, frequency, dedup key, parameters, and locale.

**Rationale:** A message without a declared audience and consent is sent on hope: the wrong actors receive it, the channel ignores consent, repeats annoy. Declaring the template with its parameters and locale, the audience, the channel, the consent rule, the frequency of `once` or `per-attempt`, and the dedup key states the message beside its promise. Suppression lives on each `sends` edge and in suppression scenarios. The `notification-without-sender` check reports a notification no use case or reaction sends.

### Claim Every Notification Promise from a Requirement

**Statement:** Each claim a notification makes MUST cite its requirement.

**Rationale:** A message promising what no requirement holds is a promise nobody approved: the text assures a refund the policy never states. Citing the requirement behind each claim keeps every assured sentence a carried promise.

### Hold Every Setting Default to a Requirement

**Statement:** Each setting MUST declare its value type, range, unit, setter, and bound behavior, with the requirement behind a commercial, legal, or varying default.

**Rationale:** A default no requirement holds is a figure nobody approved: a price, a fee, a term, or a limit the founder never decided. Declaring the value type, the range, the unit, the setter of founder, operator, or tenant, and the bound behavior of `refuse`, `truncate`, or `degrade` states the tunable beside its promise, and a commercial, legal, or tenant-, market-, or date-varying default cites its requirement. The `setting-default-without-requirement` check reports such a default with no cited requirement.

**Example:** The return-queue cap declares an integer with a founder-set default of four, refusing a fifth return, behind its requirement.

### Keep Model Invariants in Rules

**Statement:** A model invariant MUST live as a rule, never as a setting.

**Rationale:** A setting tunes; a rule holds. An invariant filed as a setting reads as tunable, and a later operator tunes away what the model guaranteed. Keeping invariants in rules keeps what holds apart from what varies.

### Give Each Entry Point a Kind

**Statement:** Each entry point MUST declare its kind and its `auth`.

**Rationale:** A door with no kind is entered any way: a webhook is called as a page, a device as a browser. Declaring the kind of `browser`, `api`, `webhook`, `device`, `cli`, `mcp`, `served-content`, `reaction`, or `job` with its auth states how callers arrive and prove themselves.

### Serve Static Content Through Served Content

**Statement:** A static script or legal text MUST be served content with its path, content type, cache control, and versioning, never a use case.

**Rationale:** A static file modeled as a use case invents behavior where none exists: results, scenarios, and handlers for bytes served unchanged. Serving it as content with its path, content type, cache control, versioning, and fulfilled requirements keeps content apart from behavior.

### Describe Every External System Operation

**Statement:** Each external system MUST describe its operations with direction, timeout, timeout handling, retries, response, and cache.

**Rationale:** An outside call without a declared shape fails by surprise: timeouts hang, retries double-charge, responses unparse. Describing each operation with its direction of `out` or `in`, its timeout with its timeout handling, its retries, its response, and its cache states the coupling beside the system. The system acts inside the product as one named actor.

### Route Every External Erasure Through an Operation or Event

**Statement:** Each external system MUST declare its erasure as a call, an integration event, or `impossible` with its reason and acceptance.

**Rationale:** Personal data forwarded to a processor without an erasure route stays there past erasure: the product forgets while the processor remembers. Declaring a call to an operation, a forwarding integration event, or `impossible` with its reason and its Intent acceptance states the route beside the system.

### Schedule Every Data Class for Retention

**Statement:** Each data class MUST appear on the retention schedule with its basis, period, enforcement, and intent link where personal or sensitive.

**Rationale:** Retention decided per aggregate scatters: one module erases in days what another keeps for years, and no page shows the whole. Listing every data class on one schedule with its basis, period, enforcement, processors with their forwarding and acceptance, and the conflict rule where keeping and erasing collide states the whole as debated rows. Personal or sensitive keeping cites its Intent requirement. The `retention-without-enforcement` check reports a row nothing enforces.

### Keep Design Choices Out of the Records

**Statement:** Child entities and value objects MUST appear only in code and the glossary, never as records.

**Rationale:** The records name what carries business meaning; the design inside an aggregate changes without changing that meaning. Recording each child and value as its own record would triple the tree while adding no decision a reviewer approves. Code and the glossary carry them, where builders and readers meet them.

**Example:** Order lines live as a child of the order aggregate, and money as a value with its glossary entry; neither is a record.

## Conventions

### Illustrate Pages with Examples from the Cast

**Default:** Each module, aggregate, and use case page carries an Example section drawn from the example cast.

**Replacement:** A project names the pages that carry an Example section in its documentation.

**Rationale:** Every other section states a rule, a state, or a mapping; none says when the behavior happens or who is under pressure while it does. An occasion drawn from the one shared cast lets a reviewer judge whether the behavior fits the world it serves, and lets readers carry the same people and figures from page to page.

### Group Cross-Aggregate Rules by Theme

**Default:** Each rule page holds the cross-aggregate rules of one theme, named in its Summary.

**Replacement:** A project names its rule-page grouping in its documentation.

**Rationale:** Cross-aggregate rules share no aggregate to gather them, so an ungrouped rule page becomes a list of unrelated checks. One theme per page, stated in its Summary, keeps each page reviewable as one decision about what holds across the domain.

## Reference Example

This informative example demonstrates `litespec/core/behavior#declare-the-kind-of-every-aggregate`, `litespec/core/behavior#model-each-aggregate-lifecycle-with-states`, `litespec/core/behavior#state-each-process-step-with-its-compensation`, `litespec/core/behavior#close-every-process-with-named-exits-and-a-driver`, `litespec/core/behavior#state-each-rule-with-its-kind`, `litespec/core/behavior#give-each-use-case-a-command-or-query-kind`, `litespec/core/behavior#connect-each-use-case-to-intent`, `litespec/core/behavior#grant-each-use-case-scoped-access`, `litespec/core/behavior#bound-every-caller-supplied-input-value`, `litespec/core/behavior#state-the-consistency-of-every-use-case`, `litespec/core/behavior#declare-every-effect-with-one-verb-and-its-timing`, `litespec/core/behavior#end-every-use-case-in-named-results`, `litespec/core/behavior#order-every-refusal-list-by-precedence`, `litespec/core/behavior#trigger-every-reaction-from-a-declared-event`, `litespec/core/behavior#issue-or-send-from-every-reaction`, `litespec/core/behavior#file-every-reaction-with-the-module-it-changes`, `litespec/core/behavior#state-the-failure-handling-of-every-reaction`, `litespec/core/behavior#tabulate-every-calculation-with-examples`, `litespec/core/behavior#record-attempts-behind-recorded-refusals`, `litespec/core/behavior#list-recorded-outcomes-inside-success-codes`, and `litespec/core/behavior#name-the-idempotency-of-every-use-case`.

**Resale queue.** A buyer who cannot attend hands their ticket back. The ticket resale aggregate is a process with states `Listed`, `Resold`, `Settled`, `Withdrawn`, and `Lapsed`, steps from hold-place to settle with compensations, exits for withdrawal and lapse, and a driver of a completion reaction, an expiry job, and the box office operator. The complete-ticket-resale command serves the hand-back journey step, fulfills the own-charge refund requirement, declares session auth with the manage-listing permission, bounds the caller-supplied replacement amount with the positivity rule, writes atomically because of the one-open-return rule, and publishes the resold integration event after commit. Its refusals stand in precedence order ahead of the resale-completed result. The void-code reaction answers the resold domain event, issues the void-ticket-code command from the admission module, and retries five times with backoff before dead-lettering. The refund-never-exceeds-paid rule is proven by a scenario with an examples table: a EUR 50 ticket resold for EUR 65 refunds EUR 50 to the buyer and keeps EUR 15 with the organizer.

**Door scan.** A scanner records each check-in attempt. The record-check-in-attempt command declares device auth with a system grant, per-record consistency, and idempotency keyed on the scanner nonce scoped to the device. Its recorded refusals for unknown, voided, and already-admitted codes store each attempt with its reason, while malformed scans store nothing, and its admitted result lists `entry` and `re-entry` codes.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/behavior#define-every-behavior-term-in-the-glossary | guidance | Each term the Behavior records name appears with its meaning in the project glossary. |
| litespec/core/behavior#mark-each-term-with-its-layer | checkable | `litespec consumer` fails a glossary term without `layer`, and each behavior term lists the synonyms its readers know in `aliases`. |
| litespec/core/behavior#state-every-module-dependency | guidance | Each module page names in `dependsOn` the modules its text and records rely on. |
| litespec/core/behavior#declare-the-kind-of-every-aggregate | checkable | `litespec consumer` fails an aggregate page without `kind` or with an unknown kind. |
| litespec/core/behavior#name-the-owner-of-every-store | checkable | `litespec consumer` fails a store aggregate page without `owner`. |
| litespec/core/behavior#model-each-aggregate-lifecycle-with-states | checkable | `litespec consumer` fails an entity or process page without `states` entries carrying a name and a meaning. |
| litespec/core/behavior#connect-every-state-through-transitions | guidance | The Transitions table on each entity and process page pairs every allowed change with an existing state and use case. |
| litespec/core/behavior#classify-every-aggregate-data-field | guidance | The Data table on each aggregate page pairs each field with a meaning, a classification, and a data class. |
| litespec/core/behavior#declare-every-data-class-with-its-erasure-position | checkable | `litespec model check` reports `erasure-undeclared` for a personal or sensitive field with no declared position and `retention-without-enforcement` for a class nothing enforces. |
| litespec/core/behavior#accept-every-retained-personal-data-class-in-intent | checkable | `litespec model check` reports `risk-without-acceptance` for a retained or exempt personal or sensitive class with no Intent acceptance. |
| litespec/core/behavior#review-every-erasure-exemption-before-its-date | checkable | `litespec model check` reports `exemption-expired` for an exemption past its `reviewBy` date. |
| litespec/core/behavior#state-each-process-step-with-its-compensation | checkable | `litespec consumer` fails a process step without a compensation use case or `none` with its reason. |
| litespec/core/behavior#close-every-process-with-named-exits-and-a-driver | checkable | `litespec consumer` fails a process page without exits carrying triggers, `finishedWhen`, and `driver`. |
| litespec/core/behavior#prove-every-process-guard-and-exit-with-a-scenario | guidance | A scenario proving each `when` guard and each exit sits on the process page or its use case pages. |
| litespec/core/behavior#state-each-rule-with-its-kind | checkable | `litespec consumer` fails a rule entry without `kind` or `statement`. |
| litespec/core/behavior#keep-the-negation-word-in-the-rule-name | checkable | `litespec model check` reports `rule-name-negation` for a rule whose statement says `not`, `no`, `never`, or `cannot` outside its name. |
| litespec/core/behavior#keep-cross-aggregate-rules-on-a-rule-page | guidance | Each cross-aggregate rule sits as an entry on a rule page; other rules sit on their aggregate page. |
| litespec/core/behavior#name-the-refusal-a-broken-rule-produces | guidance | Each guarded rule names its refusal in `refusal` beside the rule entry. |
| litespec/core/behavior#release-every-reservation-by-a-named-use-case | checkable | `litespec model check` reports `reservation-without-release` for a reservation rule without `releasedBy` or `never` with its cost. |
| litespec/core/behavior#freeze-every-commercial-data-value | checkable | `litespec consumer` fails a commercial-data rule without `frozenWhen` or `historyLink`. |
| litespec/core/behavior#compute-shared-values-from-one-calculation-rule | guidance | The showing query and the recording command cite the same calculation rule in `computedBy`. |
| litespec/core/behavior#tabulate-every-calculation-with-examples | checkable | `litespec model check` reports `calculation-without-table` for a calculation rule with no scenario examples table. |
| litespec/core/behavior#state-each-event-with-meaning-and-carries | checkable | `litespec consumer` fails an event entry without `meaning` or `carries`. |
| litespec/core/behavior#raise-every-event-through-its-aggregate-root | guidance | Each event is raised from the root of the aggregate that owns it. |
| litespec/core/behavior#describe-every-integration-event-for-its-direction | checkable | `litespec consumer` fails an integration event without direction, CloudEvents identity, payload, or trust. |
| litespec/core/behavior#publish-every-outbound-integration-event-from-effects | checkable | `litespec model check` reports `effect-undeclared` for an emitted integration event no record declares in effects. |
| litespec/core/behavior#reach-every-inbound-integration-event-through-a-webhook | guidance | Each inbound integration event names a webhook entry point as its door. |
| litespec/core/behavior#give-each-use-case-a-command-or-query-kind | checkable | `litespec consumer` fails a use-case page without `kind` or with an unknown kind. |
| litespec/core/behavior#connect-each-use-case-to-intent | checkable | `litespec model check` reports `record-orphaned` for a use case with neither `serves` nor `fulfills`. |
| litespec/core/behavior#grant-each-use-case-scoped-access | checkable | `litespec consumer` fails a use-case page without `access` carrying `auth`, grant, and tenant scope. |
| litespec/core/behavior#name-the-entry-points-that-reach-each-use-case | checkable | `litespec model check` reports `reference-unresolved` for a `reachedThrough` entry naming no entry point. |
| litespec/core/behavior#describe-every-use-case-input-with-source-and-classification | checkable | `litespec consumer` fails a use-case input without name, meaning, source, or classification. |
| litespec/core/behavior#bound-every-caller-supplied-input-value | guidance | Each caller-sourced money or access input cites its bounding rule beside the input. |
| litespec/core/behavior#name-every-aggregate-a-use-case-changes-or-reads | checkable | `litespec model check` reports `write-undeclared` for a write outside `changes` and `reference-unresolved` for an unknown aggregate. |
| litespec/core/behavior#state-the-consistency-of-every-use-case | checkable | `litespec model check` reports `consistency-unexplained` for an atomic multi-aggregate write with no `because`. |
| litespec/core/behavior#declare-every-effect-with-one-verb-and-its-timing | checkable | `litespec model check` reports `effect-undeclared` for an edge the records never declared; `litespec consumer` fails an effect entry without exactly one verb or its timing. |
| litespec/core/behavior#state-the-transaction-sharing-of-every-inline-call | checkable | `litespec consumer` fails an inline `issues` effect without `sharesTransaction`. |
| litespec/core/behavior#keep-the-effect-graph-free-of-cycles | checkable | `litespec model check` reports `effect-loop` for a cycle with no stated end condition. |
| litespec/core/behavior#name-the-events-each-use-case-raises | guidance | Each use case names its raised domain events in `raises` beside the use-case page. |
| litespec/core/behavior#name-the-idempotency-of-every-use-case | checkable | `litespec consumer` fails a use case without an idempotency mode or without the key, scope, or reason its mode needs. |
| litespec/core/behavior#state-the-audit-position-of-every-command | checkable | `litespec consumer` fails a command without an audit reason and target or an exemption with its justification. |
| litespec/core/behavior#declare-every-query-output | checkable | `litespec model check` reports `query-output-missing` for a query with no declared output. |
| litespec/core/behavior#justify-every-wider-visibility | checkable | `litespec model check` reports `widening-unjustified` for a widened include group with no cited requirement. |
| litespec/core/behavior#declare-paging-on-every-collection-query | checkable | `litespec model check` reports `paging-undeclared` for a collection query with no paging. |
| litespec/core/behavior#mark-every-lagging-query-as-built-asynchronously | guidance | Each lagging query sets `builtAsynchronously` with a bounded or advisory freshness and a lag scenario. |
| litespec/core/behavior#end-every-use-case-in-named-results | checkable | `litespec model check` reports `use-case-without-success` for a use case with no success result; each refusal entry on the use-case page carries its code. |
| litespec/core/behavior#order-every-refusal-list-by-precedence | guidance | The refusal entries on each use-case page stand in precedence order with first match winning. |
| litespec/core/behavior#record-attempts-behind-recorded-refusals | guidance | Each refusal carrying `recorded: true` stores the attempt with its reason; validating refusals store nothing. |
| litespec/core/behavior#list-recorded-outcomes-inside-success-codes | guidance | Each success result with recorded outcomes lists them in `codes` beside the result. |
| litespec/core/behavior#derive-generic-refusals-instead-of-writing-them | guidance | No use-case page writes a generic forbidden or invalid-input refusal as a record. |
| litespec/core/behavior#name-the-result-each-scenario-ends-in | checkable | `litespec consumer` fails a scenario entry without `result`, and `litespec model check` reports `scenario-result-unresolved` for a scenario ending in an unknown result. |
| litespec/core/behavior#write-every-scenario-in-given-when-then | checkable | `litespec consumer` fails a scenario entry without `given`, `when`, or `then`. |
| litespec/core/behavior#write-prose-on-significant-use-cases | checkable | `litespec model check` reports `prose-missing` for a significant use case without Goal and What Happens. |
| litespec/core/behavior#trigger-every-reaction-from-a-declared-event | checkable | `litespec model check` reports `reaction-trigger-unresolved` for a trigger naming an unknown event. |
| litespec/core/behavior#issue-or-send-from-every-reaction | checkable | `litespec consumer` fails a reaction without exactly one of `issues` and `sends`. |
| litespec/core/behavior#write-no-aggregate-directly-from-a-reaction | guidance | Each reaction changes aggregates only through the use case it issues. |
| litespec/core/behavior#file-every-reaction-with-the-module-it-changes | guidance | Each reaction page sits with the module it changes, or with the notification module when it only sends. |
| litespec/core/behavior#state-the-failure-handling-of-every-reaction | checkable | `litespec consumer` fails a reaction without `onFailure` handling or idempotency. |
| litespec/core/behavior#point-reaction-scenarios-at-the-issued-result | checkable | `litespec model check` reports `scenario-result-unresolved` for a reaction scenario ending outside the issued use case results. |
| litespec/core/behavior#declare-every-job-with-kind-and-structured-schedule | checkable | `litespec model check` reports `schedule-unstructured` for a schedule no tool can read; `litespec consumer` fails a job without kind, scope, issues, reads, service level, evidence, or runbook. |
| litespec/core/behavior#guard-every-operator-job | checkable | `litespec model check` reports `operator-job-without-guard` for an operator job without `runsWhere` or guard. |
| litespec/core/behavior#describe-every-notification-with-audience-channel-and-consent | checkable | `litespec model check` reports `notification-without-sender` for a notification no use case or reaction sends; `litespec consumer` fails a notification without its declared fields. |
| litespec/core/behavior#claim-every-notification-promise-from-a-requirement | guidance | Each notification claim cites its requirement beside the claim. |
| litespec/core/behavior#hold-every-setting-default-to-a-requirement | checkable | `litespec model check` reports `setting-default-without-requirement` for a commercial, legal, or varying default with no cited requirement. |
| litespec/core/behavior#keep-model-invariants-in-rules | guidance | No setting page holds a model invariant; each invariant lives as a rule. |
| litespec/core/behavior#give-each-entry-point-a-kind | checkable | `litespec consumer` fails an entry point without `kind` or `auth`. |
| litespec/core/behavior#serve-static-content-through-served-content | guidance | Each static script or legal text sits as served content with path, content type, cache control, and versioning. |
| litespec/core/behavior#describe-every-external-system-operation | checkable | `litespec consumer` fails an external system operation without direction, timeout, timeout handling, retries, response, or cache. |
| litespec/core/behavior#route-every-external-erasure-through-an-operation-or-event | guidance | Each external system declares its erasure call, forwarding event, or impossible reason with acceptance. |
| litespec/core/behavior#schedule-every-data-class-for-retention | checkable | `litespec model check` reports `retention-without-enforcement` for a retention row nothing enforces. |
| litespec/core/behavior#keep-design-choices-out-of-the-records | guidance | No record page declares a child entity or value object as a record type. |
| litespec/core/behavior#illustrate-pages-with-examples-from-the-cast | guidance | Each module, aggregate, and use case page carries an Example section from the cast, or the project documentation names the pages that do. |
| litespec/core/behavior#group-cross-aggregate-rules-by-theme | guidance | Each rule page states its theme in Summary, or the project documentation names another grouping. |
