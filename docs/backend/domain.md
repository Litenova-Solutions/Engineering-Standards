# Domain Layer

## Intent

The Domain layer holds a product's business rules in code that depends on nothing but itself, so the rules are tested on their own. An aggregate is one unit of business state that stays consistent and changes in one step, and this page states how to model aggregates, their lifecycles, closed sets of values, and the domain repositories that load them. It also states the boundary that keeps technical concerns out of business rules.

## Concepts

### Aggregates and the Business Model

In code, the [aggregate root](../reference/glossary.md) is the single type through which outside code changes the aggregate: it guards every mutation, holds the lifecycle state, and records domain events. Child entities live inside the boundary and expose no mutable state outside the root. One aggregate references another by typed identifier rather than by object reference, and one domain repository per aggregate loads and stages it. A `store` aggregate has no root in code; it reaches code through a port under `litespec/backend/application#expose-store-state-through-ports`.

### Lifecycles as State Types

Every aggregate exposes its lifecycle as state types from its first implementation: one state property backed by one closed hierarchy with one type per state. A one-state hierarchy gives later states and state-specific facts a defined home, so adding a state extends the hierarchy instead of replacing an enumeration, status string, or flag-based lifecycle. In the Claimwick product, an expense is `Submitted`, `Approved`, `Rejected`, or `Reimbursed`, and each state carries its own facts, such as the approver or the reimbursed time.

### Closed Sets

A closed set is a fixed menu of values where the type system knows every case, such as a refund outcome or an expense state. Domain models each one as a type hierarchy with one type per case, so adding a case breaks every switch over it. Each outer layer mirrors the same shape in its own form: a result union in Application, a transport model in WebApi, and a stable string discriminator in storage.

## Standards

### Keep Domain Independent of Outer Layers

**Statement:** The Domain code MUST reference only the language standard library and project-owned Domain types.

**Rationale:** Domain that references only the language standard library and its own types compiles and tests with no infrastructure at all. Each banned reference would drag one outer concern into the business model: persistence metadata couples a rule to a store format, and dispatch plumbing couples it to delivery. Infrastructure registers a persisted discriminator instead, so Domain carries no serialization metadata.

### Use One Ubiquitous Language

**Statement:** A Domain name MUST match a term in the project glossary.

**Rationale:** When code and specification share names, a reader moves between them without translation. A business action named `Publish` in the glossary is not `SetStatus` in code, because the second name hides which business action ran. The glossary holds each term meaning, labels per language, rejected words, and broader and narrower links; records cite the terms they use, following `litespec/core/behavior#define-every-domain-term-in-the-glossary`.

### Treat Aggregates as Consistency Boundaries

**Statement:** An aggregate root MUST be the only public mutation entry point for every invariant its transaction protects.

**Rationale:** If outside code could set properties or call child mutations, it could change data without passing the root's checks. The root stands as the only public mutation entry point, so every change passes the invariant the transaction protects. A command with `consistency: atomic` changes every aggregate its `changes` names in one transaction, citing the rule in `because` when it changes more than one.

### Take Identity and Events from the Project Root Contract

**Statement:** An aggregate root MUST take its identity and event mechanics from the project-owned root contract.

**Rationale:** One root contract gives every aggregate the same identity and event mechanics, so Infrastructure collects events from any aggregate the same way. The contract owns typed identity, pending events, recording, and clearing, and nothing else: no timestamp, audit, tenant, lifecycle, or persistence behavior, because any of those would couple every aggregate to a concern only some need.

### Model Every Aggregate Lifecycle with State Types

**Statement:** An aggregate MUST expose its lifecycle only through one state property backed by one closed hierarchy of per-state types.

**Rationale:** Each lifecycle state can carry different facts: a published post carries its publication time, a draft does not. An enumeration, string discriminator, boolean flag, parallel nullable field, or computed state carries no state-specific data, and the type system proves no switch over them exhaustive. State types hold that data, and aggregate methods own the transitions between them.

**Example:** A post defines one abstract post state with draft and published cases, where the published case carries its publication time. Even an aggregate with one current state defines its hierarchy.

In the Claimwick product, `aggregate/spending.expense` records the `Submitted`, `Approved`, `Rejected`, and `Reimbursed` states with their transitions: Submit from `use-case/spending.submit-expense` creates Submitted, Approve from `use-case/spending.approve-expense` moves Submitted to Approved, Reject from `use-case/spending.reject-expense` moves Submitted to Rejected, and Reimburse from `use-case/spending.reimburse-expense` moves Approved to Reimbursed. The approved case carries the approver and the decided time, and the reimbursed case carries the reimbursed time.

![Submit from submit-expense creates a Submitted expense, Approve from approve-expense moves it to Approved carrying the approver and the decided time, Reject from reject-expense moves it to Rejected carrying the reason, and Reimburse from reimburse-expense moves an Approved expense to Reimbursed carrying the reimbursed time.](../assets/diagrams/backend-aggregate-lifecycle.svg)

### Model Every Closed Set of Domain Values as a Closed Type Hierarchy

**Statement:** Domain code MUST model a closed set as one type hierarchy whose cases the type system can enumerate.

**Rationale:** A closed set with case data needs a type per case: an enumeration carries no case data, admits undefined values, and forces parallel nullable fields when one case gains data. A closed hierarchy lets the type system check exhaustiveness, so adding a case breaks every switch over it. A boundary converts a label to its case through a named lookup rather than through a string conversion, and an unrecognized label is a validation failure rather than a default case.

**Example:** A refund outcome defines pending, succeeded, failed, and reversed cases, where each case carries its own data.

This provision owns the Domain form. The same set is mirrored in Application under `litespec/backend/application#mirror-a-domain-closed-set-in-the-result`, on the wire under `litespec/backend/api#mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape`, and in storage under `litespec/backend/persistence#keep-serialization-behavior-out-of-domain`. Label-only sets cross the boundary as plain enumerations under `litespec/backend/api#publish-label-only-sets-as-string-enums`. A transport label converts to its type case before it reaches a Domain method.

### Create Valid Aggregates Through Named Factories

**Statement:** An aggregate root MUST create instances only through a factory named for its business action.

**Rationale:** A constructor carries no business name, so construction through constructors spreads creation rules across call sites. The factory is named for its business action, accepts typed identifiers, rejects empty identity and violated creation rules, selects the initial state, records required events, and returns a complete aggregate.

A root created with its children composes them inside the same factory call. The children are built from typed values the caller supplies: a caller holding an already constructed child could mutate it after the invariant was checked, so the factory builds the children itself from those values.

**Example:** In the Claimwick product, `use-case/spending.submit-expense` creates its expense through a factory named for submitting: the factory takes the expense and employee identifiers, rejects an empty identity, selects the submitted state, and records the submitted event.

### Express Transitions Through Business Methods

**Statement:** A public aggregate mutation method MUST check current state and protect its invariants, replacing state and recording its transition event when it moves the lifecycle.

**Rationale:** A business-named method lets the handler call the publish behavior without testing the state first: the method checks the current state and protects its invariants, then replaces state and records the transition event when it moves the lifecycle. A generic `Set`, `Update`, `Process`, or `Handle` name hides which business action ran. A mutation that changes no lifecycle state, such as `ChangeTitle` on a draft, checks state and assigns without recording a transition.

Checks run before replacement, and replacement runs before recording. A method that replaces state before checking an invariant leaves a rejected aggregate holding the new state.

**Example:** In the Claimwick product, `use-case/spending.reimburse-expense` ends with `result/reimburse-expense.reimbursed` when the expense is approved, and with `result/reimburse-expense.not-approved` when it is not. The handler calls one business method, and the method checks the state, replaces it, and records `event/expense.reimbursed`.

An unapproved expense keeps its state, and the refusal carries the stable code `spending.not-approved`.

### Keep Child Entities Inside the Aggregate Boundary

**Statement:** A child entity MUST expose no mutable state outside its aggregate root, surfacing its collection as a read-only view.

**Rationale:** A child that exposed mutable state would let outside code change aggregate data without passing the root's checks. The root creates, finds, and changes children through business methods, and collections surface as read-only views. A child with lifecycle states uses the same state types and no enumeration.

### Identify Aggregates with Strongly Typed Version 7 Values

**Statement:** An aggregate identity MUST be a dedicated type wrapping one version 7 UUID, with no conversion, alias, or creation path that bypasses its validation.

**Rationale:** A dedicated identity type stops one aggregate's identifier from passing where another's is expected, and with no conversion, alias, or creation path around its validation, there is no quiet route back to a bare value. The type rejects the empty value, and each factory also rejects its default. New values arrive from the caller: a factory takes its identifier as an argument, and a method that needs several identifiers takes a generator. Domain reads no clock and calls no static source of time or randomness.

Version 7 values come from the caller-supplied generator, so Domain observes no business time and decides nothing about clocks. Persistence rejects a duplicate key and the write fails, which is the same path as any other write conflict.

**Example:** A post identifier wraps one version 7 UUID, rejects the empty value, and parses from text through a named method.

### Use Immutable Value Objects for Domain Concepts

**Statement:** A value object MUST be immutable, compare by its complete value, and validate every value at creation.

**Rationale:** Immutability with comparison by complete value lets two instances with the same data stand in for each other. The value exposes no mutation and no implicit conversion, because a primitive conversion hides validation and a value conversion erases the domain type. Reading uses the wrapped value or its text form, and creation through a named creation path keeps every value under the validation the type declares.

**Example:** A post title accepts only non-blank text up to 200 characters: blank or longer input fails creation, and two titles with the same text compare as equal.

### Define Collection Value Semantics Explicitly

**Statement:** A value object containing a collection MUST implement content equality and a matching hash for its declared ordering rule.

**Rationale:** Default structural equality compares collection references rather than contents, so two value objects holding equal lists compare as different. Content equality with a matching hash compares what the value means. Creation copies incoming mutable collections and members return read-only views, so later mutation by the caller leaves the value unchanged. The module terms state whether order is part of the value.

**Example:** A post-tags value holding an ordered list compares element by element with a matching hash. If order is not part of the value, creation normalizes to the documented comparison order before storing values.

### Model Money with Exact Decimal Values

**Statement:** A monetary amount MUST use an exact decimal type inside one shared `Money` value object carrying an ISO 4217 currency code and serializing as `{ "amount": "12.50", "currency": "EUR" }`.

**Rationale:** Money needs exact arithmetic and an explicit currency on every value, and one shared `Money` object gives both. The owning module record defines supported currencies, scale, rounding, sign rules, and cross-currency arithmetic, and Infrastructure maps that precision explicitly. A use case fixed to one currency accepts an amount alone and states that currency in its record.

**Example:**

```json
{ "amount": "12.50", "currency": "EUR" }
```

The amount serializes as a string, so no reader parses it as binary floating point.

### Keep Binary Floating Point Out of Exact Quantities

**Statement:** A Domain value MUST NOT use binary floating point for a monetary amount, a rate applied to one, or a quantity compared for exact equality.

**Rationale:** Binary floating point represents most decimal fractions only approximately, so two amounts a person reads as equal compare as different, and totals drift by fractions of a cent. Exact decimal types keep equality and arithmetic exact.

**Example:** A tax rate multiplied into a `Money` amount uses an exact decimal type. A measured latency in a diagnostic log is not a Domain quantity and is outside this rule.

### Use Stateless Domain Services for Ownerless Rules

**Statement:** A domain service MUST be stateless, accept and return Domain values, and perform no persistence, messaging, logging, clock, authorization, or provider call.

**Rationale:** Some calculations span concepts with no natural aggregate owner; forcing them into one aggregate couples it to another's data. A stateless service holds that calculation, accepting and returning Domain values with no persistence, messaging, logging, clock, authorization, or provider call. Application loads the aggregates, calls the service, and passes its result into aggregate behavior.

A domain service is stateless and takes no port, so its tests are Domain tests. They sit beside the aggregate tests in the Domain test project, with no harness, no substitute, and no fixture.

**Example:** An order-pricing service takes order lines and a currency and returns their total as `Money`, with no domain repository, clock, logger, or provider client. Application supplies the lines and passes the returned total into aggregate behavior.

### Expose Repositories for One Aggregate Only

**Statement:** A domain repository MUST serve exactly one aggregate root, exposing only aggregate and Domain types, with no composable query, session, or generic CRUD surface.

**Rationale:** One domain repository per aggregate keeps the write side shaped by the aggregates it loads: a required load looks the aggregate up by identity and reports a missing aggregate through the missing-resource refusal, so a handler repeats no absence check, while an optional lookup is reserved for cases where absence is normal. A composable query, session, or generic CRUD surface would expose store mechanics to every handler.

This boundary is the write side only. Reading for a query uses a read model owned by Application and shaped by Infrastructure, and that path declares no Domain contract. A repository that gained a projection method would put query shapes in Domain, which is the coupling this layer exists to prevent.

**Example:** A post repository loads a post by identity and reports a missing post through the missing-resource refusal, plus a staging call that stages the aggregate.

The Infrastructure implementation owns that refusal. The command pipeline owns the commit. The staging call stages the aggregate through the selected provider.

### Raise Immutable Facts as Domain Events

**Statement:** A domain event MUST be immutable and carry business data only.

**Rationale:** A domain event records a completed fact for reactions to consume. Its name states the aggregate and the completed fact, following `litespec/workspace/naming#anchor-aggregate-owned-types-on-the-aggregate-root` and `litespec/workspace/naming#use-architectural-suffixes`, so a reader knows which aggregate raised the fact without opening the file. The event carries business data only: typed identifiers and the values its reactions need, with no aggregate, session, service, mutable collection, or thrown error, because any of those would couple reactions to the raising process. Envelope identity, such as message identity and causation identity, lives on the published integration event that carries the fact outside the process. That integration event names the domain event in `translates`.

### Reject Business Violations with Dedicated Refusals

**Statement:** A rejected business rule MUST end its use case in a dedicated refusal carrying its stable code.

**Rationale:** One refusal per rejected rule lets each boundary map outcomes without parsing messages: the refusal names the failed rule and the stable code travels to the caller. The name leads with the aggregate root. Domain raises no standard library, validation, transport, or provider failure for a business rejection, and carries no transport status. Refusal names follow `litespec/workspace/naming#name-exceptions-by-failed-rule`; this provision owns the one-refusal-per-rule shape and the code each refusal carries.

**Example:** A refund allocation rule ends its use case in its own refusal, rather than sharing one refusal with a code passed at the call site.

Two rules that share a caller-visible refusal code because a boundary maps them to one response still get two refusals. The shared code lives in the two refusals, not in a value passed by the aggregate. One refusal serves more than one input only when one rule fails from more than one input and the differing values travel as creation parameters.

Application validators handle malformed caller input through validity findings. Aggregate and value-object refusals remain the last defense when direct Domain use violates a rule. Command handlers do not catch expected Domain refusals. The host maps them to transport errors through the mapping the API page documents under `litespec/backend/api#defer-error-mapping-to-the-global-handler`.

### Reference Other Aggregates by ID

**Statement:** An aggregate MUST store another aggregate's typed identifier rather than an object reference.

**Rationale:** An object reference between aggregates loads one aggregate's data through another, which couples their consistency boundaries and their storage. A typed identifier keeps each aggregate loadable on its own: Application loads each aggregate through its domain repository when a command coordinates several, with `consistency: atomic` citing the rule in `because`.

### Pass Nondeterministic Values into Domain

**Statement:** Domain behavior MUST receive time, randomness, and new identifiers as arguments rather than read them, and read no clock.

**Rationale:** Domain behavior that read a clock or generated identifiers would return different results for the same call, which makes tests nondeterministic. Receiving time, randomness, and new identifiers as arguments keeps every Domain call a pure function of its inputs: a test supplies explicit values and stays deterministic. Application obtains each value through an owned port and passes it in. A method that needs more than one value receives a clock or a generator through its arguments, and version 7 identifiers come from the caller-supplied generator.

### Describe Every Public Domain Contract in Documentation

**Statement:** Every public Domain type and member MUST carry documentation stating the business constraint, result, or refusal it represents.

**Rationale:** A reader meeting a public Domain member needs to know the business rule behind it, not just its signature. Documentation states the business constraint, result, or refusal the member represents: a mutation method names its source states, resulting state, protected invariant, and recorded event. A summary that restates the member name adds nothing.

## Conventions

### Organize a Module by Aggregate and Concept

**Default:** Give each aggregate a folder named with its plural root name, holding its own states, events, refusals, and concepts.

**Replacement:** A project names its own module layout in its documentation.

**Rationale:** Each aggregate folder holds everything one aggregate owns: its states, events, refusals, and concepts. A reader finds the full aggregate in one place instead of hunting shared folders. A single aggregate stays flat only when its plural root name equals the module name, and separate aggregates keep separate lifecycle, event, and refusal folders.

**Example:**

```text
Domain/
  Shared/                         the shared kernel: the root, event, identity, and refusal contracts
  Posts/                          one aggregate whose name matches the module: kept flat in the module folder
    Post
    PostId
    PostTitle
    PostRepository
    States/
      PostState
      PostDraftState
      PostPublishedState
      PostArchivedState
    Events/
      PostCreatedEvent
      PostPublishedEvent
    Refusals/
      PostIdentityRequired
      PostAlreadyPublished
  Shipping/                       one aggregate whose name differs from the module, with a domain union in a concept folder
    Shipments/
      Shipment
      ShipmentId
      ShipmentRepository
      Outcomes/
        ShipmentOutcome
        ShipmentDeliveredOutcome
        ShipmentReturnedOutcome
        ShipmentLostOutcome
      States/
        ShipmentState
        ShipmentPendingState
        ShipmentDispatchedState
        ShipmentDeliveredState
      Events/
        ShipmentOutcomeRecordedEvent
  Customers/                      more than one aggregate: one plural folder per aggregate
    CustomerAccounts/
      CustomerAccount
      CustomerAccountId
      CustomerAccountRepository
      States/
        CustomerAccountState
        CustomerAccountClaimedState
      Events/
        CustomerAccountRestrictedEvent
    Consents/
      Consent
      ConsentId
      ConsentRepository
      States/
        ConsentState
        ConsentGrantedState
      Events/
        ConsentGrantedEvent
```

Each aggregate's domain repository stays with the aggregate it loads. Application, Infrastructure, and WebApi use the same module and per-aggregate folder names, per `litespec/backend/architecture#organize-every-layer-by-module-and-use-case`. Each stack page states the file names and extensions that carry this layout.

### Use These Domain Names

**Default:** Name each Domain type from the aggregate root it belongs to, following the workspace naming provisions cited below.

**Replacement:** A project names its own Domain naming rules in its documentation.

**Rationale:** Aggregate-prefixed names keep each type readable at its call site without its namespace. Aggregate-owned names follow `litespec/workspace/naming#anchor-aggregate-owned-types-on-the-aggregate-root`. Architectural suffixes follow `litespec/workspace/naming#use-architectural-suffixes`. Refusal names follow `litespec/workspace/naming#name-exceptions-by-failed-rule`. A project names every state case in one form and keeps it.

**Example:** A post title reads as `PostTitle` at its call site, and a published post state as `PostPublishedState`. The stack page states the declaration form each name takes.

### Reuse the Shared Domain Contracts Across Modules

**Default:** Declare the shared Domain contracts once in Domain code and reuse them across every module.

**Replacement:** A project names its own shared-contract layout in its documentation.

**Rationale:** One declaration keeps the root, event, identity, and refusal mechanics identical in every module; a second declaration drifts from the first with the next fix.

**Example:** The shared contracts are the aggregate root, the domain event, the typed identity, and the refusal.

Event clearing is delivery mechanics, not a business mutation. Infrastructure calls it only after delivery accepts the pending events.

### Align ID Representations at Every Boundary

**Default:** Represent an identifier the same way in Domain, persistence, transport, and generated clients.

**Replacement:** A project names its own identifier-mapping rules in its documentation.

**Rationale:** One identifier takes a different form at each boundary, and each form is correct in its own place. Alignment means every form still reads as the same value, so a reader tracing one identifier follows it across boundaries without translation.

**Example:** Domain and Application hold the typed identifier; the [HTTP API](api.md) states the route, query, JSON, and contract forms, and [Persistence](persistence.md) states the stored form. Alignment means a reader recognizes one identifier in every form.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/domain#keep-domain-independent-of-outer-layers | guidance | Domain code references the language standard library and project-owned Domain types, with no outer-layer reference. |
| litespec/backend/domain#use-one-ubiquitous-language | guidance | Each Domain name matches a term in `glossary.json` beside the specification. |
| litespec/backend/domain#treat-aggregates-as-consistency-boundaries | guidance | Each aggregate root is the only public mutation entry point for the invariants its transaction protects. |
| litespec/backend/domain#take-identity-and-events-from-the-project-root-contract | guidance | Each aggregate root takes its identity and event mechanics from the one project-owned root contract. |
| litespec/backend/domain#model-every-aggregate-lifecycle-with-state-types | guidance | Each aggregate exposes one state property backed by one closed hierarchy of per-state types. |
| litespec/backend/domain#model-every-closed-set-of-domain-values-as-a-closed-type-hierarchy | guidance | Each closed set is one type hierarchy whose cases the type system enumerates, with label lookups by name. |
| litespec/backend/domain#create-valid-aggregates-through-named-factories | guidance | Each aggregate root creates instances through a factory named for its business action, checking identity and recording events. |
| litespec/backend/domain#express-transitions-through-business-methods | guidance | Each public mutation checks state and protects its invariants, and each lifecycle move also replaces state and records its transition event. |
| litespec/backend/domain#keep-child-entities-inside-the-aggregate-boundary | guidance | Child entities expose no mutable state outside their root, with collections as read-only views. |
| litespec/backend/domain#identify-aggregates-with-strongly-typed-version-7-values | guidance | Each aggregate identity is a dedicated type over one version 7 UUID, with no conversion, alias, or creation path around its validation. |
| litespec/backend/domain#use-immutable-value-objects-for-domain-concepts | guidance | Each value object is immutable, compares by complete value, and validates every value at creation. |
| litespec/backend/domain#define-collection-value-semantics-explicitly | guidance | Each collection value implements content equality with a matching hash under its declared ordering rule. |
| litespec/backend/domain#model-money-with-exact-decimal-values | guidance | Each monetary amount is an exact decimal in the shared `Money` value with the stated currency and JSON shape. |
| litespec/backend/domain#keep-binary-floating-point-out-of-exact-quantities | guidance | No Domain value uses binary floating point for money, a rate applied to money, or an exactly compared quantity. |
| litespec/backend/domain#use-stateless-domain-services-for-ownerless-rules | guidance | Each domain service is stateless over Domain values, with no persistence, messaging, logging, clock, authorization, or provider call. |
| litespec/backend/domain#expose-repositories-for-one-aggregate-only | guidance | Each domain repository serves one aggregate root with aggregate and Domain types only, and no composable query, session, or generic CRUD surface. |
| litespec/backend/domain#raise-immutable-facts-as-domain-events | guidance | Each domain event is immutable, named for its aggregate and fact, and carries business data only. |
| litespec/backend/domain#reject-business-violations-with-dedicated-refusals | guidance | Each rejected business rule ends its use case in a dedicated refusal carrying its stable code, with no transport status. |
| litespec/backend/domain#reference-other-aggregates-by-id | guidance | Each aggregate stores other aggregates as typed identifiers, with no object reference. |
| litespec/backend/domain#pass-nondeterministic-values-into-domain | guidance | Domain behavior receives time, randomness, and identifiers as arguments, reading no clock. |
| litespec/backend/domain#describe-every-public-domain-contract-in-documentation | guidance | Each public Domain type and member documents the business constraint, result, or refusal it represents. |
| litespec/backend/domain#organize-a-module-by-aggregate-and-concept | guidance | Each Domain module gives each aggregate its plural folder holding its states, events, refusals, and concepts. |
| litespec/backend/domain#use-these-domain-names | guidance | Each Domain name follows the cited workspace naming provisions, with one state-case form kept project-wide. |
| litespec/backend/domain#reuse-the-shared-domain-contracts-across-modules | guidance | Each shared Domain contract is declared once and reused across modules. |
| litespec/backend/domain#align-id-representations-at-every-boundary | guidance | Each identifier reads as one value in Domain, persistence, transport, and generated clients. |
