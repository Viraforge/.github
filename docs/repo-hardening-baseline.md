# Repo Hardening Baseline

This document defines the default CI/CD baseline for new Viraforge repositories.

## Required PR Lanes

Every production-facing repo should have exactly one workflow for each of these concerns:

- `policy`
  Enforces repo policy checks such as forbidden files, lockfile rules, version bump rules, or deployment invariants.
- `verify`
  Runs the main build/test/typecheck path for the repo.
- `ai-review`
  Reviews diffs plus GitHub review feedback, can optionally apply bounded remediation.
- `merge-automation`
  Merges PRs once required checks are green and the AI verdict allows unattended merge.

## Optional Operational Lanes

Keep these only when the repo actually uses them:

- deploy workflow
- deploy drift check
- release workflow
- smoke test workflow
- key rotation workflow
- emergency unblock workflow
- e2e workflow

## Cleanup Rules

Do not delete workflows just because they are manual or infrequent. Remove a workflow only when one of these is true:

- another workflow now owns the exact same responsibility
- the deploy target or release channel no longer exists
- the emergency/manual action has been replaced by a safer supported path
- the workflow has not been used and no current runbook references it

Before removing a workflow, check:

1. branch protection does not require its status
2. deployment or release runbooks do not reference it
3. there is a clear replacement

## Naming Standard

Prefer these status and workflow names across repos:

- `policy`
- `verify`
- `ai-review/verdict`
- `review`
- `merge-automation`

Use workflow filenames that match the lane:

- `.github/workflows/policy.yml`
- `.github/workflows/verify.yml`
- `.github/workflows/ai-review.yml`
- `.github/workflows/merge-automation.yml`

## Branch Protection Standard

Default branch should require:

- up-to-date branch before merge
- `policy`
- `verify`
- `ai-review/verdict`

Add repo-specific checks only when they are true merge gates, for example:

- `server-tests`
- `pre-deploy-checks`
- `e2e`

Avoid requiring informational or post-deploy checks as merge blockers unless the repo truly depends on them.

## AI Review Standard

The AI review lane should:

- read PR title, body, diff
- read inline PR review comments
- read top-level PR reviews
- post a status to `ai-review/verdict`
- optionally remediate bounded findings
- never modify workflow files during remediation
- skip self-trigger loops via `[ai-fix]` marker or equivalent
- pass diff/comment payloads to the reviewer via files instead of giant environment variables
- ignore stale inline comments from older commits and only consider comments anchored to the current head SHA

## Merge Automation Standard

Merge automation should:

- listen for status and check completion events
- resolve the open PR associated with the SHA
- require `ai-review/verdict` success
- verify all required checks are green
- update the branch if behind and wait for fresh checks
- merge with squash by default

## PR Reconciliation Standard

Add a scheduled `pr-reconcile.yml` workflow that:

- re-arms auto-merge for already-green PRs when an event edge is missed
- closes stranded conflicting PRs when a newer merged PR with the same issue key already landed

## New Repo Bootstrap Checklist

1. Copy starter workflows from `templates/workflows/`
2. Copy `templates/scripts/ai-review.mjs`
3. Copy `templates/scripts/ai-remediate.mjs`
4. Set `MINIMAX_API_KEY`
5. Apply branch protection
6. Enable auto-merge where repository settings allow it
7. Add repo-specific verify and policy logic
8. Document the workflow map in repo `CLAUDE.md` or `AGENTS.md`
