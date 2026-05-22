# Architecture Decision Record Template

An Architecture Decision Record (ADR) captures a significant architectural or technology decision, including the context that prompted it and the consequences of making it. ADRs are the institutional memory of design decisions; they explain not just what was decided but why, which is the information that matters when the decision is revisited months or years later.

---

## When to Write an ADR

Write an ADR for any decision that meets one or more of the following criteria:

- The decision adds a new dependency (NuGet package, external service, infrastructure component).
- The decision involves a trade-off between at least two viable alternatives.
- The decision is non-obvious: a future engineer reading the code would wonder why this was done this way.
- The decision reverses or significantly changes an earlier decision.
- The decision affects multiple projects or teams.

**When NOT to write an ADR:** Implementation details that follow directly from existing conventions do not need an ADR. If the decision is "use `IEndpoint` for this new endpoint" (because that is what the convention says), no ADR is needed.

---

## Decision File Naming

**In this standards repository:** `docs/decisions/{kebab-case-topic}.md` with no numeric prefix. Add a row to `docs/decisions/README.md` listing the canonical convention file.

**In a consumer project:** `docs/decisions/{kebab-case-topic}.md` in that project's repository for project-specific choices.

**Examples:**
- `docs/decisions/litebus-as-mediator.md` (standards repo)
- `docs/decisions/azure-blob-storage-for-attachments.md` (consumer project)

---

## ADR Structure

```markdown
# {Title - short, imperative, describes the decision}

**Status:** Proposed | Accepted | Deprecated | Superseded by [{slug}]({slug}.md)

**Canonical rules:** `docs/conventions/...` (path agents MUST follow)

**Date:** YYYY-MM-DD

## Context

What situation or problem prompted this decision? Describe the current state, the constraints, and why a decision was needed. Be specific. Include any relevant technical, organizational, or business context.

## Decision

What was decided? State it clearly in one or two sentences. This section should be immediately understandable without reading the Context section.

## Consequences

### Positive

- (List the benefits of this decision)

### Negative

- (List the costs or limitations introduced by this decision)

### Risks

- (List any risks that should be monitored)
```

---

## Filled-In Example

Below is a complete, realistic example ADR.

---

# 0003. CQRS with Split Application Projects

**Status:** Accepted

**Date:** 2025-01-01

## Context

The application layer handles two fundamentally different concerns: commands (write operations that change state) and queries (read operations that return data). When these are co-located, several problems emerge over time:

- Query handlers load full domain aggregates to extract a small subset of fields for display, which is wasteful and slow.
- Write-side complexity (validation, business rules, domain event publishing) bleeds into query code.
- Agents pattern-match on nearby code. If a query handler and a command handler are in the same folder, agents tend to write query handlers that look like command handlers (loading aggregates, calling domain methods, raising events).

Command Query Responsibility Segregation (CQRS) separates the write model from the read model. The write side uses the domain model. The read side uses projections through `IDatabaseContext`. These are different patterns, and they should be in different places.

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

- If the project reference rules are not enforced by architecture tests, the boundaries will erode as shortcuts are taken. Architecture tests are required (see `docs/decisions/architecture-tests-as-enforcement.md`).
