<!-- Last updated: (fill in date when first created in a project) -->
<!-- Required sections: IDatabaseContext Properties, Query Handlers, Denormalized Read Models -->
# Read Model Inventory

> Copy this file into `docs/domain/read-model-inventory.md` in your project repository and fill it in. Update it whenever a new query handler, `IDatabaseContext` property, or denormalized read model is added.

---

This file gives engineers and agents a map of the read side. Query handlers inject `IDatabaseContext` and write LINQ projections directly. There are no per-aggregate `IXxxReadStore` interfaces.

---

## IDatabaseContext Properties

| Aggregate | Property | Location | Notes |
|:---|:---|:---|:---|
| Post | `IQueryable<Post> Posts` | `Application.Read.Contracts/Shared/IDatabaseContext.cs` | Used by post detail and list queries |
| Author | `IQueryable<Author> Authors` | `Application.Read.Contracts/Shared/IDatabaseContext.cs` | Used by author summary projections |
| Order | `IQueryable<Order> Orders` | `Application.Read.Contracts/Shared/IDatabaseContext.cs` | Used by order history queries |

---

## Query Handlers

| Query | Handler | Result Type | Reads |
|:---|:---|:---|:---|
| `GetPostByIdQuery` | `GetPostByIdQueryHandler` | `PostResult` | `Posts`, `Authors` |
| `GetAllPostsQuery` | `GetAllPostsQueryHandler` | `PagedResult<PostSummary>` | `Posts` |
| `GetOrderHistoryQuery` | `GetOrderHistoryQueryHandler` | `PagedResult<OrderSummary>` | `Orders` |

---

## Denormalized Read Models

Denormalized read model tables are not the default. Fill in this section only when a project ADR approves them.

| Read Model | Owner | Update Mechanism | Reconciliation Job | ADR |
|:---|:---|:---|:---|:---|
| _(example) TicketDashboardRow_ | Infrastructure | Outbox projector | `RebuildTicketDashboardJob` | `docs/decisions/0008-ticket-dashboard-read-model.md` |
