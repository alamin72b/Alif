# Project Alif Architecture

## Purpose

This document defines the high-level architecture of Project Alif.

Alif is a TypeScript-first, API-powered autonomous agent that accepts natural-language tasks, retrieves relevant memory, creates plans, interacts with websites, verifies results, and pauses for human approval before sensitive actions.

The architecture is designed around five principles:

1. **Modularity** — each subsystem has one clear responsibility.
2. **Provider independence** — application logic must not depend directly on one AI provider.
3. **Bounded autonomy** — every task has explicit limits, validation, and stop conditions.
4. **Local control** — browser execution, memory, policy enforcement, and secrets remain local.
5. **Incremental delivery** — the system is built in small, testable phases.

---

## System Context

Alif consists of three runtime applications and several shared packages.

```text
┌─────────────────────────────────────────────┐
│                  Next.js UI                 │
│                                             │
│ Commands, task history, screenshots, voice, │
│ confirmations, settings, provider status    │
└──────────────────────┬──────────────────────┘
                       │
                       │ REST + WebSocket/SSE
                       │
┌──────────────────────▼──────────────────────┐
│                NestJS Control API           │
│                                             │
│ Authentication, tasks, validation, policy,  │
│ settings, queue publishing, progress events │
└──────────────────────┬──────────────────────┘
                       │
                       │ BullMQ job
                       │
┌──────────────────────▼──────────────────────┐
│                  Agent Worker               │
│                                             │
│ LangGraph.js state machine                  │
│ Memory → Plan → Observe → Act → Verify      │
└──────────────┬────────────────┬─────────────┘
               │                │
┌──────────────▼─────────┐   ┌──▼────────────────────────┐
│      AI Gateway        │   │      Browser Service      │
│                        │   │                           │
│ Gemini                 │   │ Playwright session        │
│ Groq                   │   │ DOM/accessibility parsing │
│ OpenRouter             │   │ Action execution          │
│ Optional Ollama        │   │ Screenshot capture        │
└──────────────┬─────────┘   └──┬────────────────────────┘
               │                │
               └────────┬───────┘
                        │
┌───────────────────────▼─────────────────────┐
│                 Local Data Layer            │
│                                             │
│ PostgreSQL + pgvector                       │
│ Redis + BullMQ                              │
│ Task history, memory, logs, screenshots     │
└─────────────────────────────────────────────┘
```

---

## Runtime Applications

### `apps/web`

The web application is responsible for presentation and browser-side interaction.

Responsibilities:

- Accept text commands
- Capture voice input later
- Display task status
- Stream live task progress
- Show browser screenshots
- Display approval requests
- Show provider health
- Manage user preferences and memory
- Display errors and completed results

The frontend must not contain provider API keys or execute privileged browser actions.

### `apps/api`

The NestJS API acts as the control plane.

Responsibilities:

- Authenticate users
- Validate incoming requests
- Create and cancel tasks
- Persist task state
- Publish jobs to BullMQ
- Receive approval decisions
- Expose settings and health endpoints
- Stream progress through WebSocket or Server-Sent Events
- Enforce request-level permissions and rate limits

The API should remain responsive. Long-running agent tasks must not run directly inside HTTP request handlers.

### `apps/agent-worker`

The worker runs the autonomous workflow.

Responsibilities:

- Consume queued tasks
- Load task and user context
- Retrieve memory
- Run the LangGraph workflow
- Request structured model output
- Observe and control the browser
- Validate actions
- Pause for approval
- Store step history
- Publish progress events
- Finish, fail, or cancel tasks safely

---

## Shared Packages

### `packages/contracts`

Contains shared Zod schemas and TypeScript types.

Examples:

- Task commands
- Task states
- Queue payloads
- Agent actions
- Browser observations
- Provider responses
- Confirmation requests
- Progress events

This package is the contract boundary between applications.

### `packages/llm-gateway`

Contains all AI provider integrations.

Responsibilities:

- Provider adapters
- Capability-based routing
- Timeouts
- Retries
- Fallback
- Circuit breaking
- Structured-output validation
- Provider health
- Token and latency metadata

No other package should import provider SDKs directly.

### `packages/browser`

Contains Playwright-specific browser automation.

Responsibilities:

- Browser lifecycle
- Isolated contexts
- Tab management
- Semantic element discovery
- Observation generation
- Action execution
- Screenshot capture
- Navigation policy integration
- Resource cleanup

### `packages/agent-core`

Contains LangGraph state and workflow logic.

Responsibilities:

- Agent state definition
- Graph nodes
- Conditional edges
- Step limits
- Recovery paths
- Human approval interrupts
- Completion rules

### `packages/database`

Contains persistence logic.

Responsibilities:

- Database client
- Migrations
- Repositories
- Transactions
- Query helpers
- Database-level types

Application services should access data through repositories instead of writing raw SQL throughout the codebase.

### `packages/memory`

Contains long-term memory logic.

Responsibilities:

- Preference memory
- Episodic memory
- Semantic retrieval
- Ranking
- Expiration
- Privacy classification
- Memory-writing policy

### `packages/security`

Contains deterministic safety controls.

Responsibilities:

- Action allowlists and denylists
- Confirmation rules
- Domain policies
- Prompt-injection defenses
- Screenshot redaction
- Secret-handling rules

### `packages/observability`

Contains logging, metrics, and tracing.

Responsibilities:

- Structured logs
- Correlation IDs
- Task traces
- Provider metrics
- Browser metrics
- Redaction before logging

### `packages/config`

Contains environment and runtime configuration.

Responsibilities:

- Environment validation
- Shared constants
- Typed configuration
- Default limits
- Feature flags

---

## Request Lifecycle

A task moves through the system as follows:

1. The user submits a command.
2. The web application sends it to the API.
3. The API validates the request.
4. The API creates a task in PostgreSQL.
5. The API publishes the task ID to BullMQ.
6. The worker consumes the task.
7. Relevant preferences and memories are loaded.
8. The agent creates or updates a plan.
9. The browser service produces an observation.
10. The AI gateway returns a structured action.
11. Local code validates the action.
12. Security policy checks whether approval is required.
13. The browser executes the action.
14. The agent verifies the result.
15. The process repeats until completion or termination.
16. The result and important history are saved.
17. Progress is displayed to the user.

---

## Core Architectural Boundaries

### Model responsibility

The AI model may:

- Interpret intent
- Create a plan
- Select from allowed actions
- Analyze page content
- Suggest recovery steps
- Summarize task results

### Application responsibility

Deterministic code must:

- Validate schemas
- Select providers
- Enforce limits
- Manage secrets
- Check permissions
- Execute browser actions
- Require approval
- Store state
- Handle retries
- Stop unsafe loops

The model is never the final authority for security-sensitive execution.

---

## Data Architecture

### PostgreSQL

PostgreSQL stores durable application data:

- Users
- Tasks
- Task steps
- Browser sessions
- Provider attempts
- Approval requests
- Preferences
- Episodic memories
- Audit logs
- Feature settings

### pgvector

pgvector supports semantic retrieval for memory.

It should be used alongside relational filters rather than replacing structured database design.

### Redis

Redis stores temporary or coordination data:

- BullMQ jobs
- Distributed locks
- Short-lived cache entries
- Worker heartbeats
- Provider cooldown state
- Progress event coordination

Redis is not the source of truth for durable task history.

---

## Communication Patterns

### Web to API

Use REST for:

- Task creation
- Task cancellation
- Settings
- Memory management
- Approval decisions

Use WebSocket or Server-Sent Events for:

- Task progress
- Browser screenshots
- Approval notifications
- Completion events
- Provider health updates

### API to Worker

Use BullMQ with a small queue payload containing identifiers, not full private task context.

Recommended payload:

```json
{
  "taskId": "task_123",
  "requestedBy": "user_456"
}
```

The worker loads authoritative task data from PostgreSQL.

### Worker to API/UI

The worker writes durable state to PostgreSQL and publishes lightweight progress events.

---

## Deployment Model

### Development

Use Docker Compose for:

- PostgreSQL
- pgvector
- Redis

Run Next.js, NestJS, and the worker locally during early development for easier debugging.

### Later deployment

A production deployment may separate:

- Web service
- API service
- Agent workers
- PostgreSQL
- Redis
- Object storage for screenshots

Workers should be horizontally scalable only after task locking and idempotency are implemented.

---

## Failure Handling

Alif must treat failures as explicit states.

Examples:

- Provider unavailable
- Invalid structured output
- Browser crashed
- Element missing
- Navigation blocked
- Approval expired
- Task cancelled
- Maximum steps reached
- Maximum duration reached

Every failure should include:

- Stable error code
- Human-readable message
- Retryability
- Provider or subsystem
- Task and step identifiers
- Safe debugging metadata

---

## Non-Goals for the First Version

The first version will not attempt to provide:

- General desktop control
- Unrestricted shell execution
- Fully autonomous purchases
- CAPTCHA bypass
- Multi-user enterprise access control
- Complex plugin marketplaces
- Model training
- Guaranteed success on arbitrary websites

---

## Related Documents

- [Provider Routing](./provider-routing.md)
- [Browser Automation](./browser-automation.md)
- [Agent Workflow](./agent-workflow.md)
- [Memory Design](./memory-design.md)
- [Security Model](./security-model.md)
- [Testing Strategy](./testing-strategy.md)
- [Roadmap](./roadmap.md)
