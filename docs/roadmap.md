# Development Roadmap

## Purpose

This document defines the delivery order for Project Alif.

The roadmap is intentionally incremental. Each phase introduces one major capability and includes completion criteria before the next phase begins.

The project should not integrate every framework at once.

---

## Guiding Rule

Build the smallest reliable vertical slice first:

```text
Typed command
    ↓
Task API
    ↓
Queue
    ↓
AI structured action
    ↓
Playwright execution
    ↓
Verified result
```

Voice, long-term memory, and desktop control come later.

---

## Phase 0 — Repository Foundation

### Goals

- Create pnpm workspace
- Configure Turborepo
- Add shared TypeScript configuration
- Create Next.js application
- Create NestJS API
- Create agent worker
- Create shared packages
- Configure ESLint and Prettier
- Configure Vitest
- Add Docker Compose
- Start PostgreSQL and Redis
- Add environment validation
- Add structured logging
- Add GitHub Actions

### Deliverables

```text
apps/web
apps/api
apps/agent-worker
packages/contracts
packages/config
packages/observability
infrastructure/compose.yaml
```

### Completion criteria

- All applications start
- Root development scripts work
- Shared packages import correctly
- PostgreSQL is reachable
- Redis is reachable
- Type checking passes
- Linting passes
- Tests run in CI

---

## Phase 1 — Task Control Plane

### Goals

- Create task API
- Define task states
- Store tasks in PostgreSQL
- Add BullMQ
- Publish task jobs
- Consume jobs in the worker
- Stream task progress
- Add cancellation
- Add stable error model

### Completion criteria

- A task can be created
- The worker receives the task
- Progress appears in the frontend
- Cancellation works
- Task states remain valid
- Duplicate jobs do not create duplicate execution

---

## Phase 2 — Multi-Provider AI Gateway

### Goals

- Define internal provider interface
- Add primary provider adapter
- Add secondary provider adapter
- Add structured-output schemas
- Add Zod validation
- Add timeout handling
- Add one repair retry
- Add ordered fallback
- Add provider health metadata
- Add safe logging
- Add mocked provider tests

### Completion criteria

- Valid structured output is returned
- Invalid JSON is rejected
- Rate limits trigger fallback
- Timeouts trigger fallback
- Authentication failures do not retry
- Provider keys remain server-side
- Application code does not import provider SDKs directly

---

## Phase 3 — Deterministic Browser Service

### Goals

- Add Playwright
- Create browser-session manager
- Create browser contexts
- Build observation format
- Build element registry
- Add navigation
- Add click
- Add text entry
- Add key press
- Add scrolling
- Add verification
- Add controlled fixture website
- Add integration tests

### Completion criteria

- Browser starts and closes cleanly
- Semantic elements are discovered
- Local element IDs resolve correctly
- Search fixture can be completed deterministically
- Stale elements are detected
- Blocked navigation is rejected

---

## Phase 4 — First Agent Workflow

### Goals

- Add LangGraph.js
- Define agent state
- Add receive-task node
- Add planning node
- Add observation node
- Add action-selection node
- Add validation node
- Add execution node
- Add verification node
- Add completion node
- Add step limits
- Add cancellation checks
- Add checkpoint persistence

### First milestone command

```text
Open the controlled search page and search for Project Alif.
```

### Completion criteria

- Task completes end to end
- Provider output is structured
- Browser action is validated
- Result is verified
- Infinite loops are prevented
- Workflow can recover from one stale element
- Progress is visible in the UI

---

## Phase 5 — Human Approval

### Goals

- Define confirmation schema
- Add security policy
- Pause graph execution
- Persist checkpoint
- Show approval request in the UI
- Approve or reject
- Resume exact pending action
- Add expiration
- Add replay protection

### Completion criteria

- Sensitive action pauses
- Rejected action never executes
- Expired approval is rejected
- Approval cannot be reused
- Approved action executes once

---

## Phase 6 — Long-Term Memory

### Goals

- Enable pgvector
- Add structured preferences
- Add episodic memory
- Add embeddings abstraction
- Add semantic retrieval
- Add ranking
- Add privacy classification
- Add memory-write policy
- Add deletion
- Add memory management UI

### Completion criteria

- Relevant preferences are retrieved
- Cross-user retrieval is impossible
- Sensitive values are rejected
- Deleted memories stop appearing
- Only compact memory context reaches the model

---

## Phase 7 — Voice Interface

### Goals

- Add browser audio recording
- Add speech-to-text
- Normalize commands
- Reuse existing task API
- Add text-to-speech
- Add playback controls
- Add interruption handling

### Completion criteria

- Voice command becomes a normal task
- Text and voice share the same workflow
- Voice errors do not affect agent logic
- User can stop playback

---

## Phase 8 — Desktop Control Research

### Goals

- Evaluate Linux accessibility APIs
- Detect windows
- Create application allowlist
- Add keyboard and mouse fallback
- Add screenshot observation
- Add stronger approval requirements
- Add sandboxing research

### Completion criteria

This phase should begin only after browser automation is stable.

Desktop control should remain a separate module because it is less reliable and more dangerous.

---

## Phase 9 — Production Hardening

### Goals

- Authentication
- Authorization
- Rate limiting
- Secret manager
- Worker isolation
- Horizontal worker scaling
- Object storage for screenshots
- Metrics dashboard
- Distributed tracing
- Backup and restore
- Retention policies
- Security review
- Load testing

---

## Learning Roadmap

Alif should also be used as a structured learning project.

### Stage 1 — TypeScript and architecture

Focus on:

- TypeScript types
- Interfaces
- Zod
- Dependency injection
- Package boundaries
- Error handling

### Stage 2 — Backend engineering

Focus on:

- NestJS modules
- REST APIs
- PostgreSQL
- SQL
- Transactions
- Redis
- BullMQ

### Stage 3 — Frontend engineering

Focus on:

- Next.js App Router
- React components
- Server state
- Forms
- Real-time updates
- Accessible UI

### Stage 4 — Testing and DevOps

Focus on:

- Unit tests
- Integration tests
- Playwright tests
- Docker
- CI
- Logging

### Stage 5 — AI application engineering

Focus on:

- Structured output
- Provider abstraction
- Retries
- Fallback
- Agent state
- Tool boundaries
- Context management
- Evaluation

---

## Portfolio Milestones

### Portfolio milestone 1

A clean monorepo with:

- Next.js
- NestJS
- PostgreSQL
- Redis
- Docker
- CI

### Portfolio milestone 2

A working provider gateway with:

- Multiple adapters
- Fallback
- Zod validation
- Tests

### Portfolio milestone 3

A working browser agent with:

- Playwright
- Controlled task execution
- Progress UI
- Verification
- Safety limits

### Portfolio milestone 4

A human-in-the-loop agent with:

- Approval pause
- Resume
- Audit trail
- Memory

Each milestone should have:

- README update
- Architecture note
- Screenshots or demo
- Tests
- Clear commit history
- Tagged release when stable

---

## Definition of Done

A feature is not complete until:

- Code is modular
- Input is validated
- Errors are handled
- Tests exist
- Security impact is reviewed
- Documentation is updated
- Logging is safe
- Manual verification is complete
- No secrets are committed

---

## Immediate Next Steps

1. Create the monorepo foundation.
2. Add Next.js, NestJS, and the worker.
3. Add shared contracts.
4. Add PostgreSQL and Redis through Docker Compose.
5. Add the task API and queue.
6. Build the provider gateway.
7. Build the deterministic browser fixture.
8. Connect the first LangGraph workflow.

---

## Related Documents

- [Architecture](./architecture.md)
- [Provider Routing](./provider-routing.md)
- [Browser Automation](./browser-automation.md)
- [Agent Workflow](./agent-workflow.md)
- [Memory Design](./memory-design.md)
- [Security Model](./security-model.md)
- [Testing Strategy](./testing-strategy.md)
