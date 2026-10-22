# Contributing

## Who This Is For

You contribute to the LiteSpec repository: the standard, the schemas, the templates, the command line, the analyzers, or the site. After reading this page you know where each change goes, which steps it needs, and which checks prove it.

## What It Is

Submit every change through a branch and pull request against `main`. Direct pushes to `main` stay outside the release process.

Follow the [authoring standard](docs/core/authoring.md) for every standards page, template, and release note. Keep one canonical source for each provision, version, extension, and technical fact, and link to that source instead of copying it.

## Repository Map

| Area | Start with | What lives there |
|:---|:---|:---|
| The standard | [docs/README.md](docs/README.md) | Every page a project applies, plus lookup and how-to pages |
| JSON contracts | [schemas/README.md](schemas/README.md) | The schemas that validate the manifest, the project file, the records, and the UI files |
| Seed files | [templates/README.md](templates/README.md) | The consumer templates, the init presets, and the seeds for LiteSpec pages |
| Command line | [apps/cli/README.md](apps/cli/README.md) | The `litespec` tool: validation, scaffolding, model, book, and pattern commands |
| Analyzers | [apps/analyzers/README.md](apps/analyzers/README.md) | The Roslyn rules that check .NET applications against the standard |
| Site | [apps/site/README.md](apps/site/README.md) | `litespec.dev`, the static site that publishes the standard |
| Release pins | [litespec.manifest.json](litespec.manifest.json) | Version, stacks, shapes, extensions, and toolchain and package pins |
| Release notes | [CHANGELOG.md](CHANGELOG.md) | The current release described as a contract |
| Automation | [.github/workflows/litespec.yml](.github/workflows/litespec.yml) | The checks every pull request runs |

## Local Setup

1. Install the .NET 10 SDK. The command line and the analyzers build on it, and [Directory.Build.props](Directory.Build.props) targets `net10.0`. [global.json](global.json) selects the test runner and pins no SDK.
2. Install Node 24 and pnpm 11 only when you change the site. The exact pins live in [apps/site/package.json](apps/site/package.json) and under `stack` in [litespec.manifest.json](litespec.manifest.json).
3. Run every command in this page from the repository root.
4. Read `git status` before you start, and leave unrelated work alone.
5. Add no package without owner approval. [Directory.Packages.props](Directory.Packages.props) holds the central versions for the repository tools.

## Change Workflows

Change the records, code, tests, contracts, and operations that belong together in one change. Each workflow below lists its steps in order.

### Change a Provision and Its Citations

1. Decide whether the assertion changes. A reword that obliges the same action keeps its ID. A requirement that obliges a different action, a wider scope, or a different actor takes a new ID.
2. Write the new provision under a new heading on its page. Never reuse the retired heading.
3. Delete the retired provision and its Verification row. Leave no alias, replacement map, or note that the identifier moved.
4. Update each page that cited the retired ID. [docs/reference/provisions.md](docs/reference/provisions.md) resolves every citation to its page, and `litespec validate` reports a citation with no owner.
5. Update the validator case that covers the rule, in both directions: one passing case and one failing case. A rule with only one side stays unverified.
6. Run `litespec provisions` and commit the regenerated index.
7. Record the change in [CHANGELOG.md](CHANGELOG.md) as the current contract, without a transition path.

A consumer that pinned the earlier release keeps that release and its own exceptions. Adopting the new release means re-reading the amended provision and every exception that named the retired ID.

### Add a Page

1. Place the page where it applies: a principle in its area folder, a realization in its stack folder such as [docs/backend/dotnet/](docs/backend/dotnet/). The path states the provision scope, and two pages never share one.
2. Use the sections of its page style from the [authoring standard](docs/core/authoring.md). A Standard states one testable obligation under one heading, with one provision ID, one Verification row, and an example where the standard requires one.
3. Write no ID in the heading. The ID follows the page path and the heading, so the two never disagree.
4. Regenerate the provision index and update the changelog.

### Add a UI Pattern Option

1. Open the group page in [docs/frontend/patterns/](docs/frontend/patterns/) that owns the recurring question.
2. Add the option under its pattern as a `####` heading with its `wireframe` block, its rationale, and its cost. An option ID stays stable once published, so the catalogs that cite it keep resolving.
3. Run `litespec patterns check` and fix every broken wireframe before review.

### Add an Extension

1. Write the page under [docs/ext/](docs/ext/) for any stack, or under a stack `ext/` folder such as `docs/backend/dotnet/ext/` for one stack only.
2. Declare Intent, Activation, Baseline relationship, Standards, Conventions, Dependencies, and Verification. Name each baseline provision the extension replaces.
3. Record the path, the activation scope, the replaced provisions, and the switched-on record types in [litespec.manifest.json](litespec.manifest.json). Create no separate extension descriptor: the page and the manifest entry form the contract.
4. Update the changelog and regenerate the provision index.

### Add a Stack

1. Add the folder with its `stack.md` page. Selecting the stack applies that folder, every folder above it, and their subfolders that hold no stack.
2. Record the folder under `stacks` in [litespec.manifest.json](litespec.manifest.json), with the pairing rules (`requires`, `pairsWith`) when the stack needs them.
3. Update the pages that list the shipped stacks, the changelog, and the provision index.

### Add a CLI Check

1. Put the validator beside its command under [apps/cli/src/LiteSpec.Cli/](apps/cli/src/LiteSpec.Cli/): `Authoring/`, `Consumer/`, `Ui/`, `Model/`, `Book/`, `Patterns/`, `Init/`, or `Schemas/`. Read [apps/cli/README.md](apps/cli/README.md) for the file each folder owns.
2. Add the diagnostic code to the stable list when the rule is final. Every authoring rule is an error. `WarningDiagnosticCodes` stays empty and holds a rule only while a newly added check burns down against existing content.
3. Cover the rule with one passing case and one failing case in [apps/cli/tests/LiteSpec.Cli.Tests/](apps/cli/tests/LiteSpec.Cli.Tests/), with fixtures under `Fixtures/` where the command reads files.
4. Run the solution build and tests, then `litespec validate`.

### Add an Analyzer Rule

1. Add the analyzer under [apps/analyzers/src/LiteSpec.Analyzers/Rules/](apps/analyzers/src/LiteSpec.Analyzers/Rules/) in `Domain/`, `Layers/`, or `Style`, with its descriptor in `Descriptors.cs` naming the provision and its help link.
2. Note the rule in `AnalyzerReleases.Unshipped.md` with its ID, category, and severity.
3. Add tests beside the existing ones in [apps/analyzers/tests/LiteSpec.Analyzers.Tests/](apps/analyzers/tests/LiteSpec.Analyzers.Tests/).
4. Build, test, and pack the package as the verification section shows.

### Change the Site

1. Change behavior in [apps/site/](apps/site/): the loader `src/lib/spec.ts` reads the standard, and the pages, components, layouts, and styles render it. Read [apps/site/README.md](apps/site/README.md) for the file each path owns.
2. When you change the wireframe renderer, update the golden SVGs beside `wireframe.test.ts` and run the golden tests.
3. Build the site and run its tests as the verification section shows.

## Verification

Run these from the repository root before a change is done:

```bash
dotnet build LiteSpec.slnx
dotnet test --solution LiteSpec.slnx
dotnet run --project apps/cli/src/LiteSpec.Cli -- provisions
dotnet run --project apps/cli/src/LiteSpec.Cli -- validate
git diff --check
```

`litespec validate` checks schemas, manifest references, provision IDs, page contracts, pattern pages and their wireframes, links, and verification marks. `litespec provisions` rewrites the provision index.

Run the further checks your area selects, as [.github/workflows/litespec.yml](.github/workflows/litespec.yml) runs them:

```bash
dotnet pack apps/analyzers/src/LiteSpec.Analyzers --no-build --output artifacts
dotnet run --project apps/cli/src/LiteSpec.Cli --no-build -- provisions --check
```

For a site change, from the repository root:

```bash
pnpm --dir apps/site install --frozen-lockfile
pnpm --dir apps/site test
pnpm --dir apps/site build
```

`test` runs the golden wireframe tests, and `build` renders the static output with its search index.

## Pull Requests

1. State the constraint, decision, or defect that requires the change under Reason.
2. Check off the Verification list with the exact commands you ran.
3. Complete the Authoring Review list: one current assertion per active ID, the declared identifier grammar, the committed provision index, one testable meaning per provision, glossary terms, useful rationale and examples, guide style, exact verification evidence, and no transition material.
4. Write `None.` under Skipped Checks, or name each skipped command with its exact reason. Continuous integration fails an empty section.
5. Resolve each actionable review comment before merge. Use squash merge unless separate commits preserve needed review evidence.

The maintainer merges their own pull request after every required check passes and an AI reviewer examines the complete diff.

The [Defect](.github/ISSUE_TEMPLATE/defect.yml) form reports a page, schema, template, or validator that contradicts the contract. The [Proposal](.github/ISSUE_TEMPLATE/proposal.yml) form proposes a change to what the standard requires, permits, or generates.

## Releases

Each release states its complete contract. Add no compatibility guarantee, migration path, deprecation period, replacement map, or identifier alias between LiteSpec releases. That rule covers LiteSpec releases only: a consumer product keeps its own compatibility, migration, and rollback provisions.

To prepare a release:

1. Name the version in [litespec.manifest.json](litespec.manifest.json), in the topmost [CHANGELOG.md](CHANGELOG.md) entry, and in `reviewedLiteSpecVersion` in [templates/consumer/litespec.project.json](templates/consumer/litespec.project.json). Every schema `$id` names the release under `https://litespec.dev/<version>/schemas/`.
2. Tag the commit with the version number. The highest git tag is the current release, as [docs/core/maintaining.md](docs/core/maintaining.md) states.
