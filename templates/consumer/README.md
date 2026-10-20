# Document templates

## Intent

These files are starting points for consumer records. Copy only the files the current work needs, replace every `<placeholder>` before committing, and remove any optional line left unused. The JSON templates carry working example values; adjust them to the project.

A page record carries its type, identifier, title, owner, and status in JSON frontmatter, with the body sections its template shows. An entry record sits in its page frontmatter. Requirements sit on a product topic page. Rules and events sit on a business record page, and results and cases on a use case page. Permissions, entry points, and limits sit on their list pages. Terms live in the language record instead of on a page.

## Project setup

| Template | Target | Purpose |
|:---|:---|:---|
| `litespec.project.json` | `litespec.project.json` | Selects the size, stacks, reviewed LiteSpec release, paths, owners, optional types, and selected extensions. |
| `project-agents.md` | `AGENTS.md` | Provides the short consumer agent entry point. |
| `language.json` | `docs/language.json` | Holds the Term entries prose is checked against, with rejected words and mannered terms. |
| `scenario-cast.md` | `docs/domain/scenarios.md` | Fixes the people, place, dates, and amounts every `Scenario` section draws from. |

## Page records

| Template | Target | Purpose |
|:---|:---|:---|
| `product-brief.md` | `docs/product/brief.md` | Defines the product boundary, what it never does, and its audience. |
| `constraint.md` | `docs/product/constraints/<name>.md` | Records one outside rule and whether it applies. |
| `research.md` | `docs/research/<name>.md` | Records one outside fact that informs a choice. |
| `decision.md` | `docs/product/decisions/<number>-<name>.md` | Records one dated choice with its options and evidence. |
| `problem.md` | `docs/product/problems/<name>.md` | Records one pain someone has today. |
| `feature.md` | `docs/product/features/<name>.md` | Records what is offered against a problem. |
| `actor.md` | `docs/domain/actors/<name>.md` | Records one person, company, provider, system, or guest. |
| `role.md` | `docs/domain/roles/<name>.md` | Records one named set of permissions at a scope. |
| `journey.md` | `docs/product/journeys/<name>.md` | Records the ordered steps an actor takes toward one goal. |
| `module.md` | `docs/domain/modules/<module>/README.md` | Defines one business area and its boundaries. |
| `business-record.md` | `docs/domain/modules/<module>/<records>/README.md` | Defines one record changed in one step, with its rule and event entries. |
| `use-case.md` | `docs/domain/modules/<module>/<records>/<use-case>.md` | Defines one command or query, with its result and case entries. |
| `runbook.md` | `docs/runbooks/<name>.md` | Gives one repeatable recovery or operating procedure. |
| `exception.md` | `docs/exceptions/<name>.md` | Records one departure from a standard, with reason and review date. |
| `known-gap.md` | `docs/known-gaps/<name>.md` | Records one accepted gap whose check stays red. |

## Entry lists and page styles

| Template | Target | Purpose |
|:---|:---|:---|
| `product-topic.md` | `docs/product/<area>/<topic>.md` | States one area of business intent, with its requirement entries. |
| `permission-list.md` | `docs/domain/permissions.md` | Holds the permission entries roles allow. |
| `entry-point-list.md` | `docs/domain/entry-points.md` | Holds the entry point entries use cases are reached through. |
| `limit-set.md` | `docs/operations/limits.md` | Holds the limit entries the product runs within. |
| `rule-set.md` | `docs/domain/rules/<name>.md` | Holds rule entries that sit together outside one record. |
| `glossary.md` | `docs/domain/glossary.md` | Renders the Term entries from the language record. |
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

The model builder reads each record and writes the computed state into `model.json`. Run its `render` verb after adding, approving, or retiring a record, so generated regions match the model.
