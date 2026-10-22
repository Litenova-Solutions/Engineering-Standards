# Overview

## Intent

The Reference pages list exact values a reader looks up: terms, provision identifiers (IDs citing one rule each), file shapes, schemas, URLs, and the records behind decisions and audit duties. Every project uses them during any task that names a term, cites a provision, or edits a project file. A developer or agent opens them for lookup in the middle of other work, not for reading in order, and they state no rules of their own: each rule lives on the standards page they point to, so these pages stay exact while the rules stay in one place.

## How the Pages Fit Together

Two pages resolve what other pages cite: [Glossary](glossary.md) defines each LiteSpec term, and [Provisions](provisions.md) resolves each provision ID to its heading, page, and mark. Four pages state exact file and contract shapes: [Project File](project-file.md), [Release Manifest](manifest.md), [Schemas](schemas.md), and [Published URLs](published-urls.md). [Decision Records](decision-records.md) and [Audit Obligations](audit-obligations.md) are the two lookup companions: where a decision record lives and what it holds, and which outside obligations the audit extension satisfies.

## Terms and Provisions

- [Glossary](glossary.md): the one term for each LiteSpec concept.
- [Provisions](provisions.md): every provision ID resolved to its heading, page, and mark.

## Files and Contracts

- [Project File](project-file.md): every field of `litespec.project.json` and what reads it.
- [Release Manifest](manifest.md): every field of `litespec.manifest.json` and how to add a stack or extension.
- [Schemas](schemas.md): every JSON schema, the file it validates, and the command that checks it.
- [Published URLs](published-urls.md): every URL the site serves for agents and people.

## Decisions and Obligations

- [Decision Records](decision-records.md): where a decision record lives, what it holds, and how it ends.
- [Audit Obligations](audit-obligations.md): the external obligations the audit extension satisfies.
