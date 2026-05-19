# 0018. OpenTelemetry as the Observability Standard

**Status:** Accepted

**Date:** 2026-05-19

## Context

Production systems need logs, metrics, traces, health checks, and correlation IDs that work across the API, background workers, database calls, and external services. Serilog provides structured logs, but logs alone do not show request latency, dependency timing, queue age, or cross-service traces.

.NET provides built-in logging, metrics, and tracing APIs. OpenTelemetry is the vendor-neutral collection and export standard that connects those APIs to observability backends such as Prometheus, Grafana, Azure Monitor, and other APM tools.

Options considered:

1. Serilog only. Simple, but no standard metrics or distributed tracing story.
2. Vendor-specific SDK. Fast to set up, but couples projects to one hosting provider.
3. OpenTelemetry with OTLP export plus Serilog structured logs.

## Decision

Use OpenTelemetry as the standard for traces and metrics. Use Serilog for structured application logs. Export telemetry through OTLP by default. Projects may add a vendor exporter only with a project ADR.

The following NuGet packages are pre-approved for WebApi and worker projects:

- `OpenTelemetry.Extensions.Hosting`
- `OpenTelemetry.Instrumentation.AspNetCore`
- `OpenTelemetry.Instrumentation.Http`
- `OpenTelemetry.Instrumentation.Runtime`
- `OpenTelemetry.Exporter.OpenTelemetryProtocol`
- `Serilog.AspNetCore`
- `Serilog.Sinks.Console`
- `Serilog.Enrichers.Environment`
- `Serilog.Enrichers.Thread`

## Consequences

### Positive

- Projects can switch observability backends without changing application instrumentation.
- HTTP, outbound `HttpClient`, runtime, and custom metrics use one collection pipeline.
- Correlation IDs, trace IDs, and span IDs connect logs to traces.
- The same conventions apply to APIs and background workers.

### Negative

- OpenTelemetry adds setup and package dependencies to each production service.
- Teams must choose and operate a telemetry backend per project.
- High-cardinality metrics can create cost and storage problems if labels are not controlled.

### Risks

- If engineers log PII or add unbounded metric labels, observability data can become a security and cost risk. The observability and security conventions define the allowed properties and labels.
