# Model Context Protocol

## Intent

A Model Context Protocol server lets a large language model (LLM) client on the user's own machine call the product's public API. This page states how that server presents itself, describes its tools, and words its refusals; the API rules own the behavior the server calls. A project selects it when it ships such a server, so the model plans from accurate tool descriptions and every write waits for the person's confirmation.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The project selects `mcp` when it ships a Model Context Protocol server: a local process that an LLM client starts on the user's own machine so the model can call the product's public API. An integration the product hosts itself does not select it. The server calls the API as one authenticated user or API key and holds no permission of its own, so authentication and authorization stay with the baseline API and security pages.

## Baseline relationship

This extension replaces no baseline rule.

This extension switches on no record type. Authentication, authorization, and permissions stay with the baseline API and security pages, so selection adds no record type.

## Standards

### Pass server instructions at initialize

**Requirement:** An MCP server MUST pass an `instructions` value at initialize stating its transport, its audience, its write surface, and its refusal behavior.

**Rationale:** The MCP initialize response carries server instructions that the client loads once per session, while each tool description loads per call. Scope and policy therefore belong at the server level, where they hold for every call: the transport, the audience, the write surface, and the refusal behavior. Tool mechanics stay in the tool descriptions, which the model reads when it chooses a tool. Without server-level instructions, each tool repeats the policy differently or omits it, and the model plans calls the server refuses.

**Example:** "Runs over stdio, one account per process, against the hosted API. Reads cover the account's own data, and three tools create or change records. A policy refusal returns the problem code, and a write needing a person's confirmation refuses until they give it."

### Write one tool description for one decision

**Requirement:** An MCP tool MUST title its action imperatively, describe its behavior declaratively, use positive parameter polarity, and state its side effects.

**Rationale:** The [MCP specification](https://modelcontextprotocol.io/specification/2025-06-18) carries the title and description to the model, and the model plans its calls from those words. An imperative title names the action, while a declarative description states what happens instead of commanding the caller, so the server's guidance and the model's own plan do not compete. A positive boolean such as `paused` avoids the inverse polarity that a model answers wrongly, and a stated side effect answers the reviewer who asks what the call changed.

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

**Rationale:** Each tool opens product behavior to a model acting for the user, so the team names exactly which use cases and permissions each tool reaches. Without the named scope, a reviewer cannot tell whether a tool reads one account or writes across many, and a broad tool ships without the scrutiny its reach needs.

### Confirm every writing tool

**Requirement:** Every tool that writes MUST refuse until the person confirms the write.

**Rationale:** A model misreads intent the way any agent does: it can pause the wrong subscription or delete the record the user asked about. Refusing each write until the person confirms keeps the person behind every change while leaving reads fast. Without confirmation, one misunderstood sentence becomes a changed record nobody approved.

### Exclude secrets and personal data

**Requirement:** Tool descriptions and logs MUST exclude secrets and personal data from every field they carry.

**Rationale:** Tool descriptions travel to the model on every call, and logs persist for operators long after the call ends. A secret copied into either grants access to whoever reads it next, and personal data in either spreads beyond the consent that collected it. Descriptions and logs name the fields without carrying the values.

### State the distribution and update path

**Requirement:** The server documentation MUST state how a user installs and updates the server.

**Rationale:** The server runs on the user's machine, not on the product's servers, so no deployment pipeline updates it. Without documented install and update steps, users run stale servers with stale tool descriptions, and a security fix waits on users who never learn it exists.

## Conventions

### State the refusing side on each refusal

**Default:** Prefix an input-shape refusal with `Needs:`, a human-confirmation refusal with `Needs confirmation:`, and a server-side refusal with `Refused:`.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** A refusal without a source sends the model guessing: it rephrases input the server rejected on policy, or it waits for a person when its own input was malformed. The prefix names the failing side, so the model repairs its own input after `Needs:`, asks the person after `Needs confirmation:`, and reports the server after `Refused:`, instead of retrying a refusal no retry satisfies.

## Dependencies

This extension selects no library. A team that adds an MCP SDK records a Decision for it. The manifest pins `@modelcontextprotocol/server`.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/mcp#pass-server-instructions-at-initialize | guidance | Does the server pass a non-empty instructions value at initialize? |
| litespec/ext/mcp#write-one-tool-description-for-one-decision | guidance | Does `{path}`, the declared tools directory, show imperative titles and stated side effects? |
| litespec/ext/mcp#scope-each-tool-to-named-use-cases | guidance | Does each tool name the use cases and permissions it reaches? |
| litespec/ext/mcp#confirm-every-writing-tool | guidance | Does every writing tool refuse until the person confirms? |
| litespec/ext/mcp#exclude-secrets-and-personal-data | guidance | Are descriptions and logs free of secrets and personal data? |
| litespec/ext/mcp#state-the-distribution-and-update-path | guidance | Does the documentation state install and update steps? |
| litespec/ext/mcp#state-the-refusing-side-on-each-refusal | guidance | Do refusals carry the three prefixes or record an Exception? |
