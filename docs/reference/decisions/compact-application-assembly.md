---
{
  "id": "reference.decision.compact-application-assembly",
  "kind": "reference",
  "normative": false,
  "appliesTo": ["backend.application"],
  "recipes": []
}
---
# Compact Application Assembly

Status: Accepted for v1.

## Context

The earlier structure used Write.Contracts, Write, Read.Contracts, Read, and Reactions projects. It duplicated validation types, assembly markers, references, and agent instructions. A single maintainer and AI agents paid that cost on every use case.

## Decision

Use one Application project. Keep command and query intent through separate LiteBus contracts. Co-locate messages, validators, handlers, results, and reactions by feature and use case. Protect visibility and dependencies with `internal sealed` types and Architecture.Tests.

## Consequence

WebApi references Application instead of contract-only assemblies. Compiler project boundaries no longer separate handlers from messages, so visibility and architecture tests carry that check. The project graph and agent instructions become smaller.

This decision supersedes the split Application and contract-project decisions from the preliminary standard.

