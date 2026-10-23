# The Claimwick Screen

## Intent

The expenses screen is one screen of the Claimwick product, the example product these pages follow: it shows each employee their expenses at one address. This page follows that screen from the folder serving its address, through its data read with the API client generated from the published contract, the shared UI package it composes, and the drawn list option it starts from, naming the frontend rule each step applies.

## The Expenses Route

The screen lives at `apps/web/src/routes/expenses/+page.svelte` in the Claimwick example. A Svelte frontend holds one folder per address under `src/routes`, with the frame and the use-case code in `src/lib/app` and `src/lib/modules`, as [Web Structure](../frontend/web/structure.md) states. The route mirrors its use case path in kebab case, per `litespec/frontend/structure#mirror-the-backend-use-case-path-in-kebab-case` on [Frontend Structure](../frontend/structure.md): the folder `expenses` answers the List expenses use case that [Modules and Records](modules-and-records.md) describes.

A route file holds its input, its load, and its component, with no reusable logic and no import of another route file, per `litespec/frontend/web/structure#keep-a-route-file-thin`. The expenses route therefore validates its search, prefetches its read, and composes its view, while shared code lives in the module folder or the frame. Imports point from the route to a module to the frame to a shared package, per `litespec/frontend/web/structure#keep-imports-directional`, so the route reads the client from the frame and the generated operations from the shared API package.

## Reading Through the Generated Client

The screen never duplicates the API contract. The workspace generates its client, types, schemas, and query options from the published OpenAPI document, per `litespec/frontend/web/data#generate-the-client-from-the-published-contract` on [Web Data and State](../frontend/web/data.md), which follows `litespec/frontend/data#generate-the-client-from-the-published-contract` on [Frontend Data and State](../frontend/data.md). The generated client lives in `packages/api`, and the list reads through its `listExpenses` operation in `packages/api/src/generated/sdk.gen.ts`, which returns the `rows` include group the List expenses query declares: identity, amount, state, and submission time, newest first, read fresh:

```ts
export const listExpenses = <ThrowOnError extends boolean = false>(options: Options<never, ThrowOnError> = {}) =>
  (options.client ?? client).get<ListExpensesResponse, unknown, ThrowOnError>({
    url: "/api/expenses",
    ...options,
  });
```

The route's load prefetches the read through the query cache before the component runs, per `litespec/frontend/web/rendering#load-route-data-in-the-loader` on [Web Rendering and Routes](../frontend/web/rendering.md), and the component reads the same cache key with a suspense query, per `litespec/frontend/web/rendering#read-route-data-with-a-suspense-query`. Written the way the stack pages require, the load looks like this:

```ts
export async function load({ parent, url }) {
  const { queryClient } = await parent();
  const search = expensesSearch.parse(Object.fromEntries(url.searchParams));
  await queryClient.ensureQueryData(listExpensesQuery(search.page));
  return { search };
}
```

The search schema keeps the filters and the page in the address, per `litespec/frontend/web/rendering#keep-search-parameters-validated-by-a-schema`, so a filtered list stays a link the team can share. The example page itself is smaller: it calls `listExpenses` from `@claimwick/api` directly and renders the rows in the `ListPage` floorplan and the `DataTable` composite from `@claimwick/ui/floorplans`, so the model builder joins the screen to the list use case through the generated client. The load above shows what the stack pages require once the query cache is wired.

## The Shared UI Package

The screen composes the shared UI package `@claimwick/ui` at `packages/ui`, which the project declares in `paths.uiPackage` of `litespec.project.json`. The package pins its baseline in the source lock at `packages/ui/ui-source-lock.json`: generator `shadcn-svelte`, CLI `1.7.0`, with the `button` and `skeleton` components at baseline status. `litespec ui` checks the package, its source lock and digests, its design contract, its stylesheets, each frontend boundary, and each route suite, per [Validate Controlled UI](../tools/ui.md). Against the Claimwick example it reports this, and exits zero:

```text
Consumer: D:\Personal-Projects\LiteSpec\examples\expenses
Shared UI package: @claimwick/ui at packages/ui
Controlled frontends: 1

PASS: the shared package, its source lock, its design contract, its stylesheets, each frontend boundary, and each route suite are valid.
```

The run names the one controlled frontend: the `web` frontend at `apps/web`, which declares `platform: svelte`. Its route suite lives at `tests/routes/every-route.spec.ts`.

## The List Pattern Behind the Screen

The screen starts from the `litespec/frontend/patterns/lists-and-tables#choosing-the-columns` pattern on [List and Table Patterns](../frontend/patterns/lists-and-tables.md). That pattern asks which columns the table shows, and its default option `five-columns-nothing-removable` shows five columns with nothing removable: which item, who, when, what state, and what value. The expenses screen adapts that set to the facts the Expense record holds: the expense, the employee, the expense state, and the amount, which [Modules and Records](modules-and-records.md) describes.

A consumer keeps one pattern catalog holding its interface decisions, per `litespec/frontend/patterns#keep-one-pattern-catalog` on [UI Patterns](../frontend/patterns.md). Each entry records at least 2 options with rationale and cost and names the chosen option, and each decision records its source as `owner` or `recommended`, per `litespec/frontend/patterns#record-who-chose`. The example keeps its catalog at `docs/ui/pattern-catalog.json` with 2 entries, the orders list page and table sorting, and both decisions record `recommended` sources, standing until an owner chooses.

## The Frontend Rules the Screen Follows

Each step of the screen answers to one frontend rule. [Frontend Structure](../frontend/structure.md) and [Web Structure](../frontend/web/structure.md) place the route folder, keep the route file thin, and point its imports toward the shared packages. [Frontend Data and State](../frontend/data.md) and [Web Data and State](../frontend/web/data.md) generate the client from the contract and route the read through it. [Web Rendering and Routes](../frontend/web/rendering.md) prefetches the list in the load, reads it from the cache in the component, and keeps the view in the address. [Validate Controlled UI](../tools/ui.md) checks the shared package, its source lock, and each frontend boundary. [List and Table Patterns](../frontend/patterns/lists-and-tables.md) gives the columns decision its options, and [UI Patterns](../frontend/patterns.md) records the choice. The [Svelte Stack](../frontend/web/svelte/stack.md) selects the rendering mode for the Claimwick app by its audience. A screen that keeps each of these rules reads the same way as every other screen, so the next route is a small variation on this one. [The Model and Its Checks](model-and-checks.md) shows how the model proves the screen, its use case, and its handler agree.
