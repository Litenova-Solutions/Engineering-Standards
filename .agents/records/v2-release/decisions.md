# LiteSpec v2.0.0 release preparation: decisions and progress

This file records the choices made while preparing v2.0.0 on `release/v2.0.0`, so the owner can review them. Each decision states what was chosen, the alternatives, and why. Reverse any of them by telling the agent which one.

## Decisions

### D1. The product name is LiteSpec everywhere it names the product

- "Agentic Engineering System", "Litenova Engineering Standards" and "Engineering Standards" become "LiteSpec". Litenova Solutions stays as the company that authors it.
- Provision IDs change prefix: `standards/rule/...` becomes `litespec/rule/...`. This is a v2.0.0 complete contract, so no alias is kept (`litespec/rule/core-authoring.exclude-cross-release-compatibility-work`).
- Files: `standards.manifest.json` becomes `litespec.manifest.json`, `standards.project.json` becomes `litespec.project.json`, and the two schemas become `schemas/litespec-manifest.schema.json` and `schemas/litespec-project.schema.json`.
- The consumer submodule path is `litespec/`, not `standards/`.
- The project field `reviewedStandardsVersion` becomes `reviewedLiteSpecVersion`. Considered `reviewedVersion`; rejected because a consumer project file holds other versions, and the explicit name is greppable.
- Two headings changed with the rename, so their IDs changed with them: `core-authoring.record-the-reviewed-litespec-release` and `core-maintaining.publish-a-litespec-release-from-a-tag`. Glossary terms `term/litespec` and `term/litespec-release` replace `term/agentic-engineering-system` and `term/standards-release`.
- The common noun "standard" stays where it names the content kind: a page's `## Standards` section, a "standards page", a "standards provision". Renaming those would change the page contract for no reader benefit.
- `docs/core/system.md` "In this name" now explains `Lite` and `Spec` instead of `Agentic`, `Engineering` and `System`. **Review this wording**; it is new prose.
- `changelog/v1.md` keeps the old names, because it records what was true in v1.
- **Owner action:** the GitHub repository is still `Litenova-Solutions/Engineering-Standards`. The README badges and links now point at `Litenova-Solutions/LiteSpec`. Rename the repository on GitHub before publishing the release; GitHub redirects the old URL afterwards. The hosted documentation URL `https://www.litenova.solutions/Standards` is unchanged because the site is outside this repository.

### D2. One .NET CLI, `litespec`, replaces the Node validators and the book script

- `src/LiteSpec.Cli/` (assembly and tool command `litespec`) holds every command: `validate`, `provisions`, `consumer`, `ui`, `model`, `book`. The model builder moved in from `tools/model/Litenova.Model/` as `litespec model`.
- `tests/LiteSpec.Cli.Tests/` (xUnit v3) replaces the four `*.cases.mjs` suites, and holds the model and book fixtures that lived under `tools/`.
- `LiteSpec.slnx` at the root builds both.
- One option style: `--root <path>` and `--format json` on every command (the Node scripts took a positional root and `--format=json`; `--format=json` still parses).
- The consumer validator calls the UI validator in-process instead of spawning a child process, so the 120-second child timeout and the "could not start" message no longer apply.
- How it runs: `dotnet run --project src/LiteSpec.Cli -- <command>` in this repository, `dotnet run --project litespec/src/LiteSpec.Cli -- <command>` in a consumer. The project is also packable as a .NET tool (`PackAsTool`), so a NuGet feed can ship it later without code changes.
- New packages (test only): `xunit.v3` 4.0.2, `xunit.runner.visualstudio` 4.0.1, `Microsoft.NET.Test.Sdk` 18.11.0, pinned in `Directory.Packages.props`. No runtime package was added; the JSON Schema subset validator is ported rather than replaced by a library, so behaviour and messages stay identical.

### D3. The UI pattern library keeps its Node tooling

`patterns/ui/` holds 26,000 lines of JavaScript modules that draw HTML mocks for a browser viewer, with Playwright screenshots. Porting that to .NET would mean rewriting the library's content, not its tooling. It stays Node, and `node patterns/ui/library.mjs --check` remains a repository check. CI now runs that check (it did not before).

## Progress

- [x] Rename sweep, checks green on the Node tooling (commit `a37601c`).
- [x] CLI skeleton: project, dispatcher, shared argument and JSON helpers, LiteSpec home lookup, test runner support.
- [x] CI workflow `.github/workflows/litespec.yml`: build, test, provision index, validate, whitespace, pattern library.
- [ ] Ports by the Muse swarm (see the table below), verified by the judge.
- [ ] Parity check: Node and .NET outputs compared on the repository and fixtures.
- [ ] Node scripts removed; docs, agent files and changelog updated.
- [ ] Audit findings fixed.
- [ ] Final verification, commit, push.
