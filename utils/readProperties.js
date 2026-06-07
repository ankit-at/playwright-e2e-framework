const fs = require("node:fs");
const path = require("node:path");

// Map of credential property key → environment variable name.
// Credentials are NEVER stored in the committed .properties files — those keys are
// left blank. The real values come from the environment: a gitignored .env file
// locally, or GitHub Actions / Jenkins secrets in CI. See .env.example for the list.
/** @type {Record<string, string>} */
const ENV_OVERRIDES = {
  // events.properties — EventHub account
  email: "RSA_EMAIL",
  password: "RSA_PASSWORD",
  email1: "RSA_EMAIL",
  password1: "RSA_PASSWORD",
  // newlogin.properties — rahulshettyacademy /client account
  validUsername1: "RSA_EMAIL",
  validPassword1: "RSA_PASSWORD",
  // angular.properties — practice form (same rahulshettyacademy login)
  angemail: "RSA_EMAIL",
  angpassword: "RSA_PASSWORD",
  // login.properties — ProtoCommerce loginpagePractise account
  validUsername: "PROTO_USER",
  validPassword: "PROTO_PASS",
};

/**
 * Parse a `.properties` file into a key→value map, substituting credential keys
 * with their environment-variable values (see ENV_OVERRIDES).
 * @param {string} filePath path to the `.properties` file (relative to cwd)
 * @returns {Record<string, string>} resolved property map
 */
function readProperties(filePath) {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, "utf8");

  const properties = content
    .split(/\r?\n/)
    .reduce((/** @type {Record<string, string>} */ properties, line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        return properties;
      }

      const separatorIndex = trimmedLine.indexOf("=");

      if (separatorIndex === -1) {
        return properties;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const value = trimmedLine.slice(separatorIndex + 1).trim();

      const envVar = ENV_OVERRIDES[key];
      properties[key] = (envVar && process.env[envVar]) || value;

      return properties;
    }, /** @type {Record<string, string>} */ ({}));

  // loginPayLoad used to embed the credentials as literal JSON. Rebuild it from the
  // resolved (env-backed) username/password so the secret never lives in the file.
  if ("loginPayLoad" in properties && "validUsername1" in properties) {
    properties.loginPayLoad = JSON.stringify({
      userEmail: properties.validUsername1,
      userPassword: properties.validPassword1,
    });
  }

  return properties;
}

module.exports = { readProperties };
