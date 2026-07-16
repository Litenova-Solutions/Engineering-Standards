# Glossary

## ADDD

Agentic Domain-Driven Delivery. Litenova's method for connecting a thin product brief, shared domain language, single use-case specifications, implementation, automated evidence, and release operation.

## Agent Summary

The anchored short section agents load as Tier 1 context for a task. The full document remains the source when a summary is insufficient.

## Aggregate

A transactional consistency boundary that protects business invariants during a command.

## Capability

A business grouping inside the one bounded context. Capability names align domain documentation, backend folders, endpoint groups, and frontend feature folders.

## Convention

A default name, location, file shape, or implementation pattern. A consumer may replace a convention by documenting one explicit local convention.

## Delivery surface

A public way an actor observes or invokes a use case, such as an HTTP API, web application, Worker-triggered process, or administrative interface.

## Derived artifact

A committed application file produced deterministically from an authored source. Examples include OpenAPI and generated TypeScript API types.

## Domain event

An immutable, package-free Domain record describing a business fact raised by an aggregate.

## Extension

A conditional standards bundle enabled by activation criteria in `standards.project.json`. An extension may add packages, projects, conventions, verification, or named replacements for baseline rules.

## Normative

Required for a conforming consumer. In this repository, content under a `Standards` section is normative.

## Platform profile

A supported combination of architecture, frameworks, project layout, and baseline conventions. Version 1 contains the `dotnet-nextjs` profile.

## Risk flag

A use-case metadata value that activates additional specification and evidence for authorization, money, sensitive data, irreversible behavior, concurrency, durable delivery, or availability.

## Rule ID

A stable uppercase dotted identifier such as `APP.COMMAND.001` used by overrides, extensions, decisions, conflict reports, and review.

## Standard assurance

The default use-case depth when no risk flag adds extra assurance requirements.

## Standards override

A consumer replacement for a normative rule. It names the rule ID and an accepted project decision in `standards.project.json`.

## Use-case specification

The one authored operation file containing intent, authorization, contract, business rules, flow, failures, examples, risk, operating impact, and acceptance criteria.
