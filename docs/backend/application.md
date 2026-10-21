# Application Layer

## Intent

The Application layer coordinates use cases, checking the shape of each incoming message, authorizing it, running the handler, and returning a result that carries no transport details. A use case is one command, a message that changes business state, or one query, a message that reads without changing state. This page states how use cases are organized, what each stage of the command pipeline owns, and how ports and event reactions are declared: a port is a narrow interface for work Application cannot do itself, and a reaction is behavior that an event causes. Keeping handlers narrow and each pipeline decision in its own stage keeps every use case reviewable in one folder.

## Concepts

### The operation folder

Every folder in Application is a module, an aggregate, or a use case. One operation folder holds everything a reviewer needs to judge a use case: its message, result, validator, handler, mapping, and definition of pipeline-read values. Contracts that more than one module names live in the shared application contracts, and the pipeline machinery lives in one folder named for the pipeline.

### The command pipeline

A command travels fixed stages in order: structural input validation, the authorization guard, the handler, and exactly one commit post-handler. The handler loads aggregates through their repositories, calls Domain behavior, stages the changed aggregates, and returns a result. Commit, error mapping, audit, and authorization each belong to their own stage, so none appears in the handler. A query travels validation and the guard, then projects its result directly without loading an aggregate.

### Ports

A port is a narrow interface Application declares for work it cannot do itself, such as archiving posts or reading the clock. Each port names one business capability with project-owned types, and Infrastructure implements it. A port is declared beside the aggregate its consumers share, so it is reviewed with that aggregate's specification.

## Standards

### Organize Application by operation

**Requirement:** Each command or query MUST own one operation folder under its module holding its message, result, validator, handler, mapping, and definition of pipeline-read values.

**Rationale:** One operation folder holds everything a reviewer needs to judge a use case: its message, result, validator, handler, mapping, and pipeline-read values. Grouping by technical type scatters one operation across the project, so a change touches six folders and review misses one. Type names share the use-case prefix and follow the suffix table under `litespec/workspace/naming#use-architectural-suffixes`. Pipeline-read values are declared beside the message under `litespec/backend/application#declare-every-pipeline-position-beside-the-message`.

### Dispatch commands and queries through separate entry points

**Requirement:** An application MUST dispatch a command and a query through two separate Application-facing entry points rather than one message bus abstraction.

**Rationale:** Two entry points keep the write and read paths distinguishable at every call site and let the pipeline compose different stages for each. A unified bus hides that difference behind one method, so a reader cannot tell whether a dispatch changes state. This backend's whole command and query split depends on that difference.

The rule states the property rather than the package. Each stack binding pins one library that supplies it. A consumer replacing that library records an Exception against the binding convention rather than touching this rule.

### Separate input validation from invariants

**Requirement:** A validator MUST limit its checks to structural input, leaving aggregate state decisions to Domain.

**Rationale:** Structural input and aggregate state fail for different reasons and at different times: malformed input is rejected before Domain runs, while a state refusal needs the loaded aggregate. A validator that checked state would need the aggregate, which pulls persistence into validation. A validator rejects an empty title, a malformed identifier, or an invalid page size, and Domain decides whether the expense above the threshold carries a receipt. Every validator for a message reports validity findings under `litespec/backend/application#report-input-problems-as-validity-findings`, so the caller learns the whole form in one answer.

**Example:** In the Expenses product, `use-case/spending.submit-expense` takes `SubmitExpenseCommand`, which carries an expense identifier and an employee identifier. For example, in the .NET stack the validator rejects an empty expense identifier or an empty employee identifier, and accepts every well-formed pair:

```csharp
public sealed record SubmitExpenseCommand(Guid ExpenseId, Guid EmployeeId, decimal Amount, string Currency, Guid? ReceiptId);
```

Whether the expense above the threshold carries a receipt is an aggregate state decision, so the validator never checks it. Domain rejects an expense above the threshold that carries no receipt with `result/submit-expense.receipt-missing`, which carries the stable code `failure/spending.receipt_missing`.

### Report input problems as validity findings

**Requirement:** A validator MUST report its findings as validity findings, with each failure carrying a member, a code, and a message, and no HTTP status.

**Rationale:** Running every validator and merging findings tells the caller everything wrong with the form in one answer; stopping at the first failure turns one form into repeated round trips. Each failure carries a member naming the input member, a code naming the stable reason, and a message explaining the problem in caller-safe language, with no HTTP status because Application answers no transport.

**Example:** For example, a submit request with an empty expense identifier and an empty employee identifier reports two findings, one per member, with no HTTP status:

```json
[
  { "member": "ExpenseId", "code": "required", "message": "An expense is required." },
  { "member": "EmployeeId", "code": "required", "message": "An employee is required." }
]
```

The caller learns the whole form in one answer, and the pipeline refuses the request before Domain runs.

### Model expected use-case failures explicitly

**Requirement:** An expected use-case failure MUST throw a transport-neutral Application exception carrying the refusal Result's stable code and a safe message.

**Rationale:** An expected failure is part of the use case's contract: one base `UseCaseException` with `ResourceNotFoundException`, `UseCaseForbiddenException`, and `UseCaseConflictException` subtypes, carrying the refusal Result's stable code and a safe message. The exceptions carry no HTTP result, provider exception, or stack detail, so the same failure maps correctly at any transport, and handlers do not catch them.

The use case lists every Result it returns, and each refusal Result carries its failure code. A conflict fails the same input the same way until the caller rereads the resource and retries with current state. A failure that a blind retry can pass is transient and belongs to the integrations extension.

### Enforce target authorization in the pipeline

**Requirement:** The authorization guard, not the handler, MUST authorize every message from the permissions its use case needs and the resource the message names.

**Rationale:** Authorization decided in each handler is decided differently in each handler. The guard decides once from what the message declares: permission codes with the resource subject, resolved against the actor's roles at the subject's scope, with ownership, tenant, role, state, or delegated access resolved against the target data through a scope owner lookup for the record the message names.

Declaring needs beside the message also lets composition refuse to start when a message states no position at all. The guard reports a refusal as a denial rather than raising it, so a refused attempt reaches the audit trail beside the ones that succeeded. The audit extension records the denial under `litespec/ext/audit#record-refused-authorization`.

A collection query has no single target record, so a scope owner lookup has nothing to resolve. Its authorized scope is a database predicate under `litespec/quality/security#restrict-a-protected-collection-in-the-database`, applied before paging. Filtering a loaded collection in memory satisfies neither rule. It matches the shape [OWASP names as broken object level authorization](https://owasp.org/www-project-top-ten/2021/A01_2021-Broken_Access_Control/).

WebApi enforces coarse authenticated, role, or scope policies first under `litespec/backend/api#apply-only-coarse-policies-at-the-endpoint`, which cannot replace a decision that depends on business data.

### Keep command handlers narrow

**Requirement:** A command handler MUST load aggregates, call domain behavior, stage changes, and return a result, leaving commit, transport mapping, audit, and authorization to their owners.

**Rationale:** A handler that commits, maps errors, audits, or authorizes duplicates a boundary that already owns that work, and the duplicates drift: one handler's commit order differs from another's, or one audit entry misses a field. The commit post-handler owns the transaction under `litespec/backend/persistence#commit-each-command-pipeline-once`, WebApi owns error mapping, the audit completion handler owns the trail, and the guard owns authorization. The handler loads aggregates, calls domain behavior, stages changes, and returns a result.

**Example:** In the Expenses product, `use-case/spending.approve-expense` runs through the command pipeline: the endpoint maps the request to `ApproveExpenseCommand`, the mediator dispatches it, validation and the authorization guard run, the handler loads the expense through its repository, approves it through Domain behavior, stages the expense, and returns the result. The handler never commits, and exactly one post-handler commits after it. The diagram shows each stage from the HTTP request to that single commit.

![An HTTP request reaches the endpoint, which maps it to a command and dispatches it through the command mediator. Validation checks structural input, then the authorization guard checks the permission and the target. The handler loads aggregates through repositories, calls domain behavior, and stages changes. The repository stages the aggregate, and exactly one commit post-handler commits the session once.](../assets/diagrams/backend-command-pipeline.svg)

For example, the Approve expense handler in `examples/expenses/` reads as follows in the .NET stack:

```csharp
using Expenses.Application.Abstractions;
using Expenses.Domain.Spending.Expenses;
using LiteBus.Commands.Abstractions;

namespace Expenses.Application.Spending.Expenses.ApproveExpense;

internal sealed class ApproveExpenseCommandHandler(
    IExpenseRepository expenses,
    IClock clock) : ICommandHandler<ApproveExpenseCommand, ApproveExpenseCommandResult>
{
    public async Task<ApproveExpenseCommandResult> HandleAsync(
        ApproveExpenseCommand command,
        CancellationToken cancellationToken)
    {
        var expense = await expenses.GetAsync(command.ExpenseId, cancellationToken);
        expense.Approve(command.ApproverId, clock.UtcNow);
        expenses.Store(expense);
        return new ApproveExpenseCommandResult(expense.Id);
    }
}
```

The handler loads, calls, stages, and returns. Commit, error mapping, and authorization belong to their owners, so none appears in the method.

### Project queries directly

**Requirement:** A query handler MUST project directly to its result record without loading an aggregate.

**Rationale:** A read path cannot act on an invariant, so loading an aggregate for presentation pays for enforcement it cannot use and couples the read shape to the write model. Projecting directly to the result record keeps reads on the read boundary the persistence standards state. The command and query split lives in `litespec/backend/architecture#separate-command-and-query-behavior`.

### Mirror a Domain closed set in the result

**Requirement:** An Application result carrying a Domain closed set MUST model that set with the same shape as its own union or code value.

**Rationale:** Each case of a closed set can carry different data, and that data must survive to the caller. Mirroring the Domain shape in the result keeps the layers aligned; flattening case data into an enum with nullable fields loses which fields belong to which case. Application exposes no Domain union type. Narrowing follows `litespec/backend/application#record-a-decision-for-closed-set-narrowing`, and the set itself follows `litespec/backend/domain#model-every-closed-set-of-domain-values-as-a-closed-type-hierarchy`.

**Example:**

| Layer | Shape |
|:---|:---|
| Domain | Union with one case per value |
| Application | Result union or code value with the same cases |
| WebApi | Transport model with the same shape |
| OpenAPI | Enum or oneOf with a discriminator |

### Record a decision for closed-set narrowing

**Requirement:** A layer MUST NOT narrow a Domain closed set without a recorded decision and an updated specification.

**Rationale:** Narrowing silently drops cases the Domain can produce, so a caller meeting a dropped case gets a shape the contract never described. A recorded decision with an updated specification makes the dropped cases visible and owned. The decision and the specification follow `litespec/core/model#keep-one-owner-and-status-on-every-record`.

### Define narrow external ports

**Requirement:** Application MUST declare each external port as a public interface with a noun or verb name, one method or one purpose, and project-owned types.

**Rationale:** A port is the seam where a provider change stops: one method or one purpose, named as a noun for the capability (`PostArchive`) or a verb for the act (`ArchivePosts`), typed with project-owned types. If provider names or transport models entered the interface, replacing the provider would rewrite Application. Keeping them in Infrastructure confines the change to the adapter.

### Declare a port where its consumers meet

**Requirement:** A port MUST be declared at the lowest folder holding every consumer that names it, following `litespec/backend/architecture#place-a-type-at-the-lowest-folder-that-holds-its-consumers`.

**Rationale:** A port reviewed beside the aggregate it serves is reviewed with that aggregate's specification; a port in a project-wide folder is reviewed by nobody. A port whose consumers sit in one module is declared in that module beside the aggregate it serves, and only a port that more than one module names belongs in the shared application contracts. Collecting every port in one folder because they share the word "port" is grouping by technical type. `litespec/backend/application#organize-application-by-operation` rejects that grouping one level down for the same reason.

You review a port declared beside its aggregate with that aggregate's specification. Nobody reviews a port in a project-wide folder. Where a port serves aggregates in one module but is called from another, the declaring module is the one that owns the aggregates. That module is the one whose rules change when the port changes.

### Declare every pipeline position beside the message

**Requirement:** A message MUST declare a value or an exemption for every pipeline position the baseline and the selected extensions require.

**Rationale:** A pipeline stage that must guess a message's position guesses differently per message. Declaring a value or an exemption beside the message makes each position explicit, and composition refuses to start when a message states neither. The baseline holds one position: authorization, declared as required authorization or a constant exemption, with the exemption on the message itself. The audit extension adds the audit selection position under `litespec/ext/audit#declare-audit-selection-on-every-command`.

### Keep event reaction implementations explicit

**Requirement:** An event reaction implementation MUST declare exactly one delivery classification: atomic, durable, rebuildable, or best-effort-optional.

**Rationale:** A reaction without a declared classification leaves its delivery to whoever reads the code: a retry that should have been durable is lost, or a rebuildable projection blocks the command's transaction. Exactly one classification states the contract. Atomic reactions commit with the triggering command's transaction, and a failure rolls both back. Durable reactions run after commit through durable delivery, and a failure retries until it succeeds. Rebuildable reactions build derived state that a rebuild reproduces, and a failure waits for the next rebuild. Best-effort-optional reactions may skip or drop their effect, and no record needs it.

The use-case record declares the classification under `litespec/core/system#declare-event-reaction-delivery`, and the reaction's definition beside the operation carries the same value. Required delivery activates the outbox extension, and required derived state uses an atomic, durable, or rebuildable path.

### Keep one state-changing use case in one pipeline

**Requirement:** A command handler MUST NOT dispatch another command through the command pipeline.

**Rationale:** A nested dispatch runs the full pipeline inside the pipeline, so the commit post-handler can commit before the top-level use case finishes. One pipeline per state-changing use case keeps one transaction per command. A top-level handler may still coordinate several aggregates when an approved record names the invariant requiring one transaction.

You stage a second command that has to run for durable delivery instead. That path is not an exemption from this rule. The staged command enters its own pipeline and owns its own transaction, so no nesting occurs.

## Conventions

### Use this operation layout

**Default:** Place each operation in a folder named for its use case under its module and aggregate.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Example:**

In the dotnet stack, the layout is:

```text
{ProjectName}.Application.Abstractions/     contracts more than one module names
  Clock/
    IClock.cs
  Failures/
    ResourceNotFoundException.cs
    UseCaseForbiddenException.cs
    UseCaseConflictException.cs
  Validation/
    ValidationErrors.cs
{ProjectName}.Application/
  Pipeline/                         the pipeline's own stages, and nothing else
    ApplicationPipeline.cs
    AuthorizationGuard.cs
  Posts/                            single aggregate whose name matches the module: operations sit directly under the module
    IPostArchive.cs                 a port several Posts use cases name
    CreateDraft/
      CreateDraftCommand.cs
      CreateDraftCommandResult.cs
      CreateDraftCommandValidator.cs
      CreateDraftCommandHandler.cs
    GetPost/
      GetPostQuery.cs
      GetPostQueryResult.cs
      GetPostQueryValidator.cs
      GetPostQueryHandler.cs
    ListPosts/
      ListPostsQuery.cs
      ListPostsQueryResult.cs
      ListPostsQueryResultItem.cs
      ListPostsQueryValidator.cs
      ListPostsQueryHandler.cs
    NotifySubscribersOnPostPublished/
      NotifySubscribersOnPostPublishedHandler.cs
      IPostPublicationNotifier.cs   a port one use case names
  Customers/                        two aggregates: operations nest under each aggregate
    CustomerAccounts/
      CustomerAccountScopeLookup.cs aggregate-owned, so it sits with the aggregate
      RestrictAccount/
        RestrictAccountCommand.cs
        RestrictAccountCommandHandler.cs
    Consents/
      GrantConsent/
        GrantConsentCommand.cs
        GrantConsentCommandHandler.cs
```

Module and aggregate order, including the single-aggregate flat form, follow `litespec/backend/architecture#organize-every-layer-by-module-and-use-case`.

Only a use case gets a folder. Any other type sits flat in the folder that owns it, chosen by `litespec/backend/architecture#place-a-type-at-the-lowest-folder-that-holds-its-consumers`, so every folder name below a module names one operation. A reaction is a use case that reacts to an event, so its folder takes the reaction's use-case name under `litespec/backend/application#keep-event-reaction-implementations-explicit`. A folder named for a service, a technical kind, or a caller breaks that reading; it is drift rather than a second convention.

### Keep messages immutable

**Default:** Declare commands, queries, results, and validation errors as records.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Records give commands, queries, results, and validation errors value semantics no handler mutates mid-pipeline. Typed identifiers and Shared-kernel value objects may cross the boundary; an aggregate-owned value object does not, so the message carries a primitive and the handler reconstructs it.

### Return use-case results

**Default:** Return only the values the caller needs from an Application result.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** A result carries only what the caller needs. An aggregate, session, provider response, or HTTP result leaving Application makes an inner concern part of the outward contract, and every change to that concern breaks callers.

### Keep mappings at the owning boundary

**Default:** Own domain-to-result projection in Application, transport mapping in WebApi, and view models in the frontend.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** A mapping changes when its output shape changes, so it lives with the boundary that defines that shape: domain-to-result projection in Application, transport mapping in WebApi, view models in the frontend. A mapping kept elsewhere breaks when the owning boundary evolves.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/application#organize-application-by-operation | guidance | Does each operation folder hold its message, result, validator, handler, and definition? |
| litespec/backend/application#dispatch-commands-and-queries-through-separate-entry-points | guidance | Does each dispatch site call its own command or query entry point? |
| litespec/backend/application#separate-input-validation-from-invariants | guidance | Does each validator check only structural input and defer state decisions? |
| litespec/backend/application#report-input-problems-as-validity-findings | guidance | Does each validator report validity findings with `member`, `code`, and `message` failures? |
| litespec/backend/application#model-expected-use-case-failures-explicitly | guidance | Does each expected failure throw its typed exception with its Result code? |
| litespec/backend/application#enforce-target-authorization-in-the-pipeline | guidance | Does the pipeline suite assert that every target has a guard and no handler authorizes itself? |
| litespec/backend/application#keep-command-handlers-narrow | guidance | Does the pipeline stage suite assert that no handler commits, audits, or authorizes? |
| litespec/backend/application#project-queries-directly | guidance | Does each query handler project to its result without loading an aggregate? |
| litespec/backend/application#mirror-a-domain-closed-set-in-the-result | guidance | Does each result union carry one record per Domain case? |
| litespec/backend/application#record-a-decision-for-closed-set-narrowing | guidance | Does each narrowed set name its decision and updated specification? |
| litespec/backend/application#define-narrow-external-ports | guidance | Does each port name its business action with project-owned types? |
| litespec/backend/application#declare-a-port-where-its-consumers-meet | guidance | Does each port sit at the lowest folder holding its consumers? |
| litespec/backend/application#declare-every-pipeline-position-beside-the-message | guidance | Does each message declare a value or exemption for every required position? |
| litespec/backend/application#keep-event-reaction-implementations-explicit | guidance | Does each reaction declare exactly one classification it honors? |
| litespec/backend/application#keep-one-state-changing-use-case-in-one-pipeline | guidance | Does any command handler dispatch another command through the command pipeline? |
| litespec/backend/application#use-this-operation-layout | guidance | Does each operation path match its module, aggregate, and use case? |
| litespec/backend/application#keep-messages-immutable | guidance | Is each message, result, and validation error a record? |
| litespec/backend/application#return-use-case-results | guidance | Does each result return only values the caller needs? |
| litespec/backend/application#keep-mappings-at-the-owning-boundary | guidance | Does each conversion live in the layer owning its output shape? |
