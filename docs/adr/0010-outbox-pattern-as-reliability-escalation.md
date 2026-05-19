# 0010. Outbox Pattern as Reliability Escalation Path

**Status:** Accepted

**Date:** 2025-01-01

## Context

When a command handler saves a domain aggregate and raises domain events, the event handlers in `Application.Reactions` run in the same in-process transaction. If the event handler calls an external service (sends an email, publishes to a message bus) and that call fails after the database write has committed, the event is lost. There is no automatic retry.

For many business events, losing an event is acceptable in the short term: the failure is logged, the team is alerted, and the issue is resolved manually. For other events (payment confirmations, order status updates, compliance notifications), losing an event is not acceptable.

The Outbox pattern solves this by persisting domain events to an outbox table in the same database transaction as the aggregate write. A separate background process reads the outbox and dispatches events to external systems, retrying on failure until the event is delivered or moved to a dead-letter store.

This pattern adds significant complexity: the outbox table, the dispatcher service, retry logic, idempotency handling on the consumer side, and dead-letter management. Introducing this complexity before it is needed makes the codebase harder to understand and maintain.

Two approaches were considered:

1. Implement the Outbox pattern from the start for all projects.
2. Use the simple in-process event handling approach by default and escalate to the Outbox pattern only when a specific reliability requirement is identified.

## Decision

The default event handling approach is in-process: domain events are raised by aggregates and handled by `Application.Reactions` event handlers after the command transaction succeeds. The Outbox pattern is the approved escalation path when a specific, documented reliability requirement exists.

Escalate to the Outbox pattern when any of these are true:

- Losing one event would require manual data repair.
- The event triggers payment, billing, compliance, audit, or security work.
- The event updates another system of record.
- The event sends a user notification that must survive process restarts.
- The project needs retry, dead-letter, or delivery-age monitoring.

When the Outbox pattern is adopted for a project, Infrastructure owns the outbox table, serialization, leasing, retries, dead-letter handling, and dispatcher hosted service or worker. `Application.Reactions` keeps narrow interfaces and does not reference external libraries.

Consumers must be idempotent because a dispatcher can deliver the same message more than once after a crash between external delivery and marking the row processed.

## Consequences

### Positive

- The default approach is simple and works for the majority of use cases.
- Escalation to the Outbox pattern is a documented, approved path with a known implementation strategy.
- The narrow interface pattern in `Application.Reactions` means the event handler code does not change when the delivery mechanism changes from in-process to outbox-backed.

### Negative

- Teams must recognize when the simple approach is no longer sufficient and escalate proactively. Missing this escalation point means events are lost in production before the pattern is adopted.
- Once the Outbox pattern is introduced, it adds meaningful operational complexity (outbox table maintenance, dispatcher service, monitoring).
- Every consumer must handle duplicate delivery safely.

### Risks

- A project may delay escalation until after an event is lost. The reliability convention defines the required triggers and migration path. Teams adopting this escalation document their event delivery requirements explicitly in a project ADR.
