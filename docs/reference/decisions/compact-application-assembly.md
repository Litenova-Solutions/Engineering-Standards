# Compact Application Assembly

Status: Accepted for v1.

## Context

The preliminary structure used Write.Contracts, Write, Read.Contracts, Read, and Reactions projects. It duplicated validation types, assembly markers, references, and agent instructions. A single maintainer and AI agents paid that cost on every use case.

## Decision

Use one Application project. Keep command and query intent through separate LiteBus contracts. Co-locate messages, validators, handlers, results, and reactions by capability and use case. Protect visibility and dependencies with internal sealed types and Architecture.Tests.

## Consequences

WebApi references Application instead of contract-only assemblies. Compiler project boundaries no longer separate handlers from messages, so visibility and architecture tests carry that check. The project graph and agent instructions are smaller.

This decision supersedes the split Application and contract-project decisions from the preliminary standard.
