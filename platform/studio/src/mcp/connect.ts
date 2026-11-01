import { randomUUID } from "node:crypto";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolListChangedNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ensureStudio } from "../../start.mjs";

/**
 * How an agent reaches the chalk MCP: its harness starts this over stdio (.mcp.json and the Cursor
 * and VS Code configs), and it relays every call to the studio service (main.ts), started through
 * platform/studio/start.mjs if nothing answers. So a fresh session can call the tools with nothing
 * started by hand, and there is still one service.
 *
 * - The service runs under `tsx watch` and restarts when its code changes. Its requests stand
 *   alone (no session to lose), so a restart between calls changes nothing here but the harness
 *   is told the tool list may have changed. A call cut off by a restart is sent again if it only
 *   looks; a write says it may or may not have been saved. A service not running is started.
 * - This agent gets an id, made once when this process starts and sent with every call
 *   (`x-chalk-agent`). The service keys the agent's page by it (app-driver.ts), so two agents
 *   with the same token never share a board. Every call draws its board from the start, so a
 *   restart loses nothing a call needs.
 * - The role comes from the token: CHALK_TOKEN (default chalk-dev-fixer). CHALK_NAME names the
 *   agent in threads. CHALK_MCP_URL points at another service (then nothing is started here).
 */

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

/** Which run of the service answers now (undefined: none does). */
async function bootNow(): Promise<string | undefined> {
  try {
    const res = await fetch(new URL("/health", URL_), { signal: AbortSignal.timeout(1000) });
    if (!res.ok) return undefined;
    return String(((await res.json()) as { boot?: unknown }).boot ?? "");
  } catch {
    return undefined;
  }
}

/** The studio service is up (platform/studio/start.mjs: the one way it is started); or the one given. */
async function ensureService(): Promise<void> {
  if (given !== undefined) return;
  await ensureStudio();
}

/**
 * The one connection to the service. Each request stands alone there (stateless, http.ts), so it
 * outlives the service restarting: nothing it holds can go stale.
 */
let connecting: Promise<Client> | undefined;
function current(): Promise<Client> {
  connecting ??= (async () => {
    await ensureService();
    const c = new Client({ name: "chalk-connect", version: "1" });
    await c.connect(
      new StreamableHTTPClientTransport(URL_, {
        requestInit: { headers },
        // When each call left here: the service sets it against when it arrived (call-log.ts).
        fetch: (url, init) =>
          fetch(url, {
            ...init,
            headers: {
              ...Object.fromEntries(new Headers(init?.headers)),
              "x-chalk-sent": String(Date.now()),
            },
          }),
      }),
    );
    return c;
  })().catch((e: unknown) => {
    connecting = undefined; // the next call tries again
    throw e;
  });
  return connecting;
}

const words = (e: unknown) =>
  String(e instanceof Error ? `${e.message} ${(e as { code?: unknown }).code ?? ""}` : e);
/** The call never reached the service: it isn't running. */
const isDown = (e: unknown) => /ECONNREFUSED|fetch failed/i.test(words(e));
/** The service went away during the call (it restarted). */
const isCutOff = (e: unknown) =>
  /ECONNRESET|socket hang up|terminated|other side closed/i.test(words(e));

/** The run of the service the last call saw: a new one may offer other tools. */
let lastBoot: string | undefined;

/**
 * Runs a call on the service. Not running: started, and the call sent again. Restarted during the
 * call: a call that only looks is sent again; a write may or may not have been done, so it says so.
 */
async function relay<T>(
  run: (c: Client, cutOff: AbortSignal) => Promise<T>,
  isSafe = true,
): Promise<T> {
  const c = await current();
  const boot = await bootNow();
  if (boot !== undefined && lastBoot !== undefined && boot !== lastBoot)
    void stdio.sendToolListChanged().catch(() => {});
  if (boot !== undefined) lastBoot = boot;
  // A call in flight when the service restarts would wait for an answer that never comes (the
  // connection dies quietly): watch which run of the service is up, and end the call when it changes.
  const watch = new AbortController();
  const timer = setInterval(() => {
    void bootNow().then((now) => {
      if (now !== undefined && boot !== undefined && now !== boot)
        watch.abort(new Error("terminated: the chalk MCP service restarted"));
    });
  }, 1000);
  try {
    return await run(c, watch.signal);
  } catch (e) {
    if (isDown(e)) {
      await ensureService();
      return run(c, new AbortController().signal);
    }
    if (isCutOff(e) || watch.signal.aborted) {
      if (isSafe) return relay(run, isSafe);
      throw new Error(
        "The chalk MCP service restarted during this call, so it may or may not have been saved: read the threads with `comments` before writing again.",
      );
    }
    throw e;
  } finally {
    clearInterval(timer);
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
    (c, cutOff) =>
      c.callTool(req.params, undefined, {
        signal: AbortSignal.any([extra.signal, cutOff]),
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
