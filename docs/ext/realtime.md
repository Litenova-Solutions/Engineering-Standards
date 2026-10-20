# Realtime Updates

## Intent

Realtime transport reduces visible update delay when polling cannot meet an accepted user requirement. Messages remain refresh hints unless a use case defines durable ordered delivery.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `journey`.

The consumer enables `realtime` after measuring polling interval, visible delay, request cost, and required update target. It names acceptable disconnect and missed-message recovery.

## Baseline relationship

This extension replaces no baseline provision. Server-sent events use platform capabilities.

`event`, `limit`. Selecting `realtime` requires Event records for the notifications it carries and Limit records for the bounds it sets.

## Agent Summary {#agent-summary}

- Record polling cost and recovery behavior. (litespec/rule/ext-realtime.record-realtime-need)
- Select server-sent events or SignalR by need. (litespec/rule/ext-realtime.use-server-sent-events-for-notifications, litespec/rule/ext-realtime.use-signalr-for-interactive-messaging)
- Authenticate connections and authorize scoped subscriptions. (litespec/rule/ext-realtime.authenticate-and-authorize-subscriptions)
- Refresh authoritative state after disconnect. (litespec/rule/ext-realtime.reconnect-and-refresh-authoritative-state)
- Bound connection and message resources. (litespec/rule/ext-realtime.bound-realtime-resources)
- Keep transport code at outer boundaries. (litespec/rule/ext-realtime.place-realtime-code-at-outer-boundaries)

## Standards

### Record realtime need (litespec/rule/ext-realtime.record-realtime-need)

**Requirement:** A realtime use case MUST document polling behavior, measured cost, update latency, expected connections, and recovery behavior.

**Rationale:** The record compares realtime cost with an accepted user-visible update target. The use-case page carries the record with its owner and status.

### Reject cosmetic realtime adoption (litespec/rule/ext-realtime.reject-cosmetic-realtime-adoption)

**Requirement:** A product MUST NOT activate realtime only to make an interface feel immediate.

**Rationale:** Realtime transport needs a measurable update requirement beyond visual preference.

### Use server-sent events for notifications (litespec/rule/ext-realtime.use-server-sent-events-for-notifications)

**Requirement:** A one-way server notification use case MUST use server-sent events.

**Rationale:** Server-sent events provide an HTTP-based direction from server to browser.

### Use SignalR for interactive messaging (litespec/rule/ext-realtime.use-signalr-for-interactive-messaging)

**Requirement:** A use case requiring bidirectional messages, server groups, or transport fallback MUST use SignalR.

**Rationale:** SignalR supplies the interaction and fallback capabilities that one-way events lack.

### Record transport support (litespec/rule/ext-realtime.record-transport-support)

**Requirement:** A realtime use case MUST record its transport choice and expected hosted-platform support.

**Rationale:** Hosted-platform connection behavior can constrain the selected transport.

### Authenticate and authorize subscriptions (litespec/rule/ext-realtime.authenticate-and-authorize-subscriptions)

**Requirement:** A realtime server MUST authenticate each connection and authorize every user-, tenant-, or resource-scoped subscription.

**Rationale:** A valid connection does not grant access to arbitrary user, tenant, or resource data.

### Revalidate long-lived access (litespec/rule/ext-realtime.revalidate-long-lived-access)

**Requirement:** A realtime server MUST revalidate long-lived access according to token and session lifetime.

**Rationale:** Connection authorization can become stale after a token, role, or session change.

### Reconnect and refresh authoritative state (litespec/rule/ext-realtime.reconnect-and-refresh-authoritative-state)

**Requirement:** A realtime client MUST reconnect with bounded backoff and refresh authoritative state after a connection gap.

**Rationale:** A refresh restores server truth after disconnect or missed notifications.

### Tolerate notification ordering differences (litespec/rule/ext-realtime.tolerate-notification-ordering-differences)

**Requirement:** A realtime client MUST safely handle duplicate and out-of-order notifications.

**Rationale:** Transport delivery does not guarantee one ordered notification for each observed change.

### Bound realtime resources (litespec/rule/ext-realtime.bound-realtime-resources)

**Requirement:** A realtime deployment MUST set four Limit-record bounds: concurrent connections per host, receive message size, parallel invocations per connection, and client timeout.

**Rationale:** Explicit limits protect server memory, CPU, and connection capacity. Each value comes from the deployment's own connection count and message size, with the observation that produced it. [The platform's realtime security guidance](https://learn.microsoft.com/en-us/aspnet/core/signalr/security) names the same knobs.

### Reject unbounded slow-client buffering (litespec/rule/ext-realtime.reject-unbounded-slow-client-buffering)

**Requirement:** A realtime server MUST NOT buffer an unbounded stream for a slow client.

**Rationale:** Slow-client buffers can exhaust resources and delay other subscribers.

## Conventions

### Place realtime code at outer boundaries (litespec/rule/ext-realtime.place-realtime-code-at-outer-boundaries)

**Default:** Keep hubs or endpoints in WebApi, publication adapters in Infrastructure, and browser connections under `lib/realtime/`.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Transport and provider details remain outside business feature ownership.

### Subscribe through narrow functions (litespec/rule/ext-realtime.subscribe-through-narrow-functions)

**Default:** Let feature modules subscribe through narrow operation-specific functions.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Operation-level functions keep subscription inputs and effects visible to the owning feature.

## Dependencies

- `@microsoft/signalr` when SignalR is selected, through a decision and a manifest pin.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/ext-realtime.record-realtime-need | guidance | Does the use-case page record polling, cost, target latency, connections, and recovery? |
| litespec/rule/ext-realtime.reject-cosmetic-realtime-adoption | guidance | Does the realtime decision cite a measurable update requirement? |
| litespec/rule/ext-realtime.use-server-sent-events-for-notifications | guidance | Does each one-way notification use the server-sent events boundary? |
| litespec/rule/ext-realtime.use-signalr-for-interactive-messaging | guidance | Does each bidirectional use case use SignalR capabilities? |
| litespec/rule/ext-realtime.record-transport-support | guidance | Does the use-case page record the transport and hosting support? |
| litespec/rule/ext-realtime.authenticate-and-authorize-subscriptions | guidance | Do anonymous, unrelated, owner, and tenant-scoped connections meet the authorization rule? |
| litespec/rule/ext-realtime.revalidate-long-lived-access | guidance | Does an expired session or token lose access? |
| litespec/rule/ext-realtime.reconnect-and-refresh-authoritative-state | guidance | Does the client reconnect with bounded backoff and refresh authoritative state? |
| litespec/rule/ext-realtime.tolerate-notification-ordering-differences | guidance | Do duplicate and reordered notifications leave client state correct? |
| litespec/rule/ext-realtime.bound-realtime-resources | guidance | Does each of the four bounds live as a Limit record with its value? |
| litespec/rule/ext-realtime.reject-unbounded-slow-client-buffering | guidance | Is slow-client buffering bounded with controlled backpressure? |
| litespec/rule/ext-realtime.place-realtime-code-at-outer-boundaries | guidance | Does realtime transport code sit at the documented boundaries or a recorded Exception? |
| litespec/rule/ext-realtime.subscribe-through-narrow-functions | guidance | Do features subscribe through operation-specific functions or a recorded Exception? |
