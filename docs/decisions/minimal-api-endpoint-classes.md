# Minimal API Endpoint Classes

**Status:** Accepted

**Date:** 2025-01-01

## Context

ASP.NET Core supports two programming models for HTTP endpoints: MVC controllers (inherited from `ControllerBase`) and Minimal APIs (route registration with delegates or handlers).

The standard Minimal API approach registers routes inline in `Program.cs` or in extension methods that directly contain the handler logic. This works for simple cases but leads to a large, unstructured `Program.cs` as the number of endpoints grows. Logic in lambda delegates is difficult to test in isolation.

MVC controllers group related endpoints in a class, provide structure, and are familiar to most .NET engineers. However, they come with significant convention overhead: attribute routing, model binding conventions, action result types, and automatic DI. Agents trained on .NET code frequently generate MVC controllers because most public .NET samples use them.

A third approach uses Minimal APIs with a structured `IEndpoint` pattern: each endpoint is a class that implements a small interface with a `MapEndpoint(IEndpointRouteBuilder)` method. This provides the structure of a class without the MVC overhead, and it makes endpoints easy to test because the handler method is a concrete instance method, not a static lambda.

## Decision

All HTTP endpoints MUST implement `IEndpoint`. MVC controllers (classes inheriting from `ControllerBase` or `Controller`) are not used and MUST NOT be added. The `IEndpoint` interface and registration pattern are defined in `docs/conventions/backend/05-api-layer.md`.

## Consequences

### Positive

- No MVC overhead, attribute routing, or action result conventions.
- Each endpoint is a focused, independently testable class.
- Endpoint registration is explicit and discoverable: all `IEndpoint` implementations are registered by scanning the WebApi assembly.
- The constraint is easy to enforce with an architecture test (see `docs/decisions/architecture-tests-as-enforcement.md`).

### Negative

- The `IEndpoint` pattern is not a built-in ASP.NET Core convention; engineers unfamiliar with the codebase must read the convention file to understand it.
- Less community documentation compared to MVC controllers.

### Risks

- Agents trained heavily on MVC samples will default to generating controllers. This is the most common agent mistake listed in `AGENTS.md` and must be caught in code review.