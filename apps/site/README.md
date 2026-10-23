# litespec.dev

## Audience

You maintain the `litespec.dev` site in `apps/site/`. You change its design, its agent endpoints, its routes, or its deployment. After reading this page you know how to run it, where each behavior lives, and how to make the common changes without breaking the build.

## What It Is

The site is the static Astro 7 site that publishes the LiteSpec standard at `https://litespec.dev`. It is maintainer tooling, not part of a consumer project, so it lives in `apps/site/` rather than in the CLI. It builds from the standard at the repository root through one loader, `src/lib/spec.ts`. People read HTML pages. Agents read `/llms.txt`, a raw `.md` copy of every page, one index per selection of shape and stacks, and one bundle per layer. The UI is hand-written CSS. Wireframes are drawn by a TypeScript port of the C# renderer, proved byte-identical by golden SVGs.

The project file is `apps/site/package.json`. It names the package `litespec-site`, the package manager `pnpm@11.28.5`, the engine `node >=24`, the dependencies `astro 7.3.5` and `@astrojs/markdown-remark 7.3.1`, and the dev dependency `pagefind 1.5.2`. The workspace file `apps/site/pnpm-workspace.yaml` allows the `esbuild` build. The TypeScript config `apps/site/tsconfig.json` extends the Astro strict config and excludes `dist/`. The ignore file `apps/site/.gitignore` ignores `node_modules/`, `dist/`, and `.astro/`.

## Quick Start

Run every command in this section from the repository root.

Install the site dependencies:

```bash
pnpm --dir apps/site install
```

Start the dev server:

```bash
pnpm --dir apps/site dev
```

Build the static output and the search index:

```bash
pnpm --dir apps/site build
```

Preview the built output:

```bash
pnpm --dir apps/site preview
```

Run the site tests:

```bash
pnpm --dir apps/site test
```

`dev` runs `astro dev`. `build` runs `astro build && pagefind --site dist`. `preview` runs `astro preview`. `test` runs `node --test "src/**/*.test.ts"`.

## Layout

The config files sit at the top of `apps/site/`. The source lives under `src/lib/`, `src/components/`, `src/layouts/`, `src/pages/`, and `src/styles/`. Static files live in `public/`.

| Path | What it owns |
|:---|:---|
| `astro.config.mjs` | Site origin `https://litespec.dev`, static output, trailing slashes, directory URLs, and the `_redirects` integration that maps `/latest` to the manifest version. |
| `package.json` | Scripts, engines, and dependencies named above. |
| `pnpm-workspace.yaml` | The `esbuild` build permission. |
| `tsconfig.json` | The Astro strict extension and the `dist/` exclusion. |
| `public/favicon.svg` | The browser icon. |
| `src/lib/spec.ts` | The one loader every page and endpoint reads. It finds the repository root, reads `litespec.manifest.json`, parses every page under `docs/`, and computes selections, layers, and URLs. |
| `src/lib/render-markdown.ts` | The Markdown to HTML pipeline with Shiki highlighting, provision cards, and wireframe option cards. |
| `src/lib/code-blocks.ts` | The code block figure, header strip, language label, and copy button. |
| `src/lib/agent-text.ts` | The plain-text builders for every agent endpoint, with `SITE_ORIGIN` set to `https://litespec.dev`. |
| `src/lib/areas.ts` | The docs areas, their labels, icons, notes, and the sidebar sections. |
| `src/lib/icons.ts` | The fixed line icon set, drawn in the style of Lucide on a 24px grid. |
| `src/lib/wireframe/parse.ts` | The wireframe language parser, a port of the CLI parser. |
| `src/lib/wireframe/render.ts` | The wireframe SVG renderer, a port of the CLI renderer. |
| `src/lib/wireframe/index.ts` | The wireframe module boundary that re-exports the parser and the renderer. |
| `src/lib/wireframe/wireframe.test.ts` | The golden tests that lock the parser and the renderer. |
| `src/lib/wireframe/fixtures/` | One `.wireframe` input per option with its golden `.desktop.svg` and `.phone.svg` outputs, plus `errors.json` for the failure cases. |
| `src/components/` | The Astro components named under Components. |
| `src/layouts/Base.astro` | The shared layout with the head, the frame, the header, the footer, and the copy behavior. |
| `src/pages/` | The routes named under Routes. |
| `src/styles/site.css` | The palette, the semantic tokens, the frame, the header, the footer, and the shared primitives. |
| `src/styles/docs.css` | The three-column docs layout, the sidebar tree, the breadcrumb, the pager, and the `On this page` list. |
| `src/styles/prose.css` | The rendered page body: headings, provision cards, tables, code, and option cards. |
| `src/styles/code.css` | The highlighted code blocks and the Shiki theme selection. |
| `src/styles/select.css` | The selection page header block. The form carries its own styles in `SelectForm.astro`. |

## How It Works

### The Loader

`src/lib/spec.ts` is the only module that reads the standard. It finds the repository root by walking up from the working directory for `litespec.manifest.json`, so a bundled build never relies on its own URL. It exports `root`, `manifest`, `version` (currently `2.0.0`), `pages`, `provisions`, `selections()`, `layers()`, `appliedPages()`, `selectionLayers()`, `selectionKey()`, `extensionStack()`, `backendStacks`, `frontendStacks`, `schemaFiles`, and the URL helpers `htmlPath()`, `pageUrl()`, `rawUrl()`, `layerUrl()`, and `selectionIndexUrl()`.

It parses every `.md` file under `docs/` once. Each `Page` carries its repository-relative `file`, its `path` under `docs/` without `.md`, its `style`, its `area` (the first folder under `docs/`), its `title`, its `intent` (the first paragraph of `Intent`, `Purpose`, or `Name`), its `sections`, its `provisions`, and its raw `markdown`. The `slug()` helper matches the CLI heading slug, so heading IDs and provision IDs agree with the validator. The `learn/` pages keep the order their index lists; every other page sorts by path. Selection and layer logic mirrors the CLI layout rules: the always-applied `docs/core`, `docs/workspace`, and `docs/quality` pages, the chain of folders above each selected stack with their stack-free companion folders, the shape `backendPages`, and the selected extensions.

### Rendering

`src/lib/render-markdown.ts` renders one standard page to the HTML the site serves. It creates the Markdown processor from `@astrojs/markdown-remark` with Shiki highlighting that excludes `wireframe` blocks, the Shiki themes `github-light` and `github-dark` emitted as CSS variables, and `smartypants` off. It then post-processes the HTML in order: heading IDs from the loader slug with the `H1` dropped (the template shows the title), a `toc` of `H2` entries and provision `H3` entries, relative links between docs pages rewritten to site URLs, wireframe blocks replaced by option figures, option annotations merged into their cards, option `H4` IDs hoisted onto their cards, tables wrapped in `table-wrap` (with `table-provisions` when the first column holds provision IDs), code blocks decorated, and provisions wrapped in cards with kind and verification badges and an ID footer with a copy button.

`src/lib/code-blocks.ts` wraps each Shiki-highlighted block in a `code-block` figure with a header strip that shows the language name and a copy button. The `languageLabel()` map names `Shell`, `PowerShell`, `JSON`, `TypeScript`, `YAML`, `Markdown`, and the other supported labels. Plain wireframe text blocks carry no `astro-code` class, so they pass through untouched.

### Agent Text

`src/lib/agent-text.ts` formats every plain-text endpoint from the same loader data, so the endpoints cannot disagree with each other. `rawMarkdown()` returns the file exactly as it is in `docs/`, with relative links between pages rewritten to absolute raw URLs. `concatenatedMarkdown()` joins pages with a comment that names each raw source URL and a line holding `---` between pages. `fullLlmsText()` concatenates every page except the UI pattern pages. `layerText()` concatenates one layer. `versionLlmsText()` groups every page by area with its raw URL, and points at `llms-full.txt` and at the selection indexes. `selectionLlmsText()` lists the pages one selection applies, grouped by layer, then the addable extensions and the UI pattern groups, then how to read the index. `rootLlmsText()` lists the release index, every selection, every layer bundle, and the `AGENTS.md` block. The selection helpers `selectionTitle()` and `selectionLine()` write strings such as `Server with dotnet and react` and `A server project using the dotnet backend stack and the react frontend stack.`

### Routes

| Route file | URL | What it writes |
|:---|:---|:---|
| `src/pages/index.astro` | `/` | The landing page with the release badge, the `The spec your agents build from.` title, and the two calls to action to the selection page and the learning pages. |
| `src/pages/llms.txt.ts` | `/llms.txt` | The root agent index: how to use the site, the release index, every selection, every layer bundle, and the `AGENTS.md` block. Content type `text/plain`. |
| `src/pages/[version]/index.astro` | `/2.0.0/` | The release home: every page by area with its intent and provision count, plus the stack and extension counts. |
| `src/pages/[version]/[...page].astro` | `/2.0.0/<path>/` | One HTML page per spec page: the sidebar tree, the breadcrumb, the title, the lead (the first sentence of the intent), the copy and Markdown tools, the rendered body, and the Previous and Next cards. Pattern pages use the full content width with no right column and add the pattern viewer. |
| `src/pages/[version]/[...page].md.ts` | `/2.0.0/<path>.md` | The raw Markdown of one page with links rewritten to absolute raw URLs. Content type `text/markdown`. |
| `src/pages/[version]/llms.txt.ts` | `/2.0.0/llms.txt` | The version index: every page grouped by area with its raw Markdown link. Content type `text/plain`. |
| `src/pages/[version]/llms-full.txt.ts` | `/2.0.0/llms-full.txt` | The whole release as one file, except the UI pattern pages. Content type `text/plain`. |
| `src/pages/[version]/layers/[...layer].md.ts` | `/2.0.0/layers/<key>.md` | One layer bundle such as `core` or `backend/dotnet`, in the same format as `llms-full.txt`. Content type `text/markdown`. |
| `src/pages/[version]/schemas/[file].ts` | `/2.0.0/schemas/<file>` | A byte copy of one file from `schemas/`, such as `record.schema.json`. Content type `application/json`. Returns `Not found` with status 404 for a name outside the manifest release. |
| `src/pages/[version]/select/index.astro` | `/2.0.0/select/` | The project selection page with presets from `templates/presets/`, size, shape, backend and frontend stacks, extensions, and live outputs for the agent index URL, the `AGENTS.md` block, the `litespec.project.json` fragment, and the start command, plus the list of every selection. |
| `src/pages/[version]/select/[key]/llms.txt.ts` | `/2.0.0/select/<key>/llms.txt` | The index of one selection such as `server.dotnet.react`. Content type `text/plain`. Returns `Not found` with status 404 for an unknown key. |

`astro.config.mjs` sets `site` to `https://litespec.dev`, `output` to `static`, `trailingSlash` to `always`, and `build.format` to `directory`. Its `litespec-latest-redirects` integration writes the `_redirects` file in `astro:build:done` with `/latest  /2.0.0/  302` and `/latest/*  /2.0.0/:splat  302`, so Cloudflare Pages redirects the unversioned paths to the manifest version.

### Design System

`src/styles/site.css` owns the palette and the semantic tokens. Every component uses tokens only and never a raw color. The palette starts from the logo charcoal `#3e3643` and amber `#f8c258`: warm neutrals, an amber ramp, and three muted support hues at the same lightness and low chroma (sage, slate, clay). Tokens name roles, not values: `--bg`, `--outside`, `--border`, `--muted`, `--fg`, `--primary`, `--accent`, `--rule-*`, `--conv-*`, `--pat-*`, `--warn-*`, `--code-bg`, and `--stroke`. Rules get amber, conventions get sage, and patterns get slate. Amber marks only the current item, important text, and focus.

Dark mode has two paths that set the same values: the `prefers-color-scheme` media query for `:root` without `data-theme="light"`, and the explicit `:root[data-theme="dark"]` override. `ThemeSwitcher.astro` cycles `auto`, `light`, and `dark` and stores the choice in `localStorage` under `litespec-theme`. `Base.astro` reads that store before first paint, so the theme applies without a flash.

The frame is a centered column with visible side rails: `.frame` caps the width at `1280px`, fills at least the viewport height, and carries the header and the footer. The header `.site-top` holds the logo, the Docs, Patterns, and Use with agents links, the search trigger, the GitHub link, the theme switcher, and the phone menu. The footer shows the release version, the MIT license note, the Litenova Solutions link, and the `llms.txt`, GitHub, and Changelog links. Shared classes live in `site.css`: `.btn` with `.btn-outline`, `.btn-ghost`, `.btn-sm`, and `.btn-icon`; `.badge` with `.badge-rule`, `.badge-convention`, `.badge-pattern`, and `.badge-warn`; `.ver`, `.dot`, `.kbd`, `.must`, and `.muted`; and `.icon` with `.icon-sm`. Type is Geist and Geist Mono, served from `public/fonts/` as Latin variable fonts under the SIL Open Font License (`public/fonts/OFL.txt`), with the body font preloaded.

`src/lib/icons.ts` owns the fixed line icon set in the style of Lucide on a 24px grid. Each entry holds the inner SVG markup per name, such as `start`, `core`, `folder`, `server`, `monitor`, `shield`, `plug`, `book`, and `terminal`, plus UI names such as `search`, `copy`, `check`, `eye`, `code`, and `expand`. `src/components/Icon.astro` draws one icon inline from that set. Icons stay decorative unless you pass a `label`, and the `github` name uses its own filled path.

`src/lib/areas.ts` owns the docs areas in display order: `learn` (Start), `core`, `workspace`, `backend`, `frontend`, `quality`, `ext`, `tutorial`, `guide`, `tools`, and `reference`, each with a label, an icon name, and a one-line note. `sidebarSections` groups them into Start, Core, Workspace, Backend, Frontend, Quality, Extensions, Guides (tutorials and how-to guides after the standard itself), CLI, and Reference.

### Components

| Component | What it owns |
|:---|:---|
| `src/layouts/Base.astro` | The shared layout: the head with the title, the description trimmed to 160 characters, the canonical URL, robots, theme color, Open Graph and Twitter cards, icons, the manifest, the raw Markdown alternate link, the font preload, and one JSON-LD graph from `src/lib/seo.ts`; the theme script before first paint; the framed column with the header and the footer; and the `data-copy` click behavior that copies text and flashes `Copied`. |
| `src/components/DocsSidebar.astro` | The left navigation: the full documentation tree grouped by sidebar section, with collapsible folders, `stack` tags, and an `Overview` link per folder. The current page carries `aria-current="page"`. |
| `src/components/PageToc.astro` | The right `On this page` list of `H2` headings with the section in view marked, plus the `View as Markdown` and `Edit on GitHub` links. |
| `src/components/Search.astro` | The search trigger and dialog. |
| `src/components/SelectForm.astro` | The selection form with live outputs. It renders statically with the default size `small`, shape `server`, and stacks `dotnet` and `react`, then one inline script updates the tiles and the outputs as you answer. |
| `src/components/ThemeSwitcher.astro` | The `auto`, `light`, and `dark` cycle button. |
| `src/components/Mark.astro` | The LiteSpec mark drawn inline: charcoal lines that follow `--stroke` with the amber path and dots fixed to `#f8c258`. |
| `src/components/PatternViewer.astro` | The full-screen option viewer on pattern pages. |

### Search

The build indexes the output with `pagefind --site dist`, which is the second half of the `build` script. `Search.astro` loads `/pagefind/pagefind.js` on first use and calls its `debouncedSearch()`. It shows up to 8 page results with excerpts and up to 3 sub results per page, supports `Ctrl K`, `/`, arrows, `Enter`, and `Esc`, and announces through polite text such as `Type to search pages and rules.` On a dev server with no index it shows `Search is available on the built site.`

The indexed text comes from `data-pagefind-body` on the `.docs-body` div in `[...page].astro` and from `data-pagefind-meta="title"` on its `H1`. `data-pagefind-ignore` keeps UI text out of the index: provision badges, tool buttons, code block headers, option tabs, and the `lbl` spans in provision bodies.

### The Pattern Viewer and the Wireframes

Pattern pages render each option as a card with `Preview` and `Wireframe` tabs and an expand button. The `Preview` panel shows the desktop drawing at 1200 pixels and the phone drawing at 390 pixels. The `Wireframe` panel shows the wireframe text with its copy button. The tabs and the expand button carry a `hidden` attribute that the viewer script removes, and the wireframe panel stays visible until that script hides it, so the card reads fully without JavaScript. The script adds arrow-key tab movement with `Home` and `End`, makes each drawing openable with `Enter` or `Space`, and marks the page with `pattern-js` for the zoom cursor.

`PatternViewer.astro` is the full-screen dialog for those cards. It shows the option ID, the option name, the `Default` badge when the head carries one, and the position such as `3 of 12`. Its switch moves between `Desktop`, `Phone`, and `Wireframe` views, its arrows move between options, and its keys `1`, `2`, and `3` pick the view while `ArrowLeft` and `ArrowRight` move between options. Closing returns focus to the opener.

`src/lib/wireframe/parse.ts` ports the CLI wireframe parser and `src/lib/wireframe/render.ts` ports the CLI wireframe renderer. Both use no Node API, so they run at build time and in the browser. The renderer draws one wireframe as an SVG sketch at `DesktopWidth` 1200 or `PhoneWidth` 390 pixels in one neutral style with tone fills for `neutral`, `positive`, `caution`, `critical`, and `info`, estimates text width from the character count so it needs no font, and applies the compact reflow rules at the phone width with the `Compact` block when the page provides one. `wireframe.test.ts` locks the port: every fixture `.wireframe` must draw its checked-in `.desktop.svg` and `.phone.svg` byte for byte, and every `errors.json` entry must fail to parse.

## Common Changes

### Add a Docs Page

1. Add the Markdown file under `docs/` in lowercase, with one `H1` and the sections of its page style.
2. Rebuild the site. `[...page].astro` builds its paths from `pages`, so a new page needs no route file.
3. Check that the sidebar shows it. `DocsSidebar.astro` builds the tree from `pages`, with a `stack.md` or `README.md` file as its folder `Overview`.
4. Check that the release home lists it under its area.

### Add a Site Route

1. Add the file under `src/pages/[version]/`, for example `src/pages/[version]/help.astro` for HTML or `src/pages/[version]/help.txt.ts` for text, with `getStaticPaths()` returning the version param.
2. Read the standard only through `src/lib/spec.ts` and format agent text only through `src/lib/agent-text.ts`.
3. Set the content type on API routes, such as `text/plain; charset=utf-8` for an index and `text/markdown; charset=utf-8` for Markdown.
4. Rebuild and open the new URL with the version prefix.

### Add an Icon

1. Add the inner SVG markup to `paths` in `src/lib/icons.ts`, keeping the 24px grid and the 2px stroke style.
2. Use it with `<Icon name="your-name" />`, and pass a `label` only when the icon carries meaning alone.
3. Reference the same name from `src/lib/areas.ts` when the icon labels an area or a sidebar section.
4. Rebuild and check the icon at both color schemes.

### Add a Docs Area

1. Add the folder under `docs/` with its pages.
2. Add one row to `areas` in `src/lib/areas.ts` with the folder key, the label, the icon name, and the one-line note.
3. Add the area to `sidebarSections` in the same file, in display order.
4. Rebuild and check the sidebar group, the release home group, and the area note.

### Change a Color

1. Add or edit the ramp and the semantic token in `src/styles/site.css`, with both the light value and the dark override.
2. Use the token as `var(--your-token)` in the component stylesheet.
3. Keep raw hex values out of component stylesheets. `site.css` is the only file that holds them.
4. Check the change in light mode, in dark mode, and with the system theme on both.

## Deployment

The site runs on Cloudflare Workers as a static-assets-only Worker named `litespec` on the LiteNova Solutions account, so no script runs and requests cost nothing on the free plan. `wrangler.jsonc` names the Worker, serves `dist/` with trailing-slash HTML handling and `404.html` for unknown paths, and attaches the custom domain `litespec.dev`; the `workers.dev` address is off, so search engines see one copy. A second Worker, `litespec-www` (`wrangler.www.jsonc` and `workers/www-redirect.js`), answers `www.litespec.dev` with a 301 to the same path and query on `litespec.dev`.

To deploy, build and then run Wrangler from `apps/site/`:

```bash
pnpm --dir apps/site build
cd apps/site && wrangler deploy
wrangler deploy --config wrangler.www.jsonc   # only when the redirect Worker changes
```

The build writes `dist/_redirects` (`/latest` to the manifest version) and copies `public/_headers`, which sets the security headers, long-lived caching for `/_astro/*` and `/fonts/*`, and `X-Robots-Tag: noindex` on the raw Markdown pages and the agent index files so search shows the HTML page. The zone sets Always Use HTTPS, SSL Full (strict), and TLS 1.2 or later.

## Search Engines

`src/lib/seo.ts` builds the metadata: `absoluteUrl` for canonical links, `metaDescription` trims a description at a sentence or word boundary to 160 characters, and `techArticle`, `breadcrumbs`, `website`, and `softwareSource` build the schema.org objects. Every page writes the Organization plus its own objects as one JSON-LD graph: docs pages a TechArticle with `dateModified` from git (`lastModified`) and a BreadcrumbList, the landing page the WebSite and the SoftwareSourceCode. `src/pages/sitemap.xml.ts` lists every HTML page with its last change date, `public/robots.txt` allows everything and names the sitemap, `public/og.png` is the 1200 by 630 share image, and the 404 page is `noindex`. A short page intent gains the page title and a sentence about LiteSpec, so every description carries enough for a search snippet.

## Diagrams

A diagram is an SVG in `docs/assets/diagrams/`, linked from its page as a Markdown image. `src/lib/diagrams.ts` inlines it into the HTML, so its colors, written as the site's tokens with fallbacks, follow the theme, and its alt text becomes the caption. `src/pages/[version]/assets/[...file].ts` serves the same files at `/<version>/assets/`, so the raw Markdown copy resolves its image links for an agent.

## Testing

Run the site tests from the repository root:

```bash
pnpm --dir apps/site test
```

The suite runs `node --test "src/**/*.test.ts"`, which today covers the wireframe goldens and the parser errors. Then build the site from the repository root:

```bash
pnpm --dir apps/site build
```

The build renders every docs page, every raw Markdown copy, every layer bundle, every selection index, and the schema copies, then indexes the output with Pagefind. The `site` job in `.github/workflows/litespec.yml` runs the same two steps in CI on Node `24.22.0` with `pnpm@11.28.5`: `node --test src/lib/wireframe/wireframe.test.ts` and `pnpm exec astro build` after `pnpm install --frozen-lockfile`.

## Limits

The site renders the release it builds from and nothing else. It runs no server code of its own, migrates no data, and validates no consumer. Search works only on the built output, because Pagefind writes its index during `build`. JavaScript only improves the page: theme choice, copy buttons, search, the table of contents marker, and the pattern viewer. Every page stays complete without it. The `_redirects` file covers only the `/latest` alias. Agent endpoints serve the checked-in standard as plain text; they never compute a project model or draw a new wireframe.

