# GitHub Actions Pull Request Build

## Status

Approved design for PR build validation.

## Goal

Report whether HomeFind's existing Docker image builds for pull requests targeting `main`.

## Design

- Add one workflow at `.github/workflows/ci.yml`.
- Trigger it only for `pull_request` events targeting `main`.
- Grant the workflow `contents: read` permission.
- Run one job on `ubuntu-latest` that checks out the PR and runs `docker build --tag homefind:pr .`.
- Let GitHub report a failed image build as a failed PR check.

The Dockerfile already runs `npm ci` and `npm run build` on Node 24, so building the image checks both the application build and its Docker packaging. The workflow does not need repository secrets.

## Out of scope

- Publishing images, deployment, and manual or push triggers.
- Tests and linting; the repository currently has no corresponding package scripts.
- Making the check mandatory for merges; that is configured in repository branch rules.
- Starting the container or testing its runtime behavior.

## Acceptance criteria

- A pull request targeting `main` runs the image build.
- A Docker build failure produces a failed workflow check.
- The workflow has read-only repository permissions and does not publish or deploy.
