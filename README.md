Playwright Practice Suite

[![Playwright Tests](https://github.com/ankit-at/playwright-e2e-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/ankit-at/playwright-e2e-framework/actions/workflows/playwright.yml)

A comprehensive end-to-end test automation framework built with Playwright, covering UI, API, and Performance testing — with full CI/CD integration via GitHub Actions and Jenkins.

📋 Table of Contents

Overview
Tech Stack
Architecture
Project Structure
Prerequisites
Installation
Running Tests
Performance & Load Testing
CI/CD Integration
Reporting
Environment Variables


Overview
This repository is a practice implementation of a full-stack test automation suite using Playwright. It demonstrates:

UI Automation — browser-based end-to-end tests with auth state reuse
API Testing — REST API validation using Playwright's request context
Performance Testing — in-browser performance metrics via Playwright
Load Testing — stress and load scenarios using Artillery and k6
Linting — ESLint configured for consistent code style
CI/CD — automated nightly and on-push pipelines using Jenkins and GitHub Actions


Tech Stack
ToolPurposePlaywright ^1.59.1UI, API & Performance testingArtillery ^2.0.32Browser-based load testingk6API & browser load testingAllure ^3.9.0Rich test reportingExcelJS ^4.4.0Test data managementESLint ^10.4.0Code lintingJenkinsCI/CD pipeline (nightly + on-demand)GitHub ActionsCI/CD pipeline

Architecture
The suite is organised into clean, single-responsibility layers. A spec wires
together page objects (UI), API service clients (state setup), and mocks (network
stubbing) — it never touches raw selectors, URLs, or credentials directly.

    spec  ─┬─►  fixtures/      inject page objects + api clients per app
           ├─►  pages/         Page Object Model — one class per screen, owns locators + actions (no assertions)
           ├─►  api/           request-context service clients (EventHubApi, EcomApi)
           ├─►  mocks/         page.route stubs (empty-state / fixed-payload responses)
           └─►  config/        single source of test data — URLs, credentials, payloads per app

Page objects hold **no assertions** — assertions live in specs, so one page object
serves both success and failure tests. Test data is read once in `config/testData.js`
(credentials still come from env via `utils/readProperties.js`), so the redundant
historical `.properties` keys are hidden behind one clean accessor.

Project Structure
playwright_practice/
├── config/
│   └── testData.js                    # single source of per-app data/URLs/credentials
├── api/
│   ├── eventHubApi.js                 # EventHub REST service client
│   └── ecomApi.js                     # rahulshettyacademy /api/ecom service client
├── mocks/
│   ├── eventHubMocks.js               # events-listing route stub
│   └── ecomMocks.js                   # empty orders / products route stubs
├── fixtures/
│   ├── eventhub.fixtures.js           # per-worker auth + EventHub page objects + api
│   ├── client.fixtures.js             # RSA client page objects + EcomApi
│   ├── protocommerce.fixtures.js      # ProtoCommerce page objects
│   └── practice.fixtures.js           # AutomationPractice / datepicker / angular / upload pages
├── pages/                             # Page Object Model (base.page.js + one folder per app, each with an index.js barrel)
│   ├── eventhub/  client/  protocommerce/
│   └── automationPractice/  datepicker/  angularPractice/  uploadDownload/
├── utils/
│   ├── readProperties.js              # low-level .properties parser (env-aware)
│   ├── auth.js                        # EventHub per-worker storageState seeding
│   ├── links.js                       # broken-link sweeper
│   └── perf.js                        # percentile / summary stats for the perf benchmark
├── test-data/                         # raw data: .properties files + JSON payloads
├── tests/                             # Playwright specs (UI, API, performance)
├── artillery/  k6/  tools/            # load testing (Artillery + k6)
├── .github/workflows/                 # GitHub Actions CI
├── auth.json  state.json              # saved storage state fixtures
├── playwright.config.js               # Playwright config (single chromium project, testIdAttribute)
├── jsconfig.json                      # type-checking config (checkJs)
├── eslint.config.js                   # ESLint flat config
├── Jenkinsfile                        # Jenkins declarative pipeline
└── package.json

Prerequisites

Node.js v20 or later
npm v8+
For k6 load tests: the k6 binary under ./tools/k6
For Jenkins CI: Jenkins with the NodeJS plugin (configured as Node20) and SMTP set up for email alerts


Installation
bash# Clone the repository
git clone https://github.com/ankit-at/playwright_practice.git
cd playwright_practice

# Checkout the active feature branch
git checkout feature/playwright-suite

# Install dependencies
npm ci

# Install Playwright browsers (Chromium only, with OS deps)
npx playwright install --with-deps chromium

Running Tests
Run the full test suite
bashnpm test
# Equivalent to: npx playwright test
Run smoke tests only
Executes the two most critical suites — API tests and booking auth tests:
bashnpm run test:smoke
Run with a specific reporter
bashnpx playwright test --reporter=html
npx playwright test --reporter=allure-playwright
Run a single spec file
bashnpx playwright test tests/webAPI.spec.js

Performance & Load Testing
Playwright Performance Tests
Runs in-browser performance checks and logs metrics to the console:
bashnpm run perf
Artillery Load Tests (browser-based)
bashnpm run load:browser
k6 Load Tests
API load test:
bashnpm run load:k6
Browser load test (uses Chromium from your Playwright cache):
bashnpm run load:k6-browser

Note: The load:k6-browser script sets K6_BROWSER_EXECUTABLE_PATH to the Playwright-managed Chromium binary. Update this path if your Playwright cache directory differs from the default macOS location.


CI/CD Integration
Jenkins Pipeline
The Jenkinsfile defines a declarative pipeline with the following stages:
StageTriggerDescriptionCheckoutAlwaysPulls the latest code via SCMInstallAlwaysnpm ci + installs Chromium browserTestAlwaysRuns the full Playwright test suitePerformanceNightly / ManualRuns performance.spec.js separately
The pipeline runs nightly at 2 AM via a cron trigger and can also be triggered manually.
Post-build actions:

JUnit XML results published to Jenkins
Playwright HTML report archived and linked to each build
Test artifacts (test-results/**) saved per build
Console echo on success; email notification on failure (requires SMTP configuration)

GitHub Actions
Workflow definitions live in .github/workflows/. Push to any branch or open a PR to trigger the CI run.

Remote / Self-hosted runner
Use a dedicated cloud VM (for example Hetzner 4 vCPU, 8GB RAM) to host Jenkins, a GitHub self-hosted runner, and Allure reports. This repo includes example orchestration in `docker-compose.yml` and an Nginx config in `infra/nginx/conf.d/allure.conf`.

- Run `docker-compose up -d jenkins nginx github-runner` on the remote host.
- Set the runner environment variables before startup: `GH_RUNNER_REPO`, `GH_RUNNER_TOKEN`, `GH_RUNNER_NAME`, and `GH_RUNNER_LABELS`.
- Register the GitHub runner with labels like `self-hosted`, `linux`, `playwright`.
- Use the new workflow at `.github/workflows/playwright-self-hosted.yml` for jobs that should execute on the remote runner.
- Generate the static Allure site from `allure-results` and expose it at `https://qa.yourdomain.com/allure` through Nginx.

Reporting
Playwright HTML Report
bashnpx playwright show-report
Generated in playwright-report/index.html after each run.
Allure Report
bashnpx allure generate allure-results --clean -o allure-report
npx allure open allure-report
Or using the npm script shorthand if configured:
bashnpx allure-commandline generate allure-results

Environment Variables
Credentials are never committed — the `.properties` files leave them blank and they
are injected from the environment (a gitignored `.env` locally, GitHub Actions /
Jenkins secrets in CI). Copy `.env.example` to `.env` and fill in:

| Variable | Used by |
| --- | --- |
| `RSA_EMAIL` / `RSA_PASSWORD` | rahulshettyacademy account — /client UI + API, EventHub, angular form, k6 |
| `PROTO_USER` / `PROTO_PASS` | ProtoCommerce loginpagePractise account (uibasic) |
| `YAHOO_EMAIL` / `YAHOO_PASSWORD` | EventHub booking persona (bookingAuth) |
| `GMAIL_EMAIL` / `GMAIL_PASSWORD` | EventHub booking persona (bookingAuth) |

In Jenkins these are injected via the `credentials()` binding; locally, `config/testData.js`
reads them through `utils/readProperties.js` when building each app's config.

Linting
bash# Check for lint errors
npm run lint

# Auto-fix fixable issues
npm run lint:fix
ESLint is configured via eslint.config.mjs using the flat config format.

Branch Strategy
BranchPurposefeature/playwright-suiteActive development branch (current default)main / masterStable releases
