---
{
  "id": "recipe.localization",
  "kind": "recipe",
  "normative": true,
  "appliesTo": ["frontend.app", "testing"],
  "recipes": ["localization"]
}
---
# Localization

## RECIPE.LOCALE.ADOPT.001 - Define supported locales

Enable localization when the product commits to more than one locale. Declare supported locales, default locale, fallback, and URL strategy.

## RECIPE.LOCALE.ROUTES.001 - Keep locale routing canonical

Use one documented route shape. Redirect unsupported locale segments to the default or return 404 according to the product contract. Avoid duplicate indexable URLs for the same language.

## RECIPE.LOCALE.MESSAGES.001 - Keep message keys stable

Store user-facing copy in locale catalogs. Use stable semantic keys and verify that every supported locale has the required keys.

## RECIPE.LOCALE.FORMAT.001 - Format by active locale

Use locale-aware date, time, number, currency, plural, and relative-time formatting. Store domain values in locale-neutral forms.

## RECIPE.LOCALE.GATES.001 - Test fallback and critical journeys

Test locale detection, explicit selection, fallback, missing keys, route generation, and the primary journey in each supported locale.

