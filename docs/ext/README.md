# Overview

## Intent

The extensions pages hold conditional rule bundles a project adds only when a specific need appears, from caching and audit trails to multitenancy and container rollout, so a project carries no rule it does not need. Each bundle stays inactive until a current need meets the criterion its page states, and the project records each choice with its criterion and review date. A team facing a need the default rules do not cover reads the candidate page and selects only the extensions whose criteria hold today.

## How to select an extension

Each extension below states its own activation criterion and whether it applies to the whole project or to named records. A project selects every extension whose criteria hold and no extension whose criteria do not, and lists each selection in `selectedExtensions` in `litespec.project.json` with the criterion it met and a review date. The manifest repeats each scope, replacement list, and switched-on record type where checks read it. Most extensions add rules without replacing any; the audit and outbox pages each name the one baseline provision they replace.

## Project extensions

Selected once for the whole project:

- [Agent Delegation](delegation.md): briefs and containment for one agent starting another on the same tree.
- [API Compatibility](compat.md): versioning and retirement for APIs with public, partner, mobile, or independently deployed consumers.
- [Audit Trail](audit.md): tamper-resistant evidence of who attempted what in data another party owns.
- [Container Deployment](containers.md): images, rollouts, and runtime limits where staging or production ships containers.
- [Localization](locale.md): locales, catalogs, and formatting for a product that ships in more than one locale.
- [Model Context Protocol](mcp.md): the server a product ships so an LLM client can call its public API.
- [Multitenancy](tenancy.md): tenant isolation across authorization, storage, jobs, and recovery for one shared deployment.
- [Release Stage](stage.md): the pre-customer-data stage, what it defers, and the promotion that ends it.
- [Static Marketing Site](site.md): the static build for marketing pages, pricing, and help articles beside the application.

## Local extensions

Selected per record, for the use cases, journeys, modules, rules, or business records the criterion names:

- [Caching](cache.md): staleness contracts and recovery for a repeated expensive read that traces or load tests name.
- [Concurrency and Idempotency](concurrency.md): versions, client keys, and fingerprints where writes can overlap or retries can duplicate an effect.
- [Data Lifecycle](lifecycle.md): retention, deletion, archival, and restore behavior for records with a lifetime duty.
- [External Integrations](integrations.md): provider isolation, failure mapping, and boundary tests for use cases that call outside systems.
- [Outbox Worker](outbox.md): one-transaction commits with dispatched messages where delivery must survive process failure.
- [Realtime Updates](realtime.md): live transport where measured polling cannot meet the update target.
- [Reporting and Exports](report.md): heavy queries and large exports moved off the request path.
- [Scheduled Jobs](jobs.md): recurring, delayed, and calendar-based work with leases that survive restarts.

## Stack extensions

Extensions that bind to one stack live beside that stack:

- [.NET extensions overview](../backend/dotnet/ext/README.md): the BDD scenarios and EF Core persistence only a .NET backend offers.
