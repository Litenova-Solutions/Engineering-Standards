# Authoring Standard

## Intent

Every page in LiteSpec and in a project built with it shares one shape: a fixed page style, testable rules called provisions, stable identifiers for those rules, and a table naming the evidence each rule needs. This page states that shape, the few prose rules the validators enforce, and how each release carries the complete contract. One shared shape lets readers learn pages once and lets validators check every page the same way.

## Concepts

### Page authority

Standards state required boundaries, and Conventions state replaceable defaults. Everything else on a page is informative: Intent, Concepts, Rationale, Examples, guides, tutorials, and indexes explain without obliging.

`AGENTS.md` and a consumer's project agents file project the provisions an agent needs for that workspace. A projection cites the provision it projects and adds no obligation of its own. When a projection and its provision disagree, the provision wins.

`CONTRIBUTING.md` owns the contribution workflow. `CHANGELOG.md` describes the current release.

### Documentation layers

A reader arrives with one question, and each page answers the one for its layer.

| Layer | Page style | The question it answers |
|:---|:---|:---|
| 1 | Tutorial | How do I get a first working result? |
| 2 | How-to | How do I reach this one goal? |
| 3 | Topic, stack, extension, pattern, reference, command, configuration | What exactly applies, with which values and defaults? |
| 4 | The `Underneath` section of a command page | What does the command run, and how do I run it myself? |

An explanation page builds understanding: what LiteSpec is, why it works the way it does, and how its parts fit. It sits beside the layers because a reader takes it before or between tasks, not during one. An index routes readers to pages, and the glossary resolves one term each, so neither sits in a layer. A page links down a layer and never up. Any page may link to the glossary.

### Page styles

Every LiteSpec page uses exactly one style, decided by where the page lives.

| Page style | Where it lives | Template | Sections, in order |
|:---|:---|:---|:---|
| Topic | Any area page that owns provisions | `templates/standard/topic.md` | Intent, optional Concepts, optional React and Svelte on `frontend/web/` pages, Standards, Conventions, optional Reference example, Verification |
| Stack | `stack.md` in a stack folder | `templates/standard/topic.md` | Intent, Standards, Conventions, Verification |
| Extension | An `ext/` folder | `templates/standard/extension.md` | Intent, Activation, Baseline relationship, Standards, Conventions, Dependencies, Verification |
| Pattern | `docs/frontend/patterns/` | [UI patterns](../frontend/patterns.md) | Intent, optional Concepts, optional Standards, optional Conventions, Patterns, Verification |
| Reference | `docs/reference/`, and one page per rule in `docs/analyzers/rules/` | None | Intent, Reference, optional Notes |
| Command | `docs/tools/` | `templates/standard/command.md` | Name, Synopsis, Description, Arguments, Options, Exit codes, Examples, Underneath |
| How-to | `docs/guide/`, and the other pages of `docs/analyzers/` | `templates/standard/how-to.md` | Purpose, optional Prerequisites, Procedure, Verification |
| Tutorial | `docs/tutorial/` | `templates/standard/tutorial.md` | Purpose, Prerequisites, Lesson, What you built |
| Explanation | `docs/learn/` and `docs/example/` | None | Intent, then sections of its own |
| Index | A `README.md` | None | Intent, then navigation groups |
| Glossary | `docs/reference/glossary.md` | None | One heading per term, in alphabetical order |

A consumer page is a record or one of these styles. Each one opens with the specification metadata block the record schema defines.

| Page style | Template | Sections, in order |
|:---|:---|:---|
| product-topic | `templates/consumer/product-topic.md` | Summary, The situation, What we do, Why it is better, A worked example, Costs and risks, How sure we are, Rules, Position, Refusals, Open questions, Next, History, Evidence |
| permission-list | `templates/consumer/permission-list.md` | Permissions |
| entry-point-list | `templates/consumer/entry-point-list.md` | Entry points |
| limit-set | `templates/consumer/limit-set.md` | Limits |
| rule-set | `templates/consumer/rule-set.md` | Rules |
| index | `templates/consumer/index.md` | Intent, then navigation groups |
| tutorial | `templates/consumer/tutorial.md` | Purpose, Prerequisites, Lesson, What you built |
| how-to | `templates/consumer/how-to.md` | Purpose, optional Prerequisites, Procedure, Verification |
| reference | `templates/consumer/reference.md` | Intent, Reference, optional Notes |
| command | `templates/consumer/command.md` | Name, Synopsis, Description, Arguments, Options, Exit codes, Examples, Underneath |
| configuration | `templates/consumer/configuration.md` | Intent, Settings, Precedence, optional Notes |
| glossary | `templates/consumer/glossary.md` | One heading per term, in alphabetical order |
| scenario-cast | `templates/consumer/scenario-cast.md` | The organization, The people, The occasion, The amounts, Recurring situations, optional What this page does not do |

These rules apply to every page style:

- A page that owns provisions lives at `docs/<area>/<page>.md` or deeper, with a lowercase file name.
- A page has one H1.
- The index page of a section or folder, its `README.md`, is titled `Overview`, so a reader never confuses a section with its first page. A link to it names its section: `[Backend overview](../backend/README.md)`.
- A required section with nothing to say contains only `None.`
- An example sits inside the provision it illustrates, or in a Reference example that names every provision it demonstrates.
- A tutorial, how-to, explanation, reference, command, or index page owns no provisions.
- A tutorial follows one path. An option or an alternative belongs on a how-to page.

### Provisions

A provision is a `###` heading inside one of three sections:

| Section | Kind | Heading |
|:---|:---|:---|
| `## Standards` | rule | Starts with an action verb, such as `Keep shared UI in one package` |
| `## Conventions` | convention | Starts with an action verb and names the replaceable default |
| `## Patterns` | pattern | The pattern's name, such as `Record header` |

A Standard states one testable obligation:

```markdown
### Keep shared UI in one package

**Requirement:** A workspace MUST hold its shared primitives and composites in one shared UI package.

**Deviation:** Only with SHOULD or SHOULD NOT: the bounded reason that permits a departure.

**Rationale:** Why the rule exists.

**Example:** What following it looks like.
```

- The Requirement is one sentence with exactly one capitalized modal, as [RFC 2119](https://www.rfc-editor.org/info/rfc2119/) and [RFC 8174](https://www.rfc-editor.org/info/rfc8174/) define them.
- A different obligation, prohibition, or permission is a separate provision.
- Conditions and scope belong in the Requirement sentence.
- Every other paragraph of the provision sits under a Rationale or an Example label and adds no obligation.

A Convention states a default a project may replace:

```markdown
### Use the default location

**Default:** Store the catalog at `docs/ui/patterns.json`.

**Replacement:** A project names another path in `paths.uiPatterns`.

**Rationale:** Why this is the default.
```

A project that departs from a Standard records an Exception record that cites the provision. A project that replaces a Convention names its own convention in its documentation. The [model page](model.md) states the Exception record.

A pattern provision carries its question, its default option, its compact behavior, and its rationale, and then its options with their wireframes. [UI patterns](../frontend/patterns.md) states the pattern contract and the wireframe language.

### Provision identifiers

Every provision ID is `litespec/<page>#<slug>`:

| Segment | Source |
|:---|:---|
| `litespec` | The source that owns the provision |
| `<page>` | The page path under `docs/`, without `.md` |
| `<slug>` | The heading: lowercase, punctuation removed, spaces as hyphens |

`### Keep business invariants in Domain` on `docs/backend/architecture.md` is `litespec/backend/architecture#keep-business-invariants-in-domain`. The same text is the heading's address on the published site.

The heading carries no identifier text. A renamed heading renames the ID, so the two cannot disagree. No two pages share a path, so no two provisions share an ID. Consumer record identifiers follow the [identifier page](../backend/identifiers.md).

### Verification table

Every page that owns provisions ends with a Verification table that has one row per provision:

```markdown
| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/components#keep-shared-ui-in-one-package | guidance | Does one shared package hold the shared primitives and composites? |
```

A `checkable` row names the tool that checks the provision, with that tool's command first, in backticks. A `guidance` row asks the one question a reviewer answers. Evidence like "verify compliance" says nothing and is refused.

### Generated regions

A generated region is a section a tool writes, between `<!-- generated:<name> -->` and `<!-- /generated:<name> -->`. Only the owning tool writes inside it, and an edit there is lost at the next generation. Authoring checks skip generated regions.

### Release model

Each LiteSpec release is a complete contract that states every active provision. LiteSpec publishes no compatibility guarantee, migration path, deprecation period, or identifier alias between its own releases. A consumer pins one release, keeps it for as long as it chooses, and adopts a later release by accepting that release's whole contract.

Version numbers name complete pinned contracts. A patch release corrects a narrow area, a minor release makes one coherent change, and a major release replaces scope, method, or a stack.

This model governs LiteSpec itself. A consumer product has its own users, so its API compatibility, migration, deprecation and rollback provisions still apply.

## Standards

### Keep authored prose ASCII-safe

**Requirement:** Authored prose MUST contain only ASCII unless code, data, or mathematical content requires another character.

**Rationale:** Non-ASCII characters break in terminals, diffs, generated context, and plain-text tools: a curly quote becomes unreadable in one reader and a silent mismatch in another. ASCII prose renders the same everywhere the standard is read or checked.

**Example:** Write a hyphen or a comma where a typographic dash would go.

### Exclude declared content paths from the ASCII check

**Requirement:** An ASCII check MUST exclude only the natural-language content paths that the project record declares.

**Rationale:** A product whose subject is another language carries that language in its content files, where a diacritic is part of a word rather than a styling choice. Excluding only the declared content paths keeps the check strict everywhere else: documents about that content stay in scope, so authors cannot file styled prose beside content to slip it past the check.

### Use one normative vocabulary

**Requirement:** A Standards provision MUST use exactly one approved capitalized modal and no other capitalized normative term.

**Rationale:** Strength words work only when each one means exactly one thing. The provision contract defines the approved modals with their RFC meaning, so a reader never guesses whether a word obliges or suggests, and no second capitalized term sneaks in a different shade of obligation.

### Use one term for one concept

**Requirement:** Authored prose MUST name each concept with its one glossary term.

**Rationale:** A second name for one concept reads as a second concept: the reader hunts for a distinction the writer never meant. One term per concept means each term is defined once and checked once.

### Record the project vocabulary as data

**Requirement:** A consumer MUST record each term, its rejected synonyms, the scope of each rejection, and its mannered terms in a language record satisfying `schemas/language.schema.json`.

**Rationale:** A glossary column headed "Avoid" speaks to a reader and to nothing else: no tool can check it. A rule held as data reaches the reader and the validator alike, so the same rejection appears in prose guidance and in diagnostics.

**Example:** A rejection carries the scope that binds it, because a word that is right in one module is wrong in another.

```json
{ "term": "customer", "rejected": ["client"], "scope": "^domain/modules/orders/",
  "reason": "client names the API consumer" }
```

### Reject a recorded synonym inside its scope

**Requirement:** Authored prose MUST NOT use a synonym that the project language record rejects for the scope the page sits in.

**Rationale:** Term drift is invisible one page at a time and plain across a module: each page looks fine while the project slowly speaks two languages. The expensive case is a synonym that is a defined term elsewhere, because one word then names two things and every reader guesses which one.

### Check the vocabulary on every surface a reader meets

**Requirement:** A consumer MUST name every non-Markdown surface its vocabulary reaches in `paths.languageScan`, including source, interface copy, the API contract, and acceptance tests.

**Rationale:** Documentation is often the smallest surface a reader meets; names in code, interface copy, contracts, and tests carry the vocabulary further. A rejection that stops at prose lets `ClientOrderId` breach a rejection of `client` where readers meet it most. A pattern that matches no file fails, so a surface cannot go unread unnoticed.

**Example:** A pattern that matches no file is an error, so a surface cannot go unread unnoticed.

```json
{ "paths": { "languageScan": ["apps/*/lib/i18n/dictionaries/*.json", "apps/api/tests/**/*.feature"] } }
```

### Exclude the compound that names another concept

**Requirement:** A language record MUST list, in `except`, every compound in which a rejected word names a concept other than the one the rejection is about.

**Rationale:** A rejection matches a word, and a word can belong to more than one term: Expenses rejects `docket` in favor of `receipt` for payment proof while a docket still names the shipping list. Without the `except` list, the check would force the project to rename an unrelated concept or drop a sound rejection.

**Example:** The exemption covers the compound only, so the bare word stays rejected.

```json
{ "term": "receipt", "rejected": ["docket"], "scope": "^docs/domain/modules/spending/",
  "except": ["shipping docket"], "reason": "one word for a payment receipt and a shipping list" }
```

### Exclude generated regions from prose checks

**Requirement:** An authoring check MUST skip every generated region.

**Rationale:** A generated region holds tool output that no author wrote and no author can fix by editing the page. Checking it would fail pages for words outside author control and train writers to ignore diagnostics.

### Use controlled capitalization

**Requirement:** A page MUST use Title Case for its title and sentence case for every other heading.

**Rationale:** Titles read as names in indexes, tabs, and search results, while sentence-case headings read as statements within the page. One rule for each keeps every page scannable the same way. Code names, product names, and layer names keep their own capitalization, since renaming them would break references.

### Use the declared page contract

**Requirement:** An authored page MUST use the sections, in order, of its page style.

**Rationale:** A fixed shape puts the authority, the context, the defaults, and the evidence in the same place on every page. Readers learn the shape once, and tools find each section without guessing. A page that invents its own order sends both searching.

### Route the reader before listing pages

**Requirement:** A documentation root index MUST state which page style answers which reader question before its first navigation group.

**Rationale:** A reader who cannot tell a tutorial from a reference opens both and trusts neither. Naming each style in the reader's terms before the first navigation group sends each question to the page that answers it.

**Example:** A `Which page do you want` section names each style in the reader's terms, one sentence each.

### Name the tool rather than the mechanism

**Requirement:** A tutorial step or how-to step MUST name the repository command that performs it, where one exists.

**Rationale:** A procedure that lists what a command already does becomes a second copy of that command's behavior. The copy drifts from the tool, and readers follow stale steps. Naming the repository command delegates the steps to the thing that performs them.

**Example:** A step reads ``Run `./shop up` `` rather than listing the compose start, the readiness wait, and each process launch.

### State one layer per page

**Requirement:** A page MUST NOT describe both a command and the mechanism that command runs, outside an `Underneath` section.

**Rationale:** A reader who wanted the command reads mechanism detail as noise, and a reader who wanted the mechanism reads the command wrapper as an obstacle. One layer per page serves each reader, and the `Underneath` section holds the mechanism for the reader who asks for it.

### Name the escape from every abstraction

**Requirement:** A command page MUST state under `Underneath` what the command runs, or that nothing beneath it is separately runnable.

**Rationale:** A wrapper nobody can see through cannot be debugged when it fails: the reader has no command to run by hand and no layer to inspect. Stating what the command runs, or that nothing beneath it is separately runnable, gives every failure a next step.

**Example:** A command with nothing separately runnable writes `None.` under `Underneath`.

### Record a setting as reference

**Requirement:** A configuration setting a reader can change MUST appear on a configuration page with its default, its scope, and what overrides it.

**Rationale:** A setting introduced inside a procedure is found only by the reader who already knows which procedure mentioned it. A configuration page with the default, scope, and overrides puts every setting where a reader looks it up.

### Write atomic Standards provisions

**Requirement:** A Standards provision MUST follow the Standard contract this page defines.

**Rationale:** One provision with one obligation has one authority, one identifier, and one verification row. A provision that bundles two obligations leaves a project half-compliant with no identifier for the half it missed.

**Example:** `### Keep business invariants in Domain` owns one obligation about where invariants are enforced.

### Identify actionable conventions

**Requirement:** A Convention provision MUST follow the Convention contract this page defines.

**Rationale:** A Convention heading under `## Conventions` makes each replaceable default traceable: a project cites exactly the default it replaces. Without the contract, defaults hide in prose and replacements cite paragraphs instead of identifiers.

### Attach examples to their provisions

**Requirement:** An informative example MUST belong to its provision or to a Reference example that names every provision it demonstrates.

**Rationale:** An example floating free of its provision reads as a second rule: readers obey the illustration instead of the obligation. Belonging to its provision, or to a Reference example that names every provision it demonstrates, marks it as illustration.

### Use the declared identifier grammar

**Requirement:** A provision ID MUST be `litespec/<page>#<slug>`, computed from its page path and its heading.

**Rationale:** The page names the file and the slug names the heading, so a citation resolves with no lookup table. One grammar for every identifier keeps citations writable by hand and checkable by tool.

**Example:** `litespec/frontend/components#compose-composites-in-page-code` is a heading on the frontend components page.

### Name the owning page in the identifier

**Requirement:** A provision ID's page segment MUST be its page's path under `docs/` without the `.md` extension.

**Rationale:** The page segment is the file a reader opens and the address the provision carries on the published site. Deriving it from the path keeps the identifier and the file from disagreeing.

**Example:** `litespec/frontend/structure#mirror-the-backend-use-case-path-in-kebab-case` and `litespec/frontend/blazor/structure#organize-features-by-module-and-use-case` are on two different pages.

### Keep identifiers out of provision headings

**Requirement:** A provision heading MUST carry no identifier text.

**Rationale:** The page path and the heading already state the identifier. An identifier written into the heading repeats it at best and contradicts it at worst, after a rename touches one and misses the other.

### Exclude a sequence number from the identifier

**Requirement:** A provision ID MUST NOT contain a sequence number.

**Rationale:** A counter orders a provision among its siblings and says nothing about what it requires. Words name the obligation; numbers would renumber every sibling on each insertion and break citations for no gain.

### Map provisions to evidence

**Requirement:** A page that owns provisions MUST give every provision one row in its Verification table.

**Rationale:** A provision with no verification row is a rule nobody checks: people assume a tool covers it while no tool was told. One row per provision makes each rule reviewable by a person or a tool.

### Mark every provision checkable or guidance

**Requirement:** A Verification row MUST mark its provision `checkable` or `guidance`.

**Rationale:** The mark tells a reader who judges the provision: a tool or a person. Without it, a team automates a judgment call or hand-reviews what a command already proves.

### Regenerate the provision index

**Requirement:** A standards change MUST leave `docs/reference/provisions.md` equal to the output of `litespec provisions`.

**Rationale:** One generated page resolves every identifier to its heading and page, so a reader follows a citation in one step. Regenerating it with `litespec provisions` on every standards change keeps the index and the pages from disagreeing.

### Declare structured specification metadata

**Requirement:** A consumer page MUST open with a specification metadata block satisfying the record schema for its declared type.

**Rationale:** The record schema owns the field list of every record type and page style. The block is one JSON object between two lines that hold only `---`, which people read as a header and tools parse as data. The [model page](model.md) states the record types and their homes.

**Example:** A use-case page opens with this block.

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

### Use one metadata carrier

**Requirement:** A consumer page MUST use its opening specification metadata block as its only metadata carrier.

**Rationale:** Two metadata carriers on one page disagree sooner or later: source links, paths, and evidence drift between the header and the body. One opening block keeps metadata in one place, while the body sections carry the links, paths, and evidence beside what they describe.

### Classify every specification file

**Requirement:** Every Markdown file under the consumer documentation root MUST declare a record type or page style, or sit under a declared unstructured path.

**Rationale:** A file the validator cannot classify is skipped, and a skipped file looks sound: its errors never surface. Requiring every file to declare a type or sit under a declared unstructured path leaves no page unchecked. A directory index that owns no record uses the index style.

### Derive a computed fact instead of restating it

**Requirement:** A specification MUST name the source or the command that produces any count, census, or membership list computed from code.

**Rationale:** A restated number is right until the next unrelated commit changes the code it counts, and nothing reports when it goes stale. Naming the source or the command gives every reader the current figure instead of the figure from commit day.

**Example:** A page states the rule and the command rather than the total.

```markdown
Every command declares an audit position. To count the declarations:

    grep -rl "Audited(" src/Application --include=*.cs | wc -l
```

### Run repeatable authoring checks

**Requirement:** A standards change MUST pass the repository validator, the test suite, and `git diff --check`.

**Rationale:** The repository validator, the test suite, and `git diff --check` each catch what the others miss: structure, behavior, and whitespace. Passing all three on every standards change keeps the standard checkable by anyone who runs the same commands. The change report lists every skipped check with its reason. The [command index](../tools/README.md) names each check and its command.

### Validate current standards material

**Requirement:** The standards validator MUST evaluate only current standards material.

**Rationale:** Each pinned release is a complete snapshot, so the validator judges the working tree alone. Reading history would let a provision pass on the strength of a release nobody pinned. Git history and the changelog give release context to readers outside validation.

### Exclude historical transition material

**Requirement:** Current standards material MUST NOT contain history-specific paths, IDs, terms, aliases, replacement maps, release migration material, compatibility rules, or transition checks.

**Rationale:** A snapshot that carries aliases, maps, migration notes, or transition checks for other releases forces every reader to learn releases they did not pin. The published snapshot states its own contract and nothing else. An extension's `Baseline relationship` section names a provision it replaces inside this release, which is a current replacement rather than history.

### Publish each release as a complete contract

**Requirement:** A LiteSpec release MUST state every active provision without depending on an earlier release.

**Rationale:** A consumer pins one snapshot and reads it as the whole obligation. Depending on another release would force the consumer to pin and read two contracts to know either. Stating every active provision in each release keeps one snapshot sufficient.

### Exclude cross-release compatibility work

**Requirement:** The LiteSpec repository MUST NOT publish a compatibility guarantee, migration path, deprecation period, or identifier alias between its own releases.

**Rationale:** LiteSpec is a pinned contract, not a running service: consumers adopt a release whole, on their own schedule. Compatibility guarantees, migration paths, deprecation periods, and identifier aliases between LiteSpec releases would promise a continuity the model does not offer. A consumer product keeps its own API compatibility, migration, deprecation, and rollback provisions for its own users.

### Keep a pinned release for as long as it serves

**Requirement:** A consumer MAY keep any published LiteSpec release for as long as it chooses.

**Rationale:** Adoption is the consumer's decision. If a repository change could oblige a move, every LiteSpec edit would become a deadline for every consumer. Keeping any published release for as long as it serves decouples the consumer's schedule from the standard's.

### Record the reviewed LiteSpec release

**Requirement:** A consumer MUST record the LiteSpec release it adopts in `reviewedLiteSpecVersion` within `litespec.project.json`.

**Rationale:** A provision can gain force while keeping its ID, so an Exception written against one release could otherwise apply to a rule nobody reread. Recording the adopted release in `reviewedLiteSpecVersion` makes adoption an explicit act and tells every reader which contract the project reviewed.

## Conventions

### Prefer direct action headings

**Default:** Start a Standard or Convention heading with a concrete action verb.

**Replacement:** Use a noun heading only for a pattern, an informative definition, or an index entry.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/authoring#keep-authored-prose-ascii-safe | checkable | `litespec validate` emits no `PROSE_NON_ASCII` diagnostic. |
| litespec/core/authoring#exclude-declared-content-paths-from-the-ascii-check | guidance | Does the project record name every path outside the ASCII check, with documents about that content still checked? |
| litespec/core/authoring#use-one-normative-vocabulary | checkable | `litespec validate` emits no `STANDARD_MODAL_COUNT` or `STANDARD_MODAL_VOCABULARY` diagnostic. |
| litespec/core/authoring#use-one-term-for-one-concept | guidance | Would a reader meet each concept under one name only? |
| litespec/core/authoring#record-the-project-vocabulary-as-data | checkable | `litespec consumer` validates the language record against the language schema. |
| litespec/core/authoring#reject-a-recorded-synonym-inside-its-scope | checkable | `litespec consumer` emits no `LANGUAGE_REJECTED_SYNONYM` diagnostic. |
| litespec/core/authoring#check-the-vocabulary-on-every-surface-a-reader-meets | checkable | `litespec consumer` scans every `languageScan` pattern and fails a pattern that matches no file. |
| litespec/core/authoring#exclude-the-compound-that-names-another-concept | checkable | `litespec consumer` reports no `LANGUAGE_REJECTED_SYNONYM` diagnostic inside an exempt compound. |
| litespec/core/authoring#exclude-generated-regions-from-prose-checks | guidance | Does every authoring check skip the text between generated-region fences? |
| litespec/core/authoring#use-controlled-capitalization | checkable | `litespec validate` emits no `PAGE_TITLE_CASE` diagnostic. |
| litespec/core/authoring#use-the-declared-page-contract | checkable | `litespec validate` emits no `PAGE_MISSING_SECTION`, `PAGE_SECTION_ORDER` or `PAGE_UNKNOWN_SECTION` diagnostic. |
| litespec/core/authoring#route-the-reader-before-listing-pages | checkable | `litespec validate` emits no `INDEX_MISSING_ROUTING` diagnostic. |
| litespec/core/authoring#name-the-tool-rather-than-the-mechanism | guidance | Does each procedure step name the shipped command that performs it? |
| litespec/core/authoring#state-one-layer-per-page | guidance | Does mechanism detail appear only under an `Underneath` section? |
| litespec/core/authoring#name-the-escape-from-every-abstraction | checkable | `litespec validate` emits no `PAGE_MISSING_SECTION` diagnostic for a command page. |
| litespec/core/authoring#record-a-setting-as-reference | guidance | Does every setting named in a procedure resolve to a configuration page row? |
| litespec/core/authoring#write-atomic-standards-provisions | checkable | `litespec validate` emits no `STANDARD_REQUIREMENT_COUNT`, `STANDARD_SENTENCE_COUNT` or `STANDARD_LABEL_INVALID` diagnostic. |
| litespec/core/authoring#identify-actionable-conventions | checkable | `litespec validate` emits no `CONVENTION_MISSING_DEFAULT` or `CONVENTION_MISSING_REPLACEMENT` diagnostic. |
| litespec/core/authoring#attach-examples-to-their-provisions | checkable | `litespec validate` emits no `STANDARD_EXAMPLE_LABEL` or `PAGE_UNKNOWN_SECTION` diagnostic. |
| litespec/core/authoring#use-the-declared-identifier-grammar | checkable | `litespec validate` emits no `ID_UNKNOWN_REFERENCE` diagnostic. |
| litespec/core/authoring#name-the-owning-page-in-the-identifier | checkable | `litespec validate` emits no `ID_PAGE_FILENAME` or `ID_DUPLICATE` diagnostic. |
| litespec/core/authoring#keep-identifiers-out-of-provision-headings | checkable | `litespec validate` emits no `ID_IN_HEADING` diagnostic. |
| litespec/core/authoring#exclude-a-sequence-number-from-the-identifier | guidance | Do changed identifiers name their obligation in words alone? |
| litespec/core/authoring#map-provisions-to-evidence | checkable | `litespec validate` emits no `VERIFY_MISSING_ID` or `VERIFY_UNKNOWN_ID` diagnostic. |
| litespec/core/authoring#mark-every-provision-checkable-or-guidance | checkable | `litespec validate` emits no `VERIFY_MARK` diagnostic. |
| litespec/core/authoring#regenerate-the-provision-index | checkable | `litespec provisions --check` exits zero. |
| litespec/core/authoring#declare-structured-specification-metadata | checkable | `litespec consumer` validates each opening specification metadata block against the record schema. |
| litespec/core/authoring#use-one-metadata-carrier | guidance | Is the opening specification metadata block the only metadata on each page? |
| litespec/core/authoring#classify-every-specification-file | checkable | `litespec consumer` fails a Markdown file with no declared type outside a declared unstructured path. |
| litespec/core/authoring#derive-a-computed-fact-instead-of-restating-it | guidance | Does each count, census, and membership list name its source or its command? |
| litespec/core/authoring#run-repeatable-authoring-checks | checkable | `litespec validate`, `dotnet test --solution LiteSpec.slnx` and `git diff --check` exit zero. |
| litespec/core/authoring#validate-current-standards-material | guidance | Does the validator read the working tree and no earlier release? |
| litespec/core/authoring#exclude-historical-transition-material | guidance | Does any active file carry history-specific material between releases? |
| litespec/core/authoring#publish-each-release-as-a-complete-contract | checkable | `litespec validate` emits no `ID_UNKNOWN_REFERENCE` diagnostic. |
| litespec/core/authoring#exclude-cross-release-compatibility-work | guidance | Would a consumer find any promise of migration, mapping, or alias here? |
| litespec/core/authoring#keep-a-pinned-release-for-as-long-as-it-serves | guidance | Does any active provision oblige a consumer to adopt a later release? |
| litespec/core/authoring#record-the-reviewed-litespec-release | checkable | `litespec consumer` fails when `reviewedLiteSpecVersion` differs from the pinned release. |
| litespec/core/authoring#prefer-direct-action-headings | guidance | Does every changed Standard or Convention heading start with a concrete action verb? |
