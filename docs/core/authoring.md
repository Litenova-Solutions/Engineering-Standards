# Authoring Standard

## Intent

The standards use one page grammar and one controlled technical prose profile. This page is the canonical source for standards authoring.

## Agent Summary {#agent-summary}

- Use controlled technical prose with repository terminology. (CORE.AUTHORING.PROSE.001, CORE.AUTHORING.TERM.001)
- Write one testable obligation in each Standards provision. (CORE.AUTHORING.NORMATIVE.002, CORE.AUTHORING.REQUIREMENT.001)
- Name the declared page scope and a registered topic in each ID. (CORE.AUTHORING.IDENTIFIER.001, CORE.AUTHORING.IDENTIFIER.002, CORE.AUTHORING.IDENTIFIER.003)
- Give each actionable default a distinct convention ID. (CORE.AUTHORING.DEFAULTS.001)
- Apply the declared contract for each page class. (CORE.AUTHORING.PAGE.001)
- Keep summaries informative and cite every projected provision. (CORE.AUTHORING.SUMMARY.001)
- Map every provision to exact verification evidence. (CORE.AUTHORING.VERIFICATION.001)
- Validate only current standards material. (CORE.AUTHORING.SNAPSHOT.001, CORE.AUTHORING.SNAPSHOT.002)
- Publish complete releases and record the one a consumer reviewed. (CORE.AUTHORING.SNAPSHOT.003, CORE.AUTHORING.SNAPSHOT.004, CORE.AUTHORING.SNAPSHOT.005, CORE.AUTHORING.SNAPSHOT.006)
- Run the authoring checks and regenerate the provision index. (CORE.AUTHORING.VALIDATION.001, CORE.AUTHORING.INDEX.001)

## Concepts

### Controlled technical prose

Controlled technical prose is the repository-owned English profile for standards, instructions, and technical reference material. It uses fixed structures, bounded prose, exact terminology, and testable provisions.

The profile is influenced by [ASD-STE100 Issue 9](https://www.asd-ste100.org/assets/files/ASD-STE100_ISSUE9.pdf). It is not ASD-STE100 conformance. The repository does not copy or reproduce the ASD-STE100 controlled dictionary.

No agent, validator, or document receives an ASD-STE100 compliance claim. A successful validator reports `Standards authoring checks passed.`

The glossary controls repository engineering terms. Code identifiers, product names, paths, and exact technical terms need no general-word dictionary entry.

### Prose measures

- A list or procedure sentence has at most 20 words.
- Any other prose sentence has at most 25 words.
- A prose paragraph has one topic and at most six sentences.
- A table cell has at most 20 visible words.
- Headings, fenced code, metadata, URLs, and link destinations do not count.
- Inline code and literal identifiers each count as one word.
- Hyphenated, dotted, and path-like tokens each count as one word.

Controlled prose uses full forms such as `do not` and `cannot`. It excludes contractions, idioms, rhetorical fragments, unexplained pronouns, and `and/or`.

The banned vague terms are `etc.`, `and so on`, `as appropriate`, `as needed`, `simply`, `just`, and `basically`. They also include `obvious`, `obviously`, `clearly`, `very`, and `really`.

Active voice names the actor before the action. Passive voice is valid only when the actor is unknown or irrelevant.

Every procedure step starts with an imperative verb. Items in one list use parallel grammar.

Tables represent exact mappings or comparisons. Prose represents relationships that do not benefit from rows and columns.

Technical correctness, safety, and normative force take precedence over shorter wording.

### Quality tests

Every review applies four quality tests:

| Test | Review question |
|:---|:---|
| Simplicity | Does the text use familiar words and exact engineering terms? |
| Brevity | Does each word change meaning or help the reader act? |
| Clarity | Does the text state actor, condition, action, boundary, and evidence? |
| Humanity | Does the text use a professional voice, useful rationale, and realistic examples? |

### Page authority

Standards define required boundaries. Conventions define replaceable defaults. Intent, rationale, examples, summaries, guides, and indexes are informative.

`AGENTS.md` and Agent Summary sections are concise projections. Every projected policy cites its canonical provision ID. A projection cannot introduce or strengthen an obligation.

`CONTRIBUTING.md` owns contribution workflow and review. `CHANGELOG.md` is the only repository release note.

Current standards material is the published snapshot. The validator evaluates current material, not release history.

### Release model

Each standards release is a complete contract. A release states every active provision without depending on an earlier release.

The repository publishes no compatibility guarantee between its own releases. The repository publishes no migration path, deprecation period, replacement map, or identifier alias.

A consumer pins one release and keeps that release for as long as the consumer chooses. A consumer adopts a later release by accepting that release's complete contract, and absorbs every difference at that moment.

`CHANGELOG.md` records what changed between releases. The changelog describes the current contract and prescribes no transition path.

Version numbers identify complete pinned contracts. They do not claim Semantic Versioning compatibility. A patch release corrects a narrow contract area. A minor release makes one coherent standards evolution. A major release replaces supported scope, method, or platform profile.

This release model governs the standards repository. A consumer product is a running service with its own users. Consumer API compatibility, schema migration, deprecation, and rollback stay required wherever their owning provisions and extensions apply.

### Page contracts

| Page class | Required H2 order |
|:---|:---|
| Topic | Intent, Agent Summary, optional Concepts, Standards, Conventions, optional Reference example, Verification |
| Profile | Intent, Agent Summary, Standards, Composition, Conventions, Verification |
| Extension | Intent, Activation, Baseline relationship, Agent Summary, Standards, Conventions, Dependencies, Verification |
| Guide | Purpose, optional Prerequisites, Procedure, Verification |
| Index | Intent, then navigation groups |
| Glossary | Alphabetical term headings with one-sentence definitions and optional examples |

- A page that owns provisions lives at `docs/<area>/<page>.md`, with one lowercase word in each position.
- A guide or reference page uses a descriptive file name, because no identifier derives from it.
- A normative page has one H1 with a Title Case title.
- A provision heading uses sentence case, starts with an action verb, and ends with its ID.
- A required empty section contains only `None.`
- A Reference example is informative and lists every provision it demonstrates.
- Provision or Reference example blocks contain examples. A standalone Examples section is invalid.
- Guides and indexes contain no normative provisions.

### Standards provision contract

```markdown
### State one action (AREA.PAGE.TOPIC.001)

**Requirement:** The named actor MUST perform one testable action.

**Deviation:** A bounded reason permits deviation from this recommendation.

**Rationale:** Optional informative explanation.

**Example:** Optional informative example.
```

- `Requirement` contains exactly one sentence and one uppercase normative modal.
- Separate obligations, prohibitions, and permissions use separate IDs.
- `Deviation` appears only with `SHOULD` or `SHOULD NOT`.
- Conditions and scope appear in the Requirement sentence.
- Rationale and examples introduce no obligation.
- Syntax, naming, structure, state-transition, and cross-layer mapping provisions include examples.
- Explanatory prose inside a provision belongs to a labeled block.

The uppercase normative vocabulary is `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, and `MAY`. These meanings follow [RFC 2119](https://www.rfc-editor.org/info/rfc2119/) and [RFC 8174](https://www.rfc-editor.org/info/rfc8174/).

### Convention provision contract

```markdown
### Use the default name (AREA.PAGE.CONVENTION.001)

**Default:** Use the stated default for this boundary.

**Replacement:** A named local convention can replace this default.

**Rationale:** Optional informative explanation.

**Example:** Optional informative example.
```

Every actionable convention has an ID matching `AREA.PAGE.CONVENTION.NNN`. Convention blocks contain no uppercase normative modal.

The `overrides[].provisionId` field accepts only Standards IDs. A local convention cites its convention ID in owning local documentation.

### Provision identity

Every provision ID uses four uppercase segments: `AREA.PAGE.TOPIC.NNN`.

| Segment | Source | Purpose |
|:---|:---|:---|
| `AREA` | The directory under `docs/` | Names the subject area a reader loads |
| `PAGE` | The file stem | Names the one page that owns the assertion |
| `TOPIC` | `provisionRegistry.topics` in the manifest | Names the assertion inside that page |
| `NNN` | The authoring page | Orders assertions that share one topic |

The eight areas are `CORE`, `PROFILE`, `WORKSPACE`, `BACKEND`, `FRONTEND`, `BLAZOR`, `QUALITY`, and `EXT`. Each is one directory under `docs/`, and `provisionRegistry.areas` lists them.

`AREA.PAGE` is the page scope, and the page path states it: `docs/frontend/components.md` owns `FRONTEND.COMPONENTS`. A citation therefore names the file a reader must open, so `FRONTEND.COMPONENTS.OWNERSHIP.001` needs no lookup step.

Two pages cannot share a scope. The directory gives the area, and one directory holds no two files with one stem. The filesystem carries that uniqueness rule.

`CONVENTION` is a reserved `TOPIC` value. A replaceable default uses it and a Standards provision does not, so the ID states normative force. An `EXT` area marks a provision that applies only when its extension is active.

The topic vocabulary is closed. A topic names a concept rather than a count, so one concept never carries both a singular and a plural form. Adding a word means registering it, which keeps two pages from naming one concept differently.

A topic never repeats its page name. A second `STRUCTURE` segment on the workspace structure page would name nothing new, so the assertion about the root tree is `WORKSPACE.STRUCTURE.TREE.001`.

An active provision ID identifies its current assertion. A changed, split, merged, or newly normative provision receives a new ID.

### Summary contract

- An Agent Summary has at most ten bullets.
- Each bullet has at most 20 words.
- Each bullet ends with one or more valid provision IDs.
- A summary contains no uppercase normative modal.
- A summary selects frequent or high-risk provisions.
- A summary adds no absent condition, exception, or obligation.

### Verification contract

Every normative page ends with a Verification table:

```markdown
| ID | Method | Evidence |
|:---|:---|:---|
| AREA.PAGE.TOPIC.001 | static, test | `AreaPageTopicTests` asserts exact command, artifact, test, assertion, or observable result. |
```

The table contains exactly one row for every Standard and Convention ID on the page. Methods are `static`, `test`, `inspection`, and `operation`.

A row can combine distinct methods. Evidence names a command, path, test, artifact, assertion, or observable result.

Generic text such as `verify compliance` or `inspect evidence` is invalid.

## Standards

### Keep authored prose ASCII-safe (CORE.AUTHORING.ASCII.001)

**Requirement:** Authored prose MUST contain only ASCII unless required code, data, or mathematical content uses another character.

**Rationale:** ASCII prose remains stable in terminals, diffs, generated context, and plain-text tools.

**Example:** `Use a hyphen.` is ASCII text; a typographic dash is not.

### Exclude declared content paths from the ASCII check (CORE.AUTHORING.ASCII.002)

**Requirement:** An ASCII check MUST exclude only the natural-language content paths that the project record declares.

**Rationale:** A product whose subject is another language carries that language in its content files, where a diacritic is part of a word. Every document about that content stays in scope.

### Use one normative vocabulary (CORE.AUTHORING.NORMATIVE.002)

**Requirement:** A Standards provision MUST use exactly one approved uppercase modal and no other uppercase normative term.

**Rationale:** The Standards provision contract defines the approved modal set and its RFC interpretation.

### Apply controlled prose measures (CORE.AUTHORING.PROSE.001)

**Requirement:** Authored prose MUST satisfy the prose measures and omit contractions, idioms, fragments, unexplained pronouns, `and/or`, and banned vague terms.

**Rationale:** Bounded, direct prose reduces interpretation differences without weakening technical meaning.

### Use active and explicit sentences (CORE.AUTHORING.VOICE.001)

**Requirement:** Authored prose MUST use active voice, explicit actors, imperative procedure steps, parallel lists, and passive voice only when actors are irrelevant.

**Rationale:** Explicit actors and parallel actions make ownership and execution boundaries visible.

### Use one term for one concept (CORE.AUTHORING.TERM.001)

**Requirement:** Authored prose MUST use one glossary term per concept without copying ASD-STE100 vocabulary or claiming ASD-STE100 compliance.

**Rationale:** Repository terminology stays stable while exact code and product terms remain available.

**Example:** The validator reports `Standards authoring checks passed.`, not `This document is ASD-STE100 compliant.`

### Use controlled capitalization (CORE.AUTHORING.CASE.001)

**Requirement:** Authored prose MUST use Title Case for page titles and sentence case for provision headings and body text.

**Rationale:** Exact code names, layer names, product names, and sentence starts retain their normal capitalization.

### Apply the four quality tests (CORE.AUTHORING.QUALITY.001)

**Requirement:** A reviewer MUST assess authored prose for simplicity, brevity, clarity, and humanity before approval.

**Rationale:** Human review covers meaning and tone that deterministic checks cannot prove.

### Use the declared page contract (CORE.AUTHORING.PAGE.001)

**Requirement:** An authored page MUST use the required structure and heading rules for its page class.

**Rationale:** Stable page classes let readers find authority, context, defaults, and evidence predictably.

### Write atomic Standards provisions (CORE.AUTHORING.REQUIREMENT.001)

**Requirement:** A Standards provision MUST follow the Standards provision contract and provision identity policy defined by this page.

**Rationale:** One identified assertion has one authority and one verification mapping.

**Example:** `### Keep business invariants in Domain (BACKEND.ARCHITECTURE.DOMAIN.001)` owns one invariant-enforcement assertion.

### Use the declared identifier grammar (CORE.AUTHORING.IDENTIFIER.001)

**Requirement:** A provision ID MUST use four uppercase segments whose first two segments are the uppercased directory and file stem of its `docs/<area>/<page>.md` path.

**Rationale:** A path-derived scope makes each citation resolve to one file without a lookup, and the filesystem stops two pages from claiming one namespace.

**Example:** `FRONTEND.COMPONENTS.OWNERSHIP.001` names the frontend area, the components page, the ownership topic, and the first assertion.

### Use a registered topic segment (CORE.AUTHORING.IDENTIFIER.003)

**Requirement:** A provision ID topic MUST appear in `provisionRegistry.topics` within `standards.manifest.json`.

**Rationale:** A closed vocabulary stops two pages from naming one concept differently, and registering a word makes the addition visible in review.

**Example:** `STATE` is registered, so `BACKEND.DOMAIN.STATE.001` and `FRONTEND.RENDERING.STATE.001` name one concept.

### Restrict the CONVENTION segment to replaceable defaults (CORE.AUTHORING.IDENTIFIER.002)

**Requirement:** A Standards provision ID MUST NOT contain the `CONVENTION` segment.

**Rationale:** The segment is the only signal of normative force inside an identifier, so a Standard that borrows it reads as a replaceable default.

**Example:** `CORE.AUTHORING.DEFAULTS.001` states a required obligation, and `CORE.AUTHORING.CONVENTION.001` states a default a project can replace.

### Identify actionable conventions (CORE.AUTHORING.DEFAULTS.001)

**Requirement:** An actionable Convention provision MUST follow the Convention provision contract defined by this page.

**Rationale:** A distinct ID makes each replaceable default traceable without turning it into a Standards override.

### Keep Agent Summaries informative (CORE.AUTHORING.SUMMARY.001)

**Requirement:** An Agent Summary MUST follow the summary contract without adding authority to its cited projections.

**Rationale:** Tier 1 context stays short while the full provision remains canonical.

### Attach examples to their provisions (CORE.AUTHORING.EXAMPLE.001)

**Requirement:** An informative example MUST belong to its provision or a Reference example that lists every demonstrated provision.

**Rationale:** Readers can distinguish an illustration from an independent obligation.

### Map provisions to evidence (CORE.AUTHORING.VERIFICATION.001)

**Requirement:** A normative page MUST map every Standard and Convention ID through the verification contract.

**Rationale:** Exact evidence makes each provision reviewable by humans and tools.

### Regenerate the provision index (CORE.AUTHORING.INDEX.001)

**Requirement:** A standards change MUST leave `docs/reference/provisions.md` equal to the output of `node tools/generate-provisions.mjs`.

**Rationale:** One generated page resolves every ID to its heading and owning page, so a reader follows a citation in one step instead of searching.

**Example:** The page lists `FRONTEND.COMPONENTS.OWNERSHIP.001` with its heading and a link into `frontend/components.md`.

### Declare structured specification metadata (CORE.AUTHORING.METADATA.002)

**Requirement:** A structured consumer specification MUST open with a `---` delimited JSON block satisfying `schemas/specification-metadata.schema.json` for its declared kind.

**Rationale:** The opening and closing delimiters are each a line containing only `---`, and the block between them is one JSON object.

**Example:** A use-case specification opens with this carrier.

```markdown
---
{
  "kind": "use-case",
  "id": "orders.cancel-order",
  "specStatus": "approved",
  "implementationStatus": "planned",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "operationType": "command",
  "actors": ["buyer"],
  "entryPoints": [],
  "risks": [],
  "applicableExtensions": []
}
---
```

### Use one metadata carrier (CORE.AUTHORING.METADATA.003)

**Requirement:** A structured consumer specification MUST use its opening JSON block as its only metadata carrier.

**Rationale:** Source links, implementation paths, and verification evidence belong in relevant body sections.

### Run repeatable authoring checks (CORE.AUTHORING.VALIDATION.001)

**Requirement:** A standards change MUST pass the authoring fixture suite, repository validator, applicable specialist validators, and `git diff --check`.

**Rationale:** Every skipped check appears with its exact reason in the change report.

### Validate current standards material (CORE.AUTHORING.SNAPSHOT.001)

**Requirement:** The standards validator MUST evaluate only current standards material.

**Rationale:** Each pinned release is a complete snapshot. Changelog and Git history provide release context outside validation.

### Exclude historical transition material (CORE.AUTHORING.SNAPSHOT.002)

**Requirement:** Current standards material MUST NOT contain history-specific paths, IDs, terminology, aliases, replacement maps, standards-release migration material, compatibility rules, or transition checks.

**Rationale:** The published snapshot states its own contract without carrying previous releases forward.

### Publish each release as a complete contract (CORE.AUTHORING.SNAPSHOT.003)

**Requirement:** A standards release MUST state every active provision without depending on an earlier release.

**Rationale:** A consumer reads one pinned snapshot and needs no other release to determine its obligations.

### Exclude cross-release compatibility work (CORE.AUTHORING.SNAPSHOT.004)

**Requirement:** The standards repository MUST NOT publish a compatibility guarantee, migration path, deprecation period, or identifier alias between its own releases.

**Rationale:** The standards are a pinned contract rather than a running service. A consumer product keeps its own API compatibility, migration, deprecation, and rollback provisions.

### Keep a pinned release for as long as it serves (CORE.AUTHORING.SNAPSHOT.005)

**Requirement:** A consumer MAY keep any published standards release for as long as that consumer chooses.

**Rationale:** Adoption is a consumer decision, and no repository change obliges a consumer to move to a later release.

### Record the reviewed standards release (CORE.AUTHORING.SNAPSHOT.006)

**Requirement:** A consumer MUST record the standards release it last reviewed in `reviewedStandardsVersion` within `standards.project.json`.

**Rationale:** A provision can gain force while keeping its identifier, so an override written against an earlier release would otherwise apply to a rule nobody reread. The recorded release makes adoption an explicit act.

## Conventions

### Prefer direct action headings (CORE.AUTHORING.CONVENTION.001)

**Default:** Start a provision heading with a concrete action verb.

**Replacement:** Use a concept heading only for informative definitions and indexes.

### Prefer positive instructions (CORE.AUTHORING.CONVENTION.002)

**Default:** State the required action positively when the positive form defines the complete boundary.

**Replacement:** Use a prohibition when unsafe or invalid behavior needs an explicit boundary.

### Use tables for exact mappings (CORE.AUTHORING.CONVENTION.003)

**Default:** Use a table for repeated fields, fixed comparisons, or exact evidence mappings.

**Replacement:** Use prose when row and column structure does not improve interpretation.

## Reference example

This informative example demonstrates `CORE.AUTHORING.REQUIREMENT.001`, `CORE.AUTHORING.EXAMPLE.001`, and `CORE.AUTHORING.VERIFICATION.001`.

```markdown
### Keep the layer package-free (AREA.PAGE.PACKAGES.001)

**Requirement:** The named project MUST contain no persistence, web, mediator, logging, or dependency-injection package reference.

**Rationale:** The layer stays independent from hosting and storage choices.

**Example:** `Example.Domain.csproj` references no Marten or ASP.NET Core package.
```

The identifier above is a grammar placeholder. A real page uses the scope that the manifest declares for it.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| CORE.AUTHORING.ASCII.001 | static | `node tools/validate-standards.mjs` emits no `PROSE_NON_ASCII` diagnostic. |
| CORE.AUTHORING.ASCII.002 | inspection | The project record lists each excluded content path, and review confirms documents about that content stay in scope. |
| CORE.AUTHORING.NORMATIVE.002 | inspection | The provision parser reports one approved modal, and review confirms its intended force. |
| CORE.AUTHORING.PROSE.001 | static | `WritingProseTests` asserts the prose scanner reports no length, contraction, or banned-term diagnostic. |
| CORE.AUTHORING.VOICE.001 | inspection | The pull request checklist records actor, voice, procedure, and list review. |
| CORE.AUTHORING.TERM.001 | inspection | Terminology review compares new terms with `docs/reference/glossary.md`. |
| CORE.AUTHORING.CASE.001 | inspection | The heading scanner passes, and review confirms exact technical capitalization. |
| CORE.AUTHORING.QUALITY.001 | inspection | The pull request checklist records all four quality-test results. |
| CORE.AUTHORING.PAGE.001 | static | `WritingPageTests` asserts the page parser reports the declared H1 and H2 contract. |
| CORE.AUTHORING.REQUIREMENT.001 | inspection | The provision parser passes, and review confirms one assertion for each active ID. |
| CORE.AUTHORING.IDENTIFIER.001 | static | `node tools/validate-standards.mjs` emits no `ID_SCOPE_MISMATCH`, `ID_PAGE_FILENAME`, or `ID_AREA_UNKNOWN` diagnostic. |
| CORE.AUTHORING.IDENTIFIER.002 | static | `node tools/validate-standards.cases.mjs` asserts the parser rejects a Standard whose ID ends in a `CONVENTION` segment. |
| CORE.AUTHORING.IDENTIFIER.003 | static | `node tools/validate-standards.mjs` emits no `ID_TOPIC_UNKNOWN`, `ID_TOPIC_DUPLICATE`, `ID_TOPIC_UNUSED`, or `ID_TOPIC_REPEATS_PAGE` diagnostic. |
| CORE.AUTHORING.DEFAULTS.001 | static | `WritingTests` asserts the parser resolves each Convention ID, Default, Replacement, and Verification row. |
| CORE.AUTHORING.SUMMARY.001 | inspection | The summary parser resolves every citation, and review compares each projection with its source. |
| CORE.AUTHORING.EXAMPLE.001 | inspection | Review links each required example to its owning provision or Reference example. |
| CORE.AUTHORING.VERIFICATION.001 | static | `WritingVerificationTests` asserts the evidence mapper reports one exact row for every page provision. |
| CORE.AUTHORING.INDEX.001 | static | `node tools/generate-provisions.mjs --check` exits zero, and the repository validator emits no `PROVISIONS_STALE` diagnostic. |
| CORE.AUTHORING.METADATA.002 | static | `node tools/validate-consumer.mjs` validates opening JSON against the metadata schema. |
| CORE.AUTHORING.METADATA.003 | static | `node tools/validate-consumer.mjs` reports no duplicate metadata carrier. |
| CORE.AUTHORING.VALIDATION.001 | static | `WritingValidationTests` asserts cI records zero exits for authoring cases, repository validation, specialist checks, and diff checks. |
| CORE.AUTHORING.SNAPSHOT.001 | static | `node tools/validate-standards.mjs` evaluates current standards material only. |
| CORE.AUTHORING.SNAPSHOT.002 | inspection | Pull request review finds no history-specific material in active files. |
| CORE.AUTHORING.SNAPSHOT.003 | inspection | Release review confirms each active provision resolves without reference to an earlier release. |
| CORE.AUTHORING.SNAPSHOT.004 | inspection | Pull request review finds no cross-release compatibility, migration, deprecation, or alias material. |
| CORE.AUTHORING.SNAPSHOT.005 | inspection | Review confirms no active provision requires a consumer to adopt a later standards release. |
| CORE.AUTHORING.SNAPSHOT.006 | static | `node standards/tools/validate-consumer.mjs` fails when `reviewedStandardsVersion` differs from the pinned manifest version. |
| CORE.AUTHORING.CONVENTION.001 | inspection | Review records the action verb used by every changed provision heading. |
| CORE.AUTHORING.CONVENTION.002 | inspection | Review identifies the unsafe boundary behind every retained negative instruction. |
| CORE.AUTHORING.CONVENTION.003 | inspection | Review confirms that each changed table represents an exact mapping or comparison. |
