# Caching

## Intent

Caching trades freshness and invalidation work for lower latency or source load. This extension requires measurement, a named staleness contract, and a recovery path.

## Activation

Activation scope: `local`.

Applicable record types: `use-case`.

The consumer enables `cache` after traces or load tests identify a repeated expensive read and the use case can state acceptable staleness. Future traffic alone does not activate it.

## Replaces

This extension replaces no baseline provision. A provider package needs a project decision and manifest pin.

## Switches on

This extension switches on `limit`. The accepted staleness and the expiry of each cache are Limit records.

## Agent Summary {#agent-summary}

- Record measurement before adding a cache. (standards/rule/ext-cache.record-measured-cache-need)
- Remove caches that measurements no longer justify. (standards/rule/ext-cache.remove-unjustified-caches)
- Partition and version each cache key. (standards/rule/ext-cache.compose-cache-keys-from-result-inputs)
- Define expiry and invalidation before caching. (standards/rule/ext-cache.define-cache-invalidation)
- Keep source data authoritative during failure. (standards/rule/ext-cache.keep-source-data-authoritative, standards/rule/ext-cache.define-cache-outage-behavior)
- Bound concurrent refresh work. (standards/rule/ext-cache.bound-cache-refresh-work, standards/rule/ext-cache.avoid-unbounded-key-locks)

## Standards

### Record measured cache need (standards/rule/ext-cache.record-measured-cache-need)

**Requirement:** A cache proposal MUST record its observed query, representative load, latency, source cost, target, and accepted staleness. The accepted staleness is a Limit record. The proposal records its owner, status, decider, and decide-by.

**Rationale:** The record makes the cache's freshness and operating-cost trade-off reviewable.

### Remove unjustified caches (standards/rule/ext-cache.remove-unjustified-caches)

**Requirement:** A cache owner MUST remove a cache when measurements no longer justify its operating cost.

**Rationale:** A cache creates invalidation, capacity, and recovery work that needs continuing value.

### Compose cache keys from result inputs (standards/rule/ext-cache.compose-cache-keys-from-result-inputs)

**Requirement:** A cache key MUST include its data-shape version, every result-affecting input, and applicable tenant or actor partition.

**Rationale:** The key separates results that have different shapes, callers, or input values.

**Example:** `post-summary:v2:tenant-42:post-17` identifies a versioned, tenant-scoped result.

### Exclude unsafe cache key material (standards/rule/ext-cache.exclude-unsafe-cache-key-material)

**Requirement:** A cache key MUST NOT contain a secret, unbounded raw input, or personal data that is not already a hash.

**Rationale:** Keys appear in diagnostics, metrics, and provider administration tools, which is a copy of the value in a store nobody classified. An email address in a key is a personal-data record in the cache provider's key space. It sits outside every retention and erasure path the project defined. [Data minimisation](https://gdpr-info.eu/art-5-gdpr/) applies to an identifier as much as to a field.

**Example:** A per-account cache key carries the account's opaque identifier. A key that carried the address instead is replaced by a hash of it, and the entry is bound to the account that owns it.

### Define cache invalidation (standards/rule/ext-cache.define-cache-invalidation)

**Requirement:** A cached value MUST define expiry, invalidating write events, an invalidation owner, and behavior after invalidation failure. The expiry is a Limit record.

**Rationale:** An explicit contract makes stale data behavior visible before implementation.

### Record a manual cache invalidation (standards/rule/ext-cache.record-a-manual-cache-invalidation)

**Requirement:** An invalidation an operator triggers by hand MUST produce a record naming the actor, the scope cleared, and the reason. When the audit extension is selected, the record is an audit record, and the audit adoption decision states its category.

**Rationale:** A manual clear changes what every later reader sees and leaves no trace in the data itself. Investigating a stale-read report afterwards means knowing whether somebody already cleared the entry. [Article 30 of the GDPR](https://gdpr-info.eu/art-30-gdpr/) treats an administrative action over personal data as processing that has a record.

**Example:** A command that clears one tenant's cached price list records the tenant, the operator, and the incident it was run for.

### Prefer bounded staleness (standards/rule/ext-cache.prefer-bounded-staleness)

**Requirement:** A cache owner SHOULD use a short expiry when precise invalidation costs more than recomputation.

**Deviation:** A measured staleness and operating-cost decision permits a longer expiry.

**Rationale:** Short expiry limits stale data when invalidation precision is not economical.

### Keep source data authoritative (standards/rule/ext-cache.keep-source-data-authoritative)

**Requirement:** A cache implementation MUST keep required business data authoritative in its source of record.

**Rationale:** A cache stores a derived copy rather than the sole required business record.

### Define cache outage behavior (standards/rule/ext-cache.define-cache-outage-behavior)

**Requirement:** A cache outage MUST use the source when capacity permits or return a documented degraded response.

**Rationale:** Callers need predictable behavior when cache infrastructure is unavailable.

### Emit a signal for each degraded cache path (standards/rule/ext-cache.emit-a-signal-for-each-degraded-cache-path)

**Requirement:** A cache path MUST emit a metric distinguishing a cache miss, a cache error, and a degraded response.

**Rationale:** A fallback that works is invisible, so an outage runs until somebody notices the source load instead. The three cases need different responses: a miss is normal, an error is an infrastructure fault, and a degraded response is a product behavior change. One counter for all three answers none of them.

**Example:** The metric carries the cache name and the outcome, following [the OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/) for the client it wraps.

### Bound cache refresh work (standards/rule/ext-cache.bound-cache-refresh-work)

**Requirement:** A cache implementation MUST bound simultaneous refresh work when concurrent misses could overload its source.

**Rationale:** Bounded concurrency, request coalescing, and jittered expiry are valid techniques.

**Example:** One request refreshes a key while concurrent callers await the same bounded work.

### Avoid unbounded key locks (standards/rule/ext-cache.avoid-unbounded-key-locks)

**Requirement:** A cache implementation MUST NOT create an unbounded per-key lock inventory.

**Rationale:** Unbounded lock state can exhaust memory under untrusted or high-cardinality keys.

## Conventions

### Place cache access at an outer boundary (standards/rule/ext-cache.place-cache-access-at-an-outer-boundary)

**Default:** Place cache access in Infrastructure or a frontend data boundary.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** Application owns any external cache port required by a use case. Domain code has no cache dependency.

## Dependencies

No provider package is selected by this extension.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/ext-cache.record-measured-cache-need | guidance | Does the proposal record the query, load, latency, cost, target, staleness, and ownership? |
| standards/rule/ext-cache.remove-unjustified-caches | guidance | Does a cache leave when measurements no longer justify its cost? |
| standards/rule/ext-cache.compose-cache-keys-from-result-inputs | guidance | Does each key separate version, result inputs, and tenant or actor partition? |
| standards/rule/ext-cache.exclude-unsafe-cache-key-material | guidance | Is every key free of secrets, unbounded input, and unhashed personal data? |
| standards/rule/ext-cache.define-cache-invalidation | guidance | Does each cached value define expiry, events, an owner, and failure behavior? |
| standards/rule/ext-cache.record-a-manual-cache-invalidation | guidance | Does a manual clear write a record naming the actor, the scope, and the reason? |
| standards/rule/ext-cache.prefer-bounded-staleness | guidance | Does the expiry stay short unless a measured decision permits longer? |
| standards/rule/ext-cache.keep-source-data-authoritative | guidance | Is the required business data authoritative in its source of record? |
| standards/rule/ext-cache.define-cache-outage-behavior | guidance | Does an outage use the source or return the documented degraded response? |
| standards/rule/ext-cache.emit-a-signal-for-each-degraded-cache-path | guidance | Do a miss, an error, and a degraded response each increment their own metric? |
| standards/rule/ext-cache.bound-cache-refresh-work | guidance | Does concurrent-miss refresh stay bounded and protect the source? |
| standards/rule/ext-cache.avoid-unbounded-key-locks | guidance | Does lock state stay bounded under high-cardinality keys? |
| standards/rule/ext-cache.place-cache-access-at-an-outer-boundary | guidance | Is cache access outside Domain, or is there a recorded Exception? |
