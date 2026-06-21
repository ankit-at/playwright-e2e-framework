# Playwright E2E Framework

[![Playwright Tests](https://github.com/ankit-at/playwright-e2e-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/ankit-at/playwright-e2e-framework/actions/workflows/playwright.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](tsconfig.json)
[![Playwright](https://img.shields.io/badge/Playwright-1.59-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![Node](https://img.shields.io/badge/Node-24-339933?logo=node.js&logoColor=white)](https://nodejs.org)

A production-grade end-to-end test automation framework built with **Playwright + TypeScript**, covering **UI, API, performance, and load** testing — organised in clean, single-responsibility layers with full CI/CD integration via **GitHub Actions** and **Jenkins**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Performance & Load Testing](#performance--load-testing)
- [CI/CD Integration](#cicd-integration)
- [Reporting](#reporting)
- [Environment Variables](#environment-variables)
- [Code Quality](#code-quality)

---

## Overview

A full-stack test automation suite written in **strict TypeScript** (Playwright runs `.ts` natively — no build step). It demonstrates:

- **UI Automation** — browser end-to-end tests across 7 apps, with per-worker auth-state reuse.
- **API Testing** — REST validation through Playwright's `request` context and reusable service clients.
- **Performance Testing** — in-browser Web Vitals (FCP/LCP/TBT) and Navigation Timing, with budget gates.
- **Load Testing** — stress scenarios with **Artillery** (real browser per VU) and **k6** (API + browser).
- **Type Safety & Linting** — `tsc --noEmit` + `typescript-eslint` keep the suite clean.
- **CI/CD** — automated on-push and nightly pipelines on both **GitHub Actions** and **Jenkins**.

> **41 tests across 19 spec files**, all running on a single Chromium project against live practice sites.

---

## Tech Stack

| Tool | Version | Purpose |
| --- | --- | --- |
| [Playwright](https://playwright.dev) | `^1.59` | UI, API & performance testing |
| [TypeScript](https://www.typescriptlang.org) | `^6` | Strict, fully-typed test code |
| [typescript-eslint](https://typescript-eslint.io) | `^8` | Linting for `.ts` |
| [Artillery](https://www.artillery.io) | `^2` | Browser-based load testing |
| [k6](https://k6.io) | — | API & browser load testing (via esbuild bundle) |
| [Allure](https://allurereport.org) | `^3` | Rich test reporting |
| [ExcelJS](https://github.com/exceljs/exceljs) | `^4` | Excel upload/download test data |
| [esbuild](https://esbuild.github.io) / [tsx](https://github.com/privatenumber/tsx) | — | Bundle k6 `.ts`; run standalone TS scripts |
| Jenkins / GitHub Actions | — | CI/CD pipelines (nightly + on-push) |

---

## Architecture

Specs are thin: they **arrange** (via fixtures, page objects, and API clients) and **assert**. They never touch raw selectors, URLs, or credentials directly. Every common browser interaction is defined **once** in a central `PageActions` library.

```
tests/  ──  specs: arrange + assert only (no raw selectors / URLs / creds)
   │
   ├─►  fixtures/   inject per-app page objects + API clients  (test.extend<…>)
   │
   ├─►  pages/      Page Object Model — one class per screen; owns locators
   │      │           + intent-revealing actions, holds NO assertions
   │      │
   │      └─►  pages/actions.ts  ◄── central PageActions library
   │             every page object calls this.actions.* (fill / click / waitFor /
   │             selectOption / readTable / openInNewTab / …) instead of raw
   │             page.* — so common interactions live in ONE place
   │
   ├─►  api/        request-context service clients (EventHubApi, EcomApi) — seed state
   ├─►  mocks/      page.route stubs (empty-state / fixed-payload responses)
   └─►  config/     single source of test data — URLs, credentials, payloads per app
                      (credentials injected from env via utils/readProperties.ts)
```

**Key principles**

- **Central actions (`pages/actions.ts`).** A `PageActions` class groups every generic interaction — *navigation, form, wait, text, dialog, tab/window, table, file, frame*. `BasePage` exposes `this.actions`, so a selector or timing tweak for "fill", "click", or "read a table" changes one method, not 19 page objects.
- **Page objects hold no assertions.** Assertions live in specs, so one page object serves both success and failure tests.
- **Single source of test data.** `config/testData.ts` reads every `.properties`/JSON file once; credentials still resolve from the environment via `utils/readProperties.ts`.
- **Per-worker authentication.** EventHub logs in once per worker and reuses `storageState` (see `utils/auth.ts`) — a major speed-up and a common flakiness source removed.

---

## Project Structure

```
playwright-e2e-framework/
├── config/
│   └── testData.ts                   # single source of per-app data / URLs / credentials
├── api/
│   ├── eventHubApi.ts                # EventHub REST service client
│   └── ecomApi.ts                    # rahulshettyacademy /api/ecom service client
├── mocks/
│   ├── eventHubMocks.ts              # events-listing route stub
│   └── ecomMocks.ts                  # empty orders / products route stubs
├── fixtures/
│   ├── eventhub.fixtures.ts          # per-worker auth + EventHub page objects + api
│   ├── client.fixtures.ts            # RSA client page objects + EcomApi
│   ├── protocommerce.fixtures.ts     # ProtoCommerce page objects
│   └── practice.fixtures.ts          # AutomationPractice / datepicker / angular / upload pages
├── pages/
│   ├── actions.ts                    # ★ central PageActions — all common interactions
│   ├── base.page.ts                  # BasePage: exposes this.page + this.actions
│   ├── eventhub/  client/  protocommerce/
│   └── automationPractice/  datepicker/  angularPractice/  uploadDownload/
│                                     #   one folder per app, each with an index.ts barrel
├── utils/
│   ├── readProperties.ts             # low-level .properties parser (env-aware)
│   ├── auth.ts                       # EventHub per-worker storageState seeding
│   ├── links.ts                      # broken-link sweeper
│   └── perf.ts                       # percentile / summary stats for the perf benchmark
├── test-data/                        # raw data: .properties files + JSON payloads
├── tests/                            # Playwright specs (UI, API, performance) — *.spec.ts
├── artillery/  k6/  tools/           # load testing (Artillery + k6 bundled via esbuild)
├── infra/  docker-compose.yml        # self-hosted Jenkins / GH runner / Nginx + Allure
├── .github/workflows/                # GitHub Actions CI (hosted + self-hosted)
├── playwright.config.ts              # Playwright config (single chromium project, testIdAttribute)
├── playwright.service.config.ts      # optional Azure Playwright Workspaces (cloud parallel run)
├── tsconfig.json                     # strict type-checking config (tsc --noEmit)
├── eslint.config.js                  # typescript-eslint flat config
├── Jenkinsfile                       # Jenkins declarative pipeline
└── package.json
```

---

## Prerequisites

- **Node.js v24+** (the CI runs on Node 24)
- **npm v10+**
- For **k6** load tests: the `k6` binary at `./tools/k6`
- For **Jenkins** CI: Jenkins with the NodeJS plugin (tool named **`Node24`**) and SMTP for failure alerts

---

## Installation

```bash
# Clone
git clone https://github.com/ankit-at/playwright-e2e-framework.git
cd playwright-e2e-framework

# Install dependencies
npm ci

# Install the Chromium browser (with OS deps)
npx playwright install --with-deps chromium

# Configure credentials
cp .env.example .env   # then fill in the values (see Environment Variables)
```

---

## Running Tests

```bash
# Full suite
npm test                       # → npx playwright test

# Smoke only — the two most critical suites (API + booking auth)
npm run test:smoke

# A single spec
npx playwright test tests/webAPI.spec.ts

# Filter by title
npx playwright test -g "banner is visible"

# Pick a reporter
npx playwright test --reporter=html
npx playwright test --reporter=allure-playwright

# Type-check (no test run) and lint
npm run typecheck
npm run lint
```

---

## Performance & Load Testing

```bash
# Playwright in-browser performance benchmark (Web Vitals + budgets)
npm run perf

# Artillery — real Chromium per virtual user
npm run load:browser
npm run report:artillery results/artillery-out.json results/report.html   # build the HTML report

# k6 — bundled from TypeScript via esbuild, then executed
npm run load:k6            # API load test
npm run load:k6-browser   # browser load test (Chromium from your Playwright cache)
```

> **k6 + TypeScript:** k6 can't run `.ts` directly, so `build:k6` bundles `k6/*.ts` to `dist/k6/*.js` (esbuild, k6 modules externalised) before running. The `load:k6*` scripts do this automatically.
>
> **Note:** `load:k6-browser` sets `K6_BROWSER_EXECUTABLE_PATH` to the Playwright-managed Chromium. Update that path if your Playwright cache directory differs from the default macOS location.

---

## CI/CD Integration

### GitHub Actions

`.github/workflows/playwright.yml` runs on **push** (`main`, `feature/**`), **pull requests**, **nightly** (02:00 UTC), and **manual dispatch**.

- The main **`test`** job runs the suite on the **[Azure Playwright Workspaces](https://aka.ms/pww) cloud browser grid** (`--config=playwright.service.config.ts --workers=5`): it authenticates via `azure/login` (`AZURE_SECRET`) and connects through `PLAYWRIGHT_SERVICE_URL`, so no local browser install is needed in CI.
- Node 24, least-privilege `GITHUB_TOKEN` (`contents: read`), `NODE_OPTIONS=--disable-warning=DEP0040`.
- The HTML report is uploaded **only on success** — this repo is public, and traces/screenshots can capture credentials, so failure artifacts are deliberately not published (reproduce failures locally instead).
- A separate **`load-tests`** job runs the performance benchmark (with its own local Chromium) on **schedule / manual only**, so it never blocks a PR.

`.github/workflows/playwright-self-hosted.yml` is **manual-dispatch only** — it targets a `[self-hosted, linux, playwright]` runner; push/PR/schedule triggers were removed so jobs don't hang in `queued` until such a runner is registered.

### Jenkins

`Jenkinsfile` is a declarative pipeline (NodeJS tool **`Node24`**), with credentials scoped per stage:

| Stage | Trigger | Description |
| --- | --- | --- |
| Checkout | Always | Pull latest via SCM |
| Install | Always | `npm ci` + install Chromium |
| Test | Always | Full Playwright suite |
| Performance | Nightly / Manual | `performance.spec.ts` only |

Runs nightly at 2 AM (cron) and on demand. Post-build: JUnit XML published, HTML report archived per build, `test-results/**` saved, email on failure.

### Self-hosted runner (optional)

`docker-compose.yml` + `infra/nginx/` orchestrate Jenkins, a GitHub self-hosted runner, and an Nginx-served Allure site on a cloud VM. Register the runner with the `[self-hosted, linux, playwright]` labels so the self-hosted workflow above can target it. Set `GH_RUNNER_REPO`, `GH_RUNNER_TOKEN`, `GH_RUNNER_NAME`, `GH_RUNNER_LABELS` before `docker-compose up -d`.

### Azure Playwright Workspaces

`playwright.service.config.ts` wraps the base config to run tests on Microsoft's hosted browser grid for massive parallelism — this is what the CI `test` job above uses. To run against it locally, authenticate to Azure and pass the service config:

```bash
npx playwright test --config=playwright.service.config.ts
```

---

## Reporting

```bash
# Playwright HTML report (generated in playwright-report/)
npx playwright show-report

# Allure report
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

---

## Environment Variables

Credentials are **never committed** — the `.properties` files leave them blank and they are injected from the environment (a gitignored `.env` locally; GitHub Actions / Jenkins secrets in CI). Copy `.env.example` to `.env` and fill in:

| Variable | Used by |
| --- | --- |
| `RSA_EMAIL` / `RSA_PASSWORD` | rahulshettyacademy account — `/client` UI + API, EventHub, angular form, k6 |
| `PROTO_USER` / `PROTO_PASS` | ProtoCommerce loginpagePractise account (uibasic) |
| `YAHOO_EMAIL` / `YAHOO_PASSWORD` | EventHub booking persona (bookingAuth) |
| `GMAIL_EMAIL` / `GMAIL_PASSWORD` | EventHub booking persona (bookingAuth) |

At runtime `config/testData.ts` resolves these through `utils/readProperties.ts`; in Jenkins they are bound per-stage via the `credentials()` helper.

---

## Code Quality

```bash
npm run typecheck   # tsc --noEmit against tsconfig.json (strict)
npm run lint        # eslint . (typescript-eslint)
npm run lint:fix    # auto-fix
```

ESLint uses the **flat config** format in `eslint.config.js` (`typescript-eslint` recommended rules for `.ts`; the config file itself stays CommonJS `.js`).

---

## Branch Strategy

| Branch | Purpose |
| --- | --- |
| `main` | Default branch — stable, CI-gated |
| `feature/**` | Feature development (also CI-triggered on push) |
