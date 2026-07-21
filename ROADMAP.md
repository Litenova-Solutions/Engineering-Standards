# Engineering Standards V2 Roadmap

## Purpose

This roadmap records candidates to evaluate after the v1 standards are used by real consumer applications. It is not part of the v1 profile and does not promise that every candidate will enter v2.

## Entry gate

V2 design starts after:

1. V1 has an annotated release and at least one completed consumer primary release flow.
2. At least two consumer efforts have recorded deviations, repeated agent mistakes, and missing verification.
3. Maintainers have reviewed context-load size, adoption time, release records, and operating incidents.
4. Each proposed rule has a concrete failure or repeated cost that it would prevent.

## Candidate themes

### Adoption feedback and conformance

- Measure which v1 documents agents load, ignore, or misapply.
- Record common consumer overrides and determine whether they are local choices or missing profile rules.
- Add a small validation tool only for repeated mechanical failures that schemas and CI cannot catch clearly.
- Define upgrade reports that name changed rule IDs and affected consumer overrides.

### Bootstrap and reference implementation

- Evaluate a minimal application scaffold after two consumers have converged on the same files and registration patterns.
- Keep generated output small, reviewable, and removable.
- Add executable reference slices only where prose and integration tests still leave ambiguity.

### Durable messaging integration

- Evaluate direct use of LiteBus durable inbox and outbox modules.
- Prove atomic Marten business writes and outbox writes through one transaction before replacing the v1 project-owned pattern.
- Define inbox deduplication, partition ordering, replay authorization, and message-contract upgrade tooling.

### Upgrade and compatibility automation

- Produce machine-readable rule changes between standards releases.
- Automate OpenAPI compatibility, stored-document fixture checks, and consumer dependency drift reports.
- Define supported mixed-version windows for API, Worker, schema, and stored messages.

### Additional application profiles

- Evaluate a modular monolith profile with several bounded contexts before any microservice profile.
- Evaluate event-sourced aggregates as a separate persistence profile, not a Marten document default.
- Consider native clients, another frontend framework, or another backend only when a maintained consumer requires one.

### Deployment and operations profiles

- Add provider-specific deployment references only for platforms used in production.
- Define service-level objectives, capacity tests, disaster recovery exercises, and incident review records from measured operating needs.
- Evaluate software provenance and artifact signing requirements beyond the v1 inventory and immutable-reference rules.

### Assurance depth

- Expand threat modeling for money, sensitive data, tenancy, and public integration boundaries.
- Add performance and load evidence for measured high-volume paths.
- Evaluate mutation, contract, and resilience testing where escaped defects show a need.

## Candidate acceptance test

Before a candidate becomes normative, its proposal states:

- The observed consumer problem and evidence.
- Why a v1 rule, extension, or local decision cannot address it.
- The smallest new rule or profile boundary.
- Context-load and maintenance cost.
- Migration and compatibility impact.
- Executable or reviewable verification.
- Removal or revision conditions.

## Deliberate non-commitments

V2 will not add microservices, Kubernetes, event sourcing, code generation, a standards CLI, or a larger document set only because those choices are common elsewhere. Each requires evidence from the supported consumer scope and a separate decision.
