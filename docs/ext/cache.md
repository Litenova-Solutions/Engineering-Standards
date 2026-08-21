# Caching

## Intent

Caching trades freshness and invalidation work for lower latency or source load. This extension requires measurement, a named staleness contract, and a recovery path.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`.

The consumer enables `cache` after traces or load tests identify a repeated expensive read and the use case can state acceptable staleness. Future traffic alone does not activate it.

## Baseline relationship

The extension selects no cache provider and replaces no baseline rule. A provider package needs a project decision and manifest pin.

## Agent Summary {#agent-summary}

- Record measurement before adding a cache. (EXT.CACHE.ADOPT.001)
- Remove caches that measurements no longer justify. (EXT.CACHE.ADOPT.002)
- Partition and version each cache key. (EXT.CACHE.KEY.001)
- Define expiry and invalidation before caching. (EXT.CACHE.INVALIDATE.001)
- Keep source data authoritative during failure. (EXT.CACHE.FAILURE.001, EXT.CACHE.FAILURE.002)
- Bound concurrent refresh work. (EXT.CACHE.REFRESH.001, EXT.CACHE.REFRESH.002)

## Standards

### Record measured cache need (EXT.CACHE.ADOPT.001)

**Requirement:** A cache proposal MUST record its observed query, representative load, latency, source cost, target, and accepted staleness.

**Rationale:** The record makes the cache's freshness and operating-cost trade-off reviewable.

### Remove unjustified caches (EXT.CACHE.ADOPT.002)

**Requirement:** A cache owner MUST remove a cache when measurements no longer justify its operating cost.

**Rationale:** A cache creates invalidation, capacity, and recovery work that needs continuing value.

### Compose cache keys from result inputs (EXT.CACHE.KEY.001)

**Requirement:** A cache key MUST include its data-shape version, every result-affecting input, and applicable tenant or actor partition.

**Rationale:** The key separates results that have different shapes, callers, or input values.

**Example:** `post-summary:v2:tenant-42:post-17` identifies a versioned, tenant-scoped result.

### Exclude unsafe cache key material (EXT.CACHE.KEY.002)

**Requirement:** A cache key MUST NOT contain a secret or unbounded raw input.

**Rationale:** Keys can appear in diagnostics, metrics, and provider administration tools.

### Define cache invalidation (EXT.CACHE.INVALIDATE.001)

**Requirement:** A cached value MUST define expiry, invalidating write events, an invalidation owner, and behavior after invalidation failure.

**Rationale:** An explicit contract makes stale data behavior visible before implementation.

### Prefer bounded staleness (EXT.CACHE.INVALIDATE.002)

**Requirement:** A cache owner SHOULD use a short expiry when precise invalidation costs more than recomputation.

**Deviation:** A measured staleness and operating-cost decision permits a longer expiry.

**Rationale:** Short expiry limits stale data when invalidation precision is not economical.

### Keep source data authoritative (EXT.CACHE.FAILURE.001)

**Requirement:** A cache implementation MUST keep required business data authoritative in its source of record.

**Rationale:** A cache stores a derived copy rather than the sole required business record.

### Define cache outage behavior (EXT.CACHE.FAILURE.002)

**Requirement:** A cache outage MUST use the source when capacity permits or return a documented degraded response.

**Rationale:** Callers need predictable behavior when cache infrastructure is unavailable.

### Bound cache refresh work (EXT.CACHE.REFRESH.001)

**Requirement:** A cache implementation MUST bound simultaneous refresh work when concurrent misses could overload its source.

**Rationale:** Bounded concurrency, request coalescing, and jittered expiry are valid techniques.

**Example:** One request refreshes a key while concurrent callers await the same bounded work.

### Avoid unbounded key locks (EXT.CACHE.REFRESH.002)

**Requirement:** A cache implementation MUST NOT create an unbounded per-key lock inventory.

**Rationale:** Unbounded lock state can exhaust memory under untrusted or high-cardinality keys.

## Conventions

### Place cache access at an outer boundary (EXT.CACHE.CONVENTION.001)

**Default:** Place cache access in Infrastructure or a frontend data boundary.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Application owns any external cache port required by a use case. Domain code has no cache dependency.

## Dependencies

No provider package is selected by this extension.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.CACHE.ADOPT.001 | inspection | The owning use-case specification records the query, load, latency, cost, target, and staleness. |
| EXT.CACHE.ADOPT.002 | inspection | Cache review records a removal decision when current measurements no longer justify operating cost. |
| EXT.CACHE.KEY.001 | test | `CacheKeyTests` distinguish version, result inputs, and tenant or actor partitions. |
| EXT.CACHE.KEY.002 | static, inspection | `CacheKeyTests` asserts key construction excludes secrets and unbounded raw request values. |
| EXT.CACHE.INVALIDATE.001 | test | `CacheInvalidateTests` cover expiry, invalidation event, failed invalidation, and owner behavior. |
| EXT.CACHE.INVALIDATE.002 | inspection | The cache decision records expiry length and measured invalidation cost. |
| EXT.CACHE.FAILURE.001 | inspection | Source and cache design review identifies the authoritative business record. |
| EXT.CACHE.FAILURE.002 | test | `CacheFailureTests` prove source fallback or the documented degraded response. |
| EXT.CACHE.REFRESH.001 | test | `CacheRefreshTests` show bounded refresh work and source protection. |
| EXT.CACHE.REFRESH.002 | test | `CacheRefreshTests` show lock state remains bounded. |
| EXT.CACHE.CONVENTION.001 | inspection | Source review locates cache access outside Domain and records any local replacement. |
