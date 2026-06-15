import fs from "node:fs";
import path from "node:path";

type Stats = { p50: number | null; p95: number | null; min: number | null; max: number | null };

// Percentile via linear interpolation on a sorted copy.
/** @param p percentile in [0, 100] */
export function percentile(values: number[], p: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].filter((v) => v != null).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return Math.round(sorted[lo]);
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo));
}

export const median = (values: number[]): number | null => percentile(values, 50);

// samples: array of metric objects (values may be null). keys: metric names to
// summarize. returns { key: { p50, p95, min, max } }
export function summarize(
  samples: Array<Record<string, number | null>>,
  keys: string[],
): Record<string, Stats> {
  const out: Record<string, Stats> = {};
  for (const key of keys) {
    const vals = samples.map((s) => s[key]).filter((v): v is number => v != null);
    out[key] = {
      p50: percentile(vals, 50),
      p95: percentile(vals, 95),
      min: vals.length ? Math.round(Math.min(...vals)) : null,
      max: vals.length ? Math.round(Math.max(...vals)) : null,
    };
  }
  return out;
}

function ensureDir(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

export function writeJson(filePath: string, obj: unknown): void {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

// Append one row to a CSV trend file, writing the header if the file is new.
export function appendTrendCsv(filePath: string, row: Record<string, unknown>): void {
  ensureDir(filePath);
  const headers = Object.keys(row);
  const line = headers.map((h) => row[h]).join(",") + "\n";
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, headers.join(",") + "\n");
  }
  fs.appendFileSync(filePath, line);
}
