# 0008. Reactions Project Depends Only on Abstractions

**Status:** Accepted

**Date:** 2025-01-01

## Context

The `Application.Reactions` project contains event handlers that react to domain events by triggering side effects: sending emails, publishing messages to an event bus, calling external APIs, updating read models in a different bounded context. These side effects require external library dependencies: SMTP clients, message bus clients, HTTP clients.

Two approaches were considered:

1. Let `Application.Reactions` reference infrastructure libraries (e.g., an email sending NuGet package) directly. Event handlers call the library APIs directly.
2. `Application.Reactions` defines narrow interfaces for each external capability (e.g., `IPostPublishedEmailer`, `IPostEventPublisher`). Infrastructure implements those interfaces. `Application.Reactions` has no dependency on any external library.

Approach 1 is simpler in the short term. Approach 2 keeps `Application.Reactions` in the Application layer where it belongs, not in the Infrastructure layer. The distinction matters because the event handler contains business logic about what should happen when an event occurs. That logic should not be coupled to the specific email library or message bus client in use.

With approach 2, the event handler is testable with NSubstitute mocks of the narrow interfaces. Switching email providers requires changing only the Infrastructure implementation, not the event handler.

## Decision

`Application.Reactions` MUST NOT reference external libraries (SMTP clients, HTTP clients, message bus clients, EF Core) directly. For every external capability an event handler needs, `Application.Reactions` defines a narrow interface. Infrastructure implements that interface. This is the same pattern used for repository interfaces in the Domain layer.

## Consequences

### Positive

- Event handlers are testable in isolation with mocked narrow interfaces.
- Switching external service providers requires changing only the Infrastructure implementation.
- The `Application.Reactions` project has no external library dependencies, which keeps its dependency graph minimal and its build fast.
- The narrow interface documents exactly what capability is needed, not how it is implemented.

### Negative

- Every external capability requires a new interface definition and a corresponding Infrastructure implementation class.
- Engineers must understand that `Application.Reactions` is an Application-layer project, not an Infrastructure-layer project, to understand why this restriction exists.

### Risks

- Agents frequently add NuGet package references to `Application.Reactions` because the event handler code that calls an email API looks similar to Infrastructure code. This is a listed common agent mistake in `AGENTS.md`.
