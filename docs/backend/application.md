# Application Layer

## Intent

The Application layer coordinates use cases, checking the shape of each incoming message, authorizing it, running the handler, and returning a result that carries no transport details. A use case is one command, which changes business state, one query, which reads without changing state, or one reaction, which answers an event or a stated time. This page states how use cases are organized, what each stage of the command pipeline owns, and how ports and event reactions are declared.

## Concepts

### The Use-Case Folder

Every folder in Application is a module, an aggregate, or a use case. One use-case folder holds everything a reviewer needs to judge a use case: its message, result, validator, handler, mapping, and definition of pipeline-read values. Contracts that more than one module names live in the shared application contracts, and the pipeline machinery lives in one folder named for the pipeline.

### The Command Pipeline

A command travels fixed stages in order: structural input validation, the authorization guard, the handler, and exactly one commit post-handler. The handler loads aggregates through their domain repositories, calls Domain behavior, stages the changed aggregates, and returns a result. Commit, error mapping, audit, and authorization each belong to their own stage, so none appears in the handler. A query travels validation and the guard, then projects its result directly without loading an aggregate. A reaction runs when its trigger fires rather than traveling the command pipeline.

### Ports

A port is a narrow interface Application declares for work it does not do itself, such as archiving posts or reading the clock. Each port names one business capability with project-owned types, and Infrastructure implements it. A port is declared beside the aggregate its consumers share, so it is reviewed with that aggregate's specification.

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

**Example:** In the Expenses product, `use-case/spending.submit-expense` takes a command carrying an expense identifier and an employee identifier with the amount, currency, and receipt. The validator rejects an empty expense identifier or an empty employee identifier, and accepts every well-formed pair.

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

The use case lists every result it returns, and each refusal result carries its code. A conflict refuses the same input the same way until the caller rereads the resource and retries with current state. A refusal that a blind retry can pass is transient and belongs to the [integrations extension](../ext/integrations.md).

### Enforce Target Authorization in the Pipeline

**Statement:** The authorization guard, not the handler, MUST authorize every message from the permissions its use case needs and the resource the message names.

**Rationale:** Authorization decided in each handler is decided differently in each handler. The guard decides once from what the message declares: the permissions its use case needs with the resource subject, resolved against the actor's roles at the subject's scope, with ownership, tenant, role, state, or delegated access resolved against the target data through a scope owner lookup for the record the message names.

Declaring needs beside the message also lets composition refuse to start when a message states no position at all. The guard reports a refusal as a denial rather than raising it, so a refused attempt reaches the audit trail beside the ones that succeeded. The audit extension records the denial under `litespec/ext/audit#record-refused-authorization`.

A collection query has no single target record, so a scope owner lookup has nothing to resolve. Its authorized scope is a database predicate under `litespec/quality/security#restrict-a-protected-collection-in-the-database`, applied before paging. Filtering a loaded collection in memory satisfies neither rule. It matches the shape [OWASP names as broken object level authorization](https://owasp.org/www-project-top-ten/2021/A01_2021-Broken_Access_Control/).

WebApi enforces coarse authenticated, role, or scope policies first under `litespec/backend/api#apply-only-coarse-policies-at-the-endpoint`, which replaces no decision that depends on business data.

### Keep Command Handlers Narrow

**Statement:** A command handler MUST load aggregates, call domain behavior, stage changes, and return a result, leaving commit, transport mapping, audit, and authorization to their owners.

**Rationale:** A handler that commits, maps errors, audits, or authorizes duplicates a boundary that already owns that work, and the duplicates drift: one handler's commit order differs from another's, or one audit entry misses a field. The commit post-handler owns the transaction under `litespec/backend/persistence#commit-each-command-pipeline-once`, WebApi owns error mapping, the audit completion handler owns the trail, and the guard owns authorization. The handler loads aggregates, calls domain behavior, stages changes, and returns a result.

**Example:** In the Expenses product, `use-case/spending.approve-expense` runs through the command pipeline: the endpoint maps the request to the approve command, the command entry point dispatches it, validation and the authorization guard run, the handler loads the expense through its domain repository, approves it through Domain behavior, stages the expense, and returns the result. The handler commits nothing, and exactly one post-handler commits after it. The diagram shows each stage from the HTTP request to that single commit.

![An HTTP request reaches the endpoint, which maps it to a command and dispatches it through the command mediator. Validation checks structural input, then the authorization guard checks the permission and the target. The handler loads aggregates through repositories, calls domain behavior, and stages changes. The repository stages the aggregate, and exactly one commit post-handler commits the session once.](../assets/diagrams/backend-command-pipeline.svg)

The handler loads, calls, stages, and returns. Commit, error mapping, and authorization belong to their owners, so none appears in the handler.

### Project Queries Directly

**Statement:** A query handler MUST project directly to its result without loading an aggregate.

**Rationale:** A read path acts on no invariant, so loading an aggregate for presentation pays for enforcement no read needs and couples the read shape to the write model. Projecting directly to the result keeps reads on the read boundary the persistence standards state. The command and query split lives in `litespec/backend/architecture#separate-command-and-query-behavior`.

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

### Declare Every Pipeline Position Beside the Message

**Statement:** A message MUST declare a value or an exemption for every pipeline position the baseline and the selected extensions require.

**Rationale:** A pipeline stage that guesses a message's position guesses differently per message. Declaring a value or an exemption beside the message makes each position explicit, and composition refuses to start when a message states neither. The baseline holds one position: authorization, declared as required authorization or a constant exemption, with the exemption on the message itself. The audit extension adds the audit selection position under `litespec/ext/audit#declare-audit-selection-on-every-command`.

### Keep Event Reaction Implementations Explicit

**Statement:** An event reaction implementation MUST declare exactly one delivery classification: atomic, durable, rebuildable, or best-effort-optional.

**Rationale:** A reaction without a declared classification leaves its delivery to whoever reads the code: a retry that needed durable delivery is lost, or a rebuildable projection blocks the command's transaction. Exactly one classification states the contract. Atomic reactions commit with the triggering command's transaction, and a failure rolls both back. Durable reactions run after commit through durable delivery, and a failure retries until it succeeds. Rebuildable reactions build derived state that a rebuild reproduces, and a failure waits for the next rebuild. Best-effort-optional reactions skip or drop their effect when delivery fails, and no record needs it.

The use case names its trigger on its record under `litespec/core/domain#trigger-every-reaction`, and the reaction's definition beside its use-case folder carries the classification. Required delivery activates the outbox extension, and required derived state uses an atomic, durable, or rebuildable path.

### Keep One State-Changing Use Case in One Pipeline

**Statement:** A command handler MUST NOT dispatch another command through the command pipeline.

**Rationale:** A nested dispatch runs the full pipeline inside the pipeline, so the commit post-handler can commit before the top-level use case finishes. One pipeline per state-changing use case keeps one transaction per command. A top-level handler may still coordinate several aggregates when the approved use case names the cross-aggregate rule requiring one transaction.

You stage a second command that has to run for durable delivery instead. That path is not an exemption from this rule. The staged command enters its own pipeline and owns its own transaction, so no nesting occurs.

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
    NotifySubscribersOnPostPublished/     a reaction: the folder takes the reaction use-case name
      PostPublicationNotifier             a port one use case names
  Customers/                              two aggregates: use cases nest under each aggregate
    CustomerAccounts/
      CustomerAccountScopeLookup          aggregate-owned, so it sits with the aggregate
      RestrictAccount/
    Consents/
      GrantConsent/
```

Module and aggregate order, including the single-aggregate flat form, follow `litespec/backend/architecture#organize-every-layer-by-module-and-use-case`.

Only a use case gets a folder. Any other type sits flat in the folder that owns it, chosen by `litespec/backend/architecture#place-a-type-at-the-lowest-folder-that-holds-its-consumers`, so every folder name below a module names one use case. A reaction is a use case that runs on its trigger, so its folder takes the reaction's use-case name under `litespec/backend/application#keep-event-reaction-implementations-explicit`. A folder named for a service, a technical kind, or a caller breaks that reading; it is drift rather than a second convention.

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
| litespec/backend/application#enforce-target-authorization-in-the-pipeline | guidance | The authorization guard authorizes every message from its permissions and resource, and no handler authorizes itself. |
| litespec/backend/application#keep-command-handlers-narrow | guidance | Each command handler loads, calls, stages, and returns, with commit, mapping, audit, and authorization in their own stages. |
| litespec/backend/application#project-queries-directly | guidance | Each query handler projects directly to its result without loading an aggregate. |
| litespec/backend/application#mirror-a-domain-closed-set-in-the-result | guidance | Each result carrying a Domain closed set models it with the same shape and cases. |
| litespec/backend/application#record-a-decision-for-closed-set-narrowing | guidance | Each narrowed closed set names its recorded decision and updated specification. |
| litespec/backend/application#define-narrow-external-ports | guidance | Each external port is a public interface with a noun or verb name, one method or one purpose, and project-owned types. |
| litespec/backend/application#declare-a-port-where-its-consumers-meet | guidance | Each port sits at the lowest folder holding every consumer that names it. |
| litespec/backend/application#declare-every-pipeline-position-beside-the-message | guidance | Each message declares a value or an exemption for every pipeline position the baseline and selected extensions require. |
| litespec/backend/application#keep-event-reaction-implementations-explicit | guidance | Each event reaction declares exactly one delivery classification and honors it. |
| litespec/backend/application#keep-one-state-changing-use-case-in-one-pipeline | guidance | No command handler dispatches another command through the command pipeline. |
| litespec/backend/application#use-this-use-case-layout | guidance | Each use-case path matches its module, aggregate, and use case in the stated layout. |
| litespec/backend/application#keep-messages-immutable | guidance | Each command, query, result, and validation error is an immutable value. |
| litespec/backend/application#return-use-case-results | guidance | Each Application result returns only the values the caller needs. |
| litespec/backend/application#keep-mappings-at-the-owning-boundary | guidance | Each conversion lives in the layer owning its output shape. |
