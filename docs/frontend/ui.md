# Controlled UI Governance

## Intent


This convention turns the selected UI library into a constrained construction language. The library provides component source and baseline interaction behavior. Product specifications provide meaning, composition, states, content limits, responsive behavior, and evidence. Agents use both sources.

The baseline applies to React web frontends. It does not pretend that official shadcn/ui components are a native mobile system. A native frontend selects its own platform system through a separate decision.

## Agent Summary {#agent-summary}


- One recorded visual system per React web frontend. (FRONTEND.UI.GOVERNANCE.001, FRONTEND.UI.SHADCN.001)
- Each frontend declares a schema-valid UI vocabulary and a root design contract. (FRONTEND.UI.VOCABULARY.001, FRONTEND.UI.DESIGN.001)
- Recipes live in a catalog, and a page region names one. (FRONTEND.UI.CATALOG.001, FRONTEND.UI.COMPOSITION.001)
- Every registered route carries a schema-valid sidecar. (FRONTEND.UI.PAGE.001)
- A sidecar names a component for every state it declares. (FRONTEND.UI.STATE.001)
- An implementation renders no region its frozen sidecar omits. (FRONTEND.UI.GATES.001)
- Acceptance files sit beside the route and resolve every named identifier. (FRONTEND.UI.PLACEMENT.001, FRONTEND.UI.ACCEPTANCE.001)
- Tailwind use stays within semantic tokens, and source changes stay in the lock. (FRONTEND.UI.TAILWIND.001, FRONTEND.UI.FORKS.001)
- Behavior packages are approved by capability and render through the baseline. (FRONTEND.UI.COMPANION.001)
- Agents research, freeze, implement, then verify in a browser. (FRONTEND.UI.PROTOCOL.001, FRONTEND.UI.EVIDENCE.001)

## Concepts


### The design contract

A design contract is the file an agent reads before it composes anything on a frontend. It sits at the frontend root, it is named `DESIGN.md`, and it opens with a metadata block the validator resolves.

Eight sections are required, and each one closes a drift the next page would otherwise repeat.

| Section | What it carries | The drift it closes |
|:---|:---|:---|
| Brand | The tone, in three words the product is and three it is not | Voice differs from page to page |
| Tokens | The semantic tokens in use, and what each one is for | An agent invents its own values |
| Vocabulary | The primitives this frontend composes from | A card appears where a badge belongs |
| Patterns | The catalog recipes this frontend reaches for | A layout is invented for a solved shape |
| Do | Concrete rules, each one a sentence a reviewer can apply | A generic pattern replaces a product one |
| Do not | Concrete refusals, each one naming its failure | The cluttered first draft |
| Motion | The named presets, with duration and use | Motion invented per page |
| Voice | The words the product uses and the words it refuses | Copy that reads like a sales page |

### The composition catalog

A composition catalog holds one recipe for each repeated page shape. A recipe is a Markdown page that argues the shape and a sidecar that states it: the slots, the states, and the rules.

A page sidecar names a recipe as a region pattern. The frontend vocabulary binds the same identifier to that frontend's own components. A page composes by slot rather than by copying a neighbouring layout.

A page recipe is named by a page sidecar. A shell recipe renders once around every page, so the design contract of each consuming frontend names it instead.

### The four gates

An agent writing a page runs four gates in order. The plan freezes at gate B, and a change after that returns to gate B.

| Gate | What the agent does | What proves it |
|:---|:---|:---|
| A Research | Reads the design contract, the recipes, and comparable pages | Review of the plan the agent states |
| B Freeze | Writes the sidecar: regions, states, focus, evidence | The sidecar file |
| C Contract | Runs the UI validator over the sidecar | A zero exit from the validator |
| D Acceptance | Implements, then runs every acceptance file in a browser | The acceptance run |

## Standards


### Select one visual authority (FRONTEND.UI.GOVERNANCE.001)

**Requirement:** Each React web frontend MUST record one primary visual system, its profile, and its owned paths in `standards.project.json`.

**Rationale:** A second general-purpose visual system in one workspace makes every component choice ambiguous. An override carries a review date so it cannot become permanent by omission.

The profile is chosen per frontend rather than per workspace, because density is a property of the audience. `public-light` suits a surface a visitor meets once. `application-balanced` suits a surface a signed-in user works in. `admin-dense` suits a surface an operator reads all day. A workspace with four frontends normally carries more than one profile, and two frontends sharing an audience share a profile.

### Use the pinned shadcn/ui baseline (FRONTEND.UI.SHADCN.001)

**Requirement:** A new React web frontend MUST install the `uiBaseline` from `standards.manifest.json` and commit its generated configuration and source.

**Rationale:** The committed files are `components.json` from the pinned CLI, the installed `components/ui/` source, the Tailwind entry, and the source lock.

### Declare the UI vocabulary (FRONTEND.UI.VOCABULARY.001)

**Requirement:** Each React web frontend MUST declare a vocabulary validating against `schemas/ui-vocabulary.schema.json` and repeating its selected preset.

**Rationale:** A page can then be reviewed without reconstructing the CLI command that produced its components. `schemas/ui-vocabulary.schema.json` is the shape, and `node standards/tools/validate-ui.mjs` is what reads the file against it. The schema requires the full preset only for the default visual system. A frontend on an alternate system records its own baseline and carries the override decision `FRONTEND.UI.GOVERNANCE.001` requires.

### Publish a design contract (FRONTEND.UI.DESIGN.001)

**Requirement:** Each React web frontend MUST publish a root `DESIGN.md` satisfying `schemas/design-contract.schema.json` and carrying the eight required sections.

**Rationale:** An agent that has read no contract picks its own tokens, its own motion, and its own voice. The picks differ on the next page, and the difference is what a reader sees as clutter. The Concepts section on this page lists the eight sections and the drift each one closes.

**Example:** The metadata block names the frontend, its profile, its shell, and the catalog recipes it reaches for.

```json
{
  "kind": "design-contract",
  "schemaVersion": 1,
  "frontend": "control-panel",
  "profile": "admin-dense",
  "shell": "panel-shell",
  "patterns": ["page-header", "work-queue", "evidence-form"]
}
```

### Publish a composition catalog (FRONTEND.UI.CATALOG.001)

**Requirement:** A composition catalog entry MUST carry a Markdown recipe and a sidecar satisfying `schemas/composition-recipe.schema.json`.

**Rationale:** A recipe with prose and no sidecar is read by a person and resolved by nothing. A recipe with a sidecar and no prose states slots without stating why the shape is the shape. The catalog path is declared in `standards.project.json` under `paths.uiCompositions`.

### Compose from a catalog recipe (FRONTEND.UI.COMPOSITION.001)

**Requirement:** A page sidecar region MUST name a pattern that the composition catalog and the frontend vocabulary both declare.

**Rationale:** A page that invents its own evidence form is a recipe the next page invents again. The catalog is the unit of reuse, and the page is the unit of composition. The vocabulary is what binds the shared identifier to this frontend's own components.

### Specify pages before composition (FRONTEND.UI.PAGE.001)

**Requirement:** A page registered in an application route tree MUST carry a sidecar validating against `schemas/ui-page.schema.json`.

**Rationale:** The sidecar names the layout, shell, regions, states, responsive modes, focus order, accessibility rules, and evidence. The layout is a closed set of five shapes. A page that fits none of them is a schema change and a recorded decision, rather than a sixth shape one page invented.

### Render every declared state (FRONTEND.UI.STATE.001)

**Requirement:** A page sidecar MUST name, in one of its regions, a component that the vocabulary maps to each state the sidecar declares.

**Rationale:** A button whose success is never announced is a button that does not work, in the reader's account of it. A sidecar that lists `saved` and names no component carrying `saved` has described a page nobody built. The vocabulary carries the mapping, so the check needs no browser.

### Keep the implementation inside the frozen plan (FRONTEND.UI.GATES.001)

**Requirement:** A page implementation MUST NOT render a region that its sidecar does not name.

**Rationale:** A plan that is not frozen drifts, and drift in a page is what a reader sees as clutter. The cheap failure is a section added during implementation that no contract mentions. A region is marked in the source with `data-region`, so the check reads the route and the components it imports.

### Place acceptance beside the route (FRONTEND.UI.PLACEMENT.001)

**Requirement:** An acceptance file MUST sit in an `evidence` directory beside the route file it opens.

**Rationale:** The evidence belongs to the page it proves rather than to the frontend. A reader who opens the route directory finds the contract's proof without searching a separate tree. The directory also carries the acceptance record satisfying `schemas/acceptance-criteria.schema.json`.

### Resolve every acceptance identifier (FRONTEND.UI.ACCEPTANCE.001)

**Requirement:** Every `AC-` identifier a page sidecar names MUST resolve to a criterion record and a runnable file.

**Rationale:** Evidence the gates do not run is evidence the project does not have. The identifier is the unit of proof, the record states the precondition and the assertions, and the file is what runs.

### Restrict CSS decisions (FRONTEND.UI.TAILWIND.001)

**Requirement:** A Tailwind class MUST use a semantic token rather than an arbitrary value, raw palette value, or important modifier.

**Rationale:** The default CSS surface is one global entry holding the Tailwind import, tokens, fonts, and documented resets. The source scan skips generated build output and native runtime asset directories, and still rejects authored feature CSS.

### Track source changes (FRONTEND.UI.FORKS.001)

**Requirement:** `ui-source-lock.json` MUST record the pinned CLI, preset fingerprint, registry address, installed paths, normalized digest, and dependencies for each component.

**Rationale:** The project formatter normalizes source before hashing, so two consumers compute the same digest for identical source.

### Govern behavior companions and specialist controls (FRONTEND.UI.COMPANION.001)

**Requirement:** A behavior package MUST be approved for the capability it supplies and render through baseline components and tokens.

**Rationale:** Approval follows the capability rather than the visual catalog, so a package is not adopted for components the baseline already provides.

### Prove UI behavior and appearance (FRONTEND.UI.EVIDENCE.001)

**Requirement:** A primitive, pattern, token, source, page contract, fork, or specialist surface change MUST name the evidence in the matrix in this section.

**Rationale:** The matrix maps each change class to the narrowest evidence that represents its risk.

| Change class | Narrowest evidence |
|:---|:---|
| Primitive source or variant | The component test for that primitive |
| Pattern or recipe | The acceptance file of one page that names it |
| Token or global CSS | The visual baseline of one page in each profile |
| Page contract or region | Every acceptance file the sidecar names |
| Fork | The source lock digest and the component test |
| Specialist control | The accessibility check for the capability it supplies |

### Follow the agent UI protocol (FRONTEND.UI.PROTOCOL.001)

**Requirement:** An agent MUST read the design contract and the recipes, freeze the sidecar, implement, and run the acceptance files.

**Rationale:** The previous rule asked an agent to search, compose, and record, and every step of it was checked by the agent that performed it. The four gates in the Concepts section replace that with artifacts: a sidecar a validator reads, and acceptance files a browser runs. An agent stops on a failing acceptance file or a refused snapshot rather than reporting its own judgement.

## Conventions


### Use the product profiles (FRONTEND.UI.CONVENTION.001)

**Default:** Select one product profile from `public-light`, `application-balanced`, or `admin-dense` for each frontend.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** All profiles share the baseline. They limit composition and evidence rather than colors or component bases.

### Use the source update procedure (FRONTEND.UI.CONVENTION.002)

**Default:** Update baseline source on a branch that pins the CLI, starts clean, and reviews generated and local files separately.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Running `view`, `--dry-run`, and `--diff` first shows what the update changes before it is written.

### Promote a recipe on its second consumer (FRONTEND.UI.CONVENTION.003)

**Default:** Add a recipe to the catalog when a second page needs it, and keep a single-page shape inside that page.

**Replacement:** A consumer can register a recipe with one consumer by recording the second consumer it expects.

**Rationale:** A catalog that accepts every one-off fills with recipes no second page reads. A shape with one consumer is that page rather than a recipe.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| FRONTEND.UI.GOVERNANCE.001 | inspection | `node standards/tools/validate-ui.mjs` reports a frontend with no recorded visual system or a second system in the workspace. |
| FRONTEND.UI.SHADCN.001 | inspection | `node standards/tools/validate-ui.mjs` compares the committed configuration against the manifest `uiBaseline` fields. |
| FRONTEND.UI.VOCABULARY.001 | inspection | `node standards/tools/validate-ui.mjs` validates the vocabulary against its schema and its recorded preset. |
| FRONTEND.UI.DESIGN.001 | static | `node standards/tools/validate-ui.mjs` reports a frontend whose `DESIGN.md` is missing, fails the schema, or omits a required section. |
| FRONTEND.UI.CATALOG.001 | static | `node standards/tools/validate-ui.mjs` reports a catalog recipe with no sidecar and a sidecar failing `schemas/composition-recipe.schema.json`. |
| FRONTEND.UI.COMPOSITION.001 | static | `node standards/tools/validate-ui.mjs` reports a region pattern that the catalog or the vocabulary does not declare. |
| FRONTEND.UI.PAGE.001 | inspection | `node standards/tools/validate-ui.mjs` reports a page specification with no sidecar or an unlisted shell, layout, or pattern. |
| FRONTEND.UI.STATE.001 | static | `node standards/tools/validate-ui.mjs` reports a declared state that no component named by a region carries. |
| FRONTEND.UI.GATES.001 | static | `node standards/tools/validate-ui.mjs` reports a `data-region` value in the route source that the sidecar does not name. |
| FRONTEND.UI.PLACEMENT.001 | static | `node standards/tools/validate-ui.mjs` reports an acceptance record outside the `evidence` directory of its route. |
| FRONTEND.UI.ACCEPTANCE.001 | test | `node standards/tools/validate-ui.mjs` reports an `AC-` identifier with no criterion record or no runnable file. |
| FRONTEND.UI.TAILWIND.001 | inspection | `node standards/tools/validate-ui.mjs` rejects an arbitrary value, raw palette value, important modifier, or unapproved global import. |
| FRONTEND.UI.FORKS.001 | inspection | `node standards/tools/validate-ui.mjs` recomputes each digest and reports changed baseline source with no fork record. |
| FRONTEND.UI.COMPANION.001 | inspection | `node standards/tools/validate-ui.mjs` reports a specialist control rendering outside the baseline component and token set. |
| FRONTEND.UI.EVIDENCE.001 | test | `node standards/tools/validate-ui.mjs` reports a vocabulary state that no evidence record covers. |
| FRONTEND.UI.PROTOCOL.001 | inspection | Review confirms the sidecar was frozen before the implementation, and the acceptance run covers every identifier it names. |
| FRONTEND.UI.CONVENTION.001 | inspection | Each frontend entry in `standards.project.json` names one of the three product profiles. |
| FRONTEND.UI.CONVENTION.002 | inspection | The update branch records the pinned CLI, the dry-run output, and separate review of generated and local files. |
| FRONTEND.UI.CONVENTION.003 | inspection | Review confirms each catalog recipe has two consumers or records the second consumer it expects. |
