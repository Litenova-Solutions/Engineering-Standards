# Glossary

## Code Terms

These terms name the code shapes that fulfill the specification.

### Aggregate Root

The single type through which outside code changes an aggregate.

Source: DDD.

### AppHost

The local orchestrator that starts every application and its dependencies together for development.

Source: .NET Aspire.

### Architecture Layer

One project boundary in the backend: Domain, Application.Abstractions, Application, Infrastructure, or WebApi.

Source: LiteSpec.

### Authorization Policy

One rule deciding whether an actor is allowed to perform an action on a target.

Source: RBAC.

### Central Package Management

One central file pinning every dependency version in the workspace.

Source: NuGet.

### Child Entity

One entity inside an aggregate, changed only through its root.

Source: DDD.

### Domain Event

One immutable record that describes a fact completed inside the bounded context.

Source: DDD.

### Domain Repository

One boundary interface that loads and stages complete aggregates.

Source: DDD. Rejected: repository used alone, which hides whether the boundary loads a whole aggregate or a row.

### Entity

One object defined by its identity rather than by its values.

Source: DDD.

### Input Validation

Checks on the shape of a command or query, run before business behavior runs.

Source: LiteSpec.

### Lockfile

The committed file recording the exact resolved dependency versions.

Source: the package managers.

### Persistence Constraint

One rule enforced by durable storage, such as uniqueness.

Source: LiteSpec.

### Projection

One read model derived from authoritative facts.

Source: CQRS.

### Read Model

Data shaped for a query, served without loading an aggregate.

Source: CQRS.

### Trace Context

The trace and span identifiers carried across logs and calls.

Source: W3C Trace Context.

### Value Object

One immutable type defined by its values rather than by identity.

Source: DDD.

## Product and Domain Terms

These terms name the records and domain concepts a specification is written in.

### Actor

One person, organization, or system that acts in the product.

Layer: Intent.

Source: RBAC.

### Aggregate

One unit of business state that stays consistent and changes in one step. Its kind is entity, process, or store.

Layer: Behavior.

Source: DDD. Rejected: entity, which in DDD also names a child inside an aggregate.

### Aggregate Data

The named fields of an aggregate, each with a meaning, a data class, and a classification of public, internal, personal, or sensitive.

Layer: Behavior.

Source: LiteSpec.

### Ballot

One named group of open questions the inbox shows together, by a decision id or a short topic slug.

Layer: Intent or Behavior.

Source: LiteSpec.

### Bounded Context

The boundary inside which one domain model and one glossary hold.

Source: DDD.

### Business Requirement

One requirement stating a business rule or value, with effective dates where the value changes over time.

Layer: Intent.

Source: BABOK and IREB.

### Calculation

One rule stating how a value is derived, proven by a scenario with an examples table.

Layer: Behavior.

Source: the Business Rules Group.

### Command

One use case kind that changes business state.

Layer: Behavior.

Source: CQRS.

### Compensation

The per-step undo of a process: the use case that reverses one step, or none with its reason.

Layer: Behavior.

Aliases: undo.

Source: LiteSpec.

### Consistency

The declared write shape of a use case: atomic, per-record, compensated, or best-effort.

Layer: Behavior.

Source: LiteSpec.

### Constraint

One outside rule the product obeys, such as a law or provider terms.

Layer: Intent.

Source: plain English.

### Cross-Aggregate Rule

One rule spanning more than one aggregate.

Layer: Behavior.

Source: LiteSpec.

### Data Class

One named group of aggregate fields sharing one classification and one erasure position.

Layer: Behavior.

Source: LiteSpec.

### Decision

One dated choice with options weighed, evidence cited, and a decider named.

Layer: Intent.

Source: decision records. Rejected: product decision, which hides that every LiteSpec decision is a product decision.

### Deviation

One recorded departure from a provision, with reason and review date.

Layer: Intent or Behavior.

Source: compliance and quality practice. Rejected: override and standards override, which sound permanent where a deviation expires.

### Domain

The real-world knowledge, language, rules, state, and behavior the software models.

Source: DDD.

### Effect

One declared edge from a use case or reaction to a command, a notification, an integration event, or an outside call.

Layer: Behavior.

Source: LiteSpec.

### Entry Point

One way people or systems reach the product.

Layer: Behavior.

Source: LiteSpec.

### Event

One immutable statement that a relevant fact completed. The domain event stays inside the bounded context; a published fact is an integration event.

Layer: Behavior.

Source: DDD.

### Example

One narrative showing behavior on a real occasion, drawn from the example cast.

Source: plain English.

### Example Cast

The people, place, dates, and amounts every example draws on.

Source: plain English.

### Examples Table

One Markdown table of rows a scenario walks through, holding the values the parts argue about.

Source: BDD.

### External System

One outside system the product exchanges messages with.

Layer: Behavior.

Source: LiteSpec.

### Feature

One planned answer to a problem, tracked as planned, shipped, later, or refused.

Layer: Intent.

Source: plain English.

### Freshness

How current a query group is: immediate, snapshot, bounded by a duration, or advisory.

Layer: Behavior.

Source: LiteSpec.

### Functional Requirement

One requirement stating what the product does.

Layer: Intent.

Source: BABOK and IREB.

### Generic Refusal

One refusal the builder derives from access and input instead of a written result: forbidden or invalid input.

Layer: Behavior.

Source: LiteSpec.

### Glossary

The project glossary: each term, its meaning, and its rejected synonyms, held as data in glossary.json.

Source: arc42; DDD's ubiquitous language.

### Goal

One measurable outcome the product serves, carrying no authority.

Layer: Intent.

Source: Volere and product practice.

### Integration Event

One published fact crossing the bounded context, with its direction, payload, and trust.

Layer: Behavior.

Source: DDD.

### Invariant

One rule that holds at every observable moment.

Layer: Behavior.

Source: DDD.

### Job

One scheduled, one-off, or operator run that issues use cases over a scope.

Layer: Behavior.

Source: LiteSpec.

### Journey

The ordered steps by which an actor reaches one goal. Steps name no use case; each serving use case points up with serves.

Layer: Intent.

Source: plain English.

### Known Gap

One known missing piece with an owner and an end date. A draft past its decide-by date that cannot auto-approve is reported as one.

Layer: Intent or Behavior.

Source: LiteSpec.

### Measured Requirement

One quality requirement carrying a measure, a target, and a check that confirms them.

Layer: Intent.

Source: Volere.

### Module

One business area organizing language, records, use cases, and ownership.

Layer: Behavior.

Source: DDD.

### Notification

One person-facing message with its audience, channel, consent, and claims.

Layer: Behavior.

Source: LiteSpec.

### Permission

One allowed action from the shared closed list.

Layer: Behavior.

Source: RBAC.

### Precondition

One rule that holds before a use case runs.

Layer: Behavior.

Source: Design by Contract.

### Problem

One pain or job someone has today.

Layer: Intent.

Source: plain English.

### Process

One multi-step aggregate with steps, exits, a driver, and per-step compensation.

Layer: Behavior.

Source: LiteSpec.

### Product

The software capability offered to users, with its boundary and exclusions.

Layer: Intent.

Source: plain English.

### Quality Requirement

One requirement stating how well the product performs, with a measure and a target.

Layer: Intent.

Source: BABOK and IREB.

### Query

One use case kind that reads a read model without changing business state.

Layer: Behavior.

Source: CQRS.

### Question

One need traveling up from a lower layer, with a decider, a date, and a recommendation.

Layer: Intent or Behavior.

Source: LiteSpec.

### Reaction

One record stating that when a domain event or integration event completes, the product issues one use case or sends one notification.

Layer: Behavior.

Aliases: policy, automation.

Source: Event Storming's policy.

### Record

One written unit of the specification, of a fixed type with fixed links.

Source: LiteSpec.

### Refusal

One named way a use case ends without its effect, listed in precedence order with first match winning.

Layer: Behavior.

Aliases: rejection, error.

Source: LiteSpec.

### Refusal Code

The stable identifier of one refusal, in identifier form.

Layer: Behavior.

Source: LiteSpec.

### Requirement

One behavior the product shows or one guarantee it keeps. An exception names its fallback requirement; a tenant-set value is not an exception.

Layer: Intent.

Source: BABOK and IREB. Rejected: product rule, which clashes with the rule record.

### Research

One outside fact informing a choice.

Layer: Intent.

Source: plain English. Rejected: decision evidence, which states where the fact is used instead of what it is.

### Result

One way a use case ends: success or a named refusal. Refusals read in precedence order; a success may carry codes for recorded outcomes inside it.

Layer: Behavior.

Source: the Result pattern.

### Retention Schedule

The one page mapping each data class to its basis, period, enforcement, and intent.

Layer: Behavior.

Source: the GDPR.

### Role

One named set of permissions granted to an actor at a scope.

Layer: Behavior.

Source: RBAC.

### Rule

One testable commitment stating what holds.

Layer: Behavior.

Source: the Business Rules Group.

### Runbook

The steps to run or recover the product.

Layer: Behavior.

Source: the SRE book.

### Scenario

One testable example proving one result, stated as given, when, then. A scenario may point at a derived result.

Layer: Behavior.

Source: BDD and Gherkin. Rejected: acceptance criterion, which names the review use instead of the example.

### Setting

One named bound or default the product runs within, with its setter and its behavior at the bound.

Layer: Behavior.

Source: LiteSpec.

### Specification

The whole set of records describing one product.

Source: LiteSpec.

### State

One named stage in an aggregate lifecycle, with its meaning.

Layer: Behavior.

Source: LiteSpec.

### Store

One aggregate kind holding state no invariant guards, with its owner named.

Layer: Behavior.

Source: LiteSpec.

### Tenant Scope

The declared reach of a use case grant across tenants: own, cross, public, or none.

Layer: Behavior.

Source: LiteSpec.

### Term

One word with one meaning, labels in each language, and rejected synonyms. Each term carries its layer and its established aliases.

Layer: Intent or Behavior.

Source: arc42; DDD's ubiquitous language.

### Transcription

One Behavior record written from code during adoption, marked source transcribed until its Intent parent is approved.

Layer: Behavior.

Source: LiteSpec.

### Transition

One declared move between aggregate states, made by a use case.

Layer: Behavior.

Source: LiteSpec.

### Trigger

The domain event or integration event that starts a reaction.

Layer: Behavior.

Source: LiteSpec.

### Ubiquitous Language

The shared domain words the team and the model use alike.

Source: DDD.

### Use Case

One command or query with its access, results, and scenarios.

Layer: Behavior.

Source: Cockburn.

## Standard Terms

These terms name the parts of the LiteSpec standard itself.

### Agent

Software that reads task context, plans bounded work, changes the files it is allowed to change, and runs verification.

Source: LiteSpec.

### Agent-Driven Engineering

The operating model where agents do engineering work and people keep decision authority.

Source: LiteSpec.

### Alert Inventory

The list of alerts a product can fire, with the runbook each alert names.

Source: the SRE book.

### Audit Record

One entry stating actor, action, target, outcome, time, origin, and reason.

Source: NIST SP 800-53, control AU-3.

### Audit Trail

The append-only store that holds audit records, kept separate from logs and domain events.

Source: NIST SP 800-53.

### Check Tier

One of the three check depths: G reads records only and always blocks, S reads code through a stack reader, A reports and never blocks.

Source: LiteSpec.

### Command Page

One page that documents one shipped command: its arguments, options, exit codes, and what it runs underneath.

Source: LiteSpec.

### Component Inventory

The list of shipped components published with each release artifact.

Source: supply-chain practice. Rejected: SBOM, which names one format where the inventory names the content.

### Configuration Page

One page holding every setting a reader can change.

Source: LiteSpec.

### Conformance

The claim that a project meets the LiteSpec contract it pins.

Source: the W3C QA Framework.

### Consequences Summary

The generated box on each ballot and book chapter stating new refusals, kept data, and money effects as context.

Source: LiteSpec.

### Controlled Technical Prose

The fixed writing profile that sets the allowed structures, prose bounds, exact terms, and testable provisions.

Source: LiteSpec.

### Convention

One replaceable default for a name, location, file shape, or pattern.

Source: LiteSpec.

### CORS

The browser rule that decides which origins can call the API.

Source: the Fetch standard.

### Current Standards Material

The pinned release taken on its own, without transition or history material.

Source: LiteSpec.

### Derived Artifact

One committed file produced from an authored source, such as generated types.

Source: LiteSpec.

### Effective Status

The status of a record after draft intent above it is taken into account: draft when it, a deciding decision, or a fulfilled requirement is draft.

Source: LiteSpec.

### Engineering System

One connected set of decisions, specifications, standards, verification, and release practices.

Source: LiteSpec.

### Explanation

One page that builds understanding of what LiteSpec is and why it works the way it does.

Source: Diataxis.

### Extension

One conditional standards bundle a project selects when its criterion holds.

Source: LiteSpec.

### How-To Page

One page that solves one stated problem for a reader who already has a working result.

Source: Diataxis.

### Implemented

The computed state of a use case, rule, event, or aggregate state the stack's builder finds code for.

Source: LiteSpec.

### Index

One page routing readers to the pages of its section.

Source: LiteSpec.

### Layer

One depth of documentation, from a first working result down to the mechanism a command runs.

Source: Diataxis.

### LiteSpec

The standards contract for specifying, building, verifying, releasing, and operating software with agents.

Source: LiteSpec.

### LiteSpec Release

One published, pinned, complete standards contract.

Source: LiteSpec.

### Normative

Required of a conforming consumer through an identified provision.

Source: standards practice, as the W3C QA Framework and ISO Directives use it.

### Page

One authored Markdown file under the documentation root.

Source: LiteSpec.

### Page Segment

The part of a provision ID naming its owning page.

Source: LiteSpec.

### Page Style

One page template for prose or record lists.

Source: LiteSpec. Rejected: page class, which reads as a code type.

### Pattern

One named answer to a recurring interface question, with its options and wireframes.

Source: LiteSpec.

### Preset

One ready-made selection of shape, stacks, and frontends for a new project.

Source: LiteSpec.

### Rate Limit

One bound on request frequency at an exposed endpoint.

Source: web API practice.

### Reachable

The computed state of an aggregate state a transition leads into.

Source: LiteSpec.

### Record-Driven Delivery

Delivery where approved records select work and define completion.

Source: LiteSpec.

### Recovery Objectives

The accepted time and data loss bounds for a restore.

Source: the SRE book.

### Reference Page

One page of exact values a reader looks up.

Source: Diataxis.

### Requirement Page

One business-intent page carrying requirement entries.

Source: LiteSpec.

### Roll-Forward

Recovery by deploying a newer version rather than restoring the old one.

Source: release practice.

### Secret Inventory

The list of production secrets, each with its owner, location, and rotation date.

Source: security practice.

### Security Queue

The list in the behavior diff of access widenings, new outside calls, and new personal-data flows awaiting the security reviewer.

Source: LiteSpec.

### Security Reviewer

The named role reviewing tier-1 access and data changes, held in review.securityReviewer.

Source: LiteSpec.

### Semantic Hash

The hash over a record's semantic fields that reopens approval when it changes.

Source: LiteSpec.

### Shape

One deployment boundary of a project: server or client-only.

Source: LiteSpec.

### Size

One of the required-record sets of a project: small or large.

Source: LiteSpec.

### Source Material

Research kept outside the documentation, which carries no authority on its own.

Source: LiteSpec.

### Specification Metadata

The opening block stating a page type, owner, status, and records.

Source: LiteSpec. Rejected: frontmatter, which names the Markdown fence instead of the record data.

### Stack

One technology binding of the specification, held in one folder.

Source: LiteSpec.

### Stale

The computed state of a proof whose scenario changed after its test last passed.

Source: LiteSpec.

### Standard

One identified provision stating a required boundary for consumers.

Source: LiteSpec.

### Statement

The one sentence in a provision carrying its obligation.

Source: LiteSpec.

### Sub-Processor

One provider processing personal data for the product.

Source: the GDPR.

### Topic

One page owning provisions for one subject.

Source: LiteSpec.

### Tutorial

One page that takes a reader to a first working result.

Source: Diataxis.

### Underneath

The command page section stating what the command runs.

Source: LiteSpec.

### Verified

The computed state of a use case every scenario proves, or of a requirement everything fulfilling it proves.

Source: LiteSpec.

### Veto Window

The days after decideBy in which a tier-3 recommendation auto-approves unless vetoed.

Source: LiteSpec.

### Workspace

The repository that holds a consumer application or the standards.

Source: LiteSpec. Rejected: repo, which shortens the word every path already shortens.
