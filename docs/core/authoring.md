# Authoring Standard

## Intent

This page states how LiteSpec pages and consumer specification pages are written: the page styles, the provision contracts, the identifiers, the verification table, and the prose style. Prose follows the [Google developer documentation style guide](https://developers.google.com/style), with the few additions this page states. The structure rules are what `litespec validate` and `litespec consumer` check.

## Concepts

### Writing style

LiteSpec pages and consumer specification pages follow the [Google developer documentation style guide](https://developers.google.com/style). It covers voice, tense, person, word choice, punctuation, lists, tables, links and code formatting. A question the guide answers is not restated here.

This page adds five rules to the guide:

- Use ASCII outside code and data. Write a hyphen or a comma where the guide would use an em dash.
- Use one term for one concept. The glossary owns LiteSpec's terms, and a consumer's language record owns its project terms.
- Write `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT` and `MAY` in capitals only inside a Standard's Requirement. Elsewhere, write plain words.
- Give a page title Title Case, and every other heading sentence case.
- State the current contract. A page never describes how an earlier LiteSpec release differed.

### Page authority

Standards define required boundaries, and Conventions define replaceable defaults. Everything else on a page is informative: the Intent, Concepts, Rationale, Examples, guides, tutorials and indexes.

`AGENTS.md` and a consumer's project agents file project the provisions an agent needs. A projection cites the provision it projects and adds no obligation. When the two disagree, the provision wins.

`CONTRIBUTING.md` owns the contribution workflow. `CHANGELOG.md` describes the current release.

### Documentation layers

A reader arrives with one of four questions, and each page answers one of them.

| Layer | Page style | The question it answers |
|:---|:---|:---|
| 1 | Tutorial | How do I get a first working result? |
| 2 | How-to | How do I reach this one goal? |
| 3 | Topic, stack, extension, pattern, reference, command, configuration | What exactly applies, with which values and defaults? |
| 4 | The `Underneath` section of a command page | What does the command run, and how do I run it myself? |

An explanation page builds understanding: what LiteSpec is, why it works the way it does, and how its parts fit. It sits beside the layers rather than in one, because a reader takes it before or between tasks, not during one. An index routes a reader to pages, and the glossary resolves one term, so neither sits in a layer. A page links down a layer and never up. Any page may link to the glossary.

### Page styles

Every LiteSpec page uses one of these styles. Its location decides its style.

| Page style | Where it lives | Template | Sections, in order |
|:---|:---|:---|:---|
| Topic | Any area page that owns provisions | `templates/standard/topic.md` | Intent, optional Concepts, optional React and Svelte on `frontend/web/` pages, Standards, Conventions, optional Reference example, Verification |
| Stack | `stack.md` in a stack folder | `templates/standard/topic.md` | Intent, Standards, Conventions, Verification |
| Extension | An `ext/` folder | `templates/standard/extension.md` | Intent, Activation, Baseline relationship, Standards, Conventions, Dependencies, Verification |
| Pattern | `docs/frontend/patterns/` | [UI pattern decisions](../frontend/patterns.md) | Intent, optional Concepts, optional Standards, optional Conventions, Patterns, Verification |
| Reference | `docs/reference/` | None | Intent, Reference, optional Notes |
| Command | `docs/tools/` | `templates/standard/command.md` | Name, Synopsis, Description, Arguments, Options, Exit codes, Examples, Underneath |
| How-to | `docs/guide/` | `templates/standard/how-to.md` | Purpose, optional Prerequisites, Procedure, Verification |
| Tutorial | `docs/tutorial/` | `templates/standard/tutorial.md` | Purpose, Prerequisites, Lesson, What you built |
| Explanation | `docs/learn/` | None | Intent, then sections of its own |
| Index | A `README.md` | None | Intent, then navigation groups |
| Glossary | `docs/reference/glossary.md` | None | One heading per term, in alphabetical order |

A consumer page is a record or one of these styles. Each one opens with the frontmatter block the record schema defines.

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
- A required section with nothing to say contains only `None.`
- An example sits inside the provision it illustrates, or in a Reference example that names every provision it demonstrates.
- A tutorial, how-to, explanation, reference, command or index page owns no provisions.
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
- A different obligation, prohibition or permission is a separate provision.
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

A pattern carries its question, its default option, its compact behavior and its rationale, and then its options with their wireframes. [UI pattern decisions](../frontend/patterns.md) states the pattern contract and the wireframe language.

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

A generated region is a section a tool writes, between `<!-- generated:<name> -->` and `<!-- /generated:<name> -->`. Only the owning tool writes inside it, and an edit there is lost at the next generation. Authoring checks skip it.

### Release model

Each LiteSpec release is a complete contract that states every active provision. LiteSpec publishes no compatibility guarantee, migration path, deprecation period or identifier alias between its own releases. A consumer pins one release, keeps it for as long as it chooses, and adopts a later release by accepting that release's whole contract.

Version numbers name complete pinned contracts. A patch release corrects a narrow area, a minor release makes one coherent change, and a major release replaces scope, method or a stack.

This model governs LiteSpec itself. A consumer product has its own users, so its API compatibility, migration, deprecation and rollback provisions still apply.

## Standards

### Follow the Google developer documentation style guide

**Requirement:** Authored prose MUST follow the Google developer documentation style guide, except where this page states a different rule.

**Rationale:** One established guide gives every writer, person or agent, the same answers on voice, word choice and formatting. It reads as ordinary technical writing, and nobody maintains a second guide.

### Keep authored prose ASCII-safe

**Requirement:** Authored prose MUST contain only ASCII unless code, data or mathematical content requires another character.

**Rationale:** ASCII prose stays stable in terminals, diffs, generated context and plain-text tools.

**Example:** Write a hyphen or a comma where a typographic dash would go.

### Exclude declared content paths from the ASCII check

**Requirement:** An ASCII check MUST exclude only the natural-language content paths that the project record declares.

**Rationale:** A product whose subject is another language carries that language in its content files, where a diacritic is part of a word. Every document about that content stays in scope.

### Use one normative vocabulary

**Requirement:** A Standards provision MUST use exactly one approved capitalized modal and no other capitalized normative term.

**Rationale:** The provision contract defines the approved modals and their RFC meaning, so a reader never has to interpret strength.

### Use one term for one concept

**Requirement:** Authored prose MUST name each concept with its one glossary term.

**Rationale:** A second name for the same concept makes a reader wonder whether it is a second concept. A term defined once is checked once.

### Record the project vocabulary as data

**Requirement:** A consumer MUST record each term, its rejected synonyms, the scope of each rejection, and its mannered terms in a language record satisfying `schemas/language.schema.json`.

**Rationale:** A glossary column headed "Avoid" states the rule to a reader and to nothing else. A rule held as data reaches the reader and the validator alike.

**Example:** A rejection carries the scope that binds it, because a word that is right in one module is wrong in another.

```json
{ "term": "customer", "rejected": ["client"], "scope": "^domain/modules/orders/",
  "reason": "client names the API consumer" }
```

### Reject a recorded synonym inside its scope

**Requirement:** Authored prose MUST NOT use a synonym that the project language record rejects for the scope the page sits in.

**Rationale:** Drift in terms is invisible one page at a time and plain across a module. The expensive case is a synonym that is a defined term elsewhere, because one word then names two things.

### Check the vocabulary on every surface a reader meets

**Requirement:** A consumer MUST name every non-Markdown surface its vocabulary reaches in `paths.languageScan`, including source, interface copy, the API contract and acceptance tests.

**Rationale:** Documentation is often the smallest surface a reader meets. A rejection also has to reach names, so `ClientOrderId` breaches a rejection of `client` the way a sentence does.

**Example:** A pattern that matches no file is an error, so a surface cannot go unread unnoticed.

```json
{ "paths": { "languageScan": ["apps/*/lib/i18n/dictionaries/*.json", "apps/api/tests/**/*.feature"] } }
```

### Exclude the compound that names another concept

**Requirement:** A language record MUST list, in `except`, every compound in which a rejected word names a concept other than the one the rejection is about.

**Rationale:** A rejection matches a word, and a word can belong to more than one term. A library can reject `reservation` in favor of `hold` while its reading room still books a `reading-room reservation`.

**Example:** The exemption covers the compound only, so the bare word stays rejected.

```json
{ "term": "hold", "rejected": ["reservation"], "scope": "^docs/domain/modules/circulation/",
  "except": ["reading-room reservation"], "reason": "one word for a book hold and a seat booking" }
```

### Exclude generated regions from prose checks

**Requirement:** An authoring check MUST skip every generated region.

**Rationale:** A generated region holds tool output, so a check would fail a page for words no author wrote.

### Use controlled capitalization

**Requirement:** A page MUST use Title Case for its title and sentence case for every other heading.

**Rationale:** Titles read as names in an index, and sentence-case headings read as statements. Code names, product names and layer names keep their own capitalization.

### Use the declared page contract

**Requirement:** An authored page MUST use the sections, in order, of its page style.

**Rationale:** A fixed shape lets a reader and a tool find the authority, the context, the defaults and the evidence in the same place on every page.

### Route the reader before listing pages

**Requirement:** A documentation root index MUST state which page style answers which reader question before its first navigation group.

**Rationale:** A reader who cannot tell a tutorial from a reference opens both and trusts neither.

**Example:** A `Which page do you want` section names each style in the reader's terms, one sentence each.

### Name the tool rather than the mechanism

**Requirement:** A tutorial step or how-to step MUST name the repository command that performs it, where one exists.

**Rationale:** A procedure that lists what a command already does becomes a second copy of that command, and the copy drifts.

**Example:** A step reads ``Run `./shop up` `` rather than listing the compose start, the readiness wait and each process launch.

### State one layer per page

**Requirement:** A page MUST NOT describe both a command and the mechanism that command runs, outside an `Underneath` section.

**Rationale:** A reader who wanted the command reads the mechanism as noise, and a reader who wanted the mechanism reads the command as an obstacle.

### Name the escape from every abstraction

**Requirement:** A command page MUST state under `Underneath` what the command runs, or that nothing beneath it is separately runnable.

**Rationale:** A wrapper nobody can see through cannot be debugged when it fails.

**Example:** A command with nothing separately runnable writes `None.` under `Underneath`.

### Record a setting as reference

**Requirement:** A configuration setting a reader can change MUST appear on a configuration page with its default, its scope and what overrides it.

**Rationale:** A setting introduced inside a procedure is found only by the reader who already knows which procedure mentioned it.

### Write atomic Standards provisions

**Requirement:** A Standards provision MUST follow the Standard contract this page defines.

**Rationale:** One identified obligation has one authority and one verification row.

**Example:** `### Keep business invariants in Domain` owns one obligation about where invariants are enforced.

### Identify actionable conventions

**Requirement:** A Convention provision MUST follow the Convention contract this page defines.

**Rationale:** A heading under `## Conventions` makes each replaceable default traceable without turning it into a rule.

### Attach examples to their provisions

**Requirement:** An informative example MUST belong to its provision or to a Reference example that names every provision it demonstrates.

**Rationale:** A reader can then tell an illustration from an independent obligation.

### Use the declared identifier grammar

**Requirement:** A provision ID MUST be `litespec/<page>#<slug>`, computed from its page path and its heading.

**Rationale:** The page names the file and the slug names the heading, so a citation resolves with no lookup.

**Example:** `litespec/frontend/components#compose-composites-in-page-code` is a heading on the frontend components page.

### Name the owning page in the identifier

**Requirement:** A provision ID's page segment MUST be its page's path under `docs/` without the `.md` extension.

**Rationale:** The page segment is the file a reader opens and its address on the published site.

**Example:** `litespec/frontend/structure#mirror-the-backend-use-case-path-in-kebab-case` and `litespec/frontend/blazor/structure#organize-features-by-module-and-use-case` are on two different pages.

### Keep identifiers out of provision headings

**Requirement:** A provision heading MUST carry no identifier text.

**Rationale:** The page path and the heading already state the ID, so a written ID can only repeat it or contradict it.

### Exclude a sequence number from the identifier

**Requirement:** A provision ID MUST NOT contain a sequence number.

**Rationale:** A counter orders a provision among its siblings and says nothing about what it requires, which is the slug's job.

### Map provisions to evidence

**Requirement:** A page that owns provisions MUST give every provision one row in its Verification table.

**Rationale:** Exact evidence makes each provision reviewable by a person or a tool.

### Mark every provision checkable or guidance

**Requirement:** A Verification row MUST mark its provision `checkable` or `guidance`.

**Rationale:** The mark tells a reader whether a tool or a person judges the provision.

### Regenerate the provision index

**Requirement:** A standards change MUST leave `docs/reference/provisions.md` equal to the output of `litespec provisions`.

**Rationale:** One generated page resolves every ID to its heading and page, so a reader follows a citation in one step.

### Declare structured specification metadata

**Requirement:** A consumer page MUST open with a frontmatter block satisfying the record schema for its declared type.

**Rationale:** The schema owns the field list of every record type and page style. The block is one JSON object between two lines that hold only `---`. The [model page](model.md) states the record types and their homes.

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

**Requirement:** A consumer page MUST use its opening frontmatter block as its only metadata carrier.

**Rationale:** Source links, implementation paths and verification evidence belong in the body sections they describe.

### Classify every specification file

**Requirement:** Every Markdown file under the consumer documentation root MUST declare a record type or page style, or sit under a declared unstructured path.

**Rationale:** A file the validator cannot classify is skipped, and a skipped file looks sound. A directory index that owns no record uses the index style.

### Derive a computed fact instead of restating it

**Requirement:** A specification MUST name the source or the command that produces any count, census or membership list computed from code.

**Rationale:** A restated number is right until the next unrelated commit, and nothing reports when it goes stale.

**Example:** A page states the rule and the command rather than the total.

```markdown
Every command declares an audit position. To count the declarations:

    grep -rl "Audited(" src/Application --include=*.cs | wc -l
```

### Run repeatable authoring checks

**Requirement:** A standards change MUST pass the repository validator, the test suite and `git diff --check`.

**Rationale:** The change report lists every skipped check with its reason. The [command index](../tools/README.md) names each check and its command.

### Validate current standards material

**Requirement:** The standards validator MUST evaluate only current standards material.

**Rationale:** Each pinned release is a complete snapshot. Git history and the changelog give release context outside validation.

### Exclude historical transition material

**Requirement:** Current standards material MUST NOT contain history-specific paths, IDs, terms, aliases, replacement maps, release migration material, compatibility rules or transition checks.

**Rationale:** The published snapshot states its own contract without carrying earlier releases forward. An extension's `Baseline relationship` section names a provision it replaces inside this release, which is not history.

### Publish each release as a complete contract

**Requirement:** A LiteSpec release MUST state every active provision without depending on an earlier release.

**Rationale:** A consumer reads one pinned snapshot and needs no other release to know its obligations.

### Exclude cross-release compatibility work

**Requirement:** The LiteSpec repository MUST NOT publish a compatibility guarantee, migration path, deprecation period or identifier alias between its own releases.

**Rationale:** LiteSpec is a pinned contract rather than a running service. A consumer product keeps its own API compatibility, migration, deprecation and rollback provisions.

### Keep a pinned release for as long as it serves

**Requirement:** A consumer MAY keep any published LiteSpec release for as long as it chooses.

**Rationale:** Adoption is the consumer's decision, and no repository change obliges a consumer to move.

### Record the reviewed LiteSpec release

**Requirement:** A consumer MUST record the LiteSpec release it adopts in `reviewedLiteSpecVersion` within `litespec.project.json`.

**Rationale:** A provision can gain force while keeping its ID, so an Exception written against an earlier release could otherwise apply to a rule nobody reread. Recording the release makes adoption an explicit act.

## Conventions

### Prefer direct action headings

**Default:** Start a Standard or Convention heading with a concrete action verb.

**Replacement:** Use a noun heading only for a pattern, an informative definition or an index entry.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/authoring#follow-the-google-developer-documentation-style-guide | guidance | Would a reviewer who knows developers.google.com/style accept the changed prose, apart from the additions this page states? |
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
| litespec/core/authoring#declare-structured-specification-metadata | checkable | `litespec consumer` validates each opening frontmatter block against the record schema. |
| litespec/core/authoring#use-one-metadata-carrier | guidance | Is the opening frontmatter block the only metadata on each page? |
| litespec/core/authoring#classify-every-specification-file | checkable | `litespec consumer` fails a Markdown file with no declared type outside a declared unstructured path. |
| litespec/core/authoring#derive-a-computed-fact-instead-of-restating-it | guidance | Does each count, census and membership list name its source or its command? |
| litespec/core/authoring#run-repeatable-authoring-checks | checkable | `litespec validate`, `dotnet test --solution LiteSpec.slnx` and `git diff --check` exit zero. |
| litespec/core/authoring#validate-current-standards-material | guidance | Does the validator read the working tree and no earlier release? |
| litespec/core/authoring#exclude-historical-transition-material | guidance | Does any active file carry history-specific material between releases? |
| litespec/core/authoring#publish-each-release-as-a-complete-contract | checkable | `litespec validate` emits no `ID_UNKNOWN_REFERENCE` diagnostic. |
| litespec/core/authoring#exclude-cross-release-compatibility-work | guidance | Would a consumer find any promise of migration, mapping or alias here? |
| litespec/core/authoring#keep-a-pinned-release-for-as-long-as-it-serves | guidance | Does any active provision oblige a consumer to adopt a later release? |
| litespec/core/authoring#record-the-reviewed-litespec-release | checkable | `litespec consumer` fails when `reviewedLiteSpecVersion` differs from the pinned release. |
| litespec/core/authoring#prefer-direct-action-headings | guidance | Does every changed Standard or Convention heading start with a concrete action verb? |
