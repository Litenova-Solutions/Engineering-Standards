---
{
  "kind": "design-contract",
  "schemaVersion": 1,
  "frontend": "__FRONTEND__",
  "profile": "application-balanced",
  "shell": "application-shell/default",
  "patterns": ["page-header", "record-list"]
}
---

# __FRONTEND__ design contract

Read this before composing anything on this frontend. The vocabulary below is the whole of it. A screen that needs a pattern outside it needs a decision first.

## Brand

State who the reader is and what they came to do. Name the one thing this surface is accountable for.

Three words it is: __WORD__, __WORD__, __WORD__.

Three words it is not: __WORD__, __WORD__, __WORD__.

## Tokens

Values live in the global CSS entry. Change them there. A colour written into a component is a colour nobody can theme and nobody can find.

| Token | Utility | What it is for |
|:---|:---|:---|
| Surface | `bg-background` | The page. |
| Elevated | `bg-card` with `border` | A card, a panel, a popover. |
| Quiet | `text-muted-foreground` | A label, a hint, a count. |
| Primary | `bg-primary` | The one action that is the point of the screen. |

## Vocabulary

The primitives this frontend composes from, listed in its `ui-vocabulary.json`. Name the ones a page reaches for directly, one sentence each.

- `button` is the only clickable element. A `div` with an `onClick` is refused.
- `badge` is a state in one word.
- `card` is a grouped fact set, never a screen.

## Patterns

The recipes in the composition catalog this frontend reaches for. A page reaches for one rather than inventing a layout. The sidecar beside each page specification names which, and in which order.

## Do

- Lead with the action the reader can take now.
- Put the deadline beside the work, never in a tooltip.
- Say what a disabled control is waiting for.

## Do not

- Do not decorate. A border earns its place, a colour earns its place, and nothing else does.
- Do not nest a card inside a card.
- Do not ship a button whose success is a paragraph. Success is a `role=status` announcement, and failure is `role=alert`.

## Motion

| Name | Duration | Where |
|:---|:---|:---|
| instant | 0ms | Any state change a button causes. |
| quick | 120ms | Row hover, badge change, focus ring. |
| slow | 240ms | Drawer open, mobile navigation. |

A number is never animated. The number is the answer.

## Voice

Name the reader and write to them. State the words this product uses and the words it refuses.

| Say | Not |
|:---|:---|
| __PHRASE__ | __PHRASE__ |
