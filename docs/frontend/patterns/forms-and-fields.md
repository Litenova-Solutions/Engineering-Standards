# Form and Field Patterns

## Intent

A form collects values you enter to create or change a record. These patterns answer how each kind of field takes its value and how a form reports a refused submit or unsaved work. Each pattern offers drawn options and names a default.

## Standards

### Name every field with a visible label

**Requirement:** Every field MUST carry a visible label that names its value.

**Rationale:** A placeholder disappears as you type, so it cannot carry the name of the value. A screen reader reads the label. You returning to a filled form read it too.

### Keep entered values after a refused submit

**Requirement:** A form MUST keep every entered value when the API refuses a submit.

**Rationale:** A form that clears itself after a refusal makes you type everything again to fix one field. You then repair the field the message names and submit again.

## Patterns

### Money field

**Question:** The back office holds prices, fees, refunds, and settlement figures. The software chooses none of them. The field is where that rule meets a keyboard. The evidence says text input with an `inputmode`, the currency named in the label, and a symbol prefix that stays hidden from assistive reading.

**Default:** `text-input-currency-in-the-label-symbol-inside`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The HMRC prefix with the currency in the label stays the pick. It reads in both themes. It names the currency to a screen reader. It refuses nothing you can type.

The customer total restatement is the runner-up. It belongs on every price the customer sees. It stops the fee from surprising either side at checkout. Never ship the stepper. You cannot reach a continuous price by stepping.

#### `text-input-currency-in-the-label-symbol-inside`: Text input, currency in the label, symbol inside

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Pricing"
    text "What each unit costs, and what the customer pays on top."
  region "Standard tier"
    field "Standard unit price, in euros" number = "45.00"
    text muted "45,00 or 45.00. Up to two decimal places."
    field "Delivery fee customers pay, in euros" number = "5.00"
    text muted "Added at checkout. The company keeps this one."
```

**Rationale:** The HMRC pattern places an `aria-hidden` prefix inside the field. It names the currency in the label. A screen reader hears the currency even though it does not read the symbol. This is not a `number` input. GDS rejected the `number` type outright.

**Cost:** You can type the symbol into the field, so validation has to accept it rather than refuse it. Allow at most two decimal places, per the HMRC pattern.

**Reference:** HMRC

#### `currency-as-a-separate-select`: Currency as a separate select

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Pricing"
    text "What each unit costs."
  region "Standard tier"
    row
      field "Standard unit price" number = "45.00"
      field "Currency" select = "EUR"
    text muted "45,00 or 45.00. Up to two decimal places."
    row
      field "Delivery fee customers pay" number = "5.00"
      field "Currency" select = "EUR"
```

**Rationale:** The amount and the currency are two inputs, so a company selling in several currencies changes one select rather than retyping an amount.

**Cost:** No design system in this set publishes a currency select beside an amount, and the company invoices in one currency. A select for a closed set of one is a control that cannot do anything.

#### `amount-with-a-unit-suffix-for-a-count`: Amount with a unit suffix, for a count

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Pricing"
    text "What each unit costs."
  region "Standard tier"
    row
      field "Standard unit price" number = "45.00"
      text "per unit"
    row
      field "Delivery fee customers pay" number = "5.00"
      text "per order"
```

**Rationale:** The GOV.UK suffix pattern uses a word rather than a symbol. Per unit, per order, and per pallet read better than a symbol where the unit is not money.

**Cost:** The suffix takes horizontal room in a narrow field, and it cannot carry a currency. Money and a unit would need two suffixes, which no pattern here supports.

**Reference:** GOV.UK

#### `money-with-an-error-that-says-what-to-do`: Money with an error that says what to do

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Pricing"
    text "What each unit costs."
  region "Standard tier"
    field "Standard unit price, in euros" number = "45.000"
    message critical "Use at most two decimal places, like 45.00"
    field "Delivery fee customers pay, in euros" number = "45.00"
    text muted "Whole euros are fine here."
```

**Rationale:** The same field appears in its refused state. The message follows the GOV.UK template. It reads as a specific instruction rather than a rejection.

**Cost:** You cannot see the three states at once, so the text states which one the mock shows. Each mock here is one state.

**Reference:** GOV.UK

#### `amount-with-a-stepper`: Amount with a stepper

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Pricing"
    text "What each unit costs."
  region "Standard tier"
    row
      action quiet "One euro less"
      field "Standard unit price, in euros" number = "45.00"
      action quiet "One euro more"
    text muted "Steps of one euro."
```

**Rationale:** A plus and a minus sit on either side of the value. They cover the case where one amount is the common one. Small deviations are the exception.

**Cost:** NN/g and Carbon both warn against a stepper for a price. You cannot reach a continuous value by stepping. You cannot express an amount of 1.50 units. This is the wrong control for this field.

#### `money-as-a-read-only-fact-with-an-edit-command`: Money as a read-only fact with an edit command

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    action primary "Message customer"
  region "What was bought"
    fact "Oak desk lamp, 2 units" "EUR 90.00"
    fact "Delivery fee per order" "EUR 5.00"
    fact "Paid by the customer" "EUR 125.00"
    action "Change a priced line"
```

**Rationale:** Once a charge has been priced, the page shows it as a figure with one command to change it. You never retype the value, so a mistyped price cannot become a second record.

**Cost:** Editing moves to a second surface for a field you touch often. A charge already priced is a versioned fact rather than a field.

#### `price-with-the-customer-facing-total-restated`: Price with the customer-facing total restated

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Pricing"
    text "What each unit costs, and what the customer pays on top."
  region "Standard tier"
    field "Standard unit price, in euros" number = "45.00"
    text muted "45,00 or 45.00. Up to two decimal places."
    field "Delivery fee customers pay, in euros" number = "5.00"
    fact "Customer pays" "EUR 50.00"
```

**Rationale:** The money reads more clearly. You type what the unit costs and read what the customer pays on the same screen before saving. The EUR 50.00 all-in figure stops the fee from surprising either side at checkout.

**Cost:** The restated total must update as you type, which a static mock cannot show. It costs one line under every price field, even where the fee is zero.

#### `gross-price-with-the-net-and-tax-restated`: Gross price with the net and tax restated

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Pricing"
    text "What each unit costs, and what the customer pays on top."
  region "Standard tier"
    field "Price customers pay, in euros" number = "45.00"
    fact "Of which VAT at 21 percent" "EUR 7.81"
    fact "Net stays with Acme Supply" "EUR 37.19"
  region "Delivery fee"
    field "Fee customers pay per order, in euros" number = "5.00"
    fact "Of which VAT at 21 percent" "EUR 0.87"
```

**Rationale:** Stripe Dashboard restates every gross amount as net plus tax under the field. You price what the customer pays. You read what the company keeps.

**Cost:** The restated lines update as you type. The rates come from configuration keyed by date. A price from January restates with January rates. This costs two lines per field even where you never look twice.

**Reference:** Stripe

#### `preset-price-chips-for-the-common-price-points`: Preset price chips for the common price points

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Pricing"
    text "What each unit costs."
  region "Standard tier"
    row
      action "25.00"
      action "35.00"
      action primary "45.00"
      action "60.00"
      action quiet "Custom"
    field "Price customers pay, in euros" number = "45.00"
    fact "Customer pays with the delivery fee" "EUR 50.00"
```

**Rationale:** Square and Shopify POS put the common amounts one tap away. Most units land on a round price, and typing 45.00 ninety times a year is ninety chances to type 54.00. The field stays for the odd price.

**Cost:** The presets are company data that must be learned or configured, and a stale set pushes you toward last year's prices. Five chips plus a field is also wider than a field alone on a phone.

### Choosing a record

**Question:** You choose a reference to another record from a picker showing names. Nobody types an identifier. The failure to avoid is a select reading "Choose a warehouse" beside a field holding "WH-0C893968A2" as if it were a value to type.

**Default:** `searchable-picker-showing-names`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The searchable picker over names stays the pick: nobody types an identifier, and search beats scrolling for every list longer than a screen. The picker with one distinguishing fact per row is the runner-up for records that share a name. Never ship a bare identifier field: a code such as WH-0C893968A2 is not a value you can type or check.

#### `searchable-picker-showing-names`: Searchable picker showing names

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Start with a name."
  region "Where it leaves from"
    field "Where" search = "amster"
    list 3
      item: text "Amsterdam warehouse" · text muted "10,000"
    text muted "A warehouse carries its capacity and its docks."
    field "Name" text
```

**Rationale:** It searches over names and shows nothing else. Time zone research from NN/g is the reason it searches. In that research 44 percent of first searches were by city. Search beats scrolling every time.

**Cost:** A picker hides how many records exist. If you know the warehouse is in "Zaandam", you still have to search rather than scan. It needs an empty-result state that offers creating one.

#### `picker-with-the-record-s-facts-beside-its-name`: Picker with the record's facts beside its name

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Add a price tier"
    text "A price tier is what a customer picks and what the warehouse ships."
  region "Copy from"
    field "Copy from an existing tier" search
    list 3
      item: text "Standard" · text muted "9,412 sold, on sale"
    field "Name" text = "Trade"
```

**Rationale:** Each option carries the one fact that tells two similar records apart. Capacity suits a warehouse and date suits a delivery. State suits a price tier. You tell two depots both called Rotterdam apart by what they hold.

**Cost:** The list grows wider, and the extra column is only useful for records that share a name. For a record set where names are already unique it is noise.

#### `a-select-of-names`: A select of names

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Start with a name."
  region "Where it leaves from"
    field "Where" select = "Choose a warehouse"
    field "Name" text
```

**Rationale:** It is a plain select listing names. It has fewer moving parts than a picker, and it works with the keyboard with no extra setup.

**Cost:** The GOV.UK guidance says to reduce the option count before reaching for a select. Research finds selects hard to use. The guidance forbids pre-selecting an option. A 40-warehouse select is the case that guidance is about.

**Reference:** GOV.UK

#### `a-picker-whose-options-are-typed`: A picker whose options are typed

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Start with a name."
  region "Where it leaves from"
    field "Where" text = "rotter"
    list 3
      item: text "Rotterdam depot"
    text muted "Choose from the list. Nothing is picked until you do."
    field "Name" text
```

**Rationale:** You type part of a name and the list narrows, but you must choose from the list. APG warns that list autocomplete with automatic selection silently adopts the first suggestion, which stores the wrong record.

**Cost:** The field must not commit on blur or on Enter alone, or a mistyped prefix books the wrong warehouse. That is an implementation rule the mock cannot show.

**Reference:** APG

#### `a-read-only-reference-showing-what-is-linked`: A read-only reference showing what is linked

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Standard"
    status "On sale" positive
    action "Pause sales"
  region "What this tier belongs to"
    fact "Delivery" "Garcia Interiors restock"
    fact "Warehouse" "Amsterdam warehouse"
    fact "Channel" "Storefront"
    action "Change what is linked"
```

**Rationale:** On a record rather than a form, the page shows the relation as a fact. It carries a command to change it. You see what is linked without opening a picker.

**Cost:** Changing a relation takes two steps, and on a page with several relations it takes several such facts. It belongs on a record page, not on a create form.

#### `a-picker-that-also-creates`: A picker that also creates

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Start with a name."
  region "Where it leaves from"
    field "Where" text = "Zaandam"
    message critical "There is no warehouse called Zaandam."
    action primary "Create a warehouse called Zaandam"
    action "Choose from 8"
    field "Name" text
```

**Rationale:** The list ends with the command to make the missing record. If you need a new warehouse, you are never sent away. You make one and come back to the form.

**Cost:** The field opens a second surface, and a dialog must never open another dialog. Creating a warehouse has to be a page, which means losing the contents of the form.

#### `recent-records-above-the-search`: Recent records above the search

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Start with a name."
  region "Where it leaves from"
    field "Where" search
    text "Recent"
    list 2
      item: text "Amsterdam warehouse" · text muted "10,000"
    text "All warehouses"
    list 2
      item: text "Utrecht depot" · text muted "1,100"
```

**Rationale:** Linear opens every picker on the records you touched last. The warehouse for the next delivery is almost always the warehouse of the last one. Recent first turns the common case into one tap. It leaves search for the rest.

**Cost:** Recent is per person, so two people see two orders and a screenshot never matches twice. It also needs an empty state for the first delivery, where nothing is recent yet.

**Reference:** Linear

#### `results-grouped-by-state-with-counts`: Results grouped by state with counts

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Add a price tier"
    text "A price tier is what a customer picks and what the warehouse ships."
  region "Copy from"
    field "Copy from an existing tier" search
    text "On sale (2)"
    list 2
      item: text "Standard" · text muted "9,412 sold"
    text "Closed (1)"
    list 1
      item: text "Trade" · text muted "Sold out"
```

**Rationale:** GitHub command palette groups results under a heading with a count, so a list of thirty reads as three lists of ten. Grouping tiers by state keeps a closed tier from being copied by mistake.

**Cost:** The groups are one more opinion about the records. A group the picker invents has to stay in sync with the states the records hold. This costs a heading row per group on a phone.

**Reference:** GitHub

### Date and time field

**Question:** A common failure is the native date input of the browser. It draws as `dd/mm/yyyy` with a native picker icon. It is visibly not the application control. GDS rejected that input for browser implementation problems.

**Default:** `one-text-field-with-a-calendar-that-opens-beside-it`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** One typed field with a calendar beside it stays the pick. There is always a way to type. The calendar serves you when you would rather click.

The three GDS inputs are the runner-up where accessibility review demands them. They cost the slowest entry in the form. Never ship the native date input. It draws the browser chrome instead of the application control. It renders differently everywhere.

#### `three-text-inputs-with-a-format-hint`: Three text inputs with a format hint

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Start with a name."
  region "When it runs"
    row
      field "Day" number = "14"
      field "Month" number = "3"
      field "Year" number = "2026"
    text muted "For example, 14 3 2026"
    row
      field "Loading hour" number = "08"
      field "Loading minute" number = "00"
    text muted "In the Europe/Amsterdam time zone."
```

**Rationale:** The GOV.UK answer to a date uses three fields. It uses numeric `inputmode` and `autocomplete` tokens. The hint reads "For example, 31 3 1980". Every browser renders it the same.

**Cost:** Three fields hold one value, and if you enter 94 dates a year you type 282 numbers. This is the most accessible answer and the slowest one.

**Reference:** GOV.UK

#### `one-text-field-with-a-calendar-that-opens-beside-it`: One text field with a calendar that opens beside it

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Start with a name."
  region "When it runs"
    field "Loading starts" date = "14/03/2026 08:00"
    text "March 2026"
    grid 31
      item: text "14"
    text muted "Times are in the Europe/Amsterdam time zone."
    field "Leaves the dock" text = "14/03/2026 12:00"
```

**Rationale:** You type into one field, with a calendar beside it if you would rather click. The APG `combobox` date picker pattern is exactly this. The Carbon rule is that there must always be a way to type.

**Cost:** A calendar is a grid of 42 cells to build, translate, and test in two languages. It is the most code in the form package for one field.

**Reference:** APG

#### `date-and-time-on-one-row-the-time-zone-named-once`: Date and time on one row, the time zone named once

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Start with a name. All times are Europe/Amsterdam."
  region "When it runs"
    row
      field "Loading date" date = "14/03/2026"
      field "Loading time" text = "08:00"
    row
      field "Dock date" date = "14/03/2026"
      field "Dock time" text = "12:00"
    message critical "The end must be after loading starts."
```

**Rationale:** Date and time sit side by side as two fields, with the time zone stated once above them rather than repeated under each. That means fewer repetitions of the same fact.

**Cost:** On a narrow screen two fields plus the row wraps to three lines. You have to read a time zone that is stated once before the second field. It does not sit next to that field.

#### `relative-dates-for-the-near-future-absolute-for-the-far`: Relative dates for the near future, absolute for the far

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock"
  header
    heading "Add to the dispatch plan"
    text "Entries are sorted by their start time."
  region "The entry"
    field "What" text = "Load pallets"
    field "When" select = "Relative to dispatch"
    field "How long before" number = "4"
    text "Dispatch is at 08:00 on Sat 14 Mar 2026, so this is 04:00."
```

**Rationale:** A dispatch plan is written in relative language: "dispatch at 08:00", "loading 4 hours before". One field takes a duration and the page calculates the clock time from the delivery date.

**Cost:** The page derives an absolute time and shows it. You would otherwise hold it in your head. A relative field cannot express dispatch at 08:00 unless the driver is late.

#### `a-duration-field-for-a-length-of-time`: A duration field for a length of time

```wireframe
page
  breadcrumb "Home" "Settings" "Payments"
  header
    heading "Checkout hold"
    text "How long a customer has to pay before the reserved stock goes back on sale."
  region "The hold"
    row
      field "Hold the stock for" number = "15"
      field "Unit" select = "minutes"
    text muted "Past 30 minutes, more people walk away at the payment step."
    field "Email the customer before the hold ends" select = "10 minutes before"
```

**Rationale:** For loading, a timeout or a hold, you know four hours, not 04:00. One field takes the number and a unit sits beside it. The NN/g rule says the step and the unit stay explicit.

**Cost:** Two fields do the work where one number would do, and they cannot express "2h30". A single field parsing both needs error wording for every way a duration can be wrong.

#### `the-date-refused-with-the-date-that-was-wrong`: The date refused, with the date that was wrong

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Start with a name."
  region "When it runs"
    field "Loading starts" date = "14/03/2026 26:00"
    message critical "Loading starts must be a time between 00:00 and 23:59. You entered 26:00."
    field "Leaves the dock" date = "14/03/2026 08:00"
    message critical "Leaving the dock must be after loading starts. You entered 08:00."
```

**Rationale:** The same field appears refused, with the GOV.UK error wording. It names the field and says what to do. It says what was entered and what is wrong. You do not have to remember what you typed.

**Cost:** The message repeats the value, which makes it longer than the field. The message fits above the input, not inside it.

**Reference:** GOV.UK

#### `preset-chips-for-the-usual-dispatch-times`: Preset chips for the usual dispatch times

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Start with a name. All times are Europe/Amsterdam."
  region "When it runs"
    row
      action "Fri 08:00"
      action primary "Sat 08:00"
      action quiet "Custom"
    field "Loading starts" date = "14/03/2026 08:00"
    field "Leaves the dock" text = "14/03/2026 12:00"
```

**Rationale:** Calendly puts the usual lengths above a custom field because most meetings are thirty minutes. Dispatch times cluster the same way around 08:00. Two presets plus Custom covers the week without typing.

**Cost:** The presets are company data that goes stale when the season changes. A preset that names a date needs a new value every week. A stale chip offers last month mornings.

**Reference:** Calendly

#### `start-and-end-as-one-range-with-a-length-readout`: Start and end as one range with a length readout

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Start with a name. All times are Europe/Amsterdam."
  region "When it runs"
    row
      field "Shift start" date = "14/03/2026 22:00"
      field "Shift end" date = "15/03/2026 06:00"
    fact "Length of the shift" "8 hours"
```

**Rationale:** Airbnb and Linear ask for a range as one control with the length read back. A start without an end is not a value the page can use. The readout catches the overnight mistake before the submit does.

**Cost:** Two values in one field need one error message that names both, and a screen reader meets a composite where it expected a field. Wire the labels with care.

**Reference:** Airbnb

### Text field and its states

**Question:** Every text field has to draw seven states. GOV.UK is blunt about two of them. The label is always visible and above the input. A placeholder is never the label because it vanishes on the first keystroke.

**Default:** `label-above-help-under-six-states-on-one-page`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The six-state reference page stays the pick, because it is the only option that pins every state one field must draw. Inline validation that confirms a good value is the runner-up for create forms, where it saves a refused submit. Never ship the placeholder as the label: it vanishes on first keystroke, and its color misses contrast.

#### `label-above-help-under-six-states-on-one-page`: Label above, help under, six states on one page

```wireframe
page
  breadcrumb "Home" "Settings" "Field states"
  header
    heading "Field states"
    text "Every state one text field has to draw."
  region "The states"
    field "Empty" text
    field "Filled" text = "Garcia Interiors restock"
    field "With help" text = "Garcia Interiors restock"
    text muted "Customers see this on the storefront and on their invoice."
    field "Refused" text = "Spring restock"
    message critical "A delivery is already scheduled as Spring restock."
    field "Read only" text = "SO-1042-01"
    text muted "Issued by the system when the line was made."
```

**Rationale:** The component reference page for the field: default, filled, focused, error, disabled, and readonly. Showing them together is how you check one control rather than six screenshots.

**Cost:** Six instances of one field is a style guide, not a screen. It never appears in the product. It exists so the states cannot drift apart.

#### `label-above-placeholder-as-a-hint`: Label above, placeholder as a hint

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Add a price tier"
  region "The tier"
    field "Name" text = "Trade"
    text muted "Customers see this on the storefront and on their invoice."
    field "What it includes" textarea
    field "Internal note" textarea
    text muted "Not shown to customers or to the warehouse."
```

**Rationale:** The label names the field and the placeholder shows an example. Both are present. That is the GOV.UK recommendation once a hint is genuinely needed.

**Cost:** A form field carries two sets of words, so a form with five fields carries ten lines before the first value. The hint has to earn its place every time.

**Reference:** GOV.UK

#### `placeholder-as-the-label`: Placeholder as the label

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Orders"
    text "Every paid order, newest first."
  toolbar
  table 3 "Order" "Customer" "Paid"
    item: text "SO-1042" · text "Maria Garcia" · text "EUR 125.00"
```

**Rationale:** The search field has no label. The only description of what the search covers is a placeholder reading "Order number, name or email".

**Cost:** It fails the GOV.UK guidance on three counts at once. It vanishes on first keystroke. Not every screen reader reads it. Its default color often misses `1.4.3` contrast.

**Reference:** GOV.UK

#### `character-count-under-a-long-answer-field`: Character count under a long-answer field

```wireframe
page
  breadcrumb "Home" "Settings" "Policies"
  header
    heading "Return policy"
    text "Customers read this at checkout, before they pay."
    action primary "Save"
  region "The policy"
    field "Policy" textarea = "Goods can be returned within 30 days of delivery."
    text muted "148 characters of 1,500"
```

**Rationale:** Where a field has a hard limit, the remaining count sits under it. GOV.UK says count characters only where its own research shows it helps.

**Cost:** The GOV.UK validation guidance permits live counting only as its own exception. It validates before the field is finished, which is precisely why it needs the exception. On a policy text it is worth it. On a name it is not.

**Reference:** GOV.UK

#### `a-textarea-with-the-customer-s-words-preserved`: A textarea with the customer's words preserved

```wireframe
page
  breadcrumb "Home" "Settings" "Policies"
  header
    heading "Return policy"
    text "Customers read this at checkout, before they pay."
    action primary "Save"
  region "Preview at checkout"
    text "Goods can be returned within 30 days of delivery if they are unused and in their packaging."
    text "After that, store credit against a future order instead."
    text muted "This is how it appears to a customer, with the line breaks kept."
```

**Rationale:** The page shows long answers with the line breaks you entered. A policy pasted from a document keeps its paragraphs instead of reflowing into one block.

**Cost:** Uncontrolled line breaks in stored text are a rendering hazard on a customer page. The width there differs from the width of the editor. Normalize it somewhere.

#### `a-field-that-grows-as-the-answer-does`: A field that grows as the answer does

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock"
  header
    heading "Record an incident"
    text "What happened at the dock, in your words."
  region "The incident"
    field "What happened" textarea
    field "Where it happened" select = "Main dock"
    field "Who decided" text
  footer
    action "Cancel"
    action primary "Record it"
```

**Rationale:** The `textarea` expands with its content up to a limit, so an incident report is not a 74-pixel window with a scrollbar inside it.

**Cost:** A growing field pushes everything below it down as you type, which moves the button you are about to press. Most implementations stop growing at about six lines.

#### `inline-confirmation-of-a-good-value`: Inline confirmation of a good value

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Add a price tier"
    text "Checked as you type, so a good value is confirmed before the submit."
  region "The tier"
    field "Name" text = "Standard"
    message positive "Standard is free on Oak desk lamp."
    field "What it includes" textarea
  footer
    action "Cancel"
    action primary "Add the tier"
```

**Rationale:** Stripe Checkout and Vercel confirm a valid value where you typed it. A tick and a quiet line mark it, instead of waiting for the submit. Confirming Standard early saves you a round trip for the name you wanted.

**Cost:** GOV.UK permits live validation only as a narrow exception, because it judges a field before it is finished. The check must wait for a pause in typing, or it nags.

**Reference:** Stripe

#### `floating-labels-that-shrink-when-filled`: Floating labels that shrink when filled

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Add a price tier"
    text "Two fields drawn the Material way, for comparison."
  region "The tier"
    field "Name" text
    text muted "Empty: the label sits where the value will go."
    field "Name" text = "Standard"
    text muted "Filled: the label shrinks above the value and stays visible."
  footer
    action "Cancel"
    action primary "Add the tier"
```

**Rationale:** Material Design answers the placeholder problem by floating the label above the value once the field fills, so the label never vanishes. It keeps the compact look the placeholder promised without breaking it.

**Cost:** The empty state still reads as a placeholder, with its small text and low contrast. A floated label at 10.5 px is smaller than any label the back office otherwise draws. The GOV.UK guidance keeps the label above and full size for that reason.

**Reference:** Material Design

### Choosing one of a few options

**Question:** You choose from a closed set. The GOV.UK rules say a select is a last resort. Radios beat a select. Nothing is pre-selected in a question, though settings allow it. The naming field below is a radio list with three well-worded options.

**Default:** `a-radio-list-with-a-description-per-option`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The radio list with a description per option stays the pick. Each choice carries the sentence that lets you choose between names that sound alike. The segmented control is the runner-up for two or three short values with no descriptions.

Never ship the native `multi-select`. GOV.UK rules it out for its usability and assistive record. A checkbox list replaces it.

#### `a-radio-list-with-a-description-per-option`: A radio list with a description per option

```wireframe
page
  breadcrumb "Home" "Orders" "Delivery notes"
  header
    heading "Delivery note naming"
    text "The driver shows the name at the dock."
    action primary "Save"
  region "Naming rule"
    field "No name" radio
    text "A parcel is handed to whoever signs for it."
    field "The customer name" radio
    text "The customer name is on the note."
    field "Every recipient named" radio
    text "The customer names each recipient before dispatch."
```

**Rationale:** Each option carries a sentence saying what it means for the customer. That sentence is the only way you can choose between "The customer name" and "Every recipient named".

**Cost:** Three options at 22 pixels each is a tall block, and it does not scale to twelve options, which a permission picker does need.

#### `a-segmented-control-for-two-or-three`: A segmented control for two or three

```wireframe
page
  breadcrumb "Home" "Products" "New product"
  header
    heading "New product"
    text "Start with a name, or start from a template."
  region "Start from"
    row
      action primary "A blank product"
      action "A template"
    field "Name" text
    field "Warehouse" select = "Choose a warehouse"
```

**Rationale:** The choice is between two or three values that are all visible at once. A segmented control shows every option. It hides none of them behind a menu.

**Cost:** Labels have to fit, so "A blank product" and "A template" are both shortened. The control grows with its longest label.

#### `plan-cards-for-a-priced-choice`: Plan cards for a priced choice

```wireframe
page
  breadcrumb "Home" "Settings" "Plan"
  header
    heading "What the plan costs"
    text "The company is on Business. Changing plan takes effect from the next month."
  region "The plans"
    card "Starter"
      figure "EUR 0 a month"
      text "Up to 100 orders a month. No storefront of your own."
    card "Business"
      figure "EUR 49 a month"
      text "Everything, including your own storefront."
    card "Enterprise"
      figure "EUR 249 a month"
      text "Ten warehouses at once and four locations each."
  footer
    action "Cancel"
    action primary "Change to this plan"
```

**Rationale:** For a choice between priced options, each card names the option, its price, and its period. The one the company holds says so in words. It does not rely only on a ring.

**Cost:** Cards are boxes, and the layout contract says a Section is the only box and never nests. Three plan cards inside a section break that rule three times.

#### `cards-with-a-radio-inside-each`: Cards with a radio inside each

```wireframe
page
  breadcrumb "Home" "Settings" "Plan"
  header
    heading "What the plan costs"
    text "The company is on Business."
  region "The plans"
    card "Starter"
      field "Starter" radio
      figure "EUR 0 a month"
      text "Up to 100 orders a month."
    card "Business"
      field "Business" radio
      figure "EUR 49 a month"
      text "Everything, including your own storefront."
    card "Enterprise"
      field "Enterprise" radio
      figure "EUR 249 a month"
      text "Ten warehouses at once and four locations each."
  footer
    action "Cancel"
    action primary "Change plan"
```

**Rationale:** The plan cards carry the choice in a real radio. The tab order and the arrow keys work as a form control. They do not work as a set of buttons.

**Cost:** One card holds two nested controls. The whole card has to forward the click to the radio, and the radio still has to be reachable by Tab.

#### `a-select-in-a-settings-page-where-nothing-is-pre-selected`: A select, in a settings page where nothing is pre-selected

```wireframe
page
  breadcrumb "Home" "Settings" "General"
  header
    heading "General"
    text "What Acme Supply is and where it works."
    action primary "Save"
  region "Locale"
    field "Time zone" select = "Choose a time zone"
    text muted "Every date and time on every page is written in this zone."
    field "Default currency" select = "Choose a currency"
    text muted "The currency amounts are entered in. Every price uses it."
```

**Rationale:** GOV.UK allows a pre-selection in settings and nowhere else. Where the value has no default and the options are many, a select with a real empty first option is the least-bad shape.

**Cost:** The empty option is a placeholder, and the layout contract says not to show one. A select whose first choice is a blank that must be replaced is two states, not one.

**Reference:** GOV.UK

#### `a-multi-select-as-a-list-of-checkboxes`: A multi-select as a list of checkboxes

```wireframe
page
  breadcrumb "Home" "Settings" "Team"
  header
    heading "New role"
    text "What this role may do."
    action primary "Create the role"
  region "The role"
    field "Name" text = "Warehouse"
    text "Orders"
    field "Look at any order" checkbox
    field "Refund an order" checkbox
    field "Book a pickup" checkbox
    field "Record a refusal" checkbox
    text muted "7 actions across 2 areas."
```

**Rationale:** GOV.UK states it directly: do not use `select multiple`, because of its history of poor usability and assistive support. Use checkboxes in a list, or a dedicated picker where the options are many.

**Cost:** Twenty checkboxes is a wall. Above about eight, the picker needs a search and a summary of what is chosen, which is a component rather than a field.

**Reference:** GOV.UK

#### `a-listbox-with-a-checkmark-and-descriptions`: A listbox with a checkmark and descriptions

```wireframe
page
  breadcrumb "Home" "Orders" "Delivery notes"
  header
    heading "Delivery note naming"
    text "The driver shows the name at the dock."
  region "Naming rule"
    field "Who is named on the note" select = "No name"
    text muted "Applies to deliveries not yet dispatched."
  popover
    list 3
      item: text "No name" · text muted "A parcel is handed to whoever signs for it."
```

**Rationale:** Apple HIG and Radix UI draw a choice with descriptions as a `listbox`. One button shows the current value. A checkmark marks it in the list. It includes full keyboard support. It carries the same sentences as the radio list in the height of one field.

**Cost:** The options hide behind a button, so you compare them only by opening the list. A radio list shows all three at once. This one shows one and promises two more.

**Reference:** Apple HIG

#### `a-binary-question-as-two-plain-buttons`: A binary question as two plain buttons

```wireframe
page
  breadcrumb "Home" "Settings" "Checkout"
  header
    heading "Checkout"
    text "What customers meet before they pay."
  region "Customer accounts"
    row
      card "No, sign-in stays optional"
      card "Yes, account required"
    text muted "Buying without an account is the default."
  footer
    action primary "Save"
```

**Rationale:** Typeform asks a yes-or-no question as two large buttons with the consequence under each, because a binary choice deserves no menu and no dropdown. Both answers stay visible with their cost attached.

**Cost:** Two cards for one bit is the heaviest binary control on this page, and it answers only questions with two honest answers. A third option or a conditional follow-up breaks the shape.

**Reference:** Typeform

### Switch or a checkbox

**Question:** The storefront editor holds a toggle for the platform credit line. A back office holds many settings where a switch fits. This item is about which control the setting deserves. It is also about what the label has to say.

**Default:** `a-switch-with-the-label-and-its-consequence`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The switch with its consequence stated stays the pick. The label says what is on. The line under it says what turning it off does.

The instant-apply switch with an undo toast is the runner-up for low-risk settings you flip often. Never ship a switch whose label names the control instead of the outcome. You need no documentation to learn what on means.

#### `a-switch-with-the-label-and-its-consequence`: A switch with the label and its consequence

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "What customers see when they buy from the company."
  region "Checkout"
    field "Show the Powered by line" toggle
    text "The line under the storefront that credits the platform."
    field "Let customers buy without an account" toggle
    text "They can still sign in afterwards to reach their own orders."
    field "Take a delivery fee" toggle
    text "The company keeps this one. EUR 5.00 per order."
```

**Rationale:** The label says what is on and the line under it says what turning it off does, so the choice is reversible and stated.

**Cost:** A switch has no pressed state on first paint, so you cannot tell what is currently on without looking twice. It carries no visible text.

#### `a-checkbox-where-the-off-state-is-the-default`: A checkbox where the off state is the default

```wireframe
page
  breadcrumb "Home" "Settings" "Email"
  header
    heading "Email"
    text "What Acme Supply sends, and what it promises."
    action primary "Save"
  region "Messages"
    field "Email a customer when their goods are dispatched" checkbox
    text "Carries the tracking number. This is the message a customer looks for."
    field "Email a customer the day before the delivery" checkbox
    text "Sent at 18:00 in the delivery time zone."
    field "Put the company name on every message" checkbox
    text "Acme Supply, with its address and telephone number, as the law requires."
```

**Rationale:** Use a checkbox rather than a switch, because the default is off and the action is to tick something. The GOV.UK wording phrases it as what ticking does. It does not phrase it as what the box is.

**Cost:** A checkbox and a switch look nearly identical here, and readers conflate them. The phrasing of the label has to carry the difference.

**Reference:** GOV.UK

#### `a-checkbox-with-the-consequence-under-it-no-state-carried`: A checkbox with the consequence under it, no state carried

```wireframe
page
  breadcrumb "Home" "Settings" "Payments"
  header
    heading "Payments"
    text "How money reaches the company bank account."
    action primary "Save"
  region "The connected account"
    fact "The payment provider" "NL91 ABNA 0417 1643"
    divider
    field "Settle twice a month" checkbox
    text "On the 4th and the 19th, with the money from three days before."
    field "Settle once a month" checkbox
    text "On the 4th, with everything from the previous month."
```

**Rationale:** Every setting is a checkbox with a consequence line. One control for the whole page, so nothing about the shape depends on whether the value happens to be on.

**Cost:** You cannot see at a glance which are on without reading the boxes. On a settings page with eight such settings that matters.

#### `two-options-where-the-difference-is-the-money`: Two options where the difference is the money

```wireframe
page
  breadcrumb "Home" "Invoices" "Settlement"
  header
    heading "How often the money arrives"
    text "The payment provider pays into NL91 ABNA 0417 1643."
  region "Frequency"
    card "Twice a month"
      field "Twice a month" radio
      figure "EUR 28,510 on average"
      text "On the 4th and the 19th, three days behind."
    card "Once a month"
      field "Once a month" radio
      figure "EUR 57,020 on average"
      text "On the 4th, everything from the previous month."
  footer
    action "Cancel"
    action primary "Change to monthly"
```

**Rationale:** Settlement frequency is a choice between two money outcomes. It gets radio cards with the amount and the date on each. No switch hides the difference.

**Cost:** Cards for a two-way choice are heavy, and the amounts are derived figures that have to be computed per company to stay honest.

#### `a-switch-that-is-refused-with-the-reason`: A switch that is refused, with the reason

```wireframe
page
  breadcrumb "Home" "Settings" "Payments"
  header
    heading "Payments"
    text "How money reaches the company bank account."
  region "The connected account"
    action disabled "Switch to a different bank account"
    message critical "The owner role can do this. Your role is finance."
  region "Where it pays"
    fact "The payment provider" "NL91 ABNA 0417 1643"
```

**Rationale:** The setting is one the role cannot change: switched off and refused, with the reason in visible text. This is the explained-action pattern applied to a control rather than a button.

**Cost:** A disabled switch with no value is a dead pixel if you do not notice the reason. The reason has to sit directly under it, not at the foot of the section.

#### `a-switch-with-the-number-it-would-change`: A switch with the number it would change

```wireframe
page
  breadcrumb "Home" "Settings" "Checkout"
  header
    heading "Delivery fee"
    text "What the customer pays on top of the goods. The company keeps all of it."
  region "The fee"
    field "Per order, in euros" number = "5.00"
    divider
    field "Waive the fee for trade accounts" toggle
    text "Trade accounts only. Last month that would have been EUR 310.00 across 62 orders."
    field "Show the fee as part of the price" toggle
    text "Advertise EUR 50.00 instead of EUR 45.00."
```

**Rationale:** Where flipping the setting changes an amount, the amount is on the same line. You read the consequence before flipping rather than after.

**Cost:** A derived figure beside a control has to be current, which means a read that the switch itself depends on. It also puts a number on a page that was otherwise free of them.

#### `instant-apply-with-an-undo-toast`: Instant apply with an undo toast

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "What customers see when they buy from the company. Changes apply at once."
  region "Checkout"
    field "Waive the fee for trade accounts" toggle
    text "Trade accounts only. Last month that would have been EUR 310.00 across 62 orders."
    field "Let customers buy without an account" toggle
    text "They can still sign in afterwards to reach their own orders."
    field "Show the Powered by line" toggle
    text "The line under the storefront that credits the platform."
  toast positive "Delivery fee waived for trade accounts."
```

**Rationale:** Linear and Google Material apply a low-risk switch at once. They offer Undo in a toast, so there is no Save to forget and no dialog to dismiss. The toast names what changed, which a silent apply never does.

**Cost:** Every flip is an audited command the moment it happens, with no review step before it. It fits display settings. It does not fit money, access, or anything a toast cannot undo.

**Reference:** Linear

#### `a-three-way-choice-as-a-segmented-control`: A three-way choice as a segmented control

```wireframe
page
  breadcrumb "Home" "Settings" "Email"
  header
    heading "Email"
    text "What Acme Supply sends, and what it promises."
  region "Refund mail"
    row
      action primary "Every refund"
      action "Only bank refusals"
      action "Never"
    field "Copy to" text = "Priya Shah"
    text muted "A person on the team. Not the customer."
  footer
    action primary "Save"
```

**Rationale:** Slack draws a three-way notification choice as a segmented control, because the values are short, ordered, and all worth seeing at once. No menu hides the middle option you want.

**Cost:** Three labels have to fit the control, so the wording shortens until it almost stops meaning anything. A fourth option or a per-option description breaks the shape back into radios.

**Reference:** Slack

### Upload field

**Question:** How does an Acme Supply record take a file. A logo needs a stated type and size. A customer import needs stated columns and row-level refusals.

**Default:** `a-drop-zone-that-states-what-it-accepts`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the drop zone that states its types and size limit. Nobody learns the limit by being refused. The per-file progress tray is the runner-up for imports of several files, where one bar per file beats one bar for all. Never ship a CSV upload with no stated columns: a file refused for a format nobody stated is a refusal the application caused.

#### `a-drop-zone-that-states-what-it-accepts`: A drop zone that states what it accepts

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The logo and banner customers see."
  region "Brand"
    field "Drop a logo here or choose a file" file
    text "A square image of at most 2 MB. JPEG, PNG or WebP."
    field "Logo description" text
    field "Drop a banner here or choose a file" file
    text "A wide image across the top. 1600 by 700 pixels reads best."
    field "Banner description" text
```

**Rationale:** The zone states the accepted types and the size limit in a sentence under it, so nobody discovers the limit by being refused.

**Cost:** A drop zone invites a click anywhere, and if you drop a file on the page outside the zone you get nothing at all. No affordance says where the zone is.

#### `the-file-already-chosen-with-what-it-will-do`: The file already chosen, with what it will do

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The logo and banner customers see."
    action primary "Save"
  region "Brand"
    fact "Logo" "acme-supply-logo.png"
    text "512 by 512. 84 KB. Chosen now."
    action "Replace"
    action quiet "Remove the logo"
    field "Logo description" text = "A green square with a white lamp"
    message info "Saving replaces the logo customers see now. It reaches the customer screen within a minute."
```

**Rationale:** After the choice, the row carries the file, its size, and the consequence of saving. The old logo is replaced and customers see the new one within a minute.

**Cost:** A file that has been uploaded but not saved is a resource that exists and is not referenced. It needs cleanup, or the storage fills with orphans.

#### `a-csv-upload-that-states-its-columns-first`: A CSV upload that states its columns first

```wireframe
page
  breadcrumb "Home" "Settings" "Data imports"
  header
    heading "Import customers"
    text "Bring in a list already held. Nothing is sent anywhere until the result is checked."
  region "The file"
    text "The file needs four columns."
    text "email, first_name, last_name, company. The header row names them. Order does not matter."
    link "Download a template"
    field "Drop a CSV here or choose a file" file
    text "Up to 5 MB, 2,000 rows. UTF-8, comma separated."
  footer
    action "Cancel"
    action primary "Check the file"
```

**Rationale:** For an import, the field states what it needs before anything is uploaded: the four column names and a link to a template. The upload cannot be wrong about a format nobody told it.

**Cost:** Stating four columns above the zone is a paragraph of prose, and the layout contract keeps prose out of components. It belongs on the page beside the field, not inside it.

#### `the-upload-refused-naming-the-row-that-failed`: The upload refused, naming the row that failed

```wireframe
page
  breadcrumb "Home" "Settings" "Data imports"
  header
    heading "Import customers"
  region "The file"
    message critical "1,988 of 2,000 rows can be imported. Row 412 has no email address."
    table 2 "Row" "What is wrong" "What was in the file"
      item: text "412" · text "No email address" · text muted "Ada Kowalski"
  footer
    action "Choose a different file"
    action primary "Import the 1,988 good rows"
```

**Rationale:** The file is refused for a reason you can act on: row 412 has no email. A refusal that names a row is worth more than one that says "invalid file".

**Cost:** Naming one row out of 2,000 needs a read of the whole file before answering. The upload is not instant, and you wait without knowing why.

#### `an-image-field-with-the-dimensions-stated`: An image field with the dimensions stated

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
  region "Banner"
    field "Drop a banner here or choose a file" file
    text "1600 by 700 pixels. At most 2 MB. JPEG, PNG or WebP."
    message caution "That banner is 1200 by 900. It will be cropped to 1600 by 700."
    field "Crop it anyway" checkbox
    text muted "The top 200 pixels are cut."
  footer
    action "Cancel"
    action primary "Save banner"
```

**Rationale:** For a picture that must be a particular shape, the dimensions are part of the requirement, not a nicety. The field says 1600 by 700 pixels reads best and refuses a wrong shape.

**Cost:** The layout contract says the layout decides a stored image box, not the dimensions of the image. A field that demands a ratio re-decides that per field.

#### `an-import-that-reports-what-it-made`: An import that reports what it made

```wireframe
page
  breadcrumb "Home" "Settings" "Data imports" "IMP-4F82C1A9"
  header
    heading "1,988 customers imported"
    text "Finished 8 Oct 2026, 14:22. Nothing has been charged to anybody."
  region "The import"
    fact "Rows in the file" "2,000"
    fact "Customers created" "1,988"
    fact "Welcome mails queued" "2,361"
    fact "Rows refused" "12"
    fact "Amount charged to anybody" "EUR 0.00"
  footer
    action "Undo this import"
    action primary "Open the list"
```

**Rationale:** After an import, the page says what happened: how many rows became what, how many were refused, and why. You can undo it while nothing has been paid out.

**Cost:** A real import is a command whose effect spans many records, which the architecture reserves for a named exception. The report has to be a real read, not a summary of the session.

#### `one-progress-row-per-file`: One progress row per file

```wireframe
page
  breadcrumb "Home" "Settings" "Data imports"
  header
    heading "Import customers"
    text "Bring in a list already held. Nothing is sent anywhere until the result is checked."
  region "Files"
    list 2
      item: text "customers-2026-10.csv" · text muted "1,240 of 2,000 rows read" · action "Cancel"
    text "acme-supply-logo.png is ready."
    field "Drop another file here or choose one" file
    text "CSV up to 5 MB, or an image up to 2 MB."
  footer
    action "Cancel"
    action primary "Check the files"
```

**Rationale:** Dropbox and Google Drive report each file on its own row with its own bar and its own cancel, because two files never finish together. One bar for all would lie about both.

**Cost:** A row per file is a list the page must manage: cancel one, remove one, and retry one. For a single logo it is heavier than the one zone it replaces.

**Reference:** Dropbox

#### `drop-anywhere-on-the-section`: Drop anywhere on the section

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The logo and banner customers see."
  region "Logo"
    field "Drop the logo anywhere in this box" file
    text "A square image of at most 2 MB. JPEG, PNG or WebP."
    field "Logo description" text = "A green square with a white lamp"
  region "Banner"
    field "Drop a banner here or choose a file" file
    text "A wide image across the top. 1600 by 700 pixels reads best."
```

**Rationale:** GitHub and Notion take a drop anywhere on the editing surface. The target highlights while the file hovers, so you never aim at a small box.

**Cost:** A page that accepts drops everywhere must also refuse them precisely: a CSV over the logo box needs a refusal, not a silent nothing. Every surface needs its own accepted list.

**Reference:** GitHub

### Reporting a refused submit

**Question:** How does a form report a refused submit. GOV.UK asks for a summary with focus and links, plus a message on each field. WCAG 3.3.1 and 3.3.3 sit underneath.

**Default:** `a-summary-above-the-form-plus-a-message-on-each-field`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the GOV.UK summary with focus, plus per-field messages. It meets WCAG 3.3.1 and 3.3.3, and the links carry you to each field. Inline validation on blur is the runner-up as a complement, never a replacement. It confirms good values early but cannot orient you facing three errors. Never ship the dialog summary: it hides the form you must fix.

#### `a-summary-above-the-form-plus-a-message-on-each-field`: A summary above the form, plus a message on each field

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
  region "There is a problem"
    link "Enter the name of the delivery"
    link "Loading must start before dispatch"
  region "The delivery"
    field "Name" text
    message critical "Enter the name of the delivery"
    field "Where" select = "Amsterdam warehouse"
    field "Loading starts" text = "08:00"
    message critical "Loading must start before dispatch. It is set to 08:00."
  footer
    action "Cancel"
    action primary "Create delivery"
```

**Rationale:** This is the GOV.UK pattern in full. The summary comes first and receives focus, with each entry linking to its field. The field repeats the same wording so it reads the same out of context.

**Cost:** The wording exists in two places per error, so generate it once and use it twice. Hand-written copies drift, and the drift is invisible.

**Reference:** GOV.UK

#### `messages-on-the-fields-only`: Messages on the fields only

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
  region "The delivery"
    field "Name" text
    message critical "Enter the name of the delivery"
    field "Where" select = "Choose a warehouse"
    message critical "Choose where the docks are"
    field "Loading starts" text = "08:00"
    message critical "Loading must start before dispatch"
  footer
    action "Cancel"
    action primary "Create delivery"
```

**Rationale:** Each field carries its own message and nothing else. You see the error where you have to fix it.

**Cost:** On a long form the first error may be below the fold. You submit, see nothing change, and conclude the button is broken. G139 exists to jump to the errors.

#### `a-summary-in-a-dialog-above-the-form`: A summary in a dialog above the form

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
  region "The delivery"
    field "Name" text
    message critical "Enter the name of the delivery"
    field "Where" select = "Choose a warehouse"
    message critical "Choose where the docks are"
  dialog
    heading "There is a problem"
    text "3 things need fixing before this delivery can be created."
    text "Enter the name of the delivery. Choose where the docks are."
    action primary "Fix these"
```

**Rationale:** The summary arrives as a dialog over the form, which cannot be scrolled past and cannot be missed, so you cannot submit again unaware.

**Cost:** A dialog over a form breaks focus rules: a dialog never opens another layer, and a form is not a dialog. It also hides the form you have to fix.

#### `a-summary-as-a-banner-above-the-page-not-the-form`: A summary as a banner above the page, not the form

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  region "There is a problem"
    link "Enter the name of the delivery"
    link "Loading must start before dispatch"
  header
    heading "New delivery"
    text "Start with a name."
  region "The delivery"
    field "Name" text
    message critical "Enter the name of the delivery"
    field "Loading starts" text = "08:00"
    message critical "Loading must start before dispatch"
  footer
    action primary "Create delivery"
```

**Rationale:** The summary sits at the top of the page, above the heading, as GOV.UK specifies. It sits below the back link and breadcrumb and takes focus.

**Cost:** Above the heading it is easy to miss on a long page, and it pushes the heading below the fold on a phone. GOV.UK accepts that because the page title also gets an error prefix for screen readers.

**Reference:** GOV.UK

#### `the-refused-field-only-with-no-summary-at-all`: The refused field only, with no summary at all

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Start with a name."
  region "The delivery"
    field "Name" text = "Spring restock"
    field "Loading starts" text = "32/13/2026"
    message critical "Loading starts must be a time between 00:00 and 23:59."
    field "Leaves the dock" text = "14/03/2026 12:00"
  footer
    action "Cancel"
    action primary "Create delivery"
```

**Rationale:** The one field the command refused carries a message and everything else is untouched. It is the smallest response to a single refusal, which is what most refusals are.

**Cost:** This common behavior meets WCAG 3.3.1 but not 3.3.3, because "Invalid date" names no field and says nothing about what to do.

#### `the-refused-command-with-what-to-do-instead`: The refused command, with what to do instead

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock" "Dispatch"
  header
    heading "Release the dispatch"
    text "Dispatch opens Sat 14 Mar 2026 at 08:00."
  region "What would go on sale"
    message critical "That is more units than the warehouse holds. Lower a quantity first."
    table 3 "Tier" "Price" "Units"
      item: text "Standard" · text "EUR 45.00" · text "10,000"
  footer
    action "Change a quantity"
    action disabled "Release the dispatch"
```

**Rationale:** When a refusal is about the command rather than a field, it goes above the form as an alert. The alert carries the code sentence. Where the application can help, it states why it was refused and what resolves it.

**Cost:** The refusal is not attached to anything you can click, so it explains rather than navigates. It suits a business rule, not a typo.

#### `validation-on-leaving-each-field`: Validation on leaving each field

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Each field is checked when it is left."
  region "The delivery"
    field "Name" text = "Spring restock"
    message positive "Spring restock is free."
    field "Where" select = "Amsterdam warehouse"
    field "Loading starts" text = "08:00"
    message critical "Loading must start before dispatch. It is set to 08:00."
  footer
    action "Cancel"
    action primary "Create delivery"
```

**Rationale:** Shopify Polaris and Stripe check a field on blur and mark it good or wrong where it sits. You fix one field and move on. By the submit nothing is left to refuse.

**Cost:** It is a complement to the summary, never a replacement: with three errors and no summary you still cannot see them all at once. A check on blur fires while the form is half-filled.

**Reference:** Shopify Polaris

#### `one-question-per-screen-with-a-progress-marker`: One question per screen with a progress marker

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Question 2 of 4."
  region "Where"
    text "Halfway through the four questions."
    field "Where are the docks" select = "Choose a warehouse"
    message critical "Choose where the docks are"
  footer
    action "Back"
    action primary "Continue"
```

**Rationale:** TurboTax and Typeform ask one question per screen with nowhere else for an error to hide. The refusal sits under the only field on the page. A guided flow cannot submit with a field unseen.

**Cost:** Four screens for four fields is the slowest form in this category, and if you know all four answers you resent the pacing. It fits a first delivery. It does not fit the fortieth.

**Reference:** Typeform

### Work that is not saved

**Question:** How does a form show work that is not saved. Nothing may read as saved before it is. Leaving must not drop typed work without a warning.

**Default:** `a-visible-unsaved-marker-beside-the-save`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the visible unsaved marker beside Save. You never have to remember whether anything was typed. The sticky save bar is the runner-up for long settings pages where the form actions scroll out of view. Never ship silent autosave on money or access. Each save would be an audited command. An audit entry per keystroke batch is not a trail you can read.

#### `a-visible-unsaved-marker-beside-the-save`: A visible unsaved marker beside the Save

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The accent color customers see on buttons."
  region "Identity"
    field "Accent color" text = "#B45309"
    text "A #RRGGBB value. Contrast with white is 5.1 to 1."
    field "Typeface" select = "Inter"
    message info "Two changes not saved. Customers still see the old ones."
  footer
    action quiet "Discard both"
    action primary "Save 2 changes"
```

**Rationale:** The moment a field changes, the Save button carries the word Save changes and a note says what changed. You never have to remember whether you typed anything.

**Cost:** A note naming one changed field states a derived fact. It has to come from the form rather than the route. A Save that changes its own label moves under the pointer.

#### `leave-with-a-question-when-there-is-something-to-lose`: Leave-with-a-question when there is something to lose

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
  region "Identity"
    field "Accent color" text = "#B45309"
    text muted "Contrast with white is 5.1 to 1."
  footer
    action "Cancel"
    action primary "Save"
  dialog
    heading "Leave without saving"
    text "Two changes will be lost. The accent color and the typeface."
    action "Stay here"
    action primary "Leave and lose both"
```

**Rationale:** The Cloudcape rule confirms only when real data is at risk. It stays consistent about it, so the same dialog appears for a Cancel, a breadcrumb, and a move away.

**Cost:** Every page with a form needs the same guard. The browser prompt cannot be worded, so the custom one and the native one both appear on a browser Back.

**Reference:** Cloudcape

#### `autosave-with-a-saved-marker`: Autosave, with a saved marker

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock" "Incidents"
  header
    heading "Record an incident"
    text "Saved as it is typed. Nothing is lost when this browser closes."
  region "The incident"
    field "What happened" textarea = "At 08:41 a driver presented a delivery note for the wrong order."
    text muted "Saved 4 seconds ago"
```

**Rationale:** The form saves itself every few seconds and a quiet marker says "Saved 4 seconds ago". Nothing is ever lost and no dialog is ever needed.

**Cost:** Autosave makes each save a command against money and access, which means an audit entry per keystroke batch. A past decision must stay reconstructable, and a trail of keystroke batches is not one you can read.

#### `a-draft-saved-and-left-on-the-server`: A draft, saved and left on the server

```wireframe
page
  breadcrumb "Home" "Settings" "Policies"
  header
    heading "Return policy"
    text "A draft from 6 Oct is waiting. It has not been published."
  region "The policy"
    message info "A draft from 6 Oct 2026, 17:40 waits. The published policy has not changed since 2 Sep."
    field "Published policy" textarea = "Goods can be returned within 30 days of delivery."
  footer
    action "Carry on"
    action primary "Publish"
```

**Rationale:** The state of the form is a draft the server holds. Leaving the page leaves the draft, and returning to it offers "Carry on". GOV.UK asks for this where a long form may be completed over more than one sitting.

**Cost:** A draft is a second version of the record with its own name and its own rules about when it expires. It is a new aggregate, not a field on the form.

**Reference:** GOV.UK

#### `saved-silently-with-the-command-in-the-page-header`: Saved silently, with the command in the page header

```wireframe
page
  breadcrumb "Home" "Products" "Standard"
  header
    heading "Standard"
    status "On sale" positive
    action "Pause sales"
  region "The name"
    field "Name" text = "Standard"
    field "What it includes" textarea = "Discounted unit price for trade accounts."
    action primary "Save the name"
  region "Invoice naming"
    field "Naming" select = "The customer name"
    action primary "Save the naming"
```

**Rationale:** For a settings page where each change is independent, each section saves itself on its own Save and the header carries nothing. If you change two areas you can save each.

**Cost:** Two Saves on one screen is the case where you edit one form and save the other. The rule has to be one Save per page or one per section, never a mix.

#### `a-read-only-form-because-the-state-forbids-it`: A read-only form because the state forbids it

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Pricing"
  header
    heading "Pricing"
    text "The Spring Launch is on sale. 9,412 orders carry EUR 45.00."
  region "Standard tier"
    field "Standard unit price, in euros" text = "45.00"
    text "The price the customers who already bought were charged. It cannot change."
    field "Price for the units still on sale, in euros" text = "50.00"
    message caution "Charging the 588 differently is allowed. A customer who finds out can ask for the difference back."
  footer
    action primary "Save the new price"
```

**Rationale:** Once the sale has opened, the price is a versioned fact and the field is read-only rather than a field with a save. Changing it is a different command with its own consequences.

**Cost:** A read-only field with no command leaves you stuck, unless the command to change it is stated. The explained-action pattern exists for exactly this case.

#### `a-save-bar-pinned-to-the-top-while-dirty`: A save bar pinned to the top while dirty

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The accent color and typeface customers see."
  toolbar sticky
    text "2 unsaved changes. Customers still see the old ones."
    action "Discard"
    action primary "Save"
  region "Identity"
    field "Accent color" text = "#B45309"
    field "Typeface" select = "Inter"
```

**Rationale:** Shopify Polaris pins a contextual save bar to the top of a dirty form. Save and Discard never scroll out of reach on a long settings page. The bar appears with the first keystroke and leaves with the save.

**Cost:** A pinned bar covers content on a phone and follows you past sections it has nothing to do with. It also needs the same dirty tracking as the marker, so it adds no new information, only reach.

**Reference:** Shopify Polaris

#### `per-field-revert-to-the-saved-value`: Per-field revert to the saved value

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The accent color and typeface customers see."
  region "Identity"
    field "Accent color" text = "#B45309"
    text muted "Was #1F2937."
    action quiet "Revert the color"
    field "Typeface" select = "Inter"
    text muted "Was System."
    action quiet "Revert the typeface"
  footer
    action quiet "Discard both"
    action primary "Save 2 changes"
```

**Rationale:** Webflow and Figma mark each changed field with a dot and offer Revert beside it. You keep one change and drop another without retyping. The old value sits under the field as the honest fallback.

**Cost:** A dot plus a revert button per field adds two elements on every row of a long form. If you want to keep everything you still need the page-level Save. It pays off only where partial saves are common.

**Reference:** Figma

### Picking a period

**Question:** How do you pick a period for settlement or reporting. Two typed dates cover every window but ask for both edges. Presets cover the common windows in one tap.

**Default:** `two-date-inputs-with-presets`

**Compact:** Below the `md` breakpoint the painted calendar shows one month. The second month of the window follows below it. The compact option is `a-calendar-with-the-range-painted`.

**Rationale:** Keep two typed dates with presets. One tap covers the common windows, typing covers the rare ones, and both edges stay visible. The two-month painted calendar is the runner-up for reporting screens where the window itself is the question. Never ship presets alone with no typed fallback: no preset reaches the launch to delivery window the settlement check wants.

#### `two-date-inputs-with-presets`: Two date inputs with presets

```wireframe
page
  breadcrumb "Home" "Invoices" "Settlement"
  header
    heading "Settlement"
    text "What moved for Garcia Interiors."
  tabs "Last 7 days" "Last 30 days" "Last 90 days"
  region "Period"
    field "From" date = "14/02/2026"
    field "To" date = "14/03/2026"
    text muted "The delivery itself: Sat 14 Mar 2026."
  footer
    action primary "Show settlement"
```

**Rationale:** The presets fill both fields and you adjust either edge by typing. The common windows cost one tap and the rare ones stay possible. The control that fills the fields and the fields that hold them are one unit.

**Cost:** Two controls describe one value. The preset shows Custom the moment either date is edited, or the row claims a window it no longer holds.

#### `preset-segmented-control-7-30-90-days`: Preset segmented control: 7, 30, 90 days

```wireframe
page
  breadcrumb "Home" "Invoices" "Settlement"
  header
    heading "Settlement"
    text "What moved for Garcia Interiors."
  tabs "Last 7 days" "Last 30 days" "Last 90 days"
  region "Period"
    text "Counts back from Sat 14 Mar 2026: 14/02/2026 to 14/03/2026."
  footer
    action primary "Show settlement"
```

**Rationale:** One tap covers the three windows a settlement check almost always wants, with no typing. The resolved dates are shown back under the control so the preset is a promise you can read.

**Cost:** No preset reaches a launch-anchored window like the launch to the delivery, so a custom range still needs a second control beside this one.

#### `month-picker`: Month picker

```wireframe
page
  breadcrumb "Home" "Invoices" "Settlement"
  header
    heading "Settlement"
    text "What moved for Garcia Interiors."
  region "Period"
    field "Month" select = "March"
    field "Year" number = "2026"
    text muted "March 2026, the month of Sat 14 Mar 2026."
  footer
    action primary "Show settlement"
```

**Rationale:** Settlement and tax reporting run by calendar month. Picking March 2026 in one control beats typing the first and the last day of the month by hand.

**Cost:** You cannot express a window that crosses a month edge, like the fortnight around the delivery. Whole months are the only shape this control draws.

#### `open-start-rolling-window`: Open-start rolling window

```wireframe
page
  breadcrumb "Home" "Invoices" "Settlement"
  header
    heading "Settlement"
    text "What moved for Garcia Interiors."
  region "Period"
    field "Window" select = "Since the launch opened"
    field "Up to and including" date = "14/03/2026"
    text muted "From the launch opening to Sat 14 Mar 2026."
  footer
    action primary "Show settlement"
```

**Rationale:** Everything since the launch opened needs an end date only. The start is the opening and never moves. One field replaces two where you cannot answer differently.

**Cost:** An open start silently includes old test orders, so the resolved start must be shown back under the field. Without it you cannot tell what the window holds.

#### `refusal-when-the-end-precedes-the-start`: Refusal when the end precedes the start

```wireframe
page
  breadcrumb "Home" "Invoices" "Settlement"
  header
    heading "Settlement"
    text "What moved for Garcia Interiors."
  region "Period"
    message critical "The end is before the start. To must be on or after 14/03/2026."
    field "From" date = "14/03/2026"
    field "To" date = "07/03/2026"
    message critical "To must be on or after 14/03/2026."
  footer
    action primary "Show settlement"
```

**Rationale:** The page refuses an end before the start where you typed it, in the GOV.UK template. The message names the field and says what to do. The summary above it says the same in one line.

**Cost:** It is one more state to draw and to test. The refusal waits until both fields hold a date. It never fires while you still type the second one.

**Reference:** GOV.UK

#### `timezone-safe-inclusive-day-boundaries`: Timezone-safe inclusive day boundaries

```wireframe
page
  breadcrumb "Home" "Invoices" "Settlement"
  header
    heading "Settlement"
    text "What moved for Garcia Interiors."
  region "Period"
    message info "Both days count in full. From 14/02/2026 to 14/03/2026, Europe/Amsterdam."
    field "From" date = "14/02/2026"
    text muted "Includes the whole day."
    field "To" date = "14/03/2026"
    text muted "Includes the whole day, to the end of Sat 14 Mar 2026."
  footer
    action primary "Show settlement"
```

**Rationale:** Each edge is a whole day in Europe/Amsterdam. An order placed at 22:41 on the delivery day falls inside the window that ends on that day. The boundary sentence is part of the control, not documentation beside it.

**Cost:** The sentence must be read to work, and if you think in UTC you see different instants. Stating the zone once keeps it from being repeated under each field.

#### `a-calendar-with-the-range-painted`: A calendar with the range painted

```wireframe
page
  breadcrumb "Home" "Invoices" "Settlement"
  header
    heading "Settlement"
    text "What moved for Garcia Interiors."
  tabs "Delivery week" "Launch week" "Custom"
  region "Period"
    split 1:1
      grid 28
        item: text "20"
      grid 31
        item: text "7"
    text "07/03/2026 to 14/03/2026, both days counted in full."
  footer
    action primary "Show settlement"
```

```wireframe compact
page
  breadcrumb "Home" "Invoices" "Settlement"
  header
    heading "Settlement"
    text "What moved for Garcia Interiors."
  tabs "Delivery week" "Launch week" "Custom"
  region "Period"
    grid 28
      item: text "20"
    grid 31
      item: text "7"
    text "07/03/2026 to 14/03/2026, both days counted in full."
  footer
    action primary "Show settlement"
```

**Rationale:** Airbnb and Google Flights paint the chosen range across the calendar, so you see the window instead of reading two dates. The endpoints stay readable as dates under the control.

**Cost:** A painted month shows one month, and the settlement window usually spans two. Two months side by side are the honest control, and they do not fit a phone.

**Reference:** Airbnb

#### `delivery-anchored-presets`: Delivery-anchored presets

```wireframe
page
  breadcrumb "Home" "Invoices" "Settlement"
  header
    heading "Settlement"
    text "What moved for Garcia Interiors."
  tabs "Since launch" "Launch week" "Delivery week"
  region "Period"
    text muted "Anchored to Tue 13 Jan 2026 and Sat 14 Mar 2026, not to today."
    field "From" date = "07/03/2026"
    field "To" date = "14/03/2026"
  footer
    action primary "Show settlement"
```

**Rationale:** Mixpanel and Amplitude anchor ranges to the milestones the business runs on, because `last-30-days` drifts while the launch stays fixed. The preset resolves to typed dates you can still adjust.

**Cost:** Anchors multiply: launch, dispatch, close, and settlement runs. Three anchors fit a control. Six need a picker of their own, and the window stops being one tap.

**Reference:** Mixpanel

### Slug or URL field with a preview

**Question:** How does a product take the slug customers read. The slug is the short part typed in. The address is what customers read, link, and print.

**Default:** `slug-with-the-live-address-under-it`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the slug with its live address under it. You type the short part and read the full address before saving. The transliteration from the name is the runner-up for creation, where typing the same words twice is pure overhead. Never ship an address that cannot be read before it is saved.

#### `slug-with-the-live-address-under-it`: Slug with the live address under it

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Address"
  header
    heading "Product address"
    text "Where customers find this product."
  region "The address"
    field "Name" text = "Oak desk lamp"
    field "Slug" text = "oak-desk-lamp"
    text muted "Lowercase letters, numbers and dashes. Changing it breaks links already shared."
    fact "Customers reach" "acme-supply.example/oak-desk-lamp"
    action quiet "Copy"
  footer
    action "Cancel"
    action primary "Save address"
```

**Rationale:** Contentful and Shopify show the full address under the slug field and update it as you type. The short value is never saved unseen. The copy command beside it is how the address leaves the back office.

**Cost:** The address must update as you type, which a static mock cannot show. It also states the host the platform gives, which you cannot change on this screen.

**Reference:** Shopify

#### `the-address-as-a-fact-with-a-change-command`: The address as a fact with a change command

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Address"
  header
    heading "Product address"
    text "Where customers find this product."
  region "The address"
    fact "Address" "acme-supply.example/oak-desk-lamp"
    fact "First shared" "13 Jan 2026"
    fact "Used in" "214 orders"
    message caution "Changing the address breaks the links already shared. The old address keeps working for 30 days."
  footer
    action primary "Change the address"
```

**Rationale:** GitHub shows a repository address as a fact and puts Rename behind a command, because an address in use is depended upon. The 30-day redirect is what makes the change survivable.

**Cost:** Changing a value takes two steps, and the redirect has to be a real behavior, not a sentence. A redirect nobody builds is a promise the page breaks.

**Reference:** GitHub

#### `transliterated-from-the-name-with-an-edit-toggle`: Transliterated from the name with an edit toggle

```wireframe
page
  breadcrumb "Home" "Products" "New product"
  header
    heading "New product"
    text "Start with a name."
  region "The address"
    field "Name" text = "Oak desk lamp"
    field "Generate the slug from the name" checkbox
    field "Slug" text = "oak-desk-lamp"
    text muted "Customers reach acme-supply.example/oak-desk-lamp."
  footer
    action "Cancel"
    action primary "Create product"
```

**Rationale:** WordPress builds the permalink from the title and lets you edit it, because the name and the slug agree nine times in ten. Typing both by hand is the same words twice.

**Cost:** The generated value must transliterate Dutch diacritics the way you expect, and a renamed product must not silently re-slug. Generation runs once at creation, never again.

**Reference:** WordPress

#### `availability-check-with-alternatives-offered`: Availability check with alternatives offered

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Address"
  header
    heading "Product address"
    text "Where customers find this product."
  region "The address"
    field "Slug" text = "lamp"
    message caution "lamp is taken. Another company holds it. One of these is free."
    list 3
      item: text "oak-lamp" · action "Use"
  footer
    action "Cancel"
    action primary "Save address"
```

**Rationale:** Namecheap answers a taken domain with free alternatives, because a refusal without a next step sends you back to guessing. The alternatives keep the shape of what was wanted.

**Cost:** The page must check the alternatives live, one by one, or the list offers addresses that fail the same way. Three checks per keystroke pause is a read the page has to budget for.

**Reference:** Namecheap

#### `the-slug-refused-with-the-rule-that-refused-it`: The slug refused with the rule that refused it

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Address"
  header
    heading "Product address"
    text "Where customers find this product."
  region "There is a problem"
    link "Use lowercase letters, numbers and dashes in the slug"
  region "The address"
    field "Slug" text = "Oak Desk Lamp!"
    message critical "Use lowercase letters, numbers and dashes. You entered capitals, spaces and exclamation."
  footer
    action "Cancel"
    action primary "Save address"
```

**Rationale:** The GOV.UK error template applies to a slug. The summary comes first, then the field, with the message naming what was entered and what to do. The page states the rule once and enforces it the same way.

**Cost:** The message repeats the value, which makes it longer than the field. It also has to name every offending character class, not the first one found.

**Reference:** GOV.UK

#### `custom-domain-with-its-dns-instructions`: Custom domain with its DNS instructions

```wireframe
page
  breadcrumb "Home" "Products" "Storefront" "Domain"
  header
    heading "Storefront domain"
    text "Sell from your own address instead of ours."
  region "The domain"
    field "Domain" text = "shop.acme-supply.example"
    fact "Type" "CNAME"
    fact "Name" "shop"
    fact "Value" "storefront.example.net"
    message info "Add this record where the domain lives, then verify. DNS changes take up to a day."
    status "Not verified" caution
  footer
    action primary "Verify"
```

**Rationale:** Vercel and Webflow pair a domain field with the exact DNS record it needs, because the field alone is half the task. The page states the record as values to copy, not as prose to interpret.

**Cost:** Verification is a read against DNS the back office does not control. The badge can only say what the last check found and when. A stale badge claims a state the world has left.

**Reference:** Vercel

### Capacity field

**Question:** How does a tier take units from one warehouse stock. The Amsterdam warehouse holds 10,000 units. Every tier draws from the same shelves.

**Default:** `a-number-with-the-warehouse-ceiling-restated`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keep the number with the warehouse ceiling restated. One field, the stock it draws from, and what is left sit on the same screen. The split across tiers is the runner-up for the product page, where the question is the whole stock rather than one tier. Never ship a capacity with no ceiling stated: a number without its stock is a number that oversells.

#### `a-number-with-the-warehouse-ceiling-restated`: A number with the warehouse ceiling restated

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Standard" "Capacity"
  header
    heading "Capacity"
    text "How many Standard units can be sold."
  region "Units on sale"
    field "Units on sale" number = "9600"
    text muted "9,412 sold. 188 still for sale."
    text "The stock is 98 percent full."
    fact "Amsterdam warehouse holds" "10,000 units"
    text muted "Bulk holds 400 of them."
  footer
    action "Cancel"
    action primary "Save capacity"
```

**Rationale:** The warehouse total sits beside every quantity field, because a tier allocation means nothing without the stock it draws from. The bar shows how full the stock is at a glance.

**Cost:** The restated ceiling must update when another tier changes, or two screens state two stocks. It is a read of the whole product behind one field.

#### `the-split-across-types-with-what-is-left`: The split across types with what is left

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Capacity"
  header
    heading "Capacity"
    text "How the 10,000 units are divided."
  region "Every tier"
    list 3
      item: text "Standard" · text muted "On sale since 13 Jan 2026" · text "9,412 of 9,600" · action "Change"
  region "The stock"
    fact "Sold across every tier" "9,730"
    fact "Left in the stock" "270 units"
    text muted "Closed tiers keep their sold quantity but release nothing back."
```

**Rationale:** Inventory draws as one row per tier with sold against cap, because the question is the stock, not the row. The leftover line is what you came to read.

**Cost:** A row per tier is a table wearing a list costume, and at twelve tiers it needs the table back. Editing still jumps to one tier at a time.

#### `a-stepper-for-a-small-count`: A stepper for a small count

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Samples"
  header
    heading "Samples"
    text "Free units for trade accounts, inside the Bulk allocation."
  region "Units"
    row
      action "One unit fewer"
      field "Sample units" number = "24"
      action "One unit more"
    text muted "Steps of one, up to 50. 318 of 400 Bulk units are sold."
  footer
    action "Cancel"
    action primary "Save samples"
```

**Rationale:** Apple HIG reserves the stepper for small counts adjusted by one, which a 24-unit sample list is. Tapping plus twice beats selecting 24 and typing 26.

**Cost:** A stepper for 9,600 units would be tapped 9,600 times, so it fits only counts under fifty. The field must still take a typed value for the jump from 4 to 40.

**Reference:** Apple HIG

#### `a-percentage-held-back-from-sale`: A percentage held back from sale

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Capacity"
  header
    heading "Capacity"
    text "How many units stay off sale for the trade counter."
  region "The hold"
    field "Held back" number = "5"
    text muted "Percent of the stock. Released to the trade counter on launch day."
    fact "Held back" "500 units"
    fact "Left for sale" "9,500 units"
  footer
    action "Cancel"
    action primary "Save hold"
```

**Rationale:** Holds are a percentage of the stock kept for the trade counter, restated as units so you read both. A percentage survives a stock change. A count does not.

**Cost:** Two numbers describe one hold, and they round differently: 5% of 10,000 is 500 until the stock becomes 9,999. The units win and the percentage follows.

#### `the-capacity-refused-with-the-overage-named`: The capacity refused with the overage named

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Standard" "Capacity"
  header
    heading "Capacity"
    text "How many Standard units can be sold."
  region "Units on sale"
    message critical "That is more units than the warehouse holds. Lower a quantity first."
    field "Units on sale" number = "10000"
    message critical "That is 400 units more than the stock holds. Lower it to 9,600."
    fact "Amsterdam warehouse holds" "10,000 units"
  footer
    action "Cancel"
    action primary "Save capacity"
```

**Rationale:** The refusal is worded on screen, with the field carrying the same message. GOV.UK names the field and says what to do, and the numbers supply the overage. You read the overage, not the rule alone.

**Cost:** The message must recompute the overage for every value, and a value that breaks two rules needs two messages. One refusal per field keeps it readable.

**Reference:** GOV.UK

#### `sold-as-a-read-only-fact-beside-an-editable-cap`: Sold as a read-only fact beside an editable cap

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Standard" "Capacity"
  header
    heading "Capacity"
    text "How many Standard units can be sold."
  region "Units on sale"
    fact "Sold" "9,412"
    fact "On sale" "9,600"
    fact "Left" "188"
    message info "Sold is a fact and cannot be edited. Lowering the cap below 9,412 is refused."
    field "Units on sale" number = "9600"
    text muted "Must stay at or above 9,412."
  footer
    action "Cancel"
    action primary "Save capacity"
```

**Rationale:** Stripe draws an available balance as a fact beside the controls that move it: sold is what happened, the cap is what you decide. The two must never share a field.

**Cost:** Three figures plus a field for one decision, and the derived Left line must update as you type the cap. It is the most screen per field in this item.

**Reference:** Stripe

### Color field for the storefront accent

**Question:** The company brands its storefront with one accent color: a `#RRGGBB` value dark enough for white button text to read on it. The field takes the value and proves the contrast before the page refuses it.

**Default:** `hex-field-with-a-swatch-and-a-contrast-readout`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The hex field with a swatch and a contrast readout is the pick. It takes any color, shows it, and states the ratio the validation enforces. The customer-button preview is the runner-up beside it, because a ratio is believed once it is seen. Never ship a free color with no contrast check: a pale accent ships white text nobody can read.

#### `hex-field-with-a-swatch-and-a-contrast-readout`: Hex field with a swatch and a contrast readout

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The accent color customers see on your buttons."
  region "Accent"
    image "Accent #1F2937 swatch"
    field "Accent color" text = "#1F2937"
    text muted "A #RRGGBB value. Contrast with white is 14.7:1, so white button text is readable."
    fact "White button text" "Readable, needs 4.5:1, this accent reaches 14.7:1"
    status "Readable" positive
  footer
    action "Cancel"
    action primary "Save accent"
```

**Rationale:** Shopify theme editor pairs a hex field with a swatch and the rule it passes. A color value means nothing until it is seen. The readout repeats the validation rule, so you learn it before the request rather than after it.

**Cost:** The ratio must recompute as you type, and an unfinished value has no ratio to state. Six characters that are not yet a color need patience, not a refusal.

**Reference:** Shopify

#### `preset-swatches-plus-a-custom-value`: Preset swatches plus a custom value

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The accent color customers see on your buttons."
  region "Accent"
    text "Presets, every preset passes 4.5:1 against white."
    row
      image "Ink preset, chosen"
      image "Amber preset"
      image "Pine preset"
      image "Ocean preset"
      image "Plum preset"
      image "Rose preset"
    field "Or a custom color" text = "#1F2937"
    text muted "A #RRGGBB value. Checked against white before it saves."
  footer
    action "Cancel"
    action primary "Save accent"
```

**Rationale:** Slack and Notion offer a row of presets that all satisfy the rule, with a custom field for you when you know better. One tap covers the common case and cannot produce a failing color.

**Cost:** Six presets cannot hold a brand color, so the custom field carries the real work anyway, and a preset row that never changes starts to look like the whole choice.

**Reference:** Slack

#### `the-accent-previewed-on-a-customer-button`: The accent previewed on a customer button

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The accent color customers see on your buttons."
  region "Accent"
    image "Accent #1F2937 swatch"
    field "Accent color" text = "#1F2937"
    text muted "A #RRGGBB value. Contrast with white is 14.7:1."
  card "Customer preview"
    heading small "Checkout"
    text "Garcia Interiors restock"
    text "Sat 14 Mar 2026 at the Amsterdam warehouse"
    text "2 units, EUR 100.00"
    action "Pay EUR 100.00"
    text muted "Acme Supply, Canal Street 12, 1011 AB Amsterdam"
  footer
    action "Cancel"
    action primary "Save accent"
```

**Rationale:** Mailchimp previews a brand color on the button the customer presses, because a ratio is believed once it is seen. You read white on `#1F2937` instead of reading `14.7:1`.

**Cost:** A preview is a second surface to keep honest. It shows the typed value, not the saved one, and updates as you type. A stale preview proves nothing.

**Reference:** Mailchimp

#### `the-browser-color-well-beside-the-hex`: The browser color well beside the hex

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The accent color customers see on your buttons."
  region "Accent"
    row
      field "Pick the accent color" text = "#1F2937"
      field "Accent color" text = "#1F2937"
    text muted "Pick a color or type a #RRGGBB value. Both hold the same accent."
    fact "White button text" "Readable, needs 4.5:1, this accent reaches 14.7:1"
    status "Readable" positive
  footer
    action "Cancel"
    action primary "Save accent"
```

**Rationale:** The browser native color well is the only picker that costs no code. One input holds the platform dialog and a hex you can still type. MDN documents it as the accessible default.

**Cost:** The well draws the browser chrome instead of the back-office control. It renders differently everywhere, which is the same charge the native date input faces. It also offers colors that fail `4.5:1` without saying so.

**Reference:** MDN

#### `a-pale-color-refused-with-the-ratio-that-failed`: A pale color refused with the ratio that failed

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "The accent color customers see on your buttons."
  region "Accent"
    image "Accent #F59E0B swatch"
    field "Accent color" text = "#F59E0B"
    message "White button text needs 4.5:1 against the accent. #F59E0B reaches 2.1:1. Choose a darker color." critical
  footer
    action "Cancel"
    action primary "Save accent"
```

**Rationale:** The validation rule appears worded on screen in the GOV.UK template. The message names the value, states both ratios, and says what to do. You learn the rule from the refusal, not from documentation.

**Cost:** A refusal that only says darker leaves you guessing how much darker. It earns its place fully only beside presets that all pass.

**Reference:** GOV.UK

#### `an-inherited-accent-with-an-override-command`: An inherited accent with an override command

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Style"
  header
    heading "Product style"
    text "What customers see for this product."
  region "Accent"
    fact "Acme Supply accent" "#1F2937"
    fact "This product" "Inherits the company accent"
    message "One accent across every product keeps the brand steady. Override it only for a product with its own artwork." info
    action "Override for this product"
```

**Rationale:** Figma variables inherit down the tree and override at one level. The source stays named, so a product can differ without hiding where its value came from. The company default stays the decider.

**Cost:** An inherited value with an override is two values and a rule about which wins. If you never open this screen you cannot tell which products differ.

**Reference:** Figma

### Repeatable group for price tiers

**Question:** The Oak desk lamp sells in Standard, Trade, and Bulk: three groups with the same fields, each with its own name, price, and allocation. The group repeats, and the stock counts every repetition.

**Default:** `stacked-cards-one-per-type`

**Compact:** At phone width the table keeps its columns and scrolls sideways. The tier column stays first. The compact option is `a-table-with-inline-editing`.

**Rationale:** The stacked cards are the pick: one card per tier with its price and allocation readable at once, and one command to add another. The dated price steps are the runner-up for launches, where time decides the price rather than the customer choice. Never ship a group whose repetitions cannot be removed: a tier added by mistake must leave without taking its sold units with it.

#### `stacked-cards-one-per-type`: Stacked cards, one per type

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Price tiers"
  header
    heading "Price tiers"
    text "What a customer picks and what the warehouse ships."
  region "Three tiers"
    list 3
      item: text "Standard" · text muted "9,412 of 9,600 sold" · status "On sale" positive · text "EUR 45.00" · action "Edit"
  footer
    action "Add a price tier"
    action primary "Save order"
```

**Rationale:** Shopify draws product variants as one row per variant with its price readable at once, because you compare repetitions before editing one. Sold tiers stay visible but lose their Remove.

**Cost:** A row shows the price but hides the dates, the discount rule, and the description, so editing still opens each tier. The list answers what, never why.

**Reference:** Shopify

#### `a-table-with-inline-editing`: A table with inline editing

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Price tiers"
  header
    heading "Price tiers"
    text "What a customer picks and what the warehouse ships."
  region "Three tiers"
    table 3 "Tier" "Price" "Units" "Sold"
      item: text "Standard" · text "EUR 45.00" · text "9,600" · text "9,412"
    field "Standard price in euros" text = "45.00"
  footer
    action "Add a price tier"
    action primary "Save all"
```

```wireframe compact
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Price tiers"
  header
    heading "Price tiers"
    text "What a customer picks and what the warehouse ships."
  region "Three tiers"
    table 3 "Tier" "Price" "Units" "Sold"
      item: text "Standard" · text "EUR 45.00" · text "9,600" · text "9,412"
  footer
    action "Add a price tier"
    action primary "Save all"
```

**Rationale:** Airtable edits values where they sit, so changing three prices costs three fields and no navigation. One row in edit state at a time keeps the table readable while it is also a form.

**Cost:** A table that is also a form validates cell by cell, and a refused cell must hold its row open. At phone width the columns scroll sideways, which hides the price behind a swipe.

**Reference:** Airtable

#### `one-section-per-type-with-add-another`: One section per type with add another

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Price tiers"
  header
    heading "Price tiers"
    text "What a customer picks and what the warehouse ships."
  region "Tier 1 of 2"
    field "Name" text = "Standard"
    field "Price customers pay, in euros" text = "45.00"
    field "Units on sale" text = "9600"
    text muted "9,412 sold."
    action "Remove"
  region "Tier 2 of 2"
    field "Name" text = "Bulk"
    field "Price customers pay, in euros" text = "20.00"
    field "Units on sale" text = "400"
    text muted "318 sold."
    action "Remove"
  footer
    action "Add another price tier"
    action primary "Save tiers"
```

**Rationale:** GOV.UK `add-another` repeats the full group once per entry with its own remove. Each repetition deserves the same labels, help, and errors as the first. Nothing about tier 2 is abbreviated.

**Cost:** Three full groups make a long page, and the stock total has nowhere to sit. It fits creation, where each tier is new. It drags for review, where each tier is known.

**Reference:** GOV.UK

#### `dated-price-steps-for-the-launch`: Dated price steps for the launch

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Price tiers"
  header
    heading "Price tiers"
    text "Time decides the price. The customer pays whatever step is open."
  region "Two steps"
    text muted "Steps never overlap. The next step opens the moment the current one closes."
    list 2
      item: text "Regular, EUR 45.00" · text muted "1 Feb to 14 Mar 2026, 08:00, 7,412 of 7,600 sold" · status "On sale" positive · text "Open"
  footer
    action "Add a step"
    action primary "Save steps"
```

**Rationale:** A launch tiers its prices by date, because early customers pay less for committing first. The dates are part of each step, so you answer the price on any day by reading one row.

**Cost:** Dated steps plus per-tier allocations divide one stock in two ways. They can disagree. A step can close with units left, or sell out with days left. One of the two has to win.

#### `drag-to-reorder-with-the-customer-order-shown`: Drag to reorder with the customer order shown

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Price tiers"
  header
    heading "Price tiers"
    text "Customers meet them in this order. Drag a row to move it."
  region "Three tiers"
    text muted "The numbers are the customer order on the storefront."
    list 3
      item: icon "Reorder" · text "1, Standard" · text muted "EUR 45.00, on sale" · action quiet "Move up"
  footer
    action primary "Save order"
```

**Rationale:** Linear and Trello order by dragging with button equivalents beside each row, because drag alone strands keyboard users. The customer order is numbered, so the back-office order and the storefront order cannot drift apart silently.

**Cost:** Order is one more field per tier with its own conflicts: two people reordering at once, and a tier added in the middle. It needs the same version check as every shared write.

**Reference:** Linear

#### `the-group-refused-naming-the-type-that-breaks-the-ceiling`: The group refused, naming the type that breaks the ceiling

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Price tiers"
  header
    heading "Price tiers"
    text "What a customer picks and what the warehouse ships."
  message "That is more units than the warehouse holds. The Amsterdam warehouse holds 10,000 units." critical
  region "Three tiers"
    text muted "10,400 units on sale. The warehouse holds 10,000."
    list 2
      item: text "Standard, EUR 45.00" · text muted "10,000 units on sale. Lower it by 400 units." · text "10,000" · action "Change"
  footer
    action primary "Save tiers"
```

**Rationale:** The refusal sits above the group and names the offending row below it. GOV.UK puts the summary first and the message on the field. Here the field is a row. Standard carries the overage because Standard grew last.

**Cost:** Blaming one row for a stock total is a guess the page makes about intent: you may sooner cut Bulk than Standard. The message must offer both, not decide.

**Reference:** GOV.UK

### Tag input

**Question:** Products and customers carry short labels: oak, home, trade. Tags are typed freely but read everywhere, so the input must take new words and still keep old ones spelled one way.

**Default:** `chips-with-type-to-add-and-suggestions`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The chips with type-to-add and suggestions are the pick: new words are allowed and old ones are offered, so `oak` is spelled once. The checkbox list is the runner-up where the tag set is closed and counted. Never ship free text with no suggestions: it grows `oak`, `Oak`, and `oak-desk` side by side.

#### `chips-with-type-to-add-and-suggestions`: Chips with type-to-add and suggestions

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Tags"
  header
    heading "Tags"
    text "Short labels customers and staff read."
  region "The tags"
    row
      status "oak" neutral
      status "home" neutral
      status "new" neutral
    field "Tags" search = "tra"
    text muted "Lowercase letters, numbers and dashes. New words are allowed."
  footer
    action "Cancel"
    action primary "Save tags"
  popover
    text "Suggestions"
    text "trade-accounts, 12 products"
    text "Use tra as a new tag"
```

**Rationale:** GitHub and Linear offer existing labels as you type. They accept a new word on Enter, so the old spelling wins without forbidding the new one. The count beside each suggestion says how shared it is.

**Cost:** Suggestions must search across every product on every keystroke pause, and a slow search answers after you have already pressed Enter. The new word wins by timing, not by choice.

**Reference:** GitHub

#### `a-checkbox-list-in-a-popover-with-a-count`: A checkbox list in a popover with a count

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Tags"
  header
    heading "Tags"
    text "Short labels customers and staff read."
  region "The tags"
    action "3 tags chosen"
    text muted "Tick what applies. New tags are made on the tag list."
  footer
    action "Cancel"
    action primary "Save tags"
  popover
    field "Search tags" search
    field "oak" checkbox
    field "home" checkbox
    field "new" checkbox
    field "trade-accounts" checkbox
    link "Manage the tag list"
  dialog
    heading "Manage the tag list"
    text "Renaming a tag renames it on every product that carries it."
    list 4
      item: text "oak" · action "Rename"
    action "Done"
```

**Rationale:** Shopify and Jira draw a closed tag set as checkboxes with a count on the button. Ticking is faster than typing when the words already exist. Managing the list is a separate task with its own dialog.

**Cost:** A closed set cannot take a new word where it is needed, so you leave the form to make one. It fits a governed vocabulary. It fights a growing one.

**Reference:** Shopify

#### `free-text-split-on-commas`: Free text split on commas

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Tags"
  header
    heading "Tags"
    text "Short labels customers and staff read."
  region "The tags"
    field "Tags" text = "oak, home, new"
    text muted "Separate tags with commas. Spaces at the edges are removed."
    text "Read as"
    row
      status "oak" neutral
      status "home" neutral
      status "new" neutral
  footer
    action "Cancel"
    action primary "Save tags"
```

**Rationale:** Stack Overflow and WordPress take tags as one comma-separated line with the parsed chips read back below. Pasting a list from elsewhere works without retyping. The readout is what makes the parsing honest.

**Cost:** No suggestions means no shared spelling: `oak` and `Oak` become two tags and nobody is told. The readout shows the split but cannot judge the words.

**Reference:** WordPress

#### `color-coded-tags-for-audience-segments`: Color-coded tags for audience segments

```wireframe
page
  breadcrumb "Home" "Customers" "Segments"
  header
    heading "Segments"
    text "Who gets the trade mail for the Spring Launch."
  region "The segments"
    row
      status "Regulars" info
      status "Early customers" positive
      status "At risk" caution
    fact "Regulars" "1,204 customers, bought twice or more"
    fact "Early customers" "2,000 customers, bought in the first week"
    fact "At risk" "318 customers, bought last year, nothing since"
    action "Add"
  footer
    action "Cancel"
    action primary "Save segments"
```

**Rationale:** Mailchimp and Klaviyo color segments by meaning, because a segment is read in lists where its word is small. The tone repeats the signal instead of decorating it.

**Cost:** Five tones cover five meanings and no more. A sixth segment reuses a tone and the code breaks. Color is never the only signal, so the word stays anyway.

**Reference:** Mailchimp

#### `a-tag-refused-with-the-rule`: A tag refused with the rule

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Tags"
  header
    heading "Tags"
    text "Short labels customers and staff read."
  region "The tags"
    row
      status "oak" neutral
      status "home" neutral
    field "Tags" text = "Oak Range!"
    message "Tags hold lowercase letters, numbers and dashes. You entered capitals, a space and !." critical
  footer
    action "Cancel"
    action primary "Save tags"
```

**Rationale:** The GOV.UK error template applies to the tag being added. The good chips stay and the bad word carries the message. The rule is stated with the value that broke it.

**Cost:** The message judges one word while the field holds a list, so you must tell which word failed. The chips above carry that by staying put.

**Reference:** GOV.UK

#### `inherited-tags-with-their-source-named`: Inherited tags with their source named

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Standard" "Tags"
  header
    heading "Standard tags"
    text "Labels on this price tier."
  region "The tags"
    text "From Oak desk lamp"
    row
      status "oak" neutral
      status "home" neutral
    text muted "Every tier on the product carries these. Change them on the product."
    field "On Standard itself" text = "featured"
    field "Add a tag" text
  footer
    action "Cancel"
    action primary "Save tags"
```

**Rationale:** HubSpot shows inherited properties with their source beside the local ones. A tier page answers the whole label set without hiding where each word came from. The page refuses removing an inherited word by pointing at its source.

**Cost:** The page shows two lists where one was expected, and the inherited one cannot be edited here. If you want the tier untagged you must walk up the tree.

**Reference:** HubSpot

### Address field

**Question:** Acme Supply answers for its orders with a name, an address, and a telephone number on every customer message. The address field takes the street the law asks for and the postcode the mail needs.

**Default:** `postcode-lookup-that-fills-the-street`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The postcode lookup is the pick: two short values you know produce the street you would mistype. The country-first manual entry is the runner-up for companies outside the lookup coverage. Never ship a single free-text address box: one line cannot be split into street, postcode, and city again.

#### `postcode-lookup-that-fills-the-street`: Postcode lookup that fills the street

```wireframe
page
  breadcrumb "Home" "Settings" "Organization"
  header
    heading "Organization"
    text "What Acme Supply is and where it works."
  region "The address"
    row
      field "Postcode" text = "1011 AB"
      field "Number" text = "12"
    action "Look up the street"
    field "Street" text = "Canal Street"
    field "City" text = "Amsterdam"
    field "Country" select = "Netherlands"
    text muted "Customers read this address on their invoices and their mail."
  footer
    action "Cancel"
    action primary "Save address"
```

**Rationale:** Postcode.nl and GOV.UK ask for postcode plus number first, because you know both by heart. The lookup then fills the street you would mistype. Two short fields beat one long one.

**Cost:** The lookup covers the Netherlands and nowhere else, so every other country falls back to manual entry. Two paths through one field are two paths to test.

**Reference:** GOV.UK

#### `one-search-that-fills-the-address`: One search that fills the address

```wireframe
page
  breadcrumb "Home" "Settings" "Organization"
  header
    heading "Organization"
    text "What Acme Supply is and where it works."
  region "The address"
    field "Find the address" search = "Canal"
    text muted "Start typing the street. The postcode and city follow."
  footer
    action "Cancel"
    action primary "Save address"
  popover
    text "Canal Street 12, 1011 AB Amsterdam"
    link "Type the address by hand instead"
```

**Rationale:** Google Places resolves a half-typed street to a full address, because you know where you are but not how the database spells it. One field holds the whole search.

**Cost:** An address search reads a provider the back office pays per keystroke, and you may choose a wrong first result without reading. The manual fallback must stay one tap away.

**Reference:** Google Places

#### `country-first-then-the-local-shape`: Country first, then the local shape

```wireframe
page
  breadcrumb "Home" "Settings" "Organization"
  header
    heading "Organization"
    text "What Acme Supply is and where it works."
  region "The address"
    field "Country" select = "Netherlands"
    text muted "The fields below follow the country."
    field "Street and number" text = "Canal Street 12"
    row
      field "Postcode" text = "1011 AB"
      field "City" text = "Amsterdam"
  footer
    action "Cancel"
    action primary "Save address"
```

**Rationale:** Stripe Checkout asks for the country first because the shape of an address follows it: a Dutch postcode is nothing like a German one. The labels and the validation change with the country.

**Cost:** Every supported country needs its own shape, its own labels, and its own validation. Three countries fit this pattern. Thirty need a library.

**Reference:** Stripe

#### `warehouse-address-with-a-map-pin`: Warehouse address with a map pin

```wireframe
page
  breadcrumb "Home" "Settings" "Warehouses" "Amsterdam warehouse"
  header
    heading "Amsterdam warehouse"
    text "Where the docks are."
  region "The address"
    fact "Warehouse" "Amsterdam warehouse"
    fact "City" "Amsterdam"
    fact "Docks" "Main dock, side dock"
    image "Map pin, Amsterdam warehouse, Amsterdam, pin placed by Acme Supply"
  footer
    action "Move the pin"
    action primary "Save address"
```

**Rationale:** The warehouse is pinned on a map beside its address, because drivers navigate to a pin, not to a street name. The company places the pin instead of guessing it from the postcode.

**Cost:** A map is a third-party surface with its own terms and its own load time. A static pin box proves the pattern. The live map is a dependency, not a field.

#### `the-postcode-refused-with-the-expected-shape`: The postcode refused with the expected shape

```wireframe
page
  breadcrumb "Home" "Settings" "Organization"
  header
    heading "Organization"
    text "What Acme Supply is and where it works."
  region "The address"
    field "Street and number" text = "Canal Street 12"
    row
      field "Postcode" text = "1011"
      field "City" text = "Amsterdam"
    message "A Dutch postcode holds four digits, a space and two letters, like 1011 AB." critical
  footer
    action "Cancel"
    action primary "Save address"
```

**Rationale:** The GOV.UK error template on a postcode states the shape and gives the example. You repair 1011 without opening a second page. The example is the company postcode.

**Cost:** The shape differs per country, so the message must follow the country field. A Dutch message under a Belgian address refuses a value that was right.

**Reference:** GOV.UK

#### `a-verified-address-with-a-change-command`: A verified address with a change command

```wireframe
page
  breadcrumb "Home" "Settings" "Organization"
  header
    heading "Organization"
    text "What Acme Supply is and where it works."
  region "The address"
    fact "Street" "Canal Street 12"
    fact "Postcode and city" "1011 AB Amsterdam"
    fact "Country" "Netherlands"
    status "Verified" positive
    message "Verified against the chamber of commerce on 2 Sep 2026. Changing it verifies the account again." info
    action "Change the address"
```

**Rationale:** Banks and company registers show a verified address as a fact with a change command. Payouts and invoices depend on a verified value. The badge states what the last check found.

**Cost:** Verification is a check against a register the back office does not hold, so the badge can only age. A move the company forgets to report leaves a true badge on a false address.

### Email body editor

**Question:** Acme Supply mails every customer when goods are dispatched, and the message carries the customer name, the order number, and the delivery window. The editor takes the company words once and fills the customer facts per order.

**Default:** `subject-plus-body-with-variable-chips`

**Compact:** The preview sits below the editor. You scroll between writing and reading. The compact option is `side-by-side-preview-of-the-customer-message`.

**Rationale:** The subject plus body with variable chips is the pick: you write the sentence and place the facts where they belong. The side-by-side customer preview is the runner-up beside it, because a template is believed once it is seen filled. Never ship a template with no preview: variables are spelled in one place and filled in another, and only the filled copy proves they meet.

#### `subject-plus-body-with-variable-chips`: Subject plus body with variable chips

```wireframe
page
  breadcrumb "Home" "Settings" "Email" "Goods dispatched"
  header
    heading "Goods dispatched"
    text "The message a customer looks for. Sent when goods are dispatched."
  region "The message"
    field "Subject" text = "Your Acme Supply order is on its way"
    text "Hi customer, your order left the Amsterdam warehouse. It arrives soon."
    row
      status "customer_name" neutral
      status "order_number" neutral
      status "delivery_window" neutral
    text muted "Variables fill per order when the mail is sent."
    field "Insert a variable" select = "Choose a variable"
  footer
    action "Send a test"
    action primary "Save message"
```

**Rationale:** Klaviyo and Mailchimp draw template variables as chips inside the sentence, because a variable is a word with a value, not code. You read the message as the customer will, with the facts marked.

**Cost:** Chips inside an editable body are a small rich-text editor, not a `textarea`. Backspace across a chip, paste with chips, and undo all need answers. The plain-text option exists for that reason.

**Reference:** Mailchimp

#### `side-by-side-preview-of-the-customer-message`: Side-by-side preview of the customer message

```wireframe
page
  breadcrumb "Home" "Settings" "Email" "Goods dispatched"
  header
    heading "Goods dispatched"
    text "The message a customer looks for."
  split 1:1
    region "Edit"
      field "Subject" text = "Your Acme Supply order is on its way"
      field "Body" textarea = "Hi customer, your order left the Amsterdam warehouse."
    card "Customer preview"
      heading small "Your Acme Supply order is on its way"
      text "Hi Maria Garcia,"
      text "Your order SO-1042 left the Amsterdam warehouse. It arrives Sat 14 Mar 2026, 08:00 to 12:00."
      text muted "Acme Supply, Canal Street 12, 1011 AB Amsterdam"
  footer
    action "Send a test"
    action primary "Save message"
```

**Rationale:** Postmark and SendGrid preview a template beside the editor with a real record filled in, because a variable is only proven by its value. The order of Maria Garcia fills every variable this template holds.

**Cost:** Two columns collapse to one on a phone, so the preview sits below the editor and you scroll between them. A long template makes a long round trip.

**Reference:** Postmark

#### `plain-text-with-a-variable-list-beside-it`: Plain text with a variable list beside it

```wireframe
page
  breadcrumb "Home" "Settings" "Email" "Goods dispatched"
  header
    heading "Goods dispatched"
    text "The message a customer looks for."
  split 1:1
    region "The message"
      field "Subject" text = "Your Acme Supply order is on its way"
      field "Body" textarea = "Hi customer, your order left the Amsterdam warehouse."
    region "Variables"
      fact "((customer name))" "Maria Garcia"
      fact "((order number))" "SO-1042"
      fact "((delivery window))" "08:00 to 12:00"
      text muted "Spelled with double brackets. The value fills when the mail is sent."
  footer
    action "Send a test"
    action primary "Save message"
```

**Rationale:** GOV.UK Notify writes templates as plain text with `((double bracket))` variables and lists each one beside the editor with an example value. Nothing about the message can break in a mail client that reads text.

**Cost:** Double brackets are learned, not guessed: `((delivery window))` with one bracket fails silently or loudly depending on the parser. The editor must highlight what it recognizes as you type.

**Reference:** GOV.UK

#### `one-tab-per-language`: One tab per language

```wireframe
page
  breadcrumb "Home" "Settings" "Email" "Goods dispatched"
  header
    heading "Goods dispatched"
    text "The message a customer looks for."
  tabs "Nederlands" "English"
    region "Nederlands"
      field "Subject" text = "Je bestelling is onderweg"
      field "Body" textarea = "Hi customer, je bestelling heeft het Amsterdamse magazijn verlaten."
      status "English is missing" caution
  footer
    action primary "Save message"
```

**Rationale:** Contentful and Shopify Translate keep one tab per locale with the missing ones badged. A customer reads exactly one language, and you know which ones exist. The badge names the gap instead of hiding it.

**Cost:** Two tabs are two templates to keep in step. A variable added to one is added to the other. The Dutch sentence grows while the English one waits. Tabs hide the drift they also cause.

**Reference:** Shopify

#### `the-send-refused-with-the-missing-variable-named`: The send refused with the missing variable named

```wireframe
page
  breadcrumb "Home" "Settings" "Email" "Goods dispatched"
  header
    heading "Goods dispatched"
    text "The message a customer looks for."
  message "Order number is missing. The body asks for ((order number)) and this test order holds none." critical
  region "The message"
    field "Subject" text = "Your Acme Supply order is on its way"
    field "Body" textarea = "Hi customer, your order is on its way."
    message "((order number)) has no value on this order. Add a fallback." critical
  footer
    action "Send a test"
    action primary "Save message"
```

**Rationale:** GOV.UK Notify refuses a send whose personalization is missing and names the variable. A blank where the order number belongs is worse than no mail. The message offers the fallback shape, not the complaint.

**Cost:** The refusal can only name what the test record lacks. A variable filled on the test order but empty on a real one still sends blank. Every variable needs a fallback, not a test.

**Reference:** GOV.UK

#### `a-sent-copy-with-the-values-filled-in`: A sent copy with the values filled in

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042" "Mail"
  header
    heading "Goods dispatched"
    text "Sent for order SO-1042."
  region "The sending"
    fact "To" "maria@garcia-interiors.example"
    fact "Sent" "8 Oct 2026, 09:33"
    fact "Order" "SO-1042"
    status "Delivered" positive
    text "Hi Maria Garcia,"
    text "Your order SO-1042 left the Amsterdam warehouse. It arrives Sat 14 Mar 2026, 08:00 to 12:00."
  footer
    action "Resend"
```

**Rationale:** Postmark activity keeps the sent copy with every variable filled. Reading what was sent settles a dispute about what the customer was told. The record is read-only: history does not take edits.

**Cost:** A copy per sending is storage that grows with every order, and each copy holds personal data under retention rules. The record must expire with the order, not live beside it.

**Reference:** Postmark

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/patterns/forms-and-fields#name-every-field-with-a-visible-label | guidance | Does every built screen of this kind keep this rule, including in its compact layout? |
| litespec/frontend/patterns/forms-and-fields#keep-entered-values-after-a-refused-submit | guidance | Does every built screen of this kind keep this rule, including in its compact layout? |
| litespec/frontend/patterns/forms-and-fields#money-field | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/forms-and-fields#choosing-a-record | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/forms-and-fields#date-and-time-field | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/forms-and-fields#text-field-and-its-states | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/forms-and-fields#choosing-one-of-a-few-options | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/forms-and-fields#switch-or-a-checkbox | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/forms-and-fields#upload-field | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/forms-and-fields#reporting-a-refused-submit | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/forms-and-fields#work-that-is-not-saved | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/forms-and-fields#picking-a-period | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/forms-and-fields#slug-or-url-field-with-a-preview | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/forms-and-fields#capacity-field | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/forms-and-fields#color-field-for-the-storefront-accent | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/forms-and-fields#repeatable-group-for-price-tiers | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/forms-and-fields#tag-input | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/forms-and-fields#address-field | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/forms-and-fields#email-body-editor | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
