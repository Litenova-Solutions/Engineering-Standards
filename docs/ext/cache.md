# Caching

## Intent

A cache answers repeated expensive reads from stored results instead of recomputing them, trading lower latency and source load for stale reads and invalidation work. This page states when that trade is justified, what each cache's staleness contract covers, how keys separate results, and how the system behaves when the cache fails. A team applies it once traces or load tests name a repeated expensive read, so each cache carries a staleness limit the team chose instead of one it discovers during an incident.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`.

The consumer enables `cache` after traces or load tests identify a repeated expensive read whose use case states the staleness it accepts. Expected future traffic alone does not activate it.

## Baseline relationship

This extension replaces no baseline provision. It selects no provider package: a project that adds one records the decision and pins its version in the manifest.

This extension switches on `limit`: the accepted staleness and the expiry of each cache are Limit records.

## Standards

### Record measured cache need

**Statement:** A cache proposal MUST record its observed query, representative load, latency, source cost, target, accepted staleness as a Limit record, owner, status, decider, and decide-by.

**Rationale:** A cache costs invalidation, capacity, and recovery work for as long as it lives. The proposal records the observed query, load, latency, cost, target, and accepted staleness so a reviewer weighs that cost against measured gain. A cache approved without measurements stays until someone pays to remove it.

### Remove unjustified caches

**Statement:** A cache owner MUST remove a cache when measurements do not justify its operating cost.

**Rationale:** Traffic shifts and sources get faster, so a cache that paid for itself last year can cost more than it saves today. The owner re-checks the measurements and removes the cache when they no longer justify its operating cost. A cache nobody owns stays forever, and its invalidation bugs stay with it.

### Compose cache keys from result inputs

**Statement:** A cache key MUST include its data-shape version, every result-affecting input, and applicable tenant or actor partition.

**Rationale:** A key missing the data-shape version serves old shapes to new readers after a deploy. A key missing a result-affecting input serves one caller's answer to a different question. Tenant or actor partition keeps one party's results away from another's.

**Example:** `post-summary:v2:tenant-42:post-17` identifies a versioned, tenant-scoped result.

### Exclude unsafe cache key material

**Statement:** A cache key MUST NOT contain a secret, unbounded raw input, or personal data that is not already a hash.

**Rationale:** Keys appear in diagnostics, metrics, and provider administration tools. That copies the value into a store no one classified. An email address in a key is a personal-data record in the cache provider's key space. It sits outside every retention and erasure path the project defined. [Data minimization](https://gdpr-info.eu/art-5-gdpr/) applies to an identifier as much as to a field.

**Example:** A per-account cache key carries the account's opaque identifier. A key that carried the address instead is replaced by a hash of it, and the entry is bound to the account that owns it.

### Define cache invalidation

**Statement:** A cached value MUST define expiry as a Limit record, invalidating write events, an invalidation owner, and behavior after invalidation failure.

**Rationale:** Every cached value goes stale, and the only choice is whether the project decides the behavior up front or discovers it during an incident. Expiry, invalidating write events, an owner, and failure behavior state how long staleness lasts and who fixes it when invalidation fails. A cache without that contract serves stale data on a schedule nobody chose.

### Record a manual cache invalidation

**Statement:** A manual invalidation MUST produce a record naming actor, scope, and reason, as an audit record in its category when the audit extension is selected.

**Rationale:** A manual clear changes what every later reader sees and leaves no trace in the data itself. Investigating a stale-read report afterward means knowing whether someone already cleared the entry. [Article 30 of the GDPR](https://gdpr-info.eu/art-30-gdpr/) treats an administrative action over personal data as processing that has a record.

**Example:** A command that clears one tenant's cached price list records the tenant, the operator, and the incident it was run for.

### Prefer bounded staleness

**Statement:** A cache owner SHOULD use a short expiry when precise invalidation costs more than recomputation.

**Deviation:** A measured staleness and operating-cost decision permits a longer expiry.

**Rationale:** Precise invalidation costs design and code, while a short expiry costs one recomputation per window. When recomputation is cheaper, a short expiry bounds staleness without the machinery. A longer expiry then needs a measured decision that says the extra staleness is worth its saving.

### Keep source data authoritative

**Statement:** A cache implementation MUST keep required business data authoritative in its source of record.

**Rationale:** The cache holds a derived copy that the system can drop at any time. Required business data stays authoritative in its source of record, so losing the cache loses speed and nothing else. A cache that owns the only copy turns every cache outage into data loss.

### Define cache outage behavior

**Statement:** A cache outage MUST use the source when capacity permits or return a documented degraded response.

**Rationale:** Cache infrastructure fails like any other dependency. The outage behavior states whether callers fall back to the source or receive a documented degraded response, so an outage degrades the product on purpose instead of by accident.

### Emit a signal for each degraded cache path

**Statement:** A cache path MUST emit a metric distinguishing a cache miss, a cache error, and a degraded response.

**Rationale:** A fallback that works is invisible. An outage runs until someone notices the source load instead. The three cases need different responses: a miss is normal, an error is an infrastructure fault, and a degraded response is a product behavior change. One counter for all three answers none of them.

**Example:** The metric carries the cache name and the outcome, following [the OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/) for the client it wraps.

### Bound cache refresh work

**Statement:** A cache implementation MUST bound simultaneous refresh work when concurrent misses could overload its source.

**Rationale:** When a popular entry expires, every concurrent miss can trigger its own refresh and flood the source the cache was protecting. Bounding simultaneous refresh work holds that flood to what the source tolerates. Request coalescing and jittered expiry are two ways to meet the bound.

**Example:** One request refreshes a key while concurrent callers await the same bounded work.

### Avoid unbounded key locks

**Statement:** A cache implementation MUST NOT create an unbounded per-key lock inventory.

**Rationale:** Per-key locks trade duplicate refresh for memory, and the trade needs a ceiling. Untrusted or high-cardinality keys create one lock entry each, which exhausts memory under attacker-chosen or runaway keys. A bounded lock scheme sheds that state instead of growing it.

## Conventions

### Place cache access at an outer boundary

**Default:** Place cache access in Infrastructure or a frontend data boundary.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** Cache access lives in Infrastructure or a frontend data boundary, behind a port the use case owns when Application needs one. Domain code takes no cache dependency, so business rules read the same with or without a cache. A cache concern inside Domain would couple every rule to the cache's presence.

## Dependencies

This extension selects no provider package.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/cache#record-measured-cache-need | guidance | Does the proposal record the query, load, latency, cost, target, staleness, and ownership? |
| litespec/ext/cache#remove-unjustified-caches | guidance | Does a cache leave when measurements do not justify its cost? |
| litespec/ext/cache#compose-cache-keys-from-result-inputs | guidance | Does each key separate version, result inputs, and tenant or actor partition? |
| litespec/ext/cache#exclude-unsafe-cache-key-material | guidance | Is every key free of secrets, unbounded input, and unhashed personal data? |
| litespec/ext/cache#define-cache-invalidation | guidance | Does each cached value define expiry, events, an owner, and failure behavior? |
| litespec/ext/cache#record-a-manual-cache-invalidation | guidance | Does a manual clear write a record naming the actor, the scope, and the reason? |
| litespec/ext/cache#prefer-bounded-staleness | guidance | Does the expiry stay short unless a measured decision permits longer? |
| litespec/ext/cache#keep-source-data-authoritative | guidance | Is the required business data authoritative in its source of record? |
| litespec/ext/cache#define-cache-outage-behavior | guidance | Does an outage use the source or return the documented degraded response? |
| litespec/ext/cache#emit-a-signal-for-each-degraded-cache-path | guidance | Do a miss, an error, and a degraded response each increment their own metric? |
| litespec/ext/cache#bound-cache-refresh-work | guidance | Does concurrent-miss refresh stay bounded and protect the source? |
| litespec/ext/cache#avoid-unbounded-key-locks | guidance | Does lock state stay bounded under high-cardinality keys? |
| litespec/ext/cache#place-cache-access-at-an-outer-boundary | guidance | Is cache access outside Domain, or is there a recorded Exception? |
