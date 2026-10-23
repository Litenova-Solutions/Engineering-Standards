# Connected Devices

## Intent

Devices hold state, apply rules, and sync while offline, so the product owes them a protocol: messages, versions, client rules, and the shape of offline uploads. This page states the `protocol` block an entry point carries when devices reach it. A project selects it for each entry point that serves scanners, kiosks, or offline-capable clients.

## Activation

Activation scope: `local`.

Applicable specification kinds: `entry-point`.

A project selects `devices` for an entry point when devices reach it with stored state, local rules, or offline sync. A browser or API entry point with no device client does not select it.

## Baseline Relationship

This extension replaces no baseline provision. It switches on no record type: it adds the `protocol` block to entry-point records.

The block names the messages the entry point exchanges, the version rule devices follow, the client rules devices apply with their scenarios, the nonce that makes retries idempotent, and the `force` and `simulate` flags on offline uploads.

## Standards

### Describe Device Messages as a Channel Fragment

**Statement:** A device protocol MUST describe its messages as an AsyncAPI channel fragment with named operations and payloads.

**Rationale:** Devices and servers evolve apart: a scanner runs last year's firmware against this week's server. A channel fragment names each direction, each message, and each payload in one shape both sides read, so a mismatch shows in the record before it shows on the loading dock.

**Example:**

```yaml
protocol:
  channel: scanner/check-in
  publish:
    message: check-in.recorded
    payload: { code, nonce, scannedAt }
  subscribe:
    message: check-in.denied
    payload: { code, reason }
```

### Version the Device Protocol

**Statement:** A device protocol MUST state its version rule with numbering, overlap, and the upgrade path.

**Rationale:** Old firmware cannot be recalled from the field, so several protocol versions stay live at once. Numbering tells a device which version it speaks, overlap tells the server how long to answer old versions, and the upgrade path tells the device how to move forward. Without the three, a server upgrade bricks every device that missed the memo.

### State Client Rules with Scenarios

**Statement:** Each client rule in a device protocol MUST carry the scenarios that prove it.

**Rationale:** Client rules run where the server cannot see them: validation a scanner applies offline, storage limits a kiosk enforces, queueing a phone does in a tunnel. A rule without scenarios is a rumor about what devices do. Scenarios pin the rule to observable device behavior the product tests against.

**Example:** The rule `a scanner queues scans while offline` carries the scenario `a scan queued offline uploads on reconnect`.

### Identify Retries with a Nonce

**Statement:** Each mutating device message MUST carry a client-generated nonce as its idempotency key.

**Rationale:** A device that loses signal mid-send retries what the server already applied. The nonce gives the retry a stable identity scoped to the device, so the server answers the repeat from the first attempt instead of charging, admitting, or shipping twice.

**Example:** A door scan carries `nonce: 7f3a`, and the second delivery of the same nonce returns the first attempt's result.

### Simulate Offline Uploads Before Applying

**Statement:** An offline upload with `simulate` MUST return its outcome without writing.

**Rationale:** A device back online after a week holds uploads the world outgrew: prices changed, codes voided, windows closed. Simulating the queue shows what would happen before anything is written, so the operator reconciles first and applies second.

**Example:** A scanner uploads three hundred queued scans with `simulate`, reviews the two the server would refuse, and then uploads for real.

### Apply Forced Uploads over Newer State

**Statement:** An offline upload with `force` MUST apply over newer server state and record the overwrite.

**Rationale:** Sometimes the device is right and the server is stale: a supervisor corrected the count on the floor while the server held the old one. Force lets the operator say so explicitly, and the recorded overwrite keeps the decision visible instead of burying it in a silent win.

**Example:** A corrected count uploads with `force`, overwrites the server value, and leaves an overwrite record naming the operator.

## Conventions

### Version Protocols by Date

**Default:** Protocol versions use calendar numbering of the form `YYYY.N`.

**Replacement:** A project names its protocol numbering scheme in its device documentation.

**Rationale:** Calendar numbering tells a support engineer how old a device is at a glance. Any scheme works when every device and the server share it.

### Replay Uploads in Queue Order

**Default:** The server applies an offline queue in the order the device queued it.

**Replacement:** A project names the order its server applies offline queues.

**Rationale:** Queue order matches what the operator saw on the device: first scanned, first applied. Another order replays the day out of sequence and surprises everyone reading the log.

## Dependencies

Packages: None.

Related extensions: `concurrency` for the nonce idempotency keys and overlapping-write handling.

Guides: None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/devices#describe-device-messages-as-a-channel-fragment | guidance | The protocol blocks on the device entry points list named operations with payloads in the channel shape. |
| litespec/ext/devices#version-the-device-protocol | guidance | The protocol blocks state numbering, overlap, and the upgrade path devices follow. |
| litespec/ext/devices#state-client-rules-with-scenarios | guidance | Each client rule in the protocol blocks points at scenarios that prove it. |
| litespec/ext/devices#identify-retries-with-a-nonce | guidance | The mutating messages in the protocol blocks carry a client-generated nonce scoped to the device. |
| litespec/ext/devices#simulate-offline-uploads-before-applying | guidance | Simulated uploads in the device tests return outcomes with no writes behind them. |
| litespec/ext/devices#apply-forced-uploads-over-newer-state | guidance | Forced uploads in the device tests overwrite newer server values and leave overwrite records. |
| litespec/ext/devices#version-protocols-by-date | guidance | Protocol versions read as calendar numbers, or the device documentation names the numbering scheme. |
| litespec/ext/devices#replay-uploads-in-queue-order | guidance | The server applies offline queues in device order in the upload tests, or the project names another order. |
