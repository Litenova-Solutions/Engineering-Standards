# Concurrency and Idempotency

## Intent

Concurrency control protects invariants when accepted writes overlap. Idempotency protects an operation from duplicate execution after a retry or uncertain network response.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `workflow`.

The consumer enables `concurrency-idempotency` when accepted writes can conflict or retries can duplicate irreversible or externally visible effects. A use case with `concurrency` Risk activates it.

## Baseline relationship

This extension adds no baseline project and replaces no baseline rule.

## Agent Summary {#agent-summary}

- Document the conflicting writes and protected invariant. (EXT.CONCURRENCY.ADOPT.001)
- Use expected versions for documented write conflicts. (EXT.CONCURRENCY.VERSION.001)
- Return stable precondition and version-conflict responses. (EXT.CONCURRENCY.VERSION.002, EXT.CONCURRENCY.VERSION.004)
- Scope and fingerprint idempotency keys. (EXT.CONCURRENCY.IDEMPOTENTKEY.001, EXT.CONCURRENCY.IDEMPOTENTKEY.004)
- Commit replay records with business changes. (EXT.CONCURRENCY.IDEMPOTENTREP.003)
- Keep external effects outside uncommitted work. (EXT.CONCURRENCY.IDEMPOTENTREP.006)
- Retain keys through safe retry windows. (EXT.CONCURRENCY.IDEMPOTENTRET.001, EXT.CONCURRENCY.IDEMPOTENTRET.003)

## Standards

### Document write conflict behavior (EXT.CONCURRENCY.ADOPT.001)

**Requirement:** A conflicting-write use case MUST document conflicting operations, invalid combined result, expected winner behavior, and user-visible conflict response.

**Rationale:** The specification identifies the invariant that version coordination protects.

### Limit version checks (EXT.CONCURRENCY.ADOPT.002)

**Requirement:** An implementation MUST NOT add version checks without a documented conflicting-write case.

**Rationale:** Unneeded version checks create rejection behavior without a protected business outcome.

### Compare expected aggregate versions (EXT.CONCURRENCY.VERSION.001)

**Requirement:** A conflicting-write implementation MUST store and compare the aggregate version through its selected persistence model.

**Rationale:** The persistence version detects a competing accepted write against the same aggregate state.

### Map failed expected versions (EXT.CONCURRENCY.VERSION.002)

**Requirement:** An HTTP API MUST map a failed expected version to status 409 Problem Details with a stable code.

**Rationale:** A stable response lets callers distinguish a concurrency conflict from validation or authorization failure.

### Reject silent overwrites (EXT.CONCURRENCY.VERSION.003)

**Requirement:** A conflicting-write implementation MUST NOT silently overwrite a conflicting accepted change.

**Rationale:** Silent replacement can violate the invariant named by the use-case specification.

### Apply HTTP version preconditions (EXT.CONCURRENCY.VERSION.004)

**Requirement:** An HTTP operation requiring a caller version MUST return a strong persistence-derived `ETag` and require `If-Match` on writes.

**Rationale:** HTTP preconditions let a caller send the version that it read.

**Example:** A current `ETag` permits the write; a changed entity version rejects it.

### Return precondition outcomes (EXT.CONCURRENCY.VERSION.005)

**Requirement:** An HTTP API MUST return 428 `precondition_required` for missing `If-Match` and 409 `version_conflict` for stale versions.

**Rationale:** Distinct outcomes show whether a caller omitted or supplied an obsolete version.

### Hide provider version values (EXT.CONCURRENCY.VERSION.006)

**Requirement:** An HTTP API MUST NOT expose a provider-specific version value in another contract field.

**Rationale:** The ETag is the contract boundary for persistence-version coordination.

### Scope client keys (EXT.CONCURRENCY.IDEMPOTENTKEY.001)

**Requirement:** An idempotent operation MUST scope its client key to the authenticated actor and operation.

**Rationale:** Actor and operation scope prevents one caller's key from replaying another operation.

### Store idempotency state atomically (EXT.CONCURRENCY.IDEMPOTENTKEY.002)

**Requirement:** An idempotent operation MUST store its fingerprint, state, response status, response body, and expiry with its business change.

**Rationale:** One transaction connects the accepted change to the result that later calls replay.

### Reject conflicting key reuse (EXT.CONCURRENCY.IDEMPOTENTKEY.003)

**Requirement:** An idempotent operation MUST reject reuse of one key with a different request fingerprint.

**Rationale:** One client key can represent only one accepted request intent.

### Enforce key uniqueness (EXT.CONCURRENCY.IDEMPOTENTKEY.004)

**Requirement:** An idempotency store MUST enforce a unique constraint on actor, operation, and client key.

**Rationale:** The constraint selects one accepted winner when concurrent requests use the same key.

### Canonicalize request fingerprints (EXT.CONCURRENCY.IDEMPOTENTKEY.005)

**Requirement:** An idempotency implementation MUST derive its fingerprint from canonical mapped command input and route identity, excluding credentials and the client key.

**Rationale:** Equivalent requests produce one comparison value without embedding authentication material.

### Protect fingerprint source data (EXT.CONCURRENCY.IDEMPOTENTKEY.006)

**Requirement:** An idempotency implementation MUST store a cryptographic hash when support does not require original sensitive request content.

**Rationale:** A hash preserves comparison behavior while reducing retained sensitive data.

### Replay completed results (EXT.CONCURRENCY.IDEMPOTENTREP.001)

**Requirement:** A completed idempotent retry MUST return the original response status and body.

**Rationale:** A retry receives the accepted result rather than repeating its state change.

### Define concurrent retry behavior (EXT.CONCURRENCY.IDEMPOTENTREP.002)

**Requirement:** An idempotent use case MUST define whether a concurrent request waits, reports in-progress, or returns a stable conflict.

**Rationale:** Callers need one documented result while an identical request is still active.

### Commit replay records with changes (EXT.CONCURRENCY.IDEMPOTENTREP.003)

**Requirement:** An idempotent implementation MUST stage the completed replay record and business change in one provider transaction.

**Rationale:** The transaction prevents a completed record without its change or a change without its replay record.

### Reload concurrent winners (EXT.CONCURRENCY.IDEMPOTENTREP.004)

**Requirement:** A losing concurrent idempotency request MUST reload and replay the winning record when its fingerprint matches.

**Rationale:** The unique-key winner provides the accepted result for all matching retries.

### Discard failed replay state (EXT.CONCURRENCY.IDEMPOTENTREP.005)

**Requirement:** A failed pre-commit idempotent request MUST leave neither the business change nor a completed replay record.

**Rationale:** A later retry can safely perform the previously uncommitted operation.

### Delay irreversible provider calls (EXT.CONCURRENCY.IDEMPOTENTREP.006)

**Requirement:** An idempotent operation MUST NOT perform an irreversible provider call before its business transaction commits.

**Rationale:** An uncommitted operation cannot safely claim an irreversible external effect.

### Route required external effects durably (EXT.CONCURRENCY.IDEMPOTENTREP.007)

**Requirement:** An idempotent operation MUST use the outbox extension or a documented provider idempotency contract for required external effects.

**Rationale:** Durable routing or provider replay protection aligns external effects with retries.

### Set key retention (EXT.CONCURRENCY.IDEMPOTENTRET.001)

**Requirement:** An idempotency owner MUST set key retention from the caller retry window and business risk.

**Rationale:** Retention lasts through the period in which callers can safely retry.

### Bound expired-record cleanup (EXT.CONCURRENCY.IDEMPOTENTRET.002)

**Requirement:** An idempotency owner MUST remove expired records through a bounded maintenance process.

**Rationale:** Bounded maintenance prevents cleanup from overwhelming normal application work.

### Retain safe retry keys (EXT.CONCURRENCY.IDEMPOTENTRET.003)

**Requirement:** An idempotency owner MUST NOT expire a key before callers can safely retry.

**Rationale:** Early expiration can turn a retry into duplicate business work.

### Declare replayed transport outcomes (EXT.CONCURRENCY.IDEMPOTENTOUT.001)

**Requirement:** An idempotent use case MUST list the statuses and headers stored for replay.

**Rationale:** The list defines the transport result that a completed retry can reproduce.

### Restrict replay data (EXT.CONCURRENCY.IDEMPOTENTOUT.002)

**Requirement:** An idempotent implementation MUST store only safe response fields required to reproduce an accepted result.

**Rationale:** Replay data needs enough information for callers without retaining unnecessary sensitive content.

### Exclude unsafe replay outcomes (EXT.CONCURRENCY.IDEMPOTENTOUT.003)

**Requirement:** An idempotent implementation MUST NOT replay authentication failures, transient server failures, `Set-Cookie`, hop-by-hop headers, tokens, or secrets.

**Rationale:** These values are unsafe, transient, or unrelated to the accepted operation result.

## Conventions

### Use the standard idempotency header (EXT.CONCURRENCY.CONVENTION.001)

**Default:** Use `Idempotency-Key` for HTTP commands that accept client keys.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The standard header makes client-key behavior recognizable at the HTTP boundary.

### Keep idempotency persistence in Infrastructure (EXT.CONCURRENCY.CONVENTION.002)

**Default:** Keep idempotency persistence and transaction handling in Infrastructure.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Provider transactions and constraints belong outside Application and Domain.

### Map replay responses at the API boundary (EXT.CONCURRENCY.CONVENTION.003)

**Default:** Keep replay response mapping at the API boundary.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** HTTP statuses and headers are transport concerns.

### Declare applicable headers (EXT.CONCURRENCY.CONVENTION.004)

**Default:** Declare the idempotency header as required on each applicable HTTP operation.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Generated API contracts expose the requirement through `API.OPENAPI.003`.

## Dependencies

No additional package is required by the baseline implementation.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.CONCURRENCY.ADOPT.001 | inspection | The use-case specification names conflicts, invalid state, winner behavior, and caller response. |
| EXT.CONCURRENCY.ADOPT.002 | inspection | Every version check links to a documented conflicting-write case. |
| EXT.CONCURRENCY.VERSION.001 | test | `ConcurrencyVersionTests` race conflicting aggregate writes with expected versions. |
| EXT.CONCURRENCY.VERSION.002 | test | `ConcurrencyVersionTests` asserts a failed expected version returns 409 Problem Details with its stable code. |
| EXT.CONCURRENCY.VERSION.003 | test | `ConcurrencyVersionTests` asserts conflicting accepted writes preserve the winner without silent replacement. |
| EXT.CONCURRENCY.VERSION.004 | test | `ConcurrencyVersionTests` require and validate a strong persistence-derived ETag. |
| EXT.CONCURRENCY.VERSION.005 | test | Missing and stale `If-Match` tests return the documented status and code. |
| EXT.CONCURRENCY.VERSION.006 | static | `ConcurrencyVersionTests` asserts public transport models expose no provider-specific version field. |
| EXT.CONCURRENCY.IDEMPOTENTKEY.001 | test | `IdempotencyKeyTests` asserts same keys from different actors or operations do not replay each other. |
| EXT.CONCURRENCY.IDEMPOTENTKEY.002 | test | `IdempotencyKeyTests` commit replay state with the accepted business change. |
| EXT.CONCURRENCY.IDEMPOTENTKEY.003 | test | `IdempotencyKeyTests` asserts reused keys with changed input return the documented rejection. |
| EXT.CONCURRENCY.IDEMPOTENTKEY.004 | test | `IdempotencyKeyTests` asserts concurrent inserts prove the actor-operation-key uniqueness constraint. |
| EXT.CONCURRENCY.IDEMPOTENTKEY.005 | test | `IdempotencyKeyTests` asserts equivalent mapped requests produce one fingerprint without credentials or client key. |
| EXT.CONCURRENCY.IDEMPOTENTKEY.006 | inspection | Stored fingerprint review confirms sensitive source data is hashed when not required. |
| EXT.CONCURRENCY.IDEMPOTENTREP.001 | test | `IdempotencyReplayTests` return the original accepted status and body. |
| EXT.CONCURRENCY.IDEMPOTENTREP.002 | test | `IdempotencyReplayTests` prove the documented wait, in-progress, or conflict behavior. |
| EXT.CONCURRENCY.IDEMPOTENTREP.003 | test | `IdempotencyReplayTests` leave no completed replay record without its business change. |
| EXT.CONCURRENCY.IDEMPOTENTREP.004 | test | `IdempotencyReplayTests` reload and replay the matching winner record. |
| EXT.CONCURRENCY.IDEMPOTENTREP.005 | test | `IdempotencyReplayTests` leave no business change or completed replay state. |
| EXT.CONCURRENCY.IDEMPOTENTREP.006 | inspection | Integration review shows irreversible provider calls occur after commit. |
| EXT.CONCURRENCY.IDEMPOTENTREP.007 | inspection | Required effects select an outbox or documented provider idempotency contract. |
| EXT.CONCURRENCY.IDEMPOTENTRET.001 | inspection | The use case records retry window, risk, and retention duration. |
| EXT.CONCURRENCY.IDEMPOTENTRET.002 | test | `IdempotencyRetentionTests` show bounded deletion of expired idempotency records. |
| EXT.CONCURRENCY.IDEMPOTENTRET.003 | test | `IdempotencyRetentionTests` reject expiration before the documented safe retry time. |
| EXT.CONCURRENCY.IDEMPOTENTOUT.001 | inspection | The use case lists replayed statuses and headers. |
| EXT.CONCURRENCY.IDEMPOTENTOUT.002 | inspection | Stored replay records contain only fields required for accepted-result reproduction. |
| EXT.CONCURRENCY.IDEMPOTENTOUT.003 | test | `IdempotencyOutcomeTests` exclude authentication, transient failures, cookies, hop-by-hop headers, tokens, and secrets. |
| EXT.CONCURRENCY.CONVENTION.001 | inspection | HTTP contract review uses `Idempotency-Key` or records a local replacement. |
| EXT.CONCURRENCY.CONVENTION.002 | inspection | Source review locates idempotency transaction work in Infrastructure. |
| EXT.CONCURRENCY.CONVENTION.003 | inspection | Source review locates replay HTTP mapping at the API boundary. |
| EXT.CONCURRENCY.CONVENTION.004 | static | `ConcurrencyTests` asserts generated OpenAPI declares the header for every applicable operation. |
