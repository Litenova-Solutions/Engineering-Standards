---
{
  "id": "recipe.realtime",
  "kind": "recipe",
  "normative": true,
  "appliesTo": ["backend.api", "frontend.app", "delivery"],
  "recipes": ["realtime"]
}
---
# Realtime Updates

## RECIPE.REALTIME.ADOPT.001 - Record latency and polling limits

Enable realtime transport when polling cannot meet a measured user requirement. Name the update latency target and acceptable missed-event recovery.

## RECIPE.REALTIME.TRANSPORT.001 - Select transport by interaction

Use server-sent events for one-way server notifications. Use SignalR when clients need bidirectional messages, groups, or transport fallback.

## RECIPE.REALTIME.AUTH.001 - Authorize subscriptions

Authenticate the connection and authorize each user-scoped or resource-scoped subscription. A valid connection cannot subscribe to arbitrary object IDs.

## RECIPE.REALTIME.RECOVERY.001 - Recover after disconnect

Treat realtime messages as hints to refresh authoritative server data unless the use-case contract defines durable ordered delivery. Clients reconnect with bounded backoff and refresh state after a gap.

## RECIPE.REALTIME.GATES.001 - Test connection lifecycle

Cover connection, authorization failure, reconnect, duplicate notification, stale message, and missed-event refresh behavior.

