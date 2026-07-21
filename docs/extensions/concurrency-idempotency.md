# Concurrency and Idempotency

## Intent

Concurrency control protects invariants when accepted writes overlap. Idempotency protects the same operation from duplicate execution when a caller retries or a network response is uncertain.

## Activation

Enable `concurrency-idempotency` when the Use case carries the `concurrency` Risk, two accepted writes can conflict, or a retry can duplicate an irreversible or externally visible effect.

This extension adds no baseline project and replaces no baseline rule.

## Agent Summary {#agent-summary}

- Name the invariant or duplicate effect being protected.
- Use expected aggregate versions for conflicting writes.
- Scope idempotency keys to actor and operation.
- Store request fingerprint and result atomically with the business change.
- Replay completed results and reject key reuse with different input.
- Test real concurrent requests against PostgreSQL.

## Standards

### Name the protected invariant (EXT.CONCURRENCY.ADOPT.001)

Document the conflicting operations, invalid combined result, expected winner behavior, and user-visible conflict response. Do not add version checks to every document without a conflicting-write case.

### Return version conflicts explicitly (EXT.CONCURRENCY.VERSION.001)

Store and compare the aggregate version through the selected persistence model. Map a failed expected version to status 409 Problem Details with a stable code.

Do not silently overwrite a conflicting accepted change.

For an HTTP operation that requires a caller version, return a strong `ETag` derived from the persistence version and require `If-Match` on the write. A missing precondition returns 428 with code `precondition_required`; a stale version returns 409 with code `version_conflict`. Do not expose a provider-specific version value in another contract field.

### Scope idempotency keys (EXT.IDEMPOTENCY.KEY.001)

Scope a client key to the authenticated actor and operation. Store its normalized request fingerprint, state, response status, response body, and expiry in the same transaction as the business change.

Reject reuse of one key with a different request fingerprint.

Enforce a unique database constraint on actor, operation, and key. Compute the fingerprint from a canonical representation of the mapped command input and route identity, excluding credentials and the idempotency key itself. Store a cryptographic hash rather than sensitive request content when the original values are not required for support.

### Replay the completed result (EXT.IDEMPOTENCY.REPLAY.001)

A repeated completed request returns the original status and response. A concurrent request for the same key waits, reports in-progress status, or returns a stable conflict according to the use-case contract.

The baseline stages the successful replay record and business change in one provider transaction. When concurrent requests race, one commit wins the unique key; the loser reloads the winner and replays it when the fingerprint matches. A failure before commit leaves neither the business change nor a completed replay record.

Do not perform an irreversible provider call before this transaction commits. Route required external effects through the outbox extension or use a provider idempotency contract documented by the external integrations extension.

### Bound key retention (EXT.IDEMPOTENCY.RETENTION.001)

Set retention from the caller retry window and business risk. Expired records are removed through a bounded maintenance process. Do not expire a key before callers may safely retry.

### Declare replayed outcomes (EXT.IDEMPOTENCY.OUTCOME.001)

The use case lists the statuses and headers stored for replay. Store only safe response fields required to reproduce the accepted result. Do not replay authentication failures, transient server failures, `Set-Cookie`, hop-by-hop headers, or a response body containing a token or secret.

## Conventions

Use the `Idempotency-Key` request header for HTTP commands that adopt client keys. Keep persistence and transaction handling in Infrastructure. Keep response replay mapping at the API boundary.

## Dependencies

No additional package is required by the baseline implementation.

## Verification

- Run PostgreSQL integration tests with concurrent writes.
- Send a command without `If-Match`, then with current and stale entity tags when version preconditions apply.
- Repeat the same request before, during, and after completion.
- Reuse a key with changed input and verify rejection.
- Simulate a lost response followed by retry.
- Verify retention and cleanup behavior.
- Verify replay excludes secret and transport-only headers.
