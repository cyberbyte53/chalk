// @ts-check
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The one way the studio service is started (platform/studio/src/mcp/main.ts: threads, approvals,
 * the content rebuild, the chalk MCP). Whoever needs it calls `ensureStudio()`: the dev server when
 * a page asks for threads, an agent's connection (connect.ts), `pnpm dev`. Plain JavaScript, so Node
 * runs it as it is from any of them.
 *
 * - Up: nothing to do.
 * - Restarting (its code changed): waits for it; never starts a second.
 * - Not running: starts it, detached, under `tsx watch` (it restarts itself when its code changes),
 *   its output in node_modules/.cache/chalk-studio.log, and waits for it.
 * - Can't come up (an error in its code): says so, with the last lines of its log.
 *
 * `node platform/studio/start.mjs` does the same from a shell.
 */

const studio = dirname(fileURLToPath(import.meta.url));
const root = join(studio, "..", "..");
export const STUDIO_URL = `http://127.0.0.1:${process.env.CHALK_MCP_PORT ?? 5174}`;
const cache = join(root, "node_modules", ".cache");
const PID_FILE = join(cache, "chalk-studio.pid");
const LOG_FILE = join(cache, "chalk-studio.log");

async function isUp() {
  try {
    const res = await fetch(`${STUDIO_URL}/health`, { signal: AbortSignal.timeout(1000) });
    return res.ok;
  } catch {
    return false;
  }
}

/** Whether a service this machine started is still running (restarting counts: tsx watch lives). */
function isStarted() {
  try {
    const pid = Number(readFileSync(PID_FILE, "utf8"));
    if (!Number.isInteger(pid) || pid <= 0) return false;
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function start() {
  mkdirSync(cache, { recursive: true });
  const out = openSync(LOG_FILE, "a");
  const child = spawn(
    join(studio, "node_modules", ".bin", "tsx"),
    // Every studio file, not only those it loaded: a crash while loading one would leave that one
    // unwatched, and fixing it wouldn't restart the service.
    [
      "watch",
      "--clear-screen=false",
      "--include",
      "src/**/*.ts",
      "--tsconfig",
      "../../tsconfig.base.json",
      "src/mcp/main.ts",
    ],
    { cwd: studio, detached: true, stdio: ["ignore", out, out], env: process.env },
  );
  if (child.pid !== undefined) writeFileSync(PID_FILE, String(child.pid));
  child.unref();
}

const lastLines = () => {
  if (!existsSync(LOG_FILE)) return "(no log yet)";
  return readFileSync(LOG_FILE, "utf8").trimEnd().split("\n").slice(-12).join("\n");
};

/** The studio service is up, started if it wasn't; throws with its log when it can't come up. */
export async function ensureStudio() {
  if (await isUp()) return STUDIO_URL;
  if (!isStarted()) start();
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isUp()) return STUDIO_URL;
  }
  throw new Error(
    `The studio service didn't come up at ${STUDIO_URL}. The end of its log (${LOG_FILE}):\n${lastLines()}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url))
  ensureStudio().then(
    (url) => console.log(`studio service up at ${url}`),
    (error) => {
      console.error(String(error instanceof Error ? error.message : error));
      process.exit(1);
    },
  );
