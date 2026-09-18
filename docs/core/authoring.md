# Authoring Standard

## Intent

The standards use one page grammar and one controlled technical prose profile. This page is the canonical source for standards authoring.

## Agent Summary {#agent-summary}

- Use literal controlled prose, repository terminology, and a recorded vocabulary. (standards/rule/core-authoring.apply-controlled-prose-measures, standards/rule/core-authoring.apply-the-prose-measures-to-consumer-documentation, standards/rule/core-authoring.remove-a-reread-page-from-the-prose-baseline, standards/rule/core-authoring.state-meaning-literally, standards/rule/core-authoring.use-one-term-for-one-concept, standards/rule/core-authoring.record-the-project-vocabulary-as-data, standards/rule/core-authoring.reject-a-recorded-synonym-inside-its-scope, standards/rule/core-authoring.check-the-vocabulary-on-every-surface-a-reader-meets, standards/rule/core-authoring.exclude-the-compound-that-names-another-concept)
- Write one testable obligation in each Standards provision. (standards/rule/core-authoring.use-one-normative-vocabulary, standards/rule/core-authoring.write-atomic-standards-provisions)
- Name the kind, page, and heading in each ID. (standards/rule/core-authoring.use-the-declared-identifier-grammar, standards/rule/core-authoring.name-the-owning-page-in-the-identifier, standards/rule/core-authoring.exclude-a-sequence-number-from-the-identifier)
- Keep a replaceable default under its Convention heading. (standards/rule/core-authoring.identify-actionable-conventions)
- Route the reader, apply each page contract, and state one layer per page. (standards/rule/core-authoring.use-the-declared-page-contract, standards/rule/core-authoring.route-the-reader-before-listing-pages, standards/rule/core-authoring.name-the-tool-rather-than-the-mechanism, standards/rule/core-authoring.state-one-layer-per-page, standards/rule/core-authoring.name-the-escape-from-every-abstraction, standards/rule/core-authoring.record-a-setting-as-reference)
- Keep summaries informative and cite every projected provision. (standards/rule/core-authoring.keep-agent-summaries-informative)
- Map every provision to exact verification evidence. (standards/rule/core-authoring.map-provisions-to-evidence)
- Validate current material and publish complete releases. (standards/rule/core-authoring.validate-current-standards-material, standards/rule/core-authoring.exclude-historical-transition-material, standards/rule/core-authoring.publish-each-release-as-a-complete-contract, standards/rule/core-authoring.exclude-cross-release-compatibility-work, standards/rule/core-authoring.keep-a-pinned-release-for-as-long-as-it-serves, standards/rule/core-authoring.record-the-reviewed-standards-release)
- Classify every specification file and derive every computed fact. (standards/rule/core-authoring.classify-every-specification-file, standards/rule/core-authoring.derive-a-computed-fact-instead-of-restating-it)
- Run the authoring checks and regenerate the provision index. (standards/rule/core-authoring.run-repeatable-authoring-checks, standards/rule/core-authoring.regenerate-the-provision-index)

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

### Documentation layers

A reader arrives at one of four layers, and each layer answers a different question. A page states one layer, so a reader who opened it for one question does not read another reader's answer.

| Layer | Page class | The question it answers |
|:---|:---|:---|
| 1 | Tutorial | How do I get a first working result? |
| 2 | How-to | How do I reach this one stated goal? |
| 3 | Topic, Profile, Extension, Reference, Command, Configuration | What are the exact values, options, and defaults? |
| 4 | Underneath | What does the command run, and how do I run it myself? |

A topic, profile, and extension page each state exact obligations for a reader who already has the system running. Each one therefore sits at layer 3, beside the other exact-value pages.

An index and the glossary carry no layer. An index routes a reader to a page, and the glossary resolves one term. Neither answers a question about the subject itself.

The order is a reading order rather than an authoring order. A page links down to the next layer and never up. A reader who wants more detail always has one step available, and never has to take it.

Layer 4 has no page class of its own. It is the `Underneath` section of a command page, which is the one place a command page states its own mechanism. A wrapper with no way through it cannot be debugged when it fails.

### Page contracts

A directory names the class of every page inside it, and the class states the contract.

| Page class | Directory | Required H2 order |
|:---|:---|:---|
| Topic | `docs/<area>/` | Intent, Agent Summary, optional Concepts, Standards, Conventions, optional Reference example, Verification |
| Profile | `docs/profile/` | Intent, Agent Summary, Standards, Composition, Conventions, Verification |
| Extension | `docs/ext/` | Intent, Activation, Baseline relationship, Agent Summary, Standards, Conventions, Dependencies, Verification |
| Tutorial | `docs/tutorial/` | Purpose, Prerequisites, Lesson, What you built |
| How-to | `docs/guide/` | Purpose, optional Prerequisites, Procedure, Verification |
| Reference | `docs/reference/` | Intent, Reference, optional Notes |
| Command | `docs/tools/` | Name, Synopsis, Description, Arguments, Options, Exit codes, Examples, Underneath |
| Index | any `README.md` | Intent, then navigation groups |
| Glossary | `docs/reference/glossary.md` | Alphabetical term headings with one-sentence definitions and optional examples |

- A page that owns provisions lives at `docs/<area>/<page>.md`, with one lowercase word in each position.
- A tutorial, how-to, reference, or command page uses a descriptive file name, because no identifier derives from it.
- A normative page has one H1 with a Title Case title.
- A provision heading uses sentence case, starts with an action verb, and ends with its ID.
- A required empty section contains only `None.`
- A Reference example is informative and lists every provision it demonstrates.
- Provision or Reference example blocks contain examples. A standalone Examples section is invalid.
- A tutorial, how-to, reference, command, or index page contains no normative provisions.
- A tutorial states one path. An option, an alternative, or a branch belongs on a how-to page.

### Standards provision contract

```markdown
### State one action (standards/rule/page.state-one-action)

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
### Use the default name (standards/rule/page.use-the-default-name)

**Default:** Use the stated default for this boundary.

**Replacement:** A named local convention can replace this default.

**Rationale:** Optional informative explanation.

**Example:** Optional informative example.
```

A convention is a provision under a `## Conventions` heading. Its ID follows the same grammar as a Standard, and its heading names the replaceable default. Convention blocks contain no uppercase normative modal.

The `overrides[].provisionId` field accepts only Standards IDs. A local convention cites its convention ID in owning local documentation.

### Provision identity

Every provision ID follows `standards/<kind>/<page>.<heading-slug>`.

| Segment | Source | Purpose |
|:---|:---|:---|
| `standards` | The repository | Names the source that owns the provision |
| `<kind>` | The assertion class | Names one of `invariant`, `validation`, `authorization`, `acceptance-criterion`, `policy`, or `rule` |
| `<page>` | The `<area>-<stem>` of the page path | Names the one page that owns the assertion |
| `<heading-slug>` | The provision heading | Names the assertion the heading states |

The eight areas are `CORE`, `PROFILE`, `WORKSPACE`, `BACKEND`, `FRONTEND`, `BLAZOR`, `QUALITY`, and `EXT`. Each is one directory under `docs/`, and `provisionRegistry.areas` lists them.

The page segment joins the directory to the file stem, so `docs/frontend/components.md` owns `frontend-components`. A citation therefore names the file a reader must open, so `standards/rule/frontend-components.use-the-component-ownership-levels` needs no lookup step.

Two pages cannot share an identifier. The page segment carries the area, so `docs/frontend/structure.md` and `docs/blazor/structure.md` stay distinct even when they state one rule.

The heading slug is the kebab-case form of the heading with the parenthetical ID removed. A renamed heading renames the identifier, so the two never disagree.

A provision identifier carries no sequence number. A counter orders a provision against its siblings and names no assertion, which is what the heading slug already does.

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
| standards/rule/page.state-one-action | static, test | `WritingPageTests` asserts exact command, artifact, test, assertion, or observable result. |
```

The table contains exactly one row for every Standard and Convention ID on the page. Methods are `static`, `test`, `inspection`, and `operation`.

A row can combine distinct methods. Evidence names a command, path, test, artifact, assertion, or observable result.

Generic text such as `verify compliance` or `inspect evidence` is invalid.

## Standards

### Keep authored prose ASCII-safe (standards/rule/core-authoring.keep-authored-prose-ascii-safe)

**Requirement:** Authored prose MUST contain only ASCII unless required code, data, or mathematical content uses another character.

**Rationale:** ASCII prose remains stable in terminals, diffs, generated context, and plain-text tools.

**Example:** `Use a hyphen.` is ASCII text; a typographic dash is not.

### Exclude declared content paths from the ASCII check (standards/rule/core-authoring.exclude-declared-content-paths-from-the-ascii-check)

**Requirement:** An ASCII check MUST exclude only the natural-language content paths that the project record declares.

**Rationale:** A product whose subject is another language carries that language in its content files, where a diacritic is part of a word. Every document about that content stays in scope.

### Use one normative vocabulary (standards/rule/core-authoring.use-one-normative-vocabulary)

**Requirement:** A Standards provision MUST use exactly one approved uppercase modal and no other uppercase normative term.

**Rationale:** The Standards provision contract defines the approved modal set and its RFC interpretation.

### Apply controlled prose measures (standards/rule/core-authoring.apply-controlled-prose-measures)

**Requirement:** Authored prose MUST satisfy the prose measures and omit contractions, idioms, fragments, unexplained pronouns, `and/or`, and banned vague terms.

**Rationale:** Bounded, direct prose reduces interpretation differences without weakening technical meaning.

### Apply the prose measures to consumer documentation (standards/rule/core-authoring.apply-the-prose-measures-to-consumer-documentation)

**Requirement:** A consumer specification page MUST satisfy the prose measures unless the project prose baseline records that page.

**Rationale:** The profile applied only to this repository, so a consumer inherited the rule and no check. One consumer of 459 pages carried 5694 measure violations under a passing validator, because the run that reported the pass never looked.

**Example:** The baseline records the count and the review date a page's debt was accepted at.

```json
{ "pages": { "docs/domain/modules/sales/README.md": { "count": 58, "lastReviewed": "2026-08-25" } } }
```

### Remove a reread page from the prose baseline (standards/rule/core-authoring.remove-a-reread-page-from-the-prose-baseline)

**Requirement:** A change that advances a page's `lastReviewed` date MUST remove that page from the prose baseline.

**Rationale:** A baseline with no exit is a permanent exemption. `lastReviewed` already means a human read the page against the code. That reading is when the prose is in front of somebody, so the debt retires against work the project already performs.

### Use active and explicit sentences (standards/rule/core-authoring.use-active-and-explicit-sentences)

**Requirement:** Authored prose MUST use active voice, explicit actors, imperative procedure steps, parallel lists, and passive voice only when actors are irrelevant.

**Rationale:** Explicit actors and parallel actions make ownership and execution boundaries visible.

### State meaning literally (standards/rule/core-authoring.state-meaning-literally)

**Requirement:** Authored prose MUST NOT substitute metaphor or flourish for direct statement where a literal phrase carries the same meaning.

**Rationale:** A metaphor carries connotations its author did not choose. It also defeats terminology review, because a reader cannot tell whether a figure of speech names a defined concept or decorates one. A settlement route described as a rung on a ladder asserts an ordering that the three routes do not have.

**Example:** Write `a parameter worth varying`, not `a dial worth turning`. Write `this point still matters`, not `this point earns its keep`.

### Use one term for one concept (standards/rule/core-authoring.use-one-term-for-one-concept)

**Requirement:** Authored prose MUST use one glossary term per concept without copying ASD-STE100 vocabulary or claiming ASD-STE100 compliance.

**Rationale:** Repository terminology stays stable while exact code and product terms remain available.

**Example:** The validator reports `Standards authoring checks passed.`, not `This document is ASD-STE100 compliant.`

### Record the project vocabulary as data (standards/rule/core-authoring.record-the-project-vocabulary-as-data)

**Requirement:** A consumer MUST record each term, its rejected synonyms, the scope of each rejection, and its mannered terms in a language record satisfying `schemas/language.schema.json`.

**Rationale:** A glossary column headed `Avoid` states the rule to a reader and to nothing else. Prose cannot be checked against prose, so the same rule has to exist twice: once for the reader and once for the validator.

**Example:** A rejection carries the scope that binds it, because a word correct in one module is wrong in another.

```json
{ "term": "holder", "rejected": ["seller", "owner"], "scope": "^domain/modules/sales/ticket-resales/",
  "reason": "seller is the organizer in its disclosure role, so it names the other party here" }
```

### Reject a recorded synonym inside its scope (standards/rule/core-authoring.reject-a-recorded-synonym-inside-its-scope)

**Requirement:** Authored prose MUST NOT use a synonym that the project language record rejects for the scope the page sits in.

**Rationale:** Terminology drift is invisible one page at a time and plain across a module. The expensive case is a synonym that is a defined term elsewhere. The same word then names two parties, and no reader can tell which one is meant.

### Check the vocabulary on every surface a reader meets (standards/rule/core-authoring.check-the-vocabulary-on-every-surface-a-reader-meets)

**Requirement:** A consumer MUST name every non-Markdown surface its vocabulary reaches in `paths.languageScan`, including source, interface copy, the API contract, and acceptance tests.

**Rationale:** Documentation is usually the smallest of those surfaces, and the only one a Markdown scan reads. A vocabulary then holds where nobody reads it and drifts where everybody does. One consumer of 459 pages passed the check while its source, its 3,458 interface strings and its 34 feature files went unread. Every collision that consumer had lived in the unread half. A rejection also has to reach a name, which carries the word with no space around it. `SellerOrderId` breaches a rejection of `seller` exactly as a sentence does.

**Example:** A pattern matching no file is an error. A surface switched off in silence reports the same pass as a surface that is clean.

```json
{ "paths": { "languageScan": ["apps/*/lib/i18n/dictionaries/*.json", "apps/api/tests/**/*.feature"] } }
```

### Exclude the compound that names another concept (standards/rule/core-authoring.exclude-the-compound-that-names-another-concept)

**Requirement:** A language record MUST list, in `except`, every compound in which a rejected word names a concept other than the one the rejection is about.

**Rationale:** A rejection matches a word, and a word belongs to more than one term. One consumer rejected `reservation` across its inventory module, where the term is `checkout hold`. The module also documents a `uniqueness reservation`, which is a row in a registry and has no lifetime at all. Five pages reported a breach no edit could remove. Renaming the compound in one module would give one concept two names across the repository. That is the shape of a check somebody turns off.

**Example:** The exemption covers the compound and nothing else, so the bare word stays rejected in the same sentence.

```json
{ "term": "checkout hold", "rejected": ["reservation"], "scope": "^domain/modules/inventory/",
  "except": ["uniqueness reservation"], "reason": "one word for two rules with different lifetimes" }
```

### Use controlled capitalization (standards/rule/core-authoring.use-controlled-capitalization)

**Requirement:** Authored prose MUST use Title Case for page titles and sentence case for provision headings and body text.

**Rationale:** Exact code names, layer names, product names, and sentence starts retain their normal capitalization.

### Apply the four quality tests (standards/rule/core-authoring.apply-the-four-quality-tests)

**Requirement:** A reviewer MUST assess authored prose for simplicity, brevity, clarity, and humanity before approval.

**Rationale:** Human review covers meaning and tone that deterministic checks cannot prove.

### Use the declared page contract (standards/rule/core-authoring.use-the-declared-page-contract)

**Requirement:** An authored page MUST use the required structure and heading rules for its page class.

**Rationale:** Stable page classes let readers find authority, context, defaults, and evidence predictably.

### Name the tool rather than the mechanism (standards/rule/core-authoring.name-the-tool-rather-than-the-mechanism)

**Requirement:** A tutorial step or how-to step MUST name the repository command that performs that step, where one exists.

**Rationale:** A procedure that lists what a command already does becomes a second copy of that command, and the copy is the part that drifts.

**Example:** A step reads `Run \`entro up\`` rather than listing the compose start, the readiness wait, and each process launch.

### State one layer per page (standards/rule/core-authoring.state-one-layer-per-page)

**Requirement:** A page MUST NOT describe both a command and the mechanism that command runs, outside an `Underneath` section.

**Rationale:** A reader who wanted the command reads the mechanism as noise, and a reader who wanted the mechanism reads the command as an obstacle.

### Name the escape from every abstraction (standards/rule/core-authoring.name-the-escape-from-every-abstraction)

**Requirement:** A command page MUST state under `Underneath` what the command runs, or state that nothing beneath it is separately runnable.

**Rationale:** A wrapper nobody can see through is a wrapper nobody can debug, and it fails on somebody's machine eventually.

**Example:** A command with no separately runnable mechanism writes `None.` under `Underneath`.

### Record a setting as reference (standards/rule/core-authoring.record-a-setting-as-reference)

**Requirement:** A configuration setting a reader can change MUST appear on a configuration page with its default, its scope, and what overrides it.

**Rationale:** A setting introduced inside a procedure is findable only by the reader who already knows which procedure mentioned it.

### Write atomic Standards provisions (standards/rule/core-authoring.write-atomic-standards-provisions)

**Requirement:** A Standards provision MUST follow the Standards provision contract and provision identity policy defined by this page.

**Rationale:** One identified assertion has one authority and one verification mapping.

**Example:** `### Keep business invariants in Domain (standards/rule/backend-architecture.keep-business-invariants-in-domain)` owns one invariant-enforcement assertion.

### Use the declared identifier grammar (standards/rule/core-authoring.use-the-declared-identifier-grammar)

**Requirement:** A provision ID MUST follow `standards/<kind>/<page>.<heading-slug>`.

**Rationale:** The kind names the assertion class, the page names the file, and the slug names the assertion, so a citation resolves to one heading.

**Example:** `standards/rule/frontend-components.use-the-component-ownership-levels` names a rule on the frontend components page, and its slug restates its heading.

### Name the owning page in the identifier (standards/rule/core-authoring.name-the-owning-page-in-the-identifier)

**Requirement:** A provision ID page segment MUST name its own `docs/<area>/<page>.md` path as `<area>-<stem>`.

**Rationale:** The page segment names the file a reader opens, and the area keeps two pages with one stem distinct.

**Example:** `standards/rule/frontend-structure.organize-features-by-module-and-use-case` and `standards/rule/blazor-structure.organize-features-by-module-and-use-case` name two pages.

### Exclude a sequence number from the identifier (standards/rule/core-authoring.exclude-a-sequence-number-from-the-identifier)

**Requirement:** A provision ID MUST NOT contain a sequence number.

**Rationale:** A counter orders a provision against its siblings and names no assertion, which is what the heading slug already does.

**Example:** `standards/rule/core-authoring.apply-controlled-prose-measures` names one assertion; a trailing `-002` would order it against a sibling instead.

### Identify actionable conventions (standards/rule/core-authoring.identify-actionable-conventions)

**Requirement:** An actionable Convention provision MUST follow the Convention provision contract defined by this page.

**Rationale:** A distinct heading under `## Conventions` makes each replaceable default traceable without turning it into a Standards override.

### Keep Agent Summaries informative (standards/rule/core-authoring.keep-agent-summaries-informative)

**Requirement:** An Agent Summary MUST follow the summary contract without adding authority to its cited projections.

**Rationale:** Tier 1 context stays short while the full provision remains canonical.

### Attach examples to their provisions (standards/rule/core-authoring.attach-examples-to-their-provisions)

**Requirement:** An informative example MUST belong to its provision or a Reference example that lists every demonstrated provision.

**Rationale:** Readers can distinguish an illustration from an independent obligation.

### Map provisions to evidence (standards/rule/core-authoring.map-provisions-to-evidence)

**Requirement:** A normative page MUST map every Standard and Convention ID through the verification contract.

**Rationale:** Exact evidence makes each provision reviewable by humans and tools.

### Regenerate the provision index (standards/rule/core-authoring.regenerate-the-provision-index)

**Requirement:** A standards change MUST leave `docs/reference/provisions.md` equal to the output of `node tools/generate-provisions.mjs`.

**Rationale:** One generated page resolves every ID to its heading and owning page, so a reader follows a citation in one step instead of searching.

**Example:** The page lists `standards/rule/frontend-components.use-the-component-ownership-levels` with its heading and a link into `frontend/components.md`.

### Route the reader before listing pages (standards/rule/core-authoring.route-the-reader-before-listing-pages)

**Requirement:** A documentation root index MUST state which page class answers which reader question before its first navigation group.

**Rationale:** A reader who cannot tell a tutorial from a reference opens both and trusts neither.

**Example:** A `Which page do you want` section names each class in the reader's terms, one sentence for each.

### Declare structured specification metadata (standards/rule/core-authoring.declare-structured-specification-metadata)

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

### Use one metadata carrier (standards/rule/core-authoring.use-one-metadata-carrier)

**Requirement:** A structured consumer specification MUST use its opening JSON block as its only metadata carrier.

**Rationale:** Source links, implementation paths, and verification evidence belong in relevant body sections.

### Classify every specification file (standards/rule/core-authoring.classify-every-specification-file)

**Requirement:** Every Markdown file under the consumer documentation root MUST open with a Specification Metadata block or sit under a declared unstructured path.

**Rationale:** A file the validator cannot classify is skipped, and a skipped file is reported as sound. A directory index owning no aggregate, use case, or policy carries `section-index`.

**Example:** A navigation index declares its kind rather than omitting the block.

```markdown
---
{
  "kind": "section-index",
  "id": "policies",
  "specStatus": "approved",
  "owner": "platform",
  "lastReviewed": "2026-01-01"
}
---
```

### Derive a computed fact instead of restating it (standards/rule/core-authoring.derive-a-computed-fact-instead-of-restating-it)

**Requirement:** A specification MUST name the source or the command that produces any count, census, or membership list computed from code.

**Rationale:** A restated fact is accurate until the next unrelated commit, and nothing reports when it stops. A reader trusts a stale number as much as a fresh one.

**Example:** A page states the rule and the command rather than the total.

```markdown
Every command declares an audit position. To count the declarations:

    grep -rl "Audited(" src/Application --include=*.cs | wc -l
```

### Run repeatable authoring checks (standards/rule/core-authoring.run-repeatable-authoring-checks)

**Requirement:** A standards change MUST pass the authoring fixture suite, repository validator, applicable specialist validators, and `git diff --check`.

**Rationale:** Every skipped check appears with its exact reason in the change report.

### Validate current standards material (standards/rule/core-authoring.validate-current-standards-material)

**Requirement:** The standards validator MUST evaluate only current standards material.

**Rationale:** Each pinned release is a complete snapshot. Changelog and Git history provide release context outside validation.

### Exclude historical transition material (standards/rule/core-authoring.exclude-historical-transition-material)

**Requirement:** Current standards material MUST NOT contain history-specific paths, IDs, terminology, aliases, replacement maps, standards-release migration material, compatibility rules, or transition checks.

**Rationale:** The published snapshot states its own contract without carrying previous releases forward. The prohibited material is the kind that relates one release to another. An extension page's `Baseline relationship` section names a provision the extension replaces inside this release. A profile page's `Composition` section lists the pages this release composes. Neither section is history.

**Example:** An extension page naming the baseline provision it replaces states a relationship inside the current contract. A page recording that a provision carried another identifier in an earlier release states a relationship between releases, and is invalid.

### Publish each release as a complete contract (standards/rule/core-authoring.publish-each-release-as-a-complete-contract)

**Requirement:** A standards release MUST state every active provision without depending on an earlier release.

**Rationale:** A consumer reads one pinned snapshot and needs no other release to determine its obligations.

### Exclude cross-release compatibility work (standards/rule/core-authoring.exclude-cross-release-compatibility-work)

**Requirement:** The standards repository MUST NOT publish a compatibility guarantee, migration path, deprecation period, or identifier alias between its own releases.

**Rationale:** The standards are a pinned contract rather than a running service. A consumer product keeps its own API compatibility, migration, deprecation, and rollback provisions.

### Keep a pinned release for as long as it serves (standards/rule/core-authoring.keep-a-pinned-release-for-as-long-as-it-serves)

**Requirement:** A consumer MAY keep any published standards release for as long as that consumer chooses.

**Rationale:** Adoption is a consumer decision, and no repository change obliges a consumer to move to a later release.

### Record the reviewed standards release (standards/rule/core-authoring.record-the-reviewed-standards-release)

**Requirement:** A consumer MUST record the standards release it last reviewed in `reviewedStandardsVersion` within `standards.project.json`.

**Rationale:** A provision can gain force while keeping its identifier, so an override written against an earlier release would otherwise apply to a rule nobody reread. The recorded release makes adoption an explicit act.

## Conventions

### Prefer direct action headings (standards/rule/core-authoring.prefer-direct-action-headings)

**Default:** Start a provision heading with a concrete action verb.

**Replacement:** Use a concept heading only for informative definitions and indexes.

### Prefer positive instructions (standards/rule/core-authoring.prefer-positive-instructions)

**Default:** State the required action positively when the positive form defines the complete boundary.

**Replacement:** Use a prohibition when unsafe or invalid behavior needs an explicit boundary.

### Use tables for exact mappings (standards/rule/core-authoring.use-tables-for-exact-mappings)

**Default:** Use a table for repeated fields, fixed comparisons, or exact evidence mappings.

**Replacement:** Use prose when row and column structure does not improve interpretation.

## Reference example

This informative example demonstrates `standards/rule/core-authoring.write-atomic-standards-provisions`, `standards/rule/core-authoring.attach-examples-to-their-provisions`, and `standards/rule/core-authoring.map-provisions-to-evidence`.

```markdown
### Keep the layer package-free (standards/rule/page.keep-the-layer-package-free)

**Requirement:** The named project MUST contain no persistence, web, mediator, logging, or dependency-injection package reference.

**Rationale:** The layer stays independent from hosting and storage choices.

**Example:** `Example.Domain.csproj` references no Marten or ASP.NET Core package.
```

The identifier above is a grammar placeholder. A real page uses the page segment its own path derives.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/core-authoring.keep-authored-prose-ascii-safe | static | `node tools/validate-standards.mjs` emits no `PROSE_NON_ASCII` diagnostic. |
| standards/rule/core-authoring.exclude-declared-content-paths-from-the-ascii-check | inspection | The project record lists each excluded content path, and review confirms documents about that content stay in scope. |
| standards/rule/core-authoring.use-one-normative-vocabulary | inspection | The provision parser reports one approved modal, and review confirms its intended force. |
| standards/rule/core-authoring.apply-controlled-prose-measures | static | `WritingProseTests` asserts the prose scanner reports no length, contraction, or banned-term diagnostic. |
| standards/rule/core-authoring.apply-the-prose-measures-to-consumer-documentation | static | `node tools/validate-consumer.mjs` reports a page carrying a measure violation that the prose baseline does not record. |
| standards/rule/core-authoring.remove-a-reread-page-from-the-prose-baseline | static | `node tools/validate-consumer.mjs` fails when a baselined page's `lastReviewed` is later than the date its baseline entry records. |
| standards/rule/core-authoring.use-active-and-explicit-sentences | inspection | The pull request checklist records actor, voice, procedure, and list review. |
| standards/rule/core-authoring.state-meaning-literally | static, inspection | `node tools/validate-consumer.mjs` emits no `LANGUAGE_MANNERED_TERM` diagnostic, and review confirms each new figure of speech is literal or defined. |
| standards/rule/core-authoring.use-one-term-for-one-concept | inspection | Terminology review compares new terms with `docs/reference/glossary.md`. |
| standards/rule/core-authoring.record-the-project-vocabulary-as-data | static | `node tools/validate-consumer.mjs` validates the language record and names the checks a missing record switches off. |
| standards/rule/core-authoring.reject-a-recorded-synonym-inside-its-scope | static | `node tools/validate-consumer.mjs` emits no `LANGUAGE_REJECTED_SYNONYM` diagnostic. |
| standards/rule/core-authoring.check-the-vocabulary-on-every-surface-a-reader-meets | static | `node tools/validate-consumer.mjs` reports the non-Markdown surfaces scanned, and fails a pattern matching no file. |
| standards/rule/core-authoring.exclude-the-compound-that-names-another-concept | static | `node tools/validate-consumer.mjs` reports no `LANGUAGE_REJECTED_SYNONYM` diagnostic for a word inside a compound the record exempts. |
| standards/rule/core-authoring.use-controlled-capitalization | inspection | The heading scanner passes, and review confirms exact technical capitalization. |
| standards/rule/core-authoring.apply-the-four-quality-tests | inspection | The pull request checklist records all four quality-test results. |
| standards/rule/core-authoring.use-the-declared-page-contract | static | `WritingPageTests` asserts the page parser reports the declared H1 and H2 contract. |
| standards/rule/core-authoring.name-the-tool-rather-than-the-mechanism | inspection | Page review confirms each step names a shipped command where one performs that step. |
| standards/rule/core-authoring.state-one-layer-per-page | inspection | Page review confirms mechanism detail appears only under an `Underneath` section. |
| standards/rule/core-authoring.name-the-escape-from-every-abstraction | static | `node tools/validate-standards.mjs` emits no `PAGE_MISSING_SECTION` diagnostic for the required `Underneath` section of a command page. |
| standards/rule/core-authoring.record-a-setting-as-reference | inspection | Review confirms every setting named in a procedure resolves to a row on a configuration page. |
| standards/rule/core-authoring.write-atomic-standards-provisions | inspection | The provision parser passes, and review confirms one assertion for each active ID. |
| standards/rule/core-authoring.use-the-declared-identifier-grammar | static | `node tools/validate-standards.mjs` emits no `ID_SLUG_MISMATCH` or `ID_UNKNOWN_REFERENCE` diagnostic. |
| standards/rule/core-authoring.name-the-owning-page-in-the-identifier | static | `node tools/validate-standards.mjs` emits no `ID_SCOPE_MISMATCH`, `ID_PAGE_FILENAME`, or `ID_AREA_UNKNOWN` diagnostic. |
| standards/rule/core-authoring.exclude-a-sequence-number-from-the-identifier | inspection | Review confirms each changed identifier carries no sequence number. |
| standards/rule/core-authoring.identify-actionable-conventions | static | `WritingTests` asserts the parser resolves each Convention heading, Default, Replacement, and Verification row. |
| standards/rule/core-authoring.keep-agent-summaries-informative | inspection | The summary parser resolves every citation, and review compares each projection with its source. |
| standards/rule/core-authoring.attach-examples-to-their-provisions | inspection | Review links each required example to its owning provision or Reference example. |
| standards/rule/core-authoring.map-provisions-to-evidence | static | `WritingVerificationTests` asserts the evidence mapper reports one exact row for every page provision. |
| standards/rule/core-authoring.regenerate-the-provision-index | static | `node tools/generate-provisions.mjs --check` exits zero, and the repository validator emits no `PROVISIONS_STALE` diagnostic. |
| standards/rule/core-authoring.route-the-reader-before-listing-pages | static | `node tools/validate-standards.mjs` emits no `INDEX_MISSING_ROUTING` diagnostic for `docs/README.md`. |
| standards/rule/core-authoring.declare-structured-specification-metadata | static | `node tools/validate-consumer.mjs` validates opening JSON against the metadata schema. |
| standards/rule/core-authoring.use-one-metadata-carrier | static | `node tools/validate-consumer.mjs` reports no duplicate metadata carrier. |
| standards/rule/core-authoring.classify-every-specification-file | static | `node tools/validate-consumer.mjs` fails on a Markdown file with no metadata block outside a declared unstructured path. |
| standards/rule/core-authoring.derive-a-computed-fact-instead-of-restating-it | inspection | Review confirms each count, census, and membership list names its source or its command. |
| standards/rule/core-authoring.run-repeatable-authoring-checks | static | `WritingValidationTests` asserts cI records zero exits for authoring cases, repository validation, specialist checks, and diff checks. |
| standards/rule/core-authoring.validate-current-standards-material | static | `node tools/validate-standards.mjs` evaluates current standards material only. |
| standards/rule/core-authoring.exclude-historical-transition-material | inspection | Pull request review finds no history-specific material in active files. |
| standards/rule/core-authoring.publish-each-release-as-a-complete-contract | inspection | Release review confirms each active provision resolves without reference to an earlier release. |
| standards/rule/core-authoring.exclude-cross-release-compatibility-work | inspection | Pull request review finds no cross-release compatibility, migration, deprecation, or alias material. |
| standards/rule/core-authoring.keep-a-pinned-release-for-as-long-as-it-serves | inspection | Review confirms no active provision requires a consumer to adopt a later standards release. |
| standards/rule/core-authoring.record-the-reviewed-standards-release | static | `node standards/tools/validate-consumer.mjs` fails when `reviewedStandardsVersion` differs from the pinned manifest version. |
| standards/rule/core-authoring.prefer-direct-action-headings | inspection | Review records the action verb used by every changed provision heading. |
| standards/rule/core-authoring.prefer-positive-instructions | inspection | Review identifies the unsafe boundary behind every retained negative instruction. |
| standards/rule/core-authoring.use-tables-for-exact-mappings | inspection | Review confirms that each changed table represents an exact mapping or comparison. |
