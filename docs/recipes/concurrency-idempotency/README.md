---
{
  "id": "recipe.concurrency-idempotency",
  "kind": "recipe",
  "normative": true,
  "appliesTo": ["backend.application", "backend.infrastructure", "backend.api"],
  "recipes": ["concurrency-idempotency"]
}
---
# Concurrency and Idempotency

## RECIPE.CONCURRENCY.ADOPT.001 - Name the protected invariant

Enable optimistic concurrency when two accepted writes could violate a domain invariant. Do not add version checks to every document without a conflicting-write case.

## RECIPE.CONCURRENCY.VERSION.001 - Return conflicts explicitly

Store and compare the aggregate version through the selected persistence model. Map a failed expected version to Problem Details status 409 with a stable code.

## RECIPE.IDEMPOTENCY.KEY.001 - Scope idempotency keys

Scope a client key to the authenticated actor and operation. Store the request fingerprint, result, and expiry in the same transaction as the business change.

Reject reuse of one key with a different request fingerprint.

## RECIPE.IDEMPOTENCY.REPLAY.001 - Replay the completed result

A repeated completed request returns the original status and response. A concurrent request for the same key waits for or reports the in-progress operation according to the use-case contract.

## RECIPE.CONCURRENCY.GATES.001 - Test real conflicts and retries

Use PostgreSQL integration tests for concurrent writes and repeated requests. Unit tests alone cannot prove transaction behavior.

