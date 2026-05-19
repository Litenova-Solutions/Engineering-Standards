# GitHub Copilot Instructions

The canonical agent guide is `AGENTS.md` at the repository root (or `standards/AGENTS.md` when this repository is included as a submodule).

## Before Generating Code

1. Read `AGENTS.md` in full.
2. Identify the layer you are editing: Domain, Application.Write, Application.Read, Application.Reactions, Infrastructure, or WebApi.
3. Read the corresponding convention file under `docs/conventions/backend/` before writing a single line of code.

## Non-Negotiable Rules

- **IEndpoint pattern only.** Never generate an MVC controller class. All HTTP endpoints MUST implement `IEndpoint`. Never inherit from `ControllerBase` or `Controller`.
- **Read stores for queries.** Query handlers MUST inject `IXxxReadStore` interfaces, not domain repositories. Never load a full domain aggregate inside a query handler.
- **Correct exception types.** Use the exception hierarchy defined in `docs/conventions/backend/06-exception-hierarchy.md`. Never throw `InvalidOperationException`, `ArgumentException`, or `ArgumentNullException` in domain or application code.
- **No handlers in Contracts projects.** `Application.Write.Contracts` and `Application.Read.Contracts` contain only records and interfaces. Handlers and validators live in the implementation projects.
- **No external libraries in Application.Reactions.** Event handlers MUST define narrow interfaces for external capabilities. Infrastructure implements those interfaces. Never add a NuGet package for an email client, HTTP client, or message bus client to the `Application.Reactions` project.
- **`cancellationToken` naming.** The `CancellationToken` parameter MUST be named exactly `cancellationToken` in all async methods. Never `ct`, `token`, or `cancel`.

## Project-Specific Context

When working in a project that uses these standards as a submodule, also read the project-specific files in `docs/domain/` before generating domain or application code. These files contain the ubiquitous language glossary, aggregate inventory, and feature inventory for the specific project.
