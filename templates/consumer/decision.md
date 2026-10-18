---
{
  "type": "decision",
  "id": "decision/<number>-<name>",
  "title": "<Decision display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "decided": "<YYYY-MM-DD, set on approval>",
  "options": ["<one option>"],
  "changeWhen": "<The measurable condition that reopens this decision>",
  "decides": ["<requirement, feature, rule, or constraint-applicability id>"],
  "basedOn": ["<constraint or research id, or remove this line>"],
  "replaces": "<decision id, or remove this line>",
  "terms": ["term/<term-name>"]
}
---
# <Decision display title>

## Context

State the situation that forced a choice, with the facts that bound it.

## Options

State each option weighed, with its strongest reason and its strongest cost.

## Decision

State the selected option in one paragraph. A decision is replaced, never edited after approval.

## Consequences

State what the product, the company, or the code now has to do, and the cost accepted.

## Evidence

Link each research record the decision rests on, with its confidence.
