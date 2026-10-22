# Access

## Intent

Who may act in the product and how they reach it: actors, roles, permissions, entry points, and external systems. Product owners approve these records above the review line, and stacks enforce them in authorization code below it. The [model page](model.md) states the shared record rules, and the [domain page](domain.md) states the use cases that need permissions.

## Concepts

### The Permission Chain

Access follows one chain from actor to use case: an actor holds a role at a scope, the role allows permissions, and the use case needs permissions. The chain answers every access question in one place: which actor held which role at which scope, which permission the role allowed, and which use case needed it. The [domain page](domain.md) states how a use case names the permissions it needs.

The chain is role-based access control: permissions attach to roles, never to actors directly, and scopes bound each hold to one reach. The [lineage page](../learn/lineage.md) names the practice LiteSpec borrows.

### Actors, Roles, and Scopes

An actor is one party that acts in the product. Its kind is person for a human acting directly, organization for a company or group acting as one party, or system for software acting on its own.

A role is one named set of permissions granted together. Its scope is a kebab-case level naming the reach of the grant, such as platform, tenant, or self. An actor records each grant in `holds` as the role with the scope at which it holds it, so the same role grants different reach in different places.

### Permissions

A permission is one allowed action. The project keeps every permission in one shared list, and each permission states in `meaning` what it allows in one sentence. Roles allow permissions from that list, and use cases need them, so the list is the one vocabulary both sides share.

### Entry Points

An entry point is one way people or systems reach the product. Its kind is app for an interactive application, api for a public interface, cli for a command line, job for background work without a request, or reaction for behavior an event causes. Use cases name the entry points that reach them, so every operation shows how callers arrive.

### External Systems

An external system is one system outside the bounded context that the product exchanges messages with, such as a payment provider or a text gateway. It acts inside the product as one actor, named in `actor`, so everything it does stays attributable to a party the access records know. It names each message it sends in `sends` and each message it receives in `receives`, and it states in `failure` what the product does when the system fails, such as queueing notices until the gateway answers.

### Homes and Summaries

Each access record lives in one home, and the [model page](model.md) states the shared identifier and ownership rules.

| Type | Stored as | Home |
|:---|:---|:---|
| `actor` | page | `docs/domain/actors/<name>.md` |
| `role` | page | `docs/domain/roles/<name>.md` |
| `permission` | entry | `docs/domain/permissions.md` |
| `entry-point` | entry | `docs/domain/entry-points.md` |
| `external-system` | page | `docs/domain/systems/<name>.md` |

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

**Rationale:** The allows list is the middle of the chain: it joins the actors that hold the role to the use cases that need its permissions. A role that names no permission grants nothing, so every use case its holders run breaks the chain at the middle link.

**Example:** `role/employee` allows `permission/submit-expense`, which the submit use case needs.

### State Every Permission with Its Meaning

**Statement:** A permission MUST state what it allows in `meaning`.

**Rationale:** The meaning is the one sentence a reviewer reads to decide whether the grant fits the role: a name alone carries no boundary. Two permissions with the same name pattern and no meanings drift into overlapping grants that no audit can separate.

**Example:** `permission/submit-expense` carries "Submit an expense for approval."

### Name Every Entry Point with Its Kind

**Statement:** An entry point MUST name its kind in `kind`.

**Rationale:** The kind tells a reviewer how callers arrive: an app serves people, an api serves callers over a boundary, a cli serves operators, and a job or reaction runs without a request. Without the kind, interactive operations and background work look alike.

**Example:** The web shop carries `app`, and the nightly export carries `job`.

### Name the Actor for Every External System

**Statement:** An external system MUST name the actor it acts as in `actor`.

**Rationale:** The actor link attributes everything the system does to a party the access records know: journeys, holds, and permissions all start from actors. A system with no actor acts in the product as nobody, and its messages enter use cases with no stated party behind them.

**Example:** The text gateway names `actor/reader` as its actor.

### Name What an External System Sends

**Statement:** An external system MUST name every message it sends in `sends`.

**Rationale:** The sends list bounds what flows out of the product: each entry names one message the product hands to the outside system. Without the list, a new outbound message ships as an unreviewed dependency on behavior the product does not control.

**Example:** The text gateway names "Overdue notices" in `sends`.

### Name What an External System Receives

**Statement:** An external system MUST name every message it receives in `receives`.

**Rationale:** The receives list bounds what flows into the product: each entry names one message the product accepts from the outside system. Without the list, a new inbound message arrives as unreviewed input to behavior the reviewers approved without it.

**Example:** The text gateway names "Delivery receipts" in `receives`.

### State the Failure Behavior of Every External System

**Statement:** An external system MUST state the product behavior when the system fails in `failure`.

**Rationale:** Outside systems fail on their own schedule: the record states what the product does until they answer, such as queueing work or refusing with a named result. Without the stated behavior, each caller invents its own fallback, and one outage produces as many behaviors as callers.

**Example:** The text gateway states "Notices queue until the gateway answers." in `failure`.

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
| litespec/core/access#keep-access-records-in-their-homes | guidance | Actor, role, and external system pages sit under `docs/domain/actors/`, `docs/domain/roles/`, and `docs/domain/systems/`; permission and entry point entries sit in `docs/domain/permissions.md` and `docs/domain/entry-points.md`. |
| litespec/core/access#name-every-actor-with-its-kind | checkable | `litespec model check` reports `record-shape` for an actor without `kind` and `invalid-field` for a kind outside person, organization, and system. |
| litespec/core/access#record-every-role-hold-with-its-scope | guidance | Each actor page under `docs/domain/actors/` names in `holds` every role the actor acts through, with the scope of each grant. |
| litespec/core/access#scope-every-role | checkable | `litespec model check` reports `record-shape` for a role without `scope` and `invalid-field` for a scope outside kebab-case form. |
| litespec/core/access#grant-permissions-through-roles | checkable | `litespec model check` reports `record-shape` for a role with no `allows` entry. |
| litespec/core/access#state-every-permission-with-its-meaning | checkable | `litespec model check` reports `record-shape` for a permission without `meaning` in `docs/domain/permissions.md`. |
| litespec/core/access#name-every-entry-point-with-its-kind | checkable | `litespec model check` reports `record-shape` for an entry point without `kind` and `invalid-field` for a kind outside app, api, cli, job, and reaction. |
| litespec/core/access#name-the-actor-for-every-external-system | checkable | `litespec model check` reports `record-shape` for an external system without `actor`. |
| litespec/core/access#name-what-an-external-system-sends | guidance | Each page under `docs/domain/systems/` names in `sends` every message the product hands to that system. |
| litespec/core/access#name-what-an-external-system-receives | guidance | Each page under `docs/domain/systems/` names in `receives` every message the product accepts from that system. |
| litespec/core/access#state-the-failure-behavior-of-every-external-system | guidance | Each page under `docs/domain/systems/` states in `failure` what the product does until the system answers. |
| litespec/core/access#write-a-summary-on-every-actor-and-role-page | checkable | `litespec consumer` fails an actor or role page without an H2 `Summary`. |
| litespec/core/access#write-a-summary-on-every-external-system-page | checkable | `litespec consumer` fails an external system page without an H2 `Summary`. |
| litespec/core/access#keep-permission-and-entry-point-lists-to-entries | guidance | `docs/domain/permissions.md` and `docs/domain/entry-points.md` hold entries with no H2 body section. |
| litespec/core/access#use-three-conventional-scope-levels | guidance | Role pages under `docs/domain/roles/` carry `platform`, `tenant`, or `self` in `scope`, or the project names its own levels there. |
