# Document Templates

These files are optional starting points for consumer documentation. Copy only the files required by the current stage and replace every `__PLACEHOLDER__` before committing.

- `standards.project.json` selects the profile, recipes, paths, and rule overrides.
- `project-agents.md` is the short consumer agent shim.
- `product-brief.md` defines the v1 product boundary.
- `domain-index.md` maps the bounded context, capabilities, and primary journey.
- `glossary.md` defines shared domain language.
- `feature.md` defines one business capability.
- `use-case.md` defines one operation and its acceptance criteria.
- `page.md` applies only when the page-document trigger in `docs/core/addd.md` applies.
- `decision.md` records a project override or an expensive-to-reverse choice.

The standards do not generate application code. Agents read the selected profile and recipes, inspect local patterns, and implement the smallest complete use case.
