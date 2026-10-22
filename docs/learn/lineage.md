# Lineage

## Intent

LiteSpec borrows its words from established practices: each borrowed concept keeps its source's name, so a reader who knows the source already knows the word. This page names each practice, what LiteSpec takes from it, the words it uses, and what LiteSpec does differently. New readers take it after [How LiteSpec Compares](how-litespec-compares.md), as background rather than rules.

## Domain-Driven Design

**Takes:** the aggregate as the unit of consistency, the module inside one bounded context, the ubiquitous language shared by people and code, and the domain event as the record of something completed.

**Words:** aggregate, module, glossary, event.

**Differs:** LiteSpec fixes one bounded context per product, so there is no context map to maintain. Child entities and value objects live in code and the glossary, never as records: the specification names only what carries business meaning. Each aggregate declares its states with their meanings, its transitions, and its classified data, which the builder checks.

## Event Storming

**Takes:** the policy: whenever something happens, do something in response.

**Words:** reaction, the use case kind that answers an event or a schedule.

**Differs:** A reaction is a recorded use case with a trigger, results, and scenarios, proven by tests like any other use case. It is not a workshop sticky: its trigger names the events, schedule, or deadline in words the builder reads.

## CQRS

**Takes:** Command Query Responsibility Segregation splits commands, which change state, from queries, which answer questions.

**Words:** kind, with the values command and query.

**Differs:** LiteSpec adds reaction as a third kind, so every use case is a command, a query, or a reaction. Queries declare their output, and all three kinds are proven the same way: a passing test through the public boundary for every scenario.

## Behavior-Driven Development

**Takes:** the scenario in given, when, then, written with the Gherkin grammar; examples tables that try one scenario against many rows; and the Example section narrative, drawn from Example Mapping and Specification by Example, that shows behavior inside a real occasion.

**Words:** scenario, with given, when, then and an optional examples table; example, the narrative section.

**Differs:** Scenarios are the leaf records of the specification tree: each one names exactly one result, and each is proven by a passing test through the public boundary. A test's expected values come only from the scenario's then, never from running the code.

## Requirements Engineering

**Takes:** the requirement kinds functional, quality, and business, drawn from BABOK and IREB; the measurable goal with its target, drawn from Volere and product practice; and the fit criterion: every quality requirement carries a measure that a check confirms.

**Words:** requirement, goal, measure.

**Differs:** LiteSpec writes each requirement as a plain statement with a one-line rationale, not in the fixed EARS sentence patterns. Goals stand as their own records instead of living inside requirements, so one goal serves many features.

## Impact Mapping and Jobs to Be Done

**Takes:** the goal at the center, with actors, impacts, and deliverables reasoned outward from it; and the job as progress in a situation, stable while solutions churn.

**Words:** goal, problem, feature, journey.

**Differs:** LiteSpec fixes the map as typed records and links: a feature solves problems and serves goals, and a journey orders use cases toward one goal. There is no map to draw; the tree is the map, and the builder checks its links.

## Decision Records

**Takes:** one record per significant decision, with its context, the options considered, the choice, and its consequences; a decision is replaced, never edited.

**Words:** decision, with options, chosen, and consequences.

**Differs:** Options are entries with what speaks for and against each, so the review content is structured, not prose. A decision links what it decides and what it replaces, and names what would change it, with the shared draft, approved, and retired statuses of every record.

## Role-Based Access Control

**Takes:** permissions grouped into roles, granted to the people and systems that act.

**Words:** actor, role, permission.

**Differs:** An actor holds a role at a scope, and a use case names the permissions it needs, so access reads as one chain from actor to use case. Deriving the actor from verified claims is below the review line: stack code, checked by tools.

## Design by Contract

**Takes:** the invariant, always true, and the precondition, checked before.

**Words:** invariant, precondition.

**Differs:** LiteSpec adds calculation and cross-aggregate as rule kinds, so computed values and rules across aggregates have a home. Each rule is proven by scenarios, and each violation ends in a refusal with a stable code.

## Next

[Work with Agents](working-with-agents.md) explains how an agent uses the standard and the records together.
