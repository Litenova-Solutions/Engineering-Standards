---
{
  "id": "recipe.acceptance-bdd",
  "kind": "recipe",
  "normative": true,
  "appliesTo": ["testing", "use-case.authoring"],
  "recipes": ["acceptance-bdd"]
}
---
# Executable BDD Acceptance Tests

## RECIPE.BDD.ADOPT.001 - Use BDD for critical shared examples

Enable Reqnroll when product, domain, and engineering discussions use the same cross-layer scenarios. Do not add feature files as a second specification for routine unit behavior.

## RECIPE.BDD.TRACE.001 - Tag scenarios with acceptance IDs

Every scenario has one or more `@AC-FEATURE-USECASE-NN` tags. The use-case document remains the source for the criterion and examples.

## RECIPE.BDD.BOUNDARY.001 - Test through public behavior

Steps call the HTTP API or another declared public boundary. Assert observable responses, later reads, durable events, or audit records. Avoid direct database assertions except for a documented durable boundary such as the outbox.

## RECIPE.BDD.STATE.001 - Isolate scenario state

Each scenario owns its IDs, authentication context, requests, and responses. Reset database state between scenarios and do not rely on scenario execution order.

## RECIPE.BDD.GATES.001 - Split critical and complete runs

Run scenarios tagged `critical` on every pull request. Run the complete acceptance project when domain docs, Application, WebApi, Infrastructure, schema, or OpenAPI changes.

