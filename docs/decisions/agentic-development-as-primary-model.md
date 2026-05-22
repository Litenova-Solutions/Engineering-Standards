# Agentic Development as Primary Development Model

**Status:** Accepted

**Date:** 2025-01-01

## Context

Software development teams are increasingly using AI coding assistants not just for autocomplete but as autonomous agents that read requirements, navigate codebases, write code, run tests, and submit pull requests with minimal human intervention per step. This is a qualitatively different use of AI than prompt-based autocomplete.

Agentic development introduces failure modes that do not exist with human developers: agents lose context between steps, hallucinate APIs and library interfaces, pattern-match on superficially similar code examples, and cannot make judgment calls when conventions are ambiguous. If the codebase and its conventions do not address these failure modes explicitly, agents will produce inconsistent, incorrect, or insecure code at scale.

Two approaches were considered:

1. Continue designing conventions primarily for human developers and treat AI assistance as a convenience layer with no explicit design decisions.
2. Treat AI agents as the primary developer and design conventions, project structure, and context files to eliminate the most common agent failure modes, while still producing code that human developers find clear and maintainable.

Approach 2 does not degrade the experience for human developers. The same structural clarity that prevents agents from making wrong decisions also makes code easier for humans to read and modify. The two goals are aligned.

## Decision

All conventions, project structure decisions, and context files in this repository are designed with agentic development as the primary use case. This means:

- Every convention file is structured to be loaded and acted on by an AI agent without requiring human interpretation.
- Project structure enforces architectural rules at the compiler level so agents cannot violate them without a build failure.
- Context files (`AGENTS.md`, `.cursor/rules/`, `.github/copilot-instructions.md`) are maintained as first-class engineering artifacts.
- When a convention exists primarily to prevent an agent failure mode, this is stated explicitly.

## Consequences

### Positive

- Agents produce more consistent code because ambiguity is removed from the conventions.
- Structural rules are enforced by the compiler, not only by code review.
- Context files give agents enough information to work in a new project without extensive onboarding.
- Human developers benefit from the same structural clarity.

### Negative

- More upfront investment in conventions and context files is required.
- Context files must be maintained alongside the codebase; stale agent context is worse than no context.
- Engineers must understand why conventions exist, not just what they are, in order to maintain the context files correctly.

### Risks

- If context files are allowed to drift from the actual codebase conventions, agents will produce code that follows the documented convention rather than the actual one. The conventions and context files must be updated together.