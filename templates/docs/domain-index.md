# __PROJECT__ Domain

## Document metadata

- Owner: __OWNER__.
- Document status: `current`, `planned`, `retired`, or `reference`.
- Last verified: `YYYY-MM-DD`.
- Canonical source: `This document` or one repository path.
- Implementation evidence: code paths, test paths, acceptance IDs, generated artifacts, operating records, or `None`.

## Bounded context

Name the single business boundary and the responsibilities inside it.

## Domain language

Use [glossary.md](glossary.md) as the canonical term list.

## Subjects

- Link each `docs/domain/subjects/{subject}/README.md` and state its user outcome.

## Domain document buckets

| Directory | Type | Allowed content |
|:---|:---|:---|
| `subjects/` | Subject specifications | Subject READMEs and their use-case specifications. |
| `cross-cutting/` | Shared domain records | Journeys, evidence, security, retention, provider, operating, and delivery contracts. |

Give both buckets a README that states its type, owner, and allowed artifacts. Do not place shared artifacts in a subject directory.

## Primary v1 journey

1. Link the ordered use cases that form the first releasable journey.

## Context-wide invariants

- Record only rules shared across subjects.
