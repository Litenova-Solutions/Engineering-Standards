# Money, Time and Density Patterns

## Intent

These patterns answer how a back office writes amounts, statements, moments, and periods. They also answer how many rows fit before a page breaks and how figures and charts read. Each pattern offers drawn options and names a default.

## Standards

### Show the currency of every amount

**Requirement:** Every amount MUST show its currency.

**Rationale:** An amount without its currency is ambiguous as soon as a second currency exists. The reader then reads the figure without checking a setting.

### State the time zone of a shared moment

**Requirement:** A moment shown to readers in different time zones MUST state its time zone.

**Rationale:** Readers in two time zones read a delivery window without a zone as two different windows. The zone makes the moment one fact for every reader.

## Patterns

### Writing an amount

**Question:** Amounts meet a reader in tables, statements, and exports. One table writes EUR 45.00, and one statement writes the euro sign before 45.00. The question is which form the product keeps. It also asks how a negative reads and which separator the product uses.

**Default:** `code-and-two-decimals-in-the-reader-s-language-with-a-true-m`

**Compact:** The recommended option reflows. One column carries the content. Header actions sit under the title. A table scrolls inside its own region.

**Rationale:** Ship the code format in the reader's language with a true minus. It keeps one convention and answers negatives and separators. The runner-up is the plain code table. It shows the same choice without refund rows.

Choose the symbol with code in the header only when back office and customer surface show the same form. Never ship the no currency option. It loses the currency in exports. Never ship mixed decimals. It breaks the alignment tables exist for.

#### `currency-code-and-two-decimals-everywhere`: Currency code and two decimals, everywhere

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 96 customers."
    action "Download"
  field "Order number, name or email" search
  region "Orders"
    table 4 "Order" "Customer" "Placed" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "8 Oct 2026, 09:32" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** A code is unambiguous and independent of reader locale. It reads the same in English and Dutch.

**Cost:** A code is wider than a symbol. A narrow money column holds fewer rows. A Dutch reader pays a translation cost on every glance.

#### `symbol-and-two-decimals-with-the-currency-in-the-header`: Symbol and two decimals, with the currency in the header

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 96 customers."
    action "Download"
  field "Order number, name or email" search
  region "Orders"
    table 4 "Order" "Customer" "Placed" "State" "Paid (EUR)"
      item: text "SO-1042" · text "Maria Garcia" · text "8 Oct 2026, 09:32" · status "Paid" positive · text "€125.00"
```

**Rationale:** Many European products use this shape. The header says Paid in EUR. The symbol never stands alone. Assistive tech and WCAG 1.4.1 need the code beside it.

**Cost:** The symbol assumes one locale. The euro sign fits Acme Supply. It fails for an account in another currency. A screen reader has no clear way to read it aloud.

**Reference:** WCAG 1.4.1

#### `code-and-decimals-only-where-there-are-cents`: Code and decimals only where there are cents

```wireframe
page
  breadcrumb "Home" "Reports" "Statements" "September 2026"
  header
    heading "September 2026"
    text "Every euro of the month under the kind it is."
    action "Download"
  region "Income"
    fact "Lamp sales" "EUR 54,180"
    fact "Service fees customers paid" "EUR 6,020"
    fact "Design guides" "EUR 3,150"
    fact "Total income" "EUR 63,350"
  region "Costs"
    fact "Payment fee" "−EUR 332.92"
    fact "Platform fee" "−EUR 120.40"
    fact "Net for Acme Supply" "EUR 62,896.68"
```

**Rationale:** Whole euros write as EUR 45. Amounts with cents write as EUR 45.45. A column of whole amounts reads as integers. That shape helps a reader find one amount.

**Cost:** The decimal point moves between rows. It breaks the alignment tabular figures exist for. Mixed rows are harder to scan.

#### `code-in-the-label-and-a-symbol-in-the-cell`: Code in the label and a symbol in the cell

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 96 customers."
    action "Download"
  field "Order number, name or email" search
  region "Orders"
    table 4 "Order" "Customer" "Placed" "State" "Paid, in euros"
      item: text "SO-1042" · text "Maria Garcia" · text "8 Oct 2026, 09:32" · status "Paid" positive · text "€125.00"
```

**Rationale:** The label names the currency in words. The cell carries the euro sign. A screen reader hears Paid in euros. A sighted reader sees the sign.

**Cost:** Two carriers for one fact. The label grows, and the column header stops being a field name.

#### `the-customer-s-currency-beside-the-company-s`: The customer's currency beside the company's

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders. 41 were bought in another currency."
    action "Download"
  field "Order number, name or email" search
  region "Orders"
    table 4 "Order" "Customer" "Placed" "Customer paid" "You receive"
      item: text "SO-1027" · text "Elin Lindqvist" · text "8 Oct 2026, 09:31" · text "GBP 42.00" · text "EUR 48.30"
```

**Rationale:** Where a company sells abroad the cell carries both figures. It shows what the customer paid. It shows what the company receives. One row holds both with no second table.

**Cost:** Two figures make the widest money cell. The reader works out which one answers the question that day.

#### `no-currency-at-all-because-the-account-has-one`: No currency at all, because the account has one

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders. Every amount is in euros."
    action "Download"
  field "Order number, name or email" search
  region "Orders"
    table 4 "Order" "Customer" "Placed" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "8 Oct 2026, 09:32" · status "Paid" positive · text "125.00"
```

**Rationale:** A product with one currency writes no currency. It writes 125.00 right aligned. The account page states the currency once. The interface trusts that statement.

**Cost:** An export or pasted figure loses its currency. Support conversations happen around such figures. The form fails when the company adds a second currency.

#### `code-and-decimals-with-the-column-totals-at-the-foot`: Code and decimals, with the column totals at the foot

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 96 customers."
    action "Download"
  field "Order number, name or email" search
  region "Orders"
    table 4 "Order" "Customer" "Placed" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "8 Oct 2026, 09:32" · status "Paid" positive · text "EUR 125.00"
  region "Totals"
    fact "Total on this page" "EUR 3,112.50"
    fact "Total of every match" "EUR 33,480.00"
```

**Rationale:** This option keeps the code convention. It adds a page total and an all-match total. Both totals follow the filters. The reader checks the column without exporting it.

**Cost:** Two totals disagree by design. Labels need to survive a glance. The all-match total adds a second read on every filter change.

#### `code-and-two-decimals-in-the-reader-s-language-with-a-true-m`: Code and two decimals, in the reader's language, with a true minus

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 96 customers."
    action "Download"
  field "Language" select = "English"
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Amount"
      item: text "SO-1030" · text "Tom Becker" · text "8 Oct 2026, 09:12" · status "Refunded" neutral · text "−EUR 50.00"
  region "Note"
    text muted "A Dutch page writes EUR 125,00. A refund uses a true minus."
```

**Rationale:** Stripe dashboard and Shopify admin keep one amount format. The reader's language decides the separators. English shows EUR 1,203.65, and Dutch shows EUR 1.203,65. A refund uses a true minus before the code. The minus lines up with digits in a tabular column.

**Cost:** Two colleagues on the same account see different separators, so a screenshot in a support case has to be read in its language. The minus is the only signal of money out, so the State column has to say Refunded as well.

**Reference:** Stripe dashboard, Shopify admin

#### `money-out-in-red-with-a-true-minus`: Money out in red with a true minus

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 96 customers."
    action "Download"
  field "Order number, name or email" search
  region "Orders"
    table 4 "Order" "Customer" "Placed" "State" "Amount"
      item: text "SO-1030" · text "Tom Becker" · text "8 Oct 2026, 09:12" · status "Refunded" neutral · status "−EUR 50.00" critical
```

**Rationale:** Stripe dashboard writes a refund in red with its minus. Money out reads at a glance. The minus keeps the meaning for a reader who misses color.

**Cost:** Red is also the error tone. A statement of refunds reads as a page of problems. The State column still says Refunded. Color alone never carries the meaning.

**Reference:** Stripe dashboard

#### `money-out-in-parentheses-the-accounting-way`: Money out in parentheses, the accounting way

```wireframe
page
  breadcrumb "Home" "Reports" "Statements" "September 2026"
  header
    heading "September 2026"
    text "Every euro of the month under the kind it is."
    action "Download"
  region "Income"
    fact "Lamp sales" "EUR 54,180.00"
    fact "Service fees customers paid" "EUR 6,020.00"
    fact "Design guides" "EUR 3,150.00"
  region "Refunds and fees"
    fact "Refunds" "EUR (1,550.00)"
    fact "Payment fee" "EUR (332.92)"
    fact "Net for Acme Supply" "EUR 61,346.68"
```

**Rationale:** Xero and QuickBooks write a negative in parentheses. Printed annual accounts do the same. A bookkeeper reads it without translation. Parentheses are harder to miss than a minus at small size.

**Cost:** A reader outside accounting can read (120.40) as a note. It differs from the payment provider form. The two screens for reconciliation disagree.

**Reference:** Xero, QuickBooks

### Statement that adds up

**Question:** A statement has one purpose. Money adds up top to bottom. Each kind forms a group with a subtotal. A grand total closes the foot. A count under each line helps a reader spot a missing line.

**Default:** `groups-subtotals-and-a-grand-total`

**Compact:** The recommended option reflows. One column carries the content. Header actions sit under the title. A table scrolls inside its own region.

**Rationale:** Keep groups, subtotals, and a grand total. Keep a count under each line. The count is the only completeness check. The runner-up ends in the payouts it became. It fits finance work against bank lines.

Add links on every line later as a behavior of the pick. Never ship the one figure option as the statement. It hides how the figure was reached.

#### `groups-subtotals-and-a-grand-total`: Groups, subtotals and a grand total

```wireframe
page
  breadcrumb "Home" "Reports" "Statements" "September 2026"
  header
    heading "September 2026"
    text "Every euro of the month under the kind it is."
    action "Download"
  region "Income"
    fact "Lamp sales, 1,204 units" "EUR 54,180.00"
    fact "Service fees, 1,204 units" "EUR 6,020.00"
    fact "Design guides, 126 guides" "EUR 3,150.00"
    fact "Total income" "EUR 63,350.00"
  region "Refunds and fees"
    fact "Refunds, 31 units" "−EUR 1,550.00"
    fact "Payment fee" "−EUR 332.92"
    fact "Net for Acme Supply" "EUR 61,346.68"
```

**Rationale:** Each group holds its lines and a subtotal. A rule separates the grand total. The count under each line shows a missing line.

**Cost:** The count repeats 1,204 twice. A reader opens the orders list to find which orders a line holds.

#### `a-statement-where-every-line-links-to-its-records`: A statement where every line links to its records

```wireframe
page
  breadcrumb "Home" "Reports" "Statements" "September 2026"
  header
    heading "September 2026"
    text "Every figure opens the records behind it."
    action "Download"
  region "Income"
    fact "Lamp sales, 1,204 units" "EUR 54,180.00"
    link "Open lamp sales EUR 54,180.00"
    fact "Service fees, 1,204 units" "EUR 6,020.00"
    link "Open service fees EUR 6,020.00"
    fact "Total income" "EUR 63,350.00"
  region "Refunds and fees"
    fact "Refunds, 31 units" "−EUR 1,550.00"
    link "Open refunds"
```

**Rationale:** Every figure links to the records behind it. Stripe balance summary works this way. A statement without audit links asks for trust.

**Cost:** A column of links adds noise to numbers. Each link needs a real filtered list. A built address may miss the figure.

**Reference:** Stripe

#### `the-paid-out-month-beside-the-month-still-running`: The paid-out month beside the month still running

```wireframe
page
  breadcrumb "Home" "Reports" "Statements" "September 2026"
  header
    heading "September 2026"
    text "Closed on 30 September. The provider paid out by 5 October."
    action "Download"
  region "September, closed"
    fact "Income, 1,204 units" "EUR 63,350.00"
    fact "Refunds and fees" "−EUR 2,003.32"
    fact "Paid out by the provider" "EUR 61,346.68"
    text "This figure will not change."
  region "October so far"
    fact "Income, 418 units" "EUR 20,900.00"
    fact "Refunds and fees" "−EUR 697.22"
    fact "Net so far" "EUR 20,202.78"
    text "This one moves with every order."
```

**Rationale:** A paid-out month states the past. The running month states the present. The closed month sits beside the running figure. Each reads as a different moment.

**Cost:** Two figures share one page and only one is final. A reader can take the wrong one. Every figure needs its date.

#### `a-statement-with-no-count-on-any-line`: A statement with no count on any line

```wireframe
page
  breadcrumb "Home" "Reports" "Statements" "September 2026"
  header
    heading "September 2026"
    text "Every euro of the month under the kind it is."
    action "Download"
  region "Income"
    fact "Lamp sales" "EUR 54,180.00"
    fact "Service fees customers paid" "EUR 6,020.00"
    fact "Design guides" "EUR 3,150.00"
    fact "Total income" "EUR 63,350.00"
  region "Refunds and fees"
    fact "Refunds" "−EUR 1,550.00"
    fact "Payment fee" "−EUR 332.92"
    fact "Net for Acme Supply" "EUR 61,346.68"
```

**Rationale:** This option drops the count under each line. Shopify finance summary reads this way. Each line is one row and the page is shorter.

**Cost:** A reader cannot check a missing payment. The count is the only completeness check.

**Reference:** Shopify

#### `a-statement-with-each-fee-marked-by-who-set-it`: A statement with each fee marked by who set it

```wireframe
page
  breadcrumb "Home" "Reports" "Statements" "September 2026"
  header
    heading "September 2026"
    text "Every euro of the month under the kind it is."
    action "Download"
  region "Income after refunds"
    fact "Lamp and guide sales" "EUR 57,330.00"
    fact "Service fees customers paid" "EUR 6,020.00"
    fact "Refunds, 31 units" "−EUR 1,550.00"
  region "Fees taken at each payment"
    fact "Payment fee" "−EUR 332.92"
    status "Provider price" neutral
    fact "Platform fee" "−EUR 120.40"
    status "Vendor price" info
    fact "Total fees" "−EUR 453.32"
```

**Rationale:** Two fee lines name who set them. One is the provider price and one is the vendor price. The month separates what it made from what each service took.

**Cost:** Two marked lines form a rule to learn. The second section repeats the plan. The billing page already states the plan.

#### `the-whole-figure-first-the-lines-under-it`: The whole figure first, the lines under it

```wireframe
page
  breadcrumb "Home" "Reports" "Statements" "October 2026"
  header
    heading "October so far"
    text "As at 8 Oct 2026, 14:22. September is closed and paid out."
  region "Net for Acme Supply"
    figure "EUR 20,152.78"
    fact "Lamp sales, 418 units" "EUR 18,810.00"
    fact "Service fees kept" "EUR 2,090.00"
    fact "Refunds, 12 units" "−EUR 540.00"
    fact "Held for dispute SO-1031" "−EUR 50.00"
    message "The provider holds EUR 50.00 while the bank decides SO-1031." caution
```

**Rationale:** One number opens the page. Stripe balance page opens this way. The lines below prove the figure. A business answers with one figure and checks with the rest.

**Cost:** The headline invites reading alone. A reader can miss the held dispute. The held amount stays hidden below.

**Reference:** Stripe

#### `a-statement-that-ends-in-the-payouts-it-became`: A statement that ends in the payouts it became

```wireframe
page
  breadcrumb "Home" "Reports" "Statements" "September 2026"
  header
    heading "September 2026"
    text "What the month made, and the payouts sent for it."
    action "Download"
  region "Net for the month"
    fact "Income" "EUR 63,350.00"
    fact "Refunds" "−EUR 1,550.00"
    fact "Fees taken at each payment" "−EUR 453.32"
    fact "Net for the month" "EUR 61,346.68"
  region "Paid out to NL91 ABNA 0417 1643"
    fact "Mon 7 Sep 2026" "EUR 11,420.36"
    fact "Mon 14 Sep 2026" "EUR 16,284.10"
    fact "Total paid out" "EUR 61,346.68"
    status "Reconciled" positive
    fact "Difference" "EUR 0.00"
```

**Rationale:** The net closes into payouts sent to the bank. Finance ticks each payout against a bank line. The difference reads zero for a closed month.

**Cost:** A payout can span two months. The difference is zero only for a closed month. The page explains that edge in one line.

**Reference:** Stripe

#### `a-statement-with-last-month-beside-this-one`: A statement with last month beside this one

```wireframe
page
  breadcrumb "Home" "Reports" "Statements" "September 2026"
  header
    heading "September 2026"
    text "Beside August 2026, with the change in money."
    action "Download"
  region "Comparison"
    table 6 "Line" "August 2026" "September 2026" "Change"
      item: text "Lamp sales" · text "EUR 41,220.00" · text "EUR 54,180.00" · text "+EUR 12,960.00"
    text muted "August held 918 orders. September held 1,148 orders."
```

**Rationale:** This month sits beside last month with a change column. Xero comparative profit and loss works this way. Finance reads the trend without opening two pages. The change uses money, not percent.

**Cost:** Four money columns need a wide page. The table scrolls sideways on a phone with line names pinned. A new company sees zeros that need explanation.

**Reference:** Xero

#### `one-column-per-product-line`: One column per product line

```wireframe
page
  breadcrumb "Home" "Reports" "Statements" "September 2026"
  header
    heading "September 2026, by product line"
    text "The same statement, one column per product line."
    action "Download"
  region "Lines"
    table 4 "Line" "Oak desk lamp" "Brass desk lamp" "Design guides" "Total"
      item: text "Lamp sales" · text "EUR 44,955.00" · text "EUR 9,225.00" · text "EUR 0.00" · text "EUR 54,180.00"
```

**Rationale:** The same lines gain one column per product line. A total column closes the row. A weak line reads beside the line that carried the month.

**Cost:** Three money columns miss a phone width. The table scrolls sideways with line names pinned. Delivery fees split across lines in a way readers do not expect.

### Writing a moment

**Question:** Every date uses the zone the screen works in. Each table keeps one form. An orders table writes 8 Oct 2026, 09:32. A messages table mixes Sent 6 hours ago with For 2 Jan 2030, 10:00 in one column. That mix breaks the contract.

**Default:** `one-form-per-table-with-the-zone-stated-once`

**Compact:** The recommended option reflows. One column carries the content. Header actions sit under the title. A table scrolls inside its own region.

**Rationale:** Keep one form per table. State the zone once in the header. A column then reads as a column.

The runner-up puts absolute over relative. It fits incident and delivery surfaces where recency leads. Never ship relative only on a reconciled page. Nothing there can be cited.

#### `one-form-per-table-with-the-zone-stated-once`: One form per table, with the zone stated once

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 96 customers."
    action "Download"
  field "Order number, name or email" search
  region "Orders"
    table 4 "Order" "Customer" "Placed Europe/Amsterdam" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "8 Oct 2026, 09:32" · text "EUR 125.00"
```

**Rationale:** Every row keeps the same shape. The header names the zone once. A column reads as a column.

**Cost:** Minutes add noise a week later. A reader cannot tell which zone a message used.

#### `absolute-with-a-relative-under-it`: Absolute with a relative under it

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 96 customers."
    action "Download"
  field "Order number, name or email" search
  region "Orders"
    table 4 "Order" "Customer" "Placed Europe/Amsterdam" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "8 Oct 2026, 09:32, 12 seconds ago" · text "EUR 125.00"
```

**Rationale:** The moment and its age share one column. An incident hunt needs the relative. A statement check needs the absolute. Both are present.

**Cost:** Two lines make every row taller. A relative time goes stale without refresh.

#### `relative-only-for-a-list-of-things-that-just-happened`: Relative only, for a list of things that just happened

```wireframe
page
  breadcrumb "Home" "Customers" "Messages"
  header
    heading "Messages"
    text "Only people who said yes to the kind."
    action "Write a message"
  field "Search messages" search
  region "Messages"
    table 4 "Message" "Kind" "State" "Sent"
      item: text "Autumn catalog reminder" · text "Newsletter" · status "Scheduled" info · text "10 hours ago"
```

**Rationale:** Every row is recent. The relative time is the whole answer. A dispatch log read on the day needs minutes ago and nothing else.

**Cost:** Nothing here can be cited. A reader cannot say at 22:41. An audit question from March has no answer on the page.

#### `a-date-with-no-year-when-the-year-is-obvious`: A date with no year when the year is obvious

```wireframe
page
  breadcrumb "Home" "Orders" "Deliveries"
  header
    heading "Deliveries"
    text "This week soonest first. All times are Europe/Amsterdam."
  region "Runs"
    list 4
      item: text "Garcia Interiors restock" · text "Fri, 9 Oct 2026, 08:00 to 12:00" · text "Amsterdam warehouse" · status "Scheduled" info
    text "12 of 40 pallets."
```

**Rationale:** The deliveries list writes weekday, date, and place. It keeps the year. A delivery list crosses years. A reader in November plans for March.

**Cost:** The year adds noise for lists within one year. It widens a column in a table of six.

#### `grouped-by-day-so-the-column-is-the-day`: Grouped by day, so the column is the day

```wireframe
page
  breadcrumb "Home" "Orders" "Timeline"
  header
    heading "Everything that happened"
    text "Newest first. All times Europe/Amsterdam."
  region "Today, 8 October 2026"
    list 4
      item: text "SO-1042" · text "Maria Garcia placed an order" · text "09:32" · text "EUR 125.00"
  region "Yesterday, 7 October 2026"
    list 2
      item: text "SO-1031" · text "Ade Okafor placed an order" · text "19:02" · text "EUR 45.00"
```

**Rationale:** A list of events takes the day as its shape. The date becomes a heading, not a column. The row keeps what matters.

**Cost:** It is no longer sortable as a column. It is no longer a table. Sorting moves to the toolbar. A group heading adds another row to read.

#### `the-relative-first-the-absolute-behind-it`: The relative first, the absolute behind it

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 96 customers."
    action "Download"
  field "Order number, name or email" search
  region "Orders"
    table 4 "Order" "Customer" "Placed" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "12 seconds ago" · text "EUR 125.00"
  region "Note"
    text muted "Sorted by the exact moment newest first. Every time is Europe/Amsterdam."
```

**Rationale:** GitHub writes days ago in the list. The exact moment waits one hover away. Recent work scans by recency. The absolute stays on the record and in the export.

**Cost:** A relative goes stale without refresh. Hover misses on a phone. The column sorts by a hidden value. A note under the table explains the sort.

**Reference:** GitHub

#### `the-weekday-with-the-date-inside-seven-days`: The weekday with the date inside seven days

```wireframe
page
  breadcrumb "Home" "Orders" "Deliveries"
  header
    heading "Deliveries"
    text "The next runs, soonest first."
  region "Runs"
    list 4
      item: text "Garcia Interiors restock" · text "Tomorrow, Fri 9 Oct, 08:00 to 12:00" · text "Amsterdam warehouse" · status "Scheduled" info
    text muted "Runs within seven days name the weekday. Later runs carry the year."
```

**Rationale:** Google Calendar and Linear name the weekday near term. They write full date with year beyond that. The near future plans by weekday. The cutoff appears once under the list.

**Cost:** Two forms break the one form rule by design. The cutoff needs learning. A reader with a March message still gets the full date.

**Reference:** Google Calendar, Linear

#### `a-time-with-the-zone-on-every-value`: A time with the zone on every value

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 3 warehouses in 3 time zones."
    action "Download"
  field "Order number, name or email" search
  region "Orders"
    table 4 "Order" "Customer" "Placed" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "8 Oct 2026, 09:32 CEST" · text "EUR 125.00"
  region "Note"
    text muted "Each delivery uses its own zone. Your zone is Europe/Amsterdam."
```

**Rationale:** Every moment carries its own zone. Orders on one page come from warehouses in different zones. A delivery in another zone is a real case.

**Cost:** A column of repeated offsets is hard to read. The alternative states the zone once. That alternative reads wrong for another zone.

### Choosing a period

**Question:** A statements page can put the period in the heading. It offers two plain buttons beside it. Nothing says which is previous and which is next. The period cannot be typed.

**Default:** `chevrons-either-side-of-the-period-as-the-heading`

**Compact:** The recommended option reflows. One column carries the content. Header actions sit under the title. A table scrolls inside its own region.

**Rationale:** Ship chevrons beside the heading with a month dropdown. Walking is one click and jumping avoids twelve clicks. The runner-up uses presets with typeable bounds. It fits charts and exports where the period is not a month. Never ship the period as a filter chip. The period is the subject, not a refinement.

#### `chevrons-either-side-of-the-period-as-the-heading`: Chevrons either side of the period as the heading

```wireframe
page
  breadcrumb "Home" "Reports" "Statements"
  header
    heading "September 2026"
    text "Every euro of the month under the kind it is."
    action quiet "‹ Previous"
    action quiet "Next ›"
  field "Month" select = "September 2026"
  region "Income"
    fact "Lamp and guide sales" "EUR 57,330.00"
    fact "Service fees customers paid" "EUR 6,020.00"
    fact "Total income" "EUR 63,350.00"
  region "Costs"
    fact "Payment fee" "−EUR 332.92"
    fact "Net for Acme Supply" "EUR 62,896.68"
```

**Rationale:** The period is the heading. A chevron on each side walks months. A chevron cannot read as a tab.

**Cost:** Walking a quarter takes four clicks. A dropdown to jump stays beside it.

#### `period-tabs-that-read-as-a-choice`: Period tabs that read as a choice

```wireframe
page
  breadcrumb "Home" "Reports" "Statements"
  header
    heading "Statements"
    text "Every euro of the month under the kind it is."
    action "Download"
  tabs "August 2026" "September 2026" "October 2026"
    region "September 2026"
      fact "Lamp and guide sales" "EUR 57,330.00"
      fact "Total income" "EUR 63,350.00"
      fact "Net for Acme Supply" "EUR 62,896.68"
```

**Rationale:** Months read as tabs, not buttons. GOV.UK uses this shape for comparison periods. It reads as a choice.

**Cost:** Three or four months fit and a year does not. Carbon warns tabs fail where readers compare across groups. Overflow hides the rest of the year.

**Reference:** GOV.UK, Carbon

#### `a-range-with-presets-and-typeable-bounds`: A range with presets and typeable bounds

```wireframe
page
  breadcrumb "Home" "Reports" "Revenue"
  header
    heading "Revenue"
    text "Every euro that moved, by the day it moved."
  region "Period"
    action "Last 7 days"
    action "Last 30 days"
    action "Custom range"
    field "From" = "09/10/2026"
    field "To" = "08/11/2026"
    action "Apply"
    text muted "Showing 9 October to 8 November 2026. All 30 days."
  region "Daily"
    image "Sales per day, line chart"
    text muted "Peak 13 Oct, EUR 12,400.00."
```

**Rationale:** Where the period is not a month a range control fits. It offers presets and two typeable dates. Carbon asks for a simple way to type. Nothing sits behind the calendar.

**Cost:** Presets plus bounds are two mechanisms. The used preset needs display afterwards. A reader can lose track of the period.

**Reference:** Carbon

#### `both-because-a-report-needs-a-month-and-a-chart-needs-a-rang`: Both, because a report needs a month and a chart needs a range

```wireframe
page
  breadcrumb "Home" "Reports" "Revenue"
  header
    heading "September 2026"
    text "Every euro of the month under the kind it is."
    action quiet "‹ Previous"
    action quiet "Next ›"
  region "The month"
    fact "Lamp and guide sales" "EUR 57,330.00"
    fact "Total income" "EUR 63,350.00"
    fact "Net for Acme Supply" "EUR 62,896.68"
  region "Sales per day"
    action "7 days"
    action "30 days"
    action "90 days"
    image "Sales per day, line chart"
    text muted "A different period from the statement above."
```

**Rationale:** The statement takes a month with chevrons. The daily chart takes a range with presets. Each control fits its question. That fit argues for two controls.

**Cost:** Two period controls can disagree. A reader sets September and last 30 days. The page shows two answers to one question.

#### `the-period-as-a-filter-chip-in-the-toolbar`: The period as a filter chip, in the toolbar

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  field "Order number, name or email" search
  region "Filters"
    status "Placed in September 2026" neutral
    status "Paid" neutral
    action quiet "Clear both"
    text "1,148 orders placed in September 2026 and paid."
  region "Orders"
    table 3 "Order" "Customer" "Placed" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "8 Oct 2026, 09:32" · text "EUR 125.00"
```

**Rationale:** The period sits as one filter among several. It sits with other narrowing choices. It removes like any of them.

**Cost:** The period is the page subject, not a refinement. A filter row demotes the one thing the report covers.

#### `preset-chips-that-open-a-calendar`: Preset chips that open a calendar

```wireframe
page
  breadcrumb "Home" "Reports" "Revenue"
  header
    heading "Revenue"
    text "9 September to 8 October 2026. All 30 days."
    action "Download"
  region "Range"
    action "Today"
    action "Last 7 days"
    action "Last 30 days"
    action "Custom"
    grid 31
      item: text "8"
    text muted "The calendar opens from Custom. 8 October is today."
```

**Rationale:** Stripe dashboard answers common ranges in one click. It opens a calendar for the rest. The control stays small until precision is needed. The chosen range writes back in words. An export check reads those words.

**Cost:** Bounds hide until the calendar opens. A reader cannot see what Custom covers. Keyboard entry needs a typeable path beside the calendar, not inside it.

**Reference:** Stripe

#### `month-and-year-as-two-selects`: Month and year as two selects

```wireframe
page
  breadcrumb "Home" "Reports" "Statements"
  header
    heading "September 2026"
    text "Every euro of the month under the kind it is."
    action "Download"
  field "Month" select = "September"
  field "Year" select = "2026"
  region "Income"
    fact "Lamp and guide sales" "EUR 57,330.00"
    fact "Total income" "EUR 63,350.00"
  region "Costs"
    fact "Payment fee" "−EUR 332.92"
    fact "Net for Acme Supply" "EUR 62,896.68"
```

**Rationale:** Shopify reports pick month and year as two selects. Jumping from March to October takes two clicks with no calendar. The heading states the period in words. The download carries those words.

**Cost:** No custom range exists here. A chart of 30 rolling days needs another control. Two selects read as a form. That reading invites an Apply button the page does not need.

**Reference:** Shopify

#### `a-date-range-across-the-top-typed-as-the-only-control`: A date range across the top, typed, as the only control

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
  region "The period"
    field "From" = "01/09/2026"
    field "To" = "30/09/2026"
    action "Apply"
    text muted "1,148 orders. Europe/Amsterdam."
  region "Orders"
    table 3 "Order" "Customer" "Placed" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "8 Oct 2026, 09:32" · text "EUR 125.00"
```

**Rationale:** One control stays always visible. It always shows the current range in words. A reader who exported the wrong range sees what it covered.

**Cost:** A reader who wants last month types it. Typing two dates is slower than one click. Presets exist for that speed and this removes them.

### How much fits before it breaks

**Question:** A table can run at 47 pixels a row. Three columns hold two lines each. At 390 pixels a five-column table has to drop a column. It truncates names to Garcia with an ellipsis unless the page changes shape.

**Default:** `the-full-width-with-nothing-truncated`

**Compact:** Under 640 pixels the table becomes a record list. One block per order holds customer, delivery, and amount. Newest comes first. Sorting by column goes with the table. The compact option is `at-390-pixels-a-record-list-rather-than-a-table`.

**Rationale:** Keep the table at desktop width. Use two-line cells with no truncation. Switch to the record list under 640 pixels. That pair answers honestly at both widths.

The runner-up wraps rather than truncates. It fits where one column holds names of any length. Never ship shortened figures near a statement. A rounded money figure is not a money figure.

#### `the-full-width-with-nothing-truncated`: The full width, with nothing truncated

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 96 customers."
    action "Download"
  field "Order number, name or email" search
  region "Orders"
    table 4 "Order" "Customer" "Placed" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "8 Oct 2026, 09:32" · status "Paid" positive · text "EUR 125.00"
```

```wireframe compact
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders, newest first."
    action "Download"
  field "Order or customer" search
  region "Orders"
    list 4
      item: text "SO-1042" · text "Maria Garcia" · text "Garcia Interiors restock" · text "8 Oct, 09:32" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** At 1440 pixels the columns all have room. The delivery is the second line of the order cell. The customer email is the second line of the customer cell. Nothing needs an ellipsis.

**Cost:** Five columns reach the ceiling at this width. A seventh column forces a truncation. The second line is where it goes.

#### `at-390-pixels-a-record-list-rather-than-a-table`: At 390 pixels, a record list rather than a table

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders, newest first."
    action "Download"
  field "Order or customer" search
  region "Orders"
    list 4
      item: text "SO-1042" · text "Maria Garcia" · text "Garcia Interiors restock" · text "8 Oct, 09:32" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** A phone has no room for columns. One block per order holds everything.

**Cost:** No sorting by column and no comparison across a column. On a phone a reader seeks one known order. The list serves that case.

#### `at-390-pixels-a-table-with-two-columns-and-no-truncation`: At 390 pixels, a table with two columns and no truncation

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders."
    action "Download"
  field "Order or customer" search
  region "Orders"
    table 6 "Order" "Paid"
      item: text "SO-1042" · text "EUR 125.00"
  region "Note"
    text muted "The customer and delivery are on the record. Open one to read it."
```

**Rationale:** The table keeps two facts per row. It keeps the order and what it cost. The delivery and customer wait on the record.

**Cost:** Rows of order numbers and amounts cannot show customers. It works only when the reader arrives with an order number.

#### `three-densities-on-the-same-table`: Three densities on the same table

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders. 40 pixels a row."
    action "Download"
  field "Rows" select = "40"
  field "Order number, name or email" search
  region "Orders"
    table 3 "Order" "Customer" "Placed" "State" "Paid"
      item: text "SO-1042" · text "Maria Garcia" · text "8 Oct 2026, 09:32" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** Carbon defines five heights. This option keeps three. It offers 24 to scan, 32 to work, and 40 to read. A reader sets it once.

**Cost:** Screenshot tests hold three versions of every page. The setting is per user. Two colleagues can see different screens.

**Reference:** Carbon

#### `long-content-that-wraps-rather-than-truncates`: Long content that wraps rather than truncates

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders. Long names wrap rather than cut."
    action "Download"
  field "Order number, name or email" search
  region "Orders"
    table 3 "Order" "Customer" "Placed" "State" "Paid"
      item: text "SO-1042" · text "Garcia Interiors restock autumn range" · text "Maria Garcia" · text "8 Oct 2026, 09:32" · text "EUR 125.00"
```

**Rationale:** Nothing gets an ellipsis. A long delivery name wraps to a third line. The row grows. Uneven heights are the honest cost.

**Cost:** Rows of different heights break the scan line. A column of wrapped names is harder to compare than short ones.

#### `a-wide-table-that-scrolls-with-its-first-column-pinned`: A wide table that scrolls with its first column pinned

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 96 customers."
    action "Download"
  field "Order number, name or email" search
  region "Orders"
    table 4 "Order" "Delivery" "Customer" "Paid"
      item: text "SO-1042" · text "Garcia Interiors restock" · text "Maria Garcia" · text "EUR 125.00"
    text muted "Scroll sideways for the rest. The order stays pinned."
```

**Rationale:** Linear and Notion pin the name column while the rest scrolls. A seven-column table stays readable without dropping anything. The pinned cell keeps the card background.

**Cost:** The pinned column narrows everything else. A second pinned column takes more than the screen allows. The scroll hint is part of the pattern.

**Reference:** Linear, Notion

#### `one-line-per-row-tap-to-open-the-rest`: One line per row, tap to open the rest

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders, newest first."
    action "Download"
  field "Order or customer" search
  region "Orders"
    list 4
      item: text "SO-1036" · text "Tom Becker" · text "Garcia Interiors restock" · text "8 Oct 2026, 09:30" · status "Paid" positive · action "Close"
```

**Rationale:** Shopify mobile orders show one line per order. A tap opens the row in place. The open row carries customer, delivery, and state. Many orders fit a phone with no dropped column.

**Cost:** Comparing customers takes a tap per row. The open row stays open across refresh. One open row at a time is the rule.

**Reference:** Shopify

#### `a-number-too-large-for-the-column`: A number too large for the column

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 96 customers."
    action "Download"
  field "Order number, name or email" search
  region "Orders"
    table 5 "Order" "Customer" "Placed" "State" "Paid"
      item: text "SO-1025" · text "Tom Becker" · text "6 Oct 2026, 11:20" · status "Paid" positive · text "EUR 1.28M"
    text muted "Large figures shorten to keep the width. Hover for the exact amount."
```

**Rationale:** A figure that misses the column shortens. It writes 54.2k for 54,180. The column keeps its width at every scale.

**Cost:** A rounded figure is not a money figure. A reader cannot read the exact amount in the cell. It needs a tooltip or second read. Never use it in a statement.

### Counting things

**Question:** One rule governs this whole category: read a number the system can count; never type it. A hand-maintained table will not be updated and a reviewer will trust it anyway.

**Default:** `counts-in-the-sidebar-on-the-rows-that-hold-work`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep counts where the reader would otherwise fetch them. The sidebar rows that hold work carry them, and the tabs above a list carry them. The runner-up is the stat tiles with their measure stated.

It is the better choice for the home page where the question is how large the month is. Never ship counts with the report that produces them, since the report name is system language on a number page.

#### `counts-in-the-sidebar-on-the-rows-that-hold-work`: Counts in the sidebar, on the rows that hold work

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    status "Open" neutral
    text "10 open. 2 are outside the refund window."
  split 1:3
    nav side
      link "Orders"
      link "Late Payments 31"
      link current "Refunds 10"
      link "Exceptions 2"
    region "Refunds"
      list 5
        item: text "SO-1029" · text "Elin Lindqvist" · status "No route" critical · text "EUR 45.00" · action "Deal with it"
```

**Rationale:** Refunds 10 in the sidebar, 1 thing to do on the home page. A count appears where a reader would otherwise have to go and get it.

**Cost:** Every count is a read on every page load. A count of 0 beside an area is an area that looks finished rather than unused.

#### `counts-as-stat-tiles-with-the-measure-they-describe`: Counts as stat tiles, with the measure they describe

```wireframe
page
  header
    heading "Good afternoon, Alex"
    text "Two things need you today."
    action primary "New order"
  region "Sold this month"
    grid 3
      card "Sold this month"
        figure "9,412"
        text "Units across every product"
  region "Needs attention"
    list 2
      item: text "10 refunds need a decision" · text muted "2 are outside the refund window" · action "Deal with them"
```

**Rationale:** The home page shape is label, figure, and one line saying what the figure counts. Carbon describes a KPI as a number with a single word description, and 3 to 5 tiles is a defensible row.

**Cost:** A tile figure is a moment, and the next read is a different moment. Two colleagues looking at the same page can see different numbers with no explanation.

**Reference:** Carbon

#### `the-count-on-the-tab-and-in-the-filter-nowhere-else`: The count on the tab and in the filter, nowhere else

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders from 96 customers."
    field "Search" search
  tabs "All 268" "Needs attention 12" "Awaiting money 31" "Refunded 18"
    region "All"
      table 3 "Order" "Customer" "Placed" "Paid"
        item: text "SO-1042" · text "Maria Garcia" · text "8 Oct 2026, 09:32" · status "Paid" positive · text "EUR 125.00"
```

**Rationale:** A count appears where a reader is about to choose: on a tab, beside a filter option. Anywhere else it is a number about a number.

**Cost:** A reader on a list with no tabs and no filters has nowhere to see the size. The pagination range is the only measure left.

#### `no-count-at-all-only-the-work`: No count at all, only the work

```wireframe
page
  header
    heading "Good afternoon, Alex"
    text "Two things need you today."
    action primary "New order"
  region "Needs attention"
    list 2
      item: text "Close out the Okafor Office fit-out" · text muted "The delivery is complete." · action "Close out"
  region "Deliveries"
    list 2
      item: text "Garcia Interiors restock" · text muted "Sat 14 Mar 2026, 08:00 to 12:00" · status "Active" positive · action "Open delivery"
```

**Rationale:** The home page holds the things that need doing and no figures. A count is a report, and this page is a queue.

**Cost:** A first-time reader opening the dashboard learns nothing about the size of what they signed up for. The Carbon split is that a queue and a metrics dashboard answer different questions.

**Reference:** Carbon

#### `counts-with-the-report-that-produces-them`: Counts with the report that produces them

```wireframe
page
  breadcrumb "Home" "Reports" "Census"
  header
    heading "The census"
    text "Every figure on this page is read by a report."
  region "What this company holds"
    table 7 "What" "Count" "Report"
      item: text "Paid orders" · text "214" · link "Orders report"
```

**Rationale:** Each figure names the report that reads it, so a reader who wants a number elsewhere can get it. A figure typed into a page is wrong from the next commit. These figures are read on demand.

**Cost:** A report name beside every figure is system language on a page where the reader only wants the number. It belongs in documentation, not in the product, unless the reader can open the report from it.

#### `counts-that-say-when-they-were-read`: Counts that say when they were read

```wireframe
page
  header
    heading "Good afternoon, Alex"
    text "Two things need you today."
    action primary "New order"
  region "Sold this month"
    grid 3
      card "Sold this month"
        figure "9,412"
        text "Units across every product"
        text muted "Read 2 min ago"
        action quiet "Refresh"
```

**Rationale:** Vercel analytics write the read time under each figure with a refresh beside it. Two colleagues seeing different numbers then have the reason on the page. A count without its moment is a claim. With its moment, it is a dated fact.

**Cost:** Refresh is another read per tile, and a page of six tiles tempts six reads on every visit. The times also age while the page sits open, so a stale page says so rather than hiding it.

**Reference:** Vercel

#### `counts-as-progress-against-a-target`: Counts as progress against a target

```wireframe
page
  header
    heading "Good afternoon, Alex"
    text "Two things need you today."
    action primary "New order"
  region "Against the targets you set"
    list 3
      item: text "Oak desk lamp sold" · text muted "Target 10,000 by 14 Mar 2026" · text "9,412" · image "Target bar, 94 percent sold"
```

**Rationale:** Shopify goals and GitHub milestones draw the count against its target, so 9,412 reads as nearly full. The target is the company figure, stated beside the bar.

**Cost:** A target that was never set says so rather than showing 0 percent. A target met early sits at 100 percent while the month runs on. Both need words the page would rather not spend.

**Reference:** Shopify, GitHub

#### `a-count-with-its-own-date-so-it-stops-being-a-claim`: A count with its own date, so it stops being a claim

```wireframe
page
  breadcrumb "Home" "Reports" "September 2026"
  header
    heading "How the last month went"
    text "Every figure as at 8 Oct 2026, 14:22, Europe/Amsterdam."
  region "September"
    list 6
      item: text "Units sold" · text "9,412" · text muted "as at 8 Oct 2026, 14:22"
```

**Rationale:** Every figure carries the moment it was true. A number that moves now says when it was last read, which turns an unanchored claim into a dated fact.

**Cost:** A date under every figure is a wall of dates. It is a data product rather than a dashboard.

### Sales over time

**Question:** A dashboard can answer how the season is going with a number. A number says where the product stands. Only a line says whether it is speeding up or slowing down.

**Default:** `daily-columns-with-the-total-above`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Ship the daily columns with the total above and the peak labeled. They answer how much and when in one glance. The runner-up is the cumulative line against the previous season.

It is the better choice once the product has a season to beat. Never ship the chart without its table, since a figure nobody can read exactly is a figure nobody can cite.

#### `daily-columns-with-the-total-above`: Daily columns with the total above

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Sales"
  header
    heading "Oak desk lamp, sales"
    text "The 30 days to 8 Oct 2026, Europe/Amsterdam."
    action "Download"
  region "Units per day"
    figure "8,176 units"
    text "30 days. Peak 8 Oct, 488 units."
    image "Daily unit sales, 9 September to 8 October 2026, bar chart"
    text muted "Counts are units sold, before refunds."
```

**Rationale:** Shopify sales reports open with the total and draw the days as columns, so the headline and the shape sit together. The peak day is labeled in words, which is what the company quotes in the review.

**Cost:** Thirty columns at phone width are a few pixels each, so the shape survives but the single day does not. The table behind the chart carries the exact day, not the chart.

**Reference:** Shopify

#### `cumulative-sales-against-the-previous-season`: Cumulative sales against the previous season

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Sales"
  header
    heading "Oak desk lamp, sales"
    text "Sold so far, against the previous season."
    action "Download"
  region "Cumulative units sold"
    figure "9,412 units"
    text "1,042 ahead of the previous season."
    text muted "Solid line is this season. Dashed line is the previous season."
    image "Cumulative units sold against the previous season, line chart"
    text muted "Both lines count the same weeks after the season launch."
```

**Rationale:** Vercel analytics draw the previous period as a dashed line behind the current one, so the comparison needs no second chart. A sold line above a dashed line is the whole story of a growing season.

**Cost:** A first-year product has no previous season, so the page says that rather than drawing one line and calling it a comparison. The dashed line also invites reading a gap that is a calendar shift.

**Reference:** Vercel

#### `an-area-chart-with-the-weekly-average-beside-it`: An area chart with the weekly average beside it

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Sales"
  header
    heading "Oak desk lamp, sales"
    text "Sold so far, week by week from the season launch."
    action "Download"
  region "Cumulative units sold"
    figure "9,412 units"
    fact "Average" "672 a week over 14 weeks"
    image "Cumulative units sold, week by week, area chart"
    text muted "The average covers the 14 weeks since the season launch."
```

**Rationale:** Stripe revenue charts fill under the line and state the average beside it, so the eye reads momentum and the figure reads pace. The fill makes a slow week visible as a flat stretch, not as a missing column.

**Cost:** A fill under a cumulative line is decoration that can read as stock sitting somewhere. The average beside it is the figure that matters, and it has to say which weeks it covers.

**Reference:** Stripe

#### `weekly-columns-with-the-average-marked`: Weekly columns with the average marked

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Sales"
  header
    heading "Oak desk lamp, sales"
    text "The 30 days to 8 Oct 2026, in weeks."
    action "Download"
  region "Units per week"
    figure "8,176 units"
    fact "Weekly average" "1,831, full weeks only"
    image "Units sold per week with the weekly average marked, bar chart"
    text muted "The last column holds two days, 7 and 8 October."
```

**Rationale:** Plausible dashboards mark the average across the bars, so a glance says which weeks pulled their weight. Weekly columns suit a company that plans marketing spend by week, not by day.

**Cost:** Weeks split the story the season tells: launch, steady sale, and last call. A week that holds two of them averages them away, and the final two-day column is not a week at all.

**Reference:** Plausible

#### `the-same-figures-as-a-table`: The same figures as a table

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Sales"
  header
    heading "Oak desk lamp, sales"
    text "The 30 days to 8 Oct 2026, by week."
    action "Download"
  region "By week"
    table 6 "Week" "Units" "Income"
      item: text "8 to 14 September" · text "1,822" · text "EUR 81,990.00"
    text muted "Income is units at the company prices, before refunds."
```

**Rationale:** GOV.UK data guidance asks that every chart ships with its data table. A figure nobody can read exactly is a figure nobody can cite. The table is also what a screen reader reads and what the download carries.

**Cost:** A table of 30 days is 30 rows, so weeks are the compromise and the compromise hides the peak day. The chart and the table then show different groupings of the same figures.

**Reference:** GOV.UK

#### `one-sparkline-per-channel`: One sparkline per channel

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Sales"
  header
    heading "Oak desk lamp, sales"
    text "9,412 units across three channels."
    action "Download"
  region "By channel, last 14 weeks"
    list 3
      item: text "Online shop" · text muted "Orders placed in the company shop" · image "Online shop sales, sparkline" · text "7,340"
    text muted "Each line is scaled to its own channel. Compare the figures, not the slopes."
```

**Rationale:** Vercel usage pages put a sparkline beside each meter, so three channels share one row each and the shape of each is comparable. The figure beside each line carries the exact count the line cannot.

**Cost:** Three sparklines share no axis, so a steep line can mean 30 units or 3,000. The figure beside each one is required, which makes the line a hint rather than the answer.

**Reference:** Vercel

### Sales by product variant

**Question:** The autumn range sells three lamp variants and a guide. The company asks which variant carries the season, and the answer is a share, not a total.

**Default:** `horizontal-bars-with-the-figure-on-each-row`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Ship the horizontal bars with the figure on each row. Every variant reads with its count and its money in one glance. The runner-up is the table with a bar in each row.

It is the better choice once variants gain states such as paused or sold out. Never ship the donut alone, since an angle nobody can read exactly is decoration and not a figure.

#### `horizontal-bars-with-the-figure-on-each-row`: Horizontal bars with the figure on each row

```wireframe
page
  breadcrumb "Home" "Products" "Autumn range" "Sales"
  header
    heading "Autumn range, by variant"
    text "9,412 lamps and 126 guides, at the company prices."
    action "Download"
  region "Lamps"
    list 3
      item: text "Oak desk lamp" · text muted "EUR 45.00, 6,204 units" · text "EUR 279,180.00" · image "Share bar, 65.9 percent"
  region "Design guides"
    fact "Lighting design guide" "EUR 3,150.00"
    text muted "EUR 25.00, 126 guides. Guides keep their own scale."
```

**Rationale:** Shopify product performance lists each variant with its bar and its money, so the ranking and the figures share one row. Every variant carries its price, its count, and its income, which is the whole question in one glance.

**Cost:** Bars share one scale, so the guide EUR 3,150.00 is a sliver beside the lamps. A second product line that matters needs its own scale, which this option refuses to give it.

**Reference:** Shopify

#### `one-stacked-bar-for-the-whole-range`: One stacked bar for the whole range

```wireframe
page
  breadcrumb "Home" "Products" "Autumn range" "Sales"
  header
    heading "Autumn range, by variant"
    text "9,412 lamps at the company prices."
    action "Download"
  region "The mix"
    image "Autumn range mix, stacked strip"
    list 3
      item: text "Oak desk lamp" · text "6,204" · text "EUR 279,180.00"
    text muted "Shares are of units sold, not of income."
```

**Rationale:** GitHub language bars compress a whole repository into one strip with its legend as figures. This is the right shape for a range with three variants and one total. The strip says the mix. The legend says the money.

**Cost:** A strip has no axis, so 22 percent and 24 percent are the same length to the eye. The legend carries every exact figure, which makes the strip a summary rather than the answer.

**Reference:** GitHub

#### `a-table-with-a-bar-in-each-row`: A table with a bar in each row

```wireframe
page
  breadcrumb "Home" "Products" "Autumn range" "Sales"
  header
    heading "Autumn range, by variant"
    text "Every variant with its price, its count and its share."
    action "Download"
  region "By variant"
    table 4 "Variant" "State" "Price" "Sold" "Share" "Income"
      item: text "Oak desk lamp" · status "Active" positive · text "EUR 45.00" · text "6,204" · image "Share bar, 65.9 percent" · text "EUR 279,180.00"
    text muted "The brass lamp is paused. Its sold units stand."
```

**Rationale:** Notion progress columns put a bar inside the table cell, so the figure and its share never separate. The table also has room for the state each variant is in, which bars alone cannot carry.

**Cost:** Five columns need a wide page, so the table scrolls sideways on a phone. The bar in a scrolling table is the first thing cut off, which is where the share lives.

**Reference:** Notion

#### `a-tile-per-type-with-its-share`: A tile per type with its share

```wireframe
page
  breadcrumb "Home" "Products" "Autumn range" "Sales"
  header
    heading "Autumn range, by variant"
    text "Three variants, one season."
    action "Download"
  region "By variant"
    grid 3
      card "Oak desk lamp"
        figure "EUR 279,180.00"
        text "EUR 45.00, 6,204 units, 65.9 percent"
```

**Rationale:** A per-variant summary gives each variant its own tile with sold and share. Three variants read as three facts rather than one ranking. Tiles suit a home page where the by-variant question is asked in passing.

**Cost:** Tiles cannot be sorted or compared at a glance the way bars can, and a fourth variant wraps the row. The price each tile needs makes every tile taller than the figure it carries.

#### `a-donut-with-its-legend-as-figures`: A donut with its legend as figures

```wireframe
page
  breadcrumb "Home" "Products" "Autumn range" "Sales"
  header
    heading "Autumn range, by variant"
    text "9,412 lamps at the company prices."
    action "Download"
  region "The mix"
    image "Lamp mix, donut chart: 65.9 percent oak, 22.4 percent small, 11.7 percent brass"
    list 3
      item: text "Oak desk lamp" · text "6,204" · text "EUR 279,180.00"
    text muted "Shares are of units sold. The legend is the readable form of this chart."
```

**Rationale:** Linear project progress rings the whole and lists each part with its count, so the shape invites the eye and the legend answers. The donut earns its place where the mix is the message and the ranking is settled.

**Cost:** An angle nobody can read exactly is decoration, so the legend carries every figure and the donut carries none. A reader who prints in black and white gets three greys and the legend.

**Reference:** Linear

#### `two-types-as-lines-over-the-last-30-days`: Two types as lines over the last 30 days

```wireframe
page
  breadcrumb "Home" "Products" "Autumn range" "Sales"
  header
    heading "Autumn range, by variant"
    text "Units per week for two variants, last 30 days."
    action "Download"
  region "Oak lamp against brass lamp"
    text muted "Solid line is the oak lamp. Dashed line is the brass lamp."
    image "Weekly units for the oak lamp and the brass lamp, line chart"
    text muted "The last column holds two days. The small lamp is omitted."
```

**Rationale:** Vercel analytics compare two series as lines over one axis. The oak lamp and the brass lamp share the weeks and diverge honestly. Lines suit the question of when the brass lamp slowed, which no total answers.

**Cost:** Two lines are the most one chart carries before the tones run out. The small lamp needs its own chart or no line at all. Lines also share one axis, which flatters the brass lamp by drawing it at the oak lamp scale.

**Reference:** Vercel

### Sell-through against capacity

**Question:** The autumn run made 10,000 lamps and 9,412 are sold. The distance between the two is the decision to make more variants, move marketing money, or call the run sold out.

**Default:** `a-bar-with-sold-held-and-left-in-words`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Ship the progress bar with sold, held, and left in words. One glance says how far the run has sold and what is still movable. The runner-up is the per-variant sell-through table.

It is the better choice when one variant is gone and the others are not. Never ship the countdown alone, since 468 left without the run size hides whether the stock is nearly gone or barely touched.

#### `a-bar-with-sold-held-and-left-in-words`: A bar with sold, held and left in words

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Sales"
  header
    heading "Oak desk lamp, sell-through"
    text "The autumn run made 10,000 lamps."
    action "Open product"
  region "How far the run has sold"
    figure "94.1 percent sold"
    text "9,412 of 10,000 lamps. 468 left."
    image "Sell-through bar, 94 percent sold"
    fact "Sold" "9,412 lamps"
    fact "Held" "120 lamps"
    fact "Left to sell" "468 lamps"
    text muted "Held lamps are reserved for open quotes and samples."
```

**Rationale:** A commerce app draws sales as a bar against the run with the counts in words, so the glance and the figures agree. Sold, held, and left are three different decisions, which is why all three are named.

**Cost:** One bar hides which variant is gone, so a sold-out brass lamp behind a half-empty run reads as room to spare. The per-variant rows answer that, not this bar.

#### `the-percentage-first-the-bar-under-it`: The percentage first, the bar under it

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Sales"
  header
    heading "Oak desk lamp, sell-through"
    text "The autumn run made 10,000 lamps."
    action "Open product"
  region "Sold"
    figure "94.1 percent"
    text "9,412 of 10,000 lamps. 468 left."
    image "Sell-through bar, 94 percent sold"
    fact "Held for quotes and samples" "120"
```

**Rationale:** Kickstarter project pages lead with the funded percentage and draw the bar under it. The percentage is the sentence and the bar is the illustration. A run at 94 percent reads as nearly gone before a single count is read.

**Cost:** A percentage loves round numbers and this one is not round. The figure either shows its decimal or lies by one place in a thousand. The counts under it are required, not optional.

**Reference:** Kickstarter

#### `sell-through-per-variant`: Sell-through per variant

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Sales"
  header
    heading "Oak desk lamp, sell-through"
    text "9,412 of 10,000 lamps sold."
    action "Open product"
  region "By variant"
    list 3
      item: text "Oak desk lamp" · text muted "6,204 of 6,500 lamps" · text "95.4 percent" · image "Sell-through bar, 95 percent"
    text muted "The brass lamp is paused. Its 200 unsold lamps cannot be bought."
```

**Rationale:** Shopify inventory by variant draws each variant against its own stock. One empty variant and two full ones are not the same as a third gone everywhere. Each row states what restocking that variant would take.

**Cost:** Three bars share no scale unless the runs are close, and here they are not. The run total has to sit above the rows or the stock reads as three stocks.

**Reference:** Shopify

#### `the-cumulative-line-with-the-capacity-line`: The cumulative line with the capacity line

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Sales"
  header
    heading "Oak desk lamp, sell-through"
    text "Sold so far against the run it must fill."
    action "Open product"
  region "Against the run"
    figure "9,412 of 10,000"
    text muted "Solid area is sold. Line is the run of 10,000."
    image "Cumulative lamps sold against the run of 10,000, area chart"
    text muted "Held lamps are not sold, so they sit under the line."
```

**Rationale:** Metabase goal lines draw the target across the time series. The gap between sold and the run is visible at every week, not only today. The line answers when the run sold, which a bar cannot.

**Cost:** A run line at 10,000 flattens everything under it. A slow month reads as flat whether it sold 300 or 600 a week. The weekly figures behind the line carry the pace, not the chart.

**Reference:** Metabase

#### `a-countdown-tile-with-the-caution-it-earns`: A countdown tile with the caution it earns

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Sales"
  header
    heading "Oak desk lamp, sell-through"
    text "As at 8 Oct 2026, 14:22, Europe/Amsterdam."
    action "Open product"
  region "Lamps left to sell"
    figure "468"
    text "Of 10,000. 9,412 sold, 120 held."
    message caution "At the last 7 days pace of 2,036 lamps a week, the 468 go in about 2 days."
```

**Rationale:** Booking.com scarcity notes state what is left and at what pace it goes, because a count without a pace is not a decision. The tile says the stock sells out in about two days at the current pace, which is the reorder decision.

**Cost:** A pace prediction is wrong the moment sales spike or stall, and a wrong countdown teaches the company to ignore the tile. It states its basis and its date, which this one does and most do not.

**Reference:** Booking.com

#### `capacity-sold-held-and-left-as-a-table`: Capacity, sold, held and left as a table

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Sales"
  header
    heading "Oak desk lamp, sell-through"
    text "Every lamp accounted for, by variant."
    action "Open product"
  region "By variant"
    table 4 "Variant" "Run" "Sold" "Held" "Left"
      item: text "Oak desk lamp" · text "6,500" · text "6,204" · text "60" · text "236"
    text muted "Held lamps are reserved for open quotes and samples."
```

**Rationale:** Shopify inventory by location is a table because four figures per row need columns, not bars. Every row adds up across, and every column adds down, so finance can check the arithmetic both ways.

**Cost:** A table of four money-less counts reads as stocktaking, which is what it is. It answers the audit and bores the glance, so the bar belongs above it on the page that holds both.

**Reference:** Shopify

### Figure against an earlier period

**Question:** A tile that says EUR 63,350.00 answers how much. Only the tile that adds against EUR 48,340.00 in August answers whether the month was good.

**Default:** `tiles-with-a-delta-pill-and-the-previous-figure`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Ship the tiles with a delta pill and the previous figure in words. The comparison is visible and the basis is stated. The runner-up is the tiles with sparklines.

It is the better choice on the home page where the shape of the month matters more than one earlier figure. Never ship a bare percentage with no basis, since up 12 percent without the basis is a claim and not a comparison.

#### `tiles-with-a-delta-pill-and-the-previous-figure`: Tiles with a delta pill and the previous figure

```wireframe
page
  breadcrumb "Home" "Reports" "Revenue"
  header
    heading "September 2026"
    text "Against August 2026, same 30 days."
    action "Download"
  region "September against August"
    grid 3
      card "Income"
        figure "EUR 63,350.00"
        status "Up 31.1 percent" positive
        text muted "August EUR 48,340.00"
        text "1,148 orders"
```

**Rationale:** Stripe home tiles compare each figure against the previous period with the basis stated under the delta. No reader asks compared to what. The pill carries direction and size. The words carry the basis.

**Cost:** Three tiles each with a pill, a basis, and a note are three small paragraphs, which is heavy for a home page. A fourth KPI wraps the row and the comparison wraps with it.

**Reference:** Stripe

#### `tiles-with-sparklines`: Tiles with sparklines

```wireframe
page
  breadcrumb "Home" "Reports" "Revenue"
  header
    heading "September 2026"
    text "Against August 2026, same 30 days."
    action "Download"
  region "September against August"
    grid 3
      card "Income"
        figure "EUR 63,350.00"
        status "Up 31.1 percent" positive
        image "Income by day, sparkline"
        text muted "August EUR 48,340.00"
```

**Rationale:** Vercel usage tiles pair each meter with its sparkline, so the month reads as a shape rather than as two endpoints. A steady climb and a last-week spike end at the same figure and mean different things.

**Cost:** A sparkline shares no axis with its neighbors, so the refund line can look calmer than the income line while rising faster. The delta pill beside each one is still required.

**Reference:** Vercel

#### `a-comparison-column-on-the-statement`: A comparison column on the statement

```wireframe
page
  breadcrumb "Home" "Reports" "Statements" "September 2026"
  header
    heading "September 2026"
    text "Beside August 2026, with the change in money."
    action "Download"
  region "September beside August"
    table 4 "Line" "August" "September" "Change"
      item: text "Income" · text "EUR 48,340.00" · text "EUR 63,350.00" · status "Up EUR 15,010.00" positive
    text muted "August held 918 orders. September held 1,148."
```

**Rationale:** Xero comparative profit and loss adds last period as a column with the change in money. The statement stays the statement and gains the trend. The change is in money because percent of a small August line misleads.

**Cost:** Four columns of money need a wide page, so the table scrolls sideways on a phone. The scroll hides September first, which is the column the reader came for.

**Reference:** Xero

#### `the-comparison-in-the-heading`: The comparison in the heading

```wireframe
page
  breadcrumb "Home" "Reports" "Revenue"
  header
    heading "September 2026"
    text "Income EUR 63,350.00, up 31.1 percent on August EUR 48,340.00."
    action "Download"
  region "September"
    grid 3
      card "Income"
        figure "EUR 63,350.00"
        text "1,148 orders"
```

**Rationale:** Linear cycle summaries state the comparison in one sentence under the heading. The page reads as a verdict rather than as a worksheet. The tiles under it stay clean figures with no pills competing for attention.

**Cost:** One sentence holds one comparison, so the second KPI either shares the sentence or loses its comparison. A reader who wants the basis still has to find it in the tiles.

**Reference:** Linear

#### `kpis-as-a-table-with-previous-and-change`: KPIs as a table with previous and change

```wireframe
page
  breadcrumb "Home" "Reports" "Revenue"
  header
    heading "September 2026"
    text "Every headline figure against August 2026."
    action "Download"
  region "Headline figures"
    table 5 "Figure" "August" "September" "Change"
      item: text "Income" · text "EUR 48,340.00" · text "EUR 63,350.00" · status "Up 31.1 percent" positive
    text muted "Percent where the basis is large, money where it is small."
```

**Rationale:** Baremetrics metrics tables list each KPI with its previous value and its change in one row, so six KPIs share one alignment. A table suits finance, where the comparison is audited rather than glanced at.

**Cost:** A table of KPIs reads as a report, which is what it is. It has no place on the home page, where three tiles answer faster than six rows.

**Reference:** Baremetrics

#### `no-comparison-only-the-figure-with-its-date`: No comparison, only the figure with its date

```wireframe
page
  breadcrumb "Home" "Reports" "Revenue"
  header
    heading "September 2026"
    text "The first full month. There is no earlier period to compare."
    action "Download"
  region "September"
    grid 3
      card "Income"
        figure "EUR 63,350.00"
        text muted "As at 30 September 2026, 1,148 orders"
```

**Rationale:** GOV.UK statistics releases state the period with no comparison until the next release exists, because a comparison without a fair basis misleads. A new company in its first month has no August, so the tile says when instead of versus.

**Cost:** A figure with no comparison answers how much and never whether it was good. The month this option suits is the first one. Every month after it wants the delta back.

**Reference:** GOV.UK

### When the money arrives

**Question:** The payment provider holds the money of the company and pays it out on its own days. The company plans wages and supplier runs around those days, so the schedule is a planning surface, not a history.

**Default:** `upcoming-payouts-with-the-sales-each-one-holds`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Ship the list of upcoming payouts with the sales each one holds: the company sees what arrives and when in one place. The runner-up is the past payouts table with bank references, which is the better choice for finance reconciling against the bank.

Never ship the single next-payout tile as the page: one arrival without the ones after it cannot plan a month.

#### `upcoming-payouts-with-the-sales-each-one-holds`: Upcoming payouts with the sales each one holds

```wireframe
page
  breadcrumb "Home" "Reports" "Payouts"
  header
    heading "Payouts"
    text "What the provider sends to NL91 ABNA 0417 1643, and when."
    action "Download"
  region "On the way and building up"
    table 4 "Arrives" "Holds" "Amount" "State"
      item: text "Mon 12 Oct 2026" · text "Sales of 5 to 11 October, 418 orders" · text "EUR 8,412.55" · status "On its way" info
```

**Rationale:** The Stripe payouts list pairs each payout with its arrival date and the sales it holds. The company plans around arrivals rather than around sales. Each row states its state, because a payout building up is not a payout sent.

**Cost:** A building payout moves with every order, so its amount is stale the moment the page sits open. The page must date each figure, which the list does and a tile cannot.

**Reference:** Stripe

#### `payouts-grouped-by-week-with-totals`: Payouts grouped by week with totals

```wireframe
page
  breadcrumb "Home" "Reports" "Payouts"
  header
    heading "Payouts"
    text "What the provider sends to NL91 ABNA 0417 1643, and when."
    action "Download"
  region "Week of 12 October, EUR 8,412.55"
    table 4 "Arrives" "Holds" "Amount" "State"
      item: text "Mon 12 Oct" · text "Sales of 5 to 11 October, 418 orders" · text "EUR 8,412.55" · status "On its way" info
  region "Week of 5 October, EUR 6,117.46"
    table 4 "Arrives" "Holds" "Amount" "State"
      item: text "Mon 5 Oct" · text "Sales of 28 to 30 September, 214 orders" · text "EUR 6,117.46" · status "Paid out" positive
  region "Week of 28 September, EUR 12,618.04"
    table 4 "Arrives" "Holds" "Amount" "State"
      item: text "Mon 28 Sep" · text "Sales of 21 to 27 September, 302 orders" · text "EUR 12,618.04" · status "Paid out" positive
```

**Rationale:** QuickBooks groups deposits by week with a total per group, because wages and supplier runs are planned by week. The group total is the figure the company carries into planning for the week.

**Cost:** A week that holds two payouts, which happens around holidays, gets a total that covers two arrivals. The group then needs its dates restated, which the flat list never needs.

**Reference:** QuickBooks

#### `one-payout-s-journey-from-sale-to-bank`: One payout's journey from sale to bank

```wireframe
page
  breadcrumb "Home" "Reports" "Payouts" "12 Oct 2026"
  header
    heading "EUR 8,412.55"
    status "On its way" info
    text "Sales of 5 to 11 October, 418 orders. Expected Tue 14 October."
  region "Where it stands"
    timeline 4
      item: text "Sent to NL91 ABNA 0417 1643" · text muted "Mon 12 Oct 2026, 09:15"
  region "Refunds"
    text muted "Refunds before Monday are off. Later refunds wait for the next payout."
```

**Rationale:** The Wise transfer timeline states each step with its time. A reader waiting on money sees where it stands rather than a single pending state. The last step carries the expected date, which is the planning figure.

**Cost:** A journey per payout is one page per payout, so the schedule of the month needs the list as well. Four steps for money that has not moved can also read as reassurance rather than information.

**Reference:** Wise

#### `past-payouts-with-their-bank-references`: Past payouts with their bank references

```wireframe
page
  breadcrumb "Home" "Reports" "Payouts"
  header
    heading "Payouts"
    text "What arrived, with the reference each bank line carries."
    action "Download"
  region "Past payouts"
    table 4 "Paid out" "Covers" "Amount" "Bank reference"
      item: text "5 Oct 2026" · text "28 to 30 Sep" · text "EUR 6,117.46" · text "SH-PO-44182"
    action quiet "Copy the bank reference"
    fact "September total" "Five payouts, EUR 61,346.68 net"
```

**Rationale:** The Revolut Business payout history carries the bank reference on each row, because finance ticks each payout against a bank line. The reference is copyable, which is the whole job of this table.

**Cost:** A history answers reconciliation and nothing else: it says what arrived, never what is coming. The upcoming list has to sit above it or the page plans nothing.

**Reference:** Revolut Business

#### `a-month-with-its-payout-days-marked`: A month with its payout days marked

```wireframe
page
  breadcrumb "Home" "Reports" "Payouts"
  header
    heading "October 2026"
    text "Payouts land on Mondays."
    action "Download"
  toolbar
    action quiet "Previous month"
    action quiet "Next month"
  region "October 2026"
    grid 31
      item: text "12" · status "Payout" info
    text muted "Marked days are payout days. 8 October is today."
  region "Under the month"
    list 3
      item: text "Mon 5 Oct, paid out" · text muted "Sales of 28 to 30 September" · text "EUR 6,117.46"
```

**Rationale:** The Google Calendar month answers "when" faster than any list, because payout Mondays form a rhythm the eye keeps. The amounts sit under the month, so the calendar plans and the list below it states.

**Cost:** A month shows rhythm and hides amounts, so every figure lives below the fold of the calendar. A reader who wants the total scrolls past the pattern to find it.

**Reference:** Google Calendar

#### `the-next-payout-as-a-tile-the-rest-behind-a-link`: The next payout as a tile, the rest behind a link

```wireframe
page
  header
    heading "Good afternoon, Alex Morgan"
    text "Two things need you today."
    action primary "New order"
  region "Next payout"
    card "Mon 12 Oct 2026"
      figure "EUR 8,412.55"
      text "Sales of 5 to 11 October, 418 orders."
      link "All payouts"
      link "September statement"
```

**Rationale:** The Monzo upcoming payments lead with the next arrival and keep the rest one tap away. This suits a home page where the payout question is asked in passing. The tile states the date, the amount, and what it holds.

**Cost:** One arrival without the ones after it cannot plan a month, so the tile is a pointer rather than a page. A reader who stops at the tile mistakes the next payout for the position.

**Reference:** Monzo

### Vendor's invoice to the company

**Question:** Billing holds what the company owes its software vendor: the Business subscription and anything metered. The invoice is the one document where the vendor is the seller. It reads as the sale of the vendor, not as the sale of the company.

**Default:** `the-invoice-as-a-document-with-the-usage-behind-each-line`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Ship the document-style invoice with the usage behind each line: finance sees what the fee paid for without opening another page. The runner-up is the paid invoice with its mandate reference, which is the better state of the same document once the money has moved.

Never ship the invoice without its VAT lines: a business invoice without VAT is not an invoice.

#### `the-invoice-as-a-document-with-the-usage-behind-each-line`: The invoice as a document, with the usage behind each line

```wireframe
page
  breadcrumb "Home" "Invoices" "2026-1841"
  header
    heading "Invoice 2026-1841"
    status "Unpaid" caution
    text "September 2026. Due 15 October 2026."
    action "Download PDF"
  region "From Meridian Software"
    fact "Seller" "Meridian Software B.V., Herengracht 420, Amsterdam"
    fact "VAT" "NL987654321B01"
    fact "To" "Acme Supply"
  region "Lines"
    table 4 "What" "Quantity" "Rate" "Amount"
      item: text "Business subscription, September 2026" · text "1 month" · text "EUR 49.00" · text "EUR 49.00"
  region "Totals"
    fact "Subtotal, excluding VAT" "EUR 169.40"
    fact "VAT, 21%" "EUR 35.57"
    fact "Due" "EUR 204.97"
    text muted "Collected by mandate ACM-2024-0117 on 15 October 2026."
```

**Rationale:** The Xero invoice preview is the document the customer receives, with each line carrying the quantity behind it. The company reads what the vendor charged and why in one place, which is the whole point of an invoice.

**Cost:** A document is a page of its own, so the invoice list needs the state of each invoice without opening it. The list carries the states. This page carries the lines.

**Reference:** Xero

#### `the-same-invoice-as-statement-lines`: The same invoice as statement lines

```wireframe
page
  breadcrumb "Home" "Invoices" "2026-1841"
  header
    heading "Invoice 2026-1841"
    status "Unpaid" caution
    text "September 2026. Due 15 October 2026."
    action "Download PDF"
  region "What the vendor charged"
    fact "Business subscription, September 2026" "EUR 49.00"
    fact "Usage fee, 1,204 paid orders at EUR 0.10" "EUR 120.40"
    fact "Subtotal, excluding VAT" "EUR 169.40"
  region "Tax"
    fact "VAT, 21%" "EUR 35.57"
    fact "Total VAT" "EUR 35.57"
  region "Due 15 October 2026"
    fact "Due" "EUR 204.97"
```

**Rationale:** The Moneybird invoice view lists the lines the way they were entered, with no document chrome. The statement shape suits a reader who checks figures rather than files documents, and it is the shape the rest of finance already uses.

**Cost:** A statement is not an invoice: it carries no seller address, no VAT number, and no mandate reference. Finance can check it but cannot file it, so the document has to exist behind it.

**Reference:** Moneybird

#### `paid-with-the-mandate-reference-and-the-date`: Paid, with the mandate reference and the date

```wireframe
page
  breadcrumb "Home" "Invoices" "2026-1702"
  header
    heading "Invoice 2026-1702"
    status "Paid" positive
    text "August 2026. Paid 15 August 2026 by mandate ACM-2024-0117."
    action "Download PDF"
  region "From Meridian Software"
    fact "Seller" "Meridian Software B.V., Herengracht 420, Amsterdam"
    fact "Paid" "15 August 2026, EUR 190.45"
  region "Lines"
    table 4 "What" "Quantity" "Rate" "Amount"
      item: text "Business subscription, August 2026" · text "1 month" · text "EUR 49.00" · text "EUR 49.00"
  region "Totals"
    fact "Subtotal, excluding VAT" "EUR 157.40"
    fact "VAT, 21%" "EUR 33.05"
    fact "Paid 15 August 2026" "EUR 190.45"
```

**Rationale:** The Wise paid receipts carry the reference and the date above the lines. A filed invoice answers "when and how" without being read. The stamp states the state in the words of the document, not in the words of the dashboard.

**Cost:** A stamp is final in a way a badge is not, so a payment that later fails leaves a stamped invoice that lies. The state must follow the mandate, not the page the reader printed.

**Reference:** Wise

#### `overdue-with-what-happens-next`: Overdue, with what happens next

```wireframe
page
  breadcrumb "Home" "Invoices" "2026-1841"
  header
    heading "Invoice 2026-1841"
    status "Overdue" critical
    text "EUR 204.97 was due 15 October 2026. 5 days overdue."
    action primary "Pay EUR 204.97"
  message critical "The SEPA collection failed on 15 October 2026. Pay by transfer or fix the mandate."
  region "What happens next"
    fact "Due since 15 October 2026" "EUR 204.97"
    fact "Pay by transfer to Meridian, reference 2026-1841" "EUR 204.97"
    fact "If unpaid on 29 October 2026, the plan pauses" "Plan pauses"
```

**Rationale:** The GitHub failed-payment notice states what is owed, how to pay it, and what happens if it is not paid, in that order. The company owes the vendor money on this page, so the page says the remedy before it says the consequence.

**Cost:** A consequence with a date is a threat with a date, however plainly it is worded. The date is the real one from the agreement, which the page reads from the subscription.

**Reference:** GitHub

#### `every-invoice-with-its-state`: Every invoice with its state

```wireframe
page
  breadcrumb "Home" "Invoices"
  header
    heading "Invoices"
    text "What Acme Supply owes the vendor, newest first."
  region "Every invoice"
    table 5 "Invoice" "Period" "State" "Due" "Total"
      item: text "2026-1841" · text "September 2026" · status "Unpaid" caution · text "15 Oct 2026" · text "EUR 204.97"
    text muted "Subscription and usage fee, including VAT. Open an invoice for its lines."
```

**Rationale:** The Stripe invoices table lists each invoice with its period, its amount, and its state. The list answers "do I owe anything" before any invoice is opened.

**Cost:** A list of invoices says nothing about what any invoice holds, so a surprising total needs the document. Each row opens the invoice, which must then carry the usage this list omits.

**Reference:** Stripe

#### `the-usage-fee-line-opened-to-its-orders`: The usage fee line opened to its orders

```wireframe
page
  breadcrumb "Home" "Invoices" "2026-1841" "Usage fee"
  header
    heading "Usage fee, September 2026"
    text "EUR 120.40 for 1,204 paid orders at EUR 0.10, on invoice 2026-1841."
  region "Orders behind the fee"
    table 3 "Product" "Paid orders" "Fee"
      item: text "Oak desk lamp" · text "836" · text "EUR 83.60"
    text muted "Refunded orders carry no usage fee."
```

**Rationale:** The AWS bill breaks each line into the usage behind it, because a metered fee without its meter is a figure on trust. The per-product counts add up to the 1,204 orders on the invoice, which is the check finance runs.

**Cost:** Usage behind every line doubles the length of every invoice, so the breakdown belongs one step behind the document. A reader who never opens it trusts the line, which is what the invoice asks.

**Reference:** AWS

### Two VAT rates on one page

**Question:** Books carry 9% and a lamp carries 21%. The customer sees one total. The books see two rates on the page the tax return is built from.

**Default:** `the-vat-split-under-the-order-total`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Ship the VAT split under the order total. The customer total stays one figure and the books get both rates. The runner-up is the per-rate report with taxable bases, which is the better choice at quarter end when finance files the return.

Never ship prices with no VAT note at all: a lawful price states what the tax is.

#### `the-vat-split-under-the-order-total`: The VAT split under the order total

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia. Prices include VAT."
  region "What she paid"
    fact "Oak desk lamp, 2 at EUR 45.00" "EUR 90.00"
    fact "Delivery fee" "EUR 10.00"
    fact "Lighting design guide" "EUR 25.00"
    fact "Paid by the customer" "EUR 125.00"
  region "VAT in that total"
    fact "9% on books, base EUR 22.94" "EUR 2.06"
    fact "21% on lamps and fee, base EUR 82.64" "EUR 17.36"
    fact "Total VAT" "EUR 19.42"
    text muted "Books are taxed at 9%. Lamps and fees at 21%."
```

**Rationale:** The Coolblue receipts split VAT per rate under the total. One customer-facing figure opens into both rates. Each line states its base and its tax, which is what the return needs per rate.

**Cost:** Three more rows under every total, which is heavy on a receipt for two lamps. The split belongs on the record and the export, not on every row of the orders list.

**Reference:** Coolblue

#### `the-rate-on-each-invoice-line`: The rate on each invoice line

```wireframe
page
  breadcrumb "Home" "Invoices" "2026-1841"
  header
    heading "Invoice 2026-1841"
    status "Unpaid" caution
    text "September 2026. Due 15 October 2026."
    action "Download PDF"
  region "Lines with their rate"
    table 3 "What" "VAT" "Amount, excluding VAT"
      item: text "Business subscription, September 2026" · status "21%" neutral · text "EUR 49.00"
  region "Totals"
    fact "Subtotal, excluding VAT" "EUR 169.40"
    fact "VAT, 21%" "EUR 35.57"
    fact "Due" "EUR 204.97"
```

**Rationale:** The Moneybird invoice lines carry their own rate. A mixed invoice is right on every line rather than in a summary that must be trusted. The rate badge sits where the eye checks the amount.

**Cost:** A rate column narrows every other column on a document that already has four of them. An invoice with one rate repeats the same badge on every line, which says nothing after the first.

**Reference:** Moneybird

#### `a-per-rate-summary-on-the-statement`: A per-rate summary on the statement

```wireframe
page
  breadcrumb "Home" "Reports" "Statements" "September 2026"
  header
    heading "September 2026"
    text "Every euro of the month under the kind it is."
    action "Download"
  region "Income"
    fact "Lamp sales, 1,204 units" "EUR 54,180.00"
    fact "Service fees customers paid" "EUR 6,020.00"
    fact "Design guides, 126 guides" "EUR 3,150.00"
    fact "Total income" "EUR 63,350.00"
  region "VAT in that income"
    fact "At 21%, on lamps and fees, base EUR 49,752.07" "EUR 10,447.93"
    fact "At 9%, on books, base EUR 2,889.91" "EUR 260.09"
    fact "Total VAT collected" "EUR 10,708.02"
    fact "Net for Acme Supply" "EUR 61,346.68"
```

**Rationale:** The Xero tax summary groups collected VAT by rate under the income it came from. The last group of the statement is the first draft of the return. Each line states its base, because the return taxes the base, not the gross.

**Cost:** VAT on the statement repeats figures the VAT report owns, so two pages state the same tax. The statement group has to match the report to the cent, which is a second read that can disagree.

**Reference:** Xero

#### `rate-badges-beside-each-product`: Rate badges beside each product

```wireframe
page
  breadcrumb "Home" "Products"
  header
    heading "Products and fees"
    text "Every price includes VAT at the rate beside it."
    action "Tax settings"
  region "Every price with its rate"
    list 5
      item: text "Oak desk lamp" · text muted "EUR 45.00, includes VAT" · status "21%" neutral · action "Edit"
    text muted "A price in the shop always states that it includes VAT."
```

**Rationale:** The Shopify product tax settings show the rate beside each product. The company sees the tax where they set the price. A wrong rate is caught at the price, not at the return.

**Cost:** A rate on the product page is a setting shown as a fact, and a reader may not know where to change it. Each badge opens the tax settings instead of only stating the rate.

**Reference:** Shopify

#### `a-vat-report-with-taxable-bases`: A VAT report with taxable bases

```wireframe
page
  breadcrumb "Home" "Reports" "VAT"
  header
    heading "Third quarter 2026"
    text "VAT collected, per rate, with the base each rate taxed."
    action "Download"
  region "Per rate"
    table 4 "Rate" "Base" "VAT" "Gross"
      item: text "21%, lamps and fees" · text "EUR 133,520.66" · text "EUR 28,039.34" · text "EUR 161,560.00"
    text muted "Gross is what customers paid, including VAT."
```

**Rationale:** The Exact VAT return overview lists each rate with its base and its tax, because the return is filed per rate. The two quarter lines are the two lines finance copies into the filing.

**Cost:** A report per rate says nothing about which products produced it, so a surprising base needs the product sales behind it. The report opens those sales instead of only stating the base.

**Reference:** Exact

#### `inclusive-prices-with-a-breakdown-behind-a-note`: Inclusive prices with a breakdown behind a note

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia. Garcia Interiors restock."
  region "What she paid"
    fact "Oak desk lamp, 2 lamps, incl. 21% VAT" "EUR 90.00"
    fact "Delivery fee, incl. 21% VAT" "EUR 10.00"
    fact "Lighting design guide, incl. 9% VAT" "EUR 25.00"
    fact "Paid, incl. VAT" "EUR 125.00"
  region "VAT in that total"
    action quiet "Show the VAT split"
    text muted "The customer sees one total. The books see both rates."
```

**Rationale:** The Apple store shows the inclusive price with the tax behind a note, because the customer reads one figure and the books read two. The note keeps the option clean while the breakdown stays one step away.

**Cost:** A breakdown behind a note is a breakdown a reader may never open, and finance opens it on every order it checks. What the return needs should not hide behind what the customer skims past.

**Reference:** Apple

### Numbers at phone width

**Question:** Alex Morgan checks the dispatch of the day from the warehouse floor on a phone. At 390 pixels a money column, a date column, and a state badge do not fit side by side. The page chooses what the number needs beside it.

**Default:** `kpis-in-pairs-with-the-orders-under-them`

**Compact:** At 390 pixels the figures pair two across with the latest records under them. Tables become record lists with one right-aligned amount per row. Statements keep their alignment with short labels, and charts halve their axis labels. The compact option is `kpis-in-pairs-with-the-orders-under-them`.

**Rationale:** Ship the two-column KPI pair with the record list under it. The figures of the day stay visible and every order keeps its amount right-aligned. The runner-up is the aligned statement. It is the better choice for finance pages where the adding up is the point.

Never ship the desktop table unchanged at 390: a table that scrolls sideways for its money column hides the answer.

#### `kpis-in-pairs-with-the-orders-under-them`: KPIs in pairs with the orders under them

```wireframe
page
  header
    heading "Saturday dispatch"
    text "Today, 08:00 to 18:00. Amsterdam warehouse."
  grid 4
    card "Picked"
      figure "9,412"
      text muted "of 10,000"
  region "Latest orders"
    list 3
      item: text "SO-1042" · text muted "Maria Garcia, 09:32" · text "EUR 125.00"
```

**Rationale:** The Shopify mobile dashboard pairs its KPIs two across. Four figures fit above the fold of a phone without shrinking to decoration. The orders under them keep one amount each, right-aligned, which is the column the list is about.

**Cost:** Two across at 390 pixels is 169 pixels a tile, so a long figure wraps or clips. Figures over ten characters need the single-column list, not the pair.

**Reference:** Shopify

#### `one-figure-per-row`: One figure per row

```wireframe
page
  header
    heading "September 2026"
    text "Every headline figure, one per row."
  region "Headline figures"
    fact "Income, 1,148 orders" "EUR 63,350.00"
    fact "Units sold, every product" "9,412"
    fact "Refunds, 31 units" "EUR 1,550.00"
  region "Net for Acme Supply"
    fact "Net, after refunds and fees" "EUR 61,346.68"
```

**Rationale:** The Revolut account lists one figure per row with its label on the left, because a phone column is one number wide. Every amount keeps its code and its decimals, which the paired tiles cannot promise.

**Cost:** One row per figure is six rows for six figures, so the page scrolls where the pairs fit. A reader comparing two figures holds one in memory while reading the other.

**Reference:** Revolut

#### `orders-as-records-with-amounts-right-aligned`: Orders as records with amounts right-aligned

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders, newest first."
  toolbar
    field "Order or customer" search
  region "Orders"
    list 4
      item: text "SO-1042, Maria Garcia" · text muted "Garcia Interiors restock, 8 Oct 09:32, Paid" · text "EUR 125.00"
```

**Rationale:** The ING mobile activity list keeps one amount per row, right-aligned in tabular figures, so the money column survives without a table. The state sits under the name, where it is read second.

**Cost:** No sorting by column and no comparison across a column, because there are no columns. A reader hunting one order they were told about is served. A reader auditing the day is not.

**Reference:** ING

#### `a-statement-that-keeps-its-alignment`: A statement that keeps its alignment

```wireframe
page
  breadcrumb "Home" "Reports"
  header
    heading "September 2026"
    text "Every euro of the month."
  region "Income"
    fact "Lamps" "EUR 54,180.00"
    fact "Service fees" "EUR 6,020.00"
    fact "Guides" "EUR 3,150.00"
    fact "Income" "EUR 63,350.00"
  region "Out"
    fact "Refunds" "EUR 1,550.00"
    fact "Fees" "EUR 453.32"
    fact "Out" "EUR 2,003.32"
  region "Net"
    fact "Net" "EUR 61,346.68"
```

**Rationale:** The Xero mobile profit and loss keeps the statement shape at phone width, because money that adds up has to add up everywhere. Short labels and tabular figures keep the alignment of the wide option.

**Cost:** Labels short enough for 390 pixels lose the counts the full lines carry. The statement adds up but no longer says what it adds, which the full labels do.

**Reference:** Xero

#### `a-chart-with-half-its-labels`: A chart with half its labels

```wireframe
page
  breadcrumb "Home" "Products"
  header
    heading "Oak desk lamp, sales"
    text "30 days to 8 October 2026."
  region "Units per day"
    figure "8,176"
    text muted "Peak 8 Oct, 488."
    image "Daily unit sales, bar chart, 9 September to 8 October 2026"
    text muted "Two labels at this width."
    link "Weekly table"
```

**Rationale:** The Plausible mobile chart halves its axis labels, because two true labels beat five overlapping ones. The total above the chart carries the figure. The chart carries the shape and nothing else.

**Cost:** Two labels cannot place a mid-month spike, so the shape floats between its endpoints. A reader who needs the week of a spike opens the table, which the chart must offer.

**Reference:** Plausible

#### `the-table-that-becomes-a-list`: The table that becomes a list

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders, newest first."
  toolbar
    field "Order or customer" search
  table 5 "Order" "Customer" "Placed" "State" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · text "8 Oct, 09:32" · status "Paid" positive · text "EUR 125.00"
```

```wireframe compact
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "268 orders, newest first."
  toolbar
    field "Order or customer" search
  list 3
    item: text "SO-1042, Maria Garcia" · text muted "8 Oct, 09:32, Paid" · text "EUR 125.00"
```

**Rationale:** The GitHub mobile web turns wide tables into stacked lists under 640 pixels. The same page serves both widths without a second route. The swap follows the viewport, not the device.

**Cost:** Two markups for one table need to stay in agreement. A screen reader meets the hidden one unless it is properly removed. The list carries every fact the table drops, including the plain ones.

**Reference:** GitHub

### Showing an identifier

**Question:** The rule is specific: an identifier shown on screen is labeled and copyable, and a raw code never reaches the screen. A serial page that shows SN-0C893968A2 as plain text, or a messages list showing identifiers where a subject should be, both break it.

**Default:** `a-code-monospaced-labeled-and-copyable`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Ship the labeled, monospaced, copyable code on the record. It is the shape of the rule and the one thing a support case needs quoted. The runner-up is the identifier as the record name. It is the better choice for records with no human name, such as a warehouse serial.

Never ship the page with no identifier: a record nobody can quote is a record support cannot help with.

#### `a-code-monospaced-labeled-and-copyable`: A code, monospaced, labeled and copyable

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia, Acme Supply."
    action primary "Message customer"
  region "Codes to quote"
    card "Order number"
      text "SO-1042"
      text muted "Quote it when you call about the order."
      action quiet "Copy"
    card "Bank reference"
      text "SH-88213"
      text muted "For a support case with the provider."
      action quiet "Copy"
    card "Serial numbers"
      text "SN-0C893968A2"
      text muted "2 lamps, neither registered."
      action quiet "Copy"
```

**Rationale:** The shared code shape: monospaced, never wrapped, with a copy control. A code a person reads aloud on a support call is a fact, not decoration.

**Cost:** A copy control on every row of a list is a control per row. And a code in a monospaced font is visibly different from a name, which is correct and slightly louder than the page around it.

#### `the-identifier-labeled-by-what-it-is-not-by-its-form`: The identifier labeled by what it is, not by its form

```wireframe
page
  breadcrumb "Home" "Reports" "Disputes" "D-0182"
  header
    heading "Dispute D-0182"
    status "Disputed" critical
    text "EUR 45.00 on order SO-1031. Opened 2 Oct 2026 by the provider."
    action primary "Answer the bank"
  region "What each code is"
    list 3
      item: text "Case number" · text muted "What the provider calls it" · text "D-0182" · action quiet "Copy"
```

**Rationale:** The label says Order number rather than Reference, because a reference could be anything. A reader who knows what a thing is can use it. A reader who does not can ask.

**Cost:** Some identifiers have no natural name and end up labeled by their kind, which tells a reader nothing about where to use it.

#### `the-identifier-behind-a-disclosure`: The identifier behind a disclosure

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia. Garcia Interiors restock."
    action primary "Message customer"
  region "The order"
    fact "Customer" "Maria Garcia"
    fact "Placed" "8 Oct 2026, 09:32"
    fact "Paid" "EUR 125.00"
    fact "Lamps" "2, neither registered"
  region "Details for a support case"
    action quiet "Show the bank reference and both serial numbers"
    text muted "Needed only when the provider asks about this payment."
```

**Rationale:** A code a reader usually does not need is hidden behind a disclosure. It is there for a support case and out of the way otherwise.

**Cost:** A hidden code is a code a reader does not know exists. On the record where a support case is likely, that is the wrong place to hide it.

#### `no-identifier-because-the-reader-knows-the-record`: No identifier, because the reader knows the record

```wireframe
page
  breadcrumb "Home" "Orders" "Maria Garcia, 8 October"
  header
    heading "Maria Garcia, 8 October"
    status "Paid" positive
    text "Garcia Interiors restock. EUR 125.00."
    action primary "Message her"
  region "What she bought"
    fact "Oak desk lamp, 2 lamps" "EUR 90.00"
    fact "Delivery fee" "EUR 10.00"
    fact "Lighting design guide" "EUR 25.00"
    fact "Paid by the customer" "EUR 125.00"
  region "Lamps"
    list 2
      item: text "Oak desk lamp" · text muted "Covers one lamp" · status "Not registered" neutral
    text muted "Nothing technical on this page."
```

**Rationale:** Nothing technical is shown. A reader who arrived by clicking the record already knows which record it is, and a code is noise to them.

**Cost:** It removes the one thing a reader needs to quote in a support conversation. And a reader who arrived by address, which happens, has no way to tell two records apart.

#### `the-identifier-as-the-record-s-name`: The identifier as the record's name

```wireframe
page
  breadcrumb "Home" "Products" "Serials" "SN-0C893968A2"
  header
    heading "SN-0C893968A2"
    status "Not registered" neutral
    text "One Oak desk lamp, sold on order SO-1042."
    action "Deactivate"
  region "The serial"
    fact "Covers" "One lamp"
    fact "Owner" "Maria Garcia"
    fact "Order" "SO-1042"
    fact "Issued" "8 Oct 2026, 09:34"
    fact "Registered" "Never"
  region "How it was used"
    timeline 2
      item: text "Assigned at packing" · text muted "8 Oct 2026, 09:34"
```

**Rationale:** Where a record has no human name, the identifier is the heading. The code is what the record is called and it is never repeated as a field.

**Cost:** A code as a heading is not readable aloud. It is the right shape for a system where the code is all there is. It is the wrong shape for one where a person named the thing.

#### `click-the-code-to-copy-it`: Click the code to copy it

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia. Garcia Interiors restock. Select a code to copy it."
  region "Codes"
    text muted "The bank reference was just copied. The confirmation lasts two seconds."
    list 3
      item: text "Order number" · action "SO-1042"
  toast "Bank reference SH-88213 copied." positive
```

**Rationale:** Vercel copies a deployment address on click and answers "Copied", so the identifier is its own control with no button beside it. The code stays monospaced and labeled, and the confirmation is the feedback the click needs.

**Cost:** There is no visible affordance until hover, so a reader may never try. Keyboard users need the code to be a real button, which it is, with its label read aloud.

**Reference:** Vercel

#### `a-short-code-on-the-list-the-full-one-on-the-record`: A short code on the list, the full one on the record

```wireframe
page
  breadcrumb "Home" "Reports" "Disputes"
  header
    heading "Disputes"
    text "5 open. Quote the full reference from the record."
  toolbar
    field "Case, order or charge" search
  region "Cases"
    table 5 "Case" "Order" "Charge" "Opened" "Held"
      item: text "D-0182" · text "SO-1031" · text "SH-88" · text "2 Oct 2026" · text "EUR 50.00"
    text muted "Two charges shorten to the same four characters. Open the record for the full reference."
  region "On the record"
    card "Charge it disputes"
      text "SH-88213-0042-9X"
      text muted "The card payment itself."
      action quiet "Copy"
```

**Rationale:** The Stripe dashboard shortens a charge identifier in the list and shows it whole on the record. A list is scanned and a record is quoted. Search accepts either form, so the short code is never a dead end.

**Cost:** Shortened identifiers can collide on screen, and a reader quoting the short form in a support case forces a second question. The record must show the full reference above the fold, not behind a disclosure.

**Reference:** Stripe

#### `no-bare-identifier-anywhere-on-a-list`: No bare identifier anywhere on a list

```wireframe
page
  breadcrumb "Home" "Customers" "Messages"
  header
    heading "Messages"
    text "Only the people who said yes to the kind."
    action primary "Write a message"
  toolbar
    field "Search messages" search
    field "Any state" select = "Any state"
  region "Messages"
    table 5 "Message" "Reference" "State" "Written" "Copy"
      item: text "No subject yet" · text "b9f0780e" · status "Draft" neutral · text "6 hours ago" · action quiet "Copy"
    text muted "A list shows subjects, never raw codes."
```

**Rationale:** Where a record has no subject yet, the state says so and the code is behind a copy control. A list shows subjects, never raw codes.

**Cost:** A draft with no subject reads as broken, and a subject is a thing the company has to write before the row is useful. That is the cost of not showing an identifier.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/patterns/money-time-density#show-the-currency-of-every-amount | guidance | Does every built screen of this kind keep this rule, including in its compact layout? |
| litespec/frontend/patterns/money-time-density#state-the-time-zone-of-a-shared-moment | guidance | Does every built screen of this kind keep this rule, including in its compact layout? |
| litespec/frontend/patterns/money-time-density#writing-an-amount | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/money-time-density#statement-that-adds-up | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/money-time-density#writing-a-moment | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/money-time-density#choosing-a-period | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/money-time-density#how-much-fits-before-it-breaks | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/money-time-density#counting-things | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/money-time-density#sales-over-time | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/money-time-density#sales-by-product-variant | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/money-time-density#sell-through-against-capacity | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/money-time-density#figure-against-an-earlier-period | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/money-time-density#when-the-money-arrives | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/money-time-density#vendors-invoice-to-the-company | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/money-time-density#two-vat-rates-on-one-page | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/money-time-density#numbers-at-phone-width | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/money-time-density#showing-an-identifier | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
