# Security Policy

## Reporting a Vulnerability

**Please do not open a public issue for security problems.**

Report privately via GitHub's **[Report a vulnerability](https://github.com/ankit-at/playwright-e2e-framework/security/advisories/new)**
(repo → **Security** → **Advisories** → *Report a vulnerability*). Private
vulnerability reporting is enabled on this repository, so you'll get a private
thread to coordinate a fix.

We aim to **acknowledge reports within 5 business days** and to share a
remediation timeline after triage. Please give us reasonable time to fix an
issue before any public disclosure.

## Supported Versions

This is an actively-developed test-automation framework — only the latest `main`
is supported, and fixes land on `main`.

| Version | Supported |
| --- | --- |
| `main` (latest) | ✅ |
| older commits / branches | ❌ |

## Scope

**In scope:** the framework code (`config/`, `api/`, `mocks/`, `fixtures/`,
`pages/`, `utils/`, `tests/`, `mcp/`), the CI/CD definitions
(`.github/workflows/`, `Jenkinsfile`), and the infra (`docker-compose.yml`,
`infra/`).

**Out of scope:** the applications under test (rahulshettyacademy, EventHub,
etc.) are **third-party practice sites** — report issues with those to their
owners, not here.

## Security practices in this repository

- **No committed secrets.** Credentials live only in a gitignored `.env` locally
  and in GitHub Actions / Jenkins **secrets** in CI; the tracked `.properties`
  files leave them blank. **Secret scanning + push protection** are enabled.
- **Least-privilege CI.** GitHub Actions runs with `permissions: contents: read`,
  and secrets are scoped to the test step only (install steps never see them).
- **No credential-bearing artifacts.** On CI, traces/screenshots are disabled and
  only success reports are uploaded — this repo is public, and traces can capture
  login payloads and tokens.
- **Hardened self-hosted workflow.** `playwright-self-hosted.yml` is
  manual-dispatch only and guarded to the canonical repo, so forks can't run it.
- **Dependency hygiene.** Dependabot alerts + security updates are enabled, and
  `.github/dependabot.yml` proposes weekly dependency / Actions updates.

## If you find committed credentials

Treat them as **compromised**: rotate them at the provider immediately, then
report privately so they can be purged from history.
