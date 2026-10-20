# {Extension Title}

## Intent

State the optional capability and its boundary.

## Activation

Activation scope: `{local|project}`.

Applicable specification kinds: `<type>`.

Activate this extension when one exact current condition applies.

## Baseline relationship

This extension replaces `{litespec/page#state-one-action}`, or states that it replaces no baseline provision. It switches on `<optional type>`, or states that it switches on none.

## Standards

### State one extension action

**Requirement:** The activated extension MUST perform one testable action.

**Rationale:** Explain the extension-specific constraint.

**Example:** Show one compliant extension artifact or behavior.

## Conventions

### Use one extension default

**Default:** State one replaceable extension default.

**Replacement:** Name the local convention or decision that can replace this default.

## Dependencies

None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| {litespec/page#state-one-extension-action} | checkable | `litespec validate` reports this provision satisfied on the page that carries it. |
| {litespec/page#use-one-extension-default} | guidance | Does the page carry the default or its named local replacement? |
