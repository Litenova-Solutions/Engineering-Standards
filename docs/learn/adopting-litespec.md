# Adopt LiteSpec

## Intent

Adopting LiteSpec means pinning one release (building against one published version of the standard), describing the project, writing the first records (short pages stating product intent), and building to the standard with the checks in place. This page walks through that sequence in the order teams usually follow it, including what to record when a rule does not fit yet. Technical leads read it when they plan the rollout, so the team starts small and every departure stays visible instead of silent.

## Fit check

LiteSpec fits a team building one business application: one domain, one API, and one database, with one or more frontends, or a client-only app with no backend of its own. Check the [scope page](../core/scope.md) first. If the system is several services, or something other than a business application, LiteSpec is not built for it.

## Adoption steps

Teams usually adopt LiteSpec in six steps, from the pin to the checks. For the exact commands on a new repository, follow [Start a consumer repository](../tutorial/getting-started.md).

### 1. Pin a release

Add the LiteSpec repository to the project as a Git submodule at `litespec/`, at a release tag such as `v2.0.0`. That copy is the contract: it does not change until the tag moves, so a new LiteSpec release never breaks the build by surprise. The team adopts a newer release when it chooses, by moving the pin and reading the new release.

### 2. Describe the project

Run `litespec init` with the preset closest to the stack and the size:

```bash
litespec init --preset dotnet-react --size small
```

It writes `litespec.project.json` with the size, shape, and stacks, and records the release the team reviewed in `reviewedLiteSpecVersion`. Fill in the owners and paths, and select the extensions the project needs. The [selection page](https://litespec.dev/2.0.0/select/) shows which pages the choices apply.

### 3. Tell the agents

Add a LiteSpec section to the project's `AGENTS.md`. The selection page gives you the block to paste, and the `templates/consumer/project-agents.md` template in the release gives you a full starting file. From then on, every agent working in the repository loads the same rules.

### 4. Write the first records

Start with the product: one `docs/product/brief.md` that says what the product is, who it is for, and what it will never do. Then add records as work needs them, not all at once. A first module, its business records, and the use cases about to be built are enough to start. Each record has a template in the release.

### 5. Build to the standard

Build the first use case the way the standard describes: the backend projects, the handler in its folder, the result codes, the tests. Then build the model to see what the builder finds:

```bash
litespec model build
litespec model check
```

### 6. Add the checks to CI

Run `litespec consumer`, `litespec model check`, and the gates the [CI page](../quality/ci.md) lists for each area on every pull request. A gap then shows up in the change that caused it, not months later.

## Departures during adoption

Existing code rarely meets every rule at the start. Record each departure instead of ignoring it:

- An **Exception record** for a rule the project will not follow, with its reason and a review date.
- A **Known gap** for one the project will fix later, with an owner and an end date.

Both keep the checks honest. An exception holds until its review date, when someone looks at it again. A known gap is reported without failing the build until its end date, and fails after it.

## Next steps

[Start a consumer repository](../tutorial/getting-started.md) builds a first working project step by step.
