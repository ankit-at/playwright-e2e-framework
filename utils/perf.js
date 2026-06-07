// @ts-check
const fs = require("node:fs");
const path = require("node:path");

// Percentile via linear interpolation on a sorted copy.
/**
 * @param {number[]} values
 * @param {number} p percentile in [0, 100]
 * @returns {number | null}
 */
function percentile(values, p) {
  if (!values.length) return null;
  const sorted = [...values].filter((v) => v != null).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return Math.round(sorted[lo]);
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo));
}

/** @param {number[]} values */
const median = (values) => percentile(values, 50);

// samples: array of metric objects. keys: metric names to summarize.
// returns { key: { p50, p95, min, max } }
/**
 * @param {Array<Record<string, number>>} samples
 * @param {string[]} keys
 * @returns {Record<string, { p50: number | null, p95: number | null, min: number | null, max: number | null }>}
 */
function summarize(samples, keys) {
  /** @type {Record<string, { p50: number | null, p95: number | null, min: number | null, max: number | null }>} */
  const out = {};
  for (const key of keys) {
    const vals = samples.map((s) => s[key]).filter((v) => v != null);
    out[key] = {
      p50: percentile(vals, 50),
      p95: percentile(vals, 95),
      min: vals.length ? Math.round(Math.min(...vals)) : null,
      max: vals.length ? Math.round(Math.max(...vals)) : null,
    };
  }
  return out;
}

/** @param {string} filePath */
function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

/**
 * @param {string} filePath
 * @param {unknown} obj
 */
function writeJson(filePath, obj) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

// Append one row to a CSV trend file, writing the header if the file is new.
/**
 * @param {string} filePath
 * @param {Record<string, unknown>} row
 */
function appendTrendCsv(filePath, row) {
  ensureDir(filePath);
  const headers = Object.keys(row);
  const line = headers.map((h) => row[h]).join(",") + "\n";
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, headers.join(",") + "\n");
  }
  fs.appendFileSync(filePath, line);
}

module.exports = { percentile, median, summarize, writeJson, appendTrendCsv };
