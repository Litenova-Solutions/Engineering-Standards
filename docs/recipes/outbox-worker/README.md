---
{
  "id": "recipe.outbox-worker",
  "kind": "recipe",
  "normative": true,
  "appliesTo": ["backend.infrastructure", "delivery"],
  "recipes": ["outbox-worker"]
}
---
# Outbox Worker

## RECIPE.OUTBOX.ADOPT.001 - Use outbox for durable delivery

Enable this recipe when a committed business change requires an event or side effect that cannot be reconstructed or retried manually.

## RECIPE.OUTBOX.ATOMIC.001 - Store events with the business change

The command post-handler serializes pending durable events into outbox records in the same database transaction as aggregate changes. It commits once after both are staged.

Each record contains an event ID, stable type, schema version, occurrence time, payload, attempt count, and processing state.

## RECIPE.OUTBOX.WORKER.001 - Dispatch from a separate Worker

Worker claims pending records, dispatches them, and records success or retry information. It uses bounded batches and cancellation. WebApi does not dispatch durable records inside the request transaction.

## RECIPE.OUTBOX.IDEMPOTENCY.001 - Accept duplicate delivery

Consumers must handle the same event more than once. Use an event ID or business idempotency key at the side-effect boundary.

## RECIPE.OUTBOX.OPERATIONS.001 - Expose backlog state

Publish pending count, failed count, oldest pending age, attempts, and dispatch duration. Provide a runbook for inspection and safe replay.
