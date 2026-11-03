import { type ChildProcess, spawn } from "node:child_process";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { jugnuEndpoint, pipelineEndpoint, reviewEndpoint } from "../dev-endpoints";
import { findUp } from "../find-up";
import { poolState, previewBase, timing, warmPages } from "./app-driver";
import { logCall } from "./call-log";
import { mcpMiddleware } from "./http";

/**
 * The studio service: everything authoring runs here, in one process, so studio code runs one way
 * (under tsx, as pnpm check runs it). Started only through platform/studio/start.mjs, by whoever
 * needs it (the editor, an agent's connection, the dev server, `pnpm dev`).
 *
 * - /dev-review and /dev-pipeline: threads, approvals and plan state (dev-endpoints.ts), reached by
 *   the editor and the preview through the dev server, which passes /dev-* on.
 * - /mcp: the chalk MCP's tools, for agents.
 * - On start, the dev server (the app and its preview pages) is made sure of, and the content
 *   rebuild on save runs as a child process (in this process, every saved lesson would restart it).
 *
 * Where it listens and who may connect are settings, so it runs on a laptop now and a server later:
 *
 * - CHALK_MCP_HOST: the address to listen on. Default 127.0.0.1, this machine's loopback, which
 *   nothing on the network can reach.
 * - CHALK_MCP_PORT: default 5174.
 * - CHALK_MCP_ALLOW: who may connect (http.ts). Default this machine only.
 * - CHALK_TOKENS: which token gives which role (http.ts).
 */

const PORT = Number(process.env.CHALK_MCP_PORT ?? 5174);
const HOST = process.env.CHALK_MCP_HOST ?? "127.0.0.1";

const ROOT = dirname(findUp("pnpm-workspace.yaml", dirname(fileURLToPath(import.meta.url))));
const mcp = mcpMiddleware(ROOT);
/** This run of the service: a relay with a call in flight sees it change when the service restarts. */
const BOOT = `${process.pid}:${Date.now()}`;
const server = createServer((req, res) => {
  const path = (req.url ?? "").split("?")[0];
  if (path === "/health") {
    res.setHeader("content-type", "application/json");
    const answer = { ok: true, service: "chalk-studio", boot: BOOT, pool: poolState() };
    // ?app: the dev server too (started again if it stopped), for whoever needs the app's pages.
    if (!(req.url ?? "").includes("app")) return void res.end(JSON.stringify(answer));
    previewBase(ROOT).then(
      (app) => res.end(JSON.stringify({ ...answer, app })),
      (error: unknown) => {
        res.statusCode = 503;
        res.end(JSON.stringify({ ok: false, error: String(error) }));
      },
    );
    return;
  }
  // /dev-timing: where drawings' time goes, phase by phase (app-driver.ts `timing`). `?on` starts
  // measuring from nothing; plain, the seconds per phase since then; `?off` stops.
  if (path === "/dev-timing") {
    const q = req.url ?? "";
    if (q.includes("on")) {
      timing.isOn = true;
      timing.spent.clear();
    }
    if (q.includes("off")) timing.isOn = false;
    res.setHeader("content-type", "application/json");
    const spent = [...timing.spent].sort((a, b) => b[1] - a[1]);
    res.end(JSON.stringify({ isOn: timing.isOn, seconds: Object.fromEntries(spent) }));
    return;
  }
  if (path?.startsWith("/dev-")) logCall(ROOT, req, res, { kind: "dev", path: req.url ?? path });
  if (path?.startsWith("/dev-review")) {
    void reviewEndpoint(ROOT, req, res);
    return;
  }
  if (path?.startsWith("/dev-pipeline")) {
    void pipelineEndpoint(ROOT, req, res);
    return;
  }
  if (path?.startsWith("/dev-jugnu")) {
    void jugnuEndpoint(req, res);
    return;
  }
  if (path !== "/mcp") {
    res.statusCode = 404;
    res.end("The chalk MCP is at /mcp.");
    return;
  }
  mcp.handle(req, res).catch((error: unknown) => {
    if (res.headersSent) return;
    res.statusCode = 500;
    res.end(String(error instanceof Error ? error.message : error));
  });
});

server.on("error", (error: NodeJS.ErrnoException) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `Port ${PORT} is taken: the studio service is probably running already (or set CHALK_MCP_PORT).`
      : String(error),
  );
  process.exit(1);
});

/** Rebuilds content on save, for open previews: a child, so a lesson's save doesn't restart this. */
function startRebuild(): ChildProcess {
  const studio = join(ROOT, "platform", "studio");
  return spawn(
    join(studio, "node_modules", ".bin", "tsx"),
    [
      "--tsconfig",
      "../../tsconfig.base.json",
      "--import",
      "./src/content/record-imports.ts",
      "src/content/cli.ts",
      "preview",
    ],
    {
      cwd: studio,
      // Its stdin is a pipe from this process: when this one goes, it closes, and the builder
      // stops (cli.ts), so a restart never leaves one behind.
      stdio: ["pipe", "inherit", "inherit"],
      env: { ...process.env, CHALK_BUILDER_OF_SERVICE: "1" },
    },
  );
}

let rebuild: ChildProcess | undefined;
server.listen(PORT, HOST, () => {
  console.error(`studio service on http://${HOST}:${PORT} (the chalk MCP at /mcp)`);
  rebuild = startRebuild();
  // The app and its preview pages: the person's editor and show need them.
  // Pages loaded with it, so an agent's first look doesn't wait for the app to load.
  warmPages(ROOT).catch((error: unknown) => console.error(String(error)));
});

const stop = () => {
  if (rebuild !== undefined && rebuild.exitCode === null) rebuild.kill();
  server.close();
  void mcp.close().finally(() => process.exit(0));
};
for (const signal of ["SIGTERM", "SIGINT", "SIGHUP"] as const) process.on(signal, stop);
