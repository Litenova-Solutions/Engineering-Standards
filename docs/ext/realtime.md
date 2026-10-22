# Realtime Updates

## Intent

Realtime updates push a change to open screens seconds after it happens, faster than polling (repeat requests) delivers at an acceptable cost. This page states when a team replaces polling with realtime transport, which transport fits which need, and which protections each connection carries: authentication, revalidation, recovery, and resource bounds. A team selects it for each use case (one operation the product offers) or journey (steps toward one goal) after measuring polling against the update target, so the product pays for open connections only where a measured target requires live data.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `journey`.

A use case or journey selects this extension after the team measures polling against the update target: the polling interval, the visible delay, the request cost, and the required update speed. The selection also names the accepted cost of disconnects and missed messages: how the client recovers when the connection drops or a notification never arrives.

## Baseline relationship

This extension replaces no baseline provision. One-way notifications travel over server-sent events, which need no added package because the platform ships them.

Selecting `realtime` switches on the Event and Limit record types: each notification carries an Event record, and each resource bound lives in a Limit record.

## Standards

### Record realtime need

**Statement:** A realtime use case MUST document polling behavior, measured cost, update latency, expected connections, and recovery behavior.

**Rationale:** Open connections cost memory, CPU, and operating attention on every host, so the team writes down what polling costs, what the update target requires, and how many connections to expect before choosing transport. The use-case page carries that record with its owner and status, so a later reader sees which measurements justified the choice.

### Reject cosmetic realtime adoption

**Statement:** A product MUST NOT activate realtime only to make an interface feel immediate.

**Rationale:** Realtime transport that serves only a feeling of immediacy spends connection capacity and operating attention without moving any target. The extension asks for a measured update requirement first, so polling stays where polling suffices.

### Use server-sent events for notifications

**Statement:** A one-way server notification use case MUST use server-sent events.

**Rationale:** A notification that flows one way, from server to browser, needs no bidirectional channel with groups and fallback. Server-sent events carry it over plain HTTP, which passes through proxies and firewalls without extra negotiation.

### Use SignalR for interactive messaging

**Statement:** A use case requiring bidirectional messages, server groups, or transport fallback MUST use SignalR.

**Rationale:** Two-way messages, server-managed groups, and transport fallback need a channel built for interaction, which one-way events cannot provide. SignalR supplies all three, so the use case that needs them takes SignalR instead of stretching events past their shape.

### Record transport support

**Statement:** A realtime use case MUST record its transport choice and expected hosted-platform support.

**Rationale:** Hosted platforms limit connection duration, idle timeouts, and transport upgrades in ways that differ per host. Recording the transport choice with its expected platform support surfaces the mismatch before deployment instead of during the first long-lived connection.

### Authenticate and authorize subscriptions

**Statement:** A realtime server MUST authenticate each connection and authorize every user-, tenant-, or resource-scoped subscription.

**Rationale:** Connecting proves who the caller is; it says nothing about which user's, tenant's, or resource's updates the caller may hear. Each user-, tenant-, or resource-scoped subscription checks its own authorization, so one valid connection cannot listen in on another tenant's data.

### Revalidate long-lived access

**Statement:** A realtime server MUST revalidate long-lived access according to token and session lifetime.

**Rationale:** A connection can outlive the grant that opened it: tokens expire, roles change, sessions end. Revalidating access on token and session lifetime closes the connection whose grant died instead of streaming updates to a caller who no longer qualifies.

### Reconnect and refresh authoritative state

**Statement:** A realtime client MUST reconnect with bounded backoff and refresh authoritative state after a connection gap.

**Rationale:** Connections drop, and a notification sent during the gap never arrives. Bounded backoff reconnects without hammering the server, and refreshing authoritative state after the gap replaces whatever the missed notifications would have changed.

### Tolerate notification ordering differences

**Statement:** A realtime client MUST safely handle duplicate and out-of-order notifications.

**Rationale:** The transport can deliver a notification twice or deliver two of them out of order. A client that applies each notification as an absolute update corrupts its state on the first duplicate; a client built for repeats and reordering converges on the truth either way.

### Bound realtime resources

**Statement:** A realtime deployment MUST set four Limit-record bounds: concurrent connections per host, receive message size, parallel invocations per connection, and client timeout.

**Rationale:** Each open connection holds memory, each message costs CPU, and a flood of either starves the host. The deployment sets four bounds as Limit records - concurrent connections per host, receive message size, parallel invocations per connection, and client timeout - with each value drawn from the deployment's own connection count and message size and the observation that produced it. [The platform's realtime security guidance](https://learn.microsoft.com/en-us/aspnet/core/signalr/security) names the same settings.

### Reject unbounded slow-client buffering

**Statement:** A realtime server MUST NOT buffer an unbounded stream for a slow client.

**Rationale:** A client that reads slower than the server writes grows its buffer without end, consuming host memory meant for every subscriber. Bounded buffering with backpressure disconnects or slows the laggard instead of letting one slow reader starve the rest.

## Conventions

### Place realtime code at outer boundaries

**Default:** Keep hubs or endpoints in WebApi, publication adapters in Infrastructure, and browser connections under `lib/realtime/`.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Hubs, endpoints, publication adapters, and browser connections deal in transport and provider detail, not business rules. Keeping them at the outer boundaries leaves business features owning only the narrow functions they call.

### Subscribe through narrow functions

**Default:** Let feature modules subscribe through narrow operation-specific functions.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** A feature that touches the raw connection spreads subscription strings and payload shapes through business code. Narrow operation-specific functions show each subscription's inputs and effects beside the feature that owns them.

## Dependencies

- Selecting SignalR adds `@microsoft/signalr`. The project records a Decision for the package and pins it in the manifest.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/realtime#record-realtime-need | guidance | Does the use-case page record polling, cost, target latency, connections, and recovery? |
| litespec/ext/realtime#reject-cosmetic-realtime-adoption | guidance | Does the realtime decision cite a measurable update requirement? |
| litespec/ext/realtime#use-server-sent-events-for-notifications | guidance | Does each one-way notification use the server-sent events boundary? |
| litespec/ext/realtime#use-signalr-for-interactive-messaging | guidance | Does each bidirectional use case use SignalR capabilities? |
| litespec/ext/realtime#record-transport-support | guidance | Does the use-case page record the transport and hosting support? |
| litespec/ext/realtime#authenticate-and-authorize-subscriptions | guidance | Do anonymous, unrelated, owner, and tenant-scoped connections meet the authorization rule? |
| litespec/ext/realtime#revalidate-long-lived-access | guidance | Does an expired session or token lose access? |
| litespec/ext/realtime#reconnect-and-refresh-authoritative-state | guidance | Does the client reconnect with bounded backoff and refresh authoritative state? |
| litespec/ext/realtime#tolerate-notification-ordering-differences | guidance | Do duplicate and reordered notifications leave client state correct? |
| litespec/ext/realtime#bound-realtime-resources | guidance | Does each of the four bounds live as a Limit record with its value? |
| litespec/ext/realtime#reject-unbounded-slow-client-buffering | guidance | Is slow-client buffering bounded with controlled backpressure? |
| litespec/ext/realtime#place-realtime-code-at-outer-boundaries | guidance | Does realtime transport code sit at the documented boundaries or a recorded Exception? |
| litespec/ext/realtime#subscribe-through-narrow-functions | guidance | Do features subscribe through operation-specific functions or a recorded Exception? |
