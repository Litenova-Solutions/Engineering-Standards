# Model a Domain Subject

Use this guide after the business language and rules for a Subject are known. It converts those findings into a Subject specification, Use-case specifications, Aggregate boundaries, and Domain code.

This guide does not replace interviews, Event Storming, policy review, or another discovery method. An agent may expose a missing definition or conflicting rule. It must not invent the business answer.

## Required inputs

Start with:

- The product brief and affected Business Flow.
- The domain glossary.
- The Subject purpose and actors.
- Known Business Policies, examples, and failure cases.
- Decisions that constrain identity, persistence, security, or external behavior.

If a Command depends on an unknown policy, record it under `Open modeling questions` and stop that Use case. Other Use cases with complete rules may continue.

## Name the Subject language

Record each Subject term with one definition and rejected synonyms. Use the same term in documentation, Domain types, Application operations, API descriptions, and frontend features.

For the Orders Subject:

| Term | Definition | Rejected synonyms |
|:---|:---|:---|
| Order | One buyer commitment to one seller in one currency. | Cart, purchase record |
| Cancel | End an Order before fulfillment under the accepted policy. | Delete, disable |
| Claim | Attach an authenticated buyer to an existing guest Order. | Adopt, transfer |

Rejected synonyms prevent later contributors from creating `PurchaseRecordStatus` beside `OrderState`.

## Draw Aggregate boundaries from Aggregate Rules

Group state that must remain consistent in one Command transaction. A Subject may contain no Aggregate, one Aggregate, or multiple related Aggregates.

```text
Orders Subject
  Order Aggregate
    owns: lines, totals, seller, currency, lifecycle
    references: BuyerId, PaymentId
    protects: INV-ORDERS-01, INV-ORDERS-02

  OrderClaim Aggregate
    owns: guest claim lifecycle and claim evidence
    references: OrderId, BuyerId
    protects: INV-ORDERS-04
```

An Aggregate owns a child when the child has no independent consistency boundary and changes only through the root. Reference another Aggregate by typed ID when it can change independently.

Do not place `Buyer` inside `Order` for convenient navigation. Store `BuyerId` and use a Read Model for buyer presentation.

Record the result in the Subject specification:

| Aggregate | Owns | Aggregate Rules | Commands |
|:---|:---|:---|:---|
| `Order` | Lines, totals, and lifecycle | `INV-ORDERS-01` | `orders.create-order`, `orders.cancel-order` |
| `OrderClaim` | Guest claim lifecycle | `INV-ORDERS-04` | `orders.claim-guest-order` |

## Define every Aggregate state

Describe business states before writing Aggregate transitions:

| State | Meaning | Required facts |
|:---|:---|:---|
| `Draft` | The Post is editable and not public. | Author and content |
| `Published` | The Post is public. | Publication time |
| `Archived` | The Post is retained but removed from discovery. | Archive time and reason |

Create an abstract state record and sealed state records for every Aggregate, including an Aggregate with one current state:

```csharp
public abstract record PostState;

public sealed record DraftPostState : PostState;

public sealed record PublishedPostState(
    DateTimeOffset PublishedAt) : PostState;

public sealed record ArchivedPostState(
    DateTimeOffset ArchivedAt,
    ArchiveReason Reason) : PostState;
```

Put state-specific data on the state record. Do not duplicate `PublishedAt` or `ArchivedAt` on the Aggregate. Do not add `PostStatus`, `IsPublished`, or a state string.

A one-state Aggregate still defines the extension point:

```csharp
public abstract record ProfileState;

public sealed record ActiveProfileState : ProfileState;
```

For each state, answer:

- What business fact makes this state true?
- Which data is required only in this state?
- Which actions are allowed from this state?
- Which actions are rejected from this state, and why?

An unanswered question belongs in the Subject specification. It does not receive a guessed default.

## Write transition rules

Record each business action with its source state, target state, Aggregate Rule IDs, Event, and owning Use case.

| From state | Business action | To state | Aggregate Rules | Event | Use case |
|:---|:---|:---|:---|:---|:---|
| `Draft` | `Publish` | `Published` | `INV-POSTS-01` | `PostPublished` | `posts.publish-post` |
| `Published` | `Archive` | `Archived` | `INV-POSTS-02` | `PostArchived` | `posts.archive-post` |

The Aggregate root owns the transition:

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

Document rejected source states in the Use-case failure table and acceptance criteria. A transition with no owning Use case cannot be delivered or tested.

## Give rules stable identities

An Aggregate Rule uses `INV-{SUBJECT}-{NN}`:

| ID | Rule | Protected by | Failure |
|:---|:---|:---|:---|
| `INV-POSTS-01` | Only a draft Post can be published. | `Post.Publish` | `PostCannotBePublishedException` |
| `INV-POSTS-02` | Only a published Post can be archived. | `Post.Archive` | `PostCannotBeArchivedException` |

A Business Policy shared across Subjects belongs in one Shared Rule and uses `POL-{SHARED-RULE}-{NN}`:

| ID | Policy | Consistency | Enforcement |
|:---|:---|:---|:---|
| `POL-BUYER-DATA-RETENTION-01` | Buyer deletion completes within 24 hours unless legal hold applies. | Eventual within 24 hours | Buyer deletion Workflow |

Do not renumber or reuse an accepted rule ID. Link affected acceptance criteria.

## Select entities and Value Objects

Use a child entity when identity and continuity matter inside the Aggregate. Use a Value Object when complete value defines equality.

- `OrderLineId` identifies one line through quantity changes, so `OrderLine` is an entity.
- `PostTitle` is replaced as a complete value, so it is a Value Object.
- `Money` combines amount and currency and defines arithmetic rules, so it is a Value Object.
- `PostTags` defines collection equality and normalization, so it is a collection Value Object.

Give each Aggregate a typed version 7 ID. Use typed IDs for identities that participate in Domain behavior.

## Separate Input Rules from Aggregate Rules

Application validation handles caller-correctable structure before the Command handler. Domain objects repeat their own construction rules so invalid values cannot enter through a test, background process, or future host.

For `PostTitle`:

- The validator returns stable errors for missing text or more than 200 characters.
- `PostTitle.Create` checks the same limits and throws a specific Domain exception if another caller bypasses validation.
- `Post` accepts `PostTitle`, not the raw string.

Current Aggregate state decides whether behavior is allowed. That check does not move into an Application validator.

## Identify Domain services

Place a rule on the Aggregate or Value Object that owns it. Use a stateless Domain service only when no object is a natural owner.

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

Application obtains required Aggregates and external facts before calling the service.

## Record Events and Follow-ups

Name each Event as a completed fact. Include immutable values required to understand that fact without carrying the Aggregate.

| Event reference | Code type | Business meaning | Follow-up | Owner | Delivery |
|:---|:---|:---|:---|:---|:---|
| `orders.order-confirmed` | `OrderConfirmed` | The paid Order is final. | Issue tickets. | Tickets | `durable` |
| `tickets.ticket-issued` | `TicketIssued` | An admission entitlement exists. | Send it to the buyer. | Communications | `durable` |
| `posts.post-published` | `PostPublished` | A Post became public. | Refresh the public catalog. | Posts | `rebuildable` |

A Domain Event remains an internal Domain contract. Translate it to an Integration Event when another system consumes a versioned external message.

An Event may have no Follow-up. Do not create an Event only because every method is expected to emit one.

## Separate atomic work from a durable Workflow

One top-level Command handler may coordinate multiple Aggregates in one transaction when the Use case names the rule requiring atomic consistency. It stages every changed Aggregate and lets the command post-handler commit once.

Do not dispatch another Command through `ICommandMediator` from that handler.

Create a Workflow when the system advances work across a transaction or time boundary:

```text
PaymentConfirmed
  OrderFulfillmentWorkflow
    issue inventory.confirm-reservation
    await ReservationConfirmed
    issue tickets.issue-ticket
    await TicketIssued
    complete
```

Each issued Command owns one transaction. The Workflow Orchestrator records progress and the outgoing Command durably without mutating the participating Aggregates.

## Map the model to Use cases

Each Command Use-case specification names:

- Aggregates changed.
- Business methods called.
- Source and target states when applicable.
- `INV-*` and `POL-*` rule IDs.
- Domain Events.
- Rejected behavior and observable failures.
- Acceptance criteria for allowed and rejected behavior.

Each Query states `No Domain transition` and names its Read Model. It does not load an Aggregate for presentation.

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

Create subfolders only when real types require them.

## Completion check

- The Subject uses one term for each concept and records rejected synonyms.
- Every Aggregate boundary names owned children, referenced Aggregate IDs, and protected `INV-*` rules.
- Every Aggregate has one abstract state base and at least one sealed state record.
- Every transition maps to an Aggregate method and Command Use case.
- Every `INV-*` and `POL-*` rule has acceptance coverage.
- Value Objects define validation and equality.
- Domain services are stateless and have no outer-layer dependency.
- Events contain stable business facts and no Aggregate references.
- Follow-ups state owner and delivery classification.
- Multi-Aggregate Commands name the rule requiring one transaction.
- Durable Workflows name progress state, Commands, Events, retries, and recovery.
- Persistence tests round-trip every concrete Aggregate state record.
