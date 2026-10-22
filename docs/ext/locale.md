# Localization

## Intent

Localization makes every screen, message, route, and formatted value answer to the reader's language. This page states what the team decides up front, the supported locales, the default locale, the fallback chain, and the route shape, and which behavior the code owns: catalogs for copy, locale-aware formatting, and business data that stays locale-neutral. A project selects it when it ships in more than one locale, so each language reads as a complete product instead of a partial translation.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The project selects `locale` when the product ships in more than one locale. A translation the team only plans does not select it; the shipped product decides. The product brief or a Decision records the supported locales, the default locale, the fallback behavior, and the URL strategy before catalogs and routes appear.

## Baseline Relationship

This extension replaces no baseline provision.

This extension switches on no record type. The Decision that records the locale contract is a core record every project writes.

## Standards

### Record Supported Locale Behavior

**Statement:** A localization decision MUST list supported locales, default locale, fallback chain, user selection, browser detection, owner, and status.

**Rationale:** Locales, default, fallback, selection, and browser detection interact: each catalog, route, and formatter reads the same contract, so the team writes it once before building any of them. Without the contract, each part guesses a different fallback and the product answers each missing translation differently. A draft names its decider and decide-by date so the contract lands before the first catalog does.

### Avoid Catalog-Only Locale Claims

**Statement:** A product MUST NOT infer supported locales from catalog files alone.

**Rationale:** A catalog file proves only that someone wrote translations; it says nothing about routes, fallback, selection, or detection. A product that counts locales by counting files announces a language its routes cannot serve and its fallback never reaches.

### Define One Locale Route Shape

**Statement:** A localized application MUST define one documented locale route shape.

**Rationale:** Users, links, crawlers, and caches all address a localized page, and one route shape gives each language one predictable address. A path segment is the default shape: it gives every localized page a distinct address that links, crawlers, and cache entries can each name. A cookie or header shape serves every locale from one address instead, so a shared cache and a search index each see only one of them. A product with no public pages, whose locale belongs to the signed-in account, documents one of those shapes instead of inventing a fourth.

**Example:** `/nl/orders/42` places the locale in the documented path segment, so a crawler and a shared cache each address one language.

### Handle Unavailable Locale Segments

**Statement:** A localized application MUST redirect unsupported or missing locale segments according to product policy.

**Rationale:** Readers mistype addresses and follow stale links, so a locale segment can name a language the product never shipped or omit the segment entirely. Without a documented policy, each route answers differently: one shows the default language, another shows an error, and a crawler indexes both as content.

### Avoid Duplicate Localized URLs

**Statement:** A localized application MUST NOT publish multiple indexable URLs for the same localized content.

**Rationale:** When two addresses serve the same language, search engines split the page's rank between them and canonical links point two ways. One indexable address per language keeps search, sharing, and caching pointed at the same page.

### Store User-Facing Copy in Catalogs

**Statement:** A localized application MUST store user-facing copy in locale catalogs.

**Rationale:** Copy in source code reaches translators only through developers, and each wording change becomes a code change with a review, a build, and a deployment. Catalogs hold every user-facing sentence in one place per locale, so translators edit wording while developers edit behavior.

### Name Messages by Meaning

**Statement:** A locale catalog MUST use semantic keys that cite glossary terms rather than source-language sentences.

**Rationale:** A key that copies the English sentence breaks its meaning the day English rewords it: every other language still points at the old sentence. A semantic key names the intent instead, citing the glossary term that holds the word's labels per language, so wording changes in any language without disturbing the key.

**Example:** `orders.cancel.confirmation` identifies intent without copying the English sentence.

### Complete or Fall Back Catalog Values

**Statement:** Each supported locale MUST contain required keys or use its declared fallback.

**Rationale:** A missing translation with no declared fallback becomes a runtime surprise: the interface shows a key, an empty string, or the wrong language, and nobody chose which. The declaration states the fallback locale and what a missing key does at build time.

A key missing from the default locale fails the build. No fallback exists for it, and the interface renders its identifier. A key missing from a non-default locale reports a warning and falls back. Shipping one untranslated string costs less than blocking a release on it.

**Example:** A catalog check runs in the frontend lint gate. The two outcomes are visible before review, not in a browser.

### Follow the Validation Message Grammar

**Statement:** A validation catalog MUST state the field label, what is wrong, and what is accepted, without technical wording.

**Rationale:** A validation message that names the field, the fault, and the accepted input tells the reader how to fix the entry in any language, while a message with only one of the three leaves the reader guessing. The three-part shape holds across languages; each language's sentence pattern lives in the labels of the field's glossary term and the language's writing page.

**Example:** The glossary term for a field carries the sentence pattern for each supported language.

### Resolve Every Shown Identifier

**Statement:** A screen MUST resolve every closed-set code it renders to its glossary label and never render the raw code, excluding user-facing reference numbers.

**Rationale:** A code such as a refusal ground or a billing state is a contract value built for systems, while the glossary label beside it is copy built for readers. A screen that renders the raw code shows one untranslated fragment in an otherwise translated page and forces the reader to decode it. Resolving every shown code keeps the whole screen in the reader's language, except reference numbers the reader quotes back.

**Example:** A shipment row shows the glossary label for `shipment-delayed` in the active locale.

### Format Values with Active Locale

**Statement:** A localized interface MUST format dates, times, numbers, currency, plurals, lists, and relative time by active locale.

**Rationale:** Dates, numbers, currency, plurals, lists, and relative time each follow the reader's conventions, and a date the reader misreads becomes a missed appointment or a wrong payment. The platform supplies all of them.

[The `Intl` namespace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) has `DateTimeFormat`, `NumberFormat`, `PluralRules`, `ListFormat`, and `RelativeTimeFormat`. Each one carries the locale data the browser already ships. A project-written formatter for any of these is a second locale database that no one updates. Its plural rules are wrong for the first language with more than two forms.

**Example:** Create one formatter instance per locale and reuse it. Construction is the expensive part.

### Preserve Locale-Neutral Business Data

**Statement:** Domain values and API contracts MUST remain locale-neutral unless a use case explicitly exchanges localized content.

**Rationale:** An expense state or a price stored in Dutch breaks the moment an English speaker opens it, and an API contract that shifts per language forces every consumer to negotiate wording before reading data. Business values and wire contracts stay in one neutral form, and only the interface translates them for display. A use case that genuinely exchanges localized content, such as a product description the merchant writes per language, names that exchange explicitly.

### Localize Public Presentation Content

**Statement:** Public metadata, form labels, validation messages, and user-safe errors MUST follow the active locale.

**Rationale:** A Dutch page with an English title, English form labels, or an English error tells the reader the translation stopped halfway and tells a search engine the page serves two languages. Metadata, labels, validation messages, and user-safe errors follow the active locale with the page around them.

### Keep Stable Error Codes Locale-Neutral

**Statement:** A stable API error code MUST NOT change by locale.

**Rationale:** Integrations and support tools match on the error code, and a code that changes per language forces every consumer to list every translation before handling one failure. The code stays fixed while the human-readable message beside it translates.

## Conventions

### Use One Catalog Root

**Default:** Keep catalogs under one application-owned locale root.

**Replacement:** A project names another root for locale catalogs in its documentation.

**Rationale:** One application-owned root tells every developer and tool where catalogs live, so a new locale lands beside the old ones instead of in a folder nobody checks. Scattered catalogs split ownership, and one of them misses the fallback check.

### Split Catalogs by Module When Needed

**Default:** Split catalogs by module only when catalog size requires it.

**Replacement:** A project splits catalogs by feature from the first locale.

**Rationale:** Small catalogs read better whole: one file per locale shows every key at a glance and survives a rename without cross-file edits. Splitting waits until measured size, such as slow loads or conflicting edits, proves one file no longer serves.

### Use BCP 47 Identifiers

**Default:** Use BCP 47 locale identifiers.

**Replacement:** A project names another identifier form for locales in its documentation.

**Rationale:** BCP 47 is the identifier form routes, catalogs, browsers, and libraries recognize: one tag such as `nl` travels unchanged from the address bar to the catalog lookup. A home-grown form needs translation at every boundary and puzzles every new developer.

### Keep Locale Selection Explicit

**Default:** Keep locale selection in the URL or documented session preference.

**Replacement:** A project keeps the active locale in ambient request state.

**Rationale:** A locale stored in the URL or a documented session preference travels with the request, so any developer can see which language a page serves and link to it. An implicit global locale hides in process state, where one request can read another's language and no link reproduces the page.

## Dependencies

Packages: `None.`

Related extensions: `None.`

Guides: `None.`

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/locale#record-supported-locale-behavior | guidance | The locale decision lists supported locales, default locale, fallback chain, user selection, browser detection, owner, and status. |
| litespec/ext/locale#avoid-catalog-only-locale-claims | guidance | Shipped locales come from the locale decision, with catalog files as translations only. |
| litespec/ext/locale#define-one-locale-route-shape | guidance | The application routes every locale through one documented route shape. |
| litespec/ext/locale#handle-unavailable-locale-segments | guidance | Unsupported or missing locale segments redirect under the documented product policy. |
| litespec/ext/locale#avoid-duplicate-localized-urls | guidance | Each localized content item serves from one indexable URL. |
| litespec/ext/locale#store-user-facing-copy-in-catalogs | guidance | User-facing copy sits in the locale catalogs rather than in source code. |
| litespec/ext/locale#name-messages-by-meaning | guidance | Catalog keys use semantic names citing glossary terms, with no source-language sentences as keys. |
| litespec/ext/locale#complete-or-fall-back-catalog-values | guidance | Each locale holds its required keys or resolves them through its declared fallback. |
| litespec/ext/locale#follow-the-validation-message-grammar | guidance | Each validation message states field label, fault, and accepted input without technical wording. |
| litespec/ext/locale#resolve-every-shown-identifier | guidance | Shown codes render glossary labels, with raw codes absent except user-facing reference numbers. |
| litespec/ext/locale#format-values-with-active-locale | guidance | Dates, numbers, currency, plurals, lists, and relative time render through active-locale formatters. |
| litespec/ext/locale#preserve-locale-neutral-business-data | guidance | Domain values and API contracts stay locale-neutral outside explicitly localized exchanges. |
| litespec/ext/locale#localize-public-presentation-content | guidance | Public metadata, form labels, validation messages, and user-safe errors render in the active locale. |
| litespec/ext/locale#keep-stable-error-codes-locale-neutral | guidance | Each stable API error code stays identical across locales. |
| litespec/ext/locale#use-one-catalog-root | guidance | Catalogs sit under one application-owned root, or the project names another root in its documentation. |
| litespec/ext/locale#split-catalogs-by-module-when-needed | guidance | Catalogs stay whole per locale until measured size moves them to module splits, or the project splits by feature from the start. |
| litespec/ext/locale#use-bcp-47-identifiers | guidance | Locale identifiers follow BCP 47, or the project names another identifier form in its documentation. |
| litespec/ext/locale#keep-locale-selection-explicit | guidance | The URL or a documented session preference carries the locale, or the project keeps it in ambient request state. |
