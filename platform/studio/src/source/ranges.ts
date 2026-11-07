import type { NumberedPage } from "./read";

/**
 * Word ids and ranges, the one way every file names the PDF's words: an id is a line and a word on it
 * (`L12.3`); a range is ids written short (`L6-L14, L16.1-8, L20.3`). Page files cite words by range.
 */

/** Thrown for a range that isn't on the page: a mistake, never meant. */
export class OffThePage extends Error {}

/**
 * `L6-L14, L16.1-8, L16.9-L18, L20.3` → the word ids, in order. A line alone is all its words;
 * `L16.1-8` is words 1 to 8 of line 16.
 */
export function expand(ranges: string, words: ReadonlyMap<string, unknown>): string[] {
  const all = [...words.keys()];
  const at = new Map(all.map((id, i) => [id, i]));
  const firstOf = (l: string) => all.find((w) => w.startsWith(`${l}.`));
  const lastOf = (l: string) => [...all].reverse().find((w) => w.startsWith(`${l}.`));
  const ids: string[] = [];
  for (const part of ranges
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "")) {
    const m = /^(L\d+)(?:\.(\d+))?(?:-(L\d+)?(?:\.?(\d+))?)?$/.exec(part);
    if (m?.[1] === undefined) throw new OffThePage(`can't read the range "${part}"`);
    const [, l1, w1, l2, w2] = m;
    const start = w1 !== undefined ? `${l1}.${w1}` : firstOf(l1);
    let end: string | undefined;
    if (!part.includes("-")) end = w1 !== undefined ? `${l1}.${w1}` : lastOf(l1);
    else if (l2 !== undefined) end = w2 !== undefined ? `${l2}.${w2}` : lastOf(l2);
    else end = w2 !== undefined ? `${l1}.${w2}` : lastOf(l1);
    const from = start === undefined ? undefined : at.get(start);
    const to = end === undefined ? undefined : at.get(end);
    if (from === undefined || to === undefined || to < from)
      throw new OffThePage(`the range "${part}" isn't on the page`);
    ids.push(...all.slice(from, to + 1));
  }
  return ids;
}

/** A range expanded, or the problem with it. */
export function tryExpand(
  ranges: string,
  words: NumberedPage,
  problems: string[],
  where: string,
): string[] | undefined {
  try {
    return expand(ranges, words.words);
  } catch (error) {
    if (!(error instanceof OffThePage)) throw error;
    problems.push(`${where}: ${error.message}`);
    return undefined;
  }
}

/** A word id's line and word: `L12.3` → [12, 3]. */
export const lineAndWord = (id: string): [number, number] => {
  const m = /^L(\d+)\.(\d+)$/.exec(id);
  return [Number(m?.[1]), Number(m?.[2])];
};

/** Word ids as ranges (`L12.3-7, L13-L15, L16.1-4`), in the order given. */
export function rangesOf(page: NumberedPage, ids: readonly string[]): string {
  const size = (l: number) => page.lines[l - 1]?.length ?? 0;
  const next = (l: number, w: number): [number, number] => (w < size(l) ? [l, w + 1] : [l + 1, 1]);
  const spans: { from: [number, number]; to: [number, number] }[] = [];
  for (const id of ids) {
    const at = lineAndWord(id);
    const span = spans.at(-1);
    if (span !== undefined) {
      const n = next(...span.to);
      if (n[0] === at[0] && n[1] === at[1]) {
        span.to = at;
        continue;
      }
    }
    spans.push({ from: at, to: at });
  }
  const write = ({
    from: [l0, w0],
    to: [l1, w1],
  }: { from: [number, number]; to: [number, number] }) => {
    const wholeStart = w0 === 1;
    const wholeEnd = w1 === size(l1);
    if (l0 === l1) {
      if (wholeStart && wholeEnd) return `L${l0}`;
      return w0 === w1 ? `L${l0}.${w0}` : `L${l0}.${w0}-${w1}`;
    }
    const a = wholeStart ? `L${l0}` : `L${l0}.${w0}`;
    const b = wholeEnd ? `L${l1}` : `L${l1}.${w1}`;
    return `${a}-${b}`;
  };
  return spans.map(write).join(", ");
}

/** Word ids in reading order. */
export const sortIds = (ids: readonly string[]): string[] =>
  [...ids].sort((a, b) => {
    const [la, wa] = lineAndWord(a);
    const [lb, wb] = lineAndWord(b);
    return la - lb || wa - wb;
  });

/** Word ids in a row as their range: `L5.2`, `L5.2-4`, `L5.2-L6.3`. */
export function rangeOf(ids: readonly string[]): string {
  const [first, last] = [ids[0] ?? "", ids.at(-1) ?? ""];
  if (first === last) return first;
  const [l1] = first.split(".");
  const [l2, w2] = last.split(".");
  return l1 === l2 ? `${first}-${w2}` : `${first}-${last}`;
}
