# Upgrade to Standards v1.4

Standards v1.4 is an additive and clarifying release. It does not rename vocabulary, change the Specification Metadata schema, or move documentation directories. It adds a reference validator, completes the rule identifier scheme, gives cross-cutting security records a defined home, and closes two consumer footguns. Most consumers pass v1.4 after running the new validator and fixing what it reports.

## Run the reference validator

v1.4 ships `tools/validate-consumer.mjs`. From the consumer root:

```bash
node standards/tools/validate-consumer.mjs
```

It validates every metadata block and the cross-file relationships the foundation Verification lists require. Add it to consumer CI and the review checklist. The most common newly reported failure is a local extension listed on a specification kind its manifest `applicableKinds` excludes.

## Fix extension scope on the wrong kind

`AGENTIC.EXTENSIONS.001` already forbids listing a local extension on an excluded kind, but nothing checked it before v1.4. The validator now does. In particular, an end-to-end flow must not list `outbox-worker`, `external-integrations`, `concurrency-idempotency`, `scheduled-jobs`, `reporting`, or `data-lifecycle`, because their `applicableKinds` are use case and workflow. Move those extensions to the flow's constituent use cases and workflows and set the flow `applicableExtensions` to `[]` (only `acceptance-bdd` and `realtime` apply to a flow).

## Adopt the completed rule identifier scheme

`AGENTIC.RULES.001` now defines an identifier form for every rule classification, not only aggregate invariants and domain policies:

| Classification | Identifier form |
|:---|:---|
| Aggregate Invariant | `INV-{MODULE}-{NN}` |
| Domain Policy | `POL-{POLICY}-{NN}` |
| Validation Rule | `VAL-{MODULE}-{USE-CASE}-{NN}` |
| Authorization Policy | `AUTZ-{MODULE}-{USE-CASE}-{NN}` |
| Persistence Constraint | `PERS-{MODULE}-{NN}` |
| Workflow Rule | `WFR-{WORKFLOW}-{NN}` |

A caller-visible failure code uses `{MODULE}.{REASON}`. Existing `INV-*`, `POL-*`, `AC-*`, and `E2E-*` IDs are unchanged. Align any ad-hoc validation, authorization, persistence, or workflow rule IDs to these forms; do not renumber approved IDs.

A `POL-*` ID belongs only to a domain-policy specification. If a use-case rule enforces a decision-derived constraint that has no domain-policy specification, keep the rule under its enforcement classification and cite the decision by link instead of inventing a `POL-*` ID.

## Move cross-cutting security records to operations

Record cross-cutting security posture, trust boundaries, threat surfaces, and privacy references as prose documents under `docs/operations/`, for example `security-and-privacy.md`. `limits.md` remains the only structured kind there. Enforceable security and privacy rules stay in their use-case authorization sections and in domain policies such as data retention. Do not reintroduce a general cross-cutting bucket.

## Negate the releases directory in .gitignore

If the consumer uses a platform `.gitignore` with `[Rr]eleases/`, the required `docs/releases/` directory is silently ignored. Add the negation immediately after the build-output patterns:

```gitignore
[Rr]eleases/
!docs/releases/
!docs/releases/*.md
```

Confirm with `git check-ignore docs/releases/<file>.md`.

## Remove any residual Markdown metadata section

`WRITING.METADATA.001` now states explicitly that the JSON block is the only metadata carrier. Remove any remaining prose "Document metadata" section. Record canonical source in the body and implementation and verification evidence in their specification sections.

## Validate and pin

Validate the standards manifest and each metadata block against their schemas, and run the reference validator against the consumer. During draft review, pin the consumer submodule to the exact reviewed commit. After publication, update it to the `v1.4.0` tag.
