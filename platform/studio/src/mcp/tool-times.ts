import { existsSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { checkLogFile } from "../check/shared";
import { findUp } from "../find-up";
import { callLogFile } from "./call-log";

/**
 * How the chalk tools have been doing, from every call the service logged (call-log.ts): per tool
 * (and per /dev-* request), how many calls, how long they took, how long the service's thread was
 * held while they waited, how big their answers were; then the slowest calls, each with what it
 * was asked. Then `pnpm check`'s runs (check/all.ts): each step's time, and the slowest test files.
 *
 *   pnpm tool-times                 the last 24 hours
 *   pnpm tool-times --since 2h      the last two hours (m, h, d)
 *   pnpm tool-times --slow 20       the 20 slowest calls (default 10)
 */

type Line = {
  at: string;
  tool?: string;
  dev?: string;
  who?: string;
  args?: string;
  ms: number;
  queuedMs?: number;
  blockedMs: number;
  bytes: number;
  textChars?: number;
  images?: number;
  isError?: boolean;
};

/** An answer this long in words doesn't reach an agent whole (seen: 87,000 characters didn't). */
const TOO_LONG = 60_000;

const root = dirname(findUp("pnpm-workspace.yaml", dirname(fileURLToPath(import.meta.url))));
const args = process.argv.slice(2);
const option = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const since = (() => {
  const given = option("since") ?? "24h";
  const m = /^(\d+)([mhd])$/.exec(given);
  if (m === null) throw new Error(`--since takes 30m, 2h or 1d, not "${given}"`);
  return Date.now() - Number(m[1]) * { m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2] as "m"];
})();
const slowest = Number(option("slow") ?? 10);

const file = callLogFile(root);
const lines = (existsSync(file) ? readFileSync(file, "utf8") : "")
  .split("\n")
  .filter((l) => l !== "")
  .map((l) => JSON.parse(l) as Line)
  .filter((l) => Date.parse(l.at) >= since);

const q = (xs: number[], p: number) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))] ?? 0;
};
const sec = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
const kc = (n: number) => `${(n / 1000).toFixed(1)}k`;

const groups = new Map<string, Line[]>();
for (const l of lines) {
  const name = l.tool ?? `${(l.dev ?? "?").split("?")[0]}`;
  groups.set(name, [...(groups.get(name) ?? []), l]);
}
console.log(`${lines.length} calls since ${new Date(since).toLocaleString()}`);
console.log(
  "what                calls   median     p90     max  held max  words median/max  pictures  too long  errors",
);
for (const [name, ls] of [...groups].sort((a, b) => b[1].length - a[1].length)) {
  const ms = ls.map((l) => l.ms);
  const words = ls.map((l) => l.textChars ?? 0);
  const pictures = ls.reduce((n, l) => n + (l.images ?? 0), 0);
  console.log(
    [
      name.padEnd(18),
      String(ls.length).padStart(6),
      sec(q(ms, 0.5)).padStart(8),
      sec(q(ms, 0.9)).padStart(7),
      sec(Math.max(...ms)).padStart(7),
      sec(Math.max(...ls.map((l) => l.blockedMs))).padStart(9),
      `${kc(q(words, 0.5))}/${kc(Math.max(...words))}`.padStart(18),
      String(pictures).padStart(9),
      String(words.filter((w) => w > TOO_LONG).length).padStart(9),
      String(ls.filter((l) => l.isError).length).padStart(7),
    ].join(" "),
  );
}
console.log(`\nslowest ${slowest}:`);
for (const l of [...lines].sort((a, b) => b.ms - a.ms).slice(0, slowest))
  console.log(
    `${sec(l.ms).padStart(7)}  ${new Date(l.at).toLocaleTimeString()}  ${l.tool ?? l.dev}  ${l.who ?? ""}  held ${sec(l.blockedMs)}${l.queuedMs !== undefined ? `, on the way ${sec(l.queuedMs)}` : ""}  ${l.args ?? ""}`,
  );

type CheckRun = {
  at: string;
  ms: number;
  failed?: string;
  steps: Record<string, number>;
  testsRun: number;
  slowestTest?: { file: string; ms: number };
};

const checkFile = checkLogFile(root);
const runs = (existsSync(checkFile) ? readFileSync(checkFile, "utf8") : "")
  .split("\n")
  .filter((l) => l !== "")
  .map((l) => JSON.parse(l) as CheckRun)
  .filter((r) => Date.parse(r.at) >= since && !Array.isArray(r.steps));
console.log(
  `\npnpm check: ${runs.length} runs, median ${sec(
    q(
      runs.map((r) => r.ms),
      0.5,
    ),
  )}, max ${sec(Math.max(0, ...runs.map((r) => r.ms)))}, ${runs.filter((r) => r.failed !== undefined).length} failed`,
);
if (runs.length > 0) {
  console.log("step                 median     max");
  for (const name of [...new Set(runs.flatMap((r) => Object.keys(r.steps)))]) {
    const ms = runs.flatMap((r) => (r.steps[name] === undefined ? [] : [r.steps[name] as number]));
    console.log(
      `${name.padEnd(18)} ${sec(q(ms, 0.5)).padStart(8)} ${sec(Math.max(...ms)).padStart(7)}`,
    );
  }
  // The test file that was slowest in each run: the one to look at when the tests step is slow.
  console.log("\nslowest test file, per run:");
  for (const r of [...runs]
    .sort((a, b) => (b.slowestTest?.ms ?? 0) - (a.slowestTest?.ms ?? 0))
    .slice(0, slowest))
    if (r.slowestTest !== undefined)
      console.log(
        `${sec(r.slowestTest.ms).padStart(7)}  ${new Date(r.at).toLocaleTimeString()}  ${r.testsRun} run  ${r.slowestTest.file}`,
      );
}
