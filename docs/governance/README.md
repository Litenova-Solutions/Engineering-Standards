# Governance

Standards governance documents define how projects MAY diverge from MUST rules and how exceptions are tracked. These are not agent contract files; load them when requesting or reviewing a standards exception.

---

## Documents

| Document | Purpose |
|:---|:---|
| [exceptions.md](exceptions.md) | Process for waiving a MUST rule, project tier defaults, deprecation policy |
| [../decisions/README.md](../decisions/README.md) | Org-wide architecture decisions for the standards repository |
| [../conventions/shared/adr-template.md](../conventions/shared/adr-template.md) | Template for new decision records |

---

## Relationship to `docs/decisions/`

| Location | Scope |
|:---|:---|
| `docs/decisions/` (this repo) | Org-wide stack and pattern choices that affect all consumer projects |
| `docs/decisions/` (consumer project) | Project-specific ADRs and standards exceptions |
| `docs/governance/` | Meta-process for exceptions and tier defaults, not technology choices |

Consumer projects store active standards exceptions under `docs/decisions/exceptions/` or in the project ADR index with status **Active** / **Expired** (see `exceptions.md`).

---

## When agents load governance docs

- Routine coding: do not load.
- Security waiver, coverage threshold exception, or conflicting MUST rules: load `exceptions.md` and follow the exception process.
- New org-wide dependency or pattern reversal in the standards repo: write a decision in `docs/decisions/` using the ADR template.
