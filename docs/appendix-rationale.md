# Appendix: Rationale

This appendix is the short human-facing rationale for the standards. Agents do not need this file for routine coding tasks.

## Why These Standards Exist

The standards optimize for codebases where humans and AI agents both contribute. The goal is not ceremony. The goal is repeatable correctness under imperfect context.

The architecture favors:

- Compiler-enforced boundaries over team memory.
- Explicit code over framework magic.
- Small layer-specific convention files over one large rulebook.
- `// GOOD:` and `// BAD:` examples because agents copy examples.
- ADRs for decisions that future engineers will question.

## Core Trade-Offs

The backend uses Clean Architecture, CQRS, and split Contracts projects because project references prevent common mistakes. This creates more files, but it gives WebApi a small dependency surface and prevents query handlers from drifting into write-side behavior.

The read side intentionally accepts an EF Core dependency in `Application.Read` through `IDatabaseContext`. This is not pure Clean Architecture. It is a deliberate trade: fewer low-value read store interfaces in exchange for direct LINQ projections and simpler agent behavior.

The Domain project has no EF Core package reference, but aggregate shape is EF-compatible. Private constructors, private setters, and backing fields exist for materialisation. This is structural coupling, and the standards name it plainly.

## Production Bias

The standards now include reliability, observability, security, caching, background jobs, real-time updates, and deployment safety because production failures usually happen between layers:

- A request is retried and creates duplicate state.
- A transaction commits but a notification is lost.
- A migration is technically valid but not safe for rolling deployment.
- Logs exist but cannot be connected to a trace or user report.
- The frontend hides a button and mistakes that for authorization.

Each convention gives the default path and the escalation point. Projects can stay simple, but there is a documented route when the simple path stops being enough.

## What Belongs In Project Repositories

The standards do not define project-specific domain language, aggregate inventories, feature lists, exception lists, deployment targets, tenant models, or production thresholds. Those belong in the consuming project using the templates in `docs/templates/`.

Keeping project facts out of the shared standards prevents convention files from becoming stale or tied to one product.

