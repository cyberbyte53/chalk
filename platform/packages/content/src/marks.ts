/**
 * A line written once, in each language; where a bit of it is said differently from how it is shown,
 * that bit carries its spoken words, right where it is: `Now plot [[R(−4, 2)|R, the point minus 4, 2]]`
 * (platform/docs/plans/said-once.md). Everything outside a mark is shown and said as written.
 *
 * - `shown` is rich text (words, `$maths$`, `**bold**`); `said` is plain words, and may hold blanks
 *   (`{x}`). `said` is what follows the last `|`, so `shown` may hold `|` (`$|x|$`).
 * - The `]]` that ends a mark is looked for outside `$…$`: a formula can't end it.
 * - `\[[` is a literal `[[`, `\]]` a literal `]]`; marks don't nest.
 *
 * One scanner, two plain lines out: the screen and everything that reads what it shows take
 * `shownOf`; the voice takes `saidOf`. Escapes are kept for the rich-text parser, which unescapes.
 */

const OPEN = "[[";
const CLOSE = "]]";
const ESCAPED_OPEN = "\\[[";
const ESCAPED_CLOSE = "\\]]";

export type Marked = { readonly text: string; readonly problems: readonly string[] };

/** Where the `$…$` (or `$$…$$`) starting at `i` ends (the index after it), or -1. */
function mathsEnd(source: string, i: number): number {
  const open = source.startsWith("$$", i) ? "$$" : "$";
  let j = i + open.length;
  while (j < source.length) {
    if (source[j] === "\\") {
      j += 2;
      continue;
    }
    if (source.startsWith(open, j)) return j + open.length;
    j += 1;
  }
  return -1;
}

function resolve(source: string, pick: (shown: string, said: string) => string): Marked {
  const problems: string[] = [];
  let out = "";
  let i = 0;
  while (i < source.length) {
    if (source.startsWith(ESCAPED_OPEN, i)) {
      out += ESCAPED_OPEN;
      i += ESCAPED_OPEN.length;
      continue;
    }
    if (source[i] === "\\" && source[i + 1] === "$") {
      out += "\\$";
      i += 2;
      continue;
    }
    if (source[i] === "$") {
      const end = mathsEnd(source, i);
      const to = end === -1 ? source.length : end;
      out += source.slice(i, to);
      i = to;
      continue;
    }
    if (!source.startsWith(OPEN, i)) {
      out += source[i];
      i += 1;
      continue;
    }
    // A mark: its end is the first `]]` outside maths and not escaped.
    let j = i + OPEN.length;
    let end = -1;
    while (j < source.length) {
      if (source.startsWith(ESCAPED_CLOSE, j) || source.startsWith(ESCAPED_OPEN, j)) {
        j += 3;
        continue;
      }
      if (source[j] === "\\" && source[j + 1] === "$") {
        j += 2;
        continue;
      }
      if (source[j] === "$") {
        const m = mathsEnd(source, j);
        if (m === -1) break;
        j = m;
        continue;
      }
      if (source.startsWith(OPEN, j)) {
        problems.push(`a mark inside a mark at ${j}`);
        break;
      }
      if (source.startsWith(CLOSE, j)) {
        end = j;
        break;
      }
      j += 1;
    }
    if (end === -1) {
      if (problems.length === 0) problems.push(`"[[" at ${i} is never closed`);
      out += source.slice(i);
      break;
    }
    const inner = source.slice(i + OPEN.length, end);
    const bar = inner.lastIndexOf("|");
    if (bar === -1) {
      problems.push(`the mark at ${i} has no "|": write [[shown|said]]`);
      out += inner;
    } else {
      const shown = inner.slice(0, bar).split(ESCAPED_CLOSE).join(CLOSE);
      const said = inner.slice(bar + 1).trim();
      if (shown.trim() === "") problems.push(`the mark at ${i} shows nothing`);
      if (said === "") problems.push(`the mark at ${i} says nothing`);
      out += pick(shown, said);
    }
    i = end + CLOSE.length;
  }
  return { text: out, problems };
}

/** The line as the screen shows it: each mark its shown part. */
export const shownOf = (source: string): string => resolve(source, (shown) => shown).text;

/** The line as it is said: each mark its spoken words. */
export const saidOf = (source: string): string => resolve(source, (_, said) => said).text;

/** What is wrong with a line's marks (unclosed, nested, no `|`, nothing shown or said). */
export const markProblems = (source: string): readonly string[] =>
  resolve(source, (shown) => shown).problems;

/** The spoken words of each mark in a line, in order: what a voice is given besides the line's own. */
export function saidParts(source: string): string[] {
  const parts: string[] = [];
  resolve(source, (shown, said) => {
    parts.push(said);
    return shown;
  });
  return parts;
}
