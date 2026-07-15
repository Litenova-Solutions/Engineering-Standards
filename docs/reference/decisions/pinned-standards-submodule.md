---
{
  "id": "reference.decision.pinned-standards-submodule",
  "kind": "reference",
  "normative": false,
  "appliesTo": ["delivery", "agent"],
  "recipes": []
}
---
# Pinned Standards Submodule

Status: Accepted for v1.

## Context

Consumer agents need the exact rules that apply to their repository. Tracking `main` changes those rules without an application pull request and can make a previously passing branch non-compliant.

## Decision

Application repositories add this repository at root path `standards/` and pin the exact release commit. `.gitmodules` does not declare a moving branch. A short consumer `AGENTS.md` and `standards.project.json` select project context.

## Consequence

Every standards upgrade is reviewable and repeatable. Consumers must initialize submodules after clone and update them through dedicated pull requests.
