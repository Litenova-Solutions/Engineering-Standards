# 0003. CQRS with Split Application Projects

**Status:** Accepted

**Date:** 2025-01-01

## Context

The application layer handles two fundamentally different concerns: commands (write operations that change state) and queries (read operations that return data). When these are co-located, several problems emerge over time:

- Query handlers load full domain aggregates to extract a small subset of fields for display, which is wasteful and slow.
- Write-side complexity (validation, business rules, domain event publishing) bleeds into query code.
- Agents pattern-match on nearby code. If a query handler and a command handler are in the same folder, agents tend to write query handlers that look like command handlers (loading aggregates, calling domain methods, raising events).

Command Query Responsibility Segregation (CQRS) separates the write model from the read model. The write side uses the domain model. The read side uses projections and read stores. These are different patterns, and they should be in different places.

Three structural options were considered:

1. **Single Application project:** Commands and queries co-located. No structural enforcement of the CQRS principle.
2. **Two Application projects (Write + Read):** Structural separation at the project level. The compiler prevents cross-referencing between the two sides in most cases.
3. **Five Application projects (Write.Contracts, Write, Read.Contracts, Read, Reactions):** Full separation including Contracts projects that the WebApi layer can reference without taking a dependency on handler implementations.

Option 3 is more projects but provides the strongest enforcement. It prevents WebApi from directly calling a handler, prevents query handlers from importing command types, and separates the Reactions event handling concern into its own project with its own dependency rules.

## Decision

The application layer is split into five projects: `Application.Write.Contracts`, `Application.Write`, `Application.Read.Contracts`, `Application.Read`, and `Application.Reactions`. This structure enforces the CQRS split at the compiler level. See `docs/conventions/backend/03-application-layer.md` for the full convention.

## Consequences

### Positive

- Agents cannot write a query handler that loads a domain aggregate because the aggregate type is not available in the `Application.Read` project unless explicitly referenced (which the convention prohibits).
- WebApi references only the Contracts projects, keeping the API layer's dependency surface minimal and stable.
- Reactions have their own dependency rules (no external libraries) that are enforced by project references.
- The separation makes the intent of each project immediately clear to any engineer or agent reading the solution.

### Negative

- Five projects instead of one increases solution complexity and the number of files an agent must understand.
- Every new feature requires touching multiple projects (the Contracts project for the type, the implementation project for the handler).
- The correct project for a given type must be documented clearly; agents frequently put handlers in Contracts projects without explicit instruction.

### Risks

- If the project reference rules are not enforced by architecture tests, the boundaries will erode as shortcuts are taken. Architecture tests are required (see ADR 0009).
