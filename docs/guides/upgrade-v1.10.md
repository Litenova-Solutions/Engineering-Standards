# Upgrade to standards v1.10

Standards v1.10.0 makes the controlled shadcn/ui with Tailwind CSS v4 baseline normative for React web
frontends. This is a breaking standards release. It adds the UI vocabulary, page contract, source-lock,
Tailwind, companion, agent, and evidence rules. It does not make official web shadcn/ui a React Native
system.

## Read the new contract

Load these documents before changing a frontend:

1. `docs/conventions/frontend/ui-governance.md`;
2. `docs/conventions/frontend/components.md`;
3. `docs/conventions/frontend/structure.md`;
4. `docs/conventions/frontend/testing.md`;
5. the selected product requirements and page documents.

The manifest is now schema version 3 and version `1.10.0`. Resolve all stack and package versions from
`standards.manifest.json`; do not copy versions from the guide or a package search result.

## Configure each frontend

Add `platform: react-web` and a `ui` object to every React web entry in `standards.project.json`.
Record the profile (`public-light`, `application-balanced`, or `admin-dense`) and public exports.
For the default shadcn/ui system, also record the paths to `components.json`, the vocabulary, source
lock, global CSS entry, and primitive directory. Baseline values resolve from the manifest. Add only
explicit fields that represent an approved override. A Bootstrap, MUI, or other temporary system must
name `system`, `overrideDecision`, and `reviewBy`; it may omit shadcn source-lock paths until the
migration begins. Use the template at `templates/docs/standards.project.json` as the default shape
reference and `templates/docs/ui-override-decision.md` for the exception record.

Every `UI.*` entry in `overrides` also carries `reviewBy`. The override is valid until that date and then
fails validation, so a temporary system cannot become permanent by omission. Renew the decision with a
new date or complete the migration.

Native entries do not use the web UI block. Record their separate platform UI decision and keep native
dependencies and evidence in the native application.

## Initialize a new React web frontend

Use the manifest-pinned shadcn CLI and the built-in registry. The accepted baseline is Base UI, Vega
(`bIkf1RQ`, `base-vega` in `components.json`), CSS variables, neutral base color, Geist, Lucide, and the
preset radius. Commit:

- `components.json`;
- the installed `components/ui/` source;
- `lib/utils.ts` with one `cn` helper;
- the designated global CSS entry;
- `ui-source-lock.json`;
- the frontend vocabulary;
- the first page sidecars.

Do not use `@latest`, an unapproved registry, or `shadcn eject`. Run `node standards/tools/validate-ui.mjs`
after the initial source, vocabulary, and page contracts are present.

## Migrate an existing shadcn frontend

Inventory the primitive base, CLI version, preset, installed files, local diffs, direct dependencies,
registries, global CSS, and custom selectors. Add the source lock and vocabulary before changing source.
Classify each component as `baseline`, `extended`, `forked`, or `specialist`.

An existing Radix frontend has two valid paths:

1. record a temporary override with an owner, review date, and migration trigger; or
2. migrate one component family at a time to Base UI, compare keyboard and focus behavior, run the
   affected state matrix, and update the source lock.

Do not mix Radix and Base UI implementations in one frontend. Do not reinstall every component and
repair behavior after the fact.

## Migrate Bootstrap, MUI, Paper-web, or another React system

Record a temporary override before the v1.10.0 baseline takes effect. Inventory the general-purpose library,
wrappers, CSS or Sass, tokens, route selectors, and specialist controls. Migrate one complete route or
named pattern at a time so a page does not render two general-purpose systems together. Map behavior
packages to shadcn compositions and remove the old package only after no route uses it.

Bootstrap remains an allowed override and can produce a clean administration panel with little project
CSS. It is not the Litenova default because the default appearance, source model, and agent vocabulary
are now shadcn/ui. The override must state why its total ownership cost is lower for that product.

## Add vocabulary and page contracts

Create a vocabulary from `templates/docs/ui-vocabulary.json` and validate it against
`schemas/ui-vocabulary.schema.json`. Add shells, patterns, components, semantic tokens, applicable
states, forks, specialists, runtime styles, and evidence before referencing them in a page. Every state,
evidence, and component reference must resolve inside the vocabulary, so add the evidence record before
the item that names it.

Generate `ui-source-lock.json` digests from the formatted installed source. The template ships a
placeholder digest; a copied placeholder fails validation until the real digest is written.

For each non-trivial page, keep the normal `kind: page` specification and add a sidecar from
`templates/docs/ui-page.json`. The sidecar must name ordered regions, profile, shell, states, responsive
modes, initial scroll, focus behavior, accessibility, and evidence. Use the page id in the sidecar so a
route cannot silently drift from its specification.

## Reduce ungoverned CSS

Keep one global Tailwind entry. Remove feature and route CSS, raw palette classes, arbitrary bracket
values in utilities, static inline styles, `@apply`, class selectors in the global entry, and duplicated
class-merging helpers. Use semantic tokens and declared component variants. Generated shadcn source is
the accepted baseline; a changed generated file requires an `extended` or `forked` record.

Variant brackets are not arbitrary values. Keep `data-[state=open]:`, `has-[...]`, and `min-[...]`
variants; replace bracket values in the utility itself, such as `w-[37rem]` and `lg:w-[37rem]`. Move an
arbitrary selector variant such as `[&>svg]:size-4` into generated primitive source or a declared variant.

Do not use line count as the migration target. The target is zero unrecorded visual decisions, not zero
CSS. A measured runtime CSS custom property is allowed only through a vocabulary `runtimeStyles` record
that names the owning files, the properties, the reason, and the evidence.

## Add UI evidence

Run the evidence required by `UI.EVIDENCE.001` and `FTEST.UI.001`:

- component interaction and state checks;
- keyboard, focus return, accessible-name, and status checks;
- direct-navigation scroll and active-element checks;
- compact and wide responsive checks;
- visual comparison in a declared browser, viewport, font, and OS environment;
- manual screen-reader, zoom, contrast, and reduced-motion checks for regulated or high-risk flows.

Declare the Playwright worker and fixture model. A failed visual or isolation check requires diagnosis;
do not hide it with automatic baseline updates, retries, serialization, or shared mutable fixtures.

## Validate and finish

From the consumer root, run:

```bash
node standards/tools/validate-ui.mjs
node standards/tools/validate-consumer.mjs
```

Then run the changed frontend's frozen installation, lint, type check, component tests, browser tests,
accessibility checks, visual checks, and production build. Update the source lock only after the generated
diff and evidence are reviewed. Commit standards configuration, vocabulary, source lock, page contracts,
and product migration in coherent changes with the override or fork records that remain active.

## Completion criteria

- Every React web frontend uses the manifest baseline or has a reviewed override.
- Every configured frontend has a valid vocabulary and source lock.
- Every non-trivial page has a matching sidecar and vocabulary references.
- One primary visual system and one component base are active per frontend.
- Feature and route code has no unrecorded arbitrary visual values or CSS files.
- Every source digest mismatch is classified and evidenced.
- The worker and fixture model is deterministic and browser tests are independent.
- The complete changed-frontend gate set passes.
