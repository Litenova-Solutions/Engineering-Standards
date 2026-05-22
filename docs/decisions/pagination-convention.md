# Offset Pagination with PagedResult<T> as the Standard for HTTP List Endpoints

**Status:** Accepted

**Date:** 2026-01-01

## Context

List endpoints require pagination to avoid returning unbounded result sets. Several pagination strategies were evaluated:

1. Offset pagination (`page`, `pageSize`). Simple, well-understood, supports jumping to any page. Suffers from page drift when records are added or deleted between requests.
2. Cursor pagination (`cursor`, `pageSize`). No page drift, works well for infinite scroll. Cannot jump to arbitrary pages. More complex to implement.
3. `IAsyncEnumerable<T>` streaming. Streams rows from the database as the consumer iterates. Genuinely useful for background processing and data export. Not appropriate for HTTP endpoints because the frontend client buffers the entire HTTP response before processing it, eliminating the streaming benefit at the HTTP boundary.

Offset pagination with an envelope response shape was chosen as the standard for HTTP endpoints. The envelope (`PagedResult<T>`) carries items, total count, page number, page size, and derived properties (`HasNextPage`, `HasPreviousPage`, `TotalPages`). This shape works cleanly with OpenAPI documentation and TypeScript client generation.

`IAsyncEnumerable<T>` via LiteBus's `IStreamQuery<T>` and `IStreamQueryHandler<T>` is reserved for background processing and data export scenarios where the consumer processes items incrementally and the HTTP boundary is not involved.

Cursor pagination is the documented escalation path for high-traffic list endpoints where page drift causes observable problems. It requires a project-level ADR when adopted.

## Decision

All HTTP list endpoints use offset pagination with `PagedResult<T>` and `PaginationParameters` defined in `Application.Read.Contracts/Shared/`. `IAsyncEnumerable<T>` is used only for `IStreamQuery<T>` handlers in background processing and export scenarios.

## Consequences

### Positive

- Consistent pagination shape across all list endpoints.
- `PagedResult<T>` maps cleanly to OpenAPI and TypeScript client types.
- `PaginationParameters` enforces a maximum page size, preventing unbounded queries.

### Negative

- Offset pagination has page drift for high-write endpoints. Acceptable for most use cases.
- Two database round trips per paginated query: one for the count, one for the items.

### Risks

- The `TotalCount` query can be expensive on large tables. Document the `SkipTotalCount` option on `PaginationParameters` for infinite scroll endpoints where total count is not needed.