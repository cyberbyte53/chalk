import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolListChangedNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { findUp } from "../pronunciations";

/**
 * How an agent reaches the chalk MCP: its harness starts this over stdio (.mcp.json and the Cursor
 * and VS Code configs), and it relays every call to the one chalk MCP service (main.ts), starting
 * that service if nothing answers. So a fresh session can call the tools with nothing started by
 * hand, and there is still one service.
 *
 * - The service runs under `tsx watch` and restarts when its code changes. A call that finds it
 *   gone (restarting, or a new session it doesn't know) connects again and is sent again, so a
 *   restart is invisible here. The tool list is fetched again, and the harness told it changed.
 * - This agent gets an id, made once when this process starts and sent with every call
 *   (`x-chalk-agent`). The service keys the agent's page by it (app-driver.ts), so two agents
 *   with the same token never share a board, and the page survives a reconnect. After a restart
 *   the page is gone, so `continue` fails, saying why.
 * - The role comes from the token: CHALK_TOKEN (default chalk-dev-fixer). CHALK_NAME names the
 *   agent in threads. CHALK_MCP_URL points at another service (then nothing is started here).
 */

const root = dirname(findUp("pnpm-workspace.yaml", dirname(fileURLToPath(import.meta.url))));
const given = process.env.CHALK_MCP_URL;
const URL_ = new URL(given ?? `http://127.0.0.1:${process.env.CHALK_MCP_PORT ?? 5174}/mcp`);
const TOKEN = process.env.CHALK_TOKEN ?? "chalk-dev-fixer";
const AGENT = randomUUID();
const headers: Record<string, string> = {
  authorization: `Bearer ${TOKEN}`,
  "x-chalk-agent": AGENT,
  ...(process.env.CHALK_NAME ? { "x-chalk-name": process.env.CHALK_NAME } : {}),
};

const log = (...words: unknown[]) => console.error("[chalk connect]", ...words);

async function isUp(): Promise<boolean> {
  try {
    const res = await fetch(new URL("/health", URL_), { signal: AbortSignal.timeout(1000) });
    return res.ok;
  } catch {
    return false;
  }
}

const CACHE = join(root, "node_modules", ".cache");
/** The process id of the service this machine started (its tsx watch), so it's started once. */
const PID_FILE = join(CACHE, "chalk-mcp.pid");

/** Whether a service started here is still running (restarting counts: tsx watch is alive). */
function isStarted(): boolean {
  try {
    const pid = Number(readFileSync(PID_FILE, "utf8"));
    if (!Number.isInteger(pid) || pid <= 0) return false;
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/** Starts the service (under tsx watch), detached, its output in node_modules/.cache/chalk-mcp.log. */
function startService(): void {
  const studio = join(root, "platform", "studio");
  mkdirSync(CACHE, { recursive: true });
  const out = openSync(join(CACHE, "chalk-mcp.log"), "a");
  const child = spawn(
    join(studio, "node_modules", ".bin", "tsx"),
    ["watch", "--clear-screen=false", "--tsconfig", "../../tsconfig.base.json", "src/mcp/main.ts"],
    { cwd: studio, detached: true, stdio: ["ignore", out, out], env: process.env },
  );
  if (child.pid !== undefined) writeFileSync(PID_FILE, String(child.pid));
  child.unref();
}

/** Waits for the service, starting it once if nothing answers (and this isn't pointed elsewhere). */
async function ensureService(): Promise<void> {
  if (await isUp()) return;
  // A service that is restarting (its code changed) is back in a moment: never start a second.
  if (given === undefined && !isStarted()) {
    for (let i = 0; i < 6 && !(await isUp()); i++) await new Promise((r) => setTimeout(r, 500));
    if (!(await isUp()) && !isStarted()) {
      log("starting the chalk MCP service");
      startService();
    }
  }
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isUp()) return;
  }
  throw new Error(
    `The chalk MCP service didn't answer at ${URL_.origin} (see node_modules/.cache/chalk-mcp.log, or run \`pnpm mcp\`).`,
  );
}

let client: Client | undefined;
let connecting: Promise<Client> | undefined;

async function connect(): Promise<Client> {
  await ensureService();
  const c = new Client({ name: "chalk-connect", version: "1" });
  await c.connect(new StreamableHTTPClientTransport(URL_, { requestInit: { headers } }));
  c.setNotificationHandler(ToolListChangedNotificationSchema, async () => {
    await stdio.sendToolListChanged().catch(() => {});
  });
  return c;
}

function current(): Promise<Client> {
  if (client !== undefined) return Promise.resolve(client);
  connecting ??= connect().then(
    (c) => {
      client = c;
      connecting = undefined;
      return c;
    },
    (e: unknown) => {
      connecting = undefined;
      throw e;
    },
  );
  return connecting;
}

const words = (e: unknown) =>
  String(e instanceof Error ? `${e.message} ${(e as { code?: unknown }).code ?? ""}` : e);
/** The call never reached the service (it was down, or doesn't know this session). */
const isUnreached = (e: unknown) =>
  /ECONNREFUSED|fetch failed|session|404|not connected/i.test(words(e));
/** The service went away during the call (it restarted). */
const isCutOff = (e: unknown) =>
  /ECONNRESET|socket hang up|terminated|other side closed/i.test(words(e));

/**
 * Runs a call on the service; if the service has gone, connects again and runs it once more. A
 * call that may have been carried out before the service went (`isSafe` false: a write) is only
 * sent again if it never reached it.
 */
async function relay<T>(run: (c: Client) => Promise<T>, isSafe = true): Promise<T> {
  const c = await current();
  try {
    return await run(c);
  } catch (e) {
    if (!(isUnreached(e) || (isSafe && isCutOff(e)))) {
      if (isCutOff(e)) {
        if (client === c) client = undefined;
        throw new Error(
          "The chalk MCP service restarted during this call, so it may or may not have been saved: read the threads with `comments` before writing again.",
        );
      }
      throw e;
    }
    if (client === c) client = undefined;
    await c.close().catch(() => {});
    const fresh = await current();
    void stdio.sendToolListChanged().catch(() => {});
    return run(fresh);
  }
}

const stdio = new Server(
  { name: "chalk", version: "1" },
  { capabilities: { tools: { listChanged: true } } },
);

stdio.setRequestHandler(ListToolsRequestSchema, async (req) =>
  relay((c) => c.listTools(req.params)),
);

stdio.setRequestHandler(CallToolRequestSchema, async (req, extra) => {
  const token = req.params._meta?.progressToken;
  // Writing a thread isn't sent twice; looking is.
  const isSafe = req.params.name !== "comment";
  return relay(
    (c) =>
      c.callTool(req.params, undefined, {
        signal: extra.signal,
        timeout: 30 * 60 * 1000,
        resetTimeoutOnProgress: true,
        ...(token === undefined
          ? {}
          : {
              onprogress: (p) => {
                void extra.sendNotification({
                  method: "notifications/progress",
                  params: { ...p, progressToken: token },
                });
              },
            }),
      }),
    isSafe,
  );
});

await stdio.connect(new StdioServerTransport());
// Connect now, so the service is up by the first call.
current().catch((e: unknown) => log(String(e instanceof Error ? e.message : e)));
