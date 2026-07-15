# Concurrency and Idempotency

## Intent

Concurrency control protects invariants when accepted writes overlap. Idempotency protects the same operation from duplicate execution when a caller retries or a network response is uncertain.

## Activation

Enable `concurrency-idempotency` when the use case carries the `concurrency` risk flag, two accepted writes can conflict, or a retry can duplicate an irreversible or externally visible effect.

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

### Scope idempotency keys (EXT.IDEMPOTENCY.KEY.001)

Scope a client key to the authenticated actor and operation. Store its normalized request fingerprint, state, response status, response body, and expiry in the same transaction as the business change.

Reject reuse of one key with a different request fingerprint.

### Replay the completed result (EXT.IDEMPOTENCY.REPLAY.001)

A repeated completed request returns the original status and response. A concurrent request for the same key waits, reports in-progress status, or returns a stable conflict according to the use-case contract.

### Bound key retention (EXT.IDEMPOTENCY.RETENTION.001)

Set retention from the caller retry window and business risk. Expired records are removed through a bounded maintenance process. Do not expire a key before callers may safely retry.

## Conventions

Use the `Idempotency-Key` request header for HTTP commands that adopt client keys. Keep persistence and transaction handling in Infrastructure. Keep response replay mapping at the API boundary.

## Dependencies

No additional package is required by the baseline implementation.

## Verification

- Run PostgreSQL integration tests with concurrent writes.
- Repeat the same request before, during, and after completion.
- Reuse a key with changed input and verify rejection.
- Simulate a lost response followed by retry.
- Verify retention and cleanup behavior.
