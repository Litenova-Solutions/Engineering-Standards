# Upgrade to Standards v1.6

Standards v1.6 is an additive release focused on the frontend profile and the API contract. It adds no vocabulary rename and moves no documentation directories. It adds one rule (`API.OPENAPI.002`), one `implementationStatus` value (`implemented`), and several clarifications drawn from building a Next.js consumer against v1.5. Most consumers pass v1.6 with small, localized changes.

## Reflect enforced authentication in OpenAPI (`API.OPENAPI.002`)

If your endpoints enforce authentication (deriving the actor from claims and returning 401 when absent), the generated OpenAPI document must now declare the matching security scheme and per-operation security. Add an OpenAPI document transformer that reads the registered authentication schemes and writes `securitySchemes` and `security`, rather than hand-writing them.

```csharp
// Illustrative: register a document transformer that reflects registered schemes.
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer(async (document, context, cancellationToken) =>
    {
        var schemes = await context.ApplicationServices
            .GetRequiredService<IAuthenticationSchemeProvider>()
            .GetAllSchemesAsync();
        // Add the relevant scheme(s) to document.Components.SecuritySchemes and a
        // matching document/operation security requirement. Leave intentionally
        // anonymous operations without a requirement.
    });
});
```

Regenerate the committed OpenAPI artifact and typed consumers in the same change. Confirm the document declares security for every operation that enforces authentication and none for anonymous operations.

## Adopt `implemented` where it fits

`implementationStatus` now accepts `implemented` between `planned` and `verified`. Use it for a specification whose behavior is shipped but whose acceptance evidence is not yet complete. It is optional: existing `planned` and `verified` values remain valid, and the release standard still requires `verified` for every included use case, workflow, end-to-end flow, and page in a release. No migration is required.

## Pin shadcn dependencies from the manifest

The manifest now pins the unified `radix-ui` package and `lucide-react`. If you use shadcn/ui, take those pins and prefer the unified `radix-ui` package over individual `@radix-ui/react-*` dependencies. You may add components through the shadcn CLI or as hand-authored canonical source; both are reviewed as owned application code. A component whose source imports a package the manifest does not pin still requires pinning that package first under `DEP.APPROVAL.001`.

## Tighten numeric transport types

Ensure `int32` and `double` fields emit a plain numeric OpenAPI schema, not a `number` or `string` union. Reserve the union for `int64`-scale values. On the frontend, coerce any legitimate `number | string` field at the read or view-model boundary before arithmetic or formatting.

## Smaller clarifications (usually no code change)

- When a layout guards existence and calls `notFound()`, place `not-found.tsx` in the parent segment; a segment's own `not-found.tsx` cannot catch a throw from its own layout. Confirm the not-found state in a browser.
- `server-only` is optional. Rely on the server-owned module boundary as the baseline; use the `server-only` package only when it is pinned.
- Give card and section titles heading semantics rather than a styled `div`.
- Set a concrete `settings.react.version` in the ESLint flat config to avoid the `eslint-plugin-react` version-detection failure under ESLint 10, or hold ESLint at the latest 9.x until the plugin is compatible.
- The page template folder mapping no longer includes a `src/` segment, matching `FRONTEND.STRUCTURE.001`. This affects new page-spec authoring only.
