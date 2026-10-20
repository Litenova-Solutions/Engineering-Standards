# Get Started

## Purpose

This tutorial starts a consumer repository in the small profile. At the end the repository holds its configuration, its first records, one implemented use case, and a passing model check. Where a step differs by stack, run the row that matches the stacks in `litespec.project.json`.

This guide carries no provision. Each step cites the provisions it satisfies.

## Prerequisites

- Read the [agent protocol](../core/agent.md), the [authoring standard](../core/authoring.md), and [scope](../core/scope.md).
- Read the [extension catalog](../ext/README.md) to learn which capabilities stay inactive at the start.
- Install the .NET SDK and Node.js releases that `litespec.manifest.json` pins.
- Decide which stacks the product ships: `dotnet` plus one platform per frontend.

## Lesson

1. Pin the LiteSpec release. Add the LiteSpec repository as a submodule or another pinned dependency. This satisfies `litespec/rule/workspace-structure.use-the-canonical-root-tree`.
2. Copy the project configuration. Copy `litespec.project.json` and `project-agents.md` from the [template index](../../templates/consumer/README.md). Fill every placeholder and name every owner. Set `size` to `small`, list `dotnet` plus one platform per frontend under `stacks`, and set `reviewedLiteSpecVersion` to the pinned release. This satisfies `litespec/rule/core-scope.select-a-size-profile-and-stacks`.
3. Select extensions only when their criteria already hold. Write each selection in the object form with its criterion and review date. This satisfies `litespec/rule/core-scope.select-conditional-extensions-explicitly` and `litespec/rule/core-scope.record-selected-extensions`.
4. Create the toolchain configuration from the manifest pins. Add the SDK floor, the shared build settings, the central NuGet versions, the tool manifest, and the JavaScript toolchain pin. This satisfies `litespec/rule/workspace-config.set-the-sdk-floor-at-the-workspace-root`, `litespec/rule/workspace-config.centralize-net-build-settings`, `litespec/rule/workspace-config.centralize-nuget-versions`, `litespec/rule/workspace-config.commit-the-tool-manifest`, and `litespec/rule/workspace-config.pin-the-javascript-toolchain`.
5. Add only the packages the manifest already pins. Record each new package approval explicitly. This satisfies `litespec/rule/workspace-dependencies.pin-every-dependency-centrally` and `litespec/rule/workspace-dependencies.approve-new-packages-explicitly`.
6. Create the API solution. Add the five application projects, the AppHost, the ServiceDefaults, and the Architecture and Integration test projects. Add the Acceptance project when the product needs executable specifications. This satisfies `litespec/rule/backend-architecture.use-five-application-projects` and `litespec/rule/backend-testing.keep-the-test-projects-the-size-profile-requires`.
7. Apply the file, type, and folder names. Match each C# file to its primary type and each namespace to its folder. This satisfies `litespec/rule/workspace-naming.match-c-files-and-primary-types` and `litespec/rule/workspace-naming.keep-namespaces-aligned-with-folders`.
8. Write the product brief. Copy `product-brief.md` from the template index to `docs/product/brief.md`. State the boundary, the refusals, and the audience. This satisfies `litespec/rule/core-product.keep-business-intent-under-product`.
9. Write one topic page with its requirements. Copy `product-topic.md` from the template index. State each commitment as one requirement with its kind. This satisfies `litespec/rule/core-product.state-each-topic-in-one-page-shape` and `litespec/rule/core-product.identify-every-requirement`.
10. State which constraints apply. Write one constraint record per outside rule, or record that none applies, and set `constraints.answered` to true. The `litespec.project.json` template defines the fields.
11. Record the first decision. Copy `decision.md` from the template index. Name the options, the decider, and what would change the choice. This satisfies `litespec/rule/core-product.record-each-product-choice-as-a-decision` and `litespec/rule/core-product.trace-every-choice-to-a-decision`.
12. Write the people records. Add one actor page per party, one role page per grantable set, and the permission entries on the permissions page. Each use case later names the permissions it needs. The `actor.md`, `role.md`, and `permission-list.md` templates define the fields.
13. Write the module and its business records. Follow [Model a domain module](model-domain.md) for the module, the rules, the use cases, the events, and the permissions. This satisfies `litespec/rule/core-system.group-language-and-use-cases-by-module`.
14. Implement one use case. Move the transition into a business method, keep the handler narrow, commit once, expose one endpoint, and authorize the target. This satisfies `litespec/rule/backend-domain.express-transitions-through-business-methods`, `litespec/rule/backend-application.keep-command-handlers-narrow`, `litespec/rule/backend-persistence.commit-once-in-the-command-pipeline`, `litespec/rule/backend-api.use-one-endpoint-per-operation`, and `litespec/rule/quality-security.authorize-each-target-resource`.
15. Declare each frontend. Run the row that matches the platform in `litespec.project.json`.

    | Platform | Structure step | UI step |
    |:---|:---|:---|
    | `react` | Declare the application tree and mirror the backend use case path (`litespec/rule/frontend-structure.use-the-frontend-application-tree`) | Compose each route from one floorplan (`litespec/rule/frontend-ui.compose-each-route-from-one-floorplan`) |
    | `svelte` | Declare the application tree and mirror the backend use case path (`litespec/rule/frontend-structure.use-the-frontend-application-tree`) | Compose each route from one floorplan (`litespec/rule/frontend-ui.compose-each-route-from-one-floorplan`) |
    | `blazor-web` | Declare the client solution tree and organize features by module and use case (`litespec/rule/blazor-structure.use-the-client-solution-tree`) | No UI contract step; Blazor stays outside the controlled UI contract |

16. Deliver one complete slice. Ship source, tests, contracts, and operating evidence for one use case. This satisfies `litespec/rule/core-system.deliver-one-complete-use-case`.
17. Add the operating records. Write the limits and runbooks, add deployment, backup, restore, and rollback, and configure the pipeline gates. This satisfies `litespec/rule/quality-operations.start-the-stack-with-one-local-command` and `litespec/rule/quality-ci.run-applicable-gates-on-every-pull-request`.
18. Build the model. Run `dotnet run --project litespec/tools/model -- build` from the consumer root. It writes `model.json` with the computed links between records, code, screens, and tests.
19. Check the model. Run `dotnet run --project litespec/tools/model -- check`. It exits 1 on any unresolved citation, missing link, or unproved case. Fix every finding before continuing.
20. Render the generated regions. Run `dotnet run --project litespec/tools/model -- render`. Commit what it wrote.
21. Run the remaining validators. Run `node litespec/tools/validate-consumer.mjs` and `node litespec/tools/validate-ui.mjs` from the consumer root. Both exit 0 on a clean tree. This satisfies `litespec/rule/core-release.run-consistency-checks`.

## What you built

- A consumer repository in the small profile that the model check accepts.
- One implemented use case with records, code, tests, and generated contracts.
- The command pages for the checks are [validate-consumer](../tools/validate-consumer.md) and [validate-ui](../tools/validate-ui.md).
