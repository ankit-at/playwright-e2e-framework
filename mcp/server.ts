/**
 * MCP server that exposes THIS Playwright framework as tools.
 *
 * Lets any MCP client (Claude Code, Claude Desktop, …) discover and run the
 * suite without knowing the npm/playwright incantations: list tests, run a spec
 * or a title filter, run the smoke set, type-check, and lint.
 *
 * Launched over stdio (see .mcp.json):  npx tsx mcp/server.ts
 *
 * Implementation note: uses the low-level Server + raw JSON-Schema (rather than
 * McpServer/registerTool + zod) so it doesn't depend on a particular zod version.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolResult,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";

// The framework root is the parent of this mcp/ directory.
const PROJECT_ROOT = path.resolve(__dirname, "..");

const MINUTE = 60_000;
const MAX_OUTPUT = 12_000; // keep tool results readable — tail of the log

/**
 * Run a command (no shell — args are passed as an array, so untrusted strings
 * like a grep pattern can't inject) and resolve with a combined, truncated log.
 */
function run(cmd: string, args: string[], timeoutMs: number): Promise<string> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: PROJECT_ROOT, env: process.env });
    let out = "";
    const capture = (d: Buffer): void => {
      out += d.toString();
    };
    child.stdout.on("data", capture);
    child.stderr.on("data", capture);

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      out += `\n[timed out after ${Math.round(timeoutMs / MINUTE)}m]`;
    }, timeoutMs);

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve(`spawn error: ${err.message}`);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      const tail = out.length > MAX_OUTPUT ? "…(truncated)…\n" + out.slice(-MAX_OUTPUT) : out;
      resolve(`$ ${cmd} ${args.join(" ")}\n[exit ${code}]\n\n${tail}`);
    });
  });
}

const ok = (text: string): CallToolResult => ({ content: [{ type: "text", text }] });
const fail = (text: string): CallToolResult => ({ content: [{ type: "text", text }], isError: true });

const SPEC_RE = /^[A-Za-z0-9._-]+\.spec\.ts$/;

const TOOLS: Tool[] = [
  {
    name: "list_tests",
    description: "List every Playwright test in the suite (runs `playwright test --list`).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "run_tests",
    description:
      "Run Playwright tests. With no args runs the FULL suite (slow — hits live sites and " +
      "creates data). Narrow it with `spec` (a single file under tests/) and/or `grep` " +
      "(a test-title substring/regex). `headed` shows the browser.",
    inputSchema: {
      type: "object",
      properties: {
        spec: {
          type: "string",
          description: "A spec filename under tests/, e.g. \"webAPI.spec.ts\".",
        },
        grep: {
          type: "string",
          description: "Only run tests whose title matches this (passed to --grep).",
        },
        headed: { type: "boolean", description: "Run with a visible browser (default false)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "run_smoke",
    description: "Run the smoke suite (`npm run test:smoke` — the API + booking-auth specs).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "typecheck",
    description: "Type-check the project with `tsc --noEmit` (`npm run typecheck`).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "lint",
    description: "Lint the project with ESLint (`npm run lint`).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
];

const server = new Server(
  { name: "playwright-e2e-framework", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req): Promise<CallToolResult> => {
  const { name } = req.params;
  const args = (req.params.arguments ?? {}) as {
    spec?: string;
    grep?: string;
    headed?: boolean;
  };

  switch (name) {
    case "list_tests":
      return ok(await run("npx", ["playwright", "test", "--list"], 2 * MINUTE));

    case "run_tests": {
      const cmd = ["playwright", "test", "--reporter=line"];
      if (args.spec) {
        if (!SPEC_RE.test(args.spec)) {
          return fail(`Invalid spec name "${args.spec}". Expected something like webAPI.spec.ts`);
        }
        cmd.push(`tests/${args.spec}`);
      }
      if (args.grep) cmd.push("--grep", args.grep);
      if (args.headed) cmd.push("--headed");
      return ok(await run("npx", cmd, 10 * MINUTE));
    }

    case "run_smoke":
      return ok(await run("npm", ["run", "test:smoke"], 10 * MINUTE));

    case "typecheck":
      return ok(await run("npm", ["run", "typecheck"], 3 * MINUTE));

    case "lint":
      return ok(await run("npm", ["run", "lint"], 3 * MINUTE));

    default:
      return fail(`Unknown tool: ${name}`);
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Logs must go to stderr — stdout is the JSON-RPC channel.
  console.error("[playwright-e2e-framework MCP] ready");
}

main().catch((err) => {
  console.error("[playwright-e2e-framework MCP] fatal:", err);
  process.exit(1);
});
