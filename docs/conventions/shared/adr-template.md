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

## ADR File Naming

ADR files live in `docs/adr/` within the project repository.

File name format: `docs/adr/{NNNN}-{kebab-case-title}.md`

Where `NNNN` is a zero-padded sequential number starting at `0001`.

**Examples:**
- `docs/adr/0001-use-litebus-as-mediator.md`
- `docs/adr/0002-use-minimal-api-endpoint-classes.md`
- `docs/adr/0003-use-testcontainers-for-integration-tests.md`

---

## ADR Structure

```markdown
# {NNNN}. {Title - short, imperative, describes the decision}

**Status:** Proposed | Accepted | Deprecated | Superseded by [ADR-NNNN](NNNN-title.md)

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

# 0006. Contracts Projects for the Application Layer

**Status:** Accepted

**Date:** 2025-01-01

## Context

With the application layer split into Write, Read, and Reactions projects, the WebApi layer needs to reference command and query types to dispatch them. If WebApi references the implementation projects (`Application.Write`, `Application.Read`), it pulls in handler implementations as a transitive dependency. This is unnecessary and creates a larger dependency surface. It also means that a future refactoring of a handler implementation could break the WebApi build, even when the command or query type did not change.

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