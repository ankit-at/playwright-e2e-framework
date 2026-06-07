// @ts-check
//
// Central test-data / configuration — the single source of truth for every app
// under test. Each `.properties` file is read ONCE here (via the env-aware
// utils/readProperties.js parser, so credentials still come from RSA_EMAIL/etc.
// and never from the committed files) and exposed as a structured, frozen object.
//
// Specs and page objects import from here instead of calling readProperties or
// defining their own getData() helpers. This hides the historical redundant keys
// (events appURL/appURL1, newlogin appUrl1/appUrl2, …) behind one clean accessor.
//
const { readProperties } = require("../utils/readProperties");

const events = readProperties("test-data/events.properties");
const newlogin = readProperties("test-data/newlogin.properties");
const login = readProperties("test-data/login.properties");
const datepickerProps = readProperties("test-data/datepicker.properties");
const angularProps = readProperties("test-data/angular.properties");
const personas = require("../test-data/eventUsers.json");

/** Resolve an env var with a fallback (for the booking personas). */
const env = (/** @type {string} */ name, /** @type {string} */ fallback) =>
  process.env[name] || fallback;

// ── EventHub (https://eventhub.rahulshettyacademy.com) ───────────────────────────
const eventhub = Object.freeze({
  baseURL: events.appURL,
  apiURL: events.apiURL,
  credentials: Object.freeze({ email: events.email, password: events.password }),
  // Booking personas — non-secret fields from JSON, credentials from env.
  personas: Object.freeze({
    yahoo: Object.freeze({
      ...personas.yahoo,
      email: env("YAHOO_EMAIL", personas.yahoo.email),
      password: env("YAHOO_PASSWORD", personas.yahoo.password),
    }),
    gmail: Object.freeze({
      ...personas.gmail,
      email: env("GMAIL_EMAIL", personas.gmail.email),
      password: env("GMAIL_PASSWORD", personas.gmail.password),
    }),
  }),
});

// ── RSA client e-commerce (https://rahulshettyacademy.com/client/) ───────────────
const client = Object.freeze({
  baseURL: newlogin.appUrl1,
  // The REST API is served from the rahulshettyacademy.com root (…/api/ecom/…).
  apiBaseURL: newlogin.appUrl2,
  credentials: Object.freeze({ email: newlogin.validUsername1, password: newlogin.validPassword1 }),
  loginPayload: newlogin.loginPayLoad,
  productName: newlogin.productName,
  country: newlogin.country,
  invalid: Object.freeze({
    email: newlogin.invalidUsername1,
    password: newlogin.invalidPassword1,
    errorMessage: newlogin.invalidErrorMessage,
  }),
});

// ── ProtoCommerce loginpagePractise ──────────────────────────────────────────────
const protocommerce = Object.freeze({
  baseURL: login.appUrl,
  credentials: Object.freeze({ username: login.validUsername, password: login.validPassword }),
  dashboardTitle: login.dashboardTitle,
  invalid: Object.freeze({
    username: login.invalidUsername,
    password: login.invalidPassword,
    errorMessage: login.invalidErrorMessage,
  }),
});

// ── RSA AutomationPractice (kitchen-sink widgets) ────────────────────────────────
const automationPractice = Object.freeze({
  baseURL: events.appURL2,
});

// ── react-date-picker (seleniumPractise/#/offers) ────────────────────────────────
const datepicker = Object.freeze({
  baseURL: datepickerProps.appUrl,
  date: Object.freeze({
    day: datepickerProps.day,
    month: datepickerProps.month,
    year: datepickerProps.year,
  }),
});

// ── Angular practice form (angularpractice) ──────────────────────────────────────
const angularForm = Object.freeze({
  baseURL: angularProps.angappUrl,
  successMessage: angularProps.successMessage,
  form: Object.freeze({
    name: angularProps.angname,
    email: angularProps.angemail,
    password: angularProps.angpassword,
    gender: angularProps.anggender,
    birthday: angularProps.birthday,
  }),
});

// ── Upload/Download practice (static URL, no .properties file) ───────────────────
const uploadDownload = Object.freeze({
  baseURL: "https://rahulshettyacademy.com/upload-download-test/index.html",
});

module.exports = {
  eventhub,
  client,
  protocommerce,
  automationPractice,
  datepicker,
  angularForm,
  uploadDownload,
};
