# Aggregate Inventory

> Copy this file into `docs/domain/aggregate-inventory.md` in your project repository and fill it in. Update it whenever an aggregate is added, its states change, or new domain events are introduced.

---

This file gives engineers and agents a single place to find all aggregates, their state machines, and their domain events. Before generating a command handler or a repository implementation, check this file to confirm the aggregate's current states and which events it raises.

---

## Aggregates

| Aggregate | ID Type | States | Domain Events | Repository Interface |
|:---|:---|:---|:---|:---|
| `Post` | `PostId` | `DraftPostState`, `PublishedPostState`, `ArchivedPostState` | `PostCreated`, `PostPublished`, `PostArchived` | `IPostRepository` |
| `Author` | `AuthorId` | `ActiveAuthorState`, `SuspendedAuthorState` | `AuthorRegistered`, `AuthorSuspended` | `IAuthorRepository` |
| `Order` | `OrderId` | `PendingOrderState`, `PlacedOrderState`, `CancelledOrderState` | `OrderPlaced`, `OrderCancelled` | `IOrderRepository` |

---

## Value Objects

| Value Object | Used By |
|:---|:---|
| `PostTitle` | `Post` |
| `PostContent` | `Post` |
| `PostTag` | `Post` |
| `Money` | `Order`, `OrderLine` |
| `EmailAddress` | `Author` |

---

## Domain Shared Types

| Type | Purpose |
|:---|:---|
| `AggregateRoot<TId>` | Base class for all aggregate roots. Provides domain event collection. Defined in `Domain/Shared/AggregateRoot.cs`. |
| `IDomainEvent` | Marker interface for all domain events. Defined in `Domain/Shared/IDomainEvent.cs`. |
| `DomainException` | Abstract base class for all domain invariant violation exceptions. |
| `AggregateNotFoundException` | Abstract base class for all not-found exceptions. |
