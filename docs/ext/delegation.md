# Cross-Tenant Delegation

## Intent

Delegation lets one actor act for another across tenants, such as an assistant acting for an organizer or support acting under a customer grant. This page states the grant each side declares, how the pairing stays bounded in permission and time, and how the trail and scenarios prove it. A project selects it when any use case reaches across tenants through delegation, so no cross-tenant act runs on one side's word alone.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer selects `delegation` when an actor in one tenant acts for a party in another tenant. Each such use case declares `tenant: cross` in its access, as `litespec/core/access#scope-every-grant-to-its-tenant-reach` states.

## Baseline Relationship

This extension replaces no baseline provision. The [access page](../core/access.md) requires the declared grant on both sides, and this extension states the fields each side carries.

This extension switches on no optional record type.

## Standards

### Declare Delegation Grants on Both Sides

**Statement:** A delegation MUST declare the delegator grant naming who may be acted for and the acting grant naming who may act.

**Rationale:** Delegation lets one actor act for another, so a grant on one side alone leaves the other side unreviewed. The delegator grant names the role at its scope that may be acted for and the permissions open to delegation; the acting grant names the role permitted to act and the pairing it acts under. `litespec/core/access#grant-across-tenants-only-through-declared-delegation` requires both declarations.

**Example:** An assistant acts for an organizer only where the organizer delegation grant and the assistant acting grant both name the pairing.

### Scope Delegated Grants to Named Permissions

**Statement:** A delegation MUST name the permissions it delegates, never all permissions.

**Rationale:** A delegation open to every permission hands the whole tenant to the acting party: one pairing meant for reading reports also moves money. Naming each delegated permission bounds the pairing to what the delegator intended, and each new permission needs its own review before the acting party holds it.

### Bound Every Delegation in Time

**Statement:** A delegation MUST carry an expiry or a revocation path.

**Rationale:** A grant with no end outlives its reason: the assistant keeps acting after the engagement ends, and nobody reopens the pairing because no date asks for it. An expiry ends the pairing on its date, and a revocation path ends it on demand. Either way, the end is stated beside the grant instead of left for an incident to discover.

### Audit Actions Taken Under Delegation

**Statement:** An action that an actor takes under delegation MUST record the delegation grant used.

**Rationale:** An acted-for action without a marker reads exactly like the delegator's own action, so a reviewer cannot tell who actually acted. Recording the delegation grant used puts the acting party on the record beside the delegator. `litespec/ext/audit#record-delegated-administrative-access` states the same marker for administrative grants.

### Prove Delegated Calls with Scenarios

**Statement:** A delegation MUST prove an allowed call and a refused call with scenarios.

**Rationale:** A pairing described only in prose hides where its grant stops: the allowed assistant and the uninvited one read alike. A scenario walking an allowed call and a scenario ending a call without delegation in the derived forbidden result pin the boundary as checked facts. `litespec/core/access#prove-hierarchies-derived-trust-and-delegation-with-scenarios` requires both scenarios.

### Review Delegated Cross-Tenant Grants as Tier 1

**Statement:** A use case acting under delegation across tenants MUST carry tier 1 review through the security queue.

**Rationale:** A delegated call reads or writes data that belongs to another tenant, which is the highest access risk a grant carries. Tier 1 review through the security queue puts that grant before the security reviewer separately from reviewed status, so no delegated cross-tenant act ships on a developer sample alone. `litespec/core/access#review-cross-tenant-access-as-tier-1` routes every cross-tenant use case there.

## Conventions

### Record Delegation Grants with Roles

**Default:** Record each delegation grant on the role page that holds it.

**Replacement:** A consumer records a delegation-records convention naming where its delegation grants live.

**Rationale:** The grant qualifies the role: the delegator role names who may be acted for, and the acting role names who may act. Recording each grant on its role page keeps the pairing beside the permission it extends, so a review reads both at once.

## Dependencies

Packages: None.

Related extensions: `tenancy` for tenant isolation, `audit` for the delegation marker.

Guides: None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/delegation#declare-delegation-grants-on-both-sides | guidance | Each delegation declares a delegator grant naming who may be acted for and an acting grant naming who may act. |
| litespec/ext/delegation#scope-delegated-grants-to-named-permissions | guidance | Each delegation names its delegated permissions, with none open to all permissions. |
| litespec/ext/delegation#bound-every-delegation-in-time | guidance | Each delegation carries an expiry or a revocation path. |
| litespec/ext/delegation#audit-actions-taken-under-delegation | guidance | Each action under delegation records the delegation grant used. |
| litespec/ext/delegation#prove-delegated-calls-with-scenarios | guidance | Each delegation proves an allowed call and a refused call with scenarios. |
| litespec/ext/delegation#review-delegated-cross-tenant-grants-as-tier-1 | guidance | Each use case acting under delegation across tenants carries tier 1 review through the security queue. |
| litespec/ext/delegation#record-delegation-grants-with-roles | guidance | Each delegation grant sits on its role page, or the delegation-records convention names where grants live. |
