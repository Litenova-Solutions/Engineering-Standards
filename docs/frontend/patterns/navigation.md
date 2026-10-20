# Navigation Patterns

## Intent

Navigation is the frame around every page: the sidebar, the header, the breadcrumb, tabs, the command palette and the account menu. These patterns answer how a reader moves through the back office and knows where they are. Each pattern offers drawn options and names a default.

## Standards

### Mark the current section

**Requirement:** The navigation MUST mark the section that holds the current page.

**Rationale:** A reader who arrives from a link sees at once where the page sits. An unmarked frame makes every page look like the start.

### Give every page its own address

**Requirement:** Every page MUST have its own URL that opens it directly.

**Rationale:** A reader shares, bookmarks and reopens a page by its address. A page reachable only by clicking through cannot be linked from a notification or a record.

## Patterns

### Sidebar

**Question:** Seven top-level areas organize the console. Settings alone holds thirty routes. Groups expand to two levels. The current item stays marked wherever it sits.

**Default:** `grouped-areas-with-expandable-sub-items`

**Compact:** Below the md breakpoint the sidebar becomes an off-canvas sheet: the same entries slide in over a scrim and dismiss with a close control. The compact option is `the-sidebar-as-an-off-canvas-sheet-on-a-phone`.

**Rationale:** Keep the grouped areas with expandable sub-items. Seven areas with two levels are what Fluent allows. The expandable group is the shape sidebar components ship. The counts beside groups are the runner-up for areas that hold a queue, such as refunds.

A count beside every area reports status the reader did not ask for. Never ship the flat list of every page. Over a hundred entries is an index, not a map, and it belongs in the command palette.

#### `grouped-areas-with-expandable-sub-items`: Grouped areas with expandable sub-items

```wireframe
page
  breadcrumb "Home" "Products"
  header
    heading "Products"
    text "93 in the catalog."
    action primary "New product"
  split 1:4
    nav side
      link "Home"
      link "Orders"
      link "Customers"
      link current "Products"
      link "Variants"
      link "Invoices"
      link "Reports"
      link "Settings"
    region "Products"
      toolbar
        field "Search products" search
        action "Active 81"
        action "Draft 9"
      table 4 "Product" "Stock" "State" "Price"
        item: text "Oak desk lamp" · text "412 in stock" · status "Active" positive · text "EUR 45.00"
```

**Rationale:** Seven areas, each expandable, with the current item marked and the sub-item indented under its area. The account sits at the foot.

**Cost:** Thirty settings routes in one group means a group longer than the screen. Settings stays open on every settings page, so it never collapses.

#### `two-levels-with-the-group-showing-a-live-count`: Two levels, with the group showing a live count

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "10 open. The oldest waited 214 days."
    action "Export"
  split 1:4
    nav side
      link "Home"
      link "Orders"
      link "Awaiting payment 31"
      link current "Refunds 10"
      link "Exceptions 2"
      link "Customers"
      link "Products"
      link "Invoices"
      link "Reports"
      link "Settings"
    region "Refunds"
      toolbar
        field "Search refunds" search
      table 4 "Order" "Customer" "Asked" "State" "Amount"
        item: text "SO-1042" · text "Maria Garcia" · text muted "Asked 6 days ago" · status "Open" neutral · text "EUR 125.00"
```

**Rationale:** The groups carry the number a reader would otherwise have to go and get: 10 under Refunds, 3 team invitations, 5 disputes. The count is the group's whole job.

**Cost:** A count beside every area is a claim on every read. An area with a zero count looks finished rather than empty.

#### `a-flat-list-with-a-search-box`: A flat list with a search box

```wireframe
page
  breadcrumb "Home" "Settings"
  header
    heading "Settings"
    text "33 areas. Search them or scroll."
  split 1:4
    nav side
      link "Home"
      link "Orders"
      link "Customers"
      link "Products"
      link "Invoices"
      link "Reports"
      link "Settings"
    region "Settings"
      toolbar
        field "Jump to" search
        text "2 match"
      list 2
        item: text "Dispatch plan" · text muted "Settings · Warehouses · Bays and carriers" · action "Open"
```

**Rationale:** Thirty settings routes plus six areas is a tree. A flat list of every page with a search box collapses the tree into one index, and the reader types what they want.

**Cost:** Thirty settings routes is the reason a tree exists at all. A flat list of over a hundred entries is a wall, and the sidebar stops being a map.

#### `a-command-palette-for-the-whole-product`: A command palette for the whole product

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
    action "Open the palette"
  split 1:4
    nav side
      link "Home"
      link current "Orders"
      link "Customers"
      link "Products"
      link "Invoices"
      link "Reports"
      link "Settings"
    region "Orders"
      toolbar
        field "Search orders" search
      table 3 "Order" "Customer" "State" "Paid"
        item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  dialog "Jump to"
    field "Search pages, orders, products" search = "refund"
    region "Go to"
      list 2
        item: text "Refunds" · text muted "Orders" · action "Open"
```

**Rationale:** The sidebar holds the seven areas and a palette holds everything else. Cmd-K is the shape most consoles now use for a large route count.

**Cost:** It only works if the reader knows the key exists. It cannot be the only way to anything. WCAG 2.1.1 requires every function to work from the keyboard. A hidden palette is a discoverability problem rather than an accessibility one.

#### `the-sidebar-as-a-page-opened-over-the-content`: The sidebar as a page, opened over the content

```wireframe
page
  header
    heading "Menu"
    text "Acme Supply"
    action "Close"
  region "Areas"
    list 7
      item: text "Orders" · text muted "268 orders, 2 needing attention" · action "Open"
  region "Account"
    text "Signed in as Chris Novak, warehouse lead."
    action "Help"
```

**Rationale:** At 390 pixels there is no beside, so the navigation is a page of its own with a Back. Every entry is visible at once rather than behind a hamburger.

**Cost:** One more navigation level on a phone on the warehouse floor. A warehouse lead holding a phone pays one extra tap at the worst time.

#### `the-sidebar-as-an-accordion-with-only-one-open`: The sidebar as an accordion with only one open

```wireframe
page
  breadcrumb "Home" "Products"
  header
    heading "Products"
    text "93 in the catalog."
    action primary "New product"
  split 1:4
    nav side
      link "Home"
      link current "Products"
      link "Variants"
      link "Orders ›"
      link "Customers ›"
      link "Invoices ›"
      link "Reports ›"
      link "Settings ›"
    region "Products"
      table 2 "Product" "Stock" "State" "Price"
        item: text "Oak desk lamp" · text "412 in stock" · status "Active" positive · text "EUR 45.00"
```

**Rationale:** One group open at a time keeps the sidebar short regardless of how many routes each group holds. Seven areas become seven lines plus two.

**Cost:** Fluent guidance says the indicator stays visible on a collapsed parent with a current child. A reader then looks at a closed group to see where they are.

#### `recent-pages-pinned-above-the-areas`: Recent pages pinned above the areas

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 142 customers."
  split 1:4
    nav side
      link "SO-1042 · Maria Garcia"
      link "Garcia Interiors restock"
      link "September statement"
      link "Home"
      link current "Orders"
      link "Customers"
      link "Products"
      link "Invoices"
    region "Orders"
      toolbar
        field "Search orders" search
      table 4 "Order" "Customer" "State" "Paid"
        item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The three most recent pages sit above the seven areas, so resuming work is one click instead of re-walking the tree. None of the other variants remembers where the reader was: clearer navigation by recency rather than by structure.

**Cost:** Recents are per person, so a shared screen shows another person's trail. A recent that was archived or renamed also needs a rule for what its row says.

#### `collapsed-to-an-icon-rail-on-a-narrow-screen`: Collapsed to an icon rail on a narrow screen

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 142 customers, newest first."
  split 1:9
    region "Areas"
      icon "Home"
      icon "Orders"
      icon "Customers"
      icon "Products"
      icon "Invoices"
      icon "Reports"
      icon "Settings"
    region "Orders"
      toolbar
        field "Search orders" search
        action "Any state"
      table 2 "Order" "Customer" "State" "Paid"
        item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** Linear collapses its sidebar to an icon rail rather than hiding it, so the seven areas stay one click away on a narrow laptop. The rail keeps the current item marked and the account visible as an avatar.

**Cost:** Labels are gone, so a new reader has to hover all seven glyphs to learn them. Counts beside groups have nowhere to go either.

**Reference:** Linear

#### `the-sidebar-as-an-off-canvas-sheet-on-a-phone`: The sidebar as an off-canvas sheet on a phone

```wireframe
page
  header
    heading "Orders"
    text "268 orders."
    action "Open the menu"
  region "Orders"
    toolbar
      field "Search orders" search
    list 2
      item: text "SO-1042 · Maria Garcia" · text muted "8 Oct 2026, 09:32 · Garcia Interiors" · status "Paid" positive · text "EUR 125.00"
  drawer left "Menu"
    nav side
      link "Home"
      link current "Orders"
      link "Returns"
      link "Exceptions"
      link "Customers"
      link "Products"
```

**Rationale:** The sidebar turns into a sheet below the md breakpoint: the same entries slide in over a scrim and dismiss with a close control. Nothing about the tree changes between desktop and phone.

**Cost:** The sheet covers the page it came from, so comparing the navigation with the content means opening and closing it. A warehouse lead looking up one order costs one extra tap.

**Reference:** shadcn

### Breadcrumb

**Question:** Trails run four levels deep on a product variant. A trail never wraps and may scroll sideways. The last item carries aria-current. Dutch strings sometimes appear in an English frame.

**Default:** `the-trail-as-the-parent-chain`

**Compact:** Below the md breakpoint the trail collapses to a single back link to the parent, above the heading. The compact option is `back-to-the-parent-on-a-phone`.

**Rationale:** Keep the parent chain with the last item marked current: it is the only place a record states its place in the tree. The left-truncating trail with an overflow menu is the runner-up for four-level chains. It keeps the current page visible where sideways scrolling hides it.

Never ship no trail at all: on a phone the sidebar is closed, so the trail is the only statement of where a record sits.

#### `the-trail-as-the-parent-chain`: The trail as the parent chain

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Standard"
  header
    heading "Standard"
    status "Active" positive
    text "What this price tier is, and the discount rule its lines carry."
    action "Pause sales"
  region "Details"
    fact "Units per line" "1"
    fact "Stock" "Whole product"
    fact "Sold" "9,412 of 10,000"
```

**Rationale:** Every level is a link except the last, which carries the current item. It is the only place the record's place in the tree is stated.

**Cost:** Four levels on a price tier, and Fluent's no-wrap rule pushes the last item off a phone unless the trail scrolls.

#### `a-trail-that-truncates-from-the-left`: A trail that truncates from the left

```wireframe
page
  breadcrumb "Home" "Standard"
  menu "Levels above"
    action "Products"
    action "Oak desk lamp, natural oil finish with brass fittings"
  header
    heading "Standard"
    status "Active" positive
    text "What this price tier is, and the discount rule its lines carry."
    action "Pause sales"
  region "Details"
    fact "Units per line" "1"
    fact "Sold" "9,412 of 10,000"
```

**Rationale:** Fluent truncates after 80 characters with a tooltip. The overflow collapses into a menu from the second item. A long product name never pushes the current page off.

**Cost:** A menu in the trail is a third kind of menu on one page. The page already has row menus and header menus. The reader opens it to see where they are.

**Reference:** Fluent

#### `no-trail-because-the-sidebar-already-says-it`: No trail, because the sidebar already says it

```wireframe
page
  header
    heading "Products"
    text "93 in the catalog."
    action primary "New product"
  split 1:4
    nav side
      link "Home"
      link "Orders"
      link "Customers"
      link current "Products"
      link "Invoices"
      link "Reports"
      link "Settings"
    region "Products"
      table 2 "Product" "Stock" "State" "Price"
        item: text "Oak desk lamp" · text "LMP-OAK-01 · 412 in stock" · status "Active" positive · text "EUR 45.00"
```

**Rationale:** The expanded sidebar entry is the trail. One navigation element instead of two, and the heading starts at the top of the page.

**Cost:** It fails WCAG 2.4.8 in the practical sense on a phone. The sidebar is closed there, so no evidence shows where a record sits in the tree. GOV.UK's own rule is that the trail appears when a parent page exists.

#### `a-trail-with-the-state-on-the-parent-link`: A trail with the state on the parent link

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp, Active" "Standard"
  header
    heading "Standard"
    status "Active" positive
    text "In stock, 412 ready to ship. 1,204 orders."
    action "Pause sales"
  region "Details"
    fact "Units per line" "1"
    fact "Sold" "9,412 of 10,000 stocked"
```

**Rationale:** The trail carries the parent's state, so a reader knows whether the product they are inside is still live before they read anything else. The trail becomes informative rather than structural.

**Cost:** Fluent truncates a trail item at 80 characters. A product name plus a state badge plus an ellipsis is three things in eighty characters. The breadcrumb stops being a navigation control.

#### `a-trail-with-the-area-s-other-pages-beside-it`: A trail with the area's other pages beside it

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Active" positive
    text "LMP-OAK-01 · 412 in stock."
    action "Pause sales"
  tabs "Details" "Variants" "Pricing" "Stock" "Money" "Operations" "Orders" "Questions"
    region "Pricing"
      table 1 "Tier" "Sold" "Price"
        item: text "Standard" · text "1,182 of 2,000" · text "EUR 45.00"
```

**Rationale:** The trail, then the sibling pages of this area as tabs. The reader can move sideways without going back to the sidebar.

**Cost:** Two navigation mechanisms for the same tree: sibling pages of one area already have their own navigation, and this adds a second beside it.

#### `a-trail-that-scrolls-sideways-rather-than-truncating`: A trail that scrolls sideways rather than truncating

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp, natural oil finish" "Standard, list price" "Pricing"
  header
    heading "Pricing"
    text "Standard, list price. Garcia Interiors restock."
  region "Pricing"
    fact "Standard" "EUR 45.00"
    fact "Sold" "9,412 of 10,000"
```

**Rationale:** Fluent allows a breadcrumb to scroll horizontally rather than wrap. Every level stays readable. The reader reaches the current item by scrolling rather than by truncation.

**Cost:** The current item is off screen on arrival. That is the opposite of what a breadcrumb is for. A horizontal scroll inside a page is easy to miss.

**Reference:** Fluent

#### `back-to-the-parent-on-a-phone`: Back to the parent on a phone

```wireframe
page
  link "‹ Oak desk lamp"
  header
    heading "Standard"
    status "Active" positive
    text "What this price tier is, and the discount rule its lines carry."
    action "Pause sales"
  region "Details"
    fact "Units per line" "1"
    fact "Sold" "9,412 of 10,000"
```

**Rationale:** GitHub collapses its trail to a single back link on narrow screens: the parent name with a chevron, above the heading. One line replaces four levels and the heading keeps its place.

**Cost:** Grandparents are unreachable from the record, so a reader three levels deep walks up one level at a time. The full chain remains only on desktop.

**Reference:** GitHub

#### `the-current-title-as-a-sibling-menu`: The current title as a sibling menu

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Standard"
  header
    heading "Standard"
    status "Active" positive
    text "What this price tier is, and the discount rule its lines carry."
    action quiet "Standard ▾"
    action "Pause sales"
  menu "Price tiers"
    action "Standard"
    action "Economy"
    action "Bundle"
    action "Add a price tier"
  region "Details"
    fact "Units per line" "1"
    fact "Sold" "9,412 of 10,000"
```

**Rationale:** Notion turns the current page title into a menu of its siblings: opening it lists the other price tiers beside Standard. Moving sideways costs one click instead of up and back down.

**Cost:** A heading that opens a menu is a heading that does not behave like one. The menu repeats the sidebar section the reader left. It fits only where siblings are visited together.

**Reference:** Notion

### Header bar

**Question:** The bar carries the page title, a sidebar toggle, a help control and the theme. It does not carry the company name. It does not say who is acting. It says nothing about location beyond the page title.

**Default:** `the-bar-with-the-company-name`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the bar with the company name and the acting person added. A support conversation needs both facts before anything else. The sidebar toggle is what opens the phone sheet.

The deployment identity band is the runner-up for sandbox deployments only, where naming the deployment on every page avoids confusion with production. Never ship no bar at all: burying the theme and language in the sidebar foot turns a visible control into three taps.

#### `the-bar-with-the-company-name`: The bar with the company name

```wireframe
page
  toolbar
    action "Toggle the sidebar"
    text "Acme Supply"
    text "Acting as Alex Morgan"
    action "Help"
    action "Switch the theme"
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 142 customers, newest first."
  region "Orders"
    table 3 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The page title on the left, then the things that are true everywhere: which company, who is acting, help and theme. The sidebar toggle stays because a phone needs it.

**Cost:** Four things in a bar above the content on every page, and a brand mark that repeats what the sidebar already says.

#### `the-bar-as-the-breadcrumb-replacing-the-trail`: The bar as the breadcrumb, replacing the trail

```wireframe
page
  toolbar
    action "Toggle the sidebar"
    text "Products › Oak desk lamp › Standard"
    action "Help"
    action "Switch the theme"
  header
    heading "Standard"
    status "Active" positive
    text "What this price tier is, and the discount rule its lines carry."
    action "Pause sales"
  region "Details"
    fact "Units per line" "1"
    fact "Sold" "9,412 of 10,000"
```

**Rationale:** The chain moves into the bar, where the page title already is. One place states where the reader is rather than two.

**Cost:** The bar is present on every page including the list pages where there is no chain, so the bar has two different shapes. Fluent treats the breadcrumb as a page-level element below the header.

#### `a-bar-that-carries-nothing-but-the-frame`: A bar that carries nothing but the frame

```wireframe
page
  toolbar
    action "Switch the theme"
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 142 customers, newest first."
  region "Orders"
    toolbar
      field "Search orders" search
    table 2 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The bar holds only the sidebar toggle and the theme. Everything else is in the sidebar or the page, so the bar never competes with the content.

**Cost:** The reader loses the company name and who they are acting as, which are the two facts a support conversation needs before anything else.

#### `the-bar-with-a-persona-switcher-which-is-the-same-as-being-s`: The bar with a persona switcher, which is the same as being somebody else

```wireframe
page
  toolbar
    text "Orders"
    action "Act as Alex Morgan"
    action "Help"
    action "Switch the theme"
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  menu "Act as"
    action "Sam Rivera"
    action "Alex Morgan"
    action "Priya Shah"
    action "Chris Novak"
  region "Orders"
    table 2 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The foot switcher, moved into the bar and made explicit. Acting as somebody changes what the session can do, so it belongs where a reader looks for who they are.

**Cost:** On a production deployment with one real account there is nothing to switch to. A switcher that always lists one person is a control that cannot do anything.

#### `the-bar-with-the-deployment-identity`: The bar with the deployment identity

```wireframe
page
  toolbar
    text "Orders"
    status "Sandbox" info
    action "Help"
    action "Switch the theme"
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Nothing here is charged and nothing reaches a bank."
  region "Orders"
    table 2 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** Where a deployment is a sandbox, the bar says so on every page. Naming the deployment is the one job of an identity band.

**Cost:** A deployment identity in the bar competes with the page title for space. A reader who has seen it fifty times stops seeing it.

#### `no-bar-at-all-with-the-theme-and-language-in-the-sidebar-foo`: No bar at all, with the theme and language in the sidebar foot

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 142 customers, newest first."
  split 1:4
    nav side
      link "Home"
      link current "Orders"
      link "Customers"
      link "Products"
      link "Invoices"
      link "Reports"
      link "Settings"
    region "Orders"
      toolbar
        field "Search orders" search
        action "Any state"
      table 3 "Order" "Customer" "State" "Paid"
        item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  footer
    text "Alex Morgan, operations manager"
    action "English"
    action "Light"
    action "Help"
```

**Rationale:** The controls that change nothing about the data live with the account they belong to. The top of the page is then entirely the page's own.

**Cost:** Three global controls become three taps on every visit, and removing the header landmark is a structural change rather than a preference.

#### `search-inbox-and-account-in-the-bar`: Search, inbox and account in the bar

```wireframe
page
  toolbar
    text "Orders"
    field "Search" search
    action "Notifications, 3 unread"
    action "Account: Alex Morgan"
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 142 customers, newest first."
  region "Orders"
    table 3 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** GitHub keeps one global bar: a search trigger that opens the palette, a bell with the unread count, and the account avatar. Everything true on every page sits in one row and the page starts below it.

**Cost:** Three global controls compete with the page title for the same row. On a phone the bar keeps only the menu glyph and the bell. The account moves to the sheet.

**Reference:** GitHub

#### `the-record-name-and-state-in-the-bar-on-a-record-page`: The record name and state in the bar on a record page

```wireframe
page
  toolbar
    action "Back to Orders"
    text "SO-1042"
    status "Paid" positive
    action "Help"
    action "Switch the theme"
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors · 8 Oct 2026, 09:32 · EUR 125.00"
    action primary "Message customer"
  region "Lines"
    list 2
      item: text "Oak desk lamp" · text muted "LMP-OAK-01 · quantity 2" · text "EUR 90.00"
```

**Rationale:** Linear keeps the record identifier and state in the header once a record is open. A reader who scrolled past the heading still knows which record is on screen. The bar names the record. The page carries the detail.

**Cost:** The bar then has two shapes, one for lists and one for records, and the record shape repeats the heading word for word. It is worth the height only on long records.

**Reference:** Linear

### Tabs within a page

**Question:** Sibling pages of one area sit in a sub-page navigation. A second tab row uses a subordinate level. Tab sets stay small, at about six. The active tab belongs in the URL.

**Default:** `the-shipped-tab-row-with-the-tab-in-the-url`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the tab row with the active tab in the URL. A pasted link carries the facet. The row sits where every tab implementation puts it.

Tabs as real links are the runner-up and the most defensible alternative. Middle click and the back button then behave as expected. Prefer them where each facet is its own route. Never ship the segmented control for facets: three segments is its ceiling and it cannot carry counts or overflow.

#### `the-shipped-tab-row-with-the-tab-in-the-url`: The shipped tab row, with the tab in the URL

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Standard"
  header
    heading "Standard"
    status "Active" positive
    text "What this price tier is, and the discount rule its lines carry."
    action "Pause sales"
  tabs "Pricing" "Availability" "Returns" "Details"
    region "Details"
      fact "Units per line" "1"
      fact "Stock" "Whole product"
```

**Rationale:** The tab row under the header on a price tier, with the active tab as a URL parameter, so a pasted link carries it.

**Cost:** A reader cannot compare two facets, and every new backend facet adds a tab. Carbon and GOV.UK both cap tabs at about six for this reason.

#### `tabs-carrying-counts`: Tabs carrying counts

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Active" positive
    text "LMP-OAK-01 · 412 in stock."
    action primary "Add a variant"
  tabs "Details" "Variants 2" "Price tiers 3" "Returns 0" "Questions 4"
    region "Variants"
      table 2 "Variant" "Sold" "Price" "State"
        item: text "Standard" · text "9,412 of 10,000" · text "EUR 45.00" · status "Active" positive
```

**Rationale:** Each tab carries how many things are in it, so a reader knows whether a facet is worth opening. Four tabs where one holds 9,412 and another holds 0.

**Cost:** A count of 0 invites a click that leads to an empty state. A count has to be a read per tab rather than a number in a template.

#### `tabs-below-the-summary-as-a-sub-page-navigation`: Tabs below the summary, as a sub-page navigation

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors · 8 Oct 2026, 09:32 · EUR 125.00"
    action primary "Message customer"
  region "The order at a glance"
    fact "Paid" "EUR 125.00"
    fact "Placed" "8 Oct 2026, 09:32"
  tabs "Lines" "Payment" "Refunds" "Messages"
    region "Lines"
      list 3
        item: text "Oak desk lamp" · text muted "LMP-OAK-01 · quantity 2" · status "Ready" info · action "Refund"
```

**Rationale:** The summary stays on screen, and the sibling pages of this area become a tab row at a subordinate level beneath it.

**Cost:** The tab row is lower on the page. A reader scrolls to reach it. On a long record the facets sit below the fold.

#### `tabs-as-links-so-a-middle-click-works`: Tabs as links, so a middle click works

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Active" positive
    text "LMP-OAK-01 · 412 in stock."
    action primary "Add a variant"
  tabs "Details" "Pricing" "Stock" "Money" "Operations"
    region "Pricing"
      fact "Standard" "EUR 45.00"
      text muted "9,412 sold of 10,000"
```

**Rationale:** The tab labels are real links to sibling routes rather than buttons that swap a panel. Middle click, open in a new tab, and the back button all behave the way a reader expects.

**Cost:** GOV.UK's own tabs implementation is exactly this, anchor links with a URL fragment. This is the most defensible option available rather than an alternative.

**Reference:** GOV.UK

#### `a-segmented-control-instead-of-tabs`: A segmented control instead of tabs

```wireframe
page
  breadcrumb "Home" "Settings" "Warehouses" "Amsterdam warehouse"
  header
    heading "Amsterdam warehouse"
    status "Active" positive
    text "40 pallets, general storage."
    action primary "Add a bay"
  row
    action primary "Bays 4"
    action quiet "Capacity"
    action quiet "Details"
  region "Bays"
    list 3
      item: text "Bay A" · text muted "4 docks · open from 08:00" · status "Active" positive · action "Edit"
```

**Rationale:** Where the choice is between two or three views of the same data rather than different pages, a segmented control is the right control. Carbon names the content switcher for exactly this.

**Cost:** A segmented control cannot hold a count, cannot overflow, and says nothing about being on a different page. Three segments is its ceiling.

**Reference:** Carbon

#### `no-tabs-because-the-facets-are-a-checklist`: No tabs, because the facets are a checklist

```wireframe
page
  breadcrumb "Home" "Settings" "Warehouses" "Amsterdam warehouse"
  header
    heading "Amsterdam warehouse"
    status "Active" positive
    text "40 pallets, general storage."
    action primary "Add a bay"
  region "What it is"
    fact "Name" "Amsterdam warehouse"
    fact "Capacity" "40 pallets"
    fact "Company" "Acme Supply"
  region "Bays"
    list 2
      item: text "Bay A" · text muted "4 docks · open from 08:00" · status "Active" positive · action "Edit"
  region "Which deliveries use it"
    list 1
      item: text "Garcia Interiors restock" · text muted "Sat 14 Mar 2026 · 40 pallets" · action "Open"
```

**Rationale:** Where a record has a handful of facets and they all fit, headed sections on one page. GOV.UK names this as the first-class alternative to tabs and it is the right answer for most records.

**Cost:** A long page. It stays honest only while the sections stay few, and it is why a record with eight facets carries tabs rather than eight sections.

**Reference:** GOV.UK

#### `overflow-tabs-in-a-more-menu`: Overflow tabs in a More menu

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock"
  header
    heading "Garcia Interiors restock"
    status "Scheduled" info
    text "Sat 14 Mar 2026 · Amsterdam warehouse"
    action primary "Add an item"
  tabs "Details" "Items" "Schedule" "Dispatch" "Money" "More"
    region "Items"
      table 2 "Item" "Units" "Price" "State"
        item: text "Oak desk lamp" · text "200 units" · text "EUR 45.00" · status "Ready" info
  menu "More"
    action "Operations"
    action "Orders"
    action "Notes"
```

**Rationale:** GitHub Primer moves overflowing tabs into a menu rather than scrolling the row. The first five facets stay visible and the rest sit one click away. Eight delivery sections fit a row built for five.

**Cost:** A reader cannot see which facet is current when it sits inside the menu. The More control has to carry the current label too. The menu also needs the same counts the row would have shown.

**Reference:** GitHub Primer

#### `vertical-tabs-on-a-settings-page`: Vertical tabs on a settings page

```wireframe
page
  breadcrumb "Home" "Settings" "Warehouses"
  header
    heading "Warehouses"
    text "3 sites with a dispatch plan."
    action primary "Add a warehouse"
  split 1:3
    nav side
      link "General"
      link current "Warehouses"
      link "Payments"
      link "Policies"
      link "Team"
      link "Roles"
    region "Warehouses"
      list 3
        item: text "Amsterdam warehouse" · text muted "40 pallets · general storage" · status "Active" positive · action "Edit"
```

**Rationale:** Stripe settings put the sections in a vertical list beside the content, so six sections read as a short index rather than a wide row. The current section stays visible while its fields scroll.

**Cost:** The list spends horizontal space on every section page. On a phone it stacks above the content where it reads as a second heading. It fits settings, not records.

**Reference:** Stripe

### Icons in the frame

**Question:** Seven area icons, a sidebar toggle, a help mark and the theme. A page never writes a raw interactive element. Every one of these is a component with a name and an accessible label.

**Default:** `an-icon-beside-every-label`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep an icon beside every label, drawn from one icon set. Seven areas need a visual catch. The icon reinforces the label rather than replacing it.

Words-only areas with icon-only actions are the runner-up where icon budget is short, with each action carrying a tooltip and an accessible name. Never ship state-carrying icons in the frame: theme and language as bare glyphs force the reader to hover both to tell them apart.

#### `an-icon-beside-every-label`: An icon beside every label

```wireframe
page
  breadcrumb "Home"
  header
    heading "Good afternoon, Alex"
    text "Two things need you today."
    action primary "New order"
  split 1:4
    region "Areas"
      list 7
        item: icon "Home" · link current "Home"
    region "Needs attention"
      status "2 to do" caution
      list 1
        item: text "Close out the March stock count" · text muted "The count ended. Nothing left to settle." · action "Close out"
```

**Rationale:** Every area carries an icon and its name, so the icon is reinforcement rather than the only label. It is what makes seven areas easy to read at a glance.

**Cost:** Seven icons is seven drawings to keep consistent and to give a name to. Carbon's tab guidance refuses icons in tab labels for the same reason.

#### `words-only-no-icons`: Words only, no icons

```wireframe
page
  breadcrumb "Home"
  header
    heading "Good afternoon, Alex"
    text "Two things need you today."
    action primary "New order"
  split 1:4
    nav side
      link current "Home"
      link "Orders"
      link "Customers"
      link "Products"
      link "Invoices"
      link "Reports"
      link "Settings"
    region "Needs attention"
      status "2 to do" caution
      list 1
        item: text "Close out the March stock count" · text muted "The count ended. Nothing left to settle." · action "Close out"
```

**Rationale:** The labels are the navigation. Nothing to draw, nothing to name, and nothing that fails when a reader cannot distinguish the icons.

**Cost:** Seven areas of the same weight in the same style is a wall of text, and the eye has nothing to catch on. This is the shape that needs a bold current item to work.

#### `icons-with-labels-and-the-label-hidden-on-a-phone`: Icons with labels, and the label hidden on a phone

```wireframe
page
  header
    heading "Good afternoon, Alex"
    text "Two things need you today."
  split 1:9
    region "Areas"
      list 7
        item: icon "Home"
    region "Needs attention"
      status "2 to do" caution
      list 1
        item: text "Close out the March stock count" · text muted "The count ended." · action "Close out"
```

**Rationale:** On a phone the sidebar is a page of words. Inside the collapsed frame the icons carry the seven areas and the labels are gone. The same component serves two densities.

**Cost:** An icon-only sidebar on a phone is seven drawings with no labels, which is the case Carbon refuses in tab labels. It works only if the phone also keeps the labels somewhere.

#### `a-section-of-the-sidebar-with-a-heading`: A section of the sidebar with a heading

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  split 1:4
    region "Areas"
      text muted "Today"
      link current "Home"
      text muted "What you sell"
      link "Orders"
      link "Customers"
      link "Products"
      text muted "What it makes"
      link "Invoices"
      link "Reports"
      text muted "How it is set up"
      link "Settings"
    region "Orders"
      table 2 "Order" "Customer" "State" "Paid"
        item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** Seven areas become two or three headed groups: what you sell, what it makes, how it is set up. The grouping is about the job rather than the object.

**Cost:** Grouping an area tree by job means a reader decides which group holds an area. Grouping by object is the convention everywhere else in the product.

#### `icons-only-for-the-actions-words-only-for-the-areas`: Icons only for the actions, words only for the areas

```wireframe
page
  toolbar
    text "Orders"
    action "Search orders"
    action "Export as CSV"
    action "Light or dark"
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 142 customers, newest first."
  split 1:4
    nav side
      link "Home"
      link current "Orders"
      link "Customers"
      link "Products"
      link "Invoices"
      link "Reports"
      link "Settings"
    region "Orders"
      table 3 "Order" "Customer" "State" "Paid"
        item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00" · action "More actions for order SO-1042"
```

**Rationale:** The split the evidence supports: an icon reinforces a labeled area, but an icon alone is never the label for a place. An action with one unmistakable meaning can be an icon with a tooltip and an accessible name.

**Cost:** An action that has to be learned has to be hovered. Material's rule allows one action per notification and no Dismiss. That is the same economy applied to a button.

#### `icons-that-carry-a-state-as-well-as-a-meaning`: Icons that carry a state as well as a meaning

```wireframe
page
  toolbar
    text "Orders"
    action "Language: English"
    action "Theme: light"
    action "Help"
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    table 2 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The theme and the language are icons because they carry one conventional meaning and no label worth the width. The company name is not an icon because it has to be read.

**Cost:** Theme and language are two icons with only conventional meanings. A reader who has not used one cannot tell them apart without hovering both.

#### `the-current-item-with-a-left-indicator-bar`: The current item with a left indicator bar

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 142 customers, newest first."
  split 1:4
    nav side
      link "Home"
      link current "Orders"
      link "Customers"
      link "Products"
      link "Invoices"
      link "Reports"
      link "Settings"
    region "Needs attention"
      status "1 to do" caution
      list 1
        item: text "31 refunds need a decision" · text muted "The 180-day window closes on 5 of them this week." · action "Decide"
```

**Rationale:** VS Code marks the current view with a border beside the label rather than an icon, so the eye finds it without reading. The bar sits outside the label, which keeps words-only areas easy to read at a glance.

**Cost:** A two-pixel bar is easy to miss on a long sidebar, and it says nothing on a phone where the sidebar is closed. The trail still has to carry the current page.

**Reference:** VS Code

#### `lucide-icons-at-one-size-from-one-set`: Lucide icons at one size, from one set

```wireframe
page
  breadcrumb "Home"
  header
    heading "Good afternoon, Alex"
    text "Two things need you today."
    action primary "New order"
  split 1:4
    region "Areas"
      list 7
        item: icon "Orders" · link "Orders"
      link "Help"
    region "Needs attention"
      status "2 to do" caution
      list 2
        item: text "Close out the March stock count" · text muted "The count ended. Nothing left to settle." · action "Close out"
```

**Rationale:** Icons come from the Lucide set at 16 px with a 2 px stroke. Every area icon comes from one set at one size. No two disagree on weight. One set is what keeps seven drawings consistent.

**Cost:** Fourteen pixels leaves no room for detail, so each glyph has to read as a silhouette. A new area needs a new drawing that fits the set.

**Reference:** Lucide

### Language and theme

**Question:** Two switches change nothing about the data. They are the most error-prone controls on the page. An explicit choice is preferred to the account default. A missing translation falls back to the other language.

**Default:** `both-switches-in-the-header-each-showing-its-value`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep both switches in the header, each showing its value. The reader sees what is set without opening anything. The theme is one tap at the end of a shift.

The account menu is the runner-up for language only, since language rarely changes and the menu groups it with the account it belongs to. Never ship no switch at all. One language is a commercial decision about which companies the product serves. It is not a UI simplification. The product already serves companies in two languages.

#### `both-switches-in-the-header-each-showing-its-value`: Both switches in the header, each showing its value

```wireframe
page
  toolbar
    text "Orders"
    field "Language" select = "English"
    field "Theme" select = "Light"
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    table 3 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** Each control carries its current value rather than an icon, so the reader can see what is set without opening it.

**Cost:** Two text buttons in a header of text, and a reader who wants to change the language twice a day reads 'EN' as decoration.

#### `both-switches-in-the-account-menu`: Both switches in the account menu

```wireframe
page
  toolbar
    text "Orders"
    action "Account: Alex Morgan"
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  menu "Alex Morgan · Acme Supply"
    action "Your account"
    action "Sign out"
    action "English"
    action "Nederlands"
    action "Light"
    action "Dark"
  region "Orders"
    table 2 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** Everything about who you are and how the product looks sits in one place, and the header is left for the page title. Account, language, theme and sign-out are one decision.

**Cost:** Two taps for a reader who only wants dark at the end of a shift. The theme is not something a reader opens an account menu to find.

#### `the-theme-following-the-system-with-an-override`: The theme following the system, with an override

```wireframe
page
  toolbar
    text "Orders"
    status "System theme" neutral
    field "Theme" select = "Match my device"
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    table 4 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The theme defaults to the operating system's and the reader overrides it once. The preference is kept, and the switch shows the override rather than the system's value.

**Cost:** A reader whose system is dark gets a dark console without asking. That is the correct behavior. A company filming a screen for a customer then gets a dark screenshot.

#### `a-language-choice-made-once-on-the-account`: A language choice made once, on the account

```wireframe
page
  breadcrumb "Home" "Account"
  header
    heading "Your account"
    text "Alex Morgan · Acme Supply"
  region "Language"
    field "Email" text = "alex@acme-supply.example"
    field "Language" select = "English"
    message info "Every page is available in English and Nederlands."
    action primary "Save"
```

**Rationale:** The account holds the language, so the console has no switch at all. The account page is where a preference that never changes belongs.

**Cost:** A company whose colleague changes the account language changes it for everyone. And a reader who cannot find the switch cannot say they do not speak it.

#### `the-theme-in-the-sidebar-foot-with-the-language`: The theme in the sidebar foot, with the language

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  split 1:4
    nav side
      link "Home"
      link current "Orders"
      link "Customers"
      link "Products"
      link "Invoices"
      link "Reports"
      link "Settings"
    region "Orders"
      table 2 "Order" "Customer" "State" "Paid"
        item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  footer
    text "Alex Morgan, operations manager"
    field "Language" select = "English"
    field "Theme" select = "Light"
```

**Rationale:** Both live with the account they belong to, at the foot of the frame, and the header keeps only the page title. Fewer things in the header.

**Cost:** The foot of a 900-pixel sidebar is a long way from the top of the page. On a phone the sidebar is a page the reader opens to reach either control.

#### `no-switch-at-all-because-the-company-is-in-one-country`: No switch at all, because the company is in one country

```wireframe
page
  toolbar
    text "Bestellingen"
    action "Help"
  breadcrumb "Start" "Bestellingen"
  header
    heading "Bestellingen"
    text "268 bestellingen van 142 klanten, nieuwste eerst."
  region "Bestellingen"
    table 3 "Bestelling" "Klant" "Staat" "Betaald"
      item: text "SO-1042" · text "Maria Garcia" · status "Betaald" positive · text "EUR 125,00"
```

**Rationale:** Dutch only. One language, one currency, one tax regime, and no reader has to choose anything about how the console looks or reads.

**Cost:** The product already serves companies in two languages. One language is a real commercial decision, not a UI one.

#### `theme-on-the-device-language-on-the-account`: Theme on the device, language on the account

```wireframe
page
  toolbar
    text "Orders"
    action "Theme: System"
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  menu "Theme"
    action "Match my device"
    action "Light"
    action "Dark"
    action "Language: English, on your account"
  region "Orders"
    table 2 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** Vercel keeps theme as a device-level choice with the system as the default, while language stays on the account. Each switch lives where its value lives, so neither pretends to be the other.

**Cost:** Two placements to learn instead of one, and a reader looking for language in the theme menu finds a pointer rather than the switch. The pointer has to name the account page plainly.

**Reference:** Vercel

#### `the-browser-language-offered-once`: The browser language offered once

```wireframe
page
  breadcrumb "Home"
  message info "Your browser is set to Nederlands. Switch the console to match it?"
  header
    heading "Good afternoon, Alex"
    text "Two things need you today."
    action "Switch to Nederlands"
    action "Keep English"
  region "Needs attention"
    status "2 to do" caution
    list 2
      item: text "Close out the March stock count" · text muted "The count ended. Nothing left to settle." · action "Close out"
```

**Rationale:** Atlassian offers the browser language once on first sign-in rather than guessing silently: a banner names what was detected and asks. Accepting sets the account language. Refusing dismisses the offer for good.

**Cost:** A reader who shares a device answers for the next reader too, and the offer has to remember it was refused. One refusal must dismiss it for good.

**Reference:** Atlassian

### Command palette

**Question:** An operations manager working a list often needs one record or one command and then the list again. The palette jumps straight to the order for Garcia Interiors. It runs the next step from the keyboard, so the reader never loses the page they were working.

**Default:** `cmd-k-dialog-with-grouped-results`

**Compact:** On a phone the palette opens as a bottom sheet where the thumb reaches the input, with recent records above the fold. The compact option is `the-palette-as-a-bottom-sheet-on-a-phone`.

**Rationale:** Keep the grouped Cmd+K dialog. Pages above records answer both where to go and what to open. The footer hints teach the keyboard without a help page.

Recent items first is the runner-up. It fits warehouse and support work that moves between a few records. Recency is personal state, and it reads wrong on a shared machine.

Never ship command verbs with a preview as the default palette. Every verb becomes a second path to a use case. Each one needs its own permission and refusal wording to keep.

#### `cmd-k-dialog-with-grouped-results`: Cmd+K dialog with grouped results

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  dialog "Jump to"
    field "Search pages, orders, products" search
    region "Go to"
      list 2
        item: text "Orders" · text muted "Pages"
    region "Orders"
      list 2
        item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive
    text muted "Move with Up and Down. Open with Enter."
```

**Rationale:** One dialog over the current page, with pages above records, so a typed query answers both where to go and what to open. The groups keep the list short enough to read while the query is still short.

**Cost:** Grouped results compete for the same short list, so a page the reader wants can sit below records they do not.

#### `search-scoped-to-current-area`: Search scoped to current area

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  dialog "Jump to"
    field "Scope" select = "Orders"
    field "Search orders" search
    region "Orders"
      list 2
        item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive
    text muted "Scope with Tab. Open with Enter."
```

**Rationale:** The scope starts on the area the reader is already in, so typing an order number on the orders page searches orders first. Widening to everything is one explicit step.

**Cost:** A scoped default hides matches elsewhere, so a reader who mistakes the scope concludes a record is missing.

#### `recent-items-first`: Recent items first

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  dialog "Jump to"
    field "Search pages, orders, products" search
    region "Recent"
      list 2
        item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive
    region "Go to"
      list 2
        item: text "Orders" · text muted "Pages"
    text muted "Open with Enter."
```

**Rationale:** Recent records sit above the groups before anything is typed, so returning to the order left open is one keypress. Recency matches how warehouse and support work moves between a few records.

**Cost:** Recency is personal state on a shared machine, so the next person at the keyboard sees what the last person opened.

#### `command-verbs-with-preview`: Command verbs with preview

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  dialog "Run a command"
    field "Type a command or search" search
    split 1:1
      region "Commands"
        list 2
          item: text "Open order" · text muted "SO-1042"
      region "SO-1042"
        fact "Order" "SO-1042"
        fact "Customer" "Maria Garcia"
        fact "Total" "EUR 125.00"
    text muted "Run with Enter."
```

**Rationale:** Verbs sit beside the records they act on, with the record preview beside the verb. Acting on the open order never needs a visit to its page first. The preview confirms the right record before the verb runs.

**Cost:** Every verb in the palette is a second path to a use case. Each one needs the same permission and refusal wording as its page.

#### `no-results-state`: No-results state

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  dialog "Jump to"
    field "Search pages, orders, products" search = "zzz"
    message "No matches in Acme Supply." neutral
    text muted "Close with Esc."
```

**Rationale:** An explicit empty state names the scope that was searched, so no match reads as a fact about the query rather than a broken search. The reader can edit the query without leaving the dialog.

**Cost:** A named scope in the empty state repeats wording the dialog already shows, so the state reads twice on a narrow dialog.

#### `keyboard-only-operation-with-visible-hints`: Keyboard-only operation with visible hints

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  dialog "Jump to"
    field "Search pages, orders, products" search
    menu "Results"
      action "Open SO-1042"
      action "Open Garcia Interiors restock"
    text muted "Move with Up and Down. Open with Enter. Close with Esc."
```

**Rationale:** Every action shows its key beside the row or in the footer, so the whole palette works without a pointer and says so. Hints stay visible rather than hiding behind a help key.

**Cost:** Visible hints take a row of the dialog on every state, so the results list shows one fewer row than it could.

#### `a-verb-first-then-the-record`: A verb first, then the record

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  dialog "Run a command"
    field "Type a command or search" search = "Refund"
    menu "Commands"
      action "Refund order"
      action "Message customer"
      action "Pause sales"
    text "Pick the record the verb acts on next."
    text muted "Run with Enter. Back with Esc."
```

**Rationale:** Raycast asks for the verb before the record, so the palette is a command runner rather than a search box. Typing narrows three hundred commands to one, and the record picker confirms what the verb acts on.

**Cost:** Two steps for a jump that search does in one. Every verb becomes a second path to a use case, with its own permission and refusal wording to keep.

**Reference:** Raycast

#### `the-palette-as-a-bottom-sheet-on-a-phone`: The palette as a bottom sheet on a phone

```wireframe
page
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    list 1
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive
  drawer bottom "Search"
    field "Search pages, orders, products" search
    list 2
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive
```

**Rationale:** Linear opens the palette as a bottom sheet on a phone, where the thumb reaches the input. The recent records sit above the fold of the sheet, so returning to the order left open is one tap.

**Cost:** The sheet covers the list it came from, and a phone keyboard leaves room for three rows at most. It answers jumps, not browsing.

**Reference:** Linear

### Account menu

**Question:** The frame names who is acting, for which company, with what access. The account sits at the foot of the sidebar with a way to switch identity beside it on a development deployment.

**Default:** `an-avatar-menu-in-the-header`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Put the avatar menu in the header. One control holds the account page, the access statement and sign-out. It matches Linear and Vercel, so nobody has to learn it.

The sidebar foot is the runner-up, but the foot is far from the top of a long page. It is out of reach without opening the sheet on a phone.

Never ship the bare sign-out link. An account with no page turns language, sessions and closing into support messages.

#### `the-account-in-the-sidebar-foot`: The account in the sidebar foot

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 142 customers, newest first."
  split 1:3
    nav side
      link "Home"
      link current "Orders"
      link "Customers"
      link "Products"
      link "Invoices"
      link "Settings"
      link "Help"
    region "Orders"
      table 2 "Order" "Customer" "State" "Paid"
        item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  footer
    avatar "AM"
    text "Alex Morgan · Operations manager"
```

**Rationale:** The foot names the acting person and role on every page, and opening it switches identity on a development deployment.

**Cost:** The foot of a long sidebar is far from the top of the page. On a phone the whole account hides inside the sheet. The bar says nothing about who is acting.

#### `an-avatar-menu-in-the-header`: An avatar menu in the header

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
    action "Alex Morgan"
  region "Orders"
    table 2 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  popover "Alex Morgan · Operations manager"
    action "Your account"
    action "Your access"
    action "Language: English"
    action "Theme: Light"
    action "Sign out"
```

**Rationale:** Linear and Vercel both put the account in the header: one avatar holds the account page, the preferences and sign-out. The acting person is visible on every page without scrolling to the foot.

**Cost:** The header gains a control on every page, and the menu repeats the sidebar foot it replaces during the transition. The foot still needs a sign-out for readers who look there first.

**Reference:** Linear

#### `the-account-as-a-page-reached-from-the-menu`: The account as a page, reached from the menu

```wireframe
page
  breadcrumb "Home" "Account"
  header
    heading "Your account"
    text "Alex Morgan · Acme Supply."
  region "Details"
    fact "Name" "Alex Morgan"
    fact "Email" "alex@acme-supply.example"
    fact "Company" "Acme Supply"
    fact "Role" "Operations manager"
  region "Manage"
    list 3
      item: text "Email address" · text muted "Where sign-in messages go" · action "Edit"
```

**Rationale:** The navigation already lists account, email, sign-in and close as pages, so the menu only has to open one of them. Each page does one job and says what changes.

**Cost:** Four pages for one account is a tree of its own, and closing an account sits two levels from anywhere. The menu has to name the right page, not the account alone.

#### `the-menu-states-what-the-role-can-do`: The menu states what the role can do

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
    action "Alex Morgan"
  region "Orders"
    table 2 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  popover "Alex Morgan · Operations manager"
    text "You can view and message orders."
    text "You can book dispatches."
    text "Only Finance can issue refunds."
    text "Only Finance can answer disputes."
    action "Sign out"
```

**Rationale:** A refusal at the moment of clicking is the worst place to learn what a role allows. Stating access in the menu teaches it before the click, in the reader's own words.

**Cost:** Access stated in prose drifts from access enforced in code, so the menu has to render from the same permission read the commands check. A second source drifts from the first.

#### `a-persona-switcher-on-development-only`: A persona switcher, on development only

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Nothing here is charged and nothing reaches a bank."
    action "Alex Morgan"
  region "Orders"
    table 2 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  popover "Act as · development only"
    status "Sandbox" info
    action "Sam Rivera · Owner"
    action "Alex Morgan · Operations manager"
    action "Priya Shah · Finance"
    action "Chris Novak · Warehouse lead"
```

**Rationale:** Seeded personas exist so a developer can stand where each role stands. Naming the deployment and the persona in the menu keeps a screenshot honest about whose eyes saw it.

**Cost:** A switcher that ships to production lets anyone act as anyone. It stays behind the development flag with no setting to enable it elsewhere. The menu is the part that reaches production first.

#### `no-menu-a-sign-out-link-in-the-foot`: No menu, a sign-out link in the foot

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    table 2 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  footer
    text "Alex Morgan · Operations manager"
    action quiet "Sign out"
```

**Rationale:** One account, one company, one link. Nothing to open, nothing to prefer, and sign-out is always visible.

**Cost:** An account with no page has nowhere to put language, sessions or closing, so each of those becomes a support message instead. Never ship this where more than one person administers a company.

### Notification inbox

**Question:** Refunds, disputes, invitations and warehouse incidents all need somebody who was looking elsewhere. The console lists them under Needs attention on Home and nowhere else.

**Default:** `a-bell-in-the-header-with-a-dropdown-panel`

**Compact:** On a phone notifications open as a bottom sheet, unread first, where the thumb reaches them. The compact option is `the-unread-first-in-a-phone-sheet`.

**Rationale:** Put a bell with a dropdown panel in the header. The count is visible on every page. The panel answers what changed without leaving the list being worked.

The inbox page is the runner-up for support days with dozens of items, where triage needs filters rather than a dropdown.

Never ship no notifications. Polling seven areas by hand is how a dispute deadline is missed.

#### `needs-attention-on-the-home-page`: Needs attention on the Home page

```wireframe
page
  header
    heading "Good afternoon, Alex"
    text "Three things need you today."
    action primary "New order"
  region "Needs attention"
    status "3 to do" caution
    list 3
      item: text "A dispute was opened on order SO-1041" · text muted "Tom Becker · answers in 5 days" · action "Answer"
```

**Rationale:** One list on the first page after sign-in, ordered by what needs doing now, with each row carrying the step that deals with it.

**Cost:** Home is one page among many, so a reader working a list all day never sees it. Anything urgent waits for a visit that may not come.

#### `a-bell-in-the-header-with-a-dropdown-panel`: A bell in the header with a dropdown panel

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
    action "Notifications · 3 unread"
  region "Orders"
    table 2 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  popover "Notifications"
    list 3
      item: text "A dispute was opened on order SO-1041" · text muted "Tom Becker · 2 hours ago" · status "Disputed" critical
    action quiet "Mark all read"
    action quiet "Open inbox"
```

**Rationale:** GitHub puts the count where the eye already is and the list one click away, without leaving the page being worked. The panel answers what changed. The inbox page behind it answers the rest.

**Cost:** Three unread is a glance. Thirty is a dropdown that needs its own filters. The panel stays a summary and hands over to the inbox page past a handful.

**Reference:** GitHub

#### `an-inbox-page-with-triage`: An inbox page with triage

```wireframe
page
  breadcrumb "Home" "Inbox"
  header
    heading "Inbox"
    text "4 unread across refunds, disputes and the team."
    action "Mark all read"
  tabs "All 12" "Unread 4"
    region "Unread"
      list 4
        item: text "A dispute was opened on order SO-1041" · text muted "Tom Becker · answers in 5 days" · status "Disputed" critical · action "Answer"
```

**Rationale:** Linear treats notifications as a queue with its own page: filter by unread, act, mark read. A support day with dozens of items needs filters rather than a dropdown.

**Cost:** A second queue beside Needs attention splits what needs doing across two pages. One of them has to own the ordering or they disagree.

**Reference:** Linear

#### `email-for-the-urgent-home-for-the-rest`: Email for the urgent, Home for the rest

```wireframe
page
  breadcrumb "Home" "Settings" "Notifications"
  header
    heading "Notifications"
    text "Who the urgent reaches by email."
  region "Email the person who can act"
    list 4
      item: text "Disputes" · text muted "Opened, and 2 days before the answer is due" · text "Priya Shah" · action "Edit"
```

**Rationale:** Shopify emails the person who can act and leaves the rest in the product. A dispute opened at midnight reaches Finance without anyone polling a bell.

**Cost:** Email is a second inbox with its own read state, so the console has to say what was sent and when. A company that filters mail misses the urgent and the routine together.

**Reference:** Shopify

#### `the-unread-first-in-a-phone-sheet`: The unread first, in a phone sheet

```wireframe
page
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    list 1
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive
  drawer bottom "3 unread"
    list 3
      item: text "A dispute was opened on order SO-1041" · text muted "Tom Becker · 2 hours ago" · status "Disputed" critical
    action quiet "Mark all read"
```

**Rationale:** Linear opens notifications as a bottom sheet on a phone, unread first, where the thumb reaches them. A warehouse lead reads three items between dispatches without opening the menu.

**Cost:** The sheet covers the list it came from, so acting on an item means opening it full screen. Triage on a phone is read and dismiss, not decide.

**Reference:** Linear

#### `no-notifications-at-all`: No notifications at all

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 142 customers, newest first."
  toolbar
    field "Order number, name or email" search
    field "State" select = "Any state"
  region "Orders"
    table 2 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** Every area already lists what needs doing, so a reader who walks the areas finds everything. No counts to keep, no panel to build, no email to word.

**Cost:** Walking seven areas by hand is how a dispute deadline is missed. Never ship this: it moves the cost of knowing from one bell to every reader, every day.

### Help and support

**Question:** The navigation names a help topic per page, so help can open the guide for the page on screen. The console links a help page from the sidebar.

**Default:** `contextual-help-beside-the-page-it-explains`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Open the guide for the current page in a side panel. The navigation already carries a help topic per page, so contextual help is a lookup rather than a search. The help page stays as the index behind the panel.

Never ship no help entry: a warehouse lead stuck at the dock with a queue has nowhere else to turn.

#### `a-help-page-from-the-sidebar`: A help page from the sidebar

```wireframe
page
  breadcrumb "Home" "Help"
  header
    heading "Help"
    text "Guides for the stock you hold, and the people who answer the rest."
  toolbar
    field "Search the guides" search
  region "Guides"
    list 4
      item: text "Taking orders" · text muted "Products, variants, prices and the catalog" · action "Open"
  region "Talk to support"
    list 1
      item: text "Contact support" · text muted "The support team answers on business days" · action "Write"
```

**Rationale:** One index of guides with search, reached from the sidebar on every page, plus a support row for what no guide answers.

**Cost:** An index answers the reader who knows what to ask. A reader stuck on a record has to translate the record into a search query first.

#### `a-help-menu-in-the-sidebar-foot`: A help menu in the sidebar foot

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    table 2 "Order" "Customer" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
  popover "Help"
    action "Search the guides"
    action "Keyboard shortcuts"
    action "Contact support"
```

**Rationale:** The foot holds search, shortcuts and contact in one menu, so help is one click without leaving the page. The menu is cheaper than a page and closer than the header.

**Cost:** A menu that opens upward from the foot fights the sheet on a phone, where the foot is already inside an overlay. Three entries is also all a menu holds before it wants to be a page.

#### `contextual-help-beside-the-page-it-explains`: Contextual help beside the page it explains

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · Garcia Interiors · EUR 125.00."
    action primary "Refund order"
  split 2:1
    region "The order at a glance"
      fact "Paid by the customer" "EUR 125.00"
      fact "Paid" "8 Oct 2026, 09:34"
    aside
      card "Refunding this order"
        text "Check the payment date: this method refunds only within 180 days."
        text "Past the window, offer credit or record an out-of-band payment."
        action "Open the full guide"
```

**Rationale:** Stripe opens the guide for the current page in a side panel, so the reader never leaves the record. The navigation already carries a topic per page, so this is a lookup rather than a search.

**Cost:** A panel beside the content halves the content width, and on a phone it stacks below the fold it explains. Every page also needs its topic written before the panel has anything to show.

**Reference:** Stripe

#### `help-search-inside-the-command-palette`: Help search inside the command palette

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  dialog "Jump to"
    field "Search pages, orders, products" search = "refund"
    region "Go to"
      list 2
        item: text "Refunds" · text muted "Pages"
    region "Guides"
      list 3
        item: text "Refunding an order" · text muted "Guide · Refunds and returns"
```

**Rationale:** Linear answers help queries where navigation queries already go: one input searches pages, records and guides together. A reader who learned Cmd-K needs no second shortcut.

**Cost:** Guides compete with pages and records for the same short list, so a guide the reader wants can sit below records they do not. Help also inherits the palette discoverability problem.

**Reference:** Linear

#### `contact-support-as-a-dialog`: Contact support as a dialog

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  dialog "Contact support"
    field "Subject" select = "Refunds"
    field "Order number" text = "SO-1041"
    field "What happened" textarea
    text "The support team answers on business days."
    action primary "Send message"
```

**Rationale:** A form that asks for the order number up front saves one round trip on every support thread. The subject routes the message before a person reads it.

**Cost:** A dialog with four fields is a small page inside a modal frame, and on a phone it wants to be a sheet. It also promises an answer without saying when, so the response line has to be honest.

#### `no-help-entry-at-all`: No help entry at all

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  split 1:3
    nav side
      link "Home"
      link current "Orders"
      link "Customers"
      link "Products"
      link "Invoices"
      link "Settings"
    region "Orders"
      table 2 "Order" "Customer" "State" "Paid"
        item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** Every page is plain enough to need no guide, and support answers the rest by email. Nothing to write, nothing to translate, nothing to keep.

**Cost:** A warehouse lead stuck at the dock with a queue has nowhere to turn inside the product. Never ship this: the guides are also where the refund policy the company answers for is recorded.

### Workspace switcher

**Question:** People who run several sites think in sites: one warehouse at a time, switched between often. The console carries a warehouse's sections as tabs on the warehouse page.

**Default:** `a-workspace-switcher-at-the-top-of-the-sidebar`

**Compact:** On a phone the workspaces list as a bottom sheet with the state beside each name. The compact option is `a-workspace-picker-sheet-on-a-phone`.

**Rationale:** Put a workspace switcher at the top of the sidebar. Switching from the Amsterdam warehouse to Rotterdam without visiting the list matches how Vercel switches projects.

The trail sibling menu is the runner-up on record pages four levels deep, where the sidebar context is far away.

Never ship back-to-list as the only path. It costs the most to exactly the companies with the most sites.

#### `warehouse-sections-as-tabs-on-the-warehouse-page`: Warehouse sections as tabs on the warehouse page

```wireframe
page
  breadcrumb "Home" "Settings" "Warehouses" "Amsterdam warehouse"
  header
    heading "Amsterdam warehouse"
    status "Active" positive
    text "Canal Street 12 · 4 bays."
    action primary "Add stock"
  tabs "Details" "Stock" "Inbound" "Dispatch" "Money" "Operations" "Orders" "Notes"
    region "Stock"
      table 2 "Item" "On hand" "Price" "State"
        item: text "Oak desk lamp" · text "412 of 500" · text "EUR 45.00" · status "Active" positive
```

**Rationale:** Eight sections of one warehouse as a tab row under the heading, with the active section in the URL so a pasted link carries it.

**Cost:** Eight tabs overflow a phone and crowd a laptop, and the row says nothing about the other sites. Sections are covered. Switching is not.

#### `a-workspace-switcher-at-the-top-of-the-sidebar`: A workspace switcher at the top of the sidebar

```wireframe
page
  breadcrumb "Home" "Settings" "Warehouses" "Amsterdam warehouse"
  header
    heading "Amsterdam warehouse"
    status "Active" positive
    text "Canal Street 12 · 4 bays."
    action "Switch warehouse"
    action primary "Add stock"
  region "Stock"
    fact "Site" "Amsterdam warehouse"
    fact "On hand" "412 of 500 on hand"
  popover "Switch warehouse"
    field "Search warehouses" search
    list 3
      item: text "Amsterdam warehouse" · text muted "Canal Street 12 · 4 bays" · status "Active" positive
```

**Rationale:** Vercel switches projects from the top of the sidebar, above the navigation the switch changes. One control moves the whole console from the Amsterdam warehouse to Rotterdam.

**Cost:** The switcher changes what every entry below it means. It names the site prominently enough that no one reads the wrong warehouse with confidence.

**Reference:** Vercel

#### `recent-workspaces-first-in-the-palette`: Recent workspaces first in the palette

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  dialog "Jump to"
    field "Search pages, orders, products" search
    region "Recent warehouses"
      list 2
        item: text "Amsterdam warehouse" · text muted "Canal Street 12 · 4 bays" · status "Active" positive
    region "Go to"
      list 2
        item: text "Orders" · text muted "Pages"
    text muted "Open with Enter."
```

**Rationale:** Linear lists recent records before anything is typed, so returning to the site left open is one keypress. Recency matches how warehouse and support work moves between a few sites.

**Cost:** Recency is personal state on a shared machine, so the next person at the keyboard sees what the last person opened. A renamed site also needs a rule for what its row says.

**Reference:** Linear

#### `the-workspace-level-of-the-trail-as-a-sibling-menu`: The workspace level of the trail as a sibling menu

```wireframe
page
  breadcrumb "Home" "Settings" "Amsterdam warehouse" "Stock"
  header
    heading "Stock"
    text "3 product lines · 812 units on hand."
    action primary "Add stock"
  region "Stock"
    table 2 "Item" "On hand" "Price"
      item: text "Oak desk lamp" · text "412 of 500" · text "EUR 45.00"
  popover "Amsterdam warehouse"
    action "Amsterdam warehouse"
    action "Rotterdam warehouse"
    action "Utrecht warehouse"
```

**Rationale:** Notion turns each trail level into a menu of its siblings, so the warehouse level lists the other sites. Switching sits exactly where the current site is named.

**Cost:** A trail level that opens a menu is a trail that does not behave like one. Dozens of siblings need a search the trail has no room for. It fits companies with a handful of sites.

**Reference:** Notion

#### `a-workspace-picker-sheet-on-a-phone`: A workspace picker sheet on a phone

```wireframe
page
  header
    heading "Amsterdam warehouse"
    status "Active" positive
    text "Canal Street 12 · 4 bays."
  drawer bottom "Switch warehouse"
    list 3
      item: text "Amsterdam warehouse" · text muted "Canal Street 12 · 4 bays" · status "Active" positive
```

**Rationale:** A bottom sheet lists the sites where the thumb reaches them, with the state beside each name. Switching on a phone costs no more than switching on desktop.

**Cost:** Dozens of sites in a sheet need a search row the sheet barely fits, and the sheet covers the site it came from. Recent sites first would shorten most visits.

#### `no-switcher-back-to-the-warehouse-list`: No switcher, back to the warehouse list

```wireframe
page
  breadcrumb "Home" "Settings" "Warehouses" "Amsterdam warehouse"
  header
    action quiet "All warehouses"
    heading "Amsterdam warehouse"
    status "Active" positive
    text "Canal Street 12 · 4 bays."
  region "Details"
    fact "Site" "Amsterdam warehouse"
    fact "Bays" "4"
    fact "Capacity" "40 pallets"
```

**Rationale:** The warehouse list already searches and filters every site, so a second switcher repeats it badly. Back to the list is one click that always works.

**Cost:** One click each way on every switch, paid dozens of times a day by anyone running two sites. Never ship this as the only path: it costs the most to exactly the companies with the most sites.

### Phone navigation

**Question:** Below 768 px the sidebar hides and a menu glyph shows in the bar. The question is what the glyph opens, and whether a phone wants a bottom bar instead.

**Default:** `the-sidebar-as-an-off-canvas-sheet`

**Compact:** Below the md breakpoint the sidebar becomes an off-canvas sheet opened from the menu glyph in the bar. The compact option is `the-sidebar-as-an-off-canvas-sheet`.

**Rationale:** Ship the off-canvas sheet. Answer the bottom-navigation question with no. This is a console opened on a phone a few times a day, not a daily-use app. A bottom bar uses four slots for areas the reader rarely needs away from the desk.

The sheet with recent pages above the areas is the runner-up once recents exist, since resuming work beats re-walking the tree.

Never ship the desktop table unchanged on a phone: a warehouse lead pinching across 268 orders is a refusal to design.

#### `the-sidebar-as-an-off-canvas-sheet`: The sidebar as an off-canvas sheet

```wireframe
page
  header
    action quiet "Open menu"
    heading "Home"
    text "Two things need you today."
  region "Needs attention"
    status "2 to do" caution
    list 1
      item: text "Close out the March stock count" · text muted "Nothing left to settle." · action "Close out"
  drawer left "Acme Supply"
    link current "Home"
    link "Orders"
    link "Customers"
    link "Products"
    link "Invoices"
    link "Reports"
    link "Settings"
    link "Help"
    text "Alex Morgan · Operations manager"
```

**Rationale:** The behavior below the md breakpoint: the same entries slide in over a scrim and dismiss with a close control. Nothing about the tree changes between desktop and phone.

**Cost:** The sheet covers the page it came from, and a warehouse lead looking up one order costs one extra tap. Forty lookups a day makes the tap worth designing away.

**Reference:** shadcn

#### `a-bottom-tab-bar-with-four-destinations-and-more`: A bottom tab bar with four destinations and More

```wireframe
page
  header
    heading "Orders"
    text "268 orders."
  toolbar
    field "Order number, name or email" search
  region "Orders"
    list 2
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive
  footer
    action "Home"
    action "Orders"
    action "Customers"
    action "Invoices"
    action "More"
```

**Rationale:** GitHub mobile keeps five destinations under the thumb: four areas and a More that holds the rest. The reader moves between areas without opening anything.

**Cost:** Five slots cannot hold seven areas, so More carries three of them behind a second tap. The bar also fits moving between areas, where the warehouse reader needs one order instead.

**Reference:** GitHub

#### `a-bottom-bar-for-the-areas-a-sheet-for-the-rest`: A bottom bar for the areas, a sheet for the rest

```wireframe
page
  header
    heading "Orders"
    text "268 orders."
  region "Orders"
    list 1
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive
  footer
    action "Home"
    action "Orders"
    action "Customers"
    action "Invoices"
    action "More"
  drawer bottom "More"
    list 3
      item: text "Products" · text muted "93 products"
```

**Rationale:** The bar holds the four areas a phone reader visits. The More tab opens the other three as a sheet. Each pattern does the part it fits: visible destinations below, the full tree on demand.

**Cost:** Two navigation patterns on one screen where desktop has one, and Invoices hides behind More on the surface where a refund question arrives. The split has to be watched, not set once.

#### `the-sheet-with-recent-pages-above-the-areas`: The sheet with recent pages above the areas

```wireframe
page
  header
    action quiet "Open menu"
    heading "Orders"
    text "268 orders."
  region "Orders"
    list 1
      item: text "SO-1042" · text "Maria Garcia" · status "Paid" positive
  drawer left "Acme Supply"
    text "Recent"
    link "SO-1042 · Maria Garcia"
    link "Garcia Interiors restock"
    link "September statement"
    text "Areas"
    link "Home"
    link current "Orders"
    link "Customers"
    link "Products"
    link "Invoices"
    link "Reports"
    link "Settings"
```

**Rationale:** Resuming work beats re-walking the tree: three recent pages above the seven areas put the order left open one tap away. The sheet stays one list with two halves.

**Cost:** Recents are personal state on a shared device, and a recent that was renamed needs a rule for what its row says. The areas below also start below the fold on a short phone.

#### `a-segmented-control-for-sibling-pages`: A segmented control for sibling pages

```wireframe
page
  header
    action quiet "Open menu"
    heading "Amsterdam warehouse"
    status "Active" positive
    text "Canal Street 12 · 4 bays."
  tabs "Details" "Stock" "Dispatch"
    region "Stock"
      list 2
        item: text "Oak desk lamp" · text muted "412 of 500 on hand" · text "EUR 45.00" · action "Open"
```

**Rationale:** iOS settings switch sibling facets with a segmented control, which fits a phone row where eight tabs cannot. Three facets stay visible without scrolling or menus.

**Cost:** Three segments is the ceiling and the control cannot carry counts, so it fits facets, not areas. Eight warehouse sections still need the tabs or the More menu behind this.

**Reference:** iOS

#### `no-phone-layout-the-desktop-table-unchanged`: No phone layout, the desktop table unchanged

```wireframe
page
  header
    action quiet "Open menu"
    heading "Orders"
    text "268 orders from 142 customers."
  region "Orders"
    table 4 "Order" "Customer" "Placed" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "8 Oct 2026, 09:32" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** The desktop table renders as drawn and scrolls sideways in its box. Nothing to design, nothing to maintain, and every column survives.

**Cost:** A warehouse lead pinches across 268 orders to find one. Never ship this: sideways scrolling on a phone is a refusal to design.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/patterns/navigation#mark-the-current-section | guidance | Does every built screen of this kind keep this rule, including in its compact layout? |
| litespec/frontend/patterns/navigation#give-every-page-its-own-address | guidance | Does every built screen of this kind keep this rule, including in its compact layout? |
| litespec/frontend/patterns/navigation#sidebar | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/navigation#breadcrumb | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/navigation#header-bar | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/navigation#tabs-within-a-page | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/navigation#icons-in-the-frame | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/navigation#language-and-theme | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/navigation#command-palette | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/navigation#account-menu | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/navigation#notification-inbox | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/navigation#help-and-support | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/navigation#workspace-switcher | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/navigation#phone-navigation | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
