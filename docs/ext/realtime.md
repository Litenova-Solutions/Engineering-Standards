# Realtime Updates

## Intent

Realtime transport reduces visible update delay when polling cannot meet an accepted user requirement. Messages remain refresh hints unless a use case defines durable ordered delivery.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `end-to-end-flow`.

The consumer enables `realtime` after measuring polling interval, visible delay, request cost, and required update target. It names acceptable disconnect and missed-message recovery.

## Baseline relationship

This extension replaces no baseline rule. SignalR browser clients add pinned `@microsoft/signalr`; server-sent events use platform capabilities.

## Agent Summary {#agent-summary}

- Record polling cost and recovery behavior. (standards/rule/ext-realtime.record-realtime-need)
- Select server-sent events or SignalR by need. (standards/rule/ext-realtime.use-server-sent-events-for-notifications, standards/rule/ext-realtime.use-signalr-for-interactive-messaging)
- Authenticate connections and authorize scoped subscriptions. (standards/rule/ext-realtime.authenticate-and-authorize-subscriptions)
- Refresh authoritative state after disconnect. (standards/rule/ext-realtime.reconnect-and-refresh-authoritative-state)
- Bound connection and message resources. (standards/rule/ext-realtime.bound-realtime-resources)
- Keep transport code at outer boundaries. (standards/rule/ext-realtime.place-realtime-code-at-outer-boundaries)

## Standards

### Record realtime need (standards/rule/ext-realtime.record-realtime-need)

**Requirement:** A realtime use case MUST document polling behavior, measured cost, update latency, expected connections, and recovery behavior.

**Rationale:** The record compares realtime cost with an accepted user-visible update target.

### Reject cosmetic realtime adoption (standards/rule/ext-realtime.reject-cosmetic-realtime-adoption)

**Requirement:** A product MUST NOT activate realtime only to make an interface feel immediate.

**Rationale:** Realtime transport needs a measurable update requirement beyond visual preference.

### Use server-sent events for notifications (standards/rule/ext-realtime.use-server-sent-events-for-notifications)

**Requirement:** A one-way server notification use case MUST use server-sent events.

**Rationale:** Server-sent events provide an HTTP-based direction from server to browser.

### Use SignalR for interactive messaging (standards/rule/ext-realtime.use-signalr-for-interactive-messaging)

**Requirement:** A use case requiring bidirectional messages, server groups, or transport fallback MUST use SignalR.

**Rationale:** SignalR supplies the interaction and fallback capabilities that one-way events lack.

### Record transport support (standards/rule/ext-realtime.record-transport-support)

**Requirement:** A realtime use case MUST record its transport choice and expected hosted-platform support.

**Rationale:** Hosted-platform connection behavior can constrain the selected transport.

### Authenticate and authorize subscriptions (standards/rule/ext-realtime.authenticate-and-authorize-subscriptions)

**Requirement:** A realtime server MUST authenticate each connection and authorize every user-, tenant-, or resource-scoped subscription.

**Rationale:** A valid connection does not grant access to arbitrary user, tenant, or resource data.

### Revalidate long-lived access (standards/rule/ext-realtime.revalidate-long-lived-access)

**Requirement:** A realtime server MUST revalidate long-lived access according to token and session lifetime.

**Rationale:** Connection authorization can become stale after a token, role, or session change.

### Reconnect and refresh authoritative state (standards/rule/ext-realtime.reconnect-and-refresh-authoritative-state)

**Requirement:** A realtime client MUST reconnect with bounded backoff and refresh authoritative state after a connection gap.

**Rationale:** A refresh restores server truth after disconnect or missed notifications.

### Tolerate notification ordering differences (standards/rule/ext-realtime.tolerate-notification-ordering-differences)

**Requirement:** A realtime client MUST safely handle duplicate and out-of-order notifications.

**Rationale:** Transport delivery does not guarantee one ordered notification for each observed change.

### Bound realtime resources (standards/rule/ext-realtime.bound-realtime-resources)

**Requirement:** A realtime deployment MUST set connection, message, group, payload, and backpressure limits.

**Rationale:** Explicit limits protect server memory, CPU, and connection capacity.

Each limit is set rather than inherited. A transport ships defaults that suit a sample application, and the value a deployment needs comes from its own connection count and message size. [The platform's realtime security guidance](https://learn.microsoft.com/en-us/aspnet/core/signalr/security) names the knobs. They are the maximum concurrent connections per host, the maximum receive message size, the maximum parallel invocations per connection, and the client timeout. A deployment records the value it set for each, and the observation that produced it.

### Reject unbounded slow-client buffering (standards/rule/ext-realtime.reject-unbounded-slow-client-buffering)

**Requirement:** A realtime server MUST NOT buffer an unbounded stream for a slow client.

**Rationale:** Slow-client buffers can exhaust resources and delay other subscribers.

## Conventions

### Place realtime code at outer boundaries (standards/rule/ext-realtime.place-realtime-code-at-outer-boundaries)

**Default:** Keep hubs or endpoints in WebApi, publication adapters in Infrastructure, and browser connections under `lib/realtime/`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Transport and provider details remain outside business feature ownership.

### Subscribe through narrow functions (standards/rule/ext-realtime.subscribe-through-narrow-functions)

**Default:** Let feature modules subscribe through narrow operation-specific functions.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Operation-level functions keep subscription inputs and effects visible to the owning feature.

## Dependencies

- `@microsoft/signalr` when SignalR is selected

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/ext-realtime.record-realtime-need | inspection | Use-case documentation records polling, cost, target latency, connections, and recovery. |
| standards/rule/ext-realtime.reject-cosmetic-realtime-adoption | inspection | Realtime decision cites a measurable update requirement. |
| standards/rule/ext-realtime.use-server-sent-events-for-notifications | test | `RealtimeTransportTests` use the server-sent events boundary. |
| standards/rule/ext-realtime.use-signalr-for-interactive-messaging | test | `RealtimeTransportTests` use SignalR capabilities. |
| standards/rule/ext-realtime.record-transport-support | inspection | Realtime specification records chosen transport and hosting support. |
| standards/rule/ext-realtime.authenticate-and-authorize-subscriptions | test | `RealtimeAuthTests` cover anonymous, unrelated, owner, and tenant-scoped connections. |
| standards/rule/ext-realtime.revalidate-long-lived-access | test | `RealtimeAuthTests` revalidate expired session or token access. |
| standards/rule/ext-realtime.reconnect-and-refresh-authoritative-state | test | `RealtimeRecoveryTests` use bounded reconnect and authoritative refresh. |
| standards/rule/ext-realtime.tolerate-notification-ordering-differences | test | `RealtimeRecoveryTests` asserts duplicate and reordered notifications leave the client state correct. |
| standards/rule/ext-realtime.bound-realtime-resources | operation | Deployment configuration declares every required connection and message limit. |
| standards/rule/ext-realtime.reject-unbounded-slow-client-buffering | test | `RealtimeCapacityTests` show bounded buffering and controlled backpressure behavior. |
| standards/rule/ext-realtime.place-realtime-code-at-outer-boundaries | inspection | Source review locates realtime transport code at the documented boundaries. |
| standards/rule/ext-realtime.subscribe-through-narrow-functions | inspection | Feature review identifies operation-specific subscription functions. |
