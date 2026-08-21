# Controlled UI Governance

## Intent


This convention turns the selected UI library into a constrained construction language. The library
provides component source and baseline interaction behavior. Product specifications provide meaning,
composition, states, content limits, responsive behavior, and evidence. Agents use both sources.

The baseline applies to React web frontends. It does not pretend that official shadcn/ui components are
a native mobile system. A native frontend selects its own platform system through a separate decision.

## Agent Summary {#agent-summary}


- One recorded visual system per React web frontend. (UI.GOVERNANCE.001)
- New frontends install and commit the pinned shadcn baseline. (UI.SHADCN.001)
- Each frontend declares a schema-valid UI vocabulary. (UI.VOCABULARY.001)
- Non-trivial pages carry a schema-valid sidecar contract. (UI.PAGE.SPEC.001)
- Tailwind use stays within semantic tokens and approved utilities. (UI.TAILWIND.001)
- A source lock records every installed component and its digest. (UI.FORKS.001)
- Behavior packages are approved by capability and render through the baseline. (UI.COMPANION.001)
- Every UI change names its evidence from the matrix. (UI.EVIDENCE.001)
- Agents use, then compose, then record before adding UI. (UI.AGENT.PROTOCOL.001)

## Standards


### Select one visual authority (UI.GOVERNANCE.001)

**Requirement:** Each React web frontend MUST record one primary visual system, its profile, and its owned paths in `standards.project.json`.

**Rationale:** A second general-purpose visual system in one workspace makes every component choice ambiguous. An override carries a review date so it cannot become permanent by omission.

### Use the pinned shadcn/ui baseline (UI.SHADCN.001)

**Requirement:** A new React web frontend MUST install the `uiBaseline` from `standards.manifest.json` and commit its generated configuration and source.

**Rationale:** The committed files are `components.json` from the pinned CLI, the installed `components/ui/` source, the Tailwind entry, and the source lock.

### Declare the UI vocabulary (UI.VOCABULARY.001)

**Requirement:** Each React web frontend MUST declare a vocabulary validating against `schemas/ui-vocabulary.schema.json` and repeating its selected preset.

**Rationale:** A page can then be reviewed without reconstructing the CLI command that produced its components.

### Specify pages before composition (UI.PAGE.SPEC.001)

**Requirement:** A non-trivial React web page MUST carry `kind: page` metadata and a sidecar validating against `schemas/ui-page.schema.json`.

**Rationale:** The sidecar names the shell, regions, states, responsive modes, focus order, and evidence that the page composition relies on.

### Restrict CSS decisions (UI.TAILWIND.001)

**Requirement:** A Tailwind class MUST use a semantic token rather than an arbitrary value, raw palette value, or important modifier.

**Rationale:** The default CSS surface is one global entry holding the Tailwind import, tokens, fonts, and documented resets. The source scan skips generated build output and native runtime asset directories, and still rejects authored feature CSS.

### Track source changes (UI.FORKS.001)

**Requirement:** `ui-source-lock.json` MUST record the pinned CLI, preset fingerprint, registry address, installed paths, normalized digest, and dependencies for each component.

**Rationale:** The project formatter normalizes source before hashing, so two consumers compute the same digest for identical source.

### Govern behavior companions and specialist controls (UI.COMPANION.001)

**Requirement:** A behavior package MUST be approved for the capability it supplies and render through baseline components and tokens.

**Rationale:** Approval follows the capability rather than the visual catalog, so a package is not adopted for components the baseline already provides.

### Prove UI behavior and appearance (UI.EVIDENCE.001)

**Requirement:** A primitive, pattern, token, source, page contract, fork, or specialist surface change MUST name the evidence in the matrix in this section.

**Rationale:** The matrix maps each change class to the narrowest evidence that represents its risk.

### Follow the agent UI protocol (UI.AGENT.PROTOCOL.001)

**Requirement:** An agent MUST search the vocabulary, compose from approved primitives, and record a decision before introducing a new surface.

**Rationale:** The ordered steps stop an agent from adding a component that the installed set already provides.

## Conventions


### Use the product profiles (UI.GOVERNANCE.CONVENTION.001)

**Default:** Select one product profile from `public-light`, `application-balanced`, or `admin-dense` for each frontend.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** All profiles share the baseline. They limit composition and evidence rather than colors or component bases.

### Use the source update procedure (UI.GOVERNANCE.CONVENTION.002)

**Default:** Update baseline source on a branch that pins the CLI, starts clean, and reviews generated and local files separately.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Running `view`, `--dry-run`, and `--diff` first shows what the update changes before it is written.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| UI.GOVERNANCE.001 | inspection | `node standards/tools/validate-ui.mjs` reports a frontend with no recorded visual system or a second system in the workspace. |
| UI.SHADCN.001 | inspection | `node standards/tools/validate-ui.mjs` compares the committed configuration against the manifest `uiBaseline` fields. |
| UI.VOCABULARY.001 | inspection | `node standards/tools/validate-ui.mjs` validates the vocabulary against its schema and its recorded preset. |
| UI.PAGE.SPEC.001 | inspection | `node standards/tools/validate-ui.mjs` reports a page specification with no sidecar or an unlisted shell or pattern. |
| UI.TAILWIND.001 | inspection | `node standards/tools/validate-ui.mjs` rejects an arbitrary value, raw palette value, important modifier, or unapproved global import. |
| UI.FORKS.001 | inspection | `node standards/tools/validate-ui.mjs` recomputes each digest and reports changed baseline source with no fork record. |
| UI.COMPANION.001 | inspection | `node standards/tools/validate-ui.mjs` reports a specialist control rendering outside the baseline component and token set. |
| UI.EVIDENCE.001 | test | `node standards/tools/validate-ui.mjs` reports a vocabulary state that no evidence record covers. |
| UI.AGENT.PROTOCOL.001 | inspection | `node standards/tools/validate-ui.mjs` reports a page contract naming a shell, pattern, or state outside the vocabulary. |
| UI.GOVERNANCE.CONVENTION.001 | inspection | Each frontend entry in `standards.project.json` names one of the three product profiles. |
| UI.GOVERNANCE.CONVENTION.002 | inspection | The update branch records the pinned CLI, the dry-run output, and separate review of generated and local files. |
