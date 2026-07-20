# Litenova Engineering Standards

Open-source engineering standards for Litenova Solutions applications developed by one maintainer with extensive AI assistance.

The repository gives human contributors and AI agents the same architectural boundaries, naming rules, folder conventions, delivery method, and verification expectations. Version 1 targets one bounded-context business application built with ASP.NET Core, PostgreSQL, Marten, and optional Next.js frontends.

## Why this standard exists

AI agents can produce valid code while making different local choices across sessions. One agent may place handlers by technical type, another by use case, and a third may introduce a new abstraction because the repository does not state the preferred pattern.

These standards make those choices explicit. They retain detailed conventions while limiting each task to the documents that apply.

## Mental model

| Part | Purpose |
|:---|:---|
| Foundations | Define scope, engineering principles, ADDD, agent behavior, and release criteria. |
| Platform profile | Select the supported stack and baseline architecture. |
| Conventions | Define exact folders, names, boundaries, implementation patterns, and checks by topic. |
| Extensions | Activate conditional behavior such as durable delivery, EF Core, caching, or localization. |
| Manifest | Holds version pins, profile composition, extension paths, and agent load plans. |
| Consumer configuration | Selects the profile, paths, extensions, and project overrides. |
| Templates | Provide small starting points for consumer product and domain documentation. |

The baseline profile applies first. An enabled extension may replace only the baseline rule IDs it names. A consumer override takes precedence when it names the affected rule ID and links to a project decision.

## From an idea to application v1

Litenova uses Agentic Domain-Driven Delivery (ADDD). ADDD keeps product intent, implementation, tests, and release evidence aligned around one use case at a time.

For a publishing application:

1. The product brief defines the primary journey: an author creates and publishes a post.
2. The domain index identifies the `Posts` capability.
3. `docs/domain/posts/create-draft.md` defines the first use case.
4. Acceptance criterion `AC-POSTS-CREATE-DRAFT-01` states an observable outcome.
5. The agent loads only the Application, API, persistence, and testing conventions required by that use case.
6. Automated tests cite the same acceptance ID.
7. The slice is complete after its code, documentation, tests, deployment impact, and release checks agree.

Read [the ADDD foundation](docs/foundations/addd.md) for the complete method.

Read [V1 Release Scope](docs/guides/v1-release-scope.md) for the complete release boundary and [the v2 roadmap](ROADMAP.md) for later candidates.

## How to read a standards document

Topic documents use the same structure:

- **Intent** explains the selected approach and the problem it addresses.
- **Agent Summary** is the short section loaded for routine tasks.
- **Standards** are required boundaries. A deviation needs a declared override and decision.
- **Conventions** are project defaults for names, locations, and implementation shape. A consumer may replace one with an explicit local convention.
- **Examples** show a concrete interpretation.
- **Verification** states how to check the result.

A heading such as `Organize every layer by capability and use case (ARCH.CAPABILITIES.001)` contains a human title followed by its stable rule ID.

Other IDs have separate purposes:

| Example | Meaning |
|:---|:---|
| `posts.create-draft` | Consumer use-case ID |
| `AC-POSTS-CREATE-DRAFT-01` | Acceptance-criterion ID |
| `ARCH.CAPABILITIES.001` | Standards rule ID |
| `persistence-ef-core` | Extension ID |

## Read the standards

Human readers start with the [documentation index](docs/README.md), then read scope and ADDD before the platform conventions.

AI agents start with [AGENTS.md](AGENTS.md), the consumer's `standards.project.json`, and the task-specific load plan in `standards.manifest.json`.

## Consume the repository

Add the release as a root submodule and pin its exact commit:

```bash
git submodule add https://github.com/Litenova-Solutions/Engineering-Standards.git standards
git -C standards fetch --tags
git -C standards checkout v1.1.0
git add .gitmodules standards
```

Do not add `branch = main` to `.gitmodules`. Upgrade through a dedicated pull request that updates the recorded submodule commit.

Each consumer adds:

- `standards.project.json` for its profile, paths, extensions, and overrides.
- A short root `AGENTS.md` that points agents to `standards/AGENTS.md`.
- Product and use-case documentation under `docs/`.

Copy only the documentation templates needed for the current stage:

```bash
mkdir -p docs/product docs/domain
cp standards/templates/docs/standards.project.json standards.project.json
cp standards/templates/docs/project-agents.md AGENTS.md
cp standards/templates/docs/product-brief.md docs/product/brief.md
cp standards/templates/docs/domain-index.md docs/domain/README.md
cp standards/templates/docs/glossary.md docs/domain/glossary.md
```

There is no standards CLI and no application generator. Agents create application code from the selected conventions and extensions while matching explicit consumer overrides.

## Repository map

```text
docs/foundations/             Scope, principles, ADDD, agent protocol, release standard
docs/profile/                 Platform profile composition
docs/conventions/repository/  Repository layout, naming, dependencies, configuration
docs/conventions/backend/     Architecture, Domain, Application, persistence, API
docs/conventions/frontend/    Structure, rendering, components, data, testing
docs/conventions/quality/     Backend testing, security, operations, CI
docs/extensions/              Conditional standards loaded by activation criteria
docs/guides/                  Adoption and delivery guidance
docs/reference/               Glossary and decisions
schemas/                      JSON contracts for the manifest and consumer configuration
templates/docs/               Consumer documentation starting points
ROADMAP.md                    Evidence-gated candidates for v2
```

## Version policy

- Patch: clarification or correction that does not invalidate compliant consumers.
- Minor: additive rule, extension, or capability that does not invalidate compliant consumers.
- Major: rule or contract change that requires consumer work.

Future standards releases add an annotated Git tag, GitHub Release, changelog entry, and upgrade guide when consumer work is required.

## License

[MIT](LICENSE)
