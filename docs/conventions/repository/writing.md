# Repository Writing

## Intent

Written artifacts are part of the standards contract. Consistent structure and ASCII-safe prose keep documents readable in terminals, source control, and agent context windows.

## Agent Summary {#agent-summary}

- Write prose with ASCII characters and straight punctuation.
- Use the required topic sections and canonical rule IDs.
- State constraints and decisions with concrete examples.
- Give new or materially changed consumer documents complete ownership and freshness metadata.
- Use normative vocabulary for required and optional behavior.
- Run the repository writing checks before review.

## Standards

### Keep prose ASCII-safe (WRITING.ASCII.001)

Prose, headings, comments, commit messages, and document metadata MUST use ASCII characters. Use a hyphen, comma, colon, or new sentence instead of a non-ASCII dash, arrow, quote, bullet, or math symbol. Code, data, and genuine mathematical expressions MAY contain non-ASCII content when the content is required by the artifact.

### Use explicit normative language (WRITING.NORMATIVE.001)

Standards and `AGENTS.md` MUST state required behavior directly. Use `MUST`, `MUST NOT`, `REQUIRED`, or `FORBIDDEN` when the requirement level needs explicit emphasis. Use `SHOULD` only when a documented reason permits a deviation. Conventions describe defaults and replacement points without weakening a standard.

### Keep topic structure stable (WRITING.STRUCTURE.001)

A convention or extension document MUST separate `Intent`, `Agent Summary`, `Standards`, `Conventions`, and `Verification`. A standard heading places its human title before one unique rule ID. Include at least one concrete example for each non-trivial topic.

### Use a consistent document metadata block (WRITING.METADATA.001)

New or materially changed consumer-authored product, domain, subject, use-case, architecture, API, operations, decision, page, and runbook documents MUST include this block near the document title:

```text
## Document metadata

- Owner: __OWNER__.
- Document status: `current`, `planned`, `retired`, or `reference`.
- Last verified: `YYYY-MM-DD`.
- Canonical source: `This document` or one repository path.
- Implementation evidence: code paths, test paths, acceptance IDs, generated artifacts, operating records, or `None`.
```

The date records the last verification against the referenced source, not the creation date. A document that names a current route, state, rule, or operation MUST identify the implementation and test evidence that supports it. Use `planned` for target behavior that has no implementation evidence.

### Run repeatable writing checks (WRITING.CHECK.001)

Before review, scan changed written files for non-ASCII characters, placeholder text outside intentional templates, duplicate rule IDs, broken internal links, and missing or incomplete document metadata. Run `git diff --check` and report every skipped check.

## Conventions

Use short paragraphs, descriptive headings, and tables for exact mappings. Name the specific field, rule, path, or command that needs attention. Link to the canonical rule instead of copying it into another document.

## Examples

Write `Use a hyphen in prose.` instead of inserting a typographic dash. Write `ARCH.CQRS.001` after a rule title instead of referring to an unnamed architecture requirement. A current subject specification may list `apps/api/src/Example.Domain/Posts/Post.cs`, `apps/api/tests/Example.Domain.Tests/Posts/PostTests.cs`, and `AC-POSTS-CREATE-DRAFT-01` as implementation evidence.

## Verification

- Scan changed prose with `rg -n -P '[^\x00-\x7F]'`.
- Scan for placeholders, banned terms, and duplicate rule IDs.
- Validate the owner, document status, verification date, canonical source, and implementation evidence fields on new or materially changed consumer documents.
- Resolve every relative Markdown link and anchor.
- Run `git diff --check`.
