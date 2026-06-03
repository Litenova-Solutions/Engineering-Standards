# Agentic Development

This document explains how and why the engineering standards are designed around agentic AI development as the primary development model. It is a human-facing document. AI agents MUST NOT load it for routine coding tasks; it is loaded only when an agent is specifically tasked with modifying or understanding the standards themselves.

---

## 1. The Primary Development Model

Agentic AI development is the assumed primary development model for projects following these standards. This is not a future consideration; it is the current reality. Every architectural and documentation decision is made with the assumption that AI agents (GitHub Copilot, Claude Code, Cursor, Gemini CLI, and similar tools) are primary contributors alongside human engineers.

This assumption is recorded formally in `docs/decisions/agentic-development-as-primary-model.md`. It affects every other decision in the standards: the five-project application layer split, the Contracts projects, the architecture tests, the size limit on `AGENTS.md`, and the requirement that every rule have a code example. None of these are arbitrary. Each is a direct response to an observed agent failure mode.

---

## 2. How Agents Differ From Human Developers

Understanding agent failure modes requires understanding how agents differ from experienced human engineers.

**Agents are stateless.** Each session starts with zero knowledge of the project unless context is explicitly provided. A human engineer builds up a mental model of a codebase over months. An agent builds its model from what it loaded into the current context window. If the context does not include the relevant convention, the agent will pattern-match against training data, which may include outdated or lower-quality examples from the public internet.

**Agents pattern-match against examples.** A bad example in the codebase will be reproduced more reliably than a good example in a comment. If the codebase has one handler that injects a repository instead of `IDatabaseContext`, agents will reproduce that pattern. If the convention file says "do not inject repositories in query handlers" but includes no `// BAD:` example showing exactly what not to do, the prohibition is weaker than it appears.

**Agents have context window limits.** Loading a 5,000-line convention file into every task wastes context budget and dilutes the signal. Scoped, short files loaded only when relevant are more effective than loading every convention on every task. `AGENTS.md` is kept as focused as possible; every line must earn its place by preventing a known agent failure mode.

**Agents follow explicit rules more reliably than cultural norms.** "The team prefers X" is weak. "MUST use X, MUST NOT use Y" is stronger. A compiler error that prevents the bad pattern is stronger still. The standards are designed with this hierarchy in mind: compiler constraints first, architecture tests second, explicit written rules third, cultural norms never.

**Agents do not get tired or bored, but they do drift.** Without structural constraints, an agent that has seen a bad pattern in context will sometimes reproduce it. Architecture tests catch drift that compiler constraints cannot. Convention files with explicit anti-patterns catch drift that architecture tests cannot. The defense is layered.

---

## 3. How the Standards Address Agent Failure Modes

Each failure mode has a corresponding mitigation built into the standards.

**Stale context:** Convention files are scoped by layer via `agentLoadPlans` in `standards.manifest.json`. An agent editing domain code loads `backend.domain` Tier 1 Quick Rules first, not full convention files or the entire repository.

**Pattern drift:** Architecture tests in `{ProjectName}.Architecture.Tests` enforce structural rules that survive context window limitations. A test that fails when a query handler injects a repository interface catches the violation regardless of what the agent had in context during generation. These tests are described in `docs/conventions/backend/testing.md`.

**Hallucinated conventions:** All conventions are written down explicitly with `// GOOD:` and `// BAD:` code examples. An agent cannot invent a convention that contradicts a written rule that shows both what to do and what not to do. The examples are not decoration; they are the primary mechanism for preventing hallucinated patterns.

**Bad example reproduction:** The `// BAD:` examples in convention files show agents what not to do. This is more reliable than only showing the correct pattern. An agent that has seen a bad pattern labeled as bad is less likely to reproduce it than an agent that has only seen the good pattern and encounters the bad pattern in the codebase itself.

**Context bloat:** `AGENTS.md` is kept as focused as possible. It is an index and a behavioral contract. Detailed rules live in the convention files, which are loaded only when relevant. Every line in `AGENTS.md` costs context budget on every task; the file must earn its place.

---

## 4. How the Project Structure Supports Agents

Each structural decision in the project layout has a direct benefit for agent navigation and correctness.

**Screaming architecture:** Agents follow folder names across docs, backend, and frontend. `docs/domain/posts/publish-post.md`, `Posts/Publish/`, and `features/posts/publish/` describe the same use case. A flat `Services/` folder forces the agent to read many files before understanding where a new handler belongs.

**Contracts projects:** The compiler prevents an agent from putting a handler in a Contracts project. No written rule is sufficient; the build fails. This is the most reliable form of enforcement.

**Separate Write, Read, and Reactions projects:** The compiler prevents an agent from injecting a repository interface into a query handler if the query handler project has no project reference to the repository interface. The `Application.Read` project references `Application.Read.Contracts` and `Domain`. It does not reference `Application.Write.Contracts`, so an agent cannot accidentally dispatch a command from a query handler. The structural constraint is stronger than any written rule.

**One file per concern:** Agents load individual files into context. A 300-line file with one class is more context-efficient than a 1,500-line file with five classes. The one-class-per-file rule is not just a C# best practice; it is an optimization for agent context efficiency.

---

## 5. How to Write Effective Agent Context Files

Practical guidance for maintaining `AGENTS.md` and the convention files.

**Write rules in RFC 2119 language.** MUST, MUST NOT, SHOULD. Prose rules are interpreted; keyword rules are followed.

**Every rule needs a code example.** Prose rules are ambiguous. Code examples are copied. A rule without a `// GOOD:` example is less effective than a rule with one. A rule without a `// BAD:` example is less effective still.

**Include explicit anti-patterns.** Agents learn from `// BAD:` examples as reliably as from `// GOOD:` examples. Show both.

**Keep `AGENTS.md` as focused as possible.** It loads on every task. Every line costs context budget. Detailed rules belong in the layer-specific convention files.

**Update convention files in the same PR as the code change they describe.** A convention file that describes a pattern that no longer exists in the codebase is worse than no convention file: it teaches agents to reproduce a deleted pattern.

**Never auto-generate `AGENTS.md` or convention files.** Generated context files produce worse agent behavior than hand-written ones. A generated file optimizes for completeness; a hand-written file optimizes for signal-to-noise ratio.

**Number sections with stable identifiers.** Use section markers like "§5.2" so PR reviews can reference specific rules. "This violates §3.1 of the application layer guide" is more useful than "this violates something in the application layer guide."

---

## 6. Context Tiers (Progressive Loading)

Agent failures are primarily context failures, not model failures. The standards use a four-tier loading model implemented in `standards.manifest.json` → `agentLoadPlans` and convention file **Agent Quick Rules** sections.

| Tier | Source | Load when |
|:---|:---|:---|
| **0** | `AGENTS.md` | Every task (routing layer, non-negotiables, project map) |
| **1** | `#agent-quick-rules` sections from `agentLoadPlans.tier1` | Task start (highest-signal constraints, max 15 rules each) |
| **2** | Full convention files from `agentLoadPlans.tier2` | A Quick Rule needs elaboration |
| **3** | Blueprints from `agentLoadPlans.blueprints` | Generating a complete new file only |

Tier 1 paths use `#agent-quick-rules` anchors matching convention headings. Tier 2 loads the full file. Tier 3 loads blueprints under `docs/blueprints/`; agents MUST copy from blueprints when scaffolding, not assemble from convention examples.

Consumer projects add **just-in-time routing**: YAML frontmatter on domain docs, `docs/domain/agent-index.json`, and Feature Context Map tables in the project `AGENTS.md` shim. See `docs/guides/agentic-domain-driven-design.md` §11.

If a Quick Rule is unclear, load the full convention file referenced at the bottom of the Quick Rules block before guessing.

---

## 7. The Convention Update Contract

Convention files are treated as code. They are reviewed in pull requests. They are versioned via git tags. They are referenced by section number in code reviews.

A PR that changes a pattern in the codebase without updating the relevant convention file MUST be rejected. The convention file and the code it describes must stay synchronized. When they diverge, the convention file becomes misleading: it describes a pattern that does not exist, and agents trained on it will produce code that does not match the actual codebase.

From **v2.0.0** onward, the CHANGELOG entry for a convention change MUST be included in the same PR as the change. Before v2, document notable changes in the PR description.

---

## 8. Scoped Loading Strategy

Use `agentLoadPlans` in `standards.manifest.json` instead of ad hoc file lists. Each plan defines `tier1` (Quick Rules), `tier2` (full conventions), and `blueprints` (file generation).

| Task type | Load plan key |
|:---|:---|
| Domain aggregate or value object | `backend.domain` |
| API endpoint | `backend.api` |
| Infrastructure, outbox, jobs | `backend.infrastructure` |
| Backend tests | `backend.testing` |
| Frontend app work | `frontend.app` |
| Security review | `security.review` |

For full-stack use case delivery, also load project `docs/domain/agent-index.json`, the Feature Spec, Use Case Doc, test spec, and `docs/conventions/shared/agentic-guardrails.md`. Completing work: `docs/guides/definition-of-done.md`.

Modifying these standards: `.cursor/rules/00-standards-meta.mdc`, `docs/conventions/shared/adr-template.md`.
