# Application Layer

## Intent

Application coordinates use cases. It translates a command or query into domain and persistence work, applies structural input validation, and returns a transport-neutral result. It does not contain HTTP behavior or provider implementations.

Every folder in the project is a module, an aggregate, or a use case. The contracts more than one module names live in the shared application contracts, and the pipeline's own machinery lives in one folder named for it.

## Agent Summary {#agent-summary}

- One folder per operation holds its message, definition, result, validator, and handler. (litespec/rule/backend-application.organize-application-by-operation, litespec/rule/backend-application.use-this-operation-layout)
- Commands and queries dispatch through separate mediator entry points. (litespec/rule/backend-application.dispatch-commands-and-queries-through-separate-entry-points)
- Validators check input shape and report validity findings while Domain decides state permission. (litespec/rule/backend-application.separate-input-validation-from-invariants, litespec/rule/backend-application.report-input-problems-as-validity-findings)
- Expected failures throw typed exceptions carrying their Result code. (litespec/rule/backend-application.model-expected-use-case-failures-explicitly)
- The guard authorizes from declared permissions while handlers authorize nothing. (litespec/rule/backend-application.enforce-target-authorization-in-the-pipeline, litespec/rule/backend-application.declare-every-pipeline-position-beside-the-message)
- Command handlers load, call, stage, and return without nesting. (litespec/rule/backend-application.keep-command-handlers-narrow, litespec/rule/backend-application.keep-one-state-changing-use-case-in-one-pipeline)
- Queries project to result records without loading aggregates. (litespec/rule/backend-application.project-queries-directly)
- Results mirror Domain closed sets while narrowing needs a recorded decision. (litespec/rule/backend-application.mirror-a-domain-closed-set-in-the-result, litespec/rule/backend-application.record-a-decision-for-closed-set-narrowing)
- Reactions declare one delivery classification and run it. (litespec/rule/backend-application.keep-event-reaction-implementations-explicit)
- Ports stay narrow and declared with consumers while messages stay immutable records mapped at boundaries. (litespec/rule/backend-application.define-narrow-external-ports, litespec/rule/backend-application.declare-a-port-where-its-consumers-meet, litespec/rule/backend-application.keep-messages-immutable, litespec/rule/backend-application.return-use-case-results, litespec/rule/backend-application.keep-mappings-at-the-owning-boundary)

## Standards

### Organize Application by operation (litespec/rule/backend-application.organize-application-by-operation)

**Requirement:** Each command or query MUST own one operation folder under its module holding its message, result, validator, handler, mapping, and definition of pipeline-read values.

**Rationale:** Grouping by technical type scatters one operation across the project. Type names share the use-case prefix and follow the suffix table under `litespec/rule/workspace-naming.use-architectural-suffixes`. Pipeline-read values are declared beside the message under `litespec/rule/backend-application.declare-every-pipeline-position-beside-the-message`.

### Dispatch commands and queries through separate entry points (litespec/rule/backend-application.dispatch-commands-and-queries-through-separate-entry-points)

**Requirement:** An application MUST dispatch a command and a query through two separate Application-facing entry points rather than one message bus abstraction.

**Rationale:** Two entry points keep the write and read paths distinguishable at every call site, and let the pipeline compose different stages for each. A unified bus hides that difference behind one method, and the difference is the one this profile's whole command and query split depends on.

The rule states the property rather than the package. Each stack binding pins one library that supplies it. A consumer replacing that library records an Exception against the binding convention rather than touching this rule.

### Separate input validation from invariants (litespec/rule/backend-application.separate-input-validation-from-invariants)

**Requirement:** A validator MUST limit its checks to structural input, leaving aggregate state decisions to Domain.

**Rationale:** Domain owns state permission. A validator rejects an empty title, malformed identifier, or invalid page size. Every validator for a message reports validity findings under `litespec/rule/backend-application.report-input-problems-as-validity-findings`, so the caller learns the whole form in one answer.

### Report input problems as validity findings (litespec/rule/backend-application.report-input-problems-as-validity-findings)

**Requirement:** A validator MUST report its findings as validity findings, with each failure carrying a member, a code, and a message, and no HTTP status.

**Rationale:** Every validator for a message runs, and the pipeline merges their findings before it refuses the request. The member names the input member, the code names the stable reason, and the message explains the problem in caller-safe language.

### Model expected use-case failures explicitly (litespec/rule/backend-application.model-expected-use-case-failures-explicitly)

**Requirement:** An expected use-case failure MUST throw a transport-neutral Application exception carrying the refusal Result's stable code and a safe message.

**Rationale:** One base `UseCaseException` has `ResourceNotFoundException`, `UseCaseForbiddenException`, and `UseCaseConflictException` subtypes. They carry no HTTP result, provider exception, or stack detail, and handlers do not catch them.

The use case lists every Result it returns, and each refusal Result carries its failure code. A conflict fails identical input identically until the caller rereads the resource and retries with current state. A failure that a blind retry can pass is transient and belongs to the integrations extension.

### Enforce target authorization in the pipeline (litespec/rule/backend-application.enforce-target-authorization-in-the-pipeline)

**Requirement:** The authorization guard, not the handler, MUST authorize every message from the permissions its use case needs and the resource the message names.

**Rationale:** The message declares its needs as permission codes with the resource subject, and the guard resolves the actor's roles at the subject's scope. The guard resolves ownership, tenant, role, state, or delegated access against the target data through a scope owner lookup for the record the message names.

Making the decision once, from a declaration, stops two messages about the same record asking different questions. It also lets composition refuse to start when a message states no position at all. A refusal is reported as a denial rather than raised, so a refused attempt reaches the audit trail beside the ones that succeeded. The audit extension records the denial under `litespec/rule/ext-audit.record-refused-authorization`.

A collection query has no single target record, so a scope owner lookup has nothing to resolve. Its authorized scope is a database predicate under `litespec/rule/quality-security.restrict-a-protected-collection-in-the-database`, applied before paging. Filtering a loaded collection in memory satisfies neither rule, and is the shape [OWASP names as broken object level authorization](https://owasp.org/www-project-top-ten/2021/A01_2021-Broken_Access_Control/).

WebApi enforces coarse authenticated, role, or scope policies first under `litespec/rule/backend-api.apply-only-coarse-policies-at-the-endpoint`, which cannot replace a decision that depends on business data.

### Keep command handlers narrow (litespec/rule/backend-application.keep-command-handlers-narrow)

**Requirement:** A command handler MUST load aggregates, call domain behavior, stage changes, and return a result, leaving commit, transport mapping, audit, and authorization to their owners.

**Rationale:** The commit post-handler owns the transaction under `litespec/rule/backend-persistence.commit-each-command-pipeline-once`, WebApi owns error mapping, the audit completion handler owns the trail, and the guard owns authorization. A handler that does any of those duplicates a boundary that already exists.

### Project queries directly (litespec/rule/backend-application.project-queries-directly)

**Requirement:** A query handler MUST project directly to its result record without loading an aggregate.

**Rationale:** Loading an aggregate for presentation pulls invariant enforcement into a read path that cannot use it. The command and query split lives in `litespec/rule/backend-architecture.separate-command-and-query-behavior`, and the read boundary lives in the persistence standards.

### Mirror a Domain closed set in the result (litespec/rule/backend-application.mirror-a-domain-closed-set-in-the-result)

**Requirement:** An Application result carrying a Domain closed set MUST model that set with the same shape as its own union or code value.

**Rationale:** The set's information then survives to the caller and the layers stay aligned. Application exposes no Domain union type and never flattens case data into an enum with nullable fields. Narrowing follows `litespec/rule/backend-application.record-a-decision-for-closed-set-narrowing`, and the set itself follows `litespec/rule/backend-domain.model-every-closed-set-of-domain-values-as-a-closed-type-hierarchy`.

**Example:**

| Layer | Shape |
|:---|:---|
| Domain | Union with one case per value |
| Application | Result union or code value with the same cases |
| WebApi | Transport model with the same shape |
| OpenAPI | Enum or oneOf with a discriminator |

### Record a decision for closed-set narrowing (litespec/rule/backend-application.record-a-decision-for-closed-set-narrowing)

**Requirement:** A layer MUST NOT narrow a Domain closed set without a recorded decision and an updated specification.

**Rationale:** Narrowing drops cases an outer layer declines to carry. The decision and the specification follow `litespec/rule/core-model.keep-one-owner-and-status-on-every-record`.

### Define narrow external ports (litespec/rule/backend-application.define-narrow-external-ports)

**Requirement:** Application MUST declare each external port as a public interface with a noun or verb name, one method or one purpose, and project-owned types.

**Rationale:** A noun name reads as the capability (`PostArchive`) and a verb name reads as the act (`ArchivePosts`). Provider names and transport models stay in Infrastructure, so a provider change does not reach Application.

### Declare a port where its consumers meet (litespec/rule/backend-application.declare-a-port-where-its-consumers-meet)

**Requirement:** A port MUST be declared at the lowest folder holding every consumer that names it, following `litespec/rule/backend-architecture.place-a-type-at-the-lowest-folder-that-holds-its-consumers`.

**Rationale:** A port whose consumers sit in one module is declared in that module beside the aggregate it serves. Only a port more than one module names is declared in the shared application contracts. Collecting every port in one folder because they share the word "port" is grouping by technical type. `litespec/rule/backend-application.organize-application-by-operation` rejects that grouping one level down for the same reason.

A port declared beside its aggregate is reviewed with that aggregate's specification; a port in a project-wide folder is reviewed by nobody. Where a port serves aggregates in one module but is called from another, the declaring module is the one that owns the aggregates. That module is the one whose rules change when the port changes.

### Declare every pipeline position beside the message (litespec/rule/backend-application.declare-every-pipeline-position-beside-the-message)

**Requirement:** A message MUST declare a value or an exemption for every pipeline position the baseline and the selected extensions require.

**Rationale:** The baseline holds one position: authorization, declared as required authorization or a constant exemption. The declaration lives beside the message in the operation folder. An exemption lives on the message itself. The audit extension adds the audit selection position under `litespec/rule/ext-audit.declare-audit-selection-on-every-command`. Composition refuses to start when a message states no value or exemption for a required position.

### Keep event reaction implementations explicit (litespec/rule/backend-application.keep-event-reaction-implementations-explicit)

**Requirement:** An event reaction implementation MUST declare exactly one delivery classification: atomic, durable, rebuildable, or best-effort-optional.

**Rationale:** Atomic reactions commit with the triggering command's transaction, and a failure rolls both back. Durable reactions run after commit through durable delivery, and a failure retries until it succeeds. Rebuildable reactions build derived state that a rebuild reproduces, and a failure waits for the next rebuild. Best-effort-optional reactions may skip or drop their effect, and no record needs it.

The use-case record declares the classification under `litespec/rule/core-system.declare-event-reaction-delivery`, and the reaction's definition beside the operation carries the same value. Required delivery activates the outbox extension, and required derived state uses an atomic, durable, or rebuildable path.

### Keep one state-changing use case in one pipeline (litespec/rule/backend-application.keep-one-state-changing-use-case-in-one-pipeline)

**Requirement:** A command handler MUST NOT dispatch another command through the command pipeline.

**Rationale:** Nested dispatch can run the commit post-handler before the top-level use case finishes. A top-level handler may still coordinate several aggregates when an approved record names the invariant requiring one transaction.

A second command that has to run is staged for durable delivery instead. That path is not an exemption from this rule. The staged command enters its own pipeline and owns its own transaction, so no nesting occurs.

## Conventions

### Use this operation layout (litespec/rule/backend-application.use-this-operation-layout)

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

Module and aggregate order, including the single-aggregate flat form, follow `litespec/rule/backend-architecture.organize-every-layer-by-module-and-use-case`.

Only a use case gets a folder. A type that is not a use case sits flat in the folder that owns it, chosen by `litespec/rule/backend-architecture.place-a-type-at-the-lowest-folder-that-holds-its-consumers`. A reader can then take every folder name below a module as the name of one operation. A reaction is a use case that reacts to an event, so its folder takes the reaction's use-case name under `litespec/rule/backend-application.keep-event-reaction-implementations-explicit`. A folder named for a service, a technical kind, or a caller breaks that reading and is drift rather than a second convention.

### Keep messages immutable (litespec/rule/backend-application.keep-messages-immutable)

**Default:** Declare commands, queries, results, and validation errors as records.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Typed identifiers and Shared-kernel value objects may cross the boundary. An aggregate-owned value object does not, so the message carries a primitive and the handler reconstructs it.

### Return use-case results (litespec/rule/backend-application.return-use-case-results)

**Default:** Return only the values the caller needs from an Application result.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** An aggregate, session, provider response, or HTTP result leaving Application makes an inner concern part of the outward contract.

### Keep mappings at the owning boundary (litespec/rule/backend-application.keep-mappings-at-the-owning-boundary)

**Default:** Own domain-to-result projection in Application, transport mapping in WebApi, and view models in the frontend.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Each mapping then changes with the boundary that defines its shape.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/backend-application.organize-application-by-operation | guidance | Does each operation folder hold its message, result, validator, handler, and definition? |
| litespec/rule/backend-application.dispatch-commands-and-queries-through-separate-entry-points | guidance | Does each dispatch site call its own command or query entry point? |
| litespec/rule/backend-application.separate-input-validation-from-invariants | guidance | Does each validator check only structural input and defer state decisions? |
| litespec/rule/backend-application.report-input-problems-as-validity-findings | guidance | Does each validator report validity findings with member, code, and message failures? |
| litespec/rule/backend-application.model-expected-use-case-failures-explicitly | guidance | Does each expected failure throw its typed exception with its Result code? |
| litespec/rule/backend-application.enforce-target-authorization-in-the-pipeline | guidance | Does the pipeline suite assert that every target has a guard and no handler authorizes itself? |
| litespec/rule/backend-application.keep-command-handlers-narrow | guidance | Does the pipeline stage suite assert that no handler commits, audits, or authorizes? |
| litespec/rule/backend-application.project-queries-directly | guidance | Does each query handler project to its result without loading an aggregate? |
| litespec/rule/backend-application.mirror-a-domain-closed-set-in-the-result | guidance | Does each result union carry one record per Domain case? |
| litespec/rule/backend-application.record-a-decision-for-closed-set-narrowing | guidance | Does each narrowed set name its decision and updated specification? |
| litespec/rule/backend-application.define-narrow-external-ports | guidance | Does each port name its business action with project-owned types? |
| litespec/rule/backend-application.declare-a-port-where-its-consumers-meet | guidance | Does each port sit at the lowest folder holding its consumers? |
| litespec/rule/backend-application.declare-every-pipeline-position-beside-the-message | guidance | Does each message declare a value or exemption for every required position? |
| litespec/rule/backend-application.keep-event-reaction-implementations-explicit | guidance | Does each reaction declare exactly one classification it honors? |
| litespec/rule/backend-application.keep-one-state-changing-use-case-in-one-pipeline | guidance | Does any command handler dispatch another command through the command pipeline? |
| litespec/rule/backend-application.use-this-operation-layout | guidance | Does each operation path match its module, aggregate, and use case? |
| litespec/rule/backend-application.keep-messages-immutable | guidance | Is each message, result, and validation error a record? |
| litespec/rule/backend-application.return-use-case-results | guidance | Does each result return only values the caller needs? |
| litespec/rule/backend-application.keep-mappings-at-the-owning-boundary | guidance | Does each conversion live in the layer owning its output shape? |
