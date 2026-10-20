# Dialog and Overlay Patterns

## Intent

An overlay sits above the page: a dialog, a drawer, a popover, a menu, a toast or a bar that stays in view. These patterns answer when each one fits and how it opens, holds focus and closes. Each pattern offers drawn options and names a default.

## Standards

### Name the command on a confirm action

**Requirement:** A confirmation dialog MUST label its confirm action with the command it runs.

**Rationale:** A reader who scans only the buttons still learns what happens. A button labeled OK or Yes asks the reader to reread the question before acting.

### Return focus when an overlay closes

**Requirement:** An overlay MUST return focus to the control that opened it when it closes.

**Rationale:** A keyboard reader continues from the place they left. Focus that falls back to the top of the page loses the reader's place in a long list.

## Patterns

### Confirming a command that cannot be taken back

**Question:** When does a command deserve a confirmation step. A launch cancellation cannot be taken back. A confirmation used on routine commands becomes a reflex click that protects nothing.

**Default:** `name-the-object-state-the-consequence-offer-the-alternative`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the dialog that names the object, states the consequence in figures, and offers the alternative in the same surface. The runner-up is the dialog with the consequence as numbers. It is the better choice wherever money moves, because the figure is read at the click.

Prefer the typed name only for the single most dangerous object in a deployment. Never ship the undo toast for an irreversible cancellation. An undo there is a second command rather than a reversal.

#### `name-the-object-state-the-consequence-offer-the-alternative`: Name the object, state the consequence, offer the alternative

```wireframe
page
  breadcrumb "Home" "Products" "Spring lighting launch"
  header
    heading "Spring lighting launch"
    text "Sat 14 Mar 2026 at the Amsterdam warehouse. 1,204 pre-orders."
    action "Move the launch"
  dialog "Cancel the spring lighting launch?"
    text "1,204 customers pre-ordered and will be told the launch is off."
    fact "Refunds" "EUR 54,180.00 on the payment each customer used"
    text "Two people on the warehouse plan will be told to stand down."
    message "This cannot be undone. A canceled launch cannot be scheduled again." critical
    link "Move the launch instead of canceling it"
    action "Keep the launch"
    action destructive "Cancel the launch"
```

**Rationale:** The MOJ pattern: title asks, body states what it is and what happens, and the safe way out is in the same dialog. The commit button repeats the verb, as Carbon asks.

**Cost:** Three pieces of copy per destructive command, in two languages, all of which have to stay true as the domain changes. The words are a second copy of the domain rules.

**Reference:** MOJ

#### `type-the-launch-name-to-confirm`: Type the launch name to confirm

```wireframe
page
  breadcrumb "Home" "Products" "Spring lighting launch"
  header
    heading "Spring lighting launch"
    text "Sat 14 Mar 2026 at the Amsterdam warehouse. 1,204 pre-orders."
  dialog "Cancel this launch for good?"
    text "1,204 customers will be refunded EUR 54,180.00 and told the launch is off."
    message "This cannot be undone." critical
    field "Type the launch name to confirm" text = "Spring lighting launch"
    action "Keep the launch"
    action disabled "Cancel the launch"
```

**Rationale:** Typing guards the single most dangerous object in a deployment. The expected string sits selectable on screen. The commit button stays disabled until the typed name matches it.

**Cost:** A product that asks people to type names all day trains them to copy and paste without reading. That is the reflex the pattern exists to break. One object per deployment is the ceiling, not one per record type.

**Reference:** Cloudscape

#### `no-dialog-at-all-act-then-offer-an-undo`: No dialog at all: act, then offer an undo

```wireframe
page
  breadcrumb "Home" "Products" "Spring lighting launch"
  header
    heading "Spring lighting launch"
    status "Canceled" neutral
    text "Canceled at 14:22. 1,204 customers have been told."
  region "Refunds"
    fact "Sent" "EUR 54,180.00 on the payment each customer used"
    fact "Messages" "1,204 sent at 14:22"
  toast "Launch canceled at 14:22. Undo stays until dismissed." critical
```

**Rationale:** The command runs and a toast names what happened with an Undo that stays until it is dismissed. Carbon keeps an action-bearing toast on screen for exactly that reason.

**Cost:** On money this trains the reflex the confirmation exists to prevent. An Undo on a refund is a second refund command rather than a reversal of the first.

**Reference:** Carbon

#### `an-interruption-page-not-a-dialog`: An interruption page, not a dialog

```wireframe
page
  breadcrumb "Home" "Products" "Spring lighting launch" "Cancel"
  header
    heading "Cancel the spring lighting launch?"
    text "Sat 14 Mar 2026 at the Amsterdam warehouse."
  region "What happens if you do"
    text "1,204 customers are refunded EUR 54,180.00 on the payment each one used."
    text "Every customer gets a message saying the launch is off."
    text "Two people on the warehouse plan are told to stand down."
    message "This cannot be undone. A canceled launch cannot be scheduled again." critical
    action "Go back and keep it"
    action destructive "Yes, cancel the launch"
```

**Rationale:** For the most serious and irreversible action, leave the page entirely. The new page says what will be lost and offers the way back as a link.

**Cost:** A full page for one command means leaving the record and coming back, and it loses the page context that makes the consequence understandable.

**Reference:** GOV.UK

#### `a-dialog-with-the-consequence-as-numbers`: A dialog with the consequence as numbers

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia of Garcia Interiors. Oak desk lamp, 2 lamps."
    action "Refund"
  region "What was bought"
    fact "Two lamps" "EUR 90.00"
    fact "Shipping" "EUR 5.00"
    fact "Paid by the customer" "EUR 125.00"
  dialog "Refund SO-1042 in full?"
    fact "Lamps and extras" "EUR 125.00"
    fact "Goes back to Maria Garcia" "EUR 125.00"
    message "The two lamps go back to stock and sell again. Gift wrap is not refunded." neutral
    action "Refund part of it"
    action "Cancel"
    action destructive "Refund in full"
```

**Rationale:** Where a command changes money, the dialog shows the money. This is the strongest form of the pattern: the reader reads the figure before committing to it.

**Cost:** The figure has to be read at the moment of the click, which means a read between the button and the command. On a slow connection the dialog waits.

#### `a-dialog-that-says-it-cannot-act-yet`: A dialog that says it cannot act yet

```wireframe
page
  breadcrumb "Home" "Products" "Spring lighting launch"
  header
    heading "Spring lighting launch"
    text "Sat 14 Mar 2026 at the Amsterdam warehouse."
    action "Cancel the launch"
  dialog "This launch cannot be canceled yet"
    text "Two packing lines are still running on the warehouse plan."
    fact "Packing lines running" "2, since 08:00"
    fact "Parcels picked" "184 this morning"
    message "Close the lines first, then cancel the launch." neutral
    action disabled "Cancel the launch"
    action primary "Close the lines first"
```

**Rationale:** The command is forbidden by a dependency. The dialog names the dependency and the command that clears it. The commit button is disabled with the reason on it.

**Cost:** A dialog that cannot be completed is a dead end. Cloudscape handles this by disabling the commit control, which is honest but leaves the reader needing another surface.

**Reference:** Cloudscape

#### `confirm-by-ticking-each-consequence`: Confirm by ticking each consequence

```wireframe
page
  breadcrumb "Home" "Products" "Spring lighting launch"
  header
    heading "Spring lighting launch"
    text "Sat 14 Mar 2026 at the Amsterdam warehouse. 1,204 pre-orders."
  dialog "Cancel the spring lighting launch?"
    text "Tick every line to show each consequence was read."
    field "Every customer is told the launch is off" checkbox
    field "Each customer gets back what they paid" checkbox
    field "The record stays and says what happened" checkbox
    message "This cannot be undone." critical
    action "Keep the launch"
    action destructive disabled "Cancel the launch"
```

**Rationale:** Safer destructive action. The commit button stays disabled until the reader ticks every consequence line. Unlike typing one name, ticking forces the eye across each line, so the refund route and the record-keeping are each acknowledged.

**Cost:** Three checkboxes for one command is the heaviest confirmation in this set. Past one object per deployment it becomes the reflex click the pattern exists to break.

#### `an-alert-dialog-with-the-safe-action-first`: An alert dialog with the safe action first

```wireframe
page
  breadcrumb "Home" "Products" "Spring lighting launch"
  header
    heading "Spring lighting launch"
    text "Sat 14 Mar 2026 at the Amsterdam warehouse. 1,204 pre-orders."
  region "The launch"
    fact "State" "Scheduled"
    fact "Pre-orders" "1,204"
    fact "Refunds if canceled" "EUR 54,180.00"
  dialog "Cancel the spring lighting launch?"
    message "1,204 customers get their money back, with a message saying the launch is off." critical
    action primary "Keep the launch"
    action destructive "Cancel the launch"
```

**Rationale:** One consequence in plain words, a danger icon, and focus on the safe action so Enter keeps the launch. Less copy than the name-the-object option, with the same protection.

**Cost:** One consequence means the other two move to the page or disappear. Where the money figure matters, the dialog with the consequence as numbers still wins because the reader never sees the amount here.

**Reference:** GitHub Primer

### Short task in a dialog

**Question:** When does a short task belong in a dialog. One to four inputs with nothing to consult fits a dialog. More than four inputs, sections, or steps belong on a full page.

**Default:** `two-or-three-inputs-one-dialog`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep one dialog shape for commands with one to four inputs: title, fields, one verb, no navigation. The runner-up is the task on the page. It is the better choice for commands that repeat all day, where leaving the page costs more than the dialog saves.

Prefer the page once a command carries five inputs. Never ship a dialog over a dialog. A helper that supports the nesting does not make it readable.

#### `two-or-three-inputs-one-dialog`: Two or three inputs, one dialog

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "3 lines for Garcia Interiors. Placed 8 Oct 2026, 09:32."
  region "Notes"
    list 1
      item: text "Garcia Interiors confirmed the Friday window" · text muted "Alex Morgan, 2 Oct 2026"
  dialog "Add a note"
    field "Note" textarea
    field "About" select = "The customer"
    action "Cancel"
    action primary "Add the note"
```

**Rationale:** One dialog shape for short commands: title, two fields, Cancel and the commit verb. This is where most short commands belong.

**Cost:** A dialog is a separate surface from the page. A refusal has to be worded in the dialog rather than on the page it came from.

#### `five-inputs-so-it-becomes-a-page`: Five inputs, so it becomes a page

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042" "Warehouse" "Incidents" "New"
  header
    heading "Record an incident"
    text "What happened at the warehouse, in plain words."
  region "What happened"
    field "What happened" textarea
    field "When" text = "14/03/2026 22:41"
    field "Where" select = "Loading bay 1"
    field "Who was involved" select = "A driver, named below"
    field "Who decided" text
    action "Cancel"
    action primary "Record it"
```

**Rationale:** The same command once it carries five inputs. The composition rule sends it to a full page, with a linkable result that can be returned to later.

**Cost:** The reader loses the page they were on. The linkable result that can be returned to later is worth it when the command has that many parts.

#### `four-inputs-with-a-list-to-choose-from`: Four inputs with a list to choose from

```wireframe
page
  breadcrumb "Home" "Products" "Stock count"
  header
    heading "Stock count"
    text "Sat 14 Mar 2026 at the Amsterdam warehouse."
    action "Invite people to the count"
  region "Counters"
    list 1
      item: text "Chris Novak" · text muted "Warehouse lead"
  dialog "Invite people to the count"
    list 3
      item: text "Chris Novak" · text muted "Warehouse lead"
    field "What they will do" textarea = "Count the lighting stock from 21:00."
    field "When they are needed" text = "14/03/2026 21:00"
    text muted "Invitations go by email and run out on 22 Mar."
    action "Cancel"
    action primary "Send 2 invitations"
```

**Rationale:** The large dialog size. Carbon keeps a modal for a short and infrequent task, never for repeated work. Four inputs with a list stays on the right side of that line when the command is rare.

**Cost:** A 560-pixel dialog holding a table is close to a page with worse navigation. The size has to be argued case by case rather than by a rule.

**Reference:** Carbon

#### `a-dialog-whose-second-step-is-another-dialog`: A dialog whose second step is another dialog

```wireframe
page
  breadcrumb "Home" "Settings" "Storefront"
  header
    heading "Storefront"
    text "The logo customers see."
  region "Logo"
    field "Drop a logo here or choose a file" file
    text muted "A square image of at most 2 MB."
  dialog "That file is not an image"
    text "acme-supply-logo.psd is a design file. The storefront takes JPEG, PNG or WebP."
    action "Try another file"
    action "Cancel"
```

**Rationale:** Refusing a file needs its own question, and the second dialog opens over the first. Base UI supports it and suppresses the child backdrop.

**Cost:** Atlassian forbids dialogs that trigger other dialogs, and forbids a modal over a panel. The nesting is inaccessible and confusing. This is the pattern the project forbids.

**Reference:** Base UI

#### `the-task-on-the-page-not-in-a-dialog`: The task on the page, not in a dialog

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders to decide. Ade Okafor paid EUR 45.00."
  toolbar
    field "Search refunds" search
    field "Window" select = "Any window"
  table 4 "Order" "Customer" "Amount" "Command"
    item: field "Refund amount for SO-1035" text = "45.00" · field "Route" select = "Credit for a future order" · action "Cancel" · action primary "Offer credit"
  region "The rest of the queue"
    list 4
      item: text "SO-1037" · text muted "Elin Lindqvist" · status "No route" critical · text "EUR 45.00"
```

**Rationale:** Where the command repeats, the task is completable on the main page rather than in a modal. An inline row becomes an editing row, which is where a repeatable task belongs.

**Cost:** Inline editing works only on a narrow table, and NN/g warns the row must look visibly different or people edit it by accident.

**Reference:** Carbon

#### `a-dialog-whose-command-needs-a-second-thing-done-first`: A dialog whose command needs a second thing done first

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042" "Parcels"
  header
    heading "SO-1042"
    text "Two parcels, neither collected."
  region "Parcels"
    list 1
      item: text "PU-0C893968A2" · text muted "Oak desk lamp, 2 units" · status "Not collected" neutral
  dialog "Void this pickup code"
    message "Voiding replaces the code. Maria Garcia must be sent a new one." caution
    field "Send Maria Garcia the replacement now" checkbox
    field "Keep the reason on the record" checkbox
    action "Cancel"
    action destructive "Void and replace"
```

**Rationale:** The task cannot proceed until a dependency is cleared. The dialog shows the dependency as a step of its own rather than opening a second dialog over itself.

**Cost:** Now the dialog is two surfaces, which Carbon says should be a page. The line between a two-step dialog and a wizard is a matter of degree.

**Reference:** Carbon

#### `stay-open-for-the-next-note`: Stay open for the next note

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "3 lines for Garcia Interiors. Placed 8 Oct 2026, 09:32."
  region "Notes"
    list 2
      item: text "Garcia Interiors confirmed the Friday window" · text muted "Alex Morgan, 2 Oct 2026"
  dialog "Add a note"
    field "Note" textarea
    field "About" select = "The customer"
    field "Add another after this" checkbox
    action "Cancel"
    action primary "Add the note"
```

**Rationale:** Five notes cost five dialogs and zero navigation: a checkbox in the dialog keeps it open for repeat entry. It suits warehouse logging, where notes arrive in bursts.

**Cost:** A dialog that stays open hides the list it appends to, so the reader cannot see the note land. Past three repeats in a row, the task on the page is still the honest surface.

**Reference:** Linear

#### `run-the-task-from-the-command-palette`: Run the task from the command palette

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "3 lines for Garcia Interiors. Placed 8 Oct 2026, 09:32."
  region "Notes"
    list 1
      item: text "Garcia Interiors confirmed the Friday window" · text muted "Alex Morgan, 2 Oct 2026"
  dialog "Add a note to SO-1042"
    field "Note text" text = "note: bay 2 opens at"
    action quiet "Save as a note on SO-1042"
    action quiet "Save and add another"
    action quiet "Open the full notes page"
    text muted "Esc closes without saving."
```

**Rationale:** The way Raycast runs a scoped command: one input, results grouped by record, Enter runs without leaving the page. Staff who know the palette reuse a surface they already have.

**Cost:** Invisible until opened: a reader who never presses the shortcut never learns the task exists. It suits frequent staff and fails new ones, who still need the button on the page.

**Reference:** Raycast

### Drawer beside the list

**Question:** A list action opens a drawer so a reader can see a record without leaving the list. The drawer holds context that supports the task. Below a narrow width it becomes an overlay.

**Default:** `read-only-record-beside-the-list`

**Compact:** At phone width there is no beside. The drawer takes the screen. Back returns to the list at the same scroll position, with its filters intact. The compact option is `the-drawer-at-phone-width-as-a-page-with-a-back`.

**Rationale:** Keep the read-only record beside the list. The list keeps its scroll and its filters while the record reads beside it, and nothing in the drawer is editable. Below 768 px the drawer becomes a full screen with a Back.

Prefer the tabbed drawer when support compares refunds across facts, history, and messages. Never ship the filter drawer. Filters belong in the toolbar, and a drawer over the results hides the list the filters describe.

#### `read-only-record-beside-the-list`: Read-only record beside the list

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders. Select a row to read it here."
  toolbar
    field "Search orders" search
    field "State" select = "Any state"
  table 3 "Order" "Customer" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  drawer right "SO-1042"
    status "Paid" positive
    fact "Customer" "Maria Garcia"
    fact "Placed" "8 Oct 2026, 09:32"
    fact "Paid" "EUR 125.00"
    fact "Lines" "3, none shipped"
    action "Resend the confirmation"
    link "Open the full record"
```

**Rationale:** The recommended shape. The list is untouched and narrowed, the record holds facts, and the way out is back to the full record. Nothing in the drawer is editable, so it cannot become a task.

**Cost:** A 420-pixel drawer against a 1440 screen leaves the list about 900 wide, which is five columns and not eight. Two nested navigations on one screen.

**Reference:** Atlassian

#### `the-drawer-over-the-list-with-a-scrim`: The drawer over the list, with a scrim

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders. Select a row to read it over the list."
  toolbar
    field "Search orders" search
    field "State" select = "Any state"
  table 3 "Order" "Customer" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  drawer right "SO-1042"
    status "Paid" positive
    text "Maria Garcia of Garcia Interiors. Placed 8 Oct 2026, 09:32."
    fact "Method" "Card"
    fact "Paid" "EUR 125.00"
    fact "Lines" "3, none shipped"
    fact "Refunds" "None"
    action "Resend the confirmation"
    action primary "Open the record"
```

**Rationale:** The drawer slides over the table rather than beside it, so it can be wider and holds more without squeezing the table to five columns.

**Cost:** The row the reader is comparing against is hidden. Atlassian puts the panel beside the main area and only over it at 1024 and below, so this breaks the source rule at 1440.

**Reference:** Atlassian

#### `the-drawer-holding-a-small-edit-list-behind`: The drawer holding a small edit, list behind

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders. Select a row to change one thing."
  toolbar
    field "Search orders" search
  table 3 "Order" "Customer" "State"
    item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive
  drawer right "SO-1042"
    heading small "Change one thing"
    text "The customer order is not affected."
    field "Internal state" select = "Calling back"
    field "Note" textarea
    action "Cancel"
    action primary "Save"
```

**Rationale:** A record and a two-field edit together. This is the one case where a drawer beats a dialog: the reader can see the row and the record at the same time.

**Cost:** Two nested sets of controls and one narrow column. Carbon says a modal is not for repeatable work, and this is repeatable work.

**Reference:** Carbon

#### `the-drawer-as-a-filter-list-results-behind`: The drawer as a filter, list results behind

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "12 orders match. 2 filters applied."
  toolbar
    field "Search orders" search
    action "Filters"
  table 3 "Order" "Customer" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  drawer right "Filters"
    text "2 applied. 12 orders match."
    field "Search" text = "lamp"
    field "Product" select = "Oak desk lamp"
    field "State" select = "Paid"
    field "Date" text = "01/10/2026"
    action quiet "Clear both"
    action primary "Show the results"
```

**Rationale:** A drawer that holds the filters rather than a record. The list updates behind it as each control changes, so the reader never leaves the results.

**Cost:** Carbon keeps several filter categories out of a menu. A drawer is not a menu, but it is the same discovery problem. It covers the toolbar the reader would use to search.

**Reference:** Carbon

#### `the-drawer-as-a-preview-opening-over-a-row`: The drawer as a preview, opening over a row

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders. Open a row to read it beside the list."
  toolbar
    field "Search orders" search
  table 3 "Order" "Customer" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  drawer right "Lines of SO-1042"
    fact "Oak desk lamp, 2 units" "EUR 90.00"
    fact "Shipping" "EUR 5.00"
    fact "Gift wrap" "EUR 30.00"
    timeline 3
      item: text "Paid by card" · text muted "8 Oct 2026, 09:34"
    link "Open the full record"
```

**Rationale:** The row's second line opens in a drawer rather than navigating. Cheap for a reader comparing two orders, and it keeps the scroll position and the filters.

**Cost:** PatternFly's own guidance reserves primary-detail for comparing a short list of the same type, and requires a selected state and a close control. On 268 orders the comparison is rarer than the navigation.

**Reference:** PatternFly

#### `the-drawer-at-phone-width-as-a-page-with-a-back`: The drawer at phone width, as a page with a Back

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia of Garcia Interiors. Placed 8 Oct 2026, 09:32."
    action "Back to all orders"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
  region "What was bought"
    fact "Oak desk lamp, 2 lamps" "EUR 90.00"
    fact "Shipping" "EUR 5.00"
    fact "Paid" "EUR 125.00"
  footer sticky
    action primary "Message the customer"
```

**Rationale:** At 390 pixels there is no beside, so the drawer takes the screen and Back returns to the list at the same scroll position. The behavior is honest about having no room.

**Cost:** Keeping the list alive behind a full-screen view is a navigation model rather than a layout. It has to hold filters and scroll in memory, or the return is a different list.

#### `a-tabbed-drawer-the-record-its-history-its-messages`: A tabbed drawer: the record, its history, its messages

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders. Select a row to read it here."
  toolbar
    field "Search orders" search
  table 3 "Order" "Customer" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  drawer right "SO-1042"
    status "Paid" positive
    text "Maria Garcia of Garcia Interiors."
    tabs "Record" "History" "Messages"
      region "History"
        timeline 3
          item: text "Confirmation resent" · text muted "8 Oct 2026, 11:02" · text muted "Jordan Lee"
    action "Resend the confirmation"
    action primary "Open the record"
```

**Rationale:** The way Linear layers its peek view: the row stays selected behind while tabs divide facts from history. Three views in one drawer beat three navigations when support compares refunds.

**Cost:** Tabs inside a drawer are two navigations deep on one screen. Readers lose track of which tab held the fact they half-read, and the Back control has two jobs.

**Reference:** Linear

#### `a-drawer-with-a-drag-edge`: A drawer with a drag edge

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders. Select a row to read it here."
  toolbar
    field "Search orders" search
  table 3 "Order" "Customer" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  drawer right "SO-1042"
    status "Paid" positive
    fact "Placed" "8 Oct 2026, 09:32"
    fact "Method" "Card"
    fact "Paid" "EUR 125.00"
    fact "Lines" "3, none shipped"
    text muted "Drag the left edge to widen. The width is kept for this browser."
    action "Resend the confirmation"
    action primary "Open the record"
```

**Rationale:** The way VS Code sizes its side bar: a drag edge lets the reader trade list width for record width per task. A wide lines table gets room without a navigation, and a narrow read keeps the list.

**Cost:** A width the reader sets is a width the layout must remember and repair. Every stored pixel is state that follows the reader to a narrower screen, where it has to be clamped.

**Reference:** VS Code

### Toast at the edge of the screen

**Question:** A command ends with a short message at the edge of the screen. One message carries at most one action. Nothing critical belongs in something that disappears on a timer.

**Default:** `a-confirmation-that-closes-by-itself`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the self-closing confirmation for success, and the staying undo toast where an undo exists. The runner-up is the toast that links to the result. It suits commands whose result lives elsewhere, because the link going away costs nothing.

Never ship two actions on one toast. Two buttons turn a transient message into a small panel with a timer. Never ship a toast as the only route to a result.

#### `a-confirmation-that-closes-by-itself`: A confirmation that closes by itself

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders. 3 confirmations resent."
  toolbar
    field "Search orders" search
    field "State" select = "Any state"
  table 4 "Order" "Customer" "State" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  toast "Confirmations resent to 3 customers." positive
```

**Rationale:** No action on it, so it can leave on its own. Base UI's default timeout is 5,000 milliseconds, and nothing is lost by it going.

**Cost:** NN/g's own example: a reader missed an error that faded after five seconds and waited five minutes. Fine for a success, wrong for anything else.

**Reference:** Base UI

#### `a-confirmation-carrying-an-undo-which-stays`: A confirmation carrying an undo, which stays

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders. 3 selected for resending."
  toolbar
    field "Search orders" search
    field "State" select = "Any state"
  table 4 "Order" "Customer" "State" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  toast "Confirmations resent to 3 customers. Undo stays until dismissed." positive
```

**Rationale:** The toast carries one action and persists until it is dismissed, which is Carbon's rule for an actionable notification. Undo is the action, and nothing else competes for it.

**Cost:** A toast that stays is on screen until the reader deals with it, so a page where the reader moves on accumulates one. Android's own guidance warns a snackbar's timer can take the action away.

**Reference:** Carbon

#### `a-refusal-which-is-not-a-toast`: A refusal, which is not a toast

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders. 3 selected for resending."
  message "2 of the 3 confirmations could not be resent. Elin Lindqvist and Ade Okafor asked for no messages." critical
  toolbar
    field "Search orders" search
  table 4 "Order" "Customer" "State" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The same slot filled with a refusal, to show why a failure must not be transient. An alert sits on the page and stays until the command succeeds.

**Cost:** The visual difference between a success toast and an error alert has to be learned. Carbon keeps tones off full-width bands on a page about other work.

**Reference:** Carbon

#### `a-toast-carrying-two-actions`: A toast carrying two actions

```wireframe
page
  breadcrumb "Home" "Products" "Standard tier"
  header
    heading "Standard tier"
    text "9,412 units sold and all shipped."
  region "The tier"
    fact "Sold" "9,412 of 10,000"
    fact "Shipped" "9,380"
    fact "Unshipped" "32"
  toast "The price tier was closed. Undo and Dismiss are both on this message." caution
```

**Rationale:** The toast offering Undo and Dismiss together, which is the shape most people reach for first.

**Cost:** Material forbids it: one action per snackbar, and it may not be Dismiss. Two buttons turn a transient message into a small panel with a timer.

**Reference:** Material Design

#### `a-toast-that-is-the-only-route-to-the-result`: A toast that is the only route to the result

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
    action "Export"
  toolbar
    field "Search orders" search
  table 2 "Order" "Customer"
    item: text "SO-1042" · text "Maria Garcia"
  toast "Your export is ready. Download is only on this message." positive
```

**Rationale:** The toast says the export finished and offers Download, which is the only way to get the file. A message that vanishes takes the result with it.

**Cost:** Carbon states it directly: because toasts can dismiss automatically, users must be able to access the result elsewhere. This violates that on purpose, to show what it costs.

**Reference:** Carbon

#### `a-stacked-notification-area`: A stacked notification area

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders. 25 selected."
  toolbar
    field "Search refunds" search
  table 4 "Order" "Customer" "State" "Amount"
    item: text "SO-1042" · text "Maria Garcia" · status "Open" neutral · text "EUR 90.00"
  toast "12 refunds offered as credit." positive
  toast "3 customers emailed." positive
  toast "1 refund was refused by the bank." caution
```

**Rationale:** Three toasts stacked at the bottom edge, so several commands in quick succession each say what they did. Base UI caps the viewport at three.

**Cost:** A stack on a page the reader is working through covers the bottom-right of the table. That corner holds the pagination and the bulk bar.

**Reference:** Base UI

#### `a-toast-that-links-to-the-result`: A toast that links to the result

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
    action "Export"
  region "Latest exports"
    list 2
      item: text "orders-2026-10-08.csv" · text muted "268 rows" · action "Download"
  toast "Your export is ready. orders-2026-10-08.csv waits under Latest exports." positive
```

**Rationale:** The way Vercel ends a deployment toast: the message links to the result, and the result also waits on the page. The toast going away costs nothing because the file does not go with it.

**Cost:** Two routes to one result need the same name in both places. Where the names drift, the reader stops trusting the link and opens the page instead.

**Reference:** Vercel

#### `a-progress-toast-while-a-slow-command-runs`: A progress toast while a slow command runs

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
    action "Export"
  region "Latest exports"
    list 1
      item: text "orders-2026-10-01.csv" · text muted "241 rows" · action "Download"
  toast "Exporting 166 of 268 orders. About a minute left." info
```

**Rationale:** The way Shopify reports a bulk export: a persistent notice with a bar and a count, dismissible only by canceling. The reader keeps working while the count climbs.

**Cost:** A toast that cannot be dismissed is a band with a timer that never fires. Past five minutes it is clutter rather than feedback, and it still covers the pagination.

**Reference:** Shopify

### Menu of a row's commands

**Question:** Where do the other commands of a row sit. The first command draws inline and the rest sit behind a menu. A row keeps its other commands in its row menu.

**Default:** `a-menu-with-groups-and-a-destructive-item-last`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the menu with groups and the destructive item last after a separator, with nothing disabled without a reason. The runner-up is the menu that states why an item is disabled. It is the better choice where a command is often disabled, because the reason in place beats a hover.

Never ship a confirmation inside a menu. A confirmation there is a dialog over a menu, the same nesting the project forbids for dialogs.

#### `a-menu-with-groups-and-a-destructive-item-last`: A menu with groups and a destructive item last

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  toolbar
    field "Search orders" search
  table 4 "Order" "Customer" "State" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00" · action "Resend"
  menu "Row commands"
    action "Open the record"
    action "Resend the confirmation"
    action "Refund"
    action disabled "Void the pickup code"
    action "Report a problem"
    action quiet "Copy the order number"
```

**Rationale:** The recommended shape. The items are grouped under small headings and the destructive one sits at the end, after a separator, in the destructive tone. Nothing is disabled without a reason.

**Cost:** A menu item that is disabled gives no reason in the menu itself. The reader has to hover or press it to learn why. An explained action solves that on the page, not here.

#### `a-menu-that-says-why-an-item-is-disabled`: A menu that says why an item is disabled

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  toolbar
    field "Search orders" search
  table 4 "Order" "Customer" "State" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  menu "Row commands"
    action "Open the record"
    action "Resend the confirmation"
    action "Refund"
    action disabled "Void the pickup code"
  message "Void the pickup code is unavailable: both parcels were collected at 22:41." neutral
```

**Rationale:** The disabled item carries its reason in place, so the reader learns it without pressing it. This is the fix for a menu whose commands are conditionally absent.

**Cost:** A reason inside a menu is a paragraph among one-word items, so the menu becomes taller than the row that opened it.

#### `a-menu-with-a-confirmation-inside-it`: A menu with a confirmation inside it

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  toolbar
    field "Search orders" search
  table 4 "Order" "Customer" "State" "Paid"
    item: text "SO-1034" · text "Ade Okafor" · status "Disputed" critical · text "EUR 45.00"
  menu "Row commands"
    action destructive "Withdraw the dispute"
  popover "Withdraw the dispute"
    text "The payment provider is told the company accepts the charge."
    message "This cannot be taken back." critical
    action "Keep it open"
    action destructive "Withdraw"
```

**Rationale:** A destructive item opens its confirmation from inside the menu, so the menu stays and the question appears beside the row it applies to.

**Cost:** That is a dialog opening over a menu, which is a menu opening a dialog. Atlassian forbids a dialog that triggers another dialog. The same reasoning applies to a menu.

**Reference:** Atlassian

#### `a-menu-as-a-split-button-the-first-command-and-the-rest`: A menu as a split button: the first command and the rest

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Pricing"
  header
    heading "Oak desk lamp"
    status "Scheduled" info
    text "LMP-OAK-01. 412 in stock. 0 of 500 sold."
    action primary "Publish the price list"
    menu "More ways to publish"
      action "Publish now, ignoring the date"
      action "Schedule it for another time"
      action "Save as a template"
  region "What would be published"
    table 3 "Product" "Price" "Stock"
      item: text "Oak desk lamp" · text "EUR 45.00" · text "412"
```

**Rationale:** One button carries the first command and its own half carries the menu. Both stay reachable without the reader ever opening anything to find the first one.

**Cost:** Two targets in one shape, and the second half is a chevron that a reader may read as open rather than the rest. It also breaks where a button would wrap.

#### `no-menu-the-row-s-commands-are-all-on-the-row`: No menu: the row's commands are all on the row

```wireframe
page
  breadcrumb "Home" "Products"
  header
    heading "Products"
    text "93 for sale."
  toolbar
    field "Search products" search
  table 3 "Product" "Updated" "Command"
    item: text "Oak desk lamp" · text muted "9 Oct 2026" · action "Open" · action "Publish"
  region "The rest"
    list 2
      item: text "Oak floor lamp" · text muted "7 of 400 sold"
```

**Rationale:** One or two commands inline and nothing hidden, for a row whose whole set is small. NN/g's ceiling for inline placement is two.

**Cost:** Two buttons plus a checkbox plus five columns is a wide row, and it stops fitting at 24-pixel density. And it breaks the moment a third command arrives.

**Reference:** NN/g

#### `a-menu-on-the-page-rather-than-the-row`: A menu on the page rather than the row

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia of Garcia Interiors. Placed 8 Oct 2026, 09:32."
    action primary "Message customer"
    menu "More"
      action "Resend the confirmation"
      action "Refund"
      action "Refund part of it"
      action disabled "Void the pickup code"
      action quiet "Copy the order number"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
```

**Rationale:** A page-level overflow holding every command for the record, rather than a menu per row. One menu instead of twenty-five.

**Cost:** A command that applies to one record cannot live in a page-level menu. The row-menu rule gives each row its own menu. This inverts that rule.

#### `a-menu-with-a-search-field-at-the-top`: A menu with a search field at the top

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  toolbar
    field "Search orders" search
  table 4 "Order" "Customer" "State" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  menu "Commands matching re, 4 of 7"
    action "Open the record"
    action "Resend the confirmation"
    action "Refund"
    action "Report a problem"
```

**Rationale:** The way Linear filters its command menu: typing narrows twenty commands to one without submenus. Suited to rows whose command set keeps growing past what a scan can hold.

**Cost:** A search field in a menu needs focus on open, which steals the keys a reader uses to move. With six commands it is furniture around a list nobody filters.

**Reference:** Linear

#### `grouped-commands-behind-submenus`: Grouped commands behind submenus

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  toolbar
    field "Search orders" search
  table 4 "Order" "Customer" "State" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  menu "Row commands"
    action "Open the record"
    action "Resend the confirmation"
    action "Refund"
    action quiet "Copy the order number"
  menu "Refund routes"
    action "Refund in full"
    action "Refund part of it"
    action "Offer credit for a future order"
```

**Rationale:** The way Radix UI nests submenus, which is what the shadcn menu is built on: Refund opens sideways into its three routes. Groups stay visible while the choice stays one hover away.

**Cost:** Sideways menus punish every reader on touch, where hover does not exist. Three routes fit. A fourth means the submenu needs its own scroll, and then it is a panel.

**Reference:** Radix UI

### Short panel that opens beside a control

**Question:** What earns a panel anchored to a control. It is not a dialog and not a toast. It closes when the reader looks away, and a reference to another record is chosen from a picker instead.

**Default:** `a-popover-that-explains-what-a-term-means`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the popover that explains what a term means. A defined term carries its glossary entry where it is read, and only for terms the application has defined. The runner-up is the row preview popover. It suits dense lists where a hover card saves a navigation, on focus as well as hover.

Never ship a menu and a popover for the same thing. The pair teaches that floating layers stack, which the one-overlay rule refuses.

#### `a-row-preview-popover-on-hover-and-focus`: A row preview popover on hover and focus

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  toolbar
    field "Search orders" search
  table 3 "Order" "Customer" "Parcel"
    item: text "SO-1042" · text "Maria Garcia" · text "PCK-0C893968A2"
  popover "PCK-0C893968A2"
    text "Oak desk lamp, 2 units in order SO-1042."
    fact "For" "Maria Garcia"
    fact "Packed" "8 Oct 2026, 09:34"
    fact "Collected" "Not collected"
```

**Rationale:** Hovering a parcel code shows the parcel's facts. It gives context without leaving the list and costs one read.

**Cost:** A hover affordance is invisible on touch and undiscoverable at all. It needs focus as well as hover, and then it is two renders of every row.

#### `a-popover-that-explains-what-a-term-means`: A popover that explains what a term means

```wireframe
page
  breadcrumb "Home" "Invoices" "Costs"
  header
    heading "What the plan costs"
    text "Every charge on the account, and what it is for."
  region "September charges"
    fact "Business plan" "EUR 49.00 a month"
    fact "Order fee" "EUR 270.90"
    fact "Per-line fee" "EUR 236.00"
    fact "Total for September" "EUR 555.90"
  popover "Order fee"
    text "0.5 percent of every order total. It pays for payment handling."
```

**Rationale:** A word somebody may not know carries its glossary entry beside it. It answers the question where it is asked.

**Cost:** Only for a term the application has defined. A hint on every unfamiliar word becomes noise, and the glossary has to stay in step with the hint.

#### `a-popover-carrying-the-whole-picker`: A popover carrying the whole picker

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
  region "Where and when"
    field "Where" text = "Amst"
    field "Reference" text
    field "Arrives" text = "14/03/2026"
  popover "Warehouses matching Amst"
    list 3
      item: text "Amsterdam warehouse" · text muted "40 pallets"
    action quiet "No warehouse yet? Add one."
```

**Rationale:** The record picker list opens in a popover rather than a dialog, anchored to the field. The rest of the form stays visible behind it.

**Cost:** This is what the picker in the forms category already is. It only works while the list is short enough to sit under the field without leaving the viewport.

#### `a-popover-for-the-calendar`: A popover for the calendar

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
  region "Window"
    field "Window opens" text = "14/03/2026"
    field "Window closes" text = "15/03/2026"
    text muted "In the Europe/Amsterdam time zone."
  popover "March 2026"
    grid 31
      item: text "14"
    text muted "14 March is selected."
    action quiet "Previous month"
    action quiet "Next month"
```

**Rationale:** The date field opens a month grid in a popover rather than a dialog. The form and the calendar stay both visible, and Escape closes the calendar alone.

**Cost:** APG puts the grid in a dialog, not a popover. A popover can be clipped by an overflow container, and the calendar is essential rather than advisory.

**Reference:** APG

#### `a-popover-on-the-copy-button-saying-what-was-copied`: A popover on the copy button, saying what was copied

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    text "Quote these in a message to support."
  region "Identifiers"
    fact "Order" "SO-1042"
    action quiet "Copy"
    fact "Parcels" "PCK-0C893968A2"
    action quiet "Copy"
    fact "Bank reference" "SH-88213"
    action quiet "Copy"
  popover "Copied"
    text "The parcel codes are on the customer message."
```

**Rationale:** Copying an identifier is a command with no visible result otherwise, so the control confirms in place rather than opening anything.

**Cost:** A confirmation for a copy is easy to miss and the value is already on screen. It is politeness rather than information.

#### `a-menu-and-a-popover-used-for-the-same-thing`: A menu and a popover used for the same thing

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders. 12 outside the refund window."
  toolbar
    field "Search refunds" search
  table 3 "Order" "Customer" "Asked"
    item: text "SO-1037" · text "Elin Lindqvist" · text muted "214 days ago"
  menu "Row commands"
    action "Offer credit"
    action "Record a bank transfer"
    action "Ask the customer"
  popover "Refund window"
    text "This payment method refunds only within 180 days."
```

**Rationale:** The row menu for commands and a popover for context, side by side. A reviewer can see the two floating shapes next to each other.

**Cost:** A page with both on it has three floating layers counting the dialog, and a reader has to learn which is which. This is the reason the one-overlay rule wants one overlay at a time.

#### `a-customer-hover-card-with-recent-orders`: A customer hover card with recent orders

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  toolbar
    field "Search orders" search
  table 3 "Order" "Customer" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  popover "Maria Garcia"
    item: avatar "MG" · text "Maria Garcia" · text muted "maria@garcia-interiors.example"
    fact "Orders" "3, all paid"
    fact "Paid in total" "EUR 215.00"
    fact "Refunds" "None"
    link "Open the customer"
```

**Rationale:** The way GitHub Primer draws a Hovercard: identity, facts, and one link, on hover and on focus. Support reads the customer without leaving the refunds queue.

**Cost:** A card that fetches on hover fires a read per row skimmed. Without focus support it is invisible on touch, where support increasingly works.

**Reference:** GitHub Primer

#### `a-coach-mark-pinned-to-the-control`: A coach mark pinned to the control

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  toolbar
    field "Search orders" search
    action "Export"
  table 3 "Order" "Customer" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  popover "Export sends a file of these orders"
    text "The current search and filters decide the rows."
    action "Got it"
    action quiet "Do not show again"
```

**Rationale:** The way Atlassian spotlights a new control: one anchored card, one fact, one dismissal. An application that already tours new staff extends a surface they know.

**Cost:** A coach mark interrupts the task it annotates. Past the first week it is dismissed unread, and every new control cannot have one or none is read.

**Reference:** Atlassian

### Bar that stays while the reader works

**Question:** Not an overlay in the dialog sense: a band the page keeps. It is worded as a fact about the page. A tone may not paint a full-width band on a page about other work.

**Default:** `a-neutral-band-for-what-this-page-is`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Ship A: a neutral band stating a fact about the deployment, the same on every page. E is the runner-up for facts true of one record only, drawn as a notice on that record.

Never ship C: a full-width caution band paints the whole page. The tone covers work the page is not about.

#### `a-neutral-band-for-what-this-page-is`: A neutral band for what this page is

```wireframe
page
  message info "This is a sandbox. Nothing here is charged and nothing reaches a bank."
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  region "Orders"
    field "Order number, name or email" search
    table 3 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** A band across the back office that holds on every page, such as which deployment this is. Neutral, never a tone, because it is about the page rather than about work.

**Cost:** A band on every page is chrome the reader cannot remove, and it competes with the heading for the top of the screen. It has to earn its height.

#### `a-bar-for-unsaved-work-pinned-to-the-foot`: A bar for unsaved work, pinned to the foot

```wireframe
page
  breadcrumb "Home" "Settings" "Storefront"
  header
    heading "Storefront"
    text "The accent color customers see."
  region "Settings"
    field "Accent color" text = "#2563EB"
    field "Typeface" select = "Inter"
  footer sticky
    text "Two changes not saved: accent color, typeface."
    action "Discard"
    action primary "Save"
```

**Rationale:** A bar across the bottom saying what is not saved and offering Save and Discard. It answers a question the editor currently leaves open.

**Cost:** It covers the bottom of the page, which on a table is where the pagination lives. And a neutral band over a form is still a full-width band.

#### `a-bar-naming-a-deadline-that-is-closing`: A bar naming a deadline that is closing

```wireframe
page
  message caution "Answering closes on 21 October. 5 disputes charge back on 21 Oct if nothing is sent."
  breadcrumb "Home" "Invoices" "Disputes"
  header
    heading "Disputes"
    text "5 open. The nearest closes in 19 days."
  region "Cases"
    table 4 "Case" "Order" "Amount" "Closes"
      item: text "D-0182" · text "SO-1034" · text "EUR 45.00" · status "19 days" caution
```

**Rationale:** A band naming the date the bank charges back, so the disputes work under it has a clock the band states.

**Cost:** A full-width caution band on a page about disputes is exactly the case the tone rule forbids. The tone paints the whole page rather than the thing in that state.

#### `a-bar-saying-what-is-read-only-and-why`: A bar saying what is read-only and why

```wireframe
page
  message neutral "This is read-only for your role. You are Chris Novak, warehouse lead. Only finance can answer a dispute or issue a refund."
  breadcrumb "Home" "Invoices" "Disputes"
  header
    heading "Disputes"
    text "5 open. The nearest closes in 19 days."
  region "Cases"
    table 3 "Case" "Order" "Amount" "Closes"
      item: text "D-0182" · text "SO-1034" · text "EUR 45.00" · text "19 days" · action disabled "Answer"
    message neutral "Only finance can answer a dispute. Support reads orders and messages customers."
```

**Rationale:** Where a whole area is read-only for this role, one band names the reason and the grant. The page below is drawn as it would be for a reader who could act.

**Cost:** Every page of the area repeats the band. The reader's eye skips it after the first and then misses the one place it changes.

#### `a-bar-on-the-record-page-not-the-console`: A bar on the record page, not the console

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  message caution "This product is not for sale. The price list opens Tue 13 Jan 2026 at 10:00."
  header
    heading "Oak desk lamp"
    status "Draft" neutral
    text "LMP-OAK-01 · 412 in stock."
    action primary "Publish the price list"
  region "What is for sale"
    fact "Stock" "412 in stock, none sold"
    fact "Price" "EUR 45.00"
```

**Rationale:** The band is scoped to one record rather than the whole console. It appears only where the fact is true and disappears everywhere else.

**Cost:** The reader learns the band on one page and then has to learn that another page does not have one. A scoped band is not a deployment marker, it is a per-record notice.

#### `no-bar-the-fact-goes-in-the-heading-instead`: No bar: the fact goes in the heading instead

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    status "Sandbox" info
    text "Every paid order, newest first. Nothing here is charged."
  region "Orders"
    field "Order number, name or email" search
    table 3 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The sandbox is named in the heading and the switcher, rather than in a band. Nothing is lost and one element is removed from every page.

**Cost:** A reader who has seen four pages without the word 'sandbox' may not notice it. And the heading is already carrying the record or the page job.

#### `a-save-bar-pinned-under-the-header`: A save bar pinned under the header

```wireframe
page
  breadcrumb "Home" "Settings" "Storefront"
  header
    heading "Storefront"
    text "The accent color customers see."
  toolbar sticky
    text "Unsaved changes: accent color, typeface."
    action "Discard"
    action primary "Save"
  region "Settings"
    field "Accent color" text = "#2563EB"
    field "Typeface" select = "Inter"
```

**Rationale:** The way Shopify Polaris draws its ContextualSaveBar: a dark bar under the header with Discard and Save, appearing only while the form is dirty. The actions stay in view on a long form.

**Cost:** A bar that appears and disappears moves the page it sits over. Readers learn to distrust the top of every form, dirty or not.

**Reference:** Shopify Polaris

#### `a-band-the-reader-dismisses-for-the-session`: A band the reader dismisses for the session

```wireframe
page
  message info "A payout settles on Friday. EUR 122.85 for the March delivery run, held by the payment provider until then."
  action quiet "Dismiss the announcement"
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  region "Orders"
    field "Order number, name or email" search
    table 3 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The way GitHub Primer draws a dismissible Banner: the fact shows once per session and the close is remembered. Suited to announcements, where the second reading has no value.

**Cost:** A dismissed band cannot carry anything the reader must see. The first dismissal teaches that every band can go, including the next one that matters.

**Reference:** GitHub Primer

### Bottom sheet on a phone

**Question:** On a phone there is no beside and no center: a dialog becomes a sheet from the bottom edge. Material keeps a modal bottom sheet one swipe from dismissed, with a handle, a title, and actions stacked full width.

**Default:** `order-actions-in-a-bottom-sheet`

**Compact:** Every option in this item is the phone behavior. A dialog becomes a sheet from the bottom edge with a handle, a title naming the record, and a full-width footer. The compact option is `order-actions-in-a-bottom-sheet`.

**Rationale:** Ship A for commands and B for filters: both keep a handle, a title, and a full-width footer above the home indicator. C is the runner-up where the content is genuinely long, because detents let the reader choose half or full.

Never ship F: a sheet with no dismissal traps the reader on the smallest screen, where every trap costs the most.

#### `order-actions-in-a-bottom-sheet`: Order actions in a bottom sheet

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    field "Order number, name or email" search
    table 2 "Order" "Customer" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  drawer bottom
    heading "Order SO-1042"
    text "Maria Garcia · Garcia Interiors · EUR 125.00 paid."
    action "Resend the confirmation"
    action "Refund"
    action quiet "Copy the order number"
    footer
      action "Cancel"
```

**Rationale:** The way Material Design draws a modal bottom sheet: a handle, a title naming the record, thumb-sized rows, one full-width dismissal. The sheet is one swipe from gone, so the list behind stays the surface.

**Cost:** One record per sheet. Bulk commands need the list rather than this, and past five rows the sheet needs its own scroll.

**Reference:** Material Design

#### `filters-with-a-sticky-apply-bar`: Filters with a sticky apply bar

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "12 orders match."
  region "Orders"
    field "Order number, name or email" search
    table 2 "Order" "Customer" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  drawer bottom
    heading "Filters"
    text "2 applied · 12 orders match."
    field "State" select = "Paid"
    field "Product" select = "Oak desk lamp"
    footer
      action "Clear both"
      action primary "Show 12 results"
```

**Rationale:** The way Shopify filters a mobile list: chips for what is set, controls for the rest, and an apply bar pinned to the foot. The match count sits in the bar. The reader never loses the results behind.

**Cost:** Chips wrap tall. Past six filters the sheet needs its own scroll, and the match count has to be live or it lies.

**Reference:** Shopify

#### `a-sheet-that-opens-half-and-expands-full`: A sheet that opens half and expands full

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    field "Order number, name or email" search
    table 2 "Order" "Customer" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  drawer bottom
    heading "Order SO-1042"
    status "Paid" positive
    text "Maria Garcia · EUR 125.00 paid by card."
    text "Half height. Pull the handle for the lines and the history."
    footer
      action "Expand"
```

**Rationale:** The way Apple Maps stages detents: half height answers the glance, full height answers the read, and the handle invites the pull. The list behind stays visible at half.

**Cost:** Two heights are two layouts to keep true. Content must read sensibly cut at half, which means the fact at the cut cannot be the one that matters.

**Reference:** Apple Maps

#### `a-sheet-with-a-destructive-section`: A sheet with a destructive section

```wireframe
page
  breadcrumb "Home" "Products"
  header
    heading "Spring lighting launch"
    text "Sat 14 Mar 2026 · Amsterdam warehouse."
  region "The launch"
    fact "State" "Scheduled"
    fact "Pre-orders" "1,204"
  drawer bottom
    heading "Cancel the spring lighting launch?"
    text "1,204 customers · EUR 54,180.00 goes back."
    message critical "This cannot be undone. A launch that has been canceled cannot be scheduled again."
    footer
      action destructive "Cancel the launch"
      action "Keep the launch"
```

**Rationale:** The way an Apple action sheet seats the destructive row apart and last. The danger is separated, red, and below the fold of safe rows. The thumb meets safe actions first.

**Cost:** Destructive at thumb reach still needs its confirm step, which this sheet cannot hold without nesting. The tap must open the full dialog, so the sheet is a detour rather than a shortcut.

**Reference:** Apple

#### `a-full-screen-sheet-takeover`: A full-screen sheet takeover

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    text "3 lines · Garcia Interiors."
  region "Notes"
    list 1
      item: text "Garcia Interiors confirmed the Friday window" · text muted "Alex Morgan, 2 Oct 2026"
  drawer bottom
    heading "Add a note"
    text "Only Acme Supply sees these."
    field "Note" textarea
    field "About" select = "The customer"
    footer
      action "Cancel"
      action primary "Add the note"
```

**Rationale:** The way Material draws a full-screen dialog on a phone: the sheet takes the screen while keeping the scrim behind. Dismissal still reads as dismissal rather than navigation.

**Cost:** A full screen with a handle is a page that cannot link. Deep tasks deserve the route with its Back, not this.

**Reference:** Material Design

#### `a-sheet-with-no-handle-and-no-dismissal`: A sheet with no handle and no dismissal

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders to decide."
  region "Refunds"
    table 1 "Order" "Customer" "Amount"
      item: text "SO-1035" · text "Ade Okafor" · text "EUR 45.00"
  drawer bottom
    heading "Choose a refund route"
    text "Order SO-1035 · Ade Okafor · EUR 45.00 · 181 days old."
    field "Refund route" radio = "Credit for a future order"
    footer
      action primary "Offer credit"
```

**Rationale:** Some banking apps block the screen until a choice is made. This shows what that costs here: the reader is stuck until they pick a refund route.

**Cost:** It traps the reader on the smallest screen, where every trap costs the most. Only a command that cannot wait earns this, and a refund route can always wait.

### Dialog with a long body and a sticky footer

**Question:** Some commands need more words than a dialog holds: terms, line items, per-audience consequences. The footer must stay where the thumb is while the body scrolls, or the reader agrees to what they cannot see.

**Default:** `a-scrolling-body-with-a-pinned-footer`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Ship A: one scrolling body, one pinned footer, nothing else. D is the runner-up wherever money moves, because the totals pinned above the footer are read at the click.

Never ship F: buttons that scroll away ask the reader to agree first and find how after.

#### `a-scrolling-body-with-a-pinned-footer`: A scrolling body with a pinned footer

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    text "Maria Garcia · Garcia Interiors · EUR 125.00 paid."
  region "What was bought"
    fact "Oak desk lamp, 2 lamps" "EUR 90.00"
    fact "Paid by the customer" "EUR 125.00"
  dialog
    heading "Refund SO-1042 in full?"
    text "The two lamps go back to stock and sell again. The gift wrap was made for this order and is not refunded."
    text "The refund goes back on the card payment the customer used. It arrives within five working days."
    text "This payment is 31 days old, inside the 180-day window. Past it the fallbacks are credit or a payment the back office only records."
    footer
      action "Cancel"
      action destructive "Refund EUR 125.00"
```

**Rationale:** The way the Stripe Dashboard pins actions on a long refund dialog: the body scrolls under a footer that never moves. The commit stays in reach and the terms stay above it.

**Cost:** A scrolling region inside a dialog is two scrolls on one screen. Keyboard readers must land in the body rather than behind it, or the terms are decoration.

**Reference:** Stripe

#### `a-pinned-header-and-footer-with-a-section-read`: A pinned header and footer with a section read

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    text "Maria Garcia · Garcia Interiors · EUR 125.00 paid."
  region "What was bought"
    fact "Oak desk lamp, 2 lamps" "EUR 90.00"
    fact "Paid by the customer" "EUR 125.00"
  dialog
    heading "Refund SO-1042 in full?"
    text "Refunding SO-1042 · EUR 125.00 · 2 lamps and gift wrap."
    region "The money"
      text "EUR 125.00 goes back to Maria Garcia on the card payment she used. The gift wrap is not refunded."
    region "The goods"
      text "Both lamps go back to stock and sell again at the current price."
    region "The window"
      text "This payment is 31 days old, inside the 180-day window."
    region "The record"
      text "Nothing is deleted. The order says it was refunded, when, and who approved it."
    footer
      action "Cancel"
      action destructive "Refund EUR 125.00"
```

**Rationale:** The way Atlassian pins modal headers on long content: the record and the amount stay named while the sections scroll. The reader never wonders which order the terms belong to.

**Cost:** Pinned chrome eats a third of a phone dialog, and the body shows two lines at a time. On a short dialog the pinned header is furniture.

**Reference:** Atlassian

#### `sections-that-collapse`: Sections that collapse

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    text "Maria Garcia · Garcia Interiors · EUR 125.00 paid."
  region "What was bought"
    fact "Oak desk lamp, 2 lamps" "EUR 90.00"
    fact "Paid by the customer" "EUR 125.00"
  dialog
    heading "Refund SO-1042 in full?"
    list 4
      item: text "The money" · text muted "open"
    text "EUR 125.00 goes back to Maria Garcia on the card payment she used."
    footer
      action "Cancel"
      action destructive "Refund EUR 125.00"
```

**Rationale:** The way Shopify collapses modal sections: one open at a time, the rest one tap away. Four sections read as four lines until the reader wants one.

**Cost:** Collapsed sections hide the term the reader most needed. The dialog must open the section that matters for this order, which means it must know which one that is.

**Reference:** Shopify

#### `a-summary-pinned-above-the-footer`: A summary pinned above the footer

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    text "Maria Garcia · Garcia Interiors · EUR 125.00 paid."
  region "What was bought"
    fact "Oak desk lamp, 2 lamps" "EUR 90.00"
    fact "Paid by the customer" "EUR 125.00"
  dialog
    heading "Refund SO-1042 in full?"
    text "The two lamps go back to stock and sell again. The gift wrap was made for this order and is not refunded."
    text "The refund goes back on the card payment the customer used and arrives within five working days."
    fact "To Maria Garcia" "EUR 125.00"
    footer
      action "Cancel"
      action destructive "Refund EUR 125.00"
```

**Rationale:** The way Stripe pins the total above Pay: the figure the click commits to stays visible while the terms scroll. The reader signs the number, not the scroll position.

**Cost:** The pinned summary duplicates the body. Where the two disagree the reader trusts the pin, and the body becomes decoration nobody checks.

**Reference:** Stripe

#### `a-wide-dialog-for-dense-facts`: A wide dialog for dense facts

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    text "Maria Garcia · Garcia Interiors · EUR 125.00 paid."
  region "What was bought"
    fact "Oak desk lamp, 2 lamps" "EUR 90.00"
    fact "Paid by the customer" "EUR 125.00"
  dialog
    heading "Refund SO-1042 in full?"
    split 1:1
      region "Money and route"
        fact "To the customer" "EUR 125.00"
        fact "Route" "Original card payment"
        fact "Window" "31 of 180 days used"
      region "Goods and record"
        fact "Goods" "2 lamps, back to stock"
        fact "Gift wrap" "Not refunded"
        fact "Record" "Kept, marked refunded"
    footer
      action "Cancel"
      action destructive "Refund EUR 125.00"
```

**Rationale:** The way Vercel widens a modal for dense settings: two columns of facts read side by side instead of stacked. Four sections fit without scrolling on a laptop.

**Cost:** Wide on desktop is full-width on a phone, where the columns stack and the dialog doubles in height. The no-scroll promise holds at exactly one width.

**Reference:** Vercel

#### `no-pinned-footer-the-buttons-scroll-away`: No pinned footer: the buttons scroll away

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    text "Maria Garcia · Garcia Interiors · EUR 125.00 paid."
  region "What was bought"
    fact "Oak desk lamp, 2 lamps" "EUR 90.00"
    fact "Paid by the customer" "EUR 125.00"
  dialog
    heading "Refund SO-1042 in full?"
    text "The two lamps go back to stock and sell again. The gift wrap was made for this order and is not refunded."
    text "The refund goes back on the card payment the customer used. It arrives within five working days."
    text "This payment is 31 days old, inside the 180-day window, so the bank accepts it."
    message caution "The footer with Cancel and Refund sits below this body. Scroll to reach it."
    action "Cancel"
    action destructive "Refund EUR 125.00"
```

**Rationale:** Included to refuse it: without a scroll cap the dialog grows past the viewport and the footer sits below the fold. The reader agrees first and finds how after.

**Cost:** On a phone the footer is two screens down, past terms nobody scrolled to. This is the shape every other option in this item exists to replace.

### Keyboard shortcut help overlay

**Question:** Staff who live in lists learn keys faster than clicks. Linear and GitHub both answer ? with an overlay, grouped by where the keys work, closable with the same key.

**Default:** `a-grouped-grid-of-shortcuts`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Ship A: three groups, one grid, every key the application honors, closed by the same key. D is the runner-up on dense pages, where a This page section answers the only keys that work there.

Never ship F: tooltips alone hide the catalog from the reader who would learn it fastest.

#### `a-grouped-grid-of-shortcuts`: A grouped grid of shortcuts

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    field "Order number, name or email" search
    table 2 "Order" "Customer" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  dialog
    heading "Keyboard shortcuts"
    text "Press ? again to close."
    region "Everywhere"
      list 3
        item: text "Open this help" · text "?"
    region "Orders list"
      list 3
        item: text "Search the list" · text "/"
    region "Record"
      list 2
        item: text "Message the customer" · text "M"
    footer
      action "Close"
```

**Rationale:** The way Linear answers ?: groups by where the keys work, each key in its own cap, the same key closes. Staff learn the catalog in one reading.

**Cost:** A catalog dialog lists keys the reader has no reason to press yet. Past twenty keys it is reference rather than learning, and reference belongs on a page.

**Reference:** Linear

#### `a-single-column-list`: A single-column list

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    field "Order number, name or email" search
    table 2 "Order" "Customer" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  dialog
    heading "Keyboard shortcuts"
    text "Press ? again to close."
    list 6
      item: text "Open this help" · text "?"
    footer
      action "Close"
```

**Rationale:** The way Superhuman lists every key in one column: no groups to learn, scanning top to bottom, each row one fact. Shorter to build and shorter to read.

**Cost:** One column grows long. Groups would shorten the search for a key the reader half-remembers, and this list has none.

**Reference:** Superhuman

#### `shortcuts-inside-the-command-palette`: Shortcuts inside the command palette

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    field "Order number, name or email" search
    table 2 "Order" "Customer" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  dialog
    heading "Search and commands"
    field "Search commands" search = "resend"
    list 2
      item: text "Resend the confirmation for SO-1042" · text muted "Enter to run"
    text "? shows all shortcuts. Up and Down move. Esc closes."
```

**Rationale:** The way Raycast teaches keys in its footer: the hints sit where the keys work, so every palette visit is a lesson. No separate catalog to keep true.

**Cost:** Hints teach three keys. The rest stay hidden until the full dialog opens, so this is a reminder rather than a catalog.

**Reference:** Raycast

#### `shortcuts-for-this-page-only`: Shortcuts for this page only

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    field "Order number, name or email" search
    table 2 "Order" "Customer" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  dialog
    heading "Shortcuts on Orders"
    text "Keys that work nowhere else are not listed here."
    list 3
      item: text "Search the list" · text "/"
    link "All shortcuts"
    footer
      action "Close"
```

**Rationale:** The way Figma scopes its shortcuts panel to the tool at hand: only the keys that work here. The list stays short enough to learn. The global keys live one link away.

**Cost:** Page-scoped lists repeat the global keys on every page or omit them. Either way the reader meets two lists where one catalog would do.

**Reference:** Figma

#### `a-printable-cheat-sheet-page`: A printable cheat sheet page

```wireframe
page
  breadcrumb "Home" "Help" "Shortcuts"
  header
    heading "Keyboard shortcuts"
    text "Every key the application honors."
    action "Print"
  split 1:1
    region "Everywhere"
      list 3
        item: text "Open this help" · text "?"
    region "Orders list"
      list 3
        item: text "Search the list" · text "/"
  region "Record"
    list 2
      item: text "Message the customer" · text "M"
```

**Rationale:** The way GitHub Docs prints its cheat sheet: one page, two columns, made for paper pinned beside a screen. Counter staff learn from paper faster than from a dialog.

**Cost:** A page for keys is a destination nobody bookmarks. The keys are needed where the work is, and this page is never there.

**Reference:** GitHub Docs

#### `no-overlay-hints-only-on-tooltips`: No overlay: hints only on tooltips

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
    action "Export"
  region "Orders"
    field "Order number, name or email" search
    table 2 "Order" "Customer" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  popover
    text "Export these orders"
    text "E"
```

**Rationale:** Included to refuse it: the catalog hides one hover at a time, and touch readers never meet it at all. A reader who would learn ten keys learns none.

**Cost:** Each hint is accurate and each is undiscoverable. The tooltip teaches the key for a control already found, which is the one key that reader needed least.

### Context menu where the pointer is

**Question:** A right click asks what this thing can do. Linear and VS Code answer at the pointer with the same commands the row menu holds. The menu is a shortcut rather than a second set.

**Default:** `a-right-click-menu-on-a-row`

**Compact:** Touch has no right click: a long press opens the same menu, with the same commands and the same order, positioned above the row. The compact option is `a-long-press-menu-on-touch`.

**Rationale:** Ship A: the row's own commands at the pointer, nothing added, nothing missing, closed by the same click elsewhere. C is the runner-up for bulk work, where the menu rewrites itself for the selection count.

Never ship F: silence hands the gesture to the browser, whose commands act on the page rather than the record.

#### `a-right-click-menu-on-a-row`: A right-click menu on a row

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    field "Order number, name or email" search
    table 3 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  popover
    menu "Order SO-1042"
      action "Open the record"
      action "Resend the confirmation"
      action "Refund"
      action quiet "Copy the order number"
```

**Rationale:** The way Linear answers a right click: the row's own commands at the pointer, nothing added, nothing missing. The menu is a shortcut to the row menu rather than a second set.

**Cost:** Right click is invisible. Staff who never try it keep the row menu, and both menus must hold the same commands or one of them lies.

**Reference:** Linear

#### `a-context-menu-with-icons-and-shortcuts`: A context menu with icons and shortcuts

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    field "Order number, name or email" search
    table 3 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  popover
    menu "Order SO-1042"
      action "Open the record (Enter)"
      action "Resend the confirmation (R)"
      action "Refund"
      action quiet "Copy the order number (Ctrl C)"
```

**Rationale:** The way VS Code pairs icons with keys in its context menus: the icon scans and the key teaches. The pair stays the same everywhere the command appears.

**Cost:** Icons for Refund and Report read as decoration. A wrong icon teaches faster than no icon, and every icon is a second name to keep true in two languages.

**Reference:** VS Code

#### `a-context-menu-for-a-bulk-selection`: A context menu for a bulk selection

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders. 3 selected."
  region "Orders"
    field "Order number, name or email" search
    table 3 "Order" "Customer" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  popover
    menu "3 selected orders"
      action "Resend to 3 customers"
      action "Export 3 orders"
      action quiet "Copy 3 order numbers (Ctrl C)"
```

**Rationale:** The way Figma rewrites its right-click menu for a multi-selection: the count in every label, single-record commands gone. The reader cannot ask three rows to open one record.

**Cost:** The menu rewrites per count, so muscle memory for one row breaks at three. And the count must be exact at the click, not at the render.

**Reference:** Figma

#### `a-long-press-menu-on-touch`: A long-press menu on touch

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    field "Order number, name or email" search
    table 2 "Order" "Customer" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  popover
    menu "Order SO-1042"
      action "Open the record"
      action "Resend the confirmation"
      action "Refund"
      action quiet "Copy the order number"
```

**Rationale:** The way iOS answers a long press: the same menu, opened by time rather than button. Touch staff get the shortcut without a second design to learn.

**Cost:** Long press has no hover state, so discovery is zero and the delay punishes every use. It is a courtesy for those who know, not a route for those who do not.

**Reference:** iOS

#### `a-context-menu-on-empty-space`: A context menu on empty space

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    field "Order number, name or email" search
    table 3 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  popover
    menu "Orders list"
      action "Refresh the list (R)"
      action "Export these orders (E)"
      action quiet "Copy the page link"
```

**Rationale:** The way VS Code menus its explorer background: page commands where the pointer is. Refresh and Export do not need a trip to the toolbar.

**Cost:** Page commands in a hidden menu compete with the toolbar that already holds them. Two homes for Export means two places to keep true.

**Reference:** VS Code

#### `no-menu-the-browser-default-answers`: No menu: the browser default answers

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    field "Order number, name or email" search
    table 3 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  popover
    text "The browser answers, because the back office does not."
    menu "Browser"
      action "Back"
      action "Reload"
      action "Save as"
      action quiet "Inspect element"
```

**Rationale:** Included to refuse it: silence hands the gesture to the browser, whose commands act on the page rather than the record. Staff learn the gesture does nothing for them and stop trying.

**Cost:** Inspect element beside Reload, on a row about money. The absence is not neutral. It teaches that right click is not part of the application.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/patterns/dialogs-and-overlays#name-the-command-on-a-confirm-action | guidance | Does every built screen of this kind keep this rule, including in its compact layout? |
| litespec/frontend/patterns/dialogs-and-overlays#return-focus-when-an-overlay-closes | guidance | Does every built screen of this kind keep this rule, including in its compact layout? |
| litespec/frontend/patterns/dialogs-and-overlays#confirming-a-command-that-cannot-be-taken-back | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/dialogs-and-overlays#short-task-in-a-dialog | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/dialogs-and-overlays#drawer-beside-the-list | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/dialogs-and-overlays#toast-at-the-edge-of-the-screen | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/dialogs-and-overlays#menu-of-a-rows-commands | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/dialogs-and-overlays#short-panel-that-opens-beside-a-control | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/dialogs-and-overlays#bar-that-stays-while-the-reader-works | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/dialogs-and-overlays#bottom-sheet-on-a-phone | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/dialogs-and-overlays#dialog-with-a-long-body-and-a-sticky-footer | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/dialogs-and-overlays#keyboard-shortcut-help-overlay | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/dialogs-and-overlays#context-menu-where-the-pointer-is | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
