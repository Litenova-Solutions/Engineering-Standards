# Application Layer

## Intent

The Application layer coordinates use cases, checking the shape of each incoming message, authorizing it, running the handler, and returning a result that carries no transport details. A use case is one command, which changes business state, or one query, which reads without changing state; a reaction answers an event, and a job runs scheduled or operator work. This page states how use cases, reactions, and jobs are organized, what each stage of the command pipeline owns, and how ports and declared effects are wired.

## Concepts

### The Use-Case Folder

Every folder in Application is a module, an aggregate, a use case, or a reaction. One use-case folder holds everything a reviewer needs to judge a use case: its message, result, validator, handler, mapping, and definition of pipeline-read values. A reaction folder holds its reaction class with its anchor tag. Contracts that more than one module names live in the shared application contracts, and the pipeline machinery lives in one folder named for the pipeline.

### The Command Pipeline

A command travels fixed stages in order: structural input validation, the authorization guard, the handler, and exactly one commit post-handler. The handler loads aggregates through their domain repositories, calls Domain behavior, stages the changed aggregates, and returns a result. Commit, error mapping, audit, and authorization each belong to their own stage, so none appears in the handler. A query travels validation and the guard, then projects its result directly without loading an aggregate. A reaction answers its trigger outside the command pipeline, issuing one command or sending one notification. A job issues its commands once per item in its scope. The handler dispatches only the effects the use-case record declares, and exactly one commit post-handler commits each command.

### Ports

A port is a narrow interface Application declares for work it does not do itself, such as archiving posts or reading the clock. Each port names one business capability with project-owned types, and Infrastructure implements it. A port is declared beside the aggregate its consumers share, so it is reviewed with that aggregate's specification. An external-system port carries the operations one `calls` effect names, a messenger port carries the notifications `sends` effects name, and a store port carries state the owning system holds.

### Declared Effects

Every edge between use cases, reactions, jobs, notifications, integration events, and external systems is declared on a record and checked in code. A use case declares its edges in `effects`: `issues` names a command, `sends` names a notification, `publishes` names an integration event, and `calls` names an external-system operation. Each entry carries its timing: `inline` shares the caller's call, `after-commit` runs after the commit succeeds, and `async` runs outside the caller's transaction. An edge the records do not declare is the defect the effect checks report.

## Standards

### Organize Application by Use Case

**Statement:** Each command or query MUST own one use-case folder under its module holding its message, result, validator, handler, mapping, and definition of pipeline-read values.

**Rationale:** One use-case folder holds everything a reviewer needs to judge a use case: its message, result, validator, handler, mapping, and pipeline-read values. Grouping by technical type scatters one use case across the project, so a change touches six folders and review misses one. Type names share the use-case prefix and follow the suffix table under `litespec/workspace/naming#use-architectural-suffixes`. Pipeline-read values are declared beside the message under `litespec/backend/application#declare-every-pipeline-position-beside-the-message`.

### Dispatch Commands and Queries Through Separate Entry Points

**Statement:** An application MUST dispatch a command and a query through two separate Application-facing entry points rather than one message bus abstraction.

**Rationale:** Two entry points keep the write and read paths distinguishable at every call site and let the pipeline compose different stages for each. A unified bus hides that difference behind one method, so a reader sees no difference between a dispatch that changes state and one that reads. This backend's whole command and query split depends on that difference.

The rule states the property rather than the package. Each stack binding pins one library that supplies it. A consumer replacing that library records a deviation against the binding convention rather than touching this rule.

### Separate Input Validation from Invariants

**Statement:** A validator MUST limit its checks to structural input, leaving aggregate state decisions to Domain.

**Rationale:** Structural input and aggregate state fail for different reasons and at different times: malformed input is rejected before Domain runs, while a state refusal needs the loaded aggregate. A validator that checked state would need the aggregate, which pulls persistence into validation. A validator rejects an empty title, a malformed identifier, or an invalid page size, and Domain decides whether the expense above the threshold carries a receipt. Every validator for a message reports validity findings under `litespec/backend/application#report-input-problems-as-validity-findings`, so the caller learns the whole form in one answer.

**Example:** In the Claimwick product, `use-case/spending.submit-expense` takes a command carrying an expense identifier and an employee identifier with the amount, currency, and receipt. The validator rejects an empty expense identifier or an empty employee identifier, and accepts every well-formed pair.

Whether the expense above the threshold carries a receipt is an aggregate state decision, so the validator leaves it to Domain. Domain rejects an expense above the threshold that carries no receipt with `result/submit-expense.receipt-missing`, which carries the stable code `spending.receipt-missing`.

### Report Input Problems as Validity Findings

**Statement:** A validator MUST report its findings as validity findings, with each finding carrying a member, a code, and a message, and no transport status.

**Rationale:** Running every validator and merging findings tells the caller everything wrong with the form in one answer; stopping at the first finding turns one form into repeated round trips. Each finding carries a member naming the input member, a code naming the stable reason, and a message explaining the problem in caller-safe language, with no transport status because Application answers no transport.

**Example:** A submit request with an empty expense identifier and an empty employee identifier reports two findings, one per member, with no transport status:

```json
[
  { "member": "ExpenseId", "code": "required", "message": "An expense is required." },
  { "member": "EmployeeId", "code": "required", "message": "An employee is required." }
]
```

The caller learns the whole form in one answer, and the pipeline refuses the request before Domain runs.

### Model Expected Use-Case Refusals Explicitly

**Statement:** An expected use-case refusal MUST carry its result code and a caller-safe message, with no transport status.

**Rationale:** An expected refusal is part of the use case's contract: a missing resource, a forbidden act, or a conflicting write, carrying the refusal result's stable code and a caller-safe message. The refusal carries no transport result, provider detail, or stack detail, so the same refusal maps correctly at any transport, and handlers do not catch it.

The use case lists every result it returns, and each refusal result carries its code. Generic refusals are derived, never written: a use case whose grant is a permission derives its `forbidden` result, and a use case with rules on its input derives its `invalid-input` result. A conflict refuses the same input the same way until the caller rereads the resource and retries with current state. A refusal that a blind retry can pass is transient and belongs to the [integrations extension](../ext/integrations.md).

### Enforce Target Authorization in the Pipeline

**Statement:** The authorization guard, not the handler, MUST authorize every message from the `access` its use-case record declares.

**Rationale:** Authorization decided in each handler is decided differently in each handler. The guard decides once from what the record declares: the `auth` kinds the caller presents, the `grant` naming a permission, a `self` scope over one, `anonymous`, or `system`, and the `tenant` scope naming the tenants the call reaches. Ownership, tenant, role, state, or delegated access resolves against the target data through a scope owner lookup for the record the message names.

Declaring `access` beside the message also lets composition refuse to start when a message states no position at all. The guard reports a refusal as a denial rather than raising it, so a refused attempt reaches the audit trail beside the ones that succeeded. The audit extension records the denial under `litespec/ext/audit#record-refused-authorization`.

A collection query has no single target record, so a scope owner lookup has nothing to resolve. Its authorized scope is a database predicate under `litespec/quality/security#restrict-a-protected-collection-in-the-database`, applied before paging. Filtering a loaded collection in memory satisfies neither rule. It matches the shape [OWASP names as broken object level authorization](https://owasp.org/www-project-top-ten/2021/A01_2021-Broken_Access_Control/).

WebApi enforces coarse authenticated, role, or scope policies first under `litespec/backend/api#apply-only-coarse-policies-at-the-endpoint`, which replaces no decision that depends on business data.

### Keep Command Handlers Narrow

**Statement:** A command handler MUST load aggregates, call domain behavior, stage changes, and return a result, leaving commit, transport mapping, audit, and authorization to their owners.

**Rationale:** A handler that commits, maps errors, audits, or authorizes duplicates a boundary that already owns that work, and the duplicates drift: one handler's commit order differs from another's, or one audit entry misses a field. The commit post-handler owns the transaction under `litespec/backend/persistence#commit-each-command-pipeline-once`, WebApi owns error mapping, the audit completion handler owns the trail, and the guard owns authorization. The handler loads aggregates, calls domain behavior, stages changes, and returns a result. The handler takes one domain repository per aggregate the record's `changes` names, and no other, under `litespec/backend/application#take-repositories-from-declared-changes-and-reads`. It returns only the results and refusals the record declares, under `litespec/backend/application#return-only-declared-results-and-refusals`.

**Example:** In the Claimwick product, `use-case/spending.approve-expense` runs through the command pipeline: the endpoint maps the request to the approve command, the command entry point dispatches it, validation and the authorization guard run, the handler loads the expense through its domain repository, approves it through Domain behavior, stages the expense, and returns the result. The handler commits nothing, and exactly one post-handler commits after it. The diagram shows each stage from the HTTP request to that single commit.

![An HTTP request reaches the endpoint, which maps it to a command and dispatches it through the command mediator. Validation checks structural input, then the authorization guard checks the permission and the target. The handler loads aggregates through repositories, calls domain behavior, and stages changes. The repository stages the aggregate, and exactly one commit post-handler commits the session once.](../assets/diagrams/backend-command-pipeline.svg)

The handler loads, calls, stages, and returns. Commit, error mapping, and authorization belong to their owners, so none appears in the handler.

### Take Repositories from Declared Changes and Reads

**Statement:** A command handler MUST write only the aggregates its record's `changes` names, through one domain repository per aggregate.

**Rationale:** A write outside `changes` is behavior the record hides, so the stack reader fails `write-undeclared` on it. The handler takes one domain repository per named aggregate and stages only those. A query handler likewise projects only over the aggregates its record's `reads` names, through the read session.

**Example:** The `complete-ticket-resale` handler takes the ticket-resale repository and no other; staging a second aggregate fails the check.

### Return Only Declared Results and Refusals

**Statement:** A handler MUST return only the results, refusals, and codes its use-case record declares.

**Rationale:** An observable outcome no result declares is behavior the specification hides, so the stack reader fails `result-undeclared` on it. Refusals return in the precedence order the record lists, first match wins, and a success carrying `codes` returns only those codes. Generic refusals derive from `access` and `input` and need no declaration.

**Example:** A handler that returns a code its record never lists fails the check, even when the code is spelled correctly.

### Project Queries Directly

**Statement:** A query handler MUST project directly to its result without loading an aggregate.

**Rationale:** A read path acts on no invariant, so loading an aggregate for presentation pays for enforcement no read needs and couples the read shape to the write model. Projecting directly to the result keeps reads on the read boundary the persistence standards state. The result type carries the `include` groups the record's `output` declares, under `litespec/backend/application#shape-query-results-from-declared-output`. The command and query split lives in `litespec/backend/architecture#separate-command-and-query-behavior`.

### Shape Query Results from Declared Output

**Statement:** A query result type MUST carry the `include` groups its record's `output` declares, with their fields, freshness, and visibility.

**Rationale:** The record's `output` names each group with its fields, their classification, the source aggregates, and the freshness the caller can rely on: `immediate`, `snapshot`, `bounded`, or `advisory`. The result type carries one member per group, so the caller reads what the record promises and nothing more. A group with `visibleWhen` appears only when its condition holds, and a group wider than its sources cites its `wideningBecause` requirement. A query with `builtAsynchronously` carries a `bounded` or `advisory` freshness with its lag scenario.

**Example:** The organizer-home result carries `setup` and `attention` groups with their declared fields.

### Mirror a Domain Closed Set in the Result

**Statement:** An Application result carrying a Domain closed set MUST model that set with the same shape as its own union or code value.

**Rationale:** Each case of a closed set can carry different data, and that data needs to survive to the caller. Mirroring the Domain shape in the result keeps the layers aligned; flattening case data into an enumeration with nullable fields loses which fields belong to which case. Application exposes no Domain union type. Narrowing follows `litespec/backend/application#record-a-decision-for-closed-set-narrowing`, and the set itself follows `litespec/backend/domain#model-every-closed-set-of-domain-values-as-a-closed-type-hierarchy`. The wire carries the same shape under `litespec/backend/api#mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape`.

**Example:** A refund outcome result carries one case per Domain case with its data: pending, succeeded, failed, and reversed.

### Record a Decision for Closed-Set Narrowing

**Statement:** A layer MUST NOT narrow a Domain closed set without a recorded decision and an updated specification.

**Rationale:** Narrowing silently drops cases the Domain can produce, so a caller meeting a dropped case gets a shape the contract left undescribed. A recorded decision with an updated specification makes the dropped cases visible and owned. The decision and the specification follow `litespec/core/model#keep-one-owner-and-status-on-every-record`.

### Define Narrow External Ports

**Statement:** Application MUST declare each external port as a public interface with a noun or verb name, one method or one purpose, and project-owned types.

**Rationale:** A port is the seam where a provider change stops: one method or one purpose, named as a noun for the capability (`PostArchive`) or a verb for the act (`ArchivePosts`), typed with project-owned types. If provider names or transport models entered the interface, replacing the provider would rewrite Application. Keeping them in Infrastructure confines the change to the adapter.

### Declare a Port Where Its Consumers Meet

**Statement:** A port MUST be declared at the lowest folder holding every consumer that names it, following `litespec/backend/architecture#place-a-type-at-the-lowest-folder-that-holds-its-consumers`.

**Rationale:** A port reviewed beside the aggregate it serves is reviewed with that aggregate's specification; a port in a project-wide folder is reviewed by nobody. A port whose consumers sit in one module is declared in that module beside the aggregate it serves, and only a port that more than one module names belongs in the shared application contracts. Collecting every port in one folder because they share the word "port" is grouping by technical type. `litespec/backend/application#organize-application-by-use-case` rejects that grouping one level down for the same reason.

You review a port declared beside its aggregate with that aggregate's specification. Nobody reviews a port in a project-wide folder. Where a port serves aggregates in one module but is called from another, the declaring module is the one that owns the aggregates. That module is the one whose rules change when the port changes.

### Call External Systems Through Their Ports

**Statement:** A handler MUST reach an external system only through a port carrying the operation its record's `calls` effect names.

**Rationale:** The `calls` effect names one operation on one external system, and the operations entry states its timeout, its timeout behavior, its retries, its response, and its cache. The port carries that operation with project-owned types, and Infrastructure implements it, so a provider change stops at the adapter. A call no `calls` entry declares fails `effect-undeclared`.

**Example:** A handler that calls a payment operation names it through the record's `calls` entry and the port method; a direct provider call fails the check.

### Send Notifications Through the Messenger Port

**Statement:** Application MUST send a notification only through the messenger port, from a `sends` edge its record declares.

**Rationale:** The notification record owns the template, the audience, the channel, the consent rule, the frequency, the dedup key, and the claims each message keeps. The `sends` edge names the notification with its own suppression condition, and the messenger port carries the send with project-owned types. A send no edge declares fails `effect-undeclared`, and a second send of a `once` notification with the same dedup key sends nothing.

**Example:** The resale reaction sends the buyer notification through the messenger port; the template and consent rule stay on the notification record.

### Publish Declared Integration Events After Commit

**Statement:** A handler MUST publish an integration event only through a `publishes` effect its record declares, after the commit succeeds.

**Rationale:** The `publishes` entry names the integration event with its timing, and the outbox extension stages the message with the business work so both commit together and delivery follows. A publish no entry declares fails `effect-undeclared`. Publishing outside the outbox delivers facts the commit did not store.

**Example:** The `complete-ticket-resale` handler publishes its resold event after commit through the outbox; the record's `publishes` entry names the event.

### Expose Store State Through Ports

**Statement:** A `store` aggregate MUST reach code only through a port naming its owner, with no aggregate root.

**Rationale:** A `store` aggregate is state no invariant guards: a library-owned table, a suppression list, or a delivery log. With no invariant, there is no root, no state record, and no domain repository; the port names the owning system and Infrastructure implements it. Staff actions on that state stay ordinary use cases calling the port.

**Example:** The suppression list reaches code through a suppression port owned by the communications module, with no aggregate root.

### Read Settings Through Typed Options

**Statement:** A handler MUST read a setting record through a typed options value, or through stored tenant data where the record's `setBy` is `tenant`.

**Rationale:** A setting record owns its type, its default, its range, its unit, and what happens at the bound. Founder-set and operator-set values bind to typed options the host validates at startup, so a bad value fails before traffic arrives. Tenant-set values are data nobody reviews: they live in stored tenant state the handler reads per tenant. A raw configuration lookup bypasses the type, the range, and the bound, so no handler uses one.

**Example:** The return-queue cap binds to a listing options value; the handler reads the bound and refuses past it with `atBound: refuse`.

### Declare Every Pipeline Position Beside the Message

**Statement:** A message MUST declare a value or an exemption for every pipeline position the baseline and the selected extensions require.

**Rationale:** A pipeline stage that guesses a message's position guesses differently per message. Declaring a value or an exemption beside the message makes each position explicit, and composition refuses to start when a message states neither. The baseline holds one position: authorization, declared from the record's `access` on the message itself. The audit extension adds the audit selection position under `litespec/ext/audit#declare-audit-selection-on-every-command`.

### Keep Event Reaction Implementations Explicit

**Statement:** An event reaction implementation MUST answer the trigger its reaction record names, in one class carrying one anchor tag naming that record.

**Rationale:** A reaction without an explicit implementation leaves its trigger, its target, and its failure handling to whoever reads the code. One class per reaction record answers the trigger the record names in `on`, whether a domain event or an integration event, and dispatches only through the record's `issues` or `sends`: exactly one of the two names a command or a notification. The class never writes an aggregate directly: a reaction that needs a write issues a command. It honors the record's `reads`, its idempotency, and its `onFailure`, and the anchor tag is the link the stack reader follows. The class lives in the folder named for its reaction, in the module whose records it changes. The record names its trigger under `litespec/core/behavior#trigger-every-reaction`. A reaction with `after-commit` timing uses durable delivery through the outbox extension.

**Example:** The class `VoidCodeOnResale` carries one anchor tag naming `reaction/admission.void-code-on-resale`, answers `event/ticket-resale.resold`, and issues `use-case/admission.void-ticket-code`.

### Run Each Job Within Its Declared Scope

**Statement:** A background job MUST issue its declared commands once per item in its record's `scope`, honoring its batch size, lease, and cursor.

**Rationale:** The job record owns what each run selects, how many items each batch takes, the lease that keeps two runs apart, and the cursor where a run resumes. The job issues its `issues` commands once per item, records its evidence where the record states, and follows its `onFailure` when an item fails. An `operator` job carries no aggregate: it states its `runsWhere` and its guard, and runs as interactive platform work. One execution host runs the job under `litespec/backend/architecture#declare-the-execution-host-for-work-that-outlives-a-request`.

**Example:** The expire-lapsed-returns job selects due listings in batches of 200 under its lease, issues one expire command per listing, and resumes from its cursor.

### Dispatch Only Declared Effect Edges

**Statement:** A command handler MUST dispatch another command, notification, integration event, or external call only through an effect its use-case record declares.

**Rationale:** An undeclared edge is the defect: the handler reaches a use case, notification, integration event, or external system the records never named, so review sees behavior the specification hides. Each declared entry names exactly one verb, its timing, and its failure handling, and the stack reader fails `effect-undeclared` on any dispatch the record does not declare. An `inline` `issues` entry states whether it shares the caller's transaction, and `consistency: atomic` never spans an `async` edge. The effect graph holds no cycles except through domain events with a stated end condition. A process carried by a workflow engine maps each engine step to exactly one use case with its compensation through the `workflow-engine` extension. A project that keeps stricter rules, such as reactions first, records them as a cited convention.

**Example:** The `complete-ticket-resale` handler publishes `integration-event/ticket-resale.resold` after commit, because its record declares that `publishes` entry; a second publish the record does not declare fails the check.

## Conventions

### Use This Use-Case Layout

**Default:** Place each use case in a folder named for it under its module and aggregate.

**Replacement:** A project names its own Application folder layout in its documentation.

**Rationale:** One folder per use case holds everything a reviewer needs to judge it in one place, and the same module and aggregate order in every layer lets a reader move from a handler to its endpoint without a map.

**Example:** The layout reads as follows:

```text
{ProjectName}.Application.Abstractions/   contracts more than one module names
  Clock/                                  the clock port
  Refusals/                               the transport-neutral refusal carriers
  Validation/                             the validity-findings shape
{ProjectName}.Application/
  Pipeline/                               the pipeline stages, and nothing else
  Posts/                                  single aggregate whose name matches the module: use cases sit directly under the module
    PostArchive                           a port several Posts use cases name
    CreateDraft/                          one folder per use case: message, result, validator, handler, mapping
    GetPost/
    ListPosts/
    NotifySubscribersOnPostPublished/     a reaction: the folder takes the reaction name
      NotifySubscribersOnPostPublishedReaction   one reaction class with its anchor tag
      PostPublicationNotifier             a port one reaction names
  Customers/                              two aggregates: use cases nest under each aggregate
    CustomerAccounts/
      CustomerAccountScopeLookup          aggregate-owned, so it sits with the aggregate
      RestrictAccount/
    Consents/
      GrantConsent/
```

Module and aggregate order, including the single-aggregate flat form, follow `litespec/backend/architecture#organize-every-layer-by-module-and-use-case`.

Only a use case or a reaction gets a folder. Any other type sits flat in the folder that owns it, chosen by `litespec/backend/architecture#place-a-type-at-the-lowest-folder-that-holds-its-consumers`, so every folder name below a module names one use case or one reaction. A reaction record gets a folder named for the reaction, holding its reaction class with its anchor tag under `litespec/backend/application#keep-event-reaction-implementations-explicit`. A folder named for a service, a technical kind, or a caller breaks that reading; it is drift rather than a second convention.

### Keep Messages Immutable

**Default:** Declare commands, queries, results, and validation errors as immutable values.

**Replacement:** A project names its own message-shape rules in its documentation.

**Rationale:** Immutable values give commands, queries, results, and validation errors a shape no handler mutates mid-pipeline. Typed identifiers and shared-kernel value objects cross the boundary; an aggregate-owned value object does not, so the message carries a primitive and the handler reconstructs it.

### Return Use-Case Results

**Default:** Return only the values the caller needs from an Application result.

**Replacement:** A project names its own result-shape rules in its documentation.

**Rationale:** A result carries only what the caller needs. An aggregate, session, provider response, or transport result leaving Application makes an inner concern part of the outward contract, and every change to that concern breaks callers.

### Keep Mappings at the Owning Boundary

**Default:** Own domain-to-result projection in Application, transport mapping in WebApi, and view models in the frontend.

**Replacement:** A project names its own mapping homes in its documentation.

**Rationale:** A mapping changes when its output shape changes, so it lives with the boundary that defines that shape: domain-to-result projection in Application, transport mapping in WebApi, view models in the frontend. A mapping kept elsewhere breaks when the owning boundary evolves.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/application#organize-application-by-use-case | guidance | Each command or query owns one use-case folder under its module holding its message, result, validator, handler, mapping, and pipeline-read values. |
| litespec/backend/application#dispatch-commands-and-queries-through-separate-entry-points | guidance | Each dispatch site calls the command entry point or the query entry point, with no unified bus. |
| litespec/backend/application#separate-input-validation-from-invariants | guidance | Each validator checks structural input only, leaving aggregate state decisions to Domain. |
| litespec/backend/application#report-input-problems-as-validity-findings | guidance | Each validator reports validity findings with member, code, and message per finding, and no transport status. |
| litespec/backend/application#model-expected-use-case-refusals-explicitly | guidance | Each expected refusal carries its result code and a caller-safe message, with no transport status. |
| litespec/backend/application#enforce-target-authorization-in-the-pipeline | guidance | The authorization guard authorizes every message from its record's `access`, and no handler authorizes itself. |
| litespec/backend/application#keep-command-handlers-narrow | guidance | Each command handler loads, calls, stages, and returns, with commit, mapping, audit, and authorization in their own stages. |
| litespec/backend/application#take-repositories-from-declared-changes-and-reads | guidance | Each command handler takes one repository per aggregate its `changes` names, with no write outside `changes`. |
| litespec/backend/application#return-only-declared-results-and-refusals | guidance | Each handler returns only declared results, refusals, and codes. |
| litespec/backend/application#project-queries-directly | guidance | Each query handler projects directly to its result without loading an aggregate. |
| litespec/backend/application#shape-query-results-from-declared-output | guidance | Each query result type carries the declared `include` groups with their fields, freshness, and visibility. |
| litespec/backend/application#mirror-a-domain-closed-set-in-the-result | guidance | Each result carrying a Domain closed set models it with the same shape and cases. |
| litespec/backend/application#record-a-decision-for-closed-set-narrowing | guidance | Each narrowed closed set names its recorded decision and updated specification. |
| litespec/backend/application#define-narrow-external-ports | guidance | Each external port is a public interface with a noun or verb name, one method or one purpose, and project-owned types. |
| litespec/backend/application#declare-a-port-where-its-consumers-meet | guidance | Each port sits at the lowest folder holding every consumer that names it. |
| litespec/backend/application#call-external-systems-through-their-ports | guidance | Each external call travels through a port operation a `calls` entry names. |
| litespec/backend/application#send-notifications-through-the-messenger-port | guidance | Each notification send travels through the messenger port from a declared `sends` edge. |
| litespec/backend/application#publish-declared-integration-events-after-commit | guidance | Each integration event publish follows a declared `publishes` entry after the commit succeeds. |
| litespec/backend/application#expose-store-state-through-ports | guidance | Each `store` aggregate reaches code through an owner-naming port, with no aggregate root. |
| litespec/backend/application#read-settings-through-typed-options | guidance | Each setting reaches its handler through a typed options value or stored tenant data, with no raw lookup. |
| litespec/backend/application#declare-every-pipeline-position-beside-the-message | guidance | Each message declares a value or an exemption for every pipeline position the baseline and selected extensions require. |
| litespec/backend/application#keep-event-reaction-implementations-explicit | guidance | Each event reaction runs in one class carrying one anchor tag naming its record, answering its trigger and dispatching only through its `issues` or `sends`. |
| litespec/backend/application#run-each-job-within-its-declared-scope | guidance | Each background job issues its commands once per item in its scope, honoring batch size, lease, and cursor. |
| litespec/backend/application#dispatch-only-declared-effect-edges | guidance | Each handler dispatch names a declared effect entry, with timing, transaction sharing, and failure handling as declared. |
| litespec/backend/application#use-this-use-case-layout | guidance | Each use-case path matches its module, aggregate, and use case in the stated layout. |
| litespec/backend/application#keep-messages-immutable | guidance | Each command, query, result, and validation error is an immutable value. |
| litespec/backend/application#return-use-case-results | guidance | Each Application result returns only the values the caller needs. |
| litespec/backend/application#keep-mappings-at-the-owning-boundary | guidance | Each conversion lives in the layer owning its output shape. |
