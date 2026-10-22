# Static Marketing Site

## Intent

A static marketing site serves marketing pages, pricing, and help articles as files that need no server at request time. This page states what the static build produces for readers, search engines, and language models, what each page carries, and where the shared facts live so every page agrees. A project selects it when it ships a public static website beside its application, so the site stays fast, findable, and consistent from one build.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The project selects `site` when it ships a public static website beside its application, such as marketing pages, pricing, or help articles. It does not cover a page the application itself serves: those pages stay with the frontend and UI pages.

## Baseline relationship

This extension replaces no baseline provision. The frontend and UI pages govern application frontends declared in `paths.frontends`; a static site is not an application frontend, so those pages do not apply to it.

It switches on no record type: prices and claims read Requirement entries and Terms, which every project records.

## Standards

### Render every page to static files

**Statement:** The site build MUST write every page as a static file that needs no server at request time.

**Rationale:** A static file needs no application server, no database, and no per-request rendering: the host serves bytes. The failure surface shrinks to the file set itself, so a traffic spike or a database outage cannot take the marketing pages down with the application.

**Example:**

```text
dist/index.html
dist/pricing/index.html
dist/nl/prijzen/index.html
```

### Avoid client scripts without a named interactive need

**Statement:** A page MUST NOT ship a client script unless the site records the interactive need that script serves.

**Rationale:** A reader reads a marketing page rather than operating it, so each script slows the page and widens its failure surface without earning its place by default. Recording the interactive need beside each script, such as a theme switch kept across pages, keeps the script count at what readers actually use.

**Example:** The theme switch is the one script: `/assets/theme.js`, named in the layout as the reader-chosen scheme.

### Load every script from the site origin

**Statement:** The site MUST serve every client script from its own origin.

**Rationale:** A script from another origin runs with the page's authority while living outside the release: it can change, fail, or track readers without a site deployment. Serving every script from the site's own origin keeps the release self-contained and reviewable in one place.

### State allowed sources in a content security policy

**Statement:** The site MUST publish a content security policy naming every source its pages load.

**Rationale:** Loading rules in prose rely on every author remembering them; a content security policy enforces them in the browser instead. A source nobody named fails closed rather than loading on trust, so one forgotten reference breaks visibly instead of leaking quietly.

**Example:**

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'
```

### Load nothing from a third-party origin

**Statement:** A page MUST NOT load fonts, scripts, styles, images, or analytics from a third-party origin.

**Rationale:** Fonts, scripts, styles, images, or analytics from another origin send reader visits to that party and fail when that party fails. Shipping all of them with the site keeps reader privacy inside the site's own control and removes the outside dependency.

### Give every page one main heading and landmark elements

**Statement:** Every page MUST carry exactly one top-level heading and landmark elements for its regions.

**Rationale:** One top-level heading tells every reader, and every crawler, what the page is about; two headings or none leave both guessing. Landmark elements expose the header, navigation, main content, and footer to assistive tools, so a reader who navigates by regions reaches each one directly.

**Example:**

```html
<header>...</header>
<nav aria-label="Site">...</nav>
<main id="main-content"><h1>Pricing</h1>...</main>
<footer>...</footer>
```

### Name every page with a title and a description

**Statement:** Every page MUST state a title element and a description its search result shows.

**Rationale:** Search results and browser tabs show the title first and the description beneath it; a page without either appears under a file name with a guessed snippet. Both come from the page frontmatter, so each page states its own instead of inheriting the site's.

### Point every page at its absolute canonical address

**Statement:** Every page MUST carry a canonical link with the absolute address of that page.

**Rationale:** Several addresses can serve one page through trailing slashes, parameters, or mirrors. The canonical link names the one absolute address to index, and the absolute form leaves no host to guesswork.

**Example:**

```html
<link rel="canonical" href="https://example.test/pricing/" />
```

### Reference language alternates from every translated page

**Statement:** Every page on a site with more than one language MUST link each language alternate with its language tag and a default fallback.

**Rationale:** A crawler that finds one language without links to the others indexes each translation as a separate unrelated page. The alternate links map each language to its address, and the default fallback tells the crawler where to send a reader no language matches. A single-language site carries no alternate links.

**Example:**

```html
<link rel="alternate" hreflang="en" href="https://example.test/pricing/" />
<link rel="alternate" hreflang="nl" href="https://example.test/nl/prijzen/" />
<link rel="alternate" hreflang="x-default" href="https://example.test/pricing/" />
```

### Generate a sitemap covering every page

**Statement:** The site build MUST generate a sitemap listing every page with the language alternates of that page.

**Rationale:** A hand-written sitemap drifts: pages ship without entries and deleted pages linger as dead links. Generating the sitemap from the pages that exist keeps it exact, and carrying each page's language alternates lets a crawler find every language from one file.

**Example:**

```xml
<url>
  <loc>https://example.test/pricing/</loc>
  <xhtml:link rel="alternate" hreflang="nl" href="https://example.test/nl/prijzen/" />
</url>
```

### Point crawler rules at the sitemap

**Statement:** The site MUST publish crawler rules pointing to the sitemap address.

**Rationale:** Crawlers read `robots.txt` from the site root before anything else. Pointing at the sitemap from that file sends every crawler to the full page list first, and access rules for crawler-only paths live beside the pointer.

**Example:**

```text
User-agent: *
Allow: /
Sitemap: https://example.test/sitemap.xml
```

### List every page for language models

**Statement:** The site build MUST generate a page list naming every page with its address and description.

**Rationale:** A language model that answers from the site needs the page list in one fetchable file instead of a crawl. The `llms.txt` file names every page with the address and description a model needs to cite it, and generating it from the pages keeps the list exact.

**Example:**

```text
# Example
## Pages
- [Pricing](https://example.test/pricing/): What each plan costs.
```

### Publish full page text for language models

**Statement:** The site build MUST generate a full-text file with the text of every default-language page.

**Rationale:** A model that reads the whole site at once needs the text without fetching each page. The `llms-full.txt` file carries the plain text of the default-language pages, and non-default languages stay out so the file holds one language.

### Publish a Markdown copy beside every page

**Statement:** Every page MUST link a Markdown copy of its own text served beside that page.

**Rationale:** An agent that reads the page wants its text without layout, styles, or scripts. The Markdown copy beside each page carries exactly that, and the link in the page head leads from the page to its copy.

**Example:**

```html
<link rel="alternate" type="text/markdown" href="https://example.test/pricing/index.md" />
```

### Mark pages with JSON-LD structured data

**Statement:** Every page MUST carry JSON-LD structured data for the organization, the site, and the page with breadcrumbs, offers, questions, or article body where each applies.

**Rationale:** Search engines build rich results from structured data, not from guessed page text. One JSON-LD graph per page describes the organization and the site once, then the page with its breadcrumb trail; price pages add offers, question pages add questions with answers, and articles state their article body. Without the graph, the page still ranks but never earns the rich result.

**Example:**

```json
{"@context": "https://schema.org", "@type": "Organization", "name": "Example"}
```

### Keep each repeated fact in one data source

**Statement:** A repeated fact MUST live in one data source every page reads, as a Term record with labels per language for a product word.

**Rationale:** A company name or address typed into ten pages disagrees the day one page updates without the other nine. One data source that every page reads turns the change into one edit, and a product word lives there as a Term record with labels per language.

**Example:** The footer and the imprint page both read `company.legalName` from the site data.

### Render every language from one page structure

**Statement:** Each language MUST supply only text into one page structure the site holds once.

**Rationale:** When each language owns its own markup, one redesign must land in every language separately and one of them lags. One page structure with per-language text keeps structure in one file, so a translation adds wording without ever forking the page.

### Mark unfinished facts with visible placeholders

**Statement:** A page whose owner has not supplied a fact MUST carry a visible placeholder naming that fact.

**Rationale:** An owner who has not supplied a price or a date leaves a gap the page cannot fill honestly. A visible placeholder names the missing fact in place, so reviewers see the gap and the owner knows exactly what to supply, instead of the page publishing a guess.

**Example:** A page awaiting its final price carries `[[FILL: launch price]]` where the price stands.

### Reject a release build carrying a placeholder

**Statement:** A release build MUST fail while a visible placeholder remains on any page.

**Rationale:** A placeholder that reaches the public site states a falsehood to every reader. Failing the release build while one remains stops the falsehood at the gate, while a development build only warns so authors keep working.

### Read site prices and claims from consumer records

**Statement:** Every price and claim on the site MUST come from the consumer records the site convention names.

**Rationale:** Prices and claims are commercial facts the site repeats without owning. Reading them from the named consumer records keeps one owner for each fact, so a price changed in the record reaches the site on the next build instead of waiting for someone to remember the site.

### Declare each static site in the project record

**Statement:** A consumer selecting this extension MUST declare each static site with its name, path, and generator.

**Rationale:** Tools find the site through the `paths.sites` entry, which names where the site lives and which generator builds it. A site nobody declared is a site no check reads, so its pages drift outside every gate.

**Example:**

```json
{"name": "marketing", "path": "sites/marketing", "generator": "astro"}
```

## Conventions

### Generate the site with Astro

**Default:** Generate the site with Astro and prerender every page to static output.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Astro renders pages to files at build time and ships no client script unless a component asks for one. That matches this page's static obligations without extra machinery, so the default build already complies.

**Example:**

```js
export default defineConfig({ output: 'static' });
```

### Render components on the server with Astro or Svelte

**Default:** Write components in Astro or Svelte and render every component on the server.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Astro and Svelte components both render to HTML at build time. Neither hydrates in the browser, so interactivity stays absent by construction rather than by discipline.

### Use Tailwind for site styles

**Default:** Write site styles with Tailwind.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Tailwind compiles its utility classes at build time into the stylesheet the pages link. The whole visual system ships from the site's own origin with no outside style dependency.

### Default to a light scheme with a reader-chosen dark scheme

**Default:** Present a light scheme by default with a dark scheme the reader chooses.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Light is the initial scheme every reader sees first. The reader switches to dark without an account, and the choice persists in the browser alone with nothing stored on a server.

### Read prices and claims from product and pricing records

**Default:** Read site prices and claims from the consumer product brief and pricing record.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** The product brief and pricing record hold commercial facts in every consumer, but each tree keeps them at its own paths. Naming the records without fixing paths lets every consumer resolve its own, where one fixed path would bind all trees to one layout.

## Dependencies

This extension selects its generator stack through `litespec.manifest.json`, which pins `astro` with `@astrojs/svelte`. A consumer resolves those pins through its package manager.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/site#render-every-page-to-static-files | guidance | Does the build write every page as a static file needing no server? |
| litespec/ext/site#avoid-client-scripts-without-a-named-interactive-need | guidance | Does each shipped script serve a recorded interactive need? |
| litespec/ext/site#load-every-script-from-the-site-origin | guidance | Does every client script load from the site origin? |
| litespec/ext/site#state-allowed-sources-in-a-content-security-policy | guidance | Does the policy name every source the pages load? |
| litespec/ext/site#load-nothing-from-a-third-party-origin | guidance | Does any page load from a third-party origin? |
| litespec/ext/site#give-every-page-one-main-heading-and-landmark-elements | guidance | Does every page carry one top-level heading and landmarks? |
| litespec/ext/site#name-every-page-with-a-title-and-a-description | guidance | Does every page state its title and description? |
| litespec/ext/site#point-every-page-at-its-absolute-canonical-address | guidance | Does every page link its absolute canonical address? |
| litespec/ext/site#reference-language-alternates-from-every-translated-page | guidance | Does each translated page link its alternates and fallback? |
| litespec/ext/site#generate-a-sitemap-covering-every-page | guidance | Does the sitemap list every page with its alternates? |
| litespec/ext/site#point-crawler-rules-at-the-sitemap | guidance | Do the crawler rules point at the sitemap? |
| litespec/ext/site#list-every-page-for-language-models | guidance | Does the page list match the built pages? |
| litespec/ext/site#publish-full-page-text-for-language-models | guidance | Does the full-text file match the default-language pages? |
| litespec/ext/site#publish-a-markdown-copy-beside-every-page | guidance | Does every page link its Markdown copy? |
| litespec/ext/site#mark-pages-with-json-ld-structured-data | guidance | Does every page carry its JSON-LD graph? |
| litespec/ext/site#keep-each-repeated-fact-in-one-data-source | guidance | Does each repeated fact live in one source, with each product word as a Term record? |
| litespec/ext/site#render-every-language-from-one-page-structure | guidance | Does one structure render every language, with each language supplying only text? |
| litespec/ext/site#mark-unfinished-facts-with-visible-placeholders | guidance | Does each missing fact show a visible placeholder naming it? |
| litespec/ext/site#reject-a-release-build-carrying-a-placeholder | guidance | Does a release build fail while a placeholder remains? |
| litespec/ext/site#read-site-prices-and-claims-from-consumer-records | guidance | Does each site price and claim trace to its named record? |
| litespec/ext/site#declare-each-static-site-in-the-project-record | checkable | `litespec consumer` refuses a selected site extension whose `paths.sites` entry is missing. |
| litespec/ext/site#generate-the-site-with-astro | guidance | Does Astro generate the site or does an Exception record a replacement? |
| litespec/ext/site#render-components-on-the-server-with-astro-or-svelte | guidance | Do Astro or Svelte sources render server-side or does an Exception record a replacement? |
| litespec/ext/site#use-tailwind-for-site-styles | guidance | Do Tailwind styles build the site or does an Exception record a replacement? |
| litespec/ext/site#default-to-a-light-scheme-with-a-reader-chosen-dark-scheme | guidance | Is light the initial scheme with a reader-chosen dark scheme or a recorded Exception? |
| litespec/ext/site#read-prices-and-claims-from-product-and-pricing-records | guidance | Do prices and claims read the brief and pricing record or a recorded Exception? |
