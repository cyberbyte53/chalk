/**
 * Where a piece was written. Recorded when a prop is placed, from the call stack, and read by the
 * build: build/sources.json gets the one line an editor should open (`content/<path>/overview.ts:42`),
 * build/reach.json every line of the author's code the piece was made through (the lesson's line,
 * and each kit or pattern function on the way), so a change to any of them can be traced to the
 * pieces it reaches. Authors never see it.
 */
const stacks = new WeakMap<object, readonly string[]>();

const FRAME = /\(?(?:file:\/\/)?(\/[^()]+?):(\d+):\d+\)?$/;

/** Folders of the author's code, as they appear in a stack path. */
const AUTHORED = ["/content/", "/library/patterns/"];

/**
 * Every frame of the author's code in the current call, innermost first, as repo paths with lines:
 * `content/<book>/<chapter>/kit.ts:20`, then `content/…/overview.ts:33`. Platform code and
 * libraries are skipped.
 */
export function framesHere(): string[] {
  const limit = Error.stackTraceLimit;
  Error.stackTraceLimit = 60;
  const stack = new Error().stack ?? "";
  Error.stackTraceLimit = limit;
  const out: string[] = [];
  for (const line of stack.split("\n").slice(1)) {
    const match = FRAME.exec(line.trim());
    if (match === null) continue;
    const [, file = "", row = ""] = match;
    if (file.includes("/node_modules/") || file.includes("/platform/")) continue;
    const folder = AUTHORED.find((f) => file.includes(f));
    if (folder === undefined) continue;
    const at = file.lastIndexOf(folder);
    const frame = `${file.slice(at + 1)}:${row}`;
    if (out.at(-1) !== frame) out.push(frame);
  }
  return out;
}

/**
 * The one line to open for these frames: the lesson or question file that placed it (overview.ts,
 * family.ts, art.tsx) when there is one, so a prop built by a chapter's kit points at the page that
 * uses it; else the first frame in content/.
 */
export function siteFrom(frames: readonly string[]): string | undefined {
  const inContent = frames.filter((f) => f.startsWith("content/"));
  return inContent.find((f) => /\/(overview\.ts|family\.ts|art\.tsx):\d+$/.test(f)) ?? inContent[0];
}

/** Where in content/ the current call comes from, as path:line (see siteFrom). */
export function siteHere(): string | undefined {
  return siteFrom(framesHere());
}

export function noteStack(of: object, frames: readonly string[]): void {
  if (frames.length > 0) stacks.set(of, frames);
}

/** The frames a piece was made through, innermost first (see framesHere). */
export function stackOf(of: object): readonly string[] {
  return stacks.get(of) ?? [];
}

/** The line to open for a piece (see siteFrom). */
export function siteOf(of: object): string | undefined {
  return siteFrom(stackOf(of));
}
