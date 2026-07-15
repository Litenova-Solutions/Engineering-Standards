---
{
  "id": "recipe.caching",
  "kind": "recipe",
  "normative": true,
  "appliesTo": ["backend.application", "frontend.app", "delivery"],
  "recipes": ["caching"]
}
---
# Caching

## RECIPE.CACHE.ADOPT.001 - Require measured need

Enable caching after traces or load tests identify a repeated expensive read. Record acceptable staleness and the invalidation owner.

## RECIPE.CACHE.KEY.001 - Version cache keys

Include the data shape version and every input that changes the result. Do not include secrets or unbounded user input in keys.

## RECIPE.CACHE.INVALIDATE.001 - Define invalidation before implementation

Each cached value declares expiry, write events that invalidate it, and behavior when invalidation fails. Prefer short expiry when precise invalidation costs more than recomputation.

## RECIPE.CACHE.FAILURE.001 - Keep cache failure non-destructive

A cache outage falls back to the source when load permits. Do not use cache as the only copy of required business data.

## RECIPE.CACHE.GATES.001 - Prove correctness under staleness

Test hits, misses, expiry, invalidation, concurrent refresh, and source fallback. Compare measured latency and source load with the adoption evidence.

