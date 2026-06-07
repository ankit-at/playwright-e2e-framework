const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    // Generated reports, build output, caches and skill assets — not source.
    ignores: [
      "node_modules/",
      "playwright-report/",
      "test-results/",
      "allure-report/",
      "allure-results/",
      "results/",
      ".npm-cache/",
      ".claude/",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs",
      // Tests run in Node, but page.evaluate() callbacks reference browser
      // APIs (performance, document, window, ...) in the same files.
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "no-console": "off",
    },
  },
  {
    // k6 load scripts: ES modules with k6-specific runtime globals.
    files: ["k6/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node,
        __ENV: "readonly",
        __VU: "readonly",
        __ITER: "readonly",
        open: "readonly",
      },
    },
  },
];
