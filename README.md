# Project Alif

> A local-first, API-powered AI agent for browser automation, long-term memory, multi-step reasoning, and voice interaction.

## Overview

Project Alif is an experimental autonomous AI assistant designed to understand natural-language instructions, create multi-step plans, interact with websites, remember useful user preferences, and request approval before sensitive actions.

Unlike fixed automation scripts, Alif is intended to work through a continuous agent loop:

```text
Understand → Plan → Observe → Act → Verify
```

The project is being developed as both:

* A practical autonomous-agent system
* A production-style full-stack engineering portfolio project

## Project Status

Alif is currently in the **architecture and foundation phase**.

| Area                      | Status       |
| ------------------------- | ------------ |
| System architecture       | Defined      |
| Local LLM experiment      | Completed    |
| Multi-provider AI gateway | Next         |
| Browser automation        | Planned      |
| Agent workflow            | Planned      |
| Long-term memory          | Planned      |
| Voice interface           | Planned      |
| Desktop control           | Future phase |

A local 14B Ollama model was tested successfully for structured JSON generation. However, it caused excessive memory pressure on the current 16 GB, CPU-only development machine.

Because of this limitation, the first version of Alif will use cloud AI APIs for reasoning while keeping execution, validation, memory, browser control, and application data local.

## Core Goals

Alif is intended to support:

* Natural-language commands
* Multi-step task planning
* Browser automation
* Structured AI responses
* Multiple AI providers with fallback
* Long-term preference memory
* Human approval for sensitive actions
* Local task history and logging
* Voice input and output
* Future desktop application control

Example commands:

```text
Open Google and search for software engineering jobs in Dhaka.
```

```text
Find the latest email from a company and prepare a reply, but ask before sending it.
```

```text
Remember that I prefer concise professional messages.
```

## Architecture

```text
┌───────────────────────────────┐
│          Next.js UI           │
│ Commands, progress, approvals │
└───────────────┬───────────────┘
                │ REST + live events
┌───────────────▼───────────────┐
│          NestJS API           │
│ Tasks, validation, security   │
└───────────────┬───────────────┘
                │ Queue job
┌───────────────▼───────────────┐
│         Agent Worker          │
│ Plan → Observe → Act → Verify │
└──────────┬───────────┬────────┘
           │           │
┌──────────▼──────┐ ┌──▼──────────────┐
│   AI Gateway    │ │ Browser Service │
│ Gemini          │ │ Playwright      │
│ Groq            │ │ DOM observation │
│ OpenRouter      │ │ Safe execution  │
└──────────┬──────┘ └──┬──────────────┘
           │           │
┌──────────▼───────────▼──────────────┐
│           Local Data Layer          │
│ PostgreSQL, pgvector, Redis, logs   │
└─────────────────────────────────────┘
```

## Technology Stack

### Application

| Technology   | Responsibility                |
| ------------ | ----------------------------- |
| TypeScript   | Primary project language      |
| Next.js      | User interface                |
| NestJS       | Backend API and control plane |
| LangGraph.js | Stateful agent workflow       |
| Playwright   | Browser automation            |
| Zod          | Runtime schema validation     |

### Data and Infrastructure

| Technology     | Responsibility                     |
| -------------- | ---------------------------------- |
| PostgreSQL     | Main application database          |
| pgvector       | Semantic memory retrieval          |
| Redis          | Queues, locks, and temporary state |
| BullMQ         | Background task processing         |
| Docker Compose | Local infrastructure               |
| pnpm           | Package management                 |
| Turborepo      | Monorepo task orchestration        |

### AI Providers

Alif will use a provider-independent AI gateway.

Initial provider candidates:

1. Gemini
2. Groq
3. OpenRouter
4. Ollama as an optional local fallback

The rest of the application will communicate with an internal gateway instead of depending directly on a specific provider.

## Why TypeScript

Alif uses a TypeScript-first architecture because it allows the frontend, backend, agent workflow, schemas, browser automation, and tests to share one primary language.

This project is designed to strengthen practical skills used in full-stack and backend engineering roles:

* TypeScript
* React and Next.js
* Node.js and NestJS
* SQL and PostgreSQL
* REST APIs
* Real-time communication
* Redis and queues
* Docker
* Automated testing
* AI API integration
* Browser automation

Python may be introduced later for isolated services where it provides a clear technical benefit, such as local speech processing or experimental computer-vision components.

## Core Workflow

A typical Alif task will follow this process:

1. The user submits a command through the Next.js interface.
2. NestJS validates the command and creates a task.
3. The task is placed in a BullMQ queue.
4. The agent worker retrieves relevant user memory.
5. The AI gateway creates or updates the plan.
6. Playwright observes the current browser state.
7. The AI model selects a structured action.
8. Local code validates the action.
9. The browser service executes the approved action.
10. Alif verifies the result.
11. The loop continues until the task finishes or reaches a safety limit.

## Browser Automation Strategy

Alif will use semantic browser elements instead of fixed screen coordinates whenever possible.

Preferred element-selection order:

1. Accessible role and name
2. Form label
3. Placeholder
4. Visible text
5. Test ID
6. Stable selector
7. Screen coordinates as a last fallback

This approach is more reliable than coordinate-only automation because it is less dependent on screen resolution and page layout.

## Multi-Provider AI Gateway

The AI gateway will be responsible for:

* Provider selection
* Structured-output generation
* Timeout handling
* Retry policies
* Automatic fallback
* Capability-based routing
* Provider health tracking
* Circuit breaking
* Safe error handling

Fallback may occur when a provider returns:

* A rate-limit response
* A timeout
* A server error
* An empty response
* Invalid JSON
* A schema validation failure
* An unsupported capability

The application will not retry indefinitely. Every request and agent task will have defined limits.

## Long-Term Memory

Alif will use two main memory types.

### Structured Preferences

Examples:

* Preferred language
* Communication style
* Default browser
* Preferred job location
* Confirmation preferences

Structured preferences will be stored in normal PostgreSQL fields.

### Episodic Memory

Examples:

* A previous task failed because a website required login.
* The user prefers shorter professional emails.
* A specific site frequently displays a CAPTCHA.

Episodic memories will be stored with metadata and embeddings for semantic retrieval.

Sensitive information such as passwords, API keys, authentication codes, and session cookies must never be stored as general memory.

## Safety

Alif must not execute every model-generated instruction automatically.

Human confirmation will be required before actions such as:

* Sending messages
* Posting public content
* Submitting applications
* Making purchases
* Confirming payments
* Deleting files or data
* Changing passwords
* Uploading private files
* Modifying account settings
* Downloading or executing software

Security decisions will be enforced by local deterministic code rather than by the AI model alone.

## Repository Structure

```text
Alif/
├── apps/
│   ├── web/                  # Next.js application
│   ├── api/                  # NestJS application
│   └── agent-worker/         # Background worker
│
├── packages/
│   ├── contracts/            # Shared Zod schemas and types
│   ├── config/               # Environment validation
│   └── observability/        # Shared logging
│
├── docs/
│   ├── development/         # Setup and contributor guidance
│   └── architecture/        # System docs and decision records
│
├── infrastructure/          # Reserved for local services
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── .env.example
├── .gitignore
└── README.md
```

## Development Roadmap

### Phase 1 — Foundation

* Create the pnpm monorepo
* Add Next.js and NestJS
* Configure shared TypeScript packages
* Add PostgreSQL and Redis
* Add linting, formatting, and tests
* Add Docker Compose

### Phase 2 — AI Gateway

* Define the provider interface
* Add multiple provider adapters
* Validate structured responses with Zod
* Add retries and fallback
* Add circuit-breaker behavior
* Add provider reliability tests

### Phase 3 — Browser Automation

* Add Playwright
* Build the browser-session manager
* Extract semantic page elements
* Implement validated browser actions
* Add screenshots as a visual fallback
* Add browser integration tests

### Phase 4 — Agent Workflow

* Define LangGraph state
* Add planning and observation nodes
* Add action selection and execution
* Add verification and recovery
* Add task limits
* Add human approval checkpoints

### Phase 5 — Memory

* Add pgvector
* Store structured preferences
* Store episodic memories
* Implement semantic retrieval
* Add privacy and deletion controls

### Phase 6 — Voice and Desktop Control

* Add speech-to-text
* Add text-to-speech
* Add voice interaction
* Experiment with Linux desktop accessibility
* Add stronger controls for desktop actions

## First Milestone

The first end-to-end milestone is intentionally small:

```text
Open Google and search for Project Alif.
```

The milestone is complete when:

* A task can be created through the frontend
* The worker receives the task
* An AI provider returns valid structured actions
* Playwright enters the search query
* The result page is detected
* Progress is displayed to the user
* The task finishes without an uncontrolled loop

Voice, long-term memory, authentication, and desktop control are not required for the first milestone.

## Engineering Principles

Project Alif follows these principles:

* Modular architecture
* Clear separation of concerns
* Shared type-safe contracts
* Provider independence
* Secure defaults
* Bounded agent autonomy
* Structured error handling
* Testable components
* Observable workflows
* Incremental development

The AI model is responsible for reasoning and action selection.

Local application code is responsible for validation, authorization, execution, persistence, retries, and safety.

## Documentation

Detailed technical documentation is stored separately:

```text
docs/
├── development/
│   ├── getting-started.md
│   ├── local-environment.md
│   └── project-structure.md
├── architecture/
│   └── decisions/
│       ├── README.md
│       └── 0001-use-typescript-monorepo.md
├── architecture.md
├── provider-routing.md
├── browser-automation.md
├── agent-workflow.md
├── memory-design.md
├── security-model.md
├── testing-strategy.md
└── roadmap.md
```

The main README should remain a high-level introduction. Detailed interfaces, schemas, policies, and implementation decisions belong in these documents.

## Known Limitations

* The first version will depend on external AI APIs.
* Free provider limits may change.
* Public websites may change their layouts.
* Some websites may block automation.
* CAPTCHAs may require manual interaction.
* Screenshot analysis may send page data to an external provider.
* Desktop automation will not be supported initially.
* Successful completion cannot be guaranteed for every task.

## License

A license has not yet been selected.

An appropriate open-source or proprietary license will be added before public release or external contribution.

---

**Project Alif is currently under active development.**
