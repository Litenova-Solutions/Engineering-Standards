# __PROJECT__ subject documents

## Document metadata

- Owner: __OWNER__.
- Document status: `current`, `planned`, `retired`, or `reference`.
- Last verified: `YYYY-MM-DD`.
- Canonical source: `This document` or one repository path.
- Implementation evidence: code paths, test paths, acceptance IDs, generated artifacts, operating records, or `None`.

This bucket contains one directory per business subject. Each subject directory has a routing README and one Markdown file per use case.

## Allowed content

- Subject READMEs with subject routing metadata.
- One use-case specification per operation under its subject directory.

Cross-cutting contracts, critical journeys, evidence registers, operating limits, and release coverage belong in `../cross-cutting/`.
