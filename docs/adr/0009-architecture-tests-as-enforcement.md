# 0009. Architecture Tests as Enforcement

**Status:** Accepted

**Date:** 2025-01-01

## Context

Architectural rules defined in documentation are enforced by code review. Code review is done by humans and is imperfect: reviewers miss violations under time pressure, and agents submitting pull requests without human review bypass this check entirely.

The rules that matter most for consistency are structural:
- No handler classes in Contracts projects.
- No domain aggregate loading in query handlers.
- No external library references in `Application.Reactions`.
- No `ControllerBase` subclasses in WebApi.
- Domain types not referencing application or infrastructure types.

These rules can be expressed as automated tests using NetArchTest. An architecture test that fails blocks the build. This turns a documentation rule into a compiler-equivalent enforcement mechanism.

Two approaches were considered:

1. Rely solely on code review to enforce structural rules.
2. Add a dedicated architecture test project (`{ProjectName}.Architecture.Tests`) that uses NetArchTest to assert structural rules as failing tests.

Approach 2 catches violations in CI before they reach code review. It is particularly valuable for agentic development where agents may produce structurally incorrect code that looks superficially correct.

## Decision

Every project that follows these standards MUST include an architecture test project (`{ProjectName}.Architecture.Tests`) with NetArchTest tests that assert the critical structural rules. Architecture tests are run as part of the standard `dotnet test` command. A failing architecture test blocks the build.

The required tests are documented in `docs/conventions/backend/08-testing.md`.

## Consequences

### Positive

- Structural rule violations are caught in CI, not only in code review.
- Agents cannot submit a pull request with a structural violation without seeing a test failure.
- Architecture tests document the structural rules in executable form, which is a more reliable reference than documentation.
- New engineers can read the architecture tests to understand what the structural rules are.

### Negative

- Architecture tests must be maintained alongside the codebase. When project names or namespaces change, the tests must be updated.
- NetArchTest adds a test project dependency.
- Writing good architecture tests requires understanding both the codebase structure and the NetArchTest API.

### Risks

- If the architecture test project is skipped or excluded from the test run, the enforcement mechanism is silently disabled. CI configuration MUST run all test projects, not a filtered subset.
