# Static Marketing Site

## Intent

A static marketing site serves marketing pages, pricing, and help articles as files that need no server at request time. This page states what the static build produces for readers, search engines, and language models, what each page carries, and where the shared facts live so every page agrees. A project selects it when it ships a public static website beside its application, so the site stays fast, findable, and consistent from one build.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The project selects `site` when it ships a public static website beside its application, such as marketing pages, pricing, or help articles. It does not cover a page the application itself serves: those pages stay with the frontend and UI pages.

## Baseline Relationship

This extension replaces no baseline provision. The frontend and UI pages govern application frontends declared in `paths.frontends`; a static site is not an application frontend, so those pages do not apply to it.

It switches on no record type: prices and claims read requirement entries and terms, which every project records.

## Standards

### Render Every Page to Static Files

**Statement:** The site build MUST write every page as a static file that needs no server at request time.

**Rationale:** A static file needs no application server, no database, and no per-request rendering: the host serves bytes. The failure surface shrinks to the file set itself, so a traffic spike or a database outage cannot take the marketing pages down with the application.

**Example:**

```text
dist/index.html
dist/pricing/index.html
dist/nl/prijzen/index.html
```

### Avoid Client Scripts Without a Named Interactive Need

**Statement:** A page MUST NOT ship a client script unless the site records the interactive need that script serves.

**Rationale:** A reader reads a marketing page rather than operating it, so each script slows the page and widens its failure surface without earning its place by default. Recording the interactive need beside each script, such as a theme switch kept across pages, keeps the script count at what readers actually use.

**Example:** The theme switch is the one script: `/assets/theme.js`, named in the layout as the reader-chosen scheme.

### Load Every Script from the Site Origin

**Statement:** The site MUST serve every client script from its own origin.

**Rationale:** A script from another origin runs with the page's authority while living outside the release: it can change, fail, or track readers without a site deployment. Serving every script from the site's own origin keeps the release self-contained and reviewable in one place.

### State Allowed Sources in a Content Security Policy

**Statement:** The site MUST publish a content security policy naming every source its pages load.

**Rationale:** Loading rules in prose rely on every author remembering them; a content security policy enforces them in the browser instead. A source nobody named fails closed rather than loading on trust, so one forgotten reference breaks visibly instead of leaking quietly.

**Example:**

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'
```

### Load Nothing from a Third-Party Origin

**Statement:** A page MUST NOT load fonts, scripts, styles, images, or analytics from a third-party origin.

**Rationale:** Fonts, scripts, styles, images, or analytics from another origin send reader visits to that party and fail when that party fails. Shipping all of them with the site keeps reader privacy inside the site's own control and removes the outside dependency.

### Give Every Page One Main Heading and Landmark Elements

**Statement:** Every page MUST carry exactly one top-level heading and landmark elements for its regions.

**Rationale:** One top-level heading tells every reader, and every crawler, what the page is about; two headings or none leave both guessing. Landmark elements expose the header, navigation, main content, and footer to assistive tools, so a reader who navigates by regions reaches each one directly.

**Example:**

```html
<header>...</header>
<nav aria-label="Site">...</nav>
<main id="main-content"><h1>Pricing</h1>...</main>
<footer>...</footer>
```

### Name Every Page with a Title and a Description

**Statement:** Every page MUST state a title element and a description its search result shows.

**Rationale:** Search results and browser tabs show the title first and the description beneath it; a page without either appears under a file name with a guessed snippet. Both come from the page frontmatter, so each page states its own instead of inheriting the site's.

### Point Every Page at Its Absolute Canonical Address

**Statement:** Every page MUST carry a canonical link with the absolute address of that page.

**Rationale:** Several addresses can serve one page through trailing slashes, parameters, or mirrors. The canonical link names the one absolute address to index, and the absolute form leaves no host to guesswork.

**Example:**

```html
<link rel="canonical" href="https://example.test/pricing/" />
```

### Reference Language Alternates from Every Translated Page

**Statement:** Every page on a site with more than one language MUST link each language alternate with its language tag and a default fallback.

**Rationale:** A crawler that finds one language without links to the others indexes each translation as a separate unrelated page. The alternate links map each language to its address, and the default fallback tells the crawler where to send a reader no language matches. A single-language site carries no alternate links.

**Example:**

```html
<link rel="alternate" hreflang="en" href="https://example.test/pricing/" />
<link rel="alternate" hreflang="nl" href="https://example.test/nl/prijzen/" />
<link rel="alternate" hreflang="x-default" href="https://example.test/pricing/" />
```

### Generate a Sitemap Covering Every Page

**Statement:** The site build MUST generate a sitemap listing every page with the language alternates of that page.

**Rationale:** A hand-written sitemap drifts: pages ship without entries and deleted pages linger as dead links. Generating the sitemap from the pages that exist keeps it exact, and carrying each page's language alternates lets a crawler find every language from one file.

**Example:**

```xml
<url>
  <loc>https://example.test/pricing/</loc>
  <xhtml:link rel="alternate" hreflang="nl" href="https://example.test/nl/prijzen/" />
</url>
```

### Point Crawler Rules at the Sitemap

**Statement:** The site MUST publish crawler rules pointing to the sitemap address.

**Rationale:** Crawlers read `robots.txt` from the site root before anything else. Pointing at the sitemap from that file sends every crawler to the full page list first, and access rules for crawler-only paths live beside the pointer.

**Example:**

```text
User-agent: *
Allow: /
Sitemap: https://example.test/sitemap.xml
```

### List Every Page for Language Models

**Statement:** The site build MUST generate a page list naming every page with its address and description.

**Rationale:** A language model that answers from the site needs the page list in one fetchable file instead of a crawl. The `llms.txt` file names every page with the address and description a model needs to cite it, and generating it from the pages keeps the list exact.

**Example:**

```text
# Example
## Pages
- [Pricing](https://example.test/pricing/): What each plan costs.
```

### Publish Full Page Text for Language Models

**Statement:** The site build MUST generate a full-text file with the text of every default-language page.

**Rationale:** A model that reads the whole site at once needs the text without fetching each page. The `llms-full.txt` file carries the plain text of the default-language pages, and non-default languages stay out so the file holds one language.

### Publish a Markdown Copy Beside Every Page

**Statement:** Every page MUST link a Markdown copy of its own text served beside that page.

**Rationale:** An agent that reads the page wants its text without layout, styles, or scripts. The Markdown copy beside each page carries exactly that, and the link in the page head leads from the page to its copy.

**Example:**

```html
<link rel="alternate" type="text/markdown" href="https://example.test/pricing/index.md" />
```

### Mark Pages with JSON-LD Structured Data

**Statement:** Every page MUST carry JSON-LD structured data for the organization, the site, and the page with breadcrumbs, offers, questions, or article body where each applies.

**Rationale:** Search engines build rich results from structured data, not from guessed page text. One JSON-LD graph per page describes the organization and the site once, then the page with its breadcrumb trail; price pages add offers, question pages add questions with answers, and articles state their article body. Without the graph, the page still ranks but never earns the rich result.

**Example:**

```json
{"@context": "https://schema.org", "@type": "Organization", "name": "Example"}
```

### Keep Each Repeated Fact in One Data Source

**Statement:** A repeated fact MUST live in one data source every page reads, as a term entry with labels per language for a product word.

**Rationale:** A company name or address typed into ten pages disagrees the day one page updates without the other nine. One data source that every page reads turns the change into one edit, and a product word lives there as a term entry with labels per language.

**Example:** The footer and the imprint page both read `company.legalName` from the site data.

### Render Every Language from One Page Structure

**Statement:** Each language MUST supply only text into one page structure the site holds once.

**Rationale:** When each language owns its own markup, one redesign must land in every language separately and one of them lags. One page structure with per-language text keeps structure in one file, so a translation adds wording without ever forking the page.

### Mark Unfinished Facts with Visible Placeholders

**Statement:** A page whose owner has not supplied a fact MUST carry a visible placeholder naming that fact.

**Rationale:** An owner who has not supplied a price or a date leaves a gap the page cannot fill honestly. A visible placeholder names the missing fact in place, so reviewers see the gap and the owner knows exactly what to supply, instead of the page publishing a guess.

**Example:** A page awaiting its final price carries `[[FILL: launch price]]` where the price stands.

### Reject a Release Build Carrying a Placeholder

**Statement:** A release build MUST fail while a visible placeholder remains on any page.

**Rationale:** A placeholder that reaches the public site states a falsehood to every reader. Failing the release build while one remains stops the falsehood at the gate, while a development build only warns so authors keep working.

### Read Site Prices and Claims from Consumer Records

**Statement:** Every price and claim on the site MUST come from the consumer records the site convention names.

**Rationale:** Prices and claims are commercial facts the site repeats without owning. Reading them from the named consumer records keeps one owner for each fact, so a price changed in the record reaches the site on the next build instead of waiting for someone to remember the site.

### Declare Each Static Site in the Project Record

**Statement:** A consumer selecting this extension MUST declare each static site with its name, path, and generator.

**Rationale:** Tools find the site through the `paths.sites` entry, which names where the site lives and which generator builds it. A site nobody declared is a site no check reads, so its pages drift outside every gate.

**Example:**

```json
{"name": "marketing", "path": "sites/marketing", "generator": "astro"}
```

## Conventions

### Generate the Site with Astro

**Default:** Generate the site with Astro and prerender every page to static output.

**Replacement:** A consumer records a site-generator convention naming the generator its static build runs.

**Rationale:** Astro renders pages to files at build time and ships no client script unless a component asks for one. That matches this page's static obligations without extra machinery, so the default build already complies.

**Example:**

```js
export default defineConfig({ output: 'static' });
```

### Render Components on the Server with Astro or Svelte

**Default:** Write components in Astro or Svelte and render every component on the server.

**Replacement:** A consumer records a site-component convention naming the component sources its pages render.

**Rationale:** Astro and Svelte components both render to HTML at build time. Neither hydrates in the browser, so interactivity stays absent by construction rather than by discipline.

### Use Tailwind for Site Styles

**Default:** Write site styles with Tailwind.

**Replacement:** A consumer records a site-style convention naming the stylesheet source its pages link.

**Rationale:** Tailwind compiles its utility classes at build time into the stylesheet the pages link. The whole visual system ships from the site's own origin with no outside style dependency.

### Default to a Light Scheme with a Reader-Chosen Dark Scheme

**Default:** Present a light scheme by default with a dark scheme the reader chooses.

**Replacement:** A consumer records a site-scheme convention naming the color schemes its pages present.

**Rationale:** Light is the initial scheme every reader sees first. The reader switches to dark without an account, and the choice persists in the browser alone with nothing stored on a server.

### Read Prices and Claims from Brief and Business Requirements

**Default:** Read site prices and claims from the consumer product brief and its business requirements.

**Replacement:** A consumer records a site-facts convention naming the records its prices and claims read.

**Rationale:** The product brief and the business requirements hold commercial facts in every consumer, but each tree keeps them at its own paths. Naming the records without fixing paths lets every consumer resolve its own, where one fixed path would bind all trees to one layout.

## Dependencies

Packages: The site generator and its companions come from the pins in `litespec.manifest.json`. A consumer resolves those pins through its package manager.

Related extensions: The `locale` extension owns locales and catalogs when the site ships in more than one language.

Guides: None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/site#render-every-page-to-static-files | guidance | The build output holds every page as a static file needing no server. |
| litespec/ext/site#avoid-client-scripts-without-a-named-interactive-need | guidance | Each shipped script in the build output traces to a recorded interactive need. |
| litespec/ext/site#load-every-script-from-the-site-origin | guidance | Every client script tag in the built pages points at the site origin. |
| litespec/ext/site#state-allowed-sources-in-a-content-security-policy | guidance | The published content security policy names every source the pages load. |
| litespec/ext/site#load-nothing-from-a-third-party-origin | guidance | No built page references a font, script, style, image, or analytics address outside the site origin. |
| litespec/ext/site#give-every-page-one-main-heading-and-landmark-elements | guidance | Each built page carries one top-level heading with header, navigation, main, and footer landmarks. |
| litespec/ext/site#name-every-page-with-a-title-and-a-description | guidance | Each built page states its own title element and description. |
| litespec/ext/site#point-every-page-at-its-absolute-canonical-address | guidance | Each built page links its absolute canonical address. |
| litespec/ext/site#reference-language-alternates-from-every-translated-page | guidance | Each translated page links its language alternates with tags and a default fallback. |
| litespec/ext/site#generate-a-sitemap-covering-every-page | guidance | The generated sitemap lists every page with its language alternates. |
| litespec/ext/site#point-crawler-rules-at-the-sitemap | guidance | The `robots.txt` at the site root points at the sitemap address. |
| litespec/ext/site#list-every-page-for-language-models | guidance | The generated page list names every page with its address and description. |
| litespec/ext/site#publish-full-page-text-for-language-models | guidance | The generated full-text file holds the text of every default-language page. |
| litespec/ext/site#publish-a-markdown-copy-beside-every-page | guidance | Each built page links a Markdown copy served beside it. |
| litespec/ext/site#mark-pages-with-json-ld-structured-data | guidance | Each built page carries its JSON-LD graph for the organization, the site, and the page. |
| litespec/ext/site#keep-each-repeated-fact-in-one-data-source | guidance | Each repeated fact lives in one data source, with each product word as a term entry. |
| litespec/ext/site#render-every-language-from-one-page-structure | guidance | One page structure renders every language, with each language supplying only text. |
| litespec/ext/site#mark-unfinished-facts-with-visible-placeholders | guidance | Each missing fact shows a visible placeholder naming it on its page. |
| litespec/ext/site#reject-a-release-build-carrying-a-placeholder | guidance | A release build fails while a placeholder remains on any page. |
| litespec/ext/site#read-site-prices-and-claims-from-consumer-records | guidance | Each site price and claim traces to the consumer record the site convention names. |
| litespec/ext/site#declare-each-static-site-in-the-project-record | guidance | Each static site the project ships appears as a `sites` entry in `litespec.project.json` with its name, path, and generator. |
| litespec/ext/site#generate-the-site-with-astro | guidance | Astro generates the site with prerendered static output, or the site-generator convention names another generator. |
| litespec/ext/site#render-components-on-the-server-with-astro-or-svelte | guidance | Astro or Svelte sources render on the server, or the site-component convention names other sources. |
| litespec/ext/site#use-tailwind-for-site-styles | guidance | Tailwind styles build the site, or the site-style convention names another stylesheet source. |
| litespec/ext/site#default-to-a-light-scheme-with-a-reader-chosen-dark-scheme | guidance | Light is the initial scheme with a reader-chosen dark scheme, or the site-scheme convention names other schemes. |
| litespec/ext/site#read-prices-and-claims-from-brief-and-business-requirements | guidance | Prices and claims read the brief and business requirements, or the site-facts convention names other records. |
