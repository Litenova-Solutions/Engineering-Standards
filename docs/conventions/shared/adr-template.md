# Architecture Decision Record Template

An Architecture Decision Record (ADR) captures a significant architectural or technology decision, including the context that prompted it and the consequences of making it. ADRs are the institutional memory of design decisions — they explain not just _what_ was decided but _why_, which is the information that matters when the decision is revisited months or years later.

---

## When to Write an ADR

Write an ADR for any decision that meets one or more of the following criteria:

- The decision adds a new dependency (NuGet package, external service, infrastructure component).
- The decision involves a trade-off between at least two viable alternatives.
- The decision is non-obvious: a future engineer reading the code would wonder "why was this done this way?"
- The decision reverses or significantly changes an earlier decision.
- The decision affects multiple projects or teams.

**When NOT to write an ADR:** Implementation details that follow directly from existing conventions do not need an ADR. If the decision is "use `IEndpoint` for this new endpoint" (because that's what the convention says), no ADR is needed.

---

## ADR File Naming

ADR files live in `docs/adr/` within the project repository (not in the standards repository).

File name format: `docs/adr/{NNNN}-{kebab-case-title}.md`

Where `NNNN` is a zero-padded sequential number starting at `0001`.

**Examples:**
- `docs/adr/0001-use-litebus-as-mediator.md`
- `docs/adr/0002-use-minimal-api-endpoint-classes.md`
- `docs/adr/0003-use-testcontainers-for-integration-tests.md`

---

## ADR Structure

```markdown
# {NNNN}. {Title — short, imperative, describes the decision}

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

# 0002. Use Minimal API Endpoint Classes over MVC Controllers

**Status:** Accepted

**Date:** 2024-03-01

## Context

The project initially scaffolded with MVC controllers as the default ASP.NET Core pattern. As the endpoint count grew, the controller classes accumulated multiple action methods, leading to files that violated the Single Responsibility Principle. Routing logic, dependency injection, and response shaping were all mixed together.

We evaluated two approaches for the next phase of development:

1. Continue with MVC controllers, but enforce one action per controller.
2. Switch to Minimal API endpoint classes (`IEndpoint`), where each use case is its own class.

The team has also adopted LiteBus as a mediator, which means endpoints no longer need to inject multiple services — they inject `ILiteBus` only. This makes the per-class endpoint pattern trivial to implement and removes the primary advantage controllers had (shared DI between actions).

## Decision

All HTTP endpoints will be implemented as classes implementing `IEndpoint`. No new MVC controllers will be created. Existing controllers will be migrated as their use cases are touched.

## Consequences

### Positive

- Each use case is fully self-contained: one folder, one endpoint class, one request model, one response model, one mappings class.
- Endpoints are trivially testable in isolation.
- Folder structure screams intent: `Endpoints/Posts/Create/` is unambiguous.
- No accidental coupling between different use cases that previously shared a controller.

### Negative

- Slightly more files per feature compared to a single controller with multiple actions.
- New team members familiar with MVC need to learn the `IEndpoint` pattern.

### Risks

- The `IEndpoint` interface is a hand-rolled abstraction, not a framework primitive. If the team grows significantly, the registration mechanism (assembly scanning) must be documented clearly to avoid duplicate registration bugs.
