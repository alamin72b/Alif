---
name: project-git-workflow
description: Inspect a repository's Git state and recommend safe, copy-ready commands for the feature branch → dev → main workflow, including first-time dev setup, branch switching, syncing, task-branch creation, pushes, and GitHub pull requests. Use when the user asks which branch to use, wants to start work, sync branches, create a feature/fix/docs branch, open a pull request, or promote development work to main.
---

# Project Git Workflow

Recommend commands; never execute Git or GitHub mutations. Do not create, switch, pull, push, commit, merge, delete, rebase, reset, stash, or configure branches yourself.

## Workflow

Use this repository model:

```text
typed task branch → dev → main
```

- Start each unit of work on an up-to-date typed task branch created from
  `dev`.
- Use `dev` only as the shared integration branch. Never make a work commit
  directly on `dev`.
- Treat `main` as the production-ready branch. Update it only through a `dev` → `main` GitHub pull request.
- Use GitHub pull requests for task-branch → `dev` integration and `dev` → `main` promotion. Never suggest direct merges into `main`, force-pushes, destructive resets, or automatic PR merges.
- Creating the initial empty `dev` branch from `main` is a one-time bootstrap
  operation, not a work branch. Immediately switch to a typed task branch
  before making changes.

## Inspect First

Run these commands from the repository root before recommending a workflow:

```bash
git status --short
git branch --show-current
git branch -a -vv
git remote -v
git fetch --prune --dry-run
git log --oneline --decorate --graph --max-count=20 --all
```

For the current branch, inspect its upstream when one exists:

```bash
git rev-list --left-right --count @{u}...HEAD
git log --oneline @{u}..HEAD
```

Inspect changed files and project manifests or documentation when they establish the task's intent. Check `gh auth status` and `gh repo view` only when proposing GitHub CLI commands.

Report the current branch, worktree state, upstream state, whether `origin/dev` exists, and the next workflow stage. Treat an unavailable upstream or missing `gh` authentication as a blocker for execution only, not as a reason to omit the relevant copy-ready command. Never guess repository state, branch names, or PR metadata.

## Choose the Task Branch

Infer the task's purpose from the user's request and visible repository changes. Use a lowercase, kebab-case branch name with exactly one of these prefixes:

| Change purpose | Branch prefix |
| --- | --- |
| New capability | `feat/` |
| Bug correction | `fix/` |
| Documentation | `docs/` |
| Restructuring | `refactor/` |
| Maintenance | `chore/` |
| Tests | `test/` |
| CI | `ci/` |
| Build/dependencies | `build/` |
| Performance | `perf/` |

For example, use `feat/task-api`, `fix/session-timeout`, or
`docs/security-model`. If the intent remains ambiguous after inspecting the
repository, ask the user before suggesting a name.

## Recommend the Correct Commands

Return a short state summary, the recommended task branch and reason, ordered
commands, and any blockers. When the user supplies task intent, always include
the typed task-branch command; never end a task-start response on `dev`.
Make commands copy-safe: quote paths, keep every physical command line at 72
characters or fewer, and never split a path, option, quoted string, or shell
operator across lines.
When a task-branch → `dev` pull request is ready, also provide an
industry-standard PR title and complete Markdown description. Use a
Conventional Commit-style title matching the dominant change. The description
must include `## Summary` and `## Testing`, describe only verified changes, and
never invent test results, risks, issue references, or breaking changes.

### Command output requirement

Always return the complete, copy-ready commands for the requested workflow;
never execute them. This requirement applies even when GitHub CLI, network
access, authentication, or the runtime environment prevents command
execution. For a requested pull request, include the full `git push` command
and a complete `gh pr create` command with explicit `--base`, `--head`,
`--title`, and `--body` arguments. If execution is blocked, state the blocker
after providing the commands and include the equivalent manual GitHub action
when applicable.

### First-time setup with a clean worktree

When only `main` exists and the worktree is clean, create the empty integration
branch, then immediately create the inferred typed task branch. Recommend this
single sequence:

```bash
git switch main
git pull --ff-only origin main
git switch -c dev
git push -u origin dev
git switch -c feat/short-task-name
```

Replace only the example task branch name. State that no work belongs on `dev`.
Do not recommend creating `dev` when a remote or local `dev` branch already
exists.

### First-time setup with uncommitted work on `main`

Do not tell the user to commit the work directly on `main`. If the inferred
typed task branch does not already exist, first isolate the current changes:

```bash
git switch -c chore/short-task-name
```

After the user commits that task branch, recommend creating the empty `dev`
branch from `main`, then returning to the task branch:

```bash
git switch main
git pull --ff-only origin main
git switch -c dev
git push -u origin dev
git switch chore/short-task-name
```

Then use the task-PR workflow. If the desired task branch already exists, do
not switch with conflicting worktree changes; identify the files and ask the
user to resolve the worktree state first.

### Daily task workflow

Use this when starting a new task from a clean worktree:

```bash
git switch dev
git pull --ff-only origin dev
git switch -c feat/short-task-name
```

Replace only the example branch name. If `dev` exists only on `origin`, first
recommend `git switch -c dev --track origin/dev`. If the local `dev` branch is
ahead of or diverged from `origin/dev`, explain that state and stop before
suggesting a pull that could fail or hide work.

### Continue existing task work

When the task branch already exists, require a clean worktree before changing
branches. Recommend only the necessary commands, normally:

```bash
git switch feat/short-task-name
git pull --ff-only origin feat/short-task-name
```

Do not pull when the branch has no upstream; instead recommend the appropriate
first push after the user commits. Do not switch automatically when tracked or
untracked changes could be overwritten; identify the files and ask whether the
user wants to commit, stash, or keep working first.

### Push a task branch and open its PR

After verifying that the intended commits exist and the branch is not `dev` or
`main`, recommend:

```bash
git push -u origin feat/short-task-name
gh pr create \
  --base dev \
  --head feat/short-task-name \
  --title 'feat: concise pull request title' \
  --body "$(printf '%s\n' \
    '## Summary' \
    '' \
    '- Describe the verified repository outcome.' \
    '- Mention the main implementation areas changed.' \
    '' \
    '## Testing' \
    '' \
    '- State the checks actually run, or explain why they were not run.')"
```

Also provide the proposed PR title and complete description separately from
the command. The `gh pr create` command must include the title and complete
description so it can create the PR without prompting for either field. Use
this structure:

```markdown
## Summary

- Describe the user-visible or repository-level outcome.
- Mention the main implementation areas changed.

## Testing

- State the checks actually run, or say `Not run` with the reason.
```

Keep the title concise and specific, such as
`feat: add task execution endpoint`. Summarize visible changes without
restating every file. Add `## Risks` or `## Follow-up` only when relevant.
If GitHub CLI is unavailable or unauthenticated, still provide the complete
`gh pr create` command, then state that the user should run it locally or open
a PR on GitHub from the task branch to `dev`; do not fabricate a URL.

### Prepare a development release PR

Use only when the user asks to promote development work and `dev` is clean and
ready. Recommend:

```bash
git switch dev
git pull --ff-only origin dev
git push origin dev
gh pr create --base main --head dev
```

Create the `dev` → `main` PR but do not suggest merging it. State any visible
uncommitted work, unpushed commits, or branch divergence that must be resolved
first.

## Safety Rules

- Do not include `git add`, `git commit`, `git merge`, `git rebase`,
  `git reset`, `git restore`, `git clean`, `git stash`, `git push --force`, or
  `gh pr merge` unless the user specifically asks for that operation.
- Do not use `git pull` without `--ff-only`.
- Never recommend a task commit on `dev` or `main`. Require a typed task branch
  and a task-branch → `dev` PR for all work.
- Do not assume all uncommitted work belongs to one task. Refer the user to the
  project commit-message skill when they need help grouping or committing it.
- Do not rename or delete branches. Do not change branch-protection settings.
- If a proposed branch name already exists, do not reuse it blindly; inspect
  its purpose and recommend switching to it or choosing a distinct name.
