# LiteSpec 2.0.0 decisions

This page records the choices behind the 2.0.0 contract, for the owner's review. Each one states what was chosen and why. [structure.md](structure.md) states the resulting layout. Reverse a decision by telling the agent which one.

## Decisions

### D1. The product is LiteSpec

LiteSpec names the product everywhere. Litenova Solutions is the company that authors it. The release files are `litespec.manifest.json` and a consumer's `litespec.project.json`, a consumer pins the repository at `litespec/`, and records the release it reviewed in `reviewedLiteSpecVersion`. The repository is `Litenova-Solutions/LiteSpec`.

### D2. One .NET command line, `litespec`

One .NET 10 tool holds every command: `validate`, `provisions`, `init`, `consumer`, `ui`, `model`, `book` and `patterns`. Every reporting command takes `--root` and `--format json`, and every command writes UTF-8 with `\n` line ends. The consumer validator runs the UI checks in process. The tool is packable with `PackAsTool`, so a NuGet feed can ship it later. The JSON Schema evaluator is LiteSpec's own, so no runtime package was added.

### D3. Tests run on Microsoft.Testing.Platform

`global.json` selects the Microsoft.Testing.Platform runner and pins no SDK, so a consumer's own `global.json` governs. The command is `dotnet test --solution LiteSpec.slnx`. `xunit.v3` is the only test package.

### D4. The release branch carries 2.0.0

The manifest, the changelog and the consumer template carry 2.0.0. The `v2.0.0` tag makes it the current release.

### D5. A result's HTTP status is `httpStatus`

A Result records its HTTP status in `httpStatus` (200 to 599), so `status` always means draft, approved or retired. Failure-code reasons are lowercase, and two finding codes have provisions that own them: `business-record-name-clash` and `result-status`.

### D6. The published home is https://litespec.dev

Every schema `$id` is `https://litespec.dev/<version>/schemas/<file>`, and `litespec validate` keeps them on the manifest version. The site is LiteSpec's own, built by a later `litespec site` command and deployed on each tag.

### D7. Stacks are folders inside their area

A stack is a folder with a `stack.md` inside its area: `backend/dotnet/`, `frontend/web/react/`, `frontend/web/svelte/` and `frontend/blazor/`. Selecting a stack applies its folder, every folder above it, and their subfolders that hold no stack. A provision ID is `litespec/<page>#<slug>`, and the heading carries no ID. A project names a size, a shape (`server` or `client-only`) and its stacks. Presets fill in a common selection for `litespec init`.

### D8. 2.0.0 is a clean-slate release

2.0.0 carries no migration map, no refusal of earlier forms, no compatibility default and no history-specific material. The changelog describes 2.0.0 as a complete contract.

### D9. The repository is a monorepo with the standard at the root

The standard (`docs/`, `schemas/`, `templates/`, `litespec.manifest.json`) stays at the root, because a consumer pins the root and every path it reads starts there. Each deliverable has its own folder: the CLI at `apps/cli/`, later the site at `apps/site/` and analyzers under `packages/`. Rejected: separate repositories, because the CLI must match its release exactly, and the standard under `spec/`, which adds an empty segment to every consumer path.

### D10. UI patterns are specification text with drawn wireframes

Each pattern lives on a pattern page in `docs/frontend/patterns/<group>.md`, and each option carries a wireframe in the closed text language `docs/frontend/patterns.md` defines. Agents build from the text in their own stack and design system. People choose from the drawings `litespec patterns preview` makes at 1200 and 390 pixels. No drawing is committed. The ten groups hold 133 patterns and 947 options, converted from the earlier HTML mocks, which were deleted. A consumer catalog cites a pattern by its ID.

Open gaps in the language: a progress part, icons in tab labels, and a status placed under a heading rather than beside it.

### D11. The vocabulary is size, shape, stack and preset

"Profile" is gone except for the UI density profile, a separate concept. The provisions and the finding code that carried it were renamed.

### D12. Prose follows the Google developer documentation style guide

Chosen by the owner on 2026-10-21. The homemade controlled-prose style, its sentence, list, table-cell and paragraph limits, and its bans on contractions and vague words are gone, with their checks. So are the Agent Summary section on every page and the rule that every paragraph of `AGENTS.md` cites a provision. `docs/core/authoring.md` adds five rules to the guide: ASCII only, one term per concept, capitalized modals only inside a Requirement, Title Case page titles, and nothing about earlier releases. The repository uses US English, and the record field `fulfils` and the requirement kind `behaviour` became `fulfills` and `behavior`.

### D13. litespec.dev is a static Astro site in apps/site/

Chosen by the owner on 2026-10-21. The site is maintainer tooling, built in CI and never shipped to consumers, so it lives in `apps/site/` rather than in the CLI. It is static Astro 7 output for Cloudflare Pages, built from the standard at the repository root through one loader (`apps/site/src/lib/spec.ts`). People read HTML pages. Agents read `/llms.txt`, a raw `.md` copy of every page, one index per selection (shape and stacks) and one bundle per layer. The UI is hand-written CSS (D16). Wireframes are drawn by a TypeScript port of the C# renderer, proved byte-identical by golden SVGs from `litespec patterns svg`.

### D14. Learning pages are explanation pages in docs/learn/

Chosen by the owner on 2026-10-21. The pages that teach a person what LiteSpec is and why it exists belong to the versioned standard, so they live in `docs/learn/` with a new explanation page style: an Intent, free sections, no provisions, and no selection applies them. The site renders them, agents get them as raw Markdown, and `litespec validate` checks them. Only the landing page is site-only; its two calls to action lead to the selection page and to the learning pages.

### D15. Templates carry placeholders, not fixture values

`templates/consumer/litespec.project.json` named a fixture owner and solution, which `litespec init` copied into every new project. It now carries `__PROJECT__` and `__OWNER__`. `litespec init` fills `__PROJECT__` from the project name and lists what is left, and `litespec consumer` refuses a project file that still holds a placeholder.

### D16. The site has its own flat, bordered design

Chosen by the owner on 2026-10-21 from a series of mockups, replacing Bootstrap. The content sits in a centered 1280px column with visible side rails on a tinted page, and the footer stays at the bottom of a short page. Borders replace shadows. Colors come from one palette built on the logo's charcoal and amber: warm neutrals, an amber ramp, and three muted support hues (sage, slate, clay). Amber marks only the current item, important text and focus; rules, conventions and patterns get amber, sage and slate labels. Every component uses semantic tokens from `apps/site/src/styles/site.css`, never a raw color. Type is Geist and Geist Mono from Google Fonts. Search uses Pagefind's JavaScript API with no extra package. The header's Docs link opens the overview of the learn pages, and the docs sidebar starts with them as Start; tutorials and how-to guides follow the standard as Guides. Code blocks are highlighted by Shiki (GitHub light and dark themes), and pattern options have Preview and Wireframe tabs and a full-screen viewer.

### D17. LiteSpec.Analyzers checks .NET code against the standard

Requested by the owner on 2026-10-21. `apps/analyzers/` builds the `LiteSpec.Analyzers` NuGet package: Roslyn analyzers whose every diagnostic cites the provision it enforces and links to it on litespec.dev. LS1xxx check Domain, LS2xxx the outer layers, LS3xxx naming and style in all five projects. A rule runs only in the layers its provision covers; the layer comes from the `LiteSpecLayer` MSBuild property, or else from the assembly name suffix. The package targets netstandard2.0 and builds against Microsoft.CodeAnalysis.CSharp 4.14.0, so it runs on the .NET 9.0.300 SDK, Visual Studio 17.14, and later; the CLI keeps its own newer Roslyn version. Tests compile sources against the running .NET's own assemblies and mark expected spans inline, so the suite needs no extra test package.

### D18. litespec.dev runs on Cloudflare Workers and is built for search

Chosen by the owner on 2026-10-21. The site is a static-assets-only Worker on the free plan with the custom domain `litespec.dev`; `www.litespec.dev` redirects through a one-file Worker, and the zone forces HTTPS with Full (strict) SSL and TLS 1.2 or later. The landing page states plainly what LiteSpec is: the specification standard for building business applications with AI agents. Every page carries a canonical URL, a trimmed description, Open Graph and Twitter cards, and a JSON-LD graph; a sitemap lists every HTML page with its git date; raw Markdown and agent index files are `noindex` so search shows the HTML page. Fonts are self-hosted. Diagrams are SVG files in `docs/assets/diagrams/` that the site inlines so they follow the theme, while agents and GitHub see an ordinary image. `docs/learn/how-litespec-compares.md` compares LiteSpec with other spec-driven approaches from their official pages, each source with its read date.

## Open items for the owner

1. Buy `litespec.dev` and point it at Cloudflare.
2. Approve the `v2.0.0` tag.
3. Decide whether to delete the `v1.14.0` to `v1.18.0` tags on GitHub.
4. An unreadable TRX file is skipped without a finding, so verified counts can shrink silently. A fix adds a finding code.
5. When the LiteSpec docs are not beside a consumer, any `litespec/...` citation resolves. This leniency is undocumented.
