# {Extension Title}

## Intent

State the optional capability and its boundary.

## Activation

Activation scope: `{local|project}`.

Applicable specification kinds: `<type>`.

Activate this extension when one exact current condition applies.

## Baseline Relationship

This extension replaces `{litespec/page#state-one-action}`, or states that it replaces no baseline provision. It switches on `<optional type>`, or states that it switches on none.

## Standards

### State One Extension Action

**Statement:** The activated extension MUST perform one testable action.

**Rationale:** Explain the extension-specific constraint.

**Example:** Show one compliant extension artifact or behavior.

## Conventions

### Use One Extension Default

**Default:** State one replaceable extension default.

**Replacement:** Name the local convention that replaces this default, and where the project records it.

## Dependencies

Packages: `{package}` or `None.`

Related extensions: `{extension}` or `None.`

Guides: `{guide}` or `None.`

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| {litespec/page#state-one-extension-action} | checkable | `litespec validate` reports this provision satisfied on the page that carries it. |
| {litespec/page#use-one-extension-default} | guidance | Does the page carry the default or its named local replacement? |
