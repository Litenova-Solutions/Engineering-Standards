# Litenova Solutions

> Efficient, cost-effective and reliable software solutions, built on open-source expertise.

## What This Repository Is

This is the engineering standards repository for all projects at Litenova Solutions. It contains the architectural guidelines, coding conventions, and AI agent context files that every project must follow. It is the single source of truth for how software is designed, structured, and built here.

## Who This Is For

This repository is for engineers, human and AI, working on any [Litenova Solutions](https://github.com/Litenova-Solutions) project. If you are contributing to a project in this organization, read the relevant convention files before writing code. If you are an AI agent, start with `AGENTS.md` and follow the read order defined there.

## How to Use This in a Project

Add this repository as a git submodule. Two path conventions are available:

**Option A — Visible path `standards/` (recommended for team projects)**

```bash
git submodule add https://github.com/Litenova-Solutions/engineering-standards.git standards
git submodule update --init --recursive
```

**Option B — Hidden path `.standards/` (useful for solo projects)**

The dot-prefix hides the folder from most file explorers while keeping it accessible to agents and tooling.

```bash
git submodule add https://github.com/Litenova-Solutions/engineering-standards.git .standards
git submodule update --init --recursive
```

Use `.standards/AGENTS.md` in your project's own `AGENTS.md` shim:
```markdown
# Project Agent Instructions
Read `.standards/AGENTS.md` before editing any code.
```

### Pinning to a Specific Version

```bash
cd standards   # or .standards
git checkout v1.0.0
cd ..
git add standards
git commit -m "chore: pin engineering-standards to v1.0.0"
```

### Keeping Submodule Discipline

Submodules cause problems when contributors forget `--recursive` clones or forget to update after a pull. Prevent this with a bootstrap script.

Create `scripts/bootstrap.sh` (or `scripts/bootstrap.ps1`) in your project:

```bash
#!/usr/bin/env bash
set -euo pipefail
git submodule update --init --recursive
echo "Standards pinned to: $(cd standards && git describe --tags)"
```

Run it as the first step after cloning:
```bash
git clone --recursive https://github.com/your-org/your-project.git
./scripts/bootstrap.sh
```

### Rules for the Consuming Project

- MUST NOT edit files inside `standards/` (or `.standards/`) from within the consuming project. Changes to the standards belong in the standards repository.
- MUST pin the submodule to a tagged version, not to a branch tip or bare commit hash.
- The submodule pointer in the consuming project MUST point to a tag commit. A CI check that validates `git describe --exact-match --tags HEAD` inside the submodule directory is the enforcement mechanism.

### Adding Project-Specific Agent Context

After adding the submodule, create a project-level `AGENTS.md` at the repository root. Use `docs/templates/project-agents.md` from this repository as the starting template. The project `AGENTS.md` is a 30-50 line shim that:

1. Tells agents to read the standards `AGENTS.md` first.
2. Adds project-specific rules not covered by the standards (e.g., domain-specific naming, feature flags, deployment targets).
3. Points agents to the filled-in `docs/domain/` templates for domain context.

```markdown
# Project Agent Instructions

This project follows the Litenova Solutions engineering standards.
Read `standards/AGENTS.md` (or `.standards/AGENTS.md`) before editing any code.

## Project-Specific Rules

- The bounded context name is `Ticketing`. Use it in all namespaces: `Ticketing.Domain`, `Ticketing.Application.Write`, etc.
- Read `docs/domain/ubiquitous-language.md` before writing any domain code.
- Read `docs/domain/aggregate-inventory.md` to see which aggregates exist.
```

## Repository Structure

```
engineering-standards/
├── README.md                                         This file.
├── AGENTS.md                                         Canonical AI agent context file (read this first).
├── CLAUDE.md                                         Claude Code shim that imports AGENTS.md.
├── GEMINI.md                                         Gemini shim that references AGENTS.md.
├── .windsurfrules                                    Windsurf shim that references AGENTS.md.
├── LICENSE                                           MIT license.
├── CHANGELOG.md                                      Release history in Keep a Changelog format.
├── CONTRIBUTING.md                                   How to contribute, create releases, and publish to GitHub.
├── .github/
│   └── copilot-instructions.md                      GitHub Copilot shim that references AGENTS.md.
├── .cursor/
│   └── rules/
│       ├── 00-standards-meta.mdc                    Cursor meta-rules for editing this standards repo.
│       └── 10-backend-csharp.mdc                    Cursor backend C# rules summary.
└── docs/
    ├── philosophy.md                                 Why the architecture is designed the way it is.
    ├── agentic-development.md                        How and why standards are built for agentic development.
    ├── adr/
    │   ├── README.md                                 ADR index and instructions.
    │   ├── 0001-agentic-development-as-primary-model.md
    │   ├── 0002-clean-architecture-as-structural-foundation.md
    │   ├── 0003-cqrs-with-split-application-projects.md
    │   ├── 0004-litebus-as-mediator.md
    │   ├── 0005-minimal-api-endpoint-classes.md
    │   ├── 0006-contracts-projects-for-application-layer.md
    │   ├── 0007-read-store-pattern-for-queries.md
    │   ├── 0008-reactions-project-depends-only-on-abstractions.md
    │   ├── 0009-architecture-tests-as-enforcement.md
    │   ├── 0010-outbox-pattern-as-reliability-escalation.md
    │   ├── 0011-turborepo-as-monorepo-tool.md
    │   ├── 0012-openapi-typescript-client-generation.md
    │   ├── 0013-authjs-v5-authentication.md
    │   └── 0014-animation-tailwind-first-framer-motion-escalation.md
    ├── architecture/
    │   └── clean-architecture.md                     Full Clean Architecture guide for all projects.
    ├── templates/                                    Templates for project-specific documentation. Copy these into each project repository.
    │   ├── ubiquitous-language.md                    Template for the domain term glossary.
    │   ├── aggregate-inventory.md                    Template for listing all aggregates and domain events.
    │   ├── feature-inventory.md                      Template for listing all implemented and planned use cases.
    │   ├── exception-inventory.md                    Template for listing all custom exception types.
    │   ├── read-store-inventory.md                   Template for listing all read store interfaces and projections.
    │   ├── project-agents.md                         Template for the per-project AGENTS.md file.
    │   ├── frontend-feature-inventory.md             Template for listing all frontend routes and use cases.
    │   └── frontend-api-endpoints.md                 Template for documenting consumed backend API endpoints.
    └── conventions/
        ├── 00-principles.md                          Language-agnostic engineering principles.
        ├── backend/
        │   ├── 01-solution-structure.md              .NET solution layout, tooling, and project references.
        │   ├── 02-domain-layer.md                    Domain layer design guide.
        │   ├── 03-application-layer.md               Application layer (five-project split, CQRS, handlers).
        │   ├── 04-infrastructure-layer.md            Infrastructure layer (EF Core, repos, read stores).
        │   ├── 05-api-layer.md                       API layer (IEndpoint pattern, Minimal APIs).
        │   ├── 06-exception-hierarchy.md             Exception types, categories, and HTTP mappings.
        │   ├── 07-query-read-strategy.md             Read-side strategy using read stores.
        │   └── 08-testing.md                         Testing philosophy, patterns, and structure.
        ├── frontend/
        │   ├── 01-nextjs-app-router.md               Next.js 16 App Router conventions.
        │   ├── 02-components.md                      React component design conventions.
        │   ├── 03-data-fetching.md                   Data fetching patterns.
        │   └── 04-state-and-forms.md                 State management and forms.
        └── shared/
            ├── naming.md                             Cross-layer naming conventions.
            ├── git-workflow.md                       Branch, commit, and PR conventions.
            ├── security.md                           Security baseline requirements.
            └── adr-template.md                       Architecture Decision Record template.
```

## Convention Files

| File | Description |
|:-----|:------------|
| `docs/conventions/00-principles.md` | Language-agnostic principles that apply to all projects. |
| `docs/conventions/backend/01-solution-structure.md` | Standard .NET solution layout, tooling configuration, and NuGet package policy. |
| `docs/conventions/backend/02-domain-layer.md` | Aggregates, value objects, domain events, strongly-typed IDs, and domain exception design. |
| `docs/conventions/backend/03-application-layer.md` | Five-project application layer split, command/query/event handler patterns, and validators. |
| `docs/conventions/backend/04-infrastructure-layer.md` | EF Core configuration, repository and read store implementations, and DI registration. |
| `docs/conventions/backend/05-api-layer.md` | Minimal API `IEndpoint` pattern, request/response models, and OpenAPI documentation rules. |
| `docs/conventions/backend/06-exception-hierarchy.md` | Exception hierarchy, categories, HTTP status mappings, and the `GlobalExceptionHandler`. |
| `docs/conventions/backend/07-query-read-strategy.md` | Read store pattern for query handlers and the escalation path to raw SQL. |
| `docs/conventions/backend/08-testing.md` | Testing philosophy, test project structure, naming conventions, and architecture tests. |
| `docs/conventions/frontend/01-nextjs-app-router.md` | Next.js 16 App Router conventions: server vs. client components, proxy.ts, React Compiler, caching. |
| `docs/conventions/frontend/02-components.md` | React component design: taxonomy, shadcn/ui ownership, cva variants, branded types, accessibility. |
| `docs/conventions/frontend/03-data-fetching.md` | Data fetching: server components, TanStack Query, Server Actions, error handling, optimistic updates. |
| `docs/conventions/frontend/04-state-and-forms.md` | State management and forms: Zustand, React Hook Form with Zod v4, useActionState, discriminated unions. |
| `docs/templates/ubiquitous-language.md` | Template for the domain term glossary. Copy to `docs/domain/` in a project repository. |
| `docs/templates/aggregate-inventory.md` | Template for listing all aggregates, states, domain events, and repository interfaces. |
| `docs/templates/feature-inventory.md` | Template for listing all implemented and planned use cases with handler class names. |
| `docs/templates/exception-inventory.md` | Template for listing all custom exception types with categories and HTTP status codes. |
| `docs/templates/read-store-inventory.md` | Template for listing all read store interfaces and the projection types they return. |
| `docs/templates/project-agents.md` | Template for the per-project `AGENTS.md` file that imports these standards. |
| `docs/templates/frontend-feature-inventory.md` | Template for listing all frontend routes and use cases. Copy to `docs/domain/` in each project. |
| `docs/templates/frontend-api-endpoints.md` | Template for documenting which backend API endpoints the frontend consumes. |

## ADR Index

| File | Description |
|:-----|:------------|
| `docs/adr/0001-agentic-development-as-primary-model.md` | Establishes agentic AI development as the primary development model for all projects. |
| `docs/adr/0002-clean-architecture-as-structural-foundation.md` | Adopts Clean Architecture as the structural pattern for all .NET projects. |
| `docs/adr/0003-cqrs-with-split-application-projects.md` | Splits the application layer into five projects to enforce CQRS at the compiler level. |
| `docs/adr/0004-litebus-as-mediator.md` | Selects LiteBus as the mediator for commands, queries, and events. |
| `docs/adr/0005-minimal-api-endpoint-classes.md` | Adopts the `IEndpoint` pattern over MVC controllers for all HTTP endpoints. |
| `docs/adr/0006-contracts-projects-for-application-layer.md` | Introduces Contracts projects to give WebApi a minimal, stable dependency surface. |
| `docs/adr/0007-read-store-pattern-for-queries.md` | Establishes the read store interface pattern as the default for all query handlers. |
| `docs/adr/0008-reactions-project-depends-only-on-abstractions.md` | Requires the Reactions project to define narrow interfaces rather than referencing external libraries directly. |
| `docs/adr/0009-architecture-tests-as-enforcement.md` | Adds architecture tests using NetArchTest to enforce structural rules that project references cannot enforce. |
| `docs/adr/0010-outbox-pattern-as-reliability-escalation.md` | Documents the outbox pattern as the escalation path for reliable event dispatch. |
| `docs/adr/0011-turborepo-as-monorepo-tool.md` | Selects Turborepo with pnpm workspaces as the monorepo tool. |
| `docs/adr/0012-openapi-typescript-client-generation.md` | Establishes openapi-typescript for type-safe API client generation with owned openapi-fetch source. |
| `docs/adr/0013-authjs-v5-authentication.md` | Adopts Auth.js v5 as the authentication standard with proxy.ts for optimistic redirects only. |
| `docs/adr/0014-animation-tailwind-first-framer-motion-escalation.md` | Tailwind CSS transitions as the default; Framer Motion added only when Tailwind is insufficient. |

## Project-Specific Documentation

Convention files in this repository do not contain project-specific content. They define patterns and rules that apply to all projects. Putting project-specific terms, feature lists, or exception inventories in convention files makes those files unstable and project-dependent.

Each project repository should copy the templates from `docs/templates/` into its own `docs/domain/` directory and fill them in. These project-specific files are referenced from the project's `AGENTS.md` so agents have the domain context they need when generating or modifying code.

## Versioning

Versions use semantic versioning tags (`v{major}.{minor}.{patch}`) on `main`. Projects MUST pin to a specific tag via the submodule reference. Pinning prevents silent convention drift when this repository is updated.

A breaking change is any convention update that makes previously compliant code non-compliant.

| Increment | When to Use | Example |
|:---|:---|:---|
| `MAJOR` | A breaking change. Previously compliant code becomes non-compliant. | Renaming a required interface, removing a pattern projects depend on. |
| `MINOR` | A new convention is added. Existing compliant code remains compliant. | Adding a new template, adding a new rule for new code only. |
| `PATCH` | A clarification, typo fix, new example, new ADR, or agent file improvement. | Fixing a typo, adding a `// BAD:` example to an existing rule. |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full process, including how to create releases and publish them to GitHub.

## License

[MIT](LICENSE)

