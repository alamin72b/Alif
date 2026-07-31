# Memory Design

## Purpose

This document defines how Project Alif stores, retrieves, updates, and deletes long-term memory.

Memory should improve task relevance without exposing unnecessary private data or allowing old assumptions to control future actions.

Alif will use PostgreSQL for durable storage and pgvector for semantic retrieval.

---

## Memory Goals

The memory system should:

- Remember explicit user preferences
- Retrieve relevant past task experience
- Reduce repeated user instructions
- Improve planning and communication style
- Support inspection and deletion
- Avoid storing secrets
- Prevent cross-user access
- Apply expiration and privacy rules
- Keep retrieval compact

---

## Memory Types

### Structured preference memory

Structured preferences are explicit facts with known meaning.

Examples:

- Preferred language
- Preferred name
- Preferred browser
- Communication style
- Default download directory
- Preferred job location
- Confirmation preferences

These should be stored in relational columns or key-value records.

They should not rely only on embeddings.

### Episodic memory

Episodic memory represents useful past experiences.

Examples:

- A website required login during a previous task.
- The user rejected a long email and requested a shorter one.
- A particular workflow failed because a CAPTCHA appeared.
- The user prefers job results from a specific location.

Episodic memory should include text, metadata, source, and optional embedding.

### Task history

Task history records what happened.

It includes:

- Original command
- Plan
- Steps
- Provider attempts
- Browser actions
- Errors
- Approvals
- Result
- Duration
- Completion status

Task history is not automatically long-term memory. A separate policy decides what deserves to be remembered.

### Working memory

Working memory exists only during an active task.

Examples:

- Current plan
- Current observation
- Recent actions
- Temporary extracted facts

Working memory belongs in graph state or temporary storage and should not automatically become durable memory.

---

## Data Model

### Preference record

Suggested fields:

| Field | Purpose |
|---|---|
| `id` | Unique identifier |
| `userId` | Owner |
| `key` | Stable preference name |
| `value` | Structured value |
| `source` | Where the preference came from |
| `confidence` | Confidence in correctness |
| `createdAt` | Creation time |
| `updatedAt` | Last update |
| `expiresAt` | Optional expiration |

### Episodic memory record

Suggested fields:

| Field | Purpose |
|---|---|
| `id` | Unique identifier |
| `userId` | Owner |
| `taskId` | Source task |
| `content` | Original memory text |
| `summary` | Compact retrieval text |
| `embedding` | Vector representation |
| `importance` | Long-term usefulness |
| `confidence` | Reliability |
| `privacyLevel` | Sensitivity classification |
| `createdAt` | Creation time |
| `expiresAt` | Optional expiration |
| `deletedAt` | Soft-delete timestamp |

### Memory access log

Record when important memories are retrieved or modified.

This supports debugging and privacy review.

---

## Memory Sources

A memory may come from:

- Explicit user instruction
- User correction
- User approval or rejection
- Repeated preference
- Task outcome
- Stable environment fact
- System-generated summary

The source must be recorded.

Explicit user instructions should generally receive higher confidence than model inference.

---

## Memory Writing Policy

Not every task detail should become memory.

A memory is a candidate when it is:

- Likely to help future tasks
- Stable over time
- Specific to the user
- Supported by evidence
- Safe to store
- Not already represented

### Good memory candidates

- The user prefers concise professional emails.
- The user wants approval before sending messages.
- The user prefers job results in Dhaka.
- A website requires manual login for this user.

### Poor memory candidates

- The page title from one temporary visit
- A random search result
- A one-time loading error
- Full email content
- Passwords or authentication codes
- Model speculation about the user

---

## Explicit vs Inferred Memory

### Explicit memory

The user directly states a preference or instruction.

Example:

```text
Remember that I prefer concise professional emails.
```

This may be stored with high confidence.

### Inferred memory

The system notices a pattern.

Example:

```text
The user shortened three generated emails.
```

Inferred memory should have lower confidence and may require user confirmation before becoming a durable preference.

---

## Retrieval Pipeline

```text
Current task
    ↓
Build retrieval query
    ↓
Apply user and privacy filters
    ↓
Retrieve structured preferences
    ↓
Run semantic similarity search
    ↓
Apply recency and importance ranking
    ↓
Remove duplicates
    ↓
Return compact memory context
```

### Retrieval filters

Always filter by:

- User ID
- Deleted state
- Expiration
- Privacy level
- Task type when appropriate

### Ranking signals

Possible ranking signals:

- Semantic similarity
- Importance
- Recency
- Confidence
- Task-type relevance
- Source reliability

A ranking formula should be treated as configurable and testable.

---

## Context Budget

Do not send the entire memory database to the model.

The retrieval service should return a small number of high-value memories.

Recommended initial approach:

- Structured preferences: only relevant keys
- Episodic memories: top 3 to 5
- Compact summaries
- Source identifiers retained locally

The agent prompt should clearly label retrieved memory as context, not authority.

---

## Memory Conflicts

Memories may disagree.

Examples:

- Old preference: long detailed responses
- New preference: concise responses

Conflict resolution should consider:

1. Explicit user instruction
2. Recency
3. Confidence
4. Source reliability
5. Scope

New explicit preferences should normally supersede older conflicting preferences.

The old record may be retained for audit but marked inactive.

---

## Memory Expiration

Some memories should expire.

Examples:

- Temporary login state
- Short-term project deadlines
- Temporary website behavior
- One-time travel preferences

Preferences such as language or communication style may have no automatic expiration but must remain editable.

---

## Privacy Levels

Suggested levels:

```text
PUBLIC
INTERNAL
SENSITIVE
PROHIBITED
```

### Public

Safe general preference.

### Internal

Ordinary private application information.

### Sensitive

Requires strict access control and should rarely be sent to providers.

### Prohibited

Must not be stored as general memory.

Examples:

- Passwords
- API keys
- Authentication codes
- Private encryption keys
- Full session cookies
- Payment-card details

---

## Provider Privacy

Before memory is included in a cloud AI request:

- Select only relevant entries
- Remove internal identifiers
- Remove unnecessary source text
- Exclude prohibited data
- Redact sensitive values
- Prefer summaries over full records

The application should record which memory IDs were used without logging the full prompt.

---

## User Controls

Users should eventually be able to:

- View memories
- Search memories
- Edit preferences
- Delete memories
- Disable memory
- Clear task history
- Set expiration
- Mark data as sensitive
- Export memory
- See memory sources

Memory should not be invisible or impossible to correct.

---

## Deletion

Deletion should support:

- Soft delete for normal application recovery
- Hard delete when required
- Embedding deletion
- Removal from retrieval
- Audit entry without retaining deleted content

A deleted memory must stop appearing in retrieval immediately.

---

## Embeddings

The embeddings provider should be abstracted behind an internal interface.

This allows:

- Cloud embeddings initially
- Local embeddings later
- Model replacement
- Re-embedding jobs
- Testing with deterministic fake vectors

Embeddings are derived data and should be reproducible from the stored summary when permitted.

---

## Background Processing

Memory jobs may include:

- Generate embedding
- Re-embed after model change
- Expire old memories
- Deduplicate similar memories
- Recalculate importance
- Delete derived vectors
- Summarize completed tasks

These jobs should run through BullMQ rather than blocking user requests.

---

## Testing Requirements

Test:

- Structured preference storage
- User isolation
- Semantic retrieval
- Ranking
- Expiration
- Conflict resolution
- Deletion
- Sensitive-data rejection
- Duplicate prevention
- Memory-write policy
- Retrieval context limits
- Provider redaction
- Re-embedding workflow

---

## Initial Delivery Scope

The first memory version should support:

1. Explicit structured preferences
2. Episodic memory records
3. pgvector storage
4. Top-k retrieval
5. User isolation
6. Basic privacy classification
7. Memory deletion
8. Mocked embedding provider

Advanced inference and automatic memory consolidation can be added later.

---

## Related Documents

- [Architecture](./architecture.md)
- [Agent Workflow](./agent-workflow.md)
- [Security Model](./security-model.md)
- [Testing Strategy](./testing-strategy.md)
