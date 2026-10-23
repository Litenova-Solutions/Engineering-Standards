# AI Assistance

## Intent

Some queries are answered through a model that picks tools to gather facts and compose the answer. This page states the closed tool set, the structure-only scenarios, the pinned stub, and the provenance those queries carry. A project selects it for each query a model mediates.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`.

A project selects `ai` for a query when a model mediates the answer by calling tools. A query answered by fixed code does not select it, even when a model wrote that code.

## Baseline Relationship

This extension replaces no baseline provision. It switches on no record type: it adds model mediation detail to query records.

A model-mediated query names its closed `tools` set, proves itself with structure-only scenarios, pins a deterministic stub in Proof, and returns provenance with its output.

## Standards

### Name the Closed Tool Set

**Statement:** A model-mediated query MUST name the closed set of tools the model calls.

**Rationale:** A model with an open tool set invents tools, reaches past its grant, and surprises every review. A closed set names exactly what the model touches, so the grant, the tests, and the audit all read the same list.

**Example:** The support answer query names `orders.lookup` and `docs.search` as its only tools.

### Refuse Unknown Tools

**Statement:** A model-mediated query MUST refuse a run that calls a tool outside its closed set.

**Rationale:** Models drift: a prompt tweak or a version change can add a call nobody declared. Refusing the run at the first unknown tool keeps the closed set closed in production, not just on paper.

**Example:** A run that calls `billing.refund` outside its set is refused before the call leaves the product.

### Assert Structure and Never Wording

**Statement:** A scenario for a model-mediated query MUST assert the output structure and never its wording.

**Rationale:** Model wording shifts between runs: the same facts arrive in different sentences. A scenario asserting exact words fails on a paraphrase, while a scenario asserting structure, fields, codes, and cited sources passes on every true answer.

**Example:** The scenario asserts the answer carries `orderId` and one cited source, not the sentence around them.

### Pin a Deterministic Stub in Proof

**Statement:** Proof for a model-mediated query MUST run against a deterministic stub pinned by version.

**Rationale:** A live model answers differently each run, so a test against it proves nothing twice. A deterministic stub pinned by version answers the same way every run, so Proof checks the product's handling instead of the model's mood.

**Example:** The support answer tests run against `stub-answers v4`, which returns one fixed tool trace per prompt.

### Record Provenance in the Output

**Statement:** A model-mediated query MUST return provenance naming the model, the tools called, and the sources read.

**Rationale:** An answer without provenance cannot be checked: nobody knows which model wrote it, which tools fed it, or which sources back it. Provenance names the three, so every answer carries its own audit trail.

**Example:** The answer returns `model: support-7, tools: [orders.lookup], sources: [order-8841]`.

### Bound Tool Calls per Query

**Statement:** A model-mediated query MUST bound how many tool calls one run makes.

**Rationale:** A model in a loop calls tools until the budget or the patience runs out. A bound on calls per run caps the cost and the latency up front, so one curious run cannot spend the month's budget.

**Example:** The support answer query allows eight tool calls per run and refuses the ninth.

## Conventions

### Record Every Model Run

**Default:** Each model run writes its prompt hash, the tools called, and the outcome to the run log.

**Replacement:** A project names its model-run evidence in its AI documentation.

**Rationale:** Production answers need after-the-fact review: what was asked, what the model touched, and what came back. The run log holds the three without storing full prompts.

## Dependencies

Packages: None.

Related extensions: `mcp` for the server shape when the product also serves tools to outside models.

Guides: None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/ai#name-the-closed-tool-set | guidance | The mediated queries list their closed tools with no call outside the list. |
| litespec/ext/ai#refuse-unknown-tools | guidance | The mediated query tests refuse runs calling tools outside the closed set. |
| litespec/ext/ai#assert-structure-and-never-wording | guidance | The mediated query scenarios assert fields, codes, and cited sources with no exact-word assertions. |
| litespec/ext/ai#pin-a-deterministic-stub-in-proof | guidance | The mediated query tests run against the pinned stub version with no live model calls. |
| litespec/ext/ai#record-provenance-in-the-output | guidance | The mediated query answers carry model, tools called, and sources read. |
| litespec/ext/ai#bound-tool-calls-per-query | guidance | The mediated queries state a per-run tool-call bound enforced in the run tests. |
| litespec/ext/ai#record-every-model-run | guidance | The run log holds prompt hash, tools called, and outcome per run, or the AI documentation names other evidence. |
