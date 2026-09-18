# Model Context Protocol

## Intent

An MCP server presents the product's API to an LLM client running outside the product. This page states how the server presents itself, describes its tools, and words its refusals.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer selects `mcp` when the product ships a Model Context Protocol server that an LLM client starts on a user's own machine. An internal integration the product itself hosts does not select it.

## Baseline relationship

The API provisions own the behavior the server calls, and the frontend provisions own nothing here because the server renders no pages. This extension adds presentation rules for the LLM consumer and replaces no baseline rule.

## Agent Summary {#agent-summary}

- Pass server instructions at initialize. (standards/rule/ext-mcp.pass-server-instructions-at-initialize)
- Title each tool imperatively and describe it declaratively. (standards/rule/ext-mcp.write-one-tool-description-for-one-decision)
- State parameter polarity and side effects in descriptions. (standards/rule/ext-mcp.write-one-tool-description-for-one-decision)
- State the refusing side on each refusal. (standards/rule/ext-mcp.state-the-refusing-side-on-each-refusal)

## Standards

### Pass server instructions at initialize (standards/rule/ext-mcp.pass-server-instructions-at-initialize)

**Requirement:** An MCP server MUST pass an `instructions` value at initialize stating its transport, its audience, its write surface, and its refusal behavior.

**Rationale:** The MCP specification's initialize response carries server instructions, and a client loads them once per session while it loads each tool description per call. Scope and policy therefore belong at the server level, because they hold for every call. Tool mechanics stay in the tool descriptions, where the model reads them at the moment it chooses.

**Example:** "Runs over stdio, one organizer per process, against the hosted API. Reads cover the organizer's own data, and three tools create or change records. A policy refusal returns the problem code, and a write needing a person's confirmation refuses until they give it."

### Write one tool description for one decision (standards/rule/ext-mcp.write-one-tool-description-for-one-decision)

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

## Conventions

### State the refusing side on each refusal (standards/rule/ext-mcp.state-the-refusing-side-on-each-refusal)

**Default:** Prefix an input-shape refusal with `Needs:`, a human-confirmation refusal with `Needs confirmation:`, and a server-side refusal with `Refused:`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The prefix tells the model which side of the boundary failed. It then repairs its own input, asks the person, or reports the server, without retrying a refusal a retry cannot satisfy.

## Dependencies

No library is selected by this extension. An MCP SDK needs a decision and a manifest pin.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/ext-mcp.pass-server-instructions-at-initialize | static | The server construction passes a non-empty `instructions` value to the MCP server. |
| standards/rule/ext-mcp.write-one-tool-description-for-one-decision | static | `apps/mcp/src/tools/` review finds imperative titles, declarative descriptions, positive booleans, and stated side effects. |
| standards/rule/ext-mcp.state-the-refusing-side-on-each-refusal | inspection | Refusal strings carry the three prefixes or record a local replacement. |
