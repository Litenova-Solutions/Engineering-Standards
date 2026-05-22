# Writing Style for Generated Content

Applies to all documentation, code comments, commit messages, PR descriptions, and agent context files produced by humans or AI agents.

---

## Tone and Voice

- Active voice. Short sentences.
- Formal and neutral. No colloquialisms, idioms, or analogies.
- Do not anthropomorphize code. Code does not "know", "think", "decide", or "want".
- State uncertainty directly. Do not stack qualifiers.

---

## Punctuation

- MUST NOT use em dashes (—) or en dashes (–). Use a comma, colon, semicolon, or new sentence.
- MUST NOT use the ellipsis character (…). Use three plain periods (...) only where grammatically justified.
- MUST NOT use decorative symbols or emoji (✅ ❌ 🚀 💡 → ✓) unless the user explicitly requests them.
- MUST NOT use scare quotes for emphasis.

---

## Forbidden Words

MUST NOT use these words in any generated prose:

comprehensive, robust, seamless, streamlined, powerful, modern, production-grade,
cutting-edge, innovative, best-in-class, state-of-the-art, game-changer, leverage,
utilize, facilitate, ensure, delve, boilerplate, straightforward, intuitive,
holistic, multifaceted, pivotal, navigate, realm, landscape, tapestry

Replacements: "enhance" → "improve"; "utilize" → "use"; "embark" → "start"

---

## Forbidden Phrases

- "This PR...", "In this commit...", "This change..."
- "As we can see...", "It's worth noting...", "It's important to note..."
- "In order to..." (use "to")
- "This is because...", "At its core...", "Under the hood..."
- "Great!", "Absolutely!", "Certainly!", "Of course!", "Happy to help!"
- "I think", "It seems", "It appears", "possibly", "potentially" when the answer is known
- "hope this helps", "let me know if you have questions", "feel free to ask"

---

## Structure

- No bullet points for content that reads naturally as one sentence.
- No section headers for content that does not need navigation.
- No "Summary" or "Conclusion" sections unless the document is long enough to require them.
- Do not open with a meta-sentence describing what you are about to write. Start with the content.

---

## RFC 2119 in Convention Files

Convention files and `AGENTS.md` MUST use `MUST`, `MUST NOT`, `REQUIRED`, and `FORBIDDEN` for normative rules. Use `SHOULD` only when deviation is allowed with documented rationale.

---

## Commit Messages and PR Descriptions

- Describe what changed and why, not what the code does line by line.
- The diff shows what changed. The description explains the reasoning, constraint, or trade-off the diff does not show.
- Do not pad with context the reviewer can read in the files.
- Subject line: imperative mood, 72 characters or fewer, no period.

---

## Documentation

- Write for a new team member who has the codebase open in another window.
- Explain decisions and constraints, not just mechanics.
- Name things correctly and let the names carry the meaning. Do not explain what a well-named function does; explain why it exists or when to use it.

---

## UI Copy (Frontend)

All user-visible strings in domain UI code MUST come from: (1) server data fields documented in the use case doc, (2) next-intl message keys, or (3) static labels written in the use case doc UI section. Agents MUST NOT invent product names, prices, policy text, or legal disclaimers.

