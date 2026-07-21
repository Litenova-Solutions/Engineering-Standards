# Model a Domain Module

Use this guide after discovery has established the business language and rules for a module. It converts those findings into a module specification, use-case specifications, aggregate boundaries, domain policies, and domain code.

In `domain module`, domain means the business area whose facts and rules the software represents. Module means one named responsibility boundary inside that area. For example, an event product may have Orders, Tickets, and Communications modules. These names describe business responsibilities, not .NET projects or deployable services.

This guide does not replace interviews, Event Storming, policy review, or another discovery method. An agent may expose a missing definition or conflicting rule. It must not invent the business answer.

## Required inputs

Start with:

- The product brief and affected end-to-end flow.
- The domain glossary.
- The module purpose and actors.
- Known domain policies, examples, and failure cases.
- Decisions that constrain identity, persistence, security, or external behavior.

An end-to-end flow connects use cases that produce one observable product outcome. For example, `buyer-completes-purchase` may cross Orders, Payments, and Tickets. It provides delivery context, while each module retains responsibility for its own rules.

If a command depends on an unknown policy, record it under `Open modeling questions` and stop that use case. Other use cases with complete rules may continue.

## Name the module language

Record each module term with one definition and rejected synonyms. Use the same term in documentation, domain types, application operations, API descriptions, and frontend features.

For the Orders module:

| Term | Definition | Rejected synonyms |
|:---|:---|:---|
| Order | One buyer commitment to one seller in one currency. | Cart, purchase record |
| Cancel | End an Order before fulfillment under the approved policy. | Delete, disable |
| Claim | Attach an authenticated buyer to an existing guest Order. | Adopt, transfer |

Rejected synonyms prevent later contributors from creating `PurchaseRecord` beside `Order`. They also tell an agent which plausible names are wrong for this domain.

## Draw aggregate boundaries from aggregate invariants

An aggregate is a consistency boundary. It groups state that must remain valid together in one command transaction. The aggregate root is the object through which callers request every change inside that boundary.

An invariant is a condition that must be true before and after every successful aggregate change. `An Order total equals the sum of its lines` is an invariant because no successful `Order` operation may leave those values inconsistent.

A module may contain no aggregate, one aggregate, or multiple related aggregates:

```text
Orders module
  Order aggregate
    root: Order
    owns: lines, totals, seller, currency, lifecycle
    references: BuyerId, PaymentId
    protects: INV-ORDERS-01, INV-ORDERS-02

  OrderClaim aggregate
    root: OrderClaim
    owns: guest claim lifecycle and claim evidence
    references: OrderId, BuyerId
    protects: INV-ORDERS-04
```

An aggregate owns a child when the child has no independent consistency boundary and changes only through the root. Reference another aggregate by typed ID when it can change independently.

Do not place `Buyer` inside `Order` for convenient navigation. Store `BuyerId` and use a read model for buyer presentation. Buyer and Order have separate consistency boundaries even if one page displays both.

Record the result in the module specification:

| Aggregate | Owns | Aggregate invariants | Commands |
|:---|:---|:---|:---|
| `Order` | Lines, totals, and lifecycle | `INV-ORDERS-01` | `orders.create-order`, `orders.cancel-order` |
| `OrderClaim` | Guest claim lifecycle | `INV-ORDERS-04` | `orders.claim-guest-order` |

## Define every aggregate state

Aggregate state is a business-valid condition with its required data and permitted behavior. A state object represents that condition as a type. It does more than label the aggregate.

Describe states before writing transitions:

| State | Meaning | Required facts |
|:---|:---|:---|
| `Draft` | The Post is editable and not public. | Author and content |
| `Published` | The Post is public. | Publication time |
| `Archived` | The Post is retained but removed from discovery. | Archive time and reason |

Create an abstract state record and sealed state records for every aggregate, including an aggregate with one current state:

```csharp
public abstract record PostState;

public sealed record DraftPostState : PostState;

public sealed record PublishedPostState(
    DateTimeOffset PublishedAt) : PostState;

public sealed record ArchivedPostState(
    DateTimeOffset ArchivedAt,
    ArchiveReason Reason) : PostState;
```

Put state-specific data on the state record. Do not duplicate `PublishedAt` or `ArchivedAt` on the aggregate. Do not add `PostStatus`, `IsPublished`, or a state string.

An enum can name a fixed list of labels, but it cannot require the data and behavior associated with each condition. Adding more lifecycle behavior later then forces replacement of the enum and every switch built around it. State types make that extension boundary explicit from the first version.

A one-state aggregate still defines the extension point:

```csharp
public abstract record ProfileState;

public sealed record ActiveProfileState : ProfileState;
```

For each state, answer:

- What business fact makes this state true?
- Which data is required only in this state?
- Which actions are allowed from this state?
- Which actions are rejected from this state, and why?

An unanswered question belongs in the module specification. It does not receive a guessed default.

## Write transition rules

A transition is a business action that replaces one valid state with another. Record its source state, target state, aggregate invariant IDs, event, and owning use case.

| From state | Business action | To state | Aggregate invariants | Event | Use case |
|:---|:---|:---|:---|:---|:---|
| `Draft` | `Publish` | `Published` | `INV-POSTS-01` | `PostPublished` | `posts.publish-post` |
| `Published` | `Archive` | `Archived` | `INV-POSTS-02` | `PostArchived` | `posts.archive-post` |

The aggregate root owns the transition:

```csharp
public void Publish(DateTimeOffset publishedAt)
{
    if (State is not DraftPostState)
    {
        throw new PostCannotBePublishedException(Id, State);
    }

    State = new PublishedPostState(publishedAt);
    RaiseDomainEvent(
        new PostPublished(Id, AuthorId, Title, publishedAt));
}
```

Document rejected source states in the use-case failure table and acceptance criteria. A transition with no owning use case cannot be delivered or tested.

## Give invariants and policies stable identities

An aggregate invariant uses `INV-{MODULE}-{NN}`:

| ID | Invariant | Protected by | Failure |
|:---|:---|:---|:---|
| `INV-POSTS-01` | Only a draft Post can be published. | `Post.Publish` | `PostCannotBePublishedException` |
| `INV-POSTS-02` | Only a published Post can be archived. | `Post.Archive` | `PostCannotBeArchivedException` |

A domain policy is a named business rule that does not belong to one aggregate transition. Domain identifies its business authority. Policy indicates that the rule guides or constrains decisions across a wider scope. A policy may apply within one module or coordinate multiple modules.

Use `POL-{POLICY}-{NN}` for a domain policy:

| ID | Policy | Applies to modules | Consistency | Enforcement |
|:---|:---|:---|:---|:---|
| `POL-BUYER-DATA-RETENTION-01` | Buyer deletion completes within 24 hours unless legal hold applies. | Accounts, Orders | Eventual within 24 hours | Buyer deletion workflow |

This retention rule is a domain policy because one aggregate cannot enforce deletion across Accounts and Orders in one transaction. `Only a draft Post can be published` remains an aggregate invariant because `Post.Publish` can enforce it immediately.

Do not renumber or reuse an approved rule ID. Link affected acceptance criteria.

## Select entities and value objects

Use a child entity when identity and continuity matter inside the aggregate. Use a value object when its complete value defines equality.

- `OrderLineId` identifies one line through quantity changes, so `OrderLine` is an entity.
- `PostTitle` is replaced as a complete value, so it is a value object.
- `Money` combines amount and currency and defines arithmetic rules, so it is a value object.
- `PostTags` defines collection equality and normalization, so it is a collection value object.

Give each aggregate a typed version 7 ID. Use typed IDs for identities that participate in domain behavior.

## Separate validation rules from aggregate invariants

A validation rule rejects caller-correctable input before a command handler starts domain work. An aggregate invariant protects business consistency regardless of which caller invokes the domain object.

For `PostTitle`:

- The validator returns stable errors for missing text or more than 200 characters.
- `PostTitle.Create` checks the same limits and throws a specific domain exception if another caller bypasses validation.
- `Post` accepts `PostTitle`, not the raw string.

Current aggregate state decides whether behavior is allowed. That check does not move into an application validator. For example, `title is required` is a validation rule, while `only a draft Post can be published` is an aggregate invariant.

## Identify domain services

Place a rule on the aggregate or value object that owns it. Use a stateless domain service only when no object is a natural owner.

```csharp
public sealed class OrderPricingDomainService
{
    public Money CalculateTotal(
        IReadOnlyList<OrderLine> lines,
        Currency currency)
    {
        return lines.Aggregate(
            Money.Zero(currency),
            (total, line) => total.Add(line.Subtotal));
    }
}
```

Application obtains required aggregates and external facts before calling the service.

## Record events and event reactions

An event is an immutable record of a completed fact. An event reaction is work triggered because that fact occurred. Event identifies the input fact. Reaction identifies the resulting action and does not imply that the work is secondary or optional.

| Event reference | Code type | Business meaning | Event reaction | Owning module | Delivery |
|:---|:---|:---|:---|:---|:---|
| `orders.order-confirmed` | `OrderConfirmed` | The paid Order is final. | Issue tickets. | Tickets | `durable` |
| `tickets.ticket-issued` | `TicketIssued` | An admission entitlement exists. | Send it to the buyer. | Communications | `durable` |
| `posts.post-published` | `PostPublished` | A Post became public. | Refresh the public catalog. | Posts | `rebuildable` |

A domain event remains an internal domain contract. Translate it to an integration event when another system consumes a versioned external message.

An event may have no event reaction. Do not create an event only because every method is expected to emit one.

## Separate atomic work from a durable workflow

One top-level command handler may coordinate multiple aggregates in one transaction when the use case names the rule requiring atomic consistency. It stages every changed aggregate and lets the command post-handler commit once.

Do not dispatch another command through `ICommandMediator` from that handler.

Create a workflow when the system advances work across a transaction or time boundary. Workflow means the durable sequence of steps and waiting points. Workflow orchestrator means the component that records progress and chooses the next command.

```text
PaymentConfirmed
  OrderFulfillmentWorkflow
    issue inventory.confirm-reservation
    await ReservationConfirmed
    issue tickets.issue-ticket
    await TicketIssued
    complete
```

Each issued command owns one transaction. The workflow orchestrator records progress and the outgoing command durably without mutating the participating aggregates.

## Map the model to use cases

Each command use-case specification names:

- Aggregates changed.
- Business methods called.
- Source and target states when applicable.
- `INV-*` and `POL-*` rule IDs.
- Domain events.
- Rejected behavior and observable failures.
- Acceptance criteria for allowed and rejected behavior.

Each query states `No domain transition` and names its read model. It does not load an aggregate for presentation.

## Use a matching folder shape

```text
apps/api/src/Shop.Domain/
  Orders/
    Order.cs
    OrderId.cs
    OrderState.cs
    PendingOrderState.cs
    ConfirmedOrderState.cs
    CancelledOrderState.cs
    OrderClaim.cs
    OrderClaimId.cs
    OrderClaimState.cs
    UnclaimedOrderClaimState.cs
    ClaimedOrderClaimState.cs
    IOrderRepository.cs
    IOrderClaimRepository.cs
    Events/
      OrderConfirmed.cs
    Exceptions/
      OrderCannotBeCancelledException.cs

apps/api/src/Shop.Application/
  Orders/
    CancelOrder/
      CancelOrderCommand.cs
      CancelOrderCommandResult.cs
      CancelOrderCommandValidator.cs
      CancelOrderCommandHandler.cs
  Workflows/
    OrderFulfillment/
      OrderFulfillmentWorkflow.cs
      OrderFulfillmentWorkflowOrchestrator.cs
```

The Orders folder represents the Orders module in every layer. It is not a runtime `Module` object and does not require `IModule`, `ModuleRoot`, or another technical wrapper.

Create subfolders only when real types require them.

## Completion check

- The module uses one term for each concept and records rejected synonyms.
- Every aggregate boundary names owned children, referenced aggregate IDs, and protected `INV-*` invariants.
- Every aggregate has one abstract state base and at least one sealed state record.
- Every transition maps to an aggregate method and command use case.
- Every `INV-*` and `POL-*` rule has acceptance coverage.
- Value objects define validation and equality.
- Domain services are stateless and have no outer-layer dependency.
- Events contain stable business facts and no aggregate references.
- Event reactions state their owner and delivery classification.
- Multi-aggregate commands name the rule requiring one transaction.
- Durable workflows name progress state, commands, events, retries, and recovery.
- Persistence tests round-trip every concrete aggregate state record.
