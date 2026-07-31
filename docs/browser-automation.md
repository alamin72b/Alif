# Browser Automation

## Purpose

This document defines how Project Alif observes and controls web browsers.

The browser layer is responsible for translating validated agent actions into reliable Playwright operations while keeping execution local and bounded.

The AI model may choose an action, but it must not directly control Playwright or receive unrestricted browser access.

---

## Primary Technology

Alif will use Playwright with Chromium for the first implementation.

Reasons:

- Reliable browser lifecycle management
- Semantic locators
- Automatic waiting
- Isolated browser contexts
- Screenshot support
- Download and upload controls
- Strong test tooling
- TypeScript support

---

## Design Principles

### Semantic interaction first

Prefer semantic elements over fixed screen coordinates.

Priority order:

1. Accessible role and name
2. Form label
3. Placeholder
4. Visible text
5. Test ID
6. Stable selector
7. Coordinates as a final fallback

### Local execution

The browser runs locally. Cloud AI providers receive only the minimum observation required for reasoning.

### Stable element identifiers

The model should interact with temporary local element IDs, not raw Playwright locators.

### Verified execution

After each action, the browser must produce a new observation so the agent can verify the expected result.

### Isolated sessions

Each task or user session should run in an isolated browser context unless a trusted persistent profile is intentionally selected.

---

## Package Structure

```text
packages/browser/
└── src/
    ├── sessions/
    ├── contexts/
    ├── pages/
    ├── observations/
    ├── elements/
    ├── actions/
    ├── screenshots/
    ├── downloads/
    ├── policies/
    └── errors/
```

---

## Browser Session Manager

The session manager should handle:

- Browser startup
- Browser shutdown
- Context creation
- Page creation
- Tab selection
- Session lookup
- Session timeout
- Resource cleanup
- Browser crash recovery
- Persistent profile configuration

### Session identifiers

Use internal identifiers:

```text
browserSessionId
browserContextId
pageId
```

Do not expose raw Playwright objects outside the browser package.

### Context isolation

A browser context isolates:

- Cookies
- Local storage
- Session storage
- Permissions
- Cache
- Authentication state

For early development, use temporary contexts by default.

Persistent login profiles should be added later with explicit user control.

---

## Browser Observation

The observation is the model-facing representation of the current page.

It should include:

- Current URL
- Page title
- Load status
- Relevant visible text
- Interactive elements
- Error messages
- Dialog state
- Active element
- Optional screenshot reference
- Observation timestamp

It should not include complete raw HTML by default.

### Why compact observations matter

Sending full page HTML causes:

- Large token usage
- Irrelevant context
- Increased prompt-injection exposure
- Slower model responses
- More schema failures

The observation builder should extract only what is needed for the current task.

---

## Element Registry

The browser service should create temporary element IDs for the current observation.

Example:

```json
{
  "id": "el_12",
  "role": "button",
  "name": "Search",
  "visible": true,
  "enabled": true
}
```

The registry maps `el_12` to a real local locator.

The mapping should include enough information to rebuild or validate the locator when the action is executed.

Element IDs should expire when:

- The page navigates
- The DOM changes significantly
- A new observation replaces the old one
- The browser session closes

This prevents the model from acting on stale elements.

---

## Supported Actions

Initial actions:

- Navigate
- Click element
- Type text
- Select option
- Press key
- Scroll
- Wait
- Go back
- Refresh
- Finish
- Fail
- Request confirmation

Actions involving external state changes may require approval before execution.

---

## Action Execution

The executor should follow this sequence:

1. Validate the action schema.
2. Confirm the browser session exists.
3. Confirm the page exists.
4. Check action policy.
5. Resolve the target element.
6. Verify visibility and enabled state.
7. Execute through Playwright.
8. Wait for a bounded post-action condition.
9. Capture a new observation.
10. Return execution metadata.

### Bounded waiting

Do not use unlimited waits.

Each action should have:

- Action timeout
- Navigation timeout
- Post-action observation timeout
- Cancellation support

---

## Navigation

Navigation actions must pass through domain policy.

Checks may include:

- Allowed scheme
- Allowed or blocked domain
- Redirect destination
- Local file access restrictions
- Download restrictions
- Authentication boundary

Disallow dangerous or unsupported schemes by default.

Examples:

```text
javascript:
file:
data:
```

Allow only what the task requires.

---

## Text Entry

Text entry must distinguish between:

- Normal text fields
- Password fields
- Search fields
- Rich-text editors
- File inputs

Sensitive text such as passwords should not be sent to a cloud model.

Where possible, sensitive values should be inserted locally from a secure store after the model selects the correct field.

---

## Screenshots

Screenshots are a fallback observation method, not the default for every step.

Use screenshots when:

- The page is canvas-based
- Important information is visual
- Semantic extraction fails
- The layout itself matters
- A modal or graphical control cannot be represented structurally

### Privacy controls

Before sending a screenshot to a provider:

- Crop unrelated areas
- Mask password fields
- Mask authentication codes
- Mask payment information
- Mask private identifiers when possible
- Remove browser chrome if unnecessary

Screenshots should have a retention policy.

---

## Downloads and Uploads

### Downloads

Downloads should be blocked or require confirmation by default.

The browser service should record:

- File name
- Source URL
- MIME type
- Size
- Local destination
- Hash when appropriate

Executing downloaded files is outside the initial scope.

### Uploads

File uploads should require explicit task intent and often human approval.

The model must never receive unrestricted access to the local filesystem.

The application should present approved file choices through a controlled file selector.

---

## Dialogs and Popups

The browser layer must handle:

- JavaScript alerts
- Confirm dialogs
- Prompt dialogs
- New tabs
- Popup windows
- Permission prompts

Unexpected dialogs should pause execution and produce a structured observation instead of being accepted automatically.

---

## CAPTCHA Handling

Alif must not attempt to bypass CAPTCHAs.

When a CAPTCHA appears:

1. Detect or suspect the challenge.
2. Pause the task.
3. Notify the user.
4. Allow manual completion.
5. Resume from a fresh observation.

---

## Verification

Every model action should include an expected result.

Examples:

- URL changed
- Search results appeared
- Dialog closed
- Text is visible
- Button became disabled
- Form step advanced

The verification node compares the expected result with the new browser observation.

A successful Playwright call does not prove that the task step succeeded.

---

## Error Model

Browser errors should use stable internal codes.

Examples:

- `BROWSER_SESSION_NOT_FOUND`
- `PAGE_NOT_FOUND`
- `ELEMENT_NOT_FOUND`
- `ELEMENT_STALE`
- `ELEMENT_NOT_VISIBLE`
- `ELEMENT_DISABLED`
- `NAVIGATION_BLOCKED`
- `ACTION_TIMEOUT`
- `BROWSER_CRASHED`
- `DOWNLOAD_REQUIRES_CONFIRMATION`
- `CAPTCHA_REQUIRES_USER`

Every error should state whether it is retryable.

---

## Testing Approach

Browser tests should use controlled local fixture pages.

Recommended fixtures:

- Search page
- Login form
- Multi-step form
- Dynamic loading page
- Modal dialog page
- New-tab page
- Fake checkout page
- Upload page
- Download page
- Prompt-injection page

Public websites should not be the only automated test target because they change without notice.

---

## Initial Milestone

The first browser milestone:

```text
Open a controlled search page and search for "Project Alif".
```

Completion criteria:

- Browser starts successfully
- Search field is discovered semantically
- Element ID is generated
- Text is entered
- Search is submitted
- Results are detected
- Session is closed cleanly
- Errors are recorded clearly

---

## Related Documents

- [Architecture](./architecture.md)
- [Agent Workflow](./agent-workflow.md)
- [Security Model](./security-model.md)
- [Testing Strategy](./testing-strategy.md)
