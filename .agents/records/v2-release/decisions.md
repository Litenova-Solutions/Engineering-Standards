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

### D4. Tests run on Microsoft.Testing.Platform, with a root global.json that sets only the runner

The .NET 10 `dotnet test` command refuses VSTest mode for xUnit v3 projects, so `global.json` sets `"test": { "runner": "Microsoft.Testing.Platform" }`. It sets no `sdk` section, because commit `ce130df` dropped the SDK pin on purpose so a consumer's own `global.json` governs. The command is `dotnet test --solution LiteSpec.slnx`. The VSTest packages (`Microsoft.NET.Test.Sdk`, `xunit.runner.visualstudio`) were dropped; `xunit.v3` 4.0.2 is the only test package.

### D5. The release branch carries 2.0.0 in the manifest, the changelog and the consumer template

The audit flagged `reviewedLiteSpecVersion: "2.0.0"` as higher than the latest tag `v1.18.0`. The consumer validator requires that field to equal the pinned manifest version, and `litespec/rule/core-maintaining.publish-a-litespec-release-from-a-tag` says the release carries its version in the manifest, the changelog and the template. So 2.0.0 stays, and the two sentences that contradicted it were rewritten: `AGENTS.md` "Version Handling" and `docs/core/maintaining.md` "The LiteSpec release". **Owner action:** tag `v2.0.0` on the release commit.

### D6. Behaviour changes made while porting

- The consumer validator runs the UI checks in-process; the 120-second child timeout and the "could not start" message are gone (changelog entry added).
- Every command writes UTF-8 and `
` line ends on every platform (the first build wrote the Windows code page and `
`).
- `litespec validate` checks that a `litespec <command>` in a Verification row names a real command, and that a cited `src/LiteSpec.*` or `tests/LiteSpec.*` path exists.
- `litespec validate` skips `src/`, `tests/`, `.agents/`, `bin/` and `obj/`, as the Node validator skipped `tools/model/`.
- `litespec model` parses options with the shared parser (`query <id> --root X` now works), exits 2 when the root holds no `litespec.project.json`, sorts findings on one line by code and message, parses ISO dates with the invariant culture, and exempts a retired use case from `reachedThrough`.
- `litespec model` reads record roots from `paths.docs`; the project schema now declares `paths.application`, `domain`, `infrastructure` and `webapi`, which the builder always read but the schema refused.
- The provision index says "1 kind" instead of "1 kinds"; the book closes two table-head rows it left open.
- `litespec model` printed `[time]` phase timings to standard error on every run; they now print only when `LITESPEC_TIMING` is set.

## Audit findings

A read-only audit ran before the port landed (28 findings). Fixed: rename leftovers (icon title, schema titles, glossary term, `.windsurfrules`), the extension index `switchesOn` column (7 rows out of step with the manifest), the ten finding codes and the region list missing from `docs/tools/model.md`, the wrong evidence code in `docs/backend/identifiers.md`, the retired use-case contradiction, the schema and builder path mismatch, `caching` instead of `cache` in `docs/core/scope.md`, the README submodule path, the Blazor omission in `docs/README.md`, the version contradiction (D5), the model builder code defects listed in D6, `replaces` in 14 consumer templates (only a decision may carry it), and the "1 kinds" grammar.

Also fixed after the first audit, as decisions taken on the owner's behalf:

- **D7. A result's HTTP status is `httpStatus`.** A result carried its HTTP status in `status`, the field every other record uses for draft, approved or retired, and the book had a workaround for the clash. It is now `httpStatus` (integer, 200 to 599) in the schema, the checker, the book, the use-case template and every fixture, and `status` always means the lifecycle. Done before the v2.0.0 tag because afterwards it would be a breaking change.
- **D8. Two checks gained the provisions that own them.** `litespec/rule/backend-identifiers.keep-business-record-names-unique-across-the-project` owns `business-record-name-clash`, and `litespec/rule/backend-api.record-each-results-http-status` owns `result-status`. Both are new provisions; **review their wording**.
- **D9. Failure-code reasons are lowercase.** The schema allowed an uppercase reason segment while the checker accepted lowercase only; no page or template used uppercase, so the schema now matches the checker.

**Left for the owner:**

1. An unreadable TRX file is skipped silently, so verified counts can shrink without a finding. Fixing it adds a new finding code.
2. When the LiteSpec docs are not beside the consumer, any `litespec/...` citation resolves; this leniency is undocumented.
3. Your untracked `PROPOSAL-CONSUMER-SPECIFICATIONS.md` predates v2 and makes `litespec validate` report 15 broken links while it sits in the working tree. It was not committed or changed.
4. The read-only defect review of the CLI and the comment cleanup of `src/` were stopped by Claude Code because the machine ran low on memory. The comment cleanup was finished by hand; the defect review did not run. Ask for it to be rerun when the machine has memory to spare.
5. Rename the GitHub repository to `Litenova-Solutions/LiteSpec` and tag `v2.0.0` (D1, D5).

## Progress

- [x] Rename sweep (commit `a37601c`).
- [x] CLI and tests by a Muse swarm of 12 writers plus 1 auditor, judged and fixed by the judge; Node and C# outputs compared on this repository and on the fixtures before the Node tools were deleted (commit `60f4f5a`).
- [x] 346 tests pass; `litespec validate` passes except the untracked proposal file; `litespec provisions --check` is current; the pattern library check passes.
- [x] Comments describe the code without reference to the deleted Node scripts.
- [x] D7 to D9, final verification, commit, push.
