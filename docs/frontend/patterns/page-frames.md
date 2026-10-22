# Page Frame Patterns

## Intent

Every screen in the product is one kind of page, from home and list to form, report, and outcome. This page holds the layout pattern for each kind: home, list, queue, record, form, report, settings, editor, outcome, operations, schedule, setup, error, and drawer. A team building a new screen starts from these patterns, an owner picks an option from the drawings, and the team records the choice in its pattern catalog, the file holding the project's interface decisions. One layout per kind keeps every screen predictable, so a reader knows where the heading, actions, and content sit before reading.

## Concepts

### How to read a pattern

Each pattern answers one layout question, such as how a list page orders its search, filters, table, and paging. It states the question, the default option a project builds, how the default behaves on a narrow screen, and why the default won. Each option then shows one wireframe drawing with its own rationale, cost, and optional reference. A project records its choice in its pattern catalog and builds the chosen option with its own components. The [UI patterns](../patterns.md) page states the catalog contract and the wireframe language.

### The running example

The drawings on this page use the Acme Supply back office: order SO-1042 for Maria Garcia, the Garcia Interiors restock delivery, and the Amsterdam warehouse. Each kind of page repeats the same frame, so a reader meets one heading and at most one primary action on every screen. The Standards section states the two rules every option keeps: each page shows one top-level heading, and each frame shows at most one primary action outside its rows and overlays.

## Standards

### Name the page in one heading

**Statement:** Each page MUST show one top-level heading that names the record, list, or task it holds.

**Rationale:** One heading names the open record, list, or task, so a reader who arrived from a link or a search knows where they landed. Without it, two headings compete for that job, and the reader guesses which line to trust while assistive tech announces the wrong one.

### Show one primary action in a page frame

**Statement:** A page frame MUST show at most one primary action outside its rows and overlays.

**Rationale:** One primary action names the step readers take most often next on the page, such as New delivery on a deliveries list. Without that single answer, two equal buttons force the reader to compare labels on every visit, and the hurried click lands on the wrong one.

## Patterns

### Home page

**Question:** The first page after sign-in tells the reader what needs doing now, most urgent first, before any figure. A home page typically holds a greeting, stat tiles, a setup section, a needs-attention list, and a coming-up list. The disagreement is how much of that sits above the fold, and whether the tiles lead or the work leads.

**Default:** `work-first-tiles-second`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Work first, tiles second stays the pick. The manager reads the queue and stops, and the figures wait below for the curious reader. The Linear-style my-work split is the runner-up. Prefer it once assignment is a real command and two people share one queue.

Never ship the tiles-first order as the default. Three stat tiles push the queue below the fold and the page reads as a report instead of a task list.

#### `work-first-tiles-second`: Work first, tiles second

```wireframe
page
  header
    heading "Good afternoon, Alex"
    text "Two things need you today. Dispatch for the Garcia restock starts Saturday."
    action primary "New delivery"
  region "Needs attention"
    status "2 to do" caution
    list 2
      item: text "Close out the Becker restock" · text muted "The delivery is complete. Nothing left to settle." · action "Close out"
  region "Coming up"
    list 2
      item: text "Garcia Interiors restock" · text muted "Sat 14 Mar 2026, 08:00 to 12:00" · status "Active" positive · action "Open delivery"
  row
    figure "Ordered this month" "9,412"
    figure "Paid out by the provider" "EUR 57,506"
    figure "Active now" "2"
```

**Rationale:** The page opens on what needs doing and shows the figures underneath. A returning manager reads the queue and stops. A curious one scrolls for the numbers.

**Cost:** The tiles lose prominence, and a reader who came to check a number has to scroll. It costs one screen of vertical space.

#### `tiles-first-work-second`: Tiles first, work second

```wireframe
page
  header
    heading "Good afternoon, Alex"
    text "What is waiting for you, and the coming deliveries."
    action primary "New delivery"
  row
    figure "Ordered" "9,412"
    figure "Coming up" "2"
    figure "Dispatching now" "0"
  region "Finish your setup"
    list 1
      item: text "Connect a payment account" · text muted "Money cannot be taken until the provider is connected." · action "Connect"
  region "Needs attention"
    status "1 thing to do" caution
    list 1
      item: text "Close out the Becker restock" · text muted "Nothing left to settle." · action "Close out"
  region "Coming up"
    list 2
      item: text "Garcia Interiors restock" · text muted "Sat 14 Mar 2026, 08:00 to 12:00" · status "Active" positive · action "Open delivery"
```

**Rationale:** Figures give the reader a sense of scale in the first second, and the queue reads as a drill-down from them.

**Cost:** Three large tiles push the needs-attention list below the fold, so the page reads as a report rather than a task list.

#### `one-queue-no-tiles`: One queue, no tiles

```wireframe
page
  header
    heading "Today"
    text "Two things need you, in the order they cost most if they wait."
    action primary "New delivery"
  region "Needs attention"
    status "3 to do" caution
    list 3
      item: text "31 refunds need a decision" · text muted "5 close their 180-day window this week." · action "Decide"
```

**Rationale:** The home page is nothing but the queue, ordered by consequence. Nothing sits to scroll past, and no figure reads as the answer.

**Cost:** The reader loses orientation entirely. Nothing says how big the day is, how much is coming, or whether anything is broken. The work-page shape calls for two to four tiles below the queue.

#### `grouped-by-area`: Grouped by area

```wireframe
page
  header
    heading "Good afternoon, Alex"
    text "Everything Acme Supply runs, and where it needs you."
  region "Areas"
    text muted "Each area links into its own list."
    list 4
      item: text "Orders" · text muted "268 orders, 2 needing attention" · status "2 to do" caution · action "Open"
```

**Rationale:** The page is a set of per-area summaries, each linking into its own list. Home becomes a directory rather than a task list.

**Cost:** A returning manager has to open an area before they can work, and nothing surfaces the one thing that is late. It fits a settings home better than a landing page.

#### `queue-with-an-owner-and-an-age`: Queue with an owner and an age

```wireframe
page
  header
    heading "Needs you"
    text "Ordered by how long each has been waiting."
    action "Filter"
  region "Queue"
    table 3 "What" "Why" "Waiting" "Owner" "Decision"
      item: text "Refund SO-1042" · text muted "Maria Garcia, requested 6 days ago" · status "6 days" caution · text "Priya Shah" · action "Deal with"
```

**Rationale:** It is a triage shape. Each row carries who must act and how long it has waited, so several people can share the queue rather than duplicate the work.

**Cost:** An owner and a clock are only honest if assignment is a real command. With no assignment, every row reads Alex and the columns are noise.

#### `guided-first-run`: Guided first run

```wireframe
page
  header
    heading "Set up Acme Supply"
    text "Three steps between a company and a first sale."
  region "Before you can take money"
    text muted "Each step is a command of its own."
    list 3
      item: status "Done" positive · text "Create a company" · text muted "Acme Supply, Amsterdam."
  region "What you can do now"
    list 1
      item: text "Add a product" · text muted "It stays a draft until you price it and publish it." · action "New product"
```

**Rationale:** A new company gets a checklist before the queue exists, because a queue of nothing teaches nothing. The queue takes over once the checklist is done.

**Cost:** Two different pages hide behind one route. The usual answer is a separate setup route plus a setup section, which holds the same idea in two places rather than one.

#### `my-work-first-shared-queue-second`: My work first, shared queue second

```wireframe
page
  header
    heading "Good afternoon, Alex"
    text "Yours first, then what belongs to everybody."
    action primary "New delivery"
  region "Assigned to you"
    status "2 yours" caution
    list 2
      item: text "Decide the refund on order SO-1042" · text muted "Maria Garcia paid EUR 125.00." · action "Decide"
  region "The shared queue"
    text muted "Work nobody owns yet, and work somebody else owns."
    list 2
      item: text "Close out the Becker restock" · text muted "The delivery is complete." · status "Unassigned" neutral · action "Take it"
  row
    figure "Ordered this month" "9,412"
    figure "Paid out by the provider" "EUR 57,506"
    figure "Active now" "2"
```

**Rationale:** The Linear triage shape. What is assigned to Alex sits above what belongs to Acme Supply as a whole, so two people never decide the same refund twice. The shared queue stays visible, which keeps one morning from hiding the shared state.

**Cost:** Assignment must be a real command with a real owner, or every row reads Alex and the split is decoration. It costs the tiles their place on short screens.

**Reference:** Linear

#### `one-next-action-then-the-queue`: One next action, then the queue

```wireframe
page
  header
    heading "Good morning, Alex Morgan"
    text "One thing cannot wait. The rest is queued below it."
    action primary "New delivery"
  region "Do this first"
    text muted "The oldest ask in the queue."
    list 1
      item: text "Decide the refund on order SO-1042" · text muted "Maria Garcia paid EUR 125.00." · action "Decide now"
  region "Then this"
    list 2
      item: text "Set the price for the Oak desk lamp" · text muted "Nothing can sell until the price is set." · action "Set pricing"
  row
    figure "Pallets at Amsterdam warehouse" "40 pallets"
    figure "Paid on order SO-1042" "EUR 125.00"
    figure "Oak desk lamp" "EUR 45.00"
```

**Rationale:** The page names the single thing that costs most if it waits and puts its command at the top. A busy reader acts in the first second without scanning. Everything else stays queued below in the same shape as the work-first page.

**Cost:** Choosing the one next action is a judgment the application has to make and keep true. When it picks wrong, the urgency sits one section down. It costs one section of vertical space above the queue.

### List page

**Question:** Find one record among many. The frame is fixed: header, views, search, filters, one table, pagination. The decision is which controls earn their place, because a search box on its own is not enough across 268 rows.

**Default:** `search-and-a-state-filter-only`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Search plus one state filter stays the pick. Two controls answer the two questions readers ask, and a bare list needs only the filter added. The GitHub-style dense filter bar is the runner-up. Prefer it past a few hundred rows across many customers, where the query is restated in words.

Never ship two tables on one page. A list page holds one table, and a second table is a second route wearing a disguise.

#### `search-and-a-state-filter-only`: Search and a state filter only

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every order across your customers, newest first."
  toolbar
    field "Order number, name or email" search
    field "State" select = "Any state"
    action "Export"
  region "Orders"
    table 6 "Order" "Customer" "Placed" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text muted "8 Oct 2026, 09:32" · status "Paid" positive · text "EUR 125.00"
    text muted "1 to 25 of 268"
```

**Rationale:** Two controls for the two questions people ask: who is this, and what state is it in. Everything else is a view. This is the smallest honest addition to a bare list.

**Cost:** A reader with 268 orders from 40 customers still cannot narrow to one customer. It stays acceptable while the search box already searches the customer name.

#### `views-instead-of-filters`: Views instead of filters

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every order across your customers, newest first."
  toolbar
    field "Order number, name or email" search
  tabs "All 268" "Paid 214" "Awaiting 31" "Refunded 18" "Disputed 5"
    region "Orders"
      table 6 "Order" "Customer" "Placed" "State" "Paid"
        item: text "SO-1042" · text "Maria Garcia" · text muted "8 Oct 2026, 09:32" · status "Paid" positive · text "EUR 125.00"
      text muted "1 to 25 of 268"
```

**Rationale:** A segmented control across the top reads All, Paid, Awaiting, Refunded, Disputed. One control replaces five, and the current choice stays visible rather than hiding in a list.

**Cost:** Five segments plus a search box crowd one toolbar, and segments have no room for a count per state. The reader cannot see where the work is before choosing.

#### `full-filter-row-with-chips`: Full filter row with chips

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 40 customers."
  toolbar
    field "Search orders" search
    field "Customer" select = "Any customer"
    field "State" select = "Any state"
    field "Date" select = "Any date"
    field "Channel" select = "Any channel"
    action "Columns"
  region "Orders"
    status "Paid" neutral
    status "Garcia Interiors" neutral
    action quiet "Clear both"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text muted "8 Oct 2026, 09:32" · status "Paid" positive · text "EUR 125.00"
    text muted "1 to 25 of 268"
```

**Rationale:** Search, customer, state, date range, and channel, each as a control that stays visible. The applied set is restated as removable chips underneath, so the reader never guesses what narrowed the table.

**Cost:** Four controls and a chip row is a lot of chrome above a table, and the chips duplicate the controls. It pays off once the list holds mixed records.

#### `saved-views-opened-from-a-menu`: Saved views, opened from a menu

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 40 customers."
  toolbar
    field "Search orders" search
    menu "Views"
      action "Late payments"
      action "Disputed this week"
      action "Garcia orders"
    action "Filters"
    action "Columns"
  region "Orders"
    table 6 "Order" "Customer" "Placed" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text muted "8 Oct 2026, 09:32" · status "Paid" positive · text "EUR 125.00"
    text muted "1 to 25 of 268"
```

**Rationale:** The states people return to are saved under names: Late payments, Disputed this week, Garcia orders. A menu holds them so the toolbar stays empty until asked.

**Cost:** Nothing is discoverable on arrival, and every view needs its own storage. It suits power users and reads poorly as a first-run surface.

#### `two-lists-on-one-page`: Two lists on one page

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every order across your customers, newest first."
  region "Waiting for something"
    status "2" caution
    table 2 "Order" "Customer" "Placed" "Paid"
      item: text "SO-1040" · text "Elin Lindqvist" · text muted "8 Oct 2026, 08:55" · text "EUR 64.50"
  region "Settled"
    text muted "214 orders. Nothing is waiting on these."
    table 3 "Order" "Customer" "Placed" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text muted "8 Oct 2026, 09:32" · text "EUR 125.00"
```

**Rationale:** Orders waiting for something sit above orders that need nothing. It uses two tables, so the working set never mixes with the settled set.

**Cost:** A list page holds one table, and a second table means a second page or a tab. Following it means two routes and two search states.

#### `dense-filter-bar-with-a-result-count`: Dense filter bar with a result count

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every order across your customers, newest first."
  toolbar
    field "Filter by state, customer or product" search = "state:paid"
    action "Export"
  region "Orders"
    text muted "214 of 268 orders"
    action quiet "Save this view"
    table 6 "Order" "Customer" "Placed" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text muted "8 Oct 2026, 09:32" · status "Paid" positive · text "EUR 125.00"
    text muted "1 to 25 of 214"
```

**Rationale:** The GitHub issue-list shape. One filter bar states the query in words, a count says what matched, and a dense table sits under it. The reader sees what narrowed the list without opening anything.

**Cost:** A query syntax has to be learned, and typing a query is slower than pressing a segment for the two daily states. It fits lists past a few hundred rows and adds noise below that size.

**Reference:** GitHub

#### `master-and-detail-on-one-screen`: Master and detail on one screen

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders. Select one to read it here."
  toolbar
    field "Search orders" search
    field "State" select = "Any state"
  split 1:2
    region "Orders"
      table 5 "Order" "Customer" "State" "Paid"
        item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
    region "SO-1042"
      action quiet "Close the detail"
      status "Paid" positive
      fact "Customer" "Maria Garcia"
      fact "Company" "Garcia Interiors"
      fact "Placed" "8 Oct 2026, 09:32"
      fact "Paid" "EUR 125.00"
      action "Resend the confirmation"
      action "Refund"
```

**Rationale:** The table sits on the left and the record on the right. Selecting a row fills the detail panel, so several orders compare in one sitting without losing the list.

**Cost:** PatternFly reserves this for comparing short lists of the same type, and the detail pane needs a selected state and a close control. On a 1440 screen the table keeps roughly 900 pixels, which fits five columns and not eight.

**Reference:** PatternFly

### Queue

**Question:** Process items in batches. The queue is the one list page where selection is the interface. The whole page has to answer what the checkbox selects, and what happens to a thousand of them.

**Default:** `select-all-on-the-page-banner-for-the-rest`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The Gmail-style page banner stays the pick. Selecting the page and then explicitly selecting the rest is the clearest answer to the select-all problem, and money deserves the second click. The Zendesk-style play mode is the runner-up. Prefer it when each decision needs different information and batch work is rare.

Never ship the toolbar-replacing bulk bar. The layout jumps mid-decision and the search box vanishes when the reader wants to refine it.

#### `select-all-on-the-page-banner-for-the-rest`: Select all on the page, banner for the rest

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders waiting for a decision."
  toolbar
    field "Search by order or customer" search
    field "Age" select = "Any age"
    action "Columns"
  region "Refunds"
    message "All 25 refunds on this page are selected. 6 more are on the next page." info
    action "Select all 31"
    action quiet "Clear"
    table 5 "Select" "Order" "Customer" "Asked" "Amount" "Window"
      item: field "Select SO-1042" checkbox · text "SO-1042" · text "Maria Garcia" · text muted "6 days ago" · text "EUR 45.00" · status "174 days left" info
  footer sticky
    text "25 of 31 selected, EUR 1,155.00 in total"
    action "Offer credit"
    action "Refund part"
    action primary "Refund in full"
```

**Rationale:** The header checkbox selects the 25 rows on screen. A banner then says all 25 on this page are selected. It offers all 31, which makes the larger set an explicit second act rather than an invisible jump.

**Cost:** Two clicks to act on everything, and the banner is one more thing on the page. It follows Gmail and gives the clearest available answer to the select-all problem.

**Reference:** Gmail

#### `a-checkbox-on-every-row-no-header-checkbox`: A checkbox on every row, no header checkbox

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders waiting for a decision. Choose up to 20 at a time."
  region "Refunds"
    table 4 "Select" "Order" "Customer" "Asked" "Amount" "Refund"
      item: field "Select SO-1042" checkbox · text "SO-1042" · text "Maria Garcia" · text muted "6 days ago" · text "EUR 45.00" · action "Refund"
  footer sticky
    action primary "Refund 1 order"
```

**Rationale:** Selection is per order and never global, which is honest for money. The reader acts on five at a time and the page never implies it can act on all of them.

**Cost:** The most common bulk job, refunding everything inside the window, becomes 31 clicks. A cap that protects money also removes the batch work the queue exists for.

#### `bulk-bar-that-replaces-the-toolbar`: Bulk bar that replaces the toolbar

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders waiting for a decision."
  toolbar
    text "3 selected, EUR 215.00 in total"
    action quiet "Clear"
    action "Refund in full"
    action primary "Refund these 3"
  region "Refunds"
    table 3 "Select" "Order" "Customer" "Amount"
      item: field "Select SO-1042" checkbox · text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
```

**Rationale:** While anything is selected, the toolbar is replaced by a bulk bar. The selection is the only thing the page offers, so the reader cannot act on a stale table.

**Cost:** The layout shifts under the reader, and a search box they wanted to refine with disappears mid-decision. It is widely used, and widely disliked for the jump.

#### `every-row-carries-its-own-command`: Every row carries its own command

```wireframe
page
  breadcrumb "Home" "Orders" "Late payments"
  header
    heading "Late payments"
    text "Orders where the money has not arrived. Each one needs a person."
  region "Late payments"
    list 3
      item: text "SO-1042" · text muted "Maria Garcia, Garcia Interiors" · status "Awaiting payment" caution · text "EUR 125.00" · action "Send reminder"
```

**Rationale:** No selection at all. Each row has the one action that applies to it, with its own confirmation. The queue becomes a list of decisions rather than a list of things.

**Cost:** No batch work at all, which is the whole point of a queue. It fits when the batch is rare and each decision needs different information.

#### `grouped-by-what-the-row-is`: Grouped by what the row is

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 open. Grouped by what happens if you wait."
  region "Window closes this week"
    status "2" caution
    list 2
      item: text "SO-1036" · text muted "Ade Okafor, Oak desk lamp" · status "3 days left" caution · action primary "Decide now"
  region "Already outside the window"
    text muted "This payment method cannot refund after 180 days. Offer credit instead."
    status "5" critical
    list 1
      item: text "SO-1031" · text muted "Tom Becker, asked 214 days ago" · status "Window closed" critical · action "Offer credit"
```

**Rationale:** The queue is grouped into priority tiers rather than one ordered list: money at risk, refunds closing, and everything else. The reader takes the top group and stops if it is empty.

**Cost:** Groups need a stated ordering and someone has to decide it. Atlassian advises that several simple queues beat one complex one, which argues for separate routes rather than groups on one page.

**Reference:** Atlassian

#### `play-mode-one-decision-per-screen`: Play mode, one decision per screen

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds, 4 of 31"
    text "One decision at a time. Skip what needs somebody else."
  region "Order SO-1042"
    status "Open" info
    fact "Customer" "Maria Garcia, maria@garcia-interiors.example"
    fact "Company" "Garcia Interiors"
    fact "Asked" "6 days ago"
    fact "Amount" "EUR 45.00"
    fact "Refund window" "174 days left"
    action primary "Refund EUR 45.00"
    action "Offer credit"
    action quiet "Skip"
  region "Next"
    text muted "The two behind this one, soonest window first."
    list 2
      item: text "SO-1041" · text muted "Tom Becker, EUR 45.00"
```

**Rationale:** The Zendesk play mode. The queue becomes one record at a time with Decide and Skip beside it and the next one already named. Each refund gets full attention, and the reader cannot half-read a row.

**Cost:** One at a time is slow for thirty identical refunds, and the batch these queues exist for disappears. Prefer it when each decision needs different information, never for uniform work.

**Reference:** Zendesk

#### `a-table-with-a-clock-column`: A table with a clock column

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "Sorted by how long you have left, soonest first."
  tabs "All 31" "Closing 5" "Closed 8"
    region "Refunds"
      table 5 "Select" "Order" "Customer" "Amount" "Time left" "State"
        item: field "Select SO-1031" checkbox · text "SO-1031" · text "Tom Becker" · text "EUR 45.00" · text muted "Window closed 34 days ago" · status "Closed" critical
      text muted "1 to 25 of 31"
```

**Rationale:** The queue sorts by the commitment clock, with three states: fine, closing, closed. This is the Jira Service Management shape, and it makes the ordering self-explanatory.

**Cost:** The clock is only meaningful where something expires. A refunds table that holds the deadline but does not show it leaves the window invisible on the page.

**Reference:** Jira Service Management

### Record page

**Question:** One record, and everything done to it. The frame carries a summary, at most three sections, and an aside. The decision is how to divide the page: tabs against stacked sections, and what earns the aside.

**Default:** `summary-sections-aside-for-history`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Summary with sections and history in the aside stays the pick. What defines the record runs down the main column while history supports it from the side. The Linear-style properties rail is the runner-up. Prefer it when the aside must carry editable values rather than history.

Never ship the facts-in-header variant. A dense header pushes every command below the fold on a phone and fights the trail for space.

#### `summary-sections-aside-for-history`: Summary, sections, aside for history

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Placed 8 Oct 2026, 09:32 by Garcia Interiors."
    action "Resend the confirmation"
    action "Refund"
    action primary "Message the customer"
  split 2:1
    region "The order"
      fact "Customer" "Maria Garcia"
      fact "Email" "maria@garcia-interiors.example"
      fact "Two Oak desk lamps" "EUR 90.00"
      fact "Paid by the customer" "EUR 125.00"
    aside
      region "What happened"
        timeline 3
          item: text "Paid" · text muted "8 Oct 2026, 09:34" · text muted "Card"
```

**Rationale:** What defines the record runs down the main column in at most three sections. History, which supports but does not define, goes in a narrower aside. This is the proven shape and the one the Shopify details template describes.

**Cost:** Below roughly 1000 pixels the aside stacks under the sections, so the history lands after the actions. The order is acceptable either way.

**Reference:** Shopify

#### `four-tabs-over-the-same-sections`: Four tabs over the same sections

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Active" positive
    text "What this product is, and the SKU its parcels carry."
    action "Pause selling"
    action destructive "Discontinue"
  tabs "Pricing" "Stock" "Returns" "Details"
    region "Details"
      fact "Units per pack" "1"
      fact "Stock" "412 in Amsterdam"
      fact "SKU" "LMP-OAK-01"
      action quiet "Copy"
      field "Name" text = "Oak desk lamp"
      action primary "Save"
```

**Rationale:** When a record has more facets than three sections allow, tabs divide it. The active tab is in the URL, so a link carries it.

**Cost:** The reader cannot see two facets at once, and the tab count grows with every new thing the back office adds. Carbon and GOV.UK both cap tabs at about six for this reason.

**Reference:** GOV.UK

#### `one-page-headed-sections-no-tabs`: One page, headed sections, no tabs

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock"
  header
    heading "Garcia Interiors restock"
    status "Scheduled" info
    text "Sat 14 Mar 2026, 08:00 to 12:00, Amsterdam warehouse."
    action "Reschedule"
    action primary "Add a line"
  region "When and where"
    fact "Date" "Sat 14 Mar 2026, 08:00 to 12:00"
    fact "Warehouse" "Amsterdam warehouse, 40 pallets"
    fact "Time zone" "Europe/Amsterdam"
  region "What is on the manifest"
    table 2 "Product" "Pallets" "Price"
      item: text "Oak desk lamp" · text "32 of 40" · text "EUR 45.00"
  region "Money so far"
    fact "Product sales" "EUR 54,180.00"
    fact "To settle on 4 Nov" "EUR 57,506.20"
```

**Rationale:** GOV.UK names this as the alternative to tabs: keep everything on one page separated by headings, and let the reader scan down. No state to lose, nothing to remember.

**Cost:** A record with six facets becomes a long page and the reader scrolls past the third one. The three-section ceiling is what keeps this honest.

**Reference:** GOV.UK

#### `header-carries-the-facts-sections-carry-the-commands`: Header carries the facts, sections carry the commands

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia, Garcia Interiors, 8 Oct 2026, 09:32."
    fact "Paid" "EUR 125.00"
    fact "Parcels" "2, both packed"
    fact "Method" "Card"
    fact "Refunds" "None"
    action primary "Message the customer"
    action "Resend the confirmation"
    action "Refund"
  region "Lines"
    list 2
      item: text "Oak desk lamp" · text muted "LMP-OAK-01, one unit" · status "Confirmed" positive · action "Cancel"
```

**Rationale:** The values of the record sit in the header area as a definition list, and the sections below hold only what can be done. The page separates what the record is from what it can do.

**Cost:** A dense header pushes the commands below the fold on a phone, and it competes with the trail for vertical space.

#### `timeline-as-the-page-record-as-the-aside`: Timeline as the page, record as the aside

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042" "Collection"
  header
    heading "Maria Garcia"
    text "Collected at the pickup counter at 10:41 on Sat 14 Mar 2026."
    action "Undo this collection"
  split 2:1
    region "What happened"
      timeline 5
        item: text "Collected at the pickup counter" · text muted "10:41" · text muted "Chris Novak"
    aside
      region "The order"
        fact "Product" "Oak desk lamp"
        fact "Barcode" "PKG-0C893968A2"
        fact "Order" "SO-1042"
        fact "Name on order" "Maria Garcia"
```

**Rationale:** For a record whose main interest is what happened to it, the history is the main column. The values of the record support it from the side.

**Cost:** This option is wrong for most records. An order is mostly its facts. An audit trail or a collection record is mostly its history, and the shape has to follow the record.

#### `editable-properties-in-the-rail`: Editable properties in the rail

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Placed 8 Oct 2026, 09:32 by Garcia Interiors."
    action "Resend the confirmation"
    action "Refund"
  split 2:1
    region "The customer"
      fact "Name" "Maria Garcia"
      fact "Email" "maria@garcia-interiors.example"
      fact "Country" "Netherlands"
    aside
      region "Properties"
        field "Owner" select = "Priya Shah"
        field "Follow-up" select = "Calling back"
        field "Customer note" text = "Called 8 Oct, no answer"
        action primary "Save properties"
```

**Rationale:** The Linear issue shape. The record reads down the main column while every editable property sits in the right rail, changed where it is shown. No Edit mode and no second page for one value.

**Cost:** Every property needs its own save and its own failure state, so five quick edits are five round trips. It fails where a change must be reviewed whole before anything is written.

**Reference:** Linear

#### `record-with-its-own-sub-navigation`: Record with its own sub-navigation

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock" "Schedule"
  header
    heading "Garcia Interiors restock"
    status "Scheduled" info
    text "Sat 14 Mar 2026, 08:00 to 12:00, Amsterdam warehouse."
    action "Reschedule"
    action primary "Add a line"
  split 1:3
    nav side
      link "Overview"
      link "Details"
      link "Manifest"
      link current "Schedule"
      link "Dispatch"
      link "Packing"
      link "Questions"
      link "Orders"
      link "Costs"
    region "Lines"
      table 2 "Product" "Pallets" "Price" "State"
        item: text "Oak desk lamp" · text "32 of 40" · text "EUR 45.00" · status "Active" positive
```

**Rationale:** Where a record holds six or more facets, tabs become a side navigation of links, and the current one is marked. More room for labels, and it survives a phone.

**Cost:** It takes horizontal space that a table would rather have, and a reader cannot see what is on the other pages at all.

### Form page

**Question:** Take one command's input. New-record pages are often inconsistent. One wraps its fields in a section with a left label column, while another draws bare fields with no box and no Cancel. Both are this frame.

**Default:** `one-section-one-column-of-fields-cancel-beside-save`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** One section, one column, Cancel beside Save stays the pick. A single command reads as a list of questions with one place to submit and one to leave. The GOV.UK one-question-per-screen flow is the runner-up. Prefer it when each answer changes the next question and nothing may be skipped.

Never ship the stepper for creating a product. Three steps for work that fits one page is one step too many.

#### `one-section-one-column-of-fields-cancel-beside-save`: One section, one column of fields, Cancel beside Save

```wireframe
page
  breadcrumb "Home" "Products" "New product"
  header
    heading "New product"
    text "Start with a name. Everything else can wait."
  region "New product"
    field "Name" text
    field "Description" textarea
    field "Category" select = "Choose a category"
    field "Price" text = "45.00"
    field "SKU" text = "LMP-OAK-01"
    action "Cancel"
    action primary "Create product"
```

**Rationale:** One command, one column, one place to submit and one to leave. The section is the only box, and the field labels sit above their controls so the column reads as a list of questions.

**Cost:** A long form makes a long page. Grouping into several labeled blocks keeps it scannable, at the cost of a taller page.

#### `form-section-with-the-label-in-the-left-column`: Form section with the label in the left column

```wireframe
page
  breadcrumb "Home" "Products" "New product"
  header
    heading "New product"
    text "Start with a name."
  split 1:2
    region "The product"
      text muted "The name shows on the storefront. The SKU identifies the stock."
    region "Product fields"
      field "Name" text
      field "SKU" text = "LMP-OAK-01"
  split 1:2
    region "Pricing"
      text muted "The price is what the customer pays."
    region "Pricing fields"
      field "Price" text = "45.00"
      field "Compare-at price" text = "59.00"
  region "Submit"
    action "Cancel"
    action primary "Create product"
```

**Rationale:** The labeled-block shape. Each block names itself on the left and holds its fields on the right. Several blocks read as a form with structure rather than a column of questions.

**Cost:** The left column is about 150 pixels, which wraps the explanatory line to four words per line. The same content stacked would read better.

#### `stacked-blocks-with-the-title-above`: Stacked blocks with the title above

```wireframe
page
  breadcrumb "Home" "Products" "New product"
  header
    heading "New product"
    text "Start with a name."
  region "The product"
    text muted "The name shows on the storefront. The SKU identifies the stock."
    field "Name" text
  region "Pricing"
    text muted "The price is what the customer pays."
    field "Price" text = "45.00"
    field "Compare-at price" text = "59.00"
  region "Stock"
    text muted "Which warehouse holds it."
    field "Warehouse" select = "Amsterdam warehouse"
  region "Submit"
    action "Cancel"
    action primary "Create product"
```

**Rationale:** The same labeled blocks with the title above its fields rather than beside them. The label gets the full width, so the explanatory line reads at a normal measure.

**Cost:** The page grows longer, and the reader loses the vertical alignment that helped readers scan between fields.

#### `two-columns-on-a-wide-screen`: Two columns on a wide screen

```wireframe
page
  breadcrumb "Home" "Products" "New product"
  header
    heading "New product"
    text "Start with a name. Everything else can wait."
  region "New product"
    row
      field "Name" text
      field "Category" select = "Choose a category"
    row
      field "Price" text = "45.00"
      field "SKU" text = "LMP-OAK-01"
    action "Cancel"
    action primary "Create product"
```

**Rationale:** Short fields sit side by side: price and compare-at price together, SKU and category together. One Save for the page rather than per block.

**Cost:** A long amount or a long name does not fit half a column, so the layout forces some fields to be narrower than others. Two columns suit short fields on wide screens.

#### `a-stepper-above-one-step-s-fields`: A stepper above one step's fields

```wireframe
page
  breadcrumb "Home" "Products" "New product"
  header
    heading "New product"
    text "Three steps. Two minutes, and you can stop after the first."
  tabs "The product" "The price" "Publish"
    region "The product"
      field "Name" text
      field "Category" select = "Choose a category"
      field "SKU" text = "LMP-OAK-01"
      field "Price" text = "45.00"
      action quiet "Save and close"
      action "Back"
      action primary "Continue"
```

**Rationale:** A flow with more than three linear steps gets a stepper: The product, Then the price, Then publish. Each step validates before the next one opens.

**Cost:** Carbon keeps a stepper for a linear flow of three or more steps. It has no place when the steps can be done in any order. Creating a product does not need three steps, so this is one step too many.

**Reference:** Carbon

#### `one-question-per-screen`: One question per screen

```wireframe
page
  breadcrumb "Home" "Products" "New product"
  header
    heading "What is the product called"
    text "Step 1 of 5."
  region "Name"
    field "Name" text
    text muted "Customers see this on the storefront and on their confirmation."
    action primary "Continue"
    action quiet "Back"
```

**Rationale:** The GOV.UK one-thing-per-page shape. Each answer gets the whole screen, validates before the next opens, and the Back button is the browser's own. Nothing half-filled is lost to a section the reader skipped.

**Cost:** Five screens for a form that fits one page feels slow to a returning reader. The answers cannot be reviewed together until the final check. Reserve it for flows where each answer changes the next question.

**Reference:** GOV.UK

#### `section-per-action-one-save-at-the-foot`: Section per action, one Save at the foot

```wireframe
page
  breadcrumb "Home" "Products" "New product"
  header
    heading "New product"
    text "Start with a name. Everything else can wait."
  region "The product"
    field "Name" text
    field "Description" textarea
  region "Pricing"
    text muted "EUR, including VAT."
    field "Price" text = "45.00"
    field "Compare-at price" text = "59.00"
  region "Stock"
    field "Warehouse" select = "Amsterdam warehouse"
  footer sticky
    action "Cancel"
    action primary "Create product"
```

**Rationale:** Each block is its own section with its own title and its own commands. A single sticky foot carries one Save for the whole page. The reader sees the total work of the page before committing any of it.

**Cost:** One Save means a partial failure loses the lot, and a reader who wants to save the name and leave the price cannot. Two Saves on one screen is the worse version of this problem.

### Report page

**Question:** Read figures over one period. An Acme Supply statement puts the period in the heading with August 2026 and October 2026 buttons beside it. Nothing says which is previous and which is next.

**Default:** `chevron-pair-with-the-period-as-the-heading`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The chevron pair with the period as the heading stays the pick. A reader cannot mistake a chevron for a tab. The list still allows a jump across months. The Shopify-style cards with sparklines are the runner-up. Prefer them mid-month when the question is trend rather than settlement.

Never ship the two unlabeled month buttons. Nothing says which is previous and which is next.

#### `chevron-pair-with-the-period-as-the-heading`: Chevron pair with the period as the heading

```wireframe
page
  breadcrumb "Home" "Reports" "Statements"
  header
    heading "September 2026"
    text "Every euro of the month under the kind it is."
    action quiet "Previous month"
    action quiet "Next month"
    field "Month" select = "September 2026"
    action "Download"
  region "Income"
    fact "Product sales" "EUR 54,180.00"
    fact "Shipping fees" "EUR 6,020.00"
    fact "Total income" "EUR 60,200.00"
  region "Net for Acme Supply, September 2026"
    figure "EUR 57,506.20"
  region "By warehouse"
    table 2 "Warehouse" "Net"
      item: text "Amsterdam warehouse" · text "EUR 49,686.20"
```

**Rationale:** The period is the page heading, with an unambiguous chevron on each side to step through consecutive months and a list to jump across them. A reader cannot mistake a chevron for a tab.

**Cost:** Walking months one at a time is slow when comparing a quarter, which is why the list stays.

#### `period-tabs-across-the-top`: Period tabs across the top

```wireframe
page
  breadcrumb "Home" "Reports" "Statements"
  header
    heading "Statements, September 2026"
    text "Every euro of the month under the kind it is."
  tabs "August 2026" "September 2026" "October 2026"
    region "September 2026"
      fact "Product sales" "EUR 54,180.00"
      fact "Shipping fees" "EUR 6,020.00"
      fact "Total income" "EUR 60,200.00"
  region "Net for Acme Supply, September 2026"
    figure "EUR 57,506.20"
```

**Rationale:** Months as a segmented control above the content, with the current one pressed. GOV.UK's tabs example is exactly this for comparison periods.

**Cost:** Three or four months fit and a year does not. Carbon warns tabs are wrong where the reader must compare across groups. Horizontal overflow on a phone.

**Reference:** GOV.UK

#### `dropdown-with-presets-beside-a-typeable-range`: Dropdown with presets beside a typeable range

```wireframe
page
  breadcrumb "Home" "Reports" "Revenue"
  header
    heading "Revenue"
    text "Every euro that moved, by the day it moved."
  region "Period"
    field "Range" select = "Custom"
    row
      field "From" date = "09/09/2026"
      field "To" date = "08/10/2026"
      action primary "Apply"
  region "Daily"
    image "Sales per day, bar chart for 9 Sep to 8 Oct"
    text muted "Peak 26 Sep, EUR 12,400.00"
```

**Rationale:** A range control offering Last 30 days, This month, Last month, Custom, and a pair of typeable date fields. Nothing is hidden behind the calendar.

**Cost:** Presets plus a range are two mechanisms on one control. The used preset must stay visible afterwards, or the reader loses track of the period.

#### `the-two-buttons-labeled`: The two buttons, labeled

```wireframe
page
  breadcrumb "Home" "Reports" "Statements"
  header
    heading "Statements, September 2026"
    text "Every euro of the month under the kind it is."
    action quiet "August 2026"
    action "September 2026"
    action quiet "October 2026"
    action quiet "More options"
  region "Income"
    fact "Product sales" "EUR 54,180.00"
    fact "Shipping fees" "EUR 6,020.00"
    fact "Total income" "EUR 60,200.00"
  region "Net for Acme Supply, September 2026"
    figure "EUR 57,506.20"
```

**Rationale:** Keep the two-button shape and make it legible. The pair reads Previous then next as one control around the period. That is the smallest change that removes the ambiguity.

**Cost:** Still a month at a time, and the labels still compete with the heading for attention. It treats the symptom rather than the shape.

#### `report-with-the-breakdown-as-tabs`: Report with the breakdown as tabs

```wireframe
page
  breadcrumb "Home" "Reports" "Revenue"
  header
    heading "Revenue, September 2026"
    text "Every euro that moved."
  region "The month in total"
    fact "Product sales" "EUR 54,180.00"
    fact "Shipping fees" "EUR 6,020.00"
    fact "Net for Acme Supply" "EUR 62,146.35"
  tabs "By warehouse" "By channel" "By tax rate"
    region "By warehouse"
      table 3 "Warehouse" "Income" "Net"
        item: text "Amsterdam warehouse" · text "EUR 54,000.00" · text "EUR 52,974.00"
```

**Rationale:** The statement is the report. By warehouse, By channel, and By tax rate sit as tabs beneath it. The top of the page keeps one shape whatever breakdown is chosen.

**Cost:** The reader loses the statement when they want a breakdown, and the tabs have to deep-link.

#### `cards-with-sparklines-above-the-statement`: Cards with sparklines above the statement

```wireframe
page
  breadcrumb "Home" "Reports" "Revenue"
  header
    heading "Revenue, September 2026"
    text "The trend first, then every euro under the kind it is."
  grid 3
    card "Product sales"
      figure "EUR 54,180"
      text muted "Up 12 percent on August"
      image "Product sales rising through September, sparkline"
  region "Statement for September 2026"
    fact "Product sales" "EUR 54,180.00"
    fact "Refunds" "EUR -1,550.00"
    fact "Net for Acme Supply" "EUR 57,506.20"
```

**Rationale:** Shopify's analytics shape. Three cards with sparklines name the trend before the statement names the total, so a dip is noticed before it is explained. The statement underneath keeps every euro accountable.

**Cost:** Sparklines invite trend questions the monthly statement cannot answer, and three cards push the accountable total down. Prefer it mid-month. Prefer the plain statement at settlement.

**Reference:** Shopify

#### `report-as-a-statement-with-no-separate-breakdown`: Report as a statement with no separate breakdown

```wireframe
page
  breadcrumb "Home" "Reports" "Statements"
  header
    heading "Statements"
    text "Every euro of the month under the kind it is."
  row
    action quiet "August 2026"
    action quiet "October 2026"
  region "September 2026"
    fact "Product sales" "EUR 54,180.00"
    fact "Shipping fees" "EUR 6,020.00"
    fact "Handling services" "EUR 3,150.00"
    fact "Total income" "EUR 63,350.00"
    fact "The provider fee" "EUR -1,203.65"
    figure "EUR 62,146.35"
  region "By warehouse"
    table 3 "Warehouse" "Income" "Net"
      item: text "Amsterdam warehouse" · text "EUR 54,000.00" · text "EUR 52,974.00"
```

**Rationale:** One statement and nothing else, because a statement that adds up top to bottom is the whole report. A monthly settlement page is usually close to this already.

**Cost:** It suits a monthly settlement and fails a revenue question during the month.

### Settings home

**Question:** Find one setting among many areas. A settings home can carry a whole tree: thirty routes under `/settings`, and the home page has to hold all of them.

**Default:** `grouped-links-one-line-each`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Grouped links stay the pick. Each area names what it holds. The page never grows a form. Thirty routes fit in a handful of sections. The Stripe-style left navigation is the runner-up. Prefer it once areas gain enough depth to deserve their own tree.

Never ship the frequency grouping. Readers look for a thing, not for how often they change it.

#### `grouped-links-one-line-each`: Grouped links, one line each

```wireframe
page
  breadcrumb "Home" "Settings"
  header
    heading "Settings"
    text "What Acme Supply runs on, and who can change it."
  region "The company"
    list 4
      item: text "General" · text muted "Name, address, contact details and time zone." · action "Open"
  region "Selling"
    list 3
      item: text "Order form templates" · text muted "What a customer fills in when they place an order." · action "Open"
  region "People and access"
    list 5
      item: text "Team" · text muted "5 people, 2 invitations outstanding." · action "Open"
```

**Rationale:** Each area is a link with a line saying what it holds, grouped into a handful of sections. The reader knows the area before they click and the page never grows a form.

**Cost:** Nothing states which areas are incomplete, so a new starter has to open each one. The Acme Supply home page already covers this with its setup section.

#### `cards-with-an-icon-and-a-state`: Cards with an icon and a state

```wireframe
page
  breadcrumb "Home" "Settings"
  header
    heading "Settings"
    text "What Acme Supply runs on, and who can change it."
  grid 10
    card "Payments"
      text "The provider pays into NL91 ABNA 0417 1643."
      status "Connected" positive
      action quiet "Open"
```

**Rationale:** Each area as a card with its icon, its purpose and, where it matters, its state: Payments connected, Payments not connected. The reader sees what is broken without opening anything.

**Cost:** Cards are boxes, and the design contract says a section is the only box and never nests. A grid of bordered cards on the settings home is that rule broken by twenty boxes.

#### `a-list-with-a-search-box`: A list with a search box

```wireframe
page
  breadcrumb "Home" "Settings"
  header
    heading "Settings"
    text "Every setting Acme Supply holds. Search by what it is called."
  toolbar
    field "Search settings" search
    text muted "30 settings"
  region "All settings"
    list 10
      item: text "Dock plan" · text muted "Settings, Warehouses, Docks and counters." · action "Open"
```

**Rationale:** One flat list of every setting with a search box over it. Thirty routes become one searchable index, and the reader types what they are looking for.

**Cost:** The grouping is lost, so a reader who knows the area must hunt for it. The search has to know every setting name a reader might use.

#### `grouped-by-how-often-it-is-changed`: Grouped by how often it is changed

```wireframe
page
  breadcrumb "Home" "Settings"
  header
    heading "Settings"
    text "Grouped by how often each one is changed."
  region "Changed every day or every week"
    list 3
      item: text "Dock plan" · text muted "Docks and counters for the warehouse." · action "Open"
  region "Changed every month"
    list 3
      item: text "Statements" · text muted "What settled and what did not." · action "Open"
  region "Changed once, or rarely"
    list 3
      item: text "Payments" · text muted "The connected account the provider pays into." · action "Open"
```

**Rationale:** A Daily, Monthly, and Once section. The page states that a monthly task goes in a menu. A once-only setup belongs in settings. That is the rule the page applies to itself.

**Cost:** The grouping is about frequency rather than about the thing. A reader hunting the dock plan must recall which bucket holds it.

#### `incomplete-areas-first-everything-else-beneath`: Incomplete areas first, everything else beneath

```wireframe
page
  breadcrumb "Home" "Settings"
  header
    heading "Settings"
    text "Two things are not set up. Everything else is ready."
  region "Not set up"
    list 2
      item: text "No payment account connected" · text muted "Money cannot be taken until one is." · action "Connect"
  region "Everything else"
    list 5
      item: text "General" · text muted "Name, address, contact details, time zone." · action "Open"
```

**Rationale:** Anything not yet set sits at the top with the one command that fills it. The rest of the settings follow, so the page is also the setup checklist.

**Cost:** The order changes as setup completes. That makes the page feel unstable and makes a link unreliable by position.

#### `left-navigation-with-the-area-on-the-right`: Left navigation with the area on the right

```wireframe
page
  breadcrumb "Home" "Settings" "General"
  header
    heading "General"
    text "Name, address, contact details and the time zone the whole back office works in."
    action primary "Save"
  split 1:3
    nav side
      link current "General"
      link "Locations"
      link "Warehouses"
      link "Payments"
    region "General"
      field "Company name" = "Acme Supply"
      field "Contact email" = "hello@acme-supply.example"
      field "Time zone" select = "Europe/Amsterdam"
```

**Rationale:** Stripe's settings shape. The areas live in a left navigation and the chosen area opens beside it. Thirty routes become one tree the reader scans without leaving the page. The current area is always marked.

**Cost:** An area's incompleteness stays invisible until it is opened. A phone has no room for the tree. The navigation must collapse into the grouped links of the pick.

**Reference:** Stripe

#### `a-checklist-of-what-is-left-then-a-plain-index`: A checklist of what is left, then a plain index

```wireframe
page
  breadcrumb "Home" "Settings"
  header
    heading "Settings"
    text "Two steps left, then thirty settings."
  region "Finish setting up"
    list 3
      item: text "Connect a payment account" · text muted "The provider holds the money and pays into your bank account." · action "Connect"
  region "All settings"
    list 4
      item: text "General" · text muted "Name, address, contact, time zone." · action "Open"
```

**Rationale:** The setup work and the reference work are separated: a checklist with verbs at the top, an index of every area underneath. The checklist disappears when it is done.

**Cost:** Two structures on one page, and a reader who only wants the index scrolls past a checklist they have finished.

### Editor page

**Question:** Edit what a customer sees, with a live preview beside the form. A storefront editor holds the look in a form. It shows the result in a preview card beside the form. It must carry a Cancel and a dirty state. Without them, leaving silently discards work.

**Default:** `form-left-live-preview-right-one-save`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Form left with a live preview right stays the pick. Every control writes straight into the preview. Nobody saves to find out what a change looks like. The Webflow-style floating panel is the runner-up. Prefer it when the visual dominates, such as a cover image judged at real size.

Never ship the preview-above-the-form stack. Every edit pushes the preview off screen, which defeats a live preview.

#### `form-left-live-preview-right-one-save`: Form left, live preview right, one Save

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The logo, cover, accent color and typeface customers see."
  tabs "Storefront" "Domains"
    region "Storefront"
      split 1:1
        region "The look"
          field "Drop a logo here or choose a file" file
          field "Logo description" text
          field "Typeface" select = "System"
          field "Accent color" = "#1F2937"
          action "Cancel"
          action primary "Save"
        card "Preview"
          image "Storefront preview with cover image and logo"
          heading small "Oak desk lamp"
          text "Solid oak, linen shade, ready to ship."
          action quiet "Order now"
          text muted "Acme Supply, Canal Street 12, Amsterdam"
```

**Rationale:** Every control writes straight into the preview, so the reader never saves to find out what a change looks like.

**Cost:** The preview needs a phone toggle to be trusted for a storefront. Two thirds of a 1440 screen is a lot of preview for a few fields.

#### `preview-as-a-device-frame-with-a-width-toggle`: Preview as a device frame with a width toggle

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The logo, cover, accent color and typeface customers see."
  split 1:1
    region "The look"
      field "Drop a logo here or choose a file" file
      field "Accent color" = "#1F2937"
      field "Typeface" select = "System"
      action "Cancel"
      action primary "Save"
    region "Preview"
      toolbar
        action quiet "Phone"
        action quiet "Desktop"
      card "Phone preview"
        image "Storefront preview at phone width with cover image"
        heading small "Oak desk lamp"
        text "Solid oak, linen shade."
        action quiet "Order now"
        text muted "Acme Supply"
```

**Rationale:** The preview sits in a phone or desktop frame with an explicit toggle. A storefront is judged at both widths and the form can hide half of it.

**Cost:** The device frame costs horizontal room, so the form column narrows. A toggle means one width is never visible while the other is edited.

#### `preview-above-the-form-full-width`: Preview above the form, full width

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The logo, cover, accent color and typeface customers see."
  card "Preview"
    image "Storefront preview with cover image and logo"
    heading small "Oak desk lamp"
    text "Solid oak, linen shade, ready to ship."
    action quiet "Order now"
    text muted "Acme Supply, Canal Street 12, Amsterdam"
  region "The look"
    field "Drop a logo here" file
    field "Drop a cover here" file
    field "Accent color" = "#1F2937"
    field "Typeface" select = "System"
    action "Cancel"
    action primary "Save"
```

**Rationale:** The preview is the point of the page, so it gets the top and the whole width, with the fields under it. Scrolling moves from the result to the inputs and back.

**Cost:** Every field edit pushes the preview off the screen, which defeats a live preview. Only works if the preview is sticky or the field count is tiny.

#### `preview-as-a-drawer-pulled-over-the-form`: Preview as a drawer pulled over the form

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The logo, cover, accent color and typeface customers see."
    action "Preview"
  region "The look"
    field "Drop a logo here or choose a file" file
    field "Accent color" = "#1F2937"
    field "Typeface" select = "System"
    action "Cancel"
    action primary "Save"
  drawer right
    heading small "Preview"
    text muted "As a customer sees it."
    image "Storefront preview with cover image and logo"
    heading small "Oak desk lamp"
    text "Solid oak, linen shade."
    action quiet "Close"
```

**Rationale:** The form takes the whole page and the preview opens over it as a drawer. The reader can check the result at either width without losing their place.

**Cost:** The preview is out of sight by default. A drawer over a form is a layered context for something meant to reassure.

#### `tabs-per-facet-with-the-preview-always-on-the-right`: Tabs per facet with the preview always on the right

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The logo, cover, accent color and typeface customers see."
  tabs "Branding" "Content" "Domains"
    region "Branding"
      split 1:1
        region "Brand fields"
          field "Drop a logo here or choose a file" file
          field "Accent color" = "#1F2937"
          field "Typeface" select = "System"
          action primary "Save"
        card "Preview"
          status "Unsaved changes" neutral
          image "Storefront preview with cover image and logo"
          heading small "Oak desk lamp"
          text "Solid oak, linen shade, ready to ship."
          action quiet "Order now"
          text muted "Acme Supply, Canal Street 12, Amsterdam"
```

**Rationale:** Branding, content, and delivery are tabs and the preview does not move. Each tab is a short form, so the two columns never both get long.

**Cost:** The preview shows a whole that the reader has only partly set. A tabbed editor grows a third tab here, so this is the next step rather than a change of kind.

#### `floating-settings-panel-over-a-full-bleed-preview`: Floating settings panel over a full-bleed preview

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The logo, cover, accent color and typeface customers see."
    action quiet "Hide panel"
  region "The look"
    field "Accent color" = "#1F2937"
    field "Typeface" select = "System"
    action "Cancel"
    action primary "Save"
  card "Preview"
    image "Cover image judged at real size with logo and Order now"
    heading small "Oak desk lamp"
    text "Solid oak, linen shade, ready to ship."
    action quiet "Order now"
    text muted "Acme Supply, Canal Street 12, Amsterdam"
```

**Rationale:** Webflow's shape. The preview takes the whole page and the settings float over it as a panel. A cover image is judged at real size. Closing the panel is the same as stepping back from the work.

**Cost:** The panel covers the preview it edits, and dragging it aside is awkward on a laptop trackpad. Prefer it when the visual dominates, such as a cover. Prefer side-by-side for detailed fields.

**Reference:** Webflow

#### `unsaved-changes-bar-pinned-to-the-foot`: Unsaved-changes bar pinned to the foot

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The logo, cover, accent color and typeface customers see."
  split 1:1
    region "The look"
      field "Drop a logo here or choose a file" file
      field "Accent color" = "#1F2937"
      action primary "Save"
    card "Preview"
      image "Storefront preview with cover image and logo"
      heading small "Oak desk lamp"
      text "Solid oak, linen shade, ready to ship."
      action quiet "Order now"
      text muted "Acme Supply, Canal Street 12, Amsterdam"
  footer sticky
    text "Unsaved changes, accent color."
    action quiet "Discard"
    action quiet "Preview"
    action primary "Save"
```

**Rationale:** An editor with no Cancel silently discards work on leave. A pinned bar naming what is unsaved and offering Save, Discard, and Preview solves that without a dialog on every keystroke.

**Cost:** A bar across the bottom of the page is a full-width band, which the tone rules reserve for deployment identity. It has to be neutral to stay inside the contract.

### Outcome page

**Question:** Where a flow ends: an order confirmed, a payment that failed, a link that expired. One state, one statement of what happened, one next step. Flows often end in a toast instead, so this frame states what an ending page holds.

**Default:** `one-statement-one-next-step`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** One statement with one next step stays the pick. A reader who came to learn whether it worked leaves in one glance. The GOV.UK confirmation band is the runner-up. Prefer it when the flow leaves a reference the reader must keep.

Never ship the toast-only outcome for anything the reader may need to return to. A moment is not a place.

#### `one-statement-one-next-step`: One statement, one next step

```wireframe
page
  header
    status "Sent" positive
    heading "EUR 45.00 is on its way back to Maria Garcia"
    text "Refunds reach the bank in one to three working days. The lamp on order SO-1042 returns to stock."
    action quiet "Back to orders"
    action "Email the customer"
    action primary "Open order SO-1042"
  region "What happened"
    fact "Order" "SO-1042"
    fact "Customer" "Maria Garcia, maria@garcia-interiors.example"
    fact "Amount" "EUR 45.00"
    fact "Refunded by" "Priya Shah, 8 Oct 2026 at 11:04"
    fact "Method" "Back to the account it came from"
```

**Rationale:** What happened in the heading, what it means in one line, and exactly one primary action. A reader who came to find out whether it worked leaves in one glance.

**Cost:** Saying nothing about what comes next makes the page a dead end unless the one action is right. Nothing else is offered, so a wrong guess is expensive.

#### `outcome-with-the-record-it-changed`: Outcome with the record it changed

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "EUR 45.00 is on its way back to Maria Garcia"
    text "The lamp on this order returns to stock."
    action "Email the customer"
  region "The refund"
    fact "Order" "SO-1042"
    fact "Amount" "EUR 45.00"
    fact "Sent" "8 Oct 2026, 11:04"
    fact "By" "Priya Shah"
  region "The order now"
    fact "Product and handling" "EUR 125.00"
    fact "Refunded" "EUR -45.00"
    figure "EUR 80.00"
```

**Rationale:** The same statement, then the record underneath. A reader who wants the full picture does not leave the page and lose the outcome.

**Cost:** The page stops being an outcome and becomes a record page with an unusual header. The flow's end then reads like its middle.

#### `refusal-outcome-that-names-the-fix`: Refusal outcome that names the fix

```wireframe
page
  header
    status "Refused" critical
    heading "The refund window has closed"
    text "This payment method refunds only within 180 days of the payment. This one is 214 days old."
    action quiet "Back to order SO-1042"
    action primary "Offer credit instead"
  region "What you can do"
    list 2
      item: text "Offer the customer credit" · text muted "A credit against a future order, paid for by Acme Supply." · action "Offer credit"
```

**Rationale:** The same frame carries the refusal tone. The primary action is the one that resolves it: not Back, but the refused command.

**Cost:** Every refusal needs a differently-worded fix, and one that does not have one has to fall back to explaining itself.

#### `outcome-as-a-confirmation-with-a-reference`: Outcome as a confirmation with a reference

```wireframe
page
  header
    status "Sent" positive
    heading "Chris Novak has been invited as warehouse lead"
    text "They can accept from the message. The invitation runs out on 22 Oct 2026."
  region "The invitation"
    fact "Sent to" "chris@acme-supply.example"
    fact "Expires" "22 Oct 2026"
    fact "Role" "Warehouse lead"
    fact "Invitation reference" "INV-4F82C1A9"
    action quiet "Copy the invitation reference"
  footer
    action quiet "Back to team"
    action quiet "Invite somebody else"
    action primary "Open the team"
```

**Rationale:** Some flows leave the back office entirely, such as an invitation. Then the outcome carries a copyable reference and says where to go next.

**Cost:** A reference is an identifier, and the design contract says an identifier on screen must be labeled and copyable rather than bare.

#### `outcome-with-a-checklist-of-what-is-left`: Outcome with a checklist of what is left

```wireframe
page
  header
    status "Published" positive
    heading "Oak desk lamp is published"
    text "The storefront shows it at EUR 45.00 and the 412 in stock are ready to sell."
  region "Three things this product still needs"
    list 3
      item: text "No photos" · text muted "Three slots, all empty. Customers see a placeholder." · action "Add photos"
  footer
    action primary "Open Oak desk lamp"
```

**Rationale:** A command sometimes settles one thing and leaves three. Then the outcome page lists them, so the flow does not end with silent work outstanding.

**Cost:** This stops being an outcome page and becomes a work page. The floor plan boundary blurs, and the one-glance property that makes an outcome page good is lost.

#### `confirmation-band-with-the-reference-inside`: Confirmation band with the reference inside

```wireframe
page
  card "Refund sent"
    text "Order SO-1042"
    heading small "EUR 45.00 is on its way back to Maria Garcia"
  region "What happened"
    fact "Amount" "EUR 45.00"
    fact "Customer" "Maria Garcia, maria@garcia-interiors.example"
    fact "Refunded by" "Priya Shah, 8 Oct 2026 at 11:04"
    fact "Method" "Back to the account it came from"
  footer
    action quiet "Back to orders"
    action primary "Open order SO-1042"
```

**Rationale:** GOV.UK's confirmation panel. A green band carries the outcome and the reference together, so the one thing to keep is the one thing that stands out. Everything below it is supporting detail.

**Cost:** The band works for success and only success. A refusal in the same shape would read as approval. Reserve it for flows that leave a reference behind. Never use it as a generic end screen.

**Reference:** GOV.UK

#### `outcome-as-a-toast-with-the-record-in-place`: Outcome as a toast with the record in place

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every order across your customers, newest first."
  toolbar
    field "Search orders" search
    field "State" select = "Any state"
  region "Orders"
    table 3 "Order" "Placed" "Paid"
      item: text "SO-1042" · text "8 Oct 2026, 09:32" · text "EUR 125.00"
  toast positive "EUR 45.00 is on its way back to Maria Garcia"
```

**Rationale:** No new page at all. The command succeeds, the record updates in place, and a toast names what happened. The reader never loses their position.

**Cost:** Carbon and Material both warn against transient-only routes. An outcome a reader may need to return to must be a place, not a moment.

**Reference:** Carbon

### Live operations page

**Question:** Dispatch day is happening: the docks are open, scanners are reading, and the warehouse lead needs the count at a glance. The decision is what earns the glance: the total, the per-dock split, or only the exceptions.

**Default:** `the-count-the-docks-the-exceptions`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The count with docks and exceptions stays the pick. The warehouse lead reads one number first. Then comes the per-dock split, then only what needs a person. The exceptions-only wall is the runner-up. Prefer it on the wall display once the day is steady and the count is already known.

Never ship the timeline as the main view. A list of six hundred dispatches is a log, not a page.

#### `the-count-the-docks-the-exceptions`: The count, the docks, the exceptions

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock" "Dispatch"
  header
    heading "Garcia restock dispatch, live"
    status "Live" positive
    text "Sat 14 Mar 2026, 08:00 to 12:00, Amsterdam warehouse."
    action quiet "End dispatch"
  region "Dispatched"
    figure "554 of 840 parcels"
    text muted "66 percent dispatched"
  grid 4
    card "Dock 1 and 2"
      figure "210"
      text muted "Parcels, Chris Novak"
  region "Needs somebody"
    list 2
      item: text "One parcel scanned at two docks" · text muted "PKG-0C893968A2, read at 09:40 and 09:41." · status "Check it" caution · action "Open"
```

**Rationale:** One number first, then the per-dock split, then only what needs a person. The warehouse lead reads the count in one glance and reaches the exceptions without scrolling past the day's log.

**Cost:** Three structures on one page, and the exceptions sit below the docks on a phone. That order still reads correctly.

#### `per-dock-cards-with-a-rate`: Per-dock cards with a rate

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock" "Dispatch"
  header
    heading "Garcia restock dispatch, live"
    status "Live" positive
    text "554 parcels dispatched of 840 scheduled."
    action quiet "End dispatch"
  grid 4
    card "Dock 1 and 2"
      figure "210"
      text muted "38 percent of the day"
      text muted "88 in the last hour"
  region "Needs somebody"
    list 1
      item: text "Dock 3 scanner is offline" · text muted "Last sync 10:10, scans queue on the device." · status "Offline" critical · action "Open"
```

**Rationale:** Each dock carries its count, its share of the day, and its last-hour rate, the way Datadog draws per-host cards. A slow dock is visible as a number, not as a feeling.

**Cost:** Four cards with three figures each is twelve numbers before the exceptions. The warehouse lead gets diagnosis, not a glance.

**Reference:** Datadog

#### `dispatches-as-a-timeline`: Dispatches as a timeline

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock" "Dispatch"
  header
    heading "Garcia restock dispatch, live"
    status "Live" positive
    text "554 dispatched. The newest first."
    action quiet "Pause the feed"
  region "Today"
    text muted "The last 5 of 559 entries today."
    timeline 5
      item: text "Maria Garcia collected at the pickup counter" · text muted "10:41, Chris Novak." · status "Collected" positive
```

**Rationale:** The day reads newest first: dispatches, double reads, and connection drops in one place, the way PagerDuty draws an incident timeline. Nothing is grouped away from the reader.

**Cost:** Six hundred dispatches do not fit a timeline, so the page shows the last five and a count of the rest. The count is the page and the timeline is decoration.

**Reference:** PagerDuty

#### `exceptions-only-quiet-otherwise`: Exceptions only, quiet otherwise

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock" "Dispatch"
  header
    heading "Garcia restock dispatch, live"
    status "Live" positive
    text "554 dispatched of 840 scheduled. Nothing needs somebody."
  region "The docks are clear"
    text "554 dispatched across 4 docks. The next exception appears here."
  region "Earlier today"
    list 1
      item: text "Dock 3 scanner was offline" · text muted "10:10 to 10:40, 41 scans queued, all synced." · status "Resolved" positive
```

**Rationale:** The page promises silence: the count in the header, and below it only what needs a person. A warehouse lead who trusts the scanners reads one line and puts the phone away.

**Cost:** When nothing needs anybody the page is nearly empty, and an empty page on a wall display reads as broken. It needs the count to prove it is alive.

#### `full-screen-count-for-the-wall-display`: Full-screen count for the wall display

```wireframe
page
  header
    status "Live" positive
    heading "554"
    text "Parcels of 840 dispatched."
    text muted "Garcia restock, Sat 14 Mar 2026, Amsterdam warehouse."
    status "1 needs somebody" caution
    action primary "Open the exceptions"
```

**Rationale:** A wall display carries one number and the exceptions count beside it. No navigation, no commands, nothing to misread from three metres away.

**Cost:** A display is not a workplace: nothing can be opened, decided or closed from it. It answers how many, and every other question needs a phone.

#### `split-dispatches-left-incidents-right`: Split: dispatches left, incidents right

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock" "Dispatch"
  header
    heading "Garcia restock dispatch, live"
    status "Live" positive
    text "554 dispatched of 840 scheduled."
    action quiet "End dispatch"
  split 1:1
    region "Dispatches by hour"
      fact "08:00, start" "204"
      fact "09:00" "210"
      fact "10:00" "128"
      fact "11:00, so far" "12"
    region "Incidents"
      list 2
        item: text "One parcel scanned at two docks" · text muted "PKG-0C893968A2, 10:40." · status "Check it" caution · action "Open"
```

**Rationale:** The dispatch story and the incidents story sit side by side, the way GitHub draws a deploy beside its checks. Either column can be read without the other.

**Cost:** Below a laptop the columns stack and the incidents land under the dispatch log. The stacking order has to put incidents first on a phone.

**Reference:** GitHub

### Calendar or schedule page

**Question:** Ninety-three deliveries ahead need a shape that answers when, not what. The decision is density: a grid that shows the month against a list that shows the next delivery.

**Default:** `month-grid-with-deliveries-marked`

**Compact:** Seven columns do not fit a phone. The agenda list is the phone shape, with each day as a date chip beside its deliveries. The compact option is `agenda-grouped-by-day`.

**Rationale:** The month grid stays the pick: ninety-three deliveries ahead need density, and the grid shows the month the list cannot. The agenda list is the runner-up. Prefer it on a phone, where seven columns become unreadable whichever way they are drawn. Never ship the week lanes as the default. Two warehouses fit, and the third warehouse breaks the shape.

#### `month-grid-with-deliveries-marked`: Month grid with deliveries marked

```wireframe
page
  breadcrumb "Home" "Orders" "Schedule"
  header
    heading "March 2026"
    text "3 deliveries across 2 warehouses."
    action quiet "‹ Previous month"
    action quiet "Next month ›"
  region "March 2026"
    text muted "Sun Mon Tue Wed Thu Fri Sat"
    grid 35
      item: text "14" · status "Garcia restock" positive
```

**Rationale:** The month at a glance, with each delivery sitting on its date. Google Calendar's shape, and the only one where a clash between two deliveries is visible without opening either.

**Cost:** Seven columns are hard to read on a phone, and a date with three deliveries shows three clipped pills. The agenda is the honest phone shape.

**Reference:** Google Calendar

#### `agenda-grouped-by-day`: Agenda grouped by day

```wireframe
page
  breadcrumb "Home" "Orders" "Schedule"
  header
    heading "Schedule"
    text "The next deliveries, soonest first."
    action primary "New delivery"
  region "Sat 14 Mar 2026"
    list 1
      item: text "Garcia Interiors restock" · text muted "08:00 to 12:00 · Amsterdam warehouse" · status "Active" positive · action "Open"
  region "Sat 21 Mar 2026"
    list 1
      item: text "Becker Bouw restock" · text muted "08:00 to 12:00 · Rotterdam warehouse" · status "Scheduled" info · action "Open"
  region "Sat 28 Mar 2026"
    list 1
      item: text "Okafor Office delivery" · text muted "08:00 to 12:00 · Rotterdam warehouse" · status "Scheduled" info · action "Open"
```

**Rationale:** Each day is a date chip with its deliveries beside it, the way Apple Calendar draws the list view. The reader scrolls time itself rather than paging through it.

**Cost:** Empty days still take a row or the rhythm breaks, so a quiet month is mostly scrolling. The grid shows the quiet month better.

**Reference:** Apple Calendar

#### `week-lanes-per-warehouse`: Week lanes per warehouse

```wireframe
page
  breadcrumb "Home" "Orders" "Schedule"
  header
    heading "Week 11 · 9 to 15 Mar"
    text "One lane per warehouse. A block is a delivery."
    action quiet "‹ Previous week"
    action quiet "Next week ›"
  region "Amsterdam warehouse"
    text muted "Mon Tue Wed Thu Fri Sat Sun"
    text "Garcia restock · Sat · 32 of 40 pallets"
  region "Rotterdam warehouse"
    text muted "Mon Tue Wed Thu Fri Sat Sun"
    text "Becker restock · Sat · 12 of 40 pallets"
```

**Rationale:** Each warehouse gets a lane and each delivery a block on its days, the way Float draws allocations. A clash at one warehouse is a visible overlap, not a second page.

**Cost:** Two warehouses fit. The third warehouse breaks the shape, and a phone has no room for lanes at all. Only honest for a company with few warehouses.

**Reference:** Float

#### `upcoming-list-with-a-state-filter`: Upcoming list with a state filter

```wireframe
page
  breadcrumb "Home" "Orders" "Schedule"
  header
    heading "Schedule"
    text "93 deliveries ahead, soonest first."
    action primary "New delivery"
  toolbar
    field "Search deliveries" search
    field "State" select = "Any state"
    action "Export"
  region "Deliveries"
    table 3 "Delivery" "Date" "State"
      item: text "Garcia Interiors restock" · text "Sat 14 Mar 2026" · status "Active" positive
  row
    text muted "1 to 25 of 93"
    action quiet "Next ›"
```

**Rationale:** The schedule as a plain list page: search, one state filter, one table. Nothing to learn, and the toolbar matches the one an Acme Supply order list uses.

**Cost:** A list answers what, not when: dates read as text and the shape of the month is invisible. It is fine for ten deliveries and wrong for ninety-three.

#### `mini-month-beside-the-day`: Mini month beside the day

```wireframe
page
  breadcrumb "Home" "Orders" "Schedule"
  header
    heading "Sat 14 Mar 2026"
    text "One delivery, with the month beside it."
    action primary "New delivery"
  split 1:2
    region "March 2026"
      text muted "S M T W T F S"
      grid 31
        item: text "14"
    region "Garcia Interiors restock"
      fact "Window" "08:00 to 12:00"
      fact "Warehouse" "Amsterdam warehouse"
      fact "Pallets" "32 of 40"
      action "Open delivery"
      action "Open dispatch"
```

**Rationale:** Outlook's shape: a small month for orientation, the chosen day in full beside it. The reader never loses the month while reading the delivery.

**Cost:** Two structures need two selections that must agree, and on a phone the mini month stacks above the day it orients. It is twice the page for one delivery.

**Reference:** Outlook

#### `next-30-days-as-a-week-strip`: Next 30 days as a week strip

```wireframe
page
  breadcrumb "Home" "Orders" "Schedule"
  header
    heading "Next 30 days"
    text "9 Mar to 7 Apr 2026 · 3 deliveries."
    action primary "New delivery"
  region "The next four weeks"
    list 4
      item: text "Week 11 · Garcia restock, Sat 14 Mar" · text muted "32 of 40 pallets"
```

**Rationale:** Four weeks as four rows with their deliveries named inside, the way Airbnb draws payout weeks. The reader sees the rhythm of the month without learning a grid.

**Cost:** Weeks are not months. A delivery on the 31st falls off the strip, and the strip must restate its range on every reading.

**Reference:** Airbnb

### Onboarding or setup page

**Question:** A new company has an account and nothing else. The decision is how much the page does. A checklist waits, a wizard leads, and a single page states the three steps and gets out of the way.

**Default:** `checklist-with-a-progress-bar`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The checklist with a progress bar stays the pick: it states the three steps, shows which is done, and waits without leading. The stepper wizard is the runner-up. Prefer it when a step cannot be skipped and the next depends on the last. Never ship the single page with a Save per section: three saves for a first run is three chances to leave half set up.

#### `checklist-with-a-progress-bar`: Checklist with a progress bar

```wireframe
page
  breadcrumb "Home" "Set up"
  header
    heading "Set up Acme Supply"
    text "Three steps between a company and a first sale."
  region "Before you can take money"
    text muted "1 of 3 steps done."
  region "Create a company"
    status "Done" positive
    text "Acme Supply, Amsterdam."
  region "Connect a payment account"
    status "Current" info
    text "The provider holds the money for you."
    action primary "Connect"
  region "Publish a storefront"
    status "Open" neutral
    text "Your own address, so customers order where you send them."
    action "Set up"
```

**Rationale:** Three steps with a done, current and open marker, and a bar that says how far along the company is. Shopify's setup shape: the page waits, and each step opens its own command.

**Cost:** A checklist can be ignored, and a reader who skips the payment step owns a back office that cannot take money. The home page's setup section has to repeat the warning.

**Reference:** Shopify

#### `stepper-wizard-one-step-open`: Stepper wizard, one step open

```wireframe
page
  breadcrumb "Home" "Set up"
  header
    heading "Set up Acme Supply"
    text "Step 2 of 3. Two minutes, and you can stop after this one."
  region "Steps"
    text muted "1 The company done · 2 Payments current · 3 Storefront open"
  region "Connect a payment account"
    field "Business number" text
    field "Payout account" text
    action primary "Connect the provider"
    action "Back"
```

**Rationale:** One step open at a time with a stepper above it, the way Stripe draws onboarding. Each step validates before the next opens, so nothing half-filled is ever left behind.

**Cost:** A wizard leads, which means it also blocks: the reader cannot add a product until the wizard is done. Wrong when the steps are independent.

**Reference:** Stripe

#### `setup-beside-the-guide`: Setup beside the guide

```wireframe
page
  breadcrumb "Home" "Set up"
  header
    heading "Set up Acme Supply"
    text "Three steps. What each one needs is beside it."
  split 1:1
    region "The steps"
      list 3
        item: status "Done" positive · text "Create a company" · action "Connect"
    region "What each step needs"
      fact "Payments" "A business number and a bank account."
      fact "Storefront" "A logo and a cover image."
```

**Rationale:** The steps on the left, what each step needs on the right, the way Notion draws setup beside its guide. The reader sees what a step costs before starting it.

**Cost:** The guide duplicates the help text inside each step's own command, so two pages must agree about what the provider asks for. The copy drifts.

**Reference:** Notion

#### `start-from-a-template`: Start from a template

```wireframe
page
  breadcrumb "Home" "Set up"
  header
    heading "What is the first shipment?"
    text "The template sets the lines. Everything stays editable."
  region "Templates"
    list 3
      item: text "Restock" · text muted "Pallet quantities, one warehouse, scheduled" · action "Choose"
  row
    action quiet "Skip"
    action primary "Continue"
```

**Rationale:** Starting from a template names what the first shipment is before anything else, and the template sets the lines to match. Everything stays editable after the choice.

**Cost:** A template is a guess about the shipment, and a wrong guess sets lines nobody reads. Templates must stay visibly editable, never silently applied.

#### `one-page-one-section-per-step`: One page, one section per step

```wireframe
page
  breadcrumb "Home" "Set up"
  header
    heading "Set up Acme Supply"
    text "Everything on one page. Save each step as you finish it."
  region "The company"
    status "Done" positive
    field "Company name" text = "Acme Supply"
    action "Save"
  region "Payments"
    field "Business number" text
    field "Payout account" text
    action primary "Connect the provider"
  region "Storefront"
    field "Storefront address" text = "acme-supply"
    action "Publish"
```

**Rationale:** All three steps open on one page, each with its own Save, the way WordPress draws settings. The reader sees the total work before committing any of it.

**Cost:** Three saves for a first run is three chances to leave half set up. A reader who saves the name and leaves owns a back office that cannot take money.

**Reference:** WordPress

#### `book-help-instead-of-reading`: Book help instead of reading

```wireframe
page
  breadcrumb "Home" "Set up"
  header
    heading "Set up Acme Supply"
    text "Ten minutes alone, or fifteen with the support team."
  region "Three steps to a first sale"
    text "Connect a payment account, publish a storefront, add a product."
    action primary "Start with payments"
  region "Rather talk it through"
    list 2
      item: text "Book a setup call" · text muted "Fifteen minutes, on a day you choose" · action "Book"
    link "Read the setup guide"
```

**Rationale:** Setup as a conversation: the page offers a setup call beside the self-serve path, the way Shopify draws onboarding help. A reader who is stuck gets a person, not a longer page.

**Cost:** A call is the most expensive control on the page, and it only helps in office hours. The self-serve path must still work alone at midnight.

**Reference:** Shopify

### Error or not-found page

**Question:** Something is missing, broken or refused. The decision is how much the page owns: a dead end with links back, or a working page that names the fix and offers it.

**Default:** `centered-not-found-with-links-back`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The centered not-found with links back stays the pick: it says what happened, says where to go, and does both in one glance. The permission refusal with the fix is the runner-up. Prefer it whenever the page knows who can resolve it, because Back is not a fix. Never ship the inline error alone for a missing page. A retry button on a page that will never exist is a promise that cannot be kept.

#### `centered-not-found-with-links-back`: Centered not-found with links back

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "This page is not here"
    text muted "404 · /products/oak-desk-lamp/dock-plan"
    text "It may have been moved, or the address may be wrong. The product and its orders are untouched."
  region "Where to go"
    action primary "Back to home"
    action "Open orders"
```

**Rationale:** What happened, where to go, in one glance: the code, one line, and the two places the reader most likely wanted. GitHub's 404 shape, minus the joke.

**Cost:** A dead end is still a dead end: the reader loses whatever they were doing. It must at least keep the navigation, so the way back is one click.

**Reference:** GitHub

#### `inline-error-with-a-retry`: Inline error with a retry

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every order across your customers, newest first."
  message "The orders did not load. The connection dropped at 11:04." critical
  action "Try again"
  region "Orders"
    table 3 "Order" "Customer" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
```

**Rationale:** The page keeps its frame and names what failed inside it, the way Vercel draws a failed deploy beside the project. The reader keeps their place and retries from it.

**Cost:** A retry button promises the retry can work. Where the failure is permanent, the button is a lie told twice.

**Reference:** Vercel

#### `full-page-outage-with-the-state-named`: Full-page outage with the state named

```wireframe
page
  header
    heading "Payments cannot be taken right now"
    text "Payment provider · since 11:04."
  region "What still works"
    text "Placed orders stay valid and dispatch keeps working."
    action "Read the status"
  region "What to do"
    action primary "Try again"
```

**Rationale:** When a provider is down, the page says which one, what still works and what does not. The status-page shape, as Stripe draws it: the failure is named, so the reader stops guessing.

**Cost:** A full page for a partial failure hides what still works. Only honest when the failure truly blocks the page.

**Reference:** Stripe

#### `permission-refusal-with-the-fix`: Permission refusal with the fix

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "Your role cannot do this"
    text "Refunds sit with Finance. Nothing was changed."
  message "Support can read orders and message customers. Only Finance can issue a refund." neutral
  region "What you can do"
    list 2
      item: text "Ask Sam Rivera to grant Finance" · text muted "They own Acme Supply" · action "Ask"
    link "Read what your role may do"
  footer
    action quiet "Back to order SO-1042"
```

**Rationale:** A refusal worded from its code, with the one command that resolves it beside it. The page knows Jordan cannot refund and knows Sam Rivera can grant it, so it says both.

**Cost:** Every refusal needs its own fix, and one without a fix falls back to explaining itself. The fix must be a command, never a longer paragraph.

#### `expired-invitation-with-the-next-step`: Expired invitation with the next step

```wireframe
page
  breadcrumb "Home" "Settings" "Team"
  header
    heading "This invitation ran out on 22 Oct 2026"
    text "Chris Novak can be invited again. The old link stays dead."
    action primary "Invite Chris Novak again"
  region "The invitation"
    fact "Sent to" "chris@acme-supply.example"
    fact "Role" "Warehouse lead"
    fact "Reference" "INV-4F82C1A9"
    action quiet "Copy the reference"
  footer
    action quiet "Back to team"
```

**Rationale:** An expired link names its expiry and offers the re-invite beside it, the way Slack draws expired invites. The old link stays dead. The fix is one step, not a search.

**Cost:** The page must know who the invitation was for after it expired, which means expired invitations are kept, not deleted. Retention with a reason.

**Reference:** Slack

#### `warehouse-scanner-is-offline`: Warehouse scanner is offline

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock" "Dispatch"
  header
    heading "Dock 3 · offline"
    text "Scanning continues. Everything queues on the device."
    action primary "Try to reconnect"
  message "The connection dropped at 10:10. Scans queue here and sync when it returns." caution
  region "On this device"
    fact "Queued scans" "41"
    fact "Last sync" "10:10"
    fact "Device" "Dock 3 · Chris Novak"
    fact "Battery" "78%"
```

**Rationale:** The offline dock keeps scanning and says so: what is queued, when it last synced, and that nothing is lost. The page reports a state, not a failure.

**Cost:** Offline confidence must be earned: the queued count has to be exact, or the first discrepancy teaches the warehouse to distrust the page.

### Record drawer

**Question:** Read a record without leaving the list. It exists so a reader can compare a row against what the row actually holds. The constraint is width: a 420-pixel drawer inside a 1440 screen holds facts and nothing else.

**Default:** `drawer-beside-the-list-read-only`

**Compact:** At 390 pixels there is no beside. The drawer takes the whole screen with a Back control that returns to the list at the same scroll position. The compact option is `phone-width-drawer-becomes-a-full-page`.

**Rationale:** The read-only drawer beside the list stays the pick: the list context is the whole reason to use a drawer, so nothing covers it. The inline detail band is the runner-up. Prefer it when the record is four facts and the comparison must sit inside the table. Never ship the drawer holding an edit. Repeatable work in a narrow overlay gives two nested control sets in one thin column.

#### `drawer-beside-the-list-read-only`: Drawer beside the list, read-only

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every order across your customers, newest first."
  toolbar
    field "Order number, name or email" search
    field "State" select = "Any state"
  split 1:1
    region "Orders"
      table 5 "Order" "Customer" "Paid"
        item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
    region "SO-1042"
      status "Paid" positive
      fact "Customer" "Maria Garcia"
      fact "Placed" "8 Oct 2026, 09:32"
      fact "Paid" "EUR 125.00"
      action "Resend"
      action "Refund"
      link "Open the full record"
```

```wireframe compact
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    action quiet "‹ All orders"
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock."
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
  region "What was ordered"
    fact "Oak desk lamp, 2 pcs" "EUR 90.00"
    fact "Pallet handling" "EUR 30.00"
    fact "Shipping" "EUR 5.00"
    fact "Paid" "EUR 125.00"
```

**Rationale:** The list stays on screen and the drawer carries the record's facts and its few commands. The list context is the whole reason to use a drawer, so nothing covers it.

**Cost:** A phone has no room for two columns, so the drawer becomes a full-screen page. The same route then has two layouts to verify.

#### `drawer-over-the-list-as-an-overlay`: Drawer over the list as an overlay

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every order across your customers, newest first."
  toolbar
    field "Order number, name or email" search
    field "State" select = "Any state"
  region "Orders"
    table 5 "Order" "Customer" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
  drawer right "SO-1042"
    status "Paid" positive
    text "Placed 8 Oct 2026, 09:32."
    fact "Customer" "Maria Garcia"
    fact "Paid" "EUR 125.00"
    action "Refund"
    action primary "Open the record"
```

**Rationale:** The drawer slides over the table with a scrim. It gives the record more width than a column allows, while the list stays identifiable behind it.

**Cost:** Atlassian's panel guidance puts the panel beside the main area and only over it at 1024 and below. Overlaying at 1440 hides the row the reader is comparing against.

**Reference:** Atlassian

#### `row-expands-inline-into-a-detail-band`: Row expands inline into a detail band

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every order across your customers, newest first."
  toolbar
    field "Order number, name or email" search
    field "State" select = "Any state"
  region "Orders"
    table 4 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  region "SO-1042 keeps its row open"
    fact "Placed" "8 Oct 2026, 09:32"
    fact "Method" "Card"
    fact "Lines" "3, all confirmed"
    action "Resend the confirmation"
    action "Refund"
```

**Rationale:** The record opens under its own row inside the table. Nothing is overlaid and nothing moves, so the comparison the reader came for is right there.

**Cost:** A wide record cannot fit under a row without breaking the column grid. Readers open several bands and never close them, as NN/g reports.

**Reference:** NN/g

#### `drawer-holding-a-small-edit-list-behind-it`: Drawer holding a small edit, list behind it

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every order across your customers, newest first."
  region "Orders"
    table 4 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  drawer right "SO-1042"
    text muted "Change one thing. The customer sees nothing of this."
    field "Customer note" textarea
    field "Internal state" select = "No answer needed"
    action "Cancel"
    action primary "Save note"
```

**Rationale:** The drawer carries a record and a short edit beside it, which is the one case where editing in place beats leaving the list.

**Cost:** Carbon says a modal is not for repeatable work, and this is repeatable work. The screen gets two nested sets of controls and one narrow column.

**Reference:** Carbon

#### `drawer-as-a-preview-closing-back-to-the-same-row`: Drawer as a preview, closing back to the same row

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every order across your customers, newest first."
  split 1:1
    region "Orders"
      table 4 "Order" "Customer" "Paid"
        item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
    region "SO-1042 preview"
      fact "Lines" "Oak desk lamp, 2 pcs"
      fact "Shipping" "Tracked · EUR 5.00"
      timeline 3
        item: text "Paid" · text muted "8 Oct 2026, 09:32" · text muted "Maria Garcia"
      link "Open the full record"
```

**Rationale:** A narrow drawer that shows only what the row cannot: the lines, the timeline, the last three things. The record link opens the full page for anything more.

**Cost:** The reader has to know when the drawer is enough. One more place to judge, and the difference between it and the record page has to show at a glance.

#### `drawer-with-timeline-and-reply-box`: Drawer with timeline and reply box

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every order across your customers, newest first."
  split 1:1
    region "Orders"
      table 3 "Order" "Customer" "Paid"
        item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
    region "Order SO-1042"
      timeline 3
        item: text "Maria asked where her order is" · text muted "8 Oct, 10:12" · text muted "Support inbox"
      field "Reply to Maria Garcia" textarea
      action primary "Send"
```

**Rationale:** Intercom's conversation shape. The drawer carries the timeline above and a reply box below, so reading and answering happen in the same place. The list behind stays the queue to return to.

**Cost:** A reply box invites a hasty message from a narrow column, and a long timeline pushes the box out of reach. Prefer it for message-first work, never for records whose facts need the width.

**Reference:** Intercom

#### `phone-width-drawer-becomes-a-full-page`: Phone width, drawer becomes a full page

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    action quiet "‹ All orders"
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock."
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
    fact "Country" "Netherlands"
  region "What was ordered"
    fact "Oak desk lamp, 2 pcs" "EUR 90.00"
    fact "Pallet handling" "EUR 30.00"
    fact "Shipping" "EUR 5.00"
    fact "Paid" "EUR 125.00"
  footer
    action primary "Refund this order"
```

**Rationale:** At 390 pixels there is no beside. The drawer takes the whole screen. A Back control returns to the list at the same scroll position.

**Cost:** The list has to be kept alive behind the full-screen view, which is a navigation model rather than a layout. A real Back is the honest version of this.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/patterns/page-frames#name-the-page-in-one-heading | guidance | Does every built screen of this kind keep this rule, including in its compact layout? |
| litespec/frontend/patterns/page-frames#show-one-primary-action-in-a-page-frame | guidance | Does every built screen of this kind keep this rule, including in its compact layout? |
| litespec/frontend/patterns/page-frames#home-page | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/page-frames#list-page | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/page-frames#queue | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/page-frames#record-page | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/page-frames#form-page | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/page-frames#report-page | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/page-frames#settings-home | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/page-frames#editor-page | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/page-frames#outcome-page | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/page-frames#live-operations-page | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/page-frames#calendar-or-schedule-page | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/page-frames#onboarding-or-setup-page | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/page-frames#error-or-not-found-page | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/page-frames#record-drawer | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
