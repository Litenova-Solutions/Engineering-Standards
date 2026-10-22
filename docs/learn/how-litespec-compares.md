# How LiteSpec Compares

## Intent

LiteSpec is one of many ways to specify work for AI coding agents, beside per-feature workflows, standards systems, instruction files, and tests. This page compares LiteSpec with 10 other approaches on the same dimensions: what each one specifies, how its rules are checked, and how it fits beside LiteSpec. Technical leads read it while they evaluate options, so they can place LiteSpec correctly instead of treating every approach as a rival.

## The Short Answer

Spec-driven development means writing down what to build before an AI coding agent builds it. Most approaches structure one feature or change at a time. They guide an agent through requirements, design, and tasks for a single piece of work, then archive the result. LiteSpec instead specifies one whole bounded-context application with versioned, citable, tool-checked rules.

Its rules carry stable provision IDs for exact citation, and its checks run in the editor, the build, and CI. The other approaches stay neutral about stack and architecture, which keeps them light but leaves structural decisions to each team. LiteSpec fixes the application shape and its stacks, which lets it state concrete rules an agent follows the same way twice.

The two sides combine: a team can run a per-feature workflow or behavior examples inside a LiteSpec product, with instruction files as the agent entry point.

## The Approaches

### LiteSpec

LiteSpec ([Why LiteSpec Exists](why-litespec.md)) is a standard for building one bounded-context business application. It has three parts: versioned rules, project records of intent, and a model builder that joins records to code, screens, tests, and test runs.

A project selects one size, one shape, and its stacks from .NET, React, Svelte, and Blazor, and the standard states concrete rules for that selection. Every rule carries a stable provision ID, and conformance is checked by the `litespec` CLI, Roslyn analyzers, and model findings. A project pins one release, as [How the Tools Fit Together](the-tooling.md) describes.

### GitHub Spec Kit

GitHub Spec Kit ([github/spec-kit](https://github.com/github/spec-kit)) is an MIT-licensed, language-neutral open source toolkit in the `github` organization. It gives AI coding agents structured processes, reusable templates, and documented outcomes.

A project creates a constitution once, then repeats per-feature steps in the agent's chat: `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`, and `/speckit-converge`. Bug fixing and assessment ship as bundled extensions. Each step ends in a human review gate, with convergence repeated until the report reads `Converged`. It works with a supported agent on Linux, macOS, or Windows.

### Kiro

Kiro ([kiro.dev](https://kiro.dev/)) describes itself as an agentic AI with an IDE, CLI, web interface, mobile app, and Kiro Crew, built and operated by AWS. It works with Anthropic Claude, OpenAI GPT, and open-weight models, supports AGENTS.md and MCP, and prices paid use by credit while Kiro Crew stays free and open source.

Each spec covers one feature or bug fix and generates `requirements.md` (or `bugfix.md`), `design.md`, and `tasks.md`. Requirements analysis checks a spec for contradictions and gaps, and the IDE runs property-based and correctness testing.

### Tessl

Tessl ([tessl.io](https://tessl.io)) is an open platform for managing agentic development across an organization through a registry of installable tiles. Its spec-driven development tile by tessl-labs ([the registry page](https://tessl.io/registry/tessl-labs/spec-driven-development)), MIT licensed, teaches AI coding agents to gather requirements, write specifications, and get approval before writing code.

Specs are `.spec.md` files with YAML frontmatter and inline references to the tests that verify each requirement. Each change moves through a gather, approve, implement, and review loop. Tile checks cover spec shape, link integrity, and review outcomes. The tile is open source, and the commercial platform's skills work across MCP-compatible agents.

### BMAD Method

The BMAD Method ([BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)), short for Breakthrough Method for Agile Ai Driven Development, turns an idea or change request into working software through named skills added to AI coding tools.

Thinking skills cover exploring, researching, arguing, and recording, `bmad-build` writes and reviews code, and briefs, specifications, and architecture documents carry durable context forward. Work scales from a small fix to whole-product planning, with teams following their own rules and the human in control. It is MIT licensed, free and open source with no paywalled workflows. BMad and BMAD-METHOD are trademarks of BMad Code, LLC. The core method names no stack beyond a game module for Unity, Unreal, Godot, and Phaser.

### OpenSpec

OpenSpec ([OpenSpec](https://github.com/Fission-AI/OpenSpec)) is spec-driven development (SDD) for AI coding assistants, maintained by Fission AI and built brownfield-first around a fluid and iterative approach.

Each change gets a folder with a proposal, specs, design, and tasks, and shipped changes archive when done. Durable specs with beta Stores share the shape. It covers one change at a time: you bring your preferred AI and OpenSpec brings the structure. Plans pass human review before code, with an expanded `/opsx:verify` workflow. It is MIT licensed, neutral, and working with 30 or more assistants through slash commands.

### Agent OS

Agent OS ([Agent OS](https://buildermethods.com/agent-os)) by Brian Casel at Builder Methods is a system for injecting your codebase standards and writing better specs for spec-driven development. It discovers, deploys, and indexes a team's standards, pairing standing codebase standards with per-spec shaping for better plans and better builds.

Standards live as plain Markdown files any tool can read, complementing assistants such as Claude Code, Cursor, Windsurf, and Codex. It is MIT licensed, free and open source, in any language and any framework.

### Agent Instruction Files

Agent instruction files ([AGENTS.md](https://agents.md/), [CLAUDE.md memory](https://code.claude.com/docs/en/memory), [Copilot instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)) are plain Markdown files in the repository that carry whole-repository conventions: build commands, layout, standards, and workflows.

AGENTS.md is a simple, open format for guiding coding agents, stewarded by the Agentic AI Foundation under the Linux Foundation, and GitHub treats `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` as agent instructions. Teams write whatever they need as free text in nested `AGENTS.md` files, `CLAUDE.md` with `.claude/rules/`, and `.github/copilot-instructions.md` with `.github/instructions/`.

Nothing enforces the format: Claude treats these files as context, not configuration, so an agent follows them on a best-effort basis. Cursor publishes its own rules page ([Cursor rules](https://docs.cursor.com/context/rules)).

### Behavior-Driven Development with Gherkin

Behavior-driven development with Gherkin ([Cucumber](https://cucumber.io/docs/), [Reqnroll](https://reqnroll.net/)) writes behavior as executable examples. Cucumber is a tool that supports Behaviour-Driven Development, and Gherkin is its grammar.

Teams write `.feature` files of Given-When-Then scenarios, versioned with the software and wired to code through step definitions. Reqnroll is an open-source Cucumber-style framework that automates them for .NET as a SpecFlow reboot.

BDD is about discovery, collaboration, and examples rather than testing alone. Cucumber reads executable specifications in plain text and validates the software against them, reporting pass or fail per scenario through step definitions that hard-wire each specification to its implementation.

### ADRs, arc42, and C4

Architecture records and diagrams ([ADRs](https://adr.github.io/), [arc42](https://arc42.org/), [the C4 model](https://c4model.com/)) document whole-system architecture and its significant decisions.

An ADR captures a single architectural decision and its rationale, and the collection forms the project's decision log. arc42 gives a 12-section template for architecture documentation and communication, and the C4 model is an easy to learn, developer friendly approach to software architecture diagramming. arc42 suits large and small teams, C4 zooms from system context down to code, and arc42 stays process-agnostic in support of arbitrary technologies.

### Architecture Tests

Architecture tests ([ArchUnit](https://www.archunit.org/), [NetArchTest](https://github.com/BenMorris/NetArchTest)) check whole-codebase structure, from package and layer dependencies to cycles, naming, and sealing, with rules written as test code.

ArchUnit is a free, simple, and extensible library for checking Java architecture with any plain Java unit test framework. NetArchTest is a fluent .NET Standard API that enforces architectural rules in unit tests. Both enforce application-specific conventions beyond generic static analysis, and their rules execute as unit tests in the build pipeline. NetArchTest is MIT licensed and NuGet distributed, and ArchUnit covers Java bytecode with a linked .NET port.

## Side-by-Side Comparison

The table summarizes each approach on the same dimensions, as described on the official pages read on 2026-10-21. Cells that read `None described` mean the pages read describe no such item.

| Approach | Unit of specification | Ships rules or process | Stable rule IDs | Verified by tools | Versioned rules | Intent linked to code | Stack coverage |
|:---|:---|:---|:---|:---|:---|:---|:---|
| LiteSpec | Bounded-context application | Versioned rulebook | Provision IDs | CLI, analyzers, model | Pinned releases | Implements, calls, proves | .NET, React, Svelte, Blazor |
| GitHub Spec Kit | Feature, bug, idea | Process, templates | None described | Converge gates, review | Pinned CLI; specs in the repository | None described | Neutral; Linux, macOS, Windows |
| Kiro | Feature, bug fix | Process, design docs | None described | Requirements analysis, correctness tests | Project files | Tasks tracked in IDE | Neutral |
| Tessl tile | Task; org-wide skills | Process, format rules, library tiles | Named skills, rules | Spec lint, link checks, evals | Tiles versioned in registry | `[@test]` links, `targets` | Neutral; MCP agents |
| BMAD Method | Fix to product plan | Process, skills | None described | Build-and-review loop | Installer release lines | Durable context docs | Neutral; game engines named |
| OpenSpec | Change | Process, templates | None described | Human review, verify step | CLI versioned; Markdown specs | Specs with archive | Neutral; 30+ tools |
| Agent OS | Standards, per-spec shaping | Discovered team standards | None described | None described | Tool releases; files in the repository | Injected into context | Any language, framework |
| Instruction files | Repository conventions | Team-authored text | None described | None described | Files in the repository | None described | Plain Markdown |
| BDD with Gherkin | Behavior example | Examples, step definitions | None described | Executable scenarios | Feature files in source control | Step definitions | Cucumber neutral; Reqnroll .NET |
| ADRs, arc42, C4 | System, decisions | Templates, diagrams | None described | None described | Documents in the repository | None described | Arbitrary technologies |
| Architecture tests | Codebase structure | Team rules as tests | None described | Rules as unit tests | Test code in the suite | Rules are code | Java, .NET |

The diagram places each approach by scope against verification.

![Scatter plot of scope, from one change to a whole application, against verification, from none to automated: LiteSpec is top right with architecture tests nearby, behavior-driven development is high at middle scope, the Tessl tile and Kiro are central, Spec Kit, OpenSpec, and BMAD are lower left, and Agent OS, instruction files, and ADRs, arc42, and C4 are lowest.](../assets/diagrams/learn-compare-scope.svg)

## Reasons for LiteSpec

Each property below names the page that states it.

- A standing product standard. LiteSpec ships the whole rulebook for one bounded-context application, while per-feature approaches ship a workflow the team fills in. The [supported scope page](../core/scope.md) states the boundary.
- Citable rules. Every rule has a provision ID of page plus heading slug, so a review comment, an agent report, or a deviation cites exactly one rule, such as `litespec/backend/dotnet/domain#model-every-closed-set-of-domain-values-without-enums`. The [authoring page](../core/authoring.md) defines the grammar.
- Automated verification in three layers. The CLI checks records and the model, Roslyn analyzer rules flag breaches in the editor and build with links to their provisions, and model findings report unimplemented use cases, unthrown refusals, unresolved references, and expired gaps. Its `implements`, `calls`, and `proves` links are recomputed on every build, so they cannot go stale. The [analyzer reference](../analyzers/README.md) documents every rule, and the [model page](../tools/model.md) lists every finding code.
- A versioned contract. Each release states every active provision, a project pins one release, and adoption is recorded in `reviewedLiteSpecVersion`. The [authoring page](../core/authoring.md) states the release model, and [How LiteSpec Works](how-litespec-works.md) shows the pin.
- Stack depth where it applies. The fixed application shape allows concrete rules such as five backend projects, one way to model a lifecycle, and one way to report a refused command. The [supported scope page](../core/scope.md) states the selection, and the [.NET](../backend/dotnet/stack.md), [React](../frontend/web/react/stack.md), [Svelte](../frontend/web/svelte/stack.md), and [Blazor](../frontend/blazor/stack.md) stack pages carry the per-stack rules.
- An enforced agent protocol. Agents start from per-selection `llms.txt` indexes, query one record with `litespec model query`, and finish with check-backed reports, stopping on conflicts with both rule IDs quoted. [Work with Agents](working-with-agents.md) describes how an agent finds the rules, and the [agent page](../core/agent.md) states the task order.

## Reasons for Another Approach

LiteSpec is not the right answer everywhere. The points below favor another approach, stated in the makers' own terms.

- A team that wants a light per-feature flow can use OpenSpec, Spec Kit, or Kiro. OpenSpec is brownfield-first across 30 or more tools, Spec Kit pairs a constitution with per-feature commands and convergence gates, and Kiro turns requirements into design and tasks.
- A team on another stack can use a neutral approach. LiteSpec supports .NET with React, Svelte, or Blazor, while BMAD names Unity, Unreal, Godot, and Phaser, ArchUnit covers Java bytecode, and Cucumber spans many programming languages.
- A team with strong conventions to keep can use Agent OS or plain instruction files. Agent OS discovers, deploys, and indexes the team's standards, and instruction files carry whatever the team writes.
- A team whose agents misuse library APIs can use Tessl tiles. The registry holds library-usage tiles per ecosystem alongside the methodology tile, while LiteSpec pins package versions without teaching API surfaces.
- A team that wants architecture documentation for readers rather than checks for machines can use ADRs, arc42, and C4. ADRs keep the decision log, arc42 gives the 12-section template, and C4 diagrams the system from context to code.
- A team with an existing suite that wants behavior or structural checks can add Cucumber, Reqnroll, NetArchTest, or ArchUnit. Cucumber validates plain-text specifications per scenario, Reqnroll automates Given-When-Then scenarios for .NET, and architecture tests enforce structural rules as unit tests.

## Combined Use

LiteSpec acts as the product standard, and the others work inside it.

- With AGENTS.md. A short `AGENTS.md` block points agents at the selection index and raw pages: instruction files carry the pointer, and LiteSpec carries the rules. [Work with Agents](working-with-agents.md) shows the block.
- With BDD. The manifest pins Reqnroll and LightBDD, and the `bdd` extension states how executable acceptance tests prove LiteSpec scenarios. The [BDD extension](../backend/dotnet/ext/bdd.md) states the provisions, including `litespec/backend/dotnet/ext/bdd#prove-a-case-from-every-scenario`.
- With architecture tests. The manifest pins `NetArchTest.Rules`, so suite-level structural rules run beside the Roslyn analyzers. The [analyzer reference](../analyzers/README.md) documents the analyzer side.
- With ADRs, arc42, and C4. A team can keep ADRs as its decision log and cite them from LiteSpec decision records, and draw arc42 or C4 views to present the architecture LiteSpec enforces. One side records for humans, and the other checks for machines.
- With a per-feature workflow. A team can shape a change with Spec Kit, OpenSpec, Kiro, BMAD, or the Tessl tile, then carry the result into LiteSpec use-case and result records. The workflow handles one change, and LiteSpec holds the product around it.

## Sources

Every address below was read on 2026-10-21.

- https://github.com/github/spec-kit (2026-10-21).
- https://kiro.dev/docs/specs/ (2026-10-21).
- https://kiro.dev/ (2026-10-21).
- https://tessl.io (2026-10-21).
- https://docs.tessl.io/ (2026-10-21).
- https://tessl.io/registry/tessl-labs/spec-driven-development (2026-10-21).
- https://github.com/bmad-code-org/BMAD-METHOD (2026-10-21).
- https://docs.bmad-method.org/ (2026-10-21).
- https://github.com/Fission-AI/OpenSpec (2026-10-21).
- https://openspec.dev/docs (2026-10-21).
- https://buildermethods.com/agent-os (2026-10-21).
- https://github.com/buildermethods/agent-os (2026-10-21).
- https://agents.md/ (2026-10-21).
- https://code.claude.com/docs/en/memory (2026-10-21).
- https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot (2026-10-21).
- https://docs.cursor.com/context/rules (2026-10-21).
- https://cucumber.io/docs/ (2026-10-21).
- https://reqnroll.net/ (2026-10-21).
- https://adr.github.io/ (2026-10-21).
- https://arc42.org/ (2026-10-21).
- https://c4model.com/ (2026-10-21).
- https://www.archunit.org/ (2026-10-21).
- https://github.com/BenMorris/NetArchTest (2026-10-21).

## Next

[Lineage](lineage.md) names the practices LiteSpec borrows from, and what it takes from each.
