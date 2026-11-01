import { appendFileSync, mkdirSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { dirname, join } from "node:path";

/**
 * Every call the service answers, timed, so what is slow is seen, not guessed: each tool call
 * (who, which tool, what it was asked) and each /dev-* request (the editor's, the preview's), one
 * JSON line each in node_modules/.cache/chalk-calls.jsonl. `pnpm tool-times` reads it.
 *
 * - `ms`: from the request arriving to its answer sent.
 * - `queuedMs`: from the relay sending it (x-chalk-sent) to it arriving: time spent waiting on
 *   the way, or for the service's one thread.
 * - `blockedMs`: the longest the service's thread was busy without a break while the call was
 *   open (sampled every 50 ms): a call slow because something else held the thread shows it here.
 * - `textChars`, `images`, `bytes`: how big the answer was; `isError`.
 */

export const callLogFile = (root: string) =>
  join(root, "node_modules", ".cache", "chalk-calls.jsonl");

/** How late each 50 ms tick came, kept for ten minutes: when the thread was held, and how long. */
const TICK = 50;
const lags: { at: number; ms: number }[] = [];
let last = Date.now();
setInterval(() => {
  const now = Date.now();
  const late = now - last - TICK;
  last = now;
  if (late > TICK) lags.push({ at: now, ms: late });
  while (lags.length > 0 && (lags[0]?.at ?? now) < now - 600_000) lags.shift();
}, TICK).unref();

/** The longest the thread was held during [from, to]. */
const blockedBetween = (from: number, to: number) =>
  lags.reduce((most, l) => (l.at >= from && l.at - l.ms <= to ? Math.max(most, l.ms) : most), 0);

/** The words of a tool call's arguments, cut short: enough to tell calls apart. */
const brief = (args: unknown) => {
  const text = JSON.stringify(args ?? {});
  return text.length > 200 ? `${text.slice(0, 197)}…` : text;
};

/**
 * Times one request and appends its line when the answer is sent. `what`: the tool call's name
 * and arguments, or the path of a /dev-* request.
 */
export function logCall(
  root: string,
  req: IncomingMessage,
  res: ServerResponse,
  what: { kind: "tool"; tool: string; args: unknown; who: string } | { kind: "dev"; path: string },
): void {
  const start = Date.now();
  const sent = Number(req.headers["x-chalk-sent"]);
  let bytes = 0;
  let images = 0;
  let textChars = 0;
  let isError = false;
  // What goes out is counted as it goes: its size, its pictures, its words.
  const write = res.write.bind(res) as (...a: unknown[]) => boolean;
  const end = res.end.bind(res) as (...a: unknown[]) => ServerResponse;
  const see = (chunk: unknown) => {
    if (chunk === undefined || chunk === null || typeof chunk === "function") return;
    const text = typeof chunk === "string" ? chunk : Buffer.from(chunk as Uint8Array).toString();
    bytes += Buffer.byteLength(text);
    if (what.kind !== "tool") return;
    images += text.match(/"type":"image"/g)?.length ?? 0;
    for (const m of text.matchAll(/"type":"text","text":"((?:[^"\\]|\\.)*)"/g))
      textChars += m[1]?.length ?? 0;
    if (text.includes('"isError":true')) isError = true;
  };
  res.write = ((...a: unknown[]) => {
    see(a[0]);
    return write(...a);
  }) as typeof res.write;
  res.end = ((...a: unknown[]) => {
    see(a[0]);
    return end(...a);
  }) as typeof res.end;
  res.on("close", () => {
    const now = Date.now();
    const line = {
      at: new Date(start).toISOString(),
      ...(what.kind === "tool"
        ? { tool: what.tool, who: what.who, args: brief(what.args) }
        : { dev: what.path }),
      ms: now - start,
      ...(Number.isFinite(sent) && sent > 0 ? { queuedMs: Math.max(0, start - sent) } : {}),
      blockedMs: blockedBetween(start, now),
      bytes,
      ...(what.kind === "tool" ? { textChars, images } : {}),
      ...(isError ? { isError } : {}),
      status: res.statusCode,
    };
    try {
      const file = callLogFile(root);
      mkdirSync(dirname(file), { recursive: true });
      appendFileSync(file, `${JSON.stringify(line)}\n`);
    } catch {
      // A log that can't be written never fails a call.
    }
  });
}
