# Authoring Standard

## Intent

The standards use one document grammar and one controlled technical prose profile. This foundation is the canonical source for standards authoring.

## Agent Summary {#agent-summary}

- Use controlled technical prose with repository terminology. (WRITING.PROSE.001, WRITING.TERM.001)
- Write one testable obligation in each Standards provision. (WRITING.NORMATIVE.002, WRITING.REQUIREMENT.001)
- Give each actionable default a distinct convention ID. (WRITING.CONVENTION.001)
- Apply the declared contract for each page class. (WRITING.PAGE.001)
- Keep summaries informative and cite every projected provision. (WRITING.SUMMARY.001)
- Map every provision to exact verification evidence. (WRITING.VERIFICATION.001)
- Validate only current standards material. (WRITING.SNAPSHOT.001, WRITING.SNAPSHOT.002)
- Publish complete releases and no cross-release compatibility work. (WRITING.SNAPSHOT.003, WRITING.SNAPSHOT.004, WRITING.SNAPSHOT.005)
- Run the dependency-free authoring checks before review. (WRITING.VALIDATION.001)

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

### Document authority

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
| Foundation or convention | Intent, Agent Summary, optional Concepts, Standards, Conventions, optional Reference example, Verification |
| Profile | Intent, Agent Summary, Standards, Composition, Conventions, Verification |
| Extension | Intent, Activation, Baseline relationship, Agent Summary, Standards, Conventions, Dependencies, Verification |
| Guide | Purpose, optional Prerequisites, Procedure, Verification |
| Index | Intent, then navigation groups |
| Glossary | Alphabetical term headings with one-sentence definitions and optional examples |

- A normative page has one H1 with a Title Case title.
- A provision heading uses sentence case, starts with an action verb, and ends with its ID.
- A required empty section contains only `None.`
- A Reference example is informative and lists every provision it demonstrates.
- Provision or Reference example blocks contain examples. A standalone Examples section is invalid.
- Guides and indexes contain no normative provisions.

### Standards provision contract

```markdown
### State one action (SCOPE.TOPIC.001)

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
### Use the default name (SCOPE.CONVENTION.001)

**Default:** Use the stated default for this boundary.

**Replacement:** A named local convention can replace this default.

**Rationale:** Optional informative explanation.

**Example:** Optional informative example.
```

Every actionable convention has an ID matching `<OWNING-SCOPE>.CONVENTION.<NNN>`. Convention blocks contain no uppercase normative modal.

The `overrides[].ruleId` field accepts only Standards IDs. A local convention cites its convention ID in owning local documentation.

### Provision identity

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
| SCOPE.TOPIC.001 | static, test | Exact command, artifact, test, assertion, or observable result. |
```

The table contains exactly one row for every Standard and Convention ID on the page. Methods are `static`, `test`, `inspection`, and `operation`.

A row can combine distinct methods. Evidence names a command, path, test, artifact, assertion, or observable result.

Generic text such as `verify compliance` or `inspect evidence` is invalid.

## Standards

### Keep authored prose ASCII-safe (WRITING.ASCII.001)

**Requirement:** Authored prose MUST contain only ASCII unless required code, data, or mathematical content uses another character.

**Rationale:** ASCII prose remains stable in terminals, diffs, generated context, and plain-text tools.

**Example:** `Use a hyphen.` is ASCII text; a typographic dash is not.

### Use one normative vocabulary (WRITING.NORMATIVE.002)

**Requirement:** A Standards provision MUST use exactly one approved uppercase modal and no other uppercase normative term.

**Rationale:** The Standards provision contract defines the approved modal set and its RFC interpretation.

### Apply controlled prose measures (WRITING.PROSE.001)

**Requirement:** Authored prose MUST satisfy the prose measures and omit contractions, idioms, fragments, unexplained pronouns, `and/or`, and banned vague terms.

**Rationale:** Bounded, direct prose reduces interpretation differences without weakening technical meaning.

### Use active and explicit sentences (WRITING.VOICE.001)

**Requirement:** Authored prose MUST use active voice, explicit actors, imperative procedure steps, parallel lists, and passive voice only when actors are irrelevant.

**Rationale:** Explicit actors and parallel actions make ownership and execution boundaries visible.

### Use one term for one concept (WRITING.TERM.001)

**Requirement:** Authored prose MUST use one glossary term per concept without copying ASD-STE100 vocabulary or claiming ASD-STE100 compliance.

**Rationale:** Repository terminology stays stable while exact code and product terms remain available.

**Example:** The validator reports `Standards authoring checks passed.`, not `This document is ASD-STE100 compliant.`

### Use controlled capitalization (WRITING.CASE.001)

**Requirement:** Authored prose MUST use Title Case for document titles and sentence case for provision headings and body text.

**Rationale:** Exact code names, layer names, product names, and sentence starts retain their normal capitalization.

### Apply the four quality tests (WRITING.QUALITY.001)

**Requirement:** A reviewer MUST assess authored prose for simplicity, brevity, clarity, and humanity before approval.

**Rationale:** Human review covers meaning and tone that deterministic checks cannot prove.

### Use the declared page contract (WRITING.PAGE.001)

**Requirement:** An authored page MUST use the required structure and heading rules for its page class.

**Rationale:** Stable page classes let readers find authority, context, defaults, and evidence predictably.

### Write atomic Standards provisions (WRITING.REQUIREMENT.001)

**Requirement:** A Standards provision MUST follow the Standards provision contract and provision identity policy defined by this foundation.

**Rationale:** One identified assertion has one authority and one verification mapping.

**Example:** `### Keep Domain package-free (ARCH.DOMAIN.001)` owns one Domain dependency assertion.

### Identify actionable conventions (WRITING.CONVENTION.001)

**Requirement:** An actionable Convention provision MUST follow the Convention provision contract defined by this foundation.

**Rationale:** A distinct ID makes each replaceable default traceable without turning it into a Standards override.

### Keep Agent Summaries informative (WRITING.SUMMARY.001)

**Requirement:** An Agent Summary MUST follow the summary contract without adding authority to its cited projections.

**Rationale:** Tier 1 context stays short while the full provision remains canonical.

### Attach examples to their provisions (WRITING.EXAMPLE.001)

**Requirement:** An informative example MUST belong to its provision or a Reference example that lists every demonstrated provision.

**Rationale:** Readers can distinguish an illustration from an independent obligation.

### Map provisions to evidence (WRITING.VERIFICATION.001)

**Requirement:** A normative page MUST map every Standard and Convention ID through the verification contract.

**Rationale:** Exact evidence makes each provision reviewable by humans and tools.

### Declare structured specification metadata (WRITING.METADATA.002)

**Requirement:** A structured consumer specification MUST start with one JSON block satisfying `schemas/specification-metadata.schema.json` for its declared kind.

**Example:** A use case declares kind, ID, authority status, implementation status, owner, review date, operation data, risks, and extensions.

### Use one metadata carrier (WRITING.METADATA.003)

**Requirement:** A structured consumer specification MUST use its opening JSON block as its only metadata carrier.

**Rationale:** Source links, implementation paths, and verification evidence belong in relevant body sections.

### Run repeatable authoring checks (WRITING.VALIDATION.001)

**Requirement:** A standards change MUST pass the authoring fixture suite, repository validator, applicable specialist validators, and `git diff --check`.

**Rationale:** Every skipped check appears with its exact reason in the change report.

### Validate current standards material (WRITING.SNAPSHOT.001)

**Requirement:** The standards validator MUST evaluate only current standards material.

**Rationale:** Each pinned release is a complete snapshot. Changelog and Git history provide release context outside validation.

### Exclude historical transition material (WRITING.SNAPSHOT.002)

**Requirement:** Current standards material MUST NOT contain history-specific paths, IDs, terminology, aliases, replacement maps, standards-release migration material, compatibility rules, or transition checks.

**Rationale:** The published snapshot states its own contract without carrying previous releases forward.

### Publish each release as a complete contract (WRITING.SNAPSHOT.003)

**Requirement:** A standards release MUST state every active provision without depending on an earlier release.

**Rationale:** A consumer reads one pinned snapshot and needs no other release to determine its obligations.

### Exclude cross-release compatibility work (WRITING.SNAPSHOT.004)

**Requirement:** The standards repository MUST NOT publish a compatibility guarantee, migration path, deprecation period, or identifier alias between its own releases.

**Rationale:** The standards are a pinned contract rather than a running service. A consumer product keeps its own API compatibility, migration, deprecation, and rollback provisions.

### Keep a pinned release for as long as it serves (WRITING.SNAPSHOT.005)

**Requirement:** A consumer MAY keep any published standards release for as long as that consumer chooses.

**Rationale:** Adoption is a consumer decision, and no repository change obliges a consumer to move to a later release.

## Conventions

### Prefer direct action headings (WRITING.HEADING.CONVENTION.001)

**Default:** Start a provision heading with a concrete action verb.

**Replacement:** Use a concept heading only for informative definitions and indexes.

### Prefer positive instructions (WRITING.INSTRUCTION.CONVENTION.001)

**Default:** State the required action positively when the positive form defines the complete boundary.

**Replacement:** Use a prohibition when unsafe or invalid behavior needs an explicit boundary.

### Use tables for exact mappings (WRITING.TABLE.CONVENTION.001)

**Default:** Use a table for repeated fields, fixed comparisons, or exact evidence mappings.

**Replacement:** Use prose when row and column structure does not improve interpretation.

## Reference example

This informative example demonstrates `WRITING.REQUIREMENT.001`, `WRITING.EXAMPLE.001`, and `WRITING.VERIFICATION.001`.

```markdown
### Keep Domain package-free (ARCH.DOMAIN.001)

**Requirement:** The Domain project MUST contain no persistence, web, mediator, logging, or dependency-injection package reference.

**Rationale:** Domain rules remain independent from hosting and storage choices.

**Example:** `Example.Domain.csproj` references no Marten or ASP.NET Core package.
```

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| WRITING.ASCII.001 | static | `node tools/validate-standards.mjs` emits no `PROSE_NON_ASCII` diagnostic. |
| WRITING.NORMATIVE.002 | static, inspection | The provision parser reports one approved modal, and review confirms its intended force. |
| WRITING.PROSE.001 | static | The prose scanner reports no length, contraction, or banned-term diagnostic. |
| WRITING.VOICE.001 | inspection | The pull request checklist records actor, voice, procedure, and list review. |
| WRITING.TERM.001 | inspection | Terminology review compares new terms with `docs/reference/glossary.md`. |
| WRITING.CASE.001 | static, inspection | The heading scanner passes, and review confirms exact technical capitalization. |
| WRITING.QUALITY.001 | inspection | The pull request checklist records all four quality-test results. |
| WRITING.PAGE.001 | static | The page parser reports the declared H1 and H2 contract. |
| WRITING.REQUIREMENT.001 | static, inspection | The provision parser passes, and review confirms one assertion for each active ID. |
| WRITING.CONVENTION.001 | static | The parser resolves each Convention ID, Default, Replacement, and Verification row. |
| WRITING.SUMMARY.001 | static, inspection | The summary parser resolves every citation, and review compares each projection with its source. |
| WRITING.EXAMPLE.001 | inspection | Review links each required example to its owning provision or Reference example. |
| WRITING.VERIFICATION.001 | static | The evidence mapper reports one exact row for every page provision. |
| WRITING.METADATA.002 | static | `node tools/validate-consumer.mjs` validates opening JSON against the metadata schema. |
| WRITING.METADATA.003 | static | `node tools/validate-consumer.mjs` reports no duplicate metadata carrier. |
| WRITING.VALIDATION.001 | static | CI records zero exits for authoring cases, repository validation, specialist checks, and diff checks. |
| WRITING.SNAPSHOT.001 | static | `node tools/validate-standards.mjs` evaluates current standards material only. |
| WRITING.SNAPSHOT.002 | inspection | Pull request review finds no history-specific material in active files. |
| WRITING.SNAPSHOT.003 | inspection | Release review confirms each active provision resolves without reference to an earlier release. |
| WRITING.SNAPSHOT.004 | inspection | Pull request review finds no cross-release compatibility, migration, deprecation, or alias material. |
| WRITING.SNAPSHOT.005 | inspection | Review confirms no active provision requires a consumer to adopt a later standards release. |
| WRITING.HEADING.CONVENTION.001 | inspection | Review records the action verb used by every changed provision heading. |
| WRITING.INSTRUCTION.CONVENTION.001 | inspection | Review identifies the unsafe boundary behind every retained negative instruction. |
| WRITING.TABLE.CONVENTION.001 | inspection | Review confirms that each changed table represents an exact mapping or comparison. |
