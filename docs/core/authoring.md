# Authoring Standard

## Intent

The standards use one page grammar and one controlled technical prose profile. This page is the canonical source for standards authoring.

## Agent Summary {#agent-summary}

- Use literal controlled prose, repository terminology, and a recorded vocabulary. (standards/rule/core-authoring.apply-controlled-prose-measures, standards/rule/core-authoring.apply-the-prose-measures-to-consumer-documentation, standards/rule/core-authoring.exclude-generated-regions-from-prose-checks, standards/rule/core-authoring.state-meaning-literally, standards/rule/core-authoring.use-one-term-for-one-concept, standards/rule/core-authoring.record-the-project-vocabulary-as-data, standards/rule/core-authoring.reject-a-recorded-synonym-inside-its-scope, standards/rule/core-authoring.check-the-vocabulary-on-every-surface-a-reader-meets, standards/rule/core-authoring.exclude-the-compound-that-names-another-concept)
- Write one testable obligation in each Standards provision. (standards/rule/core-authoring.use-one-normative-vocabulary, standards/rule/core-authoring.write-atomic-standards-provisions)
- Name the kind, page, and heading in each ID. (standards/rule/core-authoring.use-the-declared-identifier-grammar, standards/rule/core-authoring.name-the-owning-page-in-the-identifier, standards/rule/core-authoring.exclude-a-sequence-number-from-the-identifier)
- Keep a replaceable default under its Convention heading. (standards/rule/core-authoring.identify-actionable-conventions)
- Route the reader, apply each page contract, and state one layer per page. (standards/rule/core-authoring.use-the-declared-page-contract, standards/rule/core-authoring.route-the-reader-before-listing-pages, standards/rule/core-authoring.name-the-tool-rather-than-the-mechanism, standards/rule/core-authoring.state-one-layer-per-page, standards/rule/core-authoring.name-the-escape-from-every-abstraction, standards/rule/core-authoring.record-a-setting-as-reference)
- Keep summaries informative and cite every projected provision. (standards/rule/core-authoring.keep-agent-summaries-informative)
- Map every provision to exact verification evidence. (standards/rule/core-authoring.map-provisions-to-evidence, standards/rule/core-authoring.mark-every-provision-checkable-or-guidance)
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
- A quotation does not count: a blockquote whose first character is a quotation mark holds a source's own words.
- Inline code and literal identifiers each count as one word.
- Hyphenated, dotted, and path-like tokens each count as one word.
- A generated region does not count.

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

In this repository, `AGENTS.md` and Agent Summary sections are concise projections. Every projected policy cites its canonical provision ID. A projection cannot introduce or strengthen an obligation. A consumer `AGENTS.md` carries Tier-0 instructions, which cite the project Exception records and local conventions.

`CONTRIBUTING.md` owns contribution workflow and review. `CHANGELOG.md` is the repository release note for the current major version, and `changelog/v<major>.md` holds each earlier major version.

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

The order is a reading order rather than an authoring order. A page links down to the next layer and never up. An index links to the pages it routes, and any page may link to the glossary. A reader who wants more detail always has one step available, and never has to take it.

Layer 4 has no page class of its own. It is the `Underneath` section of a command page, which is the one place a command page states its own mechanism. A wrapper with no way through it cannot be debugged when it fails.

### Page contracts

Every standards page uses one class below. Every consumer page uses one record template or one style below. The class, template, or style states the required sections.

| Page class | Template | Required H2 order |
|:---|:---|:---|
| Topic | `templates/standard/topic.md` | Intent, Agent Summary, optional Concepts, optional React and Svelte on frontend pages, Standards, Conventions, optional Reference example, Verification |
| Profile | This table states the contract. | Intent, Agent Summary, Standards, Composition, Conventions, Verification |
| Extension | `templates/standard/extension.md` | Intent, Activation, Baseline relationship, Agent Summary, Standards, Conventions, Dependencies, Verification |

| Style | Template | Required H2 order |
|:---|:---|:---|
| product-topic | `templates/consumer/product-topic.md` | Summary, The situation, What we do, Costs and risks, Evidence |
| permission-list | `templates/consumer/permission-list.md` | Permissions |
| entry-point-list | `templates/consumer/entry-point-list.md` | Entry points |
| limit-set | `templates/consumer/limit-set.md` | Limits |
| rule-set | `templates/consumer/rule-set.md` | Rules |
| index | This table states the contract. | Intent, then navigation groups |
| tutorial | `templates/consumer/tutorial.md` | Purpose, Prerequisites, Lesson, What you built |
| how-to | `templates/consumer/how-to.md` | Purpose, optional Prerequisites, Procedure, Verification |
| reference | `templates/consumer/reference.md` | Intent, Reference, optional Notes |
| command | `templates/consumer/command.md` | Name, Synopsis, Description, Arguments, Options, Exit codes, Examples, Underneath |
| configuration | `templates/consumer/configuration.md` | Intent, Settings, Precedence, optional Notes |
| glossary | `templates/consumer/glossary.md` | Alphabetical term headings with one-sentence definitions and optional examples |
| scenario-cast | `templates/consumer/scenario-cast.md` | The organization, The people, The occasion, The amounts, Recurring situations, optional What this page does not do |

A style with no template file follows the required order in this table.

- A page that owns provisions lives at `docs/<area>/<page>.md`, with one lowercase word in each position.
- A style page uses a descriptive file name, because no identifier derives from it.
- A normative page has one H1 with a Title Case title.
- A provision heading uses sentence case, starts with an action verb, and ends with its ID.
- A required empty section contains only `None.`
- A Reference example is informative and lists every provision it demonstrates.
- Provision or Reference example blocks contain examples. A standalone Examples section is invalid.
- A tutorial, how-to, reference, command, or index page contains no normative provisions.
- A tutorial states one path. An option, an alternative, or a branch belongs on a how-to page.

### Generated regions

A generated region is a body section a tool writes. It opens with `<!-- generated:<name> -->` and closes with `<!-- /generated:<name> -->`, where `<name>` identifies the region. Only the owning tool writes between the fences. Prose checks skip the region. An edit inside the fences is lost at the next generation.

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

A departure from a Standard is recorded as an Exception record citing the provision. A local convention cites its convention ID in owning local documentation. The [model page](model.md) states the Exception record shape.

### Provision identity

Every provision ID follows `standards/<kind>/<page>.<heading-slug>`.

| Segment | Source | Purpose |
|:---|:---|:---|
| `standards` | The repository | Names the source that owns the provision |
| `<kind>` | The assertion class | Names `rule` for every provision |
| `<page>` | The `<area>-<stem>` of the page path | Names the one page that owns the assertion |
| `<heading-slug>` | The provision heading | Names the assertion the heading states |

The ten areas are `CORE`, `PROFILE`, `WORKSPACE`, `BACKEND`, `FRONTEND`, `REACT`, `SVELTE`, `BLAZOR`, `QUALITY`, and `EXT`. Each is one directory under `docs/`, and `provisionRegistry.areas` lists them.

The page segment joins the directory to the file stem, so `docs/frontend/components.md` owns `frontend-components`. A citation therefore names the file a reader must open, so `standards/rule/frontend-components.compose-composites-in-page-code` needs no lookup step.

Two pages cannot share a page segment. The page segment carries the area, so `docs/frontend/structure.md` and `docs/blazor/structure.md` stay distinct even when they state one rule.

The heading slug is the kebab-case form of the heading with the parenthetical ID removed. A renamed heading renames the identifier, so the two never disagree.

A provision identifier carries no sequence number. A counter orders a provision against its siblings and names no assertion, which is what the heading slug already does.

An active provision ID identifies its current assertion. A changed, split, merged, or newly normative provision receives a new ID.

Consumer record identifiers follow the [identifier page](../backend/identifiers.md) and the [model page](model.md).

### Summary contract

- An Agent Summary has at most ten bullets.
- Each bullet ends with one or more valid provision IDs.
- A summary contains no uppercase normative modal.
- A summary selects frequent or high-risk provisions.
- A summary adds no absent condition, exception, or obligation.

### Verification contract

Every normative page ends with a Verification table:

```markdown
| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/page.state-one-action | checkable | `node tools/validate-standards.mjs` emits no `PAGE_MISSING_SECTION` diagnostic. |
```

Each row marks its provision `checkable` or `guidance`. A `checkable` row names the tool that checks the provision, and its evidence starts with that tool's command in backticks. A `guidance` row states the question a reviewer answers, in one sentence.

The table contains exactly one row for every Standard and Convention ID on the page.

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

**Requirement:** A consumer specification page MUST satisfy the prose measures.

**Rationale:** Consumer pages inherit the profile, so they need the same check the standards apply to their own pages. A page that cannot satisfy the measures yet is recorded as a Known gap, which carries an owner and an end date.

### Exclude generated regions from prose checks (standards/rule/core-authoring.exclude-generated-regions-from-prose-checks)

**Requirement:** A prose check MUST skip every generated region.

**Rationale:** A generated region holds tool output, and prose measures judge authored words. Counting generated words would fail a page for text no author wrote.

### Use active and explicit sentences (standards/rule/core-authoring.use-active-and-explicit-sentences)

**Requirement:** Authored prose MUST use active voice, explicit actors, imperative procedure steps, parallel lists, and passive voice only when actors are irrelevant.

**Rationale:** Explicit actors and parallel actions make ownership and execution boundaries visible.

### State meaning literally (standards/rule/core-authoring.state-meaning-literally)

**Requirement:** Authored prose MUST NOT substitute metaphor or flourish for direct statement where a literal phrase carries the same meaning.

**Rationale:** A metaphor carries connotations its author did not choose. It also defeats terminology review, because a reader cannot tell whether a figure of speech names a defined concept or decorates one.

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
{ "term": "customer", "rejected": ["client"], "scope": "^domain/modules/orders/",
  "reason": "client names the API consumer" }
```

### Reject a recorded synonym inside its scope (standards/rule/core-authoring.reject-a-recorded-synonym-inside-its-scope)

**Requirement:** Authored prose MUST NOT use a synonym that the project language record rejects for the scope the page sits in.

**Rationale:** Terminology drift is invisible one page at a time and plain across a module. The expensive case is a synonym that is a defined term elsewhere. The same word then names two parties, and no reader can tell which one is meant.

### Check the vocabulary on every surface a reader meets (standards/rule/core-authoring.check-the-vocabulary-on-every-surface-a-reader-meets)

**Requirement:** A consumer MUST name every non-Markdown surface its vocabulary reaches in `paths.languageScan`, including source, interface copy, the API contract, and acceptance tests.

**Rationale:** Documentation is usually the smallest of those surfaces, and the only one a Markdown scan reads. A vocabulary then holds where nobody reads it and drifts where everybody does. A project can pass the page check while its source, its interface strings and its feature files go unread. Its collisions then live in the unread half. A rejection also has to reach a name, which carries the word with no space around it. `ClientOrderId` breaches a rejection of `client` exactly as a sentence does.

**Example:** A pattern matching no file is an error. A surface switched off in silence reports the same pass as a surface that is clean.

```json
{ "paths": { "languageScan": ["apps/*/lib/i18n/dictionaries/*.json", "apps/api/tests/**/*.feature"] } }
```

### Exclude the compound that names another concept (standards/rule/core-authoring.exclude-the-compound-that-names-another-concept)

**Requirement:** A language record MUST list, in `except`, every compound in which a rejected word names a concept other than the one the rejection is about.

**Rationale:** A rejection matches a word, and a word belongs to more than one term. A library module can reject `reservation` where the term is `hold`, while its reading room still books a `reading-room reservation`. Without an exemption the check reports a breach no edit can remove, and that is the shape of a check somebody turns off.

**Example:** The exemption covers the compound and nothing else, so the bare word stays rejected in the same sentence.

```json
{ "term": "hold", "rejected": ["reservation"], "scope": "^docs/domain/modules/circulation/",
  "except": ["reading-room reservation"], "reason": "one word for a book hold and a seat booking" }
```

### Use controlled capitalization (standards/rule/core-authoring.use-controlled-capitalization)

**Requirement:** Authored prose MUST use Title Case for page titles, sentence case for provision headings, and normal capitalization for body text.

**Rationale:** Exact code names, layer names, product names, and sentence starts retain their normal capitalization.

### Apply the four quality tests (standards/rule/core-authoring.apply-the-four-quality-tests)

**Requirement:** A reviewer MUST assess authored prose for simplicity, brevity, clarity, and humanity before approval.

**Rationale:** Human review covers meaning and tone that deterministic checks cannot prove.

### Use the declared page contract (standards/rule/core-authoring.use-the-declared-page-contract)

**Requirement:** An authored page MUST use the required structure for its page class or style.

**Rationale:** Stable page classes let readers find authority, context, defaults, and evidence predictably.

### Name the tool rather than the mechanism (standards/rule/core-authoring.name-the-tool-rather-than-the-mechanism)

**Requirement:** A tutorial step or how-to step MUST name the repository command that performs that step, where one exists.

**Rationale:** A procedure that lists what a command already does becomes a second copy of that command, and the copy is the part that drifts.

**Example:** A step reads `Run \`./shop up\`` rather than listing the compose start, the readiness wait, and each process launch.

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

**Rationale:** The kind is `rule` for every provision. The page names the file, and the slug names the assertion, so a citation resolves to one heading.

**Example:** `standards/rule/frontend-components.compose-composites-in-page-code` names a rule on the frontend components page, and its slug restates its heading.

### Name the owning page in the identifier (standards/rule/core-authoring.name-the-owning-page-in-the-identifier)

**Requirement:** A provision ID page segment MUST name its own `docs/<area>/<page>.md` path as `<area>-<stem>`.

**Rationale:** The page segment names the file a reader opens, and the area keeps two pages with one stem distinct.

**Example:** `standards/rule/frontend-structure.mirror-the-backend-use-case-path-in-kebab-case` and `standards/rule/blazor-structure.organize-features-by-module-and-use-case` name two pages.

### Exclude a sequence number from the identifier (standards/rule/core-authoring.exclude-a-sequence-number-from-the-identifier)

**Requirement:** A provision ID MUST NOT contain a sequence number.

**Rationale:** A counter orders a provision against its siblings and names no assertion, which is what the heading slug already does.

**Example:** `standards/rule/core-authoring.apply-controlled-prose-measures` names one assertion; a trailing `-002` would order it against a sibling instead.

### Identify actionable conventions (standards/rule/core-authoring.identify-actionable-conventions)

**Requirement:** An actionable Convention provision MUST follow the Convention provision contract defined by this page.

**Rationale:** A distinct heading under `## Conventions` makes each replaceable default traceable without turning it into a Standards rule.

### Keep Agent Summaries informative (standards/rule/core-authoring.keep-agent-summaries-informative)

**Requirement:** An Agent Summary MUST follow the summary contract without adding authority to its cited projections.

**Rationale:** Tier 1 context stays short while the full provision remains canonical.

### Attach examples to their provisions (standards/rule/core-authoring.attach-examples-to-their-provisions)

**Requirement:** An informative example MUST belong to its provision or a Reference example that lists every demonstrated provision.

**Rationale:** Readers can distinguish an illustration from an independent obligation.

### Map provisions to evidence (standards/rule/core-authoring.map-provisions-to-evidence)

**Requirement:** A normative page MUST map every Standard and Convention ID through the verification contract.

**Rationale:** Exact evidence makes each provision reviewable by humans and tools.

### Mark every provision checkable or guidance (standards/rule/core-authoring.mark-every-provision-checkable-or-guidance)

**Requirement:** A Verification row MUST mark its provision `checkable` or `guidance`.

**Rationale:** The mark tells a reader whether a tool or a person judges the provision. An unmarked row leaves that question open.

### Regenerate the provision index (standards/rule/core-authoring.regenerate-the-provision-index)

**Requirement:** A standards change MUST leave `docs/reference/provisions.md` equal to the output of `node tools/generate-provisions.mjs`.

**Rationale:** One generated page resolves every ID to its heading and owning page, so a reader follows a citation in one step instead of searching.

**Example:** The page lists `standards/rule/frontend-components.compose-composites-in-page-code` with its heading and a link into `frontend/components.md`.

### Route the reader before listing pages (standards/rule/core-authoring.route-the-reader-before-listing-pages)

**Requirement:** A documentation root index MUST state which page class answers which reader question before its first navigation group.

**Rationale:** A reader who cannot tell a tutorial from a reference opens both and trusts neither.

**Example:** A `Which page do you want` section names each class in the reader's terms, one sentence for each.

### Declare structured specification metadata (standards/rule/core-authoring.declare-structured-specification-metadata)

**Requirement:** A consumer page MUST open with a frontmatter block satisfying the record schema for its declared type.

**Rationale:** The schema owns the field list for every record type and style. The block is one JSON object between two lines containing only `---`. The [model page](model.md) states the record types and their homes.

**Example:** A use-case page opens with this carrier.

```markdown
---
{
  "type": "use-case",
  "id": "use-case/orders.cancel-order",
  "title": "Cancel order",
  "owner": "__OWNER__",
  "status": "approved"
}
---
```

### Use one metadata carrier (standards/rule/core-authoring.use-one-metadata-carrier)

**Requirement:** A consumer page MUST use its opening frontmatter block as its only metadata carrier.

**Rationale:** Source links, implementation paths, and verification evidence belong in relevant body sections.

### Classify every specification file (standards/rule/core-authoring.classify-every-specification-file)

**Requirement:** Every Markdown file under the consumer documentation root MUST declare a record type or page style, or sit under a declared unstructured path.

**Rationale:** A file the validator cannot classify is skipped, and a skipped file is reported as sound. A directory index owning no record carries the index style.

**Example:** A navigation index declares its style rather than omitting the block.

```markdown
---
{
  "type": "index",
  "title": "Policies",
  "owner": "__OWNER__",
  "status": "approved"
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

**Requirement:** A standards change MUST pass the repository validator, every fixture suite, and `git diff --check`.

**Rationale:** Every skipped check appears with its exact reason in the change report. The tools README names each fixture suite and its command.

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

**Requirement:** A consumer MUST record the standards release it adopts in `reviewedStandardsVersion` within `standards.project.json`.

**Rationale:** A provision can gain force while keeping its identifier, so an Exception written against an earlier release would otherwise apply to a rule nobody reread. The recorded release makes adoption an explicit act.

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

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/core-authoring.keep-authored-prose-ascii-safe | checkable | `node tools/validate-standards.mjs` emits no `PROSE_NON_ASCII` diagnostic. |
| standards/rule/core-authoring.exclude-declared-content-paths-from-the-ascii-check | guidance | Does the project record name every path outside the ASCII check, with documents about that content still checked? |
| standards/rule/core-authoring.use-one-normative-vocabulary | checkable | `node tools/validate-standards.mjs` emits no `STANDARD_MODAL_COUNT` or `STANDARD_MODAL_VOCABULARY` diagnostic. |
| standards/rule/core-authoring.apply-controlled-prose-measures | checkable | `node tools/validate-standards.mjs` emits no `PROSE_SENTENCE_LENGTH`, `PROSE_LIST_LENGTH`, `PROSE_TABLE_CELL_LENGTH`, `PROSE_PARAGRAPH_LENGTH`, `PROSE_CONTRACTION`, or `PROSE_VAGUE_TERM` diagnostic. |
| standards/rule/core-authoring.apply-the-prose-measures-to-consumer-documentation | checkable | `node standards/tools/validate-consumer.mjs` reports prose-measure violations on consumer pages. |
| standards/rule/core-authoring.exclude-generated-regions-from-prose-checks | guidance | Does every prose check skip the text between generated-region fences? |
| standards/rule/core-authoring.use-active-and-explicit-sentences | guidance | Would a reader find the actor in every sentence, the verb in every step, and one grammar per list? |
| standards/rule/core-authoring.state-meaning-literally | guidance | Is every figure of speech either literal or a defined term? |
| standards/rule/core-authoring.use-one-term-for-one-concept | guidance | Would a reader meet each concept under one name only? |
| standards/rule/core-authoring.record-the-project-vocabulary-as-data | checkable | `node standards/tools/validate-consumer.mjs` validates the language record against the language schema. |
| standards/rule/core-authoring.reject-a-recorded-synonym-inside-its-scope | checkable | `node standards/tools/validate-consumer.mjs` emits no `LANGUAGE_REJECTED_SYNONYM` diagnostic. |
| standards/rule/core-authoring.check-the-vocabulary-on-every-surface-a-reader-meets | checkable | `node standards/tools/validate-consumer.mjs` scans every `languageScan` pattern and fails a pattern matching no file. |
| standards/rule/core-authoring.exclude-the-compound-that-names-another-concept | checkable | `node standards/tools/validate-consumer.mjs` reports no `LANGUAGE_REJECTED_SYNONYM` diagnostic inside an exempt compound. |
| standards/rule/core-authoring.use-controlled-capitalization | guidance | Do page titles use Title Case and provision headings sentence case? |
| standards/rule/core-authoring.apply-the-four-quality-tests | guidance | Did a reviewer assess the prose for simplicity, brevity, clarity, and humanity? |
| standards/rule/core-authoring.use-the-declared-page-contract | checkable | `node tools/validate-standards.mjs` emits no `PAGE_MISSING_SECTION`, `PAGE_SECTION_ORDER`, or `PAGE_UNKNOWN_SECTION` diagnostic. |
| standards/rule/core-authoring.name-the-tool-rather-than-the-mechanism | guidance | Does each procedure step name the shipped command that performs it? |
| standards/rule/core-authoring.state-one-layer-per-page | guidance | Does mechanism detail appear only under an `Underneath` section? |
| standards/rule/core-authoring.name-the-escape-from-every-abstraction | checkable | `node tools/validate-standards.mjs` emits no `PAGE_MISSING_SECTION` diagnostic for a command page. |
| standards/rule/core-authoring.record-a-setting-as-reference | guidance | Does every setting named in a procedure resolve to a configuration page row? |
| standards/rule/core-authoring.write-atomic-standards-provisions | checkable | `node tools/validate-standards.mjs` emits no `STANDARD_REQUIREMENT_COUNT`, `STANDARD_SENTENCE_COUNT`, or `STANDARD_LABEL_INVALID` diagnostic. |
| standards/rule/core-authoring.use-the-declared-identifier-grammar | checkable | `node tools/validate-standards.mjs` emits no `ID_SLUG_MISMATCH` or `ID_UNKNOWN_REFERENCE` diagnostic. |
| standards/rule/core-authoring.name-the-owning-page-in-the-identifier | checkable | `node tools/validate-standards.mjs` emits no `ID_SCOPE_MISMATCH` or `ID_PAGE_FILENAME` diagnostic. |
| standards/rule/core-authoring.exclude-a-sequence-number-from-the-identifier | guidance | Do changed identifiers name assertions with words alone? |
| standards/rule/core-authoring.identify-actionable-conventions | checkable | `node tools/validate-standards.mjs` emits no `CONVENTION_MISSING_DEFAULT` or `CONVENTION_MISSING_REPLACEMENT` diagnostic. |
| standards/rule/core-authoring.keep-agent-summaries-informative | checkable | `node tools/validate-standards.mjs` emits no `SUMMARY_COUNT`, `SUMMARY_MISSING_ID`, or `SUMMARY_UNKNOWN_ID` diagnostic. |
| standards/rule/core-authoring.attach-examples-to-their-provisions | checkable | `node tools/validate-standards.mjs` emits no `STANDARD_EXAMPLE_LABEL` or `PAGE_UNKNOWN_SECTION` diagnostic. |
| standards/rule/core-authoring.map-provisions-to-evidence | checkable | `node tools/validate-standards.mjs` emits no `VERIFY_MISSING_ID` or `VERIFY_UNKNOWN_ID` diagnostic. |
| standards/rule/core-authoring.mark-every-provision-checkable-or-guidance | guidance | Does every Verification row carry exactly one of the two marks? |
| standards/rule/core-authoring.regenerate-the-provision-index | checkable | `node tools/generate-provisions.mjs --check` exits zero. |
| standards/rule/core-authoring.route-the-reader-before-listing-pages | checkable | `node tools/validate-standards.mjs` emits no `INDEX_MISSING_ROUTING` diagnostic. |
| standards/rule/core-authoring.declare-structured-specification-metadata | checkable | `node standards/tools/validate-consumer.mjs` validates each opening frontmatter block against the record schema. |
| standards/rule/core-authoring.use-one-metadata-carrier | guidance | Is the opening frontmatter block the only metadata on each page? |
| standards/rule/core-authoring.classify-every-specification-file | checkable | `node standards/tools/validate-consumer.mjs` fails a Markdown file with no declared type outside a declared unstructured path. |
| standards/rule/core-authoring.derive-a-computed-fact-instead-of-restating-it | guidance | Does each count, census, and membership list name its source or its command? |
| standards/rule/core-authoring.run-repeatable-authoring-checks | checkable | `node tools/validate-standards.mjs`, every `node tools/*.cases.mjs` suite, and `git diff --check` exit zero. |
| standards/rule/core-authoring.validate-current-standards-material | guidance | Does the validator read the working tree and no earlier release? |
| standards/rule/core-authoring.exclude-historical-transition-material | guidance | Does any active file carry history-specific material between releases? |
| standards/rule/core-authoring.publish-each-release-as-a-complete-contract | checkable | `node tools/validate-standards.mjs` emits no `ID_UNKNOWN_REFERENCE` diagnostic. |
| standards/rule/core-authoring.exclude-cross-release-compatibility-work | guidance | Would a consumer find any promise of migration, mapping, or alias here? |
| standards/rule/core-authoring.keep-a-pinned-release-for-as-long-as-it-serves | guidance | Does any active provision oblige a consumer to adopt a later release? |
| standards/rule/core-authoring.record-the-reviewed-standards-release | checkable | `node standards/tools/validate-consumer.mjs` fails when `reviewedStandardsVersion` differs from the pinned release. |
| standards/rule/core-authoring.prefer-direct-action-headings | guidance | Does every changed provision heading start with a concrete action verb? |
| standards/rule/core-authoring.prefer-positive-instructions | guidance | Does every retained prohibition guard an explicit unsafe boundary? |
| standards/rule/core-authoring.use-tables-for-exact-mappings | guidance | Is each changed table a comparison or a field mapping? |
