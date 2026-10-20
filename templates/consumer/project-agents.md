# <Project> agent context

Read `litespec/AGENTS.md`, then `litespec.project.json`, before changing the project. (litespec/rule/core-agent.select-task-context)

Query the model builder for the records a task touches, with their links and the tool-read code and test state, instead of reading page lists. (litespec/rule/core-agent.select-task-context, litespec/rule/core-scope.record-selected-extensions)

`litespec model query <record-id>` returns one record with its links. Query the record before changing behavior it describes, and query again when a link leads further. (litespec/rule/core-agent.select-task-context)

A project Exception record overrides a Standard only when it names the provision ID, with reason and review date. (litespec/rule/core-agent.apply-guidance-precedence)

An explicit project convention can replace a baseline Convention when local documentation cites its ID. (litespec/rule/core-agent.apply-guidance-precedence)

Read `docs/product/brief.md` and the affected product topics before changing behavior that touches price, money, markets, customers, or terms. (litespec/rule/core-product.load-product-intent-before-commercial-work)

Draft a product decision for any changed business choice, and leave its approval to the accountable person. Research outside `docs/` is source material, never authority. (litespec/rule/core-product.name-the-person-who-approved-a-decision, litespec/rule/core-product.treat-generated-research-as-source-material)

## Project commands

Run the backend gates for every changed API boundary. (litespec/rule/core-release.run-boundary-selected-checks)

```bash
dotnet build <api-solution> --configuration Release
dotnet test <api-solution> --configuration Release --no-build
```

Run the root pnpm gates for every changed frontend in `litespec.project.json`. (litespec/rule/core-release.run-boundary-selected-checks)

Run metadata and model checks for each changed record, source, test, or generated contract. Query the model again after the change, and report what stays red. (litespec/rule/core-system.update-records-with-behavior, litespec/rule/core-authoring.declare-structured-specification-metadata)

Run `litespec model render` after adding, approving, or retiring a record, so generated regions match the model. (litespec/rule/core-system.update-records-with-behavior)

Report every skipped check with its reason. (litespec/rule/core-release.report-verification-exactly)

Compose each route from one floorplan in the frontend `DESIGN.md`, or name the decision behind a freestyle route. (litespec/rule/frontend-ui.compose-each-route-from-one-floorplan, litespec/rule/frontend-ui.record-a-freestyle-route)

Cite every path of every use case a route calls in a test title, or record an exclusion with its reach. (litespec/rule/frontend-ui.prove-every-result-a-route-calls)

Run `litespec ui` after changing UI configuration, vocabulary, the design contract, source locks, CSS, or primitives. Run the route suite after changing a route. (litespec/rule/frontend-ui.prove-ui-behavior-and-appearance, litespec/rule/frontend-ui.check-every-route-in-a-browser)

Record an exception before selecting another visual system or component base. (litespec/rule/frontend-ui.select-one-visual-authority)
