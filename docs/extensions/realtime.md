# Realtime Updates

## Intent

Realtime transport reduces visible update delay when polling cannot meet an accepted user requirement. Messages remain hints to refresh authoritative server data unless the use case explicitly defines durable ordered delivery.

## Activation

**Activation scope:** `local`. Applicable specification kinds: Use case, End-to-End Flow. List it in `applicableExtensions` only on those kinds.

Enable `realtime` after measuring the polling interval, user-visible delay, request cost, and required update target. Name acceptable disconnect and missed-message recovery.

This extension replaces no baseline rule. SignalR browser clients add the pinned `@microsoft/signalr` package; server-sent events use platform capabilities.

## Agent Summary {#agent-summary}

- Record the update latency target and polling limit.
- Choose server-sent events for one-way updates and SignalR for bidirectional or grouped interaction.
- Authenticate connections and authorize each subscription target.
- Treat messages as refresh hints unless durable ordering is specified.
- Reconnect with bounded backoff and refresh after a gap.
- Test connection, authorization, duplicate, stale, reconnect, and missed-message behavior.

## Standards

### Record latency and polling limits (EXT.REALTIME.ADOPT.001)

Document current polling behavior, measured cost, required update latency, expected connection count, and recovery behavior. Do not activate realtime only to make an interface feel immediate.

### Select transport by interaction (EXT.REALTIME.TRANSPORT.001)

Use server-sent events for one-way server notifications. Use SignalR when clients require bidirectional messages, server groups, or transport fallback.

Record the choice and expected hosted-platform support.

### Authorize subscriptions (EXT.REALTIME.AUTH.001)

Authenticate each connection and authorize every user-, tenant-, or resource-scoped subscription. A valid connection cannot subscribe to arbitrary resource IDs.

Revalidate long-lived access according to token and session lifetime.

### Recover after disconnect (EXT.REALTIME.RECOVERY.001)

Clients reconnect with bounded backoff and refresh authoritative state after a connection gap. Handle duplicate and out-of-order notifications safely.

### Bound connection resources (EXT.REALTIME.CAPACITY.001)

Set connection, message, group, payload, and backpressure limits. Do not buffer an unbounded stream for a slow client.

## Conventions

Keep transport hubs or endpoints in WebApi, publication adapters in Infrastructure, and browser connection code in one frontend `lib/realtime/` boundary. Feature modules subscribe through narrow operation-specific functions.

## Dependencies

- `@microsoft/signalr` when SignalR is selected

## Verification

- Test connection, unauthenticated access, forbidden subscription, reconnect, duplicate, stale, and missed-message refresh.
- Test token expiry and access revocation on a long-lived connection.
- Test slow clients, payload limits, and connection shutdown.
- Measure update latency and connection resource use against activation targets.
