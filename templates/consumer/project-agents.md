# <Project> agent context

Read `standards/AGENTS.md`, then `standards.project.json`, before changing the project. (standards/rule/core-agent.select-task-context)

Query the model builder for the records a task touches, with their links and the tool-read code and test state, instead of reading page lists. (standards/rule/core-agent.select-task-context, standards/rule/core-scope.record-selected-extensions)

`dotnet run --project standards/tools/model -- query <record-id>` returns one record with its links. Query the record before changing behavior it describes, and query again when a link leads further. (standards/rule/core-agent.select-task-context)

A project Exception record overrides a Standard only when it names the provision ID, with reason and review date. (standards/rule/core-agent.apply-guidance-precedence)

An explicit project convention can replace a baseline Convention when local documentation cites its ID. (standards/rule/core-agent.apply-guidance-precedence)

Read `docs/product/brief.md` and the affected product topics before changing behavior that touches price, money, markets, customers, or terms. (standards/rule/core-product.load-product-intent-before-commercial-work)

Draft a product decision for any changed business choice, and leave its approval to the accountable person. Research outside `docs/` is source material, never authority. (standards/rule/core-product.name-the-person-who-approved-a-decision, standards/rule/core-product.treat-generated-research-as-source-material)

## Project commands

Run the backend gates for every changed API boundary. (standards/rule/core-release.run-boundary-selected-checks)

```bash
dotnet build <api-solution> --configuration Release
dotnet test <api-solution> --configuration Release --no-build
```

Run the root pnpm gates for every changed frontend in `standards.project.json`. (standards/rule/core-release.run-boundary-selected-checks)

Run metadata and model checks for each changed record, source, test, or generated contract. Query the model again after the change, and report what stays red. (standards/rule/core-system.update-records-with-behavior, standards/rule/core-authoring.declare-structured-specification-metadata)

Run `dotnet run --project standards/tools/model -- render` after adding, approving, or retiring a record, so generated regions match the model. (standards/rule/core-system.update-records-with-behavior)

Report every skipped check with its reason. (standards/rule/core-release.report-verification-exactly)

Compose each route from one floorplan in the frontend `DESIGN.md`, or name the decision behind a freestyle route. (standards/rule/frontend-ui.compose-each-route-from-one-floorplan, standards/rule/frontend-ui.record-a-freestyle-route)

Cite every path of every use case a route calls in a test title, or record an exclusion with its reach. (standards/rule/frontend-ui.prove-every-result-a-route-calls)

Run `node standards/tools/validate-ui.mjs` after changing UI configuration, vocabulary, the design contract, source locks, CSS, or primitives. Run the route suite after changing a route. (standards/rule/frontend-ui.prove-ui-behavior-and-appearance, standards/rule/frontend-ui.check-every-route-in-a-browser)

Record an exception before selecting another visual system or component base. (standards/rule/frontend-ui.select-one-visual-authority)
