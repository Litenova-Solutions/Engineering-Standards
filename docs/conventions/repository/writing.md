# Repository Writing

## Intent

Written artifacts are part of the standards contract. Consistent structure and ASCII-safe prose keep documents readable in terminals, source control, and agent context windows.

## Agent Summary {#agent-summary}

- Write prose with ASCII characters and straight punctuation.
- Use the required topic sections and canonical rule IDs.
- State constraints and decisions with concrete examples.
- Give every structured consumer specification kind-specific ownership and freshness metadata.
- Use normative vocabulary for required and optional behavior.
- Run the repository writing checks before review.

## Standards

### Keep prose ASCII-safe (WRITING.ASCII.001)

Prose, headings, comments, commit messages, and Specification Metadata MUST use ASCII characters. Use a hyphen, comma, colon, or new sentence instead of a non-ASCII dash, arrow, quote, bullet, or math symbol. Code, data, and genuine mathematical expressions MAY contain non-ASCII content when the content is required by the artifact.

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
  "recordStatus": "current",
  "deliveryStatus": "planned",
  "owner": "Product and engineering",
  "lastReviewed": "2026-07-21",
  "operationType": "command",
  "actors": ["buyer"],
  "entryPoints": ["api"],
  "risks": ["authorization", "money"],
  "applicableExtensions": []
}
```

`recordStatus` states whether the record is draft, current, or retired. Behavior specifications use `deliveryStatus` to distinguish approved planned behavior from verified implementation. `lastReviewed` records the last review against current business and implementation facts, not the creation date.

Do not duplicate owner, status, or review date in a Markdown metadata section. Put implementation paths and verification evidence in the relevant specification sections.

### Run repeatable writing checks (WRITING.CHECK.001)

Before review, scan changed written files for non-ASCII characters, placeholder text outside intentional templates, duplicate rule IDs, broken internal links, and missing or incomplete Specification Metadata. Run `git diff --check` and report every skipped check.

## Conventions

Use short paragraphs, descriptive headings, and tables for exact mappings. Name the specific field, rule, path, or command that needs attention. Link to the canonical rule instead of copying it into another document.

## Examples

Write `Use a hyphen in prose.` instead of inserting a typographic dash. Write `ARCH.CQRS.001` after a rule title instead of referring to an unnamed architecture requirement. A verified Use-case specification maps `apps/api/src/Example.Application/Orders/CancelOrder/`, `apps/api/tests/Example.Integration.Tests/Orders/CancelOrderTests.cs`, and `AC-ORDERS-CANCEL-ORDER-01` in its implementation and verification sections.

## Verification

- Scan changed prose with `rg -n -P '[^\x00-\x7F]'`.
- Scan for placeholders, banned terms, and duplicate rule IDs.
- Validate Specification Metadata against its kind-specific schema.
- Resolve every relative Markdown link and anchor.
- Run `git diff --check`.
