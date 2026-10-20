# Record Detail Patterns

## Intent

A record detail page shows one business record, such as an order, a customer or a product. It shows its state, its facts, its history and the commands a reader may run on it. These patterns answer the recurring questions of that page. Each pattern offers drawn options and names a default.

## Standards

### Show one primary action in a record header

**Requirement:** A record header MUST show at most one primary action.

**Rationale:** The primary action is the answer to what a reader most often does next with this record. Two primary actions give no answer, and the reader compares labels instead of acting.

### Keep destructive commands out of the primary place

**Requirement:** A destructive command MUST NOT take the primary action's place or style in a record header.

**Rationale:** The primary place is where a hurried reader clicks. A destructive command there turns a routine visit into the most expensive mistake on the page.

## Patterns

### Record header

**Question:** One record, stated at the top. A record header always carries a title. It carries a breadcrumb when the record has a parent. It offers exactly one primary action, with everything else secondary beside it. A common failure puts a destructive action where the primary should be.

**Default:** `title-state-breadcrumb-one-primary-action`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the title, state, breadcrumb and one primary action. The state beside the title answers the first question on every record. The runner-up is the overflow menu option. It is the better choice once a record carries four or more commands.

Prefer the state-driven primary on records with a clear next step, such as an unpaid order. Never ship the title-less option. It fails the check for exactly one h1 per page.

#### `title-state-breadcrumb-one-primary-action`: Title, state, breadcrumb, one primary action

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Placed 8 Oct 2026, 09:32 by Maria Garcia of Garcia Interiors."
    action "Resend the confirmation"
    action "Refund"
    action primary "Message customer"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
    fact "Country" "Netherlands"
```

**Rationale:** This option follows the shape Polaris describes for an Acme Supply order. The state badge sits beside the title so the record's state is read before anything else.

**Cost:** Two actions of the same weight sit beside the primary. The destructive one shares a visual group with a harmless one unless the tone separates them.

**Reference:** Shopify Polaris

#### `title-and-state-only-no-description`: Title and state only, no description

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    action "Resend the confirmation"
    action primary "Refund"
  region "The order"
    fact "Delivery" "Garcia Interiors restock"
    fact "Placed" "8 Oct 2026, 09:32"
    fact "Paid" "EUR 125.00"
```

**Rationale:** The heading and its state, and nothing between them and the content. The trail already says where the record is, so the description repeats it.

**Cost:** A record with a long name or a subtle state loses the one line. That line says which delivery this order belongs to, which is the most-asked question.

#### `state-as-a-badge-under-the-title`: State as a badge under the title

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Placed 8 Oct 2026, 09:32 by Maria Garcia."
    action primary "Message customer"
  region "The order"
    fact "Delivery" "Garcia Interiors restock"
    fact "Paid" "EUR 125.00"
```

**Rationale:** The state sits on its own line under the heading rather than inline with it. A long record name wraps without dragging the badge down with it.

**Cost:** Two lines where one would do, and the badge is below the fold on a long title. Polaris puts the state in the title metadata slot, which is the inline arrangement.

**Reference:** Shopify Polaris

#### `destructive-action-in-its-own-place-separated`: Destructive action in its own place, separated

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Active" positive
    text "What this product is, and the SKU its parcels carry."
    action "Pause sales"
    menu "More"
      action "Rename the product"
      action "Duplicate the product"
      action destructive "Discontinue"
  region "Details"
    fact "Units per parcel" "1"
    fact "Stock" "412 at the Amsterdam warehouse"
    fact "Sold" "9,412 in total"
    fact "Price" "EUR 45.00"
```

**Rationale:** This option puts Discontinue immediately beside Pause sales for an Acme Supply product, both in the header. Separating the destructive one into a row menu or a lower group keeps the primary slot for the reversible command.

**Cost:** A destructive action behind a menu is three clicks from a misclick, which is the other failure. Tone plus position is the usual answer, and neither is complete alone.

#### `facts-in-the-header-commands-beside-them`: Facts in the header, commands beside them

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32"
    fact "Paid" "EUR 125.00"
    fact "Parcels" "2, both packed"
    fact "Method" "Card"
    fact "Refunds" "None"
    action primary "Message customer"
    action "Resend the confirmation"
    action "Refund"
  region "Parcels"
    list 2
      item: text "Oak desk lamp" · text muted "one per parcel" · text muted "PC-0C893968A2" · status "Packed" neutral · action "Void"
```

**Rationale:** The record's own values sit in the header as a definition list, so a reader never scrolls to learn what they are looking at. The commands stack beside it.

**Cost:** A tall header pushes the content below the fold on a phone. A four-fact list competes with the trail for the same vertical space.

#### `no-title-because-the-trail-is-the-title`: No title, because the trail is the title

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
    fact "Placed" "8 Oct 2026, 09:32"
    fact "Paid" "EUR 125.00"
  region "Parcels"
    list 2
      item: text "Oak desk lamp" · text muted "one per parcel" · status "Packed" neutral
```

**Rationale:** The breadcrumb names the record and the page opens straight into its sections. The largest possible use of the space goes to the content.

**Cost:** Fails WCAG 2.4.8 Location in spirit and reads as a bare panel. Every page carries exactly one h1, which automated checks enforce, so this fails that check.

#### `title-state-and-who-saved-it-last`: Title, state, and who saved it last

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Placed 8 Oct 2026, 09:32 by Maria Garcia of Garcia Interiors."
    text "Last saved by Priya Shah at 09:34."
    action "Resend the confirmation"
    action "Refund"
    action primary "Message customer"
  region "The order"
    fact "Customer" "Maria Garcia"
    fact "Delivery" "Garcia Interiors restock"
    fact "Placed" "8 Oct 2026, 09:32"
    fact "Paid" "EUR 125.00"
```

**Rationale:** Fewer overwrite conflicts. Support and finance share an order, so the header says who touched it last and when before anyone acts on it. A reader who sees Priya Shah saved at 09:34 asks before saving over her.

**Cost:** One more line in the header on every record, and it is only honest if the data tracks the last writer. On records nobody shares it is noise.

#### `one-primary-the-rest-in-an-overflow-menu`: One primary, the rest in an overflow menu

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Placed 8 Oct 2026, 09:32 by Maria Garcia of Garcia Interiors."
    action primary "Message customer"
    menu "More"
      action "Resend the confirmation"
      action "Refund to the original payment"
      action "Download the receipt"
      action destructive "Void the order"
  region "The order"
    fact "Customer" "Maria Garcia"
    fact "Delivery" "Garcia Interiors restock"
    fact "Placed" "8 Oct 2026, 09:32"
    fact "Paid" "EUR 125.00"
```

**Rationale:** Stripe draws one primary action on a charge and folds the rest behind an overflow menu. The header stays one line however many commands a record gains. Resend, refund and export all fit without a second row of buttons.

**Cost:** Secondary commands are a click further away, and a reader cannot tell what the menu holds without opening it. The menu also needs its items ordered by frequency, which is a judgment per record.

**Reference:** Stripe

#### `the-primary-follows-the-state`: The primary follows the state

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1031"
  header
    heading "SO-1031"
    status "Awaiting payment" caution
    text "Placed 8 Oct 2026, 09:30 by Tom Becker. EUR 40.45 is still due."
    action "Message customer"
    action primary "Record a payment"
  region "The order"
    fact "Customer" "Tom Becker"
    fact "Placed" "8 Oct 2026, 09:30"
    fact "Due" "EUR 40.45"
  region "What happens next"
    text "The hold on one lamp ends at 10:00. After that the lamp returns to stock and the order reads Expired."
```

**Rationale:** Shopify changes the primary action of an Acme Supply order with the order state, so the next step is always the button. An unpaid order offers Record a payment; a paid one offers Message customer; a disputed one offers Answer the bank.

**Cost:** The primary moves meaning between visits, so a reader who learned its place has to read its label every time. Every state needs its own chosen next step, which is a decision per record type.

**Reference:** Shopify

### Record tabs

**Question:** A record holds at most three sections, and further facets become tabs. A product record carries four facets. Tab sets stay small, at about six at most, and the active tab stays in the URL.

**Default:** `four-tabs-with-the-active-one-in-the-url`

**Compact:** Below the md breakpoint the tab row becomes a select naming the current facet. The panels stay the same. The compact option is `a-select-on-a-phone-tabs-on-a-wide-screen`.

**Rationale:** Keep the four tabs with the active one in the URL. Four stays inside every cited ceiling, and each panel repeats its tab label as a heading. The runner-up is the side rail option. It is the better choice past five facets or where one facet is a long form.

Prefer the counts option only where a facet can be empty and the count saves a wasted click. Never ship the icon tabs. Icons are forbidden in tab labels, and they add a second channel for one meaning.

#### `four-tabs-with-the-active-one-in-the-url`: Four tabs with the active one in the URL

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Active" positive
    text "What this product is, and the SKU its parcels carry."
    action "Pause sales"
    action destructive "Discontinue"
  tabs "Pricing" "Availability" "Returns" "Details"
    region "Details"
      fact "SKU" "LMP-OAK-01"
      fact "Warehouse" "Amsterdam warehouse"
      fact "Price" "EUR 45.00"
```

**Rationale:** Four facets in tabs, which is inside the six every cited system allows. GOV.UK also asks for a heading inside each panel repeating the tab label, which the Details tab does.

**Cost:** A reader cannot see two facets at once, and GOV.UK says tabs are the wrong choice when comparing across facets is the job.

**Reference:** GOV.UK

#### `three-tabs-the-fourth-becomes-a-page`: Three tabs, the fourth becomes a page

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Active" positive
    text "What this product is, and the SKU its parcels carry."
    action "Pause sales"
  tabs "Pricing" "Availability" "Returns"
    region "Pricing"
      fact "Standard price" "EUR 45.00"
      fact "Delivery fee" "EUR 5.00"
      action "Change the price"
      link "SKU and what each parcel holds"
```

**Rationale:** Hold the ceiling at three facets in tabs and push the fourth to its own route. Every cited system treats six as the ceiling; holding to three is the same discipline applied earlier.

**Cost:** One more navigation step for the reader who wants details. The fourth page joins a system that already counts its routes in the hundreds.

#### `tabs-with-counts`: Tabs with counts

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Active" positive
    action "Pause sales"
  tabs "Pricing" "Variants 3" "Returns 0" "Details"
    region "Pricing"
      fact "Standard price" "EUR 45.00"
      text muted "412 in stock at the Amsterdam warehouse"
```

**Rationale:** Each tab carries the number of things in it, so a reader knows whether a facet is worth opening before opening it. Four tabs where one holds three and another holds none.

**Cost:** Counts on tabs are a claim that has to stay true. A count of 0 invites a click that leads to an empty state.

#### `tabs-with-icons-as-well-as-words`: Tabs with icons as well as words

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Active" positive
    action "Pause sales"
  tabs "Pricing" "Availability" "Returns" "Details"
    region "Pricing"
      fact "Standard price" "EUR 45.00"
```

**Rationale:** An icon per tab so the row is scannable without reading, with the words still present for anyone who does not recognize the icons.

**Cost:** Carbon's tab guidance is explicit that icons are not permitted in tab labels. Two channels for one thing, and a second set of icons to design and maintain.

#### `scrollable-tabs-with-a-fade-at-the-edge`: Scrollable tabs with a fade at the edge

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock"
  header
    heading "Garcia Interiors restock"
    status "Scheduled" info
    action "Reschedule"
  tabs "Overview" "Parcels" "Schedule" "Dispatch" "Money" "Operations" "Orders"
    region "Overview"
      fact "Date" "Sat 14 Mar 2026"
      fact "Place" "Amsterdam warehouse"
      fact "Capacity" "40 pallets"
```

**Rationale:** Where a record genuinely needs six facets, the row scrolls horizontally with a fade at the edge so the reader knows there is more. Useful on a phone, where four tabs wrap.

**Cost:** A hidden seventh tab is a hidden feature, and a horizontal scroll on a page hides content from anyone who never swipes.

#### `tabs-below-the-summary-not-below-the-header`: Tabs below the summary, not below the header

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32 · EUR 125.00"
    action primary "Message customer"
  tabs "Lines 3" "Payment" "History"
    region "Lines"
      list 3
        item: text "Oak desk lamp" · text muted "one per parcel" · text muted "PC-0C893968A2" · status "Packed" neutral
```

**Rationale:** The summary stays visible above the tab row. A reader always knows which record they are on and what state it is in, whichever facet is open.

**Cost:** The tab row moves down the page, so it is less prominent. The summary has to be short or the tabs fall below the fold.

#### `facets-in-a-side-rail-instead-of-tabs`: Facets in a side rail instead of tabs

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Active" positive
    text "What this product is, and the SKU its parcels carry."
    action "Pause sales"
  split 1:3
    nav side
      link current "Pricing"
      link "Availability"
      link "Returns"
      link "Details"
      link "Messages"
      link "Dispatch"
    region "Pricing"
      fact "Standard price" "EUR 45.00"
      fact "Delivery fee" "EUR 5.00"
      action "Change the price"
```

**Rationale:** GitHub draws repository settings as a side rail of links rather than a tab row. The rail holds a dozen facets without scrolling and keeps the panel wide enough for a form. The current facet reads as selected in the rail, and each facet keeps its own URL.

**Cost:** The rail takes about 200 px from every facet at desktop width. On a phone it has to become a select or stack above the panel. That is a second arrangement to keep true.

**Reference:** GitHub

#### `a-select-on-a-phone-tabs-on-a-wide-screen`: A select on a phone, tabs on a wide screen

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Active" positive
    action "Pause sales"
  tabs "Pricing" "Availability" "Returns" "Details"
    region "Pricing"
      fact "Standard price" "EUR 45.00"
      text muted "412 in stock at the Amsterdam warehouse"
```

```wireframe compact
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Active" positive
    action "Pause sales"
  field "Facet" select = "Pricing"
  region "Pricing"
    fact "Standard price" "EUR 45.00"
    text muted "412 in stock at the Amsterdam warehouse"
```

**Rationale:** Polaris collapses its tab row into a select on narrow screens, so four facets fit a 390 px viewport without scrolling or wrapping. The control names the current facet and opens the same panels the tabs open.

**Cost:** Two controls for one choice, so the tab state and the select state have to stay in agreement. A reader on a phone also cannot see the other facets without opening the control.

**Reference:** Shopify Polaris

### Record summary

**Question:** The section at the top of a record answers what the reader is looking at without scrolling. It states the record's identity. A summary that states supporting information answers the wrong question.

**Default:** `facts-about-the-record-itself`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the facts about the record itself. A delivery summary states when, where and how full, which is the identity of the record rather than its support. The runner-up is the copyable identifiers option. It is the better choice on records a reader quotes elsewhere, such as an order read out on the phone.

Prefer the progress bar summary only for the one figure the company watches daily. Never ship the heading-less value row. Values with no section break the rule that a section is the only box.

#### `facts-about-the-record-itself`: Facts about the record itself

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock"
  header
    heading "Garcia Interiors restock"
    status "Scheduled" info
    text "Sat 14 Mar 2026, 08:00 to 12:00 · Amsterdam warehouse"
    action "Reschedule"
    action primary "Add a parcel"
  region "The delivery"
    fact "When" "Sat 14 Mar 2026, 08:00 to 12:00"
    fact "Where" "Amsterdam warehouse"
    fact "Capacity" "40 pallets"
    fact "Company" "Acme Supply"
    fact "Loaded" "36 of 40 pallets"
```

**Rationale:** The summary holds the facts that define this record: its date, its place, its state, what it holds. Everything else is a section below it.

**Cost:** Repeats what the header already says, since the header carries the title and state. Saying a thing twice is what the design contract forbids.

#### `one-line-of-key-values-no-heading`: One line of key values, no heading

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    action primary "Message customer"
  row
    text "Customer Maria Garcia"
    text "Delivery Garcia Interiors restock"
    text "Placed 8 Oct 2026, 09:32"
    text "Paid EUR 125.00"
  region "Parcels"
    list 1
      item: text "Oak desk lamp" · text muted "one per parcel" · status "Packed" neutral
```

**Rationale:** A single row of label and value pairs stands with no Section around it, because a summary is not a block of content. It restates the heading.

**Cost:** Breaks the rule that a Section is the only box, because the values would float on the canvas with nothing holding them together visually.

#### `money-summary-as-a-statement`: Money summary as a statement

```wireframe
page
  breadcrumb "Home" "Reports" "Statements" "September 2026"
  header
    heading "September 2026"
    text "Every euro of the month under the kind it is."
    action "Download"
  region
    fact "Product sales" "EUR 54,180.00"
    fact "Delivery fees customers paid" "EUR 6,020.00"
    fact "Total income" "EUR 60,200.00"
    fact "The processor fee" "EUR -1,143.80"
    fact "Total costs" "EUR -1,143.80"
    fact "Net for Acme Supply" "EUR 59,056.20"
```

**Rationale:** Where the record is a settlement, the summary is a statement: what came in, what went out, what is left. It adds up top to bottom, which is what the reader came for.

**Cost:** Wrong for a record with no money, and a statement is longer than a summary ought to be, so it pushes the sections down.

#### `summary-with-a-figure-and-a-sub-line-each`: Summary with a figure and a sub-line each

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock"
  header
    heading "Garcia Interiors restock"
    status "Scheduled" info
    action primary "Add a parcel"
  region "The delivery"
    fact "When" "Sat 14 Mar 2026, 08:00 to 12:00"
    text muted "In 5 days"
    fact "Where" "Amsterdam warehouse"
    text muted "40 pallets"
    fact "Loaded" "36"
    text muted "Across every parcel"
    fact "Money so far" "EUR 60,200.00"
    text muted "Products and delivery fees"
```

**Rationale:** Each fact carries a figure and a quieter line under it, as a figure row with a sub-line. A count beside its unit, a money figure beside what it is.

**Cost:** A figure and a sub-line per fact needs three columns or a wide row. The sub-lines repeat the label meaning in more words.

#### `summary-with-a-progress-bar-for-the-one-number-that-matters`: Summary with a progress bar for the one number that matters

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock"
  header
    heading "Garcia Interiors restock"
    status "Scheduled" info
    text "Sat 14 Mar 2026, 08:00 to 12:00 · Amsterdam warehouse"
    action primary "Add a parcel"
  region "Load"
    figure "Loaded of 40 pallets" "36"
    text "4 left"
    action "Raise capacity"
    action "Add a parcel"
  region "Details"
    fact "When" "Sat 14 Mar 2026"
    fact "Where" "Amsterdam warehouse"
    fact "Company" "Acme Supply"
```

**Rationale:** One number, 'pallets left', carries a bar and a count. Everything else is plain text, because one figure is worth watching and four are not.

**Cost:** Choosing which number matters is a judgment the data has to support. A bar on a capacity figure implies a ratio that stops mattering once loading is over.

#### `no-summary-straight-to-sections`: No summary, straight to sections

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32"
    action primary "Message customer"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
    fact "Phone" "Not given"
    fact "Country" "Netherlands"
  region "What was bought"
    fact "Oak desk lamp, 2 x EUR 45.00" "EUR 90.00"
    fact "Delivery fee" "EUR 10.00"
    fact "Cable tray, collect at the counter" "EUR 25.00"
    fact "Paid" "EUR 125.00"
```

**Rationale:** The header already states the record and its state, so the summary is dropped. Every fact appears once, in the section it belongs to.

**Cost:** The reader scrolls to learn what the record is. For a long record that is a real cost, and the record-page shape reserves a summary slot for exactly this reason.

#### `facts-plus-copyable-identifiers`: Facts plus copyable identifiers

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Placed 8 Oct 2026, 09:32 by Maria Garcia of Garcia Interiors."
    action primary "Message customer"
  region "The order"
    fact "Customer" "Maria Garcia"
    fact "Delivery" "Garcia Interiors restock"
    fact "Placed" "8 Oct 2026, 09:32"
    fact "Paid" "EUR 125.00"
    fact "Order" "SO-1042"
    action quiet "Copy"
    fact "Payment" "SH-88213"
    action quiet "Copy"
    fact "Email" "maria@garcia-interiors.example"
    action quiet "Copy"
```

**Rationale:** Stripe puts a copy button beside every identifier on a charge. Support reads a reference out on the phone or pastes it into a dispute. The human facts stay plain text; the order number, payment reference and customer email copy with one click.

**Cost:** A copy button per row is visual noise on a record nobody quotes. Each button needs its copied confirmation, which is a small behavior per row.

**Reference:** Stripe

#### `four-tiles-instead-of-a-section`: Four tiles instead of a section

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock"
  header
    heading "Garcia Interiors restock"
    status "Scheduled" info
    text "Sat 14 Mar 2026, 08:00 to 12:00 · Amsterdam warehouse"
    action "Reschedule"
    action primary "Add a parcel"
  row
    figure "Loaded of 40 pallets" "36"
    figure "Left, 10 percent of the load" "4"
    figure "Money so far, products and delivery fees" "EUR 60,200.00"
    figure "Days to dispatch, loading ends 13 Mar 23:59" "5"
  region "The delivery"
    fact "When" "Sat 14 Mar 2026, 08:00 to 12:00"
    fact "Where" "Amsterdam warehouse"
    fact "Company" "Acme Supply"
```

**Rationale:** Vercel opens a project on four stat tiles. Four figures side by side compare at a glance where a fact list reads line by line. Loaded, left, money so far and days to dispatch are the four the company checks each morning.

**Cost:** Tiles carry figures, not sentences, so anything that needs a qualifier does not fit. A tile row also answers nothing about who or where, so the facts still need a home below it.

**Reference:** Vercel

### Record aside

**Question:** A record page has an aside slot for what supports the record rather than describing it. An order record puts its history there, which is the right use. A record with no supporting content leaves the slot empty.

**Default:** `history-in-the-aside-sections-in-the-main-column`

**Compact:** Below the md breakpoint the aside stacks as sections under the header, with history first. The compact option is `aside-collapses-to-a-section-on-narrow-screens`.

**Rationale:** Give the pick to history in the aside. History supports the order without describing it, which is exactly what the aside slot is for. The runner-up is the decision panel. It is the better choice on records that wait for someone, such as a dispute with a deadline.

Prefer the people and labels aside on records a team hands between shifts. Never ship the empty aside state by accident. An order with nothing pending and no history reads as a rendering fault.

#### `history-in-the-aside-sections-in-the-main-column`: History in the aside, sections in the main column

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32"
    action primary "Message customer"
  split 2:1
    region "The customer"
      fact "Name" "Maria Garcia"
      fact "Email" "maria@garcia-interiors.example"
    aside
      region "What happened"
        timeline 3
          item: text "Collected at the pickup counter" · text muted "14 Mar 2026, 10:41" · text muted "Chris Novak"
```

**Rationale:** History supports the order without describing it, and it reads top to bottom beside the facts. On a wide screen it is a narrow column; below that it stacks under the sections.

**Cost:** Below about 1000 pixels the aside stacks under everything, so the history a reader most wants lands after the sections they came to use.

#### `aside-for-what-needs-a-decision`: Aside for what needs a decision

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1027"
  header
    heading "SO-1027"
    status "Refund refused" caution
    text "Tom Becker · Garcia Interiors restock · 7 Oct 2026, 22:14"
    action primary "Message customer"
  split 2:1
    region "Money"
      fact "Paid by card" "EUR 45.00"
      fact "Refund asked for" "EUR 45.00"
      fact "Returned so far" "EUR 0.00"
    aside
      region "Needs a decision"
        message "The refund window has closed. This payment method refunds only within 180 days." caution
        action "Offer credit instead"
        action "Record a payment you made"
      region "History"
        timeline 2
          item: text "Collected at the pickup counter" · text muted "14 Mar 2026, 10:41" · text muted "Chris Novak"
```

**Rationale:** The aside holds the things that need the reader: a pending decision, a clock, a mismatch. History moves into a tab, because a list of past activity is rarely the reason to open a record.

**Cost:** The aside becomes a work panel, which changes what the page is. An order with nothing pending has an empty aside, which is its own awkward state.

#### `no-aside-sections-fill-the-width`: No aside, sections fill the width

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32"
    action primary "Message customer"
  row
    region "The customer"
      fact "Name" "Maria Garcia"
      fact "Email" "maria@garcia-interiors.example"
      fact "Country" "Netherlands"
    region "The order"
      fact "Delivery" "Garcia Interiors restock"
      fact "Placed" "8 Oct 2026, 09:32"
      fact "Paid" "EUR 125.00"
  region "What happened"
    timeline 5
      item: text "Counter 1 lost its connection" · text muted "14 Mar 2026, 10:10 to 10:40" · text muted "Acme Supply"
```

**Rationale:** The main column takes everything. Sections side by side where there are two that fit.

**Cost:** A two-line fact list stretched across 1200 pixels is a long measure for a name and an email. The history loses its link to the record.

#### `aside-sticky-main-column-scrolls`: Aside sticky, main column scrolls

```wireframe
page
  breadcrumb "Home" "Invoices" "Disputes" "D-0182"
  header
    heading "Dispute D-0182"
    status "Disputed" critical
    text "EUR 45.00 on order SO-1019. The card issuer opened a case on 2 Oct 2026."
    action primary "Answer the bank"
  split 2:1
    region "What the bank said"
      text "Cardholder says the order was canceled by the merchant and the charge is being disputed."
      text muted "Received 2 Oct 2026, 14:22"
    aside
      region "Needs a decision"
        message "13 days to answer. The bank charges back on 21 Oct if nothing is sent." critical
        action "Answer the bank"
```

**Rationale:** The aside stays in place while the sections scroll, so a decision in the aside is always reachable from anywhere on a long record.

**Cost:** A sticky aside on a phone is a stacked block that no longer sticks. The behavior has two shapes and one of them is untested in practice.

#### `aside-for-related-records`: Aside for related records

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock"
    action primary "Message customer"
  split 2:1
    region "What was bought"
      fact "Oak desk lamp, 2 x EUR 45.00" "EUR 90.00"
      fact "Delivery fee" "EUR 10.00"
      fact "Cable tray, collect at the counter" "EUR 25.00"
      fact "Paid" "EUR 125.00"
    aside
      region "With this delivery"
        list 3
          item: text "Garcia Interiors restock" · text muted "Sat 14 Mar 2026" · text muted "Amsterdam warehouse" · action "Open"
```

**Rationale:** The aside holds what relates to this record but is not part of it. That is the delivery it ships with, the other lines on it and the messages it has had.

**Cost:** Related records are what a reader navigates to, so putting them in the narrowest column makes them the least likely to be found.

#### `aside-collapses-to-a-section-on-narrow-screens`: Aside collapses to a section on narrow screens

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock"
    action primary "Message customer"
  region "What happened"
    timeline 3
      item: text "Collected at the pickup counter" · text muted "14 Mar 2026, 10:41" · text muted "Chris Novak"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
  region "What was bought"
    fact "Oak desk lamp, 2 x EUR 45.00" "EUR 90.00"
    fact "Delivery fee" "EUR 10.00"
    fact "Cable tray, collect at the counter" "EUR 25.00"
    fact "Paid" "EUR 125.00"
```

**Rationale:** The same content, ordered so the aside's sections come first in the DOM. A reader on a phone reads history before the lines list rather than after it.

**Cost:** Two different orders for one record, so a screenshot test holds two arrangements. The DOM order and the visual order disagree, which is also an accessibility question.

#### `people-and-labels-in-the-aside-history-below`: People and labels in the aside, history below

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32"
    action primary "Message customer"
  split 2:1
    region "The customer"
      fact "Name" "Maria Garcia"
      fact "Email" "maria@garcia-interiors.example"
    aside
      region "Ownership"
        avatar "PS"
        fact "Waiting for" "Priya Shah"
        fact "Labels" "refund-check"
        fact "Follow up" "Mon 12 Oct 2026"
      region "What happened"
        timeline 3
          item: text "Collected at the pickup counter" · text muted "14 Mar 2026, 10:41" · text muted "Chris Novak"
```

**Rationale:** Linear puts assignee, state, labels and dates in the issue sidebar, because a record a team hands between shifts needs its ownership beside its facts. Alex Morgan sees at a glance that this order waits for Priya Shah under the label refund-check, and the history still reads below the handover.

**Cost:** Ownership fields need data that tracks them, and on records one person owns end to end they repeat what the team already knows. The aside also grows long once labels, dates and watchers all claim a row.

**Reference:** Linear

#### `related-records-and-history-share-the-aside`: Related records and history share the aside

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32"
    action primary "Message customer"
  split 2:1
    region "What was bought"
      fact "Oak desk lamp, 2 x EUR 45.00" "EUR 90.00"
      fact "Delivery fee" "EUR 10.00"
      fact "Cable tray, collect at the counter" "EUR 25.00"
      fact "Paid" "EUR 125.00"
    aside
      region "Related"
        list 2
          item: text "Garcia Interiors restock" · text muted "Sat 14 Mar 2026" · text muted "Amsterdam warehouse" · action "Open"
      region "What happened"
        timeline 2
          item: text "Collected at the pickup counter" · text muted "14 Mar 2026, 10:41" · text muted "Chris Novak"
```

**Rationale:** HubSpot draws associated records and the activity timeline in one right rail. The aside answers both who this record touches and what happened to it. The delivery, the other order from this customer and the messages sit above a short history with a link to the rest.

**Cost:** Two different jobs in one column, so neither gets the width it wants. Related records compete with history for the top of the aside, and the loser sits below the fold on a short viewport.

**Reference:** HubSpot

### Record timeline

**Question:** What happened to one record. Entries read newest first. Every entry carries a timestamp and a byline, because the reader asks who did this and when.

**Default:** `newest-first-with-actor-and-timestamp`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the newest-first timeline with actor and timestamp. It answers who and when on every line. The runner-up is the filtered timeline. It is the better choice once a record carries dozens of entries across kinds.

Prefer the day-grouped option for dispatch records, where entries cluster on one morning. Never ship the actor-grouped timeline as the main history. It destroys the chronological order a timeline exists to give.

#### `newest-first-with-actor-and-timestamp`: Newest first with actor and timestamp

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock"
  region "What happened"
    timeline 4
      item: text "Paid by card" · text muted "8 Oct 2026, 09:34" · text muted "Acme Supply"
```

**Rationale:** Newest first, each entry a plain-verb title with a byline and a timestamp, one deep link at most: the shape Maersk and Paste both describe.

**Cost:** A long history has to be paginated or collapsed. Maersk collapses descriptions behind a toggle, which this does not.

**Reference:** Maersk, Paste

#### `a-table-instead-of-a-timeline`: A table instead of a timeline

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia"
  region "History"
    table 5 "When" "What" "Who" "Amount"
      item: text "8 Oct, 09:34" · text "Paid by card" · text "Acme Supply" · text "EUR 125.00"
```

**Rationale:** When the history is the record rather than context, a table is denser and sortable: when, who, what, with an amount column when money moved.

**Cost:** Gives up the shape of a sequence for a grid of facts. A reader asking 'what happened in order' has to read down a table, which is slower than a timeline.

#### `grouped-by-day-with-a-date-label`: Grouped by day with a date label

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock" "Dispatch"
  header
    heading "Maria Garcia"
    text "Collected at the pickup counter at 10:41 on Sat 14 Mar 2026."
  region "14 March 2026"
    timeline 3
      item: text "Collected at the pickup counter" · text muted "10:41" · text muted "Chris Novak"
  region "9 January 2026"
    timeline 1
      item: text "Label printed" · text muted "10:04" · text muted "Acme Supply"
```

**Rationale:** Where entries cluster, a date heading above each group saves repeating the date on every line and shows the shape of the day.

**Cost:** More markup for the same information, and a reader scanning for one entry has to look under the right date heading.

#### `collapsed-descriptions-behind-a-toggle`: Collapsed descriptions behind a toggle

```wireframe
page
  breadcrumb "Home" "Invoices" "Disputes" "D-0182"
  header
    heading "Dispute D-0182"
    status "Disputed" critical
    text "EUR 45.00 on order SO-1019."
  region "History"
    timeline 5
      item: text "Evidence attached" · text muted "3 Oct 2026, 11:05" · text muted "Priya Shah"
    action "Show the detail for each"
```

**Rationale:** Maersk's approach: title and byline always, description behind a show-details toggle. Keeps a fifty-entry history to fifty lines.

**Cost:** The description is where the evidence lives for a dispute, so hiding it by default hides what a support reader came for.

**Reference:** Maersk

#### `grouped-by-actor-for-an-audit-question`: Grouped by actor, for an audit question

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    text "Maria Garcia. Seven things happened to this order."
  region "Acme Supply"
    list 3
      item: text "Paid by card" · text muted "8 Oct, 09:34"
  region "Jordan Lee"
    list 2
      item: text "Resent the confirmation at the customer request" · text muted "8 Oct, 11:20"
  region "Maria Garcia"
    list 1
      item: text "Corrected her email address" · text muted "8 Oct, 10:51"
```

**Rationale:** When the question is 'who touched this', the timeline is grouped by person. Each person carries their own list, newest first within it.

**Cost:** Destroys chronological order, which is the order a timeline exists to give. A person touching a record five times over a month reads as one entry.

#### `timeline-with-a-what-changed-diff-on-each-entry`: Timeline with a 'what changed' diff on each entry

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    text "Maria Garcia"
  region "History"
    list 3
      card "Payment settled"
        text muted "8 Oct 2026, 09:34 · Acme Supply"
        fact "state" "Awaiting payment to Paid"
```

**Rationale:** Each entry names what it changed, so the history answers what the record looks like now as well as how it got here. This is what an audit register carries.

**Cost:** A diff needs the before and after. It has to be reconstructed at read time rather than read from the entry that recorded the change.

#### `filtered-by-kind-and-actor`: Filtered by kind and actor

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock"
  region "What happened"
    toolbar
      text "Payments · 2"
      text "Parcels · 2"
      text "Messages · 2"
      text "Edits · 1"
      action quiet "Show all 7"
    timeline 5
      item: text "Confirmation resent at the customer request" · text muted "8 Oct 2026, 11:20" · text muted "Jordan Lee"
```

**Rationale:** GitHub lets a reader filter an issue timeline to comments, commits or references, because a long record mixes kinds and the reader usually wants one. The filters sit above the timeline and the count beside each says what choosing it keeps.

**Cost:** A filtered timeline hides entries without saying which, so a reader can miss the one line that mattered. The filter state also needs a reset that is always visible, or the hiding looks like absence.

**Reference:** GitHub

#### `entries-and-internal-notes-in-one-feed`: Entries and internal notes in one feed

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock"
    action "Add a note"
  region "What happened"
    timeline 1
      item: text "Confirmation resent at the customer request" · text muted "8 Oct 2026, 11:20" · text muted "Jordan Lee"
    card "Note from Jordan Lee"
      text "Maria wrote that the confirmation never arrived. Her address was correct."
      text muted "8 Oct 2026, 11:18 · Internal"
    timeline 3
      item: text "Email corrected by the customer" · text muted "8 Oct 2026, 10:51" · text muted "Maria Garcia"
```

**Rationale:** Zendesk draws notes and entries in one order feed, newest last, because support reads what the team said beside what the system did. A note Jordan Lee wrote at 11:18 sits between the resend it explains and the payment it followed.

**Cost:** Notes and entries compete for the same line height, so the feed grows long faster than either would alone. A reader who wants only the system's facts has to skip the team's words, and there is no filter on this option.

**Reference:** Zendesk

### Related records

**Question:** An order belongs to a delivery, a customer and a channel. A delivery belongs to a warehouse and a schedule. A common failure states the parent in prose in the description rather than linking to it.

**Default:** `each-relation-is-a-link-with-its-state`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Ship the link with state list. Each relation is a link carrying its own state, so a reader can jump and knows what they will find. The runner-up is the preview card option. It is the better choice where the parent facts decide the next step, such as a parcel read against its delivery.

Prefer the filtered list counts on records whose children number in the hundreds. Never ship the bare cross-reference line. It cannot carry the parent state and it hides in the description.

#### `each-relation-is-a-link-with-its-state`: Each relation is a link with its state

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Placed 8 Oct 2026, 09:32."
    action primary "Message customer"
  region "Belongs to"
    list 4
      item: text "Garcia Interiors restock" · text muted "Sat 14 Mar 2026" · text muted "Amsterdam warehouse" · status "Scheduled" info · action "Open delivery"
```

**Rationale:** The delivery, the customer and the channel appear as links carrying their own state, so a reader can jump and knows what they will find. Nothing here is prose.

**Cost:** Three links is a small nav of its own, and it competes with the record's own commands for the reader's attention.

#### `a-breadcrumb-as-the-relation-chain`: A breadcrumb as the relation chain

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · 8 Oct 2026, 09:32 · EUR 125.00"
    action primary "Message customer"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
  region "What was bought"
    fact "Oak desk lamp, 2 x EUR 45.00" "EUR 90.00"
    fact "Delivery fee" "EUR 10.00"
    fact "Cable tray, collect at the counter" "EUR 25.00"
    fact "Paid" "EUR 125.00"
```

**Rationale:** The trail itself is the relation chain: delivery, then order. Nothing repeats it, which is the design contract's strongest single rule.

**Cost:** The trail cannot carry state, so a reader cannot tell a scheduled delivery from a finished one without opening it.

#### `a-section-of-other-orders-on-the-same-delivery`: A section of other orders on the same delivery

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock"
  header
    heading "Garcia Interiors restock"
    status "Scheduled" info
    text "Sat 14 Mar 2026, 08:00 to 12:00 · Amsterdam warehouse"
    action primary "Add a parcel"
  region "The delivery"
    fact "Capacity" "40 pallets"
    fact "Loaded" "36 of 40 pallets"
    fact "Company" "Acme Supply"
  region "Other orders on this delivery"
    list 4
      item: text "SO-1042" · text muted "Maria Garcia" · text muted "8 Oct, 09:32" · text "EUR 125.00" · action "Open"
    action "All 1,204"
```

**Rationale:** The related record is the other orders, as a short list with the money beside each. Answers 'who else is on this delivery' without leaving.

**Cost:** Anywhere between one and two hundred rows, which is a table with a limit rather than a section. The money page already splits it by delivery for this reason.

#### `a-cross-reference-line-not-a-section`: A cross-reference line, not a section

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Part of Garcia Interiors restock, Sat 14 Mar 2026."
    link "Garcia Interiors restock"
    action primary "Message customer"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
  region "What was bought"
    fact "Oak desk lamp, 2 x EUR 45.00" "EUR 90.00"
    fact "Delivery fee" "EUR 10.00"
    fact "Cable tray, collect at the counter" "EUR 25.00"
    fact "Paid" "EUR 125.00"
```

**Rationale:** One line under the heading naming the parent record as a link. The smallest possible way to say where this record belongs, and nothing more.

**Cost:** It stays invisible to anyone who does not read descriptions. It cannot carry the parent state, so the reader has to open it to learn whether it is still live.

#### `a-count-that-links-to-the-filtered-list`: A count that links to the filtered list

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock"
    action primary "Message customer"
  region "Records on this order"
    link "Parcels 2"
    link "Payments 1"
    link "Messages 2"
    text muted "Refunds None"
```

**Rationale:** '2 parcels on this order' links to the parcels list filtered to this order. The relation is navigable in both directions and the count is never stale.

**Cost:** A link whose text is a number reads as a figure, not a destination, unless the hover and the visited color make it clear. WCAG 2.4.4 wants the purpose to be clear from the link text.

#### `the-parent-as-a-card-above-the-record-s-own-sections`: The parent as a card above the record's own sections

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042" "PC-0C893968A2"
  header
    heading "PC-0C893968A2"
    status "Packed" neutral
    text "One parcel on order SO-1042."
  card "The delivery this parcel ships with"
    text "Garcia Interiors restock"
    text muted "Sat 14 Mar 2026, 08:00 to 12:00 · Amsterdam warehouse"
    status "Scheduled" info
    action "Open delivery"
    text muted "The delivery decides when this parcel leaves."
  region "This parcel"
    fact "Contents" "Oak desk lamp"
    fact "Quantity" "1"
    fact "Customer" "Maria Garcia"
    fact "Packed" "8 Oct 2026, 09:34"
```

**Rationale:** The parent record opens in a card at the top with its own state and its commands. A reader acting on the child can act on the parent without navigating.

**Cost:** A box inside the page sits above the sections, which is the nesting the design contract forbids. It makes the child look secondary when it is the page.

#### `links-with-a-preview-of-the-parent`: Links with a preview of the parent

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042" "PC-0C893968A2"
  header
    heading "PC-0C893968A2"
    status "Packed" neutral
    text "One parcel on order SO-1042."
    action "Void"
  region "Belongs to"
    list 1
      item: text "Garcia Interiors restock" · text muted "Sat 14 Mar 2026" · text muted "Amsterdam warehouse" · status "Scheduled" info · action "Open delivery"
    fact "Leaves" "Sat 14 Mar 2026, 08:00 to 12:00"
    fact "Pallets left" "4 of 40"
    fact "Company" "Acme Supply"
    text muted "The preview carries the three facts a warehouse reader asks for."
  region "This parcel"
    fact "Contents" "Oak desk lamp"
    fact "Quantity" "1"
    fact "Customer" "Maria Garcia"
    fact "Packed" "8 Oct 2026, 09:34"
```

**Rationale:** Notion shows a preview of a linked page on hover, because the reader usually wants one fact from the parent rather than the parent itself. The delivery row expands to its date, place and state inline, so a reader checking a parcel learns the dispatch window without navigating.

**Cost:** A preview is a second rendering of the parent to keep true. Only one row can be open at a time before the section doubles in height. It also answers nothing about children, which still need the list.

**Reference:** Notion

#### `children-as-an-editable-table`: Children as an editable table

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Active" positive
    text "What this product is, and the SKU its parcels carry."
    action primary "Add a variant"
  region "Variants"
    table 3 "Variant" "State" "Price" "In stock"
      item: text "Standard" · status "Active" positive · text "EUR 45.00" · text "412" · action "Open"
    text muted "Every variant of this product. The prices are the company data."
```

**Rationale:** Airtable draws linked records as rows that can be added and removed in place, because the relation itself is the work. The variants of a product gain a row each with their price and stock count. The section holds the Add control rather than sending the reader elsewhere.

**Cost:** Editing inside a section blurs reading and writing: every row needs its own validation and refusal states. It also fits only children with few columns; a wide child still wants its own page.

**Reference:** Airtable

### Record the reader may not change

**Question:** A refused state exists. A page a role cannot use shows the refusal with the reason and the grant that helps. The question is whether the refusal is a whole page or a part of one.

**Default:** `the-commands-are-refused-the-record-is-not`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the refused commands on a readable record. Warehouse staff can read an order and cannot refund it, and each refusal names the grant that would allow it. The runner-up is the ask for access option. It is the better choice where access is routinely granted, such as a seasonal worker joining support.

Prefer the field-withheld option only where the values themselves are restricted, such as customer personal data under a warehouse role. Never ship the role switcher on production. Acting as somebody is a development capability, and the button would be a security hole with a label on it.

#### `the-commands-are-refused-the-record-is-not`: The commands are refused, the record is not

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock"
    message "Your role can read orders. Only Support can resend the confirmation." neutral
    action disabled "Resend the confirmation"
  region "Refunds"
    text muted "EUR 125.00 is paid and none of it has been refunded."
    message "Refunds move money. The finance role can do this. Your role is warehouse-lead." neutral
    action disabled "Refund this order"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
```

**Rationale:** Warehouse staff can read an order and cannot refund it. The page shows everything and refuses only the commands, naming the grant that would allow each one. This is an explained action: a disabled button with its reason beside it.

**Cost:** A page full of refused commands is a page that looks broken to someone who does not know what their role is.

#### `the-whole-page-is-refused`: The whole page is refused

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
  region
    message "You cannot open this order. Your role is warehouse-lead. Orders are readable by Support, Finance and Owners." critical
    text muted "Ask an owner to change your role, or use the dispatch record for this parcel instead."
    action "Open the dispatch record instead"
```

**Rationale:** The record itself is out of the reader's reach, not only its commands. A refused state replaces the page body and names the grant.

**Cost:** Nothing is shown, so a warehouse lead cannot read a customer's name to answer a question at the counter. That is a real cost on the surface where names matter most.

#### `a-banner-above-the-page-the-record-still-readable`: A banner above the page, the record still readable

```wireframe
page
  breadcrumb "Home" "Invoices" "Disputes"
  message "You can read disputes, not answer them. Answering a bank case moves EUR 45.00 and is the finance role." neutral
  header
    heading "Dispute D-0182"
    status "Disputed" critical
    text "EUR 45.00 on order SO-1019."
    message "Only Finance can answer." neutral
    action disabled "Answer the bank"
  region "What the bank said"
    text "Cardholder says the order was canceled by the merchant."
```

**Rationale:** A page-level notice says what this role may not do on this page, once, and the sections below stay readable. The reader is told rather than blocked.

**Cost:** A full-width band on a page about other work breaks the rule that tone marks content, not chrome. This has to be a neutral notice, not a caution one.

#### `the-command-is-absent-not-refused`: The command is absent, not refused

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock"
    action "Message customer"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
  region "What was bought"
    fact "Oak desk lamp, 2 x EUR 45.00" "EUR 90.00"
    fact "Delivery fee" "EUR 10.00"
    fact "Cable tray, collect at the counter" "EUR 25.00"
    fact "Paid" "EUR 125.00"
```

**Rationale:** A command the role does not have is not drawn at all. The guidance is that a tab or link appears only for a viewer who may open its page, extended to buttons.

**Cost:** Nothing tells the reader the capability exists elsewhere, so they cannot find out who can do it. On a page of four commands, three of them missing looks like a broken deployment.

#### `personal-data-withheld-field-by-field`: Personal data withheld field by field

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    action "Ask an owner for access"
  region "The customer"
    text muted "Support, Finance and Owners can read who placed an order. Your role is Warehouse lead."
    fact "Name" "Withheld for your role"
    fact "Email" "Withheld for your role"
    fact "Country" "Netherlands"
  region "What was bought"
    fact "Oak desk lamp, 2 x EUR 45.00" "EUR 90.00"
    fact "Delivery fee" "EUR 10.00"
    fact "Cable tray, collect at the counter" "EUR 25.00"
    fact "Paid" "EUR 125.00"
```

**Rationale:** The order stays readable and only the customer's personal data is withheld, each field saying so where the value would be. The server never sends the value, so nothing is merely hidden. The header offers the one step that would change it.

**Cost:** Every personal field needs a withheld form, and a reader sees that a value exists without seeing it. A caution alert on top of that repeats what the fields already say.

#### `a-role-switcher-rather-than-a-refusal`: A role switcher rather than a refusal

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock"
    action primary "Open as Finance"
  region
    message "You are acting as Chris Novak, warehouse lead. Finance can refund this order and you cannot." info
    action "Stop acting"
  region "The order"
    fact "Customer" "Maria Garcia"
    fact "Paid" "EUR 125.00"
    fact "Placed" "8 Oct 2026, 09:32"
```

**Rationale:** The development persona menu already lets a staff member act as somebody else. A record the role cannot use offers the role that can, in one click, for a deployment being demonstrated.

**Cost:** Only honest where acting as somebody is a real capability. On a production deployment with one real account it is a security hole with a nice button on it.

#### `ask-for-access-from-the-refused-command`: Ask for access from the refused command

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock"
    action "Message customer"
  region "Refunds"
    text "EUR 125.00 is paid and none of it has been refunded. Refunds move money, so only the finance role can make one."
    action "Ask for access"
    text muted "Sam Rivera decides, usually within a day."
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
```

**Rationale:** Google Drive turns a refusal into a request: the reader asks, an owner decides, and the decision arrives as a message. A warehouse lead who needs to resend the confirmation asks from the refusal itself instead of finding an owner in a corridor.

**Cost:** Every request needs an owner who answers it, and a queue of access requests is a new surface to build and watch. On records where access is never granted it promises a decision that never comes.

**Reference:** Google Drive

#### `a-read-only-ribbon-naming-what-the-role-can-do`: A read-only ribbon naming what the role can do

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  message "You are reading as Warehouse lead. You can read orders and scan parcels. Resending the confirmation and refunds belong to other roles." neutral
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors restock"
    action "Resend the confirmation"
    action "Refund this order"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
  region "What was bought"
    fact "Oak desk lamp, 2 x EUR 45.00" "EUR 90.00"
    fact "Delivery fee" "EUR 10.00"
    fact "Cable tray, collect at the counter" "EUR 25.00"
    fact "Paid" "EUR 125.00"
```

**Rationale:** Figma tells a view-only reader exactly that, in a ribbon above the canvas, and lists what the role can still do. The ribbon here says the warehouse role reads orders and scans parcels, so the reader knows their reach before they reach past it.

**Cost:** A ribbon on every page a role cannot fully use is a ribbon on most pages for the narrowest roles. It also states the role's reach in words the data has to keep true per page.

**Reference:** Figma

### Record change history

**Question:** Several people touch one order before the week ends. The customer corrects an email. The manager answers. Finance adds a note.

When the customer disputes what happened, the company answers from the record itself. It names who did what and when. The audit trail is that answer. It reads beside the facts it explains.

**Default:** `history-as-a-tab-on-the-record`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the history tab on the record. It keeps one route. The tab state stays in the URL. A reader checking a claim opens History without losing the order. The runner-up is the per-field history.

It fits disputes about one value such as the email that carried the confirmation. Prefer the full-page log only for long-lived records whose trail outgrows a tab. Never ship the money-only trail as the audit. The edits that explain the money are missing there.

#### `history-as-a-tab-on-the-record`: History as a tab on the record

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Placed 8 Oct 2026, 09:32 by Maria Garcia of Garcia Interiors."
    action "Resend the confirmation"
    action primary "Message customer"
  tabs "History" "Details" "Parcels" "Payment"
    region "History"
      text muted "Who did what to this order, newest first."
      timeline 4
        item: text "Refund note added" · text muted "Priya Shah · 8 Oct 2026, 09:34"
```

**Rationale:** The audit sits beside Details and Payment as one more facet. The record keeps one route and the tab state stays in the URL the way record tabs do. A reader checking a claim opens History without losing the order.

**Cost:** The trail is hidden until its tab opens, and facts cannot be compared against the trail without switching back and forth.

#### `history-in-a-side-panel-beside-the-summary`: History in a side panel beside the summary

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia bought for Garcia Interiors."
    action primary "Message customer"
  split 1:1
    region "The order"
      fact "Customer" "Maria Garcia"
      fact "Delivery" "Garcia Interiors restock"
      fact "Placed" "8 Oct 2026, 09:32"
      fact "Paid" "EUR 125.00"
    region "History"
      timeline 3
        item: text "Refund note added" · text muted "Priya Shah · 8 Oct 2026, 09:34"
```

**Rationale:** Facts and history read side by side, so Alex Morgan sees the email and who corrected it in one glance. Nothing is behind a tab.

**Cost:** Each column is half the width, so long entries wrap, and on a narrow screen the panel stacks below the facts it explains.

#### `full-page-audit-log-with-filters`: Full-page audit log with filters

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042" "History"
  header
    heading "History of SO-1042"
    text muted "Every change to this order, newest first."
    action "Export"
  toolbar
    field "Search changes" search
    field "Actor" select = "Everyone"
    field "Kind" select = "All changes"
  region "Changes"
    timeline 6
      item: text "Refund note added" · text muted "Priya Shah · 8 Oct 2026, 09:34"
    text muted "1 to 6 of 6"
```

**Rationale:** Every change on one scrolling page with actor and kind filters, which suits a long-lived delivery whose trail outgrows a tab. Filters answer whose changes these are without reading them all.

**Cost:** The trail leaves the record it explains, so the reader holds the facts in memory. The filters need data support for actor and kind.

#### `last-change-line-with-an-expander`: Last change line with an expander

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Placed 8 Oct 2026, 09:32 by Maria Garcia of Garcia Interiors."
    action primary "Message customer"
  region "The order"
    fact "Customer" "Maria Garcia"
    fact "Delivery" "Garcia Interiors restock"
    fact "Placed" "8 Oct 2026, 09:32"
    fact "Paid" "EUR 125.00"
  region "History"
    timeline 1
      item: text "Refund note added" · text muted "Priya Shah · 8 Oct 2026, 09:34"
    action quiet "Show all 4 changes"
```

**Rationale:** One line answers the common question, who touched this last, and the expander reveals the rest without a new route. The record stays short.

**Cost:** Older changes stay hidden behind a click, and the expander state is not shareable, so two people cannot point at the same open trail.

#### `money-movements-only`: Money movements only

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Placed 8 Oct 2026, 09:32 by Maria Garcia of Garcia Interiors."
    action "Refund"
  tabs "Payment" "Details" "Parcels" "History"
    region "Money"
      text muted "Only the movements of money. Nothing has been refunded."
      fact "Two lamps" "EUR 90.00"
      fact "Delivery fee" "EUR 10.00"
      fact "Cable tray" "EUR 25.00"
      fact "Charged in total" "EUR 125.00"
```

**Rationale:** Finance sees only the movements of money, each tied to its amount, without the operational edits around them. The lines add up top to bottom.

**Cost:** The edits that explain the money are missing. A corrected email before a resend reads as a gap, and there are two histories to keep true.

#### `exportable-trail-for-disputes`: Exportable trail for disputes

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Placed 8 Oct 2026, 09:32 by Maria Garcia of Garcia Interiors."
    action "Download the trail"
    action primary "Message customer"
  region "The record"
    fact "Order" "SO-1042"
    fact "Customer" "Maria Garcia"
    fact "Delivery" "Garcia Interiors restock"
    fact "Paid" "EUR 125.00"
  region "Trail"
    text muted "Newest first, with the actor on every line."
    timeline 4
      item: text "Customer message sent" · text muted "Alex Morgan · 8 Oct 2026, 09:33"
    action quiet "Download"
```

**Rationale:** The trail downloads exactly as it reads, with actor and time on every line, so Priya Shah can attach it to a dispute reply. What the screen states and what the file carries are one thing.

**Cost:** The download freezes wording that a later correction invalidates, and the file format becomes a contract the data has to keep stable.

#### `per-field-history-beside-the-facts`: Per-field history beside the facts

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Placed 8 Oct 2026, 09:32 by Maria Garcia of Garcia Interiors."
    action primary "Message customer"
  region "The order"
    text muted "What each value was, beside what it is."
    fact "Customer" "Maria Garcia"
    text muted "Unchanged since the order was placed."
    fact "Email" "maria@garcia-interiors.example"
    text muted "Corrected by Maria Garcia, 8 Oct 2026, 10:51."
    fact "Delivery" "Garcia Interiors restock"
    text muted "Unchanged since the order was placed."
    fact "Paid" "EUR 125.00"
    text muted "Settled by card, 8 Oct 2026, 09:34."
```

**Rationale:** Google Sheets shows the edit history of one cell, because a dispute is usually about one value rather than the whole record. Each fact carries its own changed-by line, so the email row says Maria Garcia corrected it at 10:51 without opening a trail.

**Cost:** Every fact doubles in height, so a long summary becomes a long read. Fields that never change carry a line saying so, which is honest but heavy.

**Reference:** Google Sheets

#### `two-versions-side-by-side`: Two versions side by side

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Placed 8 Oct 2026, 09:32 by Maria Garcia of Garcia Interiors."
  region "Placed against now"
    text muted "One value changed since the order was placed."
    action quiet "Choose moments"
    split 1:1
      card "Placed, 09:32"
        fact "Email" "maria@garcia-interiors.exampl"
        fact "Paid" "EUR 0.00"
        fact "Parcels" "None packed"
      card "Now"
        fact "Email" "maria@garcia-interiors.example"
        fact "Paid" "EUR 125.00"
        fact "Parcels" "2 packed, both ready"
```

**Rationale:** Wikipedia compares two revisions column to column with the changed lines marked, because a dispute names a moment and asks what changed then. The order as Maria placed it sits beside the order as it reads now, and only the email row is marked.

**Cost:** Two columns halve the width each version gets, so long values wrap or clip on a phone. Picking the two moments to compare is also a control of its own, with its own state.

**Reference:** Wikipedia

### Record notes

**Question:** Support and finance think on the record, not beside it. They record why the confirmation was resent. They record what the customer was told. They record what still waits. A note is staff writing with a byline and a time. The reader must always know whether the customer can see it.

**Default:** `a-notes-section-with-the-composer-on-top`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the notes section with the composer on top. The newest note reads first. Internal scope is the default. It cannot leak. The runner-up is the internal-or-customer composer.

It fits records where staff write to the customer from the same box. Prefer resolved notes only once open notes grow hard to scan. Never ship notes without a scope marker. A reader who cannot tell internal from customer-visible will write the wrong one.

#### `a-notes-section-with-the-composer-on-top`: A notes section with the composer on top

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32."
    action primary "Message customer"
  region "Notes"
    text muted "For the team only. Two notes, newest first."
    field "Write a note for the team" textarea
    action primary "Add note"
    list 2
      item: avatar "JL" · text "Jordan Lee" · text muted "8 Oct 2026, 11:18" · text "The mail provider held the message for two hours."
```

**Rationale:** Shopify draws order notes as a timeline with the composer at the top, newest first. The writer sees what was already said before adding to it, and every note carries its writer and time.

**Cost:** The composer takes the top of the section even when nobody writes. A long note history pushes the record's own sections down the page.

**Reference:** Shopify

#### `notes-mixed-into-the-timeline`: Notes mixed into the timeline

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock."
    action "Add a note"
  region "What happened"
    timeline 1
      item: text "Confirmation resent at the request" · text muted "Jordan Lee · 8 Oct 2026, 11:20"
    card "Jordan Lee · 8 Oct 2026, 11:18 · Internal"
      text "The mail provider held the message for two hours."
    timeline 2
      item: text "Email corrected by the customer" · text muted "Maria Garcia · 8 Oct 2026, 10:51"
```

**Rationale:** Zendesk draws agent notes inside the order feed, because what the team wrote explains what the system did next. The resend at 11:20 reads directly under the note that caused it.

**Cost:** Notes and system entries compete for attention in one feed, so a reader who wants only the facts has to skip the team's words. Long notes also stretch a feed meant for short lines.

**Reference:** Zendesk

#### `internal-or-customer-visible-chosen-per-note`: Internal or customer-visible, chosen per note

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock."
  region "Notes"
    tabs "Internal note" "Message to the customer"
      field "Write for the team" textarea
    action primary "Add note"
    list 2
      item: avatar "JL" · text "Jordan Lee" · text muted "8 Oct 2026, 11:25" · status "Customer can see" info
```

**Rationale:** Zendesk splits its composer into internal note and public reply. Staff write both from the same record and the wrong scope is a real failure. The scope toggle sits on the composer and every note keeps its marker.

**Cost:** Two scopes double the reading of every note, and a customer-visible note needs the message pipeline behind it rather than a plain save. The toggle is also one more control to misread in a hurry.

**Reference:** Zendesk

#### `resolved-notes-collapse-away`: Resolved notes collapse away

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock."
  region "Notes"
    list 1
      item: avatar "AM" · text "Alex Morgan" · text muted "8 Oct 2026, 12:02" · text "Keep one cable tray aside at the counter."
    action quiet "1 resolved note"
    list 1
      item: avatar "JL" · text "Jordan Lee" · text muted "8 Oct 2026, 11:18" · status "Resolved" neutral
    action "Add a note"
```

**Rationale:** Google Docs resolves a comment thread once its question is answered, because an open list grows until nobody reads it. The collection question resolves once the resend lands, leaving only what still waits.

**Cost:** Resolving hides the reasoning a later dispute may need, so the resolved list has to stay one click away and stay readable. Somebody also has to do the resolving, which is a habit to build.

**Reference:** Google Docs

#### `notes-in-the-aside`: Notes in the aside

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32."
    action primary "Message customer"
  split 2:1
    region "The customer"
      fact "Name" "Maria Garcia"
      fact "Email" "maria@garcia-interiors.example"
      fact "Paid" "EUR 125.00"
    aside
      region "Notes"
        action quiet "Add"
        list 2
          item: avatar "JL" · text "Jordan Lee" · text muted "8 Oct, 11:18"
```

**Rationale:** Linear keeps comments in the issue's main column and properties in the rail; this option reverses it for records whose facts are the work. Notes sit beside the order so they never push the money down, and the composer stays one line until it opens.

**Cost:** A 260 px column is narrow for a paragraph, so notes wrap early and long threads scroll inside a short box. Notes also lose the prominence they need on a support-heavy record.

**Reference:** Linear

#### `no-notes-yet`: No notes yet

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32."
    action primary "Message customer"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
  region "Notes"
    message "No notes on this order. Notes are for the team." neutral
    action "Write the first note"
```

**Rationale:** Notion draws an empty discussion as an invitation rather than a blank box, because a record nobody has annotated is the common case. The empty state says what notes are for and offers the first one.

**Cost:** An empty section takes vertical space on every quiet record to say there is nothing to read. Hiding the section until the first note would save the space but hide the capability.

**Reference:** Notion

### Record attachments

**Question:** A dispute needs its evidence, a delivery needs its packing list, a product needs its photos. An attachment is a file the company put on the record, with who added it and when. The reader must know what each file is before opening it.

**Default:** `a-file-list-with-a-drop-zone`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the file list with a drop zone. Each row names the file and its kind. It names who added it and its size. The drop zone invites the next file. The runner-up is the evidence-grouped option.

It fits a dispute. The bank asks for kinds there rather than files. Prefer thumbnails only where images dominate, such as product photos. Never ship the drop-zone-only section. A record whose files hide behind an upload control reads as empty.

#### `a-file-list-with-a-drop-zone`: A file list with a drop zone

```wireframe
page
  breadcrumb "Home" "Invoices" "Disputes" "D-0182"
  header
    heading "Dispute D-0182"
    status "Disputed" critical
    text muted "EUR 45.00 on order SO-1019. The card issuer opened a case on 2 Oct 2026."
    action primary "Answer the bank"
  region "Files"
    text muted "What the bank sees if this file set is sent with the answer."
    list 3
      item: icon "file" · text "sale-terms-march-2026.pdf" · text muted "Priya Shah · 3 Oct 2026 · 182 KB" · action quiet "Open"
    field "Add a file" file
```

**Rationale:** Linear draws issue attachments as rows with a drop zone beneath, because the list answers what is here and the zone answers how to add. Each row carries the file kind, who added it, when, and the size.

**Cost:** Rows give every file equal weight, so a ten-file record reads long. Large files also need an upload state per row, which this option does not draw.

**Reference:** Linear

#### `compact-rows-for-many-files`: Compact rows for many files

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Active" positive
    text muted "Photos and the print file for this product."
  region "Photos"
    text muted "The online store uses the front photo."
    action quiet "Add a file"
    list 4
      item: image "lamp-front-1080x1350.jpg" · text muted "2.1 MB" · action quiet "Use"
```

**Rationale:** GitHub lists release assets as compact rows, because a record with a dozen files has to stay scannable. Name, size and a download action fit one line each; who added it moves to the file's own page.

**Cost:** Who and when leave the row, so the reader cannot tell a fresh upload from a stale one without opening it. Compact rows also hide the file kind behind the name alone.

**Reference:** GitHub

#### `evidence-grouped-by-what-it-proves`: Evidence grouped by what it proves

```wireframe
page
  breadcrumb "Home" "Invoices" "Disputes" "D-0182"
  header
    heading "Dispute D-0182"
    status "Disputed" critical
    text muted "EUR 45.00 on order SO-1019."
    action primary "Answer the bank"
  region "Evidence"
    text muted "Two of three groups are filled. The bank decides on 21 Oct."
    card "Receipt"
      fact "File" "order-SO-1019-receipt.pdf"
      fact "Added" "Acme Supply · 28 Sep 2026"
    card "Terms"
      fact "File" "sale-terms-march-2026.pdf"
      fact "Added" "Priya Shah · 3 Oct 2026"
    card "Proof the customer collected"
      field "Add proof of collection" file
```

**Rationale:** Stripe asks for dispute evidence by category, because the bank checks kinds rather than files: the receipt, the terms, the proof of fulfillment. Each group says whether it is filled, so Priya Shah sees what is still missing before she answers.

**Cost:** The categories belong to card disputes, so the shape fits nothing else without renaming. A file that proves two things also has to sit in two groups or one group has to stay empty.

**Reference:** Stripe

#### `the-drop-zone-is-the-section`: The drop zone is the section

```wireframe
page
  breadcrumb "Home" "Products" "Brass desk lamp"
  header
    heading "Brass desk lamp"
    status "Active" positive
    text muted "Brushed brass with a linen shade."
  region "Photos"
    text muted "This product has no photos yet."
    field "Drop the photos here, or choose a file" file
    text muted "JPG or PNG, 1920 px wide or more."
```

**Rationale:** Dropbox draws an empty folder as one large drop target, because adding is the only job and the target should be unmissable. The section states what belongs here and takes the file anywhere it lands.

**Cost:** Once files exist the large zone wastes the space the list wants, so the shape has to change after the first upload. It also says nothing about what is already there.

**Reference:** Dropbox

#### `images-as-thumbnails-documents-as-rows`: Images as thumbnails, documents as rows

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock"
  header
    heading "Garcia Interiors restock"
    status "Scheduled" info
    text muted "Sat 14 Mar 2026, 08:00 to 12:00 · Amsterdam warehouse."
  region "Files"
    action quiet "Add a file"
    grid 3
      item: image "dock.jpg"
    list 2
      item: icon "file" · text "supplier-contract-oak-2026.pdf" · text muted "Sam Rivera · 12 Dec 2025 · 1.1 MB" · action quiet "Open"
```

**Rationale:** Zendesk draws attached images as thumbnails and documents as rows, because a reader checks a photo by looking and a contract by opening. The thumbnails answer at a glance; the rows answer on click.

**Cost:** Two shapes in one section, so the section needs a rule for what is an image and what is not. Thumbnails also cost a render per file that rows never pay.

**Reference:** Zendesk

#### `no-files-and-what-belongs-here`: No files, and what belongs here

```wireframe
page
  breadcrumb "Home" "Invoices" "Disputes" "D-0182"
  header
    heading "Dispute D-0182"
    status "Disputed" critical
    text muted "EUR 45.00 on order SO-1019."
    action primary "Answer the bank"
  region "Evidence"
    message "No evidence attached. The bank wants the receipt, the terms and proof of shipment." neutral
    action "Attach the first file"
```

**Rationale:** Figma tells an empty project what to put in it, because an empty box without guidance reads as a fault. The section names the kinds that belong on a dispute and offers the upload in the same breath.

**Cost:** Guidance text per record type is content to write and keep true. A generic empty state would fit everywhere and help nowhere, which is the worse trade.

**Reference:** Figma

### Property list with copy

**Question:** Support reads a reference out on the phone and pastes an identifier into a dispute. A property list is labeled values where the identifiers copy with one click. The reader must know the copy landed.

**Default:** `every-identifier-copies`

**Compact:** Below the sm breakpoint each row stacks: the label above its value, the copy button beside the value. The compact option is `stacked-on-a-phone`.

**Rationale:** Keep the always-visible copy button on each identifier. Support reaches for it without hunting. The runner-up is the in-place confirmation option. It fits records where a miscopied reference causes real mistakes.

Prefer hover-only copy nowhere. Touch screens have no hover and the button would never appear. Never ship a property list whose long values clip without a way to expand them.

#### `every-identifier-copies`: Every identifier copies

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32."
    action primary "Message customer"
  region "Identifiers"
    text muted "What support quotes. The customer reads none of this."
    list 5
      item: text "Order" · text "SO-1042" · action quiet "Copy"
```

**Rationale:** Stripe puts a copy button beside every identifier on a charge, because support quotes references all day. Order number, payment reference, customer email and parcel codes each copy with one click; human facts stay plain.

**Cost:** A button per row is noise on records nobody quotes, and each button needs its copied confirmation to be honest. The list also grows long once every identifier claims a row.

**Reference:** Stripe

#### `copy-appears-on-hover-only`: Copy appears on hover only

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock."
  region "Identifiers"
    text muted "The pointer rests on the order row, so only that row offers Copy."
    text muted "Payment, email and parcels show no button until touched."
    list 4
      item: text "Order" · text "SO-1042" · action quiet "Copy"
```

**Rationale:** GitHub shows the copy button on a file path only on hover. A quiet row reads better and the control appears where the pointer already is. The list stays a clean two columns until the reader reaches for a value.

**Cost:** Touch screens have no hover, so on a phone the button never appears and the pattern fails where warehouse staff work. Keyboard readers also have to tab into a row to find a control they cannot see.

**Reference:** GitHub

#### `identifiers-grouped-in-one-card`: Identifiers grouped in one card

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32."
    action primary "Message customer"
  region "The order"
    fact "Customer" "Maria Garcia"
    fact "Delivery" "Garcia Interiors restock"
    fact "Placed" "8 Oct 2026, 09:32"
    fact "Paid" "EUR 125.00"
  region "Quote these"
    text muted "Copied as written, with no surrounding prose."
    list 3
      item: text "Order" · text "SO-1042" · action quiet "Copy"
```

**Rationale:** Vercel groups a deployment's identifiers in one card apart from its facts, because identifiers are quoted together. The id, the reference and the address leave in one message. One card holds all three with their copy buttons.

**Cost:** The identifiers leave the facts they belong to. The reader jumps between the summary and the card to connect a value with its meaning. A second card is also a second heading for the same record.

**Reference:** Vercel

#### `copied-confirmation-in-place`: Copied confirmation in place

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock."
  region "Identifiers"
    list 3
      item: text "Order" · text "SO-1042" · status "Copied" positive
  toast "Order number copied." positive
```

**Rationale:** Railway confirms a copy inside the row that was copied. A toast at the edge of the screen is easy to miss while reading a reference aloud. The button turns into a check beside the value for two seconds.

**Cost:** The row changes shape for two seconds, which shifts the rows below it unless the confirmation holds the button's width. It also confirms only the click, not that the paste landed where it should.

**Reference:** Railway

#### `long-values-truncate-with-expand`: Long values truncate with expand

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock."
  region "Identifiers"
    text muted "Copy takes the whole value, not the shortened line."
    list 3
      item: text "Receipt URL" · text "https://acme-supply.example/receipts/SO-1042" · action quiet "Show" · action quiet "Copy"
```

**Rationale:** Sentry truncates long identifiers to one line with an expander. A receipt URL or a full address would otherwise push the copy button off the row. The row stays one line; the full value opens on demand and still copies whole.

**Cost:** A truncated value cannot be checked by eye until it expands, so a reader comparing two long codes opens both. The expander is also one more control per long row.

**Reference:** Sentry

#### `stacked-on-a-phone`: Stacked on a phone

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
  region "Identifiers"
    text muted "Order"
    row
      text "SO-1042"
      action quiet "Copy"
    text muted "Payment"
    row
      text "SH-88213"
      action quiet "Copy"
    text muted "Customer email"
    row
      text "maria@garcia-interiors.example"
      action quiet "Copy"
```

**Rationale:** Polaris stacks a description list on narrow screens, because three columns cannot fit 390 px. The label sits above its value and the copy button stays beside the value, so the thumb reaches it without scrolling sideways.

**Cost:** A five-row list becomes five blocks, so the section doubles in height on the smallest screen. Labels above values also read slower than labels beside them.

**Reference:** Shopify Polaris

### Record header on a phone

**Question:** Warehouse staff read records on a phone at the dock, 390 px wide, one hand free. The header must state which record, what state, and the one step that matters without scrolling sideways or hiding the title.

**Default:** `stacked-title-full-width-primary-the-rest-in-a-menu`

**Compact:** This item is the compact behavior: title and state first, a full-width primary under them, rarer commands in a menu. The compact option is `stacked-title-full-width-primary-the-rest-in-a-menu`.

**Rationale:** Keep the stacked title with a full-width primary and the rest in a menu. It keeps the desktop order of title then actions. The primary stays reachable by thumb. The runner-up is the sticky foot bar.

It fits records where the step is taken mid-scroll, such as scanning at the dock. Prefer the scrolling action row only where every action is equally likely. Never ship actions that need sideways scrolling to be found. A hidden Refund at the dock stops the queue.

#### `stacked-title-full-width-primary-the-rest-in-a-menu`: Stacked title, full-width primary, the rest in a menu

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock."
    action primary "Message customer"
    action "Resend the confirmation"
    action "Refund"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
```

**Rationale:** shadcn dashboard pages stack the header actions under the title below the sm breakpoint, with the primary first and full width. The title and state read first; the thumb finds one large button; rarer commands wait behind the menu.

**Cost:** The header grows tall on the smallest screen, so the content starts lower. Secondary commands also hide behind a tap that a hurried reader may not try.

**Reference:** shadcn

#### `a-sticky-action-bar-at-the-foot`: A sticky action bar at the foot

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock."
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
  region "What was bought"
    fact "Two lamps" "EUR 90.00"
    fact "Delivery fee" "EUR 10.00"
    fact "Cable tray" "EUR 25.00"
  footer sticky
    action "Resend the confirmation"
    action primary "Message customer"
```

**Rationale:** Shopify pins the order actions to the foot of a phone screen, because the thumb is already there and the step stays reachable mid-scroll. Message and Resend stay pinned while the facts scroll above them.

**Cost:** The bar covers content at the foot of every scroll position, so the last section needs padding it would not otherwise need. It also pins two actions that may not be the two this record needs.

**Reference:** Shopify

#### `back-chevron-and-state-in-the-bar`: Back chevron and state in the bar

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    action quiet "‹ Orders"
    status "Paid" positive
    heading "SO-1042"
    text muted "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32."
    action primary "Message customer"
  region "What was bought"
    fact "Two lamps" "EUR 90.00"
    fact "Delivery fee" "EUR 10.00"
    fact "Cable tray" "EUR 25.00"
```

**Rationale:** iOS puts the way back in the navigation bar, because a phone reader arrives from a list and returns to it. The bar carries the chevron and the order number; the page opens straight into the state and the summary.

**Cost:** The bar is shared chrome, so a record-specific bar is a second bar to keep true. The breadcrumb also leaves the page, which breaks the trail contract every other page keeps.

**Reference:** iOS

#### `the-description-folds-behind-the-title`: The description folds behind the title

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    action quiet "Show customer and delivery"
    action primary "Message customer"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
```

**Rationale:** GitHub mobile folds long issue context behind the title, because the title and state are the wayfinding and the rest is detail. One tap opens customer, delivery and placed; until then the header is two lines.

**Cost:** The delivery name hides behind a tap on exactly the record type where which-delivery is the most-asked question. A folded header also looks unfinished to a reader who never unfolds it.

**Reference:** GitHub

#### `one-scrolling-row-of-actions`: One scrolling row of actions

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock."
  row
    action primary "Message customer"
    action "Resend the confirmation"
    action "Refund"
    action "Export"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
```

**Rationale:** Material design scrolls a row of action chips under the title, because every action stays visible as a word rather than hiding in a menu. Message, Resend, Refund and Export all fit one swipeable row.

**Cost:** A sideways scroll inside a vertical page hides anything past the edge until swiped. Equal chips also give the destructive action the same weight as a harmless one.

**Reference:** Material Design

#### `no-actions-in-the-header-at-all`: No actions in the header at all

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32."
  region "Parcels"
    action quiet "Resend the confirmation"
    list 2
      item: text "Oak desk lamp" · text muted "one per parcel · PC-0C893968A2" · status "Packed" neutral
  region "Money"
    action quiet "Refund"
    fact "Paid by card" "EUR 125.00"
    fact "Refunded" "EUR 0.00"
```

**Rationale:** GOV.UK keeps small screens to one purpose per page, so commands live in the sections they belong to rather than crowding the header. The header states the record; Resend sits with the parcels and Refund sits with the money.

**Cost:** The most-used command is a scroll away instead of a tap away. A reader who learned the desktop header finds nothing where the buttons were. Every section also needs its own command row.

**Reference:** GOV.UK

### Previous and next record

**Question:** Support works a queue, not a record. The next order in the list waits. The next dispute waits for an answer. Moving on must be one step that keeps the list order. The reader never returns to the list merely to open its neighbor.

**Default:** `chevrons-beside-the-breadcrumb`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the chevrons beside the breadcrumb. They keep the list order. They cost almost no space. The runner-up is the jump-by-search option.

It fits readers who know the next record number rather than its neighbor. Prefer the list drawer on triage queues where the reader skims many records. Never ship movement without a position. Chevrons that never say 4 of 268 leave the reader lost in the queue.

#### `chevrons-beside-the-breadcrumb`: Chevrons beside the breadcrumb

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  row
    action quiet "‹ Previous"
    text muted "4 of 268"
    action quiet "Next ›"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32."
    action primary "Message customer"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
  region "What was bought"
    fact "Two lamps" "EUR 90.00"
    fact "Cable tray" "EUR 25.00"
```

**Rationale:** Gmail puts newer and older arrows above a message, because triage is neighbor to neighbor and the list order is the queue. The position reads between the chevrons, so the reader knows where they are.

**Cost:** Chevrons move one step at a time, so jumping ten records ahead is ten clicks. They also need the list order behind them, which fails when the record was opened from a search.

**Reference:** Gmail

#### `chevrons-in-the-header-with-keyboard-hints`: Chevrons in the header with keyboard hints

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32."
    action quiet "‹ Previous"
    text muted "4 of 268"
    action quiet "Next ›"
    action primary "Message customer"
  region "What was bought"
    fact "Two lamps" "EUR 90.00"
    fact "Cable tray" "EUR 25.00"
  footer
    text muted "Press j for the previous order, k for the next."
```

**Rationale:** Gmail teaches j and k beside its arrows, because a triage reader moves faster without the pointer. The header holds previous and next with their keys, and the position reads beside them.

**Cost:** Keyboard hints help nobody on a phone, where warehouse staff do this work. The header also gains two buttons that compete with the record's own commands.

**Reference:** Gmail

#### `back-to-the-list-then-in-again`: Back to the list, then in again

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    action quiet "‹ Back to orders"
    text muted "Paid · newest first"
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32."
    action primary "Message customer"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
  region "What was bought"
    fact "Two lamps" "EUR 90.00"
    fact "Cable tray" "EUR 25.00"
```

**Rationale:** Polaris moves between products through the list, because the list holds the search and the filters that define the queue. The record carries one way back; the next record opens from the list with its context intact.

**Cost:** Two steps per record instead of one. The list has to hold its scroll and filters across the round trip or the reader loses their place. Triage of fifty orders becomes a hundred navigations.

**Reference:** Shopify Polaris

#### `a-list-drawer-beside-the-record`: A list drawer beside the record

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  split 1:2
    region "Queue"
      text muted "Paid and awaiting, newest first. 4 of 268."
      list 4
        item: text "SO-1042" · text muted "Maria Garcia · EUR 125.00" · status "Paid" positive
    region "SO-1042"
      header
        heading "SO-1042"
        status "Paid" positive
        text muted "Maria Garcia · Garcia Interiors restock."
        action primary "Message customer"
      region "What was bought"
        fact "Two lamps" "EUR 90.00"
        fact "Cable tray" "EUR 25.00"
```

**Rationale:** Intercom draws the queue beside the conversation, because triage reads the list and the record together. The drawer lists the queue's orders with their state and money; the record reads to its right.

**Cost:** The drawer takes a third of the width at desktop and the whole width on a phone, where it has to become a sheet. It also duplicates the orders list page, so two lists of orders have to stay true.

**Reference:** Intercom

#### `jump-to-a-record-by-searching`: Jump to a record by searching

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32."
    action "Jump to an order"
    action primary "Message customer"
  region "What was bought"
    fact "Two lamps" "EUR 90.00"
    fact "Cable tray" "EUR 25.00"
  region "Orders matching SO-10"
    list 2
      item: text "SO-1031" · text muted "Tom Becker · EUR 40.45 · Awaiting"
```

**Rationale:** Linear jumps to any issue from its command menu, because a reader who knows the number should not walk the queue to reach it. The order number, customer name or email lands on the record in one step.

**Cost:** Search answers only the record the reader already knows, so it never helps triage an unknown queue. It also needs the menu everywhere, which is a frame behavior rather than a record pattern.

**Reference:** Linear

#### `no-movement-each-record-opens-from-the-list`: No movement: each record opens from the list

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32."
    action "Close"
    action primary "Message customer"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
  region "What was bought"
    fact "Two lamps" "EUR 90.00"
    fact "Cable tray" "EUR 25.00"
```

**Rationale:** Some consoles deliberately offer no neighbor step, because the list is the queue and the record is the work. The reader finishes an order, closes it, and the list shows what is next. Nothing on the record can carry a stale position.

**Cost:** Every record costs a full round trip through the list, which is slow triage and loses the reader's scroll each time. It is honest but it is the slowest honest option.

### Order record

**Question:** The order is the record support opens most. Maria Garcia ordered SO-1042. It totals EUR 125.00 for two lamps, a delivery fee and a cable tray. It must state its lines, its payments and its refunds in one reading. The money adds up. Every refund reads against the payment it reverses.

**Default:** `summary-three-sections-history-in-the-aside`

**Compact:** On a phone the order stacks in the order the questions are asked at the counter: state and customer first, then parcels, then money. The compact option is `the-order-on-a-phone`.

**Rationale:** Keep the record-page shape with a summary, three sections and history in the aside. Customer, lines and money each keep their own section. The runner-up is the money-first layout. It fits finance readers who reconcile payments against refunds.

Prefer the tabbed layout only once an order outgrows three sections. Never ship the phone layout as the desktop page. Stacked sections waste most of the width there.

#### `summary-three-sections-history-in-the-aside`: Summary, three sections, history in the aside

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Placed 8 Oct 2026, 09:32 by Maria Garcia of Garcia Interiors."
    action "Resend the confirmation"
    action "Refund"
    action primary "Message customer"
  split 2:1
    region "Order"
      fact "Customer" "Maria Garcia"
      fact "Delivery" "Garcia Interiors restock"
      fact "Paid" "EUR 125.00"
      list 3
        item: text "Oak desk lamp" · text muted "one per parcel · PC-0C893968A2" · status "Packed" neutral
      fact "Refunded" "EUR 0.00"
    aside
      region "What happened"
        timeline 3
          item: text "Paid by card" · text muted "Acme Supply · 8 Oct 2026, 09:34"
```

**Rationale:** A summary of the order with the customer, the lines and the money beside a history aside. Each facet of SO-1042 has one home and the money adds up top to bottom in its own section.

**Cost:** Three sections is a ceiling, so the fourth facet waits for a tab or a second page. The aside also stacks below everything under 900 px, which buries the history on a phone.

#### `one-facet-per-tab`: One facet per tab

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32 · EUR 125.00."
    action primary "Message customer"
  tabs "Lines" "Payment" "Notes" "History"
    region "Lines"
      list 3
        item: text "Oak desk lamp" · text muted "one per parcel · PC-0C893968A2" · status "Packed" neutral
```

**Rationale:** Shopify draws an order as tabs for timeline, lines and payments, because an order with messages, notes and refunds outgrows three sections. The customer summary stays above the tabs so the record is always identified.

**Cost:** Lines and payments can no longer be read together, so checking a refund against its line means switching tabs. The tab state also has to live in the URL to stay shareable.

**Reference:** Shopify

#### `one-long-page-everything-in-order`: One long page, everything in order

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Placed 8 Oct 2026, 09:32 by Maria Garcia of Garcia Interiors."
    action primary "Message customer"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
    fact "Country" "Netherlands"
  region "What was bought"
    fact "Two lamps" "EUR 90.00"
    fact "Delivery fee" "EUR 10.00"
    fact "Cable tray" "EUR 25.00"
  region "Payments"
    fact "Card, reference SH-88213" "EUR 125.00"
    status "Settled" positive
  region "Refunds"
    text muted "Nothing has been refunded. A refund goes back against the card payment."
    action "Refund to that payment"
  region "What happened"
    timeline 2
      item: text "Paid by card" · text muted "Acme Supply · 8 Oct 2026, 09:34"
```

**Rationale:** Stripe draws a charge as one scrolling page, because support reads top to bottom and prints the page for the file. Customer, lines, payments, refunds and history follow in the order the questions are asked.

**Cost:** A long page buries the later sections, so refunds sit below the fold on every order. There is also no shortcut to one facet: the reader scrolls past everything above it.

**Reference:** Stripe

#### `money-first`: Money first

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock · 8 Oct 2026, 09:32."
    action "Refund"
    action primary "Message customer"
  region "Money"
    text muted "Paid by card on 8 Oct 2026, 09:32, reference SH-88213."
    fact "Two lamps" "EUR 90.00"
    fact "Delivery fee" "EUR 10.00"
    fact "Cable tray" "EUR 25.00"
    fact "Charged in total" "EUR 125.00"
    fact "Refunded in total" "EUR 0.00"
  region "The customer"
    fact "Name" "Maria Garcia"
    fact "Email" "maria@garcia-interiors.example"
```

**Rationale:** Xero opens an invoice on its money, because finance asks what moved before asking who moved it. Payments and refunds sit directly under the header with the statement adding up, and the customer and lines follow below.

**Cost:** Support reads the customer first, so money-first puts their answer second on every call. The money section also repeats the lines it totals, which is the same figure stated twice.

**Reference:** Xero

#### `customer-first`: Customer first

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Garcia Interiors restock · 8 Oct 2026, 09:32 · EUR 125.00."
    action primary "Message customer"
  region "The customer"
    row
      avatar "MG"
      text "Maria Garcia"
    text muted "maria@garcia-interiors.example · Netherlands."
    action quiet "All orders by Maria"
    text muted "2 orders with Acme Supply, both paid, none refunded."
  region "What was bought"
    fact "Two lamps" "EUR 90.00"
    fact "Delivery fee" "EUR 10.00"
    fact "Cable tray" "EUR 25.00"
  region "Payments"
    fact "Card, reference SH-88213" "EUR 125.00"
    status "Settled" positive
```

**Rationale:** Zendesk opens a case on the requester, because support answers a person rather than a record. The customer card leads with name, contact and order history, and the lines and money read as that customer's story below it.

**Cost:** The record's own identity waits behind the customer's, so an order-first reader scrolls past a card they did not open. Customer history on the order also duplicates the customer page.

**Reference:** Zendesk

#### `the-order-on-a-phone`: The order on a phone

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text muted "Maria Garcia · Garcia Interiors restock."
    action primary "Message customer"
  region "Parcels"
    action quiet "Resend"
    list 2
      item: text "PC-0C893968A2" · text muted "Oak desk lamp · one per parcel" · status "Packed" neutral
  region "Money"
    fact "Paid by card" "EUR 125.00"
    fact "Refunded" "EUR 0.00"
```

**Rationale:** Shopify stacks an order on mobile in the order the questions are asked at the counter: state and customer first, then parcels, then money. One column, full-width primary, nothing beside anything else.

**Cost:** Stacking puts the money last, so a refund at the counter is a long scroll away. The history also drops to the foot, where nobody on a phone reads it.

**Reference:** Shopify

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/patterns/record-detail#show-one-primary-action-in-a-record-header | checkable | `litespec patterns check` refuses a wireframe header holding two primary actions; a reviewer confirms each built record header holds at most one. |
| litespec/frontend/patterns/record-detail#keep-destructive-commands-out-of-the-primary-place | guidance | Does every destructive command on a record page sit outside the primary place, in its own tone? |
| litespec/frontend/patterns/record-detail#record-header | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/record-detail#record-tabs | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/record-detail#record-summary | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/record-detail#record-aside | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/record-detail#record-timeline | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/record-detail#related-records | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/record-detail#record-the-reader-may-not-change | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/record-detail#record-change-history | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/record-detail#record-notes | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/record-detail#record-attachments | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/record-detail#property-list-with-copy | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/record-detail#record-header-on-a-phone | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/record-detail#previous-and-next-record | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/record-detail#order-record | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
