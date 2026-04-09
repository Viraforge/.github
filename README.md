# Viraforge Standards

This repository now serves two purposes:

1. Organization profile content under [profile/README.md](/tmp/viraforge-dotgithub/profile/README.md)
2. Shared CI/CD hardening guidance and starter templates for Viraforge repositories

The baseline lives in:

- [docs/repo-hardening-baseline.md](/tmp/viraforge-dotgithub/docs/repo-hardening-baseline.md)
- [templates/workflows/ai-review.yml](/tmp/viraforge-dotgithub/templates/workflows/ai-review.yml)
- [templates/workflows/merge-automation.yml](/tmp/viraforge-dotgithub/templates/workflows/merge-automation.yml)
- [templates/workflows/policy.yml](/tmp/viraforge-dotgithub/templates/workflows/policy.yml)
- [templates/workflows/verify-node.yml](/tmp/viraforge-dotgithub/templates/workflows/verify-node.yml)
- [templates/workflows/verify-python.yml](/tmp/viraforge-dotgithub/templates/workflows/verify-python.yml)
- [templates/scripts/ai-review.mjs](/tmp/viraforge-dotgithub/templates/scripts/ai-review.mjs)
- [templates/scripts/ai-remediate.mjs](/tmp/viraforge-dotgithub/templates/scripts/ai-remediate.mjs)

Use this repo as the source of truth for:

- branch protection expectations
- required PR checks
- AI review and remediation behavior
- merge automation defaults
- cleanup criteria for unnecessary workflows
