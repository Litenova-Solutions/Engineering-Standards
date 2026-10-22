# Overview

## Intent

The Quality pages state what every release proves beyond its behavior: who may act and what happens to sensitive data, how the product runs and recovers, and which checks each pull request runs. Every project applies them, from the first pull request to production operation.

## How the Pages Fit Together

[Security](security.md) answers who acts, what each operation touches, and what it keeps; [Operations](operations.md) states how the product runs after release; [Continuous Integration](ci.md) states the gates each pull request runs for its changed areas. Read them in that order when setting up a new consumer: the product boundary first, then its operation, then the checks that guard both.

## Pages

- [Security](security.md): identity, permissions, data classification, and trust boundaries.
- [Operations](operations.md): observability, deployability, recovery, and support by one maintainer.
- [Continuous Integration](ci.md): the gates each pull request runs for its changed areas.
