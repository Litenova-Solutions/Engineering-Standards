# Localization

## Intent

Localization makes every screen, message, route, and formatted value answer to the reader's language. This page states what the team decides up front: the supported locales, the default locale, the fallback chain, and the route shape. It also states which behavior the code owns: catalogs for copy, locale-aware formatting, and business data that stays locale-neutral. A project selects it when it ships in more than one locale, so each language reads as a complete product instead of a partial translation.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The project selects `locale` when the product ships in more than one locale. A translation the team only plans does not select it; the shipped product decides. The product brief or a Decision records the supported locales, the default locale, the fallback behavior, and the URL strategy before catalogs and routes appear.

## Baseline relationship

This extension replaces no baseline rule.

This extension switches on no record type. The Decision that records the locale contract is a core record every project writes.

## Standards

### Record supported locale behavior

**Statement:** A localization decision MUST list supported locales, default locale, fallback chain, user selection, browser detection, owner, and status.

**Rationale:** Locales, default, fallback, selection, and browser detection interact: each catalog, route, and formatter reads the same contract, so the team writes it once before building any of them. Without the contract, each part guesses a different fallback and the product answers each missing translation differently. A draft names its decider and decide-by date so the contract lands before the first catalog does.

### Avoid catalog-only locale claims

**Statement:** A product MUST NOT infer supported locales from catalog files alone.

**Rationale:** A catalog file proves only that someone wrote translations; it says nothing about routes, fallback, selection, or detection. A product that counts locales by counting files announces a language its routes cannot serve and its fallback never reaches.

### Define one locale route shape

**Statement:** A localized application MUST define one documented locale route shape.

**Rationale:** Users, links, crawlers, and caches all address a localized page, and one route shape gives each language one predictable address. A path segment is the default shape: it gives every localized page a distinct address that links, crawlers, and cache entries can each name. A cookie or header shape serves every locale from one address instead, so a shared cache and a search index each see only one of them. A product with no public pages, whose locale belongs to the signed-in account, documents one of those shapes instead of inventing a fourth.

**Example:** `/nl/orders/42` places the locale in the documented path segment, so a crawler and a shared cache each address one language.

### Handle unavailable locale segments

**Statement:** A localized application MUST redirect unsupported or missing locale segments according to product policy.

**Rationale:** Readers mistype addresses and follow stale links, so a locale segment can name a language the product never shipped or omit the segment entirely. Without a documented policy, each route answers differently: one shows the default language, another shows an error, and a crawler indexes both as content.

### Avoid duplicate localized URLs

**Statement:** A localized application MUST NOT publish multiple indexable URLs for the same localized content.

**Rationale:** When two addresses serve the same language, search engines split the page's rank between them and canonical links point two ways. One indexable address per language keeps search, sharing, and caching pointed at the same page.

### Store user-facing copy in catalogs

**Statement:** A localized application MUST store user-facing copy in locale catalogs.

**Rationale:** Copy in source code reaches translators only through developers, and each wording change becomes a code change with a review, a build, and a deployment. Catalogs hold every user-facing sentence in one place per locale, so translators edit wording while developers edit behavior.

### Name messages by meaning

**Statement:** A locale catalog MUST use semantic keys that cite Term records rather than source-language sentences.

**Rationale:** A key that copies the English sentence breaks its meaning the day English rewords it: every other language still points at the old sentence. A semantic key names the intent instead, citing the Term record that holds the word's labels per language, so wording changes in any language without disturbing the key.

**Example:** `orders.cancel.confirmation` identifies intent without copying the English sentence.

### Complete or fall back catalog values

**Statement:** Each supported locale MUST contain required keys or use its declared fallback.

**Rationale:** A missing translation with no declared fallback becomes a runtime surprise: the interface shows a key, an empty string, or the wrong language, and nobody chose which. The declaration states the fallback locale and what a missing key does at build time.

A key missing from the default locale fails the build. No fallback exists for it, and the interface renders its identifier. A key missing from a non-default locale reports a warning and falls back. Shipping one untranslated string costs less than blocking a release on it.

**Example:** A catalog check runs in the frontend lint gate. The two outcomes are visible before review, not in a browser.

### Follow the validation message grammar

**Statement:** A validation catalog MUST state the field label, what is wrong, and what is accepted, without technical wording.

**Rationale:** A validation message that names the field, the fault, and the accepted input tells the reader how to fix the entry in any language, while a message with only one of the three leaves the reader guessing. The three-part shape holds across languages; each language's sentence pattern lives on the field's Term labels and the language's writing page.

**Example:** The Term record for a field carries the sentence pattern for each supported language.

### Resolve every shown identifier

**Statement:** A screen MUST resolve every closed-set code it renders to its Term record label and never render the raw code, excluding user-facing reference numbers.

**Rationale:** A code such as a refusal ground or a billing state is a contract value built for systems, while the Term label beside it is copy built for readers. A screen that renders the raw code shows one untranslated fragment in an otherwise translated page and forces the reader to decode it. Resolving every shown code keeps the whole screen in the reader's language, except reference numbers the reader quotes back.

**Example:** A shipment row shows the Term label for `shipment-delayed` in the active locale.

### Format values with active locale

**Statement:** A localized interface MUST format dates, times, numbers, currency, plurals, lists, and relative time by active locale.

**Rationale:** Dates, numbers, currency, plurals, lists, and relative time each follow the reader's conventions, and a date the reader misreads becomes a missed appointment or a wrong payment. The platform supplies all of them.

[The `Intl` namespace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) has `DateTimeFormat`, `NumberFormat`, `PluralRules`, `ListFormat`, and `RelativeTimeFormat`. Each one carries the locale data the browser already ships. A project-written formatter for any of these is a second locale database that no one updates. Its plural rules are wrong for the first language with more than two forms.

**Example:** Create one formatter instance per locale and reuse it. Construction is the expensive part.

### Preserve locale-neutral business data

**Statement:** Domain values and API contracts MUST remain locale-neutral unless a use case explicitly exchanges localized content.

**Rationale:** An expense state or a price stored in Dutch breaks the moment an English speaker opens it, and an API contract that shifts per language forces every consumer to negotiate wording before reading data. Business values and wire contracts stay in one neutral form, and only the interface translates them for display. A use case that genuinely exchanges localized content, such as a product description the merchant writes per language, names that exchange explicitly.

### Localize public presentation content

**Statement:** Public metadata, form labels, validation messages, and user-safe errors MUST follow the active locale.

**Rationale:** A Dutch page with an English title, English form labels, or an English error tells the reader the translation stopped halfway and tells a search engine the page serves two languages. Metadata, labels, validation messages, and user-safe errors follow the active locale with the page around them.

### Keep stable error codes locale-neutral

**Statement:** A stable API error code MUST NOT change by locale.

**Rationale:** Integrations and support tools match on the error code, and a code that changes per language forces every consumer to list every translation before handling one failure. The code stays fixed while the human-readable message beside it translates.

## Conventions

### Use one catalog root

**Default:** Keep catalogs under one application-owned locale root.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** One application-owned root tells every developer and tool where catalogs live, so a new locale lands beside the old ones instead of in a folder nobody checks. Scattered catalogs split ownership, and one of them misses the fallback check.

### Split catalogs by module when needed

**Default:** Split catalogs by module only when catalog size requires it.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** Small catalogs read better whole: one file per locale shows every key at a glance and survives a rename without cross-file edits. Splitting waits until measured size, such as slow loads or conflicting edits, proves one file no longer serves.

### Use BCP 47 identifiers

**Default:** Use BCP 47 locale identifiers.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** BCP 47 is the identifier form routes, catalogs, browsers, and libraries recognize: one tag such as `nl` travels unchanged from the address bar to the catalog lookup. A home-grown form needs translation at every boundary and puzzles every new developer.

### Keep locale selection explicit

**Default:** Keep locale selection in the URL or documented session preference.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** A locale stored in the URL or a documented session preference travels with the request, so any developer can see which language a page serves and link to it. An implicit global locale hides in process state, where one request can read another's language and no link reproduces the page.

## Dependencies

This extension selects no library. A team that adds a localization package records a Decision and pins the package in the manifest.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/locale#record-supported-locale-behavior | guidance | Does the decision list locales, default, fallback, selection, owner, and status? |
| litespec/ext/locale#avoid-catalog-only-locale-claims | guidance | Is supported-locale evidence the decision rather than catalog files? |
| litespec/ext/locale#define-one-locale-route-shape | guidance | Does the application define and use one locale route shape? |
| litespec/ext/locale#handle-unavailable-locale-segments | guidance | Do unsupported or missing locale segments follow product policy? |
| litespec/ext/locale#avoid-duplicate-localized-urls | guidance | Is there one indexable URL per localized content item? |
| litespec/ext/locale#store-user-facing-copy-in-catalogs | guidance | Is user-facing copy stored in locale catalogs? |
| litespec/ext/locale#name-messages-by-meaning | guidance | Do catalog keys cite Term records instead of source sentences? |
| litespec/ext/locale#complete-or-fall-back-catalog-values | guidance | Does each locale resolve required keys or use its declared fallback? |
| litespec/ext/locale#follow-the-validation-message-grammar | guidance | Does each validation message state label, fault, and accepted input? |
| litespec/ext/locale#resolve-every-shown-identifier | guidance | Does each shown code render its Term label rather than the raw code? |
| litespec/ext/locale#format-values-with-active-locale | guidance | Are dates, numbers, currency, plurals, lists, and relative time localized? |
| litespec/ext/locale#preserve-locale-neutral-business-data | guidance | Do Domain values and API contracts stay locale-neutral? |
| litespec/ext/locale#localize-public-presentation-content | guidance | Do metadata, labels, validation, and safe errors follow the active locale? |
| litespec/ext/locale#keep-stable-error-codes-locale-neutral | guidance | Is each stable error code identical across locales? |
| litespec/ext/locale#use-one-catalog-root | guidance | Do catalogs sit under one owned root or record an Exception? |
| litespec/ext/locale#split-catalogs-by-module-when-needed | guidance | Is each module split justified by size or is an Exception recorded? |
| litespec/ext/locale#use-bcp-47-identifiers | guidance | Are locale identifiers BCP 47 or is an Exception recorded? |
| litespec/ext/locale#keep-locale-selection-explicit | guidance | Is selection in the URL or a documented session preference? |
