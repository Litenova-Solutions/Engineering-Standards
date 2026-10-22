# Admin Screen Patterns

## Intent

Settings screens configure the company itself: the team and its roles, API keys and webhooks, spreadsheet imports, the payment account, supplier invoices, and discount codes. This page shows each screen as drawn options with a named default to build. The product owner chooses among the options when the team builds or revises a settings area. Consistent admin layouts keep powerful commands, such as granting access, rotating secrets, and paying invoices, safe to operate.

## Concepts

### How to read a pattern

Each pattern answers one recurring question about a settings screen, such as how the team page shows members and invitations. It states the question, the default option a project builds, how the default behaves on a narrow screen, and why the default won. Each option then shows one wireframe drawing with its own rationale, cost, and optional reference. A project records its choice in its pattern catalog and builds the chosen option with its own components. The [UI patterns](../patterns.md) page states the catalog contract and the wireframe language.

### The running example

The drawings on this page use the Acme Supply settings: the team with Sam Rivera as Owner, the Counter sync API key, the contacts-2026-01.csv import, the Stripe payment account, supplier invoice INV-2026-09, and discount code DESK10. On this page, the reader is the staff member using the screen. The Standards section states the two rules every option keeps: a new secret shows in full only once, and an invitation or role change shows what the role allows before it is sent.

## Standards

### Show a new secret once

**Statement:** A screen MUST show a newly created API key or secret in full only once, at creation.

**Rationale:** A secret that stays readable on screen can be copied by anyone who later opens the page, including from a shared screen or a screenshot. Showing it once forces the person creating it to store it in a vault or environment file at once, so no later visit can leak it.

### Show what a role allows before granting it

**Statement:** An invitation or role change MUST show what the chosen role allows before it is sent.

**Rationale:** Role names such as Picker or Manager hide what they grant. A sender who sees only the name can grant access to refunds or data by mistake. Showing the granted capabilities beside the name lets the sender confirm the access itself before the invitation goes out.

## Patterns

### Team members and their roles

**Question:** The team is the staff who work for the company, and a role states what each person may do. The staff member holding the Owner role invites people, grants roles, limits some staff to one warehouse, and suspends or removes people. Everyone else sees names and roles, and nothing more.

**Default:** `members-with-the-invitations-below`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The members table with invitations below is the default because it answers three questions in one scan: who is in, who is invited, and what each may do. The permission matrix is the runner-up; prefer it on the role page, where capabilities are compared across roles. Never ship the matrix as the team page, because the team page manages people, and a capability grid hides who holds what.

#### `members-with-the-invitations-below`: Members with the invitations below

```wireframe
page
  breadcrumb "Settings" "Team"
  header
    heading "Team"
    text "Acme Supply · 5 members · 2 invitations outstanding."
    action primary "Invite member"
  region "Members"
    table 5 "Member" "Role" "Access" "State"
      item: avatar "SR" · text "Sam Rivera" · text "Owner" · text "Everything" · status "Active" positive · action "Manage"
  region "Invitations · 2"
    list 2
      item: text "lina.meyer@example.org" · text muted "Invited as Picker · expires 13 Oct" · status "Sent" info · action "Resend"
```

**Rationale:** Linear lists members with role and state in line, and pending invitations below in the same view, because invited and active people are two states of one team list. The owner acts on a row, such as resending or revoking, without opening it.

**Cost:** Row commands for suspend, remove, change role, and limit access cannot all fit, so most move into a menu per row.

**Reference:** Linear

#### `permission-matrix-per-role`: Permission matrix per role

```wireframe
page
  breadcrumb "Settings" "Team" "Roles"
  header
    heading "Roles"
    text "Acme Supply · 4 roles beside the owner."
    action primary "New role"
  region "What each role may do"
    table 6 "Capability" "Manager" "Finance" "Warehouse lead" "Support"
      item: text "Refund an order" · text "No" · text "Yes" · text "No" · text "No"
    message "Warehouse staff dispatch goods and record it. Only Finance refunds." info
```

**Rationale:** GitHub compares team roles in a capability matrix, which answers what each role may do without opening roles one by one. The matrix fits custom roles because it shows every capability side by side instead of hiding grants inside dialogs.

**Cost:** Past about twenty capabilities the matrix needs grouping by area, and it reads as a reference table rather than a working page.

**Reference:** GitHub

#### `inviting-one-member-in-a-dialog`: Inviting one member in a dialog

```wireframe
page
  breadcrumb "Settings" "Team"
  header
    heading "Team"
    text "Acme Supply · 5 members · 2 invitations outstanding."
  region "Members"
    list 2
      item: avatar "SR" · text "Sam Rivera" · text muted "Owner · everything" · status "Active" positive
  dialog "Invite member"
    field "Email address" text = "lina.meyer@example.org"
    field "Role" select = "Picker"
    field "Access" select = "Amsterdam warehouse only"
    text muted "Warehouse staff are limited to the building they work in."
    text muted "The invitation expires in 7 days."
    action "Cancel"
    action primary "Send invitation"
```

**Rationale:** Clerk invites with address, role, and scope in one dialog, because an invitation is one decision with three fields. The scope line limits warehouse staff to one building at the point of inviting.

**Cost:** Inviting a whole seasonal crew means repeating the dialog per person, so bulk inviting needs a different shape.

**Reference:** Clerk

#### `warehouse-scoped-staff-cards`: Warehouse-scoped staff cards

```wireframe
page
  breadcrumb "Settings" "Team"
  header
    heading "Team"
    text "Acme Supply · seasonal staff work one warehouse."
    action primary "Invite staff"
  region "Amsterdam warehouse"
    list 3
      item: avatar "CN" · text "Chris Novak" · text muted "Warehouse lead · access ends 31 Mar" · status "Active" positive · action "Remove"
    message "Seasonal access ends on the date on the card. Nothing is removed by hand." info
```

**Rationale:** Vercel scopes team access per project, which fits seasonal staff who work one warehouse and nothing else. The card names the building, the role, and the end of the access.

**Cost:** Staff cards separate from the member list split the team into two places, and the owner checks both.

**Reference:** Vercel

#### `suspending-a-member-with-the-reason`: Suspending a member with the reason

```wireframe
page
  breadcrumb "Settings" "Team"
  header
    heading "Team"
    text "Acme Supply · 5 members."
  region "Members"
    list 1
      item: avatar "JL" · text "Jordan Lee" · text muted "Support · everything" · status "Active" positive · action "Suspend"
  dialog "Suspend Jordan Lee"
    text "Sign-in stops at once. Open work stays assigned until it is moved."
    field "Reason" text
    text muted "Recorded in the audit trail. Required."
    fact "Assigned refunds" "2 open · move them first"
    fact "History" "Kept · nothing is deleted"
    action "Cancel"
    action destructive "Suspend member"
```

**Rationale:** GitHub suspends with the reason recorded, because a suspension is reviewed later and the recorded reason is what the reviewer reads. The dialog states what the member keeps, such as history, and what stops, such as sign-in.

**Cost:** A dialog per member action means suspend, remove, reinstate, and transfer ownership each carry their own copy to maintain.

**Reference:** GitHub

#### `the-team-as-a-member-without-controls-sees-it`: The team as a member without controls sees it

```wireframe
page
  breadcrumb "Settings" "Team"
  header
    heading "Team"
    text "Acme Supply · 5 members."
  region "Members"
    list 5
      item: avatar "SR" · text "Sam Rivera" · text muted "Owner"
    message "Only the owner manages the team. Membership states and invitations are not shown here." info
```

**Rationale:** Linear shows the member list without controls to members who cannot manage, because the names and roles are shared and the commands are not. The page is the same shape with the commands gone.

**Cost:** A read-only page shaped like the managing page invites clicking where nothing happens, so it must show no disabled buttons or empty menus, only the names and roles.

**Reference:** Linear

### API keys and webhooks

**Question:** Company systems read the product through API keys. Order updates reach those systems through webhooks. A key secret shows once and never again. Each webhook delivery states whether it arrived. A missed order update is money unaccounted for.

**Default:** `keys-table-with-the-grants-in-line`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The keys table with the shown-once dialog is the default: the list states each key's grants, and the dialog protects the secret at creation. The endpoint with its delivery log is the runner-up; prefer it on the webhooks tab, where deliveries are the work. Never show the secret outside the creation dialog: a secret that can be read again is not a secret.

#### `keys-table-with-the-grants-in-line`: Keys table with the grants in line

```wireframe
page
  breadcrumb "Settings" "Developers"
  header
    heading "Developers"
    text "API keys, webhooks and embedding origins."
    action primary "Create key"
  tabs "API keys" "Webhooks" "Origins"
    region "Keys"
      table 3 "Key" "Grants" "Last used" "State"
        item: text "Counter sync" · text "Read orders, read products" · text "8 Oct, 09:31" · status "Live" positive · action "Rotate"
```

**Rationale:** The Stripe Dashboard lists API keys with grants, creation, and last use. The back office asks what a key may do and whether it is still used. Revoke and rotate sit on the row.

**Cost:** Grants in line fit only as short labels, so the full grant list lives on the key page one click down.

**Reference:** Stripe

#### `the-secret-shown-once`: The secret, shown once

```wireframe
page
  breadcrumb "Settings" "Developers"
  header
    heading "Developers"
    text "API keys, webhooks and embedding origins."
  tabs "API keys" "Webhooks" "Origins"
    region "Keys"
      list 2
        item: text "Counter sync" · text muted "Read orders, read products" · status "Live" positive
  dialog "Copy the secret now"
    text "Grants: read dispatch state. Created by Alex Morgan on 8 Oct."
    field "Secret" text = "acme_live_9P4R2M7Q8H2K5T1BX6DW"
    action quiet "Copy"
    text muted "This secret shows once. It cannot be read again after this dialog closes."
    action primary "Secret stored, close"
```

**Rationale:** GitHub shows a new token once with copy front and center, because the secret cannot be read again. The dialog states the grants so the back office stores the right secret against the right system.

**Cost:** A secret shown once is lost when the owner closes the dialog too soon, and the only repair is revoking and creating again.

**Reference:** GitHub

#### `webhook-endpoints-with-their-deliveries`: Webhook endpoints with their deliveries

```wireframe
page
  breadcrumb "Settings" "Developers" "Webhooks"
  header
    heading "Webhooks"
    text "The addresses order updates are posted to."
    action primary "Register endpoint"
  region "https://counter.acme-supply.example/hooks"
    list 3
      item: text "order.paid · SO-1042" · text muted "8 Oct, 09:32 · answered 200 in 180 ms" · status "Delivered" positive
    action quiet "Replay the failed delivery"
  region "https://accounts.acme-supply.example/hooks"
    message "Paused by Priya Shah on 1 Oct. Deliveries queue until it is resumed." caution
    action "Resume"
```

**Rationale:** Svix draws each endpoint with its recent deliveries and their states, because the back office asks whether an update arrived. A failed delivery carries its next retry and a replay command.

**Cost:** Deliveries multiply into the thousands on a busy day, so the list needs the endpoint as a filter and aggressive paging.

**Reference:** Svix

#### `grant-picker-on-a-new-key`: Grant picker on a new key

```wireframe
page
  breadcrumb "Settings" "Developers"
  header
    heading "Developers"
    text "API keys, webhooks and embedding origins."
  tabs "API keys" "Webhooks" "Origins"
    region "Keys"
      list 1
        item: text "Counter sync" · text muted "Read orders, read products" · status "Live" positive
  dialog "Create API key"
    field "Name" text = "Warehouse display"
    field "Read orders and products" checkbox
    field "Read dispatch state" checkbox
    field "Read invoices" checkbox
    field "Refund an order" checkbox
    text muted "No key holds refunds. Only people refund."
    action "Cancel"
    action primary "Create key"
```

**Rationale:** GitHub scopes a new token with grouped checkboxes, because a key should hold the least it needs. The groups name the areas so the owner grants by area rather than by capability.

**Cost:** Grouped grants hide the exact capabilities, so a careful owner opens each group and the dialog grows long.

**Reference:** GitHub

#### `rotating-a-key-that-may-have-leaked`: Rotating a key that may have leaked

```wireframe
page
  breadcrumb "Settings" "Developers"
  header
    heading "Developers"
    text "API keys, webhooks and embedding origins."
  tabs "API keys" "Webhooks" "Origins"
    region "Keys"
      list 1
        item: text "Counter sync" · text muted "May be in a shared mailbox" · status "Live" positive · action "Rotate"
  dialog "Rotate Counter sync"
    text "A new secret is issued at once. The old secret works for 24 hours."
    fact "New secret" "Shown once, on the next screen"
    fact "Old secret" "Works until 9 Oct, 09:32"
    fact "Grants" "Unchanged · read orders, read products"
    action "Cancel"
    action primary "Rotate key"
```

**Rationale:** Vercel rotates with the old secret kept briefly, because the systems holding it need time to move. The dialog states the overlap and what happens to in-flight calls.

**Cost:** An overlap keeps a leaked secret valid for its window, so the length of the overlap is a second decision with its own risk.

**Reference:** Vercel

#### `embedding-origins-beside-the-keys`: Embedding origins beside the keys

```wireframe
page
  breadcrumb "Settings" "Developers"
  header
    heading "Developers"
    text "API keys, webhooks and embedding origins."
    action primary "Add origin"
  tabs "API keys" "Webhooks" "Origins"
    region "Origins"
      list 3
        item: text "https://shop.acme-supply.example" · text muted "The storefront checkout" · status "Allowed" positive · action "Remove"
      message "The checkout refuses any page not listed here. Changes apply at once." info
```

**Rationale:** Clerk lists allowed origins beside the keys, because the checkout runs on the company's pages and nowhere else. Each origin names where it is used.

**Cost:** Origins are a third concern on a developers page, and keys, webhooks, and origins together crowd one set of tabs.

**Reference:** Clerk

### Bringing data from spreadsheets

**Question:** Contacts, budget lines, and newsletter consents arrive from spreadsheets. Each import names what was brought in and what was refused. Each refusal names why. The back office fixes refused rows without importing the file twice.

**Default:** `imports-with-the-refused-rows-below`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The imports table with the refused rows below is the best option. History and repairs sit on one page. The column mapping is the runner-up. Prefer it at import time where the match is decided. Never ship the dropzone alone. An import without refused rows hides the work it creates.

#### `imports-with-the-refused-rows-below`: Imports with the refused rows below

```wireframe
page
  breadcrumb "Settings" "Data imports"
  header
    heading "Data imports"
    text "What was brought in from spreadsheets, and what came of it."
    action primary "Register import"
  region "Imports"
    table 3 "File" "Brought in" "Accepted" "Refused" "State"
      item: text "contacts-2026-01.csv" · text "Contacts" · text "1,204" · text "18" · status "Done with refusals" caution
  region "Refused rows · contacts-2026-01.csv"
    list 3
      item: text "Row 44 · no address" · text muted "Name present, email address missing." · action "Drop row"
```

**Rationale:** Shopify shows an import with its failed rows and the reason per row, because a spreadsheet is never clean. Staff repair the refused rows without touching the rows that already went in.

**Cost:** Refused rows from several imports pile up, so each import needs its refused rows grouped under it rather than in one list.

**Reference:** Shopify

#### `matching-columns-to-fields`: Matching columns to fields

```wireframe
page
  breadcrumb "Settings" "Data imports" "Register"
  header
    heading "Register import"
    text "contacts-2026-01.csv · 1,222 rows · match the columns."
    action primary "Import 1,222 rows"
  region "Column mapping"
    field "Voornaam" select = "First name"
    field "Achternaam" select = "Last name"
    field "E-mail" select = "Email address"
    field "Opmerkingen" select = "Ignore"
```

**Rationale:** Mailchimp matches spreadsheet columns to fields before importing, because the file's names never equal the system's. Each row pairs one column with one field and the back office corrects the guesses.

**Cost:** A wide file means twenty mapping rows, so the page needs the unmatched columns first and the matched ones collapsed.

**Reference:** Mailchimp

#### `dropzone-with-the-template-beside-it`: Dropzone with the template beside it

```wireframe
page
  breadcrumb "Settings" "Data imports" "Register"
  header
    heading "Register import"
    text "Bring contacts, budget lines or consents from a spreadsheet."
  split 1:1
    region "Upload the file"
      field "Drop the spreadsheet here" file
      text muted "CSV or Excel · at most 5,000 rows · first row holds the column names."
      action quiet "Choose file"
    region "Start from the template"
      list 3
        item: text "Contacts template" · text muted "First name, last name, email, phone, consent" · action "Download"
```

**Rationale:** Intercom pairs the upload with the template download, because the file imports cleanly only when it starts from the template. The back office downloads, fills, and drops in one loop.

**Cost:** The template covers one kind of import, so contacts, budget lines, and consents each need their own and the page lists three.

**Reference:** Intercom

#### `dry-run-before-the-import`: Dry run before the import

```wireframe
page
  breadcrumb "Settings" "Data imports" "Register"
  header
    heading "Register import"
    text "contacts-2026-01.csv · dry run · nothing written yet."
    action primary "Import 1,204 rows"
  row
    figure "Accepted" "1,204"
    figure "Refused" "18"
    figure "Repairable" "4"
  region "Why 18 rows are refused"
    list 3
      item: text "12 rows · address missing" · text muted "Rows 44, 61 and 88." · action "Drop rows"
```

**Rationale:** Stripe shows a dry run before a bulk change lands, because staff should see how many rows will fail before anything is written. The preview counts accepted, refused, and updated rows without writing anything.

**Cost:** A dry run reads a large file twice, so files over 5,000 rows get no preview.

**Reference:** Stripe

#### `repairing-one-refused-row`: Repairing one refused row

```wireframe
page
  breadcrumb "Settings" "Data imports"
  header
    heading "Data imports"
    text "What was brought in from spreadsheets, and what came of it."
  region "Refused rows · contacts-2026-01.csv"
    list 1
      item: text "Row 207 · address already held" · text muted "maria@garcia-interiors.example is already a contact." · action primary "Repair"
  dialog "Repair row 207"
    text "maria@garcia-interiors.example is already a contact. Importing again would create a duplicate."
    field "First name" text = "Maria"
    field "Phone" text
    text muted "The contact holds no phone number. This fills it."
    action "Update contact"
    action "Drop row"
```

**Rationale:** Shopify repairs a failed row where it lists it, because the fix is one field and the context is the row. The dialog shows the refusal reason above the fields.

**Cost:** One dialog per row is slow when eighteen rows share one cause, so the common causes need bulk commands too.

**Reference:** Shopify

#### `consent-import-refused-outright`: Consent import refused outright

```wireframe
page
  breadcrumb "Settings" "Data imports"
  header
    heading "Data imports"
    text "What was brought in from spreadsheets, and what came of it."
    action primary "Register import"
  message "newsletter-consents.csv was refused. 312 rows carry no consent date." critical
  region "Repair the file"
    text "Add the date each address consented, then import again."
    action "Download the template"
    action primary "Import again"
```

**Rationale:** Customer.io refuses a consent file without proof, because consent cannot be assumed and the company pays the fine. The page states the rule and the repair instead of importing part of the file.

**Cost:** Refusing the whole file for some bad rows discards the good ones too, so the back office fixes and re-imports rather than continuing.

**Reference:** Customer.io

### Connecting the payment account

**Question:** Customer money arrives through the company payment account. Each refund reverses a charge that customer made. The company connects the account once. It chooses which methods customers may use. It reads what each method costs.

**Default:** `connected-account-with-the-methods-below`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The connected account card with the methods list is the best option. Connection state and methods each have their place and costs sit in line. The capability checklist is the runner-up. Prefer it while the connection is new and methods still need approval. Never show the methods without the account card. A method means nothing while the account is disconnected.

#### `connected-account-with-the-methods-below`: Connected account with the methods below

```wireframe
page
  breadcrumb "Settings" "Payments"
  header
    heading "Payments"
    text "The account customers pay into, and what it costs."
    action "Refresh capabilities"
  card "Stripe"
    status "Connected" positive
    fact "Account" "Acme Supply · acct_1H8K2M"
    fact "Payouts go to" "NL20 INGB 0001 2345 67 · Acme Supply"
    fact "Capabilities checked" "8 Oct 2026, 09:32 · all methods live"
    fact "Refunds" "Against each customer's own charge"
    action "Replace account"
    action destructive "Disconnect"
  region "Payment methods"
    table 4 "Method" "Cost" "State"
      item: text "Bank payments" · text "EUR 0.29 per payment" · status "Live" positive · action "Disable"
```

**Rationale:** Stripe draws the connected account above the enabled methods, because methods depend on the connection. The card states the account, the payout bank, and when the capabilities were last refreshed.

**Cost:** The account and the methods each want the top of the page, so on a phone the methods start below the fold.

**Reference:** Stripe

#### `connecting-a-new-account-in-steps`: Connecting a new account in steps

```wireframe
page
  breadcrumb "Settings" "Payments"
  header
    heading "Payments"
    text "Connect the account customers pay into."
  region "Connect Stripe"
    timeline 3
      item: status "Done" positive · text "Sign in at Stripe" · text muted "Acme Supply authorized the connection on 8 Oct."
    action primary "Continue with Stripe"
    message "The product never holds funds. The processor holds them and the product records the reference." info
```

**Rationale:** Stripe Connect onboards in named steps, because connecting means signing in at the provider, approving methods, and setting the payout bank. The steps name what is done and what is left.

**Cost:** Steps imply an order the provider does not enforce, so a step can read as blocked when it is merely unordered.

**Reference:** Stripe

#### `method-capabilities-as-a-checklist`: Method capabilities as a checklist

```wireframe
page
  breadcrumb "Settings" "Payments"
  header
    heading "Payments"
    text "What the connected account can do · checked 8 Oct 2026, 09:32."
    action "Refresh capabilities"
  region "Capabilities"
    list 5
      item: text "Accept bank payments" · text muted "Live · refunds within 180 days" · status "Live" positive
```

**Rationale:** Adyen shows each method with its capabilities and approval state, because a method can be connected but not yet live. The checklist names what works and what is still pending.

**Cost:** Capabilities change at the provider without warning, so the checklist is a cached reading with a timestamp rather than the truth.

**Reference:** Adyen

#### `method-costs-side-by-side`: Method costs side by side

```wireframe
page
  breadcrumb "Settings" "Payments"
  header
    heading "Payments"
    text "What each method costs on last month's orders."
    action primary "Change methods"
  region "September · 3,412 payments · EUR 168,204.00 taken"
    table 3 "Method" "Share" "Fee" "Cost"
      item: text "Bank payments" · text "71%" · text "EUR 0.29 per payment" · text "EUR 702.47"
```

**Rationale:** Mollie quotes each method with its fee in line, because the back office compares costs when choosing methods. The estimate grounds the percentages in last month's orders.

**Cost:** An estimate from last month misleads when the next month sells differently, so the figures need their basis in the open.

**Reference:** Mollie

#### `disconnecting-with-the-consequences-stated`: Disconnecting with the consequences stated

```wireframe
page
  breadcrumb "Settings" "Payments"
  header
    heading "Payments"
    text "The account customers pay into, and what it costs."
  region "Stripe · Connected"
    text "Acme Supply · payouts to NL20 INGB 0001 2345 67."
    action destructive "Disconnect"
  dialog "Disconnect Stripe"
    text "New orders stop at once. Orders already paid stay paid and still ship."
    fact "Money taken" "Stays with the provider · payouts continue"
    fact "Refunds" "Paused until an account is connected"
    fact "Refund window" "Keeps running while disconnected"
    action "Keep it connected"
    action destructive "Disconnect"
```

**Rationale:** GitHub states the blast radius before a destructive command, which disconnecting is: new orders stop at once. The dialog names what stops, what continues, and what happens to money already taken.

**Cost:** A heavy dialog for a rare command is weight carried always and used once, but the cost of an accidental disconnect justifies it.

**Reference:** GitHub

#### `no-account-connected-yet`: No account connected yet

```wireframe
page
  breadcrumb "Settings" "Payments"
  header
    heading "Payments"
    text "The account customers pay into, and what it costs."
  region "No payment account connected"
    text "Customers cannot pay until Acme Supply connects its payment account."
    text muted "Connecting takes about five minutes with the provider."
    action primary "Connect account"
  region "Open the store"
    message "Disabled until a payment account is connected." neutral
    action disabled "Open the store for orders"
```

**Rationale:** Stripe shows an empty payments state with the single command that fixes it, because nothing can be sold until the account exists. The state names the step, not the product.

**Cost:** The empty state cannot show methods or costs, so the back office connects without knowing what each method costs.

**Reference:** Stripe

### Supplier invoice

**Question:** The supplier invoices the company each month. The invoice holds the plan, the fee per order, and the text-message cost. The company reads what each line charges. It downloads the invoice for the books. It pays by direct debit under its mandate.

**Default:** `invoice-sheet-with-its-lines`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The invoice sheet with its lines is the best option. It reads as the document the books need, with the mandate and the download beside it. The plan page with the mandate is the runner-up. Prefer it for changing the plan rather than reading a month. Never show usage lines without their rates. A metered figure without its rate cannot be checked.

#### `invoice-sheet-with-its-lines`: Invoice sheet with its lines

```wireframe
page
  breadcrumb "Settings" "Billing" "Invoices" "INV-2026-09"
  header
    heading "Invoice INV-2026-09"
    status "Paid" positive
    text "Acme Supply · September 2026 · paid 3 Oct by direct debit."
    action "Download PDF"
  card "INV-2026-09 · issued 1 Oct 2026 · due 15 Oct"
    fact "Business plan · September" "EUR 49.00"
    fact "3,412 orders · EUR 0.35 each" "EUR 1,194.20"
    fact "812 text messages · EUR 0.08 each" "EUR 64.96"
    figure "Total · paid 3 Oct" "EUR 1,308.16"
    text muted "Paid by direct debit under mandate MND-8841."
```

**Rationale:** Stripe Billing draws the invoice as the document itself, because the company files it and pays it. The lines carry quantities and rates, and the totals add up top to bottom.

**Cost:** A document-shaped page is read, not worked, so changing the plan or the mandate means leaving it.

**Reference:** Stripe Billing

#### `invoices-newest-first`: Invoices newest first

```wireframe
page
  breadcrumb "Settings" "Billing" "Invoices"
  header
    heading "Invoices"
    text "What Meridian charged Acme Supply."
    action primary "Change plan"
  region "Invoices"
    list 3
      item: text "INV-2026-09 · September" · text muted "Business plan · 3,412 orders · 812 messages" · text "EUR 1,308.16" · status "Paid" positive · action "Open"
```

**Rationale:** Chargebee lists invoices with state and total in line, because the company asks which month is paid and which is open. The overdue row carries the retry date.

**Cost:** The list shows totals without lines, so checking one figure means opening the invoice.

**Reference:** Chargebee

#### `plan-with-the-mandate-beside-it`: Plan with the mandate beside it

```wireframe
page
  breadcrumb "Settings" "Billing"
  header
    heading "Billing"
    text "The plan, the mandate, and the next invoice."
    action primary "Change plan"
  split 1:1
    region "Business plan · EUR 49.00 a month"
      fact "Orders included" "1,000 a month · then EUR 0.35 each"
      fact "Text messages" "EUR 0.08 each"
      fact "Team" "Unlimited members"
      action "Change plan"
    region "How it is paid"
      fact "Method" "Direct debit"
      fact "Mandate" "MND-8841 · signed 10 Jan"
      fact "Next invoice" "1 Nov · about EUR 210.00"
      action "Replace mandate"
```

**Rationale:** Stripe Billing shows the plan, the mandate, and the next invoice together, because changing one affects the others. The company reads what it pays and how it pays before changing either.

**Cost:** Plan, mandate, and next invoice each deserve the top, so the page orders three equals and one of them loses.

**Reference:** Stripe Billing

#### `usage-lines-with-their-rates`: Usage lines with their rates

```wireframe
page
  breadcrumb "Settings" "Billing" "Invoices" "October"
  header
    heading "INV-2026-10 · October so far"
    text "Draft · 412 orders · issued 1 Nov."
    action "Download draft"
  region "Usage"
    table 3 "Line" "Used" "Rate" "Amount"
      item: text "Text messages" · text "96" · text "EUR 0.08 each" · text "EUR 7.68"
```

**Rationale:** Vercel draws metered usage with the rate beside the meter, because a usage line without its rate is a figure the company cannot check. Each line names the plan allowance it counts against.

**Cost:** Rates differ per plan and over time, so the page must state which rate version priced each line.

**Reference:** Vercel

#### `overdue-with-the-retry-stated`: Overdue with the retry stated

```wireframe
page
  breadcrumb "Settings" "Billing" "Invoices" "INV-2026-09"
  header
    heading "Invoice INV-2026-09"
    text "Acme Supply · September 2026."
    action "Download PDF"
  message "The direct debit for EUR 1,308.16 failed. The next attempt is 10 Oct." critical
  region "Fix the payment"
    fact "Owed" "EUR 1,308.16 · due 15 Oct"
    fact "Mandate" "MND-8841 · NL20 INGB 0001 2345 67"
    fact "Next attempt" "10 Oct, automatically"
    action primary "Pay now"
    action "Replace mandate"
```

**Rationale:** Chargebee states the failed charge, the reason, and the next retry, because an overdue invoice is a problem with a date. The company fixes the mandate rather than the invoice.

**Cost:** The overdue-payment wording on the invoice page alarms staff who open the invoice to file it, not to pay it.

**Reference:** Chargebee

#### `text-message-cost-for-the-month`: Text-message cost for the month

```wireframe
page
  breadcrumb "Settings" "Billing" "Costs"
  header
    heading "Message costs"
    text "September · 812 text messages · EUR 64.96."
  region "Cost by kind"
    table 2 "Kind" "Sent" "Failed" "Cost"
      item: text "Delivery codes" · text "604" · text "3" · text "EUR 48.32"
    message "Mail is free and unlimited. Failed messages are not charged." info
```

**Rationale:** Resend breaks message cost down by kind, because delivery codes and reminders fail at different rates. The company reads what each kind costs before the invoice arrives.

**Cost:** Mail is free and text is metered, so one shared cost page mixes two different stories; the channels need either one page with both sections or a page each.

**Reference:** Resend

### Discount and promotion codes

**Question:** A code takes money off an order. Each code has its own value, use limit, and dates. The company watches what each code costs. It retires what leaks. It issues new codes for partners and campaigns.

**Default:** `code-table-with-use-and-state`

**Compact:** The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.

**Rationale:** The code table with usage and state is the best option. It shows value, use, and dates in one scan. Retiring a leaked code is one command on the row. The editor is the runner-up.

Prefer it for creating a code with several conditions. Never ship the redemption-only list. Redemptions explain the past and the company manages the codes.

#### `code-table-with-use-and-state`: Code table with use and state

```wireframe
page
  breadcrumb "Products" "Discounts"
  header
    heading "Discounts"
    text "Discount codes, automatic discounts and vouchers across the company."
    action primary "Issue code"
  tabs "Discount codes" "Automatic" "Vouchers"
    region "Codes"
      table 4 "Code" "Value" "Used" "Valid" "State"
        item: text "DESK10" · text "10% off" · text "412 of 500" · text "1 Feb to 14 Mar" · status "Active" positive · action "Open"
```

**Rationale:** Shopify lists discount codes with uses and limits in line, because the back office asks what each code costs and whether it leaked. The state badge names what the code does now.

**Cost:** The conditions behind a code fit only as a second line. The code page holds the full rule.

**Reference:** Shopify

#### `code-editor-with-its-conditions`: Code editor with its conditions

```wireframe
page
  breadcrumb "Products" "Discounts" "DESK10"
  header
    heading "DESK10"
    text "Discount code · 412 of 500 used."
    action destructive "Retire"
    action primary "Save changes"
  split 1:1
    region "Value"
      field "Type" select = "Percentage off"
      field "Percentage" number = "10"
      field "Maximum uses" number = "500"
      field "Valid until" date = "14 Mar 2026"
    aside
      region "Summary"
        fact "Takes off" "10% of the order total"
        fact "Used" "412 of 500"
        fact "Cost so far" "EUR 1,854.00"
        fact "State" "Active"
```

**Rationale:** Shopify edits a discount as named condition blocks, which fits a code that applies to some products, some channels, and some dates. Each block reads as one sentence of the rule.

**Cost:** The blocks take a long page, so the back office cannot check one code and move to the next without scrolling past every condition.

**Reference:** Shopify

#### `vouchers-with-their-balances`: Vouchers with their balances

```wireframe
page
  breadcrumb "Products" "Discounts"
  header
    heading "Discounts"
    text "Discount codes, automatic discounts and vouchers across the company."
    action primary "Issue voucher"
  tabs "Discount codes" "Automatic" "Vouchers"
    region "Vouchers"
      list 3
        item: text "Voucher AC-2026-0117" · text muted "Issued to Maria Garcia · 6 Oct" · text "EUR 25.00 of EUR 25.00 left" · status "Unused" info · action "Open"
```

**Rationale:** Shopify draws gift cards as balances that spend down, because a voucher is money held for a later order. The balance, not the code, is the figure the company watches.

**Cost:** Vouchers and discount codes share little beyond the word code, so one list for both reads as two lists stapled together.

**Reference:** Shopify

#### `redemptions-newest-first`: Redemptions, newest first

```wireframe
page
  breadcrumb "Products" "Discounts" "DESK10"
  header
    heading "DESK10 redemptions"
    text "412 uses · EUR 1,854.00 taken off · newest first."
    action "Export"
  region "Redemptions"
    table 3 "Order" "Customer" "Used" "Taken off"
      item: text "SO-1042" · text "Maria Garcia" · text "8 Oct 2026, 09:32" · text "EUR 9.00"
    text muted "1 to 3 of 412"
```

**Rationale:** Shopify lists discount redemptions per order, which answers where a leaked code went. Each line ties one use to the order that used it.

**Cost:** Redemptions multiply into the hundreds, so the list needs the code as a filter and is a report rather than the page.

**Reference:** Shopify

#### `issuing-one-code-in-a-dialog`: Issuing one code in a dialog

```wireframe
page
  breadcrumb "Products" "Discounts"
  header
    heading "Discounts"
    text "Discount codes, automatic discounts and vouchers across the company."
  toolbar
    field "Search codes" search
  region "Codes"
    list 2
      item: text "DESK10" · text muted "10% off · 412 of 500 used" · status "Active" positive
  dialog "Issue discount code"
    field "Code" text = "PARTNER-"
    field "Value" select = "10% off"
    field "Maximum uses" number = "100"
    text muted "Letters, numbers and dashes. Customers type it at checkout."
    action "Cancel"
    action primary "Issue code"
```

**Rationale:** Shopify issues a discount code from a short dialog, because a code for a partner is five fields and no conditions. The dialog keeps the list behind it for the names already taken.

**Cost:** Conditions beyond value, limit, and dates do not fit, so a code with channel or product rules needs the full editor anyway.

**Reference:** Shopify

#### `retiring-a-leaked-code`: Retiring a leaked code

```wireframe
page
  breadcrumb "Products" "Discounts"
  header
    heading "Discounts"
    text "Discount codes, automatic discounts and vouchers across the company."
  region "Codes"
    list 1
      item: text "LEAKED20" · text muted "20% off · 1,890 of 200 used · posted on social media" · status "Active" positive · action destructive "Retire"
  dialog "Retire LEAKED20"
    text "1,890 orders used this code, 1,690 over its limit of 200. Retiring stops new uses at once."
    fact "Cost so far" "EUR 17,010.00"
    fact "Orders placed" "Keep their discount"
    fact "New checkouts" "The code is refused"
    action "Keep it on sale"
    action destructive "Retire code"
```

**Rationale:** GitHub retires a leaked secret with the blast radius stated, which is what a leaked code needs. The dialog states the uses, the cost, and what happens to orders already placed.

**Cost:** A confirmation dialog per retirement slows staff who retire several codes after one leak.

**Reference:** GitHub

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/patterns/admin-screens#show-a-new-secret-once | guidance | Does every built screen of this kind keep this rule, including in its compact layout? |
| litespec/frontend/patterns/admin-screens#show-what-a-role-allows-before-granting-it | guidance | Does every built screen of this kind keep this rule, including in its compact layout? |
| litespec/frontend/patterns/admin-screens#team-members-and-their-roles | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/admin-screens#api-keys-and-webhooks | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/admin-screens#bringing-data-from-spreadsheets | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/admin-screens#connecting-the-payment-account | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/admin-screens#supplier-invoice | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
| litespec/frontend/patterns/admin-screens#discount-and-promotion-codes | guidance | Does the built page follow the default option, or the option the project catalog records with its reason? |
