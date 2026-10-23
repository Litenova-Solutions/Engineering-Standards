# Plans and Entitlements

## Intent

A product that sells tiers promises each plan a set of entitlements: the behavior the plan unlocks and the amounts it allows. This page states how the product records its plans, how behavior and amounts resolve to what the acting plan entitles, and how the product answers a run past its plan. A project selects it when customers buy different tiers, so a plan change moves one record instead of scattered checks.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The project selects `plans` when it sells more than one tier, or gates behavior by entitlement within one offering. A single offering with no gated behavior does not select it: without tiers there is nothing to entitle.

## Baseline Relationship

This extension replaces no baseline provision. It sits beside the [multitenancy extension](tenancy.md): tenancy isolates each tenant's data, while plans state what each tenant's tier allows.

It switches on no record type: plans live as business requirements, gated behavior resolves through permissions, and gated amounts resolve through settings, which the [intent page](../core/intent.md), the [access page](../core/access.md), and the [behavior page](../core/behavior.md) state.

## Standards

### Record Each Plan Once

**Statement:** A consumer selecting `plans` MUST record each plan once with its name, price, billing period, and entitlements.

**Rationale:** A plan named in two places disagrees the day one updates without the other: the price page promises what the gate refuses. One record per plan holds the name, the price, the billing period, and the entitlements, so a plan change is one edit with one owner.

**Example:** The monthly plan names its fee, its month period, and the use cases and amounts it unlocks.

### Gate Behavior Through Permissions

**Statement:** A gated use case MUST declare a permission that only an entitled plan grants.

**Rationale:** The permission chain already joins actors to use cases: the actor holds a role, the role allows a permission, and the use case declares it in its grant, as the [access page](../core/access.md) states. A plan grants its permissions through that chain, so entitlement is a grant like any other instead of a second access system beside the first.

### Bound Plan Amounts in Settings

**Statement:** Each amount a plan allows MUST live as a setting the gated use case cites.

**Rationale:** An allowance buried in code changes only with a release, and each plan's number hides in a different branch. A setting states the range, the setter, and the bound behavior, and the gated use case cites it, so raising a tier edits the setting instead of the code. `litespec/core/access#cite-the-setting-or-plan-behind-every-entitlement` requires the citation, and `litespec/core/behavior#hold-every-setting-default-to-a-requirement` holds a commercial default to its requirement.

**Example:** The return-queue cap lives as `setting/sales.max-open-returns` with an organizer-set value, and the return command cites it.

### Refuse Runs Beyond Entitlement

**Statement:** A use case run past its plan MUST end in the refusal result the use case names for that run.

**Rationale:** A run past its plan is a refusal like any other: it ends in the named refusal result with its stable code, as the [behavior page](../core/behavior.md) states, so callers branch on one code instead of guessing from an error page. The code stays stable while prices and allowances move.

### Resolve the Acting Plan from Trusted Context

**Statement:** The product MUST resolve the acting plan from verified subscription state, never from caller input.

**Rationale:** The plan decides what runs, so only verified subscription state resolves it: a plan the caller supplies itself is a choice, not a fact. The [multitenancy extension](tenancy.md) treats tenant identity the same way.

### Hide Unentitled Actions on Screens

**Statement:** A screen MUST NOT offer an action the acting plan does not entitle.

**Rationale:** The server refuses what the plan does not entitle, and the screen reflects that refusal before the call: a button for an unentitled action invites a failure the product already decided. Hiding or disabling the action shows each plan only what it may run.

## Conventions

### Resolve the Acting Plan in the Authorization Pipeline

**Default:** Resolve the acting plan where the pipeline authorizes the use case.

**Replacement:** A consumer records a plan-resolution convention naming where its use cases find the acting plan.

**Rationale:** Authorization already runs in the pipeline with the actor and the target in hand. Resolving the plan there gives every use case the same answer from the same verified state, instead of each handler querying subscriptions its own way.

### Record Plan Prices as Business Requirement Values

**Default:** Record each plan price as values on its business requirement.

**Replacement:** A consumer records a plan-price convention naming where its plan prices live.

**Rationale:** A business requirement carries its values with effective dates, as the [intent page](../core/intent.md) states, so each price shows when it holds. Recording each plan price there keeps the commercial fact with the commitment it prices.

## Dependencies

Packages: None.

Related extensions: The `tenancy` extension owns tenant isolation when tenants buy different tiers. The `audit` extension owns tamper-resistant evidence when an entitlement decision needs a record.

Guides: None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/plans#record-each-plan-once | guidance | The requirement pages under `docs/product/` hold one record per plan with its price, billing period, and entitlements. |
| litespec/ext/plans#gate-behavior-through-permissions | guidance | Each gated use case declares a permission in its grant that only an entitled plan grants. |
| litespec/ext/plans#bound-plan-amounts-in-settings | guidance | Each plan allowance lives as a setting the gated use case cites. |
| litespec/ext/plans#refuse-runs-beyond-entitlement | guidance | A run past its plan ends in the named refusal result in the use case tests. |
| litespec/ext/plans#resolve-the-acting-plan-from-trusted-context | guidance | The acting plan resolves from verified subscription state, with no plan taken from caller input in code. |
| litespec/ext/plans#hide-unentitled-actions-on-screens | guidance | Each screen shows only actions the acting plan entitles. |
| litespec/ext/plans#resolve-the-acting-plan-in-the-authorization-pipeline | guidance | The authorization pipeline resolves the acting plan, or the plan-resolution convention names where use cases find it. |
| litespec/ext/plans#record-plan-prices-as-business-requirement-values | guidance | Each plan price sits as values on its business requirement, or the plan-price convention names where prices live. |
