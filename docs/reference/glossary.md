# Glossary

## ADDD

Agentic Domain-Driven Delivery. Litenova's method for connecting a thin product brief, shared domain language, single use-case specifications, implementation, automated evidence, and release operation.

## Agent Summary

The anchored short section agents load as Tier 1 context for a task. The full document remains the source when a summary is insufficient.

## Aggregate

A transactional consistency boundary that protects business invariants during a command.

## Aggregate root

The entity that controls changes inside an aggregate and protects its invariants. It remains the runtime Domain contract even when a subject provides the wider documentation and navigation boundary.

## Critical journey

An ordered set of use cases that produces one customer outcome and defines a release boundary.

## Cross-cutting contract

A documented behavior that applies across subjects, such as security, retention, operating limits, provider boundaries, or event delivery.

## Evidence register

A record that classifies claims as observed, calculated, inferred, hypothesized, or gated and links each claim to its source and decision impact.

## Subject

A stable business noun that aligns domain documentation, backend folders, endpoint groups, frontend feature folders, tests, and related use cases inside the one bounded context. A state-changing subject names one primary aggregate root. Subject is not a runtime Domain interface or base class.

## Convention

A default name, location, file shape, or implementation pattern. A consumer may replace a convention by documenting one explicit local convention.

## Delivery surface

A public way an actor observes or invokes a use case, such as an HTTP API, web application, Worker-triggered process, or administrative interface.

## Process coordinator

An Application, reaction, or Worker boundary that sequences public behavior across subjects. It owns independent workflow state only when that state has its own business language, lifecycle, retry or idempotency rules, or operator actions.

## Derived artifact

A committed application file produced deterministically from an authored source. Examples include OpenAPI and generated TypeScript API types.

## Domain event

An immutable, package-free Domain record describing a business fact raised by an aggregate.

## Extension

A conditional standards bundle enabled by activation criteria in `standards.project.json`. An extension may add packages, projects, conventions, verification, or named replacements for baseline rules.

## Normative

Required for a conforming consumer. In this repository, content under a `Standards` section is normative.

## Operating limit

A supported boundary for a release or pilot, including capacity, dependency availability, support window, monitoring threshold, stop condition, or recovery target.

## Platform profile

A supported combination of architecture, frameworks, project layout, and baseline conventions. Version 1 contains the `dotnet-nextjs` profile.

## Risk flag

A use-case metadata value that activates additional specification and evidence for authorization, money, sensitive data, irreversible behavior, concurrency, durable delivery, or availability.

## Rule ID

A canonical uppercase dotted identifier such as `APP.COMMAND.001` used by overrides, extensions, decisions, conflict reports, and review within one standards release. A later release may rename or remove it.

## Standard assurance

The default use-case depth when no risk flag adds extra assurance requirements.

## Standards override

A consumer replacement for a normative rule. It names the rule ID and an accepted project decision in `standards.project.json`.

## Use-case specification

The one authored operation file containing intent, authorization, contract, business rules, flow, failures, examples, risk, operating impact, and acceptance criteria.
