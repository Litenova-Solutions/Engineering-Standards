# Concurrency and Idempotency

## Intent

Concurrency control protects invariants when accepted writes overlap. Idempotency protects an operation from duplicate execution after a retry or uncertain network response.

## Activation

Activation scope: `local`.

Applicable specification kinds: `module`, `aggregate`, `use-case`, `workflow`.

The consumer enables `concurrency` when accepted writes can conflict or retries can duplicate irreversible or externally visible effects. A use case with `concurrency` Risk activates it.

## Baseline relationship

This extension adds no baseline project and replaces no baseline rule.

## Agent Summary {#agent-summary}

- Document the conflicting writes and protected invariant. (standards/rule/ext-concurrency.document-write-conflict-behavior)
- Use expected versions for documented write conflicts. (standards/rule/ext-concurrency.compare-expected-aggregate-versions)
- Return stable precondition and version-conflict responses. (standards/rule/ext-concurrency.map-failed-expected-versions, standards/rule/ext-concurrency.apply-http-version-preconditions)
- Scope and fingerprint idempotency keys. (standards/rule/ext-concurrency.scope-client-keys, standards/rule/ext-concurrency.enforce-key-uniqueness)
- Commit replay records with business changes. (standards/rule/ext-concurrency.commit-replay-records-with-changes)
- Keep external effects outside uncommitted work. (standards/rule/ext-concurrency.delay-irreversible-provider-calls)
- Retain keys through safe retry windows. (standards/rule/ext-concurrency.set-key-retention, standards/rule/ext-concurrency.retain-safe-retry-keys)

## Standards

### Document write conflict behavior (standards/rule/ext-concurrency.document-write-conflict-behavior)

**Requirement:** A conflicting-write use case MUST document conflicting operations, invalid combined result, expected winner behavior, and user-visible conflict response.

**Rationale:** The specification identifies the invariant that version coordination protects.

### Limit version checks (standards/rule/ext-concurrency.limit-version-checks)

**Requirement:** An implementation MUST NOT add version checks without a documented conflicting-write case.

**Rationale:** Unneeded version checks create rejection behavior without a protected business outcome.

### Compare expected aggregate versions (standards/rule/ext-concurrency.compare-expected-aggregate-versions)

**Requirement:** A conflicting-write implementation MUST store and compare the aggregate version through its selected persistence model.

**Rationale:** The persistence version detects a competing accepted write against the same aggregate state.

### Map failed expected versions (standards/rule/ext-concurrency.map-failed-expected-versions)

**Requirement:** An HTTP API MUST map a failed expected version to status 409 Problem Details with a stable code.

**Rationale:** A stable response lets callers distinguish a concurrency conflict from validation or authorization failure.

### Reject silent overwrites (standards/rule/ext-concurrency.reject-silent-overwrites)

**Requirement:** A conflicting-write implementation MUST NOT silently overwrite a conflicting accepted change.

**Rationale:** Silent replacement can violate the invariant named by the use-case specification.

### Apply HTTP version preconditions (standards/rule/ext-concurrency.apply-http-version-preconditions)

**Requirement:** An HTTP operation requiring a caller version MUST return a strong persistence-derived `ETag` and require `If-Match` on writes.

**Rationale:** HTTP preconditions let a caller send the version that it read.

**Example:** A current `ETag` permits the write; a changed entity version rejects it.

### Return precondition outcomes (standards/rule/ext-concurrency.return-precondition-outcomes)

**Requirement:** An HTTP API MUST return 428 `precondition_required` for missing `If-Match` and 409 `version_conflict` for stale versions.

**Rationale:** Distinct outcomes show whether a caller omitted or supplied an obsolete version.

### Hide provider version values (standards/rule/ext-concurrency.hide-provider-version-values)

**Requirement:** An HTTP API MUST NOT expose a provider-specific version value in another contract field.

**Rationale:** The ETag is the contract boundary for persistence-version coordination.

### Scope client keys (standards/rule/ext-concurrency.scope-client-keys)

**Requirement:** An idempotent operation MUST scope its client key to the authenticated actor and operation.

**Rationale:** Actor and operation scope prevents one caller's key from replaying another operation.

### Store idempotency state atomically (standards/rule/ext-concurrency.store-idempotency-state-atomically)

**Requirement:** An idempotent operation MUST store its fingerprint, state, response status, response body, and expiry with its business change.

**Rationale:** One transaction connects the accepted change to the result that later calls replay.

### Reject conflicting key reuse (standards/rule/ext-concurrency.reject-conflicting-key-reuse)

**Requirement:** An idempotent operation MUST reject reuse of one key with a different request fingerprint.

**Rationale:** One client key can represent only one accepted request intent.

### Enforce key uniqueness (standards/rule/ext-concurrency.enforce-key-uniqueness)

**Requirement:** An idempotency store MUST enforce a unique constraint on actor, operation, and client key.

**Rationale:** The constraint selects one accepted winner when concurrent requests use the same key.

### Canonicalize request fingerprints (standards/rule/ext-concurrency.canonicalize-request-fingerprints)

**Requirement:** An idempotency implementation MUST derive its fingerprint from canonical mapped command input, route identity, and the authenticated actor identifier, excluding credentials and the client key.

**Rationale:** Equivalent requests produce one comparison value without embedding authentication material.

The actor identifier is in the fingerprint and the credential that proved it is not. Two actors can present the same client key, so a fingerprint without the actor lets one actor's replay return another actor's stored response. A bearer token, a cookie, and a signature are the credential, and each one changes between two requests the rule has to treat as equal.

### Protect fingerprint source data (standards/rule/ext-concurrency.protect-fingerprint-source-data)

**Requirement:** An idempotency implementation MUST store a cryptographic hash when support does not require original sensitive request content.

**Rationale:** A hash preserves comparison behavior while reducing retained sensitive data.

### Replay completed results (standards/rule/ext-concurrency.replay-completed-results)

**Requirement:** A completed idempotent retry MUST return the original response status and body.

**Rationale:** A retry receives the accepted result rather than repeating its state change.

### Define concurrent retry behavior (standards/rule/ext-concurrency.define-concurrent-retry-behavior)

**Requirement:** An idempotent use case MUST define whether a concurrent request waits, reports in-progress, or returns a stable conflict.

**Rationale:** Callers need one documented result while an identical request is still active.

### Commit replay records with changes (standards/rule/ext-concurrency.commit-replay-records-with-changes)

**Requirement:** An idempotent implementation MUST stage the completed replay record and business change in one provider transaction.

**Rationale:** The transaction prevents a completed record without its change or a change without its replay record.

### Reload concurrent winners (standards/rule/ext-concurrency.reload-concurrent-winners)

**Requirement:** A losing concurrent idempotency request MUST reload and replay the winning record when its fingerprint matches.

**Rationale:** The unique-key winner provides the accepted result for all matching retries.

### Discard failed replay state (standards/rule/ext-concurrency.discard-failed-replay-state)

**Requirement:** A failed pre-commit idempotent request MUST leave neither the business change nor a completed replay record.

**Rationale:** A later retry can safely perform the previously uncommitted operation.

### Delay irreversible provider calls (standards/rule/ext-concurrency.delay-irreversible-provider-calls)

**Requirement:** An idempotent operation MUST NOT perform an irreversible provider call before its business transaction commits.

**Rationale:** An uncommitted operation cannot safely claim an irreversible external effect.

### Route required external effects durably (standards/rule/ext-concurrency.route-required-external-effects-durably)

**Requirement:** An idempotent operation MUST use the outbox extension or a documented provider idempotency contract for required external effects.

**Rationale:** Durable routing or provider replay protection aligns external effects with retries.

### Set key retention (standards/rule/ext-concurrency.set-key-retention)

**Requirement:** An idempotency owner MUST set key retention from the caller retry window and business risk.

**Rationale:** Retention lasts through the period in which callers can safely retry.

### Bound expired-record cleanup (standards/rule/ext-concurrency.bound-expired-record-cleanup)

**Requirement:** An idempotency owner MUST remove expired records through a bounded maintenance process.

**Rationale:** Bounded maintenance prevents cleanup from overwhelming normal application work.

### Retain safe retry keys (standards/rule/ext-concurrency.retain-safe-retry-keys)

**Requirement:** An idempotency owner MUST NOT expire a key before callers can safely retry.

**Rationale:** Early expiration can turn a retry into duplicate business work.

### Declare replayed transport outcomes (standards/rule/ext-concurrency.declare-replayed-transport-outcomes)

**Requirement:** An idempotent use case MUST list the statuses and headers stored for replay.

**Rationale:** The list defines the transport result that a completed retry can reproduce.

### Restrict replay data (standards/rule/ext-concurrency.restrict-replay-data)

**Requirement:** An idempotent implementation MUST store only safe response fields required to reproduce an accepted result.

**Rationale:** Replay data needs enough information for callers without retaining unnecessary sensitive content.

### Exclude unsafe replay outcomes (standards/rule/ext-concurrency.exclude-unsafe-replay-outcomes)

**Requirement:** An idempotent implementation MUST NOT replay authentication failures, transient server failures, `Set-Cookie`, `Cache-Control`, `Vary`, `Expires`, `Age`, hop-by-hop headers, tokens, or secrets.

**Rationale:** These values are unsafe, transient, or unrelated to the accepted operation result. The caching headers are computed for the response that produced them, so replaying them hands a later caller freshness instructions from an earlier moment. [RFC 9111](https://datatracker.ietf.org/doc/html/rfc9111) makes each one a property of the exchange rather than of the result, and the replayed response computes its own.

## Conventions

### Use the standard idempotency header (standards/rule/ext-concurrency.use-the-standard-idempotency-header)

**Default:** Use `Idempotency-Key` for HTTP commands that accept client keys, bounded to 255 characters of visible ASCII.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The standard header makes client-key behavior recognizable at the HTTP boundary. [The IETF draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) leaves the value opaque, which leaves a server storing whatever a client sends as a key. A bound stops an unbounded key from becoming an unbounded store entry. A character set stops a key from carrying a control character into a log line.

### Keep idempotency persistence in Infrastructure (standards/rule/ext-concurrency.keep-idempotency-persistence-in-infrastructure)

**Default:** Keep idempotency persistence and transaction handling in Infrastructure.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Provider transactions and constraints belong outside Application and Domain.

### Map replay responses at the API boundary (standards/rule/ext-concurrency.map-replay-responses-at-the-api-boundary)

**Default:** Keep replay response mapping at the API boundary.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** HTTP statuses and headers are transport concerns.

### Declare applicable headers (standards/rule/ext-concurrency.declare-applicable-headers)

**Default:** Declare the idempotency header as required on each applicable HTTP operation.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Generated API contracts expose the requirement through `standards/rule/backend-api.publish-precise-complete-schemas`.

## Dependencies

No additional package is required by the baseline implementation.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/ext-concurrency.document-write-conflict-behavior | inspection | The use-case specification names conflicts, invalid state, winner behavior, and caller response. |
| standards/rule/ext-concurrency.limit-version-checks | inspection | Every version check links to a documented conflicting-write case. |
| standards/rule/ext-concurrency.compare-expected-aggregate-versions | test | `ConcurrencyVersionTests` race conflicting aggregate writes with expected versions. |
| standards/rule/ext-concurrency.map-failed-expected-versions | test | `ConcurrencyVersionTests` asserts a failed expected version returns 409 Problem Details with its stable code. |
| standards/rule/ext-concurrency.reject-silent-overwrites | test | `ConcurrencyVersionTests` asserts conflicting accepted writes preserve the winner without silent replacement. |
| standards/rule/ext-concurrency.apply-http-version-preconditions | test | `ConcurrencyVersionTests` require and validate a strong persistence-derived ETag. |
| standards/rule/ext-concurrency.return-precondition-outcomes | test | Missing and stale `If-Match` tests return the documented status and code. |
| standards/rule/ext-concurrency.hide-provider-version-values | static | `ConcurrencyVersionTests` asserts public transport models expose no provider-specific version field. |
| standards/rule/ext-concurrency.scope-client-keys | test | `IdempotencyKeyTests` asserts same keys from different actors or operations do not replay each other. |
| standards/rule/ext-concurrency.store-idempotency-state-atomically | test | `IdempotencyKeyTests` commit replay state with the accepted business change. |
| standards/rule/ext-concurrency.reject-conflicting-key-reuse | test | `IdempotencyKeyTests` asserts reused keys with changed input return the documented rejection. |
| standards/rule/ext-concurrency.enforce-key-uniqueness | test | `IdempotencyKeyTests` asserts concurrent inserts prove the actor-operation-key uniqueness constraint. |
| standards/rule/ext-concurrency.canonicalize-request-fingerprints | test | `IdempotencyKeyTests` asserts equivalent mapped requests produce one fingerprint without credentials or client key. |
| standards/rule/ext-concurrency.protect-fingerprint-source-data | inspection | Stored fingerprint review confirms sensitive source data is hashed when not required. |
| standards/rule/ext-concurrency.replay-completed-results | test | `IdempotencyReplayTests` return the original accepted status and body. |
| standards/rule/ext-concurrency.define-concurrent-retry-behavior | test | `IdempotencyReplayTests` prove the documented wait, in-progress, or conflict behavior. |
| standards/rule/ext-concurrency.commit-replay-records-with-changes | test | `IdempotencyReplayTests` leave no completed replay record without its business change. |
| standards/rule/ext-concurrency.reload-concurrent-winners | test | `IdempotencyReplayTests` reload and replay the matching winner record. |
| standards/rule/ext-concurrency.discard-failed-replay-state | test | `IdempotencyReplayTests` leave no business change or completed replay state. |
| standards/rule/ext-concurrency.delay-irreversible-provider-calls | inspection | Integration review shows irreversible provider calls occur after commit. |
| standards/rule/ext-concurrency.route-required-external-effects-durably | inspection | Required effects select an outbox or documented provider idempotency contract. |
| standards/rule/ext-concurrency.set-key-retention | inspection | The use case records retry window, risk, and retention duration. |
| standards/rule/ext-concurrency.bound-expired-record-cleanup | test | `IdempotencyRetentionTests` show bounded deletion of expired idempotency records. |
| standards/rule/ext-concurrency.retain-safe-retry-keys | test | `IdempotencyRetentionTests` reject expiration before the documented safe retry time. |
| standards/rule/ext-concurrency.declare-replayed-transport-outcomes | inspection | The use case lists replayed statuses and headers. |
| standards/rule/ext-concurrency.restrict-replay-data | inspection | Stored replay records contain only fields required for accepted-result reproduction. |
| standards/rule/ext-concurrency.exclude-unsafe-replay-outcomes | test | `IdempotencyOutcomeTests` exclude authentication, transient failures, cookies, hop-by-hop headers, tokens, and secrets. |
| standards/rule/ext-concurrency.use-the-standard-idempotency-header | inspection | HTTP contract review uses `Idempotency-Key` or records a local replacement. |
| standards/rule/ext-concurrency.keep-idempotency-persistence-in-infrastructure | inspection | Source review locates idempotency transaction work in Infrastructure. |
| standards/rule/ext-concurrency.map-replay-responses-at-the-api-boundary | inspection | Source review locates replay HTTP mapping at the API boundary. |
| standards/rule/ext-concurrency.declare-applicable-headers | static | `ConcurrencyTests` asserts generated OpenAPI declares the header for every applicable operation. |
