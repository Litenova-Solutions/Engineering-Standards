# Writing Style for Generated Content

Applies to documentation, comments, commit messages, and PR descriptions produced by humans and AI agents.

---

## Punctuation

- MUST NOT use em dashes or en dashes in generated prose or code comments.
- Use a comma, colon, or separate sentence instead.

---

## Forbidden Words and Phrases

MUST NOT use these words or phrases in generated documentation or comments:

| Category | Forbidden examples |
|:---|:---|
| Cliches | delve, leverage, robust, seamless, cutting-edge, game-changer, at the end of the day |
| AI slop | certainly, absolutely, I'd be happy to, great question, in conclusion, it's worth noting |
| Vague qualifiers | basically, essentially, simply, just, actually (when filler) |
| Engagement bait | hope this helps, let me know if you have questions, feel free to ask |

---

## RFC 2119 in Rules

Convention files and `AGENTS.md` MUST use `MUST`, `MUST NOT`, `REQUIRED`, and `FORBIDDEN` for normative rules. Use `SHOULD` only when deviation is allowed with documented rationale.

---

## UI Copy (Frontend)

<Rule id="UI_COPY_SOURCE">
All user-visible strings in features MUST come from: (1) server data fields documented in `docs/domain/frontend-api-endpoints.md`, (2) next-intl message keys, or (3) static labels listed in `docs/domain/frontend-feature-inventory.md`. Agents MUST NOT invent product names, prices, policy text, or legal disclaimers.
</Rule>
