# Localization

## Intent

Localization makes routes, messages, formatting, metadata, and tests locale-aware while stored Domain values remain locale-neutral.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `localization` when the product supports more than one locale. A possible future translation does not activate it.

## Baseline relationship

The product brief or decision records locales, default locale, fallback behavior, and URL strategy. This extension replaces no baseline rule.

## Agent Summary {#agent-summary}

- Record supported locale behavior. (EXT.LOCALE.ADOPT.001)
- Keep localized routes canonical. (EXT.LOCALE.ROUTES.001, EXT.LOCALE.ROUTES.003)
- Store copy under stable semantic keys. (EXT.LOCALE.MESSAGES.001, EXT.LOCALE.MESSAGES.002)
- Format user-facing values by locale. (EXT.LOCALE.FORMAT.001)
- Keep Domain and API values locale-neutral. (EXT.LOCALE.FORMAT.002)
- Localize safe public content without changing error codes. (EXT.LOCALE.CONTENT.001, EXT.LOCALE.CONTENT.002)

## Standards

### Record supported locale behavior (EXT.LOCALE.ADOPT.001)

**Requirement:** A localization decision MUST list supported locale identifiers, default locale, fallback chain, user selection, and browser-detection behavior.

**Rationale:** One decision defines the product's locale contract before catalogs and routes appear.

### Avoid catalog-only locale claims (EXT.LOCALE.ADOPT.002)

**Requirement:** A product MUST NOT infer supported locales from catalog files alone.

**Rationale:** Catalog presence cannot define routing, fallback, selection, or browser-detection behavior.

### Define one locale route shape (EXT.LOCALE.ROUTES.001)

**Requirement:** A localized application MUST define one documented locale route shape.

**Rationale:** One shape gives users, crawlers, and links a predictable localized address.

**Example:** `/nl-NL/orders/42` places the locale in the documented path segment.

### Handle unavailable locale segments (EXT.LOCALE.ROUTES.002)

**Requirement:** A localized application MUST redirect unsupported or missing locale segments according to product policy.

**Rationale:** The policy identifies the fallback or error behavior for an unavailable route locale.

### Avoid duplicate localized URLs (EXT.LOCALE.ROUTES.003)

**Requirement:** A localized application MUST NOT publish multiple indexable URLs for the same localized content.

**Rationale:** Duplicate indexable locations split search and canonical-link behavior.

### Store user-facing copy in catalogs (EXT.LOCALE.MESSAGES.001)

**Requirement:** A localized application MUST store user-facing copy in locale catalogs.

**Rationale:** Catalogs separate translated wording from application behavior and source code.

### Name messages by meaning (EXT.LOCALE.MESSAGES.002)

**Requirement:** A locale catalog MUST use semantic keys rather than source-language sentences.

**Rationale:** A meaning-based key remains stable when one language changes wording.

**Example:** `orders.cancel.confirmation` identifies intent without copying the English sentence.

### Complete or fall back catalog values (EXT.LOCALE.MESSAGES.003)

**Requirement:** Each supported locale MUST contain required keys or use its declared fallback.

**Rationale:** A declared fallback prevents missing copy from becoming an unreviewed runtime behavior.

### Format values with active locale (EXT.LOCALE.FORMAT.001)

**Requirement:** A localized interface MUST format dates, times, numbers, currency, plurals, lists, and relative time by active locale.

**Rationale:** User-facing formatted values need the selected locale's conventions.

### Preserve locale-neutral business data (EXT.LOCALE.FORMAT.002)

**Requirement:** Domain values and API contracts MUST remain locale-neutral unless a use case explicitly exchanges localized content.

**Rationale:** Stable business values and wire contracts do not change with interface language.

### Localize public presentation content (EXT.LOCALE.CONTENT.001)

**Requirement:** Public metadata, form labels, validation messages, and user-safe errors MUST follow the active locale.

**Rationale:** Visible content needs the same locale behavior as the page that presents it.

### Keep stable error codes locale-neutral (EXT.LOCALE.CONTENT.002)

**Requirement:** A stable API error code MUST NOT change by locale.

**Rationale:** Programmatic consumers need one code regardless of the caller's presentation locale.

## Conventions

### Use one catalog root (EXT.LOCALE.CONVENTION.001)

**Default:** Keep catalogs under one application-owned locale root.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One root makes ownership and catalog discovery predictable.

### Split catalogs by module when needed (EXT.LOCALE.CONVENTION.002)

**Default:** Split catalogs by module only when catalog size requires it.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Module splitting follows a measured size boundary instead of early fragmentation.

### Use BCP 47 identifiers (EXT.LOCALE.CONVENTION.003)

**Default:** Use BCP 47 locale identifiers.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** BCP 47 gives routes, catalogs, and selection one familiar identifier form.

### Keep locale selection explicit (EXT.LOCALE.CONVENTION.004)

**Default:** Keep locale selection in the URL or documented session preference.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Explicit selection avoids an implicit global locale that callers cannot inspect.

## Dependencies

No library is selected by this extension. A localization package needs a decision and manifest pin.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.LOCALE.ADOPT.001 | inspection | Product brief or decision lists the required locale contract fields. |
| EXT.LOCALE.ADOPT.002 | inspection | Locale support review cites the decision rather than catalog presence. |
| EXT.LOCALE.ROUTES.001 | test | `LocaleRoutesTests` exercise the documented localized URL shape. |
| EXT.LOCALE.ROUTES.002 | test | `LocaleRoutesTests` follow product fallback policy. |
| EXT.LOCALE.ROUTES.003 | static | `LocaleRoutesTests` asserts crawl or route review identifies one indexable URL per localized content item. |
| EXT.LOCALE.MESSAGES.001 | static | `LocaleMessagesTests` resolves copy through locale catalogs. |
| EXT.LOCALE.MESSAGES.002 | inspection | Catalog review identifies semantic message keys. |
| EXT.LOCALE.MESSAGES.003 | test | `LocaleMessagesTests` asserts each supported locale resolves required keys or declared fallback. |
| EXT.LOCALE.FORMAT.001 | test | `LocaleFormatTests` verify dates, numbers, currency, plurals, lists, and relative time. |
| EXT.LOCALE.FORMAT.002 | inspection | Domain and OpenAPI review confirms locale-neutral stored and wire values. |
| EXT.LOCALE.CONTENT.001 | test | `LocaleContentTests` render metadata, labels, validation, and safe errors in active locale. |
| EXT.LOCALE.CONTENT.002 | test | `LocaleContentTests` retain stable codes across locale selections. |
| EXT.LOCALE.CONVENTION.001 | inspection | Catalog paths use the owned root or record a local replacement. |
| EXT.LOCALE.CONVENTION.002 | inspection | Module catalog splits record their size rationale. |
| EXT.LOCALE.CONVENTION.003 | static | `LocaleTests` accepts BCP 47 values or a recorded replacement. |
| EXT.LOCALE.CONVENTION.004 | test | `LocaleTests` use URL or documented session preference. |
