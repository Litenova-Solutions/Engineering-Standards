# Localization

## Intent

Localization makes routes, messages, formatting, metadata, and tests locale-aware while stored Domain values remain locale-neutral.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `locale` when the product supports more than one locale. A possible future translation does not activate it.

## Baseline relationship

The product brief or decision records locales, default locale, fallback behavior, and URL strategy. This extension replaces no baseline rule.

## Agent Summary {#agent-summary}

- Record supported locale behavior. (standards/rule/ext-locale.record-supported-locale-behavior)
- Keep localized routes canonical. (standards/rule/ext-locale.define-one-locale-route-shape, standards/rule/ext-locale.avoid-duplicate-localized-urls)
- Store copy under stable semantic keys. (standards/rule/ext-locale.store-user-facing-copy-in-catalogs, standards/rule/ext-locale.name-messages-by-meaning)
- Write validation copy by the grammar and humanize every shown identifier. (standards/rule/ext-locale.follow-the-validation-message-grammar, standards/rule/ext-locale.resolve-every-shown-identifier)
- Format user-facing values by locale. (standards/rule/ext-locale.format-values-with-active-locale)
- Keep Domain and API values locale-neutral. (standards/rule/ext-locale.preserve-locale-neutral-business-data)
- Localize safe public content without changing error codes. (standards/rule/ext-locale.localize-public-presentation-content, standards/rule/ext-locale.keep-stable-error-codes-locale-neutral)

## Standards

### Record supported locale behavior (standards/rule/ext-locale.record-supported-locale-behavior)

**Requirement:** A localization decision MUST list supported locale identifiers, default locale, fallback chain, user selection, and browser-detection behavior.

**Rationale:** One decision defines the product's locale contract before catalogs and routes appear.

### Avoid catalog-only locale claims (standards/rule/ext-locale.avoid-catalog-only-locale-claims)

**Requirement:** A product MUST NOT infer supported locales from catalog files alone.

**Rationale:** Catalog presence cannot define routing, fallback, selection, or browser-detection behavior.

### Define one locale route shape (standards/rule/ext-locale.define-one-locale-route-shape)

**Requirement:** A localized application MUST define one documented locale route shape.

**Rationale:** One shape gives users, crawlers, and links a predictable localized address. A path segment is the baseline shape. It makes every localized page a distinct address that a link, a crawler, and a cache entry can each name. A cookie or header shape serves several locales from one address, so a shared cache and a search index see one of them. An application with no public pages, whose locale is a property of the signed-in account, documents one of those shapes instead.

**Example:** `/nl-NL/orders/42` places the locale in the documented path segment, which is [the default the pinned framework documents](https://nextjs.org/docs/app/building-your-application/routing/internationalization).

### Handle unavailable locale segments (standards/rule/ext-locale.handle-unavailable-locale-segments)

**Requirement:** A localized application MUST redirect unsupported or missing locale segments according to product policy.

**Rationale:** The policy identifies the fallback or error behavior for an unavailable route locale.

### Avoid duplicate localized URLs (standards/rule/ext-locale.avoid-duplicate-localized-urls)

**Requirement:** A localized application MUST NOT publish multiple indexable URLs for the same localized content.

**Rationale:** Duplicate indexable locations split search and canonical-link behavior.

### Store user-facing copy in catalogs (standards/rule/ext-locale.store-user-facing-copy-in-catalogs)

**Requirement:** A localized application MUST store user-facing copy in locale catalogs.

**Rationale:** Catalogs separate translated wording from application behavior and source code.

### Name messages by meaning (standards/rule/ext-locale.name-messages-by-meaning)

**Requirement:** A locale catalog MUST use semantic keys rather than source-language sentences.

**Rationale:** A meaning-based key remains stable when one language changes wording.

**Example:** `orders.cancel.confirmation` identifies intent without copying the English sentence.

### Complete or fall back catalog values (standards/rule/ext-locale.complete-or-fall-back-catalog-values)

**Requirement:** Each supported locale MUST contain required keys or use its declared fallback.

**Rationale:** A declared fallback prevents missing copy from becoming an unreviewed runtime behavior.

The declaration states the fallback locale and what a missing key does at build time. A key missing from the default locale fails the build, because no fallback exists for it and the interface would render its identifier. A key missing from a non-default locale reports a warning and falls back. Shipping one untranslated string costs less than blocking a release on it.

**Example:** A catalog check runs in the frontend lint gate, so the two outcomes are visible before review rather than in a browser.

### Follow the validation message grammar (standards/rule/ext-locale.follow-the-validation-message-grammar)

**Requirement:** A validation catalog MUST write empty-field errors as field-naming imperatives and format or length errors with the concrete bound, without `please`.

**Rationale:** [The GOV.UK Design System](https://design-system.service.gov.uk/components/error-message/) separates the two forms because each answers a different failure. An imperative tells the reader what to do next, and a bound tells the reader what the limit is rather than that one exists.

**Example:** The empty case is "Enter your email address". The format case is "Enter an email address in the correct format, like name@example.com". A length case carries the count: "Name must be 200 characters or less".

### Resolve every shown identifier (standards/rule/ext-locale.resolve-every-shown-identifier)

**Requirement:** A screen MUST resolve every machine identifier it renders to a humanized catalog label and never render the raw identifier.

**Rationale:** The identifier is a contract value and the label is copy. A resolution value, a refusal ground, a role code, or a billing state carries its label beside the rest of the screen's copy.

**Example:** An oversell resolution row shows "Stock returned" from the catalog rather than `inventory-reacquired`.

### Format values with active locale (standards/rule/ext-locale.format-values-with-active-locale)

**Requirement:** A localized interface MUST format dates, times, numbers, currency, plurals, lists, and relative time by active locale.

**Rationale:** User-facing formatted values need the selected locale's conventions.

The platform supplies every one of them. [The `Intl` namespace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) has `DateTimeFormat`, `NumberFormat`, `PluralRules`, `ListFormat`, and `RelativeTimeFormat`, and each one carries the locale data the browser already ships. A project-written formatter for any of these is a second locale database that nobody updates. Its plural rules are wrong for the first language with more than two forms.

**Example:** A formatter instance is created once per locale and reused, because construction is the expensive part.

### Preserve locale-neutral business data (standards/rule/ext-locale.preserve-locale-neutral-business-data)

**Requirement:** Domain values and API contracts MUST remain locale-neutral unless a use case explicitly exchanges localized content.

**Rationale:** Stable business values and wire contracts do not change with interface language.

### Localize public presentation content (standards/rule/ext-locale.localize-public-presentation-content)

**Requirement:** Public metadata, form labels, validation messages, and user-safe errors MUST follow the active locale.

**Rationale:** Visible content needs the same locale behavior as the page that presents it.

### Keep stable error codes locale-neutral (standards/rule/ext-locale.keep-stable-error-codes-locale-neutral)

**Requirement:** A stable API error code MUST NOT change by locale.

**Rationale:** Programmatic consumers need one code regardless of the caller's presentation locale.

## Conventions

### Use one catalog root (standards/rule/ext-locale.use-one-catalog-root)

**Default:** Keep catalogs under one application-owned locale root.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One root makes ownership and catalog discovery predictable.

### Split catalogs by module when needed (standards/rule/ext-locale.split-catalogs-by-module-when-needed)

**Default:** Split catalogs by module only when catalog size requires it.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Module splitting follows a measured size boundary instead of early fragmentation.

### Use BCP 47 identifiers (standards/rule/ext-locale.use-bcp-47-identifiers)

**Default:** Use BCP 47 locale identifiers.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** BCP 47 gives routes, catalogs, and selection one familiar identifier form.

### Keep locale selection explicit (standards/rule/ext-locale.keep-locale-selection-explicit)

**Default:** Keep locale selection in the URL or documented session preference.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Explicit selection avoids an implicit global locale that callers cannot inspect.

## Dependencies

No library is selected by this extension. A localization package needs a decision and manifest pin.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/ext-locale.record-supported-locale-behavior | inspection | Product brief or decision lists the required locale contract fields. |
| standards/rule/ext-locale.avoid-catalog-only-locale-claims | inspection | Locale support review cites the decision rather than catalog presence. |
| standards/rule/ext-locale.define-one-locale-route-shape | test | `LocaleRoutesTests` exercise the documented localized URL shape. |
| standards/rule/ext-locale.handle-unavailable-locale-segments | test | `LocaleRoutesTests` follow product fallback policy. |
| standards/rule/ext-locale.avoid-duplicate-localized-urls | static | `LocaleRoutesTests` asserts crawl or route review identifies one indexable URL per localized content item. |
| standards/rule/ext-locale.store-user-facing-copy-in-catalogs | static | `LocaleMessagesTests` resolves copy through locale catalogs. |
| standards/rule/ext-locale.name-messages-by-meaning | inspection | Catalog review identifies semantic message keys. |
| standards/rule/ext-locale.complete-or-fall-back-catalog-values | test | `LocaleMessagesTests` asserts each supported locale resolves required keys or declared fallback. |
| standards/rule/ext-locale.follow-the-validation-message-grammar | inspection | Catalog review asserts each empty-field message is imperative and each bound message states the count. |
| standards/rule/ext-locale.resolve-every-shown-identifier | inspection | Screen review finds no raw kebab-case or dotted identifier rendered without a catalog label. |
| standards/rule/ext-locale.format-values-with-active-locale | test | `LocaleFormatTests` verify dates, numbers, currency, plurals, lists, and relative time. |
| standards/rule/ext-locale.preserve-locale-neutral-business-data | inspection | Domain and OpenAPI review confirms locale-neutral stored and wire values. |
| standards/rule/ext-locale.localize-public-presentation-content | test | `LocaleContentTests` render metadata, labels, validation, and safe errors in active locale. |
| standards/rule/ext-locale.keep-stable-error-codes-locale-neutral | test | `LocaleContentTests` retain stable codes across locale selections. |
| standards/rule/ext-locale.use-one-catalog-root | inspection | Catalog paths use the owned root or record a local replacement. |
| standards/rule/ext-locale.split-catalogs-by-module-when-needed | inspection | Module catalog splits record their size rationale. |
| standards/rule/ext-locale.use-bcp-47-identifiers | static | `LocaleTests` accepts BCP 47 values or a recorded replacement. |
| standards/rule/ext-locale.keep-locale-selection-explicit | test | `LocaleTests` use URL or documented session preference. |
