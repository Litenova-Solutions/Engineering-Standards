# Authoring Standard

## Intent

Every page in LiteSpec and in a project built with it shares one shape: a fixed page style, testable rules called provisions, stable identifiers for those rules, and a table naming the evidence each rule needs. This page states that shape, the few prose rules the validators enforce, and how each release carries the complete contract. One shared shape lets readers learn pages once and lets validators check every page the same way.

## Concepts

### Page Authority

Standards state required boundaries, and Conventions state replaceable defaults. Everything else on a page is informative: Intent, Concepts, Rationale, Examples, guides, tutorials, and indexes explain without obliging.

`AGENTS.md` and a consumer's project agents file project the provisions an agent needs for that workspace. A projection cites the provision it projects and adds no obligation of its own. When a projection and its provision disagree, the provision wins.

`CONTRIBUTING.md` owns the contribution workflow. `CHANGELOG.md` describes the current release.

### Documentation Layers

A reader arrives with one question, and each page answers the one for its layer.

| Layer | Page style | The question it answers |
|:---|:---|:---|
| 1 | Tutorial | How do I get a first working result? |
| 2 | How-to | How do I reach this one goal? |
| 3a | Topic, stack, extension, pattern | What must hold, with which values and defaults? |
| 3b | Reference, command | What are the exact values and how do I run this? |
| 4 | The `Underneath` section of a command page | What does the command run, and how do I run it myself? |

An explanation page builds understanding: what LiteSpec is, why it works the way it does, and how its parts fit. It sits beside the layers because a reader takes it before or between tasks, not during one. An index routes readers to pages, and the glossary resolves one term each, so neither sits in a layer. A page links down a layer. Any page may link to the glossary.

### Page Styles

Every LiteSpec page uses exactly one style, decided by where the page lives.

| Page style | Where it lives | Template | Sections, in order |
|:---|:---|:---|:---|
| Topic | Any area page that owns provisions | `templates/standard/topic.md` | Intent, optional Concepts, Standards, Conventions, optional Reference Example, Verification |
| Stack | `stack.md` in a stack folder | `templates/standard/topic.md` | Intent, optional Concepts, Standards, Conventions, Verification |
| Extension | An `ext/` folder | `templates/standard/extension.md` | Intent, Activation, Baseline Relationship, Standards, Conventions, Dependencies, Verification |
| Pattern | `docs/frontend/patterns/` | [UI patterns](../frontend/patterns.md) | Intent, optional Concepts, optional Standards, optional Conventions, Patterns, Verification |
| Reference | `docs/reference/`, and one page per rule in `docs/analyzers/rules/` | `templates/standard/reference.md` | Intent, Reference, optional Notes |
| Command | `docs/tools/` | `templates/standard/command.md` | Name, Synopsis, Description, Arguments, Options, Exit Codes, Examples, Underneath |
| How-to | `docs/guide/`, and the other pages of `docs/analyzers/` | `templates/standard/how-to.md` | Purpose, optional Prerequisites, Procedure, Check |
| Tutorial | `docs/tutorial/` | `templates/standard/tutorial.md` | Purpose, Prerequisites, Lesson, What You Built |
| Explanation | `docs/learn/` and `docs/example/` | None | Intent, then sections of its own |
| Index | A `README.md` | None | Intent, then navigation groups |
| Glossary | `docs/reference/glossary.md` | None | One heading and definition per term, in alphabetical order |

A consumer page is a record or one of these styles. Each one opens with the specification metadata block the record schema defines.

| Page style | Template | Sections, in order |
|:---|:---|:---|
| product-brief | `templates/consumer/product-brief.md` | Summary |
| goal | `templates/consumer/goal.md` | Why It Matters |
| problem | `templates/consumer/problem.md` | Situation, Evidence |
| feature | `templates/consumer/feature.md` | Offering |
| constraint | `templates/consumer/constraint.md` | Summary, What It Requires |
| research | `templates/consumer/research.md` | Answer, optional Notes on Sources |
| decision | `templates/consumer/decision.md` | Context, Decision, Consequences, optional Evidence with Confidence |
| requirement-page | `templates/consumer/requirement-page.md` | Summary, The Situation, What We Do, Why It Is Better, Example, Costs and Risks, How Sure We Are, Position, Refusals |
| journey | `templates/consumer/journey.md` | Example, optional Before It Starts, Between the Steps |
| module | `templates/consumer/module.md` | optional Example, optional Known Limits, optional Notes |
| aggregate | `templates/consumer/aggregate.md` | Transitions, Data, optional Example, optional Known Limits, optional Notes |
| use-case | `templates/consumer/use-case.md` | Goal, What Happens except on queries, optional Risk, optional Example, optional Notes |
| rule-set | `templates/consumer/rule-set.md` | Summary, optional Notes |
| actor | `templates/consumer/actor.md` | Summary |
| role | `templates/consumer/role.md` | Summary |
| external-system | `templates/consumer/external-system.md` | Summary |
| permission-list | `templates/consumer/permission-list.md` | Entries only |
| entry-point-list | `templates/consumer/entry-point-list.md` | Entries only |
| limit-set | `templates/consumer/limit-set.md` | Entries only |
| runbook | `templates/consumer/runbook.md` | Impact, Prerequisites, Procedure, Verification, Rollback or Recovery, Escalation |
| deviation | `templates/consumer/deviation.md` | Consequences |
| known-gap | `templates/consumer/known-gap.md` | Exit |
| glossary | `templates/consumer/glossary.md` | Generated region only |
| example-cast | `templates/consumer/example-cast.md` | The Organization, The People, The Occasion, The Amounts, Recurring Situations, optional What This Page Does Not Do |
| tutorial | `templates/consumer/tutorial.md` | Purpose, Prerequisites, Lesson, What You Built |
| how-to | `templates/consumer/how-to.md` | Purpose, optional Prerequisites, Procedure, Check |
| reference | `templates/consumer/reference.md` | Intent, Reference, optional Notes |
| command | `templates/consumer/command.md` | Name, Synopsis, Description, Arguments, Options, Exit Codes, Examples, Underneath |
| configuration | `templates/consumer/configuration.md` | Intent, Settings, Precedence, optional Notes |
| index | `templates/consumer/index.md` | Intent, then navigation groups |

These rules apply to every page style:

- A page that owns provisions lives at `docs/<area>/<page>.md` or deeper, with a lowercase file name.
- A page has one H1.
- The index page of a section or folder, its `README.md`, is titled `Overview`, so a reader tells a section from its first page. A link to it names its section: `[Backend overview](../backend/README.md)`.
- A required section with nothing to say contains only `None.`
- An example sits inside the provision it illustrates, or in a Reference Example that names every provision it demonstrates.
- A tutorial, how-to, explanation, reference, command, or index page owns no provisions.
- A tutorial follows one path. An option or an alternative belongs on a how-to page.
- A Standards section opens directly with its first provision heading; provision headings are the content.
- A Concepts section holds definitions, diagrams, and vocabulary; obligations belong in Standards.
- An Activation section states the scope, the kinds, and the criterion that selects the extension.
- A Baseline Relationship section compares against the baseline; obligations belong in Standards.

### Provisions

A provision is a `###` heading inside one of three sections:

| Section | Kind | Heading |
|:---|:---|:---|
| `## Standards` | rule | Starts with an action verb, such as `Keep Shared UI in One Package` |
| `## Conventions` | convention | Starts with an action verb and names the replaceable default |
| `## Patterns` | pattern | The pattern's name, such as `Record header` |

A Standard states one testable obligation:

```markdown
### Keep Shared UI in One Package

**Statement:** A workspace MUST hold its shared primitives and composites in one shared UI package.

**Deviation:** Only with SHOULD or SHOULD NOT: the bounded reason that permits a departure.

**Rationale:** Why the rule exists.

**Example:** What following it looks like.
```

- The Statement is one sentence with exactly one capitalized modal, as [RFC 2119](https://www.rfc-editor.org/info/rfc2119/) and [RFC 8174](https://www.rfc-editor.org/info/rfc8174/) define them.
- A different obligation, prohibition, or permission is a separate provision.
- Conditions and scope belong in the Statement sentence.
- Every other paragraph of the provision sits under a Rationale or an Example label and adds no obligation.
- A Deviation appears if and only if the Statement uses `SHOULD` or `SHOULD NOT`.
- `SHOULD` keeps the standard's rule with a narrow recorded departure; a Convention is a project-owned default the project replaces by naming its own convention, not by recording a deviation.

A Convention states a default a project may replace:

```markdown
### Use the Default Location

**Default:** Store the catalog at `docs/ui/patterns.json`.

**Replacement:** A project names another path in `paths.uiPatterns`.

**Rationale:** Why this is the default.
```

A project that departs from a Standard records a deviation that cites the provision. A project that replaces a Convention names its own convention in its documentation. A Replacement names the local convention or its recording place, not a deviation. The [model page](model.md) states the deviation record.

A pattern provision carries its question, its default option, its compact behavior, and its rationale, and then its options with their wireframes. [UI patterns](../frontend/patterns.md) states the pattern contract and the wireframe language.

### Provision Identifiers

Every provision ID is `litespec/<page>#<slug>`:

| Segment | Source |
|:---|:---|
| `litespec` | The source that owns the provision |
| `<page>` | The page path under `docs/`, without `.md` |
| `<slug>` | The heading: lowercase, punctuation removed, spaces as hyphens |

`### Keep business invariants in Domain` on `docs/backend/architecture.md` is `litespec/backend/architecture#keep-business-invariants-in-domain`. The same text is the heading's address on the published site. Headings keep a stable verb-noun head, because a reword renames the ID.

The heading carries no identifier text. A renamed heading renames the ID, so the two stay in agreement. No two pages share a path, so no two provisions share an ID. Consumer record identifiers follow the [identifier page](../backend/identifiers.md).

### Verification Table

Every page that owns provisions ends with a Verification table that has one row per provision:

```markdown
| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/components#keep-shared-ui-in-one-package | guidance | Which shared primitives or composites live outside the shared package? Look in the workspace packages. |
```

A `checkable` row starts with the checking command in backticks, then the finding code, then the scope. A `guidance` row asks the one question a reviewer answers, naming the observable evidence and where to look. Evidence like "verify compliance" says nothing and is refused. Rows a tool generates come from that tool; one observable fact carries one mark across pages.

### Generated Regions

A generated region is a section a tool writes, between `<!-- generated:<name> -->` and `<!-- /generated:<name> -->`. Only the owning tool writes inside it, and an edit there is lost at the next generation. Authoring checks skip generated regions.

### Release Model

Each LiteSpec release is a complete contract that states every active provision. LiteSpec publishes no compatibility guarantee, migration path, deprecation period, or identifier alias between its own releases. A consumer pins one release, keeps it for as long as it chooses, and adopts a later release by accepting that release's whole contract.

Version numbers name complete pinned contracts. A patch release corrects a narrow area, a minor release makes one coherent change, and a major release replaces scope, method, or a stack.

This model governs LiteSpec itself. A consumer product has its own users, so its API compatibility, migration, deprecation and rollback provisions still apply.

## Standards

### Keep Authored Prose ASCII-Safe

**Statement:** Authored prose MUST contain only ASCII unless code, data, or mathematical content requires another character.

**Rationale:** Non-ASCII characters break in terminals, diffs, generated context, and plain-text tools: a curly quote becomes unreadable in one reader and a silent mismatch in another. ASCII prose renders the same everywhere the standard is read or checked.

**Example:** Write a hyphen or a comma where a typographic dash would go.

### Exclude Declared Content Paths from the ASCII Check

**Statement:** An ASCII check MUST exclude only the natural-language content paths that the project record declares.

**Rationale:** A product whose subject is another language carries that language in its content files, where a diacritic is part of a word rather than a styling choice. Excluding only the declared content paths keeps the check strict everywhere else: documents about that content stay in scope, so styled prose filed beside content still meets the check.

### Use One Normative Vocabulary

**Statement:** A Standards provision MUST use exactly one approved capitalized modal and no other capitalized normative term.

**Rationale:** Strength words work only when each one means exactly one thing. The provision contract defines the approved modals with their RFC meaning, so a reader knows whether a word obliges or suggests, and no second capitalized term sneaks in a different shade of obligation.

### Restrict Normative Language to Standards and Conventions

**Statement:** A capitalized modal MUST appear only in a Statement, a Deviation, a Default, or a Replacement.

**Rationale:** Obligation hides when it sits in Concepts, Rationale, or an example: a project replaces a default it saw nowhere in the labeled assertions. One location for every modal lets readers and tools find each obligation in the same place. A prohibition written as `cannot` and a rule written as `never` belong in the same labels.

### Use One Term for One Concept

**Statement:** Authored prose MUST name each concept with its one glossary term.

**Rationale:** A second name for one concept reads as a second concept: the reader hunts for a distinction the writer did not mean. One term per concept means each term is defined once and checked once.

### Record the Project Vocabulary as Data

**Statement:** A consumer MUST record each term, its rejected synonyms, the scope of each rejection, and its mannered terms in the project glossary satisfying `schemas/glossary.schema.json`.

**Rationale:** A glossary column headed "Avoid" speaks to a reader and to nothing else: no tool can check it. A rule held as data reaches the reader and the validator alike, so the same rejection appears in prose guidance and in diagnostics.

**Example:** A rejection carries the scope that binds it, because a word that is right in one module is wrong in another.

```json
{ "id": "term/customer", "term": "customer", "meaning": "A person or company that buys.",
  "owner": "__OWNER__", "status": "approved",
  "rejected": [{ "word": "client", "scope": "^domain/modules/orders/",
    "reason": "client names the API consumer" }] }
```

### Reject a Recorded Synonym Inside Its Scope

**Statement:** Authored prose MUST NOT use a synonym that the project glossary rejects for the scope the page sits in.

**Rationale:** Term drift is invisible one page at a time and plain across a module: each page looks fine while the project slowly speaks two languages. The expensive case is a synonym that is a defined term elsewhere, because one word then names two things and every reader guesses which one.

### Check the Vocabulary on Every Surface a Reader Meets

**Statement:** A consumer MUST name every non-Markdown surface its vocabulary reaches in `paths.glossaryScan`, including source, interface copy, the API contract, and acceptance tests.

**Rationale:** Documentation is often the smallest surface a reader meets; names in code, interface copy, contracts, and tests carry the vocabulary further. A rejection that stops at prose lets `ClientOrderId` breach a rejection of `client` where readers meet it most. A pattern that matches no file fails, so every listed surface meets the check.

**Example:** A pattern that matches no file is an error, so every listed surface meets the check.

```json
{ "paths": { "glossaryScan": ["apps/*/lib/i18n/dictionaries/*.json", "apps/api/tests/**/*.feature"] } }
```

### Exclude the Compound That Names Another Concept

**Statement:** A glossary rejection MUST list, in `except`, every compound in which a rejected word names a concept other than the one the rejection is about.

**Rationale:** A rejection matches a word, and a word can belong to more than one term: Expenses rejects `docket` in favor of `receipt` for payment proof while a docket still names the shipping list. Without the `except` list, the check would force the project to rename an unrelated concept or drop a sound rejection.

**Example:** The exemption covers the compound only, so the bare word stays rejected.

```json
{ "word": "docket", "reason": "one word for a payment receipt and a shipping list",
  "scope": "^docs/domain/modules/spending/", "except": ["shipping docket"] }
```

### Exclude Generated Regions from Prose Checks

**Statement:** An authoring check MUST skip every generated region.

**Rationale:** A generated region holds tool output that no author wrote and no author can fix by editing the page. Checking it would fail pages for words outside author control and train writers to ignore diagnostics.

### Use Controlled Capitalization

**Statement:** A page MUST use Title Case for its title and every heading.

**Rationale:** Titles and headings read as names in indexes, tabs, and search results. Title Case capitalizes every word except articles (`a`, `an`, `the`), coordinating conjunctions (`and`, `but`, `for`, `nor`, `or`, `so`, `yet`), and prepositions of four letters or fewer (`as`, `at`, `by`, `for`, `from`, `in`, `into`, `of`, `off`, `on`, `onto`, `over`, `per`, `to`, `up`, `upon`, `via`, `with`); the first and last words stay capitalized, and code, identifiers, and file names keep their own case.

### Use the Declared Page Contract

**Statement:** An authored page MUST use the sections, in order, of its page style.

**Rationale:** A fixed shape puts the authority, the context, the defaults, and the evidence in the same place on every page. Readers learn the shape once, and tools find each section without guessing. A page that invents its own order sends both searching.

### Limit Each Intent to Three Sentences

**Statement:** An Intent section MUST hold at most three sentences.

**Rationale:** The first sentence states the scope and boundary. The second states who applies the page and when. An optional third sentence relates the page to its neighbors.

### Write None in an Empty Required Section

**Statement:** A required section with nothing to say MUST contain only `None.`.

**Rationale:** One fixed marker reads the same on every page and gives the validator one shape to accept.

### Route the Reader Before Listing Pages

**Statement:** A documentation root index MUST state which page style answers which reader question before its first navigation group.

**Rationale:** A reader without a map from question to page opens both and trusts neither. Naming each style in the reader's terms before the first navigation group sends each question to the page that answers it.

**Example:** A `Which Page Do You Want` section names each style in the reader's terms, one sentence each.

### Name the Tool Rather Than the Mechanism

**Statement:** A tutorial step or how-to step MUST name the repository command that performs it, where one exists.

**Rationale:** A procedure that lists what a command already does becomes a second copy of that command's behavior. The copy drifts from the tool, and readers follow stale steps. Naming the repository command delegates the steps to the tool that performs them.

**Example:** A step reads ``Run `./shop up` `` rather than listing the compose start, the readiness wait, and each process launch.

### State One Layer per Page

**Statement:** A page MUST NOT describe both a command and the mechanism that command runs, outside an `Underneath` section.

**Rationale:** A reader who wanted the command reads mechanism detail as noise, and a reader who wanted the mechanism reads the command wrapper as an obstacle. One layer per page serves each reader, and the `Underneath` section holds the mechanism for the reader who asks for it.

### Name the Escape from Every Abstraction

**Statement:** A command page MUST state under `Underneath` what the command runs or the sentence `Nothing beneath this command is separately runnable.`.

**Rationale:** A wrapper nobody can see through leaves a failure with no command to run by hand and no layer to inspect. Stating what the command runs, or that nothing beneath it is separately runnable, gives every failure a next step.

**Example:** A command with nothing separately runnable writes `Nothing beneath this command is separately runnable.` under `Underneath`.

### Record a Setting as Reference

**Statement:** A configuration setting a reader can change MUST appear on a configuration page with its default, its scope, and what overrides it.

**Rationale:** A setting introduced inside a procedure is found only by the reader who already knows which procedure mentioned it. A configuration page with the default, scope, and overrides puts every setting where a reader looks it up.

### Cite Owned Content Instead of Copying It

**Statement:** A page MUST link to content another page owns instead of restating it.

**Rationale:** A copy drifts from its source with the next unrelated edit, and readers follow the stale one. One home for each fact keeps every reader on the current text.

### Keep Principle Pages Free of Stack Detail

**Statement:** A principle page MUST NOT name a framework, a package, or a language-specific construct.

**Rationale:** Technology lives in stack pages, so a principle holds for every stack. A framework name in a principle binds every stack to one choice.

### Place Each Stack Binding on Its Stack Page

**Statement:** A stack-specific section MUST live on its stack page rather than on a shared page.

**Rationale:** Shared pages stay neutral across stacks. Each stack page carries its own bindings, so a reader finds one stack's detail in one place.

### Split Extension Dependencies into Three Labeled Lines

**Statement:** An extension Dependencies section MUST carry the lines Packages, Related extensions, and Guides.

**Rationale:** Fixed labels separate package needs from related extensions and guides. A line with nothing to name holds `None.`.

### Define Each Glossary Term Under Its Heading

**Statement:** A glossary entry MUST hold its definition in the paragraph under its term heading.

**Rationale:** The heading anchor already carries the term identifier, so a `Term` line repeats it. A trailing `Rejected` line stays only where rejections exist.

### Write Atomic Standards Provisions

**Statement:** A Standards provision MUST follow the Standard contract this page defines.

**Rationale:** One provision with one obligation has one authority, one identifier, and one verification row. A provision that bundles two obligations leaves a project half-compliant with no identifier for the half it missed.

**Example:** `### Keep Business Invariants in Domain` owns one obligation about where invariants are enforced.

### Identify Actionable Conventions

**Statement:** A Convention provision MUST follow the Convention contract this page defines.

**Rationale:** A Convention heading under `## Conventions` makes each replaceable default traceable: a project cites exactly the default it replaces. Without the contract, defaults hide in prose and replacements cite paragraphs instead of identifiers.

### Attach Examples to Their Provisions

**Statement:** An informative example MUST belong to its provision or to a Reference Example that names every provision it demonstrates.

**Rationale:** An example floating free of its provision reads as a second rule: readers obey the illustration instead of the obligation. Belonging to its provision, or to a Reference Example that names every provision it demonstrates, marks it as illustration.

### Use the Declared Identifier Grammar

**Statement:** A provision ID MUST be `litespec/<page>#<slug>`, computed from its page path and its heading.

**Rationale:** The page names the file and the slug names the heading, so a citation resolves with no lookup table. One grammar for every identifier keeps citations writable by hand and checkable by tool.

**Example:** `litespec/frontend/components#compose-composites-in-page-code` is a heading on the frontend components page.

### Name the Owning Page in the Identifier

**Statement:** A provision ID's page segment MUST be its page's path under `docs/` without the `.md` extension.

**Rationale:** The page segment is the file a reader opens and the address the provision carries on the published site. Deriving it from the path keeps the identifier and the file from disagreeing.

**Example:** `litespec/frontend/structure#mirror-the-backend-use-case-path-in-kebab-case` and `litespec/frontend/blazor/structure#organize-features-by-module-and-use-case` are on two different pages.

### Keep Identifiers Out of Provision Headings

**Statement:** A provision heading MUST carry no identifier text.

**Rationale:** The page path and the heading already state the identifier. An identifier written into the heading repeats it at best and contradicts it at worst, after a rename touches one and misses the other.

### Exclude a Sequence Number from the Identifier

**Statement:** A provision ID MUST NOT contain a sequence number.

**Rationale:** A counter orders a provision among its siblings and says nothing about what it requires. Words name the obligation; numbers would renumber every sibling on each insertion and break citations for no gain.

### Map Provisions to Evidence

**Statement:** A page that owns provisions MUST give every provision one row in its Verification table.

**Rationale:** A provision with no verification row is a rule nobody checks: people assume a tool covers it while no tool was told. One row per provision makes each rule reviewable by a person or a tool.

### Mark Every Provision Checkable or Guidance

**Statement:** A Verification row MUST mark its provision `checkable` or `guidance`.

**Rationale:** The mark tells a reader who judges the provision: a tool or a person. Without it, a team automates a judgment call or hand-reviews what a command already proves.

### Name Observable Evidence in Verification Rows

**Statement:** A Verification row MUST name the observable evidence and where the reviewer looks.

**Rationale:** A row that restates its Statement sends the reviewer in a circle: the evidence confirms that the rule says what it says. Naming the artifact and its location turns the row into an instruction the reviewer follows.

### Generate Repeated Verification Rows with the Owning Tool

**Statement:** A page MUST NOT hand-write a Verification row that a tool generates.

**Rationale:** Pattern pages share one check across options; the owning tool writes those rows from the option IDs. A hand-written copy drifts from the generated set.

### Give One Observable Fact One Mark Across Pages

**Statement:** One observable fact MUST carry one mark across pages.

**Rationale:** A fact checked by a tool on one page and judged by a person on another leaves each reviewer unsure which judgment holds.

### Regenerate the Provision Index

**Statement:** A standards change MUST leave `docs/reference/provisions.md` equal to the output of `litespec provisions`.

**Rationale:** One generated page resolves every identifier to its heading and page, so a reader follows a citation in one step. Regenerating it with `litespec provisions` on every standards change keeps the index and the pages from disagreeing.

### Declare Structured Specification Metadata

**Statement:** A consumer page MUST open with a specification metadata block satisfying the record schema for its declared type.

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

### Use One Metadata Carrier

**Statement:** A consumer page MUST use its opening specification metadata block as its only metadata carrier.

**Rationale:** Two metadata carriers on one page disagree sooner or later: source links, paths, and evidence drift between the header and the body. One opening block keeps metadata in one place, while the body sections carry the links, paths, and evidence beside what they describe.

### Classify Every Specification File

**Statement:** Every Markdown file under the consumer documentation root MUST declare a record type or page style, or sit under a declared unstructured path.

**Rationale:** A file the validator leaves unclassified is skipped, and a skipped file looks sound: its errors stay hidden. Requiring every file to declare a type or sit under a declared unstructured path leaves no page unchecked. A directory index that owns no record uses the index style.

### Derive a Computed Fact Instead of Restating It

**Statement:** A specification MUST name the source or the command that produces any count, census, or membership list computed from code.

**Rationale:** A restated number is right until the next unrelated commit changes the code it counts, and nothing reports when it goes stale. Naming the source or the command gives every reader the current figure instead of the figure from commit day.

**Example:** A page states the rule and the command rather than the total.

```markdown
Every command declares an audit position. To count the declarations:

    grep -rl "Audited(" src/Application --include=*.cs | wc -l
```

### Run Repeatable Authoring Checks

**Statement:** A standards change MUST pass the repository validator, the test suite, and `git diff --check`.

**Rationale:** The repository validator, the test suite, and `git diff --check` each catch what the others miss: structure, behavior, and whitespace. Passing all three on every standards change keeps the standard checkable by anyone who runs the same commands. The change report lists every skipped check with its reason. The [command index](../tools/README.md) names each check and its command.

### Validate Current Standards Material

**Statement:** The standards validator MUST evaluate only current standards material.

**Rationale:** Each pinned release is a complete snapshot, so the validator judges the working tree alone. Reading history would let a provision pass on the strength of a release nobody pinned. Git history and the changelog give release context to readers outside validation.

### Exclude Historical Transition Material

**Statement:** Current standards material MUST NOT contain history-specific paths, IDs, terms, aliases, replacement maps, release migration material, compatibility rules, or transition checks.

**Rationale:** A snapshot that carries aliases, maps, migration notes, or transition checks for other releases forces every reader to learn releases they did not pin. The published snapshot states its own contract and nothing else. An extension's `Baseline Relationship` section names a provision it replaces inside this release, which is a current replacement rather than history.

### Publish Each Release as a Complete Contract

**Statement:** A LiteSpec release MUST state every active provision without depending on an earlier release.

**Rationale:** A consumer pins one snapshot and reads it as the whole obligation. Depending on another release would force the consumer to pin and read two contracts to know either. Stating every active provision in each release keeps one snapshot sufficient.

### Exclude Cross-Release Compatibility Work

**Statement:** The LiteSpec repository MUST NOT publish a compatibility guarantee, migration path, deprecation period, or identifier alias between its own releases.

**Rationale:** LiteSpec is a pinned contract, not a running service: consumers adopt a release whole, on their own schedule. Compatibility guarantees, migration paths, deprecation periods, and identifier aliases between LiteSpec releases would promise a continuity the model does not offer. A consumer product keeps its own API compatibility, migration, deprecation, and rollback provisions for its own users.

### Keep a Pinned Release for as Long as It Serves

**Statement:** A consumer MAY keep any published LiteSpec release for as long as it chooses.

**Rationale:** Adoption is the consumer's decision. If a repository change could oblige a move, every LiteSpec edit would become a deadline for every consumer. Keeping any published release for as long as it serves decouples the consumer's schedule from the standard's.

### Record the Reviewed LiteSpec Release

**Statement:** A consumer MUST record the LiteSpec release it adopts in `reviewedLiteSpecVersion` within `litespec.project.json`.

**Rationale:** A provision can gain force while keeping its ID, so a deviation written against one release could otherwise apply to a rule nobody reread. Recording the adopted release in `reviewedLiteSpecVersion` makes adoption an explicit act and tells every reader which contract the project reviewed.

## Conventions

### Prefer Direct Action Headings

**Default:** Start a Standard or Convention heading with a concrete action verb.

**Replacement:** Use a noun heading only for a pattern, an informative definition, or an index entry.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/authoring#keep-authored-prose-ascii-safe | checkable | `litespec validate` emits no `PROSE_NON_ASCII` diagnostic. |
| litespec/core/authoring#exclude-declared-content-paths-from-the-ascii-check | guidance | Which non-ASCII prose sits outside the paths the project record declares? Look at the content files beside the declaration. |
| litespec/core/authoring#use-one-normative-vocabulary | checkable | `litespec validate` emits no `STANDARD_MODAL_COUNT` or `STANDARD_MODAL_VOCABULARY` diagnostic. |
| litespec/core/authoring#restrict-normative-language-to-standards-and-conventions | checkable | `litespec validate` emits no `PROSE_NORMATIVE_LOCATION`, `STANDARD_INFORMATIVE_NORMATIVE`, or `CONVENTION_NORMATIVE` diagnostic. |
| litespec/core/authoring#use-one-term-for-one-concept | guidance | Which concepts appear under more than one name? Look at the terms the change adds, beside the glossary. |
| litespec/core/authoring#record-the-project-vocabulary-as-data | checkable | `litespec consumer` validates the project glossary against the glossary schema. |
| litespec/core/authoring#reject-a-recorded-synonym-inside-its-scope | checkable | `litespec consumer` emits no `LANGUAGE_REJECTED_SYNONYM` diagnostic. |
| litespec/core/authoring#check-the-vocabulary-on-every-surface-a-reader-meets | checkable | `litespec consumer` scans every `glossaryScan` pattern and fails a pattern that matches no file. |
| litespec/core/authoring#exclude-the-compound-that-names-another-concept | checkable | `litespec consumer` reports no `LANGUAGE_REJECTED_SYNONYM` diagnostic inside an exempt compound. |
| litespec/core/authoring#exclude-generated-regions-from-prose-checks | guidance | Which findings point inside generated-region fences? Look at the diagnostics the checks report. |
| litespec/core/authoring#use-controlled-capitalization | checkable | `litespec validate` emits no `PAGE_TITLE_CASE` diagnostic. |
| litespec/core/authoring#use-the-declared-page-contract | checkable | `litespec validate` emits no `PAGE_MISSING_SECTION`, `PAGE_SECTION_ORDER` or `PAGE_UNKNOWN_SECTION` diagnostic. |
| litespec/core/authoring#limit-each-intent-to-three-sentences | guidance | Which Intent sections run past three sentences? Look at the Intent section of each page the change touches. |
| litespec/core/authoring#write-none-in-an-empty-required-section | checkable | `litespec validate` emits no `PAGE_EMPTY_SECTION` diagnostic. |
| litespec/core/authoring#route-the-reader-before-listing-pages | checkable | `litespec validate` emits no `INDEX_MISSING_ROUTING` diagnostic. |
| litespec/core/authoring#name-the-tool-rather-than-the-mechanism | guidance | Which procedure steps lack a repository command? Look at the steps the change adds. |
| litespec/core/authoring#state-one-layer-per-page | guidance | Which command pages mix mechanism into other sections? Look outside the Underneath section of each command page the change touches. |
| litespec/core/authoring#name-the-escape-from-every-abstraction | checkable | `litespec validate` emits no `PAGE_MISSING_SECTION` diagnostic for a command page. |
| litespec/core/authoring#record-a-setting-as-reference | guidance | Which procedure-named settings lack a configuration page row? Look at the settings the change adds, beside the configuration pages. |
| litespec/core/authoring#cite-owned-content-instead-of-copying-it | guidance | Which passages restate content another page owns? Compare repeated passages with the owning page. |
| litespec/core/authoring#keep-principle-pages-free-of-stack-detail | guidance | Which principle pages name stack detail? Look for framework, package, and language names in principle pages. |
| litespec/core/authoring#place-each-stack-binding-on-its-stack-page | guidance | Which shared pages carry stack-specific sections? Look for stack sections outside stack pages. |
| litespec/core/authoring#split-extension-dependencies-into-three-labeled-lines | guidance | Which Dependencies sections lack a labeled line? Look in each page under an `ext/` folder. |
| litespec/core/authoring#define-each-glossary-term-under-its-heading | guidance | Which glossary entries open with something other than the definition, or carry a Term line? Look in `docs/reference/glossary.md`. |
| litespec/core/authoring#write-atomic-standards-provisions | checkable | `litespec validate` emits no `STANDARD_LABEL_INVALID`, `STANDARD_LABEL_ORDER`, `STANDARD_SENTENCE_COUNT`, `STANDARD_MODAL_COUNT`, `STANDARD_MODAL_VOCABULARY`, `STANDARD_MISSING_DEVIATION`, `STANDARD_UNEXPECTED_DEVIATION`, or `STANDARD_UNLABELED_CONTENT` diagnostic. |
| litespec/core/authoring#identify-actionable-conventions | checkable | `litespec validate` emits no `CONVENTION_MISSING_DEFAULT`, `CONVENTION_MISSING_REPLACEMENT`, `CONVENTION_DEFAULT_SENTENCE`, or `CONVENTION_REPLACEMENT_SENTENCE` diagnostic. |
| litespec/core/authoring#attach-examples-to-their-provisions | checkable | `litespec validate` emits no `STANDARD_EXAMPLE_LABEL` or `PAGE_UNKNOWN_SECTION` diagnostic. |
| litespec/core/authoring#use-the-declared-identifier-grammar | checkable | `litespec validate` emits no `ID_UNKNOWN_REFERENCE` diagnostic. |
| litespec/core/authoring#name-the-owning-page-in-the-identifier | checkable | `litespec validate` emits no `ID_PAGE_FILENAME` or `ID_DUPLICATE` diagnostic. |
| litespec/core/authoring#keep-identifiers-out-of-provision-headings | checkable | `litespec validate` emits no `ID_IN_HEADING` diagnostic. |
| litespec/core/authoring#exclude-a-sequence-number-from-the-identifier | guidance | Which identifiers carry a sequence number? Look at the provision IDs the change adds. |
| litespec/core/authoring#map-provisions-to-evidence | checkable | `litespec validate` emits no `VERIFY_MISSING_ID` or `VERIFY_UNKNOWN_ID` diagnostic. |
| litespec/core/authoring#mark-every-provision-checkable-or-guidance | checkable | `litespec validate` emits no `VERIFY_MARK` diagnostic. |
| litespec/core/authoring#name-observable-evidence-in-verification-rows | checkable | `litespec validate` emits no `VERIFY_GENERIC_EVIDENCE` or `VERIFY_TEMPLATED_EVIDENCE` diagnostic. |
| litespec/core/authoring#generate-repeated-verification-rows-with-the-owning-tool | guidance | Which rows repeat a row the owning tool generates? Look at repeated rows beside the owning tool's output. |
| litespec/core/authoring#give-one-observable-fact-one-mark-across-pages | guidance | Which shared facts carry different marks? Compare the marks of rows that name one check, using the provision index. |
| litespec/core/authoring#regenerate-the-provision-index | checkable | `litespec provisions --check` exits zero. |
| litespec/core/authoring#declare-structured-specification-metadata | checkable | `litespec consumer` validates each opening specification metadata block against the record schema. |
| litespec/core/authoring#use-one-metadata-carrier | guidance | Which pages carry metadata outside the opening block? Look at the body sections of each page the change touches. |
| litespec/core/authoring#classify-every-specification-file | checkable | `litespec consumer` fails a Markdown file with no declared type outside a declared unstructured path. |
| litespec/core/authoring#derive-a-computed-fact-instead-of-restating-it | guidance | Which counts, censuses, or membership lists lack a source or command? Look at the numbers the change adds. |
| litespec/core/authoring#run-repeatable-authoring-checks | checkable | `litespec validate`, `dotnet test --solution LiteSpec.slnx` and `git diff --check` exit zero. |
| litespec/core/authoring#validate-current-standards-material | guidance | Which validator inputs come from outside the working tree? Look at the paths the validator reads. |
| litespec/core/authoring#exclude-historical-transition-material | guidance | Which active files carry history-specific paths, aliases, or migration material? Look at the files the change adds. |
| litespec/core/authoring#publish-each-release-as-a-complete-contract | checkable | `litespec validate` checks every page of the release in one run, and the manifest names one version for the whole contract. |
| litespec/core/authoring#exclude-cross-release-compatibility-work | guidance | Which pages promise migration, mapping, or alias between releases? Look at the release material the change adds. |
| litespec/core/authoring#keep-a-pinned-release-for-as-long-as-it-serves | guidance | Which provisions oblige a move to a later release? Look at the Statements the change adds. |
| litespec/core/authoring#record-the-reviewed-litespec-release | checkable | `litespec consumer` fails when `reviewedLiteSpecVersion` differs from the pinned release. |
| litespec/core/authoring#prefer-direct-action-headings | checkable | `litespec validate` emits no `HEADING_ACTION` diagnostic. |
