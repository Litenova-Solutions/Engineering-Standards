# Human Work Queues

## Intent

Some work waits for people: reviews, approvals, exceptions, and payouts that a person picks up, scores, and clears. This page states the claim modes, the cited scores, and the preview and confirmation behind bulk money actions. A project selects it for each use case that lists queue items or clears them in bulk.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`.

A project selects `queues` for a use case when the use case lists work items people claim or clears items in bulk. Ordinary reads and single-item commands do not select it.

## Baseline Relationship

This extension replaces no baseline provision. It switches on no record type: it adds queue detail to use-case records.

A listing query states its `claim` mode and its `score`, while a bulk money command states its `preview` and its `confirmBy` code.

## Standards

### State the Claim Mode

**Statement:** A work queue MUST state its claim mode as disabled, optional, or required.

**Rationale:** Two people clearing the same item double-pay, double-approve, or double-refuse. The claim mode says whether items need no claim, accept an optional hold, or require one before action, so the queue never leaves two hands on one item.

**Example:** The payout queue requires a claim before release, while the review queue leaves claiming optional.

### Order Queue Items by Score

**Statement:** A work queue MUST order its items by a score that cites a calculation rule.

**Rationale:** A queue without an order is cleared by habit: newest first, loudest first, easiest first. A score citing a calculation rule pins the order to declared inputs, so the riskiest or most valuable item surfaces first by rule instead of by accident.

**Example:** The dispute queue orders by `rule/dispute.urgency-score`, which weighs amount, age, and evidence gaps.

### Show the Score Beside Each Item

**Statement:** A queue listing MUST show each item score with the inputs that set it.

**Rationale:** A hidden score is an oracle: people work around an order they cannot see or trust. Showing the score with its inputs lets each person check the order and challenge the inputs instead of the queue.

**Example:** Each dispute row shows `urgency 82: EUR 1,900, 6 days old, evidence missing`.

### Release Claims Past Their Lease

**Statement:** A claimed item MUST return to the queue when its claim lease expires.

**Rationale:** Claims are held by people who go home: a claim with no expiry parks the item forever. The lease returns stale claims to the queue, so an abandoned item waits for the next person instead of for nobody.

**Example:** A payout claimed Friday and untouched returns to the queue when its one-hour lease expires.

### Show a Preview Before Bulk Money Actions

**Statement:** A bulk money command MUST render a preview of every affected item before acting.

**Rationale:** Bulk money moves on many items at once, and one wrong filter multiplies one mistake into hundreds. The preview lists every affected item with its amount, so the person confirms the set they meant instead of the set they typed.

**Example:** The bulk release previews forty-two payouts totaling EUR 18,400 before asking for confirmation.

### Confirm Bulk Money Actions Out of Band

**Statement:** A bulk money command MUST require its `confirmBy` code from outside the session.

**Rationale:** A preview confirms the set, but the session itself may be hijacked, shared, or left open. An out-of-band code arrives on a channel the session does not control, so the confirmation proves the person, not just the browser.

**Example:** The bulk release asks for the six-digit code sent to the finance phone before moving any money.

## Conventions

### Order Unscored Queues by Age

**Default:** A queue without a score lists its oldest item first.

**Replacement:** A project names its fallback queue order in its queue documentation.

**Rationale:** Age is the honest fallback: the item waiting longest goes first. Any other fallback works when the queue states it.

## Dependencies

Packages: None.

Related extensions: None.

Guides: None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/queues#state-the-claim-mode | guidance | The queue use cases state disabled, optional, or required on their claim field. |
| litespec/ext/queues#order-queue-items-by-score | guidance | The queue listings sort by a score citing the calculation rule behind it. |
| litespec/ext/queues#show-the-score-beside-each-item | guidance | The queue rows display each score with the inputs that set it. |
| litespec/ext/queues#release-claims-past-their-lease | guidance | The claim tests show untouched items returning after their lease expires. |
| litespec/ext/queues#show-a-preview-before-bulk-money-actions | guidance | The bulk money commands render every affected item with its amount before acting. |
| litespec/ext/queues#confirm-bulk-money-actions-out-of-band | guidance | The bulk money commands ask for the out-of-band code before moving money. |
| litespec/ext/queues#order-unscored-queues-by-age | guidance | Queues without a score list oldest first, or the queue documentation names another fallback order. |
