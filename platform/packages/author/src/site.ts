/**
 * Where in content/ a piece was written: `content/<path>/overview.ts:42`. Recorded when a prop is
 * placed (from the call stack, so patterns and helpers are skipped) and read by the build, which
 * writes build/sources.json so the preview can point an editor at the line. Authors never see it.
 */
const sites = new WeakMap<object, string>();

const FRAME = /\(?(?:file:\/\/)?(\/[^()]+?):(\d+):\d+\)?$/;

/** The first stack frame inside content/ (not the platform's content package), as path:line. */
export function siteHere(): string | undefined {
  const limit = Error.stackTraceLimit;
  Error.stackTraceLimit = 40;
  const stack = new Error().stack ?? "";
  Error.stackTraceLimit = limit;
  for (const line of stack.split("\n").slice(1)) {
    const match = FRAME.exec(line.trim());
    if (match === null) continue;
    const [, file = "", row = ""] = match;
    if (file.includes("/node_modules/") || file.includes("/platform/")) continue;
    const at = file.indexOf("/content/");
    if (at === -1) continue;
    return `${file.slice(at + 1)}:${row}`;
  }
  return undefined;
}

export function noteSite(of: object, site: string | undefined): void {
  if (site !== undefined) sites.set(of, site);
}

export function siteOf(of: object): string | undefined {
  return sites.get(of);
}
