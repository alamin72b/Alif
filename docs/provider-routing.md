# AI Provider Routing

## Purpose

This document defines how Project Alif communicates with multiple AI providers without coupling the application to one vendor.

The provider layer must support:

- Multiple model providers
- Ordered fallback
- Capability-based routing
- Structured output
- Timeouts
- Limited retries
- Circuit breaking
- Health tracking
- Safe logging
- Future provider replacement

---

## Design Goals

### Provider independence

Application code should communicate with an internal gateway.

It should not depend directly on Gemini, Groq, OpenRouter, Ollama, or any other provider.

### Reliability

A provider outage, timeout, or rate limit should not automatically stop the task when another compatible provider is available.

### Bounded cost and quota usage

Alif must not call every provider simultaneously for ordinary requests.

Providers should be tried in a controlled order.

### Consistent output

Provider responses must be converted into shared internal types and validated with Zod.

### Capability awareness

The router must distinguish between:

- Text generation
- Structured output
- Vision input
- Tool calling
- Long-context support
- Low-latency summarization

---

## Package Boundary

Recommended package:

```text
packages/llm-gateway/
└── src/
    ├── gateway/
    ├── providers/
    ├── routing/
    ├── retries/
    ├── circuit-breaker/
    ├── health/
    ├── errors/
    └── telemetry/
```

No provider SDK should be imported outside this package.

---

## Gateway Responsibilities

The gateway should expose task-oriented methods rather than a generic unstructured chat method.

Examples:

- Generate a task plan
- Generate a browser action
- Analyze a screenshot
- Summarize memory
- Verify task completion
- Check provider health

This keeps prompts, schemas, and model selection close to the use case.

---

## Provider Adapter Responsibilities

Each adapter must:

1. Translate an internal request into the provider format.
2. Apply the selected model name.
3. Set timeouts and generation options.
4. Request structured output when supported.
5. Normalize the response.
6. Convert provider errors into internal error types.
7. Return usage and latency metadata.
8. Avoid logging secrets or sensitive prompt content.

Provider-specific behavior must remain isolated.

---

## Capability Registry

Every configured model should declare its supported capabilities.

Example fields:

| Field | Meaning |
|---|---|
| `supportsText` | Accepts text input |
| `supportsVision` | Accepts images |
| `supportsStructuredOutput` | Supports schema-constrained output |
| `supportsTools` | Supports tool or function calling |
| `maxContextTokens` | Maximum configured context |
| `priority` | Default fallback order |
| `enabled` | Whether the model is available |
| `costClass` | Free, low-cost, or premium |
| `latencyClass` | Fast, standard, or slow |

The router should filter candidates before making a request.

For example, screenshot analysis must not be sent to a text-only model.

---

## Routing Strategy

### Default ordered fallback

```text
Primary provider
    ↓ failure
Secondary provider
    ↓ failure
Emergency provider
    ↓ failure
Return a safe error
```

### Recommended initial policy

```text
Maximum attempts per provider: 2
Maximum providers per request: 3
First attempt: normal request
Second attempt: repair request when appropriate
Then: move to the next compatible provider
```

Retries must not continue indefinitely.

---

## Failure Conditions

The router may move to another provider when it receives:

- Network failure
- Request timeout
- HTTP 429
- HTTP 500–599
- Provider unavailable
- Empty response
- Invalid JSON
- Zod validation failure
- Unsupported modality
- Unsupported structured output
- Open circuit breaker
- Provider-specific quota exhaustion

A normal but low-quality answer should not always trigger immediate fallback. Quality failures require use-case-specific verification.

---

## Structured Output

All agent-critical responses must be validated locally.

Examples:

- Plans
- Browser actions
- Verification results
- Memory summaries
- Risk classifications

The validation sequence should be:

```text
Provider response
    ↓
Extract response text or object
    ↓
Parse JSON
    ↓
Validate with Zod
    ↓
Normalize into internal type
    ↓
Return to caller
```

If parsing or validation fails:

1. Attempt one repair request when configured.
2. Include the validation error without exposing secrets.
3. Ask the same provider for corrected output.
4. Fall back if repair fails.

The application must never execute unvalidated model output.

---

## Circuit Breaker

A circuit breaker prevents repeated calls to an unhealthy provider.

### States

#### Closed

Requests are allowed.

#### Open

Requests are skipped because recent failures exceeded the configured threshold.

#### Half-open

One controlled request is allowed to test recovery.

### Suggested initial values

| Setting | Initial value |
|---|---:|
| Failure threshold | 3 consecutive failures |
| Cooldown | 60 seconds |
| Half-open test requests | 1 |
| Request timeout | 45 seconds |

These values must be configurable.

### Storage

For a single local worker, in-memory state is acceptable initially.

For multiple workers, provider circuit state should move to Redis so that all workers share the same health view.

---

## Retry Policy

Retries should use exponential backoff with jitter for retryable failures.

Example progression:

```text
Attempt 1: immediate
Attempt 2: short delay
Fallback provider: after retry failure
```

Avoid long retry chains because they increase task latency and may consume free quota.

Do not retry:

- Authentication failure
- Invalid API key
- Unsupported capability
- Invalid request schema
- User cancellation
- Permanent policy rejection

---

## Provider Health

The system should expose provider health without exposing credentials.

Health information may include:

- Enabled or disabled
- Last successful request
- Last failure
- Consecutive failures
- Circuit state
- Average latency
- Structured-output failure rate
- Rate-limit state

Health checks should be lightweight. Avoid sending frequent generation requests solely to test providers.

---

## Model Selection by Task

### Planning

Requirements:

- Strong instruction following
- Structured output
- Moderate context support

### Browser action selection

Requirements:

- Reliable schema adherence
- Low latency
- Strong grounding in provided observations

### Screenshot analysis

Requirements:

- Vision support
- Structured output
- Good OCR-like visual understanding

### Memory summarization

Requirements:

- Low cost
- Fast text generation
- Reliable concise output

### Task verification

Requirements:

- Conservative reasoning
- Structured decision output
- Access to expected and observed state

Different tasks may use different models from the same or different providers.

---

## Configuration

Recommended environment variables:

```env
ALIF_AI_PRIMARY_PROVIDER=
ALIF_AI_SECONDARY_PROVIDER=
ALIF_AI_EMERGENCY_PROVIDER=

ALIF_AI_REQUEST_TIMEOUT_MS=45000
ALIF_AI_MAX_ATTEMPTS_PER_PROVIDER=2
ALIF_AI_MAX_PROVIDERS_PER_REQUEST=3
ALIF_AI_CIRCUIT_FAILURE_THRESHOLD=3
ALIF_AI_CIRCUIT_COOLDOWN_MS=60000

ALIF_GEMINI_API_KEY=
ALIF_GEMINI_MODEL=

ALIF_GROQ_API_KEY=
ALIF_GROQ_MODEL=

ALIF_OPENROUTER_API_KEY=
ALIF_OPENROUTER_MODEL=
```

Model names should be configuration, not hardcoded business logic.

---

## Secret Handling

Rules:

- Keep keys in `.env` during development.
- Never commit `.env`.
- Never expose keys to the Next.js browser bundle.
- Never include keys in prompts.
- Never log complete keys.
- Mask provider headers in error logs.
- Validate configured providers during startup.
- Fail clearly when a required provider is misconfigured.

---

## Observability

Every provider attempt should record safe metadata:

- Task ID
- Step ID
- Provider ID
- Model ID
- Attempt number
- Duration
- Result type
- Error code
- Token usage when available
- Whether fallback occurred

Prompts and responses should not be logged by default because they may contain private data.

Development-only prompt logging must be explicitly enabled and redacted.

---

## Testing Requirements

The provider layer must be tested with mocked responses for:

- Successful structured output
- Invalid JSON
- Missing fields
- Unexpected fields
- Timeout
- Rate limit
- Server error
- Authentication failure
- Empty response
- Primary failure and secondary success
- All providers failing
- Circuit opening
- Half-open recovery
- Unsupported vision request
- Cancellation

See [Testing Strategy](./testing-strategy.md) for the full approach.

---

## Initial Delivery Scope

The first implementation should support:

1. One primary provider.
2. One secondary provider.
3. Text input.
4. Structured browser-action output.
5. Zod validation.
6. Timeout handling.
7. One repair retry.
8. Ordered fallback.
9. Basic provider metrics.
10. Mocked reliability tests.

Circuit breaking and advanced scoring can follow after the basic gateway is stable.

---

## Related Documents

- [Architecture](./architecture.md)
- [Agent Workflow](./agent-workflow.md)
- [Browser Automation](./browser-automation.md)
- [Security Model](./security-model.md)
- [Testing Strategy](./testing-strategy.md)
