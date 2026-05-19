# Caching

This document defines the backend caching strategy. Caching is an optimization, not a source of truth. Correctness comes first.

---

## 1. Default Rule

Do not cache until there is a measured reason. Add caching only when one of these is true:

- A query is on a hot path and appears in production traces or load tests.
- An external service has rate limits or high latency.
- A read model is expensive to compute and changes infrequently.
- The response is public or scoped safely to a single user or tenant.

Every cache MUST have an explicit owner, key format, expiration policy, and invalidation trigger.

---

## 2. Cache Types

| Cache | Use For | Do Not Use For |
|:---|:---|:---|
| `IMemoryCache` | Single-instance development, per-process short-lived data | Multi-instance correctness |
| Distributed cache | Multi-instance API data, session-adjacent metadata | Business source of truth |
| ASP.NET Core output cache | Public or safely varied HTTP responses | Auth-sensitive responses without vary rules |
| Next.js cache | Frontend server-rendered reads | Backend authorization decisions |

Redis or another distributed cache requires a project ADR because it adds infrastructure and operational ownership.

---

## 3. Cache Key Format

Cache keys MUST include the bounded context, resource, identifier, version, and scope.

```csharp
// GOOD: explicit key includes scope and version
var key = $"ticketing:tickets:{tenantId.Value}:summary:{ticketId.Value}:v1";
```

```csharp
// BAD: ambiguous key can collide across tenants and response shapes
var key = $"ticket:{ticketId}";
```

Do not include raw PII in cache keys. Hash sensitive values if they must participate in lookup.

---

## 4. Query Handler Caching

Query handlers may cache projection results when the query is expensive and the invalidation rule is clear. Cache DTOs, not domain aggregates.

```csharp
// GOOD: cache read projection with explicit key and expiration
public async Task<TicketSummaryResult> HandleAsync(
    GetTicketSummaryQuery query,
    CancellationToken cancellationToken)
{
    var key = CacheKeys.TicketSummary(query.TenantId, query.TicketId);

    return await _cache.GetOrCreateAsync(
        key,
        async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);

            return await _db.Tickets
                .Where(t => t.Id == query.TicketId)
                .Select(t => new TicketSummaryResult
                {
                    Id = t.Id,
                    Title = t.Title.Value,
                    Status = t.Status.Name
                })
                .SingleAsync(cancellationToken);
        }) ?? throw new TicketNotFoundException(query.TicketId);
}
```

```csharp
// BAD: caching aggregate instances leaks tracked domain state
var ticket = await _cache.GetOrCreateAsync(key, _ => _repository.GetByIdAsync(id, cancellationToken));
```

---

## 5. Invalidation

Every cache entry MUST have at least one of these invalidation paths:

- Short absolute expiration for data that tolerates staleness.
- Explicit eviction after a command succeeds.
- Tag-based invalidation at the frontend cache layer.
- Outbox-backed invalidation when multiple services consume the same event.

Command handlers do not call cache APIs directly unless the cache interface is part of the write-side contract and the invalidation is part of the use case. Prefer invalidation in Infrastructure after `SaveChangesAsync` succeeds.

---

## 6. Output Caching

Output caching is allowed only when responses are safe to replay for the chosen vary dimensions.

```csharp
// GOOD: public endpoint varies by query parameters
app.MapGet("/status", HandleAsync)
    .CacheOutput(policy => policy
        .Expire(TimeSpan.FromSeconds(30))
        .SetVaryByQuery("region"));
```

```csharp
// BAD: authenticated endpoint cached without user or tenant variation
app.MapGet("/me", HandleAsync)
    .CacheOutput();
```

Do not output-cache endpoints returning user-specific, tenant-specific, or permission-filtered data unless the policy varies by that exact scope.

---

## 7. Cache Metrics

Production caches MUST emit:

- Hit count.
- Miss count.
- Eviction count.
- Lookup duration.
- Backend fallback duration.

High-cardinality labels are forbidden. Do not tag metrics with raw cache keys, user IDs, email addresses, or free-form search text.

