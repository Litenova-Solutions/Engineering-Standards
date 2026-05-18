# 0004. LiteBus as Mediator

**Status:** Accepted

**Date:** 2025-01-01

## Context

The application layer needs a mediator to dispatch commands, queries, and events to their handlers without the dispatcher knowing which handler to call. This decouples the WebApi layer from the application layer's handler implementations and enables features like pipeline behaviors (validation, logging) to be applied uniformly.

The dominant choice in the .NET ecosystem is MediatR. LiteBus is a newer alternative that is modular: individual NuGet packages are installed for each message type (commands, queries, events) rather than a single monolithic package.

Several factors were evaluated:

1. **MediatR:** Mature, widely used, large community. Describes itself as a "low-ambition library". Tightly coupled with DI containers. All requests go through one `IMediator` or `ISender` interface. Resolution relies heavily on the DI container's `IServiceProvider`.
2. **LiteBus:** Designed with DDD and CQS as first-class citizens. Modular packages per message type. Offers clear separation of concerns with `ICommandMediator`, `IQueryMediator`, and `IEventPublisher` interfaces. Uses a central `MessageRegistry` with cached descriptors to minimize runtime reflection and maximize performance.

The modular design of LiteBus has a practical benefit for both performance and developer context. When an agent or engineer sees a constructor injecting `ICommandMediator`, its responsibility for state mutation is explicit. When it sees `IQueryMediator`, its read-only nature is clear.

The combined `IMessageMediator` interface is available but generally discouraged in favor of the specific mediators to maintain high-fidelity CQS.

## Decision

LiteBus is the approved mediator library. MediatR is not used and MUST NOT be added as a dependency. The specific LiteBus packages used per project are defined in `docs/conventions/backend/01-solution-structure.md`. Endpoints and services MUST inject `ICommandMediator` or `IQueryMediator` rather than a unified bus.

## Consequences

### Positive

- Modular packages keep each project's dependency surface small.
- Specific mediator interfaces (`ICommandMediator`, `IQueryMediator`) enforce clean CQS boundaries.
- Higher performance due to minimal reflection and cached handler resolution.
- Built-in support for advanced features like handler filtering ([HandlerTag]), priority, and a durable command inbox.
- Domain-driven API that aligns with our architecture.

### Negative

- LiteBus is less widely known than MediatR.
- Fewer community resources (blog posts, Stack Overflow answers) exist for LiteBus.
- Code samples from the internet frequently use MediatR and must be translated.

### Risks

- If an agent pattern-matches on MediatR samples from its training data, it may use `IMediator` or `ISender` instead of the LiteBus interfaces. This is explicitly called out in `AGENTS.md` as a common mistake.
