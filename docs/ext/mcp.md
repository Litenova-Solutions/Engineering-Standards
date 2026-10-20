# Model Context Protocol

## Intent

An MCP server presents the product's API to an LLM client running outside the product. The API provisions own the behavior the server calls. This page states how the server presents itself, describes its tools, and words its refusals.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer selects `mcp` when the product ships a Model Context Protocol server that an LLM client starts on a user's own machine. An internal integration the product itself hosts does not select it. The server acts as an authenticated user or API key against the public API and holds no permission of its own. Authentication and authorization stay with the baseline API and security pages.

## Baseline relationship

This extension replaces no baseline rule.

This extension switches on no record type.

## Standards

### Pass server instructions at initialize

**Requirement:** An MCP server MUST pass an `instructions` value at initialize stating its transport, its audience, its write surface, and its refusal behavior.

**Rationale:** The MCP specification's initialize response carries server instructions, and a client loads them once per session while it loads each tool description per call. Scope and policy therefore belong at the server level, because they hold for every call. Tool mechanics stay in the tool descriptions, where the model reads them at the moment it chooses.

**Example:** "Runs over stdio, one account per process, against the hosted API. Reads cover the account's own data, and three tools create or change records. A policy refusal returns the problem code, and a write needing a person's confirmation refuses until they give it."

### Write one tool description for one decision

**Requirement:** An MCP tool MUST title its action imperatively, describe its behavior declaratively, use positive parameter polarity, and state its side effects.

**Rationale:** The [MCP specification](https://modelcontextprotocol.io/specification/2025-06-18) carries the title and description to the model, which plans from them. An imperative title states the action. A declarative description states what happens rather than commanding the caller, so the server's guidance and the model's own plan do not compete. A positive boolean such as `paused` avoids the inverse polarity a model answers wrongly. A stated side effect survives the review that asks what the call did.

**Example:**

```json
{
  "name": "pause_webhook_deliveries",
  "description": "Pauses or resumes delivery to one subscription. Events published while paused are dropped, not queued.",
  "input": {
    "type": "object",
    "properties": {
      "paused": { "type": "boolean", "description": "True to pause, false to resume." }
    }
  }
}
```

### Scope each tool to named use cases

**Requirement:** Each tool MUST name the use cases and permissions it reaches.

**Rationale:** A stated scope lets a reviewer tell which product behavior the tool exposes.

### Confirm every writing tool

**Requirement:** Every tool that writes MUST refuse until the person confirms the write.

**Rationale:** A person approves each write before the model performs it.

### Exclude secrets and personal data

**Requirement:** Tool descriptions and logs MUST exclude secrets and personal data from every field they carry.

**Rationale:** Descriptions reach the model and logs reach operators, and neither needs values that grant access or identify a person.

### State the distribution and update path

**Requirement:** The server documentation MUST state how a user installs and updates the server.

**Rationale:** A locally installed server needs a stated path from release to machine.

## Conventions

### State the refusing side on each refusal

**Default:** Prefix an input-shape refusal with `Needs:`, a human-confirmation refusal with `Needs confirmation:`, and a server-side refusal with `Refused:`.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** The prefix tells the model which side of the boundary failed. It then repairs its own input, asks the person, or reports the server, without retrying a refusal a retry cannot satisfy.

## Dependencies

No library is selected by this extension. An MCP SDK needs a decision; the manifest already pins `@modelcontextprotocol/server`.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/mcp#pass-server-instructions-at-initialize | guidance | Does the server pass a non-empty instructions value at initialize? |
| litespec/ext/mcp#write-one-tool-description-for-one-decision | guidance | Does {path}, the declared tools directory, show imperative titles and stated side effects? |
| litespec/ext/mcp#scope-each-tool-to-named-use-cases | guidance | Does each tool name the use cases and permissions it reaches? |
| litespec/ext/mcp#confirm-every-writing-tool | guidance | Does every writing tool refuse until the person confirms? |
| litespec/ext/mcp#exclude-secrets-and-personal-data | guidance | Are descriptions and logs free of secrets and personal data? |
| litespec/ext/mcp#state-the-distribution-and-update-path | guidance | Does the documentation state install and update steps? |
| litespec/ext/mcp#state-the-refusing-side-on-each-refusal | guidance | Do refusals carry the three prefixes or record an Exception? |
