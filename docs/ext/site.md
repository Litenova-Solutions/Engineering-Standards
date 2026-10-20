# Static Marketing Site

## Intent

A static marketing site presents the product to the public as pages that need no server. It serves people, search engines, and language models from one build.

This page states what the build produces, what each page carries, and where shared facts live.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer selects `site` when it ships a public static website beside its application, such as marketing pages, pricing, or help articles. A page the application itself serves does not select it.

## Baseline relationship

None. The frontend and UI pages govern application frontends declared in `paths.frontends`. A static site is not an application frontend, and this extension replaces no baseline provision.

None. Prices and claims read Requirement entries and Terms, which every profile requires.

## Agent Summary {#agent-summary}

- Prerender the site to files that need no server. (litespec/rule/ext-site.render-every-page-to-static-files)
- Ship scripts from the site origin for named needs alone. (litespec/rule/ext-site.avoid-client-scripts-without-a-named-interactive-need, litespec/rule/ext-site.load-every-script-from-the-site-origin)
- Name allowed sources in a policy and load nothing third-party. (litespec/rule/ext-site.state-allowed-sources-in-a-content-security-policy, litespec/rule/ext-site.load-nothing-from-a-third-party-origin)
- Give each page one heading, landmarks, title, description, canonical, and alternates. (litespec/rule/ext-site.give-every-page-one-main-heading-and-landmark-elements, litespec/rule/ext-site.name-every-page-with-a-title-and-a-description, litespec/rule/ext-site.point-every-page-at-its-absolute-canonical-address, litespec/rule/ext-site.reference-language-alternates-from-every-translated-page)
- Generate sitemap, crawler rules, model lists, and Markdown copies. (litespec/rule/ext-site.generate-a-sitemap-covering-every-page, litespec/rule/ext-site.point-crawler-rules-at-the-sitemap, litespec/rule/ext-site.list-every-page-for-language-models, litespec/rule/ext-site.publish-full-page-text-for-language-models, litespec/rule/ext-site.publish-a-markdown-copy-beside-every-page)
- Carry JSON-LD data for the organization, site, and page. (litespec/rule/ext-site.mark-pages-with-json-ld-structured-data)
- Hold repeated facts once and render languages from one structure. (litespec/rule/ext-site.keep-each-repeated-fact-in-one-data-source, litespec/rule/ext-site.render-every-language-from-one-page-structure)
- Show placeholders for missing facts and fail release builds carrying one. (litespec/rule/ext-site.mark-unfinished-facts-with-visible-placeholders, litespec/rule/ext-site.reject-a-release-build-carrying-a-placeholder)
- Read prices and claims from named consumer records. (litespec/rule/ext-site.read-site-prices-and-claims-from-consumer-records, litespec/rule/ext-site.read-prices-and-claims-from-product-and-pricing-records)
- Build with Astro, server components, Tailwind, and a light-first scheme. (litespec/rule/ext-site.generate-the-site-with-astro, litespec/rule/ext-site.render-components-on-the-server-with-astro-or-svelte, litespec/rule/ext-site.use-tailwind-for-site-styles, litespec/rule/ext-site.default-to-a-light-scheme-with-a-reader-chosen-dark-scheme)

## Standards

### Render every page to static files (litespec/rule/ext-site.render-every-page-to-static-files)

**Requirement:** The site build MUST write every page as a static file that needs no server at request time.

**Rationale:** A file needs no application server, no database, and no per-request rendering. The host serves bytes, so the failure surface is the file set itself.

**Example:**

```text
dist/index.html
dist/pricing/index.html
dist/nl/prijzen/index.html
```

### Avoid client scripts without a named interactive need (litespec/rule/ext-site.avoid-client-scripts-without-a-named-interactive-need)

**Requirement:** A page MUST NOT ship a client script unless the site records the interactive need that script serves.

**Rationale:** A marketing page is read rather than operated, so each script needs a named reason to exist. The named need lives beside the script, such as a theme switch kept across pages.

**Example:** The theme switch is the one script: `/assets/theme.js`, named in the layout as the reader-chosen scheme.

### Load every script from the site origin (litespec/rule/ext-site.load-every-script-from-the-site-origin)

**Requirement:** The site MUST serve every client script from its own origin.

**Rationale:** A script from another origin runs with the authority of the page while living outside the release. Serving each script locally keeps the release self-contained.

### State allowed sources in a content security policy (litespec/rule/ext-site.state-allowed-sources-in-a-content-security-policy)

**Requirement:** The site MUST publish a content security policy naming every source its pages load.

**Rationale:** The policy is the enforceable form of the loading rules on this page. A source nobody named fails closed in the browser rather than loading on trust.

**Example:**

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'
```

### Load nothing from a third-party origin (litespec/rule/ext-site.load-nothing-from-a-third-party-origin)

**Requirement:** A page MUST NOT load fonts, scripts, styles, images, or analytics from a third-party origin.

**Rationale:** A third-party load trades reader privacy for convenience and fails when that party fails. Fonts, icons, and screenshots ship with the site instead.

### Give every page one main heading and landmark elements (litespec/rule/ext-site.give-every-page-one-main-heading-and-landmark-elements)

**Requirement:** Every page MUST carry exactly one top-level heading and landmark elements for its regions.

**Rationale:** One top-level heading names the page for a reader and a crawler alike. Landmark elements expose the header, navigation, main content, and footer to assistive tools.

**Example:**

```html
<header>...</header>
<nav aria-label="Site">...</nav>
<main id="main-content"><h1>Pricing</h1>...</main>
<footer>...</footer>
```

### Name every page with a title and a description (litespec/rule/ext-site.name-every-page-with-a-title-and-a-description)

**Requirement:** Every page MUST state a title element and a description its search result shows.

**Rationale:** The title names the tab and the search result, and the description summarizes the page beneath it. Both come from the page front matter, so each page states its own.

### Point every page at its absolute canonical address (litespec/rule/ext-site.point-every-page-at-its-absolute-canonical-address)

**Requirement:** Every page MUST carry a canonical link with the absolute address of that page.

**Rationale:** One absolute address tells a crawler which address to index when several serve one page. A relative address leaves the host to guesswork.

**Example:**

```html
<link rel="canonical" href="https://example.test/pricing/" />
```

### Reference language alternates from every translated page (litespec/rule/ext-site.reference-language-alternates-from-every-translated-page)

**Requirement:** Every page on a site with more than one language MUST link each language alternate with its language tag and a default fallback.

**Rationale:** The alternates tell a crawler which address serves which language, and the default tells it where to send an unmatched reader. A single-language site carries no alternate links.

**Example:**

```html
<link rel="alternate" hreflang="en" href="https://example.test/pricing/" />
<link rel="alternate" hreflang="nl" href="https://example.test/nl/prijzen/" />
<link rel="alternate" hreflang="x-default" href="https://example.test/pricing/" />
```

### Generate a sitemap covering every page (litespec/rule/ext-site.generate-a-sitemap-covering-every-page)

**Requirement:** The site build MUST generate a sitemap listing every page with the language alternates of that page.

**Rationale:** The sitemap is generated from the pages that exist, so it cannot drift from them. Each entry carries the alternates, so a crawler finds every language from one file.

**Example:**

```xml
<url>
  <loc>https://example.test/pricing/</loc>
  <xhtml:link rel="alternate" hreflang="nl" href="https://example.test/nl/prijzen/" />
</url>
```

### Point crawler rules at the sitemap (litespec/rule/ext-site.point-crawler-rules-at-the-sitemap)

**Requirement:** The site MUST publish crawler rules pointing at the sitemap address.

**Rationale:** Crawlers read `robots.txt` first, so the file points at the sitemap from the site root. Access rules for crawler-only paths live in the same file.

**Example:**

```text
User-agent: *
Allow: /
Sitemap: https://example.test/sitemap.xml
```

### List every page for language models (litespec/rule/ext-site.list-every-page-for-language-models)

**Requirement:** The site build MUST generate a page list naming every page with its address and description.

**Rationale:** The `llms.txt` file summarizes the site and groups every page with the address and description a model needs to cite it. It is generated from the pages, so it lists what exists.

**Example:**

```text
# Example
## Pages
- [Pricing](https://example.test/pricing/): What each plan costs.
```

### Publish full page text for language models (litespec/rule/ext-site.publish-full-page-text-for-language-models)

**Requirement:** The site build MUST generate a full-text file with the text of every default-language page.

**Rationale:** The `llms-full.txt` file carries the plain text of the default-language pages for a model that reads the whole site at once. Non-default languages stay out, so the file holds one language.

### Publish a Markdown copy beside every page (litespec/rule/ext-site.publish-a-markdown-copy-beside-every-page)

**Requirement:** Every page MUST link a Markdown copy of its own text served beside that page.

**Rationale:** The Markdown copy gives an agent the page without layout, styles, or scripts. The page head links it, so a reader finds the copy from the page itself.

**Example:**

```html
<link rel="alternate" type="text/markdown" href="https://example.test/pricing/index.md" />
```

### Mark pages with JSON-LD structured data (litespec/rule/ext-site.mark-pages-with-json-ld-structured-data)

**Requirement:** Every page MUST carry JSON-LD structured data for the organization, the site, and the page with breadcrumbs, offers, questions, or article body where each applies.

**Rationale:** One graph per page describes the organization and the site once, then the page with its breadcrumb trail. Price pages add offers, question pages add questions with answers, and articles state their article body.

**Example:**

```json
{"@context": "https://schema.org", "@type": "Organization", "name": "Example"}
```

### Keep each repeated fact in one data source (litespec/rule/ext-site.keep-each-repeated-fact-in-one-data-source)

**Requirement:** A repeated fact MUST live in one data source every page reads, as a Term record with labels per language for a product word.

**Rationale:** One source means one edit reaches every page, and two pages cannot disagree. Pages read facts by reference rather than repeating them.

**Example:** The footer and the imprint page both read `company.legalName` from the site data.

### Render every language from one page structure (litespec/rule/ext-site.render-every-language-from-one-page-structure)

**Requirement:** Each language MUST supply only text into one page structure the site holds once.

**Rationale:** One layout renders every language, so a structural change touches one file. A language adds wording, never markup, so translations cannot fork the page.

### Mark unfinished facts with visible placeholders (litespec/rule/ext-site.mark-unfinished-facts-with-visible-placeholders)

**Requirement:** A page whose owner has not supplied a fact MUST carry a visible placeholder naming that fact.

**Rationale:** A visible placeholder tells a reviewer what is missing instead of publishing a guess. The placeholder names the fact, so the owner knows what to supply.

**Example:** A page awaiting its final price carries `[[FILL: launch price]]` where the price will stand.

### Reject a release build carrying a placeholder (litespec/rule/ext-site.reject-a-release-build-carrying-a-placeholder)

**Requirement:** A release build MUST fail while a visible placeholder remains on any page.

**Rationale:** A published placeholder is a false statement to a reader. The release gate refuses it, while a development build warns and finishes.

### Read site prices and claims from consumer records (litespec/rule/ext-site.read-site-prices-and-claims-from-consumer-records)

**Requirement:** Every price and claim on the site MUST come from the consumer records the site convention names.

**Rationale:** The site repeats commercial facts it does not own, so it reads them where they are owned. A price changed in the record reaches the site on the next build. The named records carry their own owner and status.

### Declare each static site in the project record (litespec/rule/ext-site.declare-each-static-site-in-the-project-record)

**Requirement:** A consumer selecting this extension MUST declare each static site with its name, path, and generator.

**Rationale:** The `paths.sites` entry tells tools where the site lives and which generator builds it. A site nobody declared is a site no check reads.

**Example:**

```json
{"name": "marketing", "path": "sites/marketing", "generator": "astro"}
```

## Conventions

### Generate the site with Astro (litespec/rule/ext-site.generate-the-site-with-astro)

**Default:** Generate the site with Astro and prerender every page to static output.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Astro renders pages to files at build time and ships no client script unless a component asks for one. That matches the static obligations above without extra machinery.

**Example:**

```js
export default defineConfig({ output: 'static' });
```

### Render components on the server with Astro or Svelte (litespec/rule/ext-site.render-components-on-the-server-with-astro-or-svelte)

**Default:** Write components in Astro or Svelte and render every component on the server.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Either component form renders to HTML at build time. No component hydrates in the browser, so interactivity stays absent by construction.

### Use Tailwind for site styles (litespec/rule/ext-site.use-tailwind-for-site-styles)

**Default:** Write site styles with Tailwind.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** One utility stylesheet compiles at build time into the file the pages link. No style comes from another origin.

### Default to a light scheme with a reader-chosen dark scheme (litespec/rule/ext-site.default-to-a-light-scheme-with-a-reader-chosen-dark-scheme)

**Default:** Present a light scheme by default with a dark scheme the reader chooses.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Light is the initial scheme, and the reader switches to dark without an account or a stored preference on a server. The choice persists in the browser alone.

### Read prices and claims from product and pricing records (litespec/rule/ext-site.read-prices-and-claims-from-product-and-pricing-records)

**Default:** Read site prices and claims from the consumer product brief and pricing record.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** The names state the records without fixing their paths, because each consumer holds them where its own tree does. A fixed path would bind every consumer to one tree.

## Dependencies

This extension selects its generator stack through `litespec.manifest.json`, which pins `astro` with `@astrojs/svelte`. A consumer resolves those pins through its package manager.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/ext-site.render-every-page-to-static-files | guidance | Does the build write every page as a static file needing no server? |
| litespec/rule/ext-site.avoid-client-scripts-without-a-named-interactive-need | guidance | Does each shipped script serve a recorded interactive need? |
| litespec/rule/ext-site.load-every-script-from-the-site-origin | guidance | Does every client script load from the site origin? |
| litespec/rule/ext-site.state-allowed-sources-in-a-content-security-policy | guidance | Does the policy name every source the pages load? |
| litespec/rule/ext-site.load-nothing-from-a-third-party-origin | guidance | Does any page load from a third-party origin? |
| litespec/rule/ext-site.give-every-page-one-main-heading-and-landmark-elements | guidance | Does every page carry one top-level heading and landmarks? |
| litespec/rule/ext-site.name-every-page-with-a-title-and-a-description | guidance | Does every page state its title and description? |
| litespec/rule/ext-site.point-every-page-at-its-absolute-canonical-address | guidance | Does every page link its absolute canonical address? |
| litespec/rule/ext-site.reference-language-alternates-from-every-translated-page | guidance | Does each translated page link its alternates and fallback? |
| litespec/rule/ext-site.generate-a-sitemap-covering-every-page | guidance | Does the sitemap list every page with its alternates? |
| litespec/rule/ext-site.point-crawler-rules-at-the-sitemap | guidance | Do the crawler rules point at the sitemap? |
| litespec/rule/ext-site.list-every-page-for-language-models | guidance | Does the page list match the built pages? |
| litespec/rule/ext-site.publish-full-page-text-for-language-models | guidance | Does the full-text file match the default-language pages? |
| litespec/rule/ext-site.publish-a-markdown-copy-beside-every-page | guidance | Does every page link its Markdown copy? |
| litespec/rule/ext-site.mark-pages-with-json-ld-structured-data | guidance | Does every page carry its JSON-LD graph? |
| litespec/rule/ext-site.keep-each-repeated-fact-in-one-data-source | guidance | Does each repeated fact live in one source, each word as a Term? |
| litespec/rule/ext-site.render-every-language-from-one-page-structure | guidance | Does one structure render every language with text alone per language? |
| litespec/rule/ext-site.mark-unfinished-facts-with-visible-placeholders | guidance | Does each missing fact show a visible placeholder naming it? |
| litespec/rule/ext-site.reject-a-release-build-carrying-a-placeholder | guidance | Does a release build fail while a placeholder remains? |
| litespec/rule/ext-site.read-site-prices-and-claims-from-consumer-records | guidance | Does each site price and claim trace to its named record? |
| litespec/rule/ext-site.declare-each-static-site-in-the-project-record | checkable | `litespec consumer` refuses a selected site extension whose `paths.sites` entry is missing. |
| litespec/rule/ext-site.generate-the-site-with-astro | guidance | Does Astro generate the site or does an Exception record a replacement? |
| litespec/rule/ext-site.render-components-on-the-server-with-astro-or-svelte | guidance | Do Astro or Svelte sources render server-side or does an Exception record a replacement? |
| litespec/rule/ext-site.use-tailwind-for-site-styles | guidance | Do Tailwind styles build the site or does an Exception record a replacement? |
| litespec/rule/ext-site.default-to-a-light-scheme-with-a-reader-chosen-dark-scheme | guidance | Is light the initial scheme with a reader-chosen dark scheme or a recorded Exception? |
| litespec/rule/ext-site.read-prices-and-claims-from-product-and-pricing-records | guidance | Do prices and claims read the brief and pricing record or a recorded Exception? |
