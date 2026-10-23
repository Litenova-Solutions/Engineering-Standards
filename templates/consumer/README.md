# Document Templates

## Intent

These files are starting points for consumer records. `litespec init` copies the project setup files to their targets and writes the local tool manifest; copy only the record files the current work needs, replace every `<placeholder>` and every `__NAME__` placeholder before committing, and remove any optional line left unused. A section whose starter text opens with `Optional.` may be removed when it has nothing to say; every other section is required. `litespec init` fills `__PROJECT__` in `litespec.project.json` and the `## LiteSpec` block in `AGENTS.md`, and lists the placeholders it leaves, and `litespec consumer` refuses a project file that still holds one. The other JSON templates carry working example values; adjust them to the project.

A page record carries its type, identifier, title, owner, and status in JSON frontmatter, with the body sections its template shows. An entry record sits in its page frontmatter. Requirements sit on a requirement page. Rules and events sit on an aggregate page, and results and scenarios on a use case page. Permissions and entry points sit on their list pages, and settings on a setting-set page. Retention rows sit on the retention schedule. Terms live in the glossary at `docs/glossary.json` instead of on a page.

## Project Setup

| Template | Target | Purpose |
|:---|:---|:---|
| `litespec.project.json` | `litespec.project.json` | Selects the size, stacks, reviewed LiteSpec release, paths, owners, review, adoption, optional types, and selected extensions. |
| `project-agents.md` | `AGENTS.md` | Provides the short consumer agent entry point with the `## LiteSpec` block. |
| `glossary.json` | `docs/glossary.json` | Holds the Term entries prose is checked against, with layers, aliases, rejected words, and mannered terms. |
| `example-cast.md` | `docs/behavior/example-cast.md` | Fixes the people, place, dates, and amounts every `Example` section draws from. |

## Page Records

| Template | Target | Purpose |
|:---|:---|:---|
| `product-brief.md` | `docs/product/brief.md` | Defines the product boundary, what it never does, and its audience. |
| `goal.md` | `docs/product/goals/<name>.md` | States one measurable outcome the product serves. |
| `constraint.md` | `docs/product/constraints/<name>.md` | Records one outside rule and whether it applies. |
| `research.md` | `docs/research/<name>.md` | Records one outside fact that informs a choice. |
| `decision.md` | `docs/product/decisions/<number>-<name>.md` | Records one dated choice with its options and evidence. |
| `problem.md` | `docs/product/problems/<name>.md` | Records one pain someone has today. |
| `feature.md` | `docs/product/features/<name>.md` | Records what is offered against a problem. |
| `actor.md` | `docs/behavior/actors/<name>.md` | Records one person, organization, or system. |
| `role.md` | `docs/behavior/roles/<name>.md` | Records one named set of permissions at a scope. |
| `external-system.md` | `docs/behavior/systems/<name>.md` | Records one outside system, its operations, what crosses its boundary, and its failure and erasure behavior. |
| `journey.md` | `docs/product/journeys/<name>.md` | Records the ordered steps an actor takes toward one goal. |
| `module.md` | `docs/behavior/modules/<module>/README.md` | Defines one business area and its boundaries. |
| `aggregate.md` | `docs/behavior/modules/<module>/<aggregate>/README.md` | Defines one aggregate, with its kind, states, data classes, and its rule and event entries. |
| `use-case.md` | `docs/behavior/modules/<module>/<aggregate>/<use-case>.md` | Defines one command or query, with its result and scenario entries. |
| `reaction.md` | `docs/behavior/modules/<module>/reactions/<reaction>.md` | Defines one reaction a domain or integration event triggers. |
| `job.md` | `docs/behavior/modules/<module>/jobs/<job>.md` | Defines one scheduled, one-off, or operator job. |
| `notification.md` | `docs/behavior/modules/<module>/notifications/<name>.md` | Defines one person-facing message and its claims. |
| `integration-event.md` | `docs/behavior/integration-events/<name>.md` | Defines one published or consumed integration event. |
| `runbook.md` | `docs/runbooks/<name>.md` | Gives one repeatable recovery or operating procedure. |
| `deviation.md` | `docs/deviations/<name>.md` | Records one departure from a provision, with reason and review date. |
| `known-gap.md` | `docs/known-gaps/<name>.md` | Records one accepted gap whose check stays red. |

## Entry Lists and Page Styles

| Template | Target | Purpose |
|:---|:---|:---|
| `requirement-page.md` | `docs/product/<area>/<topic>.md` | States one area of business intent, with its requirement entries. |
| `permission-list.md` | `docs/behavior/permissions.md` | Holds the permission entries roles allow. |
| `entry-point-list.md` | `docs/behavior/entry-points.md` | Holds the entry point entries use cases are reached through. |
| `setting-set.md` | `docs/behavior/modules/<module>/settings.md` | Holds the setting entries a module runs with. |
| `retention-schedule.md` | `docs/behavior/retention-schedule.md` | Holds the retention rows for every data class. |
| `rule-set.md` | `docs/behavior/rules/<name>.md` | Holds rule entries that sit together outside one aggregate. |
| `glossary.md` | `docs/behavior/glossary.md` | Renders the Term entries from the glossary. |
| `index.md` | `docs/<section>/README.md` | Lists what one directory holds and what lives elsewhere. |
| `tutorial.md` | `docs/guide/<tutorial>.md` | Gives a newcomer one path to a first working result. |
| `how-to.md` | `docs/guide/<how-to>.md` | Solves one stated goal for a reader who is already running. |
| `command.md` | `docs/tools/<command>.md` | Documents one command the repository ships. |
| `reference.md` | `docs/reference/<name>.md` | Publishes exact values a reader looks up. |
| `configuration.md` | `docs/tools/configuration.md` | Documents settings a reader can change, with defaults and precedence. |

## Interface

| Template | Target | Purpose |
|:---|:---|:---|
| `design-contract.md` | `packages/ui/DESIGN.md` | States the brand, tokens, composites, and voice every frontend composes from. |
| `ui-source-lock.json` | `packages/ui/ui-source-lock.json` | Records the installed registry source, digests, and dependencies. |
| `ui-pattern-catalog.json` | `docs/ui/pattern-catalog.json` | Records each recurring interface decision with its options and choice. |

The model builder reads each record and writes the computed state into `model.json`.
