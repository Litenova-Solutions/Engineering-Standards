# Repository Writing

## Intent

Written artifacts are part of the standards contract. Consistent structure and ASCII-safe prose keep documents readable in terminals, source control, and agent context windows.

## Agent Summary {#agent-summary}

- Write prose with ASCII characters and straight punctuation.
- Use the required topic sections and canonical rule IDs.
- State constraints and decisions with concrete examples.
- Give every structured consumer specification kind-specific ownership and freshness metadata.
- Use established technical terms and ordinary capitalization in prose.
- Use normative vocabulary for required and optional behavior.
- Run the repository writing checks before review.

## Standards

### Keep prose ASCII-safe (WRITING.ASCII.001)

Prose, headings, comments, commit messages, and Specification Metadata MUST use ASCII characters. Use a hyphen, comma, colon, or new sentence instead of a non-ASCII dash, arrow, quote, bullet, or math symbol. Code, data, and genuine mathematical expressions MAY contain non-ASCII content when the content is required by the artifact.

Natural-language product content is data for this purpose. A product whose subject is another language carries that language in its content files, and a diacritic there is part of a word rather than a typographic flourish. An ASCII check MUST exclude those paths by an explicit list and MUST still apply to every document about them.

### Use explicit normative language (WRITING.NORMATIVE.001)

Standards and `AGENTS.md` MUST state required behavior directly. Use `MUST`, `MUST NOT`, `REQUIRED`, or `FORBIDDEN` when the requirement level needs explicit emphasis. Use `SHOULD` only when a documented reason permits a deviation. Conventions describe defaults and replacement points without weakening a standard.

### Keep topic structure stable (WRITING.STRUCTURE.001)

A convention or extension document MUST separate `Intent`, `Agent Summary`, `Standards`, `Conventions`, and `Verification`. A standard heading places its human title before one unique rule ID. Include at least one concrete example for each non-trivial topic.

### Use kind-specific Specification Metadata (WRITING.METADATA.001)

Every structured consumer specification MUST start with one JSON block validated against `schemas/specification-metadata.schema.json`. The `kind` selects its allowed and required fields.

```json
{
  "kind": "use-case",
  "id": "orders.cancel-order",
  "specStatus": "approved",
  "implementationStatus": "planned",
  "owner": "Product and engineering",
  "lastReviewed": "2026-07-21",
  "operationType": "command",
  "actors": ["buyer"],
  "entryPoints": ["api"],
  "risks": ["authorization", "money"],
  "applicableExtensions": []
}
```

`specStatus` states whether the specification is draft, approved, or retired. Behavior specifications use `implementationStatus` to distinguish planned behavior from verified implementation. `lastReviewed` records the last review against current business and implementation facts, not the creation date.

The JSON block is the only metadata carrier. Do not add a separate Markdown document-metadata section for owner, status, review date, canonical source, or implementation evidence. Record canonical source in the specification body where relevant and implementation paths and verification evidence in the relevant specification sections.

### Use established terms and ordinary capitalization (WRITING.TERMS.001)

Use established terms such as module, aggregate, invariant, Command, Query, workflow, orchestrator, repository, projection, transaction, outbox, and idempotency with the meanings defined by the Agentic Engineering System and the glossary. Explain a technical term with a concrete example instead of replacing it with a softer local synonym.

Write module, use case, workflow, aggregate, invariant, event, reaction, and policy as ordinary lowercase nouns in prose. Capitalize a code type such as `CancelOrderCommand`, a project layer such as Domain, a title, or the first word of a sentence.

### Run repeatable writing checks (WRITING.CHECK.001)

Before review, scan changed written files for non-ASCII characters, placeholder text outside intentional templates, duplicate rule IDs, broken internal links, and missing or incomplete Specification Metadata. Run the reference consumer validator (`node standards/tools/validate-consumer.mjs`) to check Specification Metadata, internal links, and cross-file references in one pass. Run `git diff --check` and report every skipped check.

## Conventions

Use short paragraphs, descriptive headings, and tables for exact mappings. Name the specific field, rule, path, or command that needs attention. Link to the canonical rule instead of copying it into another document.

## Examples

Write `Use a hyphen in prose.` instead of inserting a typographic dash. Write `ARCH.CQRS.001` after a rule title instead of referring to an unnamed architecture requirement. A verified use-case specification maps `apps/api/src/Example.Application/Orders/CancelOrder/`, `apps/api/tests/Example.Integration.Tests/Orders/CancelOrderTests.cs`, and `AC-ORDERS-CANCEL-ORDER-01` in its implementation and verification sections.

## Verification

- Scan changed prose with `rg -n -P '[^\x00-\x7F]'`.
- Scan for placeholders, banned terms, and duplicate rule IDs.
- Validate Specification Metadata against its kind-specific schema.
- Resolve every relative Markdown link and anchor.
- Run `git diff --check`.
