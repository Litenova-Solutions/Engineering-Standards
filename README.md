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
templates/docs/               Optional ADDD document starting points
```

The schemas describe the manifest, consumer selection, recipe metadata, and ADDD frontmatter. They support editor or consumer validation but do not require a repository CLI.

Start with [AGENTS.md](AGENTS.md). Human readers can begin with [scope](docs/core/scope.md) and [ADDD](docs/core/addd.md).

## Use the documentation

Agents read `standards.project.json`, select the matching `loadPlans` entry in `standards.manifest.json`, and then read the named quick rules. There is no standards CLI and no application generator.

To start consumer documentation, copy only the files needed from [templates/docs](templates/docs/README.md) and replace their placeholders. Agents create application code from the profile and enabled recipes while matching the consumer repository's local patterns.

```bash
mkdir -p docs/product docs/domain
cp standards/templates/docs/standards.project.json standards.project.json
cp standards/templates/docs/project-agents.md AGENTS.md
cp standards/templates/docs/product-brief.md docs/product/brief.md
cp standards/templates/docs/domain-index.md docs/domain/README.md
cp standards/templates/docs/glossary.md docs/domain/glossary.md
```

## Version policy

- Patch: clarification or correction that does not make compliant consumers invalid.
- Minor: additive rule, recipe, or capability that does not invalidate compliant consumers.
- Major: rule or contract change that requires consumer migration.

All releases have an annotated Git tag, GitHub Release, changelog entry, and migration note when consumer work is required.

## Planned reference application

[LitePress](https://github.com/Litenova-Solutions/LitePress) will be migrated in separate work after this standards version is reviewed. It is not current conformance evidence for the rebuilt v1.

## License

[MIT](LICENSE)
