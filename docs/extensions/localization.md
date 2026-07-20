# Localization

## Intent

Localization makes routes, messages, formatting, metadata, and tests locale-aware while keeping stored domain values locale-neutral.

## Activation

Enable `localization` when the product commits to supporting more than one locale. A possible future translation does not activate it.

The product brief or a decision records supported locales, default locale, fallback behavior, and URL strategy. This extension replaces no baseline rule.

## Agent Summary {#agent-summary}

- Declare supported, default, and fallback locales.
- Use one canonical locale route strategy.
- Store user-facing copy in locale catalogs with stable semantic keys.
- Format dates, numbers, money, plural forms, and relative time by active locale.
- Keep domain and database values locale-neutral.
- Test fallback and the primary journey in every supported locale.

## Standards

### Define supported locales (EXT.LOCALE.ADOPT.001)

List supported locale identifiers, default locale, fallback chain, user selection behavior, and browser-detection behavior. Do not infer support from catalog files alone.

### Keep locale routing canonical (EXT.LOCALE.ROUTES.001)

Use one documented route shape. Redirect unsupported or missing locale segments according to the product policy. Avoid multiple indexable URLs for the same localized content.

### Keep message keys stable (EXT.LOCALE.MESSAGES.001)

Store user-facing copy in locale catalogs. Use semantic keys based on meaning, not the source-language sentence. Every supported locale contains the required keys or follows the declared fallback.

### Format by active locale (EXT.LOCALE.FORMAT.001)

Use locale-aware date, time, number, currency, plural, list, and relative-time formatting. Keep domain values and API contracts locale-neutral unless the use case explicitly exchanges localized content.

### Localize metadata and errors safely (EXT.LOCALE.CONTENT.001)

Public metadata, form labels, validation messages, and user-safe errors follow the active locale. Stable API error codes do not change by locale.

## Conventions

Keep catalogs under one application-owned locale root and split by subject only when catalog size requires it. Use BCP 47 locale identifiers. Keep locale selection in URL or documented session preference, not an implicit global variable.

## Dependencies

No library is selected by this extension. A localization package requires a decision and manifest pin.

## Verification

- Test locale detection, explicit selection, canonical routing, and fallback.
- Detect missing and unused catalog keys.
- Test dates, numbers, money, plural forms, metadata, and validation messages.
- Run the primary journey in every supported locale.
