# Executable BDD Acceptance Tests

## Intent

This extension adds Reqnroll scenarios when product, domain, engineering, and testing discussions rely on the same critical cross-layer examples. The use-case specification remains the authored behavior source.

## Activation

Enable `acceptance-bdd` when one or more critical examples must be reviewed in business language and executed through a public system boundary. Routine unit behavior does not activate it.

This extension adds `apps/api/tests/{ProjectName}.Acceptance.Tests/` and the Reqnroll packages pinned in the manifest. It does not replace a baseline rule.

## Agent Summary {#agent-summary}

- Keep acceptance criteria and examples in the use-case specification.
- Use feature files as executable views of selected examples.
- Tag every scenario with one or more acceptance IDs.
- Exercise HTTP or another declared public boundary.
- Isolate scenario identity, authentication, requests, responses, and database state.

## Standards

### Use BDD for shared critical examples (EXT.BDD.ADOPT.001)

Create a scenario only when its business-language form improves shared understanding of cross-layer behavior. Do not duplicate every unit or validation case in Gherkin.

### Tag scenarios with acceptance IDs (EXT.BDD.TRACE.001)

Every scenario includes one or more `@AC-MODULE-USE-CASE-NN` tags. The use-case document owns the criterion text and examples.

### Test through public behavior (EXT.BDD.BOUNDARY.001)

Steps call the HTTP API or another declared public boundary. Assert responses, later reads, durable events, audit records, or other observable outcomes.

Direct database assertions are allowed only for a documented durable boundary such as an outbox record.

### Isolate scenario state (EXT.BDD.STATE.001)

Each scenario owns its identifiers, actor context, requests, responses, and expected state. Reset database state between scenarios and do not depend on scenario order.

### Keep step code at public boundaries (EXT.BDD.STEPS.001)

Step definitions translate business phrases into typed test-driver calls. They do not resolve repositories, command handlers, sessions, or the production service provider. Hooks own scenario reset and actor setup, always await asynchronous work, and preserve the original failure when cleanup also fails.

## Conventions

Use module folders under Acceptance.Tests. Keep step definitions narrow and reusable only within the same business vocabulary. A scenario context object stores values for one scenario and does not become a service locator. Tag the small pull-request subset with `@critical`; acceptance-ID tags remain separate.

## Dependencies

- `Reqnroll`
- `Reqnroll.xUnit`

## Verification

- Run scenarios tagged `critical` on each pull request.
- Run the complete acceptance project when domain specs, Application, WebApi, Infrastructure, schema, or OpenAPI changes.
- Search every scenario for acceptance tags.
- Confirm scenarios are independent under random order.
- Confirm step assemblies have no reference to Infrastructure or production internals.
