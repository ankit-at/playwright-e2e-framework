const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const globals = require("globals");

module.exports = tseslint.config(
  {
    // Generated reports, build output, caches, legacy scratch dirs — not source.
    ignores: [
      "node_modules/",
      "dist/",
      "playwright-report/",
      "test-results/",
      "allure-report/",
      "allure-results/",
      "results/",
      ".npm-cache/",
      ".claude/",
      "jsPractice/",   // legacy scratch files, not part of the framework
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // TypeScript sources. Tests run in Node, but page.evaluate() callbacks reference
    // browser APIs (performance, document, ...). typescript-eslint disables no-undef
    // (the compiler handles it), and @types/k6 types the k6 globals (__ENV, ...).
    files: ["**/*.ts"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "no-console": "off",
      // Allow intentionally-unused params/vars when prefixed with `_` (e.g. the
      // positional vuContext the artillery engine passes but the flow ignores).
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // This flat-config file is itself CommonJS JavaScript — require() is intentional.
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
