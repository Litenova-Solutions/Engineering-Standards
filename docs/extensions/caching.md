# Caching

## Intent

Caching trades freshness and invalidation work for lower latency or source load. This extension requires measurement, a named staleness contract, and a recovery path before a cache enters the application.

## Activation

Enable `caching` after traces or load tests identify a repeated expensive read and the use case can state acceptable staleness. A possible future traffic increase does not activate it.

The extension does not select a cache provider or replace a baseline rule. A provider package requires a project decision and manifest pin.

## Agent Summary {#agent-summary}

- Record baseline latency, request rate, source cost, and allowed staleness.
- Define key inputs, expiry, invalidation events, and ownership before implementation.
- Treat the source of record as authoritative.
- Fall back safely when the cache is unavailable and source capacity permits.
- Test hit, miss, expiry, invalidation, concurrent refresh, and failure.

## Standards

### Require measured need (EXT.CACHE.ADOPT.001)

Record the observed query, representative load, latency, source cost, target, and accepted staleness. Remove the cache when the measurement no longer justifies its operating cost.

### Version cache keys (EXT.CACHE.KEY.001)

Include a data-shape version, tenant or actor partition when applicable, and every input that changes the result. Do not place secrets or unbounded raw input in a key.

### Define invalidation first (EXT.CACHE.INVALIDATE.001)

Each cached value names its expiry, write events that invalidate it, invalidation owner, and behavior after invalidation failure. Prefer short expiry when precise invalidation costs more than recomputation.

### Keep cache failure non-destructive (EXT.CACHE.FAILURE.001)

A cache is not the only copy of required business data. A cache outage falls back to the source when capacity allows or returns the documented degraded response.

### Prevent refresh storms (EXT.CACHE.REFRESH.001)

Use bounded concurrency, request coalescing, or jittered expiry when simultaneous misses could overload the source. Do not create an unbounded per-key lock inventory.

## Conventions

Keep cache access in Infrastructure or a frontend data boundary. Application owns any capability port required by a use case. Domain does not know that caching exists.

## Dependencies

No provider package is selected by this extension.

## Verification

- Test hit, miss, expiry, invalidation, concurrent refresh, provider outage, and source fallback.
- Compare latency and source load with the activation measurement.
- Verify actor and tenant partitions cannot leak data.
- Verify sensitive data does not appear in keys or diagnostics.
