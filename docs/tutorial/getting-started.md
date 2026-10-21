# Get Started

## Purpose

This tutorial starts a consumer repository at small size. At the end the repository holds its configuration, its first records, one implemented use case, and a passing model check. Where a step differs by stack, run the row that matches the stacks in `litespec.project.json`.

This guide carries no provision. Each step cites the provisions it satisfies.

## Prerequisites

- Read the [agent protocol](../core/agent.md), the [authoring standard](../core/authoring.md), and the [supported scope](../core/scope.md).
- Read the [extension catalog](../ext/README.md) to learn which capabilities stay inactive at the start.
- Install the .NET SDK and Node.js releases that `litespec.manifest.json` pins.
- Decide which stacks the product ships: `dotnet` plus one platform per frontend.

## Lesson

1. Pin the LiteSpec release. Add the LiteSpec repository as a submodule or another pinned dependency. This satisfies `litespec/workspace/structure#use-the-canonical-root-tree`.
2. Write the project configuration. Run `litespec init --preset dotnet-react --size small`, which writes `litespec.project.json` with the shape, the stacks and the pinned release in `reviewedLiteSpecVersion`. Copy `project-agents.md` from the [template index](../../templates/consumer/README.md) to the root as `AGENTS.md`. Fill every placeholder and name every owner. This satisfies `litespec/core/scope#select-a-size-a-shape-and-stacks`.
3. Select extensions only when their criteria already hold. Write each selection in the object form with its criterion and review date. This satisfies `litespec/core/scope#select-conditional-extensions-explicitly` and `litespec/core/scope#record-selected-extensions`.
4. Create the toolchain configuration from the manifest pins. Add the SDK floor, the shared build settings, the central NuGet versions, the tool manifest, and the JavaScript toolchain pin. This satisfies `litespec/backend/dotnet/config#set-the-sdk-floor-at-the-workspace-root`, `litespec/backend/dotnet/config#centralize-net-build-settings`, `litespec/backend/dotnet/config#centralize-nuget-versions`, `litespec/backend/dotnet/config#commit-the-tool-manifest`, and `litespec/workspace/config#pin-the-javascript-toolchain`.
5. Add only the packages the manifest already pins. Record each new package approval explicitly. This satisfies `litespec/backend/dotnet/packages#pin-every-dependency-centrally` and `litespec/workspace/dependencies#approve-new-packages-explicitly`.
6. Create the API solution. Add the five application projects, the AppHost, the ServiceDefaults, and the Architecture and Integration test projects. Add the Acceptance project when the product needs executable specifications. This satisfies `litespec/backend/dotnet/architecture#use-five-application-projects` and `litespec/backend/dotnet/testing#keep-the-test-projects-the-size-requires`.
7. Apply the file, type, and folder names. Match each C# file to its primary type and each namespace to its folder. This satisfies `litespec/backend/dotnet/naming#match-c-files-and-primary-types` and `litespec/workspace/naming#keep-namespaces-aligned-with-folders`.
8. Write the product brief. Copy `product-brief.md` from the template index to `docs/product/brief.md`. State the boundary, the refusals, and the audience. This satisfies `litespec/core/product#keep-business-intent-under-product`.
9. Write one topic page with its requirements. Copy `product-topic.md` from the template index. State each commitment as one requirement with its kind. This satisfies `litespec/core/product#state-each-topic-in-one-page-shape` and `litespec/core/product#identify-every-requirement`.
10. State which constraints apply. Write one constraint record per outside rule, or record that none applies, and set `constraints.answered` to `true`. The `litespec.project.json` template defines the fields.
11. Record the first decision. Copy `decision.md` from the template index. Name the options, the decider, and what would change the choice. This satisfies `litespec/core/product#record-each-product-choice-as-a-decision` and `litespec/core/product#trace-every-choice-to-a-decision`.
12. Write the people records. Add one actor page per party, one role page per grantable set, and the permission entries on the permissions page. Each use case later names the permissions it needs. The `actor.md`, `role.md`, and `permission-list.md` templates define the fields.
13. Write the module and its business records. Follow [Model a domain module](model-domain.md) for the module, the rules, the use cases, the events, and the permissions. This satisfies `litespec/core/system#group-language-and-use-cases-by-module`.
14. Implement one use case. Move the transition into a business method, keep the handler narrow, commit once, expose one endpoint, and authorize the target. This satisfies `litespec/backend/domain#express-transitions-through-business-methods`, `litespec/backend/application#keep-command-handlers-narrow`, `litespec/backend/dotnet/persistence#commit-once-in-the-command-pipeline`, `litespec/backend/dotnet/api#use-one-endpoint-per-operation`, and `litespec/quality/security#authorize-each-target-resource`.
15. Declare each frontend. Run the row that matches the platform in `litespec.project.json`.

    | Platform | Structure step | UI step |
    |:---|:---|:---|
    | `react` | Declare the application tree and mirror the backend use case path (`litespec/frontend/web/structure#use-the-frontend-application-tree`) | Compose each route from one floorplan (`litespec/frontend/web/ui#compose-each-route-from-one-floorplan`) |
    | `svelte` | Declare the application tree and mirror the backend use case path (`litespec/frontend/web/structure#use-the-frontend-application-tree`) | Compose each route from one floorplan (`litespec/frontend/web/ui#compose-each-route-from-one-floorplan`) |
    | `blazor` | Declare the client solution tree and organize features by module and use case (`litespec/frontend/blazor/structure#use-the-client-solution-tree`) | No UI contract step; Blazor stays outside the controlled UI contract |

16. Deliver one complete slice. Ship source, tests, contracts, and operating evidence for one use case. This satisfies `litespec/core/system#deliver-one-complete-use-case`.
17. Add the operating records. Write the limits and runbooks, add deployment, backup, restore, and rollback, and configure the pipeline gates. This satisfies `litespec/quality/operations#start-the-stack-with-one-local-command` and `litespec/quality/ci#run-applicable-gates-on-every-pull-request`.
18. Build the model. Run `litespec model build` from the consumer root. It writes `model.json` with the computed links between records, code, screens, and tests.
19. Check the model. Run `litespec model check`. It exits 1 on any unresolved citation, missing link, or unproved case. Fix every finding before continuing.
20. Render the generated regions. Run `litespec model render`. Commit what it wrote.
21. Run the remaining validators. Run `litespec consumer` and `litespec ui` from the consumer root. Both exit `0` on a clean tree. This satisfies `litespec/core/release#run-consistency-checks`.

## What you built

- A consumer repository at small size that the model check accepts.
- One implemented use case with records, code, tests, and generated contracts.
- The command pages for the checks are [Validate Consumer](../tools/consumer.md) and [Validate Controlled UI](../tools/ui.md). See the [command index](../tools/README.md).
