# List and Table Patterns

## Intent

A back-office list shows many records of one kind, such as orders, so a reader can find one record, compare rows, and act on them. This page holds the patterns for those lists: columns, sorting, filters, row density, selection, paging, row actions, table states, status, money, export, search, grouping, expansion, pinning, cards, and phone layout. A team building a list screen starts from these patterns, an owner picks an option from the drawings, and the team records the choice in its pattern catalog, the file holding the project's interface decisions. One shared set of answers keeps every list in the product behaving the same way, so a reader who learns one list knows them all.

## Concepts

### How to read a pattern

Each pattern answers one recurring question about lists, such as which columns a table shows. It states the question, the default option a project builds, how the default behaves on a narrow screen, and why the default won. Each option then shows one wireframe drawing with its own rationale, cost, and optional reference. A project records its choice in its pattern catalog and builds the chosen option with its own components. The [UI patterns](../patterns.md) page states the catalog contract and the wireframe language.

### The running example

The drawings on this page use the Acme Supply orders list: 268 orders across many customers and deliveries, with order 7K4Q2M for Maria Garcia as one row. Filters, sorting, and paging narrow that list, and the money column shows amounts such as EUR 125.00. The Standards section states the two rules every option keeps: the list view lives in the address, and money columns align right with their currency.

## Standards

### Keep a list's view in its address

**Statement:** A list MUST keep its filters, sort order, and page in the URL.

**Rationale:** A view kept in the address survives the back button, a refresh, and a pasted link, so all three return to the same rows. Without it, opening one record loses the filters the reader set, and a link sent to a colleague opens the unfiltered first page instead of the rows under discussion.

### Align money to the right with its currency

**Statement:** A table MUST right-align a money column and show the currency of every amount in it.

**Rationale:** Right alignment lines up place value down the column, so a reader compares hundreds against thousands without reading each figure digit by digit. A currency on every amount keeps EUR 125.00 distinct from a bare 125.00, so an export or a screenshot never leaves finance guessing which money it shows.

## Patterns

### Choosing the columns

**Question:** Which columns does the orders table show. The reader picks rows by order, customer, date, state, and money. The delivery name sits under the order code as a second line.

**Default:** `five-columns-nothing-removable`

**Compact:** The recommended option reflows below `md`. One column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the default five columns. They answer which order, who, when, what state, and how much. The runner-up is the Columns popover. Add it once more than one team asks for a sixth fact such as method or channel.

Saved views are the later answer, when finance and the warehouse want different tables. Never ship the question-shaped headers. They cost width and read as a form.

#### `five-columns-nothing-removable`: Five columns, nothing removable

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: field "Select 7K4Q2M" checkbox · text "7K4Q2M" · text muted "Garcia Interiors restock" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** The default set. Five columns is what fits 1440 without scrolling and covers the four questions: which order, who, when, what state, and what money.

**Cost:** Nothing can be dropped or added. A team that wants the delivery as its own column, or that hides the email, has no way to get there.

#### `six-columns-with-a-column-chooser`: Six columns with a column chooser

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
    field "State" select = "Any state"
    action "Columns"
  region "Orders"
    table 6 "Order" "Delivery" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Garcia Interiors restock" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Add the delivery as its own column and offer a chooser so each back-office user keeps the columns they use. TanStack draws this as a plain per-user map, so the state is cheap.

**Cost:** The chooser is one more control, and a table where everyone sees different columns is harder to talk about in a support reply.

**Reference:** TanStack

#### `a-chooser-that-shows-the-current-set`: A chooser that shows the current set

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
    action "Columns"
  split 3:1
    region "Orders"
      table 5 "Order" "Customer" "Placed" "State" "Paid"
        item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
    aside "Columns"
      field "Order" checkbox
      field "Customer" checkbox
      field "Placed" checkbox
      field "State" checkbox
      field "Paid" checkbox
      field "Delivery" checkbox
      field "Method" checkbox
      field "Channel" checkbox
      action quiet "Reset"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** The Columns control opens a list of every column with a checkbox, a drag handle, and a Reset to default. The reader sees what they are looking at rather than picking from memory.

**Cost:** Two panes, so the table is squeezed while the chooser is open. A popover narrow enough to fit beside the button avoids that.

#### `two-lines-per-row-one-column-per-fact-group`: Two lines per row, one column per fact group

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
  region "Orders"
    table 4 "Order and delivery" "Customer" "State" "Paid"
      item: field "Select 7K4Q2M" checkbox · text "7K4Q2M" · text muted "Garcia Interiors restock" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Fold delivery into the order cell and customer into one cell. The table is three columns wide and each row reads as two records of two lines.

**Cost:** Sorting by delivery becomes impossible, because delivery is not a column. Carbon wants sorting in the headers, and a folded cell has nowhere to put an arrow.

#### `columns-sized-to-their-content`: Columns sized to their content

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text muted "Garcia Interiors restock" · text "Maria Garcia" · text muted "maria@garcia-interiors.example" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** The money column is narrow and right-aligned, the customer column takes the slack, the date column is fixed. Each column is as wide as its values rather than an even split.

**Cost:** A long customer name pushes its column wider on one row and narrower on the rest, because table layout is content-driven. Fixed widths are the only way to stop that.

#### `one-column-per-question-headers-that-name-the-question`: One column per question, headers that name the question

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
    field "State" select = "Any state"
    field "Delivery" select = "Any delivery"
  region "Orders"
    table 5 "Who bought" "For which delivery" "When they paid" "What state" "How much"
      item: text "Maria Garcia" · text "Garcia Interiors restock" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Headers become the questions the reader asks: Who, Which delivery, When, State, How much. Each header is sortable, and the reader can name what they are looking at.

**Cost:** Longer headers take width from the data. A question-shaped header breaks the one-word-per-column feel.

#### `customer-first-order-code-deferred-to-the-record`: Customer first, order code deferred to the record

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Three orders for Garcia Interiors restock, newest first."
  toolbar
    field "Customer name" search
    field "State" select = "Any state"
    action "Export"
  region "Orders"
    table 4 "Customer" "Delivery" "State" "Paid"
      item: text "Maria Garcia" · text "Garcia Interiors restock" · status "Paid" positive · text "EUR 125.00" · action "Open"
  footer
    text "1 – 3 of 3"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Support starts from who is asking, not from a code. The customer and the delivery lead, and the order code waits on the record where it is needed.

**Cost:** Two orders by one customer for one delivery read as near-identical rows until one is opened. Nothing on the row tells them apart, which costs the scannable identity the default order column gives.

#### `a-columns-popover-listing-every-column`: A Columns popover listing every column

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
    action "Columns"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
  popover "Columns"
    field "Order · Always shown" checkbox
    field "Customer" checkbox
    field "Placed" checkbox
    field "State" checkbox
    field "Paid" checkbox
    field "Delivery" checkbox
    field "Method" checkbox
    field "Channel" checkbox
    action quiet "Reset to default"
```

**Rationale:** The Columns control opens a popover with every column, a checkbox each, and Reset to default. The order column is always shown and says so. This is the shadcn/ui data-table view-options menu, and Linear Display panel works the same way.

**Cost:** The popover covers the table while it is open, and drag-to-reorder inside it is a second feature that most back-office users would never find.

**Reference:** shadcn/ui

#### `saved-views-carry-their-own-columns`: Saved views carry their own columns

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Finance view: what was paid, how, and what went back."
  toolbar
    field "Search orders" search
    field "Date" select = "This month"
  tabs "All orders" "Finance" "Dispatch list"
    region "Finance"
      table 5 "Order" "Placed" "Method" "Paid" "Refunded"
        item: text "7K4Q2M" · text "8 Oct 09:32" · text "Bank transfer" · text "EUR 125.00" · text muted "No refund"
  footer
    text "1 – 25 of 58"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** HubSpot and Linear tie a column set to a saved view. All orders keep the default five, Finance swaps in method, paid, and refunded, and Dispatch list shows customer, delivery, and lines. Each role opens the table it needs, and a support reply can name the view.

**Cost:** Views are a feature with their own lifecycle: who creates one, whether shared, and what follows when a column retires. Too much for a first release.

**Reference:** HubSpot

### Sorting

**Question:** How does a reader reorder the orders table. The table starts newest first. Each sortable header offers its own order, and the sort lives in the URL so a link carries it.

**Default:** `every-sortable-header-carries-an-arrow`

**Compact:** Below 640 pixels the table becomes two-line rows and the headers leave with it. A Sort control carries the same sort from the toolbar. The compact option is `headers-on-a-desktop-a-sort-control-on-a-phone`.

**Rationale:** Give every sortable header its own arrow. The arrow states that headers sort on touch screens too. The runner-up is headers on a desktop with a Sort control on the phone list. It becomes necessary the moment the table turns into rows below 640 pixels.

Never ship multi-column sort. No back-office question needs two keys.

#### `arrow-on-the-sorted-column-only`: Arrow on the sorted column only

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Sorted by newest first."
  toolbar
    field "Search orders" search
  region "Orders"
    table 5 "Order" "Customer" "Placed ↓" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** One arrow, on the column the table is sorted by, showing which way. Every other header is plain text that becomes a button on hover.

**Cost:** Nothing tells a reader that the other headers sort at all until they hover, which is invisible on a touch screen.

#### `sort-as-a-control-above-the-table`: Sort as a control above the table

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery."
  toolbar
    field "Search orders" search
    field "State" select = "Any state"
    field "Sort" select = "Newest first"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** The sort is one named control rather than six header affordances: Sort newest first. Works on a touch screen and states itself in words.

**Cost:** The reader has to find the control to change the order, and Carbon guidance states that sorting belongs in the headers.

#### `arrows-on-hover-plus-a-reset`: Arrows on hover plus a reset

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery."
  toolbar
    field "Search orders" search
    action "Reset sort"
  region "Orders"
    table 5 "Order ↕" "Customer ↕" "Placed ↓" "State ↕" "Paid ↕"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Every header carries a faint arrow, and the sorted one is dark. A Reset sort control appears only while a sort is applied, so the default state stays clean.

**Cost:** The reset is a control that only sometimes exists, which is its own inconsistency. It is also invisible until a sort has been applied.

#### `multi-column-sort-shown-as-a-stack`: Multi-column sort, shown as a stack

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery."
  toolbar
    field "Search orders" search
    action "Sort: 2"
  region "Orders"
    text "Sorted by delivery, then by date inside each delivery."
    table 5 "Order ↑ 1" "Delivery" "Customer" "Placed ↓ 2" "Paid"
      item: text "7K4Q2M" · text "Garcia Interiors restock" · text "Maria Garcia" · text "8 Oct 09:32" · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** When a reader sorts by delivery and then by date, the table says so in words rather than relying on two arrows. Useful once a table genuinely needs a secondary key.

**Cost:** Almost no reader needs two keys, and the control is a menu of menus. Carbon treats sorting as one column at a time.

#### `sorting-stated-in-the-page-description`: Sorting stated in the page description

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first. Click a heading to sort it."
  toolbar
    field "Search orders" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** The order is stated once, in words, under the heading, and the headers stay plain. A reader who wants a different order clicks a header.

**Cost:** The statement goes stale the moment a reader sorts by clicking, so the page contradicts itself unless the description updates too.

#### `sort-only-the-column-that-has-choices`: Sort only the column that has choices

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery."
  toolbar
    field "Search orders" search
  region "Orders"
    text muted "Only date and money sort."
    table 5 "Order" "Customer" "Placed ↓" "State" "Paid ↕"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Only two headers are buttons: money and date. Order and state sort alphabetically, which almost nobody wants, so they are not buttons at all.

**Cost:** Selective sorting breaks the expectation that every header is a control, and it hides a capability rather than offering it.

#### `every-sortable-header-carries-an-arrow`: Every sortable header carries an arrow

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery."
  toolbar
    field "Search orders" search
  region "Orders"
    table 6 "Order ↕" "Customer" "Placed ↓" "State ↕" "Paid ↕"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Each sortable header is a ghost button with a faint up-down arrow, and the sorted one has a solid arrow. The shadcn/ui and TanStack table examples do the same, and so does Stripe.

**Cost:** Five arrows is more ink in the header row, and the Customer header looks inert beside its neighbors.

**Reference:** shadcn/ui

#### `headers-on-a-desktop-a-sort-control-on-a-phone`: Headers on a desktop, a sort control on a phone

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery."
  toolbar
    field "Search orders" search
    field "Sort" select = "Newest first"
  region "Orders"
    table 6 "Order ↕" "Customer" "Placed ↓" "State ↕" "Paid ↕"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

```wireframe compact
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery."
  toolbar
    field "Search orders" search
    field "Sort" select = "Newest first"
  region "Orders"
    list 6
      item: text "7K4Q2M · Garcia Interiors restock" · text "EUR 125.00" · text muted "Maria Garcia · 8 Oct 09:32" · status "Paid" positive
```

**Rationale:** Stripe sorts from the headers on a wide screen. Its mobile list carries a Sort control instead, because rows have no headers to click. The same URL parameter drives both.

**Cost:** Two controls for one state, and only worth building once the table becomes a list on a phone.

**Reference:** Stripe

### Filters

**Question:** How does a reader narrow the orders table. Search alone answers one question. Each closed filter control shows how many values it applies, and several categories never share one dropdown.

**Default:** `one-filter-per-category-visible`

**Compact:** The recommended option reflows below `md`. One column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Show one visible control per category. A reader sees what can narrow the table without opening anything, and each category keeps its own control. The runner-up is faceted buttons with counts. Prefer it once a category holds more than a few values and the reader needs the split before choosing.

Never ship every category inside one dropdown. It hides the applied state and contradicts the stated rule.

#### `one-filter-per-category-visible`: One filter per category, visible

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders across 40 deliveries."
  toolbar
    field "Search orders" search
    field "Delivery" select = "Any delivery"
    field "State" select = "Any state"
    field "Date" select = "Any date"
    field "Channel" select = "Any channel"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Delivery, state, date, and channel each get their own control in one row. No menu holds more than one category, so a reader can see what is available without opening anything.

**Cost:** Four controls plus a search box is a wide toolbar. Below about 700 pixels they have to wrap or collapse, which is where the complexity moves.

#### `applied-filters-restated-as-chips`: Applied filters restated as chips

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "12 orders match."
  toolbar
    field "Search orders" search
    field "Delivery" select = "Garcia Interiors restock"
    field "State" select = "Any state"
    field "Date" select = "This month"
    action quiet "Clear all"
  row
    action quiet "Garcia Interiors restock x"
    action quiet "This month x"
  region "Orders"
    table 4 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 12 of 12"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** The controls stay, and the row underneath restates what is applied with a remove control each. The chip row is the honest answer to what the reader is looking at, which the toolbar alone is not.

**Cost:** The chips restate the controls, saying one thing twice on one page.

#### `filters-with-an-applied-count-on-the-control`: Filters with an applied count on the control

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders across 40 deliveries."
  toolbar
    field "Search orders" search
    field "Delivery" select = "Garcia Interiors restock"
    status "1" info
    field "State" select = "Paid"
    status "1" info
    field "Date" select = "Any date"
    status "0" neutral
    action quiet "Clear 2"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Each closed control carries a count badge, so the reader knows a filter is narrowing the table without opening anything. Carbon asks for this minimum indicator.

**Cost:** A count of one on a select reads as decoration unless the reader knows what it means. It is only clear beside a label.

#### `a-filter-panel-beside-the-table`: A filter panel beside the table

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders across 40 deliveries."
  split 1:3
    aside "Filter"
      field "Search" text
      field "Delivery" select = "Any delivery"
      field "State" select = "Any state"
      field "Channel" select = "Any channel"
      field "Only refunds" checkbox
      action primary "Apply"
      action quiet "Clear"
    region "Orders"
      table 6 "Order" "Customer" "Placed" "State" "Paid"
        item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Filters in a panel down the left side, with every category open at once and nothing hidden. Carbon prefers this when there are more than three categories.

**Cost:** A permanent panel takes about 190 pixels from the table on every page, and most visits apply no filter at all. The panel is a cost paid by everyone for the benefit of a few.

**Reference:** Carbon

#### `filters-in-one-dropdown`: Filters in one dropdown

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders across 40 deliveries."
  toolbar
    field "Search orders" search
    action "Filters (2)"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** One Filters button holding every category, with the count on the button. Keeps the toolbar to two controls and leaves the table full width.

**Cost:** Carbon states that multiple filter categories never sit inside a menu. A reader cannot see that a date filter exists without opening it, and closing it hides the applied state again.

#### `views-as-tabs-filters-as-controls`: Views as tabs, filters as controls

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
  tabs "All 268" "Needs attention 12" "Awaiting money 31" "Refunded 18"
    region "All orders"
      toolbar
        field "Delivery" select = "Any delivery"
        field "State" select = "Any state"
        field "Date" select = "Any date"
      table 5 "Order" "Customer" "Placed" "State" "Paid"
        item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** The tabs carry the question the reader arrived with: All, Needs attention, Awaiting money. The filters below refine whichever tab is open.

**Cost:** Two mechanisms over one table, and the reader has to work out whether to click a tab or a filter. HubSpot makes views do both jobs instead.

#### `every-option-carries-its-count-before-it-is-applied`: Every option carries its count before it is applied

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "58 of 268 orders match."
  toolbar
    field "Search orders" search
    field "Delivery" select = "Garcia Interiors restock (41)"
    field "State" select = "Any state (268)"
    field "Date" select = "This month (58)"
    action quiet "Clear all"
  message "Each count answers the other filters as set." info
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 58"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Each filter option shows how many rows it matches under the other filters as set. The reader sees a zero before choosing it, rather than landing on an empty table. Fewer dead-end filterings instead of a better empty state afterwards.

**Cost:** Each count is a read against the other filters, so opening one select costs several queries. Counts also go stale the moment another user acts, and a stale zero is worse than none.

#### `faceted-filter-buttons-with-counts`: Faceted filter buttons with counts

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "58 of 268 orders match."
  toolbar
    field "Search orders" search
    action "State: Paid, Awaiting payment"
    action "Delivery: Garcia Interiors restock"
    action "Channel"
    action quiet "Clear 3"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 58"
    action quiet "‹ Previous"
    action quiet "Next ›"
  popover "Delivery"
    field "Garcia Interiors restock (41)" checkbox
    field "Becker spring refill (12)" checkbox
    field "Lindqvist studio courier (5)" checkbox
    field "Counter sale (0)" checkbox
    action quiet "Clear this filter"
```

**Rationale:** The shadcn/ui tasks example draws each category as a button that opens a checklist with a count per value. The reader sees the split before choosing, and several values in one category combine without one select per value.

**Cost:** Counts per value are a read per category, and the popover covers the table while it is open. Worth it only where a category holds more than a few values.

**Reference:** shadcn/ui

#### `filter-conditions-as-removable-chips`: Filter conditions as removable chips

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "12 orders match two conditions."
  toolbar
    field "Search orders" search
    action quiet "Clear all"
  row
    action quiet "State is Paid x"
    action quiet "Delivery is Garcia Interiors restock x"
    action quiet "Add condition"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 12 of 12"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Linear states each condition as a chip with its field, its operator, and its value, and the chip removes itself. A compound filter reads as a sentence, and clearing one condition never touches the others.

**Cost:** Chips wrap to several rows on a narrow screen. Building a condition needs a field menu, an operator menu, and a value menu in sequence.

**Reference:** Linear

### Row density

**Question:** How tall is a row in the orders table. Carbon defines five heights from 24 to 64 pixels, and the header, toolbar, and pagination match the row size. The default table runs near 47 pixels per row, between `md` and `lg`.

**Default:** `40-pixels-the-default`

**Compact:** Below 640 pixels the table becomes two-line record rows with the amount right. Sorting and comparison down a column move to the desktop. The compact option is `a-record-list-instead-of-a-table`.

**Rationale:** Keep 40 pixels. Two lines fit, the row scans, and it matches the default size. The runner-up is 32 pixels, for a working queue where every row is read once and acted on.

Never ship a density control the reader sets. Most readers set it once, and a screenshot suite then holds three versions of every page. The phone answer is a record list.

#### `40-pixels-the-default`: 40 pixels, the default

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
  region "Orders"
    table 6 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Carbon `md` default. Two lines of text fit and the row scans.

**Cost:** Twenty-five rows is 1000 pixels, so a 268-row table is eleven screens. Fine for browsing, slow for counting.

**Reference:** Carbon

#### `24-pixels-scannable`: 24 pixels, scannable

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders to decide. Sorted by how long you have left."
  toolbar
    field "Search refunds" search
    field "Window" select = "Any window"
  region "Refunds"
    table 7 "Order ↑" "Customer" "State" "Amount" "Time left"
      item: text "3H3C68" · text "Elin Lindqvist" · status "Window closed" critical · text "EUR 50.00" · text "Closed 34 days ago"
  footer
    text "1 – 25 of 31"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Carbon `xs`. One line per row, so the eye can travel straight down a column. The right choice for a queue a back-office user works through rather than reads.

**Cost:** One line means the delivery name and the customer email have nowhere to go. Both have to be dropped or opened from the row.

**Reference:** Carbon

#### `32-pixels-a-working-table`: 32 pixels, a working table

```wireframe
page
  breadcrumb "Home" "Deliveries"
  header
    heading "Deliveries"
    text "Four deliveries, three with a date still ahead."
  toolbar
    field "Search deliveries" search
  tabs "Scheduled 3" "Past 1" "All 4"
    region "Scheduled"
      table 4 "Delivery ↑" "Date" "State" "Loaded" "Capacity"
        item: text "Becker spring refill" · text "9 Oct 2026" · status "Scheduled" info · text "32" · text "40 pallets" · action "Open"
  footer
    text "1 – 4 of 4"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Carbon `sm`. Enough for a badge and one line, which covers a working table where every row gets an action.

**Cost:** A two-line cell such as order number over delivery name does not fit, so the delivery has to become a column or drop.

**Reference:** Carbon

#### `a-density-control-the-reader-sets`: A density control the reader sets

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
    field "Rows" select = "Medium"
  region "Orders"
    table 8 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Three densities offered as a small segmented control in the toolbar, persisted per user. Carbon treats density as a token, not a free choice, so three steps is the honest number.

**Cost:** A third toolbar control for something most readers set once and never think about. And a screenshot test then has to hold three versions of every page.

**Reference:** Carbon

#### `dense-rows-with-a-zebra-pass`: Dense rows with a zebra pass

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders to decide."
  toolbar
    field "Search refunds" search
    field "Window" select = "Any window"
  region "Refunds"
    table 6 "Order" "Customer" "State" "Amount" "Time left"
      item: text "3H3C68" · text "Elin Lindqvist" · status "Window closed" critical · text "EUR 50.00" · text "Closed 34 days ago"
  footer
    text "1 – 25 of 31"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** At 24 pixels the eye loses its place across a wide row, so the Carbon zebra modifier returns. Every second row takes the muted surface.

**Cost:** Zebra on a two-line row is noisy, because the bands cut through the cell content rather than sitting behind it. It works at one line and not at two.

**Reference:** Carbon

#### `a-record-list-instead-of-a-table`: A record list instead of a table

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
    field "State" select = "Any state"
  region "Orders"
    list 5
      item: text "7K4Q2M · Garcia Interiors restock" · text "EUR 125.00" · text muted "Maria Garcia · maria@garcia-interiors.example" · status "Paid" positive · action "Open"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** One card-width block per record with two lines and its own commands on the right. It is what the phone layout wants.

**Cost:** No columns, so no sorting and no comparison across a column. It trades every table capability for reading one record well.

#### `comfortable-48-px-rows-for-a-delivery-list`: Comfortable 48 px rows for a delivery list

```wireframe
page
  breadcrumb "Home" "Deliveries"
  header
    heading "Deliveries"
    text "Four deliveries, three with a date still ahead."
  toolbar
    field "Search deliveries" search
  tabs "Scheduled 3" "Past 1" "All 4"
    region "Scheduled"
      table 4 "Delivery" "State" "Loaded"
        item: text "Becker spring refill" · text muted "Fri 9 Oct 2026 · Rotterdam depot" · status "Scheduled" info · text "32 of 40 pallets" · action "Open"
  footer
    text "1 – 4 of 4"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Shopify Polaris draws its product lists at a comfortable height with a second line under the name. Deliveries are read one by one rather than scanned down a column. The load bar answers the only question the row exists for.

**Cost:** Eight rows need a scroll where the compact table shows fourteen. Wrong for any queue a back-office user works through in order.

**Reference:** Shopify Polaris

#### `compact-rows-with-a-header-that-stays`: Compact rows with a header that stays

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders to decide. Sorted by how long you have left."
    text "The header stays while the queue scrolls."
  toolbar
    field "Search refunds" search
    field "Window" select = "Any window"
  region "Refunds"
    table 8 "Order" "Customer" "State" "Amount" "Time left"
      item: text "3H3C68" · text "Elin Lindqvist" · status "Window closed" critical · text "EUR 50.00" · text "Closed 34 days ago"
  footer
    text "1 – 25 of 31"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Linear lists keep the header pinned while hundreds of compact rows scroll under it, so the column names survive the scroll. The right shape for a queue that is worked top to bottom without paging.

**Cost:** A pinned header only pays off on a long list. On five rows it is chrome with no job. It also needs a fixed list height, which fights the page scroll.

**Reference:** Linear

### Bulk action bar

**Question:** What appears once order rows are selected. The bar names the count and the money, then offers the commands. A refund on the wrong scope is the expensive mistake this pattern guards against.

**Default:** `a-bar-above-the-table-naming-the-count`

**Compact:** The recommended option reflows below `md`. One column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep a bar above the table naming the count and the money. On a refunds page the total is the thing a reader checks before acting. The runner-up is a floating pill, for reversible bulk work such as resending confirmations or tagging, where the bar leaves the table in place.

Never ship the bar at the foot. On a long table the action sits off screen while the checkboxes that enabled it do not.

#### `a-bar-above-the-table-naming-the-count`: A bar above the table naming the count

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders to decide."
  toolbar
    field "Search refunds" search
    field "Window" select = "Any window"
  region "Selected"
    text "3 selected"
    text muted "EUR 200.00 of order money"
    action "Refund in full"
    action "Refund part"
    action primary "Refund these 3"
    action quiet "Clear"
  region "Refunds"
    table 5 "Order" "Customer" "State" "Paid"
      item: field "Select 7K4Q2M" checkbox · text "7K4Q2M" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The bar states how many are selected and what that total is worth, then offers the commands. The count is the thing a reader checks before acting on money.

**Cost:** The toolbar is still visible above the bar, so two rows of controls stack. Either the toolbar goes or the page gets taller.

#### `the-bar-replaces-the-toolbar`: The bar replaces the toolbar

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders to decide."
  region "Selected"
    text "3 selected"
    text muted "EUR 200.00"
    action quiet "Clear"
    action "Refund part"
    action primary "Refund these 3"
  region "Refunds"
    table 5 "Order" "Customer" "State" "Paid"
      item: field "Select 7K4Q2M" checkbox · text "7K4Q2M" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** While a selection exists the toolbar is replaced by the bulk bar. One set of controls at a time, and the page cannot be read as offering search while it is offering actions.

**Cost:** The layout shifts under the reader mid-decision. The search box they wanted to refine with is gone exactly when they are about to act.

#### `bar-at-the-foot-above-the-pagination`: Bar at the foot, above the pagination

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders to decide."
  toolbar
    field "Search refunds" search
    field "Window" select = "Any window"
  region "Refunds"
    table 5 "Order" "Customer" "State" "Paid"
      item: field "Select 7K4Q2M" checkbox · text "7K4Q2M" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  footer
    text "2 selected · EUR 175.00"
    action quiet "Clear"
    action "Refund part"
    action primary "Refund these 2"
  footer
    text "1 – 25 of 31"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** The bar sits where the reader's eye already goes after ticking boxes, above the row count. The selection controls stay next to the count they describe.

**Cost:** On a long table the foot is off screen while the checkboxes are not. The reader scrolls to find the action its checkboxes enabled.

#### `bar-with-the-escalation-and-money-named`: Bar with the escalation, and money named

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders to decide."
  toolbar
    field "Search refunds" search
    field "Window" select = "Any window"
  message "All 25 on this page are selected. 1,204 refunds match this filter in total." info
  region "Selected"
    text "25 selected"
    text muted "EUR 1,125.00 of order money on this page"
    action quiet "Clear"
    action "Refund part"
    action primary "Refund these 25"
  region "Refunds"
    table 5 "Order" "Customer" "State" "Paid"
      item: field "Select 7K4Q2M" checkbox · text "7K4Q2M" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The bar carries both numbers: 25 on this page, 1,204 matching. It also names the money, because a refund bulk action on the wrong scope is the expensive mistake this page invites.

**Cost:** A long bar with two numbers and three buttons. It only fits above about 900 pixels, so the phone needs its own version of the same warning.

#### `bar-with-a-confirm-before-it-commits`: Bar with a confirm before it commits

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders to decide."
  toolbar
    field "Search refunds" search
    field "Window" select = "Any window"
  region "Selected"
    text "3 selected"
    text muted "EUR 200.00"
    action quiet "Clear"
    action "Refund part"
    action primary "Refund these 3"
  region "Refunds"
    table 5 "Order" "Customer" "State" "Paid"
      item: field "Select 7K4Q2M" checkbox · text "7K4Q2M" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  dialog "Refund 3 orders in full?"
    text "EUR 200.00 goes back to 3 customers."
    fact "Maria Garcia · 7K4Q2M" "EUR 125.00"
    fact "Tom Becker · STT855" "EUR 50.00"
    fact "Maria Garcia · PP0K9B" "EUR 25.00"
    message "One of these orders is already 214 days old. The bank will not take that one back." caution
    action "Cancel"
    action destructive "Refund 3 orders"
```

**Rationale:** The primary button opens a dialog naming the count and the money. A bulk refund is exactly the action NN/g says to interrupt when it is rare and irreversible.

**Cost:** Two steps for a batch the reader has spent a minute selecting. Acceptable on money, wrong for anything reversible such as a bulk tag.

**Reference:** NN/g

#### `bar-with-the-action-inline-and-an-undo-after`: Bar with the action inline and an undo after

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
    field "State" select = "Any state"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
  toast positive "Confirmations resent to 3 customers."
```

**Rationale:** The bulk action runs with no confirmation and the bar becomes an undo toast. Carbon keeps an action-bearing toast until it is dismissed rather than letting a timer take the undo away.

**Cost:** On money the evidence argues against this option. NN/g reports reflex clicking when confirmations are routine. A refund is not the place to train that reflex.

#### `a-floating-pill-with-the-count-and-one-menu`: A floating pill with the count and one menu

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
    field "State" select = "Any state"
  region "Orders"
    table 6 "Order" "Customer" "Placed" "State" "Paid"
      item: field "Select 7K4Q2M" checkbox · text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
  popover "Selected"
    text "3 selected"
    action "Resend confirmation"
    action "Add tag"
    action quiet "More actions"
```

**Rationale:** Notion and Linear float the selection bar over the content instead of pushing the table down. It holds the count, the one or two common commands, and a menu for the rest. The table never shifts when the first box is ticked.

**Cost:** The pill covers the bottom rows while it is up, and money wants its total stated, which a pill has no room for. Keep it for reversible work.

**Reference:** Notion

#### `bulk-actions-behind-one-dropdown`: Bulk actions behind one dropdown

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
    field "State" select = "Any state"
  toolbar
    text "3 selected"
    action quiet "Clear"
    action "Actions"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: field "Select 7K4Q2M" checkbox · text "7K4Q2M" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  popover "Actions"
    action "Resend confirmation"
    action "Add tag"
    action "Export selected"
    action destructive "Void 3 orders"
```

**Rationale:** Stripe dashboard keeps the bulk bar to a count and one Actions menu, drawn open here. Every command is named in one place, the bar stays narrow, and adding a fifth command costs no width.

**Cost:** Two clicks to the common command instead of one, and nothing on the bar says that resending is what most back-office users reach for.

**Reference:** Stripe

### Pagination

**Question:** How does a reader move through 268 orders. The range and two chevrons move one page at a time. Numbered pages add a jump, and the count still says where the reader is.

**Default:** `count-left-numbered-pages-right`

**Compact:** Below 640 pixels the numbered pages leave and the pager keeps the range with two chevrons. The compact option is `a-compact-pager-range-plus-two-chevrons`.

**Rationale:** Keep the count with numbered pages. The reader can jump, and the range still says where they are. The runner-up is the compact pager, where width is tight and nobody jumps further than one page at a time.

Never ship the jump field. Typing a page number then Enter is slower than clicking for almost every reader.

#### `count-left-numbered-pages-right`: Count left, numbered pages right

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "1"
    action quiet "2"
    action quiet "3"
    action quiet "4"
    action quiet "5"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** The default shape with numbered pages added and the redundant Page 1 of 11 removed. The reader can jump, and the count still says where they are.

**Cost:** Seven page numbers plus two chevrons is a wide control, and it has to collapse on a phone. The count and the numbers still overlap slightly.

#### `count-page-size-and-chevrons`: Count, page size and chevrons

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    field "Page size" select = "25 per page"
    text "Page 1 of 11"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Carbon's three parts: items per page, the current range and total, and the current page. The page size is the control most tables leave out and back-office users most want on a long list.

**Cost:** Three controls in one bar. On a phone it becomes a row of three stacked lines, which pushes the table off screen.

**Reference:** Carbon

#### `first-previous-numbers-next-last`: First, previous, numbers, next, last

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "101 – 125 of 268"
    action quiet "First"
    action quiet "Previous"
    action quiet "4"
    action quiet "5"
    action quiet "6"
    action quiet "7"
    action quiet "8"
    action quiet "Next"
    action quiet "Last"
```

**Rationale:** Five controls plus a window of numbers. A reader on page 7 of 11 can reach either end in one click without scrolling the number strip.

**Cost:** The widest pagination control there is, and the numbers still have to window or overflow. On a 268-row list it saves at most four clicks.

#### `count-chevrons-and-jump-to-a-page`: Count, chevrons, and jump to a page

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    field "Page" number = "1"
    text "of 11"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Two chevrons and a small jump field. Fewest controls, and a reader who knows the page number types it rather than clicking eight times.

**Cost:** The jump field is a fourth thing to learn, and typing 11 then Enter is slower than clicking for most readers.

#### `load-more-as-a-button-at-the-foot`: Load more as a button at the foot

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
  region "Orders"
    table 6 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    action "Load 25 more"
    text muted "25 of 268 shown"
```

**Rationale:** GOV.UK warns that infinite scroll breaks keyboard users, so loading is a button a reader presses. The count stays visible, so the total is never a surprise.

**Cost:** A link to a specific page 9 is no longer available. That link is the main reason Carbon and GOV.UK both land on pagination for admin lists.

**Reference:** GOV.UK

#### `no-pagination-because-the-list-is-short`: No pagination, because the list is short

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "10 open. All of them are shown."
  toolbar
    field "Search refunds" search
  region "Refunds"
    table 8 "Order" "Customer" "Asked" "State" "Paid"
      item: text "3H3C68" · text "Elin Lindqvist" · text "7 Oct 22:14" · status "Open" neutral · text "EUR 50.00"
  text "All 10 shown."
```

**Rationale:** Under about fifty records the whole list fits and pagination only adds a control that cannot do anything useful.

**Cost:** It cannot be a rule for the whole back office. Orders reach thousands and deliveries reach hundreds, so the list page has to decide per query.

#### `a-compact-pager-range-plus-two-chevrons`: A compact pager: range plus two chevrons

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Search orders" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  footer
    text "1 – 25 of 268"
    action quiet "‹ Previous"
    action quiet "Next ›"
```

**Rationale:** Stripe dashboard pager is the range and two chevrons, nothing else. It fits a phone without collapsing, and on a 268-row list most readers move one page at a time anyway.

**Cost:** No jumping: reaching page 9 costs eight clicks. Only right where the reader rarely leaves the first pages.

**Reference:** Stripe

#### `no-pager-at-all-while-everything-fits`: No pager at all while everything fits

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "10 open orders, all shown below."
  toolbar
    field "Search refunds" search
  region "Refunds"
    table 8 "Order" "Customer" "Asked" "State" "Paid"
      item: text "3H3C68" · text "Elin Lindqvist" · text "7 Oct 22:14" · status "Open" neutral · text "EUR 50.00"
```

**Rationale:** GitHub draws no pagination on a list that fits one page: no range, no chevrons, no control that cannot do anything. The table ends and the page ends with it.

**Cost:** Nothing states the total, so a reader cannot tell 10 rows from a filter that hid the rest. Only right where the heading already names the count.

**Reference:** GitHub

### Row actions

**Question:** The orders table shows rows of orders. Each row may carry its own commands. How many commands sit on the row, and where do the rest live.

**Default:** `one-inline-action-the-rest-in-a-row-menu`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep one inline command with the rest in the row menu. The common job stays one click away and the row stays narrow. Prefer the side preview where acting needs the record context, such as the lines before a resend. Never ship hover-revealed actions. Hover fails on touch, and a second focusable render doubles the table for no gain.

#### `one-inline-action-the-rest-in-a-row-menu`: One inline action, the rest in a row menu

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
    action "Export CSV"
  toolbar
    field "Order number, name or email" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00" · action "Resend" · menu "More"
```

**Rationale:** The first row command is drawn inline and everything else sits behind the row's overflow menu. It matches the Polaris instruction to put a row's other commands in its menu.

**Cost:** The second command is invisible, and the overflow is a 32-pixel target that has to be found in every row.

**Reference:** Shopify Polaris

#### `the-row-is-the-only-action`: The row is the only action

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first. Click an order to open it."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: link "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · text "Paid" · text "EUR 125.00"
```

**Rationale:** No commands on the row at all: clicking the order number opens the record, and every command lives there. The table is for finding, the record is for acting.

**Cost:** A bulk job becomes one row at a time, so this shape fits finding, not acting.

#### `two-inline-actions-no-menu`: Two inline actions, no menu

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders to decide. Each row carries the two commands that apply to it."
  toolbar
    field "Search refunds" search
    field "Window" select = "Any window"
  region "Refunds"
    table 5 "Order" "Customer" "State" "Amount" "Time left"
      item: text "7K4Q2M" · text "Maria Garcia" · status "Open" neutral · text "EUR 125.00" · text "174 days left" · action "Refund" · action "Offer credit"
```

**Rationale:** Two commands is the NN/g ceiling for inline placement. Anything beyond two becomes crowded, so this shape only works where a row genuinely has two.

**Cost:** Two buttons plus a checkbox plus five columns is a wide row. At 24 pixels of density the buttons stop fitting and the row grows.

**Reference:** NN/g

#### `row-menu-only`: Row menu only

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00" · menu "More"
```

**Rationale:** Every command sits behind the overflow. The row stays one link plus one dot, which keeps the table narrow enough for a phone.

**Cost:** Nothing on the row says what can be done. The reader has to open a menu to learn that anything can be done at all.

#### `hover-reveals-the-action-always-focusable`: Hover reveals the action, always focusable

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00" · action quiet "Resend"
    text muted "The row action shows on hover and stays in the tab order."
```

**Rationale:** The row action appears on hover, so a quiet table stays quiet. It stays in the tab order, so a keyboard reader reaches it. This is the accessibility repair on the hover-only pattern.

**Cost:** It still fails on touch, where there is no hover, and the two fixes together mean two renders of every row. Polaris and NN/g both warn about hover-only affordances.

#### `one-destructive-command-in-the-row-guarded`: One destructive command in the row, guarded

```wireframe
page
  breadcrumb "Home" "Deliveries"
  header
    heading "Deliveries"
    text "Four deliveries, three with a date still ahead."
  toolbar
    field "Search deliveries" search
  region "Deliveries"
    table 4 "Delivery" "Date" "State" "Loaded"
      item: text "Becker spring refill" · text "9 Oct 2026" · status "Scheduled" info · text "32 of 40 pallets" · action "Open" · menu "More"
  popover
    action "Open the delivery"
    action "Duplicate the delivery"
    action destructive "Discontinue"
```

**Rationale:** The row's second command is a removal. It is drawn in the destructive tone and marked as the last item in the row menu. It never sits inline next to a harmless one.

**Cost:** A red word in every row is visual noise on a page for scanning states. Carbon warns that a tone with no action required stays plain text.

#### `the-row-menu-drawn-open`: The row menu drawn open

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00" · action "Resend" · menu "More"
  popover
    action "Open the order"
    action "Resend confirmation"
    action "Copy the order link"
    action destructive "Void the order"
```

**Rationale:** The shadcn/ui dropdown menu on the row, drawn open: the harmless commands first, then a separator, then the destructive one last. The reader sees every command the row holds without guessing what the dots hide.

**Cost:** An open menu covers the rows under it, so it only proves the menu's contents, not the table's reading. The menu must also flip sides near the table edge.

**Reference:** shadcn/ui

#### `open-in-a-side-preview-act-from-there`: Open in a side preview, act from there

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: link "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  drawer right
    heading "7K4Q2M"
    text "Maria Garcia · Garcia Interiors restock"
    fact "Lines" "2 Oak desk lamps and 1 desk chair"
    fact "Total" "EUR 125.00"
    action primary "Resend confirmation"
    action "Copy the order link"
    action destructive "Void the order"
```

**Rationale:** Shopify and Stripe open a row in a side panel that carries the record's facts and its commands together. Resending Maria Garcia's confirmation happens beside the order lines, so the reader checks what is sent before sending it.

**Cost:** A panel over the list hides the rows it came from. On a phone it is a full screen, which makes it a page by another name.

**Reference:** Shopify

### Table's own states

**Question:** The orders table is sometimes empty, still loading, or failed to load. Each case needs its own words and layout. What shows for each state of the table itself.

**Default:** `no-data-yet-table-replaced`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep three sentences for three facts. No data yet, no results, and loading each replace the table they stand for. Prefer the slow-read note that names what is loading when the list takes seconds. Never ship a bare spinner over the table body. Rows that shift when the data lands move the row the reader already chose.

#### `no-data-yet-table-replaced`: No data yet, table replaced

```wireframe
page
  breadcrumb "Home" "Deliveries"
  header
    heading "Deliveries"
    text "Six deliveries a week, from a 40-pallet restock to a single parcel."
    action primary "New delivery"
  region "Deliveries"
    message positive "No deliveries yet. A delivery holds the date, the warehouse, the load and what is on it."
    action primary "New delivery"
```

**Rationale:** Nothing has ever existed, so the table and its headers are gone. One positive sentence offers the command that creates the first record.

**Cost:** The reader cannot see what a row will look like, so the columns are undiscoverable until there is data.

#### `no-results-for-a-search-filters-named`: No results for a search, filters named

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "No orders match this search."
  toolbar
    field "Order number, name or email" search = "maria becker"
    field "Delivery" select = "Garcia Interiors restock"
    field "State" select = "Paid"
  region "Orders"
    message neutral "Nothing matches maria becker. 268 orders exist, but none match this term with Garcia Interiors restock and Paid applied."
    action "Clear the search"
    action "Clear the filters too"
```

**Rationale:** Something exists but nothing matches, so the copy names the term and the filters and offers to clear them. A different sentence from the no-data case, because a different thing happened.

**Cost:** Two empty states means two pieces of copy per list page, both of which have to stay true as filters change.

#### `loading-as-skeletons-at-the-real-row-height`: Loading as skeletons at the real row height

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    table 6 "Order" "Customer" "Placed" "State" "Paid"
      item: text muted "Order" · text muted "Customer" · text muted "Placed" · text muted "State" · text muted "Paid"
```

**Rationale:** Skeleton rows shaped like real rows at the real height, so nothing shifts when the data lands. Carbon asks for skeletons rather than a spinner over the body.

**Cost:** Carbon also requires the header, the toolbar, and the pagination to match the row size. A skeleton page has to get all four heights right or it jitters.

**Reference:** Carbon

#### `a-failed-read-keeps-the-chrome`: A failed read keeps the chrome

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    message critical "These orders could not be refreshed. What you see is from 2 minutes ago."
    action "Try again"
    table 4 "Order" "Customer" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The table rendered before, so a refresh failed. Keeping the headers and showing the error in place tells the reader the data they can see is stale rather than current.

**Cost:** Old rows under an error can be acted on by mistake, which is the opposite of what the message wants to prevent.

#### `a-failed-first-read-drops-the-table`: A failed first read drops the table

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    message critical "Orders could not be loaded. Nothing has been lost."
    action primary "Try again"
```

**Rationale:** Nothing ever loaded, so there is no table to keep. The empty state replaces the element it stands for, headers and footer included.

**Cost:** The reader loses the column names, so a retry that succeeds looks like a different page rather than the page they were on.

**Reference:** Carbon

#### `refreshing-in-place-with-the-last-read-stated`: Refreshing in place, with the last read stated

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
    text "Read 12 s ago"
    action quiet "Stop"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** A queue reads itself on a timer. A quiet control says how often and when it last did, and offers to stop it.

**Cost:** A timer on a page holding money means the reader may act on a value that changes a second later. A statement of when it last read is the mitigation, not a fix.

#### `no-results-with-recent-searches`: No results with recent searches

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "No orders match this search."
  toolbar
    field "Order number, name or email" search = "maria becker"
    field "Delivery" select = "Garcia Interiors restock"
  region "Orders"
    message neutral "Nothing matches maria becker. 268 orders exist, but none match this term."
    action "Clear the search"
  region "Recent searches"
    list 3
      item: link "maria garcia"
```

**Rationale:** The recent searches sit under a no-result state, so a mistyped term costs one click to repair instead of retyping. The recent terms are the reader's own, which makes them the most likely next query.

**Cost:** Recent searches are stored state with their own lifecycle and their own privacy question. They also go stale as deliveries complete.

**Reference:** Linear

#### `a-slow-read-that-says-what-it-is-doing`: A slow read that says what it is doing

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
    action quiet "Stop"
  region "Orders"
    message info "Reading 268 orders. 6 s so far."
    table 4 "Order" "Customer" "State" "Paid"
      item: text muted "Order" · text muted "Customer" · text muted "State" · text muted "Paid"
```

**Rationale:** A slow read is named while it runs: what is loading, how long it has taken, and a way to stop waiting. A reader who knows the list holds 268 orders waits. A reader watching a blank box leaves.

**Cost:** A progress note needs the total before the rows arrive, which is a second read. It also teaches the reader that some lists are slow, which invites the question why.

**Reference:** Vercel

### Status in a column

**Question:** Each order row carries a state such as Paid or Disputed. Some states need a decision and some need none. How does the State column tell them apart.

**Default:** `tone-only-on-the-states-that-block`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Give a tone only to the states that block. Disputed and Awaiting payment take a badge because somebody must act. Paid and Completed stay plain words. Prefer the reason on a second line for a disputes queue where the word alone never answers why. Never ship progress marks. Four blocks per row on a 268-row list cannot serve a lifecycle that branches.

#### `a-badge-for-every-state`: A badge for every state

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** Every state is a badge mapping a code to a word and a tone. The word is the signal. The tone repeats it.

**Cost:** Carbon warns that more than five or six status indicators overwhelm the eye. A status needing no action stays plain text. A badge on all twenty-five rows is exactly that.

#### `plain-text-and-the-label-says-which-state`: Plain text, and the label says which state

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    text muted "The State column holds one plain word."
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · text "Paid" · text "EUR 125.00"
```

**Rationale:** Plain words with no tone, because none of these states needs a decision. The header says State and the column holds one word, which keeps the interface quiet.

**Cost:** A reader scanning for a problem has to read every word. With 268 rows that is slow, which is the case for badges.

#### `tone-only-on-the-states-that-block`: Tone only on the states that block

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    text muted "Disputed and Awaiting payment are toned. Paid is not."
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "8M3DWR" · text "Ade Okafor" · text "8 Oct 06:22" · status "Awaiting payment" caution · text "EUR 45.00"
```

**Rationale:** States that need a decision get a tone. The rest are plain words. This satisfies the plain-text rule for states needing no action and keeps the table readable. It is what the default orders table draws.

**Cost:** The reader has to learn which states are toned, and a new state added later has to be classified before it is used.

#### `two-states-side-by-side-both-named`: Two states side by side, both named

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
    field "Payment" select = "Any payment"
    field "Order state" select = "Any order"
  region "Orders"
    table 6 "Order" "Customer" "Placed" "Payment" "Order state" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · text "Paid" · text "Open" · text "EUR 125.00"
```

**Rationale:** This fixes the default table's actual problem rather than hiding it. Payment state and order state are separate columns. Paid and Completed stop looking like two names for one thing.

**Cost:** A seventh column on a table that already carries five, for a distinction most readers do not need until something is wrong.

#### `a-dot-beside-the-word`: A dot beside the word

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · icon "dot" · text "Awaiting payment" · text "EUR 45.00"
```

**Rationale:** The word carries the meaning and a small dot carries the tone. The column stays quiet and a scan still finds the one row that needs a decision.

**Cost:** A dot beside a word is a third channel after word and badge. It adds an element that has to be explained once. It is also below 3:1 against the row background unless the token is chosen for it.

#### `the-state-as-a-progress-of-three-steps`: The state as a progress of three steps

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    text muted "Placed, paid, packed, shipped."
    table 4 "Order" "Customer" "Progress" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · image "Order progress, 3 of 4 steps done" · text "EUR 125.00"
```

**Rationale:** Where an order moves through a sequence, the column carries the sequence rather than the current step: placed, paid, packed, shipped. The reader sees both where it is and what is left.

**Cost:** Four marks per row is heavy on a 268-row list, and it only works because the order lifecycle genuinely is linear. A state with branches cannot use it.

#### `status-with-the-reason-on-a-second-line`: Status with the reason on a second line

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
    field "Scope" select = "Needs attention"
  region "Orders"
    table 4 "Order" "Customer" "State" "Paid"
      item: text "YB281K" · text "Ade Okafor" · text "7 Oct 19:02" · status "Disputed" critical · text muted "The bank asked for evidence" · text "EUR 45.00"
```

**Rationale:** The payments list pairs the state with its reason: Disputed with why the bank asked, Awaiting payment with how old the wait is. The word says what, the line says why, and the reader never opens a row to learn the reason.

**Cost:** Two lines doubles the row height for every row, including the paid ones whose reason is nothing. Only right on a queue where most rows need a decision.

**Reference:** Stripe

#### `a-stale-wait-takes-a-stronger-tone`: A stale wait takes a stronger tone

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Six orders still waiting on money."
  toolbar
    field "Order number, name or email" search
    field "Scope" select = "Awaiting payment"
  region "Orders"
    text muted "The tone follows the age of the wait."
    table 4 "Order" "Customer" "State" "Paid"
      item: text "8M3DWR" · text "Ade Okafor" · status "Awaiting payment" caution · text muted "2 days old" · text "EUR 45.00"
```

**Rationale:** Zendesk and Intercom color a waiting state by its age. An awaiting payment that is two hours old is neutral. At two days it turns caution. The tone answers how urgent the wait is, rather than only that there is one.

**Cost:** The tone now depends on the clock, so the same row reads differently in the morning and the evening. A support reply that says the yellow one goes stale within hours.

**Reference:** Zendesk

### Money column

**Question:** Each order row shows what the customer paid. The column header names the currency. What does the money cell say beyond the number.

**Default:** `number-only-right-aligned`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the number only. The header names the currency and repeating EUR on every row is noise. Prefer the refunded part under the charged amount where refunds are the work rather than the exception. Never ship money as a share of the total. A derived percentage column answers a question no orders list is asked.

#### `number-only-right-aligned`: Number only, right-aligned

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The default shape. A column headed Paid is unambiguous about the currency, so repeating EUR on every row is noise.

**Cost:** EUR 0.00 reads as an error rather than as a fact. Two of the eight default rows are zero, and neither says why.

#### `symbol-and-value-one-column`: Symbol and value, one column

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid (EUR)"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "€125.00"
```

**Rationale:** The symbol sits in the cell rather than the word EUR, which is shorter and still unambiguous in a Dutch-language back office. The column header names it as Paid, EUR.

**Cost:** A symbol alone fails WCAG 2.2 SC 1.4.1 if it is the only distinction. A screen reader does not always read a symbol prefix. The currency belongs in the label as well.

#### `a-zero-amount-says-why`: A zero amount says why

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
    field "Scope" select = "Any state"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "3H3C68" · text "Elin Lindqvist" · text "7 Oct 22:14" · text "Refunded" · text muted "Nothing, refunded"
```

**Rationale:** EUR 0.00 is a real state, not an error, so the cell names it: Fully refunded. A bare zero reads as missing data, and the word says it is a fact.

**Cost:** A word in a numeric column breaks the alignment. It has to be short enough not to push the column wide.

#### `two-money-columns-charged-and-refunded`: Two money columns: charged and refunded

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
    field "Scope" select = "Any state"
  region "Orders"
    text muted "Refunded is the total that went back to the customer."
    table 6 "Order" "Customer" "Placed" "State" "Charged" "Refunded"
      item: text "3H3C68" · text "Elin Lindqvist" · text "7 Oct 22:14" · text "Refunded" · text "EUR 50.00" · text "EUR 50.00"
```

**Rationale:** Where refunds are common, the net matters more than the gross. A second column turns a negative into a fact rather than something the reader has to reconstruct.

**Cost:** Two money columns on a five-column table is a lot of numbers. Most rows are identical in both, so the reader scans two equal columns to learn nothing.

#### `money-as-a-share-of-the-total`: Money as a share of the total

```wireframe
page
  breadcrumb "Home" "Deliveries" "Garcia Interiors restock" "Orders"
  header
    heading "Garcia Interiors restock"
    text "1,204 orders in this delivery."
  toolbar
    field "Search orders" search
    field "Scope" select = "Any state"
  region "Orders"
    table 6 "Order" "Customer" "Placed" "State" "Paid" "Share"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00" · text "100.0%"
```

**Rationale:** For a table read to answer what this delivery took, the amount column is joined by a share. The reader gets proportion without a second table.

**Cost:** A share is derived from the total, so it goes stale the moment the filter changes. One column of derived percentages is a small exception, not a pattern.

#### `amounts-grouped-by-day`: Amounts grouped by day

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Newest first, grouped by day."
  toolbar
    field "Order number, name or email" search
  region "Today, 8 Oct 2026"
    table 3 "Order" "Customer" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "EUR 125.00"
    text muted "Total EUR 270.00."
  region "Yesterday, 7 Oct 2026"
    table 2 "Order" "Customer" "Paid"
      item: text "3H3C68" · text "Elin Lindqvist" · text "EUR 50.00"
    text muted "Total EUR 95.00."
```

**Rationale:** Rather than a derived percentage, the table is grouped by day with a subtotal per group. The reader sees the shape of the money without a chart.

**Cost:** Grouping removes the flat row order and makes the table a different component, so pagination and select-all both get harder to reason about.

#### `a-totals-footer-under-the-money`: A totals footer under the money

```wireframe
page
  breadcrumb "Home" "Deliveries" "Garcia Interiors restock" "Orders"
  header
    heading "Garcia Interiors restock"
    text "1,204 orders in this delivery."
  toolbar
    field "Search orders" search
    field "Scope" select = "Any state"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
    fact "Total on this page" "EUR 270.00"
    text muted "The total covers the 25 orders on this page, not the 1,204 in the filter."
```

**Rationale:** Shopify reports end the money column with a totals row. The row tells what the page holds and, where a filter narrows it, what the filter holds. Finance reads the answer without exporting the list to add it up.

**Cost:** A page total invites reading it as the whole answer when the filter holds eleven pages. The footer has to say which total it is or it misleads.

**Reference:** Shopify

#### `refunded-shown-under-the-charged-amount`: Refunded shown under the charged amount

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
    field "Scope" select = "Any state"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "YB281K" · text "Ade Okafor" · text "7 Oct 19:02" · status "Disputed" critical · text "EUR 45.00" · text muted "EUR 45.00 back to the customer"
```

**Rationale:** Stripe invoice lines keep one money column. They put what went back on its second line: the charged amount, then what returned to the customer. One column stays scannable and the refund is still on the row.

**Cost:** Two lines doubles the row height, and a part refund needs a third fact, the net, which has nowhere to go in this cell.

**Reference:** Stripe

### Exporting the list

**Question:** A reader takes the orders list elsewhere. Download serves one spreadsheet now. Print serves a paper sheet. A schedule serves a repeated question. Which export does the list offer.

**Default:** `one-export-button-that-downloads-csv`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep one Export button that downloads the filtered rows as CSV. The accountant job costs one click and no decisions. Prefer a background export past a few thousand rows where a download would time out. Never ship copy as the only export. Copying the visible page silently drops every row past the pager.

#### `one-export-button-that-downloads-csv`: One Export button that downloads CSV

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order for the Garcia Interiors restock, newest first."
  toolbar
    field "Order number, name or email" search
    action "Export CSV"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The default behavior. One button in the toolbar downloads exactly the rows in the current filter as CSV. The accountant gets the Garcia Interiors restock orders with one click and no decisions.

**Cost:** There is no choice of columns or format. A reader who wants only order number and paid, or an Excel file, trims or converts it elsewhere.

#### `export-dialog-with-columns-and-format`: Export dialog with columns and format

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order for the Garcia Interiors restock, newest first."
  toolbar
    field "Order number, name or email" search
    action "Export"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  dialog
    heading "Export orders"
    text "Exports the 268 orders in the current filter."
    field "Format" select = "CSV"
    field "Order" checkbox
    field "Customer" checkbox
    field "Placed" checkbox
    field "State" checkbox
    field "Paid" checkbox
    action "Cancel"
    action primary "Export"
```

**Rationale:** The Export button opens a dialog where the reader picks the format and the columns before anything downloads. The reader states what leaves the back office rather than trimming a fixed file afterwards.

**Cost:** Two steps instead of one. The dialog has to remember or reset its choices on the next visit. The single button never has to decide.

#### `scheduled-email-export`: Scheduled email export

```wireframe
page
  breadcrumb "Home" "Orders" "Scheduled exports"
  header
    heading "Scheduled exports"
    text "Acme Supply receives its orders by email, on a rhythm it sets once."
    action "New schedule"
  region "Monday figures"
    text "One schedule per recipient, each with its own rhythm and scope."
    field "Every" select = "Monday 07:00"
    field "Send to" text = "hello@acme-supply.example"
    field "Scope" select = "Garcia Interiors restock"
    message info "The next export runs Monday at 07:00 and covers the orders placed since the last one."
```

**Rationale:** The team sets a rhythm once and finance receives the orders without opening the back office. A Monday 07:00 email answers the weekly question before anyone asks it.

**Cost:** A schedule is invisible state. Nobody sees it on the orders page. A stale recipient keeps receiving figures until someone remembers the schedule exists.

#### `print-stylesheet-with-a-print-button`: Print stylesheet with a Print button

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order for the Garcia Interiors restock, newest first."
  toolbar
    field "Order number, name or email" search
    action "Print"
  region "Orders"
    message info "Printing hides the sidebar and the toolbar and keeps the order rows."
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The Print button opens the browser print path and the print stylesheet keeps only the rows: order, customer, placed, state, and paid. The pickup counter gets a pickup sheet that works when the network does not.

**Cost:** Paper freezes the list at print time. An order paid after printing is missing. Nothing on the sheet says how old it is except the printed date.

#### `per-row-receipt-download`: Per-row receipt download

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order for the Garcia Interiors restock, newest first."
  toolbar
    field "Order number, name or email" search
  region "Receipts"
    text "One file per order, for answering one customer."
    list 1
      item: text "7K4Q2M" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00" · action "Receipt"
```

**Rationale:** Each row carries its own receipt. Answering one customer means downloading one file rather than exporting the whole list and cutting it down. Order 7K4Q2M for Maria Garcia downloads as its own EUR 125.00 receipt.

**Cost:** A button on every row narrows the table. It invites downloading receipts one by one for a job that wants the whole list. That is slower than one export.

#### `copy-the-list-to-the-clipboard`: Copy the list to the clipboard

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order for the Garcia Interiors restock, newest first."
  toolbar
    field "Order number, name or email" search
    action "Copy visible rows"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  toast positive "25 visible orders copied as tab-separated values."
```

**Rationale:** One button copies the visible rows as tab-separated values, which paste straight into a spreadsheet. Nothing downloads, so there is no file to find, rename, or delete afterwards.

**Cost:** Only the visible page is copied. Pasting 25 rows when the filter holds 268 silently drops the rest unless the reader notices the pager.

#### `a-large-export-that-runs-in-the-background`: A large export that runs in the background

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order for the Garcia Interiors restock, newest first."
  toolbar
    field "Order number, name or email" search
    action disabled "Exporting"
  region "Orders"
    message info "Preparing 9,412 orders as CSV. The file arrives by email to hello@acme-supply.example."
    text muted "34 percent done."
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The bulk export prepares a large file while the reader keeps working, then email sends a download link. Past a few thousand rows a direct download times out, and a progress note beats a failed one.

**Cost:** The file arrives later, so the reader cannot reconcile against it right away. The export also needs its own failure state when the job dies overnight.

**Reference:** Shopify

#### `export-history-with-repeat-download`: Export history with repeat download

```wireframe
page
  breadcrumb "Home" "Orders" "Export history"
  header
    heading "Export history"
    text "Every file that left the orders list, newest first."
    action "New export"
  region "Export history"
    text "Files stay for 30 days, then they are removed."
    table 4 "File" "Rows" "Asked" "By"
      item: text "garcia-restock-orders-oct.csv" · text "268" · text "8 Oct 09:41" · text "Priya Shah" · action "Download"
```

**Rationale:** The dashboard keeps every export in a list with its rows, its date, and who asked for it, and each one downloads again. The Monday figures are re-downloaded rather than re-built, and finance can see what left the back office.

**Cost:** Stored files with customer data need their own retention and access rule. A history nobody prunes becomes a second database of personal data.

**Reference:** Stripe

### Searching with highlighted matches

**Question:** A search box filters the orders table. A match on an email looks the same as a match on a name. How does the list show why each row matched.

**Default:** `matches-highlighted-in-the-cells`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Highlight the matches in the cells. The reader sees why each row matched without opening it. Prefer a scope control once readers search across deliveries and must say which one. Never ship a match column on its own. It spends a column stating what the highlight already shows.

#### `matches-highlighted-in-the-cells`: Matches highlighted in the cells

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "2 of 268 orders match maria."
  toolbar
    field "Order number, name or email" search = "maria"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · text "Paid" · text "EUR 125.00"
```

**Rationale:** The code search marks the matched text where it sits. The term stays visible in the box and every match glows in its cell, so the reader trusts the filter.

**Cost:** Highlighting needs the match offsets from the server, not the rows alone. A client-side guess highlights the wrong occurrence on long text.

**Reference:** GitHub

#### `scoped-search-this-delivery-or-all-deliveries`: Scoped search: this delivery or all deliveries

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Searching Garcia Interiors restock for maria."
  toolbar
    field "Order number, name or email" search = "maria"
    field "Scope" select = "Garcia Interiors restock"
  region "Orders"
    text "1 match in Garcia Interiors restock. 1 more in all deliveries."
    table 4 "Order" "Customer" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "Paid" · text "EUR 125.00"
```

**Rationale:** The search is scoped to the current view or the whole store from one control beside the box. A reader inside the Garcia Interiors restock searches it first and widens only when nothing matches.

**Cost:** A scope is invisible once set. A reader who narrowed to one delivery last week searches it again today and wonders where the rest went.

**Reference:** Shopify

#### `a-match-column-naming-where-it-matched`: A match column naming where it matched

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "3 of 268 orders match restock."
  toolbar
    field "Order number, name or email" search = "restock"
  region "Orders"
    table 4 "Order" "Customer" "Matched" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text muted "Delivery: Garcia Interiors restock" · text "EUR 125.00"
```

**Rationale:** The issue search says which field matched when the term sits somewhere the row does not show. The column answers why this row is here for matches in notes or metadata.

**Cost:** A column spent stating what a highlight already shows, on every row, for every search. It only earns its width where rows match on hidden fields.

**Reference:** GitHub

#### `first-match-focused-for-the-keyboard`: First match focused for the keyboard

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "2 of 268 orders match maria."
  toolbar
    field "Order number, name or email" search = "maria"
  region "Orders"
    text "Enter opens the first match. Up and down move between them."
    table 4 "Order" "Customer" "State" "Paid"
      item: link "7K4Q2M" · text "Maria Garcia" · text "Paid" · text "EUR 125.00"
```

**Rationale:** The first result is focused as the reader types, so Enter opens it without a click. Support answering a caller moves from term to record without touching the mouse.

**Cost:** A focused row looks selected, and Enter opening it surprises a reader who meant to refine the term. The hint has to teach the key or it misfires.

**Reference:** Linear

#### `recent-searches-under-the-box`: Recent searches under the box

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order across every delivery, newest first."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
  popover
    text "Recent searches"
    action quiet "maria garcia"
    action quiet "7K4Q2M"
    action quiet "disputed"
    action quiet "Clear recent searches"
```

**Rationale:** The reader's own recent terms sit under an empty search box. A term searched twice a day costs one click instead of fourteen keystrokes.

**Cost:** Recent terms are stored per user with their own privacy question, and a term from a finished delivery lingers until it is cleared.

**Reference:** Vercel

#### `a-searching-indicator-while-the-server-answers`: A searching indicator while the server answers

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Searching for maria garcia restock."
  toolbar
    field "Order number, name or email" search = "maria garcia restock"
    action quiet "Stop"
  region "Orders"
    message info "Searching 268 orders for maria garcia restock."
```

**Rationale:** The dashboard says when a search is still running rather than showing yesterday's rows as if they matched. The reader waits instead of acting on a stale list.

**Cost:** A visible search state needs debouncing and canceling, or every keystroke queues a request and the indicator flickers.

**Reference:** Stripe

### Grouped rows

**Question:** Some questions are asked per group, not per row: what did today take, what does each delivery hold. A flat table answers them only after an export, while a group header with its own subtotal answers them on the page.

**Default:** `grouped-by-day-with-subtotals`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep grouped by day with subtotals. It answers what today took without a chart and without leaving the list. The runner-up is grouped by delivery with collapse toggles. Prefer it once deliveries grow so one day of rows stops fitting. Never ship two group levels: month-then-day nesting turns the list into a tree that paging cannot cross.

#### `grouped-by-day-with-subtotals`: Grouped by day with subtotals

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Newest first, grouped by day."
  toolbar
    field "Order number, name or email" search
    field "Any state" select = "Any state"
  region "Today, 8 Oct 2026, 4 orders"
    fact "Subtotal" "EUR 270.00"
    table 4 "Order" "Customer" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  region "Yesterday, 7 Oct 2026, 2 orders"
    fact "Subtotal" "EUR 95.00"
    table 4 "Order" "Customer" "State" "Paid"
      item: text "YB281K" · text "Ade Okafor" · status "Disputed" critical · text "EUR 45.00"
```

**Rationale:** Bank statements and Stripe payouts group money by day with a subtotal per group. The reader sees the shape of the takings and still opens any row.

**Cost:** Grouping removes the flat row order, so pagination and select-all both get harder to reason about across group edges.

**Reference:** Stripe

#### `grouped-by-delivery-with-collapse-toggles`: Grouped by delivery with collapse toggles

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Grouped by delivery. Becker spring refill and Lindqvist studio courier are collapsed."
  toolbar
    field "Order number, name or email" search
    field "Group" select = "Delivery"
  region "Garcia Interiors restock, 3 orders"
    fact "Subtotal" "EUR 225.00"
    action quiet "Collapse"
    table 4 "Order" "Customer" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  region "Becker spring refill, 2 orders"
    fact "Subtotal" "EUR 90.00"
    action quiet "Expand"
  region "Lindqvist studio courier, 1 order"
    fact "Subtotal" "EUR 45.00"
    action quiet "Expand"
```

**Rationale:** Linear's group-by puts a toggle on each group header, so a reader following one delivery collapses the rest. The header carries the count and the subtotal even while collapsed.

**Cost:** Collapsed groups hide rows from find-in-page and from a reader who forgot they collapsed anything. The toggle state needs to survive a reload or it annoys.

**Reference:** Linear

#### `grouped-by-state`: Grouped by state

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Grouped by state, disputed first."
  toolbar
    field "Order number, name or email" search
    field "Group" select = "State"
  region "Disputed, 1 order"
    fact "Subtotal" "EUR 45.00"
    table 4 "Order" "Customer" "Placed" "Paid"
      item: text "YB281K" · text "Ade Okafor" · text "7 Oct 19:02" · text "EUR 45.00"
  region "Awaiting payment, 1 order"
    fact "Subtotal" "EUR 45.00"
    table 4 "Order" "Customer" "Placed" "Paid"
      item: text "8M3DWR" · text "Ade Okafor" · text "8 Oct 06:22" · text "EUR 45.00"
  region "Paid, 3 orders"
    fact "Subtotal" "EUR 220.00"
    table 4 "Order" "Customer" "Placed" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · text "EUR 125.00"
```

**Rationale:** Linear groups issues by status so the blocked ones read as one block. Here the disputed and awaiting rows sit together at the top, which is the triage order support wants.

**Cost:** States change under the reader: paying an order moves it to another group, which reads as the row vanishing. The list has to say where it went.

**Reference:** Linear

#### `no-grouping-a-group-column-that-sorts`: No grouping: a group column that sorts

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Sorted by delivery, newest first inside each delivery."
  toolbar
    field "Order number, name or email" search
    field "Sort" select = "Delivery"
  table 5 "Order" "Delivery" "Customer" "State" "Paid"
    item: text "7K4Q2M" · text "Garcia Interiors restock" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** Carbon keeps the table flat and lets the reader sort by the would-be group field instead. Nothing hides, paging stays simple, and the eye groups adjacent equal values on its own.

**Cost:** No subtotals: the reader who wants today's takings sorts by date and adds the rows up by hand. Sorting is not grouping, it only looks like it.

**Reference:** Carbon

#### `group-headers-that-select-the-group`: Group headers that select the group

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders to decide, grouped by day."
  toolbar
    field "Search refunds" search
    field "Any window" select = "Any window"
  region "Today, 8 Oct 2026, 2 selected"
    field "Select today, 8 Oct 2026" checkbox
    fact "Subtotal" "EUR 175.00"
    table 4 "Order" "Customer" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  region "Yesterday, 7 Oct 2026, 2 orders"
    field "Select yesterday, 7 Oct 2026" checkbox
    fact "Subtotal" "EUR 95.00"
    table 4 "Order" "Customer" "State" "Paid"
      item: text "YB281K" · text "Ade Okafor" · status "Disputed" critical · text "EUR 45.00"
```

**Rationale:** Outlook and Gmail let a reader tick a whole conversation from its header. Here one checkbox refunds the day orders together, which is the batch the team runs.

**Cost:** Selecting a group selects rows the reader may not have seen, including a disputed one that should never be batch-refunded. The confirm has to name them all.

**Reference:** Outlook

#### `two-levels-month-then-day`: Two levels: month, then day

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Grouped by month, then by day."
  toolbar
    field "Order number, name or email" search
    field "Any state" select = "Any state"
  region "October 2026, 231 orders"
    fact "Subtotal" "EUR 10,395.00"
    text "Today, 8 Oct 2026, 4 orders, EUR 270.00"
    table 4 "Order" "Customer" "State" "Paid"
      item: text "7K4Q2M" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  region "September 2026, 37 orders"
    fact "Subtotal" "EUR 1,665.00"
```

**Rationale:** Xero and bank statements nest day groups inside month groups for a year of rows. October holds its days, and the year reads as twelve subtotals before any row is shown.

**Cost:** Two levels of headers for 268 rows is mostly chrome: the month header, the day header, then one row. Nesting pays off past thousands of rows, not hundreds.

**Reference:** Xero

### Inline row expansion

**Question:** Some rows hold a second level: an order holds its lines, its units, its history. Opening the record for each one costs a page load per row. An expansion row under the row itself answers the question where it was asked.

**Default:** `expand-to-the-order-lines`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep expansion to the order lines. It answers what the customer bought, which is the question asked from the list. The runner-up is expansion to units with pickup state. Prefer it on the pickup list where handover is the work. Never ship expand-all: twenty expanded rows is a page nobody can scan, and one click fires a read per row.

#### `expand-to-the-order-lines`: Expand to the order lines

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  toolbar
    field "Order number, name or email" search
  table 4 "Order" "Customer" "State" "Paid"
    item: text "7K4Q2M" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  card "7K4Q2M lines"
    action quiet "Collapse"
    fact "Oak desk lamp, 2" "EUR 90.00"
    fact "Desk chair, 1" "EUR 35.00"
```

**Rationale:** Stripe's invoice list expands a row to its lines: what was bought, at what price, adding to the row total. Support answers 'what did I pay for' without leaving the list.

**Cost:** The detail row breaks the column rhythm, and sorting reorders parents while children follow, which confuses a reader who sorted by money.

**Reference:** Stripe

#### `expand-to-the-order-timeline`: Expand to the order timeline

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  toolbar
    field "Order number, name or email" search
  table 4 "Order" "Customer" "State" "Paid"
    item: text "7K4Q2M" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  card "7K4Q2M history"
    action quiet "Collapse"
    timeline 3
      item: text "Placed" · text muted "8 Oct 2026, 09:32"
```

**Rationale:** Zendesk expands a record to its history: placed, paid, confirmation sent. The history sits under the row it belongs to, newest last, so the reader sees what happened in order.

**Cost:** History grows without bound: a disputed order's expansion is a page of its own. It needs trimming to the last few entries with a link to the rest.

**Reference:** Zendesk

#### `expand-to-units-and-pickup-state`: Expand to units and pickup state

```wireframe
page
  breadcrumb "Home" "Deliveries" "Garcia Interiors restock" "Pickup list"
  header
    heading "Pickup list"
    text "Garcia Interiors restock, today. What is collected and what is not."
  toolbar
    field "Customer name or order number" search
  table 3 "Order" "Customer" "Collected"
    item: text "V7VZNX" · text "Elin Lindqvist" · text "1 of 2"
  card "V7VZNX units"
    action quiet "Collapse"
    fact "Oak desk lamp A-1041, Counter 1" "09:41"
    fact "Oak desk lamp A-1042" "Not yet"
```

**Rationale:** A pickup list expands an order to its units with what is collected and where. The warehouse lead works the list at the counter instead of opening forty records.

**Cost:** Pickup state changes by the second at busy times, so an expanded row goes stale while it is open. It needs the same refresh the pickup screen has.

#### `one-row-open-at-a-time`: One row open at a time

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Opening a row closes the one that is open."
  toolbar
    field "Order number, name or email" search
  table 4 "Order" "Customer" "State" "Paid"
    item: text "STT855" · text "Tom Becker" · status "Paid" positive · text "EUR 50.00"
  card "STT855 lines"
    action quiet "Collapse"
    fact "Oak desk lamp, 1" "EUR 45.00"
    fact "Shipping, 1" "EUR 5.00"
```

**Rationale:** Carbon's accordion rule applied to the table: opening a row closes the last one. The list never grows past one detail, so the reader cannot lose their place in it.

**Cost:** Comparing two orders means opening, memorizing, closing, and opening. The rule trades comparison for tidiness.

**Reference:** Carbon

#### `an-expand-all-control-above-the-table`: An expand-all control above the table

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  toolbar
    field "Order number, name or email" search
    action "Collapse all"
  table 3 "Order" "Customer" "Paid"
    item: text "7K4Q2M" · text "Maria Garcia" · text "EUR 125.00"
  card "7K4Q2M lines"
    fact "2 Oak desk lamps" "EUR 90.00"
    fact "Desk chair, 1" "EUR 35.00"
  card "STT855 lines"
    fact "Oak desk lamp, 1" "EUR 45.00"
    fact "Shipping, 1" "EUR 5.00"
```

**Rationale:** GOV.UK's accordion pairs every toggle with a Show all control, so a reader checking every order's lines presses once instead of twenty-five times.

**Cost:** Twenty expanded rows is a page nobody can scan, and each detail needs its own data, so Show all fires twenty-five reads at once.

**Reference:** GOV.UK

#### `no-expansion-the-row-opens-the-record`: No expansion: the row opens the record

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "The order number opens the record. Nothing expands in place."
  toolbar
    field "Order number, name or email" search
  table 4 "Order" "Customer" "State" "Paid"
    item: link "7K4Q2M" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The order number is a link and everything lives on the record page. One pattern for detail everywhere, and the list stays a list.

**Cost:** Every question costs a page load and a back button. Checking three orders means six page loads where expansion needs none.

### Pinned and resizing columns

**Question:** A wide table scrolls, and a scrolling table loses its bearings. The order code leaves as the money arrives. Pinning the identity column keeps the row named, and resizing lets the reader spend width where their own data needs it.

**Default:** `the-order-column-pinned-while-the-rest-scroll`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the order column pinned while the rest scroll. The row stays named at any scroll position, and it costs no control. The runner-up pins the actions too. Prefer it once rows carry inline commands that must stay reachable. Never ship draggable widths in a first release: per-user widths are stored state that support cannot see and screenshots cannot hold.

#### `the-order-column-pinned-while-the-rest-scroll`: The order column pinned while the rest scroll

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "The order column stays while the rest scroll under it."
  toolbar
    field "Order number, name or email" search
  table 8 "Order" "Delivery" "Placed" "Customer" "Channel" "State" "Method" "Paid"
    item: text "7K4Q2M" · text "Garcia Interiors restock" · text "8 Oct 2026, 09:32" · text "Maria Garcia" · text "Online" · status "Paid" positive · text "Bank transfer" · text "EUR 125.00"
```

**Rationale:** Shopify's orders index pins the order column and lets the other seven scroll under it. Nothing is folded, so every fact keeps its own scannable column.

**Cost:** On a phone the reader sees the order code and one other column at a time. Pinning keeps the bearings, not the overview.

**Reference:** Shopify

#### `first-and-last-pinned-actions-always-visible`: First and last pinned, actions always visible

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Order stays left, Resend stays right."
  toolbar
    field "Order number, name or email" search
  table 7 "Order" "Delivery" "Customer" "Channel" "State" "Paid" "Action"
    item: text "7K4Q2M" · text "Garcia Interiors restock" · text "Maria Garcia" · text "Online" · status "Paid" positive · text "EUR 125.00" · action "Resend"
```

**Rationale:** Airtable pins the record name on the left and the row commands on the right, so both survive any scroll position. Acting never requires scrolling back.

**Cost:** Two pinned columns on a phone leave no room for the middle at all. The pattern needs a wide screen to earn its keep.

**Reference:** Airtable

#### `draggable-widths-with-resize-handles`: Draggable widths with resize handles

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Drag a header edge to resize. Double-click it to fit the content."
  toolbar
    field "Order number, name or email" search
  table 5 "Order" "Customer" "Placed" "State" "Paid"
    item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 2026, 09:32" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** Airtable and Retool put a handle on every header edge: drag it and the column follows. A reader with long delivery names spends width there instead of on the order code.

**Cost:** Widths are per-user stored state that support cannot see, screenshots cannot hold, and a new column resets. A wide table of eight resizable columns is also eight ways to break the layout.

**Reference:** Airtable

#### `pin-any-column-from-its-header-menu`: Pin any column from its header menu

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "The Customer column menu is open."
  toolbar
    field "Order number, name or email" search
  table 5 "Order" "Customer" "Placed" "State" "Paid"
    item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 2026, 09:32" · status "Paid" positive · text "EUR 125.00"
  popover
    action "Sort ascending"
    action "Sort descending"
    action "Pin to the left"
    action "Hide column"
```

**Rationale:** Notion lets any column pin left from its header menu. This option draws the menu open on Customer. The reader decides what their bearings are instead of the back office deciding for them.

**Cost:** Pinning plus hiding plus sorting in one menu is three features wearing one trigger. Most readers find none of them.

**Reference:** Notion

#### `no-pinning-the-table-scrolls-as-one`: No pinning: the table scrolls as one

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every column scrolls together. Nothing stays."
  toolbar
    field "Order number, name or email" search
  table 7 "Order" "Delivery" "Customer" "Channel" "State" "Method" "Paid"
    item: text "7K4Q2M" · text "Garcia Interiors restock" · text "Maria Garcia" · text "Online" · status "Paid" positive · text "Bank transfer" · text "EUR 125.00"
```

**Rationale:** Carbon's default: the table scrolls as one piece and every column leaves together. No sticky edges, no shadows, no special cases in the CSS.

**Cost:** Halfway across, the money column arrives and the order code is gone. The reader scrolls back to check which row the amount belongs to.

**Reference:** Carbon

#### `double-click-a-header-edge-to-fit-content`: Double-click a header edge to fit content

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "The customer column is fitted to 150 pixels. Double-click its header edge to fit the longest value instead."
  toolbar
    field "Order number, name or email" search
  table 5 "Order" "Customer" "Placed" "State" "Paid"
    item: text "7K4Q2M" · text "Maria Garcia, maria@garcia-interiors.example" · text "8 Oct 2026, 09:32" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** Google Sheets fits a column to its widest value on a double-click of the header edge. No dragging, no stored widths: the table answers the data it holds right now.

**Cost:** Nobody discovers a double-click on a header edge without being told, and fitting to content reintroduces the page-2 shift that fixed widths prevent.

**Reference:** Google Sheets

### Deliveries as a grid

**Question:** Deliveries are few and dated: the company runs a handful a week and asks how each one is doing. A table answers with rows of numbers, while a card answers with the run itself: its date, its warehouse, and how full it is.

**Default:** `delivery-cards-with-a-load-bar`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep delivery cards with a load bar. Four deliveries read better as four cards than as four rows. The bar answers the only question the list exists for. The runner-up is a date-led list. Prefer it once the year holds dozens of runs and cards stop fitting. Never ship the month calendar: it answers when, which the deliveries list is never asked.

#### `delivery-cards-with-a-load-bar`: Delivery cards with a load bar

```wireframe
page
  breadcrumb "Home" "Deliveries"
  header
    heading "Deliveries"
    text "Four deliveries, three with a date still ahead."
    action primary "New delivery"
  toolbar
    field "Search deliveries" search
  grid 4
    card "Becker spring refill"
      image "Route map"
      text "Fri 9 Oct 2026, Rotterdam depot"
      status "Scheduled" info
      fact "Loaded" "32 of 40 pallets"
      action "Open"
```

**Rationale:** Each delivery is a card with its date, its warehouse, and how full it is. Four deliveries a week read as four runs, not as four rows of a table.

**Cost:** Cards stop scanning past a dozen deliveries: no column to sort, no state to scan down. The pattern fits a handful, not a hundred.

#### `a-table-with-a-load-progress-column`: A table with a load progress column

```wireframe
page
  breadcrumb "Home" "Deliveries"
  header
    heading "Deliveries"
    text "Four deliveries, three with a date still ahead."
    action primary "New delivery"
  toolbar
    field "Search deliveries" search
  table 5 "Delivery" "Date" "State" "Loaded" "Action"
    item: text "Becker spring refill" · text "9 Oct 2026" · status "Scheduled" info · text "32 of 40 pallets" · action "Open"
```

**Rationale:** Shopify's product list keeps the table and adds an inventory bar per row. The deliveries stay sortable and comparable, and the bar still answers how full each one is.

**Cost:** A bar in a table row is a chart without an axis. 80 percent of 40 pallets and 53 percent of 60 pallets read as two bars of different lengths for different totals.

**Reference:** Shopify

#### `a-date-led-list-with-month-dividers`: A date-led list with month dividers

```wireframe
page
  breadcrumb "Home" "Deliveries"
  header
    heading "Deliveries"
    text "Four deliveries, three with a date still ahead."
    action primary "New delivery"
  toolbar
    field "Search deliveries" search
  region "October 2026"
    list 2
      item: text "Becker spring refill" · text muted "Rotterdam depot, 08:00" · status "Scheduled" info · text "32 of 40 pallets"
  region "December 2026"
    list 1
      item: text "Okafor office setup" · text muted "Amsterdam warehouse, 08:00" · status "Draft" neutral · text "Not scheduled yet"
```

**Rationale:** Google Calendar's schedule view leads with the date and groups by month. A planner reads October, then December, then March, each run under its own day.

**Cost:** Dates lead and states follow, so finding the one draft means reading every month. The view answers when, not what needs work.

**Reference:** Google Calendar

#### `a-month-calendar-with-delivery-chips`: A month calendar with delivery chips

```wireframe
page
  breadcrumb "Home" "Deliveries"
  header
    heading "Deliveries"
    text "October 2026. Two runs scheduled."
    action primary "New delivery"
  toolbar
    action quiet "Previous month"
    action quiet "Next month"
  region "October 2026"
    grid 31
      item: text "9" · text "Becker spring refill"
```

**Rationale:** Google Calendar draws the month as a grid and each delivery as a chip on its day. Clashes show as two chips on one square, which no list makes visible.

**Cost:** Four deliveries on thirty squares is mostly empty grid, and nothing on a chip says how full the run is. The calendar answers scheduling, not loading.

**Reference:** Google Calendar

#### `compact-rows-with-a-status-word`: Compact rows with a status word

```wireframe
page
  breadcrumb "Home" "Deliveries"
  header
    heading "Deliveries"
    text "Four deliveries, three with a date still ahead."
    action primary "New delivery"
  toolbar
    field "Search deliveries" search
  table 4 "Delivery" "Owner" "State" "Date"
    item: text "Becker spring refill" · text "Alex Morgan" · text muted "Scheduled" · text "9 Oct 2026"
```

**Rationale:** Linear's project list is one quiet row per project: name, owner, status, date. A team holding forty runs scans states down one column instead of opening forty cards.

**Cost:** Quiet rows hide the load: nothing says how full a run is until it is opened. The list answers state, not loading.

**Reference:** Linear

#### `a-table-grid-toggle-the-reader-sets`: A table/grid toggle the reader sets

```wireframe
page
  breadcrumb "Home" "Deliveries"
  header
    heading "Deliveries"
    text "Four deliveries, three with a date still ahead."
    action primary "New delivery"
  toolbar
    field "Search deliveries" search
    field "View" select = "Grid"
  grid 2
    card "Becker spring refill"
      image "Route map"
      text "Fri 9 Oct 2026, Rotterdam depot"
      status "Scheduled" info
      fact "Loaded" "32 of 40 pallets"
      action "Open"
```

**Rationale:** Notion lets the reader switch a view between table and board without leaving the page. Finance keeps the table, the warehouse lead keeps the cards, and both read the same deliveries.

**Cost:** Two views of one list is two layouts to build, two to test, and a toggle whose state must survive reloads and shared links.

**Reference:** Notion

### List on a phone

**Question:** At 390 pixels the five-column table cannot survive: the columns either crush or scroll. Every option here answers the same question, what the orders list becomes on a phone. Each one keeps a different capability: reading, sorting, acting, or comparing.

**Default:** `two-line-rows-with-money-right`

**Compact:** Below 640 pixels the table becomes two-line rows with the amount right. Sorting moves to a Sort control. The compact option is `two-line-rows-with-money-right`.

**Rationale:** Keep two-line rows with money right. The rows read well at 390 pixels and keep the order code, the customer, and the amount. They pair with a Sort control where sorting matters. The runner-up is a scroll container with a sticky first column. Prefer it for the rare phone task that needs every column. Never ship a phone list that hides behind search: a list that starts empty teaches the reader there is nothing to see.

#### `two-line-rows-with-money-right`: Two-line rows with money right

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  toolbar
    field "Order number, name or email" search
    field "Any state" select = "Any state"
  list 6
    item: link "7K4Q2M" · text "EUR 125.00" · text muted "Maria Garcia, 8 Oct 09:32" · status "Paid" positive
```

**Rationale:** Stripe's mobile list and Polaris condensed rows read as order over customer on the left, money over state on the right. Everything fits 390 pixels with nothing scrolling sideways.

**Cost:** No headers, so no sorting and no comparison down a column. Sorting moves to a control, and comparing moves to the desktop.

**Reference:** Stripe

#### `stacked-records-with-labeled-cells`: Stacked records with labeled cells

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every cell keeps its label. 268 orders, two shown."
  toolbar
    field "Order number, name or email" search
  region "7K4Q2M"
    fact "Delivery" "Garcia Interiors restock"
    fact "Customer" "Maria Garcia"
    fact "Placed" "8 Oct 2026, 09:32"
    fact "State" "Paid"
    fact "Paid" "EUR 125.00"
  region "STT855"
    fact "Customer" "Tom Becker"
    fact "Paid" "EUR 50.00"
```

**Rationale:** GOV.UK's responsive tables stack each row into labeled values on a narrow screen. Nothing is dropped and nothing needs discovering: every fact keeps its name.

**Cost:** One order fills the screen, so six orders is six screens of scrolling. Thorough, and too long to scan.

**Reference:** GOV.UK

#### `a-scroll-container-with-a-sticky-first-column`: A scroll container with a sticky first column

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Scroll sideways. The order column stays."
  toolbar
    field "Order number, name or email" search
  table 5 "Order" "Customer" "Placed" "State" "Paid"
    item: text "7K4Q2M" · text "Maria Garcia" · text "8 Oct 09:32" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** Shopify's mobile tables keep every column and scroll sideways under a pinned first column. Nothing is redesigned for the phone: the table is the table, with its bearings kept.

**Cost:** Sideways scrolling hides four of five columns at any moment, and comparing two columns means scrolling between them. The phone shows a window, not the list.

**Reference:** Shopify

#### `priority-columns-only`: Priority columns only

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Order, placed and email return on the record."
  toolbar
    field "Order number, name or email" search
  table 3 "Customer" "State" "Paid"
    item: text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** Financial tables keep customer, state, and money on a narrow screen and drop the rest. Three columns fit 390 pixels without scrolling, and opening the row recovers the dropped facts.

**Cost:** The order code, the placed time, and the delivery all leave. Support identifying a caller by code finds the one column they need is gone.

#### `a-card-per-order-with-its-actions`: A card per order with its actions

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders, one card each."
  toolbar
    field "Order number, name or email" search
  grid 4
    card "7K4Q2M, EUR 125.00"
      text "Maria Garcia, Garcia Interiors restock"
      status "Paid" positive
      action "Open"
      action "Resend"
```

**Rationale:** Mobile order apps draw each order as a card with its own Resend button. The phone is for acting on one order, not for comparing twenty, so each card carries its command.

**Cost:** Cards are tall: three orders fill the screen where rows fit six. A queue worked top to bottom becomes twice the scrolling.

#### `search-and-chips-above-one-line-rows`: Search and chips above one-line rows

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Find an order, then open it."
  toolbar
    field "Search orders" search
  row
    action "Needs attention"
    action "Paid"
    action "This week"
  list 6
    item: text "Maria Garcia" · text "EUR 125.00" · text muted "7K4Q2M, Garcia Interiors restock" · status "Paid" positive
```

**Rationale:** Gmail's mobile list leads with search and a chip row, then one line per message. Finding beats browsing on a phone, so the list spends its width on the query, not the columns.

**Cost:** One line per order holds the customer or the code, never both with the money. The row identifies enough to be opened, nothing more.

**Reference:** Gmail

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/patterns/lists-and-tables#keep-a-lists-view-in-its-address | guidance | Does every built screen of this kind keep this rule, including in its compact layout? |
| litespec/frontend/patterns/lists-and-tables#align-money-to-the-right-with-its-currency | guidance | Does every built screen of this kind keep this rule, including in its compact layout? |
| litespec/frontend/patterns/lists-and-tables#choosing-the-columns | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/lists-and-tables#sorting | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/lists-and-tables#filters | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/lists-and-tables#row-density | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/lists-and-tables#bulk-action-bar | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/lists-and-tables#pagination | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/lists-and-tables#row-actions | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/lists-and-tables#tables-own-states | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/lists-and-tables#status-in-a-column | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/lists-and-tables#money-column | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/lists-and-tables#exporting-the-list | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/lists-and-tables#searching-with-highlighted-matches | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/lists-and-tables#grouped-rows | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/lists-and-tables#inline-row-expansion | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/lists-and-tables#pinned-and-resizing-columns | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/lists-and-tables#deliveries-as-a-grid | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/lists-and-tables#list-on-a-phone | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
