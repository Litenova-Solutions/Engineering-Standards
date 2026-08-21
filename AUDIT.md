# Standards v1.11.0 Audit

Read-only documentation repository audit. No repository file was changed during the audit itself.

| Field | Value |
|:---|:---|
| Repository | Litenova Engineering-Standards |
| Branch | `v1.11.0`, clean working tree |
| Tracked files | 97, all inspected |
| Declared gates | 4 run, 4 pass |
| Findings | 19 (1 critical, 6 high, 8 medium, 4 low) |

---

## 1. Executive assessment

### Actual operating model

This repository is a pinned, submodule-distributed engineering contract for one bounded-context business application, consumed by both people and AI agents. Consumers pin a tag, add `standards.project.json`, and run three shipped Node validators. Authority flows from foundation to profile to extension to consumer override. `standards.manifest.json` is the machine-readable spine that names versions, extensions, and per-task context load plans.

The repository is a document set that validates document sets, including itself. `docs/foundations/authoring-standard.md` defines a controlled-prose grammar, and `tools/validate-standards.mjs` enforces it across 705 provisions. That self-application is the repository's central idea. It is also where the defect sits.

### Strongest properties

- **Snapshot discipline works.** `WRITING.SNAPSHOT.001` and `WRITING.SNAPSHOT.002` confine release history to `CHANGELOG.md`, which the validator excludes at `tools/validate-standards.mjs:129`. No aliases, replacement maps, or migration residue appear in active material.
- **Navigation is complete and intact.** All 98 relative links and anchors resolve. `docs/README.md` links every one of the 45 non-index doc pages. Four agent entry files (`CLAUDE.md`, `GEMINI.md`, `.windsurfrules`, `.github/copilot-instructions.md`) all delegate to one `AGENTS.md`.
- **All 705 provision IDs are unique**, and 39 of 41 pages hold exactly one Standards prefix.
- **The extension layer is exemplary.** All 15 extensions and 5 of 6 foundations are written exactly as the authoring standard specifies: named actors, one testable obligation per provision, evidence rows that name real artifacts. The target quality already exists in this repository.
- **The tooling is honest.** Validators are dependency-free, deterministic, use stable diagnostic codes and documented exit codes, make no network calls, and mutate nothing outside temporary fixtures.

### Principal defect

Release v1.11.0 states that it "Rewrote every active foundation, profile, convention, and extension page with explicit Requirement, Default, Replacement, Agent Summary, and Verification structures" (`CHANGELOG.md:7`). For the extensions and most foundations, that rewrite was done properly. For the 21 pages that constitute the baseline profile, it was applied mechanically: the section heading was copied into the `Requirement:` line, and the pre-existing prose was pushed down into `Rationale:`.

| Measure | Value |
|:---|:---|
| Provisions that restate their own heading | 289 of 705 |
| Share of the active contract | 41.0 percent |
| Words of obligation inside informative blocks | 19,065 |
| Verification rows that are template fills | 259 of 707 |
| Pages affected | 21 of 41, exactly the baseline profile |

The repository's own authority rule states that "Rationale and examples introduce no obligation" and that "Standards define required boundaries". Applying that rule literally to the current text, the entire baseline profile is formally non-normative. The requirement that an API must not accept an actor ID from the request body sits in a `Rationale:` block. So does the prohibition on modelling aggregate lifecycle with an enum. So does the entire rule-identifier scheme.

Three consequences follow, each a separate finding below. Agent Summaries now carry more obligation than the provisions they project (AUD-004), which inverts the projection rule. Tier 1 and Tier 2 context are normatively identical, so tiered loading buys nothing (AUD-005). The verification tables that should have caught this were filled from the same template (AUD-003).

### Recommended direction

Do not restructure this repository. Refill it. The information architecture, manifest, load plans, snapshot policy, and validator design are the right ones and need only targeted correction. The work is to rewrite 289 provisions on 21 pages to the standard that the extensions already meet, and to add the validator rules that would have prevented the regression.

Because the repository does not do backward compatibility, migration, or mitigation, the repair carries no transition cost. A consumer pinned to v1.11.0 keeps v1.11.0. Everything the repair changes, including the prefix normalization in section 4, is absorbed at the moment a consumer chooses to adopt the next complete contract.

---

## 2. Repository inventory

| Class | N | Location | Audience | Authority | Validated by |
|:---|---:|:---|:---|:---|:---|
| Foundation | 6 | `docs/foundations/` | Author, agent, consumer | Canonical, base of precedence | validate-standards |
| Profile | 1 | `docs/profile/` | Consumer, agent | Canonical, composes conventions | validate-standards |
| Convention | 19 | `docs/conventions/` | Implementer, agent | Canonical, profile-selected | validate-standards |
| Extension | 15 | `docs/extensions/` | Implementer, agent | Canonical, conditional, may replace baseline | validate-standards |
| Index | 5 | 4 `README.md` plus root `README.md` | All | Informative navigation | validate-standards, class `index` |
| Guide | 2 | `docs/guides/` | New consumer, modeller | Informative procedure | validate-standards, class `guide` |
| Glossary | 1 | `docs/reference/glossary.md` | All | Terminology control, 53 terms | validate-standards, class `glossary` |
| Agent entry | 5 | `AGENTS.md` plus 4 stubs | AI agents | Informative projection of cited provisions | `checkAgentProjection`, citation presence only |
| Contribution | 2 | `CONTRIBUTING.md`, PR template | Contributor, reviewer | Owns workflow and manual review | Referenced by `repository.writing` load plan |
| Release history | 1 | `CHANGELOG.md` | Consumer, maintainer | Sole release note | None, deliberate |
| Consumer template | 22 | `templates/docs/` | Consumer | Starting point, not authority | 3 UI JSON plus `standards.project.json` |
| Authoring template | 3 | `templates/standards/` | Standards author | Starting point | validate-standards, virtual-path pass |
| Schema | 6 | `schemas/` | Tool, consumer | Machine contract | 2 tracked consumers, 3 UI via case suite |
| Validator | 5 | `tools/*.mjs` | CI, consumer | Executable enforcement | 2 of 3 validators have case suites |
| Manifest | 1 | `standards.manifest.json` | Tool, agent | Versions, extensions, 17 load plans | validate-standards plus schema |
| Other | 3 | `LICENSE`, `.gitignore`, `assets/*.svg` | All | Non-normative | None |

### Coverage and method

- **Machine-parsed in full:** all 46 Markdown pages under `docs/`. Every heading, provision block, verification row, summary bullet, identifier, and relative link, with fenced code excluded from provision counts.
- **Read in full:** all 6 foundations, the profile, glossary, both guides, all 5 indexes, `AGENTS.md`, `CONTRIBUTING.md`, all 5 agent-entry files, the manifest, `tools/README.md`, `templates/docs/README.md`, all 3 authoring templates, and `docs/extensions/caching.md` as an extension sample.
- **Structurally parsed, selectively read:** the 19 convention bodies and 14 remaining extension bodies. Excerpts from `api.md` and `domain.md` were read verbatim to confirm the provision-shape finding.
- **Validators:** read `checkAgentProjection`, `parseBlock`, the `KINDS` table, the generic-evidence rule, and the file-walk and page-class logic. Grepped all five for mutation, network, and subprocess use.
- **Templates:** all 15 Markdown metadata blocks were extracted and checked against the `KINDS` table that `validate-consumer.mjs` enforces.
- **Not assessed:** the rendered site at `litenova.solutions/Standards`, which is outside the checkout, and Git history beyond the tracked `CHANGELOG.md`.

### Gates executed

| Command | Result | Exit |
|:---|:---|---:|
| `node tools/validate-standards.cases.mjs` | Standards validator cases passed: 77 cases. | 0 |
| `node tools/validate-standards.mjs` | Standards authoring checks passed. | 0 |
| `node tools/validate-ui.cases.mjs` | PASS: every case behaved as specified | 0 |
| `git diff --check` | no output | 0 |
| `node tools/validate-consumer.mjs` | Skipped. Requires a consumer root with `standards.project.json`. | n/a |

All four declared repository gates pass. Every finding in this report survives a fully green pipeline, which is the most important fact about the validation layer.

---

## 3. Authority map

### Declared model

```text
AGENT.PRECEDENCE.001  consumer override > extension > profile > foundation

canonical     docs/foundations/*        6 pages   base obligations
              docs/profile/*            1 page    composes 20 documents
              docs/conventions/*       19 pages   baseline implementation rules
              docs/extensions/*        15 pages   conditional, names each rule it replaces

machine       standards.manifest.json             versions, extension scope, 17 load plans
              schemas/*.json           6 files    metadata, manifest, project, 3 x UI

projection    AGENTS.md                           Tier 0, must cite and must not strengthen
              ## Agent Summary         38 pages   Tier 1, max 10 bullets, must cite
              CLAUDE.md GEMINI.md .windsurfrules copilot-instructions.md -> AGENTS.md

informative   Intent  Rationale  Example  Reference example  Concepts
              docs/guides/*  docs/README.md  templates/*  CHANGELOG.md
```

### Actual model

```text
On the 15 extensions and 5 of 6 foundations, the declared model holds.

On the 21 baseline pages:

  Requirement:   restates the heading            carries no information
  Rationale:     72.8 words average              carries the real obligation
  Verification:  "Pull request review asserts    names no artifact
                 `heading` in the owning
                 specification and source paths."

Net effect on the precedence chain:

  extension (real obligations)  >  profile + conventions (formally informative)

An extension therefore outranks a baseline it can no longer meaningfully replace.
```

### Ambiguous or competing authority

| Subject | Source A | Source B | Basis | Finding |
|:---|:---|:---|:---|:---|
| `implementationStatus` values | `CORE.DOCUMENTS.003`, `planned` or `verified` | Schema, `AGENTIC.METADATA.001`, `validate-consumer.mjs:161`, plus `implemented` | Undeclared. A foundation `MUST` contradicts the shipped schema. | AUD-002 |
| Baseline obligations | Convention `Requirement:` blocks, empty | Convention `Rationale:` blocks, full | Authoring standard says Rationale is informative. Practice says otherwise. | AUD-001 |
| Domain state, closed sets, errors, contracts | Canonical provisions in `docs/conventions/backend/` | `AGENTS.md:56-59`, which adds detail absent from them | Projections must not strengthen. Here they must, to stay useful. | AUD-004 |
| Consumer gate commands | `CI.GATES.001` table in `ci.md` | `AGENTS.md` command blocks, citing `RELEASE.GATES.001` | Two authored copies. The projection cites the wrong owner. | AUD-014 |
| Aggregate README requirement | `AGENTIC.CONVENTION.002` Rationale, a replaceable default | `validate-consumer.mjs:184`, a hard check | A replaceable convention is enforced as if mandatory. | AUD-009 |
| Core vocabulary | `docs/reference/glossary.md`, 53 terms | `engineering-system.md` Concepts, 19 terms, 16 overlapping | Two authored definitions per term. `CORE.SOURCE.001` permits one. | AUD-010 |
| Extension activation | `SCOPE.EXTENSIONS.001`, `SCOPE.EXTENSIONS.002`, `AGENTIC.EXTENSIONS.001` | `docs/extensions/README.md`, a 9-step procedure and 2 prohibitions, uncited | Index pages carry no provisions. This one does. | AUD-013 |
| Metadata carrier syntax | No provision states it | `parseBlock` requires a leading `---` raw-JSON block | Enforced by code, unstated in the contract. | AUD-007 |

---

## 4. Terminology and naming

### One word, two concepts

**Repository.** The glossary defines exactly one sense: "A Domain-owned port that loads and stages complete aggregates without exposing general queries or committing transactions." The Git sense is used constantly and defined nowhere. The bare phrase "the repository" appears 14 times in the Git sense and 11 times in the Domain-port sense across the same document set. The collision is also structural: `docs/conventions/repository/` is named for the Git sense while `DOMAIN.REPOSITORY.001` two directories away means the port. `WRITING.TERM.001` requires one glossary term per concept.

| Term | Concept A | Concept B | Proposal |
|:---|:---|:---|:---|
| repository | The Git repository, consumer or standards | The Domain aggregate port | Glossary gains **Workspace** for the Git sense and renames the existing entry to **Repository (Domain port)**. Prose uses "this repository" or "the consumer workspace". Directory becomes `docs/conventions/workspace/`. |
| Standard | A single identified provision | The repository as a whole | Add a glossary entry for **Standard** as the provision sense. `Provision`, `Convention`, and `Rule ID` are already defined. This is the missing sibling. |
| module | Domain area, glossary, correct | Never used for a code assembly, explicitly disclaimed | No change. This one is handled well. |

### Identifier namespaces

705 IDs, all unique. The problem is not collision but ownership: three prefixes are split across pages, so an ID does not tell a reader or an agent which document owns it.

| Prefix | Currently owned by | Defect | Proposal |
|:---|:---|:---|:---|
| `UI.*` | `frontend/components.md` and `frontend/ui-governance.md` | Two pages, one prefix | `components.md` takes `COMPONENT.*`. `ui-governance.md` keeps `UI.*`. |
| `FRONTEND.*` | `frontend/rendering.md` and `frontend/structure.md` | Two pages, one prefix | `rendering.md` takes `RENDER.*`. `structure.md` keeps `FRONTEND.*`. |
| `DATA.*`, `STATE.*`, `FORM.*` | `frontend/data-and-state.md` alone | Three prefixes, one page. Only `DATA.CONVENTION.*` exists, so `STATE.*` and `FORM.*` have no convention namespace. | Unify under `DATA.*`: `STATE.OWNER.001` to `DATA.OWNER.001`, `FORM.CONTRACT.001` to `DATA.FORM.001`, `STATE.OPTIMISTIC.001` to `DATA.OPTIMISTIC.001`. |
| `PERSIST.CONVENTION.*` | `backend/persistence-marten.md`, whose Standards are `PERSIST.*` | Breaks the rule that a convention ID matches `<OWNING-SCOPE>.CONVENTION.<NNN>` | `PERSIST.CONVENTION.001` through `006` become `PERSIST.CONVENTION.001` through `006`. |
| `EXT.*` | All 15 extension pages | None. Disambiguated by a second segment. | No change. This is the pattern the others should follow. |

These renames are free. The repository does not do backward compatibility, so a prefix change costs nothing to a consumer pinned to an earlier release, and nothing in the tooling reads a previous release. Apply them in the same pass as the AUD-001 repair, while every affected page is already open. See D2 and D7 in section 10 for why the repair itself should not also bump every suffix.

### Naming that should not change

- File and directory names are kebab-case throughout, meaningful outside their parent, and match their manifest paths exactly.
- The consumer-side identifier grammars (`AC-{MODULE}-{USE-CASE}-{NN}`, `INV-{MODULE}-{NN}`, `E2E-{FLOW}-{NN}`, `POL-`, `VAL-`, `AUTZ-`, `PERS-`, `WFR-`) are consistent, scoped, and enforced.
- The three-segment provision form `<SCOPE>.<TOPIC>.<NNN>` is sound and should be the stated rule rather than an emergent one.

---

## 5. Findings

Nineteen findings, ordered by severity and dependency.

### AUD-001. The entire baseline profile is formally non-normative

**Severity:** Critical. **Category:** normative-design. **Confidence:** High.

**Evidence.** Parsing every provision on all 46 doc pages with fenced code excluded: 206 of 563 `Requirement:` blocks and 83 of 142 `Default:` blocks, 289 of 705 total or 41.0 percent, are verbatim restatements of their own heading after removing the actor and modal.

The affected set is exact and bimodal: 100 percent of provisions on 21 pages (the 19 baseline conventions, `docs/profile/dotnet-nextjs.md`, and `docs/foundations/engineering-system.md`) and 0 percent on the other 21 (all 15 extensions, 5 foundations, and the modelling guide).

Concrete pairs. `docs/conventions/backend/api.md:53`, heading "Derive authenticated identity from claims (API.ACTOR.001)", Requirement "Web APIs MUST derive authenticated identity from claims." The actual rule sits in the Rationale below it: "The implementation does not accept it from the body, form, route, query, or client-controlled header." Likewise `domain.md:72` `DOMAIN.STATE.001`, whose prohibition on enums, status strings, boolean flags, and computed discriminators is entirely inside Rationale.

Rationale blocks on the 21 affected pages average 72.8 words against 10.9 words on the sound pages, 19,065 words of displaced obligation in total.

`CHANGELOG.md:7` records the cause. The defect is unreleased: `v1.10.0` is the newest tag, the three v1.11.0 commits are ahead of `main`, and `git show v1.10.0:docs/conventions/backend/api.md` shows `API.ENDPOINTS.001` with no `Requirement:` block at all. The rule was the body prose that the conversion demoted into `Rationale:`. No consumer can currently pin a hollow release.

**Observation.** The v1.11.0 conversion promoted each section heading into the Requirement line and demoted the existing body into Rationale. It succeeded on the extensions and most foundations and was applied mechanically to the profile-composed set.

**Impact.** `docs/foundations/authoring-standard.md` states that "Standards define required boundaries", that "Intent, rationale, examples, summaries, guides, and indexes are informative", and that "Rationale and examples introduce no obligation." A conforming reader, and every AI agent instructed by `AGENTS.md` to "follow the cited canonical provision", must therefore treat all 19,065 words as non-binding.

What becomes optional includes the prohibition on taking an actor ID from client-controlled input (`API.ACTOR.001`), the ban on exposing exception messages, stack traces, SQL, or provider bodies in error responses (`API.ERRORS.001`), the entire rule-identifier and failure-code scheme (`AGENTIC.RULES.001`), and the aggregate-lifecycle modelling prohibition (`DOMAIN.STATE.001`). The security-relevant subset is why this is Critical rather than High.

A second consequence: because a provision that says nothing cannot be replaced meaningfully, an extension declaring that it replaces `PERSIST.WRITE.001` now replaces an empty statement.

**Recommendation.** Rewrite all 289 provisions so the `Requirement:` or `Default:` line carries the complete testable obligation, with actor, condition, action, and boundary in one sentence, and Rationale reduced to the constraint that explains it. Use the extension pages as the working model. `EXT.CACHE.KEY.001` is the reference shape. Add validator rule `PROVISION_RESTATES_HEADING`.

**Scope.** 19 files in `docs/conventions/`, `docs/profile/dotnet-nextjs.md`, `docs/foundations/engineering-system.md`. 289 provisions, 21 verification tables, 38 Agent Summaries.

### AUD-002. A foundation MUST contradicts the shipped metadata schema

**Severity:** High. **Category:** contradiction. **Confidence:** High.

**Evidence.** `docs/foundations/principles.md`, `CORE.DOCUMENTS.003`: "A behavior specification MUST use `planned` or `verified` implementation status separately from specification authority."

`schemas/specification-metadata.schema.json:45-48` declares the enum `planned`, `implemented`, `verified`. `tools/validate-consumer.mjs:161` accepts the same three. `docs/foundations/engineering-system.md` `AGENTIC.METADATA.001` defines all three, including "`implemented` means implementation exists while acceptance evidence remains incomplete." `CHANGELOG.md:109` records `implemented` being added in v1.6.0.

**Observation.** Two foundation pages state different closed sets for the same field. No precedence rule distinguishes them. Both are foundations, so `AGENT.PRECEDENCE.001` does not resolve it, and `AGENT.CONFLICT.001` requires an agent to stop.

**Impact.** A consumer or agent following `CORE.DOCUMENTS.003` literally will reject or rewrite a valid `implemented` status that the schema and validator both accept. A correctly halting agent stops work on any specification carrying that value.

**Recommendation.** Retire `CORE.DOCUMENTS.003` and issue a replacement that either names all three values or, better, cites `AGENTIC.METADATA.001` as owner and states only the authority and implementation separation that is the actual concern of `principles.md`. Add rule `ENUM_PROSE_DRIFT`.

**Scope.** `docs/foundations/principles.md` and its Verification row.

### AUD-003. A third of verification evidence is template fill

**Severity:** High. **Category:** validation. **Confidence:** High.

**Evidence.** 259 of 707 verification rows, 36.6 percent, match one of three generated sentence patterns. 224 read "Pull request review asserts `<lowercased heading>` in the owning specification and source paths." 31 read "Repository static check asserts `<heading>` for the owning paths." 4 use an `operation` variant.

The affected files are the same 21 pages as AUD-001, minus `backend-testing.md` and `frontend/testing.md`, which carry real evidence. Method assignment also looks generated. `API.ENDPOINTS.001`, a structural rule about endpoint mapping, is marked `operation` and evidenced by "The release record captures the observed `use one endpoint per operation` result."

The check that should catch this is a four-phrase literal blocklist at `tools/validate-standards.mjs:13`.

**Observation.** The authoring standard requires that "Evidence names a command, path, test, artifact, assertion, or observable result" and rejects generic text. The template names none of these. It interpolates the heading. It evades the blocklist because the blocklist enumerates four phrases rather than testing for specificity.

**Impact.** The verification table is the mechanism by which every provision becomes reviewable. For 259 provisions it now instructs a reviewer to confirm that a rule says what it says. Combined with AUD-001, the baseline has neither a testable obligation nor a way to check one.

**Recommendation.** Rewrite the 259 rows alongside the provisions they verify, naming a real command, path, test ID, or architecture-test assertion. Replace the blocklist with `VERIFY_TEMPLATED_EVIDENCE`, which rejects any evidence string containing the provision's own heading text, and `VERIFY_NO_ARTIFACT`, which requires a backticked path, command, or identifier for `static` and `test` methods.

**Scope.** 19 verification tables, `tools/validate-standards.mjs`, and its case suite.

### AUD-004. AGENTS.md strengthens the provisions it projects

**Severity:** High. **Category:** authority. **Confidence:** High for the four cited pairs. Medium on total prevalence, which is only measurable after AUD-001 is fixed.

**Evidence.** The authoring standard states: "`AGENTS.md` and Agent Summary sections are concise projections. A projection cannot introduce or strengthen an obligation." Four counterexamples in the High-Risk Boundaries list:

- `AGENTS.md:56` says "Model aggregate lifecycles with **an abstract state and sealed state records**." `DOMAIN.STATE.001` requires only "model every Aggregate lifecycle with state records."
- `AGENTS.md:57` says "Model Domain closed sets **with records or typed value objects**, never enums." `DOMAIN.CLOSEDSET.001` requires only "without enums."
- `AGENTS.md:59` says "Give **each** rejected Domain rule **its own exception type and stable failure code**." `DOMAIN.ERROR.001` requires only "reject business violations with Domain exceptions."
- `AGENTS.md:58` says "Give each layer ownership of **its messages, results, and transport models**." `ARCH.CONTRACTS.001` requires only "own each layer's contract types."

The guard that should catch this, `checkAgentProjection` at `tools/validate-standards.mjs:861`, only asserts that each paragraph or bullet contains a dotted-uppercase identifier. It never compares the projection to its source.

**Observation.** Each added phrase is technically correct. It is drawn from the canonical page's Rationale. The projection is more useful than the provision precisely because AUD-001 emptied the provision.

**Impact.** Authority is inverted. The document declared informative is the only place several real obligations are stated in normative form. An agent instructed to "follow the cited canonical provision when a projection omits detail" will find the canonical provision omits more detail than the projection.

**Recommendation.** Fix at the source. Once AUD-001 restores the four provisions, trim each bullet back to a strict subset. Extend `checkAgentProjection` with `PROJECTION_UNSOURCED_TERM`, flagging content words in a projection bullet that appear nowhere in the cited provision's `Requirement:` or `Default:` line.

**Scope.** `AGENTS.md` High-Risk Boundaries. Re-check the same pattern across all 38 Agent Summaries after the repair.

### AUD-005. Tier 1 and Tier 2 carry identical normative content

**Severity:** High. **Category:** agent-usability. **Confidence:** High.

**Evidence.** 180 of 363 Agent Summary bullets, 50 percent, are textually equal to or a superset of the `Requirement:` line they cite. Every bullet in `api.md` matches this pattern: "Use one endpoint per operation." against "Web APIs MUST use one endpoint per operation.", repeated for all twelve.

The manifest defines 17 load plans, each with a Tier 1 list of `#agent-summary` anchors and a Tier 2 list of full documents. `AGENT.LOAD.002` requires loading "Tier 2 when the selected task requires full guidance", and `AGENT.CONVENTION.002` requires it "before generating a file, changing a public boundary, or choosing between patterns."

**Observation.** On the 21 affected pages, escalating from Tier 1 to Tier 2 adds only informative Rationale. Since Rationale carries no obligation, the escalation adds no normative content at all.

**Impact.** The tiered load plan, the repository's principal mechanism for giving agents the smallest sufficient context, currently costs tokens without changing what an agent is required to do. An agent that stays at Tier 1 for a small edit loses nothing, which trains the wrong habit for when the provisions are repaired.

**Recommendation.** Resolved by AUD-001. Once Requirements carry the full obligation, summaries become genuine compressions again. Then add `SUMMARY_RESTATES_REQUIREMENT`, warning when a bullet is not materially shorter than the provision it cites.

**Scope.** 38 Agent Summary sections. The 17 `loadPlans` entries need no change.

### AUD-006. The consumer validator is unverified and never runs

**Severity:** High. **Category:** validation. **Confidence:** High.

**Evidence.** `tools/validate-consumer.mjs` is 236 lines and 14KB. There is no `validate-consumer.cases.mjs`. `.github/workflows/standards.yml` runs four steps, none of which invoke it. Its two sibling validators each ship a suite: `validate-standards.cases.mjs` has 77 cases, `validate-ui.cases.mjs` covers every UI rule with passing and failing cases.

`CONTRIBUTING.md` states the governing rule: "A changed validator rule includes one passing case and one failing case. A rule without both cases is unverified."

This validator carries the whole consumer-side contract: the `KINDS` table for 17 specification kinds, identifier patterns, cross-file reference resolution, extension scope checks, acceptance-trace uniqueness. It also invokes `validate-ui.mjs` for React consumers.

**Observation.** The single validator that every consumer runs is the one the repository never executes and never tests. Its correctness is asserted, not demonstrated.

**Impact.** A regression here fails silently in this repository and surfaces in every downstream consumer at once. `CHANGELOG.md:103` records exactly this having happened: the validator rejected the `implemented` status for a full release after the schema added it in v1.6.0, corrected in v1.6.1.

**Recommendation.** Add `tools/validate-consumer.cases.mjs` building a temporary consumer fixture with `standards.project.json`, a module, a use case, a flow, a workflow, and an aggregate README, with a passing and failing case per rule, following the `validate-ui.cases.mjs` pattern. Add it as a fifth CI step.

**Scope.** New `tools/validate-consumer.cases.mjs`, `.github/workflows/standards.yml`, `AGENTS.md` Repository Verification, `tools/README.md`, the PR template.

### AUD-007. The metadata carrier syntax exists only in code and templates

**Severity:** High. **Category:** machine-contract. **Confidence:** High on the undocumented syntax and the silent-skip behaviour, both read from source. Medium on the example being actively misleading.

**Evidence.** `tools/validate-consumer.mjs:101-107`, `parseBlock`, returns `null` unless the file starts with `---`, then parses raw JSON up to the next newline followed by `---`. The carrier is a `---`-delimited raw-JSON block, not YAML front matter and not a fenced code block.

No provision states this. `WRITING.METADATA.002` says only "MUST start with one JSON block satisfying `schemas/specification-metadata.schema.json`." `WRITING.METADATA.003` says "MUST use its opening JSON block as its only metadata carrier." `AGENTIC.METADATA.001` Rationale says "starts with one JSON metadata block." The glossary says "The opening JSON block". None names the delimiter.

The only worked example of Specification Metadata in the documentation, at `docs/extensions/README.md`, presents the object inside a fenced `json` block with no `---` delimiters.

**Observation.** The syntax is discoverable only by copying a template or reading validator source. All 15 Markdown templates use it correctly, so a consumer who copies templates succeeds. A consumer or agent who authors from the standard alone produces a file `parseBlock` returns `null` for.

**Impact.** An unstated machine contract on the most-copied consumer artifact. The failure is quiet: `parseBlock` returning `null` means the file is skipped, not rejected, so an incorrectly delimited specification is silently unvalidated rather than reported.

**Recommendation.** State the carrier in `WRITING.METADATA.002`: the block opens with a line containing only `---`, contains one JSON object, and closes with a line containing only `---`. Show it in the Example. Correct the `docs/extensions/README.md` example. Change `parseBlock` to report a diagnostic for a Markdown file under a specification path that lacks the carrier.

**Scope.** `docs/foundations/authoring-standard.md`, `docs/extensions/README.md`, `tools/validate-consumer.mjs`.

### AUD-008. The aggregate specification kind ships with no template

**Severity:** Medium. **Category:** completeness. **Confidence:** High.

**Evidence.** `aggregate` is a first-class kind: defined at `schemas/specification-metadata.schema.json:150`, present in the `KINDS` table, and given a dedicated branch at `tools/validate-consumer.mjs:184`. `AGENTIC.CONVENTION.002` requires it: "Every aggregate-root subdirectory contains one `README.md` aggregate specification with kind `aggregate`."

`templates/docs/` contains no aggregate template. `templates/docs/README.md` lists 21 templates across its two tables and does not mention the kind. The root `README.md` states: "The template index lists each consumer template and its target path."

**Observation.** Sixteen of the seventeen validated kinds have a template. The one that does not is required by a convention and enforced by a validator branch.

**Impact.** Any consumer with a multi-aggregate module, the case `AGENTIC.CONVENTION.002` spends four paragraphs on, must author an aggregate README from scratch, inferring required metadata from the schema and required sections from a convention's Rationale. The template index also overstates its own completeness.

**Recommendation.** Add `templates/docs/aggregate.md` with the metadata block and the sections `AGENTIC.CONVENTION.002` names: ownership, business states, technical mapping, transitions, invariants, events, indexed use cases. List it in the template index with target `docs/domain/modules/{module}/{aggregates}/README.md`.

**Scope.** New `templates/docs/aggregate.md`, `templates/docs/README.md`.

### AUD-009. A replaceable convention is enforced as a hard requirement

**Severity:** Medium. **Category:** authority. **Confidence:** High.

**Evidence.** `AGENTIC.CONVENTION.002` in `docs/foundations/engineering-system.md` carries "Default: Group module use-case files by aggregate root." and "Replacement: A consumer can replace this default with an explicit local convention." Its Rationale then runs to roughly 400 words specifying directory grammar, aggregate README requirements, ID scoping, and the documentation-to-code mapping rule.

`tools/validate-consumer.mjs` implements that grammar as a hard check. `useCaseFile` resolves a use case in the module directory or exactly one aggregate subdirectory, and line 184 applies aggregate-specific rules.

**Observation.** Three levels of authority disagree about the same rule. A Convention says replaceable, its Rationale states the rule as mandatory, and the validator enforces it unconditionally with no way to declare the replacement the Convention promises.

**Impact.** A consumer exercising the stated replacement right fails validation. The `overrides[].ruleId` field accepts only Standards IDs by design, so there is no mechanism to declare it. The convention advertises a freedom the tooling does not grant.

**Recommendation.** Split it. Promote the enforced parts, the aggregate subdirectory grammar and the aggregate README requirement, into a Standard whose verification names the validator check. Keep the genuinely optional part, whether a single-aggregate module nests or stays flat, as the convention.

**Scope.** `docs/foundations/engineering-system.md`, its Verification table, `tools/validate-consumer.mjs` diagnostics.

### AUD-010. Two glossaries define sixteen of the same terms

**Severity:** Medium. **Category:** duplication. **Confidence:** High.

**Evidence.** `docs/reference/glossary.md` defines 53 terms. The Concepts section of `docs/foundations/engineering-system.md` independently defines 19 more in "`Term` means" form, of which 16 also appear in the glossary: specification, agent, product, domain, module, use case, workflow, aggregate, aggregate root, aggregate state, aggregate invariant, event, event reaction, acceptance criterion, acceptance test, end-to-end test.

`CORE.SOURCE.001` requires one canonical source per authored fact. `CONTRIBUTING.md` extends it: "Keep one canonical source for each provision, version, extension, and technical fact."

**Observation.** The two definitions currently agree, so this is a maintenance hazard rather than an active contradiction. The engineering-system versions are longer and carry worked examples. The glossary versions are single sentences.

**Impact.** Sixteen terms must be changed in two places. The verification row for `WRITING.TERM.001` names the glossary as the comparison source, so a reviewer checking terminology consults the shorter definition while implementers work from the longer one.

**Recommendation.** Make the glossary the sole definition site for every term's one-sentence meaning. Reduce the engineering-system Concepts section to the relationships and worked examples that a glossary cannot carry: the concept diagrams, the rule-classification table, the module and aggregate distinctions, each linking to its glossary entry. Add rule `TERM_DUAL_DEFINITION`.

**Scope.** `docs/foundations/engineering-system.md` Concepts, `docs/reference/glossary.md`.

### AUD-011. "Repository" names two concepts and the glossary defines one

**Severity:** Medium. **Category:** terminology. **Confidence:** High on the collision. Medium on the directory rename, which is a judgement call recorded in section 10.

**Evidence.** The glossary's sole entry: "Repository. A Domain-owned port that loads and stages complete aggregates without exposing general queries or committing transactions."

Across `docs/` and the root Markdown files, the bare phrase "the repository" occurs 14 times meaning the Git repository and 11 times meaning the Domain port. Structural collision: the directory `docs/conventions/repository/` holds `REPO.*` provisions about Git repository layout, while `DOMAIN.REPOSITORY.001` in `docs/conventions/backend/domain.md` governs the port. `AGENTS.md` uses both senses.

**Observation.** The repository's most repeated noun is its least controlled term, and it is the term a search-based reader is most likely to use.

**Impact.** Ordinary reader friction, and a concrete agent hazard. An agent resolving "the repository" from the glossary while reading `docs/conventions/repository/structure.md` resolves to the Domain port. Searching returns both senses interleaved with no disambiguation.

**Recommendation.** Add **Workspace** to the glossary for the Git sense. Rename the existing entry to **Repository (Domain port)**. Rename `docs/conventions/repository/` to `docs/conventions/workspace/`. Replace bare Git-sense uses with "this repository", "the consumer workspace", or "the standards repository".

**Scope.** Glossary, 4 files move under `docs/conventions/workspace/`, manifest profile paths and both load plans referencing them, `docs/README.md`, `docs/profile/dotnet-nextjs.md` Composition.

### AUD-012. Three ID prefixes do not identify their owning page

**Severity:** Medium. **Category:** naming. **Confidence:** High.

**Evidence.** `UI.*` is split across `frontend/components.md`, 7 provisions, and `frontend/ui-governance.md`, 9. `FRONTEND.*` is split across `frontend/rendering.md`, 8, and `frontend/structure.md`, 6. `frontend/data-and-state.md` carries three Standards prefixes, `DATA.*`, `STATE.*`, and `FORM.*`, but only `DATA.CONVENTION.*`, so two of its scopes have no convention namespace.

`backend/persistence-marten.md` carries `PERSIST.*` Standards and `PERSIST.CONVENTION.001` through `006`, against the authoring standard's own rule that "Every actionable convention has an ID matching `<OWNING-SCOPE>.CONVENTION.<NNN>`."

**Observation.** All 705 IDs are unique, and 39 of 41 pages hold one Standards prefix, so this is a residue rather than a systemic failure. The extension pages show the pattern that works: one shared `EXT.` root disambiguated by a second segment.

**Impact.** A reader or agent given `UI.STATES.001` or `FRONTEND.CACHE.001` cannot tell which page owns it without a search. The `PERSIST.CONVENTION.*` case is a live rule violation the validator does not detect.

**Recommendation.** Apply the reassignments in section 4 during the AUD-001 repair, while each page is already open. Add rule `ID_PREFIX_OWNERSHIP` asserting one Standards prefix per page, no prefix on two pages, and convention prefixes matching their page's Standards prefix.

**Scope.** 4 files in `docs/conventions/frontend/` and `docs/conventions/backend/persistence-marten.md`, plus all cross-references to the renamed IDs.

### AUD-013. The extensions index carries an uncited procedure and prohibitions

**Severity:** Medium. **Category:** page-contract. **Confidence:** High.

**Evidence.** `docs/extensions/README.md` is classified as page class `index` by `tools/validate-standards.mjs:280`. Its H2s are Intent, Selection, Activation process, Example.

"Activation process" is a 9-step numbered procedure. It closes with two prohibitions carrying no provision ID: "Do not select an extension as a preference or for possible future work. Do not list a project-scoped extension in local Specification Metadata."

Both restate canonical provisions: `SCOPE.EXTENSIONS.001`, `CORE.COMPLEXITY.002`, and `AGENTIC.EXTENSIONS.001`.

The page contract states "Index. Intent, then navigation groups" and "Guides and indexes contain no normative provisions."

**Observation.** The validator's index check accepts any H2 after Intent, so the structure passes. The prohibitions use imperative prose rather than uppercase modals, which is why no modal check fires.

**Impact.** A fourth copy of the extension-selection rules, in the page a reader is most likely to consult, with no citation back to the three canonical sources. If any of them changes, this copy drifts silently. The Selection table itself is useful and correctly labelled as explanatory.

**Recommendation.** Keep Intent, the Selection table, and the Example. Move the 9-step procedure to `docs/foundations/agent-protocol.md` as a Reference example, or reduce it to a cited pointer. Delete the two prohibitions and link the three provisions. Tighten the index page contract so the validator rejects numbered procedures and imperative prohibitions in an index.

**Scope.** `docs/extensions/README.md`, the index branch of the page-contract check.

### AUD-014. Gate commands are authored twice and cite the wrong owner

**Severity:** Medium. **Category:** duplication. **Confidence:** High.

**Evidence.** `AGENTS.md` Consumer Verification contains three fenced command blocks: the two `dotnet` commands, the five `pnpm` commands, and the two consumer validators. Each block is attributed to `RELEASE.GATES.001`.

The same commands appear in the `CI.GATES.001` table at `docs/conventions/quality/ci.md:29-36`. They match exactly today.

`RELEASE.GATES.001` states only that a change "MUST run every check selected by its changed boundaries" and names no command. `RELEASE.GATES.002` and `RELEASE.GATES.003` likewise describe categories, not commands. The exact strings are owned by `CI.GATES.001`.

**Observation.** Two authored copies of the same technical fact, and the projection attributes them to a provision that does not contain them.

**Impact.** `CORE.SOURCE.001` permits one canonical source. A contributor updating the `CI.GATES.001` table has no signal that `AGENTS.md` holds a copy. An agent following the citation to `RELEASE.GATES.001` to confirm a command finds no command there.

**Recommendation.** Replace the three blocks in `AGENTS.md` with one sentence citing `CI.GATES.001` and naming `docs/conventions/quality/ci.md` as the command source. Keep the Repository Verification block, which is repository-local and canonical there.

**Scope.** `AGENTS.md`, `templates/docs/project-agents.md`, which carries the same pattern for consumers.

### AUD-015. The onboarding guide links to none of the standards it applies

**Severity:** Medium. **Category:** human-usability. **Confidence:** High on the absence of links. The step-to-provision mapping below is inference and should be confirmed by the owner.

**Evidence.** `docs/guides/getting-started.md` is 32 lines. Its Procedure is 12 numbered steps and contains zero links. Individual steps include "Create the API solution, four application projects, AppHost, ServiceDefaults, and baseline test projects." and "Configure PostgreSQL, Marten, LiteBus, diagnostics, HTTP boundaries, and deterministic OpenAPI generation."

Each maps to a full convention page, `REPO.DOTNET.001`, `ARCH.PROJECTS.001`, `PERSIST.*`, `API.OPENAPI.001`, `UI.SHADCN.001`, none of which is named or linked. The root `README.md` directs new consumers here.

By contrast the guide template requires "Link to canonical provisions instead of copying them", and `docs/guides/model-domain.md` does exactly that across its 12 subsections.

**Observation.** The guide is a correct and well-ordered checklist. It is not a path, because no step tells the reader where the rules for that step live. The sibling guide shows the repository already knows how to do this.

**Impact.** The first-use journey dead-ends at every step. A new consumer must return to `docs/README.md` and guess which of 19 convention pages governs step 7. The guide is the only page bridging "pin the submodule" to "implement one complete slice", so the gap sits on the highest-traffic path in the repository.

**Recommendation.** Add a governing-provision link to every step, following `model-domain.md`. Group the 12 steps into named stages: Pin, Configure, Structure, Specify, Implement, Operate. Keep the guide non-normative.

**Scope.** `docs/guides/getting-started.md`.

### AUD-016. A time-bound defect note sits inside a normative convention

**Severity:** Low. **Category:** scope. **Confidence:** High on the content. The conversion target is a design proposal.

**Evidence.** `PROFILE.CONVENTION.002`, "Note known toolchain interactions", in `docs/profile/dotnet-nextjs.md`. Its Rationale describes an ESLint 10 incompatibility with `eslint-plugin-react`, the thrown error, a workaround, a fallback to ESLint 9.x, and the instruction "Re-evaluate this note when the pins advance." It carries a Verification row and is composed into the profile like any other provision.

**Observation.** This is issue-tracker content: a third-party defect, a workaround, and a review trigger. Its Default line, "Note known toolchain interactions", is not a default a consumer can follow or replace.

**Impact.** A provision that expires. When the plugin ships ESLint 10 support the convention becomes false, and nothing detects that. It also weakens the profile page, whose four other provisions are durable composition rules.

**Recommendation.** The underlying advice is sound. Convert it to a Standard in `configuration.md`: a Next.js flat ESLint config MUST set a concrete `settings.react.version`, verified by a static config check. That is durable, testable, and correct regardless of plugin support. Drop the narrative and the version fallback. The changelog already records the context.

**Scope.** `docs/profile/dotnet-nextjs.md`, `docs/conventions/repository/configuration.md`.

### AUD-017. Fifteen consumer templates are shipped without a schema check

**Severity:** Low. **Category:** validation. **Confidence:** High.

**Evidence.** `tools/validate-standards.mjs` validates exactly two schema consumers, `standards.manifest.json` and `templates/docs/standards.project.json`. `validate-ui.cases.mjs` adds a baseline case covering the three UI JSON templates as shipped.

The 15 Markdown templates carrying Specification Metadata are checked by nothing. I extracted and checked all 15 against the `KINDS` table that `validate-consumer.mjs` enforces. All 15 pass.

**Observation.** No current defect. A coverage gap on artifacts designed to be copied.

**Impact.** A template whose metadata drifts from the schema ships green and fails first in a consumer repository, at the moment a new consumer is least able to diagnose it. The UI templates already have this protection, so the gap is inconsistent rather than deliberate.

**Recommendation.** Fold into the AUD-006 case suite. Build the fixture consumer from the tracked templates with placeholders resolved, exactly as `validate-ui.cases.mjs` does at its line 91. This validates all 15 and the directory grammar in one case.

**Scope.** New `tools/validate-consumer.cases.mjs`.

### AUD-018. An empty heading in the largest foundation page

**Severity:** Low. **Category:** page-contract. **Confidence:** High.

**Evidence.** `docs/foundations/engineering-system.md:145` is a level-3 "Vocabulary" heading, immediately followed at line 147 by "Product and end-to-end flow" at the same level. The heading has no body.

**Observation.** Intended as a grouping heading for the sibling headings that follow, but written at the same level, so it groups nothing. The rule "A required empty section contains only `None.`" covers required sections and does not catch this.

**Impact.** A dead entry in any generated table of contents on the repository's largest and most-read foundation.

**Recommendation.** Delete it, or promote it to level 2 if the Concepts section is genuinely two parts. Add rule `HEADING_EMPTY_BODY`.

**Scope.** `docs/foundations/engineering-system.md:145`.

### AUD-019. An orphaned sentence fragment in the changelog

**Severity:** Low. **Category:** writing. **Confidence:** High.

**Evidence.** `CHANGELOG.md:35-36` reads "- Added the controlled React web UI baseline decision." followed by an indented continuation "and a focused UI override decision template for alternate systems or specialist controls.", a fragment beginning with a conjunction after a closed sentence. Separately, the changelog's earliest entry is `v1.1.0` even though a `v1.0.0` tag exists, so the first release has no recorded note.

**Observation.** `CHANGELOG.md` is deliberately excluded from validation at `tools/validate-standards.mjs:129`, which is the right call for snapshot discipline. `CONTRIBUTING.md` nonetheless requires the authoring standard to apply to "every active standards page, template, instruction, and release note", and the changelog is the release note.

**Impact.** Cosmetic. Noted because the changelog is the only release-context artifact and the sole prose the validator never sees, so its defects persist indefinitely.

**Recommendation.** Join the fragment. Either add a `v1.0.0` entry or state in `CONTRIBUTING.md` that recorded history begins at v1.1.0. Optionally run the ASCII, sentence-length, and vague-term scanners over `CHANGELOG.md` while keeping it excluded from provision, link, and snapshot checks.

**Scope.** `CHANGELOG.md`, optionally the exclusion rule.

---

## 6. Target framework

| Dimension | Target | Change |
|:---|:---|:---|
| Purpose | A pinned, submodule-distributed engineering contract for one bounded-context ASP.NET Core, PostgreSQL, and Marten application with optional Next.js frontends, readable and enforceable by people and agents alike. | unchanged |
| Authority model | Consumer override, then extension, then profile, then foundation. Obligation lives only in `Requirement:` and `Default:` lines. Rationale, Example, Intent, Concepts, guides, indexes, and templates carry none. | restored, not redesigned |
| Document taxonomy | Six classes: foundation, profile, convention, extension, guide, index. Plus one glossary and two template families. No new classes. | unchanged |
| Page contracts | As declared today, with the index contract tightened to reject numbered procedures and imperative prohibitions, and empty-bodied headings rejected everywhere. | tightened |
| Normative model | One Standards provision equals one actor, one condition, one action, one boundary, one modal, one verification row, all inside the `Requirement:` sentence. Rationale explains the constraint and may not be the only place a rule appears. | enforced, new |
| Naming system | `<SCOPE>.<TOPIC>.<NNN>`. One Standards prefix per page, no prefix on two pages, convention IDs matching that prefix. Extensions keep `EXT.<AREA>.<TOPIC>.<NNN>`. | stated and enforced |
| Terminology | The glossary is the single definition site. Every term defined once. **Workspace** added, **Repository (Domain port)** disambiguated, **Standard** added. | consolidated |
| Cross-reference policy | Cite a provision ID, never restate its rule. A second mention of a technical fact is a link, not a copy. Applies to `AGENTS.md`, indexes, guides, and templates equally. | enforced, new |
| Summary policy | Max 10 bullets, max 20 words, every bullet a strict compression of a cited provision, no term absent from its source. | enforced, new |
| Verification model | One row per provision. Evidence names a command, path, test ID, artifact, or assertion. No evidence string may contain its own provision heading. | enforced, new |
| Snapshot policy | Active material states the current contract only. `CHANGELOG.md` is the sole release note and stays outside provision validation. | unchanged |
| Machine contracts | Six schemas, each with at least one tracked in-repo consumer exercised by a case suite. The metadata carrier syntax is stated normatively. | gaps closed |

Eight of eleven dimensions above are already correct as declared. The repository does not need a new design. It needs its existing design applied to 21 pages and backed by validator rules that make reapplication automatic.

---

## 7. Target repository tree

```text
Engineering-Standards/
  AGENTS.md                          Tier 0. Command blocks replaced with a citation.   AUD-014
  CLAUDE.md GEMINI.md .windsurfrules
  .github/copilot-instructions.md    Four delegating stubs. Correct as-is.
  CONTRIBUTING.md  CHANGELOG.md  README.md  LICENSE
  standards.manifest.json            Paths updated for the workspace rename.

  docs/
    README.md                        Canonical index. Complete today.
    foundations/
      scope.md  principles.md  agent-protocol.md
      release-standard.md  authoring-standard.md
      engineering-system.md          Concepts reduced, 20 provisions rewritten.  001 010 018
    profile/
      dotnet-nextjs.md               5 provisions rewritten, ESLint note relocated.  001 016
    conventions/
      workspace/                     renamed from repository/ to free the term       AUD-011
        structure.md  naming.md  dependencies.md  configuration.md
      backend/
        architecture.md  domain.md  application.md
        persistence-marten.md        PERSIST.CONVENTION.* becomes PERSIST.CONVENTION.*  AUD-012
        api.md
      frontend/
        structure.md                 keeps FRONTEND.*
        rendering.md                 FRONTEND.* becomes RENDER.*                       AUD-012
        components.md                UI.* becomes COMPONENT.*                          AUD-012
        ui-governance.md             keeps UI.*
        data-and-state.md            STATE.* and FORM.* become DATA.*                  AUD-012
        testing.md
      quality/
        backend-testing.md  security.md  operations.md  ci.md
    extensions/
      README.md                      Selection index only, procedure moved out.        AUD-013
      (15 extension pages, no change required)
    guides/
      getting-started.md             Steps linked and staged.                          AUD-015
      model-domain.md
    reference/
      glossary.md                    Sole definition site. Adds Workspace and Standard. 010 011

  schemas/                           6 schemas, unchanged
  templates/
    docs/                            plus aggregate.md                                 AUD-008
    standards/                       3 authoring templates, correct as-is
  tools/
    validate-standards.mjs           plus 5 rules
    validate-standards.cases.mjs     plus cases for each
    validate-consumer.mjs            metadata carrier reported, not skipped            AUD-007
    validate-consumer.cases.mjs      new, closes the untested validator            006 017
    validate-ui.mjs  validate-ui.cases.mjs
  assets/
```

### Why each structural change

- **`conventions/repository/` becomes `conventions/workspace/`.** Removes the only directory name that collides with a defined Domain term (AUD-011). Four files move. `REPO.*` identifiers stay, since the abbreviation is unambiguous.
- **`templates/docs/aggregate.md` added.** The one validated specification kind with no starting point (AUD-008).
- **`tools/validate-consumer.cases.mjs` added.** Brings the third validator to the standard the other two already meet (AUD-006, AUD-017).
- **ID prefix reassignments.** Four pages, applied during the AUD-001 repair. Free under the no-compatibility model (AUD-012, D2).
- **Nothing else moves.** The foundation, profile, convention, extension, guide, and reference split reflects real authority levels. Every index resolves and no orphan or circular path exists. Restructuring would cost consumer link churn and buy nothing.

---

## 8. File-by-file proposal

All 97 tracked files. Every disposition links to a finding or to a target rule from section 6.

### Root and agent entry, 13 files

| File | Disposition | Target or action | Findings |
|:---|:---|:---|:---|
| `AGENTS.md` | edit | Trim strengthened bullets to strict subsets. Replace three command blocks with a `CI.GATES.001` citation. Add the consumer case suite to Repository Verification. | 004 014 006 |
| `CLAUDE.md` | keep | Correct delegating stub. | |
| `GEMINI.md` | keep | Correct delegating stub. | |
| `.windsurfrules` | keep | Correct delegating stub. | |
| `.github/copilot-instructions.md` | keep | Correct delegating stub. | |
| `README.md` | edit | Update the tree block for the workspace rename. | 011 |
| `CONTRIBUTING.md` | edit | Add the provision-shape rule to Provision Changes. Require a case suite for every shipped validator. Note the changelog start point. | 001 006 019 |
| `CHANGELOG.md` | edit | Join the line 36 fragment. Add the v1.12.0 entry. Stays outside provision validation. | 019 |
| `.github/pull_request_template.md` | edit | Add checks for "no Requirement restates its heading" and "no evidence row names only a heading". | 001 003 |
| `.github/workflows/standards.yml` | edit | Add the `validate-consumer.cases.mjs` step. | 006 |
| `standards.manifest.json` | edit | Update 4 profile document paths and the affected load plans for the workspace rename. Version to 1.12.0. | 011 |
| `LICENSE` | keep | | |
| `.gitignore` | keep | | |

### Foundations, profile, index, reference, 9 files

| File | Disposition | Target or action | Findings |
|:---|:---|:---|:---|
| `docs/foundations/authoring-standard.md` | edit | Provisions are sound. Add: a Requirement may not restate its heading, the metadata carrier syntax, the ID-ownership rule, evidence may not contain its provision heading. | 001 007 012 003 |
| `docs/foundations/principles.md` | edit | Retire `CORE.DOCUMENTS.003`. Issue a replacement consistent with the schema's three values. | 002 |
| `docs/foundations/engineering-system.md` | rewrite | Rewrite 20 provisions and 21 evidence rows. Reduce Concepts to relationships and examples, linking the glossary. Split `AGENTIC.CONVENTION.002`. Remove the empty heading. | 001 003 009 010 018 |
| `docs/foundations/scope.md` | keep | Correct as written. | |
| `docs/foundations/agent-protocol.md` | edit | Correct as written. Optionally absorb the extension activation procedure as a Reference example. | 013 |
| `docs/foundations/release-standard.md` | keep | Correct as written. 28 sound provisions. | |
| `docs/profile/dotnet-nextjs.md` | rewrite | Rewrite 5 provisions and 6 evidence rows. Relocate the ESLint note to a `configuration.md` Standard. Update Composition for the workspace rename. | 001 003 016 011 |
| `docs/README.md` | edit | Update workspace paths. Structure is complete and correct. | 011 |
| `docs/reference/glossary.md` | edit | Add **Workspace** and **Standard**. Rename to **Repository (Domain port)**. Absorb any detail worth keeping from Concepts. | 010 011 |

### Conventions, 19 files, all rewrite

Every file below carries 100 percent tautological provisions and, except the two testing pages, fully templated evidence. Each needs the same treatment: move the obligation from `Rationale:` into `Requirement:` or `Default:`, apply any prefix reassignment, and write real evidence rows. Suffixes stay stable (D7).

| File | Prov. | Tmpl. rows | Additional action | Findings |
|:---|---:|---:|:---|:---|
| `conventions/backend/domain.md` | 30 | 30 | Largest page, 944 lines. Highest security and correctness weight. | 001 003 |
| `conventions/quality/security.md` | 19 | 18 | Sequence first with `api.md`. Highest-risk displaced obligations. | 001 003 |
| `conventions/backend/persistence-marten.md` | 18 | 17 | `PERSIST.CONVENTION.*` becomes `PERSIST.CONVENTION.*`. | 001 003 012 |
| `conventions/backend/api.md` | 17 | 17 | Contains `API.ACTOR.001` and `API.ERRORS.001`. Sequence first. | 001 003 |
| `conventions/backend/application.md` | 17 | 17 | | 001 003 |
| `conventions/backend/architecture.md` | 14 | 13 | | 001 003 |
| `conventions/quality/backend-testing.md` | 14 | 0 | Evidence already sound. Provisions only. | 001 |
| `conventions/repository/configuration.md` | 13 | 13 | Move to `workspace/`. Absorb the ESLint rule. | 001 003 011 016 |
| `conventions/frontend/data-and-state.md` | 13 | 13 | Unify `STATE.*` and `FORM.*` under `DATA.*`. | 001 003 012 |
| `conventions/quality/operations.md` | 13 | 13 | | 001 003 |
| `conventions/repository/naming.md` | 13 | 13 | Move to `workspace/`. | 001 003 011 |
| `conventions/frontend/components.md` | 12 | 12 | `UI.*` becomes `COMPONENT.*`. | 001 003 012 |
| `conventions/repository/dependencies.md` | 12 | 11 | Move to `workspace/`. | 001 003 011 |
| `conventions/frontend/rendering.md` | 11 | 11 | `FRONTEND.*` becomes `RENDER.*`. | 001 003 012 |
| `conventions/frontend/ui-governance.md` | 11 | 10 | Keeps `UI.*`. Evidence must name `validate-ui.mjs` diagnostics. | 001 003 |
| `conventions/frontend/testing.md` | 10 | 0 | Evidence already sound. Provisions only. | 001 |
| `conventions/quality/ci.md` | 9 | 9 | Becomes the sole owner of gate command strings. | 001 003 014 |
| `conventions/frontend/structure.md` | 9 | 9 | Keeps `FRONTEND.*`. | 001 003 |
| `conventions/repository/structure.md` | 9 | 8 | Move to `workspace/`. | 001 003 011 |

### Extensions, 16 files

| File | Disposition | Target or action | Findings |
|:---|:---|:---|:---|
| `docs/extensions/README.md` | edit | Keep Intent, Selection table, Example. Move the 9-step procedure out. Delete the two uncited prohibitions and link their provisions. | 013 |
| `docs/extensions/`, 15 pages | keep | All 15 already meet the target: 0 percent tautology, 0 templated rows, correct `EXT.<AREA>.*` namespacing. Use them as the rewrite reference. Only cross-references to renamed baseline IDs change. | |

### Guides, 2 files

| File | Disposition | Target or action | Findings |
|:---|:---|:---|:---|
| `docs/guides/getting-started.md` | rewrite | Link every step to its governing provision. Group the 12 steps into six named stages. | 015 |
| `docs/guides/model-domain.md` | keep | Meets the guide contract. Use as the model for the rewrite above. | |

### Templates, 25 files

| File | Disposition | Target or action | Findings |
|:---|:---|:---|:---|
| `templates/docs/aggregate.md` | add | New. Metadata block plus the sections the aggregate convention names. | 008 |
| `templates/docs/README.md` | edit | List the aggregate template and its target path. | 008 |
| `templates/docs/project-agents.md` | edit | Same command-duplication fix as `AGENTS.md`. | 014 |
| `templates/docs/`, 19 remaining | keep | All 15 metadata blocks validate against the enforced `KINDS` table. Brought under CI by the new case suite rather than edited. | 017 |
| `templates/standards/`, 3 files | keep | Correct. `normative-topic.md` models a real Requirement, not a heading echo. The templates did not cause AUD-001 and need no change to prevent it. | |

### Schemas, tools, assets, 13 files

| File | Disposition | Target or action | Findings |
|:---|:---|:---|:---|
| `schemas/`, 6 files | keep | All six are internally consistent with the validators. The `implementationStatus` enum is correct. The prose is what must change. | 002 |
| `tools/validate-standards.mjs` | edit | Add the rules in section 11. Replace the four-phrase generic-evidence blocklist. | 001 003 004 010 012 018 |
| `tools/validate-standards.cases.mjs` | edit | Add a passing and failing case for each new rule. | 006 |
| `tools/validate-consumer.mjs` | edit | Report a diagnostic for a specification-path Markdown file with no metadata carrier instead of skipping it. | 007 |
| `tools/validate-consumer.cases.mjs` | add | New. Fixture consumer built from tracked templates, passing and failing case per rule. | 006 017 |
| `tools/validate-ui.mjs` | keep | Deterministic, well-cased, correct. | |
| `tools/validate-ui.cases.mjs` | keep | The model case suite. Follow its fixture pattern. | |
| `tools/README.md` | edit | Document the new case suite. | 006 |
| `assets/agentic-engineering-system-icon.svg` | keep | | |

---

## 9. Implementation sequence

Six units. Each ends green. Not executed as part of this audit.

| Unit | Work | Depends on | Validation at close | Checkpoint |
|---:|:---|:---|:---|:---|
| 1 | Fix the contradictions and gaps that need no rewrite. Retire `CORE.DOCUMENTS.003` and replace it. State the metadata carrier in `WRITING.METADATA.002` and fix the extensions-README example. Add `templates/docs/aggregate.md`. Join the changelog fragment. Delete the empty heading. | none | All four gates. | Owner confirms the three-value status vocabulary. |
| 2 | Close the validation gaps before changing content. Add `validate-consumer.cases.mjs` with the template-derived fixture and a case per rule. Add the CI step. Make the missing-carrier case a reported diagnostic. | 1 | Five gates, including the new suite. | Review confirms every `KINDS` rule has both cases. |
| 3 | Add the rules that detect the defect. Implement `PROVISION_RESTATES_HEADING`, `VERIFY_TEMPLATED_EVIDENCE`, `VERIFY_NO_ARTIFACT`, `SUMMARY_RESTATES_REQUIREMENT`, `ID_PREFIX_OWNERSHIP`, `HEADING_EMPTY_BODY`, and `INDEX_CONTAINS_PROCEDURE`, plus cases. Land them as warnings, not errors. | 2 | Gates pass. The rules report the burn-down baseline recorded below. | Done. The measured baseline is the target the rewrite drives to zero. |
| 4 | Rewrite the baseline, highest risk first. Order: `api.md`, `security.md`, `domain.md`, `architecture.md`, `application.md`, `persistence-marten.md`, then frontend, then quality, then workspace, then the profile page, then `engineering-system.md`. One page per pull request: rewrite provisions, apply the prefix reassignment, keep suffixes stable, write real evidence, retrim the Agent Summary, update every inbound cross-reference. | 3 | Gates after every page. The unit closes when the Unit-3 warning count reaches zero. | Per-page review against the four quality tests. Extension replacement clauses re-checked after each renumber. |
| 5 | Consolidate authority. Move the workspace directory and update the manifest, index, and profile composition. Make the glossary the sole definition site and reduce the Concepts section. Trim the `AGENTS.md` bullets and replace the command blocks. Strip the extensions-README procedure. Split `AGENTIC.CONVENTION.002`. | 4 | Gates. The link and anchor check must stay at zero broken. | Confirm the glossary lost no meaning in consolidation. |
| 6 | Promote the rules and close. Turn the Unit-3 warnings into errors. Rewrite `getting-started.md` with staged, linked steps. Update `CONTRIBUTING.md`, the PR template, and `tools/README.md`. Write the v1.12.0 changelog entry and tag. | 5 | Full gate set with all rules at error severity. | Walk the six journeys in section 12 end to end before tagging. |

### Burn-down baseline

Measured by `node tools/validate-standards.mjs --warnings` after Unit 3 landed. Unit 4 closes when every count reaches zero.

| Diagnostic | Baseline | Finding |
|:---|---:|:---|
| `PROVISION_RESTATES_HEADING` | 289 | AUD-001 |
| `VERIFY_TEMPLATED_EVIDENCE` | 289 | AUD-003 |
| `VERIFY_NO_ARTIFACT` | 234 | AUD-003 |
| `SUMMARY_RESTATES_REQUIREMENT` | 179 | AUD-005 |
| `ID_PREFIX_OWNERSHIP` | 5 | AUD-012 |
| `INDEX_CONTAINS_PROCEDURE` | 1 | AUD-013 |
| `HEADING_EMPTY_BODY` | 0 | AUD-018, closed in Unit 1 |
| **Total** | **997** | |

Two numbers differ from the estimates in section 5, both because the rule is stricter than the pattern match used during the audit. `VERIFY_TEMPLATED_EVIDENCE` reports 289 rather than 259, because it catches any evidence string containing its own provision heading rather than only the three exact sentence templates. That count now matches `PROVISION_RESTATES_HEADING` exactly, which confirms the two defects have identical scope. `SUMMARY_RESTATES_REQUIREMENT` reports 179 rather than 180, because it requires exact equality rather than containment.

`ID_PREFIX_OWNERSHIP` surfaced one case the audit missed: `docs/extensions/concurrency-idempotency.md` carries both `EXT.CONCURRENCY.*` and `EXT.IDEMPOTENCY.*`. Section 4 lists four prefix defects; this is a fifth. It needs an owner decision, because the page covers two related concepts by design.

Unit 3 before Unit 4 is the load-bearing ordering choice. Landing detection first turns a 289-provision rewrite from a judgement exercise into a measurable burn-down, and it means the last page repaired is verified by the same rule as the first.

On release numbering: `CONTRIBUTING.md` defines a minor release as "one coherent standards evolution" and explicitly disclaims Semantic Versioning. Restoring normative force to the existing baseline is exactly that, so v1.12.0 fits. A consumer pinned to v1.11.0 is unaffected until it chooses to adopt.

---

## 10. Decision register

This repository does not do backward compatibility, migration, or mitigation. A consumer pins a release and stays on it until it chooses to adopt another complete contract. `WRITING.SNAPSHOT.003`, `WRITING.SNAPSHOT.004`, and `WRITING.SNAPSHOT.005` in `docs/foundations/authoring-standard.md` now state this normatively, and the `Release model` concept on the same page explains it.

Applying that principle strikes out any argument that weighs cost to a consumer who has already adopted an earlier release. Three of the six trade-offs originally recorded here rested on exactly that, so they are resolved rather than open. One of the three is replaced by two new decisions that the principle brings into view.

### Closed by the principle

| Former decision | Resolution | Why it is no longer open |
|:---|:---|:---|
| D1. Rewrite scope | Rewrite all 289 provisions across all 21 pages. | The counter-arguments were effort and partial improvement, and neither survives. `PROVISION_RESTATES_HEADING` cannot be enforced while any page violates it, and there is no compatible-partial path worth preserving. |
| D4. Workspace rename | Rename `docs/conventions/repository/` to `docs/conventions/workspace/`. | The only argument against was breaking four documented paths for consumers who already pinned v1.11.0. Those consumers keep v1.11.0. Path churn is absorbed at adoption, which is where this model puts every cost. |
| D2. Renumbering depth | Keep each provision ID stable. Number `<SCOPE>.<TOPIC>.<NNN>` from `001` within each scope and topic, and normalize the prefixes per section 4. Do not add a suffix only to signal that a provision changed. | The original recommendation preserved correlation with 13 releases of changelog history. That is cross-release traceability, which this model does not support. Nothing in the tooling reads a previous release: `validate-standards.mjs:902` resolves `overrides[].ruleId` against the active ID set alone. |

### Open decisions

| # | Decision | Options | Trade-off | Recommended |
|:---|:---|:---|:---|:---|
| D9 | Release target. Does v1.11.0 ship before the repair? | (a) Hold the tag, complete the repair on this branch, publish v1.11.0 once. (b) Tag v1.11.0 now and repair in v1.12.0. | The defect is unreleased. (b) publishes a snapshot whose whole baseline is formally informative, and `WRITING.SNAPSHOT.005` then lets a consumer pin it permanently with no mechanism to signal the problem or move anyone off. The no-compatibility model has no deadline pressure, so holding costs nothing. | **(a)**. Never publish the hollow snapshot. This also removes the v1.12.0 framing from Unit 6 and makes D7 moot for this cycle. |
| D10 | This report's own lifecycle. `AUDIT.md` is untracked, and `validate-standards.mjs:130` now excludes it. | (a) Working document: keep it during implementation, delete it and revert the exclusion at close. (b) Permanent tracked artifact with a permanent exclusion. (c) Move it outside the repository. | (b) leaves a v1.11.0-specific review in the tree indefinitely, which is the kind of release-history residue `WRITING.SNAPSHOT.002` keeps out of active material. The changelog already carries the durable record. | **(a)**. Delete at close and revert the one-line exclusion. |
| D7 | Provision identity. `authoring-standard.md:137` states "A changed, split, merged, or newly normative provision receives a new ID", and `CONTRIBUTING.md:28` repeats it. Keep or narrow? | (a) Narrow to within-snapshot uniqueness and delete both sentences. (b) Keep as written and accept a `.002` suffix on all 289 repaired provisions. (c) Keep the rule but exempt authoring-defect repairs. | The rule's only reader is someone comparing two releases, which is the one activity this model does not support. Kept as written it inflates every repaired ID by one with no meaning inside the snapshot. (c) needs a judgement per provision and leaves the rule ambiguous. This is a design tension, not a rule contradiction: a `.002` suffix is a valid current ID, it just encodes nothing a reader of this snapshot can use. | **(a)**. An ID names a rule inside one pinned contract. It is not a change log. |
| D8 | Override review at adoption. Stable IDs mean a consumer override can silently re-point at a strengthened rule. How is that caught? | (a) Add a reviewed standards version to `standards.project.json` and fail in `validate-consumer.mjs` when it does not match the pinned manifest version. (b) Rely on ID churn to fire `OVERRIDE_UNKNOWN_ID`. (c) Accept the risk. | This is the one property D2 gives up, and it is a fail-loud argument rather than a compatibility argument, so it stands. (b) only covers overrides whose ID happened to change. (a) forces a review of every override at every adoption, which is what "adopt its complete contract" should mean. Neither the field nor the check exists today. | **(a)**. One explicit adoption gate beats the same signal encoded across 289 suffixes. |
| D3 | Rationale after repair. How much explanation stays on the page? | (a) One or two sentences, matching the extensions' 10.9-word average. (b) Keep the current depth alongside full Requirements. (c) Move long explanations into Concepts. | Unaffected by the principle. (b) risks a reader still treating Rationale as the rule. (c) preserves genuinely useful material such as the endpoint discovery contract and the Problem Details schema. | **(a) with (c) for worked examples**. Keep detailed examples as `Example:` blocks or Reference examples, which are already governed. |
| D5 | `AGENTIC.CONVENTION.002`. Convention or Standard? | (a) Split: enforced parts become a Standard, the flat or nested choice stays a convention. (b) Promote entirely. (c) Keep as a convention and relax the validator. | Unaffected by the principle. This concerns a current consumer's freedom, not a past one's. (c) removes a check that catches real misplacement. (b) removes a genuine freedom. | **(a)**. Matches what the tooling already enforces and what it does not. |
| D6 | Changelog prose checks. Bring `CHANGELOG.md` partly under validation? | (a) Stay fully excluded. (b) Run ASCII, sentence-length, and vague-term scanners only. (c) Full validation. | Unaffected by the principle. (c) would break snapshot discipline, one of the repository's best properties. (b) catches AUD-019-class defects without touching provision, link, or snapshot rules. | **(b)**, with the exclusion documented in the `WRITING.SNAPSHOT.001` evidence row. |

### Settled by evidence, not owner decisions

- **Whether the baseline is normative today.** It is not, under the repository's own stated authority rule. Measured, not argued.
- **Whether to keep Semantic Versioning out.** `CONTRIBUTING.md` already settles this, and the pinned-release model requires it.
- **Whether this is v1.12.0 or v2.0.0.** Minor. The `Release model` concept in `docs/foundations/authoring-standard.md` reserves major for a replaced scope, method, or platform profile. Restoring normative force to the existing baseline replaces none of the three.
- **Whether to restructure the tree.** No. All links resolve, the index is complete, no orphans or cycles exist.
- **Whether extensions need work.** No. They already meet the target.

---

## 11. Validation proposal

### New and changed rules in `validate-standards.mjs`

| Diagnostic | Asserts | Failing fixture | Passing fixture | Finding |
|:---|:---|:---|:---|:---|
| `PROVISION_RESTATES_HEADING` | A `Requirement:` or `Default:` line, with actor and modal removed, is not equal to its heading and adds at least one content word absent from it. | "Use one endpoint per operation (X.Y.001)" plus "Web APIs MUST use one endpoint per operation." | Same heading plus a Requirement naming the interface, dispatch, and mapping. | 001 |
| `VERIFY_TEMPLATED_EVIDENCE` | An evidence cell does not contain its own provision's heading text, and for `static` or `test` methods names at least one backticked command, path, or identifier. Replaces the blocklist at line 13. | "Pull request review asserts `use one endpoint per operation` in the owning specification and source paths." | "`EndpointMappingTests.NoDuplicateRoutes` fails on a duplicate method and route pair." | 003 |
| `ID_PREFIX_OWNERSHIP` | One Standards prefix per page, no prefix on two pages, convention IDs matching their page's Standards prefix. | A page with `PERSIST.*` Standards and `PERSIST.CONVENTION.001`. | The same page with `PERSIST.CONVENTION.001`. | 012 |
| `SUMMARY_RESTATES_REQUIREMENT` | A summary bullet is materially shorter than its cited provision and introduces no content word absent from it. Subsumes `PROJECTION_UNSOURCED_TERM` and extends `checkAgentProjection` to `AGENTS.md`. | A bullet reading "abstract state and sealed state records" against a provision saying only "state records". | A bullet that is a strict subset. | 004 005 |
| `TERM_DUAL_DEFINITION` | A term with a glossary heading is not independently defined elsewhere in a "`Term` means" or "`Term` is" construction. | "`Aggregate` means" on a foundation page while the glossary defines Aggregate. | The same sentence replaced by a glossary link. | 010 |
| `HEADING_EMPTY_BODY` | Every heading has body content or a lower-level sub-heading before the next same-or-higher heading, unless it is a required empty section reading `None.` | A level-3 "Vocabulary" followed immediately by a level-3 "Product". | The same heading with a lead paragraph, or promoted to level 2. | 018 |
| `INDEX_CONTAINS_PROCEDURE` | A page of class `index` has no numbered procedure and no imperative prohibition. | The current `docs/extensions/README.md` Activation process. | The same page reduced to Intent, Selection, Example. | 013 |

### New suite: `tools/validate-consumer.cases.mjs`

- Builds a temporary fixture consumer from the tracked templates with placeholders resolved, following `validate-ui.cases.mjs:91`. This validates all 15 Markdown metadata blocks as shipped, closing AUD-017 as a side effect.
- One passing and one failing case per `KINDS` rule: missing required field, unknown property, ID pattern violation, bad `specStatus`, bad `implementationStatus`, bad date, bad `operationType`, bad risk, unresolvable `useCases` reference, unresolvable `participatingModules`, unresolvable `appliesToModules`, duplicate acceptance ID.
- Boundary cases: flat single-aggregate module resolves, nested aggregate subdirectory resolves, two aggregate subdirectories both resolve, a use case in neither location fails.
- Exclusion cases: a `research/` file with no metadata is skipped, a `research/` file with metadata is validated.
- Carrier case: a specification-path Markdown file missing the `---` block reports a diagnostic rather than being skipped (AUD-007).
- False-positive guard: the fixture must pass cleanly before any failing case is injected, and each failing case must produce exactly its own diagnostic code.

### CI gates

| Step | Runs on | Status |
|:---|:---|:---|
| `node tools/validate-standards.cases.mjs` | PR, push to main | Existing |
| `node tools/validate-standards.mjs` | PR, push to main | Existing, gains 7 rules |
| `node tools/validate-ui.cases.mjs` | PR, push to main | Existing |
| `node tools/validate-consumer.cases.mjs` | PR, push to main | New |
| `git diff --check` | PR, push to main | Existing |

Branch coverage is already correct. The workflow triggers on all pull requests and pushes to `main`, and `CONTRIBUTING.md` requires changes to reach `main` through a pull request. Permissions are already `contents: read`, and both actions are commit-pinned.

### Invariants that stay manual

| Invariant | Review | Why not automated |
|:---|:---|:---|
| A Requirement states one testable meaning | PR checklist, existing line | Atomicity needs a reader. `PROVISION_RESTATES_HEADING` catches the empty case only. |
| The four quality tests | `WRITING.QUALITY.001`, PR checklist | Simplicity, brevity, clarity, and humanity are judgement. |
| Rationale explains a real constraint | PR checklist, new line | Requires knowing the constraint. |
| An extension's named replacement is still coherent | Unit-4 per-page review | Semantic. Must be re-checked after each page repair. |
| No history-specific material in active files | `WRITING.SNAPSHOT.002`, PR checklist | Already correctly manual. The current material is clean. |

### Explicit exclusions

- `CHANGELOG.md` and `LICENSE` stay outside provision, link, and snapshot validation. Under D6 they may gain prose scanners only.
- `templates/standards/` keeps its virtual-path treatment. Placeholder IDs must not enter the global ID set.
- Reference validators continue to run no application builds, browser tests, deployments, or network calls, as `tools/README.md` states.

---

## 12. Acceptance criteria

| Area | Condition | Checked by |
|:---|:---|:---|
| Authority | Zero provisions restate their heading. Every obligation is inside a `Requirement:` or `Default:` line. | `PROVISION_RESTATES_HEADING` at 0 |
| Authority | No two active sources state different values for one closed set. | Unit-1 review, `ENUM_PROSE_DRIFT` |
| Authority | Every enforced rule is a Standard, and every replaceable default is genuinely replaceable. | D5 resolution, consumer case suite |
| References | All relative links and anchors resolve. Baseline today: 98 of 98. | `validate-standards.mjs` |
| References | No technical fact is authored twice. Every repeat is a citation. | `TERM_DUAL_DEFINITION`, PR checklist |
| Terminology | The glossary is the sole definition site. Every repository term defined once. | `TERM_DUAL_DEFINITION` at 0 |
| Terminology | "Repository" resolves to one concept in any given sentence. The Git sense uses "workspace" or a qualifier. | Unit-5 review |
| Page contracts | Every page matches its class contract. No heading has an empty body. | `WRITING.PAGE.001`, `HEADING_EMPTY_BODY` |
| Page contracts | No index or guide contains a numbered procedure or an imperative prohibition. | `INDEX_CONTAINS_PROCEDURE` |
| Identifiers | One Standards prefix per page, no prefix shared by two pages, convention IDs matching their page prefix. | `ID_PREFIX_OWNERSHIP` at 0 |
| Identifiers | All IDs unique. Baseline today: 705 of 705. | `validate-standards.mjs` |
| Schemas | Every schema has at least one tracked in-repo consumer exercised by a case suite. | 6 of 6, consumer case suite |
| Schemas | The metadata carrier syntax is stated in a provision and shown in an example. | `WRITING.METADATA.002` text review |
| Validation | All five CI gates pass on every pull request and push to `main`. | `.github/workflows/standards.yml` |
| Validation | Every shipped validator has a case suite with a passing and failing case per rule. | 3 of 3 validators |
| Validation | Zero evidence rows are template fills. Every `static` or `test` row names an artifact. | `VERIFY_TEMPLATED_EVIDENCE` at 0 |
| Human use | First use: a new consumer reaches the governing provision for any onboarding step in one click from `getting-started.md`. | Unit-6 journey walk |
| Human use | Lookup: given any provision ID, its owning page is identifiable from the prefix alone. | `ID_PREFIX_OWNERSHIP` |
| Human use | Exception: a consumer wanting to replace a default finds the convention ID, the declaration mechanism, and a validator that permits it. | D5 resolution, Unit-6 walk |
| Agent use | Tier value: escalating Tier 1 to Tier 2 adds normative content for every one of the 17 load plans. | `SUMMARY_RESTATES_REQUIREMENT` |
| Agent use | Projection safety: no bullet in `AGENTS.md` or any Agent Summary introduces a term absent from its cited provision. | `SUMMARY_RESTATES_REQUIREMENT` at 0 |
| Agent use | Stop conditions: no two applicable provisions disagree without declared precedence. | Unit-1 close, `AGENT.CONFLICT.001` review |

---

## The three decisions that matter most

1. **Land detection before rewriting, not after.** Adding the rules as warnings first converts an unbounded editorial task into a 289-to-zero burn-down, gives every pull request an objective close condition, and guarantees the last page is held to the same bar as the first. Rewriting first and validating later reproduces exactly the process that produced v1.11.0. See Unit 3 and Unit 4.

2. **Decide what a provision ID is for.** Under a pinned-release model with no compatibility promise, an ID names a rule inside one snapshot and nothing more. Keeping the current identity rule inflates all 289 repaired IDs by one suffix that no reader of the snapshot can use, and it is the only mechanism currently forcing a consumer to re-review a stale override. Narrow the rule, and replace that mechanism with an explicit adoption gate. See D7 and D8.

3. **Decide how much explanation a provision may carry.** The 19,065 displaced words are not waste. The endpoint discovery contract, the Problem Details schema, and the rule-classification tables are genuinely valuable. Where they land determines whether the repository stays readable after repair. Requirements carry the obligation. The open question is whether the rest becomes short Rationale, governed `Example:` blocks, or a Concepts section. Answer it before Unit 4, or answer it 21 times inconsistently. See D3.
