# 0006. Contracts Projects for the Application Layer

**Status:** Accepted

**Date:** 2025-01-01

## Context

With the application layer split into Write, Read, and Reactions projects (see ADR 0003), the WebApi layer needs to reference command and query types to dispatch them. If WebApi references the implementation projects (`Application.Write`, `Application.Read`), it pulls in handler implementations as a transitive dependency. This is unnecessary and creates a larger dependency surface. It also means that a future refactoring of a handler implementation could break the WebApi build, even when the command or query type did not change.

Two approaches were considered:

1. Let WebApi reference the implementation projects and accept the larger dependency surface.
2. Create separate Contracts projects (`Application.Write.Contracts`, `Application.Read.Contracts`) containing only the public-facing types. WebApi references only the Contracts projects.

The compiler enforces the boundary in approach 2: WebApi cannot call a handler directly because it has no reference to the implementation project. The only way to invoke a handler is through the mediator (`IMessageBus`), which is the correct pattern.

## Decision

`Application.Write.Contracts` and `Application.Read.Contracts` are dedicated projects containing only the public contract types: commands, command results, queries, query results, and read store interfaces. WebApi references only the Contracts projects, not the implementation projects. The implementation projects also reference their own Contracts project.

## Consequences

### Positive

- WebApi has a minimal, stable dependency surface that changes only when the command or query API changes.
- The compiler prevents handlers from accidentally being placed in Contracts projects.
- The Contracts projects are the versioned API surface of the application layer.
- Agents cannot put a handler in a Contracts project because the build will fail if they try.

### Negative

- Two additional projects per application layer split.
- The distinction between Contracts and implementation must be understood by all engineers and agents.

### Risks

- Contracts projects can become bloated if non-contract types are placed there. The rule "no handlers in Contracts" must be enforced by architecture tests as a second line of defense.
