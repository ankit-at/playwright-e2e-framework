// Minimal HTML report generator for Artillery JSON output.
// Artillery v2 removed `artillery report`; this fills the gap.
// Usage: node artillery/make-report.js results/artillery-out.json results/artillery-report.html
const fs = require("node:fs");

const [, , inPath, outPath] = process.argv;
const d = JSON.parse(fs.readFileSync(inPath, "utf8"));
const agg = d.aggregate || {};
const counters = agg.counters || {};
const summaries = agg.summaries || {};

const num = (n) => (n == null ? "-" : Math.round(n));
const shortKey = (k) =>
  k
    .replace("browser.page.", "")
    .replace("browser.step.", "step: ")
    .replace(/https?:\/\/[^/]+/, "");

const counterRows = Object.entries(counters)
  .map(([k, v]) => `<tr><td>${k}</td><td class="r">${v}</td></tr>`)
  .join("");

const summaryRows = Object.entries(summaries)
  .map(
    ([k, s]) =>
      `<tr><td>${shortKey(k)}</td><td class="r">${num(s.min)}</td><td class="r">${num(s.median)}</td><td class="r">${num(s.p95)}</td><td class="r">${num(s.p99)}</td><td class="r">${num(s.max)}</td></tr>`,
  )
  .join("");

const failed = counters["vusers.failed"] || 0;
const completed = counters["vusers.completed"] || 0;
const created = counters["vusers.created"] || 0;

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Artillery + Playwright Report</title>
<style>
body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;margin:32px;color:#1a1a1a;background:#fafafa}
h1{font-size:22px}h2{font-size:16px;margin-top:28px;border-bottom:2px solid #eee;padding-bottom:6px}
.cards{display:flex;gap:16px;flex-wrap:wrap;margin:16px 0}
.card{background:#fff;border:1px solid #e5e5e5;border-radius:10px;padding:14px 18px;min-width:130px}
.card .v{font-size:26px;font-weight:700}.card .l{color:#666;font-size:12px;text-transform:uppercase}
.ok{color:#16a34a}.bad{color:#dc2626}
table{border-collapse:collapse;width:100%;background:#fff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden}
th,td{padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:left}
th{background:#f7f7f7;font-weight:600}.r{text-align:right;font-variant-numeric:tabular-nums}
small{color:#888}
</style></head><body>
<h1>Artillery + Playwright — Browser Load Report</h1>
<small>Real Chromium per virtual user · source: ${inPath}</small>
<div class="cards">
  <div class="card"><div class="l">VUs created</div><div class="v">${created}</div></div>
  <div class="card"><div class="l">Completed</div><div class="v ok">${completed}</div></div>
  <div class="card"><div class="l">Failed</div><div class="v ${failed ? "bad" : "ok"}">${failed}</div></div>
  <div class="card"><div class="l">Logins OK</div><div class="v">${counters["login.success"] || 0}</div></div>
  <div class="card"><div class="l">HTTP 200</div><div class="v">${counters["browser.page.codes.200"] || 0}</div></div>
</div>
<h2>Timings (ms) — Web Vitals &amp; step durations</h2>
<table><thead><tr><th>metric</th><th class="r">min</th><th class="r">median</th><th class="r">p95</th><th class="r">p99</th><th class="r">max</th></tr></thead>
<tbody>${summaryRows}</tbody></table>
<h2>Counters</h2>
<table><thead><tr><th>name</th><th class="r">count</th></tr></thead><tbody>${counterRows}</tbody></table>
</body></html>`;

fs.writeFileSync(outPath, html);
console.log("Wrote", outPath, `(${html.length} bytes)`);
