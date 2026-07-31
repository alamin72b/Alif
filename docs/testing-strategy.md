# Testing Strategy

## Purpose

This document defines how Project Alif will be tested.

Autonomous agents combine deterministic software with probabilistic AI behavior. A reliable testing strategy must separate those concerns.

The project should test deterministic logic thoroughly and evaluate model behavior with controlled benchmarks.

---

## Testing Goals

The test suite should provide confidence that:

- Shared contracts reject invalid data
- Provider fallback works
- Browser actions are safe and repeatable
- Agent workflows stop correctly
- Memory is isolated by user
- Sensitive actions require approval
- Failures produce clear states
- The project can be changed without breaking core behavior

---

## Test Pyramid

### Unit tests

Fast tests for isolated deterministic logic.

### Integration tests

Tests across real package boundaries such as PostgreSQL, Redis, BullMQ, and Playwright.

### End-to-end tests

Tests of complete user-visible workflows against controlled local fixtures.

### Agent evaluations

Repeated model-based tests that measure structured output, task success, and failure behavior.

---

## Unit Testing

Recommended unit-test targets:

### Contracts

- Valid task command
- Invalid task command
- Valid browser action
- Unsupported action
- Missing fields
- Unexpected fields
- Invalid confidence range
- Invalid queue payload

### Provider routing

- Primary selected
- Capability filtering
- Timeout conversion
- Retry decision
- Fallback order
- Circuit state transitions
- Non-retryable errors

### Security policy

- Allowed action
- Denied action
- Confirmation-required action
- Blocked domain
- Step-limit rejection
- Duplicate action rejection

### Memory

- Ranking
- Expiration
- User filtering
- Duplicate detection
- Conflict resolution
- Sensitive-memory rejection

### Browser

- Element ID generation
- Stale element detection
- Locator priority
- Observation compaction
- Error normalization

---

## Integration Testing

### PostgreSQL

Test:

- Migrations
- Repository methods
- Transactions
- Task state transitions
- User isolation
- Memory retrieval
- Soft and hard deletion
- pgvector queries

Use a dedicated test database.

### Redis and BullMQ

Test:

- Job creation
- Worker consumption
- Retry behavior
- Idempotency
- Job cancellation
- Failed-job handling
- Progress events

### Provider adapters

Use mocked HTTP servers or provider SDK mocks.

Do not depend on free external APIs for the normal automated test suite.

### Playwright

Use local fixture pages served by the test environment.

Test real browser behavior without relying on public websites.

### LangGraph

Test:

- Checkpoint creation
- Pause and resume
- State transitions
- Recovery path
- Cancellation
- Completion
- Failure limits

---

## End-to-End Test Environment

Create a controlled test website with pages for:

- Search
- Login
- Multi-step form
- Dynamic loading
- Modal dialogs
- New tabs
- File upload
- File download
- Fake checkout
- Prompt injection
- CAPTCHA placeholder
- Error page

The fixture application should provide stable roles, labels, and test IDs.

---

## Core End-to-End Scenarios

### Simple search

1. Create task.
2. Worker receives task.
3. Browser opens fixture page.
4. Agent identifies search field.
5. Agent enters query.
6. Results appear.
7. Task completes.

### Provider fallback

1. Primary provider mock returns 429.
2. Router selects secondary provider.
3. Valid action is returned.
4. Task continues.

### Invalid structured output

1. Provider returns invalid JSON.
2. Repair attempt occurs.
3. Correct output succeeds or fallback occurs.
4. Invalid action is never executed.

### Human approval

1. Agent reaches a side-effect action.
2. Workflow pauses.
3. Confirmation appears in UI.
4. User approves.
5. Exact action executes once.
6. Workflow resumes.

### Approval rejection

1. Workflow pauses.
2. User rejects.
3. Action does not execute.
4. Task ends or replans safely.

### Cancellation

1. Task starts.
2. User cancels.
3. Worker observes cancellation.
4. Browser closes.
5. Task status becomes cancelled.

### Loop prevention

1. Mock model returns repeated identical action.
2. Repetition threshold is reached.
3. Agent replans or fails safely.
4. Infinite loop does not occur.

---

## AI Evaluation

AI behavior should be measured separately from deterministic tests.

### Structured-output benchmark

Run a fixed set of prompts repeatedly.

Measure:

- JSON parse success
- Zod validation success
- Correct action type
- Correct target
- Extra-field rate
- Average latency
- Provider fallback frequency

### Browser-task benchmark

Use controlled tasks of increasing difficulty.

Levels:

1. Single action
2. Two-step form
3. Multi-page navigation
4. Dynamic content
5. Recovery from missing element
6. Approval pause
7. Prompt-injection page

### Success criteria

Define success before running the evaluation.

Examples:

- Task completed
- Correct final page
- No prohibited action
- Maximum step limit respected
- No duplicate side effect
- Correct approval behavior

---

## Test Data

Use factories or fixtures for:

- Users
- Tasks
- Preferences
- Memories
- Provider attempts
- Browser observations
- Confirmations
- Executed actions

Avoid shared mutable fixtures between tests.

---

## Mocking Strategy

Mock external uncertainty, not internal behavior unnecessarily.

Mock:

- AI provider responses
- Provider network failures
- Provider timeouts
- Cloud embedding APIs

Use real local instances for:

- PostgreSQL
- Redis
- BullMQ
- Playwright browser
- Local fixture website

This provides realistic integration confidence.

---

## CI Pipeline

Recommended GitHub Actions stages:

1. Install dependencies
2. Type check
3. Lint
4. Unit tests
5. Start PostgreSQL and Redis
6. Run migrations
7. Integration tests
8. Build applications
9. Playwright tests
10. Upload test reports

Provider keys should not be required for pull-request tests.

---

## Quality Gates

A pull request should not merge when:

- Type checking fails
- Linting fails
- Unit tests fail
- Integration tests fail
- Database migrations fail
- Build fails
- Critical security tests fail

Agent-evaluation thresholds may initially report results without blocking merges, then become stricter as the benchmark stabilizes.

---

## Coverage

Code coverage is useful but not sufficient.

Prioritize coverage for:

- Security policy
- State transitions
- Provider errors
- Idempotency
- Memory isolation
- Approval handling

Do not chase a high percentage by testing trivial implementation details.

---

## Test Naming

Test names should describe behavior.

Good:

```text
falls back to the secondary provider after a rate limit
```

Bad:

```text
test router
```

Use Arrange, Act, Assert structure where helpful.

---

## Failure Diagnostics

When tests fail, reports should include:

- Task ID
- Step ID
- Fixture page
- Selected provider mock
- Action history
- Latest observation
- Screenshot on browser failure
- Stable error code

Do not include secrets.

---

## Performance Testing

Later phases should measure:

- API response time
- Queue wait time
- Provider latency
- Browser action latency
- Memory retrieval latency
- Task completion duration
- Concurrent worker behavior

Performance work should begin after correctness and safety.

---

## Initial Test Scope

The first milestone should include:

- Contract unit tests
- Provider fallback tests
- Playwright search fixture
- One end-to-end search workflow
- Step-limit test
- Invalid-output test
- Cancellation test
- Confirmation policy unit tests

---

## Related Documents

- [Architecture](./architecture.md)
- [Provider Routing](./provider-routing.md)
- [Browser Automation](./browser-automation.md)
- [Agent Workflow](./agent-workflow.md)
- [Memory Design](./memory-design.md)
- [Security Model](./security-model.md)
- [Roadmap](./roadmap.md)
