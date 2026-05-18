# GitHub Copilot Instructions

The canonical agent guide for all Litenova Solutions projects is `AGENTS.md` at the repository root (or `.standards/AGENTS.md` when this repository is included as a submodule).

## Before Generating Code

1. Read `AGENTS.md` in full.
2. Identify the layer you are editing: Domain, Application, Infrastructure, or WebApi.
3. Read the corresponding convention file under `docs/conventions/backend/` before writing a single line of code.

## Non-Negotiable Rules

- **IEndpoint pattern only.** Never generate an MVC controller class. All HTTP endpoints MUST implement `IEndpoint`. Never inherit from `ControllerBase` or `Controller`.
- **Read stores for queries.** Query handlers MUST inject `IReadStore` interfaces, not domain repositories. Never load a full domain aggregate inside a query handler.
- **Correct exception types.** Use the exception hierarchy defined in `docs/conventions/backend/06-exception-hierarchy.md`. Never throw `InvalidOperationException`, `ArgumentException`, or `ArgumentNullException` in domain or application code. Use the appropriate custom exception subclass.
