# Standards Exceptions

Projects MAY diverge from a MUST rule when the exception is explicit, scoped, and reviewed.

---

## When to Request an Exception

- A MUST rule conflicts with a documented business constraint.
- A tooling gate cannot pass without disproportionate cost for a prototype or internal tool.
- A third-party integration requires a temporary deviation.

Agents MUST NOT silently compromise between conflicting normative files. See `AGENTS.md` (Conflict Resolution).

---

## Exception Process

1. Open an ADR using `docs/conventions/shared/adr-template.md` or add a **Standards exception** section to the project ADR index.
2. State the rule being waived, scope (project, layer, endpoint), expiry date, and owner.
3. Link the compensating control (manual review, extra test, monitoring).
4. For security-related waivers, require security owner approval.

Store active exceptions in `docs/decisions/exceptions/` or the project ADR index with status **Active** / **Expired**.

---

## Project Tier Defaults

| Tier | Coverage thresholds | Testcontainers | Aspire | Mutation testing |
|:---|:---|:---|:---|:---|
| Production | Full (`backend/08-testing.md`) | Required for query/integration | Default | High-risk validators |
| Internal | Reduced thresholds (document in ADR) | Required for query handlers touching SQL | Optional | Optional |
| Prototype | Best-effort; architecture tests still recommended | Optional | Optional | No |

Declare the project tier in the root README or `docs/domain/README.md`.

---

## Deprecation

When a MUST rule is relaxed or replaced in a standards release:

- Minor release: old pattern deprecated, new pattern required for new code.
- Major release: old pattern forbidden.

Document deprecations in GitHub Release notes and `RELEASES.md`.
