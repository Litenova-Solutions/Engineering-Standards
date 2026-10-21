# Adopt LiteSpec

## Intent

This page describes what adopting LiteSpec involves for a team, in the order teams usually do it. For the exact steps on a new repository, follow [Get started](../tutorial/getting-started.md).

## Before you start

LiteSpec fits a team building one business application: one domain, one API and one database, with one or more frontends, or a client-only app with no backend of its own. Check the [scope page](../core/scope.md) first. If your system is several services, or something other than a business application, LiteSpec isn't built for it.

## 1. Pin a release

Add the LiteSpec repository to your project as a Git submodule at `litespec/`, at a release tag such as `v2.0.0`. That copy is your contract. It doesn't change until you move the tag, so a new LiteSpec release never breaks your build by surprise. You adopt a newer release when you choose to, by moving the pin and reading what changed.

## 2. Describe your project

Run `litespec init` with the preset closest to your stack and your size:

```bash
litespec init --preset dotnet-react --size small
```

It writes `litespec.project.json` with your size, shape and stacks, and records the release you reviewed in `reviewedLiteSpecVersion`. Fill in the owners and paths, and select any extensions you need. The [selection page](https://litespec.dev/2.0.0/select/) shows which pages your choices apply.

## 3. Tell your agents

Add a LiteSpec section to your project's `AGENTS.md`. The selection page gives you the block to paste, and the `templates/consumer/project-agents.md` template in the release gives you a full starting file. From then on, every agent working in the repository loads the same rules.

## 4. Write the first records

Start with the product: one `docs/product/brief.md` that says what the product is, who it's for, and what it will never do. Then add records as work needs them, not all at once. A first module, its business records, and the use cases you're about to build are enough to start. Each record has a template in the release.

## 5. Build to the standard

Build the first use case the way the standard describes: the backend projects, the handler in its folder, the result codes, the tests. The model builder then finds what you built:

```bash
litespec model build
litespec model check
```

## 6. Add the checks to CI

Run `litespec consumer`, `litespec model check` and the gates the [CI page](../quality/ci.md) lists for each area on every pull request. A gap then shows up in the change that caused it, not months later.

## When a rule doesn't fit yet

Most teams adopt LiteSpec into code that already exists, and not every rule fits on day one. Record each departure instead of ignoring it:

- an **Exception record** for a rule you won't follow, with your reason and a review date
- a **Known gap** for one you'll fix later, with an owner and an end date

Both keep the checks honest. An exception holds until its review date, when someone looks at it again. A known gap is reported without failing the build until its end date, and fails after it.

## Next

[Get started](../tutorial/getting-started.md) builds a first working project step by step.
