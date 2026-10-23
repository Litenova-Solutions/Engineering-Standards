# Start a Consumer Repository

## Purpose

A LiteSpec consumer is a project built against the LiteSpec standard, and this tutorial turns an empty folder into one: its configuration, its first written records, one working use case, and a passing model check. A use case names what the product does for an actor, a person or system using it, and the model check confirms the records, code, and tests agree. This tutorial follows one backend stack and one frontend stack, the `dotnet` backend with a React frontend, so every step runs the same way for every reader. A developer follows these steps once, when creating the consumer. Each step names the standard it satisfies, and the tutorial adds no rule of its own.

## Prerequisites

- Read the [agent protocol](../core/agent.md), the [authoring standard](../core/authoring.md), and the [supported scope](../core/scope.md) to learn how agents work, how pages are written, and what one project covers.
- Read the [extension catalog](../ext/README.md) to learn which capabilities stay inactive at the start.
- Install the .NET SDK and Node.js releases the adopted release pins under `stack` in its `litespec.manifest.json`.
- Ship the `dotnet` backend with a React frontend: this tutorial follows that pair from the `dotnet-react` preset. When the product ships another frontend, follow this tutorial first, then declare that frontend with its own how-to, [Add a Svelte Frontend](../guide/add-a-svelte-frontend.md) or [Add a Blazor Frontend](../guide/add-a-blazor-frontend.md).

## Lesson

1. Install the LiteSpec release as a local .NET tool: run `dotnet new tool-manifest` when the folder has no `.config/dotnet-tools.json` yet, then `dotnet tool install LiteSpec.Cli --version 2.0.0` and `dotnet tool restore`. From here on, run every command below as `dotnet litespec <command>` from the consumer root. This satisfies `litespec/workspace/structure#use-the-canonical-root-tree`.
2. Write the project configuration: run `dotnet litespec init --preset dotnet-react --size small`, which writes `litespec.project.json` with the shape, the stacks, and the adopted release in `reviewedLiteSpecVersion`, with the `## LiteSpec` block in `AGENTS.md`, the glossary, and the example cast beside it. Fill every placeholder and name every owner. This satisfies `litespec/core/scope#select-a-size-a-shape-and-stacks`.
3. Select extensions only when their criteria already hold. Write each selection in the object form with its criterion and review date. This satisfies `litespec/core/scope#select-conditional-extensions-explicitly` and `litespec/core/scope#record-selected-extensions`.
4. Create the toolchain configuration from the manifest pins. Add the SDK floor, the shared build settings, the central NuGet versions, the tool manifest, and the JavaScript toolchain pin. This satisfies `litespec/backend/dotnet/config#set-the-sdk-floor-at-the-workspace-root`, `litespec/backend/dotnet/config#centralize-net-build-settings`, `litespec/backend/dotnet/config#centralize-nuget-versions`, `litespec/backend/dotnet/config#commit-the-tool-manifest`, and `litespec/workspace/config#pin-the-javascript-toolchain`.
5. Add only the packages the manifest already pins. Record each new package approval explicitly. This satisfies `litespec/backend/dotnet/packages#pin-every-dependency-centrally` and `litespec/workspace/dependencies#approve-new-packages-explicitly`.
6. Create the API solution. Add the five application projects, the AppHost, the ServiceDefaults, and the Architecture and Integration test projects. Add the Acceptance project when the product needs executable specifications. Reference `LiteSpec.Analyzers` from the five application projects, or once in `Directory.Build.props`:
   ```xml
   <ItemGroup>
     <PackageReference Include="LiteSpec.Analyzers" Version="2.0.0" PrivateAssets="all" />
   </ItemGroup>
   ```
   This satisfies `litespec/backend/dotnet/architecture#use-five-application-projects`, `litespec/backend/dotnet/testing#keep-the-test-projects-the-size-requires`, and `litespec/backend/dotnet/packages#run-litespecanalyzers-in-every-application-project`.
7. Apply the naming rules: match each C# file to its primary type and each namespace to its folder. This satisfies `litespec/backend/dotnet/naming#match-c-files-and-primary-types` and `litespec/workspace/naming#keep-namespaces-aligned-with-folders`.
8. Write the product brief. Copy `product-brief.md` from the template index to `docs/product/brief.md`. State the boundary, the refusals, and the audience. This satisfies `litespec/core/product#keep-product-intent-in-its-homes`.
9. Write one requirement page. Copy `requirement-page.md` from the template index to `docs/product/<area>/<topic>.md`. State each commitment as one requirement with its kind, `functional`, `quality`, or `business`. This satisfies `litespec/core/product#shape-each-requirement-page` and `litespec/core/product#identify-every-requirement`.
10. State which constraints apply. Write one constraint record per outside rule, with its source and category, or record that none applies, and set `constraints.answered` to `true`. The `litespec.project.json` template defines the fields.
11. Record the first decision. Copy `decision.md` from the template index to `docs/product/decisions/<number>-<name>.md`. Name the options with what speaks for and against each, the decider, and what would change the choice. This satisfies `litespec/core/product#record-each-choice-as-a-decision` and `litespec/core/product#trace-every-choice-to-a-decision`.
12. Write the people records. Add one actor page per party, one role page per grantable set, and the permission entries on the permissions page. Each use case later names the permissions it needs. The `actor.md`, `role.md`, and `permission-list.md` templates define the fields. When the slice exchanges anything with an outside system, add an external system page for it.
13. Write the module and its aggregates. Follow [Model a Domain Module](model-domain.md) for the module, the aggregates, the rules, the use cases, the scenarios, the events, and the permissions. This satisfies `litespec/core/system#group-module-use-case-files-by-aggregate`.
14. Implement one use case. Move the transition into a business method, keep the handler narrow, commit once, expose one endpoint, and authorize the target. This satisfies `litespec/backend/domain#express-transitions-through-business-methods`, `litespec/backend/application#keep-command-handlers-narrow`, `litespec/backend/dotnet/persistence#commit-once-in-the-command-pipeline`, `litespec/backend/dotnet/api#use-one-endpoint-per-operation`, and `litespec/quality/security#authorize-each-target-resource`.
15. Declare the React frontend. Declare the application tree and mirror the backend use case path. This satisfies `litespec/frontend/web/structure#use-the-frontend-application-tree`. Compose each route from one floorplan. This satisfies `litespec/frontend/web/ui#compose-each-route-from-one-floorplan`.
16. Deliver one complete slice. Ship source, tests, contracts, and operating evidence for one use case. This satisfies `litespec/core/system#deliver-one-complete-use-case`.
17. Add the operating records. Write the limits and runbooks, add deployment, backup, restore, and rollback, and configure the pipeline gates. This satisfies `litespec/quality/operations#start-the-stack-with-one-local-command` and `litespec/quality/ci#run-applicable-gates-on-every-pull-request`.
18. Build the model. Run `dotnet litespec model build` from the consumer root. It writes `model.json` with the computed links between records, code, screens, and tests.
19. Check the model. Run `dotnet litespec model check`. It exits 1 on any unresolved citation, missing link, or unproved scenario. Fix every finding before continuing.
20. Render the generated regions: run `dotnet litespec model render`, then commit what it wrote.
21. Run the remaining validators. Run `dotnet litespec consumer` and `dotnet litespec ui` from the consumer root. Both exit `0` on a clean tree. This satisfies `litespec/core/release#run-consistency-checks`.

## What You Built

- A consumer repository at small size that the model check accepts.
- One implemented use case with records, code, tests, and generated contracts.
- When the product ships another frontend, [Add a Svelte Frontend](../guide/add-a-svelte-frontend.md) and [Add a Blazor Frontend](../guide/add-a-blazor-frontend.md) declare it. The checks are documented on [Validate Consumer](../tools/consumer.md) and [Validate Controlled UI](../tools/ui.md); all commands are listed on the [command index](../tools/README.md).
