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

The default event handling approach is in-process: domain events are raised in the command handler and handled synchronously by `Application.Reactions` event handlers. The Outbox pattern is the approved escalation path when a specific, documented reliability requirement exists. When the Outbox pattern is adopted for a project, it is implemented in Infrastructure using the existing narrow interface pattern from `Application.Reactions`.

## Consequences

### Positive

- The default approach is simple and works for the majority of use cases.
- Escalation to the Outbox pattern is a documented, approved path with a known implementation strategy.
- The narrow interface pattern in `Application.Reactions` means the event handler code does not change when the delivery mechanism changes from in-process to outbox-backed.

### Negative

- Teams must recognize when the simple approach is no longer sufficient and escalate proactively. Missing this escalation point means events are lost in production before the pattern is adopted.
- Once the Outbox pattern is introduced, it adds meaningful operational complexity (outbox table maintenance, dispatcher service, monitoring).

### Risks

- The escalation trigger ("when a specific reliability requirement is identified") requires a judgment call. Without clear criteria, teams may escalate too early (adding unnecessary complexity) or too late (losing events in production). Teams adopting this escalation should document their reliability requirements explicitly in an ADR at the time they escalate.
