# Create, Edit and Remove Patterns

## Intent

Staff create records such as orders, deliveries, and products, change them, and remove one or several, including the special cases: draft-first creation, corrections to the past, duplicates, hand ordering, restoring archived work, invitations, publishing, and scheduled changes. This page shows the layout for each task as drawn options with a named default to build. The product owner chooses among the options when the team builds or revises a working screen. One decided shape per task keeps destructive and far-reaching commands predictable, so staff know what a command will do before they commit.

## Concepts

### How to read a pattern

Each pattern answers one recurring question about working with records, such as how many inputs keep a create in a dialog. It states the question, the default option a project builds, how the default behaves on a narrow screen, and why the default won. Each option then shows one wireframe drawing with its own rationale, cost, and optional reference. A project records its choice in its pattern catalog and builds the chosen option with its own components. The [UI patterns](../patterns.md) page states the catalog contract and the wireframe language.

### The running example

The drawings on this page use the Acme Supply back office: deliveries such as Garcia Interiors restock, orders such as SO-1042 for Maria Garcia, and products such as the Oak desk lamp at EUR 45.00. On this page, the reader is the staff member using the screen. The Standards section states the two rules every option keeps: every removal offers undo or asks for confirmation, and a successful create shows the created record.

## Standards

### Confirm or undo every removal

**Statement:** Every removal MUST either offer undo or ask for confirmation before it runs.

**Rationale:** Staff remove the wrong record by misreading a row or misclicking, and without a way back the record is gone. An undo toast restores a reversible removal in one click, while a confirmation dialog makes an irreversible removal a deliberate choice. Either way the reader gets a moment to catch the mistake before it becomes permanent.

### Show the created record

**Statement:** A successful create MUST take the reader to the created record or show it in place.

**Rationale:** After creating, the reader needs proof that the record exists with the values entered, and the created record itself is that proof. A create that ends on an empty form or a bare toast leaves the reader unsure whether it worked, so they create it again and produce a duplicate.

## Patterns

### Creating one record

**Question:** Staff create records such as deliveries, refunds, and products. A create with one to four inputs fits a dialog, and a longer one needs a page; a drawer never holds a create. The decision is which shape each create takes: dialog, page, template, copy, inline row, file import, steps, or a shortcut from elsewhere.

**Default:** `a-dialog-for-two-or-three-inputs`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The dialog stays the pick for one to four inputs: it keeps the list behind it and commits with one verb. The full page is the runner-up and the right one past four inputs or with sections. The inline table row is the one to refuse, because a form inside a table breaks the table structure and hides validation. Of the further options, the split button earns its place on the deliveries list, where three starting points already exist.

#### `a-dialog-for-two-or-three-inputs`: A dialog for two or three inputs

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042" "Delivery" "Plan"
  header
    heading "Garcia Interiors restock"
    text "Delivery plan, 6 entries."
    action "Add to the plan"
  region "Delivery plan"
    list 3
      item: text "Loading bay booked" · text muted "08:00" · text muted "Chris Novak"
  dialog "Add to the delivery plan"
    field "What" text
    field "When" text = "06:30"
    field "Who" text
    action "Cancel"
    action primary "Add it"
```

**Rationale:** The dialog holds three inputs, one verb on the commit button, and Cancel beside it. This is where most creates belong and where they usually end up.

**Cost:** A create that grows past four inputs has to leave the dialog. The typed values come with it or are lost.

#### `a-full-page-for-the-ones-that-grow`: A full page for the ones that grow

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Start with a name. Everything else can wait."
  region "The delivery"
    field "Name" text
    field "Description" textarea
  region "When"
    field "Loading starts" text
    field "Departs" text
  region "Where"
    field "Warehouse" select = "Amsterdam warehouse"
    action "Cancel"
    action primary "Create delivery"
```

**Rationale:** The form pages with sections, steps, or more than four inputs. A page gives the fields room and gives the result a link.

**Cost:** Leaving the list to create one record, and coming back to the list afterwards, is two navigations for every single creation. It only pays when the form is long.

#### `create-from-a-template-chosen-before-the-form`: Create from a template, chosen before the form

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Start from last time, or from nothing."
  region "Start from"
    field "Start from" select = "A template"
    text muted "A template carries a customer, a warehouse and a delivery plan."
  region "The delivery"
    field "Template" select = "Restock, standard"
    field "Name" text = "Garcia Interiors restock"
    field "When" text = "09/10/2026"
    action "Cancel"
    action primary "Create delivery"
```

**Rationale:** One shape offers 'A blank delivery' or 'A template' at the top of the form. Choosing first means the fields below load with the template's customer, warehouse, and plan already filled.

**Cost:** The starter control sits inside the form but is not part of it. Once a template is chosen the control stays visible with no further use, because the form cannot remove a control mid-create.

#### `create-from-a-copy-of-an-existing-record`: Create from a copy of an existing record

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Deliveries"
    text "93 scheduled."
    action "New delivery"
  toolbar
    field "Search deliveries" search
  region "Scheduled"
    list 3
      item: text "Garcia Interiors restock" · text muted "9 Oct 2026" · status "Scheduled" info · action "Open"
  menu "More actions for Garcia Interiors restock"
    action "Open"
    action "Duplicate this delivery"
    action "Copy the plan to another"
```

**Rationale:** Duplicate a delivery that worked, and then change what is different. The copy carries products and a plan, and it starts as a draft with nothing committed.

**Cost:** A duplicate of a shipped delivery is nearly meaningless: the orders and the money all belong to the original. It only works for a template-like record with no history.

#### `create-inline-in-the-table-as-an-empty-first-row`: Create inline in the table, as an empty first row

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders to decide. None of these is a refund yet."
    action primary "Start a refund"
  region "New refund"
    field "Order" text = "SO-1042"
    field "Route" select = "Bank refund"
    field "Amount" number = "45.00"
    action "Cancel"
    action primary "Add"
  table 4 "Order" "Customer" "Asked" "Amount"
    item: text "SO-1041" · text "Elin Lindqvist" · text "214 days ago" · text "EUR 45.00"
```

**Rationale:** The table grows a form row at the top. Nothing opens, nothing closes, and the reader sees what they are adding in the context of what is already there.

**Cost:** Carbon says a modal is for tasks that are not repeated, and this is the most repeated create in the back office. It also puts a form inside a table, where tables hold rows and no rule covers embedded forms.

#### `create-many-at-once-from-a-file`: Create many at once from a file

```wireframe
page
  breadcrumb "Home" "Settings" "Data imports" "New"
  header
    heading "Import products"
    text "Bring in a list you already hold. Nothing is published until you check it."
  region "Your file"
    field "Drop a CSV here or choose a file" file
    text muted "Up to 5 MB, 2,000 rows. UTF-8, comma separated."
    link "Download a template"
  region "What will happen"
    text "One product per row, as a draft. Nothing is charged and nothing is sent."
    action "Cancel"
    action primary "Check the file"
```

**Rationale:** A bulk create runs in three steps: the file, a check of what it made, and a report. This is the shape for a season of products or a list of customers, where one dialog per record would take all day.

**Cost:** An import writes across many records at once. A partial failure has to be reportable and undoable while nothing is charged.

#### `one-question-per-step-kept-as-a-draft`: One question per step, kept as a draft

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Step 2 of 3. Every answer is kept as a draft."
  region "When is it"
    field "Loading starts" text = "14/03/2026 06:30"
    field "Departs" text
  region "Already answered"
    fact "Name" "Garcia Interiors restock"
    fact "Warehouse" "Amsterdam warehouse"
  region "Draft"
    message "This draft was started 6 minutes ago. It stays a draft until step 3 is done." info
    action "Back"
    action primary "Continue"
```

**Rationale:** A long create split into one question per step with a progress bar and an already-answered recap. Nothing is lost between steps because every answer saves a draft.

**Cost:** Steps hide the whole form, so a reader who knows every answer types slower than on one page. Drafts also need a list, an expiry, and a rule for who can see them.

#### `a-split-button-that-names-the-starting-point`: A split button that names the starting point

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Deliveries"
    text "93 scheduled."
    action primary "New delivery"
    action quiet "Next ›"
  region "Scheduled"
    list 3
      item: text "Garcia Interiors restock" · text muted "9 Oct 2026" · status "Scheduled" info · action "Open"
  menu "More ways to create a delivery"
    action "Blank delivery"
    action "From a template"
    action "Duplicate Garcia Interiors restock"
```

**Rationale:** The way Shopify Polaris draws a split button: the main face creates a blank delivery. The chevron names the other ways to start. Three starting points already exist on this list, and this is the control that holds them without a toggle inside the form.

**Cost:** The chevron hides the template and the duplicate from anyone who never opens it. A first-time user still lands on the blank form and never learns the faster start exists.

**Reference:** Shopify Polaris

#### `a-command-menu-create-from-anywhere`: A command menu create, from anywhere

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Deliveries"
    text "93 scheduled. Press Ctrl K to create from anywhere."
    action "New delivery"
  region "Scheduled"
    list 2
      item: text "Garcia Interiors restock" · text muted "9 Oct 2026" · status "Scheduled" info
  dialog "Create something"
    field "What to create" search = "Create delivery"
    action "Create delivery"
    action "Create product"
    action "Create discount"
```

**Rationale:** The way Linear opens creation: one shortcut, one input, and the record type is chosen by typing. A manager who lives in the back office creates without traveling to the list first.

**Cost:** It stays invisible until learned, and it only starts the create. The form still opens afterwards. It needs the shortcut taught on the page, or nobody finds it.

**Reference:** Linear

### Changing a record that already exists

**Question:** Staff change records that already exist, from renaming a delivery to raising a stock target. The decision is how the edit commits: one save per page, one per section, inline in the list, in a dialog or side panel, with impact stated first, blocked with a way out, or saved automatically. The hazard to avoid is the reader who edits one section and saves another, believing both are saved.

**Default:** `one-save-per-page`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** One Save per page is the pick. A reader who changed three things saves once, and the dirty banner says what is pending. The impact statement is the runner-up for any change that breaks something. Refuse the inline list-row edit on this wide table. Autosave earns its place only for free text, beside the version history in the after-the-fact pattern.

#### `one-save-per-page`: One Save per page

```wireframe
page
  breadcrumb "Home" "Products" "Desk lamps" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "On sale" positive
    text "What this product is, and the labeling rule its units carry."
  region "Edits"
    message "Two changes not saved. The warehouse still shows the old ones." info
    field "Name" text = "Oak desk lamp"
    field "Description" textarea = "Solid oak desk lamp with a linen shade."
    field "Labeling" radio = "Batch label"
    action "Discard both"
    action primary "Save 2 changes"
```

**Rationale:** The whole page is one form and one Save. A reader who has changed three things saves once, and nothing on the page disagrees about what is pending.

**Cost:** A partial failure loses every change on the page, and a reader who wants to save the name but leave the dates cannot. The page has to list what changed while edits are unsaved.

#### `one-save-per-section-and-each-says-what-it-saves`: One Save per section, and each says what it saves

```wireframe
page
  breadcrumb "Home" "Products" "Desk lamps" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "On sale" positive
  region "The name"
    status "Not saved" caution
    field "Name" text = "Oak desk lamp"
    field "Description" textarea = "Solid oak desk lamp with a linen shade."
    action primary "Save the name"
  region "Unit labeling"
    field "Labeling" radio = "Batch label"
    action primary "Save the labeling"
```

**Rationale:** Each section's button repeats its own verb: Save the name, Save the labeling. Nothing is ambiguous about what each button commits.

**Cost:** It still makes two commits on one screen, so the reader must remember to press both buttons. It works only because each button names what it commits.

#### `editing-in-place-in-the-list-row`: Editing in place in the list row

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Deliveries"
    text "93 scheduled."
    action primary "New delivery"
  toolbar
    field "Search deliveries" search
  table 4 "Delivery" "Date" "State" "Committed"
    item: field "Name" text = "Garcia Interiors restock" · field "Date" text = "09/10/2026" · status "Scheduled" info · action "Save" · action "Cancel"
```

**Rationale:** One cell becomes an input, the row looks different while it does, and Save and Cancel sit in the row. NN/g's rule: the row must visibly change or people edit by accident.

**Cost:** It works only on a narrow table. This table has five columns, which is past the width NN/g means by narrow.

**Reference:** NN/g

#### `editing-with-the-impact-stated-before-the-save`: Editing with the impact stated before the save

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Stock"
  header
    heading "Raise the stock target"
    text "Amsterdam warehouse holds 500 Oak desk lamps. 412 are committed."
  region "New target"
    field "Units in stock" number = "600"
    message "Two things happen when you save this. 188 more units go on sale at EUR 45.00." caution
    text "Listed on the storefront within a minute. No way to take them back once sold."
  region "Nothing here changes"
    fact "Committed" "412 units"
    fact "Orders" "96 unchanged"
    fact "Bought units" "Stay at EUR 45.00"
    action "Cancel"
    action primary "Raise it and put 188 on sale"
```

**Rationale:** Where a change breaks something, the page says what before the reader commits: who is affected, what stops working, and what cannot be changed back.

**Cost:** It needs a read that answers a hypothetical, what would change, which is neither the record as it stands nor a command result.

#### `editing-in-a-dialog-for-two-fields`: Editing in a dialog, for two fields

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Deliveries"
    text "93 scheduled."
  region "Scheduled"
    list 3
      item: text "Garcia Interiors restock" · text muted "9 Oct 2026" · status "Scheduled" info · action "Rename"
  dialog "Rename this delivery"
    field "Name" text = "Garcia Interiors restock"
    text muted "Customers see this. 96 orders carry the old name on their paperwork."
    action "Cancel"
    action primary "Rename it"
```

**Rationale:** Two fields do not need a page. A dialog holds them, the list stays behind, and the reader sees the change in context as soon as it lands.

**Cost:** Carbon says a modal is not for repeatable work. Renaming a product happens a dozen times a season, which is repeatable enough to matter.

#### `editing-blocked-with-the-reason-and-the-way-out`: Editing blocked, with the reason and the way out

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Pricing"
  header
    heading "Pricing"
    text "Oak desk lamp went on sale 12 Jan 2026. EUR 45.00 is the price the 412 sold units carry."
  region "Standard"
    field "Standard, in euros" number = "45.00"
    message "The price the customers who already bought were charged. It cannot change." neutral
    action disabled "Change the price everyone paid"
    link "Price the remaining stock instead"
  region "Still on sale"
    field "Price for the 88 units still on sale, in euros" number = "50.00"
    action primary "Save the new price"
```

**Rationale:** This is a change that the record's own state forbids. The field is read-only, the reason is stated on the field, and the command that would unblock it is named.

**Cost:** The reader must leave to unblock and come back, and typed input survives only if the page holds it. Showing the field read-only with a link to the unblocking command is the middle ground.

#### `autosave-with-the-saved-state-always-visible`: Autosave, with the saved state always visible

```wireframe
page
  breadcrumb "Home" "Products" "Desk lamps" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "On sale" positive
    text "Saved 14:22."
    action "History"
  region "Notice"
    message "Every change saves as you type. The warehouse reads the saved version within a minute." info
  region "The product"
    field "Name" text = "Oak desk lamp"
    field "Description" textarea = "Solid oak desk lamp with a linen shade."
    field "Labeling" radio = "Batch label"
```

**Rationale:** The way Notion saves: there is no Save button, every keystroke lands, and the header always says when. A description edited over an afternoon cannot be lost to a closed tab.

**Cost:** Two people typing at once overwrite each other without noticing, and every keystroke is an audit entry unless the trail groups them. It fits free text, not prices or counts.

**Reference:** Notion

#### `edit-in-a-side-panel-the-list-still-visible`: Edit in a side panel, the list still visible

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Deliveries"
    text "93 scheduled."
  region "Scheduled"
    list 3
      item: text "Garcia Interiors restock" · text muted "9 Oct 2026" · status "Scheduled" info · action "Rename"
  drawer right "Rename this delivery"
    field "Name" text = "Garcia Interiors restock"
    field "Loading starts" text = "09/10/2026 06:30"
    action "Cancel"
    action primary "Save"
```

**Rationale:** The way HubSpot edits a record: the list stays on screen and the form opens beside it. Renaming twelve deliveries in a row means twelve saves without twelve page loads.

**Cost:** It breaks the rule that a form is a dialog or a page, never a drawer. Create and edit would then disagree about where a form lives. The panel is also too narrow for sections or steps.

**Reference:** HubSpot

### Removing something

**Question:** Staff remove records that should no longer be active. The decision is which kind of removal each record gets: archive, delete, blocked removal with the blocker named, reversal for money, void for codes, suspend for running services, a thirty-day trash, or an undo toast. Archive is preferred over delete because it is reversible and keeps the audit trail.

**Default:** `archive-with-what-archiving-means`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Archive stays the pick. It is reversible, it keeps the audit trail, and the Archived view is the way back. The thirty-day trash is the runner-up where delete is the verb the reader reaches for. Never ship a bare delete for anything with history. The delete dialog is only for records that have to go, and it says what is kept. The Undo toast earns its place for small reversible removes such as a plan entry.

#### `archive-with-what-archiving-means`: Archive, with what archiving means

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Deliveries"
    text "93 scheduled, 4 archived."
    action "New delivery"
  toolbar
    field "Search deliveries" search
  region "Scheduled"
    list 3
      item: text "Garcia Interiors restock" · text muted "9 Oct 2026" · status "Scheduled" info · action "Open"
  region "Archived"
    list 1
      item: text "Okafor Office restock" · text muted "28 Feb 2026" · status "Archived" neutral · action "Restore"
  menu "More actions for Garcia Interiors restock"
    action "Open"
    action "Duplicate this delivery"
    action destructive "Archive this delivery"
```

**Rationale:** Archive is the default removal. The dialog says what stops being visible and what is kept, and the record keeps its place with a state that says it is archived.

**Cost:** The reader now has two ways to hide something, archive and delete. A list that shows both needs a view or a filter separating them.

#### `delete-where-nothing-may-be-archived`: Delete, where nothing may be archived

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock" "Incidents" "INC-0207"
  header
    heading "Incident INC-0207"
    text "14 Mar 2026, loading bay."
    action destructive "Delete"
  region "What was recorded"
    fact "Who" "A driver, no name given"
    fact "When" "14 Mar 2026, 08:41"
    fact "Who decided" "Chris Novak"
    fact "Why" "The original could not be produced, so nothing was handed over"
  dialog "Delete this incident?"
    text "The incident record is removed. The dispatch log keeps the decision and the time."
    message "This cannot be undone. Nothing about the decision is lost." critical
    action "Keep it"
    action destructive "Delete the record"
```

**Rationale:** Some records must go rather than be hidden. The dialog says the record is gone for good, and it names what is kept, because the dispatch log still holds the decision and the time.

**Cost:** Everything the company holds has to stay reconstructable for an audit, which means 'delete' removes the operational record and keeps the evidence. Two different things under one verb.

#### `removal-blocked-naming-what-blocks-it`: Removal blocked, naming what blocks it

```wireframe
page
  breadcrumb "Home" "Orders" "Okafor Office restock"
  header
    heading "Okafor Office restock"
    text "3 Nov 2026, Rotterdam warehouse. 1,204 orders."
    action destructive "Archive"
  dialog "This delivery cannot be archived yet"
    text "Two product lines are still open. Open lines are promised to customers."
    fact "Oak desk lamp" "412 of 500 committed. Open."
    fact "Pine bookshelf" "0 committed. Open."
    action "Close the line"
    action primary "Close both lines first"
```

**Rationale:** The command cannot run because something depends on the record. The dialog names the dependency and the command that deals with it, rather than refusing with a bare code.

**Cost:** No cited design system publishes this pattern. It is an inference from two existing cases: the Cloudscape disabled button and the explained refusal for a blocked edit.

#### `reversal-rather-than-removal-for-money`: Reversal rather than removal, for money

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Refunded" neutral
    text "Fully refunded 8 Oct 2026, 11:04, by Priya Shah."
    action "Message customer"
  region "The money, before and after"
    fact "Paid by the customer" "EUR 125.00"
    fact "Refunded in full" "EUR 125.00"
    fact "Still to refund" "EUR 0.00"
  region "What was ordered"
    list 2
      item: text "Oak desk lamp, 2 units" · text muted "Returned at 11:04" · status "Returned" neutral
```

**Rationale:** A refund does not remove an order. It reverses the order and leaves the record. The customer is shown the order before and after, so the reversal is visible as a fact rather than an absence.

**Cost:** The record grows rather than shrinks. A list of orders has to show an order that was fully reversed without it looking empty.

#### `void-where-the-record-must-stay-but-stop-counting`: Void, where the record must stay but stop counting

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042" "Codes"
  header
    heading "SO-1042"
    text "2 codes, both unused."
    action destructive "Void a code"
  region "Discount codes"
    list 2
      item: text "EUR 10.00 off" · text muted "VC-0C893968A2" · status "Not used" neutral · action "Void it"
  dialog "Void this code"
    message "VC-0C893968A2 stops working at once. Maria Garcia needs a replacement." caution
    field "Send Maria Garcia the replacement now" checkbox
    field "Keep the reason on the record" checkbox
    action "Cancel"
    action destructive "Void and replace"
```

**Rationale:** This is a code that was issued and is now withdrawn. The code stops working, the code stays on the order, and the record says why.

**Cost:** Void and refund are different verbs for different effects and a reader has to know which is which. Voiding a code that was already used is refused outright, because the order log holds that.

#### `suspend-for-something-that-must-keep-running`: Suspend, for something that must keep running

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    status "Paused" caution
    text "Paused since 2 Oct 2026, 14:22."
    action primary "Take it off pause"
  region "Notice"
    message "Nothing can be bought here. Orders already placed still ship." caution
    action "See the message customers get"
  region "What is still true"
    fact "Address" "shop.acme-supply.example"
    fact "Products listed" "48 on sale"
    fact "Orders placed" "1,204, all unchanged"
  region "What a customer sees"
    text "This shop is not taking orders at the moment. Orders already placed still ship."
```

**Rationale:** Pause the record rather than removing it. The record keeps every property and stops accepting what it accepts. The page says what is still possible while it is paused.

**Cost:** A pause is invisible to a customer unless something tells them. The same page has to answer what happens to somebody who tries to order while this is paused.

#### `trash-with-thirty-days-to-change-your-mind`: Trash with thirty days to change your mind

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Deliveries"
    text "93 scheduled, 3 in the trash."
    action destructive "Empty the trash"
  toolbar
    field "Search deliveries" search
  region "Notice"
    message "The trash empties itself after 30 days. Placed orders are never in it." info
  region "Trash"
    list 3
      item: text "Okafor Office restock" · text muted "Deletes 7 Nov 2026" · action "Restore" · action destructive "Delete now"
```

**Rationale:** The way Google Drive removes: delete moves the record to a trash that empties itself after thirty days. The verb stays delete, which is what the reader reaches for, and the reversibility stays too.

**Cost:** There is still a day when the record goes for good. The trash needs its own view, its own emptying rule, and an answer for records with placed orders.

**Reference:** Google Drive

#### `no-confirmation-one-undo-in-a-toast`: No confirmation, one Undo in a toast

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042" "Delivery" "Plan"
  header
    heading "Garcia Interiors restock"
    text "Delivery plan, 5 entries."
    action "Add to the plan"
  region "Delivery plan"
    list 3
      item: text "Loading bay booked" · text muted "08:00" · text muted "Chris Novak"
  toast "Jordan Lee on customer messages was removed. Undo within 8 seconds." info
```

**Rationale:** The way Gmail removes mail: the command applies at once and the toast carries the way back for eight seconds. Removing a plan entry is too small for a dialog and exactly the size of an Undo.

**Cost:** It only fits what is cheap to reverse. Money, orders, and anything the audit trail holds still need the dialog that says what happens. An Undo that expires is not a record.

**Reference:** Gmail

### Removing several at once

**Question:** Staff remove or refund several records at once. The count itself is the risk, so the reader checks how many records and how much money are involved before committing. The decision is how the confirmation carries that check for small and large selections.

**Default:** `a-dialog-naming-the-count-and-the-money`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The dialog naming the count and the money stays the pick up to about twenty-five rows. The two figures are what the reader checks. The background job is the runner-up past that size, where a report lands afterwards. Never ship the typed count for an ordinary bulk remove. The dry-run plan earns its place where rows can refuse.

#### `a-dialog-naming-the-count-and-the-money`: A dialog naming the count and the money

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders. 3 selected."
    action primary "Refund these 3"
  table 3 "Order" "Customer" "Amount"
    item: text "SO-1042" · text "Maria Garcia" · text "EUR 90.00"
  dialog "Refund 3 orders in full?"
    fact "Maria Garcia, SO-1042" "EUR 90.00"
    fact "Tom Becker, SO-1041" "EUR 40.45"
    fact "Elin Lindqvist, SO-1040" "EUR 45.00"
    fact "Total going back" "EUR 175.45"
    action "Cancel"
    action destructive "Refund 3 orders"
```

**Rationale:** A bulk refund confirmation, which lists the records and totals the money before the commit button. The count and the amount are the two things a reader must check.

**Cost:** Twenty-five rows in a dialog mean scrolling inside a dialog. Past about five rows the total carries the meaning, and few readers check each line.

#### `a-dialog-that-names-the-scope-it-is-about-to-use`: A dialog that names the scope it is about to use

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders. 25 on this page are selected."
  region "Scope"
    message "All 25 on this page are selected. 1,204 refunds match this filter in total." info
    action "Select all 1,204 instead"
  table 3 "Order" "Customer" "Amount"
    item: text "SO-1042" · text "Maria Garcia" · text "EUR 90.00"
  dialog "Refund the 25 on this page?"
    text "Only these 25, out of the 1,204 refunds that match this filter."
    fact "Order money going back" "EUR 1,204.50"
    fact "Taken off the Acme Supply balance" "EUR 1,204.50"
    message "6 of the 25 are older than 180 days. This method will not take those back." caution
    action "Cancel"
    action destructive "Refund these 25"
```

**Rationale:** Where the selection could be page-scoped or filter-scoped, the dialog says which. Gmail's banner exists for exactly this and Shopify documents the same escalation.

**Cost:** Two sentences of scope in a dialog about money, and the reader has to check the number as well as the amount. Both are worth checking, and the dialog carries both.

**Reference:** Gmail

#### `bulk-removal-as-a-bulk-archive-then-a-dialog-for-the-record`: Bulk removal as a bulk archive, then a dialog for the record

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Deliveries"
    text "241 in all. 4 selected."
  toolbar
    field "Search deliveries" search
  region "Selection"
    text "4 selected, all completed, none scheduled."
    action "Clear"
    action "Restore"
    action primary "Archive these 4"
  region "Deliveries"
    list 3
      item: text "Okafor Office restock" · text muted "9 Oct 2026, completed" · action "Open"
```

**Rationale:** Archive is cheap and reversible, so a bulk archive needs only a count in the selection bar, not a dialog listing every record.

**Cost:** Archiving 200 deliveries hides 200 deliveries, and the reader has no way back except an Archived view. The safety net is the view, not the dialog.

#### `a-partial-bulk-refusal-some-rows-will-not-do-it`: A partial bulk refusal: some rows will not do it

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds"
  header
    heading "Refunds"
    text "31 orders. 3 selected."
  table 3 "Order" "Customer" "Amount"
    item: text "SO-1042" · text "Maria Garcia" · text "EUR 90.00"
  dialog "Refund 1 of the 3?"
    text "Two of these are outside the refund window, so the bank will refuse them."
    message "SO-1042, EUR 90.00. Maria Garcia, 6 days old. The bank will take this one." positive
    message "SO-1040, EUR 45.00. Elin Lindqvist, 181 days old. Outside the window." critical
    message "SO-1038, EUR 45.00. Ade Okafor, 214 days old. Outside the window." critical
    action "Cancel"
    action destructive "Refund the one that works"
```

**Rationale:** When some of the selection cannot take the command, the dialog says which and why before anything runs, and offers to do the rest.

**Cost:** A partial result has to be reportable afterwards as well, so the reader ends up reading the same information twice. Better to refuse the whole batch and let them narrow it.

#### `a-typed-confirmation-for-a-bulk-removal`: A typed confirmation for a bulk removal

```wireframe
page
  breadcrumb "Home" "Settings" "Data imports" "IMP-4F82C1A9"
  header
    heading "Data imports"
    text "4 imports. 1 holds 1,988 orders."
    action destructive "Undo this import"
  region "What was imported"
    fact "Orders created" "1,988"
    fact "Order lines created" "2,361"
    fact "Amount charged to anybody" "EUR 0.00"
  dialog "Undo this import?"
    text "This removes 1,988 orders and 2,361 order lines."
    field "Type 1,988 to confirm" text
    action "Keep the import"
    action disabled "Undo the import"
```

**Rationale:** Where a bulk removal is genuinely dangerous, type the count. The number is the thing being confirmed, not the name of one record.

**Cost:** Typing 200 trains copy and paste, which is the reflex the pattern exists to break. Cloudscape's own restriction is to the most dangerous object, and this is many objects.

#### `a-bulk-removal-that-is-a-cancellation-with-consequences-per`: A bulk removal that is a cancellation, with consequences per row

```wireframe
page
  breadcrumb "Home" "Orders" "Plans" "March restock plan"
  header
    heading "March restock plan"
    text "Four deliveries, 214 units committed between them."
    action destructive "Cancel the plan"
  table 3 "Delivery" "Date" "Committed"
    item: text "Delivery 8" · text "27 Oct 2026" · text "86"
  dialog "Cancel the March restock plan?"
    text "86 units were delivered on delivery 8. That delivery cannot be called back."
    text "128 units on deliveries 9 and 10 would be refunded, EUR 5,760.00 in total."
    message "The 86 delivered units are with the customers. Nothing here can undo that." critical
    action "Keep the plan"
    action destructive "Cancel the plan"
```

**Rationale:** Canceling a plan of deliveries is one command with several effects, and the dialog lists them per row rather than as a total. What the reader needs is not the sum but which deliveries have customers.

**Cost:** A dialog that varies per row is a table in a dialog, which is a page. Past a handful of rows, the consequence list belongs on a page of its own.

#### `a-background-job-with-a-report-for-the-large-ones`: A background job with a report, for the large ones

```wireframe
page
  breadcrumb "Home" "Orders" "Bulk jobs"
  header
    heading "Bulk jobs"
    text "One running. Reports land here and stay."
    action "New bulk refund"
  region "Running now"
    status "Running" info
    text "Refund 1,204 orders in full. Started 8 Oct 2026, 14:22 by Priya Shah."
    figure "Done" "746 of 1,204"
    action "Cancel the rest"
  region "Finished"
    list 2
      item: text "Archive 200 completed deliveries" · text muted "Finished 8 Oct 2026, 11:04" · status "200 archived" positive · action "Read the report"
```

**Rationale:** The way Shopify runs bulk operations: past a size no dialog can carry, the selection runs as a job, and a report lands afterwards. Refunding 1,204 orders cannot be checked on screen, so it is checked in the report instead.

**Cost:** The reader walks away and comes back, so the job needs progress, a cancel, and a report that names every row it refused. A job that fails halfway also needs a rule for what already ran.

**Reference:** Shopify

#### `a-dry-run-first-the-way-a-migration-previews`: A dry run first, the way a migration previews

```wireframe
page
  breadcrumb "Home" "Orders" "Refunds" "Plan"
  header
    heading "Plan: refund 3 orders"
    text "Nothing has run. This is what would happen."
  table 3 "Order" "Customer" "What would happen"
    item: text "SO-1042" · text "Maria Garcia" · status "Will refund" positive
  region "Two orders are outside the window"
    message "Offer credit or record a bank transfer for those two instead." caution
    fact "1 order, on the original payment" "EUR 90.00"
    action "Back to the selection"
    action "Discard the plan"
    action destructive "Apply to the 1 that works"
```

**Rationale:** This option works the way Terraform plans before it applies. A page says what each row will do, so the refusals are read before anything runs rather than after. Three rows fit, and three hundred still fit, because it is a page.

**Cost:** The plan can go stale between reading and applying: a payment can settle, and a window can close. The apply step must recheck every row and say which answer changed.

**Reference:** Terraform

### Creating a record and then filling it in

**Question:** A new record such as a delivery needs a name, a date, a warehouse, a priced product, and a channel before it can sell, but staff may not know all five at once. The decision is how much a create requires up front and how the record gets finished: name-only draft, everything required, series defaults, checklist, wizard, nothing until publish, home-page guide, or point-of-use nudges.

**Default:** `create-with-a-name-fill-the-rest-later`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Create with a name and fill the rest later stays the pick. The record exists as a draft and every later addition is its own audited command. The home-page setup guide is the runner-up and the required companion, because a draft nobody finishes is a dead record. Never ship the everything-required option or the nothing-until-publish option. The point-of-use nudge earns its place beside the checklist for readers who skip guides.

#### `create-with-a-name-fill-the-rest-later`: Create with a name, fill the rest later

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock"
  header
    heading "Garcia Interiors restock"
    status "Draft" neutral
    text "Nothing about it is scheduled yet."
    action primary "Finish it"
  region "Notice"
    message "A draft cannot take money. It needs a date, a warehouse, one priced product and a channel." info
  region "Four things this delivery still needs"
    fact "Name" "Garcia Interiors restock. Set on 8 Oct 2026."
    fact "When and where" "No date, no warehouse."
    fact "A product, priced" "Nothing to order yet."
    action "Set the date and warehouse"
```

**Rationale:** The name is the only required field, and the record exists as a draft. Every later addition is its own audited and reconstructable command.

**Cost:** A draft delivery is nearly useless on its own. If nothing prompts the reader to finish it, it sits unfinished on a list. The home-page setup guide is what prompts the reader to finish it.

#### `everything-required-before-the-record-exists`: Everything required before the record exists

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Five things. A delivery cannot exist without them."
  region "The delivery"
    field "Name" text
    field "Description" textarea
  region "When and where"
    field "Loading starts" text
    field "Departs" text
    field "Warehouse" select = "Amsterdam warehouse"
  region "What is on sale"
    field "Product name" text = "Oak desk lamp"
    field "Price, in euros" number = "45.00"
    action "Cancel"
    action primary "Create the delivery"
```

**Rationale:** The record is not created until it is whole: name, date, warehouse, one product, and one channel. Nothing half-made is ever in a list.

**Cost:** It asks for a five-part form before anything exists, and a reader who only wants to pencil in a date has to do all of it.

#### `create-from-a-series-where-the-series-holds-the-parts`: Create from a series, where the series holds the parts

```wireframe
page
  breadcrumb "Home" "Orders" "Plans" "March restock plan" "New delivery"
  header
    heading "New delivery"
    text "The March restock plan runs four deliveries. This is the fifth."
  region "What this delivery takes from the plan"
    fact "Warehouse" "Amsterdam warehouse. Shared."
    fact "Products" "Oak desk lamp, Pine bookshelf. Shared."
    fact "Delivery plan" "6 entries. Shared."
    fact "Team" "Nobody assigned for this date. Not shared."
  region "What this delivery sets"
    field "Date" text = "24/11/2026"
    field "Loading starts" text = "06:30"
    action "Cancel"
    action primary "Create the delivery"
```

**Rationale:** The plan carries the warehouse, the delivery plan, and the products, and each delivery is created already holding them. One create makes many records with no repetition.

**Cost:** A delivery created from a plan can be edited away from it, and then the two disagree. The plan has to state which fields are shared and what diverging means.

#### `a-checklist-that-closes-itself`: A checklist that closes itself

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock"
  header
    heading "Garcia Interiors restock"
    status "Draft" neutral
    text "14 Mar 2026, loading 06:30, Amsterdam warehouse."
    action primary "Publish"
  region "Before this can sell"
    field "Name and description" checkbox = "Done"
    field "Date, hours and warehouse" checkbox = "Done"
    field "A product, priced" checkbox = "Done"
    field "List it on the storefront" checkbox
    action "List it"
    field "Write the dispatch plan" checkbox
    action "Set it up"
```

**Rationale:** After creation, the page is a checklist and each item is a command. Finishing the last item removes the checklist rather than leaving a ticked list.

**Cost:** A checklist on every draft is a page of work before anything is usable. It is one more place that has to know which commands are already done.

#### `create-inside-a-wizard-that-ends-at-publish`: Create inside a wizard that ends at publish

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery"
  header
    heading "New delivery"
    text "Step 2 of 4, the products. Stopping now keeps a draft."
  region "The products"
    status "Priced" positive
    field "Price, in euros" number = "45.00"
    field "Units" number = "500"
    action "Add a second product"
  region "Steps"
    text "1 The delivery, done. 2 The products, now. 3 Where it sells. 4 Publish."
    action "Save and close"
    action "Back"
    action primary "Continue"
```

**Rationale:** One flow from nothing to on sale: the delivery, its products, its channel, and the publish step. The reader never lands on a draft they have to finish by hand.

**Cost:** Carbon says simplify before a wizard, and a stepper is only for a linear flow of three or more steps. Going on sale is linear, so this is the case a stepper exists for.

**Reference:** Carbon

#### `nothing-created-until-the-reader-says-publish`: Nothing created until the reader says publish

```wireframe
page
  breadcrumb "Home" "Orders" "New delivery" "Publish"
  header
    heading "Publish Garcia Interiors restock"
    text "Nothing has been saved yet. This is the last step."
  region "What will exist when you publish"
    fact "Delivery" "Garcia Interiors restock, 14 Mar 2026"
    fact "Place" "Amsterdam warehouse, 40 pallets"
    fact "Product" "Oak desk lamp, EUR 45.00"
    fact "Count" "One product, 500 units"
  region "Where it will sell"
    fact "Storefront" "shop.acme-supply.example, published"
    action "Back to the form"
    action primary "Publish it"
```

**Rationale:** The form holds everything in the browser and writes nothing until the last step. It makes one command, one audit entry, and one record per creation.

**Cost:** Losing the browser loses the work, and a five-step form held in memory is a lot to lose. The record's state during the form does not exist, so nothing else can read it.

#### `a-setup-guide-on-the-home-page-with-progress`: A setup guide on the home page, with progress

```wireframe
page
  breadcrumb "Home"
  header
    heading "Good afternoon, Sam Rivera"
    text "Two things need you today. Garcia Interiors restock is scheduled."
    action primary "New delivery"
  region "Finish the setup"
    figure "Done" "3 of 5"
    fact "Connect the bank payouts" "Connected 2 Oct by Sam Rivera."
    fact "Set the returns policy" "Still the default text."
    action "Set it"
    action quiet "Dismiss"
```

**Rationale:** The way Stripe onboards: the home page carries the setup as a guide with a progress bar, not as one more list. A reader who has finished three of five sees two left every time they sign in.

**Cost:** It sits at the top of the home page until it is done, and a guide nobody dismisses becomes a banner nobody reads. It needs a dismiss that stays dismissed per company, not per person.

**Reference:** Stripe

#### `nudges-at-the-point-of-use-not-a-checklist`: Nudges at the point of use, not a checklist

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock"
  header
    heading "Garcia Interiors restock"
    status "Draft" neutral
    text "Sat 14 Mar 2026, loading 06:30, Amsterdam warehouse."
  region "Publish"
    action disabled "Publish"
    message "Two things are missing: a priced product and a channel on sale." neutral
  region "Products"
    text "No product yet. A customer cannot order what has no price."
    action primary "Add a product"
  region "Storefront"
    text "Nothing is listed, so the storefront shows the delivery as coming soon."
```

**Rationale:** This option works the way Webflow gates publish. No checklist page: the missing piece is named where it is missing. The publish button says what it needs, and the section that needs it says so too.

**Cost:** Five missing pieces mean five separate discoveries, and nothing tells the reader how much is left. It fits one gap, not a new company with five.

**Reference:** Webflow

### Changing something that has already happened

**Question:** A record of what is true now cannot always be edited: a charge already priced must stay reconstructable for invoices and audits. The decision is which shape each after-the-fact change takes: old value kept beside the new, refusal with the newer way named, dated correction, scheduled window, scoped change, reversal, version history, or two-person approval.

**Default:** `the-old-value-stays-on-the-record-beside-the-new`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Keeping the old value beside the new stays the pick. An order placed last month still resolves to the delivery it was placed for. The dated correction is the runner-up where a fact was entered wrong, and the reversal is the only shape for money. Never ship a silent overwrite of anything priced or shipped. Where no safe edit exists, the refusal with the newer way named is the option. The version history earns its place for names and text, with two-person approval for corrections to money.

#### `the-old-value-stays-on-the-record-beside-the-new`: The old value stays on the record beside the new

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock"
  header
    heading "Garcia Interiors restock"
    text "Sat 14 Mar 2026, Amsterdam warehouse. 1,204 orders."
    action "Rename"
  region "The name over time"
    text "Orders already placed carry the name they were placed under."
    timeline 3
      item: text "Garcia Interiors restock" · text muted "8 Oct 2026, 14:22" · text muted "Alex Morgan"
```

**Rationale:** A rename shows what it was and when. The record never loses the earlier name, because an order placed last month must still resolve to the delivery it was placed for.

**Cost:** Every edit grows the record, and a reader looking for 'what is this called' has to skip past what it used to be called.

#### `the-edit-is-refused-with-the-newer-way-named`: The edit is refused, with the newer way named

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Pricing"
  header
    heading "Pricing"
    text "Oak desk lamp went on sale 12 Jan 2026."
  region "Refused"
    message "That price has already been charged. 412 units were sold at EUR 45.00." critical
    text "Changing it would make the records disagree with the customer."
    action disabled "Change the price everyone paid"
    link "Price the remaining stock instead"
  region "Still on sale"
    field "Price for the 88 units still on sale, in euros" number = "50.00"
    action primary "Save the new price"
```

**Rationale:** Some edits cannot happen at all after the fact. The command is not disabled silently: it says what cannot change, and names the command that achieves what the reader was trying to do.

**Cost:** A reader who wants a price change on a sold unit is told no and offered the replacement command instead. That is the correct answer, but refusals still generate support cases.

#### `a-correction-dated-and-attributed`: A correction, dated and attributed

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock" "Incidents" "INC-0207"
  header
    heading "Incident INC-0207"
    status "Closed" neutral
    text "14 Mar 2026, loading bay. Recorded 14 Mar, corrected 2 Oct."
  region "What happened"
    fact "Who" "A driver, no name given"
    fact "What" "Presented another customer's pickup slip"
    fact "Why" "The original slip could not be produced"
    text muted "Corrected 2 Oct 2026 by Priya Shah."
  region "The corrections"
    timeline 2
      item: text "Why corrected" · text muted "2 Oct 2026, 09:12" · text muted "Priya Shah"
```

**Rationale:** Where a figure was entered wrong, the correction is a statement about the past. The record carries the correction as its own dated fact rather than overwriting the wrong one.

**Cost:** Two figures for the same thing confuse any page that shows only one of them. Every read has to choose which to show, and the choice is a rule rather than a display decision.

#### `a-change-with-a-window-before-it-takes-effect`: A change with a window, before it takes effect

```wireframe
page
  breadcrumb "Home" "Products" "Delivery fee"
  header
    heading "Delivery fee"
    text "What the customer pays on top of the order. You keep all of it."
  region "The fee"
    fact "Now, since 1 Oct 2026" "EUR 5.00"
    fact "From 1 November 2026, scheduled" "EUR 6.00"
    field "Change the scheduled fee, in euros" number = "6.00"
    text muted "Takes effect on 1 November 2026. The 1,204 orders already placed keep EUR 5.00."
    action "Cancel"
    action primary "Schedule the change"
```

**Rationale:** A scheduled change names what it will be, when it takes effect, and how to stop it before then. The record shows both the current value and the one coming.

**Cost:** Two values on one record is a rule every read honors. What this is worth carries a date that a reader has to notice.

#### `a-change-that-only-reaches-what-has-not-shipped`: A change that only reaches what has not shipped

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042" "Delivery" "Plan"
  header
    heading "Delivery plan"
    text "6 entries, sorted by start time."
    action "Add to the plan"
  region "Scope"
    message "This is this delivery only. A change here does not reach any dispatched delivery." info
  region "Entries"
    list 3
      item: text "Stock check" · text muted "06:30" · text muted "Changed 8 Oct, 14:22" · action "More actions"
```

**Rationale:** The edit page says which population the change reaches, and which it cannot. Editing a delivery plan changes this delivery. Editing the warehouse does not.

**Cost:** It needs a read that counts the affected population. That count is a fact the API answers rather than a number typed into the copy.

#### `a-reverse-keeping-both-figures-and-the-reason`: A reverse, keeping both figures and the reason

```wireframe
page
  breadcrumb "Home" "Invoices" "Mismatches" "M-0091"
  header
    heading "Mismatch M-0091"
    text "Order SO-1042, EUR 45.00 recorded twice."
    action destructive "Reverse the second"
  region "What the two records say"
    fact "Recorded by the storefront" "EUR 45.00"
    fact "Recorded by the bank file" "EUR 45.00"
    fact "Counted so far" "EUR 90.00"
    fact "After the reversal" "EUR 45.00"
  region "Why"
    field "Reason" textarea = "The bank file imported the same payment twice."
    action "Cancel"
    action destructive "Reverse the second record"
```

**Rationale:** A charge that turns out to be wrong is reversed with a reason, and both figures stay on the record. This is the shape every financial correction takes.

**Cost:** The record holds two values for one thing, and every statement has to decide which one to print. That decision is a rule, not a display preference.

#### `a-version-history-with-restore`: A version history with restore

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock" "Versions"
  header
    heading "Garcia Interiors restock"
    text "Sat 14 Mar 2026, Amsterdam warehouse. 1,204 orders."
  region "Notice"
    message "Restoring writes a new version. Orders keep the name they were placed under." info
  region "Versions"
    list 3
      item: text "Garcia Interiors March order" · text muted "Version 11, 12 Jan 2026, 09:04 by Alex Morgan" · action "Restore"
```

**Rationale:** This option works the way Notion keeps versions. Every save is a version with a who and a when. Restoring writes a new version rather than rewriting the old. A name changed in October reads in June as what it was then.

**Cost:** Versions multiply: a description edited fifty times has fifty rows, and only the last few matter. The list needs grouping by day, or it hides the one version anyone wants.

**Reference:** Notion

#### `two-people-for-a-change-to-the-past`: Two people for a change to the past

```wireframe
page
  breadcrumb "Home" "Invoices" "Mismatches" "M-0091" "CR-0031"
  header
    heading "Correction CR-0031"
    text "Mismatch M-0091, order SO-1042. Waiting on one approval."
  region "What was asked"
    fact "Asked by" "Priya Shah, 8 Oct 2026, 09:12"
    fact "Change" "Reverse the second EUR 45.00 record"
    fact "Reason" "The bank file imported the same payment twice."
  region "Rule"
    message "Priya Shah asked for this correction, so Priya Shah cannot approve it." caution
  region "Decide"
    field "Note for the record" textarea
    action "Refuse"
    action primary "Approve and reverse"
```

**Rationale:** The way GitHub guards a protected branch: a change to what is settled needs a second person. A correction to money that one person could type alone is the case this exists for.

**Cost:** Every correction waits on someone else, and a team of one cannot use it at all. It fits corrections to money and the dispatch log, not names and text.

**Reference:** GitHub

### Duplicating a record

**Question:** A duplicate is a create that starts from something. The copy carries the setup and never the history: prices and a delivery plan travel, and orders and money stay with the original.

**Default:** `a-dialog-that-says-what-the-copy-carries`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The dialog that says what the copy carries is the pick: a duplicate that silently drops the prices is worse than no duplicate. The carry checklist is the runner-up where the parts vary per company. Never ship one-click duplication for a delivery. It earns its place for discount codes and plan entries, which carry no customers.

An order is never duplicated, because it is one customer's payment.

#### `a-dialog-that-says-what-the-copy-carries`: A dialog that says what the copy carries

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Deliveries"
    text "93 scheduled."
    action "New delivery"
  toolbar
    field "Search deliveries" search
  region "Deliveries"
    list 1
      item: text "Garcia Interiors restock" · text muted "Sat 14 Mar 2026 · Amsterdam warehouse" · status "Draft" neutral · text "0 of 40 pallets" · action "Open"
  dialog
    heading "Duplicate Garcia Interiors restock"
    field "Name of the copy" text = "Garcia Interiors restock (copy)"
    text "The copy carries the delivery plan, the products and prices, and the dispatch plan."
    text "Orders, committed units and money stay with the original. The copy starts as a draft."
    action "Cancel"
    action primary "Duplicate it"
```

**Rationale:** The way Shopify duplicates a product: the dialog names what the copy carries before it exists. The copy starts as a draft, so nothing about it is on sale until the reader says so.

**Cost:** A long carried list makes a long dialog, and most of it is read once. Past about six parts the checklist option carries the meaning better.

**Reference:** Shopify

#### `one-click-from-the-row-menu-then-a-toast`: One click from the row menu, then a toast

```wireframe
page
  breadcrumb "Home" "Products" "Discounts" "Codes"
  header
    heading "Discount codes"
    text "4 codes. All of them reduce the product, never the fee."
    action "New discount code"
  region "Codes"
    table 3 "Code" "Reduction" "Used"
      item: text "WELCOME10 copy" · text "EUR 10.00 off" · text "0 of 200" · menu "More"
    text "WELCOME10, CREW and one more code sit above. The copy lands as a draft."
  toast info "WELCOME10 copy was created as a draft."
```

**Rationale:** The way Mailchimp duplicates a campaign: one menu item with no questions, and the copy lands as a draft, confirmed by a toast. A discount code carries no customers, so there is nothing to check first.

**Cost:** No moment to rename or choose what travels. It fits records with no customers and no money. A delivery duplicated this way would surprise everyone in June.

**Reference:** Mailchimp

#### `copy-of-renamed-where-it-lands`: Copy of, renamed where it lands

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Tiers"
  header
    heading "Price tiers"
    text "2 tiers. 412 sold between them."
    action "New price tier"
  region "Tiers"
    list 3
      item: field "Name of the copy" text = "Copy of Standard" · text muted "EUR 45.00 · 0 sold · draft, not on sale" · action "Keep the name"
    text "Standard at EUR 45.00 with 412 sold and Large at EUR 60.00 sit below."
```

**Rationale:** The way Figma duplicates a layer: the copy appears beside the original as Copy of, already selected for rename. Duplicating a price tier is renaming plus a price check, and both happen in the list.

**Cost:** The copy exists before it is named, so a list can fill with Copy of Standard rows that nobody renamed. It needs the draft state to say the copy is not on sale yet.

**Reference:** Figma

#### `choose-what-the-copy-carries`: Choose what the copy carries

```wireframe
page
  breadcrumb "Home" "Orders" "Garcia Interiors restock" "Duplicate"
  header
    heading "Duplicate Garcia Interiors restock"
    text "Tick what the copy carries. The rest stays behind."
  region "What travels"
    field "Name of the copy" text = "Garcia Interiors restock (copy)"
    field "Delivery plan, 6 entries" checkbox
    field "Products and prices, Oak desk lamp and Pine bookshelf" checkbox
    field "Dispatch plan, 1 dock and 2 bays" checkbox
    field "Team assignments, Chris Novak and Jordan Lee" checkbox
    text "Orders, committed units and money never travel. The copy starts as a draft."
  footer
    action "Cancel"
    action primary "Duplicate it"
```

**Rationale:** The way Notion duplicates a page with its subpages offered as toggles: every part is a checkbox with its size beside it. A reader who wants the prices but not the team says so here.

**Cost:** Six checkboxes for a routine duplicate is five too many on the tenth use. It fits the first duplicate of a season, not the weekly one.

**Reference:** Notion

#### `duplication-refused-where-there-is-nothing-to-carry`: Duplication refused where there is nothing to carry

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    text "Maria Garcia · EUR 125.00 · paid 8 Oct 2026, 09:32."
  message critical "An order cannot be duplicated. SO-1042 is the payment Maria Garcia made. A copy would claim a payment that never happened."
  region "What to do instead"
    text "To sell the same products to someone else, create a manual order. It carries its own number and its own payment."
    action primary "Create a manual order"
```

**Rationale:** The way Stripe treats a paid invoice as a fact: it can be credited but never copied. An order is one customer payment for one set of products, so duplicating it would invent a payment that never happened.

**Cost:** The reader who wants a second order like this one must build it by hand. The manual order is the way out. This page must name it, or the refusal leaves the reader with nowhere to go.

**Reference:** Stripe

#### `duplicate-a-session-inside-its-series`: Duplicate a session inside its series

```wireframe
page
  breadcrumb "Home" "Orders" "Plans" "March restock plan" "Delivery 9" "Duplicate"
  header
    heading "Duplicate delivery 9"
    text "March restock plan · Tue 3 Nov 2026. The copy joins the same series."
  region "The copy takes from the series"
    fact "Place" "Amsterdam warehouse, shared"
    fact "Products" "Oak desk lamp, Pine bookshelf, shared at EUR 45.00"
    fact "Delivery plan" "Shared, 6 entries"
    field "Date of the copy" text = "24/11/2026"
    text "Delivery 9 moved its loading slot to 19:30. The copy takes the series 20:00, not the change."
  footer
    action "Cancel"
    action primary "Duplicate the delivery"
```

**Rationale:** The series holds what every delivery shares, so the duplicate only asks for the date. The shared parts are named, not chosen, because the series owns them.

**Cost:** Anything the delivery changed away from the series raises the question of which version travels. The page must say the series version wins, or the copy silently keeps the divergence.

### Putting a list in order by hand

**Question:** Products, plan entries, and storefront sections all have an order the reader sets. The customer reads the order the reader left, so the control must work for a mouse, a keyboard, and a finger.

**Default:** `drag-handles-in-the-list`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Drag handles in the list are the pick: direct, visible, and the order saves as it changes. Move up and Move down in the row menu are the required companion, because drag alone leaves keyboard and screen-reader users behind. Never ship typed position numbers alone. Two rows both numbered 3 are a question the page cannot answer.

The storefront preview earns its place for sections, where the order is the design.

#### `drag-handles-in-the-list`: Drag handles in the list

```wireframe
page
  breadcrumb "Home" "Products" "Desk lamps"
  header
    heading "Products"
    text "3 products. Customers read them in this order."
  message info "Drag a row to move it. The order saves on drop and the storefront follows within a minute."
  region "Products"
    list 3
      item: text "1" · text "Oak desk lamp" · text muted "EUR 45.00 · 412 sold" · menu "More"
    text "Spring offer at EUR 40.00 and Pine bookshelf at EUR 120.00 follow below."
    text "The first product is the one customers see first."
```

**Rationale:** The way Notion reorders blocks: a grip sits on every row, the dragged row lifts, and a line shows where it will land. The order saves on drop, so there is nothing to forget.

**Cost:** A grip cannot be used from a keyboard or announced by a screen reader, and on a phone it conflicts with scrolling. The menu move is not an alternative. It is the other half of this option.

**Reference:** Notion

#### `move-up-and-move-down-in-the-row-menu`: Move up and Move down in the row menu

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042" "Delivery" "Plan"
  header
    heading "Garcia Interiors restock"
    text "Delivery plan · 6 entries, sorted by start time."
  region "Delivery plan"
    list 3
      item: text "Labels printed" · text muted "Set 2 Oct · position 2 of 6" · text "07:00" · menu "More"
    text "Stock check at 06:30 sits above. Loading bay booked at 08:00 sits below."
    text "Every move announces its new position. The order saves with each move."
  popover "More"
    action "Move up"
    action "Move down"
    action "Move to top"
    action "Move to bottom"
```

**Rationale:** The way Linear moves an issue with the keyboard: the same move drag performs, as a named command. A screen reader announces Moved to position 2, and nothing about it needs a pointer.

**Cost:** Moving one row past twenty others is twenty menu opens. It is the accessible half of drag, not a replacement for it on long lists.

**Reference:** Linear

#### `a-position-number-typed-on-each-row`: A position number typed on each row

```wireframe
page
  breadcrumb "Home" "Products" "Desk lamps"
  header
    heading "Products"
    text "3 products. Numbers set the customer order."
  region "Products"
    list 3
      item: text "Oak desk lamp" · text muted "EUR 45.00 · 412 sold" · field "Position of Oak desk lamp" number = "1"
    text "Spring offer holds 2 and Pine bookshelf holds 3. Two rows with the same number are refused."
  footer
    action "Reset"
    action primary "Save the order"
```

**Rationale:** The way WordPress orders menu items: a number on each row, one save for the whole list. Jumping a row from 14 to 1 is one keystroke where dragging would cross the whole list.

**Cost:** Two rows numbered 3 are a question the page cannot answer, and renumbering fourteen rows by hand is slower than dragging one. Numbers suit a jump across a long list and nothing else.

**Reference:** WordPress

#### `automatic-order-with-pinned-rows-on-top`: Automatic order, with pinned rows on top

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Deliveries"
    text "93 scheduled. Sorted by date, 2 pinned."
  toolbar
    field "Search deliveries" search
    field "Sort" select = "Date"
  region "Deliveries"
    list 4
      item: text "Garcia Interiors restock" · text muted "Sat 14 Mar 2026 · pinned by Alex Morgan" · status "Pinned" info · text "412 units" · action "Unpin"
    text "Becker Bouw restock stays pinned below. Dated rows follow the sort."
    text "Pinned rows stay first in every sort. Unpinning returns a row to the rule."
```

**Rationale:** The way Shopify sorts products: the list follows a rule such as price or date, and pinned rows stay above it. Ninety-three deliveries need no hand ordering. The two that matter stay first by hand.

**Cost:** Two orders on one list is a rule every reader must learn: pinned first, then the rule. A reader who sorts by name and finds two rows out of place has to be told why.

**Reference:** Shopify

#### `order-the-storefront-sections-on-the-preview`: Order the storefront sections on the preview

```wireframe
page
  breadcrumb "Home" "Products" "Storefront"
  header
    heading "Storefront"
    text "shop.acme-supply.example · what customers read, in order."
  split 1:1
    region "Sections"
      list 3
        item: text "2" · text "Oak desk lamp" · text muted "412 sold · on sale"
      text "Drag a section. The preview follows."
    region "Customer preview"
      heading small "Spring offers"
      text "From EUR 40.00 · ends 1 Feb."
      heading small "Oak desk lamp"
      text "EUR 45.00 · 412 sold."
```

**Rationale:** The way Squarespace orders page sections: list and preview sit side by side, and moving a row moves the preview with it. The order is the design, so it is judged as one.

**Cost:** Two panes need a wide screen. Below 768 px the preview stacks under the list and the judgement breaks. It also fits sections, not products, which customers read as a list either way.

**Reference:** Squarespace

#### `move-to-top-and-move-to-bottom-for-long-lists`: Move to top and Move to bottom for long lists

```wireframe
page
  breadcrumb "Home" "Orders" "SO-1042" "Delivery" "Plan"
  header
    heading "Garcia Interiors restock"
    text "Delivery plan · 6 entries."
  region "Delivery plan"
    list 3
      item: text "Loading bay booked" · text muted "Moved to top by Alex Morgan · position 1 of 6" · text "08:00" · menu "More"
    text "Stock check at 06:30 and four more entries sit below."
    text "Jumps save at once, like every other move."
  popover "More"
    action "Move up"
    action "Move down"
    action "Move to top"
    action "Move to bottom"
```

**Rationale:** The way Trello positions a card: a position menu with top and bottom jumps beside the step moves. On a plan of forty entries the jump is the only move anyone uses.

**Cost:** Top and bottom move without aim: everything important ends up first and the top becomes its own unordered list. It needs the step moves beside it for the ordering that follows.

**Reference:** Trello

### Restoring an archived record

**Question:** Archive is only safe if restore works. A restore returns the record to where it was, with its history, and says so when something changed while it was away, such as a name taken since.

**Default:** `restore-from-the-archived-view`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Restore from the archived view is the pick: the view is the way back, and the row says where the record returns to. The record-page banner is the runner-up for anyone arriving by link. Never ship a restore that silently un-archives parents or overwrites a newer name. Both need their own dialog.

The Undo toast earns its place in the seconds after archiving, not as the way back days later.

#### `restore-from-the-archived-view`: Restore from the archived view

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Deliveries"
    text "93 scheduled, 4 archived."
    action "New delivery"
  toolbar
    field "Search deliveries" search
  region "Archived"
    list 3
      item: text "Okafor Office restock" · text muted "28 Feb 2026 · archived 2 Oct" · text "Returns as Scheduled" · action "Restore"
    text "A restore returns the record to the state it held. Nothing goes back on sale by itself."
  toast positive "Okafor Office restock is back under Scheduled."
```

**Rationale:** The way Shopify restores an archived product: the Archived view lists what is hidden, and each row carries its own Restore. The record returns to the state it held, not to a draft.

**Cost:** Nobody opens the Archived view unless they remember it exists. Anything restored from here must say where it went, or the record vanishes from this list into another nobody is reading.

**Reference:** Shopify

#### `undo-in-the-seconds-after-archiving`: Undo in the seconds after archiving

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Deliveries"
    text "93 scheduled, 4 archived."
    action "New delivery"
  toolbar
    field "Search deliveries" search
  region "Deliveries"
    list 2
      item: text "Garcia Interiors restock" · text muted "9 Oct 2026 · Amsterdam warehouse" · status "Scheduled" info · text "1 of 40 pallets"
    text "Okafor Office restock left this list a moment ago. Undo is fastest where the archive happened."
  toast info "Okafor Office restock was archived. Undo."
```

**Rationale:** The way Gmail keeps an Undo on every archive: the toast is the way back in the seconds after the selection. Archiving the wrong delivery is fixed where it happened, without a visit to another view.

**Cost:** Eight seconds and it is gone, so this is a correction for slips, not the way back. Anyone restoring a day later still needs the archived view.

**Reference:** Gmail

#### `restore-from-the-record-page`: Restore from the record page

```wireframe
page
  breadcrumb "Home" "Orders" "Okafor Office restock"
  header
    heading "Okafor Office restock"
    text "28 Feb 2026 · Rotterdam warehouse. Archived 2 Oct."
    action "Open"
  message caution "This delivery is archived. Archived 2 Oct 2026 by Alex Morgan. Customers cannot see it and nothing about it is scheduled."
  region "Restore it"
    text "It returns as Scheduled, with its plan, its prices and its 0 committed units. Nothing goes back on sale by itself."
    action primary "Restore this delivery"
```

**Rationale:** The way GitHub reopens a closed issue from the issue itself: the archived banner sits on the record, with Restore beside it. Anyone arriving by link or search restores without finding the archived view first.

**Cost:** The page must work while archived: read-only where it matters, with every command saying it needs a restore first. A banner on a broken page is worse than no banner.

**Reference:** GitHub

#### `restore-refused-the-parent-is-still-archived`: Restore refused: the parent is still archived

```wireframe
page
  breadcrumb "Home" "Orders" "Okafor Office restock" "Tiers"
  header
    heading "Price tiers"
    text "Okafor Office restock · archived 2 Oct."
  region "Tiers"
    list 1
      item: text "Standard" · text muted "EUR 45.00 · 0 committed · archived" · action "Restore"
  dialog
    heading "Restore Standard as well as its delivery?"
    text "Standard belongs to Okafor Office restock, which is still archived. A price tier cannot return while its delivery stays hidden."
    text "Restoring both returns the delivery as Scheduled and the tier with it. Neither goes back on sale by itself."
    action primary "Restore both"
    action "Restore the delivery first"
    action "Cancel"
```

**Rationale:** The way Jira refuses to reopen a subtask whose parent is closed: the restore names the blocker and offers the way out. A price tier cannot return while its delivery stays archived.

**Cost:** It asks for two dialogs for one restore, and the offer to restore both at once is a second command hiding inside the first. It must say both are restored, not only the row that was selected.

**Reference:** Jira

#### `restore-with-a-name-taken-since`: Restore with a name taken since

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Tiers"
  header
    heading "Price tiers"
    text "2 tiers on sale. 1 archived."
  region "Tiers"
    list 2
      item: text "Standard" · text muted "EUR 45.00 · 0 sold · archived 2 Oct" · action "Restore"
    text "Standard at EUR 45.00 with 412 sold stays on sale above."
  dialog
    heading "Standard is already taken"
    text "Another tier took the name while this one was archived. The restored tier comes back renamed."
    field "Name on return" text = "Standard (restored)"
    action "Cancel"
    action primary "Restore it renamed"
```

**Rationale:** The way Notion renames a restored page when the title is taken: the restore keeps both records by renaming the restored record. Two tiers called Standard would disagree on the invoice, so only one keeps the name.

**Cost:** The restored record comes back under a name nobody chose, and renaming it again is a second command. The dialog must show the name it will hold, not only the clash.

**Reference:** Notion

#### `restore-several-at-once`: Restore several at once

```wireframe
page
  breadcrumb "Home" "Orders"
  header
    heading "Deliveries"
    text "4 archived. 2 selected."
  toolbar
    field "Search deliveries" search
  region "Archived"
    list 3
      item: field "Select Okafor Office restock" checkbox · text "Okafor Office restock" · text muted "28 Feb 2026 · returns as Scheduled"
    text "Lindqvist Studio samples returns as Scheduled. Becker Bouw trial returns as Ended."
    action "Clear"
    action primary "Restore these 2"
  dialog
    heading "Restore 2 deliveries?"
    text "Both return as Scheduled, with their plans and prices. Neither goes back on sale by itself."
    action "Cancel"
    action primary "Restore both"
```

**Rationale:** The way Google Drive restores a selection: the count is the confirmation, and every record returns to where it was. Archiving a whole season by mistake is fixed by selecting the same records and restoring them together.

**Cost:** A bulk restore can return records to states the reader forgot, including one that clashes. The report afterwards must name each record and where it landed.

**Reference:** Google Drive

### Inviting a team member

**Question:** Warehouse crew join per delivery, and staff join per company. An invitation names the person, the role, and the scope before sending, because wrongly granted access must be found and removed later.

**Default:** `invite-by-email-with-the-role-chosen-first`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Invite by email with the role chosen first is the pick: person, role, and scope are all named on one dialog. The pending list with resend and revoke is the runner-up and the required companion, because an invitation waits far longer than sending takes. Never ship an open invite link for staff roles.

It earns its place only for warehouse crew on one delivery. A request to join is refused: the company invites. Nobody applies.

#### `invite-by-email-with-the-role-chosen-first`: Invite by email, with the role chosen first

```wireframe
page
  breadcrumb "Home" "Settings" "Team"
  header
    heading "Team"
    text "6 people. 1 invitation waiting."
    action "Invite someone"
  region "Team"
    list 3
      item: text "Sam Rivera" · text muted "Owner · Acme Supply" · menu "More"
    text "Alex Morgan and Chris Novak sit below. Chris serves Garcia Interiors restock."
  dialog
    heading "Invite someone"
    field "Email" text = "noa.vermeer@example.com"
    field "Role" select = "Warehouse lead"
    field "Scope" select = "Garcia Interiors restock"
    action "Cancel"
    action primary "Send the invitation"
```

**Rationale:** The way Slack invites: one dialog, the email, and the role with what it can do beside it. The scope line says whether Noa joins the company or one delivery, before the invitation exists.

**Cost:** It sends one invitation per person, typed by hand. Assigning forty pickers for a season needs the link option beside it.

**Reference:** Slack

#### `an-invite-link-anyone-with-it-can-use`: An invite link anyone with it can use

```wireframe
page
  breadcrumb "Home" "Settings" "Team" "Invite link"
  header
    heading "Invite the warehouse crew"
    text "Garcia Interiors restock · Sat 14 Mar 2026. The link joins as Picker and expires with the delivery."
  region "The link"
    fact "Invite link" "acme-supply.example/join/7K4Q-2M9X"
    action quiet "Copy"
    fact "Role" "Picker"
    fact "Scope" "Garcia Interiors restock"
    fact "Uses" "12 of 60"
    fact "Expires" "15 Mar 2026, 18:00"
    message caution "Anyone with this link joins as Picker for Garcia Interiors restock. It never grants finance, manager or owner access."
  footer
    action destructive "Revoke the link"
    action "Copy it again"
```

**Rationale:** The way Discord invites: a link with an expiry and a use count, for forty pickers nobody wants to type by hand. The link joins one delivery in one role, and nothing else.

**Cost:** Anyone with the link joins, including anyone it was forwarded to. It fits warehouse crew on one delivery and is refused for owner, finance, and manager roles.

**Reference:** Discord

#### `invite-to-one-delivery-not-the-company`: Invite to one delivery, not the company

```wireframe
page
  breadcrumb "Home" "Settings" "Team" "Invite"
  header
    heading "Invite Noa Vermeer"
    text "Loading bay · Sat 14 Mar 2026. Picker for one delivery."
  region "The grant"
    text "Noa Vermeer · noa.vermeer@example.com."
    field "Role on the delivery" select = "Picker"
    field "Delivery" select = "Garcia Interiors restock"
    text "After 15 Mar 2026, 18:00 this grant ends by itself. Nothing about Noa stays except the audit trail."
  footer
    action "Cancel"
    action primary "Send the invitation"
```

**Rationale:** The way Linear invites to one team rather than the workspace: the scope is chosen up front and printed on the invitation. Noa works the loading bay on 14 Mar and sees nothing else afterwards.

**Cost:** Scopes multiply: sixty deliveries a year is sixty small grants to read later. The team page must group by person as well as by delivery, or nobody can answer what Noa can do.

**Reference:** Linear

#### `pending-invitations-with-resend-and-revoke`: Pending invitations, with resend and revoke

```wireframe
page
  breadcrumb "Home" "Settings" "Team"
  header
    heading "Team"
    text "6 people. 2 invitations waiting."
    action "Invite someone"
  tabs "People 6" "Invitations 2" "Roles 6"
    region "Invitations"
      list 2
        item: text "noa.vermeer@example.com" · text muted "Picker · Garcia Interiors restock · sent 6 Oct, expires 13 Oct" · status "Waiting" caution · action "Resend" · action "Revoke"
      text "An invitation expires 7 days after it is sent. lena.bakker@example.com expired 8 Oct and needs reissue."
```

**Rationale:** The way GitHub lists organization invitations: every waiting invitation shows its age, its expiry, and its way out. An invitation is read far more often than it is sent, so the list is the pattern.

**Cost:** A list of the waiting is a list of the neglected: half of it expired quietly. Expired rows must say they expired and offer reissue, or the list fills with rows that can no longer be used.

**Reference:** GitHub

#### `an-expired-invitation-reissued`: An expired invitation, reissued

```wireframe
page
  breadcrumb "Home" "Settings" "Team"
  header
    heading "Team"
    text "6 people. 2 invitations waiting."
    action "Invite someone"
  tabs "People 6" "Invitations 2" "Roles 6"
    region "Invitations"
      list 1
        item: text "lena.bakker@example.com" · text muted "Support · Acme Supply · sent 1 Oct, expired 8 Oct" · status "Expired" neutral · action "Reissue"
  dialog
    heading "Reissue the invitation?"
    text "The link from 1 Oct stays dead. A new invitation goes to lena.bakker@example.com as Support for Acme Supply, expiring 15 Oct."
    field "Note with it" text = "The first one expired before you opened it."
    action "Cancel"
    action primary "Reissue it"
```

**Rationale:** The way Google Workspace reissues an expired invite: the old link stays dead and a new one goes out with fresh expiry. Reissuing is a new invitation with the old role, not the old link made live again.

**Cost:** It sends two emails for one join, and the first still reads as live to anyone who kept it. The expired link must land on a page that says it expired, not on a bare refusal.

**Reference:** Google Workspace

#### `a-request-to-join-approved-by-an-owner`: A request to join, approved by an owner

```wireframe
page
  breadcrumb "Home" "Settings" "Team"
  header
    heading "Team"
    text "6 people. 1 request waiting."
  tabs "People 6" "Invitations 2" "Requests 1"
    region "Requests"
      message caution "This back office has no join request. This queue would let strangers ask for access to money."
      list 1
        item: text "unknown@example.com" · text muted "Asked 8 Oct 2026 · wants Picker for Garcia Interiors restock" · status "Waiting" caution · action "Approve" · action "Refuse"
      text "The refused shape: invite the team instead."
```

**Rationale:** The way Slack handles join requests: the asker waits in a queue and an owner approves with the role. It is drawn here to be refused, because the back office has no join request and adding one would invite strangers to ask.

**Cost:** It is a queue nobody asked for, and every request is a stranger asking for access to money. The company invites its team. Nobody applies. This option stays in the library as the refused shape.

**Reference:** Slack

### Publishing and unpublishing a listing

**Question:** A draft is private until customers can see it. Publishing says what customers will find, and unpublishing says what happens to what they found, because placed orders outlive either command.

**Default:** `publish-with-the-readiness-check-beside-it`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** Publish with the readiness check beside it is the pick: the reader reads what customers will find before they find it. Per-channel publish is the runner-up for companies that sell in more than one place. Never ship a silent unpublish. Placed orders stay valid and the page must say so.

Pause earns its place where the listing stays visible but nothing may sell.

#### `publish-with-the-readiness-check-beside-it`: Publish with the readiness check beside it

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Draft" neutral
    text "EUR 45.00 · 500 units."
    action primary "Publish"
  region "Price tiers"
    list 1
      item: text "Standard" · text muted "EUR 45.00 · 500 units" · status "Priced" positive
  dialog
    heading "Publish Oak desk lamp?"
    text "Customers will find this. The storefront lists it within a minute of publishing."
    fact "A name and a description" "Oak desk lamp · solid oak, linen shade"
    fact "A price" "Standard at EUR 45.00, 500 units"
    fact "A channel on sale" "Storefront"
    action "Keep it a draft"
    action primary "Publish it"
```

**Rationale:** The way Webflow publishes: the dialog lists what is ready and the button commits only when all of it is. Publishing is the one create the reader cannot undo quietly, so the check is the dialog.

**Cost:** A check that reads five systems can disagree with the page behind it by the time the reader presses the button. The publish command must recheck and refuse with the missing piece named.

**Reference:** Webflow

#### `unpublish-with-the-customer-consequences-stated`: Unpublish with the customer consequences stated

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "On sale" positive
    text "412 sold. The storefront lists it now."
    action destructive "Unpublish"
  region "Storefront"
    list 1
      item: text "shop.acme-supply.example" · text muted "Listed since 12 Jan 2026" · status "Live" positive
  dialog
    heading "Unpublish Oak desk lamp?"
    text "Sales stop within a minute. The storefront shows the product as unavailable and phone orders cannot take it."
    message positive "The 412 orders already placed stay valid and still ship."
    action destructive "Unpublish it"
    action "Keep it published"
```

**Rationale:** The way Shopify unpublishes a sales channel: the dialog says what stops and what stays, because placed orders outlive the listing. Unpublishing stops sales. It touches nothing sold.

**Cost:** It states two truths on one dialog, and the second is the one customers will ask about. The page behind it must keep answering for the sold units after the listing is gone.

**Reference:** Shopify

#### `publish-on-a-date-set-in-advance`: Publish on a date, set in advance

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Publish"
  header
    heading "Oak desk lamp"
    status "Draft" neutral
    text "Nothing about it is on sale yet."
  region "Publish on a date"
    field "Date" text = "13/01/2026"
    field "Time" text = "10:00"
    message info "At 13 Jan 2026, 10:00 the product publishes itself: Standard at EUR 45.00 on the storefront. Cancel the schedule any time before then."
  footer
    action "Publish it now"
    action "Cancel"
    action primary "Schedule it"
```

**Rationale:** The way WordPress schedules a post: the date is set on the draft and the publish happens without anyone present. A sale starting at 10:00 on a Tuesday should not need Sam Rivera at the desk at 10:00.

**Cost:** A scheduled publish can fire after the draft changed: the price moved, or the stock moved. The scheduler must recheck at the hour and hold the publish with the reason named.

**Reference:** WordPress

#### `publish-blocked-with-the-missing-pieces-listed`: Publish blocked, with the missing pieces listed

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Draft" neutral
    text "EUR 45.00 · 500 units."
    action disabled "Publish"
  message info "Publish needs two more pieces. Nothing about this product is on sale until both are set."
  region "What is missing"
    list 2
      item: text "A price" · text muted "Nothing to order yet. The storefront cannot list a product with no price." · action "Add a price"
    text "A channel on sale is the second piece. The storefront is published but lists nothing for this product."
```

**Rationale:** The way Squarespace blocks publish on an unfinished site: the button stays, and the missing pieces are listed with links to each field. A disabled button alone would read as broken.

**Cost:** Every missing piece is a link away, and fixing one can reveal the next. The list must be complete on first read or the reader learns of them one publish attempt at a time.

**Reference:** Squarespace

#### `pause-sales-without-unpublishing`: Pause sales without unpublishing

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp"
  header
    heading "Oak desk lamp"
    status "Paused" caution
    text "Paused 8 Oct 2026, 14:22 by Alex Morgan. The page stays up."
    action primary "Resume sales"
  message caution "Nothing can be bought here. The 412 orders already placed stay valid and still ship."
  region "What a customer sees"
    heading small "Oak desk lamp"
    text "Sales are paused at the moment. Orders already placed still ship."
    text "More units go on sale when returned stock arrives."
```

**Rationale:** The way Shopify pauses a store: the page stays up and says so, sales stop, and everything sold stays valid. A product that may restock needs the pause, not the unpublish.

**Cost:** Paused reads as broken to a customer who does not read the message. The customer message must say when sales return, or customers stop trusting the pause.

**Reference:** Shopify

#### `publish-per-channel-one-at-a-time`: Publish per channel, one at a time

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Channels"
  header
    heading "Oak desk lamp"
    text "One product, three channels, three states."
  region "Channels"
    list 3
      item: text "Storefront" · text muted "shop.acme-supply.example · live since 12 Jan 2026" · status "Live" positive · action "Unpublish"
    text "Phone orders at Canal Street 12 are ready and never published. The partner reseller holds no stock."
    text "Each channel publishes on its own. Placed orders stay valid on every channel either way."
```

**Rationale:** The way Shopify publishes per sales channel: each channel holds its own state, so phone orders can sell while the storefront waits. It shows one publish button per channel, each with its own check.

**Cost:** Three channels in three states is a matrix the reader must hold in mind. The product page must show every channel at once, or one sells what another promised not to.

**Reference:** Shopify

### Scheduling a change for later

**Question:** Prices, fees, and sale windows change on fixed dates. A scheduled change names the value, the date, and the way to stop it, and the record shows both the current and the coming value until the date arrives.

**Default:** `a-change-with-a-date-listed-with-the-record`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** A change with a date, listed with the record, is the pick: current and coming values sit side by side with a cancel. The tier timeline is the runner-up where prices change on fixed dates. Never ship overlapping schedules on one record, and never a change without its customer preview where customers read the value.

The sale window earns its place at creation, where open and close are set together.

#### `a-change-with-a-date-listed-with-the-record`: A change with a date, listed with the record

```wireframe
page
  breadcrumb "Home" "Products" "Delivery fee"
  header
    heading "Delivery fee"
    text "What the customer pays on top of the order. You keep all of it."
  region "The fee"
    fact "Now, since 1 Oct 2026" "EUR 5.00"
    fact "From 1 November 2026, scheduled" "EUR 6.00"
    message info "Orders placed before 1 Nov keep EUR 5.00. Orders after pay EUR 6.00."
    field "Change the scheduled fee, in euros" number = "6.00"
  footer
    action destructive "Cancel the schedule"
    action primary "Save the schedule"
```

**Rationale:** The way WordPress lists a scheduled post beside its drafts: the coming change is a row with a date and a cancel. The fee page shows now and next together.

**Cost:** Two values on one record is a rule every read must honor: orders placed before the date keep the old fee. Any page that prints the fee must print its date too.

**Reference:** WordPress

#### `a-tier-ends-on-its-date`: A tier ends on its date

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Standard" "Prices"
  header
    heading "Standard"
    text "One product, three prices, each with its dates."
    action "Add a tier"
  region "Prices"
    timeline 3
      item: text "Last units · EUR 55.00" · text muted "From 1 Mar · 0 sold · scheduled" · status "Scheduled" info · action "Change" · action "Cancel"
    text "Spring offer at EUR 40.00 ended 1 Feb with 88 sold. Standard at EUR 45.00 sells now, on sale until 1 Mar."
    text "A unit bought keeps the price it was bought at. The timeline never rewrites a sale."
```

**Rationale:** Each price holds its own dates, and the timeline shows what sells when. Standard at three prices is three rows, not one price edited twice.

**Cost:** Three rows for one product is three records to read on every invoice and in every report. A customer who finds the old price can ask for the difference back, and the page must not hide that.

#### `a-scheduled-change-canceled-before-it-runs`: A scheduled change canceled before it runs

```wireframe
page
  breadcrumb "Home" "Products" "Delivery fee"
  header
    heading "Delivery fee"
    text "What the customer pays on top of the order. You keep all of it."
  region "The fee"
    fact "Now, since 1 Oct 2026" "EUR 5.00"
    fact "From 1 November 2026, scheduled" "EUR 6.00"
  dialog
    heading "Cancel the scheduled fee?"
    text "The fee stays EUR 5.00. Nothing about any order changes, because the EUR 6.00 never took effect."
    text "The schedule stays in the history as canceled, with who canceled it and when."
    action "Keep the schedule"
    action destructive "Cancel it"
```

**Rationale:** The way Stripe voids a scheduled subscription change: canceling is one dialog that says what stays. The EUR 6.00 fee never happens, and the record says it was canceled rather than forgetting it.

**Cost:** A canceled schedule leaves a row that did nothing, and a year of those is noise. Canceled rows must collapse into the history, not sit beside the value.

**Reference:** Stripe

#### `two-changes-on-one-date-refused`: Two changes on one date, refused

```wireframe
page
  breadcrumb "Home" "Products" "Delivery fee"
  header
    heading "Delivery fee"
    text "What the customer pays on top of the order. You keep all of it."
  message critical "1 November already holds a change. The fee becomes EUR 6.00 that morning, scheduled by Priya Shah. One record cannot become two fees on the same date."
  region "Move one of them"
    field "Move the EUR 6.00 change to" text = "08/11/2026"
    text "Its orders keep their date either way. Or cancel the EUR 6.00 change first, then schedule again."
  footer
    action "Cancel"
    action primary "Move it and schedule mine"
```

**Rationale:** The way Google Calendar refuses a second booking in a locked room: the clash names both changes and offers the move. One record cannot become two fees on the same morning.

**Cost:** The second change waits on the first being moved or canceled, which means leaving and coming back. It must offer the move inline, or the refusal sends the reader hunting.

**Reference:** Google Calendar

#### `the-sale-window-set-at-creation`: The sale window, set at creation

```wireframe
page
  breadcrumb "Home" "Products" "Oak desk lamp" "Standard"
  header
    heading "Standard"
    status "On sale" positive
    text "EUR 45.00 · 412 of 500 sold."
  region "The sale window"
    field "Opens" text = "12/01/2026 10:00"
    field "Closes" text = "14/03/2026 22:00"
    text "Before 12 Jan the product reads Coming soon. After 14 Mar 22:00 it reads Ended, and the order list is final."
  footer
    action primary "Save the window"
```

**Rationale:** Opens and closes are two dates on the record, and the state follows them. Standard sells from 12 Jan to 14 Mar without anyone present at either end.

**Cost:** A window set at creation is rarely rechecked: it opens on an unfinished product or closes on a selling one. The product page must show the window beside the state, always.

#### `what-the-customer-sees-before-and-after`: What the customer sees, before and after

```wireframe
page
  breadcrumb "Home" "Products" "Delivery fee" "Schedule"
  header
    heading "Fee change, 1 November"
    text "What the customer reads on the order line, now and after."
  split 1:1
    region "Now"
      text "Oak desk lamp · EUR 45.00."
      text "Plus EUR 5.00 delivery fee · total EUR 50.00."
    region "After 1 November"
      text "Oak desk lamp · EUR 45.00."
      text "Plus EUR 6.00 delivery fee · total EUR 51.00."
  message info "The product stays the same. Only the fee line changes, on orders placed from 1 Nov."
  region "The schedule"
    fact "Takes effect" "1 November 2026, 00:00"
    fact "Set by" "Priya Shah · 8 Oct 2026"
  footer
    action destructive "Cancel the schedule"
    action primary "Keep it scheduled"
```

**Rationale:** The way Squarespace previews a scheduled site change: the reader reads the customer page twice, now and after. A fee change is judged by its customer line, not by its row on a settings page.

**Cost:** A preview is a second rendering of the storefront and can drift from it. It must render from the same listing read the customer gets, or it shows a page the customer never sees.

**Reference:** Squarespace

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/patterns/create-edit-remove#confirm-or-undo-every-removal | guidance | Does every built screen of this kind keep this rule, including in its compact layout? |
| litespec/frontend/patterns/create-edit-remove#show-the-created-record | guidance | Does every built screen of this kind keep this rule, including in its compact layout? |
| litespec/frontend/patterns/create-edit-remove#creating-one-record | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/create-edit-remove#changing-a-record-that-already-exists | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/create-edit-remove#removing-something | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/create-edit-remove#removing-several-at-once | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/create-edit-remove#creating-a-record-and-then-filling-it-in | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/create-edit-remove#changing-something-that-has-already-happened | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/create-edit-remove#duplicating-a-record | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/create-edit-remove#putting-a-list-in-order-by-hand | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/create-edit-remove#restoring-an-archived-record | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/create-edit-remove#inviting-a-team-member | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/create-edit-remove#publishing-and-unpublishing-a-listing | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/create-edit-remove#scheduling-a-change-for-later | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
