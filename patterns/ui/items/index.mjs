import { CATEGORY_PAGE_FRAMES } from "./01-page-frames.mjs";
import { CATEGORY_LISTS_TABLES } from "./02-lists-and-tables.mjs";
import { CATEGORY_RECORD_DETAIL } from "./03-record-detail.mjs";
import { CATEGORY_FORMS_FIELDS } from "./04-forms-and-fields.mjs";
import { CATEGORY_DIALOGS } from "./05-dialogs-and-overlays.mjs";
import { CATEGORY_CREATE_EDIT_REMOVE } from "./06-create-edit-remove.mjs";
import { CATEGORY_FEEDBACK_STATES } from "./07-feedback-and-states.mjs";
import { CATEGORY_NAVIGATION } from "./08-navigation-and-frame.mjs";
import { CATEGORY_MONEY_TIME_DENSITY } from "./09-money-time-density.mjs";
import { CATEGORY_ADMIN_SCREENS } from "./10-admin-screens.mjs";

/**
 * The library's groups, in the order a reader meets them: the page, the record,
 * the command, then the concerns that apply at every step.
 */
export const CATEGORIES = [
  {
    id: "page-frames",
    title: "Page frames",
    short: "The page shapes",
    kind: "page-frame",
    intro:
      "A page is derived from the job it does. These are the page shapes a business application composes, and the ways each one can arrange its content.",
    ...CATEGORY_PAGE_FRAMES,
  },
  {
    id: "lists-and-tables",
    title: "Lists and tables",
    short: "Finding one record among many",
    kind: "element",
    intro:
      "The list is where a back-office user spends most of the day: columns, filters, selection, paging, and what the page says when nothing matches.",
    ...CATEGORY_LISTS_TABLES,
  },
  {
    id: "record-detail",
    title: "Record detail",
    short: "One record and what was done to it",
    kind: "element",
    intro:
      "A record with a lifecycle gets a page of its own: its header, its facets, and the history beside it.",
    ...CATEGORY_RECORD_DETAIL,
  },
  {
    id: "forms-and-fields",
    title: "Forms and fields",
    short: "Taking one command's input",
    kind: "element",
    intro:
      "Every field is a decision about a kind of value, with the states it must draw and the validation that belongs to it.",
    ...CATEGORY_FORMS_FIELDS,
  },
  {
    id: "dialogs-and-overlays",
    title: "Dialogs and overlays",
    short: "A task that must not lose the page",
    kind: "element",
    intro:
      "A dialog, a drawer and a toast answer one question: where does this task happen.",
    ...CATEGORY_DIALOGS,
  },
  {
    id: "create-edit-remove",
    title: "Create, edit and remove",
    short: "The commands that change things",
    kind: "scenario",
    intro:
      "Creation, change and removal each carry their own risk, and each has its own ways to be entered and confirmed.",
    ...CATEGORY_CREATE_EDIT_REMOVE,
  },
  {
    id: "feedback-and-states",
    title: "Feedback and states",
    short: "What the page says about itself",
    kind: "scenario",
    intro:
      "A page is read in the states it is not in: loading, empty, refused, stale, forbidden, partial.",
    ...CATEGORY_FEEDBACK_STATES,
  },
  {
    id: "navigation",
    title: "Navigation and frame",
    short: "Getting to the page and back",
    kind: "element",
    intro:
      "The sidebar, the trail and the header decide whether a reader knows where they are and where they can go.",
    ...CATEGORY_NAVIGATION,
  },
  {
    id: "money-time-density",
    title: "Money, time and density",
    short: "Values, dates and the amount on screen",
    kind: "element",
    intro:
      "How an amount is written, how a moment is written, and how much fits before the page changes shape.",
    ...CATEGORY_MONEY_TIME_DENSITY,
  },
  {
    id: "admin-screens",
    title: "Administration screens",
    short: "The back-office screens every product has",
    kind: "page-frame",
    intro:
      "Team and roles, API keys and webhooks, data imports, the connected payment account, billing, and discount codes: screens most business applications need in some form.",
    ...CATEGORY_ADMIN_SCREENS,
  },
];
