# Single Use-case Specification

Status: Accepted for v1.

## Context

The preliminary method repeated operation status, examples, test class names, test method names, coverage rows, and page information across multiple documents. Those facts drifted as code moved.

## Decision

Keep one authored use-case file with stable acceptance IDs. Tests cite the IDs they prove, and reviewers confirm that every active ID has evidence. Add page documents only for non-trivial composition.

## Consequences

Agents have one behavior source. Tests cite stable acceptance IDs without a second test inventory. The method retains explicit examples and risk analysis without requiring a separate test-spec document.
