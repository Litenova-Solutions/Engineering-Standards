---
{
  "id": "core.principles",
  "kind": "core",
  "normative": true,
  "appliesTo": ["all"],
  "recipes": []
}
---
# Principles

## Agent Quick Rules {#agent-quick-rules}

- Keep each rule and fact in one canonical source.
- Implement one complete vertical use case at a time.
- Use compiler, architecture, schema, and test checks for enforceable boundaries.
- Add complexity only after a documented trigger applies.
- Prefer explicit names and narrow dependencies over generic abstractions.

## CORE.SOURCE.001 - Keep one authored source for each fact

Write each rule, version, status, route, and acceptance criterion once. Other documents link to that source. Application build outputs may derive from it.

Package versions belong in `standards.manifest.json`. Use-case status belongs in its frontmatter. Tests cite the acceptance IDs they prove.

## CORE.SLICE.001 - Deliver vertical use cases

Implement the smallest complete path from domain behavior through persistence, API, UI when present, tests, and operating evidence. Do not complete all entities before the first user journey works.

For example, finish `posts.create` across all required layers before beginning `posts.publish`.

## CORE.ENFORCE.001 - Automate rules that machines can prove

Use project references, architecture tests, schema validation, and CI for mechanical constraints. Keep prose for decisions, intent, and boundaries that require judgment.

A project-reference test can prove Domain does not reference Infrastructure. A use-case document explains why publication requires ownership.

## CORE.COMPLEXITY.001 - Require an adoption trigger

Do not add a package, project, wrapper, background process, or distributed pattern without a current use case that needs it. Enable a recipe when its documented trigger applies.

A query handler uses `IQuerySession` directly. It does not gain a project-owned read-store wrapper without a concrete replacement need.

## CORE.NAMING.001 - Name intent at boundaries

Use separate command and query mediator interfaces, business operation names, and specific external ports. Avoid generic bus, manager, helper, and service types when a narrower name exists.

`ICommandMediator` states write intent. `IPostPublicationNotifier` states one external capability. `IMessageBus` does neither.
