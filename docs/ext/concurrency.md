# Concurrency and Idempotency

## Intent

Concurrency control protects invariants when accepted writes overlap. Idempotency protects an operation from duplicate execution after a retry or uncertain network response.

## Activation

Activation scope: `local`.

Applicable specification kinds: `module`, `business-record`, `use-case`.

The consumer enables `concurrency` when accepted writes can conflict or retries can duplicate irreversible or externally visible effects.

## Baseline relationship

This extension replaces no baseline provision. `litespec/ext/concurrency#return-precondition-outcomes` extends `litespec/backend/api#use-consistent-status-codes` with the 428 row for a missing precondition.

This extension switches on `limit`. `litespec/ext/concurrency#set-key-retention` records key retention as a Limit record.

## Agent Summary {#agent-summary}

- Document the conflicting writes and protected invariant. (litespec/ext/concurrency#document-write-conflict-behavior)
- Use expected versions for documented write conflicts. (litespec/ext/concurrency#compare-expected-aggregate-versions)
- Return stable precondition and version-conflict responses. (litespec/ext/concurrency#map-failed-expected-versions, litespec/ext/concurrency#apply-http-version-preconditions)
- Scope and fingerprint idempotency keys. (litespec/ext/concurrency#scope-client-keys, litespec/ext/concurrency#enforce-key-uniqueness)
- Commit replay records with business changes. (litespec/ext/concurrency#store-idempotency-state-atomically)
- Keep external effects outside uncommitted work. (litespec/ext/concurrency#delay-irreversible-provider-calls)
- Retain keys through safe retry windows. (litespec/ext/concurrency#set-key-retention, litespec/ext/concurrency#retain-safe-retry-keys)

## Standards

### Document write conflict behavior

**Requirement:** A conflicting-write use case MUST document conflicting operations, invalid combined result, expected winner behavior, and user-visible conflict response.

**Rationale:** The specification identifies the invariant that version coordination protects.

### Limit version checks

**Requirement:** An implementation MUST NOT add version checks without a documented conflicting-write case.

**Rationale:** Unneeded version checks create rejection behavior without a protected business outcome.

### Compare expected aggregate versions

**Requirement:** A conflicting-write implementation MUST store and compare the aggregate version through its selected persistence model.

**Rationale:** The persistence version detects a competing accepted write against the same aggregate state.

### Map failed expected versions

**Requirement:** An HTTP API MUST map a failed expected version to status 409 Problem Details with a stable code.

**Rationale:** A stable response lets callers distinguish a concurrency conflict from validation or authorization failure.

### Reject silent overwrites

**Requirement:** A conflicting-write implementation MUST NOT silently overwrite a conflicting accepted change.

**Rationale:** Silent replacement can violate the invariant named by the use-case specification.

### Apply HTTP version preconditions

**Requirement:** An HTTP operation requiring a caller version MUST return a strong persistence-derived `ETag` and require `If-Match` on writes.

**Rationale:** HTTP preconditions let a caller send the version that it read.

**Example:** A current `ETag` permits the write; a changed entity version rejects it.

### Return precondition outcomes

**Requirement:** An HTTP API MUST return 428 `precondition_required` for missing `If-Match` and 409 `version_conflict` for stale versions.

**Rationale:** Distinct outcomes show whether a caller omitted or supplied an obsolete version. This extends the outcome table of `litespec/backend/api#use-consistent-status-codes`.

### Hide provider version values

**Requirement:** An HTTP API MUST NOT expose a provider-specific version value in another contract field.

**Rationale:** The ETag is the contract boundary for persistence-version coordination.

### Scope client keys

**Requirement:** An idempotent operation MUST scope its client key to the tenant, authenticated actor and operation.

**Rationale:** Tenant, actor and operation scope prevents one caller's key from replaying another operation. A project without the tenancy extension uses one fixed tenant value.

### Store idempotency state atomically

**Requirement:** An idempotent operation MUST store its fingerprint, state, response status, response body, and expiry with its business change in one provider transaction.

**Rationale:** One transaction connects the accepted change to the result that later calls replay. It leaves no completed record without its change and no change without its replay record.

### Reject conflicting key reuse

**Requirement:** An idempotent operation MUST reject reuse of one key with a different request fingerprint.

**Rationale:** One client key can represent only one accepted request intent.

### Enforce key uniqueness

**Requirement:** An idempotency store MUST enforce a unique constraint on tenant, actor, operation, and client key.

**Rationale:** The constraint selects one accepted winner when concurrent requests use the same key. A project without the tenancy extension uses one fixed tenant value.

### Canonicalize request fingerprints

**Requirement:** An idempotency implementation MUST derive its fingerprint from canonical mapped command input, route identity, and the authenticated actor identifier, excluding credentials and the client key.

**Rationale:** Equivalent requests produce one comparison value without embedding authentication material.

The actor identifier is in the fingerprint and the credential that proved it is not. Two actors can present the same client key, so a fingerprint without the actor lets one actor's replay return another actor's stored response. A bearer token, a cookie, and a signature are the credential, and each one changes between two requests the rule has to treat as equal.

### Protect fingerprint source data

**Requirement:** An idempotency implementation MUST store a cryptographic hash when support does not require original sensitive request content.

**Rationale:** A hash preserves comparison behavior while reducing retained sensitive data.

### Replay completed results

**Requirement:** A completed idempotent retry MUST return the original response status and body.

**Rationale:** A retry receives the accepted result rather than repeating its state change.

### Define concurrent retry behavior

**Requirement:** An idempotent use case MUST define whether a concurrent request waits, reports in-progress, or returns a stable conflict.

**Rationale:** Callers need one documented result while an identical request is still active.

### Reload concurrent winners

**Requirement:** A losing concurrent idempotency request MUST reload and replay the winning record when its fingerprint matches.

**Rationale:** The unique-key winner provides the accepted result for all matching retries.

### Discard failed replay state

**Requirement:** A failed pre-commit idempotent request MUST leave neither the business change nor a completed replay record.

**Rationale:** A later retry can safely perform the previously uncommitted operation.

### Delay irreversible provider calls

**Requirement:** An idempotent operation MUST NOT perform an irreversible provider call before its business transaction commits.

**Rationale:** An uncommitted operation cannot safely claim an irreversible external effect.

### Route required external effects durably

**Requirement:** An idempotent operation MUST use the outbox extension or a documented provider idempotency contract for required external effects.

**Rationale:** Durable routing or provider replay protection aligns external effects with retries.

### Set key retention

**Requirement:** An idempotency owner MUST record key retention as a Limit record set from the caller retry window and business risk.

**Rationale:** Retention lasts through the period in which callers can safely retry.

### Bound expired-record cleanup

**Requirement:** An idempotency owner MUST remove expired records through a bounded maintenance process.

**Rationale:** Bounded maintenance prevents cleanup from overwhelming normal application work.

### Retain safe retry keys

**Requirement:** An idempotency owner MUST NOT expire a key before callers can safely retry.

**Rationale:** Early expiration can turn a retry into duplicate business work.

### Declare replayed transport outcomes

**Requirement:** An idempotent use case MUST list the statuses and headers stored for replay.

**Rationale:** The list defines the transport result that a completed retry can reproduce.

### Restrict replay data

**Requirement:** An idempotent implementation MUST store only safe response fields required to reproduce an accepted result.

**Rationale:** Replay data needs enough information for callers without retaining unnecessary sensitive content.

### Exclude unsafe replay outcomes

**Requirement:** An idempotent implementation MUST NOT replay authentication failures, transient server failures, `Set-Cookie`, `Cache-Control`, `Vary`, `Expires`, `Age`, hop-by-hop headers, tokens, or secrets.

**Rationale:** These values are unsafe, transient, or unrelated to the accepted operation result. The caching headers are computed for the response that produced them, so replaying them hands a later caller freshness instructions from an earlier moment. [RFC 9111](https://datatracker.ietf.org/doc/html/rfc9111) makes each one a property of the exchange rather than of the result, and the replayed response computes its own.

## Conventions

### Use the standard idempotency header

**Default:** Use `Idempotency-Key` for HTTP commands that accept client keys, bounded to 255 characters of visible ASCII.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date and removal condition.

**Rationale:** The standard header makes client-key behavior recognizable at the HTTP boundary. [The IETF draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) leaves the value opaque, which leaves a server storing whatever a client sends as a key. A bound stops an unbounded key from becoming an unbounded store entry. A character set stops a key from carrying a control character into a log line.

### Keep idempotency persistence in Infrastructure

**Default:** Keep idempotency persistence and transaction handling in Infrastructure.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date and removal condition.

**Rationale:** Provider transactions and constraints belong outside Application and Domain.

### Map replay responses at the API boundary

**Default:** Keep replay response mapping at the API boundary.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date and removal condition.

**Rationale:** HTTP statuses and headers are transport concerns.

### Declare applicable headers

**Default:** Declare the idempotency header as required on each applicable HTTP operation.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date and removal condition.

**Rationale:** Generated API contracts expose the requirement through `litespec/backend/api#publish-precise-complete-schemas`.

## Dependencies

No additional package is required by the baseline implementation.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/concurrency#document-write-conflict-behavior | guidance | Does the use case name conflicts, invalid state, winner behavior and caller response? |
| litespec/ext/concurrency#limit-version-checks | checkable | `ConcurrencyVersionTests` link every version check to a documented conflicting-write case. |
| litespec/ext/concurrency#compare-expected-aggregate-versions | checkable | `ConcurrencyVersionTests` race conflicting aggregate writes with expected versions. |
| litespec/ext/concurrency#map-failed-expected-versions | checkable | `ConcurrencyVersionTests` assert a failed expected version returns 409 Problem Details with its stable code. |
| litespec/ext/concurrency#reject-silent-overwrites | checkable | `ConcurrencyVersionTests` assert conflicting accepted writes preserve the winner without silent replacement. |
| litespec/ext/concurrency#apply-http-version-preconditions | checkable | `ConcurrencyVersionTests` require and validate a strong persistence-derived ETag. |
| litespec/ext/concurrency#return-precondition-outcomes | checkable | `ConcurrencyVersionTests` return 428 for a missing `If-Match` and 409 for a stale version. |
| litespec/ext/concurrency#hide-provider-version-values | checkable | `ConcurrencyVersionTests` assert public transport models expose no provider-specific version field. |
| litespec/ext/concurrency#scope-client-keys | checkable | `IdempotencyKeyTests` assert keys from different tenants, actors or operations do not replay each other. |
| litespec/ext/concurrency#store-idempotency-state-atomically | checkable | `IdempotencyKeyTests` commit fingerprint, state, response and expiry with the accepted business change. |
| litespec/ext/concurrency#reject-conflicting-key-reuse | checkable | `IdempotencyKeyTests` assert reused keys with changed input return the documented rejection. |
| litespec/ext/concurrency#enforce-key-uniqueness | checkable | `IdempotencyKeyTests` assert concurrent inserts prove the tenant-actor-operation-key uniqueness constraint. |
| litespec/ext/concurrency#canonicalize-request-fingerprints | checkable | `IdempotencyKeyTests` assert equivalent mapped requests produce one fingerprint without credentials or client key. |
| litespec/ext/concurrency#protect-fingerprint-source-data | guidance | Is sensitive fingerprint source data hashed wherever support needs no original content? |
| litespec/ext/concurrency#replay-completed-results | checkable | `IdempotencyReplayTests` return the original accepted status and body. |
| litespec/ext/concurrency#define-concurrent-retry-behavior | checkable | `IdempotencyReplayTests` prove the documented wait, in-progress, or conflict behavior. |
| litespec/ext/concurrency#reload-concurrent-winners | checkable | `IdempotencyReplayTests` reload and replay the matching winner record. |
| litespec/ext/concurrency#discard-failed-replay-state | checkable | `IdempotencyReplayTests` leave no business change or completed replay state. |
| litespec/ext/concurrency#delay-irreversible-provider-calls | guidance | Does every irreversible provider call run only after its business transaction commits? |
| litespec/ext/concurrency#route-required-external-effects-durably | guidance | Does each required effect use the outbox or a documented provider idempotency contract? |
| litespec/ext/concurrency#set-key-retention | guidance | Does the Limit record cover the caller retry window and the business risk? |
| litespec/ext/concurrency#bound-expired-record-cleanup | checkable | `IdempotencyRetentionTests` show bounded deletion of expired idempotency records. |
| litespec/ext/concurrency#retain-safe-retry-keys | checkable | `IdempotencyRetentionTests` reject expiration before the documented safe retry time. |
| litespec/ext/concurrency#declare-replayed-transport-outcomes | checkable | `IdempotencyOutcomeTests` match replayed statuses and headers against the declared list. |
| litespec/ext/concurrency#restrict-replay-data | guidance | Does each stored replay field serve the accepted result callers reproduce? |
| litespec/ext/concurrency#exclude-unsafe-replay-outcomes | checkable | `IdempotencyOutcomeTests` exclude authentication, transient failures, cookies, hop-by-hop headers, tokens, and secrets. |
| litespec/ext/concurrency#use-the-standard-idempotency-header | checkable | `ConcurrencyTests` assert applicable operations accept `Idempotency-Key` or record an Exception. |
| litespec/ext/concurrency#keep-idempotency-persistence-in-infrastructure | checkable | `ConcurrencyTests` assert idempotency persistence and transaction handling live in Infrastructure. |
| litespec/ext/concurrency#map-replay-responses-at-the-api-boundary | checkable | `ConcurrencyTests` assert replay response mapping lives at the API boundary. |
| litespec/ext/concurrency#declare-applicable-headers | checkable | `ConcurrencyTests` asserts generated OpenAPI declares the header for every applicable operation. |
