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

- Record polling cost and recovery behavior. (EXT.REALTIME.ADOPT.001)
- Select server-sent events or SignalR by need. (EXT.REALTIME.TRANSPORT.001, EXT.REALTIME.TRANSPORT.002)
- Authenticate connections and authorize scoped subscriptions. (EXT.REALTIME.ACCESS.001)
- Refresh authoritative state after disconnect. (EXT.REALTIME.RECOVERY.001)
- Bound connection and message resources. (EXT.REALTIME.CAPACITY.001)
- Keep transport code at outer boundaries. (EXT.REALTIME.CONVENTION.001)

## Standards

### Record realtime need (EXT.REALTIME.ADOPT.001)

**Requirement:** A realtime use case MUST document polling behavior, measured cost, update latency, expected connections, and recovery behavior.

**Rationale:** The record compares realtime cost with an accepted user-visible update target.

### Reject cosmetic realtime adoption (EXT.REALTIME.ADOPT.002)

**Requirement:** A product MUST NOT activate realtime only to make an interface feel immediate.

**Rationale:** Realtime transport needs a measurable update requirement beyond visual preference.

### Use server-sent events for notifications (EXT.REALTIME.TRANSPORT.001)

**Requirement:** A one-way server notification use case MUST use server-sent events.

**Rationale:** Server-sent events provide an HTTP-based direction from server to browser.

### Use SignalR for interactive messaging (EXT.REALTIME.TRANSPORT.002)

**Requirement:** A use case requiring bidirectional messages, server groups, or transport fallback MUST use SignalR.

**Rationale:** SignalR supplies the interaction and fallback capabilities that one-way events lack.

### Record transport support (EXT.REALTIME.TRANSPORT.003)

**Requirement:** A realtime use case MUST record its transport choice and expected hosted-platform support.

**Rationale:** Hosted-platform connection behavior can constrain the selected transport.

### Authenticate and authorize subscriptions (EXT.REALTIME.ACCESS.001)

**Requirement:** A realtime server MUST authenticate each connection and authorize every user-, tenant-, or resource-scoped subscription.

**Rationale:** A valid connection does not grant access to arbitrary user, tenant, or resource data.

### Revalidate long-lived access (EXT.REALTIME.ACCESS.002)

**Requirement:** A realtime server MUST revalidate long-lived access according to token and session lifetime.

**Rationale:** Connection authorization can become stale after a token, role, or session change.

### Reconnect and refresh authoritative state (EXT.REALTIME.RECOVERY.001)

**Requirement:** A realtime client MUST reconnect with bounded backoff and refresh authoritative state after a connection gap.

**Rationale:** A refresh restores server truth after disconnect or missed notifications.

### Tolerate notification ordering differences (EXT.REALTIME.RECOVERY.002)

**Requirement:** A realtime client MUST safely handle duplicate and out-of-order notifications.

**Rationale:** Transport delivery does not guarantee one ordered notification for each observed change.

### Bound realtime resources (EXT.REALTIME.CAPACITY.001)

**Requirement:** A realtime deployment MUST set connection, message, group, payload, and backpressure limits.

**Rationale:** Explicit limits protect server memory, CPU, and connection capacity.

### Reject unbounded slow-client buffering (EXT.REALTIME.CAPACITY.002)

**Requirement:** A realtime server MUST NOT buffer an unbounded stream for a slow client.

**Rationale:** Slow-client buffers can exhaust resources and delay other subscribers.

## Conventions

### Place realtime code at outer boundaries (EXT.REALTIME.CONVENTION.001)

**Default:** Keep hubs or endpoints in WebApi, publication adapters in Infrastructure, and browser connections under `lib/realtime/`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Transport and provider details remain outside business feature ownership.

### Subscribe through narrow functions (EXT.REALTIME.CONVENTION.002)

**Default:** Let feature modules subscribe through narrow operation-specific functions.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Operation-level functions keep subscription inputs and effects visible to the owning feature.

## Dependencies

- `@microsoft/signalr` when SignalR is selected

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.REALTIME.ADOPT.001 | inspection | Use-case documentation records polling, cost, target latency, connections, and recovery. |
| EXT.REALTIME.ADOPT.002 | inspection | Realtime decision cites a measurable update requirement. |
| EXT.REALTIME.TRANSPORT.001 | test | `RealtimeTransportTests` use the server-sent events boundary. |
| EXT.REALTIME.TRANSPORT.002 | test | `RealtimeTransportTests` use SignalR capabilities. |
| EXT.REALTIME.TRANSPORT.003 | inspection | Realtime specification records chosen transport and hosting support. |
| EXT.REALTIME.ACCESS.001 | test | `RealtimeAuthTests` cover anonymous, unrelated, owner, and tenant-scoped connections. |
| EXT.REALTIME.ACCESS.002 | test | `RealtimeAuthTests` revalidate expired session or token access. |
| EXT.REALTIME.RECOVERY.001 | test | `RealtimeRecoveryTests` use bounded reconnect and authoritative refresh. |
| EXT.REALTIME.RECOVERY.002 | test | `RealtimeRecoveryTests` asserts duplicate and reordered notifications leave the client state correct. |
| EXT.REALTIME.CAPACITY.001 | operation | Deployment configuration declares every required connection and message limit. |
| EXT.REALTIME.CAPACITY.002 | test | `RealtimeCapacityTests` show bounded buffering and controlled backpressure behavior. |
| EXT.REALTIME.CONVENTION.001 | inspection | Source review locates realtime transport code at the documented boundaries. |
| EXT.REALTIME.CONVENTION.002 | inspection | Feature review identifies operation-specific subscription functions. |
