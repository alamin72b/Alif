---
name: project-commit-message
description: Analyze all unpushed commits and current staged or unstaged changes in the current repository, then propose focused Conventional Commit messages and ready-to-run staging and commit commands. Use when the user asks to review unpushed work, prepare a commit, or generate an industry-standard commit message.
---

# Project Commit Message

Analyze the repository's unpushed work accurately and turn uncommitted changes into small, reviewable Conventional Commits. Never create, amend, stage, commit, push, or discard changes yourself.

## Inspect

Run these commands from the repository root:

```bash
git status --short
git diff --stat
git diff --cached --stat
git diff
git diff --cached
git log --oneline --decorate --graph --max-count=20 --all
git branch -vv
```

If the current branch has an upstream, also run:

```bash
git rev-list --left-right --count @{u}...HEAD
git log --format=fuller @{u}..HEAD
git diff --stat @{u}...HEAD
```

If no upstream exists, say so and assess local commits plus the working tree. Inspect relevant files when a diff alone does not establish the change's purpose. Check available test or build commands only when needed to report verification; do not claim they passed unless they were actually run.

## Decide Commit Boundaries

- Treat commits already ahead of upstream as existing history: summarize them, but do not suggest recommitting them.
- Separate uncommitted files into focused, independently understandable groups by user-facing purpose. Keep implementation, tests, and directly related documentation together.
- Do not combine unrelated work merely to produce one command. Propose one commit per group, in a sensible order.
- When a file contains changes for more than one group, do not give an unsafe whole-file staging command. Tell the user to use `git add -p -- <path>` or split the file first.
- If the intent is unclear, state the uncertainty and ask before including that work in a commit.

## Write Conventional Commits

Use the dominant change type:

- `feat`: user-facing capability
- `fix`: bug correction
- `refactor`: behavior-preserving restructuring
- `docs`: documentation only
- `test`: tests only
- `perf`: measurable performance improvement
- `build`: build system or dependencies
- `ci`: continuous-integration configuration
- `chore`: maintenance or tooling

Use an optional concise scope only when it improves clarity. Subjects must be imperative, specific, and ideally 50 characters or fewer. For substantial changes, add a factual body that explains the outcome, key changes, compatibility risks or follow-up work, and verification performed. Do not invent details, test results, issue references, or breaking changes.

## Output

Return, in this order:

1. A short repository summary: branch/upstream state, unpushed commits already present, and uncommitted groups found.
2. One section per proposed commit containing its type/scope, a fenced complete message, and a ready-to-run command.
3. Treat the fenced complete message as the canonical source of truth. The
   commit command must reproduce its subject and every body paragraph exactly,
   including wording, punctuation, paragraph order, and all substantive detail.
   Never shorten, paraphrase, or replace the recommended body with a summary.
4. Represent each commit-message paragraph with its own `-m` argument, in the
   same order as the fenced message. If the message has no body, use only the
   subject `-m` argument.
5. Make every command copy-safe: keep each physical command line at 72
   characters or fewer, never split a path, quoted string, option, or shell
   operator across lines, and use only explicit line breaks. Prefer a short
   sequence of commands over one long command.
6. When related files share a directory, first change into that directory so
   staging uses short relative paths. For unstaged groups, use this form:

```bash
cd path/to/group
git add -- file other-file
git commit -m 'type(scope): concise subject' \
  -m 'Short factual summary of the main change.'
cd -
```

7. For already staged groups, omit `git add`; warn when the staged index also contains unrelated changes.
8. A concise note identifying anything intentionally left unstaged or requiring `git add -p`.

Quote shell paths safely. Never use `git add -A`, `git commit -a`, `git commit --amend`, `git reset`, or `git push` in a recommended command unless the user explicitly requests that operation.
