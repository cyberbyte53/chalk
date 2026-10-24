/**
 * Where in content/ a piece was written: `content/<path>/overview.ts:42`. Recorded when a prop is
 * placed (from the call stack, so patterns and helpers are skipped) and read by the build, which
 * writes build/sources.json so the preview can point an editor at the line. Authors never see it.
 */
const sites = new WeakMap<object, string>();

const FRAME = /\(?(?:file:\/\/)?(\/[^()]+?):(\d+):\d+\)?$/;

/**
 * Where in content/ the current call comes from, as path:line: the lesson or question file that
 * placed it (overview.ts, family.ts, art.tsx) when there is one, so a prop built by a chapter's kit
 * points at the page that uses it; else the first frame in content/.
 */
export function siteHere(): string | undefined {
  const limit = Error.stackTraceLimit;
  Error.stackTraceLimit = 60;
  const stack = new Error().stack ?? "";
  Error.stackTraceLimit = limit;
  let first: string | undefined;
  for (const line of stack.split("\n").slice(1)) {
    const match = FRAME.exec(line.trim());
    if (match === null) continue;
    const [, file = "", row = ""] = match;
    if (file.includes("/node_modules/") || file.includes("/platform/")) continue;
    const at = file.indexOf("/content/");
    if (at === -1) continue;
    const site = `${file.slice(at + 1)}:${row}`;
    if (/\/(overview\.ts|family\.ts|art\.tsx)$/.test(file)) return site;
    first ??= site;
  }
  return first;
}

export function noteSite(of: object, site: string | undefined): void {
  if (site !== undefined) sites.set(of, site);
}

export function siteOf(of: object): string | undefined {
  return sites.get(of);
}
