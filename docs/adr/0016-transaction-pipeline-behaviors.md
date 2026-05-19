# 0016. Transaction Management via Global LiteBus Pipeline Behaviors

**Status:** Accepted

**Date:** 2026-01-01

## Context

Command handlers need database transactions to ensure atomicity. Without a transaction, a command that modifies an aggregate and writes to a secondary table (for example, an outbox table) can leave the system in a partially updated state if the second write fails.

The options evaluated were:

1. Explicit `IUnitOfWork` interface injected into every command handler. Handlers call `SaveChangesAsync` explicitly. Maximum explicitness, maximum boilerplate.
2. A LiteBus pipeline post-handler that calls `SaveChangesAsync` after every command. Handlers contain no persistence code. The pipeline handles it.

Option 2 was chosen. The rationale: transaction management is not business logic. It is infrastructure ceremony that belongs in infrastructure, not in every command handler. The same reasoning applies to `GlobalExceptionHandler` removing `try-catch` from every endpoint: cross-cutting infrastructure concerns belong in a central location.

LiteBus supports global handlers typed against `ICommand` that run for every command via polymorphic dispatch. This covers both `ICommand` (void) and `ICommand<TResult>` (with result).

Three global handlers are registered in Infrastructure:

- `TransactionCommandPreHandler : ICommandPreHandler<ICommand>` at priority 10. Opens a database transaction. Runs after validators (priority 0) so no transaction is opened for invalid input.
- `SaveChangesCommandPostHandler : ICommandPostHandler<ICommand>`. Calls `SaveChangesAsync` and commits the transaction after the command handler succeeds.
- `RollbackCommandErrorHandler : ICommandErrorHandler<ICommand>`. Rolls back the transaction on any exception and re-throws.

The outbox pattern (ADR 0010) integrates into `SaveChangesCommandPostHandler`: before calling `SaveChangesAsync`, the post-handler collects domain events from tracked aggregates and writes them to the outbox table in the same transaction. Command handlers never change regardless of whether the outbox is active.

## Decision

Transaction management is handled by three global LiteBus pipeline behaviors registered in Infrastructure. Command handlers do not call `SaveChangesAsync`. Repositories do not call `SaveChangesAsync`. The pipeline handles all persistence.

## Consequences

### Positive

- Command handlers contain only business logic. No persistence ceremony.
- Repositories stage changes without committing. They are pure domain-operation implementations.
- The outbox pattern integrates in one place without touching any command handler.
- Adding a new command requires zero transaction-related code.

### Negative

- A developer reading a command handler cannot see where `SaveChangesAsync` is called. The behavior is in the pipeline.
- Debugging transaction issues requires understanding the pipeline, not just the handler.

### Risks

- A command that intentionally should not open a transaction (for example, a read-only side-effect command) would have a transaction opened unnecessarily. Use `[HandlerTag]` to exclude specific commands from the global pipeline behaviors when needed.
