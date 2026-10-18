# {Topic Title}

## Intent

State the page scope and the boundary it owns.

## Agent Summary {#agent-summary}

- State one high-risk projection and cite its canonical provision. ({standards/rule/page.state-one-action})

## Standards

### State one action ({standards/rule/page.state-one-action})

**Requirement:** The named actor MUST perform one testable action.

**Rationale:** Explain a specific constraint or decision when it helps implementation.

**Example:** Show one compliant artifact or behavior when the provision requires an example.

## Conventions

### Use one default ({standards/rule/page.use-one-default})

**Default:** State one replaceable default.

**Replacement:** Name the local convention or decision that can replace this default.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| {standards/rule/page.state-one-action} | checkable | `node tools/validate-standards.mjs` reports this provision satisfied on the page that carries it. |
| {standards/rule/page.use-one-default} | guidance | Does the page carry the default or its named local replacement? |
