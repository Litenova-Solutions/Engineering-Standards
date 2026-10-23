# Access

## Intent

Who may act in the product and how they reach it: actors, roles, permissions, the access each use case declares, entry points, and external systems. Developers and agents write these records in Behavior, and reviewers read them in the Behavior diff with the security queue. The [behavior page](behavior.md) states the use cases that carry access, and the [model page](model.md) states the shared record rules.

## Concepts

### The Permission Chain

Access follows one chain from actor to use case: an actor holds a role at a scope, the role allows permissions, and the use case declares the grant it checks. The chain answers every access question in one place: which actor held which role at which scope, which permission the role allowed, and which use case declared it. The chain is role-based access control: permissions attach to roles, never to actors directly, and scopes bound each hold to one reach.

### Actors, Roles, and Scopes

An actor is one party that acts in the product. Its kind is person for a human acting directly, organization for a company or group acting as one party, or system for software acting on its own.

A role is one named set of permissions granted together. Its scope is a kebab-case level naming the reach of the grant, such as platform, tenant, or self. An actor records each grant in `holds` as the role with the scope at which it holds it, so the same role grants different reach in different places.

### Permissions

A permission is one allowed action. The project keeps every permission in one shared list, and each permission states in `meaning` what it allows in one sentence. Roles allow permissions from that list, and use cases cite them in their grants, so the list is the one vocabulary both sides share.

### The Access Field

Each use case declares `access` with three parts: how the caller proves identity, what grant the call checks, and which tenant reach the call has. The `auth` list names one or more of `session`, `token`, `device`, `link`, `app`, `anonymous`, or `system`. The `grant` is a permission such as `permission/manage-listing`, a self grant such as `self(permission/read-profile)`, or the open grants `anonymous` and `system`. A self grant allows the permission only on records the caller owns. The `tenant` scope is `own` for work inside the caller tenant, `cross` for work reaching across tenants, `public` for work with no tenant boundary, or `none` for work that touches no tenant data. The [behavior page](behavior.md) states the use case fields around access.

### Generic Refusals

Refusals that follow from access and input call for no written result. A call without the grant ends in the derived forbidden result, and a call with input that breaks its rules ends in the derived invalid input result. Scenarios may point at these derived results, and no record writes them.

### Tenant Scope and Cross Tenant Access

`own` keeps the call inside the caller tenant, `public` opens it beyond tenant boundaries, `none` states the call touches no tenant data, and `cross` reaches across tenants. A call that reads or writes another tenant carries the highest access risk, so `cross` makes its use case tier 1. The Behavior diff lists every `cross` change in the security queue, where the security reviewer reads it separately from reviewed status.

### Entitlements

An entitlement is a grant that depends on what the caller bought or configured, such as a plan limit or a listing setting. The use case cites the setting or plan behind the grant, so a reviewer sees why one tenant is allowed what another is refused. The cited setting states its range and setter, as the [behavior page](behavior.md) states for settings.

### Hierarchies, Derived Trust, and Delegation

Hierarchies, derived trust, and delegation are patterns built from the same three access parts, not extra grant forms. A hierarchy nests roles so a senior role allows what its junior roles allow, derived trust lets one checked fact stand for another within one call, and delegation lets one actor act for another. Each pattern is proved by scenarios that show who is allowed and who is refused. Grants that cross tenants through delegation use the tenancy extension, which states the declared grant each side carries.

### Entry Points

An entry point is one way people or systems reach the product. Its kind is `browser` for an interactive web application, `api` for a public interface, `webhook` for inbound events, `device` for a managed device, `cli` for a command line, `mcp` for a model context channel, `served-content` for a static file, `reaction` for behavior an event causes, or `job` for background work without a request. A `served-content` entry point carries `path`, `contentType`, `cacheControl`, `versioning`, and `fulfills`, so a static script or a legal text is served content rather than a use case. Use cases name the entry points that reach them in `reachedThrough`, so every operation shows how callers arrive. The protocol detail for devices lives in the devices extension.

### External Systems

An external system is one system outside the bounded context that the product exchanges messages with, such as a payment provider or a text gateway. It acts inside the product as one actor, named in `actor`, so everything it does stays attributable to a party the access records know. It declares each operation the product may call in `operations`, with its direction, timeout, retry, response, and cache behavior, so every outside call is a declared edge. It declares in `erasure` how personal data it holds is erased, or why erasure there is impossible with the Intent decision that accepts the limit.

### Homes and Summaries

Each access record lives in one home, and the [model page](model.md) states the shared identifier and ownership rules.

| Type | Stored as | Home |
|:---|:---|:---|
| `actor` | page | The Intent actors home |
| `role` | page | The Behavior roles home |
| `permission` | entry | The Behavior permissions list |
| `entry-point` | entry | The Behavior entry points list |
| `external-system` | page | The Behavior systems home |

An actor, role, or external system page carries a Summary section stating what the record is for. The permission and entry point lists carry entries only, with no body section.

## Standards

### Keep Access Records in Their Homes

**Statement:** An access record MUST live in the home its type names.

**Rationale:** One home per type tells a reader where to open a record and tells the book where to render it. A record kept anywhere else looks written while readers open the home and find nothing there.

### Name Every Actor with Its Kind

**Statement:** An actor MUST name its kind in `kind`.

**Rationale:** The kind tells a reviewer whether a human, an organization, or software stands behind the actor, which decides who answers for what it does. Without the kind, a reviewer assigns responsibility without knowing whether a person or software stands behind the actor.

**Example:** An employee actor carries `person`, and a payout service carries `system`.

### Record Every Role Hold with Its Scope

**Statement:** An actor that acts through a role MUST record the hold in `holds`.

**Rationale:** The hold is the grant: without it, the actor and the role sit on separate pages with no stated connection, and no reviewer can tell what the actor is allowed to do. The scope bounds each grant, so one role grants platform reach to one actor and self reach to another.

**Example:**

```json
"holds": [{ "role": "role/employee", "scope": "self" }]
```

### Scope Every Role

**Statement:** A role MUST name its scope in `scope`.

**Rationale:** The scope bounds what the role reaches: the same permission allows platform-wide action in one grant and own-record action in another. Without a named scope, every grant reads as product-wide, and the narrowest grant gets the widest reach.

**Example:** A scope of `team` bounds the role to one team, while `platform` bounds it to the whole product.

### Grant Permissions Through Roles

**Statement:** A role MUST name the permissions it allows in `allows`.

**Rationale:** The allows list is the middle of the chain: it joins the actors that hold the role to the use cases that cite its permissions in their grants. A role that names no permission grants nothing, so every use case its holders run breaks the chain at the middle link.

**Example:** `role/employee` allows `permission/submit-expense`, which the submit use case cites in its grant.

### State Every Permission with Its Meaning

**Statement:** A permission MUST state what it allows in `meaning`.

**Rationale:** The meaning is the one sentence a reviewer reads to decide whether the grant fits the role: a name alone carries no boundary. Two permissions with the same name pattern and no meanings drift into overlapping grants that no audit can separate.

**Example:** `permission/submit-expense` carries "Submit an expense for approval."

### Declare Access on Every Use Case

**Statement:** Each use case MUST declare its access with auth, grant, and tenant scope.

**Rationale:** The three parts answer the three access questions together: how the caller proves identity, what grant the call checks, and which tenant reach the call has. A use case without one part leaves that question to code, and two implementations of the same page enforce different boundaries.

**Example:**

```json
"access": { "auth": ["session"], "grant": "permission/manage-listing", "tenant": "own" }
```

### Authenticate Every Caller Through a Declared Auth Kind

**Statement:** Each access declaration MUST name its auth kinds from session, token, device, link, app, anonymous, and system.

**Rationale:** The auth kind tells a reviewer how the caller proves identity before the grant is checked: a session for a signed-in person, a device for a managed scanner, a link for a bearer link, and system for work with no caller. Without a declared kind, anonymous calls and authenticated calls look alike, and a reviewer cannot tell which identity the grant was checked against.

**Example:** A buyer checkout names `session`, a door scanner names `device`, and a nightly job names `system`.

### Grant Every Use Case Through a Declared Grant

**Statement:** Each access declaration MUST name its grant as a permission, a self grant, anonymous, or system.

**Rationale:** The grant is the check the call passes: a permission for role-held action, a self grant for action on records the caller owns, anonymous for open calls, and system for work with no caller. A grant outside these four forms gives the checker no stated check to enforce, and each caller invents its own test.

**Example:** `permission/manage-listing` for staff work, `self(permission/read-profile)` for a buyer reading their own profile, `anonymous` for a public catalog, and `system` for a door scan handler acting for the device.

### Scope Every Grant to Its Tenant Reach

**Statement:** Each access declaration MUST name its tenant scope as own, cross, public, or none.

**Rationale:** The tenant scope bounds which tenant data the call may touch: own stays inside the caller tenant, cross reaches across tenants, public works beyond tenant boundaries, and none touches no tenant data. Without the scope, a read inside one tenant and a read across all tenants look the same, and the widest reach hides in the narrowest grant.

**Example:** An organizer report names `own`, a staff search across organizers names `cross`, a public catalog names `public`, and a health check names `none`.

### Derive Generic Refusals from Access and Input

**Statement:** A use case MUST NOT write a result for a refusal that access and input already imply.

**Rationale:** Forbidden and invalid input follow from the grant and the input rules on every use case, so written copies would repeat the same two endings on every page. Deriving them keeps each page to the refusals its own rules add, while scenarios still point at the derived results where the story calls for them.

**Example:** A call without the grant ends in `result/<name>.forbidden`, and a call with input that breaks its rules ends in `result/<name>.invalid-input`, with neither written as a record.

### Review Cross Tenant Access as Tier 1

**Statement:** A use case with cross tenant scope MUST carry tier 1 review through the security queue.

**Rationale:** Work that reaches across tenants can read or write data that belongs to another tenant, which is the highest access risk a grant carries. Tier 1 review through the security queue puts that grant before the security reviewer separately from reviewed status, so no cross grant ships on a developer sample alone.

**Example:** A staff search with `tenant: cross` appears in the security queue of the Behavior diff until the security reviewer accepts it.

### Cite the Setting or Plan Behind Every Entitlement

**Statement:** A grant that depends on a setting or a plan MUST cite that setting or plan.

**Rationale:** An entitlement allows one tenant what another is refused, so the grant alone reads as unequal treatment. Citing the setting or plan shows the commercial or configured reason behind the difference, and gives the reviewer the range and setter to judge it against.

**Example:** A return queue command cites `setting/sales.max-open-returns`, so a fifth return is refused by the organizer setting rather than by role.

### Prove Hierarchies Derived Trust and Delegation with Scenarios

**Statement:** A hierarchy, derived trust, or delegation pattern MUST prove its allowed and refused calls with scenarios.

**Rationale:** Patterns compose the same access parts into wider reach, so prose alone cannot show where the wider grant stops. Scenarios that walk an allowed call and a refused call pin the boundary as checked facts, and the checker confirms each one through the public boundary.

**Example:** A delegation story shows an assistant acting for an organizer succeeding, and the same assistant acting without delegation ending in the derived forbidden result.

### Grant Across Tenants Only Through Declared Delegation

**Statement:** A grant that acts across tenants through delegation MUST declare its delegation grant on both sides.

**Rationale:** Delegation lets one actor act for another, so a grant on one side alone leaves the other side unreviewed. Declaring the grant on both sides shows who may delegate and who may be acted for, and the tenancy extension states the fields each side carries.

**Example:** An assistant acts for an organizer only where the organizer delegation grant and the assistant acting grant both name the pairing.

### Name Every Entry Point with Its Kind

**Statement:** An entry point MUST name its kind in `kind`.

**Rationale:** The kind tells a reviewer how callers arrive: a browser serves people, an api serves callers over a boundary, a webhook receives inbound events, a device serves a managed scanner, a cli serves operators, an mcp channel serves a model, served content serves a static file, and a reaction or job runs without a request. Without the kind, interactive operations and background work look alike.

**Example:** The web shop carries `browser`, a scanner handshake carries `device`, and the nightly export carries `job`.

### Describe Every Served Content Entry Point with Its Serving Fields

**Statement:** A served content entry point MUST carry path, contentType, cacheControl, versioning, and fulfills.

**Rationale:** Served content is a file the product hands out, not behavior it runs, so the serving fields are the whole contract: where it lives, what it is, how long it caches, how it versions, and which requirement it carries. Without them, a legal text or a static script ships as an unreviewed file with no stated owner or freshness.

**Example:** A terms text carries its path, `text/html`, its cache window, its version rule, and the requirement it fulfills.

### Name the Actor for Every External System

**Statement:** An external system MUST name the actor it acts as in `actor`.

**Rationale:** The actor link attributes everything the system does to a party the access records know: journeys, holds, and permissions all start from actors. A system with no actor acts in the product as nobody, and its messages enter use cases with no stated party behind them.

**Example:** The text gateway names `actor/reader` as its actor.

### Declare Every Operation on Every External System

**Statement:** An external system MUST declare every operation the product may call in `operations`.

**Rationale:** Each operation is one edge to outside behavior the product does not control, with its direction, timeout, retry, response, and cache behavior. Without the declared list, a new outside call ships as an unreviewed dependency, and the security queue has no stated edge to review.

**Example:** A payment provider declares a `refund` operation with its timeout, retry count, and response shape, which the refund effect cites as `calls`.

### Declare Erasure for Every External System

**Statement:** An external system MUST declare how personal data it holds is erased in `erasure`.

**Rationale:** Personal data sent outside stays outside unless some operation or event removes it, so the erasure declaration states the call, the integration event, or why removal is impossible. An impossible erasure cites the Intent decision that accepts the limit, so the gap reads as an accepted decision rather than a missed edge.

**Example:** A charge store declares `impossible (charge records belong to the processor)` with the decision that accepts the limit, plus the sentence buyers see.

### Write a Summary on Every Actor and Role Page

**Statement:** An actor or role page MUST carry a Summary section.

**Rationale:** The Summary states in plain sentences who the party is and what the grant is for, which the fields alone do not say. A reviewer meets the story first and the fields after, so the grant reads as a decision rather than a row.

### Write a Summary on Every External System Page

**Statement:** An external system page MUST carry a Summary section.

**Rationale:** The Summary states in plain sentences what the outside system does for the product, which the message lists alone do not say. A reviewer meets the relationship first and the messages after, so the dependency reads as a decision rather than a row.

### Keep Permission and Entry Point Lists to Entries

**Statement:** A permission list or entry point list page MUST NOT carry a body section.

**Rationale:** The lists hold entries only: each permission and entry point is one row with its fields, and prose around them would restate the meanings the entries already carry. A list with no body section stays readable as a list even as entries grow.

## Conventions

### Use Three Conventional Scope Levels

**Default:** Use `platform`, `tenant`, and `self` as role scopes.

**Replacement:** A project names its own scope levels in its role records.

**Rationale:** Three levels cover the grants most products need: product-wide administration, tenant-wide operation, and action on one's own records. A project with different boundaries names its own levels, and every role still carries exactly one scope.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/access#keep-access-records-in-their-homes | guidance | Which access records sit outside the homes their type names? Look at the actor, role, permission, entry point, and external system homes. |
| litespec/core/access#name-every-actor-with-its-kind | checkable | `litespec model check` reports `record-shape` for an actor without `kind` and `invalid-field` for a kind outside person, organization, and system. |
| litespec/core/access#record-every-role-hold-with-its-scope | guidance | Which actor holds lack a role or a scope? Look at `holds` on each actor page. |
| litespec/core/access#scope-every-role | checkable | `litespec model check` reports `record-shape` for a role without `scope` and `invalid-field` for a scope outside kebab-case form. |
| litespec/core/access#grant-permissions-through-roles | checkable | `litespec model check` reports `record-shape` for a role with no `allows` entry. |
| litespec/core/access#state-every-permission-with-its-meaning | checkable | `litespec model check` reports `record-shape` for a permission without `meaning`. |
| litespec/core/access#declare-access-on-every-use-case | checkable | `litespec model check` reports `record-shape` for a use case without `access`, `auth`, `grant`, or `tenant`. |
| litespec/core/access#authenticate-every-caller-through-a-declared-auth-kind | checkable | `litespec model check` reports `invalid-field` for an `auth` kind outside session, token, device, link, app, anonymous, and system. |
| litespec/core/access#grant-every-use-case-through-a-declared-grant | checkable | `litespec model check` reports `invalid-field` for a grant outside permission, self, anonymous, and system, and `reference-unresolved` for a permission no record defines. |
| litespec/core/access#scope-every-grant-to-its-tenant-reach | checkable | `litespec model check` reports `invalid-field` for a tenant scope outside own, cross, public, and none. |
| litespec/core/access#derive-generic-refusals-from-access-and-input | guidance | Which use case pages write a forbidden or invalid input result? Look at the results on each use case page beside the derived names. |
| litespec/core/access#review-cross-tenant-access-as-tier-1 | guidance | Which cross grants shipped without security review? Look at the security queue in the Behavior diff. |
| litespec/core/access#cite-the-setting-or-plan-behind-every-entitlement | guidance | Which entitlement grants lack a cited setting or plan? Look at the grant beside the settings each use case cites. |
| litespec/core/access#prove-hierarchies-derived-trust-and-delegation-with-scenarios | guidance | Which hierarchy, trust, or delegation patterns lack an allowed and a refused scenario? Look at the scenarios on the use cases that carry the pattern. |
| litespec/core/access#grant-across-tenants-only-through-declared-delegation | guidance | Which cross tenant delegation grants lack a declared grant on both sides? Look at the delegation grants the tenancy extension declares. |
| litespec/core/access#name-every-entry-point-with-its-kind | checkable | `litespec model check` reports `record-shape` for an entry point without `kind` and `invalid-field` for a kind outside browser, api, webhook, device, cli, mcp, served-content, reaction, and job. |
| litespec/core/access#describe-every-served-content-entry-point-with-its-serving-fields | checkable | `litespec model check` reports `record-shape` for a served content entry point without path, contentType, cacheControl, versioning, or fulfills. |
| litespec/core/access#name-the-actor-for-every-external-system | checkable | `litespec model check` reports `record-shape` for an external system without `actor`. |
| litespec/core/access#declare-every-operation-on-every-external-system | checkable | `litespec model check` reports `record-shape` for an external system without `operations` and `reference-unresolved` for a `calls` edge naming no declared operation. |
| litespec/core/access#declare-erasure-for-every-external-system | checkable | `litespec model check` reports `record-shape` for an external system without `erasure` and `reference-unresolved` for an impossible erasure without an Intent decision. |
| litespec/core/access#write-a-summary-on-every-actor-and-role-page | checkable | `litespec consumer` fails an actor or role page without an H2 `Summary`. |
| litespec/core/access#write-a-summary-on-every-external-system-page | checkable | `litespec consumer` fails an external system page without an H2 `Summary`. |
| litespec/core/access#keep-permission-and-entry-point-lists-to-entries | guidance | Which permission or entry point lists carry a body section? Look at the permission and entry point lists for H2 sections. |
| litespec/core/access#use-three-conventional-scope-levels | guidance | Which role scopes fall outside platform, tenant, and self without a recorded project convention? Look at `scope` on each role page. |
