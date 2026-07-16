# LiteBus Commit Pipeline

Status: Accepted for v1.

## Context

Calling commit from each handler repeats persistence behavior and makes an omitted call a data-loss defect. A public unit-of-work wrapper adds an abstraction over the scoped persistence session.

## Decision

Command handlers and repositories stage changes. One global LiteBus command post-handler commits the scoped session after the handler succeeds. A failed handler leaves the session uncommitted.

## Consequences

Transaction behavior is less visible inside each handler and consistent across commands. Conventions and consumer tests make the commit boundary explicit. Durable events join the same commit through the `outbox-worker` extension.
