# 0004. LiteBus as Mediator

**Status:** Accepted

**Date:** 2025-01-01

## Context

The application layer needs a mediator to dispatch commands, queries, and events to their handlers without the dispatcher knowing which handler to call. This decouples the WebApi layer from the application layer's handler implementations and enables features like pipeline behaviors (validation, logging) to be applied uniformly.

The dominant choice in the .NET ecosystem is MediatR. LiteBus is a newer alternative that is modular: individual NuGet packages are installed for each message type (commands, queries, events) rather than a single monolithic package.

Several factors were evaluated:

1. **MediatR:** Mature, widely used, large community. Single package with all features. All requests go through one `IMediator` or `ISender` interface.
2. **LiteBus:** Modular packages per message type. Explicit `ICommandBus`, `IQueryBus`, `IEventBus` interfaces as well as a combined `IMessageBus`. Actively maintained.

The modular design of LiteBus has a practical benefit for agent context: when an agent sees a constructor injecting `ICommandBus`, it knows the class dispatches commands. When it sees `IQueryBus`, it knows the class dispatches queries. This is more self-documenting than a single `IMediator` interface that can dispatch anything.

The combined `IMessageBus` interface is used in endpoints where readability of the endpoint code is more important than the injected type's specificity.

## Decision

LiteBus is the approved mediator library. MediatR is not used and MUST NOT be added as a dependency. The specific LiteBus packages used per project are defined in `docs/conventions/backend/01-solution-structure.md`.

## Consequences

### Positive

- Modular packages keep each project's dependency surface small: the Domain project does not need a mediator package at all.
- The specific bus interfaces (`ICommandBus`, `IQueryBus`) are self-documenting.
- LiteBus is actively maintained and supports .NET 10.

### Negative

- LiteBus is less widely known than MediatR; engineers familiar only with MediatR must learn the LiteBus API.
- Fewer community resources (blog posts, Stack Overflow answers) exist for LiteBus.
- Code samples from the internet frequently use MediatR and must be translated.

### Risks

- If an agent pattern-matches on MediatR samples from its training data, it may use `IMediator` or `ISender` instead of the LiteBus interfaces. This is explicitly called out in `AGENTS.md` as a common mistake.
