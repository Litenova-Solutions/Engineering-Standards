# SignalR for Real-Time Updates

**Status:** Accepted

**Date:** 2026-05-19

## Context

Some applications need server-pushed updates: ticket assignment changes, notification badges, dashboard counters, collaboration state, job progress, and incident status. Polling is simple, but it wastes resources and adds latency when updates need to appear quickly.

Options considered:

1. Polling with TanStack Query. Simple and reliable, but delayed and wasteful for high-change workflows.
2. Server-Sent Events. Good for one-way streams, but less flexible for groups and bidirectional workflows.
3. ASP.NET Core SignalR. Built into ASP.NET Core, supports WebSockets with fallback transports, groups, authorization, and JavaScript clients.

## Decision

Use ASP.NET Core SignalR as the standard for real-time updates. SignalR messages are invalidation notifications, not the source of truth. The frontend refetches through server components or TanStack Query after receiving a message.

Hubs live in WebApi. `Application.Reactions` does not reference SignalR directly. It defines narrow interfaces, and Infrastructure implements those interfaces using `IHubContext<T>`.

The `@microsoft/signalr` package is pre-approved for frontend projects that implement real-time updates.

## Consequences

### Positive

- Real-time behavior uses the official ASP.NET Core stack.
- Groups model tenant, team, and resource scopes cleanly.
- The frontend keeps TanStack Query as the server-state owner.
- The application can fall back to polling when persistent connections are not available.

### Negative

- Multi-instance deployments need a backplane or managed SignalR service.
- Persistent connections add operational load.
- Client reconnection and missed-message recovery must be handled explicitly.

### Risks

- SignalR delivery is not durable. If a notification is required for correctness, pair it with the Outbox pattern and make clients refetch current state after reconnecting.