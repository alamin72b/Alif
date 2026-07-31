# Project Structure

Alif is organized as a pnpm and Turborepo monorepo.

- `apps/web` contains the Next.js user interface.
- `apps/api` contains the NestJS control API.
- `apps/agent-worker` contains background agent execution.
- `packages/contracts` contains shared Zod schemas and types.
- `packages/config` contains environment validation.
- `packages/observability` contains shared logging.
- `docs/` contains project and architecture documentation.
- `infrastructure/` is reserved for local service configuration.
