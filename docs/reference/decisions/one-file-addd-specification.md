---
{
  "id": "reference.decision.one-file-addd-specification",
  "kind": "reference",
  "normative": false,
  "appliesTo": ["use-case.authoring"],
  "recipes": []
}
---
# One-file ADDD Specification

Status: Accepted for v1.

## Context

The preliminary method repeated operation state, examples, test class names, test method names, coverage rows, and page information across multiple documents. These facts drifted as code moved.

## Decision

Keep one authored use-case file with stable acceptance IDs. Tests cite the IDs they prove, and reviewers verify that every active ID has evidence. Add page documents only for non-trivial composition.

## Consequence

Agents have one behavior source. Tests cite stable acceptance IDs, and review checks their coverage. The method retains explicit examples and critical risk analysis without requiring a separate test-spec document.
