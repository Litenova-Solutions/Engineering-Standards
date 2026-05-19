# Read Store Inventory

> Copy this file into `docs/domain/read-store-inventory.md` in your project repository and fill it in. Update it whenever a new read store interface or projection type is added.

---

This file gives engineers and agents a map of the read side so they know which read store to inject for a given query and what projection types are available. Before writing a query handler, check this file to confirm the correct interface name and the result types it returns.

> **Note:** `IXxxReadStore` interfaces are defined in `Application.Read.Contracts`. Never define them in `Application.Read` or in Infrastructure.

---

## Read Stores

| Interface | Location (Contracts project path) | Implementation (Infrastructure path) | Result Types |
|:---|:---|:---|:---|
| `IPostReadStore` | `Application.Read.Contracts/Posts/IPostReadStore.cs` | `Infrastructure/Persistence/ReadStores/PostReadStore.cs` | `PostResult`, `PostSummary` |
| `IAuthorReadStore` | `Application.Read.Contracts/Authors/IAuthorReadStore.cs` | `Infrastructure/Persistence/ReadStores/AuthorReadStore.cs` | `AuthorResult`, `AuthorSummary` |
| `IOrderReadStore` | `Application.Read.Contracts/Orders/IOrderReadStore.cs` | `Infrastructure/Persistence/ReadStores/OrderReadStore.cs` | `OrderResult`, `OrderSummary`, `OrderLineResult` |
