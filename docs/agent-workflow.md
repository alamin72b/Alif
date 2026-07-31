# Agent Workflow

## Purpose

This document defines the stateful reasoning and execution workflow for Project Alif.

Alif uses a controlled agent loop rather than unrestricted model autonomy.

```text
Understand → Plan → Observe → Act → Verify
```

LangGraph.js will manage the workflow state, branching, retries, persistence, and human approval pauses.

---

## Workflow Goals

The workflow must be:

- Stateful
- Resumable
- Observable
- Bounded
- Testable
- Safe
- Provider-independent
- Independent of browser implementation details

---

## High-Level Graph

```text
receive_task
    ↓
load_user_context
    ↓
retrieve_memory
    ↓
create_plan
    ↓
initialize_browser
    ↓
observe_environment
    ↓
select_action
    ↓
validate_action
    ↓
requires_confirmation?
    ├── yes → pause_for_confirmation
    │             ↓
    │         resume_task
    │
    └── no
          ↓
execute_action
          ↓
verify_result
          ↓
task_complete?
    ├── no → observe_environment
    └── yes
          ↓
save_task_result
          ↓
write_relevant_memory
          ↓
finish
```

---

## Agent State

The state should contain identifiers and structured records, not provider SDK objects or Playwright objects.

Recommended state groups:

### Task identity

- Task ID
- User ID
- Original command
- Current status
- Created timestamp

### Planning

- Current plan
- Plan version
- Current plan step
- Replanning count

### Limits

- Current action count
- Maximum action count
- Started time
- Maximum duration
- Provider-attempt count
- Token budget when available

### Browser

- Browser session ID
- Current page ID
- Latest observation
- Observation history references
- Selected action
- Executed-action history

### Memory

- Retrieved preference IDs
- Retrieved episodic-memory IDs
- Memory retrieval metadata

### Provider

- Current provider
- Provider attempt history
- Structured-output errors
- Fallback count

### Approval

- Pending confirmation ID
- Approval status
- Approval expiration

### Completion

- Final result
- Final status
- Failure code
- Completion timestamp

Large screenshots and full observations should be stored outside the graph state when possible and referenced by ID.

---

## Task States

Recommended task states:

```text
PENDING
QUEUED
RUNNING
WAITING_FOR_CONFIRMATION
COMPLETED
FAILED
CANCELLED
```

State transitions must be explicit.

Examples:

```text
PENDING → QUEUED
QUEUED → RUNNING
RUNNING → WAITING_FOR_CONFIRMATION
WAITING_FOR_CONFIRMATION → RUNNING
RUNNING → COMPLETED
RUNNING → FAILED
RUNNING → CANCELLED
```

Invalid transitions should be rejected.

---

## Node Responsibilities

### `receive_task`

- Load task record
- Confirm task is runnable
- Set execution start time
- Initialize limits
- Publish started event

### `load_user_context`

- Load user preferences
- Load security settings
- Load browser profile preference
- Load provider configuration

### `retrieve_memory`

- Build a retrieval query
- Apply user-specific filters
- Retrieve relevant structured preferences
- Retrieve relevant episodic memory
- Store only references and concise summaries in state

### `create_plan`

- Ask the AI gateway for a structured plan
- Validate plan schema
- Check that the plan is within the task intent
- Reject prohibited operations
- Store plan and version

A plan is guidance, not executable authority.

### `initialize_browser`

- Create or resume a browser session
- Select an initial page
- Apply domain policy
- Record browser identifiers

### `observe_environment`

- Request a compact browser observation
- Save observation reference
- Detect browser errors, CAPTCHA, or unexpected dialogs
- Publish progress event

### `select_action`

- Send task goal, current plan step, relevant memory, and observation to the AI gateway
- Request one structured action
- Validate the response schema
- Store provider metadata

### `validate_action`

- Check action type
- Check target element
- Check domain policy
- Check task intent
- Check step and time limits
- Check whether confirmation is required
- Reject stale or unsafe actions

### `pause_for_confirmation`

- Create a confirmation record
- Store pending confirmation ID
- Persist checkpoint
- Change task status
- Notify the user
- Stop active execution until resumed

### `resume_task`

- Load the approval result
- Reject expired or mismatched approval
- Continue only for the approved action
- Create a fresh browser observation before execution when necessary

### `execute_action`

- Send the validated action to the browser service
- Record execution result
- Increment action count
- Publish progress event

### `verify_result`

- Compare expected and observed results
- Decide whether the step succeeded
- Record verification output
- Route to continue, recover, replan, or fail

### `save_task_result`

- Store final structured result
- Store summary and important artifacts
- Mark task completed

### `write_relevant_memory`

- Apply memory-writing policy
- Save only durable, useful information
- Avoid sensitive data
- Link memory to source task

### `finish`

- Release browser resources
- Publish final event
- Record metrics

---

## Conditional Edges

The workflow should use deterministic conditions whenever possible.

Examples:

- If action requires approval, pause.
- If maximum steps reached, fail.
- If task cancelled, stop.
- If provider output is invalid, repair or fallback.
- If browser element is stale, observe again.
- If verification fails repeatedly, replan.
- If CAPTCHA is detected, request user action.
- If task goal is complete, finish.

Avoid asking the model to decide conditions that application code can determine safely.

---

## Step Limits

Every task must have explicit limits.

Recommended initial defaults:

| Limit | Initial value |
|---|---:|
| Maximum browser actions | 20 |
| Maximum replans | 3 |
| Maximum provider fallbacks per step | 2 |
| Maximum task duration | 10 minutes |
| Maximum repeated identical action | 2 |

Limits should be configurable by task type.

---

## Loop Prevention

The workflow must detect:

- Repeated identical actions
- Repeated unchanged observations
- Repeated navigation between the same pages
- Repeated schema failures
- Repeated unsuccessful clicks
- Repeated plan regeneration

When repetition exceeds a threshold:

1. Re-observe.
2. Replan once.
3. Request user help or fail safely.

---

## Recovery Strategy

### Stale element

- Produce a new observation.
- Ask for a new action.

### Page changed unexpectedly

- Re-observe.
- Compare with the current plan.
- Replan if necessary.

### Provider failure

- Apply retry and fallback rules.

### Browser crash

- Attempt one controlled browser restart.
- Restore only safe session state.
- Fail if recovery is not possible.

### Verification failure

- Re-observe.
- Retry only when the action is safe and idempotent.
- Otherwise replan or request help.

### Approval timeout

- Mark approval expired.
- Stop the task without executing the action.

---

## Human-in-the-Loop

Approval is required for sensitive external actions.

The workflow must persist enough state to resume later without replaying prior side effects.

A confirmation request should include:

- Task ID
- Action ID
- Action summary
- Risk level
- Target
- Relevant preview
- Expiration
- Approve and reject options

Approval must apply to one specific pending action.

It should not grant unlimited permission for the rest of the task.

---

## Idempotency

Every external action should have a stable action ID.

Before executing an action, check whether it was already completed.

This is especially important for:

- Sending messages
- Submitting forms
- Creating records
- Uploading files
- Payments
- Deletions

Retries must not repeat successful side effects.

---

## Persistence

LangGraph checkpoints should support:

- Worker restart
- Approval pause
- Temporary provider outage
- Browser recovery
- Task inspection
- Debug replay

Durable task history belongs in PostgreSQL.

Large artifacts such as screenshots should be stored separately and referenced from the task step.

---

## Progress Events

The workflow should publish events such as:

```text
task.started
memory.retrieved
plan.created
browser.observed
action.selected
action.awaiting_confirmation
action.executed
step.verified
task.completed
task.failed
task.cancelled
```

Events should contain identifiers and safe summaries, not secrets.

---

## Cancellation

Users must be able to cancel a task.

The worker should check cancellation:

- Before provider calls
- Before browser actions
- After long waits
- Before side-effect actions
- At graph-node boundaries

Cancellation should release browser resources and mark the task clearly.

---

## Testing Requirements

Test each node separately with mocked dependencies.

Test graph-level scenarios:

- Successful task
- Provider fallback
- Invalid action
- Stale element
- Approval and resume
- Approval rejection
- Approval expiration
- Browser crash
- Step-limit failure
- User cancellation
- Repeated-loop detection
- Memory write on completion
- No memory write on sensitive data

---

## Initial Workflow Scope

The first graph should support one simple search task:

1. Receive command.
2. Create a short plan.
3. Open a controlled search page.
4. Observe the search field.
5. Type the query.
6. Submit.
7. Verify results.
8. Complete.

Do not add voice, long-term memory, or desktop control until this workflow is stable.

---

## Related Documents

- [Architecture](./architecture.md)
- [Provider Routing](./provider-routing.md)
- [Browser Automation](./browser-automation.md)
- [Memory Design](./memory-design.md)
- [Security Model](./security-model.md)
- [Testing Strategy](./testing-strategy.md)
