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
async function relay<T>(
  run: (c: Client, cutOff: AbortSignal) => Promise<T>,
  isSafe = true,
): Promise<T> {
  const c = await current();
  // A call in flight when the service restarts would wait for an answer that never comes (the
  // connection dies quietly): watch which run of the service is up, and end the call when it
  // changes, so it is sent again (or, for a write, said so).
  const watch = new AbortController();
  const boot = await bootNow();
  const timer = setInterval(() => {
    void bootNow().then((now) => {
      if (now !== undefined && now !== boot)
        watch.abort(new Error("terminated: the chalk MCP service restarted"));
    });
  }, 1000);
  try {
    return await run(c, watch.signal);
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
    return run(fresh, new AbortController().signal);
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
