# Litenova Engineering Standards

Open-source engineering standards for Litenova Solutions applications developed by one maintainer with extensive AI assistance.

Version 1 targets a single bounded-context business application using ASP.NET Core, PostgreSQL, Marten, and an optional Next.js frontend. The standard covers the path from a short product brief to a small production-capable release.

## Consume the repository

Add the release as a root submodule and pin its exact commit:

```bash
git submodule add https://github.com/Litenova-Solutions/Engineering-Standards.git standards
git -C standards fetch --tags
git -C standards checkout v1.0.0
git add .gitmodules standards
```

Do not add `branch = main` to `.gitmodules`. Upgrade through a dedicated pull request that updates the recorded submodule commit.

Each consumer adds:

- `standards.project.json` for its profile, paths, recipes, and overrides.
- A short root `AGENTS.md` that points agents to `standards/AGENTS.md`.
- Product and use-case documentation under `docs/`.

## Repository map

```text
docs/core/                    Scope, principles, ADDD, and delivery
docs/profile/dotnet-nextjs/  Default application profile
docs/recipes/                 Optional patterns loaded by trigger
docs/reference/               Glossary and decision history
schemas/                      Public JSON contracts
templates/                    Runnable project and document templates
tooling/                      Validation, generation, and context CLI
generated/                    Committed machine indexes
```

Start with [AGENTS.md](AGENTS.md). Human readers can begin with [scope](docs/core/scope.md) and [ADDD](docs/core/addd.md).

## Tooling

Run the source-based .NET tool from a clean clone:

```bash
dotnet run --project tooling/src/Litenova.Standards.Tool -- validate
dotnet run --project tooling/src/Litenova.Standards.Tool -- generate
dotnet run --project tooling/src/Litenova.Standards.Tool -- check
```

Generated files are committed. CI fails when their sources and committed output differ.

From a consumer repository:

```bash
dotnet run --project standards/tooling/src/Litenova.Standards.Tool -- \
  scaffold use-case \
  --project standards.project.json \
  --feature posts \
  --name create-post \
  --kind command \
  --actor author

dotnet run --project standards/tooling/src/Litenova.Standards.Tool -- \
  generate --project standards.project.json
```

## Version policy

- Patch: clarification or correction that does not make compliant consumers invalid.
- Minor: additive rule, recipe, or capability that does not invalidate compliant consumers.
- Major: rule or contract change that requires consumer migration.

All releases have an annotated Git tag, GitHub Release, changelog entry, and migration note when consumer work is required.

## Reference application

[LitePress](https://github.com/Litenova-Solutions/LitePress) is the conformance application for the default profile.

## License

[MIT](LICENSE)
