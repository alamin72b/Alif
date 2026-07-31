# 0001: Use a TypeScript Monorepo

## Status

Accepted

## Decision

Use pnpm workspaces and Turborepo to organize Alif's applications and shared
packages in a single TypeScript repository.

## Context

Alif needs a web application, API, background worker, and shared contracts.
Keeping these components together makes type-safe reuse and coordinated builds
straightforward while the project is still evolving quickly.

## Consequences

Shared packages can provide one source of truth for schemas and configuration.
The repository also gains a consistent task runner and dependency workflow.
Independent deployment boundaries remain available at the application level.
